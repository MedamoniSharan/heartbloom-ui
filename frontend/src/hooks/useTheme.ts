import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "heartprinted-theme";

function getSystemTheme(): Theme {
  return "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY) as Theme | null;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() || getSystemTheme();
  });

  const setTheme = useCallback((newTheme: Theme) => {
    // Use View Transition API if available
    const apply = () => {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem(STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    };

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as any).startViewTransition(apply);
    } else {
      apply();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Apply on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  // System preference listener removed to enforce default light theme

  return { theme, setTheme, toggleTheme };
}
