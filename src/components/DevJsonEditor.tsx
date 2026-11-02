import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BattleEnvironmentDefinition,
  CardDefinition,
  CardEffect,
  CardUpgradeData,
  EffectType,
  EnemyDefinition,
  EnemyFaction,
  EnemyIntentType,
  EnemyMove,
  EnemyRole,
  MapNodeType,
  MapPhrasesCatalog,
  MysteryChoice,
  MysteryEventDefinition,
  RelicDefinition,
  RelicTrigger,
} from '../types/game';
import {
  CARDS_CATALOG,
  clearSessionCatalogs,
  ENEMIES_CATALOG,
  ENVIRONMENTS_CATALOG,
  EVENTS_CATALOG,
  getEnemyMoveEffects,
  MAP_PHRASES,
  RELICS_CATALOG,
  saveCatalogToSession,
  syncEnemyMoveStats,
} from '../utils/gameContent';
import cardsRaw from '../data/cards.json';
import enemiesRaw from '../data/enemies.json';
import relicsRaw from '../data/relics.json';
import eventsRaw from '../data/events.json';
import environmentsRaw from '../data/environments.json';
import mapPhrasesRaw from '../data/map_phrases.json';
import {
  getCardVisualCategory,
  getCardColorTheme,
  CARD_CATEGORY_LABELS,
} from './CardBanner';
import type { CardVisualCategory } from './CardBanner';
import { soundEngine } from '../utils/soundEngine';
import { SOUND_CATALOG, SOUND_CATEGORIES } from '../data/soundCatalog';

export interface SpriteManifestEntry {
  id: string;
  name: string;
  pack: string;
  url: string;
}

type EditorTab =
  | 'enemies'
  | 'cards'
  | 'relics'
  | 'environments'
  | 'events'
  | 'map_phrases'
  | 'sounds';

interface DevJsonEditorProps {
  onClose: () => void;
}

export interface EffectGroupDef {
  category: string;
  colorName: string;
  color: string;
  bg: string;
  textColor: string;
  effects: {
    type: EffectType;
    label: string;
  }[];
}

export const EFFECT_TYPE_GROUPS: EffectGroupDef[] = [
  {
    category: 'Attack & Damage',
    colorName: 'Red',
    color: '#c24d2c',
    bg: '#fdf2ee',
    textColor: '#831843',
    effects: [
      { type: 'damage', label: '⚔️ Damage (Direct Hit)' },
      { type: 'damage_per_ward', label: '🛡️ Damage Per Ward (Body Slam)' },
      { type: 'bold', label: '💪 Bold (+Damage Dealt)' },
      { type: 'self_damage', label: '🩸 Self Damage (Sacrifice HP)' },
    ],
  },
  {
    category: 'Defence & Armor',
    colorName: 'Blue',
    color: '#105470',
    bg: '#f0f9ff',
    textColor: '#0c4a6e',
    effects: [
      { type: 'ward', label: '🛡️ Ward (Block / Armor)' },
      { type: 'double_ward', label: '🛡️ Double Ward (Entrench)' },
      { type: 'gain_ward_per_card_in_hand', label: '🃏 Ward Per Card in Hand' },
      { type: 'plated_armor', label: '⚙️ Plated Armor (Ward each turn, -1 decay)' },
      { type: 'thorns', label: '🌵 Thorns (Retaliation Damage)' },
    ],
  },
  {
    category: 'Utility & Economy',
    colorName: 'Green',
    color: '#21704d',
    bg: '#f0fdf4',
    textColor: '#064e3b',
    effects: [
      { type: 'draw', label: '🎴 Draw Cards' },
      { type: 'energy', label: '⚡ Gain Energy' },
      { type: 'heal', label: '💚 Heal HP' },
    ],
  },
  {
    category: 'Afflictions & Debuffs',
    colorName: 'Purple',
    color: '#683587',
    bg: '#faf5ff',
    textColor: '#581c87',
    effects: [
      { type: 'faded', label: '💨 Faded (Target deals -1 attack damage per stack)' },
      { type: 'exposed', label: '🎯 Exposed (Target takes 50% more damage)' },
      { type: 'ink_burn', label: '✒️ Ink Burn (Poison damage at turn start)' },
      { type: 'double_ink_burn', label: '💥 Double Ink Burn (Catalyst)' },
    ],
  },
  {
    category: 'Hand & Discard',
    colorName: 'Slate',
    color: '#475569',
    bg: '#f8fafc',
    textColor: '#1e293b',
    effects: [
      { type: 'discard', label: '🗑️ Discard Target / Choice' },
      { type: 'discard_random', label: '🎲 Discard Random from Hand' },
      { type: 'keep_card', label: '📌 Keep Card (Retain from discard at end of turn)' },
    ],
  },
  {
    category: 'Persistent Powers',
    colorName: 'Gold',
    color: '#9c660f',
    bg: '#fffbeb',
    textColor: '#78350f',
    effects: [
      { type: 'power_ward_each_turn', label: '✨ Power: Ward Each Turn' },
      { type: 'power_bold_each_turn', label: '✨ Power: Bold Each Turn' },
      { type: 'power_draw_each_turn', label: '✨ Power: Draw Extra Each Turn' },
      { type: 'power_energy_each_turn', label: '✨ Power: Extra Energy Each Turn' },
      { type: 'power_heal_each_turn', label: '✨ Power: Heal HP Each Turn' },
      { type: 'power_ink_burn_all_each_turn', label: '✨ Power: Ink Burn All Each Turn' },
      { type: 'power_damage_all_each_turn', label: '✨ Power: Damage All Each Turn' },
      { type: 'power_ward_on_card_play', label: '✨ Power: Ward On Every Card Play' },
      { type: 'power_damage_all_on_attack', label: '✨ Power: Damage All On Attacks' },
    ],
  },
];

export const ALL_EFFECT_TYPES: EffectType[] = EFFECT_TYPE_GROUPS.flatMap((g) =>
  g.effects.map((e) => e.type)
);

export const getEffectGroup = (type: EffectType): EffectGroupDef => {
  return (
    EFFECT_TYPE_GROUPS.find((g) => g.effects.some((e) => e.type === type)) ||
    EFFECT_TYPE_GROUPS[0]
  );
};

const ALL_INTENTS: EnemyIntentType[] = [
  'attack',
  'multi_attack',
  'defend',
  'attack_defend',
  'buff',
  'debuff',
  'attack_debuff',
  'heal',
];

const ALL_RELIC_TRIGGERS: RelicTrigger[] = [
  'combat_start',
  'turn_start',
  'turn_end',
  'on_card_play',
  'on_attack',
  'on_kill',
  'combat_victory',
  'on_rest',
  'passive_max_hp',
  'passive_energy',
  'passive_draw',
  'passive_wpm_forgiveness',
];

const ALL_RELIC_EFFECTS: RelicDefinition['effectType'][] = [
  'ward',
  'bold',
  'heal',
  'energy',
  'draw',
  'gold',
  'max_hp',
  'damage_all',
  'ink_burn_all',
  'exposed_all',
  'faded_all',
  'wpm_boost',
];

const ensureUpgrade = (card: CardDefinition): CardUpgradeData => {
  return (
    card.upgrade || {
      names: {
        easy: `${card.names.easy}+`,
        medium: `${card.names.medium}+`,
        hard: `${card.names.hard}+`,
      },
      description: card.description,
      cost: card.cost,
      effects: [...card.effects],
    }
  );
};

