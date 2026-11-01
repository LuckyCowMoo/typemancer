import {
  CARDS_CATALOG,
  ENEMIES_CATALOG,
  ENVIRONMENTS_CATALOG,
  RELICS_CATALOG,
} from './gameContent';

export interface CodexDiscoveryState {
  enemies: string[];
  cards: string[];
  environments: string[];
  relics: string[];
}

export const CODEX_STORAGE_KEY = 'typemancer_codex_v1';

export const STARTER_UNLOCKED_CARDS = [
  'strike',
  'defend',
  'bash',
  'zap',
  'dualcast',
  'ink_strike',
  'page_ward',
  'boulder_barrage',
  'blotting_cloud',
];

export const STARTER_UNLOCKED_RELICS = ['magical_typewriter'];
export const STARTER_UNLOCKED_ENVIRONMENTS = ['calm_parchment_meadow', ' calm_parchment_meadow'];
export const STARTER_UNLOCKED_ENEMIES: string[] = [];

/**
 * Creates the initial default unlocked state for a new student profile.
 */
export function getDefaultCodexState(): CodexDiscoveryState {
  return {
    enemies: [...STARTER_UNLOCKED_ENEMIES],
    cards: [...STARTER_UNLOCKED_CARDS],
    environments: [...STARTER_UNLOCKED_ENVIRONMENTS],
    relics: [...STARTER_UNLOCKED_RELICS],
  };
}

/**
 * Saves codex discovery state to localStorage safely.
 */
function saveCodexState(state: CodexDiscoveryState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore storage quota errors in sandboxes/incognito
  }
}

/**
 * Loads the current codex discovery state from localStorage.
 * Seeds defaults if not present or partially missing.
 */
export function loadCodexState(): CodexDiscoveryState {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CODEX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CodexDiscoveryState>;
        const merged: CodexDiscoveryState = {
          enemies: Array.from(new Set([...(parsed.enemies || []), ...STARTER_UNLOCKED_ENEMIES])),
          cards: Array.from(new Set([...(parsed.cards || []), ...STARTER_UNLOCKED_CARDS])),
          environments: Array.from(
            new Set([...(parsed.environments || []), ...STARTER_UNLOCKED_ENVIRONMENTS])
          ),
          relics: Array.from(new Set([...(parsed.relics || []), ...STARTER_UNLOCKED_RELICS])),
        };
        return merged;
      }
    }
  } catch {
    // If corrupted or unavailable, fall back to defaults
  }

  const def = getDefaultCodexState();
  saveCodexState(def);
  return def;
}

/**
 * Unlocks new entries across any category and persists the result.
 */
export function unlockCodexEntries(
  partial: Partial<CodexDiscoveryState>
): CodexDiscoveryState {
  const current = loadCodexState();
  const updated: CodexDiscoveryState = {
    enemies: Array.from(new Set([...current.enemies, ...(partial.enemies || [])])),
    cards: Array.from(new Set([...current.cards, ...(partial.cards || [])])),
    environments: Array.from(
      new Set([...current.environments, ...(partial.environments || [])])
    ),
    relics: Array.from(new Set([...current.relics, ...(partial.relics || [])])),
  };
  saveCodexState(updated);
  return updated;
}

/**
 * Unlocks 100% of the catalog entries across all 4 categories.
 * Perfect for testing or developer commands (e.g. typing "unlock all").
 */
export function unlockAllCodexEntries(): CodexDiscoveryState {
  const allState: CodexDiscoveryState = {
    enemies: ENEMIES_CATALOG.map((e) => e.id),
    cards: CARDS_CATALOG.map((c) => c.id),
    environments: ENVIRONMENTS_CATALOG.map((env) => env.id),
    relics: RELICS_CATALOG.map((r) => r.id),
  };
  saveCodexState(allState);
  return allState;
}

/**
 * Quick check whether a specific entry has been recorded in the player's Codex.
 */
export function isCodexDiscovered(
  discovery: CodexDiscoveryState,
  category: keyof CodexDiscoveryState,
  id: string
): boolean {
  return discovery[category]?.includes(id) ?? false;
}
