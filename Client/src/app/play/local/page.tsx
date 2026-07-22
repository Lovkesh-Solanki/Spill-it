"use client";

import { useState } from "react";
import Link from "next/link";
import { createInitialState, gameReducer, makePlayers } from "@/lib/gameEngine";
import type { Difficulty, GameState } from "@/lib/types";
import PlayerSetup from "@/components/local/PlayerSetup";
import SpinTable from "@/components/local/SpinTable";
import ChoiceScreen from "@/components/local/ChoiceScreen";
import PromptCard from "@/components/local/PromptCard";
import Scoreboard from "@/components/local/Scoreboard";
import EndGameSummary from "@/components/local/EndGameSummary";

export default function LocalGamePage() {
  const [game, setGame] = useState<GameState | null>(null);
  const [reportNote, setReportNote] = useState(false);

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

  const selectedPlayer = game.players.find(
    (p) => p.id === game.selectedPlayerId
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="font-display text-lg font-bold text-ink-100">
          Spill<span className="text-dare">It</span>
        </Link>
        {game.screen !== "ended" && (
          <button
            type="button"
            onClick={() => dispatch({ type: "END_GAME" })}
            className="font-mono text-xs uppercase tracking-widest text-ink-500 hover:text-dare"
          >
            End game
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        {(game.screen === "spin" || game.screen === "choice") && (
          <>
            <SpinTable
              players={game.players}
              selectedPlayerId={game.selectedPlayerId}
              settled={game.screen === "choice"}
              onSpin={() => dispatch({ type: "SPIN" })}
              onLanded={() => dispatch({ type: "LANDED" })}
              turnCount={game.turnCount}
            />
            <Scoreboard players={game.players} />
          </>
        )}

        {game.screen === "choice" && selectedPlayer && (
          <ChoiceScreen
            player={selectedPlayer}
            onChoose={(choice) => dispatch({ type: "CHOOSE", choice })}
          />
        )}

        {(game.screen === "prompt" || game.screen === "punish") &&
          game.active && (
            <div className="w-full">
              <PromptCard
                active={game.active}
                onResolve={(result) => {
                  setReportNote(false);
                  dispatch(
                    game.active?.isPunish
                      ? { type: "RESOLVE_PUNISH", result }
                      : { type: "RESOLVE", result }
                  );
                }}
                onReport={() => setReportNote(true)}
              />
              {reportNote && (
                <p className="mt-[-1.5rem] text-center text-xs text-ink-500">
                  Thanks — flagged for review. (Full report form coming
                  soon.)
                </p>
              )}
            </div>
          )}

        {game.screen === "ended" && (
          <EndGameSummary
            players={game.players}
            onPunish={() => dispatch({ type: "PUNISH" })}
            onNewGame={() => setGame(null)}
          />
        )}
      </main>
    </div>
  );
}
