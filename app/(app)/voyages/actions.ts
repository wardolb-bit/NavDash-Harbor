"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { requireRole } from "@/lib/rbac";
import { parseRouteWaypoints } from "@/lib/route-parser";
import type { HazardPriority, HazardStatus, RouteFileType, Voyage, VoyagePhase, VoyageStatus } from "@/lib/types";

const statusValues: VoyageStatus[] = ["Draft", "Active", "Complete"];
const phaseValues: VoyagePhase[] = ["Planning", "Pre-Departure", "Underway", "Pre-Arrival", "Complete"];
const routeFileTypes: RouteFileType[] = ["RTZ", "XML", "CSV", "GPX", "KML"];
const hazardPriorities: HazardPriority[] = ["Routine", "Important", "Urgent", "Safety Critical"];
const hazardStatuses: HazardStatus[] = ["Active", "Monitoring", "Resolved"];

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function cleanDate(value: FormDataEntryValue | null) {
  const text = clean(value);
  return text ? new Date(text).toISOString() : null;
}

function fileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function asStatus(value: FormDataEntryValue | null): VoyageStatus {
  const text = String(value ?? "Draft");
  return statusValues.includes(text as VoyageStatus) ? (text as VoyageStatus) : "Draft";
}

function asPhase(value: FormDataEntryValue | null): VoyagePhase {
  const text = String(value ?? "Planning");
  return phaseValues.includes(text as VoyagePhase) ? (text as VoyagePhase) : "Planning";
}

function asRouteFileType(fileName: string): RouteFileType | null {
  const extension = fileExtension(fileName);
  return routeFileTypes.includes(extension as RouteFileType) ? (extension as RouteFileType) : null;
}

function asHazardPriority(value: FormDataEntryValue | null): HazardPriority {
  const text = String(value ?? "Routine");
  return hazardPriorities.includes(text as HazardPriority) ? (text as HazardPriority) : "Routine";
}

function asHazardStatus(value: FormDataEntryValue | null): HazardStatus {
  const text = String(value ?? "Active");
  return hazardStatuses.includes(text as HazardStatus) ? (text as HazardStatus) : "Active";
}

function voyageNumber() {
  const now = new Date();
  const parts = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ];

  return `VOY-${parts.join("")}`;
}

