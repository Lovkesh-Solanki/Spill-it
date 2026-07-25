"use client";

import { useState } from "react";
import type { GameAction } from "@/lib/gameEngine";
import type { GameState } from "@/lib/types";
import SpinTable from "@/components/local/SpinTable";
import ChoiceScreen from "@/components/local/ChoiceScreen";
import PromptCard from "@/components/local/PromptCard";
import Scoreboard from "@/components/local/Scoreboard";
import EndGameSummary from "@/components/local/EndGameSummary";
import ReportModal from "@/components/local/ReportModal";

interface Props {
  game: GameState;
  dispatch: (action: GameAction) => void;
  /**
   * Online mode only. The gameEngine Player.id that belongs to the person
   * viewing this screen. Leave unset for local (pass-the-device) mode —
   * every control stays fully interactive for everyone, exactly like
   * before this component existed.
   */
  myPlayerId?: string;
  /**
   * Online mode only. Whether THIS client is allowed to drive shared flow
   * actions (spin / punish / end game) — derived from the room's host_mode.
   * Choosing and resolving your own prompt is gated separately, by
   * myPlayerId matching the active player, regardless of this flag.
   * Defaults to true, so local mode is unaffected.
   */
  canDriveFlow?: boolean;
  showEndGameButton?: boolean;
  onNewGame?: () => void;
}

export default function GameBoard({
  game,
  dispatch,
  myPlayerId,
  canDriveFlow = true,
  showEndGameButton = true,
  onNewGame,
}: Props) {
  const [reportOpen, setReportOpen] = useState(false);

  // undefined myPlayerId = local mode = nobody is restricted from anything.
  const restrictToMe = myPlayerId !== undefined;
  const selectedPlayer = game.players.find((p) => p.id === game.selectedPlayerId);
  const iAmSelected = !restrictToMe || selectedPlayer?.id === myPlayerId;
  const iAmActive = !restrictToMe || game.active?.player.id === myPlayerId;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16">
      {showEndGameButton && game.screen !== "ended" && (
        <div className="flex justify-end py-4">
          <button
            type="button"
            onClick={() => dispatch({ type: "END_GAME" })}
            disabled={!canDriveFlow}
            className="font-mono text-xs uppercase tracking-widest text-ink-500 hover:text-dare disabled:cursor-not-allowed disabled:opacity-30"
          >
            End game
          </button>
        </div>
      )}
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
              disabled={!canDriveFlow}
            />
            <Scoreboard players={game.players} />
          </>
        )}

        {game.screen === "choice" && selectedPlayer && (
          <ChoiceScreen
            player={selectedPlayer}
            onChoose={(choice) => dispatch({ type: "CHOOSE", choice })}
            disabled={!iAmSelected}
          />
        )}

        {(game.screen === "prompt" || game.screen === "punish") &&
          game.active && (
            <div className="w-full">
              <PromptCard
                active={game.active}
                readOnly={!iAmActive}
                onResolve={(result) => {
                  setReportOpen(false);
                  dispatch(
                    game.active?.isPunish
                      ? { type: "RESOLVE_PUNISH", result }
                      : { type: "RESOLVE", result }
                  );
                }}
                onReport={() => setReportOpen(true)}
              />
              {reportOpen && (
                <ReportModal
                  active={game.active}
                  onClose={() => setReportOpen(false)}
                  onSubmit={() => {
                    /* Logged client-side for now. Persisting prompt reports
                       needs a schema addition (the current `reports` table
                       only targets chat messages) — noted as a follow-up,
                       not done here. */
                  }}
                />
              )}
            </div>
          )}

        {game.screen === "ended" && (
          <EndGameSummary
            players={game.players}
            readOnly={!canDriveFlow}
            onPunish={canDriveFlow ? () => dispatch({ type: "PUNISH" }) : undefined}
            onNewGame={onNewGame}
          />
        )}
      </main>
    </div>
  );
}
