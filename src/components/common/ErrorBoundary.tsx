import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2 grow">
              <h2 className="text-base font-bold text-slate-900">
                {this.props.fallbackTitle || 'Terjadi Kendala pada Tampilan Ini'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {this.props.fallbackMessage ||
                  'Modul ini mengalami kendala teknis (misalnya izin kamera ditolak atau perangkat media tidak tersedia). Data Anda tetap aman.'}
              </p>
              {this.state.error && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-rose-700 overflow-x-auto">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Komponen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
