"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { requireRole } from "@/lib/rbac";
import type { VoyagePhase, VoyageStatus } from "@/lib/types";

const statusValues: VoyageStatus[] = ["Draft", "Active", "Complete"];
const phaseValues: VoyagePhase[] = ["Planning", "Pre-Departure", "Underway", "Pre-Arrival", "Complete"];

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function cleanDate(value: FormDataEntryValue | null) {
  const text = clean(value);
  return text ? new Date(text).toISOString() : null;
}

function asStatus(value: FormDataEntryValue | null): VoyageStatus {
  const text = String(value ?? "Draft");
  return statusValues.includes(text as VoyageStatus) ? (text as VoyageStatus) : "Draft";
}

function asPhase(value: FormDataEntryValue | null): VoyagePhase {
  const text = String(value ?? "Planning");
  return phaseValues.includes(text as VoyagePhase) ? (text as VoyagePhase) : "Planning";
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
  const { error } = await (supabase.from("voyages") as any).insert({
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
  });

  if (error) {
    redirect(`/voyages/new?error=${encodeURIComponent(error.message)}`);
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
