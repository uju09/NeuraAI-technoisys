import React from 'react';
import { MessageSquare, Play, Code2, Monitor, Tablet, Smartphone, Copy, Share, Download, Box } from 'lucide-react';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function PreviewPanel() {
  const { 
      loadingStep, iframeUrl, generatedCode, history,
      isSidebarOpen, setIsSidebarOpen,
      activeTab, setActiveTab,
      viewport, setViewport
  } = useStore();

  const isGenerating = loadingStep !== 'idle' && loadingStep !== 'ready';
  const hasGenerated = history.length > 0 && generatedCode;

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast.success('Copied to clipboard');
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedComponent.jsx';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded component code');
  };

  const getViewportClasses = () => {
    if (viewport === 'desktop') return 'w-full h-full rounded-xl border border-[#1F1F22] shadow-2xl flex items-center justify-center bg-[#050505] relative overflow-hidden transition-all duration-500';
    if (viewport === 'tablet') return 'w-[768px] h-[1024px] max-h-full rounded-2xl border border-[#1F1F22] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex-shrink-0 flex items-center justify-center bg-[#050505] relative overflow-hidden transition-all duration-500';
    if (viewport === 'mobile') return 'w-[375px] h-[812px] max-h-full rounded-[2.5rem] border-4 border-[#1A1A1A] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex-shrink-0 relative overflow-hidden flex items-center justify-center bg-[#050505] transition-all duration-500';
  };

  return (
    <div className="flex-1 flex flex-col h-full relative min-w-0 min-h-0 bg-[#050505]">
        {/* Top Toolbar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1F1F22] bg-[#0A0A0A] z-10 flex-shrink-0">
            {/* Left: Sidebar Toggle & Tabs */}
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white transition">
                    <MessageSquare className="w-5 h-5" />
                </button>

                <div className="flex items-center bg-[#111] p-1 rounded-lg border border-[#1F1F22]">
                    <button 
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Play className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button 
                        onClick={() => setActiveTab('code')}
                        disabled={!hasGenerated}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!hasGenerated ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'code' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Code2 className="w-3.5 h-3.5" /> Code
                    </button>
                </div>

                {hasGenerated && (
                    <span className="hidden sm:inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 rounded">
                        v{history.length}
                    </span>
                )}
            </div>

            {/* Center: Viewport Controls */}
            <div className={`hidden md:flex items-center gap-1 bg-[#111] border border-[#1F1F22] p-1 rounded-lg transition-opacity duration-300 ${hasGenerated && activeTab === 'preview' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded-md transition-colors ${viewport === 'desktop' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Monitor className="w-4 h-4" />
                </button>
                <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded-md transition-colors ${viewport === 'tablet' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Tablet className="w-4 h-4" />
                </button>
                <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded-md transition-colors ${viewport === 'mobile' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Smartphone className="w-4 h-4" />
                </button>
            </div>

            {/* Right: Action Icons */}
            <div className={`flex items-center gap-2 transition-opacity duration-300 ${hasGenerated ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <button onClick={copyCode} className="p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/5" title="Copy Code">
                    <Copy className="w-4 h-4" />
                </button>
                <button className="hidden sm:flex p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/5" title="Share">
                    <Share className="w-4 h-4" />
                </button>
                <button onClick={downloadCode} className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition ml-2 border border-white/5">
                    <Download className="w-3.5 h-3.5" /> Export
                </button>
            </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 min-h-0 overflow-hidden relative bg-[#050505] flex items-center justify-center">
            
            {!hasGenerated ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center text-center p-8 z-10 opacity-60">
                    <div className="w-16 h-16 bg-[#111] border border-[#1F1F22] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                        <Box className="w-8 h-8 text-brand-pink" />
                    </div>
                    <h2 className="text-xl font-medium text-white mb-2">Canvas is empty</h2>
                    <p className="text-gray-500 text-sm max-w-sm">Describe what you want to build in the copilot panel on the left.</p>
                </div>
            ) : (
                /* Generated Content Wrapper */
                <div className="absolute inset-0 flex items-center justify-center bg-grid p-4 md:p-8">
                    
                    {activeTab === 'preview' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className={getViewportClasses()}>
                                {viewport === 'mobile' && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-b-xl z-50"></div>
                                )}
                                
                                {generatedCode ? (
                                    <iframe 
                                      srcDoc={generatedCode}
                                      className={`w-full h-full border-0 bg-white ${viewport === 'mobile' ? 'pt-6' : ''}`}
                                      title="Preview"
                                      sandbox="allow-scripts allow-popups allow-forms allow-modals"
                                    />
                                ) : (
                                    <div className="text-gray-500 text-sm">
                                      {isGenerating ? 'Generating...' : 'No preview yet'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'code' && (
                        <div className="w-full h-full flex flex-col bg-[#0C0C0C] border border-[#1F1F22] rounded-xl overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1F1F22] bg-[#0A0A0A] flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">Component.jsx</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-mono text-gray-600">
                                    <span>{generatedCode.split('\n').length} lines</span>
                                    <span className="mx-1">•</span>
                                    <span>JSX</span>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 overflow-auto" data-lenis-prevent>
                                <SyntaxHighlighter
                                    language="jsx"
                                    style={vscDarkPlus}
                                    showLineNumbers={true}
                                    wrapLines={true}
                                    wrapLongLines={true}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1.5rem',
                                        background: '#0C0C0C',
                                        fontSize: '13px',
                                        lineHeight: '1.7',
                                        minHeight: '100%',
                                    }}
                                    lineNumberStyle={{
                                        minWidth: '3em',
                                        paddingRight: '1em',
                                        color: '#3a3a4a',
                                        userSelect: 'none',
                                    }}
                                >
                                    {generatedCode}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
}