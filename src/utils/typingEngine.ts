import type { Difficulty, PhraseDifficulty } from '../types/game';

/**
 * Normalizes a string by lowercasing, stripping all punctuation,
 * and collapsing multiple whitespace characters into a single space.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\bconcecated\b/g, 'consecrated')
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

export type CharTint = 'correct' | 'incorrect' | 'neutral';

export interface AnalyzedChar {
  char: string;
  status: CharTint;
}

export interface TypingAlignmentResult {
  analyzedChars: AnalyzedChar[];
  ghostSuffix: string;
}

/**
 * Needleman-Wunsch character alignment within a single word.
 * Compares typed word against target word to identify exact correct and incorrect characters,
 * accounting for insertions, deletions, and substitutions without cascading.
 */
function alignWordCharsNW(
  uWord: string,
  tWord: string
): { statuses: CharTint[]; targetRemainder: string } {
  const n = uWord.length;
  const m = tWord.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = -i;
  for (let j = 0; j <= m; j++) dp[0][j] = -j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = uWord[i - 1].toLowerCase() === tWord[j - 1].toLowerCase();
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + (match ? 3 : -1),
        dp[i - 1][j] - 1, // insertion in typed
        dp[i][j - 1] - 1  // deletion from target
      );
    }
  }

  let i = n;
  let j = m;
  const statuses: CharTint[] = new Array<CharTint>(n).fill('incorrect');
  let lastMatchedTargetIdx = -1;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const match = uWord[i - 1].toLowerCase() === tWord[j - 1].toLowerCase();
      if (dp[i][j] === dp[i - 1][j - 1] + (match ? 3 : -1)) {
        statuses[i - 1] = match ? 'correct' : 'incorrect';
        if (match && lastMatchedTargetIdx === -1) {
          lastMatchedTargetIdx = j - 1;
        }
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] - 1) {
      statuses[i - 1] = 'incorrect';
      i--;
    } else {
      j--;
    }
  }

  const targetRemainder =
    lastMatchedTargetIdx !== -1 && lastMatchedTargetIdx < m - 1
      ? tWord.slice(lastMatchedTargetIdx + 1)
      : lastMatchedTargetIdx === -1
        ? tWord
        : '';

  return { statuses, targetRemainder };
}

/**
 * Word-anchored typing analyzer:
 * Anchors each word in `typedInput` to its corresponding word in `targetPhrase` so that
 * misspellings with differing character counts never cascade into subsequent words.
 * Returns character-level tints (slightly green for correct, slightly red for incorrect)
 * and the synchronized ghost autocomplete suffix.
 */
export function analyzeTypingWithWordAnchors(
  typedInput: string,
  targetPhrase: string
): TypingAlignmentResult {
  if (!typedInput) {
    return {
      analyzedChars: [],
      ghostSuffix: targetPhrase || '',
    };
  }

  if (!targetPhrase || !targetPhrase.trim()) {
    return {
      analyzedChars: typedInput.split('').map((char) => ({ char, status: 'neutral' })),
      ghostSuffix: '',
    };
  }

  const targetWords = targetPhrase.trim().split(/\s+/);

  // Tokenize typedInput into words and whitespace runs preserving exact character positions
  const typedTokens: { text: string; isWord: boolean; start: number; end: number }[] = [];
  const tokenRegex = /(\S+)|(\s+)/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(typedInput)) !== null) {
    typedTokens.push({
      text: match[0],
      isWord: !match[2],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  const typedWordTokens = typedTokens.filter((t) => t.isWord);
  const n = typedWordTokens.length;
  const m = targetWords.length;

  function wordSimilarity(w1: string, w2: string): number {
    if (!w1 || !w2) return 0;
    const s1 = w1.toLowerCase();
    const s2 = w2.toLowerCase();
    if (s1 === s2) return 10;
    const c1 = s1.replace(/[^a-z0-9]/g, '');
    const c2 = s2.replace(/[^a-z0-9]/g, '');
    if (c1 && c1 === c2) return 10;
    let p = 0;
    while (p < s1.length && p < s2.length && s1[p] === s2[p]) p++;
    return p;
  }

  // DP alignment between sequence of typed words and target words
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(-Infinity));
  const parent: ({ i: number; j: number; type: 'match' | 'skip_target' | 'extra_typed' } | null)[][] =
    Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
  dp[0][0] = 0;

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (dp[i][j] === -Infinity) continue;
      if (i < n && j < m) {
        const sim = wordSimilarity(typedWordTokens[i].text, targetWords[j]);
        if (dp[i][j] + sim > dp[i + 1][j + 1]) {
          dp[i + 1][j + 1] = dp[i][j] + sim;
          parent[i + 1][j + 1] = { i, j, type: 'match' };
        }
      }
      if (j < m) {
        if (dp[i][j] - 1 > dp[i][j + 1]) {
          dp[i][j + 1] = dp[i][j] - 1;
          parent[i][j + 1] = { i, j, type: 'skip_target' };
        }
      }
      if (i < n) {
        if (dp[i][j] - 2 > dp[i + 1][j]) {
          dp[i + 1][j] = dp[i][j] - 2;
          parent[i + 1][j] = { i, j, type: 'extra_typed' };
        }
      }
    }
  }

  let currI = n;
  let currJ = m;
  const wordAlignment: number[] = new Array<number>(n).fill(-1);
  while (currI > 0 || currJ > 0) {
    const p = parent[currI][currJ];
    if (!p) break;
    if (p.type === 'match') {
      wordAlignment[p.i] = p.j;
    }
    currI = p.i;
    currJ = p.j;
  }

  const charStatuses: CharTint[] = new Array<CharTint>(typedInput.length).fill('neutral');
  let lastTargetRemainder = '';

  typedWordTokens.forEach((token, wIdx) => {
    const targetIdx = wordAlignment[wIdx];
    if (targetIdx === -1 || targetIdx >= targetWords.length) {
      for (let k = token.start; k < token.end; k++) {
        charStatuses[k] = 'incorrect';
      }
      return;
    }

    const tWord = targetWords[targetIdx];
    const uWord = token.text;
    const { statuses, targetRemainder } = alignWordCharsNW(uWord, tWord);

    for (let c = 0; c < uWord.length; c++) {
      charStatuses[token.start + c] = statuses[c];
    }

    if (wIdx === typedWordTokens.length - 1) {
      lastTargetRemainder = targetRemainder;
    }
  });

  // Calculate remaining ghost autocomplete suffix
  let ghostSuffix = '';
  if (typedWordTokens.length === 0) {
    ghostSuffix = targetPhrase;
  } else {
    const lastTypedWordIdx = typedWordTokens.length - 1;
    const lastTargetIdx = wordAlignment[lastTypedWordIdx];
    const isInsideWord = !typedInput.endsWith(' ');

    if (lastTargetIdx !== -1 && lastTargetIdx < targetWords.length) {
      const curWordRemainder = isInsideWord ? lastTargetRemainder : '';
      const remainingWords = targetWords.slice(lastTargetIdx + 1);

      if (curWordRemainder && remainingWords.length > 0) {
        ghostSuffix = curWordRemainder + ' ' + remainingWords.join(' ');
      } else if (curWordRemainder) {
        ghostSuffix = curWordRemainder;
      } else if (remainingWords.length > 0) {
        ghostSuffix = (isInsideWord ? ' ' : '') + remainingWords.join(' ');
      }
    }
  }

  const analyzedChars: AnalyzedChar[] = typedInput.split('').map((char, index) => ({
    char,
    status: charStatuses[index],
  }));

  return { analyzedChars, ghostSuffix };
}
