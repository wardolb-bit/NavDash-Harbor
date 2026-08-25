"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SetupState = { message?: string; technical?: string; success?: boolean };

export async function setupHarbor(_state: SetupState, formData: FormData): Promise<SetupState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();

  if (!fullName || !email || password.length < 8 || !inviteCode) {
    return { message: "Enter your name, email, a password of at least 8 characters, and the Harbor bootstrap code." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        display_name: fullName,
        harbor_invite_code: inviteCode,
      },
    },
  });

  if (error) {
    return { message: "Harbor setup could not be completed.", technical: error.message };
  }

  if (data.session) redirect("/dashboard");
  return { success: true, message: "Account created. Check your email for the Supabase confirmation message, then sign in." };
}