export async function createVoyage(formData: FormData) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const title = clean(formData.get("name"));

  if (!title) {
    redirect("/voyages/new?error=missing-name");
  }

  const vesselName = clean(formData.get("vessel_id")) ?? title;
  const supabase = await createClient();
  const { data, error } = await (supabase.from("voyages") as any).insert({
    voyage_number: voyageNumber(),
    vessel_name: vesselName,
    title,
    origin: clean(formData.get("departure_port")),
    destination: clean(formData.get("arrival_port")),
    etd: cleanDate(formData.get("etd")),
    eta: cleanDate(formData.get("eta")),
    status: asStatus(formData.get("status")),
    phase: asPhase(formData.get("phase")),
    created_by: profile.id,
    updated_by: profile.id,
  }).select("id").single();

  if (error) {
    redirect(`/voyages/new?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.id) {
    await (supabase.from("voyage_assignments") as any).insert({
      voyage_id: data.id,
      user_id: profile.id,
      role: profile.role,
    });
  }

  revalidatePath("/voyages");
  redirect("/voyages");
}

export async function updateVoyage(voyageId: string, formData: FormData) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const role = profile.role;
  const title = clean(formData.get("name"));

  if (!title) {
    redirect(`/voyages/${voyageId}?error=missing-name`);
  }

  const payload: {
    vessel_name: string;
    title: string;
    origin: string | null;
    destination: string | null;
    etd: string | null;
    eta: string | null;
    updated_by: string;
    status?: VoyageStatus;
    phase?: VoyagePhase;
  } = {
    vessel_name: clean(formData.get("vessel_id")) ?? title,
    title,
    origin: clean(formData.get("departure_port")),
    destination: clean(formData.get("arrival_port")),
    etd: cleanDate(formData.get("etd")),
    eta: cleanDate(formData.get("eta")),
    updated_by: profile.id,
  };

  if (role === "admin") {
    payload.status = asStatus(formData.get("status"));
    payload.phase = asPhase(formData.get("phase"));
  }

  const supabase = await createClient();
  const { error } = await (supabase.from("voyages") as any).update(payload).eq("id", voyageId);

  if (error) {
    redirect(`/voyages/${voyageId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/voyages");
  revalidatePath(`/voyages/${voyageId}`);
  redirect(`/voyages/${voyageId}`);
}

export async function deleteVoyage(voyageId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await (supabase.from("voyages") as any).delete().eq("id", voyageId);

  if (error) {
    redirect(`/voyages/${voyageId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/voyages");
  redirect("/voyages");
}

export async function uploadRouteFile(voyageId: string, formData: FormData) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const file = formData.get("route_file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/voyages/${voyageId}?tab=route&error=missing-route-file`);
  }

  const fileType = asRouteFileType(file.name);

  if (!fileType) {
    redirect(`/voyages/${voyageId}?tab=route&error=unsupported-route-file`);
  }

  const supabase = await createClient();
  const storagePath = `${voyageId}/route/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("voyages").upload(storagePath, file, { upsert: true });

  if (uploadError) {
    redirect(`/voyages/${voyageId}?tab=route&error=${encodeURIComponent(uploadError.message)}`);
  }

  await (supabase.from("voyage_route_files") as any).update({ is_current: false, replaced_at: new Date().toISOString() }).eq("voyage_id", voyageId);
  const { data: routeFile, error: routeError } = await (supabase.from("voyage_route_files") as any).insert({
    voyage_id: voyageId,
    file_name: file.name,
    file_type: fileType,
    storage_path: storagePath,
    uploaded_by: profile.id,
    is_current: true,
  }).select("id").single();

  if (routeError) {
    redirect(`/voyages/${voyageId}?tab=route&error=${encodeURIComponent(routeError.message)}`);
  }

  const text = await file.text();
  const waypoints = parseRouteWaypoints(text, fileType).map((waypoint) => ({
    ...waypoint,
    voyage_id: voyageId,
    route_file_id: routeFile.id,
  }));

  await (supabase.from("voyage_waypoints") as any).delete().eq("voyage_id", voyageId);

  if (waypoints.length > 0) {
    const { error: waypointError } = await (supabase.from("voyage_waypoints") as any).insert(waypoints);

    if (waypointError) {
      redirect(`/voyages/${voyageId}?tab=route&error=${encodeURIComponent(waypointError.message)}`);
    }
  }

  revalidatePath(`/voyages/${voyageId}`);
  redirect(`/voyages/${voyageId}?tab=route`);
}

export async function saveWeather(voyageId: string, formData: FormData) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await (supabase.from("voyage_weather") as any).upsert({
    voyage_id: voyageId,
    summary: clean(formData.get("summary")) ?? "",
    source_reference: clean(formData.get("source_reference")),
    updated_by: profile.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "voyage_id" });

  if (error) {
    redirect(`/voyages/${voyageId}?tab=weather&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/voyages/${voyageId}`);
  redirect(`/voyages/${voyageId}?tab=weather`);
}

export async function createHazard(voyageId: string, formData: FormData) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const title = clean(formData.get("title"));

  if (!title) {
    redirect(`/voyages/${voyageId}?tab=hazards&error=missing-hazard-title`);
  }

  const supabase = await createClient();
  const { error } = await (supabase.from("voyage_hazards") as any).insert({
    voyage_id: voyageId,
    title,
    location: clean(formData.get("location")),
    description: clean(formData.get("description")),
    priority: asHazardPriority(formData.get("priority")),
    status: asHazardStatus(formData.get("status")),
    source_reference: clean(formData.get("source_reference")),
    created_by: profile.id,
    updated_by: profile.id,
  });

  if (error) {
    redirect(`/voyages/${voyageId}?tab=hazards&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/voyages/${voyageId}`);
  redirect(`/voyages/${voyageId}?tab=hazards`);
}

export async function uploadVoyageDocument(voyageId: string, formData: FormData) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const title = clean(formData.get("title"));
  const file = formData.get("document_file");

  if (!title || !(file instanceof File) || file.size === 0) {
    redirect(`/voyages/${voyageId}?tab=documents&error=missing-document`);
  }

  const supabase = await createClient();
  const storagePath = `${voyageId}/documents/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("voyages").upload(storagePath, file, { upsert: true });

  if (uploadError) {
    redirect(`/voyages/${voyageId}?tab=documents&error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error } = await (supabase.from("voyage_documents") as any).insert({
    voyage_id: voyageId,
    title,
    file_name: file.name,
    storage_path: storagePath,
    uploaded_by: profile.id,
    tags: [],
  });

  if (error) {
    redirect(`/voyages/${voyageId}?tab=documents&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/voyages/${voyageId}`);
  redirect(`/voyages/${voyageId}?tab=documents`);
}

function pdfEscape(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function simplePdf(lines: string[]) {
  const body = lines.map((line, index) => `BT /F1 12 Tf 72 ${740 - index * 20} Td (${pdfEscape(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${body.length} >> stream\n${body}\nendstream endobj`,
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(output.length);
    output += `${object}\n`;
  }

  const xrefStart = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  output += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  output += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([output], { type: "application/pdf" });
}

export async function generateVoyageBrief(voyageId: string) {
  await requireRole(["admin", "deck"]);
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data, error: voyageError } = await supabase.from("voyages").select("*").eq("id", voyageId).maybeSingle();
  const voyage = data as Voyage | null;

  if (voyageError || !voyage) {
    redirect(`/voyages/${voyageId}?tab=reports&error=${encodeURIComponent(voyageError?.message ?? "Voyage not found")}`);
  }

  const pdf = simplePdf([
    "NavDash Harbor Voyage Brief",
    `Name: ${voyage.title}`,
    `Vessel: ${voyage.vessel_name}`,
    `Departure: ${voyage.origin ?? "Not set"}`,
    `Arrival: ${voyage.destination ?? "Not set"}`,
    `Status: ${voyage.status}`,
    `Phase: ${voyage.phase}`,
    `ETD: ${voyage.etd ?? "Not set"}`,
    `ETA: ${voyage.eta ?? "Not set"}`,
  ]);
  const fileName = "voyage-brief.pdf";
  const storagePath = `${voyageId}/reports/${fileName}`;
  const { error: uploadError } = await supabase.storage.from("voyages").upload(storagePath, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    redirect(`/voyages/${voyageId}?tab=reports&error=${encodeURIComponent(uploadError.message)}`);
  }

  await (supabase.from("voyage_reports") as any).update({ is_current: false }).eq("voyage_id", voyageId);
  const { error } = await (supabase.from("voyage_reports") as any).insert({
    voyage_id: voyageId,
    report_type: "Voyage Brief PDF",
    file_name: fileName,
    storage_path: storagePath,
    generated_by: profile.id,
    is_current: true,
  });

  if (error) {
    redirect(`/voyages/${voyageId}?tab=reports&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/voyages/${voyageId}`);
  redirect(`/voyages/${voyageId}?tab=reports`);
}
