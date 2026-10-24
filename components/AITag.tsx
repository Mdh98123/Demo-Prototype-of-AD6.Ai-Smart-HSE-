import React from 'react';
import { Sparkles } from 'lucide-react';

export const AITag: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 ${className}`}>
    <Sparkles size={12} className="text-indigo-500" />
    <span className="text-[10px] font-bold uppercase tracking-widest">AI-Generated &mdash; Review Before Acting</span>
  </div>
);
