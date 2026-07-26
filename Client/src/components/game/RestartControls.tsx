"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { startGameAction } from "@/app/rooms/actions";
import { DIFFICULTIES, type Difficulty } from "@/lib/types";
import GameSettingsFields from "@/components/rooms/GameSettingsFields";

type Proposal = {
  proposalId: string;
  initiatorId: string;
  initiatorName: string;
  difficulty: Difficulty;
  tieBreakerMode: "random" | "coin_toss";
  ageConfirmed: boolean;
  deadline: number; // epoch ms
};

type VoteMsg =
  | { event: "propose"; proposal: Proposal }
  | { event: "cast"; proposalId: string; userId: string; choice: "yes" | "no" }
  | { event: "resolved"; proposalId: string; passed: boolean }
  | { event: "cancel"; proposalId: string };

const VOTE_WINDOW_MS = 30_000;

export default function RestartControls({
  roomId,
  canForceStart,
  currentUserId,
  currentUserName,
  totalMembers,
  defaultDifficulty,
  defaultTieBreaker,
}: {
  roomId: string;
  canForceStart: boolean;
  currentUserId: string;
  currentUserName: string;
  totalMembers: number;
  defaultDifficulty: Difficulty;
  defaultTieBreaker: "random" | "coin_toss";
}) {
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [mode, setMode] = useState<"idle" | "picking-force" | "picking-vote">("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [tieBreakerMode, setTieBreakerMode] = useState<"random" | "coin_toss">(defaultTieBreaker);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Mirrors `proposal` for use inside the broadcast handler below, which is
  // registered once (empty-ish dep array) — reading `proposal` there
  // directly would close over a stale value forever.
  const proposalRef = useRef<Proposal | null>(null);
  useEffect(() => {
    proposalRef.current = proposal;
  }, [proposal]);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}:restart-vote`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "msg" }, ({ payload }: { payload: VoteMsg }) => {
        if (payload.event === "propose") {
          setProposal(payload.proposal);
          setVotes({ [payload.proposal.initiatorId]: "yes" });
        } else if (payload.event === "cast") {
          if (proposalRef.current?.proposalId === payload.proposalId) {
            setVotes((v) => ({ ...v, [payload.userId]: payload.choice }));
          }
        } else if (payload.event === "resolved" || payload.event === "cancel") {
          if (proposalRef.current?.proposalId === payload.proposalId) {
            setProposal(null);
            setVotes({});
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable per mount; roomId is the real dep, proposal is tracked via proposalRef to avoid resubscribing on every vote
  }, [roomId]);

  // Live countdown display, ticks locally rather than trusting each render.
  useEffect(() => {
    if (!proposal) return;
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((proposal.deadline - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [proposal]);

  const yesCount = Object.values(votes).filter((v) => v === "yes").length;
  const majorityNeeded = Math.floor(totalMembers / 2) + 1;
  const passed = yesCount >= majorityNeeded;

  async function resolve(didPass: boolean) {
    const p = proposalRef.current;
    if (!p) return;
    channelRef.current?.send({
      type: "broadcast",
      event: "msg",
      payload: { event: "resolved", proposalId: p.proposalId, passed: didPass } satisfies VoteMsg,
    });
    setProposal(null);
    setVotes({});

    if (didPass) {
      setStarting(true);
      const fd = new FormData();
      fd.set("room_id", roomId);
      fd.set("difficulty", p.difficulty);
      fd.set("tie_breaker_mode", p.tieBreakerMode);
      if (p.ageConfirmed) fd.set("age_confirmed", "on");
      const result = await startGameAction(null, fd);
      setStarting(false);
      if (result?.error) setError(result.error);
    }
  }

  // Only the proposal's own initiator resolves it — otherwise every
  // connected client would race to call startGameAction the instant the
  // threshold is crossed, creating duplicate sessions.
  useEffect(() => {
    if (!proposal || proposal.initiatorId !== currentUserId) return;
    const msLeft = proposal.deadline - Date.now();
    // Every path routes through setTimeout, even the "resolve immediately"
    // cases (delay 0) — calling resolve() straight from the effect body
    // means its setState calls run synchronously as part of the effect
    // itself, which is exactly what react-hooks/set-state-in-effect flags.
    // Deferring via setTimeout (matching what the "still waiting" case
    // already did) pushes it to its own task instead.
    const delay = passed || msLeft <= 0 ? 0 : msLeft;
    const shouldPass = passed;
    const timeout = setTimeout(() => void resolve(shouldPass), delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolve() reads the live proposal via proposalRef intentionally, not via deps
  }, [proposal, passed, currentUserId]);

  function castVote(choice: "yes" | "no") {
    if (!proposal) return;
    setVotes((v) => ({ ...v, [currentUserId]: choice }));
    channelRef.current?.send({
      type: "broadcast",
      event: "msg",
      payload: { event: "cast", proposalId: proposal.proposalId, userId: currentUserId, choice } satisfies VoteMsg,
    });
  }

  function propose() {
    if (needsAgeGate && !ageConfirmed) return;
    const newProposal: Proposal = {
      proposalId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      initiatorId: currentUserId,
      initiatorName: currentUserName,
      difficulty,
      tieBreakerMode,
      ageConfirmed,
      deadline: Date.now() + VOTE_WINDOW_MS,
    };
    setProposal(newProposal);
    setVotes({ [currentUserId]: "yes" });
    channelRef.current?.send({ type: "broadcast", event: "msg", payload: { event: "propose", proposal: newProposal } satisfies VoteMsg });
    channelRef.current?.send({
      type: "broadcast",
      event: "msg",
      payload: { event: "cast", proposalId: newProposal.proposalId, userId: currentUserId, choice: "yes" } satisfies VoteMsg,
    });
    setMode("idle");
  }

  async function forceStart() {
    if (needsAgeGate && !ageConfirmed) return;
    setStarting(true);
    setError(null);
    const fd = new FormData();
    fd.set("room_id", roomId);
    fd.set("difficulty", difficulty);
    fd.set("tie_breaker_mode", tieBreakerMode);
    if (needsAgeGate) fd.set("age_confirmed", "on");
    const result = await startGameAction(null, fd);
    setStarting(false);
    if (result?.error) setError(result.error);
    else setMode("idle");
  }

  const needsAgeGate = difficulty === "adult" || difficulty === "spicy";
  const canSubmit = !needsAgeGate || ageConfirmed;

  // --- Render ---

  if (proposal) {
    const myVote = votes[currentUserId];
    const label = DIFFICULTIES.find((d) => d.id === proposal.difficulty)?.label ?? proposal.difficulty;
    return (
      <div className="mt-8 w-full rounded-2xl border border-truth/40 bg-truth/10 p-5 text-left">
        <p className="text-sm text-ink-100">
          <span className="font-semibold text-truth">{proposal.initiatorName}</span>{" "}
          proposed a new game — {label} tier.
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-500">
          {yesCount}/{majorityNeeded} needed to pass · {timeLeft}s left
        </p>
        {myVote ? (
          <p className="mt-3 text-sm text-ink-400">You voted {myVote}.</p>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => castVote("yes")}
              className="flex-1 rounded-xl bg-truth py-2.5 font-display font-bold text-void-deep transition hover:bg-truth-dim"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => castVote("no")}
              className="flex-1 rounded-xl border border-surface-raised py-2.5 font-display font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100"
            >
              No
            </button>
          </div>
        )}
      </div>
    );
  }

  if (mode === "picking-force" || mode === "picking-vote") {
    return (
      <div className="mt-8 flex w-full flex-col gap-4 rounded-2xl border border-surface-raised bg-surface p-5 text-left">
        <GameSettingsFields
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          tieBreakerMode={tieBreakerMode}
          setTieBreakerMode={setTieBreakerMode}
          ageConfirmed={ageConfirmed}
          setAgeConfirmed={setAgeConfirmed}
        />
        {error && <p className="text-sm text-dare">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-xl border border-surface-raised py-3 font-display font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || starting}
            onClick={mode === "picking-force" ? forceStart : propose}
            className="rounded-xl bg-dare py-3 font-display font-bold text-void-deep transition enabled:hover:bg-dare-dim disabled:cursor-not-allowed disabled:opacity-40"
          >
            {starting ? "Starting…" : mode === "picking-force" ? "Start now" : "Propose vote"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid w-full grid-cols-2 gap-3">
      {canForceStart && (
        <button
          type="button"
          onClick={() => setMode("picking-force")}
          className="rounded-xl border border-surface-raised py-3 font-display font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100"
        >
          Force new game
        </button>
      )}
      <button
        type="button"
        onClick={() => setMode("picking-vote")}
        className={`rounded-xl border border-surface-raised py-3 font-display font-semibold text-ink-400 transition hover:border-ink-700 hover:text-ink-100 ${
          canForceStart ? "" : "col-span-2"
        }`}
      >
        Start a vote
      </button>
    </div>
  );
}
