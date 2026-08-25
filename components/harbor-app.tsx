"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle, Anchor, BarChart3, Boxes, CheckCircle2, ClipboardCheck, FileText,
  Gauge, LogOut, Menu, PackageSearch, Plus, Search, Settings, ShieldCheck, Ship,
  Users, Wrench, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ModuleKey = "dashboard"|"vessels"|"voyages"|"pms"|"work-orders"|"checklists"|"issues"|"inventory"|"documents"|"crew"|"reports"|"admin";
type HarborAppProps = { module?: ModuleKey };
type Row = Record<string, any>;
type ModalKind = "work-order"|"defect"|"inventory"|"document"|"crew"|"maintenance"|"voyage"|"checklist"|null;

const nav = [
  ["dashboard","Command",Gauge],["vessels","Vessels",Ship],["voyages","Voyages",Anchor],
  ["pms","Maintenance",Wrench],["work-orders","Work Orders",ClipboardCheck],
  ["checklists","Checklists",CheckCircle2],["issues","Defects & Issues",AlertTriangle],
  ["inventory","Inventory",Boxes],["documents","Documents",FileText],["crew","Crew",Users],
  ["reports","Reports",BarChart3],["admin","Admin",Settings],
] as const;

const fmtDate = (v?: string|null) => v ? new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(v)) : "—";
const fmtDateTime = (v?: string|null) => v ? new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(v)) : "—";
const titleCase = (v?: string|null) => (v ?? "").replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const priorityTone = (p?: string) => p === "critical" || p === "urgent" ? "bad" : p === "important" ? "warn" : "neutral";

