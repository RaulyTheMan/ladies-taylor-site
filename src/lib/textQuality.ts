/**
 * Cheap, dependency-free spam/gibberish heuristic for free-text form fields.
 * No dictionary lookup on purpose — this site gets submissions in Gujarati,
 * Bengali, Hindi, etc., and rejecting real non-English text would be worse
 * than letting some gibberish through. Structural signals only.
 */
export function isLikelyGibberish(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 8) return true;

  const longestWord = Math.max(...words.map((w) => w.length));
  if (longestWord > 30) return true;

  // A 1-4 character chunk repeated 5+ times back to back, e.g. "bdbdbdbdbd"
  // or "gggggggg" — the emoji/keysmash spam pattern.
  if (/(.{1,4})\1{4,}/u.test(trimmed)) return true;

  const emojiMatches = trimmed.match(/\p{Extended_Pictographic}/gu) ?? [];
  if (emojiMatches.length / trimmed.length > 0.15) return true;

  const letterMatches = trimmed.match(/\p{L}/gu) ?? [];
  const nonSpaceLength = trimmed.replace(/\s/g, "").length;
  if (nonSpaceLength > 0 && letterMatches.length / nonSpaceLength < 0.5) {
    return true;
  }

  return false;
}
