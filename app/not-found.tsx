import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="command-card max-w-lg p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-50 text-harbor-cyan">
          <Compass className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-harbor-navy">Operations page not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">This section is not available in the Phase 1 shell.</p>
        <Link href="/dashboard" className="operational-button mt-6">
          <Home className="h-4 w-4" aria-hidden />
          Return to Dashboard
        </Link>
      </section>
    </main>
  );
}
