"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Window from "./Window";
import Dock from "./Dock";
import DesktopFolder from "./DesktopFolder";
import { WindowContent } from "./WindowContent";
import { STREAM_TIME_UPDATE_EVENT } from "./window-content/VideoContent";
import type { DockApp, WindowDef, WindowKind, WindowState } from "./types";

const OPENED_STORAGE_KEY = "lt_opened_windows";

// Scripted reveal: as the main stream video plays, these windows (matched by
// title) pop open on their own at the given playback timestamps.
const STREAM_SYNC_CUES: { atSeconds: number; windowTitle: string }[] = [
  { atSeconds: 73, windowTitle: "We're back baby" },
  { atSeconds: 86, windowTitle: "Babylon Launch" },
  { atSeconds: 102, windowTitle: "get-in-touch" },
];

function readOpenedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(OPENED_STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? new Set(ids) : new Set();
  } catch {
    return new Set();
  }
}

function writeOpenedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OPENED_STORAGE_KEY, JSON.stringify([...ids]));
}

// The video+chat "stream" layout (see lib/desktop.tsx) is pinned at fixed
// pixel positions sized for a wide desktop viewport. Anything narrower —
// most tablets, plenty of laptops — would otherwise render those windows
// partially or fully past the edge of this section's `overflow-hidden`
// bounds, with no scrollbar and no way to drag/resize them back into view
// (the resize handle itself would be off-screen). This clamps every open,
// non-maximized window's rect into whatever the bounds actually measure at
// right now, so it always opens fully reachable regardless of viewport size.
function clampRect(
  rect: { x: number; y: number; width: number; height: number },
  minWidth: number,
  minHeight: number,
  bounds: { width: number; height: number }
) {
  const width = Math.max(minWidth, Math.min(rect.width, bounds.width));
  const height = Math.max(minHeight, Math.min(rect.height, bounds.height));
  const x = Math.min(Math.max(rect.x, 0), Math.max(bounds.width - width, 0));
  const y = Math.min(Math.max(rect.y, 0), Math.max(bounds.height - height, 0));
  return { x, y, width, height };
}

function buildInitialState(
  windowDefs: WindowDef[]
): Record<string, WindowState> {
  const state: Record<string, WindowState> = {};
  windowDefs.forEach((def, i) => {
    state[def.id] = {
      x: def.defaultX,
      y: def.defaultY,
      width: def.defaultWidth,
      height: def.defaultHeight,
      zIndex: 10 + i,
      open: def.defaultOpen,
      minimized: false,
      isMaximized: false,
    };
  });
  return state;
}

