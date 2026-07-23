"use client";

import { useActionState } from "react";
import { signInAction, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = null;

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
        />
      </label>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Password
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
        />
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
