import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Logger } from '../../services/logger';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Define state property explicitly to avoid TS errors
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our new centralized logger
    Logger.error("Uncaught React Exception", error, { componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-lg">
            <div className="bg-red-50 p-6 rounded-full w-fit mx-auto mb-6">
                <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">System Exception</h1>
            <p className="text-slate-500 font-medium mb-8">
              The application encountered a critical error. Our engineering team has been notified.
            </p>
            <div className="p-4 bg-slate-100 rounded-xl mb-8 text-left overflow-auto max-h-32">
                <code className="text-xs font-mono text-slate-600">
                    {this.state.error?.message || 'Unknown Error'}
                </code>
            </div>
            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => window.location.reload()} 
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 transition shadow-lg"
                >
                    <RefreshCcw size={16} /> Reload System
                </button>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-50 transition"
                >
                    <Home size={16} /> Return Home
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
