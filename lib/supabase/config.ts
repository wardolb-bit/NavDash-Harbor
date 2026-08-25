const HARBOR_SUPABASE_URL = "https://jvisswvllnvaicdroljr.supabase.co";
const HARBOR_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aoiZwFyorDFcf_LyNCfhqA_acPun8X2";

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? HARBOR_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? HARBOR_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function hasSupabaseConfig() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}
