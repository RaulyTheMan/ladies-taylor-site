const NAME_COLORS = [
  "text-lt-red",
  "text-lt-blue",
  "text-lt-purple",
  "text-lt-amber",
  "text-lt-pink",
  "text-[#469f26]",
] as const;

export function nameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return NAME_COLORS[hash % NAME_COLORS.length];
}