function Status({children,tone="neutral"}:{children:React.ReactNode;tone?:"good"|"warn"|"bad"|"neutral"}){return <span className={`status status-${tone}`}>{children}</span>}
function Card({title,action,children,className=""}:{title:string;action?:React.ReactNode;children:React.ReactNode;className?:string}){return <section className={`card ${className}`}><div className="card-head"><h3>{title}</h3>{action}</div>{children}</section>}
function Metric({label,value,note,tone}:{label:string;value:string|number;note:string;tone?:string}){return <div className={`metric ${tone??""}`}><div className="metric-label">{label}</div><strong>{value}</strong><div className="metric-note">{note}</div></div>}
function DataTable({heads,children}:{heads:string[];children:React.ReactNode}){return <div className="table-wrap"><table><thead><tr>{heads.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}
function PageTitle({title,text,button,onClick}:{title:string;text:string;button?:string;onClick?:()=>void}){return <div className="page-title"><div><div className="eyebrow">HARBOR OPERATIONS</div><h1>{title}</h1><p>{text}</p></div>{button&&<button className="primary-btn" onClick={onClick}><Plus size={16}/>{button}</button>}</div>}

export function HarborApp({module="dashboard"}:HarborAppProps){
  const pathname=usePathname();
  const supabase:any=useMemo(()=>createClient(),[]);
  const [mobile,setMobile]=useState(false);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [modal,setModal]=useState<ModalKind>(null);
  const [saving,setSaving]=useState(false);
  const [flash,setFlash]=useState("");
  const [user,setUser]=useState<Row|null>(null);
  const [profile,setProfile]=useState<Row|null>(null);
  const [membership,setMembership]=useState<Row|null>(null);
  const [vessel,setVessel]=useState<Row|null>(null);
  const [voyages,setVoyages]=useState<Row[]>([]);
  const [equipment,setEquipment]=useState<Row[]>([]);
  const [plans,setPlans]=useState<Row[]>([]);
  const [workOrders,setWorkOrders]=useState<Row[]>([]);
  const [defects,setDefects]=useState<Row[]>([]);
  const [inventory,setInventory]=useState<Row[]>([]);
  const [documents,setDocuments]=useState<Row[]>([]);
  const [crew,setCrew]=useState<Row[]>([]);
  const [credentials,setCredentials]=useState<Row[]>([]);
  const [checklists,setChecklists]=useState<Row[]>([]);

  async function load(){
    setLoading(true); setError("");
    const {data:{user:u}}=await supabase.auth.getUser();
    if(!u){window.location.href="/login";return}
    setUser(u);
    const [pr,vm]=await Promise.all([
      supabase.from("profiles").select("*").eq("id",u.id).maybeSingle(),
      supabase.from("vessel_members").select("*").eq("user_id",u.id).limit(1).maybeSingle(),
    ]);
    setProfile(pr.data); setMembership(vm.data);
    if(!vm.data){setError("This account is not assigned to a vessel.");setLoading(false);return}
    const vid=vm.data.vessel_id;
    const results=await Promise.all([
      supabase.from("vessels").select("*").eq("id",vid).single(),
      supabase.from("voyages").select("*").eq("vessel_id",vid).order("created_at",{ascending:false}),
      supabase.from("equipment").select("*").eq("vessel_id",vid).order("system"),
      supabase.from("work_orders").select("*").eq("vessel_id",vid).order("due_at",{ascending:true}),
      supabase.from("defects").select("*").eq("vessel_id",vid).order("created_at",{ascending:false}),
      supabase.from("inventory_items").select("*").eq("vessel_id",vid).order("name"),
      supabase.from("documents").select("*").eq("vessel_id",vid).order("title"),
      supabase.from("crew_members").select("*").eq("vessel_id",vid).order("rank"),
      supabase.from("checklist_instances").select("*").eq("vessel_id",vid).order("created_at",{ascending:false}),
    ]);
    const [v,vo,eq,wo,de,inv,doc,cr,cl]=results;
    setVessel(v.data); setVoyages(vo.data??[]); setEquipment(eq.data??[]); setWorkOrders(wo.data??[]); setDefects(de.data??[]); setInventory(inv.data??[]); setDocuments(doc.data??[]); setCrew(cr.data??[]); setChecklists(cl.data??[]);
    if(eq.data?.length){const p=await supabase.from("maintenance_plans").select("*").in("equipment_id",eq.data.map((x:Row)=>x.id)).order("next_due_at",{ascending:true});setPlans(p.data??[])}
    if(cr.data?.length){const c=await supabase.from("crew_credentials").select("*").in("crew_member_id",cr.data.map((x:Row)=>x.id)).order("expires_date",{ascending:true});setCredentials(c.data??[])}
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  const activeVoyage=voyages.find(v=>["underway","in_port","ready"].includes(v.status))??voyages[0];
  const openWO=workOrders.filter(w=>w.status!=="completed"&&w.status!=="cancelled");
  const overdueWO=openWO.filter(w=>w.due_at&&new Date(w.due_at)<new Date());
  const openDefects=defects.filter(d=>!['resolved','closed'].includes(d.status));
  const lowStock=inventory.filter(i=>Number(i.quantity)<Number(i.minimum_quantity));
  const aboard=crew.filter(c=>c.aboard);
  const dueCreds=credentials.filter(c=>c.expires_date&&new Date(c.expires_date).getTime()<Date.now()+90*86400000);
  const readiness=Math.max(0,100-Math.min(40,overdueWO.length*7+openDefects.filter(d=>['urgent','critical'].includes(d.priority)).length*12+lowStock.length*4));
  const q=search.toLowerCase();
  const match=(...values:any[])=>!q||values.some(v=>String(v??"").toLowerCase().includes(q));

  async function mutate(table:string,payload:Row){
    setSaving(true);setFlash("");
    const {error:e}=await supabase.from(table).insert(payload);
    setSaving(false);
    if(e){setFlash(e.message);return false}
    setModal(null);setFlash("Saved to Harbor.");await load();return true;
  }
  async function update(table:string,id:string,changes:Row){
    setSaving(true);const {error:e}=await supabase.from(table).update(changes).eq("id",id);setSaving(false);
    if(e){setFlash(e.message);return}setFlash("Harbor updated.");await load();
  }
  async function logout(){await supabase.auth.signOut();window.location.href="/login"}

  if(loading)return <div className="min-h-screen grid place-items-center bg-[#07131f] text-white"><div className="text-center"><Anchor className="mx-auto mb-4"/><strong>Loading Harbor operations…</strong></div></div>;

  const content:Record<ModuleKey,React.ReactNode>={
    dashboard:<Dashboard/>,vessels:<Vessels/>,voyages:<Voyages/>,pms:<PMS/>,"work-orders":<WorkOrders/>,checklists:<Checklists/>,issues:<Issues/>,inventory:<Inventory/>,documents:<Documents/>,crew:<Crew/>,reports:<Reports/>,admin:<Admin/>,
  };

  return <div className="harbor-shell">
    <aside className={`sidebar ${mobile?"open":""}`}>
      <div className="brand"><div className="brand-mark">H</div><div><strong>NavDash</strong><span>HARBOR</span></div><button onClick={()=>setMobile(false)}><X size={20}/></button></div>
      <div className="ship-select"><Ship size={17}/><div><span>Active vessel</span><strong>{vessel?.name??"Harbor"}</strong></div></div>
      <nav>{nav.map(([key,label,Icon])=><Link key={key} href={`/${key}`} className={pathname===`/${key}`?"active":""}><Icon size={18}/><span>{label}</span>{key==="issues"&&openDefects.length>0?<em>{openDefects.length}</em>:null}</Link>)}</nav>
      <div className="sidebar-foot"><div className="sync-dot"/> Live · Supabase secured</div>
    </aside>
    <main>
      <header><button className="menu" onClick={()=>setMobile(true)}><Menu size={21}/></button><div className="header-context"><span>{vessel?.name?.toUpperCase()??"HARBOR"}</span><b>{activeVoyage?`${activeVoyage.voyage_number} · ${titleCase(activeVoyage.status)}`:"NO ACTIVE VOYAGE"}</b></div><label className="search"><Search size={17}/><input placeholder="Search Harbor…" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="user"><div>{(profile?.display_name??user?.email??"H").slice(0,2).toUpperCase()}</div><span><b>{profile?.display_name??user?.email}</b><small>{membership?.shipboard_role??"Harbor user"}</small></span><button title="Sign out" onClick={logout}><LogOut size={16}/></button></div></header>
      <div className="content">{error&&<div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}{flash&&<div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">{flash}</div>}{content[module]}</div>
    </main>
    {modal&&<EntryModal kind={modal} vesselId={vessel?.id} equipment={equipment} saving={saving} onClose={()=>setModal(null)} onSave={mutate}/>} 
  </div>;

  function Dashboard(){return <>
    <div className="hero-grid"><section className="vessel-hero"><div className="eyebrow">ACTIVE VESSEL</div><div className="vessel-line"><div><h1>{vessel?.name}</h1><p>{vessel?.imo_number?`IMO ${vessel.imo_number} · `:""}{vessel?.flag??"Flag not set"} · {vessel?.gross_tonnage?`${vessel.gross_tonnage.toLocaleString()} GT`:"GT not set"}</p></div><Status tone="good">{titleCase(vessel?.status??"operational")}</Status></div><div className="voyage-strip"><div><span>Current voyage</span><strong>{activeVoyage?`${activeVoyage.origin} → ${activeVoyage.destination}`:"No active voyage"}</strong></div><div><span>Phase</span><strong>{titleCase(activeVoyage?.status??"planning")}</strong></div><div><span>ETA</span><strong>{fmtDateTime(activeVoyage?.eta)}</strong></div><div><span>Next port</span><strong>{activeVoyage?.destination??"—"}</strong></div></div></section><section className="readiness-card"><div className="eyebrow">VESSEL READINESS</div><div className="readiness-score"><strong>{readiness}</strong><span>/100</span></div><div className="bar"><i style={{width:`${readiness}%`}}/></div><p>{overdueWO.length+openDefects.length+lowStock.length} active attention items.</p></section></div>
    <div className="metric-grid"><Metric label="Open work" value={openWO.length} note={`${overdueWO.length} overdue`} tone={overdueWO.length?"amber":""}/><Metric label="Open defects" value={openDefects.length} note={`${openDefects.filter(d=>['urgent','critical'].includes(d.priority)).length} high risk`} tone={openDefects.length?"amber":""}/><Metric label="Crew aboard" value={aboard.length} note={`${dueCreds.length} credentials in renewal window`}/><Metric label="Inventory" value={lowStock.length} note="Items below minimum" tone={lowStock.length?"amber":""}/></div>
    <div className="two-col"><Card title="Operational attention" action={<Link href="/issues">View all</Link>}><div className="attention-list">{openDefects.slice(0,2).map(d=><div className={`attention ${['urgent','critical'].includes(d.priority)?"high":""}`} key={d.id}><AlertTriangle size={18}/><div><strong>{d.title}</strong><span>{titleCase(d.priority)} · {d.department} · {titleCase(d.status)}</span></div><b>{d.defect_no}</b></div>)}{overdueWO.slice(0,1).map(w=><div className="attention" key={w.id}><Wrench size={18}/><div><strong>{w.title}</strong><span>Overdue · {w.department}</span></div><b>{w.work_order_no}</b></div>)}{lowStock.slice(0,1).map(i=><div className="attention" key={i.id}><PackageSearch size={18}/><div><strong>{i.name} below minimum</strong><span>{i.quantity} {i.unit} aboard · minimum {i.minimum_quantity}</span></div><b>STOCK</b></div>)}</div></Card><Card title="Upcoming work" action={<Link href="/work-orders">Work board</Link>}><div className="compact-table">{openWO.slice(0,5).map(w=><div className="compact-row" key={w.id}><div><strong>{w.work_order_no}</strong><span>{w.title}</span></div><Status tone={w.due_at&&new Date(w.due_at)<new Date()?"bad":priorityTone(w.priority)}>{fmtDate(w.due_at)}</Status></div>)}</div></Card></div>
    <div className="three-col"><Card title="Safety & compliance"><div className="ring-line"><ShieldCheck size={32}/><div><strong>{documents.length} controlled records</strong><span>{documents.filter(d=>d.review_due&&new Date(d.review_due).getTime()<Date.now()+60*86400000).length} due review within 60 days</span></div></div></Card><Card title="Crew"><div className="ring-line"><Users size={32}/><div><strong>{aboard.length} aboard</strong><span>{dueCreds.length} credentials approaching expiry</span></div></div></Card><Card title="Port readiness"><div className="ring-line"><Anchor size={32}/><div><strong>{activeVoyage?.destination??"No port selected"}</strong><span>{activeVoyage?.eta?`ETA ${fmtDateTime(activeVoyage.eta)}`:"Voyage planning required"}</span></div></div></Card></div>
  </>}

  function Vessels(){return <><PageTitle title="Vessel Registry" text="Ship particulars and operating status for the Harbor fleet."/><div className="card-grid"><Card title={vessel?.name??"Vessel"}><div className="detail-grid"><Detail l="Status" v={titleCase(vessel?.status)}/><Detail l="IMO" v={vessel?.imo_number}/><Detail l="Official No." v={vessel?.official_number}/><Detail l="Call sign" v={vessel?.call_sign}/><Detail l="Flag" v={vessel?.flag}/><Detail l="Class" v={vessel?.class_society}/><Detail l="Type" v={vessel?.vessel_type}/><Detail l="Year built" v={vessel?.year_built}/></div></Card><Card title="Operating picture"><div className="metric-grid one"><Metric label="Equipment" value={equipment.length} note={`${equipment.filter(e=>e.critical).length} critical assets`}/><Metric label="Open work" value={openWO.length} note={`${overdueWO.length} overdue`}/><Metric label="Defects" value={openDefects.length} note="Active defect register"/><Metric label="Crew aboard" value={aboard.length} note="Current assignment"/></div></Card></div></>}

  function Voyages(){const rows=voyages.filter(v=>match(v.voyage_number,v.origin,v.destination,v.status));return <><PageTitle title="Voyages & Port Calls" text="Track voyage status, ETD/ETA, ports, and completion history." button="New voyage" onClick={()=>setModal("voyage")}/><Card title={`${rows.length} voyages`}><DataTable heads={["Voyage","Route","ETD","ETA","Status"]}>{rows.map(v=><tr key={v.id}><td className="mono"><strong>{v.voyage_number}</strong></td><td>{v.origin} → {v.destination}</td><td>{fmtDateTime(v.etd)}</td><td>{fmtDateTime(v.eta)}</td><td><Status tone={v.status==="underway"?"good":"neutral"}>{titleCase(v.status)}</Status></td></tr>)}</DataTable></Card></>}

  function PMS(){const due=plans.filter(p=>p.next_due_at&&new Date(p.next_due_at)<new Date(Date.now()+7*86400000));return <><PageTitle title="Planned Maintenance" text="Equipment hierarchy, recurring jobs, running-hour tasks, and due-date control." button="Maintenance plan" onClick={()=>setModal("maintenance")}/><div className="metric-grid"><Metric label="Equipment" value={equipment.length} note={`${equipment.filter(e=>e.critical).length} critical`}/><Metric label="Active plans" value={plans.filter(p=>p.active).length} note="Recurring maintenance"/><Metric label="Due next 7 days" value={due.length} note="Calendar based" tone={due.length?"amber":""}/><Metric label="Running hours" value={Math.round(equipment.reduce((s,e)=>s+Number(e.running_hours||0),0)).toLocaleString()} note="Tracked equipment hours"/></div><Card title="Maintenance schedule"><DataTable heads={["Equipment","Maintenance","Interval","Next due","Priority"]}>{plans.filter(p=>match(p.title)).map(p=>{const eq=equipment.find(e=>e.id===p.equipment_id);return <tr key={p.id}><td>{eq?.name??"Equipment"}</td><td><strong>{p.title}</strong></td><td>{p.interval_days?`${p.interval_days} days`:p.interval_hours?`${p.interval_hours} h`:"Condition"}</td><td>{fmtDate(p.next_due_at)}</td><td><Status tone={priorityTone(p.priority)}>{titleCase(p.priority)}</Status></td></tr>})}</DataTable></Card></>}

  function WorkOrders(){const rows=workOrders.filter(w=>match(w.work_order_no,w.title,w.department,w.status,w.priority));return <><PageTitle title="Work Orders" text="Plan, execute, defer, and close shipboard work with traceable status." button="New work order" onClick={()=>setModal("work-order")}/><div className="metric-grid"><Metric label="Open" value={openWO.length} note="All departments"/><Metric label="Overdue" value={overdueWO.length} note="Past due date" tone={overdueWO.length?"amber":""}/><Metric label="In progress" value={workOrders.filter(w=>w.status==="in_progress").length} note="Currently being worked"/><Metric label="Completed" value={workOrders.filter(w=>w.status==="completed").length} note="Closed history"/></div><Card title={`${rows.length} work orders`}><DataTable heads={["ID","Work","Department","Due","Priority","Status","Action"]}>{rows.map(w=><tr key={w.id}><td className="mono">{w.work_order_no}</td><td><strong>{w.title}</strong></td><td>{titleCase(w.department)}</td><td>{fmtDate(w.due_at)}</td><td><Status tone={priorityTone(w.priority)}>{titleCase(w.priority)}</Status></td><td><Status tone={w.status==="completed"?"good":w.due_at&&new Date(w.due_at)<new Date()?"bad":"neutral"}>{titleCase(w.status)}</Status></td><td>{w.status!=="completed"&&<button className="text-btn" onClick={()=>update("work_orders",w.id,{status:"completed",completed_at:new Date().toISOString()})}>Complete</button>}</td></tr>)}</DataTable></Card></>}

  function Issues(){const rows=defects.filter(d=>match(d.defect_no,d.title,d.department,d.priority,d.status));return <><PageTitle title="Defects & Issues" text="Capture defects, assign risk, track corrective action, and preserve closure." button="Report issue" onClick={()=>setModal("defect")}/><Card title={`${openDefects.length} open defects`}><DataTable heads={["ID","Issue","Department","Risk","Status","Target","Action"]}>{rows.map(d=><tr key={d.id}><td className="mono">{d.defect_no}</td><td><strong>{d.title}</strong></td><td>{titleCase(d.department)}</td><td><Status tone={priorityTone(d.priority)}>{titleCase(d.priority)}</Status></td><td>{titleCase(d.status)}</td><td>{fmtDate(d.target_date)}</td><td>{!['resolved','closed'].includes(d.status)&&<button className="text-btn" onClick={()=>update("defects",d.id,{status:"resolved",resolved_at:new Date().toISOString()})}>Resolve</button>}</td></tr>)}</DataTable></Card></>}

  function Inventory(){const rows=inventory.filter(i=>match(i.name,i.sku,i.location,i.category));return <><PageTitle title="Inventory & Spares" text="Track shipboard stock, critical spares, minimum levels, and consumption." button="Add item" onClick={()=>setModal("inventory")}/><div className="metric-grid"><Metric label="Stock items" value={inventory.length} note="Tracked SKUs"/><Metric label="Below minimum" value={lowStock.length} note="Reorder attention" tone={lowStock.length?"amber":""}/><Metric label="Critical spares" value={inventory.filter(i=>i.critical_spare).length} note="Protected stock"/><Metric label="Stock value" value={`$${Math.round(inventory.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.unit_cost||0),0)).toLocaleString()}`} note="Estimated on-hand value"/></div><Card title="Stock register"><DataTable heads={["Item","Location","On hand","Minimum","State","Adjust"]}>{rows.map(i=><tr key={i.id}><td><strong>{i.name}</strong><small className="block text-slate-400">{i.sku??""}</small></td><td>{i.location??"—"}</td><td>{i.quantity} {i.unit}</td><td>{i.minimum_quantity} {i.unit}</td><td><Status tone={Number(i.quantity)<Number(i.minimum_quantity)?"warn":"good"}>{Number(i.quantity)<Number(i.minimum_quantity)?"Reorder":"OK"}</Status></td><td><button className="text-btn" onClick={()=>update("inventory_items",i.id,{quantity:Number(i.quantity)+1})}>+1</button> <button className="text-btn" onClick={()=>update("inventory_items",i.id,{quantity:Math.max(0,Number(i.quantity)-1)})}>−1</button></td></tr>)}</DataTable></Card></>}

  function Documents(){const rows=documents.filter(d=>match(d.title,d.document_number,d.category,d.revision));return <><PageTitle title="Document Control" text="Controlled manuals, procedures, certificates, revisions, and review dates." button="Register document" onClick={()=>setModal("document")}/><Card title="Controlled library"><DataTable heads={["Document","Number","Revision","Category","Review due","State"]}>{rows.map(d=><tr key={d.id}><td><strong>{d.title}</strong></td><td>{d.document_number??"—"}</td><td>{d.revision??"—"}</td><td>{d.category??"—"}</td><td>{fmtDate(d.review_due)}</td><td><Status tone={d.review_due&&new Date(d.review_due)<new Date(Date.now()+60*86400000)?"warn":"good"}>{d.status}</Status></td></tr>)}</DataTable></Card></>}

  function Crew(){const rows=crew.filter(c=>match(c.full_name,c.rank,c.department,c.nationality));return <><PageTitle title="Crew & Credentials" text="Shipboard assignment, sign-off planning, and certificate expiry control." button="Add crew member" onClick={()=>setModal("crew")}/><div className="metric-grid"><Metric label="Aboard" value={aboard.length} note="Current complement"/><Metric label="Credentials" value={credentials.length} note="Tracked certificates"/><Metric label="Renewal window" value={dueCreds.length} note="Next 90 days" tone={dueCreds.length?"amber":""}/><Metric label="Departments" value={new Set(crew.map(c=>c.department).filter(Boolean)).size} note="Active onboard"/></div><Card title="Crew list"><DataTable heads={["Name","Rank","Department","Status","Sign off","Credential watch"]}>{rows.map(c=>{const cc=credentials.filter(x=>x.crew_member_id===c.id);const due=cc.filter(x=>x.expires_date&&new Date(x.expires_date).getTime()<Date.now()+90*86400000);return <tr key={c.id}><td><strong>{c.full_name}</strong></td><td>{c.rank}</td><td>{titleCase(c.department)}</td><td><Status tone={c.aboard?"good":"neutral"}>{c.aboard?"Aboard":"Ashore"}</Status></td><td>{fmtDate(c.sign_off_due)}</td><td><Status tone={due.length?"warn":"good"}>{due.length?`${due.length} renewal due`:"Current"}</Status></td></tr>})}</DataTable></Card></>}

  function Checklists(){const rows=checklists.filter(c=>match(c.title,c.status));return <><PageTitle title="Checklists & Inspections" text="Operational routines with due dates, completion status, and evidence." button="New checklist" onClick={()=>setModal("checklist")}/><div className="card-grid">{rows.length?rows.map(c=><Card key={c.id} title={c.title}><div className="check-card"><div><span>Due</span><strong>{fmtDateTime(c.due_at)}</strong></div><div><span>Status</span><Status tone={c.status==="completed"?"good":"warn"}>{titleCase(c.status)}</Status></div>{c.status!=="completed"&&<button className="secondary-btn" onClick={()=>update("checklist_instances",c.id,{status:"completed",completed_at:new Date().toISOString(),completed_by:user?.id})}>Complete checklist</button>}</div></Card>):<Card title="No active checklists"><p className="p-4 text-sm text-slate-500">Create the first operational checklist instance.</p></Card>}</div></>}

  function Reports(){return <><PageTitle title="Reports & Analytics" text="A management view of readiness, work backlog, defects, stock, and certification risk."/><div className="metric-grid"><Metric label="Readiness" value={`${readiness}%`} note="Composite operational score"/><Metric label="Backlog" value={openWO.length} note={`${overdueWO.length} overdue`}/><Metric label="Defect load" value={openDefects.length} note={`${openDefects.filter(d=>['urgent','critical'].includes(d.priority)).length} urgent/critical`}/><Metric label="Supply risk" value={lowStock.length} note="Below minimum"/></div><div className="two-col"><Card title="Department work backlog"><div className="system-list">{["deck","engine","admin"].map(dep=>{const n=openWO.filter(w=>w.department===dep).length;const pct=openWO.length?Math.round(n/openWO.length*100):0;return <div className="system" key={dep}><div><strong>{titleCase(dep)}</strong><span>{n} open work orders</span></div><div className="bar"><i style={{width:`${pct}%`}}/></div></div>})}</div></Card><Card title="Operational risk register"><div className="attention-list">{openDefects.map(d=><div className={`attention ${['urgent','critical'].includes(d.priority)?"high":""}`} key={d.id}><AlertTriangle size={18}/><div><strong>{d.title}</strong><span>{titleCase(d.priority)} · {titleCase(d.status)}</span></div><b>{d.defect_no}</b></div>)}</div></Card></div></>}

  function Admin(){return <><PageTitle title="Administration" text="Installation identity, access scope, and connected Harbor services."/><div className="two-col"><Card title="Current user"><div className="detail-grid"><Detail l="Name" v={profile?.full_name??profile?.display_name}/><Detail l="Email" v={user?.email}/><Detail l="Shipboard role" v={membership?.shipboard_role}/><Detail l="Department" v={titleCase(membership?.department)}/></div></Card><Card title="System health"><div className="attention-list"><div className="attention"><ShieldCheck size={18}/><div><strong>Supabase RLS</strong><span>Vessel and organization access policies active</span></div><Status tone="good">Secure</Status></div><div className="attention"><Ship size={18}/><div><strong>Vessel binding</strong><span>{vessel?.name}</span></div><Status tone="good">Active</Status></div><div className="attention"><FileText size={18}/><div><strong>Data store</strong><span>Dedicated Harbor project</span></div><Status tone="good">Online</Status></div></div></Card></div></>}
}

function Detail({l,v}:{l:string;v:any}){return <div><span className="text-xs uppercase tracking-wider text-slate-400">{l}</span><strong className="mt-1 block text-slate-800">{v??"—"}</strong></div>}

function EntryModal({kind,vesselId,equipment,saving,onClose,onSave}:{kind:Exclude<ModalKind,null>;vesselId?:string;equipment:Row[];saving:boolean;onClose:()=>void;onSave:(table:string,payload:Row)=>Promise<boolean>}){
  const [f,setF]=useState<Row>({});
  const set=(k:string,v:any)=>setF(x=>({...x,[k]:v}));
  async function submit(e:React.FormEvent){e.preventDefault();if(!vesselId)return;
    if(kind==="work-order")await onSave("work_orders",{vessel_id:vesselId,work_order_no:`WO-${Date.now().toString().slice(-6)}`,title:f.title,department:f.department||"deck",priority:f.priority||"routine",status:"open",due_at:f.due_at||null});
    if(kind==="defect")await onSave("defects",{vessel_id:vesselId,defect_no:`DEF-${Date.now().toString().slice(-5)}`,title:f.title,department:f.department||"deck",priority:f.priority||"routine",status:"open",target_date:f.target_date||null,description:f.description||null});
    if(kind==="inventory")await onSave("inventory_items",{vessel_id:vesselId,name:f.name,sku:f.sku||null,category:f.category||null,location:f.location||null,quantity:Number(f.quantity||0),minimum_quantity:Number(f.minimum_quantity||0),unit:f.unit||"ea",critical_spare:Boolean(f.critical_spare)});
    if(kind==="document")await onSave("documents",{vessel_id:vesselId,organization_id:f.organization_id||undefined,title:f.title,document_number:f.document_number||null,revision:f.revision||null,category:f.category||null,review_due:f.review_due||null,status:"controlled"});
    if(kind==="crew")await onSave("crew_members",{vessel_id:vesselId,organization_id:f.organization_id||undefined,full_name:f.full_name,rank:f.rank,department:f.department||"deck",nationality:f.nationality||null,aboard:true,sign_off_due:f.sign_off_due||null});
    if(kind==="maintenance")await onSave("maintenance_plans",{equipment_id:f.equipment_id,title:f.title,interval_days:f.interval_days?Number(f.interval_days):null,next_due_at:f.next_due_at||null,priority:f.priority||"routine",active:true});
    if(kind==="voyage")await onSave("voyages",{vessel_id:vesselId,voyage_number:f.voyage_number,origin:f.origin,destination:f.destination,etd:f.etd||null,eta:f.eta||null,status:"planning"});
    if(kind==="checklist")await onSave("checklist_instances",{vessel_id:vesselId,title:f.title,status:"open",due_at:f.due_at||null});
  }
  const title={"work-order":"New work order",defect:"Report defect",inventory:"Add inventory item",document:"Register document",crew:"Add crew member",maintenance:"Create maintenance plan",voyage:"Create voyage",checklist:"Create checklist"}[kind];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700">Harbor entry</div><h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2></div><button type="button" onClick={onClose}><X/></button></div>
    {(kind==="work-order"||kind==="defect")&&<><Input label="Title" onChange={v=>set("title",v)}/><Select label="Department" onChange={v=>set("department",v)} options={["deck","engine","admin"]}/><Select label="Priority" onChange={v=>set("priority",v)} options={["low","routine","important","urgent","critical"]}/><Input type="date" label={kind==="defect"?"Target date":"Due date"} onChange={v=>set(kind==="defect"?"target_date":"due_at",v)}/>{kind==="defect"&&<Input label="Description" onChange={v=>set("description",v)}/>}</>}
    {kind==="inventory"&&<><Input label="Item name" onChange={v=>set("name",v)}/><div className="grid grid-cols-2 gap-3"><Input label="SKU" onChange={v=>set("sku",v)}/><Input label="Location" onChange={v=>set("location",v)}/><Input type="number" label="Quantity" onChange={v=>set("quantity",v)}/><Input type="number" label="Minimum" onChange={v=>set("minimum_quantity",v)}/></div><Input label="Unit" placeholder="ea, L, m…" onChange={v=>set("unit",v)}/></>}
    {kind==="document"&&<><Input label="Title" onChange={v=>set("title",v)}/><div className="grid grid-cols-2 gap-3"><Input label="Document number" onChange={v=>set("document_number",v)}/><Input label="Revision" onChange={v=>set("revision",v)}/><Input label="Category" onChange={v=>set("category",v)}/><Input type="date" label="Review due" onChange={v=>set("review_due",v)}/></div></>}
    {kind==="crew"&&<><Input label="Full name" onChange={v=>set("full_name",v)}/><div className="grid grid-cols-2 gap-3"><Input label="Rank / position" onChange={v=>set("rank",v)}/><Select label="Department" onChange={v=>set("department",v)} options={["deck","engine","hotel","admin"]}/><Input label="Nationality" onChange={v=>set("nationality",v)}/><Input type="date" label="Sign-off due" onChange={v=>set("sign_off_due",v)}/></div></>}
    {kind==="maintenance"&&<><Select label="Equipment" onChange={v=>set("equipment_id",v)} options={equipment.map(e=>e.id)} labels={equipment.map(e=>`${e.system} · ${e.name}`)}/><Input label="Plan title" onChange={v=>set("title",v)}/><div className="grid grid-cols-2 gap-3"><Input type="number" label="Interval days" onChange={v=>set("interval_days",v)}/><Input type="date" label="Next due" onChange={v=>set("next_due_at",v)}/></div><Select label="Priority" onChange={v=>set("priority",v)} options={["low","routine","important","urgent","critical"]}/></>}
    {kind==="voyage"&&<><Input label="Voyage number" placeholder="VOY 26-015" onChange={v=>set("voyage_number",v)}/><div className="grid grid-cols-2 gap-3"><Input label="Origin" onChange={v=>set("origin",v)}/><Input label="Destination" onChange={v=>set("destination",v)}/><Input type="datetime-local" label="ETD" onChange={v=>set("etd",v)}/><Input type="datetime-local" label="ETA" onChange={v=>set("eta",v)}/></div></>}
    {kind==="checklist"&&<><Input label="Checklist title" onChange={v=>set("title",v)}/><Input type="datetime-local" label="Due" onChange={v=>set("due_at",v)}/></>}
    <div className="mt-6 flex justify-end gap-3"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={saving}>{saving?"Saving…":"Save to Harbor"}</button></div>
  </form></div>
}

function Input({label,type="text",placeholder,onChange}:{label:string;type?:string;placeholder?:string;onChange:(v:string)=>void}){return <label className="mb-3 block text-sm font-semibold text-slate-700">{label}<input required={label!=="SKU"&&label!=="Location"&&label!=="Nationality"&&label!=="Description"&&label!=="Category"&&label!=="Revision"&&label!=="Document number"&&label!=="Review due"&&label!=="Target date"&&label!=="Due date"&&label!=="ETD"&&label!=="ETA"&&label!=="Sign-off due"&&label!=="Next due"} type={type} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"/></label>}
function Select({label,options,labels,onChange}:{label:string;options:string[];labels?:string[];onChange:(v:string)=>void}){return <label className="mb-3 block text-sm font-semibold text-slate-700">{label}<select required onChange={e=>onChange(e.target.value)} defaultValue="" className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-cyan-600"><option value="" disabled>Select…</option>{options.map((o,i)=><option key={o} value={o}>{labels?.[i]??titleCase(o)}</option>)}</select></label>}