export const DevJsonEditor: React.FC<DevJsonEditorProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('enemies');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveBanner, setSaveBanner] = useState<{ text: string; isError?: boolean } | null>(null);

  // Editable state copies of all 6 JSON files
  const [enemiesList, setEnemiesList] = useState<EnemyDefinition[]>(() =>
    JSON.parse(JSON.stringify(ENEMIES_CATALOG))
  );
  const [cardsList, setCardsList] = useState<CardDefinition[]>(() =>
    JSON.parse(JSON.stringify(CARDS_CATALOG))
  );
  const [relicsList, setRelicsList] = useState<RelicDefinition[]>(() =>
    JSON.parse(JSON.stringify(RELICS_CATALOG))
  );
  const [environmentsList, setEnvironmentsList] = useState<BattleEnvironmentDefinition[]>(() =>
    JSON.parse(JSON.stringify(ENVIRONMENTS_CATALOG))
  );
  const [eventsList, setEventsList] = useState<MysteryEventDefinition[]>(() =>
    JSON.parse(JSON.stringify(EVENTS_CATALOG))
  );
  const [mapPhrases, setMapPhrases] = useState<MapPhrasesCatalog>(() =>
    JSON.parse(JSON.stringify(MAP_PHRASES))
  );

  // Selected item index per tab
  const [selectedEnemyIdx, setSelectedEnemyIdx] = useState<number>(0);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);
  const [selectedRelicIdx, setSelectedRelicIdx] = useState<number>(0);
  const [selectedEnvIdx, setSelectedEnvIdx] = useState<number>(0);
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(0);

  // Sound studio state
  const [soundSubTab, setSoundSubTab] = useState<'library' | 'assignments' | 'global'>('library');
  const [soundCategoryFilter, setSoundCategoryFilter] = useState<string>('all');
  const [soundSearchQuery, setSoundSearchQuery] = useState<string>('');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [cardSoundFilter, setCardSoundFilter] = useState<string>('all');

  const detailPaneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (detailPaneRef.current) {
      detailPaneRef.current.scrollTop = 0;
    }
  }, [
    activeTab,
    selectedEnemyIdx,
    selectedCardIdx,
    selectedRelicIdx,
    selectedEnvIdx,
    selectedEventIdx,
  ]);

  // Sprite Picker Modal state
  const [spriteManifest, setSpriteManifest] = useState<SpriteManifestEntry[]>([]);
  const [spritePickerOpen, setSpritePickerOpen] = useState<boolean>(false);
  const [spritePackFilter, setSpritePackFilter] = useState<string>('ALL');
  const [spriteSearch, setSpriteSearch] = useState<string>('');
  const [onSpriteChosenCallback, setOnSpriteChosenCallback] = useState<
    ((url: string) => void) | null
  >(null);

  // Load sprite library manifest on mount
  useEffect(() => {
    fetch('./assets/sprite-library/manifest.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SpriteManifestEntry[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSpriteManifest(data);
        }
      })
      .catch(() => {
        // Fallback built from currently known entities & relics if manifest hasn't loaded
      });
  }, []);

  const combinedSpriteCatalog = useMemo(() => {
    const map = new Map<string, SpriteManifestEntry>();
    // Include player + current enemies + current relics first
    map.set('./assets/entities/player.png', {
      id: 'entities/player.png',
      name: 'player',
      pack: 'Current Entities',
      url: './assets/entities/player.png',
    });
    enemiesList.forEach((e) => {
      if (e.art.spriteUrl) {
        map.set(e.art.spriteUrl, {
          id: e.id,
          name: `${e.id} (${e.namePools.easy[0] || ''})`,
          pack: 'Current Entities',
          url: e.art.spriteUrl,
        });
      }
    });
    relicsList.forEach((r) => {
      if (r.art.spriteUrl) {
        map.set(r.art.spriteUrl, {
          id: r.id,
          name: `${r.id} (${r.names.easy})`,
          pack: 'Relics Pack',
          url: r.art.spriteUrl,
        });
      }
    });
    spriteManifest.forEach((entry) => {
      if (!map.has(entry.url)) {
        map.set(entry.url, entry);
      }
    });
    return Array.from(map.values());
  }, [enemiesList, relicsList, spriteManifest]);

  const availablePacks = useMemo(() => {
    const packs = new Set<string>(['ALL']);
    combinedSpriteCatalog.forEach((s) => packs.add(s.pack));
    return Array.from(packs);
  }, [combinedSpriteCatalog]);

  const filteredSprites = useMemo(() => {
    const q = spriteSearch.trim().toLowerCase();
    return combinedSpriteCatalog.filter((s) => {
      if (spritePackFilter !== 'ALL' && s.pack !== spritePackFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [combinedSpriteCatalog, spritePackFilter, spriteSearch]);

  const openSpritePicker = (onPick: (url: string) => void) => {
    setOnSpriteChosenCallback(() => onPick);
    setSpritePickerOpen(true);
  };

  // Sync in-memory catalog arrays and sessionStorage so changes immediately reflect in the game and survive page reloads
  const syncLiveCatalogs = () => {
    ENEMIES_CATALOG.splice(0, ENEMIES_CATALOG.length, ...enemiesList);
    CARDS_CATALOG.splice(0, CARDS_CATALOG.length, ...cardsList);
    RELICS_CATALOG.splice(0, RELICS_CATALOG.length, ...relicsList);
    ENVIRONMENTS_CATALOG.splice(0, ENVIRONMENTS_CATALOG.length, ...environmentsList);
    EVENTS_CATALOG.splice(0, EVENTS_CATALOG.length, ...eventsList);
    Object.assign(MAP_PHRASES, mapPhrases);

    saveCatalogToSession('enemies', enemiesList);
    saveCatalogToSession('cards', cardsList);
    saveCatalogToSession('relics', relicsList);
    saveCatalogToSession('environments', environmentsList);
    saveCatalogToSession('events', eventsList);
    saveCatalogToSession('map_phrases', mapPhrases);
  };

  useEffect(() => {
    syncLiveCatalogs();
  }, [enemiesList, cardsList, relicsList, environmentsList, eventsList, mapPhrases]);

  const handleResetSessionToDefaults = () => {
    if (
      !window.confirm(
        'Reset all catalogs to default raw JSON? Any edits made this session will be reverted.'
      )
    ) {
      return;
    }
    clearSessionCatalogs();
    const defEnemies = JSON.parse(JSON.stringify(enemiesRaw));
    const defCards = JSON.parse(JSON.stringify(cardsRaw));
    const defRelics = JSON.parse(JSON.stringify(relicsRaw));
    const defEnvs = JSON.parse(JSON.stringify(environmentsRaw));
    const defEvents = JSON.parse(JSON.stringify(eventsRaw));
    const defPhrases = JSON.parse(JSON.stringify(mapPhrasesRaw));

    setEnemiesList(defEnemies);
    setCardsList(defCards);
    setRelicsList(defRelics);
    setEnvironmentsList(defEnvs);
    setEventsList(defEvents);
    setMapPhrases(defPhrases);

    ENEMIES_CATALOG.splice(0, ENEMIES_CATALOG.length, ...defEnemies);
    CARDS_CATALOG.splice(0, CARDS_CATALOG.length, ...defCards);
    RELICS_CATALOG.splice(0, RELICS_CATALOG.length, ...defRelics);
    ENVIRONMENTS_CATALOG.splice(0, ENVIRONMENTS_CATALOG.length, ...defEnvs);
    EVENTS_CATALOG.splice(0, EVENTS_CATALOG.length, ...defEvents);
    Object.assign(MAP_PHRASES, defPhrases);

    setSaveBanner({
      text: 'Reverted all data back to clean source JSON files!',
    });
    window.setTimeout(() => setSaveBanner(null), 4000);
  };

  const getTabPayload = (tab: EditorTab): { fileName: string; data: unknown } => {
    switch (tab) {
      case 'enemies':
        return { fileName: 'enemies.json', data: enemiesList };
      case 'cards':
        return { fileName: 'cards.json', data: cardsList };
      case 'relics':
        return { fileName: 'relics.json', data: relicsList };
      case 'environments':
        return { fileName: 'environments.json', data: environmentsList };
      case 'events':
        return { fileName: 'events.json', data: eventsList };
      case 'map_phrases':
        return { fileName: 'map_phrases.json', data: mapPhrases };
      case 'sounds':
        return { fileName: 'cards.json', data: cardsList };
    }
  };

  /**
   * Saves a JSON payload using the browser's native File System Access API (showSaveFilePicker)
   * if available, allowing the user to select and overwrite the exact file in File Explorer.
   * Falls back to standard download if the API is unsupported.
   */
  const saveJsonWithPicker = async (
    fileName: string,
    data: unknown
  ): Promise<{ success: boolean; method: 'picker' | 'download' | 'canceled' }> => {
    const jsonString = JSON.stringify(data, null, 2) + '\n';

    // 1. Modern File System Access API: opens native OS Save/Replace dialog
    if (
      typeof window !== 'undefined' &&
      'showSaveFilePicker' in window &&
      typeof (window as any).showSaveFilePicker === 'function'
    ) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'JSON Files (*.json)',
              accept: {
                'application/json': ['.json'],
              },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return { success: true, method: 'picker' };
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return { success: false, method: 'canceled' };
        }
        // If permission error or security block, fall through to blob download
      }
    }

    // 2. Fallback download for unsupported browsers
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, method: 'download' };
  };

  const handleSaveCurrentTabToDisk = async () => {
    syncLiveCatalogs();
    const { fileName, data } = getTabPayload(activeTab);

    // 1. Attempt direct local dev server save first (works automatically when running Vite locally)
    try {
      const res = await fetch('/__dev_api/save-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, data }),
      });
      if (res.ok) {
        setSaveBanner({
          text: `✅ Saved src/data/${fileName} directly to disk & updated live game catalogs!`,
        });
        window.setTimeout(() => setSaveBanner(null), 5000);
        return;
      }
    } catch {
      // Local dev API unreachable (e.g. static hosting, GitHub Pages, or offline)
    }

    // 2. Dev server unreachable: automatically prompt File Explorer to pick/replace the file!
    const result = await saveJsonWithPicker(fileName, data);
    if (result.method === 'picker') {
      setSaveBanner({
        text: `✅ Overwrote and saved ${fileName} via File Explorer! Live catalogs updated.`,
      });
    } else if (result.method === 'download') {
      setSaveBanner({
        text: `⬇️ Downloaded ${fileName}. Move it to src/data/ to replace the old file.`,
      });
    }
    window.setTimeout(() => setSaveBanner(null), 5000);
  };

  const handlePromptFileExplorer = async () => {
    syncLiveCatalogs();
    const { fileName, data } = getTabPayload(activeTab);
    const result = await saveJsonWithPicker(fileName, data);
    if (result.method === 'picker') {
      setSaveBanner({
        text: `✅ File chosen and replaced successfully on disk! Live catalogs updated.`,
      });
    } else if (result.method === 'download') {
      setSaveBanner({
        text: `⬇️ Downloaded ${fileName}. Move it to src/data/ to replace the old file.`,
      });
    }
    window.setTimeout(() => setSaveBanner(null), 5000);
  };

  const handleSaveAllTabsToDisk = async () => {
    syncLiveCatalogs();
    const tabs: EditorTab[] = [
      'enemies',
      'cards',
      'relics',
      'environments',
      'events',
      'map_phrases',
    ];
    let savedCount = 0;
    for (const t of tabs) {
      const payload = getTabPayload(t);
      try {
        const res = await fetch('/__dev_api/save-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) savedCount += 1;
      } catch {
        // ignore
      }
    }
    if (savedCount === tabs.length) {
      setSaveBanner({
        text: `✅ Saved all 6 JSON files (enemies, cards, relics, environments, events, map_phrases) directly to src/data/!`,
      });
    } else {
      setSaveBanner({
        text: `Applied all edits to the live game session! Use "📁 Replace in File Explorer" for static host saving.`,
      });
    }
    window.setTimeout(() => setSaveBanner(null), 5000);
  };

  const handleDownloadCurrentJson = () => {
    syncLiveCatalogs();
    const { fileName, data } = getTabPayload(activeTab);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== ENEMY HELPERS ====================
  const activeEnemy = enemiesList[selectedEnemyIdx] || enemiesList[0];

  const updateActiveEnemy = (updater: (en: EnemyDefinition) => EnemyDefinition) => {
    setEnemiesList((prev) =>
      prev.map((item, idx) => (idx === selectedEnemyIdx ? updater({ ...item }) : item))
    );
  };

  const handleAddNewEnemy = () => {
    const newEnemy: EnemyDefinition = {
      id: `custom_enemy_${enemiesList.length + 1}`,
      faction: 'goblins',
      role: 'balanced',
      tier: 1,
      minHp: 22,
      maxHp: 28,
      namePools: {
        easy: ['goblin rogue'],
        medium: ['sneaky goblin cutthroat'],
        hard: ['shadowy goblin blade prowler'],
      },
      moves: [
        {
          id: 'slash',
          name: 'Quick Slash',
          intent: 'attack',
          weight: 60,
          damage: 7,
        },
        {
          id: 'guard',
          name: 'Raise Buckler',
          intent: 'defend',
          weight: 40,
          ward: 6,
        },
      ],
      art: {
        primaryColor: '#3f6b2a',
        secondaryColor: '#7aa84f',
        shape: 'capsule',
        spriteUrl: './assets/entities/goblin_skirmisher.png',
      },
    };
    setEnemiesList((prev) => [...prev, newEnemy]);
    setSelectedEnemyIdx(enemiesList.length);
  };

  // ==================== CARD HELPERS ====================
  const activeCard = cardsList[selectedCardIdx] || cardsList[0];

  // Memoized card list sorted in the exact visual sequence of the GUI sidebar:
  // Categorized (Attack -> Defence -> Skill -> Debuff -> Power),
  // then sorted ascending by Rarity (Starter -> Common -> Uncommon -> Rare),
  // then sorted ascending by Cost (cheaper cards first, more expensive cards at bottom),
  // and filtered by any active search query.
  const orderedGuiCards = useMemo(() => {
    const CARD_CATEGORY_KEYS: CardVisualCategory[] = [
      'attack',
      'defence',
      'skill',
      'debuff',
      'power',
    ];
    const RARITY_ORDER: Record<string, number> = {
      starter: 0,
      common: 1,
      uncommon: 2,
      rare: 3,
    };

    const q = searchQuery.toLowerCase().trim();
    const matched = cardsList
      .map((card, originalIndex) => ({ card, originalIndex }))
      .filter(({ card }) => {
        if (!q) return true;
        return (
          card.id.toLowerCase().includes(q) ||
          card.names.easy.toLowerCase().includes(q) ||
          card.names.medium.toLowerCase().includes(q) ||
          card.description.toLowerCase().includes(q)
        );
      });

    const groups: Record<
      CardVisualCategory,
      Array<{ card: CardDefinition; originalIndex: number }>
    > = {
      attack: [],
      defence: [],
      skill: [],
      debuff: [],
      power: [],
    };

    for (const item of matched) {
      const cat = getCardVisualCategory(item.card as any);
      if (groups[cat]) {
        groups[cat].push(item);
      } else {
        groups.skill.push(item);
      }
    }

    const result: Array<{
      card: CardDefinition;
      originalIndex: number;
      category: CardVisualCategory;
    }> = [];

    for (const cat of CARD_CATEGORY_KEYS) {
      const catCards = groups[cat] || [];
      const sorted = [...catCards].sort((a, b) => {
        const costA = a.card.xCost || a.card.cost === -1 ? 999 : (a.card.cost ?? 0);
        const costB = b.card.xCost || b.card.cost === -1 ? 999 : (b.card.cost ?? 0);
        if (costA !== costB) {
          return costA - costB;
        }

        const rarA = RARITY_ORDER[a.card.rarity] ?? 99;
        const rarB = RARITY_ORDER[b.card.rarity] ?? 99;
        if (rarA !== rarB) {
          return rarA - rarB;
        }

        const nameA = a.card.names?.easy || a.card.id;
        const nameB = b.card.names?.easy || b.card.id;
        return nameA.localeCompare(nameB);
      });
      for (const item of sorted) {
        result.push({ ...item, category: cat });
      }
    }

    return result;
  }, [cardsList, searchQuery]);

  const activeCardGuiIdx = useMemo(() => {
    const idx = orderedGuiCards.findIndex(
      (item) => item.originalIndex === selectedCardIdx
    );
    return idx !== -1 ? idx : 0;
  }, [orderedGuiCards, selectedCardIdx]);

  const updateActiveCard = (updater: (c: CardDefinition) => CardDefinition) => {
    setCardsList((prev) =>
      prev.map((item, idx) => (idx === selectedCardIdx ? updater({ ...item }) : item))
    );
  };

  const handleAddNewCard = () => {
    const newCard: CardDefinition = {
      id: `custom_card_${cardsList.length + 1}`,
      rarity: 'common',
      type: 'attack',
      cost: 1,
      target: 'enemy',
      names: {
        easy: 'swift strike',
        medium: 'rapid fountain slash',
        hard: 'lightning calligraphy flourish',
      },
      connectors: {
        easy: 'at',
        medium: 'against',
        hard: 'targeting',
      },
      description: 'Deal 9 damage.',
      effects: [{ type: 'damage', amount: 9 }],
      art: {
        primaryColor: '#bc5215',
        secondaryColor: '#d97706',
        shape: 'capsule',
      },
      upgrade: {
        names: {
          easy: 'keen strike',
          medium: 'masterwork fountain slash',
          hard: 'peerless calligraphy flourish',
        },
        description: 'Deal 13 damage.',
        effects: [{ type: 'damage', amount: 13 }],
      },
    };
    setCardsList((prev) => [...prev, newCard]);
    setSelectedCardIdx(cardsList.length);
  };

  // ==================== RELIC HELPERS ====================
  const activeRelic = relicsList[selectedRelicIdx] || relicsList[0];

  const updateActiveRelic = (updater: (r: RelicDefinition) => RelicDefinition) => {
    setRelicsList((prev) =>
      prev.map((item, idx) => (idx === selectedRelicIdx ? updater({ ...item }) : item))
    );
  };

  const handleAddNewRelic = () => {
    const newRelic: RelicDefinition = {
      id: `custom_relic_${relicsList.length + 1}`,
      rarity: 'common',
      names: {
        easy: 'brass nib',
        medium: 'polished brass nib',
        hard: 'engraved masterwork brass nib',
      },
      description: 'Start each combat with 5 Ward.',
      trigger: 'combat_start',
      effectType: 'ward',
      amount: 5,
      price: 140,
      art: {
        primaryColor: '#b67d10',
        secondaryColor: '#ffd166',
        shape: 'diamond',
        spriteUrl: './assets/relics/Ac_Medal01.png',
      },
    };
    setRelicsList((prev) => [...prev, newRelic]);
    setSelectedRelicIdx(relicsList.length);
  };

  // ==================== ENVIRONMENT HELPERS ====================
  const activeEnv = environmentsList[selectedEnvIdx] || environmentsList[0];

  const updateActiveEnv = (
    updater: (env: BattleEnvironmentDefinition) => BattleEnvironmentDefinition
  ) => {
    setEnvironmentsList((prev) =>
      prev.map((item, idx) => (idx === selectedEnvIdx ? updater({ ...item }) : item))
    );
  };

  const handleAddNewEnv = () => {
    const newEnv: BattleEnvironmentDefinition = {
      id: `custom_env_${environmentsList.length + 1}`,
      name: 'New Battle Environment',
      description: 'Both sides gain +2 Ward on all block actions.',
      backgroundTint: 'rgba(217, 160, 91, 0.14)',
      accentColor: '#b45309',
      minFloor: 1,
      maxFloor: 26,
      weight: 10,
      art: {
        primaryColor: '#b45309',
        secondaryColor: '#f59e0b',
        shape: 'shield',
        spriteUrl: './assets/entities/rock_pebble.png',
      },
      modifiers: {
        wardBonus: 2,
      },
    };
    setEnvironmentsList((prev) => [...prev, newEnv]);
    setSelectedEnvIdx(environmentsList.length);
  };

  // ==================== MYSTERY EVENT HELPERS ====================
  const activeEvent = eventsList[selectedEventIdx] || eventsList[0];

  const updateActiveEvent = (
    updater: (ev: MysteryEventDefinition) => MysteryEventDefinition
  ) => {
    setEventsList((prev) =>
      prev.map((item, idx) => (idx === selectedEventIdx ? updater({ ...item }) : item))
    );
  };

  const handleAddNewEvent = () => {
    const newEv: MysteryEventDefinition = {
      id: `custom_event_${eventsList.length + 1}`,
      title: 'The Forgotten Typewriter',
      narrative: 'You discover an ancient brass typewriter resting on a tree stump.',
      choices: [
        {
          id: 'type_page',
          phrases: {
            easy: 'type page',
            medium: 'strike the brass keys',
            hard: 'compose a restorative verse on the brass keys',
          },
          outcomeText: 'The keys chime softly, mending your wounds.',
          effects: { hpChange: 15 },
        },
      ],
    };
    setEventsList((prev) => [...prev, newEv]);
    setSelectedEventIdx(eventsList.length);
  };

  return (
    <div className="dev-editor-viewport">
      {/* TOP BAR */}
      <header className="dev-editor-header">
        <div className="dev-editor-brand">
          <h2>🛠️ Typemancer Data & Sprite Editor GUI</h2>
          <span className="dev-editor-subtitle">
            Edit JSON data, rename enemies to match sprites, browse sprite packs & configure Battle Environments
          </span>
        </div>

        <div className="dev-editor-actions">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#e0f2fe',
              border: '1.5px solid #0284c7',
              color: '#0369a1',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: '0.78rem',
              fontWeight: 800,
            }}
            title="Changes are automatically persisted in sessionStorage and live in the current game session!"
          >
            <span>🟢 Session Live</span>
            <span style={{ fontWeight: 600, color: '#0c4a6e' }}>(Auto-persisted in session)</span>
          </div>
          <button
            type="button"
            className="dev-btn dev-btn-primary"
            onClick={handleSaveCurrentTabToDisk}
            title={
              activeTab === 'sounds'
                ? 'Saves updated card SFX assignments to src/data/cards.json on disk'
                : `Directly saves & overwrites src/data/${activeTab}.json on disk (with File Explorer fallback)`
            }
          >
            💾 {activeTab === 'sounds' ? 'Save Card SFX (cards.json)' : `Save ${activeTab}.json to Disk`}
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-secondary"
            onClick={handlePromptFileExplorer}
            title="Open File Explorer prompt to choose which file to replace on disk"
          >
            📁 Replace in File Explorer...
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-success"
            onClick={handleSaveAllTabsToDisk}
            title="Overwrites all 6 JSON files in src/data/ on disk"
          >
            💾 Save ALL Tabs
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-secondary"
            onClick={handleDownloadCurrentJson}
            title="Download the current tab JSON file"
          >
            ⬇️ Download .json
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-secondary"
            onClick={handleResetSessionToDefaults}
            title="Revert all catalogs back to clean source JSON"
          >
            🔄 Reset Defaults
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-close"
            onClick={() => {
              syncLiveCatalogs();
              onClose();
            }}
          >
            ✕ Return to Game
          </button>
        </div>
      </header>

      {saveBanner && (
        <div
          className={`dev-save-banner ${
            saveBanner.isError ? 'dev-banner-warn' : 'dev-banner-ok'
          }`}
        >
          {saveBanner.text}
        </div>
      )}

      {/* TABS BAR */}
      <nav className="dev-editor-tabs">
        {(
          [
            { id: 'enemies', label: `👹 Enemies (${enemiesList.length})` },
            { id: 'cards', label: `🃏 Cards (${cardsList.length})` },
            { id: 'relics', label: `🏺 Relics (${relicsList.length})` },
            { id: 'environments', label: `🌍 Battle Environments (${environmentsList.length})` },
            { id: 'events', label: `❓ Mystery Events (${eventsList.length})` },
            { id: 'map_phrases', label: `🗺️ Map Phrases` },
            { id: 'sounds', label: `🔊 Sounds & SFX (${SOUND_CATALOG.length})` },
          ] as { id: EditorTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`dev-tab-btn ${activeTab === t.id ? 'dev-tab-active' : ''}`}
            onClick={() => {
              setActiveTab(t.id);
              setSearchQuery('');
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ==================== TAB 1: ENEMIES ==================== */}
      {activeTab === 'enemies' && activeEnemy && (
        <div className="dev-editor-body">
          <aside className="dev-sidebar">
            <div className="dev-sidebar-top">
              <input
                type="text"
                className="dev-search-input"
                placeholder="Search enemies by id, name, faction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="dev-btn dev-btn-add"
                onClick={handleAddNewEnemy}
              >
                + Add New Enemy
              </button>
            </div>
            <div className="dev-item-list">
              {enemiesList.map((en, idx) => {
                const q = searchQuery.toLowerCase();
                const matches =
                  !q ||
                  en.id.toLowerCase().includes(q) ||
                  en.faction.toLowerCase().includes(q) ||
                  en.namePools.easy.some((n) => n.toLowerCase().includes(q)) ||
                  en.namePools.medium.some((n) => n.toLowerCase().includes(q));
                if (!matches) return null;
                return (
                  <button
                    key={`${en.id}_${idx}`}
                    type="button"
                    className={`dev-list-item ${
                      idx === selectedEnemyIdx ? 'dev-list-item-active' : ''
                    }`}
                    onClick={() => setSelectedEnemyIdx(idx)}
                  >
                    {en.art.spriteUrl && (
                      <img
                        src={en.art.spriteUrl}
                        alt=""
                        className="dev-list-thumb"
                        style={{
                          transform: en.art.flip ? 'scaleX(-1)' : 'none',
                        }}
                      />
                    )}
                    <div className="dev-list-meta">
                      <div className="dev-list-title">
                        {en.namePools.easy[0] || en.id}
                        <span
                          style={{
                            fontSize: '0.74rem',
                            opacity: 0.65,
                            fontWeight: 600,
                            marginLeft: '6px',
                          }}
                        >
                          T{en.tier} ({en.minHp}-{en.maxHp} HP)
                        </span>
                      </div>
                      <div className="dev-list-sub">
                        {en.description ||
                          `${en.faction} · Tier ${en.tier} ${en.role} (${en.minHp}-${en.maxHp} HP) · ${en.moves.length} moves`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="dev-detail-pane" ref={detailPaneRef}>
            <div className="dev-section-header">
              <h2>
                ✏️ Editing Enemy #{selectedEnemyIdx + 1} of {enemiesList.length}:{' '}
                <span style={{ color: '#bc5215' }}>
                  {activeEnemy.namePools.easy[0] || activeEnemy.id}
                </span>
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={selectedEnemyIdx <= 0}
                  onClick={() => setSelectedEnemyIdx((i) => Math.max(0, i - 1))}
                >
                  ◀ Prev Enemy
                </button>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={selectedEnemyIdx >= enemiesList.length - 1}
                  onClick={() =>
                    setSelectedEnemyIdx((i) => Math.min(enemiesList.length - 1, i + 1))
                  }
                >
                  Next Enemy ▶
                </button>
              </div>
            </div>

            {/* Top Hero Card: Big Sprite Preview + Basic Stats */}
            <div className="dev-hero-panel">
              <div className="dev-sprite-preview-box">
                {activeEnemy.art.spriteUrl ? (
                  <img
                    src={activeEnemy.art.spriteUrl}
                    alt={activeEnemy.id}
                    className="dev-sprite-big"
                    style={{
                      transform: activeEnemy.art.flip ? 'scaleX(-1)' : 'none',
                    }}
                  />
                ) : (
                  <div className="dev-sprite-placeholder">No Sprite</div>
                )}
                <button
                  type="button"
                  className="dev-btn dev-btn-primary"
                  onClick={() =>
                    openSpritePicker((url) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        art: { ...en.art, spriteUrl: url },
                      }))
                    )
                  }
                >
                  🖼️ Choose Sprite from Packs...
                </button>
                <label className="dev-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(activeEnemy.art.flip)}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        art: { ...en.art, flip: e.target.checked },
                      }))
                    }
                  />
                  Flip Sprite Horizontally
                </label>
              </div>

              <div className="dev-fields-grid">
                <label className="dev-field">
                  <span>Enemy ID</span>
                  <input
                    type="text"
                    value={activeEnemy.id}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({ ...en, id: e.target.value }))
                    }
                  />
                </label>

                <label className="dev-field">
                  <span>Faction</span>
                  <select
                    value={activeEnemy.faction}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        faction: e.target.value as EnemyFaction,
                      }))
                    }
                  >
                    <option value="goblins">goblins</option>
                    <option value="rock_monsters">rock_monsters</option>
                    <option value="evil_plants">evil_plants</option>
                    <option value="boss">boss</option>
                  </select>
                </label>

                <label className="dev-field">
                  <span>Role / House Style</span>
                  <select
                    value={activeEnemy.role}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        role: e.target.value as EnemyRole,
                      }))
                    }
                  >
                    <option value="balanced">balanced</option>
                    <option value="tank">tank</option>
                    <option value="glass_cannon">glass_cannon</option>
                    <option value="support">support</option>
                    <option value="elite">elite</option>
                    <option value="boss">boss</option>
                  </select>
                </label>

                <label className="dev-field">
                  <span>Tier (1=Early, 2=Mid, 3=Elite, 4=Boss)</span>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={activeEnemy.tier}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        tier: Number(e.target.value) as 1 | 2 | 3 | 4,
                      }))
                    }
                  />
                </label>

                <label className="dev-field">
                  <span>Min HP</span>
                  <input
                    type="number"
                    value={activeEnemy.minHp}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        minHp: Number(e.target.value),
                      }))
                    }
                  />
                </label>

                <label className="dev-field">
                  <span>Max HP</span>
                  <input
                    type="number"
                    value={activeEnemy.maxHp}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        maxHp: Number(e.target.value),
                      }))
                    }
                  />
                </label>

                <label className="dev-field">
                  <span>Sprite URL</span>
                  <input
                    type="text"
                    value={activeEnemy.art.spriteUrl || ''}
                    onChange={(e) =>
                      updateActiveEnemy((en) => ({
                        ...en,
                        art: { ...en.art, spriteUrl: e.target.value },
                      }))
                    }
                  />
                </label>

                <div className="dev-field dev-row-buttons">
                  <button
                    type="button"
                    className="dev-btn dev-btn-danger"
                    onClick={() => {
                      if (enemiesList.length <= 1) return;
                      setEnemiesList((prev) =>
                        prev.filter((_, i) => i !== selectedEnemyIdx)
                      );
                      setSelectedEnemyIdx((i) => Math.max(0, i - 1));
                    }}
                  >
                    🗑️ Delete Enemy
                  </button>
                </div>
              </div>
            </div>

            {/* Name Pools Section (Easy / Medium / Hard) */}
            <section className="dev-section-card">
              <h3>
                📝 Enemy Name Pools (Rename to Match Sprite — One Randomly Picked Per Spawn)
              </h3>
              <div className="dev-three-col">
                {(['easy', 'medium', 'hard'] as const).map((diffKey) => (
                  <div key={diffKey} className="dev-pool-col">
                    <div className="dev-pool-header">
                      <strong>{diffKey.toUpperCase()} Names</strong>
                      <button
                        type="button"
                        className="dev-btn-mini"
                        onClick={() =>
                          updateActiveEnemy((en) => ({
                            ...en,
                            namePools: {
                              ...en.namePools,
                              [diffKey]: [...en.namePools[diffKey], 'new enemy name'],
                            },
                          }))
                        }
                      >
                        + Add Name
                      </button>
                    </div>
                    {activeEnemy.namePools[diffKey].map((nameStr, nIdx) => (
                      <div key={nIdx} className="dev-pool-input-row">
                        <input
                          type="text"
                          value={nameStr}
                          onChange={(e) => {
                            const updated = [...activeEnemy.namePools[diffKey]];
                            updated[nIdx] = e.target.value;
                            updateActiveEnemy((en) => ({
                              ...en,
                              namePools: {
                                ...en.namePools,
                                [diffKey]: updated,
                              },
                            }));
                          }}
                        />
                        {activeEnemy.namePools[diffKey].length > 1 && (
                          <button
                            type="button"
                            className="dev-btn-icon-del"
                            onClick={() => {
                              const updated = activeEnemy.namePools[diffKey].filter(
                                (_, i) => i !== nIdx
                              );
                              updateActiveEnemy((en) => ({
                                ...en,
                                namePools: {
                                  ...en.namePools,
                                  [diffKey]: updated,
                                },
                              }));
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* Enemy Moves Section */}
            <section className="dev-section-card">
              <div className="dev-section-header">
                <h3>⚔️ Enemy Moves & Intents ({activeEnemy.moves.length})</h3>
                <button
                  type="button"
                  className="dev-btn dev-btn-add"
                  onClick={() =>
                    updateActiveEnemy((en) => ({
                      ...en,
                      moves: [
                        ...en.moves,
                        syncEnemyMoveStats({
                          id: `move_${en.moves.length + 1}`,
                          name: 'New Attack',
                          intent: 'attack',
                          weight: 50,
                          damage: 6,
                          effects: [{ type: 'damage', amount: 6, target: 'player', hits: 1 }],
                        }),
                      ],
                    }))
                  }
                >
                  + Add Move
                </button>
              </div>

              <div className="dev-moves-list">
                {activeEnemy.moves.map((mv: EnemyMove, mIdx: number) => {
                  const moveEffects =
                    mv.effects && mv.effects.length > 0 ? mv.effects : getEnemyMoveEffects(mv);
                  return (
                    <div key={mIdx} className="dev-subcard">
                      <div className="dev-fields-grid" style={{ alignItems: 'center' }}>
                        <label className="dev-field" style={{ minWidth: 160 }}>
                          <span>Move Name</span>
                          <input
                            type="text"
                            value={mv.name}
                            onChange={(e) => {
                              const nextMoves = [...activeEnemy.moves];
                              nextMoves[mIdx] = { ...mv, name: e.target.value };
                              updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                            }}
                          />
                        </label>
                        <label className="dev-field" style={{ minWidth: 140 }}>
                          <span>Intent Icon</span>
                          <select
                            value={mv.intent}
                            onChange={(e) => {
                              const nextMoves = [...activeEnemy.moves];
                              nextMoves[mIdx] = {
                                ...mv,
                                intent: e.target.value as EnemyIntentType,
                              };
                              updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                            }}
                          >
                            {ALL_INTENTS.map((intType) => (
                              <option key={intType} value={intType}>
                                {intType}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="dev-field" style={{ minWidth: 90 }}>
                          <span>Weight (%)</span>
                          <input
                            type="number"
                            value={mv.weight}
                            onChange={(e) => {
                              const nextMoves = [...activeEnemy.moves];
                              nextMoves[mIdx] = { ...mv, weight: Number(e.target.value) };
                              updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                            }}
                          />
                        </label>
                        {activeEnemy.moves.length > 1 && (
                          <div
                            className="dev-field"
                            style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}
                          >
                            <span>&nbsp;</span>
                            <button
                              type="button"
                              className="dev-btn dev-btn-danger"
                              onClick={() => {
                                const nextMoves = activeEnemy.moves.filter(
                                  (_, i) => i !== mIdx
                                );
                                updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                              }}
                            >
                              Remove Move
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Move Effects Section (3-Column Grid using CardEffect logic) */}
                      <div
                        style={{
                          marginTop: 8,
                          borderTop: '1.5px dashed #c5b393',
                          paddingTop: 8,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.86rem',
                              fontWeight: 800,
                              color: '#1e1610',
                            }}
                          >
                            ⚡ Move Effects ({moveEffects.length})
                          </span>
                          <select
                            className="dev-add-effect-select"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const chosenType = e.target.value as EffectType;
                                const isSelf =
                                  chosenType === 'ward' ||
                                  chosenType === 'heal' ||
                                  chosenType === 'bold' ||
                                  chosenType === 'plated_armor' ||
                                  chosenType === 'thorns';
                                const newEff: CardEffect = {
                                  type: chosenType,
                                  amount:
                                    chosenType === 'damage'
                                      ? 6
                                      : chosenType === 'ward'
                                      ? 5
                                      : 2,
                                  target: isSelf ? 'self' : 'player',
                                  hits: 1,
                                };
                                const nextEffects = [...moveEffects, newEff];
                                const nextMove = syncEnemyMoveStats({
                                  ...mv,
                                  effects: nextEffects,
                                });
                                const nextMoves = [...activeEnemy.moves];
                                nextMoves[mIdx] = nextMove;
                                updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                              }
                            }}
                          >
                            <option value="" disabled>
                              ➕ Add Effect (Choose Type)...
                            </option>
                            {EFFECT_TYPE_GROUPS.map((g) => (
                              <optgroup
                                key={g.category}
                                label={`━━━ ${g.category} (${g.colorName}) ━━━`}
                              >
                                {g.effects.map((item) => (
                                  <option key={item.type} value={item.type}>
                                    {item.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {moveEffects.length === 0 ? (
                          <div
                            style={{
                              padding: '8px 10px',
                              fontSize: '0.82rem',
                              color: '#786852',
                              fontStyle: 'italic',
                            }}
                          >
                            No effects on this move yet. Choose an effect above to add one.
                          </div>
                        ) : (
                          <div className="dev-effects-grid-3col">
                            {moveEffects.map((eff: CardEffect, eIdx: number) => {
                              const grp = getEffectGroup(eff.type);
                              return (
                                <div key={eIdx} className="dev-effect-tile">
                                  <div
                                    className="dev-effect-tile-header"
                                    style={{ borderBottomColor: grp.color }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                      }}
                                    >
                                      <span
                                        style={{
                                          display: 'inline-block',
                                          width: 10,
                                          height: 10,
                                          borderRadius: '50%',
                                          backgroundColor: grp.color,
                                        }}
                                      />
                                      <span
                                        className="dev-effect-tile-badge"
                                        style={{ color: grp.color }}
                                      >
                                        #{eIdx + 1} · {grp.category}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className="dev-btn dev-btn-danger dev-btn-mini"
                                      onClick={() => {
                                        const nextEffects = moveEffects.filter(
                                          (_, i) => i !== eIdx
                                        );
                                        const nextMove = syncEnemyMoveStats({
                                          ...mv,
                                          effects: nextEffects,
                                        });
                                        const nextMoves = [...activeEnemy.moves];
                                        nextMoves[mIdx] = nextMove;
                                        updateActiveEnemy((en) => ({
                                          ...en,
                                          moves: nextMoves,
                                        }));
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="dev-effect-tile-fields">
                                    <label className="dev-field dev-effect-tile-full">
                                      <span>Effect Type</span>
                                      <select
                                        value={eff.type}
                                        className="dev-effect-select"
                                        style={{ borderLeft: `6px solid ${grp.color}` }}
                                        onChange={(e) => {
                                          const nextEffects = [...moveEffects];
                                          nextEffects[eIdx] = {
                                            ...eff,
                                            type: e.target.value as EffectType,
                                          };
                                          const nextMove = syncEnemyMoveStats({
                                            ...mv,
                                            effects: nextEffects,
                                          });
                                          const nextMoves = [...activeEnemy.moves];
                                          nextMoves[mIdx] = nextMove;
                                          updateActiveEnemy((en) => ({
                                            ...en,
                                            moves: nextMoves,
                                          }));
                                        }}
                                      >
                                        {EFFECT_TYPE_GROUPS.map((g) => (
                                          <optgroup
                                            key={g.category}
                                            label={`━━━ ${g.category} (${g.colorName}) ━━━`}
                                          >
                                            {g.effects.map((item) => (
                                              <option key={item.type} value={item.type}>
                                                {item.label}
                                              </option>
                                            ))}
                                          </optgroup>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="dev-field">
                                      <span>Amount</span>
                                      <input
                                        type="number"
                                        value={eff.amount}
                                        onChange={(e) => {
                                          const nextEffects = [...moveEffects];
                                          nextEffects[eIdx] = {
                                            ...eff,
                                            amount: Number(e.target.value),
                                          };
                                          const nextMove = syncEnemyMoveStats({
                                            ...mv,
                                            effects: nextEffects,
                                          });
                                          const nextMoves = [...activeEnemy.moves];
                                          nextMoves[mIdx] = nextMove;
                                          updateActiveEnemy((en) => ({
                                            ...en,
                                            moves: nextMoves,
                                          }));
                                        }}
                                      />
                                    </label>
                                    <label className="dev-field">
                                      <span>Target</span>
                                      <select
                                        value={
                                          eff.target ||
                                          (eff.type === 'ward' || eff.type === 'heal'
                                            ? 'self'
                                            : 'player')
                                        }
                                        onChange={(e) => {
                                          const nextEffects = [...moveEffects];
                                          nextEffects[eIdx] = {
                                            ...eff,
                                            target: e.target.value as
                                              | 'player'
                                              | 'self'
                                              | 'all_allies',
                                          };
                                          const nextMove = syncEnemyMoveStats({
                                            ...mv,
                                            effects: nextEffects,
                                          });
                                          const nextMoves = [...activeEnemy.moves];
                                          nextMoves[mIdx] = nextMove;
                                          updateActiveEnemy((en) => ({
                                            ...en,
                                            moves: nextMoves,
                                          }));
                                        }}
                                      >
                                        <option value="player">Player (Hero)</option>
                                        <option value="self">Self (Caster)</option>
                                        <option value="all_allies">All Allies (Monsters)</option>
                                      </select>
                                    </label>
                                    {(eff.type === 'damage' ||
                                      (eff.hits && eff.hits > 1)) && (
                                      <label className="dev-field">
                                        <span>Hits</span>
                                        <input
                                          type="number"
                                          min={1}
                                          max={10}
                                          value={eff.hits || 1}
                                          onChange={(e) => {
                                            const nextEffects = [...moveEffects];
                                            nextEffects[eIdx] = {
                                              ...eff,
                                              hits: Number(e.target.value),
                                            };
                                            const nextMove = syncEnemyMoveStats({
                                              ...mv,
                                              effects: nextEffects,
                                            });
                                            const nextMoves = [...activeEnemy.moves];
                                            nextMoves[mIdx] = nextMove;
                                            updateActiveEnemy((en) => ({
                                              ...en,
                                              moves: nextMoves,
                                            }));
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ==================== TAB 2: CARDS ==================== */}
      {activeTab === 'cards' && activeCard && (
        <div className="dev-editor-body">
          <aside className="dev-sidebar">
            <div className="dev-sidebar-top">
              <input
                type="text"
                className="dev-search-input"
                placeholder="Search cards by name, id, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="dev-btn dev-btn-add"
                onClick={handleAddNewCard}
              >
                + Add New Card
              </button>
            </div>
            <div className="dev-item-list">
              {(() => {
                const CARD_CATEGORY_KEYS: CardVisualCategory[] = [
                  'attack',
                  'defence',
                  'skill',
                  'debuff',
                  'power',
                ];

                return CARD_CATEGORY_KEYS.map((cat) => {
                  const catCards = orderedGuiCards.filter((item) => item.category === cat);
                  if (catCards.length === 0) return null;

                  return (
                    <React.Fragment key={cat}>
                      <div className={`dev-card-cat-header dev-card-cat-${cat}`}>
                        <span>{CARD_CATEGORY_LABELS[cat]}</span>
                        <span className="dev-card-cat-count">{catCards.length}</span>
                      </div>
                      {catCards.map(({ card, originalIndex }) => {
                        const theme = getCardColorTheme(cat, card.rarity);
                        return (
                          <button
                            key={`${card.id}_${originalIndex}`}
                            type="button"
                            className={`dev-list-item ${
                              originalIndex === selectedCardIdx
                                ? 'dev-list-item-active'
                                : ''
                            }`}
                            style={{
                              backgroundColor: theme.bg,
                              borderColor:
                                originalIndex === selectedCardIdx
                                  ? '#ffd166'
                                  : '#0d1b22',
                              borderWidth:
                                originalIndex === selectedCardIdx ? '3px' : '2px',
                              boxShadow:
                                originalIndex === selectedCardIdx
                                  ? '0 0 0 2px #ffd166, 0 4px 14px rgba(0, 0, 0, 0.45)'
                                  : '0 2px 5px rgba(0, 0, 0, 0.18)',
                              transform:
                                originalIndex === selectedCardIdx
                                  ? 'translateX(3px) scale(1.01)'
                                  : undefined,
                            }}
                            onClick={() => setSelectedCardIdx(originalIndex)}
                          >
                            {card.art.spriteUrl && (
                              <img
                                src={card.art.spriteUrl}
                                alt=""
                                className="dev-list-thumb"
                                style={{
                                  backgroundColor: '#e9ecef',
                                  border: '2px solid #0d1b22',
                                  borderRadius: '8px',
                                }}
                              />
                            )}
                            <div className="dev-list-meta">
                              <div
                                className="dev-list-title"
                                style={{
                                  color: theme.textColor,
                                  fontWeight: 800,
                                }}
                              >
                                {card.names.easy} ({card.xCost || card.cost === -1 ? 'X' : card.cost}⚡)
                              </div>
                              <div
                                className="dev-list-sub"
                                style={{
                                  color: theme.descColor,
                                  opacity: 0.95,
                                  marginTop: '3px',
                                }}
                              >
                                <span
                                  style={{
                                    backgroundColor: theme.pillBg,
                                    color: theme.textColor,
                                    border: '1px solid #0d1b22',
                                    padding: '1px 6px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'lowercase',
                                    marginRight: '6px',
                                    display: 'inline-block',
                                    verticalAlign: 'baseline',
                                  }}
                                >
                                  {card.rarity}
                                </span>
                                <span>{card.description}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </aside>

          <main className="dev-detail-pane" ref={detailPaneRef}>
            <div className="dev-section-header">
              <h2>
                ✏️ Editing Card #{activeCardGuiIdx + 1} of {orderedGuiCards.length}:{' '}
                <span style={{ color: '#bc5215' }}>{activeCard.names.easy}</span>
                {(() => {
                  const activeCat = getCardVisualCategory(activeCard as any);
                  const activeTheme = getCardColorTheme(activeCat, activeCard.rarity);
                  return (
                    <span
                      style={{
                        backgroundColor: activeTheme.bg,
                        color: activeTheme.textColor,
                        border: '1.5px solid #0d1b22',
                        borderRadius: '8px',
                        padding: '2px 10px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        marginLeft: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{activeCat.toUpperCase()}</span>
                      <span>·</span>
                      <span>{activeCard.rarity.toUpperCase()}</span>
                    </span>
                  );
                })()}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={activeCardGuiIdx <= 0}
                  onClick={() => {
                    const prev = orderedGuiCards[activeCardGuiIdx - 1];
                    if (prev) setSelectedCardIdx(prev.originalIndex);
                  }}
                  title="Navigate to previous card in the GUI list"
                >
                  ◀ Prev Card
                </button>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={activeCardGuiIdx >= orderedGuiCards.length - 1}
                  onClick={() => {
                    const next = orderedGuiCards[activeCardGuiIdx + 1];
                    if (next) setSelectedCardIdx(next.originalIndex);
                  }}
                  title="Navigate to next card in the GUI list"
                >
                  Next Card ▶
                </button>
              </div>
            </div>
            <div className="dev-hero-panel">
              <div className="dev-sprite-preview-box">
                {activeCard.art.spriteUrl ? (
                  <img
                    src={activeCard.art.spriteUrl}
                    alt={activeCard.id}
                    className="dev-sprite-big"
                  />
                ) : (
                  <div
                    className="dev-sprite-placeholder"
                    style={{ background: activeCard.art.primaryColor }}
                  >
                    {activeCard.rarity[0].toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  className="dev-btn dev-btn-primary"
                  onClick={() =>
                    openSpritePicker((url) =>
                      updateActiveCard((c) => ({
                        ...c,
                        art: { ...c.art, spriteUrl: url },
                      }))
                    )
                  }
                >
                  🖼️ Choose Card Icon...
                </button>
              </div>

              <div className="dev-fields-grid">
                <label className="dev-field">
                  <span>Card ID</span>
                  <input
                    type="text"
                    value={activeCard.id}
                    onChange={(e) =>
                      updateActiveCard((c) => ({ ...c, id: e.target.value }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Rarity</span>
                  <select
                    value={activeCard.rarity}
                    onChange={(e) =>
                      updateActiveCard((c) => ({
                        ...c,
                        rarity: e.target.value as CardDefinition['rarity'],
                      }))
                    }
                  >
                    <option value="starter">starter</option>
                    <option value="common">common</option>
                    <option value="uncommon">uncommon</option>
                    <option value="rare">rare</option>
                  </select>
                </label>
                <label className="dev-field">
                  <span>Card Type</span>
                  <select
                    value={activeCard.type}
                    onChange={(e) =>
                      updateActiveCard((c) => ({
                        ...c,
                        type: e.target.value as CardDefinition['type'],
                      }))
                    }
                  >
                    <option value="attack">attack</option>
                    <option value="skill">skill</option>
                    <option value="power">power (rest of combat)</option>
                  </select>
                </label>
                <label className="dev-field">
                  <span>Energy Cost (⚡)</span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={activeCard.cost}
                    onChange={(e) =>
                      updateActiveCard((c) => ({ ...c, cost: Number(e.target.value) }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Target</span>
                  <select
                    value={activeCard.target}
                    onChange={(e) =>
                      updateActiveCard((c) => ({
                        ...c,
                        target: e.target.value as CardDefinition['target'],
                      }))
                    }
                  >
                    <option value="enemy">enemy</option>
                    <option value="all_enemies">all_enemies</option>
                    <option value="self">self</option>
                  </select>
                </label>
                <label className="dev-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(activeCard.xCost)}
                    onChange={(e) => updateActiveCard((c) => ({ ...c, xCost: e.target.checked }))}
                  />
                  X Energy Cost (⚡)
                </label>
                <label className="dev-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(activeCard.burnDraft)}
                    onChange={(e) =>
                      updateActiveCard((c) => ({ ...c, burnDraft: e.target.checked }))
                    }
                  />
                  Once Per Combat (Burn Draft)
                </label>

                {/* Card Sound Effect Selector & Live Audition */}
                <div
                  className="dev-field dev-sound-field"
                  style={{ gridColumn: '1 / -1', marginTop: 4, background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>🔊 Card Sound Effect (SFX)</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Plays on card cast</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      style={{ flex: 1, padding: '7px 10px', fontSize: '0.86rem' }}
                      value={activeCard.sfx || soundEngine.getCardSfx(activeCard.id) || 'cards/blade_01.ogg'}
                      onChange={(e) => {
                        const newSfx = e.target.value;
                        updateActiveCard((c) => ({ ...c, sfx: newSfx }));
                        soundEngine.updateCardSfx(activeCard.id, newSfx);
                      }}
                    >
                      {SOUND_CATEGORIES.filter((c) => c !== 'UI & Combat Global').map((cat) => (
                        <optgroup key={cat} label={cat}>
                          {SOUND_CATALOG.filter((s) => s.category === cat).map((sound) => (
                            <option key={sound.id} value={sound.id}>
                              {sound.label} — {sound.description}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="dev-btn-secondary"
                      style={{
                        padding: '7px 16px',
                        background: '#047857',
                        color: '#ffffff',
                        border: '1.5px solid #065f46',
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => {
                        const sfx = activeCard.sfx || soundEngine.getCardSfx(activeCard.id) || 'cards/blade_01.ogg';
                        soundEngine.playCardSound(
                          activeCard.id,
                          { volume: 0.85, muted: false, typingSound: 'mechanical_typewriter', confirmSound: 'carriage_bell', highContrast: false },
                          sfx
                        );
                      }}
                      title="Audition this card's sound effect with card flick layer"
                    >
                      🔊 Listen
                    </button>
                  </div>
                  {(() => {
                    const currentSfx = activeCard.sfx || soundEngine.getCardSfx(activeCard.id) || 'cards/blade_01.ogg';
                    const item = SOUND_CATALOG.find((s) => s.id === currentSfx);
                    if (item) {
                      return (
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 5, display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span className="dev-sound-cat-badge">{item.category}</span>
                          <span className="dev-sound-path-code">{item.id}</span>
                          <span>{item.description}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            <section className="dev-section-card">
              <h3>Base Card Names, Connectors & Effects</h3>
              <div className="dev-three-col">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <div key={diff} className="dev-pool-col">
                    <label className="dev-field">
                      <span>{diff.toUpperCase()} Card Name</span>
                      <input
                        type="text"
                        value={activeCard.names[diff]}
                        onChange={(e) =>
                          updateActiveCard((c) => ({
                            ...c,
                            names: { ...c.names, [diff]: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="dev-field">
                      <span>{diff.toUpperCase()} Connector</span>
                      <input
                        type="text"
                        value={activeCard.connectors[diff]}
                        onChange={(e) =>
                          updateActiveCard((c) => ({
                            ...c,
                            connectors: { ...c.connectors, [diff]: e.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>

              <label className="dev-field" style={{ marginTop: 12 }}>
                <span>
                  Card Description{' '}
                  <span style={{ fontSize: '0.72rem', color: '#9a6a3b', fontWeight: 500 }}>
                    (Optional: Use <code>{'{+2}'}</code> or <code>{'[+2]'}</code> to define upgrade delta position)
                  </span>
                </span>
                <input
                  type="text"
                  value={activeCard.description}
                  onChange={(e) =>
                    updateActiveCard((c) => ({ ...c, description: e.target.value }))
                  }
                />
              </label>

              <div className="dev-section-header" style={{ marginTop: 12 }}>
                <h4>Base Effects ({activeCard.effects.length})</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    className="dev-add-effect-select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const chosenType = e.target.value as EffectType;
                        updateActiveCard((c) => ({
                          ...c,
                          effects: [...c.effects, { type: chosenType, amount: 5 }],
                        }));
                      }
                    }}
                  >
                    <option value="" disabled>
                      ➕ Add Effect (Choose Type)...
                    </option>
                    {EFFECT_TYPE_GROUPS.map((g) => (
                      <optgroup key={g.category} label={`━━━ ${g.category} (${g.colorName}) ━━━`}>
                        {g.effects.map((item) => (
                          <option key={item.type} value={item.type}>
                            {item.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dev-effects-grid-3col">
                {activeCard.effects.map((eff: CardEffect, eIdx: number) => {
                  const grp = getEffectGroup(eff.type);
                  return (
                    <div key={eIdx} className="dev-effect-tile">
                      <div className="dev-effect-tile-header" style={{ borderBottomColor: grp.color }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: grp.color,
                            }}
                          />
                          <span className="dev-effect-tile-badge" style={{ color: grp.color }}>
                            #{eIdx + 1} · {grp.category}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="dev-btn dev-btn-danger dev-btn-mini"
                          onClick={() => {
                            const next = activeCard.effects.filter((_, i) => i !== eIdx);
                            updateActiveCard((c) => ({ ...c, effects: next }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="dev-effect-tile-fields">
                        <label className="dev-field dev-effect-tile-full">
                          <span>Effect Type</span>
                          <select
                            value={eff.type}
                            className="dev-effect-select"
                            style={{ borderLeft: `6px solid ${grp.color}` }}
                            onChange={(e) => {
                              const next = [...activeCard.effects];
                              next[eIdx] = { ...eff, type: e.target.value as EffectType };
                              updateActiveCard((c) => ({ ...c, effects: next }));
                            }}
                          >
                            {EFFECT_TYPE_GROUPS.map((g) => (
                              <optgroup key={g.category} label={`━━━ ${g.category} (${g.colorName}) ━━━`}>
                                {g.effects.map((item) => (
                                  <option key={item.type} value={item.type}>
                                    {item.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </label>
                      <label className="dev-field">
                        <span>Amount</span>
                        <input
                          type="number"
                          value={eff.amount}
                          onChange={(e) => {
                            const next = [...activeCard.effects];
                            next[eIdx] = { ...eff, amount: Number(e.target.value) };
                            updateActiveCard((c) => ({ ...c, effects: next }));
                          }}
                        />
                      </label>
                      <label className="dev-field">
                        <span>Target</span>
                        <select
                          value={eff.target || 'default'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const next = [...activeCard.effects];
                            next[eIdx] = {
                              ...eff,
                              target: val === 'default' ? undefined : (val as 'enemy' | 'all_enemies' | 'self'),
                            };
                            updateActiveCard((c) => ({ ...c, effects: next }));
                          }}
                        >
                          <option value="default">Default (Card Target: {activeCard.target})</option>
                          <option value="enemy">Single Enemy</option>
                          <option value="all_enemies">All Enemies</option>
                          <option value="self">Self (Player)</option>
                        </select>
                      </label>
                      <label className="dev-field">
                        <span>Targets Count</span>
                        <input
                          type="number"
                          min={1}
                          value={eff.targetCount ?? 1}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const next = [...activeCard.effects];
                            next[eIdx] = { ...eff, targetCount: val > 1 ? val : undefined };
                            updateActiveCard((c) => ({ ...c, effects: next }));
                          }}
                        />
                      </label>
                      <label className="dev-field">
                        <span>Hits / Repeats</span>
                        <input
                          type="number"
                          min={1}
                          value={eff.hits ?? 1}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const next = [...activeCard.effects];
                            next[eIdx] = { ...eff, hits: val > 1 ? val : undefined };
                            updateActiveCard((c) => ({ ...c, effects: next }));
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
              </div>
            </section>

            {/* Upgraded Card Section */}
            <section className="dev-section-card">
              <h3>✨ Upgraded Version (+)</h3>
              <div className="dev-three-col">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <label key={diff} className="dev-field">
                    <span>Upgraded {diff.toUpperCase()} Name</span>
                    <input
                      type="text"
                      value={ensureUpgrade(activeCard).names[diff]}
                      onChange={(e) =>
                        updateActiveCard((c) => {
                          const baseUp = ensureUpgrade(c);
                          return {
                            ...c,
                            upgrade: {
                              ...baseUp,
                              names: { ...baseUp.names, [diff]: e.target.value },
                            },
                          };
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="dev-fields-grid" style={{ marginTop: 10 }}>
                <label className="dev-field" style={{ gridColumn: 'span 2' }}>
                  <span>Upgraded Description</span>
                  <input
                    type="text"
                    value={ensureUpgrade(activeCard).description}
                    onChange={(e) =>
                      updateActiveCard((c) => ({
                        ...c,
                        upgrade: { ...ensureUpgrade(c), description: e.target.value },
                      }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Upgraded Energy Cost (⚡)</span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={activeCard.upgrade?.cost ?? activeCard.cost}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveCard((c) => ({
                        ...c,
                        upgrade: {
                          ...ensureUpgrade(c),
                          cost: val,
                        },
                      }));
                    }}
                  />
                </label>
                <label className="dev-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(activeCard.upgrade?.xCost)}
                    onChange={(e) =>
                      updateActiveCard((c) => ({
                        ...c,
                        upgrade: { ...ensureUpgrade(c), xCost: e.target.checked },
                      }))
                    }
                  />
                  Upgraded X Energy Cost
                </label>
              </div>

              {(() => {
                const currentUpgrade = ensureUpgrade(activeCard);
                const upgradedEffects = currentUpgrade.effects || [];
                return (
                  <>
                    <div className="dev-section-header" style={{ marginTop: 16 }}>
                      <h4>Upgraded Effects ({upgradedEffects.length})</h4>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          className="dev-add-effect-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const chosenType = e.target.value as EffectType;
                              updateActiveCard((c) => ({
                                ...c,
                                upgrade: {
                                  ...ensureUpgrade(c),
                                  effects: [...upgradedEffects, { type: chosenType, amount: 7 }],
                                },
                              }));
                            }
                          }}
                        >
                          <option value="" disabled>
                            ➕ Add Upgraded Effect (Choose Type)...
                          </option>
                          {EFFECT_TYPE_GROUPS.map((g) => (
                            <optgroup key={g.category} label={`━━━ ${g.category} (${g.colorName}) ━━━`}>
                              {g.effects.map((item) => (
                                <option key={item.type} value={item.type}>
                                  {item.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="dev-btn-mini"
                          onClick={() => {
                            const copied = activeCard.effects.map((eff) => ({ ...eff }));
                            updateActiveCard((c) => ({
                              ...c,
                              upgrade: {
                                ...ensureUpgrade(c),
                                effects: copied,
                              },
                            }));
                          }}
                        >
                          Copy Base Effects
                        </button>
                      </div>
                    </div>

                    <div className="dev-effects-grid-3col">
                      {upgradedEffects.map((eff: CardEffect, eIdx: number) => {
                        const grp = getEffectGroup(eff.type);
                        return (
                          <div key={eIdx} className="dev-effect-tile">
                            <div className="dev-effect-tile-header" style={{ borderBottomColor: grp.color }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: grp.color,
                                  }}
                                />
                                <span className="dev-effect-tile-badge" style={{ color: grp.color }}>
                                  #{eIdx + 1} · {grp.category}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="dev-btn dev-btn-danger dev-btn-mini"
                                onClick={() => {
                                  const next = upgradedEffects.filter((_, i) => i !== eIdx);
                                  updateActiveCard((c) => ({
                                    ...c,
                                    upgrade: {
                                      ...ensureUpgrade(c),
                                      effects: next,
                                    },
                                  }));
                                }}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="dev-effect-tile-fields">
                              <label className="dev-field dev-effect-tile-full">
                                <span>Effect Type</span>
                                <select
                                  value={eff.type}
                                  className="dev-effect-select"
                                  style={{ borderLeft: `6px solid ${grp.color}` }}
                                  onChange={(e) => {
                                    const next = [...upgradedEffects];
                                    next[eIdx] = { ...eff, type: e.target.value as EffectType };
                                    updateActiveCard((c) => ({
                                      ...c,
                                      upgrade: {
                                        ...ensureUpgrade(c),
                                        effects: next,
                                      },
                                    }));
                                  }}
                                >
                                  {EFFECT_TYPE_GROUPS.map((g) => (
                                    <optgroup key={g.category} label={`━━━ ${g.category} (${g.colorName}) ━━━`}>
                                      {g.effects.map((item) => (
                                        <option key={item.type} value={item.type}>
                                          {item.label}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </label>
                            <label className="dev-field">
                              <span>Amount</span>
                              <input
                                type="number"
                                value={eff.amount}
                                onChange={(e) => {
                                  const next = [...upgradedEffects];
                                  next[eIdx] = { ...eff, amount: Number(e.target.value) };
                                  updateActiveCard((c) => ({
                                    ...c,
                                    upgrade: {
                                      ...ensureUpgrade(c),
                                      effects: next,
                                    },
                                  }));
                                }}
                              />
                            </label>
                            <label className="dev-field">
                              <span>Target</span>
                              <select
                                value={eff.target || 'default'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const next = [...upgradedEffects];
                                  next[eIdx] = {
                                    ...eff,
                                    target: val === 'default' ? undefined : (val as 'enemy' | 'all_enemies' | 'self'),
                                  };
                                  updateActiveCard((c) => ({
                                    ...c,
                                    upgrade: {
                                      ...ensureUpgrade(c),
                                      effects: next,
                                    },
                                  }));
                                }}
                              >
                                <option value="default">Default (Card Target: {activeCard.target})</option>
                                <option value="enemy">Single Enemy</option>
                                <option value="all_enemies">All Enemies</option>
                                <option value="self">Self (Player)</option>
                              </select>
                            </label>
                            <label className="dev-field">
                              <span>Targets Count</span>
                              <input
                                type="number"
                                min={1}
                                value={eff.targetCount ?? 1}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const next = [...upgradedEffects];
                                  next[eIdx] = { ...eff, targetCount: val > 1 ? val : undefined };
                                  updateActiveCard((c) => ({
                                    ...c,
                                    upgrade: {
                                      ...ensureUpgrade(c),
                                      effects: next,
                                    },
                                  }));
                                }}
                              />
                            </label>
                            <label className="dev-field">
                              <span>Hits / Repeats</span>
                              <input
                                type="number"
                                min={1}
                                value={eff.hits ?? 1}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const next = [...upgradedEffects];
                                  next[eIdx] = { ...eff, hits: val > 1 ? val : undefined };
                                  updateActiveCard((c) => ({
                                    ...c,
                                    upgrade: {
                                      ...ensureUpgrade(c),
                                      effects: next,
                                    },
                                  }));
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                );
              })()}
            </section>
          </main>
        </div>
      )}

      {/* ==================== TAB 3: RELICS ==================== */}
      {activeTab === 'relics' && activeRelic && (
        <div className="dev-editor-body">
          <aside className="dev-sidebar">
            <div className="dev-sidebar-top">
              <input
                type="text"
                className="dev-search-input"
                placeholder="Search relics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="dev-btn dev-btn-add"
                onClick={handleAddNewRelic}
              >
                + Add New Relic
              </button>
            </div>
            <div className="dev-item-list">
              {relicsList.map((r, idx) => {
                const q = searchQuery.toLowerCase();
                if (
                  q &&
                  !r.id.toLowerCase().includes(q) &&
                  !r.names.easy.toLowerCase().includes(q) &&
                  !r.description.toLowerCase().includes(q)
                ) {
                  return null;
                }
                return (
                  <button
                    key={`${r.id}_${idx}`}
                    type="button"
                    className={`dev-list-item ${
                      idx === selectedRelicIdx ? 'dev-list-item-active' : ''
                    }`}
                    onClick={() => setSelectedRelicIdx(idx)}
                  >
                    {r.art.spriteUrl && (
                      <img src={r.art.spriteUrl} alt="" className="dev-list-thumb" />
                    )}
                    <div className="dev-list-meta">
                      <div className="dev-list-title">
                        {r.names.easy}
                        <span
                          style={{
                            fontSize: '0.74rem',
                            opacity: 0.65,
                            fontWeight: 600,
                            marginLeft: '6px',
                            textTransform: 'capitalize',
                          }}
                        >
                          ({r.rarity})
                        </span>
                      </div>
                      <div className="dev-list-sub">{r.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="dev-detail-pane" ref={detailPaneRef}>
            <div className="dev-section-header">
              <h2>
                ✏️ Editing Relic #{selectedRelicIdx + 1} of {relicsList.length}:{' '}
                <span style={{ color: '#bc5215' }}>{activeRelic.names.easy}</span>
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={selectedRelicIdx <= 0}
                  onClick={() => setSelectedRelicIdx((i) => Math.max(0, i - 1))}
                >
                  ◀ Prev Relic
                </button>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={selectedRelicIdx >= relicsList.length - 1}
                  onClick={() =>
                    setSelectedRelicIdx((i) => Math.min(relicsList.length - 1, i + 1))
                  }
                >
                  Next Relic ▶
                </button>
              </div>
            </div>
            <div className="dev-hero-panel">
              <div className="dev-sprite-preview-box">
                {activeRelic.art.spriteUrl && (
                  <img
                    src={activeRelic.art.spriteUrl}
                    alt={activeRelic.id}
                    className="dev-sprite-big"
                  />
                )}
                <button
                  type="button"
                  className="dev-btn dev-btn-primary"
                  onClick={() =>
                    openSpritePicker((url) =>
                      updateActiveRelic((r) => ({
                        ...r,
                        art: { ...r.art, spriteUrl: url },
                      }))
                    )
                  }
                >
                  🖼️ Choose Relic Sprite...
                </button>
              </div>

              <div className="dev-fields-grid">
                <label className="dev-field">
                  <span>Relic ID</span>
                  <input
                    type="text"
                    value={activeRelic.id}
                    onChange={(e) =>
                      updateActiveRelic((r) => ({ ...r, id: e.target.value }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Rarity</span>
                  <select
                    value={activeRelic.rarity}
                    onChange={(e) =>
                      updateActiveRelic((r) => ({
                        ...r,
                        rarity: e.target.value as RelicDefinition['rarity'],
                      }))
                    }
                  >
                    <option value="starter">starter</option>
                    <option value="common">common</option>
                    <option value="uncommon">uncommon</option>
                    <option value="rare">rare</option>
                    <option value="boss">boss</option>
                  </select>
                </label>
                <label className="dev-field">
                  <span>Trigger</span>
                  <select
                    value={activeRelic.trigger}
                    onChange={(e) =>
                      updateActiveRelic((r) => ({
                        ...r,
                        trigger: e.target.value as RelicTrigger,
                      }))
                    }
                  >
                    {ALL_RELIC_TRIGGERS.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dev-field">
                  <span>Effect Type</span>
                  <select
                    value={activeRelic.effectType}
                    onChange={(e) =>
                      updateActiveRelic((r) => ({
                        ...r,
                        effectType: e.target.value as RelicDefinition['effectType'],
                      }))
                    }
                  >
                    {ALL_RELIC_EFFECTS.map((ef) => (
                      <option key={ef} value={ef}>
                        {ef}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dev-field">
                  <span>Effect Amount</span>
                  <input
                    type="number"
                    value={activeRelic.amount}
                    onChange={(e) =>
                      updateActiveRelic((r) => ({
                        ...r,
                        amount: Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Shop Price (Gold)</span>
                  <input
                    type="number"
                    value={activeRelic.price ?? 145}
                    onChange={(e) =>
                      updateActiveRelic((r) => ({
                        ...r,
                        price: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            <section className="dev-section-card">
              <h3>Relic Names & Description</h3>
              <div className="dev-three-col">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <label key={diff} className="dev-field">
                    <span>{diff.toUpperCase()} Name</span>
                    <input
                      type="text"
                      value={activeRelic.names[diff]}
                      onChange={(e) =>
                        updateActiveRelic((r) => ({
                          ...r,
                          names: { ...r.names, [diff]: e.target.value },
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="dev-field" style={{ marginTop: 10 }}>
                <span>Description</span>
                <input
                  type="text"
                  value={activeRelic.description}
                  onChange={(e) =>
                    updateActiveRelic((r) => ({ ...r, description: e.target.value }))
                  }
                />
              </label>
            </section>
          </main>
        </div>
      )}

      {/* ==================== TAB 4: BATTLE ENVIRONMENTS ==================== */}
      {activeTab === 'environments' && activeEnv && (
        <div className="dev-editor-body">
          <aside className="dev-sidebar">
            <div className="dev-sidebar-top">
              <button
                type="button"
                className="dev-btn dev-btn-add"
                onClick={handleAddNewEnv}
              >
                + Add Battle Environment
              </button>
            </div>
            <div className="dev-item-list">
              {environmentsList.map((env, idx) => (
                <button
                  key={`${env.id}_${idx}`}
                  type="button"
                  className={`dev-list-item ${
                    idx === selectedEnvIdx ? 'dev-list-item-active' : ''
                  }`}
                  onClick={() => setSelectedEnvIdx(idx)}
                >
                  {env.art.spriteUrl && (
                    <img src={env.art.spriteUrl} alt="" className="dev-list-thumb" />
                  )}
                  <div className="dev-list-meta">
                    <div className="dev-list-title">{env.name}</div>
                    <div className="dev-list-sub">{env.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="dev-detail-pane" ref={detailPaneRef}>
            <div className="dev-section-header">
              <h2>
                ✏️ Editing Environment #{selectedEnvIdx + 1} of {environmentsList.length}:{' '}
                <span style={{ color: '#bc5215' }}>{activeEnv.name}</span>
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={selectedEnvIdx <= 0}
                  onClick={() => setSelectedEnvIdx((i) => Math.max(0, i - 1))}
                >
                  ◀ Prev Environment
                </button>
                <button
                  type="button"
                  className="dev-btn dev-btn-secondary"
                  disabled={selectedEnvIdx >= environmentsList.length - 1}
                  onClick={() =>
                    setSelectedEnvIdx((i) => Math.min(environmentsList.length - 1, i + 1))
                  }
                >
                  Next Environment ▶
                </button>
              </div>
            </div>
            <div className="dev-hero-panel">
              <div className="dev-sprite-preview-box">
                {activeEnv.art.spriteUrl && (
                  <img
                    src={activeEnv.art.spriteUrl}
                    alt={activeEnv.name}
                    className="dev-sprite-big"
                  />
                )}
                <button
                  type="button"
                  className="dev-btn dev-btn-primary"
                  onClick={() =>
                    openSpritePicker((url) =>
                      updateActiveEnv((env) => ({
                        ...env,
                        art: { ...env.art, spriteUrl: url },
                      }))
                    )
                  }
                >
                  🖼️ Choose Environment Icon...
                </button>
              </div>

              <div className="dev-fields-grid">
                <label className="dev-field">
                  <span>Environment ID</span>
                  <input
                    type="text"
                    value={activeEnv.id}
                    onChange={(e) =>
                      updateActiveEnv((env) => ({ ...env, id: e.target.value }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Display Name</span>
                  <input
                    type="text"
                    value={activeEnv.name}
                    onChange={(e) =>
                      updateActiveEnv((env) => ({ ...env, name: e.target.value }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Accent Color</span>
                  <input
                    type="text"
                    value={activeEnv.accentColor}
                    onChange={(e) =>
                      updateActiveEnv((env) => ({
                        ...env,
                        accentColor: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Arena Background Tint (CSS rgba/hex)</span>
                  <input
                    type="text"
                    value={activeEnv.backgroundTint}
                    onChange={(e) =>
                      updateActiveEnv((env) => ({
                        ...env,
                        backgroundTint: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Spawn Weight</span>
                  <input
                    type="number"
                    value={activeEnv.weight ?? 10}
                    onChange={(e) =>
                      updateActiveEnv((env) => ({
                        ...env,
                        weight: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            <section className="dev-section-card">
              <h3>Rule Description & Symmetrical Player/Enemy Modifiers</h3>
              <label className="dev-field" style={{ marginBottom: 14 }}>
                <span>Rule Banner Description (Shown in Battle)</span>
                <input
                  type="text"
                  value={activeEnv.description}
                  onChange={(e) =>
                    updateActiveEnv((env) => ({ ...env, description: e.target.value }))
                  }
                />
              </label>

              <div className="dev-fields-grid">
                <label className="dev-field">
                  <span>Ward / Block Bonus (Player & Enemies)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.wardBonus ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          wardBonus: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>Player Energy Bonus Per Turn (+⚡)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.energyBonus ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          energyBonus: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>Enemy Tempo / Attack Damage Bonus</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.enemyDamageBonus ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          enemyDamageBonus: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>Status Effect Bonus Stacks (Player & Enemies)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.statusBonus ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          statusBonus: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>All Attack Damage Bonus (Player & Enemies)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.damageBonus ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          damageBonus: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>All Healing Bonus (Player & Enemies)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.healBonus ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          healBonus: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>Turn-Start Ward to ALL (Player & Enemies)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.turnStartWardAll ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          turnStartWardAll: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>

                <label className="dev-field">
                  <span>Turn-End Ink Burn to ALL (Player & Enemies)</span>
                  <input
                    type="number"
                    value={activeEnv.modifiers.turnEndInkBurnAll ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveEnv((env) => ({
                        ...env,
                        modifiers: {
                          ...env.modifiers,
                          turnEndInkBurnAll: val !== 0 ? val : undefined,
                        },
                      }));
                    }}
                  />
                </label>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ==================== TAB 5: MYSTERY EVENTS ==================== */}
      {activeTab === 'events' && activeEvent && (
        <div className="dev-editor-body">
          <aside className="dev-sidebar">
            <div className="dev-sidebar-top">
              <button
                type="button"
                className="dev-btn dev-btn-add"
                onClick={handleAddNewEvent}
              >
                + Add Mystery Event
              </button>
            </div>
            <div className="dev-item-list">
              {eventsList.map((ev, idx) => (
                <button
                  key={`${ev.id}_${idx}`}
                  type="button"
                  className={`dev-list-item ${
                    idx === selectedEventIdx ? 'dev-list-item-active' : ''
                  }`}
                  onClick={() => setSelectedEventIdx(idx)}
                >
                  <div className="dev-list-meta">
                    <div className="dev-list-title">
                      {ev.title}
                      <span
                        style={{
                          fontSize: '0.74rem',
                          opacity: 0.65,
                          fontWeight: 600,
                          marginLeft: '6px',
                        }}
                      >
                        ({ev.choices.length} choices)
                      </span>
                    </div>
                    <div className="dev-list-sub">
                      {ev.narrative || `${ev.id} · ${ev.choices.length} choices`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="dev-detail-pane" ref={detailPaneRef}>
            <div className="dev-section-header">
              <h2>
                ✏️ Editing Mystery Event #{selectedEventIdx + 1} of {eventsList.length}:{' '}
                <span style={{ color: '#bc5215' }}>{activeEvent.title}</span>
              </h2>
            </div>
            <section className="dev-section-card">
              <div className="dev-fields-grid">
                <label className="dev-field">
                  <span>Event ID</span>
                  <input
                    type="text"
                    value={activeEvent.id}
                    onChange={(e) =>
                      updateActiveEvent((ev) => ({ ...ev, id: e.target.value }))
                    }
                  />
                </label>
                <label className="dev-field">
                  <span>Event Title</span>
                  <input
                    type="text"
                    value={activeEvent.title}
                    onChange={(e) =>
                      updateActiveEvent((ev) => ({ ...ev, title: e.target.value }))
                    }
                  />
                </label>
              </div>
              <label className="dev-field" style={{ marginTop: 10 }}>
                <span>Narrative Text</span>
                <textarea
                  rows={3}
                  value={activeEvent.narrative}
                  onChange={(e) =>
                    updateActiveEvent((ev) => ({ ...ev, narrative: e.target.value }))
                  }
                />
              </label>
            </section>

            <section className="dev-section-card">
              <h3>Event Choices ({activeEvent.choices.length})</h3>
              {activeEvent.choices.map((ch: MysteryChoice, cIdx: number) => (
                <div key={cIdx} className="dev-subcard">
                  <div className="dev-three-col">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <label key={diff} className="dev-field">
                        <span>{diff.toUpperCase()} Phrase</span>
                        <input
                          type="text"
                          value={ch.phrases[diff]}
                          onChange={(e) => {
                            const next = [...activeEvent.choices];
                            next[cIdx] = {
                              ...ch,
                              phrases: { ...ch.phrases, [diff]: e.target.value },
                            };
                            updateActiveEvent((ev) => ({ ...ev, choices: next }));
                          }}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="dev-fields-grid" style={{ marginTop: 8 }}>
                    <label className="dev-field">
                      <span>Success Chance % (Leave 100 for guaranteed)</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={ch.chance ?? 100}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const next = [...activeEvent.choices];
                          next[cIdx] = {
                            ...ch,
                            chance: val < 100 ? val : undefined,
                          };
                          updateActiveEvent((ev) => ({ ...ev, choices: next }));
                        }}
                      />
                    </label>
                    <label className="dev-field">
                      <span>HP Change</span>
                      <input
                        type="number"
                        value={ch.effects.hpChange ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const next = [...activeEvent.choices];
                          next[cIdx] = {
                            ...ch,
                            effects: {
                              ...ch.effects,
                              hpChange: val !== 0 ? val : undefined,
                            },
                          };
                          updateActiveEvent((ev) => ({ ...ev, choices: next }));
                        }}
                      />
                    </label>
                    <label className="dev-field">
                      <span>Gold Change</span>
                      <input
                        type="number"
                        value={ch.effects.goldChange ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const next = [...activeEvent.choices];
                          next[cIdx] = {
                            ...ch,
                            effects: {
                              ...ch.effects,
                              goldChange: val !== 0 ? val : undefined,
                            },
                          };
                          updateActiveEvent((ev) => ({ ...ev, choices: next }));
                        }}
                      />
                    </label>
                  </div>
                  <label className="dev-field" style={{ marginTop: 8 }}>
                    <span>Outcome Text</span>
                    <input
                      type="text"
                      value={ch.outcomeText}
                      onChange={(e) => {
                        const next = [...activeEvent.choices];
                        next[cIdx] = { ...ch, outcomeText: e.target.value };
                        updateActiveEvent((ev) => ({ ...ev, choices: next }));
                      }}
                    />
                  </label>
                </div>
              ))}
            </section>
          </main>
        </div>
      )}

      {/* ==================== TAB 6: MAP PHRASES ==================== */}
      {activeTab === 'map_phrases' && (
        <div className="dev-editor-body">
          <main className="dev-detail-pane" style={{ width: '100%' }}>
            <section className="dev-section-card">
              <h3>Map Destination Phrase Pools</h3>
              {(
                [
                  'battle',
                  'elite',
                  'campfire',
                  'merchant',
                  'treasure',
                  'mystery',
                  'boss',
                ] as MapNodeType[]
              ).map((nType) => (
                <div key={nType} className="dev-subcard">
                  <h4>{nType.toUpperCase()} Destinations</h4>
                  <div className="dev-three-col">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <label key={diff} className="dev-field">
                        <span>{diff.toUpperCase()} (One per line)</span>
                        <textarea
                          rows={5}
                          value={(mapPhrases.destinations[nType]?.[diff] || []).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            setMapPhrases((prev) => ({
                              ...prev,
                              destinations: {
                                ...prev.destinations,
                                [nType]: {
                                  ...prev.destinations[nType],
                                  [diff]: lines,
                                },
                              },
                            }));
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </main>
        </div>
      )}

      {/* ==================== TAB 7: SOUNDS & AUDIO STUDIO ==================== */}
      {activeTab === 'sounds' && (
        <div className="dev-editor-body dev-sound-studio">
          <main className="dev-detail-pane" style={{ width: '100%' }}>
            {/* Top Toolbar Card */}
            <section className="dev-section-card dev-sound-toolbar-card">
              <div className="dev-sound-toolbar-header">
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <span>🔊 Arcane Sound & SFX Studio</span>
                    <span className="dev-badge-count">{SOUND_CATALOG.length} Sounds</span>
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Listen to every sound effect, test layered audio, and edit card sound assignments in real-time.
                  </p>
                </div>
                {/* Sub-tab Switcher */}
                <div className="dev-sound-subtabs">
                  <button
                    type="button"
                    className={`dev-btn ${soundSubTab === 'library' ? 'dev-btn-active' : ''}`}
                    onClick={() => setSoundSubTab('library')}
                  >
                    🎵 Soundboard Library ({SOUND_CATALOG.length})
                  </button>
                  <button
                    type="button"
                    className={`dev-btn ${soundSubTab === 'assignments' ? 'dev-btn-active' : ''}`}
                    onClick={() => setSoundSubTab('assignments')}
                  >
                    🃏 Card SFX Assignments ({cardsList.length})
                  </button>
                  <button
                    type="button"
                    className={`dev-btn ${soundSubTab === 'global' ? 'dev-btn-active' : ''}`}
                    onClick={() => setSoundSubTab('global')}
                  >
                    ⚙️ Global Audio Profiles
                  </button>
                </div>
              </div>

              {/* Filters row for library & assignments */}
              {soundSubTab === 'library' && (
                <div className="dev-sound-filter-row">
                  <input
                    type="text"
                    className="dev-search-input"
                    placeholder="Search sounds by label, path, category, or description (e.g. blade, fire, curse, roar, metal, book)..."
                    value={soundSearchQuery}
                    onChange={(e) => setSoundSearchQuery(e.target.value)}
                  />
                  <div className="dev-sound-cat-pills">
                    <button
                      type="button"
                      className={`dev-pack-pill ${soundCategoryFilter === 'all' ? 'dev-pack-pill-active' : ''}`}
                      onClick={() => setSoundCategoryFilter('all')}
                    >
                      All ({SOUND_CATALOG.length})
                    </button>
                    {SOUND_CATEGORIES.map((cat) => {
                      const count = SOUND_CATALOG.filter((s) => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={`dev-pack-pill ${soundCategoryFilter === cat ? 'dev-pack-pill-active' : ''}`}
                          onClick={() => setSoundCategoryFilter(cat)}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {soundSubTab === 'assignments' && (
                <div className="dev-sound-filter-row">
                  <input
                    type="text"
                    className="dev-search-input"
                    placeholder="Search cards by name or ID (e.g. Ink Strike, Vellum Coat, Smudge, Binding)..."
                    value={soundSearchQuery}
                    onChange={(e) => setSoundSearchQuery(e.target.value)}
                  />
                  <div className="dev-sound-cat-pills">
                    {['all', 'attack', 'defence', 'skill', 'power', 'debuff'].map((cat) => {
                      const count =
                        cat === 'all'
                          ? cardsList.length
                          : cardsList.filter((c) => getCardVisualCategory(c as any) === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={`dev-pack-pill ${cardSoundFilter === cat ? 'dev-pack-pill-active' : ''}`}
                          onClick={() => setCardSoundFilter(cat)}
                        >
                          {cat.toUpperCase()} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* SUB-VIEW 1: SOUNDBOARD LIBRARY */}
            {soundSubTab === 'library' && (() => {
              const q = soundSearchQuery.toLowerCase().trim();
              const filteredSounds = SOUND_CATALOG.filter((s) => {
                if (soundCategoryFilter !== 'all' && s.category !== soundCategoryFilter) return false;
                if (!q) return true;
                return (
                  s.label.toLowerCase().includes(q) ||
                  s.id.toLowerCase().includes(q) ||
                  s.category.toLowerCase().includes(q) ||
                  s.description.toLowerCase().includes(q)
                );
              });

              return (
                <div className="dev-sound-grid">
                  {filteredSounds.map((snd) => {
                    const cardsUsing = cardsList.filter(
                      (c) => (c.sfx || soundEngine.getCardSfx(c.id)) === snd.id
                    );
                    const isPlaying = playingSoundId === snd.id;

                    return (
                      <div
                        key={snd.id}
                        className={`dev-sound-card ${isPlaying ? 'is-playing' : ''}`}
                      >
                        <div>
                          <div className="dev-sound-card-header">
                            <div>
                              <div className="dev-sound-card-title">{snd.label}</div>
                              <span className="dev-sound-cat-badge">{snd.category}</span>
                            </div>
                            <button
                              type="button"
                              className="dev-btn dev-btn-primary"
                              style={{
                                padding: '6px 14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                setPlayingSoundId(snd.id);
                                soundEngine.playAudition(snd.id);
                                window.setTimeout(() => {
                                  setPlayingSoundId((curr) => (curr === snd.id ? null : curr));
                                }, 1200);
                              }}
                              title={`Play ${snd.label}`}
                            >
                              {isPlaying ? '🔊 Playing...' : '▶ Listen'}
                            </button>
                          </div>
                          <div style={{ marginTop: 6, fontSize: '0.80rem', color: '#475569' }}>
                            {snd.description}
                          </div>
                        </div>

                        <div>
                          <div style={{ marginBottom: 6 }}>
                            <span className="dev-sound-path-code">{snd.id}</span>
                          </div>
                          <div className="dev-sound-used-by">
                            <span>Used by {cardsUsing.length} card{cardsUsing.length === 1 ? '' : 's'}:</span>
                            {cardsUsing.length > 0 ? (
                              cardsUsing.slice(0, 4).map((c) => (
                                <span key={c.id} className="dev-sound-card-chip">
                                  {c.names.easy || c.id}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>None</span>
                            )}
                            {cardsUsing.length > 4 && (
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                +{cardsUsing.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* SUB-VIEW 2: CARD SFX ASSIGNMENTS */}
            {soundSubTab === 'assignments' && (() => {
              const q = soundSearchQuery.toLowerCase().trim();
              const filteredCards = cardsList.filter((card) => {
                const cat = getCardVisualCategory(card as any);
                if (cardSoundFilter !== 'all' && cat !== cardSoundFilter) return false;
                if (!q) return true;
                const nameEasy = card.names.easy.toLowerCase();
                const nameMed = (card.names.medium || '').toLowerCase();
                const nameHard = (card.names.hard || '').toLowerCase();
                const sfx = (card.sfx || soundEngine.getCardSfx(card.id) || '').toLowerCase();
                return (
                  nameEasy.includes(q) ||
                  nameMed.includes(q) ||
                  nameHard.includes(q) ||
                  card.id.toLowerCase().includes(q) ||
                  sfx.includes(q)
                );
              });

              return (
                <section className="dev-section-card" style={{ marginTop: 12 }}>
                  <div className="dev-sound-table-wrap">
                    <table className="dev-sound-table">
                      <thead>
                        <tr>
                          <th>Card</th>
                          <th>Category & Cost</th>
                          <th>Rarity</th>
                          <th>Assigned Sound Effect</th>
                          <th>Audition & Test</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCards.map((card) => {
                          const cat = getCardVisualCategory(card as any);
                          const currentSfx = card.sfx || soundEngine.getCardSfx(card.id) || 'cards/blade_01.ogg';
                          const isPlaying = playingSoundId === `card_${card.id}`;

                          return (
                            <tr key={card.id}>
                              <td>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{card.names.easy}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                                  {card.id}
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    background: '#e2e8f0',
                                    color: '#1e293b',
                                    marginRight: 6,
                                  }}
                                >
                                  {cat.toUpperCase()}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                                  {card.xCost ? 'X⚡' : `${card.cost}⚡`}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    textTransform: 'uppercase',
                                    background:
                                      card.rarity === 'rare'
                                        ? '#fef08a'
                                        : card.rarity === 'uncommon'
                                        ? '#bae6fd'
                                        : '#e2e8f0',
                                    color:
                                      card.rarity === 'rare'
                                        ? '#713f12'
                                        : card.rarity === 'uncommon'
                                        ? '#0369a1'
                                        : '#334155',
                                  }}
                                >
                                  {card.rarity}
                                </span>
                              </td>
                              <td>
                                <select
                                  style={{
                                    width: '100%',
                                    maxWidth: 360,
                                    padding: '5px 8px',
                                    fontSize: '0.82rem',
                                    borderRadius: 6,
                                  }}
                                  value={currentSfx}
                                  onChange={(e) => {
                                    const newSfx = e.target.value;
                                    setCardsList((prev) =>
                                      prev.map((c) => (c.id === card.id ? { ...c, sfx: newSfx } : c))
                                    );
                                    soundEngine.updateCardSfx(card.id, newSfx);
                                  }}
                                >
                                  {SOUND_CATEGORIES.filter((cCat) => cCat !== 'UI & Combat Global').map((cCat) => (
                                    <optgroup key={cCat} label={cCat}>
                                      {SOUND_CATALOG.filter((s) => s.category === cCat).map((s) => (
                                        <option key={s.id} value={s.id}>
                                          {s.label} ({s.id})
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="dev-btn dev-btn-primary"
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.80rem',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => {
                                    setPlayingSoundId(`card_${card.id}`);
                                    soundEngine.playCardSound(
                                      card.id,
                                      { volume: 0.85, muted: false, typingSound: 'mechanical_typewriter', confirmSound: 'carriage_bell', highContrast: false },
                                      currentSfx
                                    );
                                    window.setTimeout(() => {
                                      setPlayingSoundId((curr) => (curr === `card_${card.id}` ? null : curr));
                                    }, 1200);
                                  }}
                                >
                                  {isPlaying ? '🔊 Testing...' : '▶ Listen'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })()}

            {/* SUB-VIEW 3: GLOBAL AUDIO PROFILES */}
            {soundSubTab === 'global' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                {/* Typing sound profiles */}
                <section className="dev-section-card">
                  <h4 style={{ margin: 0, color: '#0f172a' }}>⌨️ Typing Sound Profiles</h4>
                  <p style={{ margin: '4px 0 10px', fontSize: '0.82rem', color: '#64748b' }}>
                    Interactive sound effects triggered with each keystroke as the player types.
                  </p>
                  <div className="dev-sound-grid">
                    {[
                      { id: 'typewriter', label: 'Mechanical Typewriter', desc: 'Crisp striker keystroke click and physical carriage tap.' },
                      { id: 'telegraph', label: 'Vintage Telegraph', desc: 'Rapid electronic telegraph sound with sharp square-wave tone.' },
                      { id: 'quill', label: 'Arcane Quill', desc: 'Textured parchment scraping quill pen sound.' },
                      { id: 'chalk', label: 'Soft Chalk', desc: 'Muffled gentle blackboard slate tapping sound.' },
                    ].map((item) => (
                      <div key={item.id} className="dev-sound-card">
                        <div>
                          <div className="dev-sound-card-title">{item.label}</div>
                          <div style={{ fontSize: '0.80rem', color: '#475569', marginTop: 4 }}>{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          className="dev-btn dev-btn-primary"
                          style={{ padding: '6px 14px', alignSelf: 'flex-start', cursor: 'pointer' }}
                          onClick={() => soundEngine.playAudition(item.id)}
                        >
                          ▶ Listen Sample
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Confirmations & Chimes */}
                <section className="dev-section-card">
                  <h4 style={{ margin: 0, color: '#0f172a' }}>🔔 Confirmations & Bell Chimes</h4>
                  <p style={{ margin: '4px 0 10px', fontSize: '0.82rem', color: '#64748b' }}>
                    Audio played when pressing Enter to confirm selections and play cards.
                  </p>
                  <div className="dev-sound-grid">
                    {[
                      { id: 'carriage_bell', label: 'Carriage Bell', desc: 'Classic mechanical typewriter return bell chime.' },
                      { id: 'spell_chime', label: 'Spell Harmonizer Chime', desc: 'Resonant crystalline arcane bell frequency.' },
                      { id: 'heavy_stamp', label: 'Heavy Wax Seal Stamp', desc: 'Deep brass stamp reverberation with low sub-punch.' },
                    ].map((item) => (
                      <div key={item.id} className="dev-sound-card">
                        <div>
                          <div className="dev-sound-card-title">{item.label}</div>
                          <div style={{ fontSize: '0.80rem', color: '#475569', marginTop: 4 }}>{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          className="dev-btn dev-btn-primary"
                          style={{ padding: '6px 14px', alignSelf: 'flex-start', cursor: 'pointer' }}
                          onClick={() => soundEngine.playAudition(item.id)}
                        >
                          ▶ Listen Chime
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Combat & Gameplay SFX */}
                <section className="dev-section-card">
                  <h4 style={{ margin: 0, color: '#0f172a' }}>⚔️ Combat & Stage SFX</h4>
                  <p style={{ margin: '4px 0 10px', fontSize: '0.82rem', color: '#64748b' }}>
                    Engine sound effects for battle collisions, chance wheel, card drawing, and book navigation.
                  </p>
                  <div className="dev-sound-grid">
                    {[
                      { id: 'wheel_tick', label: 'Chance Wheel Flapper Tick', desc: 'Crisp mechanical tick as pointer strikes wheel knobs.' },
                      { id: 'attack_hit.ogg', label: 'Combat Direct Hit', desc: 'Punchy melee combat impact on monster body.' },
                      { id: 'ward_block.ogg', label: 'Ward Rune Deflect', desc: 'Firm protective ward rune shield block.' },
                      { id: 'draw.wav', label: 'Card Draw', desc: 'Snappy card draw flick from the library deck.' },
                      { id: 'play_card.wav', label: 'Card Cast Flick', desc: 'Tactile physical card flick onto the table.' },
                      { id: 'shuffle.wav', label: 'Deck Shuffle', desc: 'Full card deck riffle and cut shuffle.' },
                      { id: 'burn_card.mp3', label: 'Burn Draft / Exhaust', desc: 'Paper ash burning dissolve sound.' },
                      { id: 'page_turn.mp3', label: 'Codex Page Turn', desc: 'Gentle parchment codex page turn.' },
                      { id: 'map_open.mp3', label: 'Map Parchment Unroll', desc: 'Heavy ancient navigation map unrolling.' },
                      { id: 'road_choose.mp3', label: 'Dungeon Footstep', desc: 'Firm boot step along dungeon road.' },
                    ].map((item) => (
                      <div key={item.id} className="dev-sound-card">
                        <div>
                          <div className="dev-sound-card-title">{item.label}</div>
                          <div style={{ fontSize: '0.80rem', color: '#475569', marginTop: 4 }}>{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          className="dev-btn dev-btn-primary"
                          style={{ padding: '6px 14px', alignSelf: 'flex-start', cursor: 'pointer' }}
                          onClick={() => soundEngine.playAudition(item.id)}
                        >
                          ▶ Listen SFX
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ==================== VISUAL SPRITE PICKER MODAL ==================== */}
      {spritePickerOpen && (
        <div className="dev-sprite-modal-backdrop">
          <div className="dev-sprite-modal">
            <div className="dev-sprite-modal-header">
              <h3>🖼️ Choose Sprite from Installed Packs ({filteredSprites.length} shown)</h3>
              <button
                type="button"
                className="dev-btn dev-btn-close"
                onClick={() => setSpritePickerOpen(false)}
              >
                ✕ Close
              </button>
            </div>

            <div className="dev-sprite-modal-filters">
              <div className="dev-pack-pills">
                {availablePacks.map((packName) => (
                  <button
                    key={packName}
                    type="button"
                    className={`dev-pack-pill ${
                      spritePackFilter === packName ? 'dev-pack-pill-active' : ''
                    }`}
                    onClick={() => setSpritePackFilter(packName)}
                  >
                    {packName}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="dev-search-input"
                placeholder="Filter sprites by name (e.g. goblin, golem, dragon, sword, ring, tree, wizard)..."
                value={spriteSearch}
                onChange={(e) => setSpriteSearch(e.target.value)}
              />
            </div>

            <div className="dev-sprite-grid">
              {filteredSprites.map((sp) => (
                <button
                  key={sp.url}
                  type="button"
                  className="dev-sprite-tile"
                  onClick={() => {
                    if (onSpriteChosenCallback) {
                      onSpriteChosenCallback(sp.url);
                    }
                    setSpritePickerOpen(false);
                  }}
                >
                  <img src={sp.url} alt={sp.name} className="dev-sprite-tile-img" />
                  <span className="dev-sprite-tile-name">{sp.name}</span>
                  <span className="dev-sprite-tile-pack">{sp.pack}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
