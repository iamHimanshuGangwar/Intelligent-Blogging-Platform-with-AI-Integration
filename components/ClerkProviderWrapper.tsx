'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  clerkFailed: boolean;
}

/**
 * Client-side error boundary that catches ClerkRuntimeError (e.g. Clerk JS
 * fails to load when offline). Renders children normally — the rest of the
 * app continues working via OTP auth fallback.
 */
export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { clerkFailed: false };
  }

  static getDerivedStateFromError(error: Error): State | null {
    if (
      error?.message?.includes('Failed to load Clerk') ||
      error?.name === 'ClerkRuntimeError'
    ) {
      return { clerkFailed: true };
    }
    return null;
  }

  componentDidCatch(error: Error) {
    if (
      error?.message?.includes('Failed to load Clerk') ||
      error?.name === 'ClerkRuntimeError'
    ) {
      console.warn('[ClerkErrorBoundary] Clerk JS unavailable — OTP auth still active.', error.message);
    } else {
      throw error;
    }
  }

  render() {
    return this.props.children;
  }
}
