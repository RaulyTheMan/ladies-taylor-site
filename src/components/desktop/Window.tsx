"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { WindowKind } from "./types";

const KIND_HEADER: Record<WindowKind, { bg: string; text: string }> = {
  video: { bg: "bg-lt-purple", text: "text-white" },
  article: { bg: "bg-lt-yellow", text: "text-black/70" },
  photo: { bg: "bg-lt-amber", text: "text-white" },
  email: { bg: "bg-lt-red", text: "text-white" },
  document: { bg: "bg-lt-green", text: "text-black/70" },
  newsfeed: { bg: "bg-lt-pale-blue", text: "text-black/70" },
  chat: { bg: "bg-lt-sky", text: "text-black/70" },
};

function tryCapturePointer(el: HTMLElement, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    // Pointer capture can throw if the browser doesn't consider this
    // pointerId "active" (e.g. certain synthetic/programmatic input). Not
    // having capture just means the drag/resize tracks via bubbling instead.
  }
}

type DockOffset = { dx: number; dy: number; scale: number };

function measureDockOffset(
  boundsRef: React.RefObject<HTMLDivElement | null>,
  dockIconId: string,
  x: number,
  y: number,
  width: number,
  height: number
): DockOffset | null {
  const boundsEl = boundsRef.current;
  const dockEl = document.querySelector<HTMLElement>(
    `[data-dock-icon="${dockIconId}"]`
  );
  if (!boundsEl || !dockEl) return null;

  const boundsRect = boundsEl.getBoundingClientRect();
  const dockRect = dockEl.getBoundingClientRect();

  const windowCenterX = boundsRect.left + x + width / 2;
  const windowCenterY = boundsRect.top + y + height / 2;
  const dockCenterX = dockRect.left + dockRect.width / 2;
  const dockCenterY = dockRect.top + dockRect.height / 2;

  return {
    dx: dockCenterX - windowCenterX,
    dy: dockCenterY - windowCenterY,
    scale: Math.max(dockRect.width / width, 0.05),
  };
}

function TrafficDot({
  bg,
  glyphColor,
  label,
  onClick,
  glyph,
}: {
  bg: string;
  glyphColor: string;
  label: string;
  onClick: () => void;
  glyph: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`group flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${bg}`}
    >
      <span
        className={`opacity-0 transition-opacity group-hover:opacity-100 ${glyphColor}`}
      >
        {glyph}
      </span>
    </button>
  );
}

export default function Window({
  kind,
  title,
  x,
  y,
  width,
  height,
  minWidth,
  minHeight,
  zIndex,
  minimized,
  dockIconId,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  onResize,
  onMaximize,
  boundsRef,
  children,
}: {
  kind: WindowKind;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  minimized: boolean;
  dockIconId: string;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onMaximize: () => void;
  boundsRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const dragState = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const resizeState = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const header = KIND_HEADER[kind];

  const [minimizeOffset, setMinimizeOffset] = useState<DockOffset | null>(
    null
  );

  useLayoutEffect(() => {
    if (!minimized) return;
    setMinimizeOffset(measureDockOffset(boundsRef, dockIconId, x, y, width, height));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimized]);

  const handleDragDown = (e: React.PointerEvent) => {
    onFocus();
    tryCapturePointer(e.target as HTMLElement, e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - x,
      offsetY: e.clientY - y,
    };
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!dragState.current || dragState.current.pointerId !== e.pointerId)
      return;

    let nextX = e.clientX - dragState.current.offsetX;
    let nextY = e.clientY - dragState.current.offsetY;

    const bounds = boundsRef.current?.getBoundingClientRect();
    if (bounds) {
      nextX = Math.min(Math.max(nextX, 0), Math.max(bounds.width - width, 0));
      nextY = Math.min(
        Math.max(nextY, 0),
        Math.max(bounds.height - height, 0)
      );
    }

    onMove(nextX, nextY);
  };

  const handleDragUp = (e: React.PointerEvent) => {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null;
    }
  };

  const handleResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onFocus();
    tryCapturePointer(e.target as HTMLElement, e.pointerId);
    resizeState.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startWidth: width,
      startHeight: height,
    };
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizeState.current || resizeState.current.pointerId !== e.pointerId)
      return;
    e.stopPropagation();

    const { startClientX, startClientY, startWidth, startHeight } =
      resizeState.current;

    let nextWidth = startWidth + (e.clientX - startClientX);
    let nextHeight = startHeight + (e.clientY - startClientY);

    const bounds = boundsRef.current?.getBoundingClientRect();
    const maxWidth = bounds ? bounds.width - x : Infinity;
    const maxHeight = bounds ? bounds.height - y : Infinity;

    nextWidth = Math.min(
      Math.max(nextWidth, minWidth),
      Math.max(maxWidth, minWidth)
    );
    nextHeight = Math.min(
      Math.max(nextHeight, minHeight),
      Math.max(maxHeight, minHeight)
    );

    onResize(nextWidth, nextHeight);
  };

  const handleResizeUp = (e: React.PointerEvent) => {
    if (resizeState.current?.pointerId === e.pointerId) {
      resizeState.current = null;
    }
  };

  const identity = { x: 0, y: 0, scale: 1, opacity: 1 };
  const animateState =
    minimized && minimizeOffset
      ? {
          x: minimizeOffset.dx,
          y: minimizeOffset.dy,
          scale: minimizeOffset.scale,
          opacity: 0,
        }
      : identity;

  return (
    <motion.div
      onPointerDown={onFocus}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        zIndex,
        pointerEvents: minimized ? "none" : "auto",
      }}
      initial={false}
      animate={animateState}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="window-border select-none overflow-hidden rounded-squircle-lg bg-lt-panel"
    >
      <div className="flex h-full flex-col">
        <div
          onPointerDown={handleDragDown}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragUp}
          className={`flex h-8 shrink-0 cursor-grab touch-none items-center gap-1.5 px-3 active:cursor-grabbing ${header.bg}`}
        >
          <TrafficDot
            bg="bg-lt-red"
            glyphColor="text-black/70"
            label="Close window"
            onClick={onClose}
            glyph={
              <svg width="6" height="6" viewBox="0 0 6 6">
                <path
                  d="M0.5 0.5L5.5 5.5M5.5 0.5L0.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <TrafficDot
            bg="bg-black"
            glyphColor="text-white"
            label="Minimize window"
            onClick={onMinimize}
            glyph={
              <svg width="6" height="6" viewBox="0 0 6 6">
                <path
                  d="M0.5 3H5.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <TrafficDot
            bg="bg-lt-green"
            glyphColor="text-black/70"
            label="Expand window"
            onClick={onMaximize}
            glyph={
              <svg width="6" height="6" viewBox="0 0 6 6">
                <rect
                  x="0.5"
                  y="0.5"
                  width="5"
                  height="5"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            }
          />

          <span
            className={`ml-1 truncate text-xs font-semibold ${header.text}`}
          >
            {title}
          </span>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>

      <div
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp}
        aria-hidden
        className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize touch-none"
      >
        <svg
          viewBox="0 0 16 16"
          className="absolute bottom-1 right-1 h-2.5 w-2.5 text-black/40"
        >
          <path
            d="M14 2L2 14M14 8L8 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
