"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Anchor,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  LifeBuoy,
  Menu,
  PackageSearch,
  Search,
  Settings,
  ShieldCheck,
  Ship,
  Users,
  Wrench,
  X,
} from "lucide-react";

type ModuleKey =
  | "dashboard"
  | "vessels"
  | "voyages"
  | "pms"
  | "work-orders"
  | "checklists"
  | "issues"
  | "inventory"
  | "documents"
  | "crew"
  | "reports"
  | "admin";

type HarborAppProps = { module?: ModuleKey };

const nav = [
  ["dashboard", "Command", Gauge],
  ["vessels", "Vessels", Ship],
  ["voyages", "Voyages", Anchor],
  ["pms", "Maintenance", Wrench],
  ["work-orders", "Work Orders", ClipboardCheck],
  ["checklists", "Checklists", CheckCircle2],
  ["issues", "Defects & Issues", AlertTriangle],
  ["inventory", "Inventory", Boxes],
  ["documents", "Documents", FileText],
  ["crew", "Crew", Users],
  ["reports", "Reports", BarChart3],
  ["admin", "Admin", Settings],
] as const;

const workOrders = [
  { id: "WO-1842", title: "Service port main engine jacket water pump", asset: "ME Port / Cooling", due: "27 Aug", owner: "2/E", status: "Due", priority: "High" },
  { id: "WO-1845", title: "Inspect rescue boat falls and limit switches", asset: "LSA / Rescue Boat", due: "28 Aug", owner: "3/M", status: "Planned", priority: "High" },
  { id: "WO-1838", title: "Clean radar scanner pedestal drain", asset: "Bridge / X-band", due: "Today", owner: "C/O", status: "Overdue", priority: "Medium" },
  { id: "WO-1851", title: "Renew galley exhaust pre-filters", asset: "Hotel / HVAC", due: "01 Sep", owner: "CE", status: "Planned", priority: "Low" },
  { id: "WO-1855", title: "Lubricate steering gear linkage", asset: "Steering Gear", due: "02 Sep", owner: "2/E", status: "Planned", priority: "Medium" },
];

const defects = [
  { id: "DEF-092", title: "Port bridge wing wiper intermittent", area: "Bridge", opened: "23 Aug", risk: "Medium", status: "Open" },
  { id: "DEF-088", title: "No. 2 fire damper position indicator", area: "Engine Room", opened: "20 Aug", risk: "High", status: "Parts ordered" },
  { id: "DEF-081", title: "Paint breakdown aft mooring station", area: "Deck", opened: "12 Aug", risk: "Low", status: "Scheduled" },
];

const inventory = [
  { part: "CAT 1R-1808 lube oil filter", location: "ER Store A3", onHand: 6, min: 4, unit: "ea" },
  { part: "Furuno radar magnetron M1568BS", location: "Electronics Locker", onHand: 1, min: 1, unit: "ea" },
  { part: "20 mm synthetic mooring tails", location: "Bosun Store", onHand: 2, min: 4, unit: "ea" },
  { part: "SCBA cylinders 6.8 L / 300 bar", location: "Fire Locker", onHand: 8, min: 8, unit: "ea" },
  { part: "Hydraulic oil ISO 46", location: "ER Chemical Store", onHand: 65, min: 80, unit: "L" },
];

const docs = [
  { name: "Safety Management Manual", rev: "Rev 22", owner: "QHSE", date: "18 Jul 2026", state: "Controlled" },
  { name: "Bridge Standing Orders", rev: "Rev 07", owner: "Master", date: "01 Aug 2026", state: "Controlled" },
  { name: "SOPEP", rev: "Rev 11", owner: "C/O", date: "16 Jun 2026", state: "Controlled" },
  { name: "Shipboard Oil Pollution Emergency Contacts", rev: "Rev 03", owner: "C/O", date: "09 Aug 2026", state: "Review due" },
];

