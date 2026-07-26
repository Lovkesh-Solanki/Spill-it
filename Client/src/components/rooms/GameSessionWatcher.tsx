"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounted once on the room page. Nothing here renders — it just listens for
 * a new row in game_sessions for this room and calls router.refresh() so
 * the server component re-fetches latestSession/players and every connected
 * client swaps from the start/waiting panel into the live board together.
 *
 * Without this, starting (or restarting) a game only updates the browser of
 * whoever clicked the button — everyone else's page keeps showing "waiting
 * for the host" until they manually reload, since revalidatePath() inside a
 * Server Action only affects the caller's own request/response cycle.
 */
export default function GameSessionWatcher({ roomId }: { roomId: string }) {
  const router = useRouter();

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
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is created fresh per mount, roomId is the real dependency
  }, [roomId]);

  return null;
}
