/**
 * @ad6/web Client Entry Point
 * Mounts the React 19 application interface.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

export const WebAppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="border-b border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold">AD6.Ai Smart HSE Platform</h1>
        <p className="text-xs text-slate-400">Enterprise React 19 Web Client</p>
      </header>
      <main id="web-root-content">
        <p className="text-sm text-slate-300">Phase 0 Foundation Workspace</p>
      </main>
    </div>
  );
};

const container = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (container) {
  const root = createRoot(container);
  root.render(<WebAppShell />);
}
