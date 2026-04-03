import React, { useState, useRef } from 'react';
import { Paperclip, Send, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { generateComponentCode } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PROVIDERS = [
  { id: 'gemini', label: 'Gemini', icon: '✦' },
];

export default function PromptInput() {
  const [inputValue, setInputValue] = useState('');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const {
    setPrompt, setLoadingStep, setGeneratedCode, addHistory,
    loadingStep, setActiveTab, setJobProgress, setIframeUrl, userId,
    provider, setProvider, model,
    activeAbortController, setActiveAbortController
  } = useStore();
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  const isGenerating = loadingStep !== 'idle' && loadingStep !== 'ready';
  const currentProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = inputValue;
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setPrompt(userMessage);
    setGeneratedCode(''); // Clear old preview
    setJobProgress(0);
    addHistory({ type: 'user', content: userMessage, timestamp: Date.now() });

    try {
      setLoadingStep('enhancing');

      const abortController = new AbortController();
      setActiveAbortController(abortController);

      // Call the backend
      const result = await generateComponentCode(userMessage, userId, {
        onProgress: (progress, step) => {
          setJobProgress(progress);
          setLoadingStep(step);
        }
      }, {
        provider,
        model: model || undefined,
        signal: abortController.signal
      });

      const code = typeof result === 'string' ? result : result.code;
      setGeneratedCode(code);
      setLoadingStep('ready');
      addHistory({ type: 'ai', content: "I've generated the page for you. Check the preview on the right!", timestamp: Date.now() });
      setActiveTab('preview');
      setActiveAbortController(null);
      toast.success('Page generated successfully!');
    } catch (err) {
      if (err.message === 'Generation cancelled by user' || err.name === 'CanceledError') {
        // Discard gracefully if user clicked Stop
        setActiveAbortController(null);
        return;
      }
      toast.error('Generation failed: ' + err.message);
      setLoadingStep('idle');
      setJobProgress(0);
      setActiveAbortController(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="p-4 bg-[#0A0A0A] border-t border-[#1F1F22] flex-shrink-0">
      <motion.form
        layoutId="chatbot-input"
        onSubmit={handleGenerate}
        className="relative bg-[#111111] border border-[#1F1F22] rounded-2xl p-2 shadow-lg focus-within:border-brand-pink/50 focus-within:bg-[#151515] transition-colors flex flex-col"
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the UI you want to build..."
          className="w-full bg-transparent border-none outline-none resize-none text-sm p-2 text-gray-200 placeholder-gray-600 max-h-[200px] min-h-[44px]"
          rows="1"
        />
        <div className="flex items-center justify-between mt-2 px-2 pb-1">
          <div className="flex items-center gap-2">
            <button type="button" className="text-gray-500 hover:text-gray-300 transition p-1">
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Provider Selector */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowProviderMenu(!showProviderMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-all border border-white/5"
              >
                <span>{currentProvider.icon}</span>
                <span>{currentProvider.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProviderMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 left-0 bg-[#1a1a1d] border border-[#2a2a2e] rounded-xl shadow-xl overflow-hidden min-w-[150px] z-50"
                  >
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setProvider(p.id); setShowProviderMenu(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${provider === p.id
                            ? 'bg-brand-pink/10 text-brand-pink'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                      >
                        <span className="text-sm">{p.icon}</span>
                        <span>{p.label}</span>
                        {provider === p.id && <span className="ml-auto text-[10px]">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center">
            {isGenerating ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (activeAbortController) {
                    activeAbortController.abort();
                    setLoadingStep('idle');
                    setJobProgress(0);
                    toast('Generation stopped');
                  }
                }}
                className="p-1.5 rounded-lg flex items-center justify-center transition-all bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <span className="w-4 h-4 rounded-sm bg-current"></span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${(!inputValue.trim()) ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-brand-pink text-white hover:bg-[#D40047] shadow-[0_0_15px_rgba(255,0,85,0.3)]'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.form>
      <div className="text-center mt-3">
        <span className="text-[10px] text-gray-600 font-medium">Powered by Neura AI Data Engine</span>
      </div>
    </div>
  );
}