# Cost and Latency Analysis

Assuming an average of 500 input tokens (diff) and 50 output tokens (review comment) per request.
Local GPU costs are estimated using a RunPod A100 40GB hourly rate ($1.89/hr).

| Model Setup | Quality (ROUGE-L) | p50 Latency (sec) | Cost per 1,000 reqs |
|-------------|-------------------|-------------------|---------------------|
| GPT-4o (Zero-Shot) | N/A (Judge Ref) | 1.20s | $3.25 |
| Llama 3.1 8B (Base Few-Shot) | 0.1980 | 2.50s | $1.05 |
| Llama 3.1 8B (Fine-Tuned) | 0.3521 | 1.80s | $1.05 |
