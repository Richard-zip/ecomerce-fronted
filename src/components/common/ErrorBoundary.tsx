import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#FFFFFF] p-8 rounded-[12px] border border-[#C53030]/20 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-[#FDE8E8] text-[#C53030] rounded-[8px] flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#1F2933]">Algo no salió como esperábamos</h2>
            <p className="text-xs text-[#627D98] leading-relaxed">
              {this.state.error?.message || 'Ocurrió un error inesperado al renderizar la vista.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#102A43] hover:bg-[#243B53] text-white rounded-[8px] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw size={14} /> Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
