"use client";

import { useState } from "react";
import { createInitialState, gameReducer, makePlayers } from "@/lib/gameEngine";
import type { Difficulty, GameState } from "@/lib/types";
import PlayerSetup from "@/components/local/PlayerSetup";
import GameBoard from "@/components/game/GameBoard";

export default function LocalGamePage() {
  const [game, setGame] = useState<GameState | null>(null);

  function dispatch(action: Parameters<typeof gameReducer>[1]) {
    setGame((prev) => (prev ? gameReducer(prev, action) : prev));
  }

  function handleStart(
    names: string[],
    difficulty: Difficulty,
    tieBreak: "random" | "coin"
  ) {
    setGame(createInitialState(makePlayers(names), difficulty, tieBreak));
  }

  if (!game) {
    return <PlayerSetup onStart={handleStart} />;
  }

  return <GameBoard game={game} dispatch={dispatch} onNewGame={() => setGame(null)} />;
}
