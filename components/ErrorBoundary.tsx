'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Receives the error and a reset function. */
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
  /** If true, render a smaller inline error card instead of a full-page error. */
  inline?: boolean;
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

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in development, swap with your monitoring service (e.g., Sentry) in production.
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback({ error: this.state.error, reset: this.handleReset });
    }

    if (this.props.inline) {
      return (
        <div className="my-4 rounded-lg border border-red-800/40 bg-red-950/20 p-4 text-sm">
          <p className="font-semibold text-red-400">Something went wrong in this section.</p>
          <p className="mt-1 text-red-300/70">{this.state.error.message}</p>
          <button
            onClick={this.handleReset}
            className="mt-3 rounded px-3 py-1 text-xs font-medium bg-red-900/40 text-red-300 hover:bg-red-900/60 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="mb-4 text-5xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">Something went wrong</h2>
          <p className="mb-6 text-gray-400">
            An unexpected error occurred. Our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 rounded-lg border border-gray-700 bg-gray-900 p-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-300">
                Error details (dev only)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-400">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-white text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
