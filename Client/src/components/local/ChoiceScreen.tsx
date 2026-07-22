"use client";

import type { Player } from "@/lib/types";

interface Props {
  player: Player;
  onChoose: (choice: "truth" | "dare" | "random") => void;
}

export default function ChoiceScreen({ player, onChoose }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        The bottle points to
      </p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-100">
        {player.name}
      </h1>

      <div className="mt-10 grid w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={() => onChoose("truth")}
          className="rounded-2xl border-2 border-truth bg-truth/10 py-5 font-display text-xl font-bold text-truth transition hover:bg-truth/20"
        >
          Truth
        </button>
        <button
          type="button"
          onClick={() => onChoose("dare")}
          className="rounded-2xl border-2 border-dare bg-dare/10 py-5 font-display text-xl font-bold text-dare transition hover:bg-dare/20"
        >
          Dare
        </button>
        <button
          type="button"
          onClick={() => onChoose("random")}
          className="rounded-2xl border-2 border-surface-raised bg-surface py-4 font-display text-base font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100"
        >
          Let the game decide
        </button>
      </div>
    </div>
  );
}
