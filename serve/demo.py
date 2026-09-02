import gradio as gr
import requests

API_URL = "http://localhost:8090/generate_review"

def get_review(diff_text):
    if not diff_text.strip():
        return "⚠️ Please enter a valid git diff."
        
    try:
        response = requests.post(
            API_URL, 
            json={"diff": diff_text, "max_tokens": 256},
            timeout=60
        )
        if response.status_code == 200:
            return response.json()["review"]
        else:
            return f"❌ Error: {response.status_code} - {response.text}"
    except requests.exceptions.ConnectionError:
        return "❌ Error: Could not connect to the API. Is the FastAPI server running on localhost:8090?"
    except Exception as e:
        return f"❌ An error occurred: {str(e)}"

example_diff_1 = """@@ -42,7 +42,7 @@ def process_data(data):
     result = []
     for item in data:
-        if item != None:
+        if item is not None:
             result.append(item.process())
     return result"""

example_diff_2 = """@@ -10,4 +10,5 @@
 def calculate_total(price, tax):
-    return price + tax
+    total = price + tax
+    return total"""

custom_theme = gr.themes.Soft(
    primary_hue="indigo",
    secondary_hue="slate",
    neutral_hue="slate",
    font=[gr.themes.GoogleFont("Inter"), "ui-sans-serif", "system-ui", "sans-serif"],
).set(
    button_primary_background_fill="*primary_600",
    button_primary_background_fill_hover="*primary_700",
)

css = """
.prose {
    padding: 20px;
    background-color: var(--background-fill-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color-primary);
    min-height: 400px;
}
"""

with gr.Blocks(title="CodeCritique Pro") as demo:
    gr.HTML(
        """
        <div style="text-align: center; max-width: 800px; margin: 0 auto; padding: 30px 0 10px 0;">
            <h1 style="font-weight: 800; font-size: 2.5rem; margin-bottom: 0.5rem;">🧠 CodeCritique AI</h1>
            <p style="font-size: 1.1rem; color: #64748b;">Automated, intelligent code reviews powered by a fine-tuned Llama 3.1 8B model.</p>
        </div>
        """
    )
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 📝 Input Git Diff")
            diff_input = gr.Code(
                language="python", 
                lines=15, 
                value=example_diff_1, 
                label="", 
                elem_id="diff-input"
            )
            with gr.Row():
                clear_btn = gr.Button("🗑️ Clear", variant="secondary")
                submit_btn = gr.Button("✨ Generate Code Review", variant="primary")
                
        with gr.Column(scale=1):
            gr.Markdown("### 🤖 Automated Review")
            review_output = gr.Markdown(
                label="", 
                value="*Your code review will appear here...*",
                elem_classes=["prose"]
            )
            
    gr.Examples(
        examples=[[example_diff_1], [example_diff_2]],
        inputs=diff_input,
        label="Try these examples"
    )

    submit_btn.click(
        fn=get_review,
        inputs=diff_input,
        outputs=review_output,
        api_name="generate"
    )
    
    clear_btn.click(
        fn=lambda: ("", "*Your code review will appear here...*"),
        inputs=None,
        outputs=[diff_input, review_output]
    )

if __name__ == "__main__":
    print("Starting Pro Gradio demo on http://localhost:7862...")
    demo.launch(server_name="0.0.0.0", server_port=7862, theme=custom_theme, css=css)
