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
];

/**
 * Combined non-capturing master regular expression used to slice text into segments.
 */
const COMBINED_REGEX = new RegExp(
  '(' + EFFECT_KEYWORDS.map((k) => k.pattern.source).join('|') + ')',
  'gi'
);

/**
 * Parses card description text and wraps every card effect keyword (and its equivalents)
 * in an inline, high-contrast, color-coded badge that remains readable on any card background.
 */
export function renderHighlightedCardText(text: string): React.ReactNode {
  if (!text) return null;

  const parts = text.split(COMBINED_REGEX);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Check if part matches any keyword
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
