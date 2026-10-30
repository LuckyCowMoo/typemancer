import React from 'react';
import type { CardInstance, PhraseDifficulty } from '../types/game';
import { resolveCardInstance } from '../utils/gameContent';

interface CardBannerProps {
  instance: CardInstance;
  phraseDiff: PhraseDifficulty;
  index?: number;
  isHighlighted?: boolean;
  isEnterCandidate?: boolean;
  isSelected?: boolean;
  isUnaffordable?: boolean;
  priceBadge?: string;
  subtitleOverride?: string;
}

/**
 * Unified paper-textured Card Banner used in both the left-hand Battle stack
 * and the `view deck` / `view discard` / `reward` / `shop` screens so cards
 * always share the exact same dimensions, 1:1 image frame, rarity badge,
 * and upgraded indicator.
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
  subtitleOverride,
}) => {
  const resolved = resolveCardInstance(instance, phraseDiff);

  return (
    <div
      data-card-id={instance.instanceId}
      className={`card-tab ${index % 2 === 0 ? 'card-tab-light' : 'card-tab-dark'} ${
        isHighlighted ? 'card-tab-highlighted' : ''
      } ${isEnterCandidate ? 'card-tab-enter-ready' : ''} ${
        isSelected ? 'card-tab-selected' : ''
      } ${isUnaffordable ? 'card-tab-unaffordable' : ''} rarity-${resolved.rarity}`}
      style={{
        animationDelay: `${(index % 7) * 0.22}s`,
      }}
    >
      <div className="card-tab-inner">
        {/* Left Column: 1:1 Square Image Slot + Compact Rarity Seal underneath */}
        <div className="card-left-art-col">
          <div className="card-art-square">
            {resolved.art.spriteUrl ? (
              <img src={resolved.art.spriteUrl} alt="" />
            ) : (
              <span className="card-rarity-seal">{resolved.rarity[0].toUpperCase()}</span>
            )}
          </div>
          <span className={`card-rarity-pill rarity-pill-${resolved.rarity}`}>
            {resolved.rarity}
          </span>
        </div>

        {/* Right Half: Full-Width Card Name & Cost along Top, Description beneath */}
        <div className="card-info-right">
          <div className="card-tab-header">
            <span className="card-tab-name">
              {resolved.name}
              {instance.upgraded && <span className="card-upgraded-tag"> +</span>}
            </span>
            <span className="card-cost-pill">{priceBadge ?? resolved.cost}</span>
          </div>
          <div className="card-tab-sub">{subtitleOverride ?? resolved.description}</div>
        </div>
      </div>
    </div>
  );
};
