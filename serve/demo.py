import gradio as gr
import requests

API_URL = "http://localhost:8085/generate_review"

def get_review(diff_text):
    if not diff_text.strip():
        return "Please enter a valid git diff."
        
    try:
        response = requests.post(
            API_URL, 
            json={"diff": diff_text, "max_tokens": 256},
            timeout=60
        )
        if response.status_code == 200:
            return response.json()["review"]
        else:
            return f"Error: {response.status_code} - {response.text}"
    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to the API. Is the FastAPI server running on localhost:8000?"
    except Exception as e:
        return f"An error occurred: {str(e)}"

# Example diff for the user to try
example_diff = """@@ -42,7 +42,7 @@ def process_data(data):
     result = []
     for item in data:
-        if item != None:
+        if item is not None:
             result.append(item.process())
     return result"""

demo = gr.Interface(
    fn=get_review,
    inputs=gr.Textbox(lines=15, placeholder="Paste your git diff here...", value=example_diff, label="Git Diff"),
    outputs=gr.Markdown(label="Automated Code Review"),
    title="🤖 Automated Code Review Generator",
    description="This demo uses our fine-tuned Llama 3.1 8B model to automatically generate constructive code review comments based on a git diff."
)

if __name__ == "__main__":
    print("Starting Gradio demo on http://localhost:7860...")
    demo.launch(server_name="0.0.0.0", server_port=7860)
