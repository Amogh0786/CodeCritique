# Failure Analysis

After evaluating the fine-tuned Llama 3.1 8B model against the baseline, I manually spot-checked 25 paired outputs (baseline vs. fine-tuned) to identify failure modes and areas where fine-tuning did not improve performance.

## Observed Improvements
- **Conciseness**: The baseline zero-shot model tended to be overly conversational ("Sure, here is a code review for your git diff!"). The fine-tuned model immediately outputs the review comment without conversational filler.
- **Formatting**: The fine-tuned model successfully learned to use ````suggestion```` markdown blocks, which the baseline almost never did without explicit few-shot prompting.

## Failure Modes

### 1. Hallucination of Context (Over-indexing on syntax)
In 3/25 cases, the fine-tuned model suggested a syntax change that was syntactically correct in a vacuum but semantically wrong in the broader context of the file (which wasn't fully provided in the diff).
- *Example*: It suggested changing `os.path.join(a, b)` to `pathlib.Path(a) / b` even in a legacy module where `pathlib` wasn't imported.

### 2. Mimicking Dataset Noise (The "LGTM" problem)
In 2/25 cases, the fine-tuned model outputted simply "No issues found." or "LGTM!" even when a subtle bug was introduced in the diff. The baseline model was actually more pedantic in these cases and successfully found the edge case.
- *Why it happened*: The training dataset contains real human reviews, and humans often rubber-stamp PRs. The model learned this behavior.

### 3. Missing Structural Context
In 1 case involving a large multi-file diff, the model left a comment referencing a function that was deleted in a different file within the same diff, failing to synthesize the global change.

## Conclusion
Fine-tuning dramatically improved format compliance and style, but it can occasionally introduce "human-like" laziness (LGTM) and still struggles with deep semantic reasoning across large, disjointed diffs. A reinforcement learning (RLHF) step with a penalty for missed bugs would be a strong next step.
