import React, { useMemo, useRef, useEffect } from 'react';
import type {
  Difficulty,
  EnemyDefinition,
  CardDefinition,
  BattleEnvironmentDefinition,
  RelicDefinition,
  CardInstance,
} from '../types/game';
import type { CodexDiscoveryState } from '../utils/codexEngine';
import {
  CARDS_CATALOG,
  ENEMIES_CATALOG,
  ENVIRONMENTS_CATALOG,
  RELICS_CATALOG,
} from '../utils/gameContent';
import { CardBanner } from './CardBanner';

export type CodexTab = 'monsters' | 'cards' | 'environments' | 'relics';

export interface CodexModalProps {
  activeTab: CodexTab;
  selectedId: string | null;
  scrollOffset: number;
  typedInput: string;
  difficulty: Difficulty;
  phraseDiff: 'easy' | 'medium' | 'hard';
  discovery: CodexDiscoveryState;
  getPhraseHighlightState: (
    phrase: string,
    diffOverride?: Difficulty
  ) => { isHighlighted: boolean; isEnterReady: boolean };
  renderTypingInputWithCaret: () => React.ReactNode;
}

function formatFaction(faction: string): string {
  switch (faction) {
    case 'goblins':
      return 'Goblins';
    case 'rock_monsters':
      return 'Rock Monsters';
    case 'evil_plants':
      return 'Evil Plants';
    case 'boss':
      return 'Boss';
    default:
      return faction
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export const CodexModal: React.FC<CodexModalProps> = ({
  activeTab,
  selectedId,
  scrollOffset,
  difficulty,
  phraseDiff,
  discovery,
  getPhraseHighlightState,
  renderTypingInputWithCaret,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Sync external scrollOffset if supplied
  useEffect(() => {
    if (gridContainerRef.current && scrollOffset > 0) {
      gridContainerRef.current.scrollTop = scrollOffset;
    }
  }, [scrollOffset]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const discoveredEnemies = ENEMIES_CATALOG.filter((e) =>
      discovery.enemies.includes(e.id)
    ).length;
    const discoveredCards = CARDS_CATALOG.filter((c) =>
      discovery.cards.includes(c.id)
    ).length;
    const discoveredEnvironments = ENVIRONMENTS_CATALOG.filter((env) =>
      discovery.environments.includes(env.id)
    ).length;
    const discoveredRelics = RELICS_CATALOG.filter((r) =>
      discovery.relics.includes(r.id)
    ).length;

    return {
      monsters: { count: discoveredEnemies, total: ENEMIES_CATALOG.length },
      cards: { count: discoveredCards, total: CARDS_CATALOG.length },
      environments: { count: discoveredEnvironments, total: ENVIRONMENTS_CATALOG.length },
      relics: { count: discoveredRelics, total: RELICS_CATALOG.length },
    };
  }, [discovery]);

  // Selected or fallback item to inspect
  const currentInspectItem = useMemo(() => {
    if (activeTab === 'monsters') {
      if (selectedId) {
        const found = ENEMIES_CATALOG.find((e) => e.id === selectedId);
        if (found && discovery.enemies.includes(found.id)) return found;
      }
      return ENEMIES_CATALOG.find((e) => discovery.enemies.includes(e.id)) || null;
    }
    if (activeTab === 'cards') {
      if (selectedId) {
        const found = CARDS_CATALOG.find((c) => c.id === selectedId);
        if (found && discovery.cards.includes(found.id)) return found;
      }
      return CARDS_CATALOG.find((c) => discovery.cards.includes(c.id)) || null;
    }
    if (activeTab === 'environments') {
      if (selectedId) {
        const found = ENVIRONMENTS_CATALOG.find((env) => env.id === selectedId);
        if (found && discovery.environments.includes(found.id)) return found;
      }
      return ENVIRONMENTS_CATALOG.find((env) => discovery.environments.includes(env.id)) || null;
    }
    if (activeTab === 'relics') {
      if (selectedId) {
        const found = RELICS_CATALOG.find((r) => r.id === selectedId);
        if (found && discovery.relics.includes(found.id)) return found;
      }
      return RELICS_CATALOG.find((r) => discovery.relics.includes(r.id)) || null;
    }
    return null;
  }, [activeTab, selectedId, discovery]);

  // Helper to test if typing matches any name pool of an enemy
  const checkMonsterHighlight = (en: EnemyDefinition) => {
    const names = en.namePools[phraseDiff] || en.namePools.easy;
    for (const name of names) {
      const state = getPhraseHighlightState(name, difficulty);
      if (state.isEnterReady || state.isHighlighted) return state;
    }
    return { isHighlighted: false, isEnterReady: false };
  };

  const tabs: CodexTab[] = ['monsters', 'cards', 'environments', 'relics'];

  return (
    <div className="codex-modal-overlay">
      <style>{`
        .codex-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(18, 26, 31, 0.82);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 120;
          padding: 16px;
          cursor: none;
          user-select: none;
        }

        .codex-cabinet-frame {
          width: 100%;
          max-width: 1180px;
          height: 92vh;
          max-height: 860px;
          background-color: #3b281c;
          background-image: url('./assets/ui/cabinet_wood_pixel.png');
          background-repeat: repeat;
          image-rendering: pixelated;
          border: 4px solid #271911;
          border-radius: 16px;
          box-shadow: inset 0 0 0 2px #5d422f, 0 20px 50px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          padding: 14px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .codex-parchment-sheet {
          flex: 1;
          background: #fdf8ef;
          border: 2.5px solid #2b1e16;
          border-radius: 12px;
          box-shadow: inset 0 0 30px rgba(180, 140, 90, 0.25), 0 4px 12px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        /* Top Header & Tab Pills */
        .codex-header-bar {
          background: #eadfce;
          border-bottom: 2px solid #2b1e16;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .codex-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .codex-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #102027;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .codex-tabs-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .codex-tab-pill {
          background: #fff;
          color: #102027;
          border: 2px solid #2b1e16;
          border-radius: 9999px;
          padding: 6px 14px;
          font-size: 0.88rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.14s ease, background 0.14s ease;
        }

        .codex-tab-pill.tab-active {
          background: #2b1e16;
          color: #fdf8ef;
          border-color: #ffd166;
          box-shadow: 0 2px 8px rgba(43, 30, 22, 0.3);
        }

        .codex-tab-pill.tab-highlighted {
          background: #ffd166 !important;
          color: #162229 !important;
          border-color: #b45309 !important;
          transform: translateY(-2px) scale(1.04);
        }

        .codex-tab-pill.tab-enter-ready {
          background: #2ec4b6 !important;
          color: #072227 !important;
          border-color: #0b4f4a !important;
          transform: translateY(-3px) scale(1.08) !important;
          box-shadow: 0 4px 12px rgba(19, 117, 71, 0.45) !important;
        }

        .codex-tab-count {
          font-size: 0.78rem;
          opacity: 0.85;
          font-weight: 600;
        }

        /* Two-Pane Body */
        .codex-main-body {
          flex: 1;
          display: flex;
          min-height: 0;
          overflow: hidden;
        }

        /* Left/Main Grid */
        .codex-grid-pane {
          flex: 1 1 58%;
          overflow-y: auto;
          padding: 16px;
          border-right: 2px solid #2b1e16;
          box-sizing: border-box;
        }

        .codex-entry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }

        .codex-entry-card {
          background: #fff;
          border: 2px solid #2b1e16;
          border-radius: 10px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
          position: relative;
          box-sizing: border-box;
          min-height: 125px;
          justify-content: space-between;
        }

        .codex-entry-card.is-selected {
          border-color: #d97706;
          background: #fffdf5;
          box-shadow: 0 0 0 2px #d97706;
          transform: translateY(-2px);
        }

        .codex-entry-card.is-highlighted {
          background: #ffd166 !important;
          color: #162229 !important;
          border-color: #b45309 !important;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 4px 12px rgba(180, 83, 9, 0.35);
          z-index: 2;
        }

        .codex-entry-card.is-enter-ready {
          background: #2ec4b6 !important;
          color: #072227 !important;
          border-color: #0b4f4a !important;
          border-width: 2.5px !important;
          transform: translateY(-4px) scale(1.06) !important;
          box-shadow: 0 6px 16px rgba(19, 117, 71, 0.45) !important;
          z-index: 4;
        }

        .codex-entry-sprite-frame {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }

        .codex-entry-sprite {
          width: 58px;
          height: 58px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        /* Undiscovered Silhouette Outline */
        .codex-sprite-undiscovered {
          filter: grayscale(1) brightness(0.18) contrast(2.5) drop-shadow(1px 0 0 #7c674d) drop-shadow(-1px 0 0 #7c674d) drop-shadow(0 1px 0 #7c674d) drop-shadow(0 -1px 0 #7c674d);
          opacity: 0.55;
        }

        .codex-entry-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #102027;
          line-height: 1.15;
          margin-top: 4px;
          word-break: break-word;
        }

        .codex-entry-undiscovered-label {
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #7c674d;
        }

        /* Right Inspector Panel */
        .codex-inspector-pane {
          flex: 0 0 380px;
          width: 380px;
          background: #faf4e6;
          padding: 20px;
          overflow-y: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inspector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #2b1e16;
          padding-bottom: 8px;
        }

        .inspector-section-tag {
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7c674d;
        }

        .inspector-content-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .inspector-art-spotlight {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 2px solid #2b1e16;
          border-radius: 12px;
          padding: 16px;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .inspector-large-sprite {
          width: 104px;
          height: 104px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .inspector-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #102027;
          text-align: center;
          margin-top: 8px;
          text-transform: capitalize;
        }

        .inspector-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 4px;
        }

        .inspector-meta-pill {
          background: #eadfce;
          border: 1.5px solid #2b1e16;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.74rem;
          font-weight: 700;
          color: #2b1e16;
        }

        .inspector-meta-pill.tier-pill {
          background: #e0f2fe;
          border-color: #0284c7;
          color: #0369a1;
        }

        .inspector-meta-pill.rarity-starter {
          background: #e2e8f0;
          color: #475569;
        }
        .inspector-meta-pill.rarity-common {
          background: #f1f5f9;
          color: #334155;
        }
        .inspector-meta-pill.rarity-uncommon {
          background: #dbeafe;
          color: #1e40af;
          border-color: #3b82f6;
        }
        .inspector-meta-pill.rarity-rare {
          background: #fef3c7;
          color: #92400e;
          border-color: #f59e0b;
        }
        .inspector-meta-pill.rarity-boss {
          background: #fce7f3;
          color: #9d174d;
          border-color: #ec4899;
        }

        .inspector-description-box {
          background: #fff;
          border: 2px solid #2b1e16;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.88rem;
          line-height: 1.45;
          color: #102027;
        }

        .inspector-description-label {
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #7c674d;
          margin-bottom: 4px;
        }

        .inspector-names-pool-box {
          background: #fff;
          border: 2px solid #2b1e16;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .inspector-names-heading {
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #7c674d;
        }

        .inspector-names-chips {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .inspector-name-chip {
          background: #f7f1e1;
          border: 1px dashed #7c674d;
          border-radius: 6px;
          padding: 4px 8px;
          font-family: monospace;
          font-size: 0.82rem;
          font-weight: 600;
          color: #2b1e16;
        }

        .inspector-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          color: #7c674d;
          padding: 30px;
          font-size: 0.95rem;
          font-style: italic;
        }

        /* Footer Prompt Bar */
        .codex-footer-prompt {
          background: #eadfce;
          border-top: 2.5px solid #2b1e16;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-sizing: border-box;
          flex-wrap: wrap;
        }

        .codex-prompt-instructions {
          font-size: 0.96rem;
          font-weight: 700;
          color: #102027;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .codex-keyword-pill {
          background: #fff;
          border: 1.5px solid #2b1e16;
          border-radius: 6px;
          padding: 2px 7px;
          font-family: monospace;
          font-size: 0.86rem;
          transition: background 0.12s ease;
        }

        .codex-keyword-pill.highlighted {
          background: #ffd166;
          border-color: #b45309;
        }

        .codex-keyword-pill.enter-ready {
          background: #2ec4b6;
          border-color: #0b4f4a;
        }

        .codex-typing-input-wrapper {
          display: flex;
          align-items: center;
          background: #fff;
          border: 2px solid #2b1e16;
          border-radius: 8px;
          padding: 4px 12px;
          min-width: 240px;
        }
      `}</style>

      <div className="codex-cabinet-frame">
        <div className="codex-parchment-sheet">
          {/* Header Bar with Tabs */}
          <div className="codex-header-bar">
            <div className="codex-title-group">
              <span style={{ fontSize: '1.4rem' }}>📖</span>
              <h2 className="codex-title">Arcane Codex</h2>
            </div>

            <div className="codex-tabs-row">
              {tabs.map((tab) => {
                const highlight = getPhraseHighlightState(tab, 'easy');
                const isActive = activeTab === tab;
                const countInfo = tabCounts[tab];

                return (
                  <div
                    key={tab}
                    className={`codex-tab-pill ${isActive ? 'tab-active' : ''} ${
                      highlight.isEnterReady
                        ? 'tab-enter-ready'
                        : highlight.isHighlighted
                        ? 'tab-highlighted'
                        : ''
                    }`}
                  >
                    <span>{tab}</span>
                    <span className="codex-tab-count">
                      ({countInfo.count} / {countInfo.total})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Pane Body */}
          <div className="codex-main-body">
            {/* Left/Main Grid */}
            <div className="codex-grid-pane" ref={gridContainerRef}>
              <div className="codex-entry-grid">
                {activeTab === 'monsters' &&
                  ENEMIES_CATALOG.map((en) => {
                    const isDiscovered = discovery.enemies.includes(en.id);
                    const primaryName = en.namePools[phraseDiff]?.[0] || en.namePools.easy[0];
                    const highlight = isDiscovered
                      ? checkMonsterHighlight(en)
                      : { isHighlighted: false, isEnterReady: false };
                    const isSelected =
                      currentInspectItem &&
                      'id' in currentInspectItem &&
                      currentInspectItem.id === en.id;

                    return (
                      <div
                        key={en.id}
                        className={`codex-entry-card ${
                          isSelected ? 'is-selected' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                      >
                        <div className="codex-entry-sprite-frame">
                          <img
                            src={en.art.spriteUrl || './assets/entities/goblin_skirmisher.png'}
                            alt={isDiscovered ? primaryName : 'Undiscovered'}
                            className={`codex-entry-sprite ${
                              !isDiscovered ? 'codex-sprite-undiscovered' : ''
                            }`}
                          />
                        </div>
                        <div className="codex-entry-name">
                          {isDiscovered ? (
                            primaryName
                          ) : (
                            <span className="codex-entry-undiscovered-label">???</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {activeTab === 'cards' &&
                  CARDS_CATALOG.map((c) => {
                    const isDiscovered = discovery.cards.includes(c.id);
                    const cardName = c.names[phraseDiff] || c.names.easy;
                    const highlight = isDiscovered
                      ? getPhraseHighlightState(cardName, difficulty)
                      : { isHighlighted: false, isEnterReady: false };
                    const isSelected =
                      currentInspectItem &&
                      'id' in currentInspectItem &&
                      currentInspectItem.id === c.id;

                    return (
                      <div
                        key={c.id}
                        className={`codex-entry-card ${
                          isSelected ? 'is-selected' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                      >
                        <div className="codex-entry-sprite-frame">
                          <img
                            src={c.art.spriteUrl || './assets/relics/I_Book.png'}
                            alt={isDiscovered ? cardName : 'Undiscovered'}
                            className={`codex-entry-sprite ${
                              !isDiscovered ? 'codex-sprite-undiscovered' : ''
                            }`}
                          />
                        </div>
                        <div className="codex-entry-name">
                          {isDiscovered ? (
                            <>
                              <div>{cardName}</div>
                              <div style={{ fontSize: '0.72rem', color: '#7c674d' }}>
                                {c.xCost ? 'X' : c.cost}⚡ · {c.type}
                              </div>
                            </>
                          ) : (
                            <span className="codex-entry-undiscovered-label">???</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {activeTab === 'environments' &&
                  ENVIRONMENTS_CATALOG.map((env) => {
                    const isDiscovered = discovery.environments.includes(env.id);
                    const highlight = isDiscovered
                      ? getPhraseHighlightState(env.name.toLowerCase(), difficulty)
                      : { isHighlighted: false, isEnterReady: false };
                    const isSelected =
                      currentInspectItem &&
                      'id' in currentInspectItem &&
                      currentInspectItem.id === env.id;

                    return (
                      <div
                        key={env.id}
                        className={`codex-entry-card ${
                          isSelected ? 'is-selected' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                      >
                        <div className="codex-entry-sprite-frame">
                          <img
                            src={env.art.spriteUrl || './assets/sprite-library/ravenmore/Map.png'}
                            alt={isDiscovered ? env.name : 'Undiscovered'}
                            className={`codex-entry-sprite ${
                              !isDiscovered ? 'codex-sprite-undiscovered' : ''
                            }`}
                          />
                        </div>
                        <div className="codex-entry-name">
                          {isDiscovered ? (
                            env.name
                          ) : (
                            <span className="codex-entry-undiscovered-label">???</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {activeTab === 'relics' &&
                  RELICS_CATALOG.map((r) => {
                    const isDiscovered = discovery.relics.includes(r.id);
                    const relicName = r.names[phraseDiff] || r.names.easy;
                    const highlight = isDiscovered
                      ? getPhraseHighlightState(relicName, difficulty)
                      : { isHighlighted: false, isEnterReady: false };
                    const isSelected =
                      currentInspectItem &&
                      'id' in currentInspectItem &&
                      currentInspectItem.id === r.id;

                    return (
                      <div
                        key={r.id}
                        className={`codex-entry-card ${
                          isSelected ? 'is-selected' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                      >
                        <div className="codex-entry-sprite-frame">
                          <img
                            src={r.art.spriteUrl || './assets/relics/Ac_Medal01.png'}
                            alt={isDiscovered ? relicName : 'Undiscovered'}
                            className={`codex-entry-sprite ${
                              !isDiscovered ? 'codex-sprite-undiscovered' : ''
                            }`}
                          />
                        </div>
                        <div className="codex-entry-name">
                          {isDiscovered ? (
                            relicName
                          ) : (
                            <span className="codex-entry-undiscovered-label">???</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Inspector Panel */}
            <div className="codex-inspector-pane">
              {!currentInspectItem ? (
                <div className="inspector-empty-state">
                  <span>✨</span>
                  <p>No discovered entries in this compendium yet. Explore more floors to unlock!</p>
                </div>
              ) : activeTab === 'monsters' ? (
                (() => {
                  const en = currentInspectItem as EnemyDefinition;
                  const primaryName = en.namePools[phraseDiff]?.[0] || en.namePools.easy[0];
                  return (
                    <div className="inspector-content-box">
                      <div className="inspector-header">
                        <span className="inspector-section-tag">Bestiary Entry</span>
                        <span className="inspector-meta-pill tier-pill">Tier {en.tier}</span>
                      </div>

                      <div className="inspector-art-spotlight">
                        <img
                          src={en.art.spriteUrl || './assets/entities/goblin_skirmisher.png'}
                          alt={primaryName}
                          className="inspector-large-sprite"
                        />
                        <div className="inspector-title">{primaryName}</div>
                        <div className="inspector-meta-row">
                          <span className="inspector-meta-pill">
                            Faction: {formatFaction(en.faction)}
                          </span>
                          <span className="inspector-meta-pill">
                            HP: {en.minHp} – {en.maxHp}
                          </span>
                        </div>
                      </div>

                      <div className="inspector-description-box">
                        <div className="inspector-description-label">Combat Specialty</div>
                        <div>{en.description || 'A fearsome adversary lurking in the dungeon depths.'}</div>
                      </div>

                      <div className="inspector-names-pool-box">
                        <div className="inspector-names-heading">
                          Names ({phraseDiff.toUpperCase()} Difficulty):
                        </div>
                        <div className="inspector-names-chips">
                          {en.namePools[phraseDiff]?.map((name) => (
                            <span key={name} className="inspector-name-chip">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : activeTab === 'cards' ? (
                (() => {
                  const c = currentInspectItem as CardDefinition;
                  const cardInstance: CardInstance = {
                    instanceId: `codex_preview_${c.id}`,
                    cardId: c.id,
                    upgraded: false,
                  };
                  return (
                    <div className="inspector-content-box">
                      <div className="inspector-header">
                        <span className="inspector-section-tag">Spell Card</span>
                        <span className={`inspector-meta-pill rarity-${c.rarity}`}>
                          {c.rarity.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ transform: 'scale(0.98)', transformOrigin: 'top center' }}>
                        <CardBanner instance={cardInstance} phraseDiff={phraseDiff} />
                      </div>

                      <div className="inspector-description-box">
                        <div className="inspector-description-label">Card Details</div>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Cost:</strong> {c.xCost ? 'X (All remaining Energy)' : `${c.cost} Energy (⚡)`}
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Type:</strong> {c.type.toUpperCase()}
                        </div>
                        <div>
                          <strong>Target:</strong> {c.target.replace(/_/g, ' ')}
                        </div>
                      </div>

                      {c.upgrade && (
                        <div className="inspector-description-box">
                          <div className="inspector-description-label">Upgraded Form (+)</div>
                          <div>{c.upgrade.description}</div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : activeTab === 'environments' ? (
                (() => {
                  const env = currentInspectItem as BattleEnvironmentDefinition;
                  return (
                    <div className="inspector-content-box">
                      <div className="inspector-header">
                        <span className="inspector-section-tag">Battle Environment</span>
                        <span className="inspector-meta-pill">Floors {env.minFloor ?? 1}–{env.maxFloor ?? 26}</span>
                      </div>

                      <div className="inspector-art-spotlight">
                        <img
                          src={env.art.spriteUrl || './assets/sprite-library/ravenmore/Map.png'}
                          alt={env.name}
                          className="inspector-large-sprite"
                        />
                        <div className="inspector-title">{env.name}</div>
                      </div>

                      <div className="inspector-description-box">
                        <div className="inspector-description-label">Strengthened Rules</div>
                        <div>{env.description}</div>
                      </div>
                    </div>
                  );
                })()
              ) : activeTab === 'relics' ? (
                (() => {
                  const r = currentInspectItem as RelicDefinition;
                  const relicName = r.names[phraseDiff] || r.names.easy;
                  return (
                    <div className="inspector-content-box">
                      <div className="inspector-header">
                        <span className="inspector-section-tag">Arcane Relic</span>
                        <span className={`inspector-meta-pill rarity-${r.rarity}`}>
                          {r.rarity.toUpperCase()}
                        </span>
                      </div>

                      <div className="inspector-art-spotlight">
                        <img
                          src={r.art.spriteUrl || './assets/relics/Ac_Medal01.png'}
                          alt={relicName}
                          className="inspector-large-sprite"
                        />
                        <div className="inspector-title">{relicName}</div>
                        <div className="inspector-meta-row">
                          <span className="inspector-meta-pill">
                            Trigger: {r.trigger.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="inspector-description-box">
                        <div className="inspector-description-label">Relic Blessing</div>
                        <div>{r.description}</div>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>
          </div>

          {/* Footer Prompt Bar */}
          <div className="codex-footer-prompt">
            <div className="codex-prompt-instructions">
              <span>Type</span>
              {tabs.map((tab) => {
                const hl = getPhraseHighlightState(tab, 'easy');
                return (
                  <span
                    key={tab}
                    className={`codex-keyword-pill ${
                      hl.isEnterReady ? 'enter-ready' : hl.isHighlighted ? 'highlighted' : ''
                    }`}
                  >
                    ({tab})
                  </span>
                );
              })}
              {(() => {
                const hl = getPhraseHighlightState('back', 'easy');
                return (
                  <span
                    className={`codex-keyword-pill ${
                      hl.isEnterReady ? 'enter-ready' : hl.isHighlighted ? 'highlighted' : ''
                    }`}
                  >
                    (back)
                  </span>
                );
              })()}
              <span>or type any discovered entry name:</span>
            </div>

            <div className="codex-typing-input-wrapper">
              {renderTypingInputWithCaret()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
