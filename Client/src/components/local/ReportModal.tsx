"use client";

import { useEffect, useState } from "react";
import type { ActivePrompt } from "@/lib/types";

export interface ReportPayload {
  promptId: string;
  categories: string[];
  details: string;
}

interface Props {
  active: ActivePrompt;
  onClose: () => void;
  onSubmit: (payload: ReportPayload) => void;
}

const CATEGORIES = [
  { id: "harassment", label: "Harassment or abusive language" },
  { id: "off-tier", label: "Content outside this room's difficulty tier" },
  { id: "spam", label: "Spam or irrelevant" },
  { id: "underage", label: "Underage user concern" },
  { id: "other", label: "Other" },
] as const;

export default function ReportModal({ active, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose]);

  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(onClose, 1800);
    return () => clearTimeout(t);
  }, [submitted, onClose]);

  function toggleCategory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) return;

    // Phase 1 has no backend yet, so reports are logged client-side only.
    // Once Supabase is wired in (Phase 2), swap this for a real insert into
    // a `reports` table and route it through the auto-hide/review-queue flow.
    const payload: ReportPayload = {
      promptId: active.prompt.id,
      categories: selected,
      details: details.trim(),
    };
    console.info("[report:local-mode-placeholder]", payload);
    onSubmit(payload);
    setSubmitted(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-void-deep/80 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-surface-raised bg-surface p-6">
        {submitted ? (
          <div className="py-4 text-center">
            <p className="font-display text-lg font-bold text-truth">Report sent</p>
            <p className="mt-1 text-sm text-ink-500">
              Thanks — this is flagged for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2
              id="report-modal-title"
              className="font-display text-lg font-bold text-ink-100"
            >
              Report this prompt
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              &ldquo;{active.prompt.content}&rdquo;
            </p>

            <fieldset className="mt-5">
              <legend className="font-mono text-xs uppercase tracking-widest text-ink-500">
                What&apos;s wrong with it?
              </legend>
              <div className="mt-3 flex flex-col gap-2">
                {CATEGORIES.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-raised px-3 py-2.5 text-sm text-ink-400 transition hover:border-ink-700 has-[:checked]:border-dare has-[:checked]:bg-dare/10 has-[:checked]:text-ink-100"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                      className="mt-0.5 h-4 w-4 accent-dare"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 block">
              <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
                Details (optional)
              </span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="Anything else worth knowing?"
                className="mt-2 w-full resize-none rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
              />
            </label>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-surface-raised py-3 font-display font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selected.length === 0}
                className="rounded-xl bg-dare py-3 font-display font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:cursor-not-allowed disabled:opacity-30"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
