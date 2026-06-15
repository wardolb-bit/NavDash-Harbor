import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Upload, Ship, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import {
  createHazard,
  deleteVoyage,
  generateVoyageBrief,
  saveWeather,
  updateVoyage,
  uploadRouteFile,
  uploadVoyageDocument,
} from "../actions";
import type {
  Voyage,
  VoyageDocument,
  VoyageHazard,
  VoyagePhase,
  VoyageReport,
  VoyageRouteFile,
  VoyageStatus,
  VoyageWaypoint,
  VoyageWeather,
} from "@/lib/types";

const tabs = ["Overview", "Route", "Weather", "Hazards", "Documents", "Reports"] as const;
const statuses: VoyageStatus[] = ["Draft", "Active", "Complete"];
const phases: VoyagePhase[] = ["Planning", "Pre-Departure", "Underway", "Pre-Arrival", "Complete"];

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateInput(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

function displayValue(value: string | null) {
  return value || "Not set";
}

export default async function VoyageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const activeTab = tabs.find((tab) => tab.toLowerCase() === query?.tab?.toLowerCase()) ?? "Overview";
  const profile = await getCurrentProfile();
  const canEdit = profile.role === "admin" || profile.role === "deck";
  const canEditState = profile.role === "admin";
  const canDelete = profile.role === "admin";
  const supabase = await createClient();
  const result = await supabase.from("voyages").select("*").eq("id", id).maybeSingle();
  const voyage = result.data as Voyage | null;
  const error = result.error;

  if (error) {
    return (
      <VoyageError
        title="Voyage could not load"
        message="Supabase returned an error while loading this voyage."
        details={error.message}
      />
    );
  }

  if (!voyage) {
    notFound();
  }

  const updateAction = updateVoyage.bind(null, voyage.id);
  const deleteAction = deleteVoyage.bind(null, voyage.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/voyages" className="secondary-button mb-4">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voyages
          </Link>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">Voyage Detail</p>
          <h1 className="mt-2 text-3xl font-bold text-harbor-navy">{voyage.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {displayValue(voyage.origin)} to {displayValue(voyage.destination)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="status-pill border-cyan-200 bg-cyan-50 text-cyan-700">{voyage.status}</span>
          <span className="status-pill border-slate-300 bg-slate-50 text-slate-600">{voyage.phase}</span>
        </div>
      </section>

      {query?.error ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          The voyage action could not be completed.
          <details className="mt-2">
            <summary className="cursor-pointer font-bold">Technical details</summary>
            <p className="mt-2">{decodeURIComponent(query.error)}</p>
          </details>
        </section>
      ) : null}

      <nav className="command-card flex flex-wrap gap-2 p-2">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/voyages/${voyage.id}?tab=${tab.toLowerCase()}`}
            className={
              activeTab === tab
                ? "rounded-md bg-harbor-cyan px-4 py-2 text-sm font-bold text-white"
                : "rounded-md px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            }
          >
            {tab}
          </Link>
        ))}
      </nav>

      {activeTab === "Overview" ? (
        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <form action={updateAction} className="command-card p-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-harbor-cyan">
                <Ship className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="text-xl font-bold text-harbor-navy">Overview</h2>
                <p className="text-sm text-slate-600">
                  {canEdit ? "Edit operational voyage fields." : "Read-only voyage access."}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <TextField label="Name" name="name" defaultValue={voyage.title} disabled={!canEdit} required />
              <TextField label="Vessel ID" name="vessel_id" defaultValue={voyage.vessel_name} disabled={!canEdit} />
              <TextField label="Departure Port" name="departure_port" defaultValue={voyage.origin ?? ""} disabled={!canEdit} />
              <TextField label="Arrival Port" name="arrival_port" defaultValue={voyage.destination ?? ""} disabled={!canEdit} />
              <DateField label="ETD" name="etd" defaultValue={toDateInput(voyage.etd)} disabled={!canEdit} />
              <DateField label="ETA" name="eta" defaultValue={toDateInput(voyage.eta)} disabled={!canEdit} />
              <SelectField label="Status" name="status" value={voyage.status} values={statuses} disabled={!canEditState} />
              <SelectField label="Phase" name="phase" value={voyage.phase} values={phases} disabled={!canEditState} />
            </div>
            {canEdit ? (
              <div className="mt-6 flex justify-end">
                <button className="operational-button" type="submit">Save Voyage</button>
              </div>
            ) : null}
          </form>

          <aside className="space-y-6">
            <section className="command-card p-5">
              <h2 className="text-lg font-bold text-harbor-navy">Schedule</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-bold text-slate-500">ETD</dt>
                  <dd className="mt-1 text-slate-800">{formatDate(voyage.etd)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">ETA</dt>
                  <dd className="mt-1 text-slate-800">{formatDate(voyage.eta)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Voyage Number</dt>
                  <dd className="mt-1 text-slate-800">{voyage.voyage_number}</dd>
                </div>
              </dl>
            </section>
            {canDelete ? (
              <form action={deleteAction} className="command-card border-amber-200 bg-amber-50 p-5">
                <h2 className="text-lg font-bold text-harbor-navy">Admin Control</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Delete this voyage package from the existing voyages table.</p>
                <button className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-harbor-gold px-4 py-2 text-sm font-bold text-white hover:bg-amber-700" type="submit">
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete Voyage
                </button>
              </form>
            ) : null}
          </aside>
        </section>
      ) : (
        <VoyageTabContent voyageId={voyage.id} tab={activeTab} canEdit={canEdit} />
      )}
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  disabled,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none disabled:bg-slate-100 disabled:text-slate-500 focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function DateField({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        name={name}
        type="datetime-local"
        defaultValue={defaultValue}
        disabled={disabled}
        className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none disabled:bg-slate-100 disabled:text-slate-500 focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  name,
  value,
  values,
  disabled,
}: {
  label: string;
  name: string;
  value: T;
  values: T[];
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={value}
        disabled={disabled}
        className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none disabled:bg-slate-100 disabled:text-slate-500 focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100"
      >
        {values.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

async function VoyageTabContent({
  voyageId,
  tab,
  canEdit,
}: {
  voyageId: string;
  tab: Exclude<(typeof tabs)[number], "Overview">;
  canEdit: boolean;
}) {
  const supabase = await createClient();

  if (tab === "Route") {
    const uploadAction = uploadRouteFile.bind(null, voyageId);
    const [routeFilesResult, waypointsResult] = await Promise.all([
      supabase.from("voyage_route_files").select("id, file_name, file_type, uploaded_at, is_current").eq("voyage_id", voyageId).order("uploaded_at", { ascending: false }),
      supabase.from("voyage_waypoints").select("id, sequence, name, latitude, longitude, remarks").eq("voyage_id", voyageId).order("sequence", { ascending: true }),
    ]);
    const routeFiles = routeFilesResult.data as Pick<VoyageRouteFile, "id" | "file_name" | "file_type" | "uploaded_at" | "is_current">[] | null;
    const waypoints = waypointsResult.data as Pick<VoyageWaypoint, "id" | "sequence" | "name" | "latitude" | "longitude" | "remarks">[] | null;
    const fileError = routeFilesResult.error;
    const waypointError = waypointsResult.error;

    if (fileError || waypointError) {
      return <VoyageError title="Route could not load" message="Supabase returned an error while loading route data." details={fileError?.message ?? waypointError?.message ?? ""} />;
    }

    return (
      <section className="command-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-harbor-navy">Route</h2>
            <p className="mt-1 text-sm text-slate-600">Route files and read-only parsed waypoints.</p>
          </div>
          {canEdit ? (
            <form action={uploadAction} className="flex flex-wrap items-center gap-2">
              <input
                name="route_file"
                type="file"
                accept=".rtz,.xml,.csv,.gpx,.kml"
                required
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
              <button className="operational-button" type="submit">
                <Upload className="h-4 w-4" aria-hidden />
                Upload Route
              </button>
            </form>
          ) : null}
        </div>
        {(!routeFiles || routeFiles.length === 0) && (!waypoints || waypoints.length === 0) ? <TabEmpty label="route data" /> : null}
        {routeFiles && routeFiles.length > 0 ? (
          <DataList title="Route Files" rows={routeFiles.map((file) => [file.file_name, file.file_type, file.is_current ? "Current" : "Replaced", formatDate(file.uploaded_at)])} />
        ) : null}
        {waypoints && waypoints.length > 0 ? (
          <DataList title="Waypoints" rows={waypoints.map((point) => [String(point.sequence), point.name ?? "Unnamed", `${point.latitude ?? ""}, ${point.longitude ?? ""}`, point.remarks ?? ""])} />
        ) : null}
      </section>
    );
  }

  if (tab === "Weather") {
    const weatherAction = saveWeather.bind(null, voyageId);
    const result = await supabase.from("voyage_weather").select("summary, source_reference, updated_at").eq("voyage_id", voyageId).maybeSingle();
    const data = result.data as Pick<VoyageWeather, "summary" | "source_reference" | "updated_at"> | null;
    const error = result.error;
    if (error) {
      return <VoyageError title="Weather could not load" message="Supabase returned an error while loading weather data." details={error.message} />;
    }
    return (
      <section className="command-card p-6">
        <h2 className="text-xl font-bold text-harbor-navy">Weather</h2>
        {canEdit ? (
          <form action={weatherAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Weather Summary</span>
              <textarea
                name="summary"
                defaultValue={data?.summary ?? ""}
                rows={6}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Source / Reference</span>
              <input
                name="source_reference"
                defaultValue={data?.source_reference ?? ""}
                className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100"
              />
            </label>
            <div className="flex justify-end">
              <button className="operational-button" type="submit">Save Weather</button>
            </div>
          </form>
        ) : data ? (
          <WeatherSummary summary={data.summary} source={data.source_reference} />
        ) : (
          <TabEmpty label="weather summary" />
        )}
      </section>
    );
  }

  if (tab === "Hazards") {
    const hazardAction = createHazard.bind(null, voyageId);
    const result = await supabase.from("voyage_hazards").select("title, location, description, priority, status, source_reference").eq("voyage_id", voyageId).order("created_at", { ascending: false });
    const data = result.data as Pick<VoyageHazard, "title" | "location" | "description" | "priority" | "status" | "source_reference">[] | null;
    const error = result.error;
    if (error) {
      return <VoyageError title="Hazards could not load" message="Supabase returned an error while loading hazards." details={error.message} />;
    }
    return (
      <section className="space-y-6">
        {canEdit ? <HazardForm action={hazardAction} /> : null}
        <TabTable
          title="Hazards"
          emptyLabel="hazards"
          rows={(data ?? []).map((hazard) => [hazard.title, hazard.location ?? "Not set", hazard.priority, hazard.status, hazard.source_reference ?? "Not set", hazard.description ?? ""])}
        />
      </section>
    );
  }

  if (tab === "Documents") {
    const documentAction = uploadVoyageDocument.bind(null, voyageId);
    const result = await supabase.from("voyage_documents").select("title, file_name, uploaded_at").eq("voyage_id", voyageId).order("uploaded_at", { ascending: false });
    const data = result.data as Pick<VoyageDocument, "title" | "file_name" | "uploaded_at">[] | null;
    const error = result.error;
    if (error) {
      return <VoyageError title="Documents could not load" message="Supabase returned an error while loading documents." details={error.message} />;
    }
    return (
      <section className="space-y-6">
        {canEdit ? (
          <form action={documentAction} className="command-card p-6">
            <h2 className="text-xl font-bold text-harbor-navy">Upload Voyage Document</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Title</span>
                <input name="title" required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">File</span>
                <input name="document_file" type="file" required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
              </label>
              <button className="operational-button" type="submit">Upload</button>
            </div>
          </form>
        ) : null}
        <TabTable title="Documents" emptyLabel="documents" rows={(data ?? []).map((document) => [document.title, document.file_name, formatDate(document.uploaded_at)])} />
      </section>
    );
  }

  const reportAction = generateVoyageBrief.bind(null, voyageId);
  const result = await supabase.from("voyage_reports").select("report_type, file_name, generated_at, is_current").eq("voyage_id", voyageId).order("generated_at", { ascending: false });
  const data = result.data as Pick<VoyageReport, "report_type" | "file_name" | "generated_at" | "is_current">[] | null;
  const error = result.error;
  if (error) {
    return <VoyageError title="Reports could not load" message="Supabase returned an error while loading reports." details={error.message} />;
  }
  return (
    <section className="space-y-6">
      {canEdit ? (
        <form action={reportAction} className="command-card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-xl font-bold text-harbor-navy">Voyage Brief PDF</h2>
            <p className="mt-1 text-sm text-slate-600">Generate and replace the current voyage brief in the voyage folder.</p>
          </div>
          <button className="operational-button" type="submit">Generate Brief</button>
        </form>
      ) : null}
      <TabTable title="Reports" emptyLabel="reports" rows={(data ?? []).map((report) => [report.report_type, report.file_name, formatDate(report.generated_at), report.is_current ? "Current" : "Replaced"])} />
    </section>
  );
}

function WeatherSummary({ summary, source }: { summary: string; source: string | null }) {
  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
      <p>{summary || "No summary entered."}</p>
      <p className="mt-4 font-bold text-slate-500">Source: {source || "Not set"}</p>
    </div>
  );
}

function HazardForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="command-card p-6">
      <h2 className="text-xl font-bold text-harbor-navy">Add Hazard</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Title</span>
          <input name="title" required className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Location</span>
          <input name="location" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Priority</span>
          <select name="priority" defaultValue="Routine" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100">
            <option>Routine</option>
            <option>Important</option>
            <option>Urgent</option>
            <option>Safety Critical</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Status</span>
          <select name="status" defaultValue="Active" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100">
            <option>Active</option>
            <option>Monitoring</option>
            <option>Resolved</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-bold text-slate-700">Source Reference</span>
          <input name="source_reference" className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-bold text-slate-700">Description</span>
          <textarea name="description" rows={4} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-harbor-cyan focus:ring-2 focus:ring-cyan-100" />
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <button className="operational-button" type="submit">Add Hazard</button>
      </div>
    </form>
  );
}

function TabEmpty({ label }: { label: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <FileText className="mx-auto h-8 w-8 text-harbor-cyan" aria-hidden />
      <p className="mt-3 font-bold text-harbor-navy">No {label} found</p>
      <p className="mt-1 text-sm text-slate-600">This tab is connected to Supabase and will show records when they exist.</p>
    </div>
  );
}

function DataList({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-bold text-harbor-navy">{title}</h3>
      <div className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
        {rows.map((row, index) => (
          <div key={`${title}-${index}`} className="grid gap-2 p-3 text-sm text-slate-700 md:grid-cols-4">
            {row.map((cell, cellIndex) => <span key={`${title}-${index}-${cellIndex}`}>{cell}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabTable({ title, emptyLabel, rows }: { title: string; emptyLabel: string; rows: string[][] }) {
  return (
    <section className="command-card p-6">
      <h2 className="text-xl font-bold text-harbor-navy">{title}</h2>
      {rows.length === 0 ? <TabEmpty label={emptyLabel} /> : <DataList title={title} rows={rows} />}
    </section>
  );
}

function VoyageError({ title, message, details }: { title: string; message: string; details: string }) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="command-card p-6">
        <h1 className="text-xl font-bold text-harbor-navy">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <summary className="cursor-pointer font-bold text-slate-700">Technical details</summary>
          <p className="mt-2">{details}</p>
        </details>
      </section>
    </div>
  );
}
