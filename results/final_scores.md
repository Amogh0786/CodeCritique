# Final Evaluation Scores

Evaluated on the held-out test set (50 examples).

| Model Setup | ROUGE-1 | ROUGE-2 | ROUGE-L |
|-------------|---------|---------|---------|
| Llama 3.1 8B (Zero-Shot) | 0.1852 | 0.0412 | 0.1601 |
| Llama 3.1 8B (Few-Shot 3) | 0.2214 | 0.0588 | 0.1980 |
| **Llama 3.1 8B (QLoRA Fine-Tuned)** | **0.3842** | **0.1255** | **0.3521** |

## LLM-as-a-Judge Blind Evaluation
A frontier model API was used to blindly evaluate 20 pairs of comments (Zero-Shot Baseline vs Fine-Tuned) based on Correctness, Actionability, and Conciseness.

| Metric | Fine-Tuned Win Rate | Baseline Win Rate | Tie Rate |
|--------|---------------------|-------------------|----------|
| Overall Preference | **70%** | 10% | 20% |
