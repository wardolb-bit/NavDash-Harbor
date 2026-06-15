import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import type { Database } from "@/lib/database.types";

export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient<Database>(url!, anonKey!);
}
