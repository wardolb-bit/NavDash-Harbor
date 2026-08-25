"use client";

import { useActionState } from "react";
import { KeyRound, Mail, UserRound, LockKeyhole } from "lucide-react";
import { setupHarbor, type SetupState } from "./actions";

const initialState: SetupState = {};

export function SetupForm() {
  const [state, formAction, pending] = useActionState(setupHarbor, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <Field name="fullName" label="Full name" icon={<UserRound className="h-4 w-4 text-slate-500" />} />
      <Field name="email" label="Email" type="email" icon={<Mail className="h-4 w-4 text-slate-500" />} />
      <Field name="password" label="Password" type="password" icon={<LockKeyhole className="h-4 w-4 text-slate-500" />} />
      <Field name="inviteCode" label="Bootstrap code" icon={<KeyRound className="h-4 w-4 text-slate-500" />} />
      {state.message && (
        <div className={`rounded-md border p-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          <p>{state.message}</p>
          {state.technical && <p className="mt-1 text-xs opacity-70">{state.technical}</p>}
        </div>
      )}
      <button
        type="submit"
        className="flex min-h-12 w-full items-center justify-center rounded-md border border-cyan-700 bg-cyan-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Commissioning Harbor…" : "Create Harbor owner account"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text", icon }: { name: string; label: string; type?: string; icon: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-harbor-cyan focus-within:ring-2 focus-within:ring-cyan-100">
        {icon}
        <input name={name} type={type} required className="min-h-12 w-full border-0 bg-transparent text-slate-900 outline-none" />
      </span>
    </label>
  );
}
