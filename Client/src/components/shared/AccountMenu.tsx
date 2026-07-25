"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/auth/actions";

type Props = {
  displayName: string;
  email: string | null;
};

const LINKS = [
  { href: "/account/change-password", label: "Change password" },
  { href: "/account/change-email", label: "Change email" },
  { href: "/account/delete", label: "Delete account", danger: true },
];

export default function AccountMenu({ displayName, email }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeSoon() {
    // Small delay rather than closing the instant the pointer leaves the
    // trigger — otherwise moving the mouse from the username down into the
    // panel itself closes the menu before you ever reach it.
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-xs uppercase tracking-widest text-ink-400 transition hover:text-ink-100"
      >
        <span className="hidden sm:inline">{displayName}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 3 L5 7 L9 3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-surface-raised bg-surface shadow-xl"
        >
          <div className="border-b border-surface-raised px-3.5 py-2.5">
            <p className="truncate font-display text-sm font-semibold text-ink-100">
              {displayName}
            </p>
            {email && <p className="truncate text-xs text-ink-500">{email}</p>}
          </div>

          <ul className="p-1.5">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-raised ${
                    link.danger
                      ? "text-dare hover:text-dare-dim"
                      : "text-ink-400 hover:text-ink-100"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-surface-raised p-1.5">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-ink-400 transition hover:bg-surface-raised hover:text-ink-100"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
