# Beyond Prompt Engineering: Fine-Tuning Llama 3 for Code Reviews

*A comprehensive guide to fine-tuning, evaluating, and deploying an open-weight LLM for domain-specific tasks.*

## The Problem with Prompt Engineering

Prompt engineering is great for general tasks, but it hits a wall when dealing with highly specific output formats or deep domain knowledge. I wanted to build an automated code reviewer that ingests a Git diff and outputs actionable review comments. 

When I asked a zero-shot Llama 3.1 8B model to do this, the results were overly conversational, lacked the precise ````suggestion```` markdown formatting required by GitHub, and often missed subtle bugs. Adding few-shot examples to the prompt improved formatting but drastically increased latency and token costs. 

The solution? **Fine-Tuning**.

## 1. Data Preparation

Data is the lifeblood of fine-tuning. I used the `ronantakizawa/github-codereview` dataset from HuggingFace, but raw data is never enough.

I wrote a data pipeline to:
1. Filter out massive diffs and trivial "LGTM" comments.
2. Format the data into the standard Llama 3 Chat Template (`<|start_header_id|>user<|end_header_id|>...`).
3. Apply a strict 80/10/10 split (400 train, 50 val, 50 test).
4. Run an anti-leakage script to ensure zero overlap between the training diffs and the test diffs.

## 2. QLoRA Fine-Tuning

Full fine-tuning of an 8B parameter model requires massive compute. Instead, I used **QLoRA** (Quantized Low-Rank Adaptation). By loading the base model in 4-bit precision and training small rank-16 adapter matrices on the attention and MLP layers (`q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`), I was able to train the model on a single 24GB VRAM GPU.

I tracked the training using Weights & Biases, selecting the best checkpoint based on validation loss rather than just picking the final epoch.

## 3. Rigorous Evaluation

How do you evaluate an open-ended generation task like a code review? 

1. **Quantitative (ROUGE)**: The fine-tuned model bumped the ROUGE-L score on the test set from ~0.16 (zero-shot) to ~0.35.
2. **LLM-as-a-Judge**: I wrote a script that randomized the outputs of the baseline and fine-tuned models, passing them to a frontier model to judge based on Correctness, Actionability, and Conciseness. The fine-tuned model won 70% of the time.
3. **Manual Spot-Check**: The most important step. I manually reviewed 25 diffs. I found that while the fine-tuned model nailed the markdown formatting, it occasionally suffered from dataset noise, mimicking human reviewers who rubber-stamp PRs without looking closely.

## 4. Deployment and Cost Analysis

Finally, I wrapped the fine-tuned model in a FastAPI endpoint and built a Gradio UI. 

The cost analysis was the most satisfying part. Because the fine-tuned model requires zero-shot prompting (no massive few-shot context window), inference latency dropped by 28%. When hosted on a RunPod A100, the cost per 1,000 requests was roughly 40% cheaper than using the GPT-4o API.

## Conclusion

Fine-tuning is no longer a dark art reserved for research labs. With QLoRA, HuggingFace `trl`, and high-quality datasets, individual developers can build specialized models that rival frontier APIs in their specific domains—at a fraction of the cost and latency.
