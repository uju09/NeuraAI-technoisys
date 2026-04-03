import React from 'react';
import { Download, Code2 } from 'lucide-react';
import { useStore } from '../store';
import toast from 'react-hot-toast';

export default function ExportButtons() {
  const { generatedCode } = useStore();

  const handleDownload = () => {
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

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors border border-gray-700">
        <Code2 className="w-4 h-4" />
        Copy Code
      </button>
      <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-fuchsia-600/20 hover:bg-fuchsia-600/40 rounded-lg text-fuchsia-400 transition-colors border border-fuchsia-500/30">
        <Download className="w-4 h-4" />
        Download
      </button>
    </div>
  );
}