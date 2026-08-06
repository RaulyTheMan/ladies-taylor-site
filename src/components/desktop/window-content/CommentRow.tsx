import { nameColor } from "./nameColor";

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function CommentRow({
  name,
  message,
  createdAt,
}: {
  name: string;
  message: string;
  createdAt: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <p className="min-w-0 text-xs leading-snug">
        <span className={`font-bold ${nameColor(name)}`}>{name}: </span>
        <span className="text-black/80">{message}</span>
      </p>
      <span className="shrink-0 text-micro text-black/40">
        {formatTimestamp(createdAt)}
      </span>
    </div>
  );
}
