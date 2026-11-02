import React from 'react';
import type { CardInstance, CardRarity, PhraseDifficulty, BattleEnvironmentModifiers } from '../types/game';
import { resolveCardInstance, getCardDefinition } from '../utils/gameContent';
import { renderHighlightedCardText, formatCardDescription } from '../utils/textHighlight';

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
  isKept?: boolean;
  isDiscardCandidate?: boolean;
  isPowerAlreadyActive?: boolean;
  combatStatusGlow?: 'purple' | 'red' | 'green' | 'yellow' | null;
  priceBadge?: string;
  shopPrice?: string | number;
  subtitleOverride?: string;
  showUpgradeDelta?: boolean;
  environmentModifiers?: BattleEnvironmentModifiers;
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

/**
 * Blends a hex color with its perceived luminance gray value to produce
 * a slightly grayer, desaturated version while preserving its tonal contrast.
 */
function toSlightlyGrayerColor(hex: string, factor: number = 0.45): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const blendR = Math.round(r * (1 - factor) + gray * factor);
  const blendG = Math.round(g * (1 - factor) + gray * factor);
  const blendB = Math.round(b * (1 - factor) + gray * factor);
  return `rgb(${blendR}, ${blendG}, ${blendB})`;
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
 * - 292px width x 138px min-height with all 4 corners rounded (border-radius: 18px, border: 2.5px solid #0d1b22).
 * - Left side: 96x96 1:1 square with rounded corners (radius: 14px, #e9ecef background) for the card's sprite.
 * - Top-Right corner: 34x34 circular energy badge with dark background and white cost.
 * - Right column: Card title, description, and bottom pill for rarity (+ upgraded indicator).
 */
export const CardBanner: React.FC<CardBannerProps> = ({
  instance,
  phraseDiff,
  index = 0,
  isHighlighted = false,
  isEnterCandidate = false,
  isSelected = false,
  isUnaffordable = false,
  isKept = false,
  isDiscardCandidate = false,
  isPowerAlreadyActive = false,
  combatStatusGlow,
  priceBadge,
  shopPrice,
  subtitleOverride,
  showUpgradeDelta = false,
  environmentModifiers,
  className = '',
  style,
}) => {
  const resolved = resolveCardInstance(instance, phraseDiff);
  const def = getCardDefinition(instance.cardId);
  const category = getCardVisualCategory(resolved);
  const theme = getCardColorTheme(category, resolved.rarity);

  const displayPrice =
    shopPrice !== undefined
      ? typeof shopPrice === 'number'
        ? `${shopPrice}g`
        : shopPrice
      : priceBadge;

  // Build bottom pill rarity text: starter, common, uncommon, rare + ' · +'
  const isUpgraded = instance.upgraded || resolved.upgraded;
  let rarityText: string = resolved.rarity;
  if (resolved.type === 'power') {
    rarityText = `${resolved.rarity} · 1/combat`;
  }
  if (isUpgraded) {
    rarityText += ' · +';
  }

  // Dynamic font size and line height for title to allow comfortable wrapping with extra line space
  const titleLen = resolved.name.length;
  const titleFontSize =
    titleLen <= 16
      ? '0.98rem'
      : titleLen <= 26
      ? '0.90rem'
      : titleLen <= 38
      ? '0.82rem'
      : '0.76rem';
  const titleLineHeight = 1.18;

  // Description dynamic font size if long description or campfire subtitle override
  const descText =
    subtitleOverride ??
    formatCardDescription(def, {
      showUpgradeDelta,
      environmentModifiers,
      isAlreadyUpgraded: instance.upgraded,
    });
  const descFontSize = descText.length > 85 ? '0.70rem' : '0.74rem';

  return (
    <div
      data-card-id={instance.instanceId}
      className={`card-tab ${isHighlighted ? 'card-tab-highlighted' : ''} ${
        isEnterCandidate ? 'card-tab-enter-ready' : ''
      } ${isSelected ? 'card-tab-selected' : ''} ${
        isUnaffordable ? 'card-tab-unaffordable' : ''
      } ${
        combatStatusGlow ? `combat-glow-${combatStatusGlow}` : ''
      } rarity-${resolved.rarity} card-cat-${category} ${className}`}
      style={{
        width: 292,
        height: 138,
        minHeight: 138,
        maxHeight: 138,
        overflow: 'hidden',
        borderRadius: 18,
        border:
          isEnterCandidate || isSelected
            ? '3.5px solid #2ec4b6'
            : isHighlighted
            ? '3px solid #ffd166'
            : combatStatusGlow === 'purple'
            ? '2.5px solid #c084fc'
            : combatStatusGlow === 'red'
            ? '2.5px solid #f87171'
            : combatStatusGlow === 'green'
            ? '2.5px solid #34d399'
            : combatStatusGlow === 'yellow'
            ? '2.5px solid #fde047'
            : '2.5px solid #0d1b22',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 9px 7px 8px',
        backgroundColor: isUnaffordable ? toSlightlyGrayerColor(theme.bg, 0.45) : theme.bg,
        color: theme.textColor,
        transition:
          'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease, margin 0.18s ease, background-color 0.18s ease',
        boxShadow:
          combatStatusGlow === 'purple'
            ? '0 0 0 2px #a855f7, 0 0 16px rgba(168, 85, 247, 0.75), 0 0 26px rgba(168, 85, 247, 0.4)'
            : combatStatusGlow === 'red'
            ? '0 0 0 2px #ef4444, 0 0 16px rgba(239, 68, 68, 0.75), 0 0 26px rgba(239, 68, 68, 0.4)'
            : combatStatusGlow === 'green'
            ? '0 0 0 2px #10b981, 0 0 16px rgba(16, 185, 129, 0.75), 0 0 26px rgba(16, 185, 129, 0.4)'
            : combatStatusGlow === 'yellow'
            ? '0 0 0 2px #eab308, 0 0 16px rgba(234, 179, 8, 0.75), 0 0 26px rgba(234, 179, 8, 0.4)'
            : '2px 3px 8px rgba(13, 27, 34, 0.22)',
        animationDelay: `${(index % 7) * 0.22}s`,
        ...style,
      }}
    >
      {/* Top-Left: Kept Card Pin Badge */}
      {isKept && (
        <span
          className="card-kept-badge"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            background: '#047857',
            color: '#ecfdf5',
            border: '1.5px solid #064e3b',
            borderRadius: 7,
            padding: '2px 7px',
            fontSize: '0.68rem',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '0.04em',
            zIndex: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
          title="Kept from being discarded at end of turn"
        >
          📌 KEPT
        </span>
      )}

      {/* Top-Left: Discard Target Badge */}
      {isDiscardCandidate && !isKept && (
        <span
          className="card-discard-target-badge"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            background: '#be123c',
            color: '#fff1f2',
            border: '1.5px solid #881337',
            borderRadius: 7,
            padding: '2px 7px',
            fontSize: '0.68rem',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '0.04em',
            zIndex: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
          title="Choose this card to discard"
        >
          🗑️ DISCARD
        </span>
      )}

      {/* Top-Left: Already Active Power Badge */}
      {isPowerAlreadyActive && !isDiscardCandidate && !isKept && (
        <span
          className="card-power-active-badge"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            background: '#78350f',
            color: '#fef3c7',
            border: '1.5px solid #d97706',
            borderRadius: 7,
            padding: '2px 7px',
            fontSize: '0.68rem',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '0.04em',
            zIndex: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
          title="This power is already active this combat (usable once per combat)"
        >
          ⚡ ACTIVE (1/COMBAT)
        </span>
      )}

      {/* Top-Left: Combat Pile Location Badge (Deck Modal in Combat) */}
      {combatStatusGlow && !isKept && !isDiscardCandidate && !isPowerAlreadyActive && (
        <span
          className={`card-combat-pile-badge pile-${combatStatusGlow}`}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            borderRadius: 7,
            padding: '2px 7px',
            fontSize: '0.64rem',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '0.04em',
            zIndex: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            backgroundColor:
              combatStatusGlow === 'purple'
                ? '#581c87'
                : combatStatusGlow === 'red'
                ? '#7f1d1d'
                : combatStatusGlow === 'green'
                ? '#064e3b'
                : '#713f12',
            color:
              combatStatusGlow === 'purple'
                ? '#f3e8ff'
                : combatStatusGlow === 'red'
                ? '#fee2e2'
                : combatStatusGlow === 'green'
                ? '#d1fae5'
                : '#fef9c3',
            border:
              combatStatusGlow === 'purple'
                ? '1.5px solid #c084fc'
                : combatStatusGlow === 'red'
                ? '1.5px solid #f87171'
                : combatStatusGlow === 'green'
                ? '1.5px solid #34d399'
                : '1.5px solid #fde047',
          }}
          title={
            combatStatusGlow === 'purple'
              ? 'In Discard Pile'
              : combatStatusGlow === 'red'
              ? 'Exhausted this combat'
              : combatStatusGlow === 'green'
              ? 'Currently in Hand'
              : 'In Deck (Draw Pile)'
          }
        >
          {combatStatusGlow === 'purple'
            ? 'DISCARD'
            : combatStatusGlow === 'red'
            ? 'EXHAUSTED'
            : combatStatusGlow === 'green'
            ? 'IN HAND'
            : 'IN DECK'}
        </span>
      )}

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
          color: isUnaffordable ? '#ff4d4d' : '#2ec4b6',
          textShadow: isUnaffordable
            ? '0 0 9px rgba(255, 77, 77, 0.85)'
            : '0 0 7px rgba(46, 196, 182, 0.65)',
          border:
            isEnterCandidate || isSelected
              ? '2.5px solid #2ec4b6'
              : isHighlighted
              ? '2.5px solid #ffd166'
              : isUnaffordable
              ? '2.5px solid #4a1515'
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
        {resolved.cost === -1 || (resolved as any).xCost ? (
          'X'
        ) : showUpgradeDelta &&
          def.upgrade &&
          def.upgrade.cost !== undefined &&
          def.upgrade.cost !== def.cost ? (
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
            <span>{def.cost}</span>
            <span
              style={{
                fontSize: '0.74rem',
                color: isUnaffordable ? '#ff8080' : '#34d399',
                fontWeight: 900,
              }}
            >
              {def.upgrade.cost - def.cost > 0
                ? `+${def.upgrade.cost - def.cost}`
                : def.upgrade.cost - def.cost}
            </span>
          </span>
        ) : (
          resolved.cost
        )}
      </div>

      {/* Left column: Image slot (top) + Rarity pill (bottom) */}
      <div
        className="card-left-art-col"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          width: 96,
          minWidth: 96,
          height: 122,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          className="card-art-box"
          style={{
            width: 96,
            height: 96,
            minWidth: 96,
            minHeight: 96,
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

        {/* Bottom: Rarity pill under the image slot */}
        <div
          className="card-rarity-bottom-pill card-rarity-pill"
          style={{
            width: '100%',
            height: 19,
            boxSizing: 'border-box',
            borderRadius: 6,
            border: '1.5px solid #0d1b22',
            background: theme.pillBg,
            color: theme.textColor,
            textAlign: 'center',
            padding: '0 4px',
            fontSize: resolved.type === 'power' ? '0.61rem' : '0.67rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: '17px',
            textTransform: 'lowercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 0,
          }}
        >
          {rarityText}
        </div>
      </div>

      {/* Right half: Title (top), Description (middle/bottom with full space) */}
      <div
        className="card-info-col card-info-right"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          flex: 1,
          minWidth: 0,
          height: 122,
          maxHeight: 122,
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
            minHeight: 22,
            maxHeight: 46,
            overflow: 'hidden',
            flexShrink: 0,
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

        {/* Middle/Bottom: Card description with abundant vertical space */}
        <div
          className="card-desc-text card-tab-sub"
          style={{
            fontSize: descFontSize,
            lineHeight: 1.35,
            textAlign: 'left',
            marginTop: 3,
            marginBottom: 0,
            flex: 1,
            wordBreak: 'break-word',
            color: theme.descColor,
            opacity: 0.95,
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {renderHighlightedCardText(descText)}
        </div>
      </div>
    </div>
  );
};
