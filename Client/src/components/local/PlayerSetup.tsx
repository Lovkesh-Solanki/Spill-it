"use client";

import { useState } from "react";
import { DIFFICULTIES, type Difficulty } from "@/lib/types";

interface Props {
  onStart: (
    names: string[],
    difficulty: Difficulty,
    tieBreak: "random" | "coin"
  ) => void;
}

export default function PlayerSetup({ onStart }: Props) {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [difficulty, setDifficulty] = useState<Difficulty>("teens");
  const [tieBreak, setTieBreak] = useState<"random" | "coin">("random");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const needsAgeGate = difficulty === "adult" || difficulty === "spicy";
  const validNames = names.map((n) => n.trim()).filter(Boolean);
  const canStart =
    validNames.length >= 2 && (!needsAgeGate || ageConfirmed);

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addPlayerField() {
    setNames((prev) => [...prev, ""]);
  }

  function removePlayerField(index: number) {
    setNames((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-100">
        Set the table
      </h1>
      <p className="mt-2 text-ink-500">
        Add everyone playing, pick a tier, and spin.
      </p>

      {/* Players */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Players
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1} name`}
                maxLength={24}
                className="w-full rounded-xl border border-surface-raised bg-surface px-4 py-3 text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth focus:ring-2 focus:ring-truth/30"
              />
              {names.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayerField(i)}
                  aria-label={`Remove player ${i + 1}`}
                  className="shrink-0 rounded-lg px-3 py-3 text-ink-500 hover:text-dare hover:bg-surface"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPlayerField}
          className="mt-3 rounded-lg border border-dashed border-surface-raised px-4 py-2 text-sm text-ink-400 hover:border-truth hover:text-truth"
        >
          + Add another player
        </button>
      </section>

      {/* Difficulty */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Difficulty
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDifficulty(d.id);
                setAgeConfirmed(false);
              }}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                difficulty === d.id
                  ? "border-dare bg-dare/10 text-ink-100"
                  : "border-surface-raised bg-surface text-ink-400 hover:border-ink-700"
              }`}
            >
              <div className="font-display font-semibold">{d.label}</div>
              <div className="mt-0.5 text-xs text-ink-500">{d.blurb}</div>
            </button>
          ))}
        </div>
      </section>

      {needsAgeGate && (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-spicy/40 bg-spicy/10 px-4 py-3 text-sm text-ink-100">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-spicy"
          />
          <span>
            Everyone playing confirms they&apos;re 18 or older and consents
            to {difficulty} content.
          </span>
        </label>
      )}

      {/* Tie-break setting */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500">
          If two players tie for most forfeits
        </h2>
        <div className="mt-3 flex gap-3">
          {(["random", "coin"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTieBreak(mode)}
              className={`rounded-lg border px-4 py-2 text-sm capitalize transition ${
                tieBreak === mode
                  ? "border-truth bg-truth/10 text-ink-100"
                  : "border-surface-raised bg-surface text-ink-400"
              }`}
            >
              {mode === "random" ? "Random pick" : "Coin toss"}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(validNames, difficulty, tieBreak)}
        className="mt-10 w-full rounded-xl bg-dare py-4 font-display text-lg font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:cursor-not-allowed disabled:opacity-30"
      >
        Start the game
      </button>
      {validNames.length < 2 && (
        <p className="mt-2 text-center text-xs text-ink-700">
          Add at least 2 players to start.
        </p>
      )}
    </div>
  );
}
