import Link from "next/link";
import { Anchor, ShieldCheck, Database, ShipWheel } from "lucide-react";
import { SetupForm } from "./setup-form";

export default function SetupPage() {
  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between bg-harbor-navy p-8 text-white lg:p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan-300/40 bg-white/10"><Anchor className="h-7 w-7 text-cyan-200" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">NavDash Harbor</p><p className="text-sm text-slate-300">Commissioning console</p></div>
          </div>
          <div className="mt-20 max-w-lg">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">Initial setup</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Bring the vessel operations workspace online.</h1>
            <p className="mt-5 text-base leading-7 text-slate-300">This one-time process creates the Harbor owner account and binds it to the dedicated vessel database.</p>
            <div className="mt-8 grid gap-3 text-sm text-slate-300">
              <div className="flex items-center gap-3"><Database className="h-5 w-5 text-cyan-200"/>Dedicated Supabase data store</div>
              <div className="flex items-center gap-3"><ShipWheel className="h-5 w-5 text-cyan-200"/>Vessel-scoped operations access</div>
              <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-cyan-200"/>Row-level security enforced</div>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-300">Bootstrap access can only be claimed once.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="command-card w-full max-w-md p-6 lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">Owner registration</p>
          <h2 className="mt-3 text-2xl font-bold text-harbor-navy">Commission Harbor</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use the bootstrap code supplied for this installation.</p>
          <SetupForm />
          <p className="mt-6 text-center text-sm text-slate-500">Already commissioned? <Link href="/login" className="font-bold text-harbor-cyan">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
