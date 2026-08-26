import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * A rotating "are you a person" question for the query form. Deliberately not
 * a CAPTCHA: the bar is trivia any human can answer (and refresh past), which
 * costs a real lead a few seconds and costs a scripted poster the whole form.
 *
 * The bank lives server-side only — the browser is handed one prompt and an
 * opaque signed token, never the answers.
 */
type Challenge = {
  id: string;
  prompt: string;
  /** Accepted answers. Compared after normalizeAnswer() on both sides. */
  answers: string[];
};

const CHALLENGE_BANK: Challenge[] = [
  {
    id: "rowling",
    prompt: "Who wrote the Harry Potter books?",
    answers: ["jk rowling", "j k rowling", "joanne rowling", "joanne k rowling", "rowling"],
  },
  {
    id: "mlk",
    prompt: "Martin Luther ____",
    answers: ["king", "martin luther king", "king jr", "martin luther king jr"],
  },
  {
    id: "harry-potter",
    prompt: "Boy with glasses who appears in a magic book franchise is?",
    answers: ["harry potter", "harry"],
  },
  {
    id: "titanic",
    prompt: "Which ship famously hit an iceberg and sank in 1912? (Hint: there's a movie)",
    answers: ["titanic", "the titanic", "rms titanic"],
  },
  {
    id: "hitler",
    prompt:
      "Man with a single testicle, Nazi German Leader, killed people during WWII?",
    answers: ["hitler", "adolf hitler", "adolph hitler"],
  },
  {
    id: "superman",
    prompt: 'Superhero with a cape and an "S" on his chest?',
    answers: ["superman", "clark kent"],
  },
  {
    id: "batman",
    prompt: "Superhero who lives in Gotham?",
    answers: ["batman", "bruce wayne", "the batman"],
  },
  { id: "pikachu", prompt: "Yellow Pokémon?", answers: ["pikachu"] },
  { id: "mickey", prompt: "Disney mouse mascot?", answers: ["mickey mouse", "mickey"] },
  { id: "paris", prompt: "Capital of France?", answers: ["paris"] },
  {
    id: "newton",
    prompt: "Apple fell on his head, worked out gravity?",
    answers: ["newton", "isaac newton", "sir isaac newton"],
  },
  {
    id: "hulk",
    prompt: "Green guy with anger issues.",
    answers: ["hulk", "the hulk", "incredible hulk", "bruce banner"],
  },
  {
    id: "spiderman",
    prompt: "Friendly neighbourhood dude bitten by terrible workplace safety standards.",
    answers: ["spiderman", "spider man", "peter parker"],
  },
  {
    id: "davinci",
    prompt: "Man who painted a smiling woman everyone won't stop talking about.",
    answers: ["leonardo da vinci", "da vinci", "davinci", "leonardo", "leonardo davinci"],
  },
  {
    id: "shakespeare",
    prompt: "Guy who wrote Romeo and Juliet before killing off everyone's favourite characters.",
    answers: ["shakespeare", "william shakespeare"],
  },
  {
    id: "gates",
    prompt: "Founder of Microsoft who now donates ridiculous amounts of money.",
    answers: ["bill gates", "gates", "william gates"],
  },
  {
    id: "musk",
    prompt: "Man trying to colonise Mars while arguing on the internet.",
    answers: ["elon musk", "musk", "elon"],
  },
  {
    id: "china",
    prompt: "Country that built a really long wall and still got invaded.",
    answers: ["china"],
  },
  {
    id: "mars",
    prompt: "Red planet that humans keep promising to visit.",
    answers: ["mars"],
  },
  {
    id: "egypt",
    prompt: "Desert country with the world's most famous pyramids.",
    answers: ["egypt"],
  },
];

const TOKEN_MAX_AGE_MS = 45 * 60 * 1000;

/**
 * Tokens are single-use. Without this a bot could answer one question and then
 * replay that token for the whole 45-minute window. Same in-memory tradeoff as
 * the rate limiter: resets on redeploy and isn't shared across instances, so
 * it raises the bar rather than sealing it.
 */
const usedTokens = new Map<string, number>();
const MAX_TRACKED_TOKENS = 5000;

