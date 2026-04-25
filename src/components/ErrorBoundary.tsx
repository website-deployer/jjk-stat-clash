import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[JJK Stat Clash] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-zinc-900 border border-red-900/50 rounded-2xl p-10 text-center shadow-[0_0_40px_rgba(220,38,38,0.15)]">
            <div className="text-6xl mb-6">呪</div>
            <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Cursed Error
            </h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Something went wrong. The cursed energy has destabilized.
            </p>
            {this.state.error && (
              <pre className="text-left text-[10px] text-zinc-600 bg-black/50 p-4 rounded-lg mb-8 overflow-auto max-h-32 font-mono border border-zinc-800">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
