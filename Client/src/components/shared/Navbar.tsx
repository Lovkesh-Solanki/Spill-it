"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/play/local", label: "Play" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-raised bg-void/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg font-bold text-ink-100">
          Spill<span className="text-dare">It</span>
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

        <ThemeSwitcher />
      </div>
    </header>
  );
}
