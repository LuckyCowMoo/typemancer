import React from 'react';
import type { CardInstance, CardRarity, PhraseDifficulty } from '../types/game';
import { resolveCardInstance } from '../utils/gameContent';

export type ResolvedCard = ReturnType<typeof resolveCardInstance>;
export type CardVisualCategory = 'attack' | 'defence' | 'skill' | 'debuff' | 'power';

export interface CardColorTheme {
  bg: string;
  pillBg: string;
  textColor: string;
  descColor: string;
}

export interface CardBannerProps {
  instance: CardInstance;
  phraseDiff: PhraseDifficulty;
  index?: number;
  isHighlighted?: boolean;
  isEnterCandidate?: boolean;
  isSelected?: boolean;
  isUnaffordable?: boolean;
  priceBadge?: string;
  shopPrice?: string | number;
  subtitleOverride?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Human-readable category labels for card groupings (e.g. within View Deck overlay)
 */
export const CARD_CATEGORY_LABELS: Record<CardVisualCategory, string> = {
  attack: 'Attack Cards',
  defence: 'Defence & Ward Cards',
  skill: 'Utility & Buff Cards',
  debuff: 'Curse & Status Cards',
  power: 'Persistent Power Cards',
};

/**
 * Categorizes a resolved card into one of 5 distinct visual archetypes:
 * - 'power': Persistent combat powers
 * - 'attack': Damage-dealing attacks
 * - 'defence': Ward and shield skills
 * - 'debuff': Ink burn, faded, and exposed afflictions
 * - 'skill': Utility, card draw, healing, and energy buffs
 */
export function getCardVisualCategory(resolved: ResolvedCard): CardVisualCategory {
  if (resolved.type === 'power') {
    return 'power';
  }
  if (resolved.type === 'attack') {
    return 'attack';
  }

  // Otherwise (type === 'skill'):
  const effects = resolved.effects || [];
  const firstType = effects[0]?.type;
  if (
    firstType === 'ward' ||
    firstType === 'double_ward' ||
    firstType === 'gain_ward_per_card_in_hand'
  ) {
    return 'defence';
  }

  const hasDebuff = effects.some((e) =>
    ['ink_burn', 'double_ink_burn', 'faded', 'exposed'].includes(e.type)
  );
  if (hasDebuff) {
    return 'debuff';
  }

  return 'skill';
}

/**
 * Visual color themes for card archetypes and rarities.
 * Rarer cards (starter -> common -> uncommon -> rare) become progressively darker
 * within that category's palette.
 */
export const CARD_COLOR_THEMES: Record<CardVisualCategory, Record<CardRarity, CardColorTheme>> = {
  attack: {
    starter: { bg: '#d96b43', pillBg: '#c0562f', textColor: '#11161a', descColor: '#1c242b' },
    common: { bg: '#c24d2c', pillBg: '#a63c1e', textColor: '#fff9f5', descColor: '#fde8e0' },
    uncommon: { bg: '#9e3219', pillBg: '#7f2410', textColor: '#fff9f5', descColor: '#fbd5c8' },
    rare: { bg: '#6e1b0b', pillBg: '#521105', textColor: '#ffd166', descColor: '#fae0d8' },
  },
  defence: {
    starter: { bg: '#16698a', pillBg: '#125672', textColor: '#ffffff', descColor: '#e0f2fe' },
    common: { bg: '#105470', pillBg: '#0c4158', textColor: '#ffffff', descColor: '#dbeafe' },
    uncommon: { bg: '#0b3d54', pillBg: '#082c3d', textColor: '#ffffff', descColor: '#bae6fd' },
    rare: { bg: '#062636', pillBg: '#041824', textColor: '#ffd166', descColor: '#e0f2fe' },
  },
  skill: {
    starter: { bg: '#2d8a61', pillBg: '#236e4d', textColor: '#ffffff', descColor: '#dcfce7' },
    common: { bg: '#21704d', pillBg: '#18573b', textColor: '#ffffff', descColor: '#d1fae5' },
    uncommon: { bg: '#165338', pillBg: '#0f3d28', textColor: '#ffffff', descColor: '#a7f3d0' },
    rare: { bg: '#0c3623', pillBg: '#072216', textColor: '#ffd166', descColor: '#d1fae5' },
  },
  debuff: {
    starter: { bg: '#7e489c', pillBg: '#663780', textColor: '#ffffff', descColor: '#f3e8ff' },
    common: { bg: '#683587', pillBg: '#52276b', textColor: '#ffffff', descColor: '#f3e8ff' },
    uncommon: { bg: '#4e2269', pillBg: '#3b1752', textColor: '#ffffff', descColor: '#e9d5ff' },
    rare: { bg: '#34124a', pillBg: '#230a33', textColor: '#ffd166', descColor: '#f3e8ff' },
  },
  power: {
    starter: { bg: '#b87d19', pillBg: '#966411', textColor: '#ffffff', descColor: '#fef3c7' },
    common: { bg: '#9c660f', pillBg: '#7d5009', textColor: '#ffffff', descColor: '#fef3c7' },
    uncommon: { bg: '#7a4d08', pillBg: '#5e3a04', textColor: '#ffffff', descColor: '#fde68a' },
    rare: { bg: '#543203', pillBg: '#3b2201', textColor: '#ffd166', descColor: '#fef3c7' },
  },
};

export function getCardColorTheme(
  category: CardVisualCategory,
  rarity: CardRarity
): CardColorTheme {
  return CARD_COLOR_THEMES[category]?.[rarity] ?? CARD_COLOR_THEMES.attack.starter;
}

const CATEGORY_ORDER: Record<CardVisualCategory, number> = {
  attack: 0,
  defence: 1,
  skill: 2,
  debuff: 3,
  power: 4,
};

const RARITY_ORDER: Record<CardRarity, number> = {
  starter: 0,
  common: 1,
  uncommon: 2,
  rare: 3,
};

/**
 * Sorts card items first by category (attack -> defence -> skill -> debuff -> power),
 * then by rarity ascending so rarer cards are placed at the bottom of each category's grouping,
 * and finally alphabetically by card name.
 */
export function sortCardsByCategoryAndRarity<T>(
  items: T[],
  getInstance: (item: T) => CardInstance,
  phraseDiff: 'easy' | 'medium' | 'hard'
): T[] {
  return [...items].sort((a, b) => {
    const instA = getInstance(a);
    const instB = getInstance(b);
    const resA = resolveCardInstance(instA, phraseDiff);
    const resB = resolveCardInstance(instB, phraseDiff);

    const catA = CATEGORY_ORDER[getCardVisualCategory(resA)] ?? 99;
    const catB = CATEGORY_ORDER[getCardVisualCategory(resB)] ?? 99;
    if (catA !== catB) {
      return catA - catB;
    }

    const rarA = RARITY_ORDER[resA.rarity] ?? 0;
    const rarB = RARITY_ORDER[resB.rarity] ?? 0;
    if (rarA !== rarB) {
      return rarA - rarB;
    }

    return resA.name.localeCompare(resB.name);
  });
}

/**
 * Unified Card Banner component matching the new card design:
 * - 292px width x 112px min-height with all 4 corners rounded (border-radius: 18px, border: 2.5px solid #0d1b22).
 * - Left side: 86x86 1:1 square with rounded corners (radius: 14px, #e9ecef background) for the card's sprite.
 * - Top-Right corner: 34x34 circular energy badge with dark background and white cost.
 * - Right column: Card title, description, and full-width bottom pill for rarity (+ upgraded / 1x burn tags).
 */
export const CardBanner: React.FC<CardBannerProps> = ({
  instance,
  phraseDiff,
  index = 0,
  isHighlighted = false,
  isEnterCandidate = false,
  isSelected = false,
  isUnaffordable = false,
  priceBadge,
  shopPrice,
  subtitleOverride,
  className = '',
  style,
}) => {
  const resolved = resolveCardInstance(instance, phraseDiff);
  const category = getCardVisualCategory(resolved);
  const theme = getCardColorTheme(category, resolved.rarity);

  const displayPrice =
    shopPrice !== undefined
      ? typeof shopPrice === 'number'
        ? `${shopPrice}g`
        : shopPrice
      : priceBadge;

  // Build bottom pill rarity text: starter, common, uncommon, rare + ' · +' / ' · 1x'
  const isUpgraded = instance.upgraded || resolved.upgraded;
  let rarityText: string = resolved.rarity;
  if (isUpgraded) {
    rarityText += ' · +';
  }
  if (resolved.burnDraft && resolved.type !== 'power') {
    rarityText += ' · 1x';
  }

  const isFocusState = isHighlighted || isEnterCandidate || isSelected;

  return (
    <div
      data-card-id={instance.instanceId}
      className={`card-tab ${isHighlighted ? 'card-tab-highlighted' : ''} ${
        isEnterCandidate ? 'card-tab-enter-ready' : ''
      } ${isSelected ? 'card-tab-selected' : ''} ${
        isUnaffordable ? 'card-tab-unaffordable' : ''
      } rarity-${resolved.rarity} card-cat-${category} ${className}`}
      style={{
        width: 292,
        minHeight: 112,
        borderRadius: 18,
        border: '2.5px solid #0d1b22',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        backgroundColor: isFocusState ? undefined : theme.bg,
        color: isFocusState ? undefined : theme.textColor,
        transition:
          'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.16s ease, background-color 0.16s ease',
        boxShadow: '2px 3px 8px rgba(13, 27, 34, 0.22)',
        animationDelay: `${(index % 7) * 0.22}s`,
        ...style,
      }}
    >
      {/* Top-Right Badges: Shop Price (optional) + Energy Cost Circle */}
      <div
        className="card-top-right-badges"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 3,
        }}
      >
        {displayPrice && (
          <span
            className="card-price-pill"
            style={{
              background: '#141a1f',
              color: '#ffd166',
              border: '1.5px solid #0d1b22',
              borderRadius: 8,
              padding: '2px 7px',
              fontSize: '0.75rem',
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            title="Gold Price"
          >
            {displayPrice}
          </span>
        )}
        <div
          className="card-energy-circle"
          style={{
            width: 34,
            height: 34,
            minWidth: 34,
            minHeight: 34,
            borderRadius: '50%',
            background: '#141a1f',
            color: '#ffffff',
            border: '2px solid #0d1b22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.05rem',
            lineHeight: 1,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
          }}
          title="Energy Cost"
        >
          {resolved.cost}
        </div>
      </div>

      {/* Left side: Large 1:1 Square with rounded corners (86x86, radius 14px, #e9ecef) */}
      <div
        className="card-art-box card-art-square"
        style={{
          width: 86,
          height: 86,
          minWidth: 86,
          minHeight: 86,
          borderRadius: 14,
          background: '#e9ecef',
          border: '2px solid #0d1b22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {resolved.art.spriteUrl ? (
          <img
            src={resolved.art.spriteUrl}
            alt=""
            className="card-art-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
        ) : null}
      </div>

      {/* Right half: Title (top), Description (middle), Rarity Full Pill (bottom) */}
      <div
        className="card-info-col card-info-right"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          minWidth: 0,
          minHeight: 86,
          boxSizing: 'border-box',
        }}
      >
        {/* Top: Card title */}
        <div
          className="card-title-row card-tab-header"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingRight: displayPrice ? 96 : 42,
          }}
        >
          <span
            className="card-title-text card-tab-name"
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              lineHeight: 1.2,
              textAlign: 'left',
              wordBreak: 'break-word',
              color: isFocusState ? undefined : theme.textColor,
            }}
          >
            {resolved.name}
          </span>
        </div>

        {/* Middle: Card description */}
        <div
          className="card-desc-text card-tab-sub"
          style={{
            fontSize: '0.74rem',
            lineHeight: 1.25,
            textAlign: 'left',
            marginTop: 3,
            marginBottom: 6,
            flex: 1,
            wordBreak: 'break-word',
            color: isFocusState ? undefined : theme.descColor,
            opacity: isFocusState ? 1 : 0.95,
          }}
        >
          {subtitleOverride ?? resolved.description}
        </div>

        {/* Bottom: Full-width rounded pill for rarity */}
        <div
          className="card-rarity-bottom-pill card-rarity-pill"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 8,
            border: '1.5px solid #0d1b22',
            background: isFocusState ? 'rgba(0, 0, 0, 0.14)' : theme.pillBg,
            color: isFocusState ? undefined : theme.textColor,
            textAlign: 'center',
            padding: '2px 6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1.15,
            textTransform: 'lowercase',
          }}
        >
          {rarityText}
        </div>
      </div>
    </div>
  );
};
