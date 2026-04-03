import React, { useEffect, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../store';

export default function HistoryList() {
  const { history, loadingStep, jobProgress } = useStore();
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
        threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [history, loadingStep]);

  const getLoadingMessage = () => {
    const progressText = jobProgress > 0 ? ` (${jobProgress}%)` : '';
    switch (loadingStep) {
      case 'enhancing':
        return `Analyzing your request...${progressText}`;
      case 'generating':
        return `Writing code...${progressText}`;
      case 'building':
        return `Firing up WebContainer...`;
      default:
        return `Processing...${progressText}`;
    }
  };

  return (
    <div ref={threadRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
      {/* Initial AI Message */}
      <div className="flex flex-col gap-2 items-start">
          <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-transparent text-gray-300">
              <div className="flex items-center gap-2 mb-2 font-medium text-white">
                  <Sparkles className="w-4 h-4 text-brand-pink" /> Neura AI
              </div>
              <p>Hello. I am the Neura AI Copilot. What kind of UI would you like to build today?</p>
          </div>
      </div>

      {history.map((item, idx) => {
        if (item.type === 'user') {
          return (
            <div key={idx} className="flex flex-col gap-2 items-end">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[#111] border border-[#1F1F22] text-gray-200 rounded-tr-sm">
                    <p>{item.content}</p>
                </div>
            </div>
          );
        } else {
          return (
            <div key={idx} className="flex flex-col gap-2 items-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-transparent text-gray-300">
                    <div className="flex items-center gap-2 mb-2 font-medium text-white">
                        <Sparkles className="w-4 h-4 text-brand-pink" /> Neura AI
                    </div>
                    <p>{item.content}</p>
                </div>
            </div>
          );
        }
      })}

      {(loadingStep === 'enhancing' || loadingStep === 'generating' || loadingStep === 'building') && (
        <div className="flex flex-col gap-2 items-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-transparent text-gray-300">
                <div className="flex items-center gap-2 mb-2 font-medium text-white">
                    <Sparkles className="w-4 h-4 text-brand-pink" /> Neura AI
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-pink" />
                    <span className="animate-pulse">
                      {getLoadingMessage()}
                    </span>
                </div>
                {/* Progress bar */}
                {jobProgress > 0 && loadingStep !== 'building' && (
                  <div className="mt-3 w-full bg-[#1F1F22] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-pink to-purple-400 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min(jobProgress, 100)}%` }}
                    />
                  </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}