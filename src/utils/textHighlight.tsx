import React from 'react';
import type { BattleEnvironmentModifiers } from '../types/game';

export interface KeywordDef {
  type: string;
  pattern: RegExp;
  color: string;
  border: string;
  shadow: string;
  label: string;
}

/**
 * Intelligent color-coded keyword definitions for card effects.
 * Every effect category has an intentional, highly readable color:
 * - Damage: Sunset Coral (#ff8a7a)
 * - Ward: Luminous Sky Cyan (#38bdf8)
 * - Bold: Radiant Sun Gold (#fbbf24)
 * - Faded: Ghost Mist Silver (#cbd5e1)
 * - Exposed: Hot Rose / Crimson (#fb7185)
 * - Ink Burn: Arcane Violet (#c084fc)
 * - Thorns: Spiky Lime Chartreuse (#a3e635)
 * - Plated Armor: Cobalt Steel Blue (#60a5fa)
 * - Energy: Electric Lightning Yellow (#facc15)
 * - Heal: Vitality Emerald Green (#4ade80)
 * - Draw: Mint Seafoam (#2dd4bf)
 * - Discard: Burnt Ochre (#fb923c)
 * - Burn Draft: Ember Rose (#fda4af)
 * - X-Cost: Solar Gold (#fef08a)
 * - AoE: Wide Radiance Peach (#fed7aa)
 */
export const EFFECT_KEYWORDS: KeywordDef[] = [
  {
    type: 'plated-armor',
    pattern: /\bplated armor\b/i,
    color: '#60a5fa',
    border: '#3b82f6',
    shadow: 'rgba(59, 130, 246, 0.5)',
    label: 'Plated Armor',
  },
  {
    type: 'ink-burn',
    pattern: /\bink burn\b/i,
    color: '#c084fc',
    border: '#a855f7',
    shadow: 'rgba(168, 85, 247, 0.5)',
    label: 'Ink Burn',
  },
  {
    type: 'burn-draft',
    pattern: /\b(?:once per combat|burn draft)\b/i,
    color: '#fda4af',
    border: '#fb7185',
    shadow: 'rgba(251, 113, 133, 0.5)',
    label: 'Once Per Combat',
  },
  {
    type: 'aoe',
    pattern: /\ball enemies\b/i,
    color: '#fed7aa',
    border: '#fb923c',
    shadow: 'rgba(251, 146, 60, 0.5)',
    label: 'ALL Enemies',
  },
  {
    type: 'x-cost',
    pattern: /\bX times\b|\bX\b/,
    color: '#fef08a',
    border: '#facc15',
    shadow: 'rgba(250, 204, 21, 0.5)',
    label: 'X Cost Scaling',
  },
  {
    type: 'thorns',
    pattern: /\bthorns\b/i,
    color: '#a3e635',
    border: '#84cc16',
    shadow: 'rgba(132, 204, 22, 0.5)',
    label: 'Thorns (Counter-Damage)',
  },
  {
    type: 'damage',
    pattern: /\b(?:damage|Attack)\b/i,
    color: '#ff8a7a',
    border: '#ff5252',
    shadow: 'rgba(255, 82, 82, 0.5)',
    label: 'Damage',
  },
  {
    type: 'ward',
    pattern: /\bwards?\b/i,
    color: '#38bdf8',
    border: '#0ea5e9',
    shadow: 'rgba(14, 165, 233, 0.5)',
    label: 'Ward (Block)',
  },
  {
    type: 'bold',
    pattern: /\bbold\b/i,
    color: '#fbbf24',
    border: '#f59e0b',
    shadow: 'rgba(245, 158, 11, 0.5)',
    label: 'Bold (Strength)',
  },
  {
    type: 'faded',
    pattern: /\bfaded\b/i,
    color: '#cbd5e1',
    border: '#94a3b8',
    shadow: 'rgba(148, 163, 184, 0.5)',
    label: 'Faded (Weakness)',
  },
  {
    type: 'exposed',
    pattern: /\bexposed\b/i,
    color: '#fb7185',
    border: '#f43f5e',
    shadow: 'rgba(244, 63, 94, 0.5)',
    label: 'Exposed (Vulnerable)',
  },
  {
    type: 'energy',
    pattern: /\benergy\b/i,
    color: '#facc15',
    border: '#eab308',
    shadow: 'rgba(234, 179, 8, 0.5)',
    label: 'Energy (⚡)',
  },
  {
    type: 'heal',
    pattern: /\b(?:heal|hp)\b/i,
    color: '#4ade80',
    border: '#22c55e',
    shadow: 'rgba(34, 197, 94, 0.5)',
    label: 'Heal / Health',
  },
  {
    type: 'discard',
    pattern: /\b(?:discard random|discarded|discards?)\b/i,
    color: '#fb923c',
    border: '#ea580c',
    shadow: 'rgba(234, 88, 12, 0.5)',
    label: 'Discard',
  },
  {
    type: 'draw',
    pattern: /\b(?:draws?|cards?)\b/i,
    color: '#2dd4bf',
    border: '#14b8a6',
    shadow: 'rgba(20, 184, 166, 0.5)',
    label: 'Card Draw',
  },
  {
    type: 'keep',
    pattern: /\b(?:keep|retains?|retained)\b/i,
    color: '#34d399',
    border: '#10b981',
    shadow: 'rgba(168, 85, 247, 0.5)',
    label: 'Keep (Retain card from discard at end of turn)',
  },
];

