"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const uid = useId();
  const liquidId = `spin-liquid-${uid}`;
  const glassId = `spin-glass-${uid}`;
  const clipId = `spin-bottle-clip-${uid}`;

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
          <defs>
            <linearGradient id={liquidId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-dare)" />
              <stop offset="100%" stopColor="var(--color-truth)" />
            </linearGradient>
            <linearGradient id={glassId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
            </linearGradient>
            <clipPath id={clipId}>
              <path
                d="
                  M 103 78 L 103 58 Q 103 44 120 44 Q 137 44 137 58 L 137 78
                  L 132 84 L 132 160 Q 132 178 150 196 Q 168 214 168 238
                  L 168 398 Q 168 430 146 430 L 94 430 Q 72 430 72 398
                  L 72 238 Q 72 214 90 196 Q 108 178 108 160 L 108 84 Z
                "
              />
            </clipPath>
          </defs>
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

          {/* the bottle */}
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
            <ellipse cx={CENTER} cy={CENTER + 35} rx={26} ry={6} fill="#000000" opacity={0.3} />
            {/* Scales/positions the 240x460 bottle artwork so its neck tip
                lands where the old pointer's tip used to (CENTER, CENTER-92
                ish) and its base sits just past center — see SIZE/CENTER
                constants above for the coordinate space this lives in. */}
            <g transform={`translate(${CENTER - 44.24},${CENTER - 125.44}) scale(0.3731)`}>
              <path
                d="
                  M 103 78 L 103 58 Q 103 44 120 44 Q 137 44 137 58 L 137 78
                  L 132 84 L 132 160 Q 132 178 150 196 Q 168 214 168 238
                  L 168 398 Q 168 430 146 430 L 94 430 Q 72 430 72 398
                  L 72 238 Q 72 214 90 196 Q 108 178 108 160 L 108 84 Z
                "
                fill="var(--color-void-deep)"
                fillOpacity={0.35}
                stroke="var(--color-ink-100)"
                strokeOpacity={0.6}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <rect
                x={68}
                y={250}
                width={104}
                height={180}
                fill={`url(#${liquidId})`}
                clipPath={`url(#${clipId})`}
                opacity={0.92}
              />
              <ellipse
                cx={120}
                cy={250}
                rx={46}
                ry={7}
                fill="#ffffff"
                opacity={0.15}
                clipPath={`url(#${clipId})`}
              />
              <path
                d="
                  M 103 78 L 103 58 Q 103 44 120 44 Q 137 44 137 58 L 137 78
                  L 132 84 L 132 160 Q 132 178 150 196 Q 168 214 168 238
                  L 168 398 Q 168 430 146 430 L 94 430 Q 72 430 72 398
                  L 72 238 Q 72 214 90 196 Q 108 178 108 160 L 108 84 Z
                "
                fill={`url(#${glassId})`}
              />
              <path
                d="M 86 245 L 86 415 Q 86 422 93 422 L 97 422 L 97 245 Z"
                fill="#ffffff"
                opacity={0.2}
              />
              <rect x={107} y={28} width={26} height={20} rx={4} fill="#c9a06b" />
              <rect x={107} y={28} width={26} height={6} rx={3} fill="#dab98a" />
            </g>
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