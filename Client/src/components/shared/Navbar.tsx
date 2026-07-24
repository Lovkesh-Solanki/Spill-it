"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import { signOutAction } from "@/app/auth/actions";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/play/local", label: "Play" },
];

type Props = {
  // Passed down from the root layout, which reads the session server-side
  // via lib/supabase/server — see layout.tsx. Kept minimal on purpose;
  // Navbar only needs enough to render, not the full profile row.
  user: { displayName: string } | null;
};

export default function Navbar({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-raised bg-void/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center" aria-label="SpillIt home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/header-logo.svg" alt="" width={120} height={34} className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition ${
                  active
                    ? "bg-surface text-ink-100"
                    : "text-ink-500 hover:text-ink-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-xs uppercase tracking-widest text-ink-400 sm:inline">
                {user.displayName}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-surface-raised px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-500 transition hover:border-ink-700 hover:text-ink-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-dare px-3 py-1.5 font-display text-xs font-bold text-void-deep transition hover:bg-dare-dim"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