export const KEYWORD_SCAN_PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  { type: 'plated-armor', pattern: /\bplated armor\b/i },
  { type: 'ink-burn', pattern: /\bink burn\b/i },
  { type: 'burn-draft', pattern: /\b(?:once per combat|burn draft)\b/i },
  { type: 'thorns', pattern: /\bthorns\b/i },
  { type: 'damage', pattern: /\b(?:damage|Attack)\b/i },
  { type: 'ward', pattern: /\bwards?\b/i },
  { type: 'bold', pattern: /\bbold\b/i },
  { type: 'faded', pattern: /\bfaded\b/i },
  { type: 'exposed', pattern: /\bexposed\b/i },
  { type: 'heal', pattern: /\b(?:heal|hp)\b/i },
  { type: 'energy', pattern: /\benergy\b/i },
  { type: 'draw', pattern: /\b(?:draws?|cards?)\b/i },
  { type: 'discard', pattern: /\b(?:discard random|discarded|discards?)\b/i },
  { type: 'keep', pattern: /\b(?:keep|retains?|retained)\b/i },
];

export const EFFECT_TYPE_TO_KEYWORD: Record<string, string> = {
  damage: 'damage',
  damage_all_enemies: 'damage',
  damage_random_enemy: 'damage',
  damage_per_card_in_hand: 'damage',
  damage_if_target_exposed: 'damage',
  damage_per_ward: 'damage',
  ward: 'ward',
  double_ward: 'ward',
  gain_ward_per_card_in_hand: 'ward',
  ward_if_target_faded: 'ward',
  bold: 'bold',
  faded: 'faded',
  exposed: 'exposed',
  ink_burn: 'ink-burn',
  double_ink_burn: 'ink-burn',
  heal: 'heal',
  draw: 'draw',
  power_draw_each_turn: 'draw',
  thorns: 'thorns',
  plated_armor: 'plated-armor',
  energy: 'energy',
  discard: 'discard',
};

/**
 * Detects the keyword associated with a number in a card description by looking ahead
 * for the earliest occurring effect keyword, and falling back to lookbehind if necessary.
 */
export function detectKeywordAroundNumber(
  text: string,
  numStart: number,
  numEnd: number
): { keyword: string | null; isHits: boolean } {
  const afterText = text.slice(numEnd, numEnd + 55);
  const isHits = /\b(?:times|twice)\b/i.test(afterText);

  let bestKw: string | null = null;
  let bestIdx = Infinity;

  for (const k of KEYWORD_SCAN_PATTERNS) {
    const match = k.pattern.exec(afterText);
    if (match && match.index < bestIdx) {
      bestIdx = match.index;
      bestKw = k.type;
    }
  }

  if (bestKw && bestIdx < 32) {
    return { keyword: bestKw, isHits };
  }

  const beforeText = text.slice(Math.max(0, numStart - 35), numStart);
  let bestBeforeKw: string | null = null;
  let bestBeforeDistance = Infinity;

  for (const k of KEYWORD_SCAN_PATTERNS) {
    const match = k.pattern.exec(beforeText);
    if (match) {
      const dist = beforeText.length - (match.index + match[0].length);
      if (dist < bestBeforeDistance) {
        bestBeforeDistance = dist;
        bestBeforeKw = k.type;
      }
    }
  }

  return { keyword: bestBeforeKw, isHits };
}

