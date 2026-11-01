import React from 'react';
import type { CardInstance, CardRarity, PhraseDifficulty } from '../types/game';
import { resolveCardInstance } from '../utils/gameContent';
import { renderHighlightedCardText } from '../utils/textHighlight';

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
 * within each rarity ascending by energy cost so more expensive cards are at the bottom,
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

    const costA = resA.xCost || resA.cost === -1 ? 999 : (resA.cost ?? 0);
    const costB = resB.xCost || resB.cost === -1 ? 999 : (resB.cost ?? 0);
    if (costA !== costB) {
      return costA - costB;
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

  // Dynamic font size and line height for title to prevent card expansion on long names
  const titleLen = resolved.name.length;
  const titleFontSize =
    titleLen <= 14
      ? '0.96rem'
      : titleLen <= 22
      ? '0.86rem'
      : titleLen <= 32
      ? '0.78rem'
      : titleLen <= 45
      ? '0.72rem'
      : '0.66rem';
  const titleLineHeight = titleLen > 22 ? 1.12 : 1.18;

  // Description dynamic font size if long description or campfire subtitle override
  const descText = subtitleOverride ?? resolved.description;
  const descFontSize = descText.length > 70 ? '0.67rem' : '0.71rem';

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
        height: 112,
        minHeight: 112,
        maxHeight: 112,
        overflow: 'hidden',
        borderRadius: 18,
        border:
          isEnterCandidate || isSelected
            ? '3.5px solid #2ec4b6'
            : isHighlighted
            ? '3px solid #ffd166'
            : '2.5px solid #0d1b22',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 9px 7px 8px',
        backgroundColor: theme.bg,
        color: theme.textColor,
        transition:
          'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease, margin 0.18s ease, background-color 0.18s ease',
        boxShadow: '2px 3px 8px rgba(13, 27, 34, 0.22)',
        animationDelay: `${(index % 7) * 0.22}s`,
        ...style,
      }}
    >
      {/* Top-Right: Shop Price (optional, placed to the left of the corner inlet) */}
      {displayPrice && (
        <span
          className="card-price-pill"
          style={{
            position: 'absolute',
            top: 4,
            right: 46,
            background: '#141a1f',
            color: '#ffd166',
            border: '1.5px solid #0d1b22',
            borderRadius: 7,
            padding: '1px 6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            lineHeight: 1.2,
            zIndex: 6,
          }}
          title="Gold Price"
        >
          {displayPrice}
        </span>
      )}

      {/* Top-Right: Flush Architectural Inlet Corner Piece */}
      <div
        className="card-corner-inlet"
        style={{
          position: 'absolute',
          top: -2.5,
          right: -2.5,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 13,
          borderTopLeftRadius: 0,
          borderBottomRightRadius: 0,
          background: '#0d1b22',
          color: '#ffffff',
          border:
            isEnterCandidate || isSelected
              ? '2.5px solid #2ec4b6'
              : isHighlighted
              ? '2.5px solid #ffd166'
              : '2.5px solid #0d1b22',
          minWidth: 40,
          height: 34,
          padding: '2px 8px 3px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.08rem',
          fontWeight: 900,
          boxShadow: '-2px 2px 6px rgba(0, 0, 0, 0.35)',
          zIndex: 5,
          boxSizing: 'border-box',
        }}
        title="Energy Cost"
      >
        {resolved.cost === -1 || (resolved as any).xCost ? 'X' : resolved.cost}
      </div>

      {/* Left side: Large 1:1 Square with rounded corners (82x82, radius 12px, #e9ecef) */}
      <div
        className="card-art-box card-art-square"
        style={{
          width: 82,
          height: 82,
          minWidth: 82,
          minHeight: 82,
          borderRadius: 12,
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
          height: 82,
          maxHeight: 82,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Top: Card title */}
        <div
          className="card-title-row card-tab-header"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingRight: displayPrice ? 88 : 38,
            maxHeight: 30,
            overflow: 'hidden',
          }}
        >
          <span
            className="card-title-text card-tab-name"
            style={{
              fontWeight: 800,
              fontSize: titleFontSize,
              lineHeight: titleLineHeight,
              textAlign: 'left',
              wordBreak: 'break-word',
              color: theme.textColor,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {resolved.name}
          </span>
        </div>

        {/* Middle: Card description */}
        <div
          className="card-desc-text card-tab-sub"
          style={{
            fontSize: descFontSize,
            lineHeight: 1.42,
            textAlign: 'left',
            marginTop: 2,
            marginBottom: 3,
            flex: 1,
            wordBreak: 'break-word',
            color: theme.descColor,
            opacity: 0.95,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {renderHighlightedCardText(descText)}
        </div>

        {/* Bottom: Full-width rounded pill for rarity */}
        <div
          className="card-rarity-bottom-pill card-rarity-pill"
          style={{
            width: '100%',
            height: 18,
            boxSizing: 'border-box',
            borderRadius: 6,
            border: '1.5px solid #0d1b22',
            background: theme.pillBg,
            color: theme.textColor,
            textAlign: 'center',
            padding: '0 6px',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: '16px',
            textTransform: 'lowercase',
            flexShrink: 0,
          }}
        >
          {rarityText}
        </div>
      </div>
    </div>
  );
};
