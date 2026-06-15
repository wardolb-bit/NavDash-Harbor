import Link from "next/link";
import { ArrowLeft, Ship } from "lucide-react";
import { createVoyage } from "../actions";
import { requireRole } from "@/lib/rbac";

export default async function NewVoyagePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  await requireRole(["admin", "deck"]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">Voyages</p>
          <h1 className="mt-2 text-3xl font-bold text-harbor-navy">Create Voyage</h1>
        </div>
        <Link href="/voyages" className="secondary-button">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
      </section>

      {params?.error ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          The voyage could not be created.
          <details className="mt-2">
            <summary className="cursor-pointer font-bold">Technical details</summary>
            <p className="mt-2">{decodeURIComponent(params.error)}</p>
          </details>
        </section>
      ) : null}

      <form action={createVoyage} className="command-card p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-harbor-cyan">
            <Ship className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold text-harbor-navy">Voyage Details</h2>
            <p className="text-sm text-slate-600">Saved to the existing Supabase `voyages` table.</p>
          </div>
        </div>
        <VoyageFields />
        <div className="mt-6 flex justify-end gap-3">
          <Link href="/voyages" className="secondary-button">Cancel</Link>
          <button className="operational-button" type="submit">Create Voyage</button>
        </div>
      </form>
    </div>
  );
}

function VoyageFields() {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">Name</span>
        <input name="name" required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
      </label>
      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">Vessel ID</span>
        <input name="vessel_id" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Departure Port</span>
        <input name="departure_port" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Arrival Port</span>
        <input name="arrival_port" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">ETD</span>
        <input name="etd" type="datetime-local" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">ETA</span>
        <input name="eta" type="datetime-local" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
      </label>
      <input type="hidden" name="status" value="Draft" />
      <input type="hidden" name="phase" value="Planning" />
    </div>
  );
}
