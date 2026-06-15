import { Anchor } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-harbor-navy text-white">
      <section className="w-full max-w-md px-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg border border-cyan-300/40 bg-white/10">
          <Anchor className="h-10 w-10 text-cyan-200" aria-hidden />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">NavDash Harbor</p>
        <h1 className="mt-3 text-3xl font-bold">Loading operations center</h1>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-2/3 rounded-full bg-harbor-cyan" />
        </div>
      </section>
    </main>
  );
}
