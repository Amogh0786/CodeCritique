# Project Specification: Code Review Generation

## 1. Problem Statement
The goal of this project is to fine-tune a Large Language Model (Llama 3.1 8B) to automatically generate constructive, accurate, and actionable code review comments given a set of code changes (`git diff`).

## 2. Input/Output Format
- **Input**: A text string containing the `git diff` representation of code changes. This includes file paths, diff headers, added lines (prefixed with `+`), and deleted lines (prefixed with `-`). It may also include the commit message for context.
- **Output**: A plain text string containing the code review comment.

## 3. Baselines for Comparison
To demonstrate the value of fine-tuning, the tuned model will be evaluated against the following baselines:
1. **Zero-Shot Base Model**: Llama 3.1 8B base model prompted to generate a code review for the provided diff.
2. **Few-Shot Base Model**: Llama 3.1 8B base model provided with 3–5 high-quality, manually selected `(diff, review)` pairs in the prompt context to guide its generation.
3. **Frontier Model Reference (Optional)**: A state-of-the-art API model (e.g., GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro) evaluated zero-shot to establish a performance ceiling for the task.

## 4. Success Metrics
Code review generation is an open-ended natural language generation task. We will use a combination of lexical overlap and semantic evaluation metrics:

### 4.1 Lexical Overlap (Measurable via HuggingFace `evaluate`)
- **ROUGE-L**: Measures the longest common subsequence between the generated review and the ground-truth human review.
- **BLEU**: Measures n-gram precision against the ground-truth review.
*Note: While standard for text generation, these metrics often poorly correlate with actual review quality, as there are many valid ways to phrase a review.*

### 4.2 Semantic Quality (Measurable via LLM-as-a-Judge)
To rigorously evaluate the generated reviews, we will implement an automated, blind LLM-as-a-Judge pipeline. The judge will be provided with the `git diff`, the `ground-truth review`, and the `candidate review`. It will score the candidate on a 1-5 scale across three dimensions:
- **Correctness**: Does the review accurately reflect the code changes and avoid hallucinations?
- **Actionability**: Does the review provide concrete, helpful feedback rather than generic praise or vague critiques?
- **Conciseness**: Is the review direct and free of unnecessary fluff?

To prevent position bias, the order in which baseline and fine-tuned models are presented to the judge (if doing head-to-head comparisons) will be randomized.
