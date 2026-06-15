import Link from "next/link";
import { CalendarClock, Plus, Ship } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { EmptyState } from "@/components/empty-state";
import type { Voyage } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function displayValue(value: string | null) {
  return value || "Not set";
}

export default async function VoyagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const canCreate = profile.role === "admin" || profile.role === "deck";
  const supabase = await createClient();
  const result = await supabase
    .from("voyages")
    .select("id, title, origin, destination, status, phase, etd, eta, vessel_name")
    .order("created_at", { ascending: false });
  const voyages = result.data as Pick<Voyage, "id" | "title" | "origin" | "destination" | "status" | "phase" | "etd" | "eta" | "vessel_name">[] | null;
  const error = result.error;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">Phase 2</p>
          <h1 className="mt-2 text-3xl font-bold text-harbor-navy">Voyages</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Operational voyage packages pulled from Supabase.
          </p>
        </div>
        {canCreate ? (
          <Link href="/voyages/new" className="operational-button">
            <Plus className="h-4 w-4" aria-hidden />
            Create Voyage
          </Link>
        ) : null}
      </section>

      {params?.error === "unauthorized" ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          You do not have permission to perform that voyage action.
        </section>
      ) : null}

      {error ? (
        <section className="command-card p-5">
          <h2 className="text-lg font-bold text-harbor-navy">Voyages could not load</h2>
          <p className="mt-2 text-sm text-slate-600">Supabase returned an error while loading voyages.</p>
          <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-bold text-slate-700">Technical details</summary>
            <p className="mt-2">{error.message}</p>
          </details>
        </section>
      ) : null}

      {!error && (!voyages || voyages.length === 0) ? (
        <section className="command-card p-6">
          <EmptyState
            icon={Ship}
            title="No voyages yet"
            message="Create the first voyage package to begin operational planning."
            action={canCreate ? "Use Create Voyage" : "No voyages available"}
          />
        </section>
      ) : null}

      {!error && voyages && voyages.length > 0 ? (
        <section className="command-card overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-harbor-navy">Voyage Register</h2>
            <p className="mt-1 text-sm text-slate-600">Click a row to open the voyage detail page.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Departure Port</th>
                  <th className="px-4 py-3">Arrival Port</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">ETD</th>
                  <th className="px-4 py-3">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {voyages.map((voyage) => (
                  <tr key={voyage.id} className="group hover:bg-cyan-50">
                    <td className="px-4 py-4">
                      <Link href={`/voyages/${voyage.id}`} className="block">
                        <span className="font-bold text-harbor-navy">{voyage.title}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Ship className="h-3.5 w-3.5" aria-hidden />
                          {voyage.vessel_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{displayValue(voyage.origin)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{displayValue(voyage.destination)}</td>
                    <td className="px-4 py-4">
                      <span className="status-pill border-cyan-200 bg-cyan-50 text-cyan-700">{voyage.status}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-700">{voyage.phase}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-slate-400" aria-hidden />
                        {formatDate(voyage.etd)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{formatDate(voyage.eta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
