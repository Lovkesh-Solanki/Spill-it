"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import AccountMenu from "@/components/shared/AccountMenu";
import PlayMenu from "@/components/shared/PlayMenu";

type Props = {
  // Passed down from the root layout, which reads the session server-side
  // via lib/supabase/server — see layout.tsx. Kept minimal on purpose;
  // Navbar only needs enough to render, not the full profile row.
  user: { displayName: string; email: string | null } | null;
};

export default function Navbar({ user }: Props) {
  const pathname = usePathname();
  const homeActive = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-surface-raised bg-void/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="SpillIt home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/header-logo.svg" alt="" width={120} height={34} className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`hidden rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition sm:block ${
              homeActive ? "bg-surface text-ink-100" : "text-ink-500 hover:text-ink-100"
            }`}
          >
            Home
          </Link>
          <PlayMenu />
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeSwitcher />

          {user ? (
            <AccountMenu displayName={user.displayName} email={user.email} />
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
