"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="command-card max-w-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-amber-50 text-harbor-gold">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-harbor-navy">Operations view could not load</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The app hit a problem while preparing this screen. Try again, or expand the technical details for support.
            </p>
          </div>
        </div>
        <button className="operational-button mt-6" onClick={reset}>
          <RefreshCcw className="h-4 w-4" aria-hidden />
          Retry
        </button>
        <details className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <summary className="cursor-pointer font-bold text-slate-700">Technical details</summary>
          <pre className="mt-3 whitespace-pre-wrap text-xs">{error.message || error.digest}</pre>
        </details>
      </section>
    </main>
  );
}
