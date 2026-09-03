import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateReview, ReviewResponse, ReviewComment } from './mockApi'
import * as Diff2Html from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'
import './index.css'

type ViewState = 'input' | 'loading' | 'results' | 'error'

const DEFAULT_DIFF = `--- a/src/main.py
+++ b/src/main.py
@@ -8,7 +8,6 @@
 
 def calculate_total(price, tax):
-    return price + tax
+    total = price + tax
+    return total
 
 def process_data(data):
`;

export default function App() {
  const [view, setView] = useState<ViewState>('input')
  const [diffText, setDiffText] = useState(DEFAULT_DIFF)
  const [language, setLanguage] = useState('python')
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDark, setIsDark] = useState(true)

  // Toggle theme class on body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }
  }, [isDark])

  const handleGenerate = async () => {
    if (!diffText.trim()) {
      setErrorMsg('Please enter a valid git diff.')
      setView('error')
      return
    }
    setView('loading')
    try {
      const data = await simulateReview(diffText, language)
      setReviewData(data)
      setView('results')
    } catch (err: any) {
      setErrorMsg(err.message || 'An unknown error occurred.')
      setView('error')
    }
  }

  return (
    <div className="min-h-screen w-full relative selection:bg-indigo-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 dark:bg-indigo-600/20 bg-indigo-300/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 dark:bg-purple-600/20 bg-purple-300/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10 pt-16">
        
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="glass-panel px-4 py-2 text-sm font-medium transition-colors hover:text-indigo-400"
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-sans font-bold tracking-tight mb-3"
          >
            CodeCritique
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="opacity-60 font-sans text-lg max-w-xl leading-relaxed"
          >
            Automated code reviews powered by AI. Paste a diff to identify bugs, style issues, and logic flaws.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {view === 'input' && (
            <InputView 
              key="input" 
              diff={diffText} 
              setDiff={setDiffText} 
              language={language}
              setLanguage={setLanguage}
              onSubmit={handleGenerate} 
            />
          )}
          {view === 'loading' && <LoadingView key="loading" />}
          {view === 'results' && reviewData && (
             <ResultsView 
               key="results" 
               review={reviewData} 
               diffText={diffText}
               onReset={() => setView('input')}
             />
          )}
          {view === 'error' && (
            <ErrorView 
              key="error" 
              message={errorMsg} 
              onRetry={() => setView('input')} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function InputView({ 
  diff, setDiff, language, setLanguage, onSubmit 
}: { 
  diff: string, setDiff: (v: string) => void, language: string, setLanguage: (v: string) => void, onSubmit: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel p-1 flex flex-col border-opacity-10 dark:border-opacity-10"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" />
        </div>
        <div className="flex gap-4 items-center">
           <select 
             value={language}
             onChange={(e) => setLanguage(e.target.value)}
             className="bg-transparent border-none text-xs font-mono opacity-60 outline-none cursor-pointer"
           >
             <option value="python">python</option>
             <option value="typescript">typescript</option>
             <option value="auto">auto-detect</option>
           </select>
        </div>
      </div>
      
      <div className="relative group">
        <textarea 
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          placeholder="Paste your git diff or patch here..."
          className="w-full h-[400px] bg-transparent border-none p-6 font-mono text-[13px] leading-relaxed opacity-80 placeholder-opacity-30 focus:outline-none focus:ring-0 resize-y"
          spellCheck={false}
        />
      </div>
      
      <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/5 bg-slate-100/50 dark:bg-black/10">
        <div className="text-xs font-sans opacity-50">
          Supports unified diffs, patches, and raw code snippets.
        </div>
        <button 
          onClick={onSubmit}
          className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium transition-all duration-200 bg-slate-200/50 dark:bg-white/10 border border-slate-300/50 dark:border-white/10 rounded-lg hover:bg-slate-300/60 dark:hover:bg-white/20"
        >
          Generate Review
        </button>
      </div>
    </motion.div>
  )
}

function LoadingView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-16 w-full flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current opacity-5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      
      <div className="relative z-10 flex flex-col items-center">
        <svg className="animate-spin h-8 w-8 opacity-40 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-sans font-medium opacity-90 tracking-tight">Analyzing code structure...</h2>
        <p className="text-sm opacity-50 mt-2 font-sans">Inferring context and evaluating logic.</p>
      </div>
    </motion.div>
  )
}

function ErrorView({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="glass-panel p-8 max-w-lg mx-auto text-center border-red-500/30"
    >
       <h2 className="text-xl font-sans font-medium text-red-500 mb-2">Review Failed</h2>
       <p className="opacity-70 text-sm mb-6">{message}</p>
       <button onClick={onRetry} className="px-4 py-2 bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 rounded-lg text-sm">Try Again</button>
    </motion.div>
  )
}

function ResultsView({ review, diffText, onReset }: { review: ReviewResponse, diffText: string, onReset: () => void }) {
  const diffHtml = Diff2Html.html(diffText, {
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'line-by-line',
  });

  const criticals = review.comments.filter(c => c.severity === 'critical').length;
  const warnings = review.comments.filter(c => c.severity === 'warning').length;
  const infos = review.comments.filter(c => c.severity === 'info').length;

  const handleCommentClick = (line: number) => {
    const lineNumbers = document.querySelectorAll('.d2h-code-linenumber .line-num1, .d2h-code-linenumber .line-num2');
    for (let i = 0; i < lineNumbers.length; i++) {
       if (lineNumbers[i].textContent === String(line)) {
           lineNumbers[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
           const row = lineNumbers[i].closest('tr');
           if (row) {
             row.style.transition = 'background-color 0.5s';
             row.style.backgroundColor = 'rgba(120, 120, 120, 0.2)';
             setTimeout(() => {
               row.style.backgroundColor = '';
             }, 1000);
           }
           break;
       }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <h2 className="text-sm font-sans font-medium">Review Complete</h2>
          <span className="text-sm opacity-60 font-sans hidden sm:inline">• {review.summary}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="flex items-center gap-1.5"><span className="text-red-500">{criticals}</span> <span className="opacity-50">CRIT</span></div>
          <div className="flex items-center gap-1.5"><span className="text-amber-500">{warnings}</span> <span className="opacity-50">WARN</span></div>
          <div className="flex items-center gap-1.5"><span className="text-sky-500">{infos}</span> <span className="opacity-50">INFO</span></div>
          <button onClick={onReset} className="ml-2 px-2 py-1 bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 rounded">Reset</button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel w-full lg:flex-[2] overflow-hidden flex flex-col bg-transparent"
        >
          <div 
            className="diff-container overflow-x-auto p-4" 
            dangerouslySetInnerHTML={{ __html: diffHtml }} 
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:flex-[1] flex flex-col gap-3"
        >
          {review.comments.map((comment, i) => (
             <motion.div 
                key={comment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleCommentClick(comment.line)}
                className={`glass-panel-interactive p-4 severity-indicator-${comment.severity}`}
             >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-sans font-medium text-sm">{comment.title}</h4>
                  <span className="text-[10px] font-mono opacity-50 bg-slate-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded">L{comment.line}</span>
                </div>
                <p className="font-sans text-[13px] opacity-70 leading-relaxed">{comment.message}</p>
             </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
