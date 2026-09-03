import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header Animation */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ textAlign: 'center', marginBottom: '3rem' }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#1e293b' }}>
          🧠 CodeCritique AI
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b', margin: 0 }}>
          Automated, intelligent code reviews powered by a fine-tuned Llama 3.1 8B model.
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
        
        {/* Left Column (Input) Animation */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <h3 style={{ marginTop: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📝 Input Git Diff
          </h3>
          <motion.textarea
            whileFocus={{ scale: 1.01, boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' }}
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
              borderRadius: '12px',
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: '#f1f5f9' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600, flex: 1 }}
            >
              🗑️ Clear
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0px 4px 15px rgba(79, 70, 229, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={loading}
              style={{ 
                padding: '0.8rem 1.5rem', 
                borderRadius: '8px', 
                border: 'none', 
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                color: 'white', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontWeight: 600, 
                flex: 2, 
                opacity: loading ? 0.7 : 1 
              }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate Code Review'}
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column (Output) Animation */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <h3 style={{ marginTop: 0, color: '#334155' }}>🤖 Automated Review</h3>
          
          <motion.div 
            animate={loading ? { 
              boxShadow: ['0px 0px 0px rgba(79, 70, 229, 0)', '0px 0px 20px rgba(79, 70, 229, 0.3)', '0px 0px 0px rgba(79, 70, 229, 0)'],
              borderColor: ['#cbd5e1', '#818cf8', '#cbd5e1']
            } : {
              boxShadow: '0px 4px 6px rgba(0,0,0,0.05)',
              borderColor: '#cbd5e1'
            }}
            transition={{ duration: 1.5, repeat: loading ? Infinity : 0 }}
            style={{
              width: '100%',
              height: '400px',
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              border: '2px solid #cbd5e1',
              borderRadius: '12px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'system-ui, sans-serif',
              boxSizing: 'border-box',
              lineHeight: '1.6'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={review}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {review}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

export default App
