"use client";

import type { ActivePrompt } from "@/lib/types";

interface Props {
  active: ActivePrompt;
  onResolve: (result: "done" | "forfeit") => void;
  onReport: () => void;
}

export default function PromptCard({ active, onResolve, onReport }: Props) {
  const { player, prompt, isPunish } = active;
  const isTruth = prompt.type === "truth";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-10">
      {isPunish && (
        <div className="mb-4 rounded-full bg-spicy/15 px-4 py-1 font-mono text-xs uppercase tracking-widest text-spicy">
          Punish round
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        {player.name}&apos;s {isTruth ? "truth" : "dare"}
      </p>

      <div
        className={`mt-4 w-full rounded-3xl border-2 px-6 py-10 text-center ${
          isTruth
            ? "border-truth bg-truth/10"
            : "border-dare bg-dare/10"
        }`}
      >
        <span
          className={`font-mono text-xs uppercase tracking-widest ${
            isTruth ? "text-truth" : "text-dare"
          }`}
        >
          {prompt.difficulty} · {prompt.type}
        </span>
        <p className="mt-4 font-display text-2xl font-semibold leading-snug text-ink-100">
          {prompt.content}
        </p>
      </div>

      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onResolve("done")}
          className="rounded-xl bg-truth py-4 font-display font-bold text-void-deep transition hover:bg-truth-dim"
        >
          Done
        </button>
        <button
          type="button"
          onClick={() => onResolve("forfeit")}
          className="rounded-xl border-2 border-dare py-4 font-display font-bold text-dare transition hover:bg-dare/10"
        >
          Forfeit
        </button>
      </div>

      <button
        type="button"
        onClick={onReport}
        className="mt-6 text-xs text-ink-700 underline decoration-dotted hover:text-ink-400"
      >
        Report this prompt
      </button>
    </div>
  );
}
