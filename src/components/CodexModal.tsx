import React, { useMemo, useRef, useEffect } from 'react';
import type {
  Difficulty,
  EnemyDefinition,
  CardDefinition,
  BattleEnvironmentDefinition,
  RelicDefinition,
  CardInstance,
  ActiveEnemy,
} from '../types/game';
import type { CodexDiscoveryState } from '../utils/codexEngine';
import {
  calculateEnemySpriteScale,
  CARDS_CATALOG,
  ENEMIES_CATALOG,
  ENVIRONMENTS_CATALOG,
  RELICS_CATALOG,
} from '../utils/gameContent';
import { CardBanner, getCardVisualCategory } from './CardBanner';
import { renderHighlightedCardText } from '../utils/textHighlight';
import { IntentBadge } from './EntitySprite';
import { describeEnemyIntentInEnglish } from '../utils/statusCatalog';

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
  activeEnemyInstance?: ActiveEnemy | null;
  playerExposed?: number;
  onSelectEntry?: (id: string) => void;
  onChangeTab?: (tab: CodexTab) => void;
  onClose?: () => void;
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
  activeEnemyInstance,
  playerExposed = 0,
  onSelectEntry,
  onChangeTab,
  onClose,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Sync external scrollOffset if supplied
  useEffect(() => {
    if (gridContainerRef.current && scrollOffset > 0) {
      gridContainerRef.current.scrollTop = scrollOffset;
    }
  }, [scrollOffset]);

  // Smooth scroll selected item into view in the grid pane
  useEffect(() => {
    if (selectedId && gridContainerRef.current) {
      const el = gridContainerRef.current.querySelector('.codex-entry-card.is-selected');
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedId, activeTab]);

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

  // Cards sorted by Category (Attack -> Defence -> Skill -> Debuff -> Power),
  // then by Rarity (Starter -> Common -> Uncommon -> Rare),
  // then by Cost ascending (cheaper cards at top, more expensive cards at bottom),
  // and finally by name.
  const sortedCards = useMemo(() => {
    const CATEGORY_ORDER: Record<string, number> = {
      attack: 0,
      defence: 1,
      skill: 2,
      debuff: 3,
      power: 4,
    };
    const RARITY_ORDER: Record<string, number> = {
      starter: 0,
      common: 1,
      uncommon: 2,
      rare: 3,
    };

    return [...CARDS_CATALOG].sort((a, b) => {
      const catA = CATEGORY_ORDER[getCardVisualCategory(a as any)] ?? 99;
      const catB = CATEGORY_ORDER[getCardVisualCategory(b as any)] ?? 99;
      if (catA !== catB) return catA - catB;

      const rarA = RARITY_ORDER[a.rarity] ?? 99;
      const rarB = RARITY_ORDER[b.rarity] ?? 99;
      if (rarA !== rarB) return rarA - rarB;

      const costA = a.xCost || a.cost === -1 ? 999 : (a.cost ?? 0);
      const costB = b.xCost || b.cost === -1 ? 999 : (b.cost ?? 0);
      if (costA !== costB) return costA - costB;

      const nameA = a.names[phraseDiff] || a.names.easy;
      const nameB = b.names[phraseDiff] || b.names.easy;
      return nameA.localeCompare(nameB);
    });
  }, [phraseDiff]);

  // Selected or fallback item to inspect (allows selecting unfound items too)
  const currentInspectItem = useMemo(() => {
    if (activeTab === 'monsters') {
      if (selectedId) {
        const found = ENEMIES_CATALOG.find((e) => e.id === selectedId);
        if (found) return found;
      }
      if (activeEnemyInstance) {
        const liveEnemy = ENEMIES_CATALOG.find((e) => e.id === activeEnemyInstance.enemyId);
        if (liveEnemy) return liveEnemy;
      }
      return (
        ENEMIES_CATALOG.find((e) => discovery.enemies.includes(e.id)) ||
        ENEMIES_CATALOG[0] ||
        null
      );
    }
    if (activeTab === 'cards') {
      if (selectedId) {
        const found = sortedCards.find((c) => c.id === selectedId);
        if (found) return found;
      }
      return sortedCards.find((c) => discovery.cards.includes(c.id)) || sortedCards[0] || null;
    }
    if (activeTab === 'environments') {
      if (selectedId) {
        const found = ENVIRONMENTS_CATALOG.find((env) => env.id === selectedId);
        if (found) return found;
      }
      return (
        ENVIRONMENTS_CATALOG.find((env) => discovery.environments.includes(env.id)) ||
        ENVIRONMENTS_CATALOG[0] ||
        null
      );
    }
    if (activeTab === 'relics') {
      if (selectedId) {
        const found = RELICS_CATALOG.find((r) => r.id === selectedId);
        if (found) return found;
      }
      return RELICS_CATALOG.find((r) => discovery.relics.includes(r.id)) || RELICS_CATALOG[0] || null;
    }
    return null;
  }, [activeTab, selectedId, discovery, sortedCards, activeEnemyInstance]);

  // Determine whether the currently inspected item has been discovered by the player
  const isCurrentItemDiscovered = useMemo(() => {
    if (!currentInspectItem || !('id' in currentInspectItem)) return false;
    const id = currentInspectItem.id;
    if (activeTab === 'monsters') {
      return discovery.enemies.includes(id) || activeEnemyInstance?.enemyId === id;
    }
    if (activeTab === 'cards') {
      return discovery.cards.includes(id);
    }
    if (activeTab === 'environments') {
      return discovery.environments.includes(id);
    }
    if (activeTab === 'relics') {
      return discovery.relics.includes(id);
    }
    return false;
  }, [activeTab, currentInspectItem, discovery, activeEnemyInstance]);

  // Determine whether to display the dedicated live combat status side panel
  const showEnemyStatusSidePanel =
    activeTab === 'monsters' &&
    Boolean(activeEnemyInstance) &&
    Boolean(
      currentInspectItem &&
        'id' in currentInspectItem &&
        currentInspectItem.id === activeEnemyInstance?.enemyId
    );

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

  // List of all item IDs in the currently active compendium tab
  const currentTabItems = useMemo<{ id: string }[]>(() => {
    if (activeTab === 'monsters') {
      return ENEMIES_CATALOG.map((en) => ({ id: en.id }));
    }
    if (activeTab === 'cards') {
      return sortedCards.map((c) => ({ id: c.id }));
    }
    if (activeTab === 'environments') {
      return ENVIRONMENTS_CATALOG.map((env) => ({ id: env.id }));
    }
    if (activeTab === 'relics') {
      return RELICS_CATALOG.map((r) => ({ id: r.id }));
    }
    return [];
  }, [activeTab, sortedCards]);

  const currentIndex = useMemo(() => {
    if (!currentInspectItem || !('id' in currentInspectItem)) return 0;
    const idx = currentTabItems.findIndex((it) => it.id === currentInspectItem.id);
    return idx >= 0 ? idx : 0;
  }, [currentInspectItem, currentTabItems]);

  const getGridColumnCount = (): number => {
    const gridEl = gridContainerRef.current?.querySelector('.codex-entry-grid');
    if (!gridEl) return 1;
    const template = window.getComputedStyle(gridEl).gridTemplateColumns;
    const cols = template ? template.trim().split(/\s+/).length : 1;
    return Math.max(1, cols);
  };

  // Keyboard navigation & scrolling with Arrow Keys, PageUp/PageDown, Home/End, and Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys are held
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Tab key switches between compendium tabs
      if (e.key === 'Tab') {
        e.preventDefault();
        if (onChangeTab) {
          const tabIdx = tabs.indexOf(activeTab);
          const nextTab = e.shiftKey
            ? tabs[(tabIdx - 1 + tabs.length) % tabs.length]
            : tabs[(tabIdx + 1) % tabs.length];
          onChangeTab(nextTab);
        }
        return;
      }

      // Escape key closes codex
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      const gridContainer = gridContainerRef.current;
      const total = currentTabItems.length;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (total === 0) return;
        const nextIdx = Math.min(total - 1, currentIndex + 1);
        if (nextIdx !== currentIndex && onSelectEntry) {
          onSelectEntry(currentTabItems[nextIdx].id);
        } else if (gridContainer) {
          gridContainer.scrollBy({ top: 80, behavior: 'smooth' });
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (total === 0) return;
        const prevIdx = Math.max(0, currentIndex - 1);
        if (prevIdx !== currentIndex && onSelectEntry) {
          onSelectEntry(currentTabItems[prevIdx].id);
        } else if (gridContainer) {
          gridContainer.scrollBy({ top: -80, behavior: 'smooth' });
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (total === 0) {
          gridContainer?.scrollBy({ top: 120, behavior: 'smooth' });
          return;
        }
        const cols = getGridColumnCount();
        const nextIdx = currentIndex + cols;
        if (nextIdx < total && onSelectEntry) {
          onSelectEntry(currentTabItems[nextIdx].id);
        } else if (gridContainer) {
          gridContainer.scrollBy({ top: 130, behavior: 'smooth' });
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (total === 0) {
          gridContainer?.scrollBy({ top: -120, behavior: 'smooth' });
          return;
        }
        const cols = getGridColumnCount();
        const prevIdx = currentIndex - cols;
        if (prevIdx >= 0 && onSelectEntry) {
          onSelectEntry(currentTabItems[prevIdx].id);
        } else if (gridContainer) {
          gridContainer.scrollBy({ top: -130, behavior: 'smooth' });
        }
        return;
      }

      if (e.key === 'PageDown') {
        e.preventDefault();
        if (total === 0) {
          gridContainer?.scrollBy({ top: 320, behavior: 'smooth' });
          return;
        }
        const cols = getGridColumnCount();
        const nextIdx = Math.min(total - 1, currentIndex + cols * 3);
        if (onSelectEntry) onSelectEntry(currentTabItems[nextIdx].id);
        gridContainer?.scrollBy({ top: 320, behavior: 'smooth' });
        return;
      }

      if (e.key === 'PageUp') {
        e.preventDefault();
        if (total === 0) {
          gridContainer?.scrollBy({ top: -320, behavior: 'smooth' });
          return;
        }
        const cols = getGridColumnCount();
        const prevIdx = Math.max(0, currentIndex - cols * 3);
        if (onSelectEntry) onSelectEntry(currentTabItems[prevIdx].id);
        gridContainer?.scrollBy({ top: -320, behavior: 'smooth' });
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        if (total > 0 && onSelectEntry) onSelectEntry(currentTabItems[0].id);
        if (gridContainer) gridContainer.scrollTop = 0;
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        if (total > 0 && onSelectEntry) onSelectEntry(currentTabItems[total - 1].id);
        if (gridContainer) gridContainer.scrollTop = gridContainer.scrollHeight;
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, currentIndex, currentTabItems, onChangeTab, onClose, onSelectEntry, tabs]);

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
          cursor: default;
          user-select: none;
        }

        .codex-cabinet-frame {
          width: 100%;
          max-width: 1180px;
          height: 94vh;
          max-height: 920px;
          background-color: #3b281c;
          background-image: url('/assets/ui/cabinet_wood_pixel.png');
          background-repeat: repeat;
          background-size: 96px 96px;
          image-rendering: pixelated;
          border: 4px solid #271911;
          border-radius: 16px;
          box-shadow: inset 0 0 0 2px #5d422f, 0 20px 50px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          padding: 14px;
          box-sizing: border-box;
          overflow: hidden;
          transition: max-width 0.2s ease;
        }

        .codex-cabinet-frame.has-side-panel {
          max-width: 1260px;
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

        .codex-nav-arrows-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .codex-type-label {
          font-size: 0.88rem;
          font-weight: 800;
          color: #574837;
          margin-right: 2px;
          letter-spacing: 0.04em;
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

        .codex-key-group {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fdf8ef;
          border: 1.5px solid #7c674d;
          border-radius: 7px;
          padding: 3px 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .codex-key-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          background: #2b1e16;
          color: #fdf8ef;
          border: 1.5px solid #1a120c;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.76rem;
          font-weight: 900;
          box-shadow: 0 2px 0 #120b07;
          line-height: 1;
        }

        .codex-key-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #2b1e16;
        }

        /* Two-Pane Body */
        .codex-main-body {
          flex: 1;
          display: flex;
          min-height: 0;
          overflow: hidden;
        }

        /* Left Inspector Panel (Fully visible without scrolling) */
        .codex-inspector-pane {
          flex: 0 0 320px;
          width: 320px;
          background: #faf4e6;
          padding: 12px 14px;
          overflow-y: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-right: 2px solid #2b1e16;
          transition: width 0.2s ease, flex 0.2s ease;
        }

        .codex-inspector-pane.compact-inspector {
          flex: 0 0 280px;
          width: 280px;
          padding: 10px 12px;
        }

        /* Right / Main Grid (All discovered & undiscovered entries) */
        .codex-grid-pane {
          flex: 1 1 0;
          min-width: 0;
          overflow-y: auto;
          padding: 14px 16px 0 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .codex-grid-pane.compact-grid {
          flex: 1 1 32%;
          min-width: 220px;
        }

        .codex-entry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          padding-bottom: 74px;
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
          cursor: default;
        }

        .codex-floating-typing-bar {
          position: sticky;
          bottom: 0;
          margin-top: auto;
          display: flex;
          justify-content: center;
          padding: 8px 16px 12px 16px;
          background: linear-gradient(180deg, rgba(253, 248, 239, 0) 0%, rgba(253, 248, 239, 0.94) 28%, #fdf8ef 100%);
          z-index: 10;
          pointer-events: none;
        }

        .codex-floating-typing-bar .codex-typing-input-wrapper {
          pointer-events: auto;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 2px solid #2b1e16;
          border-radius: 8px;
          padding: 4px 12px;
          min-width: 260px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 4px 14px rgba(43, 30, 22, 0.18), 0 0 0 1px #7c674d;
        }

        .inspector-tier-corner-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #e0f2fe;
          border: 1.5px solid #0284c7;
          color: #0369a1;
          font-size: 0.74rem;
          font-weight: 800;
          border-radius: 6px;
          padding: 2px 7px;
          line-height: 1.2;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          z-index: 2;
        }

        .inspector-elite-corner-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #fef3c7;
          border: 1.5px solid #d97706;
          color: #92400e;
          font-size: 0.74rem;
          font-weight: 800;
          border-radius: 6px;
          padding: 2px 7px;
          line-height: 1.2;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          z-index: 2;
        }

        /* Generic Blank View / Undiscovered Inspector Box */
        .inspector-undiscovered-box {
          border: 2px dashed #9c8a74;
          background: rgba(245, 238, 226, 0.6);
        }

        .undiscovered-pill {
          background: #ece3d4 !important;
          color: #7c674d !important;
          border-color: #bfaea0 !important;
          font-weight: 900 !important;
        }

        .undiscovered-spotlight {
          border: 1.5px dashed #bfaea0;
          background: #ede4d3;
        }

        .inspector-undiscovered-icon-frame {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #dfd4c0;
          border: 2px dashed #7c674d;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
          margin-bottom: 8px;
        }

        .inspector-undiscovered-glyph {
          font-size: 2.6rem;
          font-weight: 900;
          color: #7c674d;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        /* Far-Right Combat Status Side Panel */
        .codex-combat-side-pane {
          flex: 0 0 350px;
          width: 350px;
          background: #faf2e4;
          padding: 14px 12px;
          overflow-y: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-left: 2px solid #2b1e16;
        }

        .combat-card-section {
          background: #ffffff;
          border: 2px solid #2b1e16;
          border-radius: 9px;
          padding: 9px 11px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(43, 30, 22, 0.06);
        }

        .combat-status-badge-item {
          background: #f8fafc;
          border: 1.5px solid #2b1e16;
          border-radius: 7px;
          padding: 5px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
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
          gap: 10px;
        }

        .inspector-art-spotlight {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 2px solid #2b1e16;
          border-radius: 12px;
          padding: 12px 10px;
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

      <div className={`codex-cabinet-frame ${showEnemyStatusSidePanel ? 'has-side-panel' : ''}`}>
        <div className="codex-parchment-sheet">
          {/* Header Bar: Arrow keys move prompt on left, Tabs on right with "Type:" */}
          <div className="codex-header-bar">
            <div className="codex-nav-arrows-group">
              <div className="codex-key-group" style={{ borderColor: '#b45309', background: '#fffbeb' }}>
                <kbd className="codex-key-chip" style={{ background: '#b45309', borderColor: '#78350f' }}>↑</kbd>
                <kbd className="codex-key-chip" style={{ background: '#b45309', borderColor: '#78350f' }}>↓</kbd>
                <kbd className="codex-key-chip" style={{ background: '#b45309', borderColor: '#78350f' }}>←</kbd>
                <kbd className="codex-key-chip" style={{ background: '#b45309', borderColor: '#78350f' }}>→</kbd>
                <span className="codex-key-label" style={{ color: '#92400e', fontWeight: 800 }}>
                  Arrow Keys to Move
                </span>
              </div>
            </div>

            <div className="codex-tabs-row">
              <span className="codex-type-label">Type:</span>
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
                    onClick={() => onChangeTab?.(tab)}
                    style={{ cursor: 'pointer' }}
                    title={`Type "${tab}" or press Tab to switch`}
                  >
                    <span>{tab}</span>
                    <span className="codex-tab-count">
                      ({countInfo.count} / {countInfo.total})
                    </span>
                  </div>
                );
              })}
              {(() => {
                const highlight = getPhraseHighlightState('back', 'easy');
                return (
                  <div
                    className={`codex-tab-pill ${
                      highlight.isEnterReady
                        ? 'tab-enter-ready'
                        : highlight.isHighlighted
                        ? 'tab-highlighted'
                        : ''
                    }`}
                    onClick={onClose}
                    style={{ cursor: 'pointer' }}
                    title="Type 'back' to close"
                  >
                    <span>back</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Two/Three-Pane Body */}
          <div className="codex-main-body">
            {/* Left Inspector Panel (Fully visible without scrolling) */}
            <div className={`codex-inspector-pane ${showEnemyStatusSidePanel ? 'compact-inspector' : ''}`}>
              {!currentInspectItem ? (
                <div className="inspector-empty-state">
                  <span>✨</span>
                  <p>No discovered entries in this compendium yet. Explore more floors to unlock!</p>
                </div>
              ) : !isCurrentItemDiscovered ? (
                <div className="inspector-content-box inspector-undiscovered-box">
                  <div className="inspector-art-spotlight undiscovered-spotlight">
                    <div className="inspector-undiscovered-icon-frame">
                      <span className="inspector-undiscovered-glyph">?</span>
                    </div>
                    <div className="inspector-title" style={{ color: '#7c674d', letterSpacing: '0.12em' }}>
                      ???
                    </div>
                    <div className="inspector-meta-row">
                      <span
                        className="inspector-meta-pill"
                        style={{
                          fontStyle: 'italic',
                          background: '#ece3d4',
                          color: '#7c674d',
                          borderColor: '#c4b5a0',
                        }}
                      >
                        Uncharted Knowledge
                      </span>
                      <span
                        className="inspector-meta-pill"
                        style={{
                          background: '#ece3d4',
                          color: '#7c674d',
                          borderColor: '#c4b5a0',
                        }}
                      >
                        Locked
                      </span>
                    </div>
                  </div>

                  <div
                    className="inspector-description-box"
                    style={{
                      borderColor: '#c4b5a0',
                      background: 'rgba(234, 223, 206, 0.4)',
                    }}
                  >
                    <div className="inspector-description-label" style={{ color: '#8c7b6c' }}>
                      Compendium Record
                    </div>
                    <div style={{ color: '#574837', fontStyle: 'italic', lineHeight: 1.45, fontSize: '0.82rem' }}>
                      This subject has not yet been discovered on your journeys. Continue venturing through the dungeon floors to reveal its identity, lore, and combat stats.
                    </div>
                  </div>
                </div>
              ) : activeTab === 'monsters' ? (
                (() => {
                  const en = currentInspectItem as EnemyDefinition;
                  const primaryName = en.namePools[phraseDiff]?.[0] || en.namePools.easy[0];
                  const avgHp = Math.round((en.minHp + en.maxHp) / 2);
                  const isEliteEnemy = en.role === 'elite';
                  const scaleFactor = calculateEnemySpriteScale(avgHp, isEliteEnemy);
                  const spriteW = Math.round(96 * scaleFactor);
                  const spriteH = Math.round(96 * scaleFactor);
                  return (
                    <div className="inspector-content-box">
                      <div className="inspector-art-spotlight">
                        <span className="inspector-tier-corner-badge">Tier {en.tier}</span>
                        {isEliteEnemy && <span className="inspector-elite-corner-badge">💀 Elite</span>}

                        <img
                          src={en.art.spriteUrl || './assets/entities/goblin_skirmisher.png'}
                          alt={primaryName}
                          className="inspector-large-sprite"
                          style={{
                            width: spriteW,
                            height: spriteH,
                            maxWidth: 104,
                            maxHeight: 104,
                            transition: 'width 0.2s ease, height 0.2s ease',
                          }}
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
                          Names:
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
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span className={`inspector-meta-pill rarity-${c.rarity}`}>
                          {c.rarity.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ transform: 'scale(0.96)', transformOrigin: 'top center' }}>
                        <CardBanner instance={cardInstance} phraseDiff={phraseDiff} />
                      </div>

                      <div className="inspector-description-box">
                        <div className="inspector-description-label">Card Details</div>
                        <div style={{ marginBottom: 4 }}>
                          <strong>Cost:</strong> {c.xCost ? 'X (All remaining Energy)' : `${c.cost} Energy (⚡)`}
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <strong>Type:</strong> {c.type.toUpperCase()}
                        </div>
                        <div>
                          <strong>Target:</strong> {c.target.replace(/_/g, ' ')}
                        </div>
                      </div>

                      {c.upgrade && (
                        <div className="inspector-description-box">
                          <div className="inspector-description-label">Upgraded Form (+)</div>
                          <div>{renderHighlightedCardText(c.upgrade.description)}</div>
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
                      <div className="inspector-art-spotlight">
                        <span className="inspector-tier-corner-badge">Floors {env.minFloor ?? 1}–{env.maxFloor ?? 26}</span>
                        <img
                          src={env.art.spriteUrl || './assets/sprite-library/ravenmore/Map.png'}
                          alt={env.name}
                          className="inspector-large-sprite"
                          style={{ maxWidth: 104, maxHeight: 104 }}
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
                      <div className="inspector-art-spotlight">
                        <span className={`inspector-tier-corner-badge rarity-${r.rarity}`}>
                          {r.rarity.toUpperCase()}
                        </span>
                        <img
                          src={r.art.spriteUrl || './assets/relics/Ac_Medal01.png'}
                          alt={relicName}
                          className="inspector-large-sprite"
                          style={{ maxWidth: 104, maxHeight: 104 }}
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

            {/* Right/Main Grid: All Discovered & Undiscovered Entries */}
            <div
              className={`codex-grid-pane ${showEnemyStatusSidePanel ? 'compact-grid' : ''}`}
              ref={gridContainerRef}
            >
              <div className="codex-entry-grid">
                {activeTab === 'monsters' &&
                  ENEMIES_CATALOG.map((en) => {
                    const isDiscovered =
                      discovery.enemies.includes(en.id) ||
                      activeEnemyInstance?.enemyId === en.id;
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
                          !isDiscovered ? 'is-undiscovered' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                        title={isDiscovered ? primaryName : 'Undiscovered Entry (Use Arrow Keys to inspect)'}
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
                  sortedCards.map((c) => {
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
                          !isDiscovered ? 'is-undiscovered' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                        title={isDiscovered ? cardName : 'Undiscovered Entry (Use Arrow Keys to inspect)'}
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
                          !isDiscovered ? 'is-undiscovered' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                        title={isDiscovered ? env.name : 'Undiscovered Entry (Use Arrow Keys to inspect)'}
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
                          !isDiscovered ? 'is-undiscovered' : ''
                        } ${
                          highlight.isEnterReady
                            ? 'is-enter-ready'
                            : highlight.isHighlighted
                            ? 'is-highlighted'
                            : ''
                        }`}
                        title={isDiscovered ? relicName : 'Undiscovered Entry (Use Arrow Keys to inspect)'}
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

              {/* Floating Typing Field inside Main Area */}
              <div className="codex-floating-typing-bar">
                <div className="codex-typing-input-wrapper">
                  {renderTypingInputWithCaret()}
                </div>
              </div>
            </div>

            {/* Right Combat Status Side Panel (when inspecting active enemy in battle) */}
            {showEnemyStatusSidePanel && activeEnemyInstance && (
              <div className="codex-combat-side-pane">
                <div className="inspector-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.05rem' }}>⚔️</span>
                    <span className="inspector-section-tag" style={{ color: '#b45309' }}>
                      Combat Status
                    </span>
                  </div>
                  <span
                    className="inspector-meta-pill"
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderColor: '#f87171',
                      fontWeight: 800,
                    }}
                  >
                    Active Foe
                  </span>
                </div>

                {/* Live Vitality (HP & Ward) */}
                <div className="combat-card-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#102027' }}>
                      {activeEnemyInstance.displayName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#7c674d',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      {formatFaction(activeEnemyInstance.faction)}
                    </span>
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        marginBottom: 3,
                        color: '#162229',
                      }}
                    >
                      <span>Vitality (HP)</span>
                      <span>
                        {activeEnemyInstance.hp} / {activeEnemyInstance.maxHp}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 12,
                        background: '#f1f5f9',
                        border: '1.5px solid #2b1e16',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (activeEnemyInstance.hp / activeEnemyInstance.maxHp) * 100)
                          )}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                          transition: 'width 0.2s ease',
                        }}
                      />
                    </div>
                  </div>

                  {activeEnemyInstance.ward > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#e0f2fe',
                        border: '1.5px solid #0284c7',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#0369a1',
                      }}
                    >
                      <span>🛡️</span>
                      <span>Ward: {activeEnemyInstance.ward} (Blocks attack damage)</span>
                    </div>
                  )}
                </div>

                {/* Upcoming Intent */}
                <div className="combat-card-section">
                  <div className="inspector-description-label">Upcoming Turn Intent</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <IntentBadge
                      intent={activeEnemyInstance.currentMove.intent}
                      damage={
                        activeEnemyInstance.currentMove.damage
                          ? Math.max(
                              0,
                              activeEnemyInstance.currentMove.damage + activeEnemyInstance.statuses.bold
                            )
                          : undefined
                      }
                      faded={activeEnemyInstance.statuses.faded}
                      hits={activeEnemyInstance.currentMove.hits}
                      ward={activeEnemyInstance.currentMove.ward}
                      heal={activeEnemyInstance.currentMove.heal}
                    />
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#162229', lineHeight: 1.35 }}>
                      {describeEnemyIntentInEnglish(activeEnemyInstance, playerExposed)}
                    </div>
                  </div>
                </div>

                {/* Active Status Effects */}
                {(() => {
                  const statusList: {
                    id: string;
                    name: string;
                    icon: string;
                    color: string;
                    value: number;
                    text: string;
                  }[] = [];

                  if (activeEnemyInstance.ward > 0) {
                    statusList.push({
                      id: 'ward',
                      name: 'Ward',
                      icon: '🛡️',
                      color: '#1d6fa5',
                      value: activeEnemyInstance.ward,
                      text: `Prevents up to ${activeEnemyInstance.ward} attack damage this turn.`,
                    });
                  }
                  if (activeEnemyInstance.statuses.bold > 0) {
                    statusList.push({
                      id: 'bold',
                      name: 'Bold',
                      icon: '⚔️',
                      color: '#d97706',
                      value: activeEnemyInstance.statuses.bold,
                      text: `Attacks deal +${activeEnemyInstance.statuses.bold} extra damage.`,
                    });
                  }
                  if (activeEnemyInstance.statuses.faded > 0) {
                    statusList.push({
                      id: 'faded',
                      name: 'Faded',
                      icon: '🌫️',
                      color: '#64748b',
                      value: activeEnemyInstance.statuses.faded,
                      text: `Weakened: deals -${activeEnemyInstance.statuses.faded} attack damage (${activeEnemyInstance.statuses.faded} turn${activeEnemyInstance.statuses.faded > 1 ? 's' : ''} left).`,
                    });
                  }
                  if (activeEnemyInstance.statuses.exposed > 0) {
                    statusList.push({
                      id: 'exposed',
                      name: 'Exposed',
                      icon: '💥',
                      color: '#be123c',
                      value: activeEnemyInstance.statuses.exposed,
                      text: `Vulnerable: takes 50% more damage from attacks (${activeEnemyInstance.statuses.exposed} turns left).`,
                    });
                  }
                  if (activeEnemyInstance.statuses.ink_burn > 0) {
                    statusList.push({
                      id: 'ink_burn',
                      name: 'Ink Burn',
                      icon: '✒️',
                      color: '#6d28d9',
                      value: activeEnemyInstance.statuses.ink_burn,
                      text: `Takes ${activeEnemyInstance.statuses.ink_burn} damage at the end of its turn (can be blocked by Ward), then decreases by 1.`,
                    });
                  }
                  if (activeEnemyInstance.statuses.plated_armor > 0) {
                    statusList.push({
                      id: 'plated_armor',
                      name: 'Plated Armor',
                      icon: '🛡️',
                      color: '#2563eb',
                      value: activeEnemyInstance.statuses.plated_armor,
                      text: `Gains ${activeEnemyInstance.statuses.plated_armor} Ward at turn start, then decreases by 1.`,
                    });
                  }
                  if (activeEnemyInstance.statuses.thorns > 0) {
                    statusList.push({
                      id: 'thorns',
                      name: 'Thorns',
                      icon: '🌵',
                      color: '#059669',
                      value: activeEnemyInstance.statuses.thorns,
                      text: `Deals ${activeEnemyInstance.statuses.thorns} counter damage when attacked.`,
                    });
                  }

                  return (
                    <div className="combat-card-section">
                      <div className="inspector-description-label">
                        Active Status Effects ({statusList.length})
                      </div>

                      {statusList.length === 0 ? (
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontStyle: 'italic',
                            color: '#7c674d',
                            padding: '4px 0',
                          }}
                        >
                          No active status effects or afflictions.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {statusList.map((st) => (
                            <div
                              key={st.id}
                              className="combat-status-badge-item"
                              style={{ borderColor: st.color }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: st.color }}>
                                  {st.icon} {st.name} ({st.value})
                                </span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.35 }}>
                                {st.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div
                  style={{
                    background: '#eadfce',
                    border: '1.5px solid #2b1e16',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#2b1e16',
                    textAlign: 'center',
                  }}
                >
                  Type <code>back</code> to return to battle, or type another foe's name.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
