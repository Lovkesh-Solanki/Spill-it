"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounted once on the room page. Nothing here renders — it just watches for
 * a new row in game_sessions for this room and calls router.refresh() so
 * the server component re-fetches latestSession/players and every connected
 * client swaps from the start/waiting panel into the live board together.
 *
 * Without this, starting (or restarting) a game only updates the browser of
 * whoever clicked the button — everyone else's page keeps showing "waiting
 * for the host" until they manually reload, since revalidatePath() inside a
 * Server Action only affects the caller's own request/response cycle.
 *
 * Two layers, deliberately redundant:
 *  1. Realtime postgres_changes — near-instant, the normal path.
 *  2. A polling fallback — catches the rare case where the realtime event
 *     never arrives (e.g. a websocket reconnect gap right when the INSERT
 *     happened). Compares the room's session count rather than only firing
 *     once, so it also self-heals for a restart later in the same visit,
 *     not just the very first start.
 */
export default function GameSessionWatcher({ roomId }: { roomId: string }) {
  const router = useRouter();
  const lastKnownCount = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room:${roomId}:sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_sessions",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          lastKnownCount.current = null; // force the next poll to resync quietly
          router.refresh();
        }
      )
      .subscribe();

    async function poll() {
      const { count } = await supabase
        .from("game_sessions")
        .select("id", { count: "exact", head: true })
        .eq("room_id", roomId);

      if (count === null) return;
      if (lastKnownCount.current !== null && count > lastKnownCount.current) {
        router.refresh();
      }
      lastKnownCount.current = count;
    }

    poll();
    const interval = setInterval(poll, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is created fresh per mount, roomId is the real dependency
  }, [roomId]);

  return null;
}
