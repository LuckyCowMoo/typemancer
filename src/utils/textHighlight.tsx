import React from 'react';

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
    type: 'damage',
    pattern: /\b(?:damage|Attack)\b/,
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
    type: 'thorns',
    pattern: /\bthorns\b/i,
    color: '#a3e635',
    border: '#84cc16',
    shadow: 'rgba(132, 204, 22, 0.5)',
    label: 'Thorns (Counter-Damage)',
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
    pattern: /\bdraws?\b/i,
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
    shadow: 'rgba(16, 185, 129, 0.5)',
    label: 'Keep (Retain card from discard at end of turn)',
  },
];

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
 * Formats a card's description for upgrade preview areas (such as Campfire Revise).
 * 1. If an optional position is explicitly defined with {+2} or [+2] in the description,
 *    it places the +2 in that exact defined position.
 * 2. If no tag is defined, it automatically calculates effect deltas between base and upgrade
 *    and inserts "+X" after the base number before the corresponding keyword.
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
  if (!def) return '';

  // 1. If explicit delta tag like {+2} or [+2] is present in description:
  if (/\{[+-]?[\w\d]+\}|\[[+-]?[\w\d]+\]/.test(def.description)) {
    return def.description
      .replace(/\{([+-]?[\w\d]+)\}/g, ' $1 ')
      .replace(/\[([+-]?[\w\d]+)\]/g, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // 2. If no upgrade defined, return base description
  if (!def.upgrade) {
    return cleanCardDescriptionForPlay(def.description);
  }

  // 3. Automatically compute effect deltas between base and upgrade
  let preview = cleanCardDescriptionForPlay(def.description);
  const baseEffects = def.effects || [];
  const upEffects = def.upgrade.effects || [];

  // Match by effect type across the full array rather than strictly by index
  for (const baseEff of baseEffects) {
    if (!baseEff || typeof baseEff.amount !== 'number') continue;
    const upEff = upEffects.find((u) => u.type === baseEff.type);
    if (!upEff || typeof upEff.amount !== 'number') continue;

    const diff = upEff.amount - baseEff.amount;
    if (diff > 0) {
      const deltaStr = `+${diff}`;
      const amt = baseEff.amount;
      const targetPattern = new RegExp(`(\\b${amt}\\b)(?!\\s*\\+)`, 'i');
      if (targetPattern.test(preview)) {
        preview = preview.replace(targetPattern, `$1 ${deltaStr}`);
      }
    }
  }

  // Check multi-hit count increases (e.g. hits: 2 -> 3)
  for (const baseEff of baseEffects) {
    if (baseEff && typeof baseEff.hits === 'number') {
      const upEff = upEffects.find((u) => u.type === baseEff.type);
      if (upEff && typeof upEff.hits === 'number' && upEff.hits > baseEff.hits) {
        const diff = upEff.hits - baseEff.hits;
        const deltaStr = `+${diff}`;
        const targetPattern = new RegExp(`(\\b${baseEff.hits}\\b|twice)(?!\\s*\\+)`, 'i');
        if (targetPattern.test(preview)) {
          preview = preview.replace(targetPattern, `$1 ${deltaStr}`);
        }
      }
    }
  }

  // If text is still unchanged but upgrade.description differs, compare numbers directly
  if (preview === cleanCardDescriptionForPlay(def.description) && def.upgrade.description) {
    const cleanUpDesc = cleanCardDescriptionForPlay(def.upgrade.description);
    const baseNums = (cleanCardDescriptionForPlay(def.description).match(/\b\d+\b/g) || []).map(Number);
    const upNums = (cleanUpDesc.match(/\b\d+\b/g) || []).map(Number);
    if (baseNums.length === upNums.length && baseNums.length > 0) {
      for (let i = 0; i < baseNums.length; i++) {
        if (upNums[i] > baseNums[i]) {
          const diff = upNums[i] - baseNums[i];
          const deltaStr = `+${diff}`;
          const targetPattern = new RegExp(`(\\b${baseNums[i]}\\b)(?!\\s*\\+)`, 'i');
          if (targetPattern.test(preview)) {
            preview = preview.replace(targetPattern, `$1 ${deltaStr}`);
          }
        }
      }
    }
  }

  return preview;
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
