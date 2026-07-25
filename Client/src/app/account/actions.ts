"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AccountFormState = { error: string; success?: string } | null;

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Your current password is incorrect.";
  }
  if (m.includes("password should be at least")) {
    return "New password must be at least 8 characters.";
  }
  if (m.includes("should be different")) {
    return "New password must be different from your current one.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many attempts — please wait a moment and try again.";
  }
  return message;
}

// Every action below re-authenticates with the current password first —
// updateUser() alone would let anyone at an unlocked, unattended session
// change the password, redirect the email, or delete the account with no
// proof they actually know the existing password.
async function reauthenticate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentPassword: string
): Promise<{ email: string } | { error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "You need to be signed in to do this." };

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (error) return { error: "Your current password is incorrect." };

  return { email: user.email };
}

export async function changePasswordAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const auth = await reauthenticate(supabase, currentPassword);
  if ("error" in auth) return { error: auth.error };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: friendlyError(error.message) };

  return { error: "", success: "Password updated." };
}

export async function changeEmailAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const newEmail = String(formData.get("new_email") ?? "").trim();

  if (!newEmail) return { error: "Enter the new email address." };

  const supabase = await createClient();
  const auth = await reauthenticate(supabase, currentPassword);
  if ("error" in auth) return { error: auth.error };

  if (newEmail.toLowerCase() === auth.email.toLowerCase()) {
    return { error: "That's already your current email." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${siteUrl}/auth/confirm` }
  );
  if (error) return { error: friendlyError(error.message) };

  return {
    error: "",
    success: `Check ${newEmail} for a confirmation link. Your email won't change until you click it.`,
  };
}

export async function deleteAccountAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const confirmed = formData.get("confirm_delete") === "on";

  if (!confirmed) {
    return { error: "Please confirm you understand this can't be undone." };
  }

  const supabase = await createClient();
  const auth = await reauthenticate(supabase, currentPassword);
  if ("error" in auth) return { error: auth.error };

  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: friendlyError(error.message) };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
