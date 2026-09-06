"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, CornerDownLeft, Plus } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";
import { STUDIO_NAV_ITEMS } from "@/lib/studio/nav";

type Command = {
  id: string;
  label: string;
  group: string;
  href: string;
  create?: boolean;
};

const QUICK_ACTIONS: Command[] = [
  { id: "new-window", label: "New desktop window", group: "Create", href: "/admin/desktop/new", create: true },
  { id: "new-post", label: "New press & media post", group: "Create", href: "/admin/press-media/new", create: true },
  { id: "new-brand", label: "New brand", group: "Create", href: "/admin/brands/new", create: true },
  { id: "new-event", label: "New event", group: "Create", href: "/admin/events/new", create: true },
  { id: "upload-media", label: "Upload media", group: "Create", href: "/admin/media", create: true },
];

/**
 * The fix for "getting anywhere takes too many clicks". Every section and
 * every create action is one keystroke away regardless of where you are.
 */
export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Radix restores focus to its own Trigger on close, but this palette has no
  // Trigger — ⌘K and the header button both just flip state — so without the
  // pair of handlers below, dismissing it drops focus on <body> and the next
  // Tab restarts from the top of the page.
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...STUDIO_NAV_ITEMS.map((item) => ({
        id: `go-${item.href}`,
        label: item.label,
        group: "Go to",
        href: item.href,
      })),
      ...QUICK_ACTIONS,
    ],
    []
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.group}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset the query and selection each time it opens, so it never reopens
  // showing a stale search. Derived during render by comparing against the
  // previous value rather than via a setState-in-effect — the same pattern
  // StudioShell uses to close the mobile drawer, and what React recommends
  // for resetting state when a prop changes.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onOpenChange(false);
    router.push(command.href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(results[activeIndex]);
    }
  };

  let lastGroup = "";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            // Fires before Radix moves focus into the content, so this still
            // reads whatever was focused when the palette was summoned —
            // and it is an event handler, not render, so the ref write is
            // legal. Not prevented: the search input's autoFocus still wins.
            returnFocusTo.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            // Only meaningful when the palette is dismissed in place. After a
            // navigation the old element is gone from the document and the
            // guard below falls through to Radix's default.
            const target = returnFocusTo.current;
            if (target?.isConnected) {
              event.preventDefault();
              target.focus();
            }
          }}
          aria-label="Command palette"
          className="admin-root fixed left-1/2 top-[15vh] z-[61] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-admin-lg border border-admin-border bg-admin-bg shadow-2xl"
        >
          <Dialog.Title className="sr-only">Search the studio</Dialog.Title>

          <div className="flex items-center gap-2 border-b border-admin-border px-3">
            <Search
              className="h-4 w-4 shrink-0 text-admin-muted"
              aria-hidden="true"
            />
            <input
              // A command palette exists to be typed into the moment it opens.
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Jump to a section or create something..."
              aria-label="Search the studio"
              aria-controls="command-palette-results"
              className="h-11 w-full bg-transparent text-[13px] text-admin-fg placeholder:text-admin-muted focus:outline-none"
            />
          </div>

          <ul
            id="command-palette-results"
            role="listbox"
            className="max-h-72 overflow-y-auto p-1.5"
          >
            {results.length === 0 && (
              <li className="px-2 py-6 text-center text-[13px] text-admin-muted">
                Nothing matches “{query}”.
              </li>
            )}
            {results.map((command, i) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;
              const active = i === activeIndex;
              return (
                <li key={command.id}>
                  {showGroup && (
                    <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">
                      {command.group}
                    </p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => run(command)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-admin-sm px-2 py-1.5 text-left text-[13px] text-admin-fg",
                      FOCUS_RING,
                      active && "bg-admin-surface-hover"
                    )}
                  >
                    {command.create ? (
                      <Plus
                        className="h-3.5 w-3.5 shrink-0 text-admin-muted"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-0.5 shrink-0 rounded-full bg-admin-accent"
                      />
                    )}
                    <span className="flex-1 truncate">{command.label}</span>
                    {active && (
                      <CornerDownLeft
                        className="h-3 w-3 shrink-0 text-admin-muted"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
