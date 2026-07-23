"use client";

import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ParticleKind } from "@/lib/themes";

type ParticleSpec = {
  left: number; // %
  top: number; // % (only used by the "stars" kind, which doesn't fall/rise)
  delay: number; // s
  duration: number; // s
  scale: number; // 0.6 - 1.4
  drift: number; // vw of horizontal sway over the animation's lifetime
};

const COUNTS: Record<ParticleKind, number> = {
  petals: 16,
  stars: 34,
  embers: 14,
};

// One arbitrary "seed" multiplier per kind, just so petals/stars/embers don't
// all land on the same fractional positions when their counts overlap.
const SEEDS: Record<ParticleKind, number> = {
  petals: 12.9898,
  stars: 78.233,
  embers: 37.719,
};

// Deterministic pseudo-random generator (classic sine-fract trick) instead of
// Math.random(). This keeps the exact same layout on every render for a given
// theme — no reshuffling mid-game, and critically no risk of an SSR/CSR
// mismatch, since the values never depend on when/where they're computed.
function seededSpecs(count: number, seed: number): ParticleSpec[] {
  const frac = (x: number) => x - Math.floor(x);
  return Array.from({ length: count }, (_, i) => {
    const n = (i + 1) * seed;
    return {
      left: frac(Math.sin(n) * 43758.5453) * 100,
      top: frac(Math.sin(n * 0.9) * 24634.6345) * 100,
      delay: frac(Math.sin(n * 1.7) * 12345.6) * 10,
      duration: 6 + frac(Math.sin(n * 2.3) * 9999) * 8,
      scale: 0.6 + frac(Math.sin(n * 3.1) * 5555) * 0.8,
      drift: frac(Math.sin(n * 4.4) * 7777) * 40 - 20,
    };
  });
}

/**
 * Purely decorative animated layer (floating petals, twinkling stars, rising
 * embers) that activates for premium themes via each theme's `particle`
 * field in the registry. Renders nothing for themes without one, so it's a
 * no-op for every free theme.
 *
 * Motion is disabled outright under `prefers-reduced-motion` (see
 * globals.css) — same intent as the existing `.ambient-glow` background, but
 * particles are hidden entirely rather than just frozen in place, since a
 * few dozen small static dots read as clutter rather than ambience.
 */
export default function ThemeParticles() {
  const { theme } = useTheme();
  const kind = theme.particle;

  const specs = useMemo(() => {
    if (!kind) return [];
    return seededSpecs(COUNTS[kind], SEEDS[kind]);
  }, [kind]);

  if (!kind) return null;

  return (
    <div className="theme-particles" aria-hidden="true">
      {specs.map((s, i) => (
        <span
          key={i}
          className={`particle particle-${kind}`}
          style={
            {
              "--left": `${s.left}%`,
              "--top": `${s.top}%`,
              "--delay": `${s.delay}s`,
              "--duration": `${s.duration}s`,
              "--scale": s.scale,
              "--drift": `${s.drift}vw`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
