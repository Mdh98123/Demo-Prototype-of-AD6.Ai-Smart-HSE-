
import React from 'react';
import { Hexagon, Loader2 } from 'lucide-react';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Loading Module..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[60vh] animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
        <Hexagon size={64} className="text-slate-200 relative z-10" strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">AD6.Ai Enterprise</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{message}</p>
    </div>
  );
};

export default LoadingScreen;
