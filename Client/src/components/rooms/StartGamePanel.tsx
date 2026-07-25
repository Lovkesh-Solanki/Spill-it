"use client";

import { useActionState, useState } from "react";
import { DIFFICULTIES, type Difficulty } from "@/lib/types";
import { startGameAction, type RoomActionState } from "@/app/rooms/actions";

const initialState: RoomActionState = null;

export default function StartGamePanel({
  roomId,
  canStart,
}: {
  roomId: string;
  canStart: boolean;
}) {
  const [state, formAction, pending] = useActionState(startGameAction, initialState);
  const [difficulty, setDifficulty] = useState<Difficulty>("teens");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const needsAgeGate = difficulty === "adult" || difficulty === "spicy";
  const canSubmit = !needsAgeGate || ageConfirmed;

  if (!canStart) {
    return (
      <div className="rounded-2xl border border-surface-raised bg-surface p-4 text-center text-sm text-ink-500">
        Waiting for the host to start the game…
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-surface-raised bg-surface p-4"
    >
      <input type="hidden" name="room_id" value={roomId} />

      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500">
          Difficulty
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((d) => (
            <label
              key={d.id}
              className="cursor-pointer rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-left text-sm transition has-[:checked]:border-dare has-[:checked]:bg-dare/10"
            >
              <input
                type="radio"
                name="difficulty"
                value={d.id}
                checked={difficulty === d.id}
                onChange={() => {
                  setDifficulty(d.id);
                  setAgeConfirmed(false);
                }}
                className="sr-only"
              />
              <div className="font-display font-semibold text-ink-100">{d.label}</div>
              <div className="mt-0.5 text-xs text-ink-500">{d.blurb}</div>
            </label>
          ))}
        </div>
      </div>

      {needsAgeGate && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-spicy/40 bg-spicy/10 px-4 py-3 text-sm text-ink-100">
          <input
            type="checkbox"
            name="age_confirmed"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-spicy"
          />
          <span>
            Everyone in this room confirms they&apos;re 18 or older and
            consents to {difficulty} content.
          </span>
        </label>
      )}

      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-500">
          If two players tie for most forfeits
        </h2>
        <div className="mt-2 flex gap-2">
          {(
            [
              { value: "random", label: "Random pick" },
              { value: "coin_toss", label: "Coin toss" },
            ] as const
          ).map((mode) => (
            <label
              key={mode.value}
              className="flex-1 cursor-pointer rounded-lg border border-surface-raised bg-void px-3 py-2 text-center text-sm text-ink-400 transition has-[:checked]:border-truth has-[:checked]:bg-truth/10 has-[:checked]:text-ink-100"
            >
              <input
                type="radio"
                name="tie_breaker_mode"
                value={mode.value}
                defaultChecked={mode.value === "random"}
                className="sr-only"
              />
              {mode.label}
            </label>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-dare">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !canSubmit}
        className="rounded-xl bg-dare py-3 font-display font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Starting…" : "Start game"}
      </button>
    </form>
  );
}
