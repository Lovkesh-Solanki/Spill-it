import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Use this inside Client Components ("use client"). It reads the two
// NEXT_PUBLIC_ env vars — safe to expose to the browser, that's what
// "anon" / "public" means for these keys. Real access control lives in
// Postgres Row Level Security policies (see supabase/schema.sql), not in
// this key.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
