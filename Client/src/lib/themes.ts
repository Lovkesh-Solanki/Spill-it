// Central theme registry. Every theme fills the SAME color roles already
// used throughout the app (void, surface, truth, dare, spicy, ink scale) —
// see globals.css's `@theme inline` block. Because those Tailwind utilities
// (bg-void, text-dare, border-surface-raised, etc.) reference the CSS custom
// properties at runtime rather than baking in a hex value, swapping these
// variables on <html> re-themes every existing component with zero changes
// to component code.
//
// To add a theme: add an entry here. Nothing else needs to change.

export type ThemeColors = {
  void: string;
  voidDeep: string;
  surface: string;
  surfaceRaised: string;
  truth: string;
  truthDim: string;
  dare: string;
  dareDim: string;
  spicy: string;
  ink100: string;
  ink400: string;
  ink500: string;
  ink700: string;
};

export type Theme = {
  id: string;
  name: string;
  secret?: boolean; // hidden from the switcher until unlocked via code
  code?: string; // case-insensitive; required when secret is true
  colors: ThemeColors;
};

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      void: "#14101f",
      voidDeep: "#0c0915",
      surface: "#1f1730",
      surfaceRaised: "#291f3f",
      truth: "#22e6c2",
      truthDim: "#16a892",
      dare: "#ff3e8e",
      dareDim: "#cc2b6f",
      spicy: "#ffb020",
      ink100: "#f3eefa",
      ink400: "#c9bcdd",
      ink500: "#a99bc2",
      ink700: "#6b5d85",
    },
  },
  {
    id: "neon-arcade",
    name: "Neon Arcade",
    colors: {
      void: "#05070f",
      voidDeep: "#020308",
      surface: "#0d1326",
      surfaceRaised: "#141c38",
      truth: "#baff29",
      truthDim: "#8fcc17",
      dare: "#ff2ec4",
      dareDim: "#cc1f9c",
      spicy: "#29e5ff",
      ink100: "#eef4ff",
      ink400: "#a9b8e0",
      ink500: "#8593bd",
      ink700: "#4a5480",
    },
  },
  {
    id: "sunset-blush",
    name: "Sunset Blush",
    colors: {
      void: "#1f0f16",
      voidDeep: "#150a0f",
      surface: "#2e1620",
      surfaceRaised: "#3d1e2b",
      truth: "#ff8f6b",
      truthDim: "#e06f4a",
      dare: "#ff4f81",
      dareDim: "#d13566",
      spicy: "#ffcf5c",
      ink100: "#fdf1f0",
      ink400: "#e3bcc4",
      ink500: "#c299a3",
      ink700: "#7a5560",
    },
  },
  {
    id: "inferno",
    name: "Inferno",
    colors: {
      void: "#0f0806",
      voidDeep: "#090403",
      surface: "#1e0f0a",
      surfaceRaised: "#2c150d",
      truth: "#ffb454",
      truthDim: "#e6953a",
      dare: "#ff4b2b",
      dareDim: "#d6331a",
      spicy: "#ffe14d",
      ink100: "#fff2e8",
      ink400: "#e0b49a",
      ink500: "#b88d74",
      ink700: "#6e4a3a",
    },
  },
  // Secret theme — unlocked by entering the code in the switcher's hidden
  // field. Change this code before shipping; anyone who reads the deployed
  // JS bundle can find it, so treat it as an easter egg, not real security.
  {
    id: "gold-rush",
    name: "Gold Rush",
    secret: true,
    code: "SPILLGOLD",
    colors: {
      void: "#0c0a05",
      voidDeep: "#070603",
      surface: "#191408",
      surfaceRaised: "#241d0d",
      truth: "#f0c75e",
      truthDim: "#c9a445",
      dare: "#b0242c",
      dareDim: "#8c1c22",
      spicy: "#ffe27a",
      ink100: "#fbf3db",
      ink400: "#d8c48e",
      ink500: "#b8a876",
      ink700: "#6b5c34",
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

// Maps a camelCase key from ThemeColors to its CSS custom property name,
// e.g. "voidDeep" -> "--color-void-deep".
export function colorKeyToCssVar(key: string): string {
  return `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}
