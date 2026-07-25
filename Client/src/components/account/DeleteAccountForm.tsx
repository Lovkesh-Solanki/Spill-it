"use client";

import { useActionState } from "react";
import { deleteAccountAction, type AccountFormState } from "@/app/account/actions";

const initialState: AccountFormState = null;

export default function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="rounded-xl border border-dare/40 bg-dare/10 px-4 py-3 text-sm text-ink-100">
        This permanently deletes your account: your profile, any rooms you
        own, your room memberships, and your chat history tied to those
        rooms. This can&apos;t be undone.
      </div>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Current password
        </span>
        <input
          type="password"
          name="current_password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-dare"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-raised px-3 py-2.5 text-sm text-ink-400 transition hover:border-dare has-[:checked]:border-dare has-[:checked]:bg-dare/10 has-[:checked]:text-ink-100">
        <input
          type="checkbox"
          name="confirm_delete"
          required
          className="mt-0.5 h-4 w-4 accent-dare"
        />
        <span>I understand this is permanent and can&apos;t be undone.</span>
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-dare">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-dare py-3 font-display font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Permanently delete my account"}
      </button>
    </form>
  );
}
