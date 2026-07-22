"use client";

import type { Player } from "@/lib/types";
import { highestForfeitPlayer } from "@/lib/gameEngine";

interface Props {
  players: Player[];
  onPunish: () => void;
  onNewGame: () => void;
}

export default function EndGameSummary({
  players,
  onPunish,
  onNewGame,
}: Props) {
  const sorted = [...players].sort((a, b) => b.forfeits - a.forfeits);
  const hasForfeits = sorted.some((p) => p.forfeits > 0);
  const { player: loser } = highestForfeitPlayer(players);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Game over
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-100">
        Final scoreboard
      </h1>

      <ul className="mt-8 flex w-full flex-col gap-2">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              i === 0 && hasForfeits
                ? "border-dare bg-dare/10"
                : "border-surface-raised bg-surface"
            }`}
          >
            <span className="font-display font-semibold text-ink-100">
              {p.name}
            </span>
            <span className="font-mono text-ink-400">
              {p.forfeits} forfeit{p.forfeits === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>

      {hasForfeits && (
        <div className="mt-8 w-full rounded-2xl border border-spicy/40 bg-spicy/10 p-5">
          <p className="text-sm text-ink-100">
            <span className="font-semibold text-spicy">{loser.name}</span>{" "}
            racked up the most forfeits. One more dare, on the house?
          </p>
          <button
            type="button"
            onClick={onPunish}
            className="mt-4 rounded-xl bg-spicy px-6 py-3 font-display font-bold text-void-deep transition hover:brightness-95"
          >
            Punish {loser.name}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onNewGame}
        className="mt-8 w-full rounded-xl border border-surface-raised py-3 font-display font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100"
      >
        New game
      </button>
    </div>
  );
}
