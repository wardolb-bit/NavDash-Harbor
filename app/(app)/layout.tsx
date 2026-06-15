import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { HeaderContext } from "@/lib/types";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const headerContext: HeaderContext = {
  vesselName: "M/V Harbor Sentinel",
  activeVoyage: "No active voyage",
  voyagePhase: "Planning",
};

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  return (
    <AppShell profile={profile} headerContext={headerContext}>
      {children}
    </AppShell>
  );
}
