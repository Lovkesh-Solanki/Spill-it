"use client";

import { useActionState } from "react";
import { changePasswordAction, type AccountFormState } from "@/app/account/actions";

const initialState: AccountFormState = null;

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Current password
        </span>
        <input
          type="password"
          name="current_password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-truth"
        />
      </label>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          New password
        </span>
        <input
          type="password"
          name="new_password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
        />
      </label>

      {state?.error ? (
        <p role="alert" className="text-sm text-dare">
          {state.error}
        </p>
      ) : state?.success ? (
        <p role="status" className="text-sm text-truth">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-dare py-3 font-display font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
