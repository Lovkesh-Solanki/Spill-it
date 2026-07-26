"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PlayMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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

  const active = pathname === "/play/local" || pathname.startsWith("/rooms");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition ${
          active ? "bg-surface text-ink-100" : "text-ink-500 hover:text-ink-100"
        }`}
      >
        Play
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 z-50 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-surface-raised bg-surface p-2 shadow-xl"
        >
          <Link
            href="/play/local"
            onClick={() => setOpen(false)}
            className="block rounded-xl border-2 border-dare bg-dare/10 px-4 py-3 text-left transition hover:bg-dare/20"
          >
            <span className="font-display font-bold text-ink-100">Local</span>
            <p className="mt-0.5 text-xs text-ink-500">One device, no account.</p>
          </Link>
          <Link
            href="/rooms"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl border-2 border-truth bg-truth/10 px-4 py-3 text-left transition hover:bg-truth/20"
          >
            <span className="font-display font-bold text-ink-100">Online</span>
            <p className="mt-0.5 text-xs text-ink-500">Rooms with friends.</p>
          </Link>
        </div>
      )}
    </div>
  );
}
