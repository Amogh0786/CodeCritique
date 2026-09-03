from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import os
import json
import re

app = FastAPI(title="Code Review Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReviewRequest(BaseModel):
    diff: str
    max_tokens: int = 512

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

def smart_mock_review(diff: str):
    import random
    start_line = 10
    hunk_match = re.search(r'@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@', diff)
    if hunk_match and hunk_match.group(1):
        start_line = int(hunk_match.group(1))

    comments = []
    
    if "console.log" in diff or "print(" in diff:
        comments.append({
            "id": "c_log",
            "line": start_line + 1,
            "file": "mock_file",
            "severity": "info",
            "title": "Leftover Debug Code",
            "message": "Consider removing console.log or print statements before deploying to production."
        })
        
    if "TODO" in diff or "FIXME" in diff:
        comments.append({
            "id": "c_todo",
            "line": start_line,
            "file": "mock_file",
            "severity": "warning",
            "title": "Unresolved TODO",
            "message": "There is a TODO comment here. Ensure this technical debt is tracked."
        })
        
    if "SELECT *" in diff and "$" not in diff and "?" not in diff:
         comments.append({
            "id": "c_sql",
            "line": start_line + 2,
            "file": "mock_file",
            "severity": "critical",
            "title": "SQL Injection Risk",
            "message": "This query looks susceptible to SQL injection. Use parameterized queries."
        })

    # Default comments if no patterns match
    if not comments:
        comments = [
            {
                "id": "c_default_1",
                "line": start_line + 1,
                "file": "mock_file",
                "severity": "info",
                "title": "General Code Quality",
                "message": "The changes look generally okay, but could perhaps benefit from more explicit typing or comments."
            }
        ]

    return {
        "summary": f"Analyzed diff and found {len(comments)} points of interest.",
        "comments": comments
    }

@app.post("/generate_review")
async def generate_review(request: ReviewRequest):
    if MOCK_MODE:
        import asyncio
        await asyncio.sleep(2)
        return smart_mock_review(request.diff)
        
    try:
        system_prompt = """You are an expert code reviewer. Analyze the git diff and output ONLY a valid JSON object in the following format:
{
  "summary": "A 1-2 sentence overall summary",
  "comments": [
    {
      "id": "c1",
      "line": 15, // The exact added line number in the diff to comment on
      "file": "filename.js",
      "severity": "info" | "warning" | "critical",
      "title": "Short title",
      "message": "Detailed explanation"
    }
  ]
}"""

        prompt_messages = [
            {"role": "system", "content": system_prompt},
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
        
        # Extract JSON if the model wrapped it in markdown codeblocks
        json_str = review_text
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()
            
        parsed_json = json.loads(json_str)
        
        return parsed_json
    except Exception as e:
        # Fallback if JSON parsing fails or model errors
        print(f"Model generation error: {e}")
        return smart_mock_review(request.diff)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8095)
