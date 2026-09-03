import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

type ViewState = 'input' | 'loading' | 'results'

export default function App() {
  const [view, setView] = useState<ViewState>('input')

  return (
    <div className="min-h-screen w-full relative selection:bg-indigo-500/30">
      {/* Decorative blurred background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto p-6 md:p-12 relative z-10 pt-16">
        
        {/* Dev Toggle */}
        <div className="fixed top-4 right-4 flex gap-2 z-50 glass-panel px-2 py-1 rounded-full text-xs">
          <button onClick={() => setView('input')} className="px-3 py-1.5 text-white/60 hover:text-white transition-colors">Input</button>
          <div className="w-[1px] h-4 bg-white/10 self-center" />
          <button onClick={() => setView('loading')} className="px-3 py-1.5 text-white/60 hover:text-white transition-colors">Loading</button>
          <div className="w-[1px] h-4 bg-white/10 self-center" />
          <button onClick={() => setView('results')} className="px-3 py-1.5 text-white/60 hover:text-white transition-colors">Results</button>
        </div>

        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white mb-3"
          >
            CodeCritique
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 font-sans text-lg max-w-xl leading-relaxed"
          >
            Automated code reviews powered by a fine-tuned Llama 3.1 8B model. Paste a diff to identify bugs, style issues, and logic flaws.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {view === 'input' && <InputView key="input" onSimulateSubmit={() => setView('loading')} />}
          {view === 'loading' && <LoadingView key="loading" />}
          {view === 'results' && <ResultsView key="results" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function InputView({ onSimulateSubmit }: { onSimulateSubmit: () => void }) {
  const [diff, setDiff] = useState(`@@ -42,7 +42,7 @@ def process_data(data):
     result = []
     for item in data:
-        if item != None:
+        if item is not None:
             result.append(item.process())
     return result`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel p-1 flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
        </div>
        <div className="text-xs font-mono text-white/40 tracking-wider uppercase">git.patch</div>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      <div className="relative group">
        <textarea 
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          placeholder="Paste your git diff or patch here..."
          className="w-full h-[400px] bg-transparent border-none p-6 font-mono text-[13px] leading-relaxed text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-0 resize-y"
          spellCheck={false}
        />
      </div>
      
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10">
        <div className="text-xs font-sans text-white/40">
          Supports unified diffs, patches, and raw code snippets.
        </div>
        <button 
          onClick={onSimulateSubmit}
          className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-white/10 border border-white/10 rounded-lg hover:bg-white/20 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0f0c29]"
        >
          Generate Review
          <span className="ml-2 opacity-50">⌘↵</span>
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
      className="glass-panel p-16 w-full flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Minimalist spinner */}
        <svg className="animate-spin h-8 w-8 text-white/20 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-sans font-medium text-white/90 tracking-tight">Analyzing code structure...</h2>
        <p className="text-sm text-white/40 mt-2 font-sans">Inferring context and evaluating logic.</p>
      </div>
    </motion.div>
  )
}

function ResultsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 }}
      className="space-y-6"
    >
      {/* Summary Strip (Linear style) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <h2 className="text-sm font-sans font-medium text-white">Review Complete</h2>
          <span className="text-sm text-white/40 font-sans">• Found 3 potential issues</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="text-red-400">1</span> <span className="text-white/40">CRITICAL</span></div>
          <div className="flex items-center gap-1.5"><span className="text-amber-400">1</span> <span className="text-white/40">WARNING</span></div>
          <div className="flex items-center gap-1.5"><span className="text-sky-400">1</span> <span className="text-white/40">INFO</span></div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Diff Viewer (Left) */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel w-full lg:flex-[2] overflow-hidden flex flex-col"
        >
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 text-xs font-mono text-white/50">
            src/main.py
          </div>
          <div className="p-4 font-mono text-[13px] leading-relaxed text-white/70 overflow-x-auto">
            <div className="flex hover:bg-white/[0.02] transition-colors"><span className="w-10 text-white/20 select-none">10</span><span>def calculate_total(price, tax):</span></div>
            <div className="flex bg-red-500/[0.08] text-red-200"><span className="w-10 text-red-400/40 select-none">-11</span><span>    return price + tax</span></div>
            <div className="flex bg-green-500/[0.08] text-green-200"><span className="w-10 text-green-400/40 select-none">+11</span><span>    total = price + tax</span></div>
            <div className="flex bg-green-500/[0.08] text-green-200"><span className="w-10 text-green-400/40 select-none">+12</span><span>    return total</span></div>
            <div className="flex hover:bg-white/[0.02] transition-colors"><span className="w-10 text-white/20 select-none">13</span><span></span></div>
          </div>
        </motion.div>

        {/* Inline Comments List (Right) */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:flex-[1] flex flex-col gap-3"
        >
          {/* Critical Comment */}
          <div className="glass-panel-interactive p-4 severity-indicator-critical">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-sans font-medium text-sm text-white">Possible Null Reference</h4>
              <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">L11</span>
            </div>
            <p className="font-sans text-[13px] text-white/60 leading-relaxed">Ensure that `price` is validated before addition. If `price` is None, this will throw a TypeError at runtime.</p>
          </div>

          {/* Warning Comment */}
          <div className="glass-panel-interactive p-4 severity-indicator-warning">
             <div className="flex justify-between items-start mb-2">
              <h4 className="font-sans font-medium text-sm text-white">Redundant Variable</h4>
              <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">L12</span>
            </div>
            <p className="font-sans text-[13px] text-white/60 leading-relaxed">Assigning to `total` and immediately returning it is redundant. Consider returning the expression directly.</p>
          </div>

          {/* Info Comment */}
          <div className="glass-panel-interactive p-4 severity-indicator-info">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-sans font-medium text-sm text-white">Type Hinting Missing</h4>
              <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">L10</span>
            </div>
            <p className="font-sans text-[13px] text-white/60 leading-relaxed">Consider adding type hints to the function arguments for better readability and static analysis.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
