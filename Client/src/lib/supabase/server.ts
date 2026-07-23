import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

// Use this inside Server Components, Route Handlers, and Server Actions.
// It's async because Next.js's cookies() is async in the App Router.
//
// The try/catch around setAll exists because Server Components can't write
// cookies (only Route Handlers/Server Actions/middleware can) — Supabase's
// docs call this out explicitly. Session refresh is handled by
// middleware.ts instead, so this failing silently in a Server Component is
// expected and fine, not a bug.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore, see note above.
          }
        },
      },
    }
  );
}
