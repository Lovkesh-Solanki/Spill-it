// lib/themes.ts
// Central definition of every SpillIt theme. Add new themes here — nothing
// else needs to change. Colors are CSS custom properties applied to <html>
// via data-theme, so any Tailwind class using var(--...) picks them up.

export type Theme = {
  id: string;
  name: string;
  secret?: boolean; // true = only unlockable via secret code, hidden from the normal switcher
  code?: string; // required if secret is true — case-insensitive match
  colors: {
    bg: string; // page background
    surface: string; // cards, prompt panel
    surfaceAlt: string; // secondary panels (scoreboard, etc)
    text: string; // primary text
    textMuted: string;
    accent: string; // primary brand accent (buttons, bottle pointer)
    accentText: string; // text/icon color that sits on top of accent
    border: string;
  };
};

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      bg: "#0B0B0C",
      surface: "#151517",
      surfaceAlt: "#1D1D20",
      text: "#F5F5F5",
      textMuted: "#9A9A9E",
      accent: "#E11D2E", // the red from the spillit.com logo
      accentText: "#FFFFFF",
      border: "#2A2A2D",
    },
  },
  {
    id: "neon-party",
    name: "Neon Party",
    colors: {
      bg: "#0A0A14",
      surface: "#15142A",
      surfaceAlt: "#1E1B3A",
      text: "#F2F0FF",
      textMuted: "#9C97C7",
      accent: "#00E5C7", // cyan
      accentText: "#0A0A14",
      border: "#2E2A55",
    },
  },
  {
    id: "blush",
    name: "Blush",
    colors: {
      bg: "#FFF6F8",
      surface: "#FFFFFF",
      surfaceAlt: "#FCE9EE",
      text: "#3A2530",
      textMuted: "#8A6E78",
      accent: "#FF5C8A",
      accentText: "#FFFFFF",
      border: "#F3D3DD",
    },
  },
  {
    id: "inferno",
    name: "Inferno",
    colors: {
      bg: "#160A05",
      surface: "#241008",
      surfaceAlt: "#341509",
      text: "#FFE9D6",
      textMuted: "#C79A78",
      accent: "#FF6A00",
      accentText: "#160A05",
      border: "#4A2210",
    },
  },
  // Secret / code-unlocked theme. Change SPILL_SECRET_CODE below (or move it
  // to an env var) before you ship — don't leave this literal string in a
  // public repo if you want it to stay genuinely hidden.
  {
    id: "gold-rush",
    name: "Gold Rush",
    secret: true,
    code: "SPILLGOLD",
    colors: {
      bg: "#0C0A05",
      surface: "#1A160A",
      surfaceAlt: "#241D0D",
      text: "#FBF3DB",
      textMuted: "#B8A876",
      accent: "#D4AF37",
      accentText: "#0C0A05",
      border: "#3A2F12",
    },
  },
];

export const DEFAULT_THEME_ID = "classic";

export function findThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function findThemeByCode(code: string): Theme | undefined {
  const normalized = code.trim().toLowerCase();
  return THEMES.find((t) => t.secret && t.code?.toLowerCase() === normalized);
}