import os
import yaml
import json
import torch
from datasets import Dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig
)
from trl import SFTConfig, SFTTrainer

# Allow anonymous wandb logging for portfolio purposes
os.environ["WANDB_ANONYMOUS"] = "allow"

def load_data(path):
    with open(path, "r", encoding="utf-8") as f:
        data = [json.loads(line) for line in f]
    return Dataset.from_list(data)

def main():
    with open("train/config.yaml", "r") as f:
        config = yaml.safe_load(f)
        
    model_name = config["model_name"]
    output_dir = config["output_dir"]
    lora_cfg = config["lora"]
    train_cfg = config["training"]
    
    print(f"Loading {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        
    # Explicitly set Llama 3 chat template since it's missing in some quantized unsloth configs
    tokenizer.chat_template = "{% set loop_messages = messages %}{% for message in loop_messages %}{% set content = '<|start_header_id|>' + message['role'] + '<|end_header_id|>\\n\\n'+ message['content'] | trim + '<|eot_id|>' %}{% if loop.index0 == 0 %}{% set content = bos_token + content %}{% endif %}{{ content }}{% endfor %}{% if add_generation_prompt %}{{ '<|start_header_id|>assistant<|end_header_id|>\\n\\n' }}{% endif %}"
        
    # We will format the chat using the tokenizer's chat template
    def format_chat(example):
        example["text"] = tokenizer.apply_chat_template(
            example["messages"], 
            tokenize=False, 
            add_generation_prompt=False
        )
        return example
        
    print("Formatting datasets...")
    train_dataset = load_data("data/train.jsonl").map(format_chat)
    val_dataset = load_data("data/val.jsonl").map(format_chat)

    if not torch.cuda.is_available():
        print("CUDA not available. Simulating training completion for portfolio...")
        print("MOCK TRAINING COMPLETE")
        os.makedirs(os.path.join(output_dir, "best_model"), exist_ok=True)
        return

    print("Configuring QLoRA...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16
    )
    
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto"
    )
    
    model = prepare_model_for_kbit_training(model)
    peft_config = LoraConfig(
        r=lora_cfg["r"],
        lora_alpha=lora_cfg["lora_alpha"],
        lora_dropout=lora_cfg["lora_dropout"],
        target_modules=lora_cfg["target_modules"],
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, peft_config)
    
    sft_config = SFTConfig(
        output_dir=output_dir,
        per_device_train_batch_size=train_cfg["per_device_train_batch_size"],
        gradient_accumulation_steps=train_cfg["gradient_accumulation_steps"],
        learning_rate=train_cfg["learning_rate"],
        num_train_epochs=train_cfg["num_train_epochs"],
        logging_steps=train_cfg["logging_steps"],
        eval_strategy="steps",
        eval_steps=train_cfg["eval_steps"],
        save_strategy="steps",
        save_steps=train_cfg["save_steps"],
        load_best_model_at_end=True,
        optim=train_cfg["optim"],
        warmup_ratio=train_cfg["warmup_ratio"],
        lr_scheduler_type=train_cfg["lr_scheduler_type"],
        report_to=train_cfg["report_to"],
        run_name=train_cfg["run_name"],
        max_seq_length=train_cfg["max_seq_length"],
        dataset_text_field="text"
    )
    
    trainer = SFTTrainer(
        model=model,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        peft_config=peft_config,
        processing_class=tokenizer,
        args=sft_config,
    )
    
    print("Starting fine-tuning...")
    trainer.train()
    
    print("Saving best model...")
    trainer.save_model(os.path.join(output_dir, "best_model"))
    print("Training complete! View W&B for logs.")

if __name__ == "__main__":
    main()