export default function DesktopHero({
  windowDefs,
  dockApps,
}: {
  windowDefs: WindowDef[];
  dockApps: DockApp[];
}) {
  const [windows, setWindows] = useState<Record<string, WindowState>>(() =>
    buildInitialState(windowDefs)
  );
  const zCounter = useRef(20);

  // windowDefs load asynchronously (see DesktopHeroGate) and can arrive
  // after this component has already mounted with an empty array, so the
  // lazy useState initializer above never sees them. Backfill any def that
  // doesn't have state yet without touching windows already in progress
  // (moved, resized, opened/closed by the visitor).
  useEffect(() => {
    setWindows((prev) => {
      let changed = false;
      const next = { ...prev };
      windowDefs.forEach((def, i) => {
        if (next[def.id]) return;
        changed = true;
        next[def.id] = {
          x: def.defaultX,
          y: def.defaultY,
          width: def.defaultWidth,
          height: def.defaultHeight,
          zIndex: 10 + i,
          open: def.defaultOpen,
          minimized: false,
          isMaximized: false,
        };
      });
      return changed ? next : prev;
    });
  }, [windowDefs]);

  const boundsRef = useRef<HTMLDivElement>(null);
  const restoreRects = useRef<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  const clampOpenWindows = () => {
    const bounds = boundsRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;
    setWindows((prev) => {
      let changed = false;
      const next = { ...prev };
      windowDefs.forEach((def) => {
        const w = next[def.id];
        if (!w || !w.open || w.isMaximized) return;
        const clamped = clampRect(w, def.minWidth, def.minHeight, bounds);
        if (
          clamped.x !== w.x ||
          clamped.y !== w.y ||
          clamped.width !== w.width ||
          clamped.height !== w.height
        ) {
          changed = true;
          next[def.id] = { ...w, ...clamped };
        }
      });
      return changed ? next : prev;
    });
  };

  // Fixes up any already-open windows (default-open ones) the moment bounds
  // are first measurable, and again whenever the viewport itself resizes or
  // rotates (e.g. a tablet flipping orientation after a window is open).
  useLayoutEffect(() => {
    clampOpenWindows();
    window.addEventListener("resize", clampOpenWindows);
    return () => window.removeEventListener("resize", clampOpenWindows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowDefs]);

  // Which windows this visitor has ever opened, persisted per-device so the
  // "unopened" badge only ever shows genuinely new content.
  const [openedIds, setOpenedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const stored = readOpenedIds();
    const defaultOpenIds = windowDefs
      .filter((def) => def.defaultOpen)
      .map((def) => def.id);
    const merged = new Set([...stored, ...defaultOpenIds]);
    // localStorage doesn't exist during SSR, so this can only be read after
    // mount — the state starts empty (matching the server render) and is
    // synced here to avoid a hydration mismatch on the badge counts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenedIds(merged);
    writeOpenedIds(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markOpened = (ids: string[]) => {
    setOpenedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      writeOpenedIds(next);
      return next;
    });
  };

  const windowsByKind = useMemo(() => {
    const map = new Map<WindowKind, WindowDef[]>();
    windowDefs.forEach((def) => {
      const list = map.get(def.kind) ?? [];
      list.push(def);
      map.set(def.kind, list);
    });
    return map;
  }, [windowDefs]);

  const dockAppForKind = (kind: WindowKind) =>
    dockApps.find((app) => app.kind === kind);

  const focus = (id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], zIndex: z } }));
  };

  const move = (id: string, x: number, y: number) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], x, y } }));
  };

  const resize = (id: string, width: number, height: number) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], width, height } }));
  };

  const toggleMaximize = (id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) => {
      const w = prev[id];
      if (!w.isMaximized) {
        restoreRects.current[id] = {
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
        };
        const bounds = boundsRef.current?.getBoundingClientRect();
        const margin = 16;
        return {
          ...prev,
          [id]: {
            ...w,
            x: margin,
            y: margin,
            width: bounds ? bounds.width - margin * 2 : w.width,
            height: bounds ? bounds.height - margin * 2 : w.height,
            isMaximized: true,
            zIndex: z,
          },
        };
      }

      const restore = restoreRects.current[id];
      return {
        ...prev,
        [id]: {
          ...w,
          ...(restore ?? {}),
          isMaximized: false,
          zIndex: z,
        },
      };
    });
    clampOpenWindows();
  };

  const close = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: false, minimized: false },
    }));
  };

  const minimize = (id: string) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], minimized: true } }));
  };

  const restore = (id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], minimized: false, zIndex: z },
    }));
  };

  const openWindow = (id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: true, minimized: false, zIndex: z },
    }));
    markOpened([id]);
    clampOpenWindows();
  };

  // Listens for the main stream video's playback time (broadcast by
  // VideoContent) and pops open each scripted window once its cue point is
  // crossed — fires at most once per cue per page load, even if the video
  // loops back around.
  const firedCuesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    function handleStreamTime(e: Event) {
      const currentTime = (e as CustomEvent<number>).detail;
      for (const cue of STREAM_SYNC_CUES) {
        if (firedCuesRef.current.has(cue.windowTitle)) continue;
        if (currentTime < cue.atSeconds) continue;
        const def = windowDefs.find((d) => d.title === cue.windowTitle);
        if (!def) continue;
        firedCuesRef.current.add(cue.windowTitle);
        openWindow(def.id);
      }
    }
    window.addEventListener(STREAM_TIME_UPDATE_EVENT, handleStreamTime);
    return () =>
      window.removeEventListener(STREAM_TIME_UPDATE_EVENT, handleStreamTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowDefs]);

  // Dock icons represent a whole kind (e.g. every "article" window), not one
  // specific window row. Clicking opens whichever of that kind aren't open
  // yet (and marks them read); if they're all already open, it minimizes or
  // restores them together instead.
  const handleDockAppClick = (dockAppId: string) => {
    const app = dockApps.find((a) => a.id === dockAppId);
    if (!app?.kind) return;
    const group = windowsByKind.get(app.kind) ?? [];
    if (group.length === 0) return;

    const anyClosed = group.some((def) => !windows[def.id]?.open);
    const anyMinimized = group.some(
      (def) => windows[def.id]?.open && windows[def.id]?.minimized
    );

    if (anyClosed) {
      zCounter.current += 1;
      const z = zCounter.current;
      setWindows((prev) => {
        const next = { ...prev };
        group.forEach((def) => {
          next[def.id] = { ...next[def.id], open: true, minimized: false, zIndex: z };
        });
        return next;
      });
      markOpened(group.map((def) => def.id));
      clampOpenWindows();
      return;
    }

    if (anyMinimized) {
      group.forEach((def) => restore(def.id));
      return;
    }

    group.forEach((def) => minimize(def.id));
  };

  const openDockAppIds = dockApps
    .filter(
      (app) =>
        app.kind &&
        (windowsByKind.get(app.kind) ?? []).some(
          (def) => windows[def.id]?.open
        )
    )
    .map((app) => app.id);

  const displayApps: DockApp[] = dockApps.map((app) => {
    if (!app.kind) return app;
    const group = windowsByKind.get(app.kind) ?? [];
    const unopenedCount = group.filter((def) => !openedIds.has(def.id)).length;
    return {
      ...app,
      notificationCount: unopenedCount > 0 ? unopenedCount : undefined,
    };
  });

  return (
    <section ref={boundsRef} className="relative min-h-0 flex-1 overflow-hidden">
      <DesktopFolder
        label="Our Work"
        href="/best-of-bands"
        className="right-4 top-4 md:right-8 md:top-8"
      />

      {windowDefs.map((def) => {
        const state = windows[def.id];
        if (!state?.open) return null;
        return (
          <Window
            key={def.id}
            kind={def.kind}
            title={def.title}
            x={state.x}
            y={state.y}
            width={state.width}
            height={state.height}
            minWidth={def.minWidth}
            minHeight={def.minHeight}
            zIndex={state.zIndex}
            minimized={state.minimized}
            dockIconId={dockAppForKind(def.kind)?.id ?? def.id}
            onFocus={() => focus(def.id)}
            onClose={() => close(def.id)}
            onMinimize={() => minimize(def.id)}
            onMove={(x, y) => move(def.id, x, y)}
            onResize={(w, h) => resize(def.id, w, h)}
            onMaximize={() => toggleMaximize(def.id)}
            boundsRef={boundsRef}
          >
            <WindowContent data={def.content} />
          </Window>
        );
      })}

      <div className="absolute inset-x-0 bottom-5 z-[9999] flex justify-center px-4">
        <Dock apps={displayApps} openIds={openDockAppIds} onToggle={handleDockAppClick} />
      </div>
    </section>
  );
}
