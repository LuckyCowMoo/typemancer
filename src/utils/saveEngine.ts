import type { CardInstance, Difficulty, RunMetrics } from '../types/game';

export interface SavePayload {
  v: 1;
  name: string;
  diff: Difficulty;
  floor: number;
  hp: number;
  maxHp: number;
  gold: number;
  deck: { c: string; u: 0 | 1 }[];
  relics: string[];
  extraHardUnlocked: boolean;
  metrics: {
    chars: number;
    errs: number;
    acts: number;
    wpmAvg: number;
    wpmPeak: number;
    dmg: number;
    taken: number;
    ward: number;
    cards: number;
    kills: number;
    sec: number;
  };
}

const STORAGE_KEY_STATE = 'typemancer_save_v1';
const STORAGE_KEY_UNLOCK = 'typemancer_extra_hard_unlocked';

export function isExtraHardUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_UNLOCK) === 'true';
  } catch {
    return false;
  }
}

export function setExtraHardUnlocked(unlocked: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_UNLOCK, unlocked ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
}

/**
 * Encodes a run state into a compact, classroom-friendly Save Code (prefix `TM1-...`)
 * that students can write down or copy to resume on any school machine.
 */
export function encodeSaveCode(
  playerName: string,
  difficulty: Difficulty,
  floor: number,
  hp: number,
  maxHp: number,
  gold: number,
  deck: CardInstance[],
  relics: string[],
  metrics: RunMetrics
): string {
  const avgWpm =
    metrics.wpmSamples.length > 0
      ? Math.round(metrics.wpmSamples.reduce((a, b) => a + b, 0) / metrics.wpmSamples.length)
      : 0;

  const payload: SavePayload = {
    v: 1,
    name: playerName,
    diff: difficulty,
    floor,
    hp,
    maxHp,
    gold,
    deck: deck.map((d) => ({ c: d.cardId, u: d.upgraded ? 1 : 0 })),
    relics,
    extraHardUnlocked: isExtraHardUnlocked(),
    metrics: {
      chars: metrics.totalCharsTyped,
      errs: metrics.totalErrorsCost,
      acts: metrics.totalActionsSubmitted,
      wpmAvg: avgWpm,
      wpmPeak: metrics.peakWpm,
      dmg: metrics.totalDamageDealt,
      taken: metrics.totalDamageTaken,
      ward: metrics.totalWardGained,
      cards: metrics.cardsPlayed,
      kills: metrics.enemiesDefeated,
      sec: Math.floor((Date.now() - metrics.startTimeMs) / 1000) + metrics.elapsedSeconds,
    },
  };

  const json = JSON.stringify(payload);
  const base64 = btoa(encodeURIComponent(json));
  return `TM1-${base64}`;
}

export function decodeSaveCode(rawCode: string): SavePayload | null {
  try {
    const trimmed = rawCode.trim();
    const cleaned = trimmed.replace(/^tm1-/i, '');
    const json = decodeURIComponent(atob(cleaned));
    const parsed = JSON.parse(json) as SavePayload;
    if (parsed && parsed.v === 1 && parsed.name && Array.isArray(parsed.deck)) {
      if (parsed.extraHardUnlocked) {
        setExtraHardUnlocked(true);
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveRunToLocal(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, code);
  } catch {
    // ignore
  }
}

export function loadRunFromLocal(): SavePayload | null {
  try {
    const code = localStorage.getItem(STORAGE_KEY_STATE);
    if (!code) return null;
    return decodeSaveCode(code);
  } catch {
    return null;
  }
}

export function clearLocalRun(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_STATE);
  } catch {
    // ignore
  }
}
