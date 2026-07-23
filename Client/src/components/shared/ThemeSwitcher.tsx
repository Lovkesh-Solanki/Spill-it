"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setThemeId, visibleThemes, tryUnlockCode } = useTheme();
  const [open, setOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
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

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const result = tryUnlockCode(code);
    setMessage(
      result.success
        ? { text: `Unlocked ${result.themeName}`, ok: true }
        : { text: "Not a valid code", ok: false }
    );
    setCode("");
    setTimeout(() => setMessage(null), 2500);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full border border-surface-raised bg-surface/80 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-400 backdrop-blur transition hover:border-ink-700 hover:text-ink-100"
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "var(--color-dare)" }}
          aria-hidden
        />
        {theme.name}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-surface-raised bg-surface shadow-xl"
        >
          <ul className="p-1.5">
            {visibleThemes.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setThemeId(t.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-400 transition hover:bg-surface-raised hover:text-ink-100"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.colors.dare }}
                    aria-hidden
                  />
                  {t.name}
                  {t.tier === "premium" && (
                    <span
                      className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                      style={{
                        color: "var(--color-void-deep)",
                        backgroundColor: "var(--color-spicy)",
                      }}
                    >
                      ✦ premium
                    </span>
                  )}
                  {t.id === theme.id && (
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-ink-700">
                      current
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-surface-raised px-3 py-2.5">
            {!showCode ? (
              <button
                type="button"
                onClick={() => setShowCode(true)}
                className="font-mono text-[11px] uppercase tracking-widest text-ink-700 underline decoration-dotted hover:text-ink-400"
              >
                Have a code?
              </button>
            ) : (
              <form onSubmit={submitCode} className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="enter code"
                  className="w-full rounded-lg border border-surface-raised bg-void px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-dare px-3 py-1.5 font-display text-xs font-bold text-void-deep transition hover:bg-dare-dim"
                >
                  Go
                </button>
              </form>
            )}
            {message && (
              <p
                className={`mt-1.5 text-[11px] ${
                  message.ok ? "text-truth" : "text-ink-700"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
