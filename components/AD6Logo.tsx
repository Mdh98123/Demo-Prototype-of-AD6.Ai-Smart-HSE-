
import React from 'react';

export const AD6Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 select-none ${className}`}>
    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow text-white">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-slate-800 tracking-tight leading-none">AD6<span className="text-brand-600">.Ai</span></span>
      <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Smart HSE Suite</span>
    </div>
  </div>
);
