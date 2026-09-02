from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import os

app = FastAPI(title="Code Review Generator API")

class ReviewRequest(BaseModel):
    diff: str
    max_tokens: int = 128

# Global placeholders
model = None
tokenizer = None
MOCK_MODE = False

@app.on_event("startup")
def load_model():
    global model, tokenizer, MOCK_MODE
    if not torch.cuda.is_available():
        print("CUDA not available, running API in MOCK mode.")
        MOCK_MODE = True
        return
        
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        model_name = "unsloth/Meta-Llama-3.1-8B-bnb-4bit"
        print(f"Loading {model_name}...")
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            
        tokenizer.chat_template = "{% set loop_messages = messages %}{% for message in loop_messages %}{% set content = '<|start_header_id|>' + message['role'] + '<|end_header_id|>\\n\\n'+ message['content'] | trim + '<|eot_id|>' %}{% if loop.index0 == 0 %}{% set content = bos_token + content %}{% endif %}{{ content }}{% endfor %}{% if add_generation_prompt %}{{ '<|start_header_id|>assistant<|end_header_id|>\\n\\n' }}{% endif %}"

        # Ideally, we load the merged fine-tuned model. We load the base for demonstration.
        # In a real deployment, vLLM would be used here for high-throughput serving:
        # from vllm import LLM
        # model = LLM(model="models/checkpoints/best_model_merged")
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            device_map="auto",
            torch_dtype=torch.float16
        )
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Falling back to MOCK mode.")
        MOCK_MODE = True

@app.post("/generate_review")
async def generate_review(request: ReviewRequest):
    if MOCK_MODE:
        return {"review": "```suggestion\n# This is a mocked review comment since no GPU is available.\ndef refactored_code():\n    pass\n```\nLooks good to me, but consider extracting this logic to a helper function."}
        
    try:
        prompt_messages = [
            {"role": "system", "content": "You are an expert code reviewer. Provide a constructive and concise code review comment for the given git diff."},
            {"role": "user", "content": f"Diff:\n{request.diff}"}
        ]
        
        input_ids = tokenizer.apply_chat_template(
            prompt_messages, 
            return_tensors="pt", 
            add_generation_prompt=True
        ).to(model.device)
        
        with torch.no_grad():
            output_ids = model.generate(
                input_ids,
                max_new_tokens=request.max_tokens,
                pad_token_id=tokenizer.eos_token_id,
                do_sample=False
            )
            
        generated_ids = output_ids[0][input_ids.shape[1]:]
        review_text = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()
        
        return {"review": review_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
