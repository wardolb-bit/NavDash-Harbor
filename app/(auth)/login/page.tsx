import Link from "next/link";
import { Anchor, ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between bg-harbor-navy p-8 text-white lg:p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan-300/40 bg-white/10"><Anchor className="h-7 w-7 text-cyan-200" aria-hidden /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">NavDash Harbor</p><p className="text-sm text-slate-300">Vessel operations management</p></div>
          </div>
          <div className="mt-20 max-w-lg">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">Operations Command Center</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">One operational picture for vessel, maintenance, safety, crew, and voyage work.</h1>
            <p className="mt-5 text-base leading-7 text-slate-300">Harbor is backed by a dedicated secured vessel database with role- and vessel-scoped access.</p>
          </div>
        </div>
        <div className="mt-12 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-300"><ShieldCheck className="h-5 w-5 text-harbor-cyan" aria-hidden />No public registration. Sessions persist until logout.</div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="command-card w-full max-w-md p-6 lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">Secure sign in</p>
          <h2 className="mt-3 text-2xl font-bold text-harbor-navy">Enter Harbor credentials</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use the email and password assigned to your Harbor account.</p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-500">New installation? <Link className="font-bold text-harbor-cyan" href="/setup">Commission Harbor</Link></p>
        </div>
      </section>
    </main>
  );
}
