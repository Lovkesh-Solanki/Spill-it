"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
  selectedPlayerId: string | null;
  settled: boolean;
  onSpin: () => void;
  onLanded: () => void;
  turnCount: number;
}

const SIZE = 400;
const CENTER = SIZE / 2;
const NODE_RADIUS = 150;
const SPIN_MS = 3000;

export default function SpinTable({
  players,
  selectedPlayerId,
  settled,
  onSpin,
  onLanded,
  turnCount,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const animatingFor = useRef<string | null>(null);

  const n = players.length;
  const angleFor = (i: number) => (360 / n) * i;

  useEffect(() => {
    if (!selectedPlayerId) return;
    if (animatingFor.current === selectedPlayerId) return;
    animatingFor.current = selectedPlayerId;

    const idx = players.findIndex((p) => p.id === selectedPlayerId);
    if (idx === -1) return;

    const target = angleFor(idx);
    const current = rotationRef.current % 360;
    const forwardDelta = (target - current + 360) % 360;
    const next = rotationRef.current + 360 * 4 + forwardDelta;

    rotationRef.current = next;
    setRotation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayerId]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[380px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full">
          {/* table ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={NODE_RADIUS + 26}
            fill="none"
            stroke="var(--color-surface-raised)"
            strokeWidth={1}
          />

          {/* player nodes */}
          {players.map((p, i) => {
            const deg = angleFor(i) - 90; // -90 so index 0 sits at top
            const rad = (deg * Math.PI) / 180;
            const x = CENTER + NODE_RADIUS * Math.cos(rad);
            const y = CENTER + NODE_RADIUS * Math.sin(rad);
            const isChosen = settled && p.id === selectedPlayerId;
            return (
              <g key={p.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={26}
                  fill="var(--color-surface)"
                  stroke={isChosen ? "var(--color-dare)" : "var(--color-surface-raised)"}
                  strokeWidth={isChosen ? 3 : 1.5}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={18}
                  fontWeight={700}
                  fill="var(--color-ink-100)"
                  fontFamily="var(--font-display)"
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </text>
                <text
                  x={x}
                  y={y + 44}
                  textAnchor="middle"
                  fontSize={12}
                  fill="var(--color-ink-500)"
                  fontFamily="var(--font-sans)"
                >
                  {p.name.length > 10 ? `${p.name.slice(0, 9)}…` : p.name}
                </text>
              </g>
            );
          })}

          {/* pointer */}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CENTER}px ${CENTER}px`,
              transition: `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.7, 0.1, 1)`,
            }}
            onTransitionEnd={() => {
              if (selectedPlayerId && animatingFor.current === selectedPlayerId) {
                onLanded();
              }
            }}
          >
            <polygon
              points={`${CENTER},${CENTER - 92} ${CENTER - 12},${CENTER - 30} ${CENTER + 12},${CENTER - 30}`}
              fill="var(--color-dare)"
            />
            <circle cx={CENTER} cy={CENTER} r={16} fill="var(--color-dare)" />
          </g>
        </svg>
      </div>

      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink-500">
        Turn {turnCount + 1}
      </p>

      {!settled && (
        <button
          type="button"
          onClick={onSpin}
          disabled={!!selectedPlayerId}
          className="mt-6 rounded-full bg-truth px-10 py-4 font-display text-lg font-bold text-void-deep transition enabled:hover:bg-truth-dim disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedPlayerId ? "Spinning…" : "Spin the bottle"}
        </button>
      )}
    </div>
  );
}
