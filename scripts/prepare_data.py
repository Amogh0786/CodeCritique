import os
import json
import random
from datasets import load_dataset

def format_llama3_chat(row):
    """Formats a dataset row into Llama 3 chat template format."""
    system_prompt = "You are an expert code reviewer. Provide a constructive and concise code review comment for the given git diff."
    
    file_path = row.get("file_path", "unknown_file")
    diff = row.get("diff_context", "")
    user_prompt = f"File: {file_path}\nDiff:\n{diff}"
    
    assistant_response = row.get("reviewer_comment", "")
    
    return {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
            {"role": "assistant", "content": assistant_response}
        ]
    }

def main():
    print("Loading dataset 'ronantakizawa/github-codereview'...")
    # Load a small slice to keep it under 500 examples for the portfolio
    dataset = load_dataset("ronantakizawa/github-codereview", split="train")
    
    # Filter out empty comments or diffs just in case
    dataset = dataset.filter(lambda x: x["diff_context"] and x["reviewer_comment"])
    
    # Take 500 examples randomly
    dataset = dataset.shuffle(seed=42).select(range(500))
    
    print("Formatting to instruction-tuning format...")
    formatted_data = [format_llama3_chat(row) for row in dataset]
    
    # 80/10/10 split
    train_size = int(0.8 * len(formatted_data))
    val_size = int(0.1 * len(formatted_data))
    
    train_data = formatted_data[:train_size]
    val_data = formatted_data[train_size:train_size+val_size]
    test_data = formatted_data[train_size+val_size:]
    
    # Anti-leakage script check
    # Ensure no diff in the test set exists in train or val sets
    train_val_diffs = set(
        ex["messages"][1]["content"] for ex in train_data + val_data
    )
    
    for ex in test_data:
        test_diff = ex["messages"][1]["content"]
        assert test_diff not in train_val_diffs, "LEAK DETECTED: Test example found in training data!"
    
    print("Anti-leakage check passed. No test examples in train/val sets.")
    
    os.makedirs("data", exist_ok=True)
    
    def write_jsonl(data, path):
        with open(path, "w", encoding="utf-8") as f:
            for item in data:
                f.write(json.dumps(item) + "\n")
                
    write_jsonl(train_data, "data/train.jsonl")
    write_jsonl(val_data, "data/val.jsonl")
    write_jsonl(test_data, "data/test.jsonl")
    
    print(f"Saved {len(train_data)} train, {len(val_data)} val, and {len(test_data)} test examples.")

if __name__ == "__main__":
    main()
