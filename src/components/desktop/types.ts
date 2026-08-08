import type { ReactNode } from "react";
import type { TiptapDoc } from "@/lib/richtext/types";
import type { NewsfeedItem } from "./window-content/NewsfeedContent";
import type { StreamComment } from "./window-content/types";

export type WindowKind =
  | "video"
  | "article"
  | "photo"
  | "email"
  | "document"
  | "newsfeed"
  | "chat";

// Plain, serializable per-kind data rather than pre-built ReactNode. Built
// server-side in lib/desktop.tsx, which runs unconditionally for every
// device on every page load — if it returned actual <ChatContent>/
// <VideoContent> elements, every client component those import (notably
// ChatContent's Supabase realtime client) would ship in the page's initial
// bundle for ALL visitors, including mobile ones where this whole scene is
// never rendered. Keeping this as data means the "kind -> component" switch
// (WindowContent.tsx) only has to be imported by DesktopHero itself, which
// is dynamically imported and gated to desktop viewports.
export type WindowContentData =
  | {
      kind: "video";
      timestamp?: string;
      caption?: string;
      posterUrl?: string;
      videoUrl?: string;
      allowUnmute: boolean;
      broadcastTimeUpdates: boolean;
      loop: boolean;
    }
  | {
      kind: "article";
      headline: string;
      body?: TiptapDoc;
      paragraphs?: string[];
      withVideo?: boolean;
      imageUrl?: string;
    }
  | { kind: "photo"; caption?: string; imageUrl?: string }
  | {
      kind: "email";
      from?: string;
      subject?: string;
      dateLabel?: string;
      introBody?: string;
      ctaLabel?: string;
    }
  | { kind: "document"; headline: string; body?: TiptapDoc; paragraphs?: string[] }
  | { kind: "newsfeed"; items: NewsfeedItem[] }
  | { kind: "chat"; initialComments: StreamComment[] };

export type WindowDef = {
  id: string;
  kind: WindowKind;
  title: string;
  defaultX: number;
  defaultY: number;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  defaultOpen: boolean;
  content: WindowContentData;
};

export type WindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  open: boolean;
  minimized: boolean;
  isMaximized: boolean;
};

export type DockApp = {
  id: string;
  label: string;
  icon: ReactNode;
  // When set, this icon represents every live window of this kind (badge =
  // how many of them are unopened, click opens/minimizes them as a group)
  // instead of a single specific window row — so the icon survives window
  // content being deleted and rebuilt.
  kind?: WindowKind;
  notificationCount?: number;
  href?: string;
};
