"use client";

import { useActionState, useState } from "react";
import { createRoomAction, joinRoomAction, type RoomActionState } from "@/app/rooms/actions";

const BRACKETS = [
  { value: "2", label: "2 players" },
  { value: "3-5", label: "3–5 players" },
  { value: "5-10", label: "5–10 players" },
  { value: "10-25", label: "10–25 players" },
  { value: "25+", label: "25+ (up to 50)" },
];

const initialState: RoomActionState = null;

export default function RoomForms() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [createState, createAction, creating] = useActionState(createRoomAction, initialState);
  const [joinState, joinAction, joining] = useActionState(joinRoomAction, initialState);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex gap-1 rounded-xl border border-surface-raised bg-surface p-1">
        {(["create", "join"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 font-mono text-xs uppercase tracking-widest transition ${
              tab === t ? "bg-surface-raised text-ink-100" : "text-ink-500 hover:text-ink-100"
            }`}
          >
            {t === "create" ? "Create a room" : "Join a room"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <form action={createAction} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
              Room name
            </span>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={40}
              placeholder="Friday night spill"
              className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
            />
          </label>

          <label className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
              Password (optional)
            </span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Leave blank for an open room"
              className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
            />
          </label>

          <label className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
              Room size
            </span>
            <select
              name="size_bracket"
              required
              defaultValue=""
              className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-truth"
            >
              <option value="" disabled>
                Pick a size
              </option>
              {BRACKETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-surface-raised px-3 py-2.5 text-sm text-ink-400">
            <input type="checkbox" name="verified_only" className="h-4 w-4 accent-dare" />
            Only allow email-verified members
          </label>

          {createState?.error && (
            <p className="text-sm text-dare">{createState.error}</p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-dare py-3 font-display font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create room"}
          </button>
        </form>
      ) : (
        <form action={joinAction} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
              Room code
            </span>
            <input
              type="text"
              name="code"
              required
              minLength={6}
              maxLength={6}
              placeholder="ABC123"
              autoCapitalize="characters"
              className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-center font-mono text-lg uppercase tracking-[0.3em] text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
            />
          </label>

          <label className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
              Nickname (optional)
            </span>
            <input
              type="text"
              name="nickname"
              maxLength={24}
              placeholder="Defaults to your display name"
              className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
            />
          </label>

          <label className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
              Password (if the room has one)
            </span>
            <input
              type="password"
              name="password"
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-surface-raised bg-void px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-truth"
            />
          </label>

          {joinState?.error && <p className="text-sm text-dare">{joinState.error}</p>}

          <button
            type="submit"
            disabled={joining}
            className="rounded-xl bg-truth py-3 font-display font-bold text-void-deep transition enabled:hover:bg-truth-dim disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join room"}
          </button>
        </form>
      )}
    </div>
  );
}
