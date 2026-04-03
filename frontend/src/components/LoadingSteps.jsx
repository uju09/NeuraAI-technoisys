import React from 'react';
import { useStore } from '../store';
import { Loader2, CheckCircle, Code, Cpu, Package, Play } from 'lucide-react';

const steps = [
  { id: 'enhancing', label: 'Enhancing prompt', icon: Cpu },
  { id: 'generating', label: 'Generating code', icon: Code },
  { id: 'building', label: 'Building container', icon: Package },
  { id: 'ready', label: 'Preview ready', icon: Play },
];

export default function LoadingSteps() {
  const { loadingStep } = useStore();
  
  if (loadingStep === 'idle') return null;

  const currentIdx = steps.findIndex(s => s.id === loadingStep);

  return (
    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
      <div className="glass-panel rounded-xl p-8 max-w-sm w-full space-y-6">
        <h3 className="text-xl font-semibold neon-text text-center mb-6">Forging...</h3>
        
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx || loadingStep === 'ready';
            const isCurrent = step.id === loadingStep;
            const Icon = step.icon;
            
            return (
              <div key={step.id} className={`flex items-center gap-4 ${isCompleted || isCurrent ? 'text-gray-200' : 'text-gray-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400' : isCurrent ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse' : 'border-gray-700 bg-gray-900'}`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : isCurrent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`font-medium ${isCurrent ? 'animate-pulse' : ''}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}