/**
 * Strips optional upgrade delta tags like {+2} or [+2] so normal in-combat card descriptions
 * remain clean and standard.
 */
export function cleanCardDescriptionForPlay(desc: string): string {
  if (!desc) return '';
  return desc
    .replace(/\{[+-]?[\w\d]+\}\s*/g, '')
    .replace(/\[[+-]?[\w\d]+\]\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Resolves the upgrade delta (e.g. +3, +1) for a specific number in a card's description.
 * Defaults to auto-detecting differences between base and upgrade stats,
 * and uses any explicit {+X} or [+X] marker in the description as a backup fallback.
 */
function resolveUpgradeDelta(
  def: {
    description: string;
    effects?: Array<{ type: string; amount?: number; hits?: number }>;
    upgrade?: {
      description?: string;
      effects?: Array<{ type: string; amount?: number; hits?: number }>;
      cost?: number;
    };
  },
  num: number,
  kw: string | null,
  isHits: boolean,
  occurrenceIdx: number,
  backupMarker?: string
): string | null {
  if (!def || !def.upgrade) {
    return backupMarker || null;
  }

  // 1. Auto-detect from effects array
  if (kw) {
    const baseEffs = def.effects || [];
    const upEffs = def.upgrade.effects || [];

    const matchingBase = baseEffs.filter((e) => EFFECT_TYPE_TO_KEYWORD[e.type] === kw);
    const matchingUp = upEffs.filter((e) => EFFECT_TYPE_TO_KEYWORD[e.type] === kw);

    if (isHits) {
      const hitsBase =
        matchingBase.find((e) => typeof e.hits === 'number' && e.hits === num) ||
        baseEffs.find((e) => typeof e.hits === 'number' && e.hits === num);
      if (hitsBase && typeof hitsBase.hits === 'number') {
        const hitsUp =
          matchingUp.find((e) => e.type === hitsBase.type) ||
          upEffs.find((e) => e.type === hitsBase.type);
        if (hitsUp && typeof hitsUp.hits === 'number' && hitsUp.hits > hitsBase.hits) {
          return `+${hitsUp.hits - hitsBase.hits}`;
        }
      }
    } else {
      // Find matching base effect by amount
      const exactBase = matchingBase.find((e) => typeof e.amount === 'number' && e.amount === num);
      if (exactBase && typeof exactBase.amount === 'number') {
        const exactUp = matchingUp.find((e) => e.type === exactBase.type);
        if (exactUp && typeof exactUp.amount === 'number' && exactUp.amount > exactBase.amount) {
          return `+${exactUp.amount - exactBase.amount}`;
        }
      }

      // If only one effect of this type exists
      if (matchingBase.length === 1 && matchingUp.length >= 1) {
        const b = matchingBase[0];
        const u = matchingUp[0];
        if (typeof b.amount === 'number' && typeof u.amount === 'number' && u.amount > b.amount) {
          return `+${u.amount - b.amount}`;
        }
        if (typeof b.hits === 'number' && typeof u.hits === 'number' && u.hits > b.hits) {
          return `+${u.hits - b.hits}`;
        }
      }
    }
  }

  // 2. Auto-detect by comparing numbers in def.upgrade.description
  if (def.upgrade.description) {
    const cleanBase = cleanCardDescriptionForPlay(def.description);
    const cleanUp = cleanCardDescriptionForPlay(def.upgrade.description);
    const baseNums = (cleanBase.match(/\b\d+\b/g) || []).map(Number);
    const upNums = (cleanUp.match(/\b\d+\b/g) || []).map(Number);
    if (baseNums.length === upNums.length && occurrenceIdx < baseNums.length) {
      if (upNums[occurrenceIdx] > baseNums[occurrenceIdx]) {
        return `+${upNums[occurrenceIdx] - baseNums[occurrenceIdx]}`;
      }
    }
  }

  // 3. Backup marker (uses {+3} or [+3] defined in description)
  if (backupMarker) {
    return backupMarker;
  }

  return null;
}

/**
 * Resolves temporary biome effects for a detected keyword from BattleEnvironmentModifiers.
 * Adds +X for damageBonus, wardBonus, statusBonus, healBonus, drawBonus, or energyBonus.
 */
function resolveBiomeDelta(
  kw: string | null,
  modifiers?: BattleEnvironmentModifiers
): string | null {
  if (!kw || !modifiers) return null;

  let bonus = 0;
  if (kw === 'damage') {
    bonus = modifiers.damageBonus ?? 0;
  } else if (kw === 'ward') {
    bonus = modifiers.wardBonus ?? 0;
  } else if (
    kw === 'bold' ||
    kw === 'faded' ||
    kw === 'exposed' ||
    kw === 'ink-burn' ||
    kw === 'thorns' ||
    kw === 'plated-armor'
  ) {
    bonus = modifiers.statusBonus ?? 0;
  } else if (kw === 'heal') {
    bonus = modifiers.healBonus ?? 0;
  } else if (kw === 'draw') {
    bonus = modifiers.drawBonus ?? 0;
  } else if (kw === 'energy') {
    bonus = modifiers.energyBonus ?? 0;
  }

  if (bonus > 0) {
    return `+${bonus}`;
  }
  return null;
}

export interface FormatCardDescriptionOptions {
  showUpgradeDelta?: boolean;
  environmentModifiers?: BattleEnvironmentModifiers;
  isAlreadyUpgraded?: boolean;
}

/**
 * Formats a card's description text for display:
 * 1. Defaults to auto-detecting every number in the description and the keyword following it.
 * 2. In upgrade previews (showUpgradeDelta=true), dynamically calculates effect deltas from
 *    the card's upgrade definition and appends "+X" after the number.
 * 3. In battle with an active biome, adds "+X" on numbers that receive temporary biome effects.
 * 4. Honors manual {+3} or [+3] markers in the description as a reliable backup if auto-detection
 *    does not yield a delta.
 */
export function formatCardDescription(
  def: {
    description: string;
    effects?: Array<{ type: string; amount?: number; hits?: number }>;
    upgrade?: {
      description?: string;
      effects?: Array<{ type: string; amount?: number; hits?: number }>;
      cost?: number;
    };
    cost?: number;
  },
  options: FormatCardDescriptionOptions = {}
): string {
  if (!def || !def.description) return '';

  const { showUpgradeDelta, environmentModifiers, isAlreadyUpgraded } = options;

  const rawDesc =
    isAlreadyUpgraded && !showUpgradeDelta && def.upgrade?.description
      ? def.upgrade.description
      : def.description;

  // Extract explicit backup markers like {+3} or [+3]
  const backupMap: Record<number, string> = {};
  const backupRegex = /(\b\d+\b)\s*[\{\[]([+-]?[\w\d]+)[\}\]]/g;
  let bMatch: RegExpExecArray | null;
  while ((bMatch = backupRegex.exec(rawDesc)) !== null) {
    const val = bMatch[2].startsWith('+') || bMatch[2].startsWith('-') ? bMatch[2] : `+${bMatch[2]}`;
    backupMap[Number(bMatch[1])] = val;
  }

  const clean = cleanCardDescriptionForPlay(rawDesc);

  if (!showUpgradeDelta && (!environmentModifiers || Object.keys(environmentModifiers).length === 0)) {
    return clean;
  }

  let formatted = '';
  let lastIdx = 0;
  const numRegex = /(?<![+-])\b(\d+)\b/g;
  let nMatch: RegExpExecArray | null;
  let occIdx = 0;

  while ((nMatch = numRegex.exec(clean)) !== null) {
    formatted += clean.slice(lastIdx, nMatch.index);
    const num = Number(nMatch[1]);
    const { keyword, isHits } = detectKeywordAroundNumber(clean, nMatch.index, nMatch.index + nMatch[1].length);
    const backupMarker = backupMap[num];

    let delta: string | null = null;
    if (showUpgradeDelta) {
      delta = resolveUpgradeDelta(def, num, keyword, isHits, occIdx, backupMarker);
    } else if (environmentModifiers) {
      delta = resolveBiomeDelta(keyword, environmentModifiers);
    }

    formatted += nMatch[1] + (delta ? ` ${delta}` : '');
    lastIdx = nMatch.index + nMatch[1].length;
    occIdx++;
  }

  formatted += clean.slice(lastIdx);

  // Fallback: If showUpgradeDelta is true but no numbers changed, check if rawDesc had standalone {+X}
  if (showUpgradeDelta && formatted === clean && /\{[+-]?[\w\d]+\}|\[[+-]?[\w\d]+\]/.test(rawDesc)) {
    return rawDesc
      .replace(/\{([+-]?[\w\d]+)\}/g, ' $1 ')
      .replace(/\[([+-]?[\w\d]+)\]/g, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  return formatted;
}

/**
 * Legacy/convenience wrapper for upgrade preview description formatting.
 */
export function formatUpgradePreviewDescription(def: {
  description: string;
  effects?: Array<{ type: string; amount?: number; hits?: number }>;
  upgrade?: {
    description?: string;
    effects?: Array<{ type: string; amount?: number; hits?: number }>;
    cost?: number;
  };
  cost?: number;
}): string {
  return formatCardDescription(def, { showUpgradeDelta: true });
}

/**
 * Combined non-capturing master regular expression used to slice text into segments,
 * including keyword effects and upgrade value deltas (e.g. +2, +3, -1, +X).
 */
const COMBINED_REGEX = new RegExp(
  '(' +
    [
      ...EFFECT_KEYWORDS.map((k) => k.pattern.source),
      '[+-]\\d+',
      '[+-][xX]',
    ].join('|') +
    ')',
  'gi'
);

/**
 * Contextually discovers the appropriate color for an upgrade delta (+2, +3, etc.)
 * by looking ahead or behind for the corresponding card effect keyword.
 * E.g. in "gain 4 +2 ward", "+2" detects "ward" and adopts luminous sky cyan (#38bdf8).
 */
function findAdjacentKeywordColor(
  parts: string[],
  idx: number
): { color: string; shadow: string } {
  // 1. Look ahead for the first non-empty token matching an effect keyword
  for (let i = idx + 1; i < parts.length; i++) {
    const raw = parts[i]?.trim();
    if (!raw) continue;
    const kw = EFFECT_KEYWORDS.find((k) => {
      const re = new RegExp('^' + k.pattern.source + '$', k.pattern.flags || 'i');
      return re.test(raw);
    });
    if (kw) {
      return { color: kw.color, shadow: kw.shadow };
    }
    // Stop looking ahead if sentence ends
    if (/[.;!?,]/.test(raw)) break;
  }

  // 2. Look behind if not found ahead (e.g. "Ward +2")
  for (let i = idx - 1; i >= 0; i--) {
    const raw = parts[i]?.trim();
    if (!raw) continue;
    const kw = EFFECT_KEYWORDS.find((k) => {
      const re = new RegExp('^' + k.pattern.source + '$', k.pattern.flags || 'i');
      return re.test(raw);
    });
    if (kw) {
      return { color: kw.color, shadow: kw.shadow };
    }
    if (/[.;!?,]/.test(raw)) break;
  }

  // 3. Fallback: Vibrant Upgrade Emerald Green
  return {
    color: '#34d399',
    shadow: 'rgba(52, 211, 153, 0.5)',
  };
}

/**
 * Parses card description text and wraps every card effect keyword (and its equivalents)
 * as well as upgrade value deltas (+2, +3, +X) in inline, high-contrast, color-coded badges
 * that remain readable and harmonious on any card background.
 */
export function renderHighlightedCardText(text: string): React.ReactNode {
  if (!text) return null;

  // Normalize any leftover optional tags like {+2} or [+2] to standard "+2" with spacing
  const normalizedText = text
    .replace(/\{([+-]?[\w\d]+)\}/g, ' $1 ')
    .replace(/\[([+-]?[\w\d]+)\]/g, ' $1 ')
    .replace(/\s{2,}/g, ' ');

  const parts = normalizedText.split(COMBINED_REGEX);

  return parts.map((part, idx) => {
    if (!part) return null;

    // 1. Check if part is a value delta (e.g. +2, +3, -1, +X)
    if (/^[+-](\d+|[xX])$/i.test(part)) {
      const theme = findAdjacentKeywordColor(parts, idx);
      return (
        <span
          key={idx}
          className="card-kw card-kw-delta"
          style={{
            color: theme.color,
            textShadow: `0 0 5px ${theme.shadow}`,
            fontWeight: 900,
          }}
          title={`Upgrade Value: ${part}`}
        >
          {part}
        </span>
      );
    }

    // 2. Check if part matches any standard keyword
    const matchedKw = EFFECT_KEYWORDS.find((k) => {
      const re = new RegExp('^' + k.pattern.source + '$', k.pattern.flags || 'i');
      return re.test(part);
    });

    if (matchedKw) {
      return (
        <span
          key={idx}
          className={`card-kw card-kw-${matchedKw.type}`}
          style={{
            color: matchedKw.color,
            textShadow: `0 0 5px ${matchedKw.shadow}`,
          }}
          title={matchedKw.label}
        >
          {part}
        </span>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}
