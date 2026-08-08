"use client";

import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MinimizedContext } from "../Window";

const EMOJIS = ["😂", "🔥", "👏"];

export function FloatingEmoji() {
  const minimized = useContext(MinimizedContext);
  const [items, setItems] = useState<
    { id: number; emoji: string; left: number }[]
  >([]);

  useEffect(() => {
    if (minimized) return;
    let nextId = 0;
    const interval = setInterval(() => {
      const id = nextId++;
      setItems((prev) => [
        ...prev,
        {
          id,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          left: 10 + Math.random() * 80,
        },
      ]);
      setTimeout(
        () => setItems((prev) => prev.filter((i) => i.id !== id)),
        2600
      );
    }, 2200);
    return () => clearInterval(interval);
  }, [minimized]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -160, opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            style={{ left: `${item.left}%` }}
            className="absolute bottom-8 text-xl"
          >
            {item.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
