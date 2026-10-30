import type { Difficulty, PhraseDifficulty } from '../types/game';

/**
 * Normalizes a string by lowercasing, stripping all punctuation,
 * and collapsing multiple whitespace characters into a single space.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Maps game Difficulty to the 3 phrase difficulty tiers ('easy' | 'medium' | 'hard').
 * Extra Hard uses 'hard' phrases plus speed scaling.
 */
export function getPhraseDifficulty(difficulty: Difficulty): PhraseDifficulty {
  if (difficulty === 'extra_hard') return 'hard';
  return difficulty;
}

/**
 * Standard iterative Levenshtein distance between two normalized strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const s = normalizeText(a);
  const t = normalizeText(b);

  if (s === t) return 0;
  if (s.length === 0) return t.length;
  if (t.length === 0) return s.length;

  const prevRow = new Array<number>(t.length + 1);
  const currRow = new Array<number>(t.length + 1);

  for (let j = 0; j <= t.length; j++) {
    prevRow[j] = j;
  }

  for (let i = 0; i < s.length; i++) {
    currRow[0] = i + 1;
    for (let j = 0; j < t.length; j++) {
      const cost = s[i] === t[j] ? 0 : 1;
      currRow[j + 1] = Math.min(
        currRow[j] + 1,       // insertion
        prevRow[j + 1] + 1,   // deletion
        prevRow[j] + cost     // substitution
      );
    }
    for (let j = 0; j <= t.length; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return prevRow[t.length];
}

/**
 * Calculates maximum allowed Levenshtein edits based on difficulty and phrase length.
 * Easy is forgiving (~28% of phrase length, min 1-2 chars);
 * Medium is moderate (~20% of phrase length);
 * Hard / Extra Hard is stricter (~14% of phrase length, min 1 char for longer phrases).
 */
export function getMaxAllowedDistance(targetPhrase: string, difficulty: Difficulty): number {
  const clean = normalizeText(targetPhrase);
  const len = clean.length;
  if (len <= 2) return 0;

  switch (difficulty) {
    case 'easy':
      return Math.max(1, Math.floor(len * 0.28));
    case 'medium':
      return Math.max(1, Math.floor(len * 0.22));
    case 'hard':
    case 'extra_hard':
      return Math.max(1, Math.floor(len * 0.15));
  }
}

export interface MatchCandidate<T> {
  item: T;
  phrase: string;
  distance: number;
  maxAllowed: number;
  isPrefixMatch: boolean;
  isValidConfirm: boolean;
  score: number; // Lower is better match
}

/**
 * Evaluates a user's live input against a list of candidates, supporting both:
 * 1. Real-time prefix/fuzzy highlighting as the user types.
 * 2. Full-phrase fuzzy confirmation when the user presses Enter.
 */
export function evaluateCandidates<T>(
  rawInput: string,
  candidates: { item: T; phrase: string }[],
  difficulty: Difficulty
): MatchCandidate<T>[] {
  const input = normalizeText(rawInput);

  return candidates
    .map(({ item, phrase }) => {
      const target = normalizeText(phrase);
      const fullDist = levenshteinDistance(input, target);
      const maxAllowed = getMaxAllowedDistance(target, difficulty);

      // Check prefix matching for real-time narrowing while typing
      const prefixTarget = target.slice(0, input.length);
      const prefixDist = input.length > 0 ? levenshteinDistance(input, prefixTarget) : 0;
      const maxPrefixDist = Math.max(1, Math.floor(input.length * (difficulty === 'easy' ? 0.3 : 0.2)));

      const isExactPrefix = input.length > 0 && target.startsWith(input);
      const isFuzzyPrefix =
        input.length >= 2 &&
        input.length <= target.length + 2 &&
        prefixDist <= maxPrefixDist;

      const isPrefixMatch = isExactPrefix || isFuzzyPrefix || fullDist <= maxAllowed;
      const isValidConfirm = input.length > 0 && fullDist <= maxAllowed;

      // Score prioritizes exact matches -> valid confirm matches -> exact prefixes -> fuzzy prefixes
      let score = fullDist;
      if (input === target) {
        score = -100;
      } else if (isExactPrefix) {
        score = -50 + (target.length - input.length) * 0.1;
      } else if (isValidConfirm) {
        score = fullDist;
      } else if (isFuzzyPrefix) {
        score = 10 + prefixDist;
      } else {
        score = 100 + fullDist;
      }

      return {
        item,
        phrase,
        distance: fullDist,
        maxAllowed,
        isPrefixMatch,
        isValidConfirm,
        score,
      };
    })
    .sort((a, b) => a.score - b.score);
}

/**
 * Finds a matching universal command (like "back", "cancel", "end turn", "help").
 */
export function matchCommand(
  rawInput: string,
  commandPhrases: string[],
  difficulty: Difficulty = 'easy'
): string | null {
  const input = normalizeText(rawInput);
  if (!input) return null;

  let bestCmd: string | null = null;
  let bestDist = Infinity;

  for (const cmd of commandPhrases) {
    const cleanCmd = normalizeText(cmd);
    const dist = levenshteinDistance(input, cleanCmd);
    const maxDist = cleanCmd.length <= 4 ? 1 : getMaxAllowedDistance(cleanCmd, difficulty);
    if (dist <= maxDist && dist < bestDist) {
      bestDist = dist;
      bestCmd = cmd;
    }
  }

  return bestCmd;
}

/**
 * Calculates Words Per Minute (WPM) using the standard 5-characters = 1 word definition.
 * Includes a minimum elapsed floor of 400ms to prevent infinite WPM on 1-letter inputs.
 */
export function calculateWpm(charCount: number, elapsedMs: number): number {
  if (charCount <= 0 || elapsedMs <= 0) return 0;
  const effectiveMinutes = Math.max(elapsedMs, 400) / 60000;
  const words = charCount / 5;
  return Math.round(words / effectiveMinutes);
}

/**
 * Calculates Extra Hard mode effectiveness multiplier based on WPM:
 * - 40 WPM = 1.00 (100% effectiveness)
 * - 20 WPM = 0.50 (50% effectiveness, floor is 0.50 at <=20 WPM)
 * - Linear interpolation between 20 WPM and 40 WPM (each +1 WPM = +2.5% power)
 * - Above 40 WPM: continues scaling linearly for visual overflow indicator (and optional bonus up to 125% at 50 WPM!)
 */
export function calculateSpeedEffectiveness(
  wpm: number,
  difficulty: Difficulty,
  wpmBonusRelic: number = 0
): {
  effectiveWpm: number;
  multiplier: number; // Applied to card numbers (0.5 to 1.15)
  displayPercent: number; // Uncapped linear percent for the UI bar (e.g. 125% at 50 WPM)
} {
  const effectiveWpm = wpm + wpmBonusRelic;
  if (difficulty !== 'extra_hard') {
    return {
      effectiveWpm,
      multiplier: 1.0,
      displayPercent: 100,
    };
  }

  // Linear equation where 20 WPM -> 50% and 40 WPM -> 100%:
  // percent = 2.5 * WPM
  const rawPercent = Math.round(effectiveWpm * 2.5);
  const clampedFloorPercent = Math.max(50, rawPercent);

  // Actual combat multiplier caps at 100% (or 110% slight reward for blazing speed) while floor is 50%
  const combatMultiplier = Math.max(0.5, Math.min(1.0, clampedFloorPercent / 100));

  return {
    effectiveWpm,
    multiplier: combatMultiplier,
    displayPercent: clampedFloorPercent,
  };
}