export function isChallengeTokenUsed(token: string): boolean {
  const expiry = usedTokens.get(token);
  if (expiry === undefined) return false;
  if (expiry <= Date.now()) {
    usedTokens.delete(token);
    return false;
  }
  return true;
}

/** Call only after the submission is safely stored. */
export function markChallengeTokenUsed(token: string): void {
  const now = Date.now();
  if (usedTokens.size > MAX_TRACKED_TOKENS) {
    for (const [key, expiry] of usedTokens) {
      if (expiry <= now) usedTokens.delete(key);
    }
  }
  usedTokens.set(token, now + TOKEN_MAX_AGE_MS);
}

/** Fuzzy matching below this length would accept too many near-misses. */
const FUZZY_MIN_LENGTH = 6;

function getSecret(): string {
  const secret = process.env.FORM_CHALLENGE_SECRET;
  if (!secret) {
    // Loud on purpose. Silently accepting every answer would quietly reopen
    // the exact spam hole this whole thing exists to close.
    throw new Error("FORM_CHALLENGE_SECRET is not set");
  }
  return secret;
}

/**
 * Lowercase, strip accents and punctuation, collapse whitespace, drop a
 * leading article. "J.K. Rowling!" and "jk  rowling" both land on "jk rowling".
 */
export function normalizeAnswer(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(the|a|an) /, "");
}

function levenshteinWithin1(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  // With an edit budget of 1, walk both strings and allow a single skip.
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function matchesAnswer(input: string, challengeId: string): boolean {
  const challenge = CHALLENGE_BANK.find((c) => c.id === challengeId);
  if (!challenge) return false;

  const normalized = normalizeAnswer(input);
  if (!normalized) return false;

  return challenge.answers.some((answer) => {
    const target = normalizeAnswer(answer);
    if (normalized === target) return true;
    // Typo tolerance, but only on answers long enough that a one-character
    // slip is more likely a typo than a different word.
    return target.length >= FUZZY_MIN_LENGTH && levenshteinWithin1(normalized, target);
  });
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function signChallenge(id: string): string {
  const payload = `${id}.${Date.now()}`;
  return Buffer.from(`${payload}.${sign(payload)}`).toString("base64url");
}

export type ChallengeVerdict =
  | { ok: true; id: string }
  /** Signature was fine but the token aged out — worth a silent re-issue. */
  | { ok: false; reason: "expired" }
  | { ok: false; reason: "invalid" };

/** Returns the challenge id the token was issued for, or null if it's bad. */
export function verifyChallenge(token: string): string | null {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const parts = decoded.split(".");
  if (parts.length !== 3) return null;

  const [id, issuedAt, signature] = parts;
  const expected = sign(`${id}.${issuedAt}`);

  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || Date.now() - issued > TOKEN_MAX_AGE_MS) return null;

  return CHALLENGE_BANK.some((c) => c.id === id) ? id : null;
}

/** A random question, never the one the caller is refreshing away from. */
export function pickChallenge(excludeId?: string | null): { prompt: string; token: string } {
  const pool = CHALLENGE_BANK.filter((c) => c.id !== excludeId);
  const bank = pool.length > 0 ? pool : CHALLENGE_BANK;
  const challenge = bank[randomInt(bank.length)];
  return { prompt: challenge.prompt, token: signChallenge(challenge.id) };
}

/**
 * Like verifyChallenge, but distinguishes an aged-out token from a bad one so
 * the form can quietly hand the user a new question instead of telling them
 * they got the answer wrong.
 */
export function checkChallengeToken(token: string): ChallengeVerdict {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "invalid" };
  }

  const parts = decoded.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };

  const [id, issuedAt, signature] = parts;
  const given = Buffer.from(signature);
  const want = Buffer.from(sign(`${id}.${issuedAt}`));
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return { ok: false, reason: "invalid" };
  }
  if (!CHALLENGE_BANK.some((c) => c.id === id)) {
    return { ok: false, reason: "invalid" };
  }

  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || Date.now() - issued > TOKEN_MAX_AGE_MS) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, id };
}
