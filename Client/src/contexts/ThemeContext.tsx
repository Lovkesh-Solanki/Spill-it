"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME_ID,
  THEMES,
  colorKeyToCssVar,
  findThemeByCode,
  findThemeById,
  type Theme,
} from "@/lib/themes";

const STORAGE_KEY = "spillit-theme";
const UNLOCKED_KEY = "spillit-unlocked-themes";

type UnlockResult = { success: boolean; themeName?: string };

type ThemeContextValue = {
  theme: Theme;
  setThemeId: (id: string) => void;
  visibleThemes: Theme[];
  tryUnlockCode: (code: string) => UnlockResult;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(colorKeyToCssVar(key), value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);
  const [unlockedSecretIds, setUnlockedSecretIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage here (rather than in a lazy useState initializer)
    // is intentional: localStorage doesn't exist during SSR, so hydrating
    // synchronously would mismatch the server-rendered markup. Applying the
    // saved value after mount instead is the standard fix for this exact
    // situation.
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedTheme && findThemeById(savedTheme)) setThemeIdState(savedTheme);

    const savedUnlocked = localStorage.getItem(UNLOCKED_KEY);
    if (savedUnlocked) {
      try {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed)) setUnlockedSecretIds(parsed);
      } catch {
        // corrupt localStorage value — ignore and start fresh
      }
    }
    setHydrated(true);
  }, []);

  const theme = useMemo(
    () => findThemeById(themeId) ?? findThemeById(DEFAULT_THEME_ID)!,
    [themeId]
  );

  useEffect(() => {
    if (hydrated) applyThemeToDocument(theme);
  }, [theme, hydrated]);

  const setThemeId = useCallback((id: string) => {
    if (!findThemeById(id)) return;
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const tryUnlockCode = useCallback(
    (code: string): UnlockResult => {
      const match = findThemeByCode(code);
      if (!match) return { success: false };
      setUnlockedSecretIds((prev) => {
        if (prev.includes(match.id)) return prev;
        const next = [...prev, match.id];
        localStorage.setItem(UNLOCKED_KEY, JSON.stringify(next));
        return next;
      });
      setThemeId(match.id);
      return { success: true, themeName: match.name };
    },
    [setThemeId]
  );

  const visibleThemes = useMemo(
    () => THEMES.filter((t) => !t.secret || unlockedSecretIds.includes(t.id)),
    [unlockedSecretIds]
  );

  return (
    <ThemeContext.Provider value={{ theme, setThemeId, visibleThemes, tryUnlockCode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
