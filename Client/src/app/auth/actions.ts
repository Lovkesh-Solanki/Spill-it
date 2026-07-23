"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error: string } | null;

// Supabase's own error messages are accurate but not always what you'd want
// to show someone mid-signup — this reshapes the common ones into copy that
// tells the user what to actually do next. Anything unrecognized falls
// through to Supabase's original message rather than being swallowed.
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return "An account with that email already exists — try signing in instead.";
  }
  if (m.includes("email not confirmed")) {
    return "Check your inbox — confirm your email before signing in.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return "Password must be at least 8 characters.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many attempts — please wait a moment and try again.";
  }
  return message;
}

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const acceptedTerms = formData.get("accepted_terms") === "on";

  if (!email || !password || !displayName) {
    return { error: "Please fill in every field." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!acceptedTerms) {
    return { error: "You need to accept the Terms and Privacy Policy to continue." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // accepted_terms_at is set here, server-side, at the moment we've
      // already validated the checkbox above — not trusted client input,
      // even though it rides through raw_user_meta_data to reach the
      // handle_new_user() trigger. See supabase/schema.sql.
      data: {
        display_name: displayName,
        accepted_terms_at: new Date().toISOString(),
      },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) return { error: friendlyAuthError(error.message) };

  revalidatePath("/", "layout");
  redirect("/check-email");
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: friendlyAuthError(error.message) };

  // Revalidates the root layout so the Navbar (which reads the session
  // server-side) picks up the new signed-in state on the very next render —
  // no client-side auth listener needed for this to feel instant.
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
