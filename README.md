# CodeCritique

Automated, intelligent code reviews powered by a fine-tuned Llama 3.1 8B model. 
CodeCritique is a portfolio project demonstrating end-to-end ML engineering: from scoping and dataset generation, to LoRA fine-tuning, automated evaluation (LLM-as-a-judge), and deployment.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion, diff2html
- **Backend/API**: FastAPI, Uvicorn, Python
- **Model**: `unsloth/Meta-Llama-3.1-8B-bnb-4bit` (Fine-tuned with QLoRA)
- **Design Aesthetic**: Glassmorphism (Dark & Light modes)

---

## 🚀 Getting Started

### 1. Start the Frontend
The frontend is a completely decoupled React application that features an interactive layout, unified diff rendering, and a simulated API response.

```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`. 

*Note: The frontend currently points to a mocked `simulateReview` function in `src/mockApi.ts` so that you can view the UI flow immediately without needing to boot a 24GB VRAM GPU.*

### 2. Start the Real API (Optional)
If you have a CUDA GPU and want to run the real fine-tuned Llama 3.1 model:

```bash
pip install -r requirements.txt
python serve/api.py
```
The FastAPI backend will start on `http://localhost:8095`.
To wire the frontend to the real backend, edit `frontend/src/App.tsx`'s `handleGenerate` function to use the `fetch('http://localhost:8095/generate_review')` call instead of `simulateReview`.

---

## Design System (Glassmorphism)
The frontend implements a custom Glassmorphism aesthetic tailored for developer tools, avoiding generic "SaaS templates".
- Deep animated mesh-gradients in Dark Mode.
- Soft pastel gradients in Light Mode.
- Heavily layered frosted glass panels with inner-light borders.
- Monospace IDE-like text fields and diff viewers.

## Directory Structure
- `frontend/`: The React + Tailwind Vite app.
- `serve/`: FastAPI server for exposing the real Llama model.
- `train/`: QLoRA fine-tuning scripts and datasets.
- `eval/`: Baseline ROUGE generation and LLM-as-a-judge blind evaluation scripts.
- `docs/`: Technical writeups and design tokens.
