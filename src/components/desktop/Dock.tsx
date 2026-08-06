"use client";

import Link from "next/link";
import type { DockApp } from "./types";

export default function Dock({
  apps,
  openIds,
  onToggle,
}: {
  apps: DockApp[];
  openIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-[15px] rounded-squircle-lg border-2 border-black bg-lt-blue px-6 py-[18px]">
      {apps.map((app) => {
        const isOpen = openIds.includes(app.id);
        const className =
          "relative flex h-[60px] w-[60px] items-center justify-center transition-transform hover:-translate-y-0.5";

        const notificationBadge = app.notificationCount && (
          <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-lt-blue bg-lt-red text-micro font-bold text-white">
            {app.notificationCount}
          </span>
        );

        const openDot = isOpen && (
          <span className="absolute -bottom-1.5 left-1/2 h-[3px] w-[15px] -translate-x-1/2 rounded-full bg-white" />
        );

        if (app.href) {
          return (
            <Link
              key={app.id}
              href={app.href}
              data-dock-icon={app.id}
              aria-label={app.label}
              title={app.label}
              className={className}
            >
              {app.icon}
              {notificationBadge}
              {openDot}
            </Link>
          );
        }

        return (
          <button
            key={app.id}
            type="button"
            data-dock-icon={app.id}
            onClick={() => onToggle(app.id)}
            aria-label={app.label}
            title={app.label}
            className={className}
          >
            {app.icon}
            {notificationBadge}
            {openDot}
          </button>
        );
      })}
    </div>
  );
}
