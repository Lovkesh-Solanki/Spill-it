"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createInitialState, gameReducer, type GameAction } from "@/lib/gameEngine";
import type { Difficulty, GameState, Player } from "@/lib/types";
import GameBoard from "@/components/game/GameBoard";

type DbPlayer = {
  id: string;
  name: string;
  user_id: string | null;
  forfeit_count: number;
};

type HostMode = "host_controlled" | "turn_based" | "open";

type BroadcastMsg =
  | { event: "state"; state: GameState }
  | { event: "action"; action: GameAction; senderId: string }
  | { event: "request_state" };

export default function OnlineGameBoard({
  roomId,
  sessionId,
  difficulty,
  tieBreakerMode,
  hostMode,
  dbPlayers,
  currentUserId,
  isHost,
}: {
  roomId: string;
  sessionId: string;
  difficulty: Difficulty;
  tieBreakerMode: "random" | "coin_toss";
  hostMode: HostMode;
  dbPlayers: DbPlayer[];
  currentUserId: string;
  isHost: boolean;
}) {
  const supabase = createClient();

  // DB players.id IS the gameEngine Player.id here — no separate mapping
  // needed, and no reason to run makePlayers()/makeId() for online mode:
  // real rows from startGameAction already exist with real ids.
  const initialPlayers: Player[] = useMemo(
    () => dbPlayers.map((p) => ({ id: p.id, name: p.name, forfeits: p.forfeit_count })),
    [dbPlayers]
  );
  const myPlayerId = dbPlayers.find((p) => p.user_id === currentUserId)?.id;

  const [game, setGame] = useState<GameState>(() =>
    createInitialState(initialPlayers, difficulty, tieBreakerMode === "coin_toss" ? "coin" : "random")
  );
  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Persists the durable bits (forfeit_count, prompt_logs) that outlive the
  // ephemeral broadcast state. Only the host writes these, so it only
  // happens once per action, not once per client.
  const persistOutcome = useCallback(
    async (prevState: GameState, nextState: GameState, action: GameAction) => {
      if (action.type !== "RESOLVE" && action.type !== "RESOLVE_PUNISH") return;
      const active = prevState.active;
      if (!active) return;

      await supabase.from("prompt_logs").insert({
        session_id: sessionId,
        player_id: active.player.id,
        type: active.prompt.type,
        difficulty: active.prompt.difficulty,
        content: active.prompt.content,
        result: action.result,
      });

      if (action.result === "forfeit") {
        const newCount =
          nextState.players.find((p) => p.id === active.player.id)?.forfeits ?? 0;
        await supabase
          .from("players")
          .update({ forfeit_count: newCount })
          .eq("id", active.player.id);
      }
    },
    [sessionId, supabase]
  );

  // The single function GameBoard calls for every action, regardless of
  // host/guest — it doesn't know or care which one it's running on.
  const dispatch = useCallback(
    (action: GameAction) => {
      if (isHost) {
        const prev = gameRef.current;
        const next = gameReducer(prev, action);
        setGame(next);
        channelRef.current?.send({ type: "broadcast", event: "msg", payload: { event: "state", state: next } satisfies BroadcastMsg });
        void persistOutcome(prev, next, action);
      } else {
        channelRef.current?.send({
          type: "broadcast",
          event: "msg",
          payload: { event: "action", action, senderId: currentUserId } satisfies BroadcastMsg,
        });
      }
    },
    [isHost, currentUserId, persistOutcome]
  );

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}:session:${sessionId}:game`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "msg" }, ({ payload }: { payload: BroadcastMsg }) => {
        if (payload.event === "state") {
          setGame(payload.state);
        } else if (payload.event === "action" && isHost) {
          const prev = gameRef.current;
          const next = gameReducer(prev, payload.action);
          setGame(next);
          channel.send({ type: "broadcast", event: "msg", payload: { event: "state", state: next } satisfies BroadcastMsg });
          void persistOutcome(prev, next, payload.action);
        } else if (payload.event === "request_state" && isHost) {
          channel.send({ type: "broadcast", event: "msg", payload: { event: "state", state: gameRef.current } satisfies BroadcastMsg });
        }
      })
      .subscribe((status) => {
        // Guests ask the host to catch them up once actually connected —
        // covers joining, or refreshing, mid-game. Sending before
        // SUBSCRIBED fires is a common source of dropped messages with
        // Supabase's realtime client, so this waits for it explicitly.
        if (status === "SUBSCRIBED" && !isHost) {
          channel.send({ type: "broadcast", event: "msg", payload: { event: "request_state" } satisfies BroadcastMsg });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable per mount; roomId/sessionId/isHost are the real deps and don't change within one game
  }, [roomId, sessionId, isHost]);

  const iAmSelectedOrActive =
    game.selectedPlayerId === myPlayerId || game.active?.player.id === myPlayerId;

  const canDriveFlow =
    hostMode === "open" ||
    (hostMode === "host_controlled" && isHost) ||
    // turn_based: whoever is currently selected/active drives the next
    // step too (e.g. they trigger their own resolve, which this already
    // covers) — for spin specifically, ownership rotates to whoever the
    // *previous* turn selected, derived from turnCount so no schema or
    // reducer change is needed. Falls back to the host before turn 1.
    (hostMode === "turn_based" &&
      (iAmSelectedOrActive ||
        (game.screen === "spin" &&
          !game.selectedPlayerId &&
          game.players[game.turnCount % game.players.length]?.id === myPlayerId)));

  return (
    <GameBoard
      game={game}
      dispatch={dispatch}
      myPlayerId={myPlayerId}
      canDriveFlow={canDriveFlow}
      showEndGameButton={hostMode !== "turn_based" ? isHost || hostMode === "open" : canDriveFlow}
    />
  );
}
