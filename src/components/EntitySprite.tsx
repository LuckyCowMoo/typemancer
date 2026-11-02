import React from 'react';
import type { ArtPlaceholder, EnemyIntentType } from '../types/game';
import { calculateEnemySpriteScale } from '../utils/gameContent';

export interface SpriteProps {
  art: ArtPlaceholder;
  width?: number;
  height?: number;
  scale?: number;
  maxHp?: number;
  isElite?: boolean;
  isHighlighted?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders either a custom non-AI sprite image (once added to `art.spriteUrl` in JSON)
 * or a clean, expressive SVG shape matching the mockup's capsule/geometric style.
 * Supports diminishing-returns scaling based on max health, plus flat 25% extra size for elites.
 */
export const EntitySprite: React.FC<SpriteProps> = ({
  art,
  width = 96,
  height = 96,
  scale,
  maxHp,
  isElite = false,
  isHighlighted = false,
  className = '',
  style,
}) => {
  const isFlipped = Boolean(art.flip);

  const effectiveScale =
    scale !== undefined
      ? scale
      : maxHp !== undefined
      ? calculateEnemySpriteScale(maxHp, isElite)
      : 1;

  const renderW = Math.round(width * effectiveScale);
  const renderH = Math.round(height * effectiveScale);

  if (art.spriteUrl) {
    const scaleVal = isHighlighted ? 1.1 : 1;
    const flipScale = isFlipped ? `scaleX(-1) scale(${scaleVal})` : `scale(${scaleVal})`;

    return (
      <img
        src={art.spriteUrl}
        alt=""
        className={className}
        style={{
          width: renderW,
          height: renderH,
          objectFit: 'contain',
          imageRendering: 'pixelated',
          filter: isHighlighted
            ? 'drop-shadow(0 0 10px rgba(255, 209, 102, 0.95)) drop-shadow(0 4px 4px rgba(43, 30, 22, 0.35))'
            : 'drop-shadow(0 4px 4px rgba(43, 30, 22, 0.32))',
          transition:
            'transform 0.16s ease, filter 0.16s ease, width 0.2s ease, height 0.2s ease',
          transform: flipScale,
          transformOrigin: 'bottom center',
          ...style,
        }}
      />
    );
  }

  const strokeColor = isHighlighted ? '#ffd166' : '#0b2b3c';
  const strokeWidth = isHighlighted ? 4 : 3;
  const highlightScale = isHighlighted ? 1.06 : 1;
  const transform = isFlipped
    ? `scaleX(-1) scale(${highlightScale})`
    : `scale(${highlightScale})`;

  return (
    <svg
      width={renderW}
      height={renderH}
      viewBox="0 0 100 160"
      className={className}
      style={{
        filter: isHighlighted ? 'drop-shadow(0 0 10px rgba(255, 209, 102, 0.85))' : 'none',
        transition:
          'transform 0.15s ease, filter 0.15s ease, width 0.2s ease, height 0.2s ease',
        transform,
        transformOrigin: 'bottom center',
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`grad_${art.primaryColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={art.secondaryColor || art.primaryColor} />
          <stop offset="100%" stopColor={art.primaryColor} />
        </linearGradient>
      </defs>

      {art.shape === 'capsule' && (
        <rect
          x="12"
          y="8"
          width="76"
          height="144"
          rx="38"
          ry="38"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'hexagon' && (
        <polygon
          points="50,6 90,38 90,122 50,154 10,122 10,38"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'shield' && (
        <path
          d="M14,16 L86,16 L86,84 C86,120 50,148 50,154 C50,148 14,120 14,84 Z"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'diamond' && (
        <polygon
          points="50,6 92,80 50,154 8,80"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'spiky' && (
        <polygon
          points="50,4 72,30 94,24 82,66 96,102 74,122 80,152 50,138 20,152 26,122 4,102 18,66 6,24 28,30"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'thorn' && (
        <path
          d="M50,6 C78,26 88,62 82,108 C78,136 64,152 50,154 C36,152 22,136 18,108 C12,62 22,26 50,6 Z"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'crown' && (
        <polygon
          points="12,146 8,42 34,74 50,14 66,74 92,42 88,146"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}

      {art.shape === 'scroll' && (
        <rect
          x="16"
          y="14"
          width="68"
          height="132"
          rx="16"
          ry="16"
          fill={`url(#grad_${art.primaryColor.replace('#', '')})`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      )}
    </svg>
  );
};

interface IntentBadgeProps {
  intent: EnemyIntentType;
  damage?: number | string;
  faded?: number;
  hits?: number;
  ward?: number;
  heal?: number;
}

/**
 * Renders the enemy's upcoming action below their capsule, matching the mockup's
 * orange lightning-fist icon + number for attacks and green heart for heals/support.
 */
export const IntentBadge: React.FC<IntentBadgeProps> = ({
  intent,
  damage,
  faded,
  hits = 1,
  ward,
  heal,
}) => {
  if (intent === 'attack' || intent === 'multi_attack' || intent === 'attack_debuff' || intent === 'attack_defend') {
    let displayDamage: React.ReactNode = damage ?? 0;
    if (typeof damage === 'number' && faded && faded > 0) {
      displayDamage = (
        <span className="intent-faded-calc">
          <span className="intent-base-dmg">{damage}</span>
          <span className="intent-faded-minus">-{faded}</span>
        </span>
      );
    } else if (typeof damage === 'string' && damage.includes('-')) {
      const [basePart, fadedPart] = damage.split('-');
      displayDamage = (
        <span className="intent-faded-calc">
          <span className="intent-base-dmg">{basePart}</span>
          <span className="intent-faded-minus">-{fadedPart}</span>
        </span>
      );
    }

    return (
      <div
        className="intent-badge intent-attack"
        title={
          faded && faded > 0
            ? `Enemy intends to attack (${damage}-${faded} damage from Faded)`
            : 'Enemy intends to attack'
        }
      >
        <svg width="26" height="32" viewBox="0 0 28 36">
          {/* Fist + Lightning bolt matching the user's mockup */}
          <path
            d="M8,4 L20,4 L22,12 L15,12 L20,20 L9,34 L12,20 L6,20 Z"
            fill="#b84a14"
            stroke="#5a2004"
            strokeWidth="1.5"
          />
        </svg>
        <span className="intent-number">
          {displayDamage}
          {hits > 1 ? `x${hits}` : ''}
        </span>
        {intent === 'attack_defend' && ward ? (
          <span className="intent-sub">+{ward}🛡️</span>
        ) : null}
        {intent === 'attack_debuff' ? <span className="intent-sub">+💧</span> : null}
      </div>
    );
  }

  if (intent === 'heal') {
    return (
      <div className="intent-badge intent-heal" title="Enemy intends to heal">
        <svg width="28" height="26" viewBox="0 0 32 30">
          <path
            d="M16,27 C16,27 3,18 3,9 C3,4.5 6.8,1.5 11,1.5 C13.6,1.5 15.2,3 16,4.8 C16.8,3 18.4,1.5 21,1.5 C25.2,1.5 29,4.5 29,9 C29,18 16,27 16,27 Z"
            fill="#3a8918"
            stroke="#1e4d0b"
            strokeWidth="1.5"
          />
        </svg>
        {heal ? <span className="intent-number heal-text">+{heal}</span> : null}
      </div>
    );
  }

  if (intent === 'defend') {
    return (
      <div className="intent-badge intent-defend" title="Enemy intends to gain Ward">
        <svg width="24" height="26" viewBox="0 0 28 30">
          <path
            d="M4,4 L24,4 L24,15 C24,22 14,27 14,28 C14,27 4,22 4,15 Z"
            fill="#1f6f8b"
            stroke="#0d3b4c"
            strokeWidth="1.8"
          />
        </svg>
        {ward ? <span className="intent-number defend-text">+{ward}</span> : null}
      </div>
    );
  }

  if (intent === 'buff') {
    return (
      <div className="intent-badge intent-buff" title="Intends to empower allies">
        <svg width="24" height="26" viewBox="0 0 28 28">
          <polygon points="14,2 25,14 19,14 19,26 9,26 9,14 3,14" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
        </svg>
        <span className="intent-sub">BOLD</span>
      </div>
    );
  }

  if (intent === 'summon') {
    return (
      <div className="intent-badge intent-summon" title="Intends to summon reinforcements into battle">
        <svg width="24" height="26" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="10" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="1.8" />
          <path d="M14,6 L14,22 M6,14 L22,14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="intent-sub" style={{ color: '#8b5cf6', fontWeight: 800 }}>SUMMON</span>
      </div>
    );
  }

  return (
    <div className="intent-badge intent-debuff" title="Enemy intends to inflict a status curse">
      <svg width="24" height="26" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="10" fill="#6d28d9" stroke="#3b0764" strokeWidth="1.8" />
      </svg>
      <span className="intent-sub">HEX</span>
    </div>
  );
};