const checklists = [
  { name: "Pre-arrival bridge checklist", cadence: "Per arrival", owner: "Deck", completion: 96 },
  { name: "Weekly GMDSS test", cadence: "Weekly", owner: "Deck", completion: 100 },
  { name: "Engine room unmanned checklist", cadence: "Per UMS period", owner: "Engine", completion: 98 },
  { name: "Monthly LSA inspection", cadence: "Monthly", owner: "Deck", completion: 91 },
];

const crew = [
  { name: "A. Rivera", role: "Master", status: "On board", cert: "All current", relief: "18 Sep" },
  { name: "C. Ward", role: "Chief Mate", status: "On board", cert: "All current", relief: "18 Sep" },
  { name: "M. Patel", role: "Chief Engineer", status: "On board", cert: "Medical 42 d", relief: "18 Sep" },
  { name: "J. Santos", role: "2nd Engineer", status: "On board", cert: "All current", relief: "18 Sep" },
  { name: "R. Kim", role: "AB", status: "On board", cert: "BST 67 d", relief: "18 Sep" },
];

function Status({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}

function Card({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      <div className="card-head"><h3>{title}</h3>{action}</div>
      {children}
    </section>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone?: string }) {
  return <div className={`metric ${tone ?? ""}`}><div className="metric-label">{label}</div><strong>{value}</strong><div className="metric-note">{note}</div></div>;
}

function Dashboard() {
  return <>
    <div className="hero-grid">
      <section className="vessel-hero">
        <div className="eyebrow">ACTIVE VESSEL</div>
        <div className="vessel-line"><div><h1>M/V HARBOR SENTINEL</h1><p>IMO 9876543 · U.S. Flag · 4,820 GT</p></div><Status tone="good">Operational</Status></div>
        <div className="voyage-strip"><div><span>Current voyage</span><strong>Guam → Honolulu</strong></div><div><span>Phase</span><strong>At Sea</strong></div><div><span>ETA</span><strong>31 Aug · 0830</strong></div><div><span>Next port</span><strong>Pearl Harbor</strong></div></div>
      </section>
      <section className="readiness-card"><div className="eyebrow">VESSEL READINESS</div><div className="readiness-score"><strong>92</strong><span>/100</span></div><div className="bar"><i style={{ width: "92%" }} /></div><p>2 items require management attention.</p></section>
    </div>
    <div className="metric-grid"><Metric label="Maintenance" value="94%" note="3 due · 1 overdue" /><Metric label="Open defects" value="3" note="1 high risk" tone="amber" /><Metric label="Safety" value="98%" note="Checklists on time" /><Metric label="Inventory" value="2" note="Items below minimum" tone="amber" /></div>
    <div className="two-col">
      <Card title="Operational attention" action={<Link href="/issues">View all</Link>}>
        <div className="attention-list">
          <div className="attention high"><AlertTriangle size={18}/><div><strong>Fire damper indicator defect</strong><span>High risk · Engine Room · Parts ordered</span></div><b>DEF-088</b></div>
          <div className="attention"><Wrench size={18}/><div><strong>Radar scanner drain inspection overdue</strong><span>Due today · Assigned C/O</span></div><b>WO-1838</b></div>
          <div className="attention"><PackageSearch size={18}/><div><strong>Hydraulic oil below minimum stock</strong><span>65 L on hand · Minimum 80 L</span></div><b>STOCK</b></div>
        </div>
      </Card>
      <Card title="Upcoming work" action={<Link href="/work-orders">Work board</Link>}>
        <div className="compact-table">{workOrders.slice(0,4).map(w => <div className="compact-row" key={w.id}><div><strong>{w.id}</strong><span>{w.title}</span></div><Status tone={w.status === "Overdue" ? "bad" : w.priority === "High" ? "warn" : "neutral"}>{w.due}</Status></div>)}</div>
      </Card>
    </div>
    <div className="three-col">
      <Card title="Safety & compliance"><div className="ring-line"><ShieldCheck size={32}/><div><strong>Audit ready</strong><span>4 controlled documents due review within 60 days</span></div></div></Card>
      <Card title="Crew"><div className="ring-line"><Users size={32}/><div><strong>18 / 18 aboard</strong><span>2 credentials enter renewal window this quarter</span></div></div></Card>
      <Card title="Port readiness"><div className="ring-line"><Anchor size={32}/><div><strong>Pearl Harbor</strong><span>Arrival checklist opens in 3 d 18 h</span></div></div></Card>
    </div>
  </>;
}

function WorkOrders() {
  const [filter, setFilter] = useState("All");
  const rows = filter === "All" ? workOrders : workOrders.filter(w => w.status === filter || w.priority === filter);
  return <><PageTitle title="Work Orders" text="Plan, assign, execute, and close maintenance work with a traceable history." button="+ New work order" />
    <div className="filter-row">{["All","Overdue","Due","High"].map(f => <button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</div>
    <Card title={`${rows.length} work orders`}><DataTable heads={["ID","Work","Asset","Due","Owner","Priority","Status"]}>{rows.map(w=><tr key={w.id}><td className="mono">{w.id}</td><td><strong>{w.title}</strong></td><td>{w.asset}</td><td>{w.due}</td><td>{w.owner}</td><td><Status tone={w.priority==="High"?"warn":"neutral"}>{w.priority}</Status></td><td><Status tone={w.status==="Overdue"?"bad":w.status==="Due"?"warn":"good"}>{w.status}</Status></td></tr>)}</DataTable></Card></>;
}

function PMS() {
  return <><PageTitle title="Planned Maintenance" text="Equipment hierarchy, recurring jobs, running-hour tasks, and maintenance history." button="+ Maintenance task" />
    <div className="metric-grid"><Metric label="PMS compliance" value="94%" note="Rolling 30 days"/><Metric label="Due next 7 days" value="12" note="Across 7 systems"/><Metric label="Overdue" value="1" note="Bridge equipment" tone="amber"/><Metric label="Critical equipment" value="36" note="100% in date"/></div>
    <div className="two-col"><Card title="System health"><div className="system-list">{[["Main engines",98],["Generators",96],["Steering gear",100],["Bridge equipment",88],["LSA / FFA",97],["HVAC / Hotel",93]].map(([n,p])=><div className="system" key={String(n)}><div><strong>{n}</strong><span>{p}% current</span></div><div className="bar"><i style={{width:`${p}%`}}/></div></div>)}</div></Card><Card title="Maintenance calendar"><div className="calendar"><div className="calendar-head"><b>AUG 25</b><b>AUG 26</b><b>AUG 27</b><b>AUG 28</b><b>AUG 29</b></div>{["Radar drain · overdue","DG #2 weekly","ME cooling pump","Rescue boat falls","Freshwater test"].map((x,i)=><div className={`cal-item c${i}`} key={x}>{x}</div>)}</div></Card></div>
  </>;
}

function Issues() { return <><PageTitle title="Defects & Issues" text="Capture shipboard defects, assign risk, track corrective action, and preserve closure evidence." button="+ Report issue"/><Card title="Open defects"><DataTable heads={["ID","Issue","Area","Opened","Risk","Status"]}>{defects.map(d=><tr key={d.id}><td className="mono">{d.id}</td><td><strong>{d.title}</strong></td><td>{d.area}</td><td>{d.opened}</td><td><Status tone={d.risk==="High"?"bad":d.risk==="Medium"?"warn":"neutral"}>{d.risk}</Status></td><td>{d.status}</td></tr>)}</DataTable></Card></> }

function Inventory() { return <><PageTitle title="Inventory & Spares" text="Know what is aboard, where it lives, and what maintenance is depending on it." button="+ Add item"/><div className="metric-grid"><Metric label="Stock items" value="1,284" note="Across 22 locations"/><Metric label="Below minimum" value="2" note="Requisition suggested" tone="amber"/><Metric label="Open requisitions" value="5" note="$8,420 committed"/><Metric label="Critical spares" value="43" note="41 fully stocked"/></div><Card title="Stock watch"><DataTable heads={["Part","Location","On hand","Minimum","State"]}>{inventory.map(i=><tr key={i.part}><td><strong>{i.part}</strong></td><td>{i.location}</td><td>{i.onHand} {i.unit}</td><td>{i.min} {i.unit}</td><td><Status tone={i.onHand<i.min?"warn":"good"}>{i.onHand<i.min?"Reorder":"OK"}</Status></td></tr>)}</DataTable></Card></> }

function Documents() { return <><PageTitle title="Document Control" text="Controlled manuals, procedures, certificates, revisions, and review dates in one register." button="+ Upload document"/><Card title="Controlled library"><DataTable heads={["Document","Revision","Owner","Effective / reviewed","State"]}>{docs.map(d=><tr key={d.name}><td><FileText size={16}/><strong>{d.name}</strong></td><td>{d.rev}</td><td>{d.owner}</td><td>{d.date}</td><td><Status tone={d.state==="Review due"?"warn":"good"}>{d.state}</Status></td></tr>)}</DataTable></Card></> }

function Checklists() { return <><PageTitle title="Checklists & Inspections" text="Repeatable shipboard routines with completion evidence and exception capture." button="+ New template"/><div className="card-grid">{checklists.map(c=><Card key={c.name} title={c.name}><div className="check-card"><div><span>{c.cadence}</span><span>{c.owner}</span></div><strong>{c.completion}%</strong><div className="bar"><i style={{width:`${c.completion}%`}}/></div><button>Open template</button></div></Card>)}</div></> }

function Crew() { return <><PageTitle title="Crew & Credentials" text="Onboard roster, roles, relief dates, training, and certificate watch." button="+ Crew member"/><div className="metric-grid"><Metric label="On board" value="18" note="Minimum safe manning met"/><Metric label="Reliefs next 30d" value="6" note="Travel planning active"/><Metric label="Credential watch" value="2" note="Within 90 days" tone="amber"/><Metric label="Training overdue" value="0" note="All current"/></div><Card title="Current roster"><DataTable heads={["Name","Role","Status","Credential state","Planned relief"]}>{crew.map(c=><tr key={c.name}><td><strong>{c.name}</strong></td><td>{c.role}</td><td><Status tone="good">{c.status}</Status></td><td><Status tone={c.cert==="All current"?"good":"warn"}>{c.cert}</Status></td><td>{c.relief}</td></tr>)}</DataTable></Card></> }

function Voyages() { return <><PageTitle title="Voyages & Port Calls" text="A voyage workspace for route files, arrival/departure readiness, port tasks, and operational records." button="+ New voyage"/><div className="voyage-board"><Card title="Active voyage"><div className="active-voyage"><div><span>VOY 26-014</span><h2>Guam → Honolulu</h2><p>Departed 22 Aug 2026 · 0700 LT</p></div><Status tone="good">At Sea</Status></div><div className="voyage-progress"><i/><b>Guam</b><span>1,948 NM remaining</span><b>Pearl Harbor</b></div><div className="voyage-facts"><div><span>ETA</span><strong>31 Aug 0830</strong></div><div><span>Arrival checklist</span><strong>Not open</strong></div><div><span>Route file</span><strong>PEARL_FINAL.rtz</strong></div><div><span>Port notes</span><strong>6 items</strong></div></div></Card><Card title="Recent voyages"><div className="compact-table">{["Saipan → Guam","Yokohama → Saipan","Pearl Harbor → Yokohama","San Diego → Pearl Harbor"].map((v,i)=><div className="compact-row" key={v}><div><strong>VOY 26-0{13-i}</strong><span>{v}</span></div><Status tone="good">Complete</Status></div>)}</div></Card></div></> }

function Vessels() { return <><PageTitle title="Vessel Registry" text="Fleet-level view of vessel readiness, operating status, and key certificates." button="+ Add vessel"/><div className="vessel-cards"><Card title="M/V Harbor Sentinel"><div className="ship-card"><Ship size={48}/><div><Status tone="good">Operational</Status><p>U.S. Flag · IMO 9876543</p><div className="ship-stats"><span><b>92</b> readiness</span><span><b>3</b> defects</span><span><b>1</b> overdue</span></div></div></div></Card><Card title="Fleet onboarding"><div className="empty-state"><LifeBuoy size={38}/><strong>Harbor is fleet-ready</strong><p>Add another vessel to create separate asset trees, rosters, documents, maintenance plans, and voyage histories.</p><button>Add another vessel</button></div></Card></div></> }

function Reports() { return <><PageTitle title="Reports & Analytics" text="Operational health without spreadsheet archaeology." button="Export report"/><div className="metric-grid"><Metric label="Maintenance compliance" value="94.2%" note="+2.8 pts vs prior month"/><Metric label="Defect closure" value="5.4 d" note="Median open-to-close"/><Metric label="Checklist compliance" value="97.6%" note="Rolling 30 days"/><Metric label="Stock accuracy" value="98.9%" note="Last cycle count"/></div><div className="two-col"><Card title="90-day maintenance trend"><div className="bars">{[82,88,91,86,93,95,94,96,92,94,97,94].map((h,i)=><i key={i} style={{height:`${h}%`}}/> )}</div></Card><Card title="Operational risk mix"><div className="risk-stack"><div style={{width:"8%"}}>H</div><div style={{width:"27%"}}>M</div><div style={{width:"65%"}}>Low</div></div><p className="muted">Open items weighted by current risk assessment.</p></Card></div></> }

function Admin() { return <><PageTitle title="Administration" text="Roles, workflow defaults, vessel configuration, numbering, and audit controls."/><div className="settings-grid">{["Users & roles","Vessel configuration","Departments & ranks","Work order numbering","Checklist templates","Document categories","Notification rules","Audit log"].map(s=><button key={s}><Settings size={18}/><span>{s}</span><b>›</b></button>)}</div></> }

function PageTitle({ title, text, button }: { title: string; text: string; button?: string }) { return <div className="page-title"><div><div className="eyebrow">NAVDASH HARBOR</div><h1>{title}</h1><p>{text}</p></div>{button && <button className="primary">{button}</button>}</div> }
function DataTable({ heads, children }: { heads: string[]; children: React.ReactNode }) { return <div className="table-wrap"><table><thead><tr>{heads.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div> }

export function HarborApp({ module = "dashboard" }: HarborAppProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = useMemo(() => nav.find(n => pathname.includes(`/${n[0]}`))?.[0] ?? module, [pathname, module]);
  const body = {
    dashboard: <Dashboard/>, vessels: <Vessels/>, voyages: <Voyages/>, pms: <PMS/>, "work-orders": <WorkOrders/>, checklists: <Checklists/>, issues: <Issues/>, inventory: <Inventory/>, documents: <Documents/>, crew: <Crew/>, reports: <Reports/>, admin: <Admin/>,
  }[module];
  return <div className="harbor-shell">
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="brand"><div className="brand-mark">H</div><div><strong>NavDash</strong><span>HARBOR</span></div><button onClick={()=>setOpen(false)}><X size={20}/></button></div>
      <div className="ship-select"><Ship size={17}/><div><span>Active vessel</span><strong>Harbor Sentinel</strong></div></div>
      <nav>{nav.map(([key,label,Icon]) => <Link key={key} href={key==="dashboard"?"/dashboard":`/${key}`} className={current===key?"active":""} onClick={()=>setOpen(false)}><Icon size={18}/><span>{label}</span>{key==="issues" && <em>3</em>}</Link>)}</nav>
      <div className="sidebar-foot"><div className="sync-dot"/> Demo workspace · Local data</div>
    </aside>
    <main>
      <header><button className="menu" onClick={()=>setOpen(true)}><Menu size={21}/></button><div className="header-context"><span>M/V HARBOR SENTINEL</span><b>VOY 26-014 · AT SEA</b></div><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Harbor…"/></label><div className="user"><div>CW</div><span><b>Chief Mate</b><small>Deck · Admin</small></span></div></header>
      <div className="content">{query && <div className="search-banner">Search preview: <strong>{query}</strong><span>Global indexed search will connect when Harbor’s dedicated Supabase project is attached.</span></div>}{body}</div>
    </main>
  </div>;
}
