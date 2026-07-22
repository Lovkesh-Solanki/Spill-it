"use client";

import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
}

export default function Scoreboard({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.forfeits - a.forfeits);
  const topScore = sorted[0]?.forfeits ?? 0;

  return (
    <div className="w-full max-w-xs rounded-2xl border border-surface-raised bg-surface/60 p-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Forfeits
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {sorted.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between text-sm"
          >
            <span
              className={
                p.forfeits === topScore && topScore > 0
                  ? "font-semibold text-dare"
                  : "text-ink-400"
              }
            >
              {p.name}
            </span>
            <span className="font-mono text-ink-500">{p.forfeits}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
