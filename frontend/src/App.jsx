import React from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import HistoryList from './components/HistoryList';
import PreviewPanel from './components/PreviewPanel';
import { useStore } from './store';
import { Toaster } from 'react-hot-toast';
import Landing from './components/Landing';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';

function App() {
  const { isSidebarOpen, currentView } = useStore();

  return (
    <ReactLenis root>
      <Toaster position="top-right" toastOptions={{ className: 'bg-[#111] text-white border border-[#1F1F22]' }} />
      
      <AnimatePresence>
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.4 } }}
            className="w-full min-h-screen z-50 bg-[#050505]"
          >
            <Landing />
          </motion.div>
        ) : (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.2 } }}
            className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans relative selection:bg-brand-pink/30"
          >
            {/* ================= LEFT PANE: AI Copilot Sidebar ================= */}
            <aside 
              id="sidebar"
              className={`\${isSidebarOpen ? 'w-full md:w-[380px] lg:w-[400px]' : 'w-0 border-r-0 -translate-x-full'} flex-shrink-0 border-r border-[#1F1F22] bg-[#0A0A0A] flex flex-col transition-all duration-300 ease-in-out z-20 absolute md:relative h-full`}
            >
              <Header />
              <HistoryList />
              <PromptInput />
            </aside>

            {/* ================= RIGHT PANE: Workspace / Canvas ================= */}
            <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[#050505]">
               <PreviewPanel />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </ReactLenis>
  );
}

export default App;
