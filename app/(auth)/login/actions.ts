"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export type LoginState = {
  message?: string;
  technical?: string;
};

function normalizeUsername(username: string) {
  const trimmed = username.trim();
  if (trimmed.includes("@")) {
    return trimmed;
  }

  const usernameDomain = process.env.NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN ?? "navdash.local";
  return `${trimmed}@${usernameDomain}`;
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { message: "Enter your assigned username and password." };
  }

  if (!hasSupabaseConfig()) {
    return {
      message: "Supabase is not configured yet. Add the project URL and anon key, then try again.",
      technical: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeUsername(username),
    password,
  });

  if (error) {
    return {
      message: "Sign in failed. Check your assigned credentials and try again.",
      technical: error.message,
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
