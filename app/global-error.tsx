"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
          <p className="mb-6 text-gray-400">An unexpected error occurred. Our team has been notified.</p>
          <button
            onClick={reset}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
