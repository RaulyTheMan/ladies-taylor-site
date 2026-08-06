"use client";

import { AnimatePresence, motion } from "framer-motion";

export type Reaction = { id: string; emoji: string };

export function EmojiReactionOverlay({ reactions }: { reactions: Reaction[] }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-9 overflow-hidden"
    >
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.span
            key={r.id}
            initial={{ left: "-8%", opacity: 0 }}
            animate={{ left: "104%", opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "linear" }}
            style={{ position: "absolute", top: 4 }}
            className="text-xl"
          >
            {r.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
