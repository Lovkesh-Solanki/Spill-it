"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = null;

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Display name
        </span>
        <input
          type="text"
          name="display_name"
          required
          minLength={2}
          maxLength={32}
          autoComplete="nickname"
          placeholder="What should we call you?"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
        />
      </label>

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
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-raised px-3 py-2.5 text-sm text-ink-400 transition hover:border-ink-700 has-[:checked]:border-truth has-[:checked]:bg-truth/10 has-[:checked]:text-ink-100">
        <input
          type="checkbox"
          name="accepted_terms"
          required
          className="mt-0.5 h-4 w-4 accent-truth"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="text-truth hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="text-truth hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
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
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
