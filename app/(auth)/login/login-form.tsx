"use client";

import { useActionState } from "react";
import { AlertCircle, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Username</span>
        <span className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-harbor-cyan focus-within:ring-2 focus-within:ring-cyan-100">
          <UserRound className="h-4 w-4 text-slate-500" aria-hidden />
          <input
            name="username"
            autoComplete="username"
            className="min-h-12 w-full border-0 bg-transparent text-slate-900 outline-none"
            required
          />
        </span>
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Password</span>
        <span className="mt-2 flex items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-harbor-cyan focus-within:ring-2 focus-within:ring-cyan-100">
          <LockKeyhole className="h-4 w-4 text-slate-500" aria-hidden />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="min-h-12 w-full border-0 bg-transparent text-slate-900 outline-none"
            required
          />
        </span>
      </label>

      {state.message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-harbor-gold" aria-hidden />
            <p>{state.message}</p>
          </div>
          {state.technical ? (
            <details className="mt-3">
              <summary className="cursor-pointer font-bold">Technical details</summary>
              <p className="mt-2 text-xs">{state.technical}</p>
            </details>
          ) : null}
        </div>
      ) : null}

      <button className="operational-button w-full" disabled={pending}>
        <LogIn className="h-4 w-4" aria-hidden />
        {pending ? "Checking access" : "Sign In"}
      </button>
    </form>
  );
}
