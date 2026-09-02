import { useState } from 'react'
import './App.css'

function App() {
  const [diff, setDiff] = useState(`@@ -42,7 +42,7 @@ def process_data(data):
     result = []
     for item in data:
-        if item != None:
+        if item is not None:
             result.append(item.process())
     return result`)
  const [review, setReview] = useState('*Your code review will appear here...*')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!diff.trim()) {
      setReview('⚠️ Please enter a valid git diff.')
      return
    }

    setLoading(true)
    setReview('Generating review...')
    try {
      const response = await fetch('http://localhost:8095/generate_review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diff, max_tokens: 256 }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setReview(data.review)
      } else {
        setReview(`❌ Error: ${response.status} - ${response.statusText}`)
      }
    } catch (err: any) {
      setReview(`❌ Error: Could not connect to API. Is FastAPI running on port 8095?\n${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setDiff('')
    setReview('*Your code review will appear here...*')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#1e293b' }}>
          🧠 CodeCritique AI
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
          Automated, intelligent code reviews powered by a fine-tuned Llama 3.1 8B model.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>📝 Input Git Diff</h3>
          <textarea
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            style={{
              width: '100%',
              height: '400px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={handleClear}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600, flex: 1 }}
            >
              🗑️ Clear
            </button>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, flex: 2, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate Code Review'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>🤖 Automated Review</h3>
          <div style={{
            width: '100%',
            height: '400px',
            padding: '1rem',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box'
          }}>
            {review}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
