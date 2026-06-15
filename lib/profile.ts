import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

const fallbackProfile: Profile = {
  id: "phase-1",
  username: "operator",
  full_name: "Harbor Operator",
  role: "deck",
};

export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fallbackProfile;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      username: user.email?.split("@")[0] ?? fallbackProfile.username,
      full_name: user.user_metadata?.full_name ?? null,
      role: "deck",
    };
  }

  return data as Profile;
}
