import type { ReactNode } from "react";

export type WindowKind =
  | "video"
  | "article"
  | "photo"
  | "email"
  | "document"
  | "newsfeed"
  | "chat";

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
  content: ReactNode;
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
