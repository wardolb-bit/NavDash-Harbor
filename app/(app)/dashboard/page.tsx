import { AlertTriangle, CheckSquare, ClipboardList, Ship, Wrench } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

const summary = [
  { label: "Open Tasks", value: "18", detail: "Across deck and engine", tone: "cyan" },
  { label: "Due Maintenance", value: "6", detail: "Next 7 days", tone: "gold" },
  { label: "Active Voyage", value: "None", detail: "Planning queue ready", tone: "slate" },
  { label: "Open Issues", value: "4", detail: "1 safety critical", tone: "gold" },
];

const taskGroups = [
  {
    title: "Checklists",
    icon: ClipboardList,
    items: ["Pre-departure bridge readiness", "Safety equipment spot check", "Arrival watch handover"],
  },
  {
    title: "PMS",
    icon: Wrench,
    items: ["GMDSS weekly test", "Emergency generator inspection", "Steering gear visual check"],
  },
  {
    title: "Voyage Phase Tasks",
    icon: Ship,
    items: ["Confirm voyage folder assignment", "Review departure document set", "Assign phase owner"],
  },
];

const maintenance = [
  { equipment: "Emergency Generator", system: "Electrical", due: "Today", status: "Due" },
  { equipment: "VHF Radio 1", system: "Communications", due: "2 days", status: "Scheduled" },
  { equipment: "Fire Pump", system: "Safety", due: "5 days", status: "Scheduled" },
];

const issues = [
  { title: "Port liferaft hydrostatic release due", priority: "Safety Critical", source: "PMS" },
  { title: "Deck floodlight intermittent", priority: "Important", source: "Manual" },
  { title: "Checklist attachment missing", priority: "Routine", source: "Checklist" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-harbor-navy">Deck / Engine Command Center</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="command-card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-slate-600">{item.label}</p>
              <span
                className={
                  item.tone === "gold"
                    ? "h-3 w-3 rounded-full bg-harbor-gold"
                    : item.tone === "cyan"
                      ? "h-3 w-3 rounded-full bg-harbor-cyan"
                      : "h-3 w-3 rounded-full bg-slate-400"
                }
              />
            </div>
            <p className="mt-4 text-3xl font-bold text-harbor-navy">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <article className="command-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-harbor-navy">Open Tasks</h2>
              <p className="mt-1 text-sm text-slate-600">Grouped by checklist, PMS, and voyage phase work.</p>
            </div>
            <button className="operational-button" type="button">
              <CheckSquare className="h-4 w-4" aria-hidden />
              Review Tasks
            </button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {taskGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div key={group.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-harbor-cyan">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-bold text-harbor-navy">{group.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </article>

        <div className="grid gap-6 xl:grid-cols-2">
          <article className="command-card overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-harbor-navy">Due Maintenance</h2>
              <p className="mt-1 text-sm text-slate-600">Phase 1 shell data only. PMS build starts in a later phase.</p>
            </div>
            <div className="divide-y divide-slate-200">
              {maintenance.map((row) => (
                <div key={row.equipment} className="group grid gap-3 p-4 transition hover:bg-cyan-50 md:grid-cols-[1fr_140px_90px] md:items-center">
                  <div>
                    <p className="font-bold text-harbor-navy">{row.equipment}</p>
                    <p className="mt-1 text-sm text-slate-500">{row.system}</p>
                    <p className="mt-3 hidden rounded-md border border-cyan-100 bg-white p-3 text-sm text-slate-600 group-hover:block">
                      Hover expansion preview for the hybrid table pattern. Details become full cards in later phases.
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">{row.due}</p>
                  <span className="status-pill w-fit border-cyan-200 bg-cyan-50 text-cyan-700">{row.status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="command-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-harbor-navy">Active Voyage</h2>
                <p className="mt-1 text-sm text-slate-600">No voyage package is active in Phase 1.</p>
              </div>
              <span className="status-pill border-slate-300 bg-slate-50 text-slate-600">Planning</span>
            </div>
            <div className="mt-5">
              <EmptyState
                icon={Ship}
                title="Voyage operations shell ready"
                message="Voyage folders, route files, weather, hazards, and brief generation are reserved for Phase 2."
                action="Open Voyages"
              />
            </div>
          </article>
        </div>

        <article className="command-card overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-harbor-navy">Issues / Notifications</h2>
            <p className="mt-1 text-sm text-slate-600">Readiness queue with hover expansion behavior.</p>
          </div>
          <div className="grid divide-y divide-slate-200">
            {issues.map((issue) => (
              <div key={issue.title} className="group grid gap-3 p-4 transition hover:bg-amber-50 md:grid-cols-[1fr_160px_120px] md:items-center">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-harbor-gold" aria-hidden />
                  <div>
                    <p className="font-bold text-harbor-navy">{issue.title}</p>
                    <p className="mt-3 hidden rounded-md border border-amber-100 bg-white p-3 text-sm text-slate-600 group-hover:block">
                      Expandable detail preview. Issue creation and workflow arrive in Phase 5.
                    </p>
                  </div>
                </div>
                <span className="status-pill w-fit border-amber-200 bg-amber-50 text-amber-700">{issue.priority}</span>
                <p className="text-sm text-slate-600">{issue.source}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
