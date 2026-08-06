"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Smile } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import {
  STREAM_COMMENT_COOLDOWN_MS,
  STREAM_NAME_MAX,
  STREAM_MESSAGE_MAX,
} from "@/lib/stream";
import { CommentRow } from "./CommentRow";
import { FloatingEmoji } from "./FloatingEmoji";
import { EmojiReactionOverlay, type Reaction } from "./EmojiReactionOverlay";
import type { StreamComment } from "./types";

const REACTION_EMOJIS = ["😂", "🔥", "👏", "😍", "👍"];

function getVisitorId() {
  const KEY = "lt-stream-visitor-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function ChatContent({
  initialComments,
}: {
  initialComments: StreamComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onCooldown, setOnCooldown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so this can only be read after
    // mount — the state starts empty (matching the server render) and is
    // synced here to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(localStorage.getItem("lt-stream-name") ?? "");
  }, []);

  const supabase = useMemo(() => createPublicClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel("stream-comments-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stream_comments" },
        (payload) => {
          const row = payload.new as StreamComment;
          setComments((prev) =>
            prev.some((c) => c.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [comments]);

  const hasName = name.trim().length > 0;

  async function postComment(message: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/stream-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, visitorId: getVisitorId() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setComments((prev) =>
          prev.some((c) => c.id === data.comment.id) ? prev : [...prev, data.comment]
        );
        setFieldValue("");
        setOnCooldown(true);
        setTimeout(() => setOnCooldown(false), STREAM_COMMENT_COOLDOWN_MS);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFieldSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = fieldValue.trim();
    if (!value) return;

    if (!hasName) {
      setName(value);
      localStorage.setItem("lt-stream-name", value);
      setFieldValue("");
      return;
    }

    if (onCooldown) return;
    void postComment(value);
  }

  function fireReaction(emoji: string) {
    const id = crypto.randomUUID();
    setReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2300);
    setShowEmojiPicker(false);
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <FloatingEmoji />
      <EmojiReactionOverlay reactions={reactions} />
      <div
        ref={listRef}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2"
      >
        {comments.map((c) => (
          <CommentRow
            key={c.id}
            name={c.name}
            message={c.message}
            createdAt={c.created_at}
          />
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 border-t-2 border-black p-2">
        <form onSubmit={handleFieldSubmit} className="relative min-w-0 flex-1">
          <label htmlFor="stream-field" className="sr-only">
            {hasName ? "Say something" : "Enter your name"}
          </label>
          <input
            id="stream-field"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            maxLength={hasName ? STREAM_MESSAGE_MAX : STREAM_NAME_MAX}
            placeholder={hasName ? "Say something…" : "Enter your name"}
            className="w-full rounded-squircle-sm border border-black/20 bg-white py-1.5 pl-2 pr-8 text-xs text-black placeholder:text-black/50"
          />
          <button
            type="submit"
            disabled={submitting || (hasName && onCooldown) || fieldValue.trim().length === 0}
            aria-label={hasName ? "Send message" : "Confirm name"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-black/50 hover:text-black disabled:opacity-30"
          >
            <CornerDownLeft className="h-4 w-4" strokeWidth={2} />
          </button>
        </form>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
            aria-label="React with an emoji"
            className="comic-border-sm flex h-[30px] w-[30px] items-center justify-center rounded-squircle-sm bg-lt-yellow text-black"
          >
            <Smile className="h-4 w-4" strokeWidth={2} />
          </button>
          {showEmojiPicker && (
            <div className="comic-border-sm absolute bottom-full right-0 mb-2 flex gap-1 rounded-squircle-sm bg-white p-1.5">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => fireReaction(emoji)}
                  className="text-lg transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="px-3 pb-2 text-xs font-semibold text-lt-red">{error}</p>
      )}
    </div>
  );
}
