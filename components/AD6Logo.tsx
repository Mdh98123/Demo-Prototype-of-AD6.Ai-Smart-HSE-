
import React from 'react';

export const AD6Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 select-none ${className}`}>
    <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-sm">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-neutral-800 tracking-tight leading-none">AD6<span className="text-brand-500">.Ai</span></span>
      <span className="text-[10px] font-bold text-neutral-500 tracking-[0.1em] uppercase mt-0.5">Enterprise HSE</span>
    </div>
  </div>
);
