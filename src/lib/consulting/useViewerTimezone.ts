"use client";

import { useCallback, useSyncExternalStore } from "react";

// The viewer's timezone is client-only state that the server cannot know.
//
// The obvious implementation -- detect it in a useEffect and setState -- works,
// but it triggers a cascading render and React's set-state-in-effect lint rule
// flags it. useSyncExternalStore is what this is for: it returns null during
// the server render and on the first client render, then the real zone, with no
// extra render pass and no chance of a hydration mismatch.
//
// Callers treat null as "not known yet" and render a skeleton, which is how the
// slot column gets its loading state for free.

const STORAGE_KEY = "lt-consult-tz";

let listeners: (() => void)[] = [];

// Survives a localStorage write being refused (private mode, blocked site data)
// so a chosen timezone still applies for the rest of the session.
let memoryOverride: string | null = null;

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function getSnapshot(): string {
  if (memoryOverride) return memoryOverride;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    // Blocked site data. Fall through to detection.
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Null on the server: there is no viewer there, and guessing causes mismatches. */
function getServerSnapshot(): null {
  return null;
}

export function useViewerTimezone(): [string | null, (zone: string) => void] {
  const zone = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setZone = useCallback((next: string) => {
    memoryOverride = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A remembered timezone is a convenience, not state we depend on.
    }
    listeners.forEach((l) => l());
  }, []);

  return [zone, setZone];
}
