import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChangeEmailForm from "@/components/account/ChangeEmailForm";

export const metadata = { title: "Change email — SpillIt" };

export default async function ChangeEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/change-email");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Account
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-100">
        Change email
      </h1>
      <p className="mt-2 text-sm text-ink-500">Current: {user.email}</p>
      <ChangeEmailForm />
    </main>
  );
}
