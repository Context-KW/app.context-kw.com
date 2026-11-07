import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Next.js inlines NEXT_PUBLIC_* values at build time, but only when they are
// referenced as literal `process.env.NAME` expressions, as below.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

/** True when both public environment variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Shared browser client for the anon role. Returns null when the environment is
 * not configured, so the UI can explain that instead of crashing.
 * The guest flows need no login, so sessions are not persisted.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}
