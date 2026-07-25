"use client";

import { useState, useTransition } from "react";
import { leaveRoomAction } from "@/app/rooms/actions";

export default function LeaveRoomButton({ roomId }: { roomId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLeave() {
    const confirmed = window.confirm(
      "Leave this room? You'll need the room code (and password, if it has one) to rejoin."
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await leaveRoomAction(roomId);
      // leaveRoomAction redirects on success, so reaching here means it failed.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleLeave}
        disabled={pending}
        className="rounded-full border border-dare/40 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-dare transition hover:border-dare hover:bg-dare/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Leaving…" : "Leave room"}
      </button>
      {error && <p className="max-w-[16rem] text-right text-xs text-dare">{error}</p>}
    </div>
  );
}
