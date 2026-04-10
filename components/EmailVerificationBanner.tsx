'use client';

import { useState, useEffect } from 'react';

interface Props {
  /** Pass the user's email if you have it client-side, for display purposes only. */
  email?: string;
}

export default function EmailVerificationBanner({ email }: Props) {
  const [status, setStatus] = useState<'loading' | 'unverified' | 'verified' | 'hidden'>('loading');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/resend-verification', { method: 'GET' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.verified) {
          setStatus('hidden'); // Already verified — hide banner
        } else {
          setStatus('unverified');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('hidden'); // Can't check — hide gracefully
      });
    return () => { cancelled = true; };
  }, []);

  const resend = async () => {
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json();
      if (data.alreadyVerified) {
        setStatus('hidden');
      } else {
        setMessage(data.message || 'Verification email sent. Check your inbox.');
      }
    } catch {
      setMessage('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || status === 'hidden' || status === 'verified') return null;

  return (
    <div
      role="alert"
      className="w-full border-b border-amber-700/40 bg-amber-950/60 px-4 py-2.5 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-amber-200">
          <svg className="h-4 w-4 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Please verify your email address
            {email ? ` (${email})` : ''} to unlock all features.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs text-amber-300">{message}</span>}
          <button
            onClick={resend}
            disabled={sending}
            className="rounded-md border border-amber-600/50 bg-amber-900/40 px-3 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-800/50 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Resend verification email'}
          </button>
          <button
            onClick={() => setStatus('hidden')}
            aria-label="Dismiss"
            className="text-amber-400/60 hover:text-amber-400 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
