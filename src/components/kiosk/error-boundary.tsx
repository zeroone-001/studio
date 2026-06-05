
"use client";

import React from "react";
import { NeonButton } from "./neon-button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class KioskErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Kiosk Critical Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-headline font-black italic uppercase text-white">System <span className="text-red-500">Recovery</span></h1>
              <p className="text-sm font-bold uppercase tracking-widest text-white/40 leading-relaxed">
                A critical interface error occurred. The system has preserved its safety protocols.
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-left overflow-auto max-h-32 text-red-400">
                {this.state.error?.message || "Unknown error detected"}
              </div>
            </div>
            <NeonButton onClick={this.handleReset} className="w-full !py-8 text-xl">
              <RefreshCcw className="w-6 h-6 mr-2" /> RESTART SYSTEM
            </NeonButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
