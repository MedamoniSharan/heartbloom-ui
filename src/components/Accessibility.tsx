import { useEffect, useRef, useCallback } from "react";

/**
 * Keyboard shortcut manager
 * Register global keyboard shortcuts with callbacks
 */
interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const s of shortcuts) {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();
        const ctrlMatch = !s.ctrl || e.ctrlKey || e.metaKey;
        const shiftMatch = !s.shift || e.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          s.handler();
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}

/**
 * Focus trap for modals/dialogs
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusables = container.querySelectorAll<HTMLElement>(focusableSelector);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Focus the first focusable element
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [active]);

  return containerRef;
}

/**
 * Announce message to screen readers via aria-live region
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const el = document.getElementById(`sr-announcer-${priority}`);
    if (el) {
      el.textContent = "";
      // Force re-read by clearing then setting after brief delay
      requestAnimationFrame(() => {
        el.textContent = message;
      });
    }
  }, []);

  return announce;
}

/**
 * Skip to main content link (rendered in App)
 */
export const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-primary-foreground focus:shadow-elevated"
  >
    Skip to main content
  </a>
);

/**
 * Screen reader announcer regions
 */
export const SRAnnouncer = () => (
  <>
    <div id="sr-announcer-polite" aria-live="polite" aria-atomic="true" className="sr-only" />
    <div id="sr-announcer-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
  </>
);
