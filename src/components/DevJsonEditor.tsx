import React, { useEffect, useMemo, useState } from 'react';
import type {
  BattleEnvironmentDefinition,
  CardDefinition,
  CardEffect,
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
  ENEMIES_CATALOG,
  ENVIRONMENTS_CATALOG,
  EVENTS_CATALOG,
  MAP_PHRASES,
  RELICS_CATALOG,
} from '../utils/gameContent';

export interface SpriteManifestEntry {
  id: string;
  name: string;
  pack: string;
  url: string;
}

type EditorTab = 'enemies' | 'cards' | 'relics' | 'environments' | 'events' | 'map_phrases';

interface DevJsonEditorProps {
  onClose: () => void;
}

const ALL_EFFECT_TYPES: EffectType[] = [
  'damage',
  'ward',
  'bold',
  'faded',
  'exposed',
  'ink_burn',
  'draw',
  'energy',
  'heal',
  'self_damage',
  'damage_per_ward',
  'double_ward',
  'double_ink_burn',
  'gain_ward_per_card_in_hand',
  'power_ward_each_turn',
  'power_bold_each_turn',
  'power_draw_each_turn',
  'power_energy_each_turn',
  'power_heal_each_turn',
  'power_ink_burn_all_each_turn',
  'power_damage_all_each_turn',
  'power_ward_on_card_play',
  'power_damage_all_on_attack',
];

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

  // Sync in-memory catalog arrays so changes immediately reflect in the game without page reload
  const syncLiveCatalogs = () => {
    ENEMIES_CATALOG.splice(0, ENEMIES_CATALOG.length, ...enemiesList);
    CARDS_CATALOG.splice(0, CARDS_CATALOG.length, ...cardsList);
    RELICS_CATALOG.splice(0, RELICS_CATALOG.length, ...relicsList);
    ENVIRONMENTS_CATALOG.splice(0, ENVIRONMENTS_CATALOG.length, ...environmentsList);
    EVENTS_CATALOG.splice(0, EVENTS_CATALOG.length, ...eventsList);
    Object.assign(MAP_PHRASES, mapPhrases);
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
    }
  };

  const handleSaveCurrentTabToDisk = async () => {
    syncLiveCatalogs();
    const { fileName, data } = getTabPayload(activeTab);
    try {
      const res = await fetch('/__dev_api/save-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, data }),
      });
      if (res.ok) {
        setSaveBanner({
          text: `Saved src/data/${fileName} to disk & updated live game catalogs!`,
        });
      } else {
        setSaveBanner({
          text: `Updated live in-game catalogs! (Running on static host — click 'Download JSON' to save ${fileName})`,
          isError: true,
        });
      }
    } catch {
      setSaveBanner({
        text: `Updated live in-game catalogs! (Click 'Download JSON' to save ${fileName} file)`,
        isError: true,
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
        text: `Saved all 6 JSON files (enemies, cards, relics, environments, events, map_phrases) to src/data/!`,
      });
    } else {
      setSaveBanner({
        text: `Applied all edits to the live game session!`,
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
          <button
            type="button"
            className="dev-btn dev-btn-primary"
            onClick={handleSaveCurrentTabToDisk}
          >
            💾 Save {activeTab}.json to Disk
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-success"
            onClick={handleSaveAllTabsToDisk}
          >
            💾 Save ALL Tabs
          </button>
          <button
            type="button"
            className="dev-btn dev-btn-secondary"
            onClick={handleDownloadCurrentJson}
          >
            ⬇️ Download .json
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
                      </div>
                      <div className="dev-list-sub">
                        {en.id} · {en.faction} · T{en.tier} ({en.minHp}-{en.maxHp} HP)
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="dev-detail-pane">
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
                        {
                          id: `move_${en.moves.length + 1}`,
                          name: 'New Attack',
                          intent: 'attack',
                          weight: 50,
                          damage: 6,
                        },
                      ],
                    }))
                  }
                >
                  + Add Move
                </button>
              </div>

              <div className="dev-moves-list">
                {activeEnemy.moves.map((mv: EnemyMove, mIdx: number) => (
                  <div key={mIdx} className="dev-subcard">
                    <div className="dev-fields-grid">
                      <label className="dev-field">
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
                      <label className="dev-field">
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
                      <label className="dev-field">
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
                      <label className="dev-field">
                        <span>Damage</span>
                        <input
                          type="number"
                          value={mv.damage ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextMoves = [...activeEnemy.moves];
                            nextMoves[mIdx] = {
                              ...mv,
                              damage: val > 0 ? val : undefined,
                            };
                            updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                          }}
                        />
                      </label>
                      <label className="dev-field">
                        <span>Hits</span>
                        <input
                          type="number"
                          value={mv.hits ?? 1}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextMoves = [...activeEnemy.moves];
                            nextMoves[mIdx] = {
                              ...mv,
                              hits: val > 1 ? val : undefined,
                            };
                            updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                          }}
                        />
                      </label>
                      <label className="dev-field">
                        <span>Ward (Block)</span>
                        <input
                          type="number"
                          value={mv.ward ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextMoves = [...activeEnemy.moves];
                            nextMoves[mIdx] = {
                              ...mv,
                              ward: val > 0 ? val : undefined,
                            };
                            updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                          }}
                        />
                      </label>
                      <label className="dev-field">
                        <span>Heal</span>
                        <input
                          type="number"
                          value={mv.heal ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextMoves = [...activeEnemy.moves];
                            nextMoves[mIdx] = {
                              ...mv,
                              heal: val > 0 ? val : undefined,
                            };
                            updateActiveEnemy((en) => ({ ...en, moves: nextMoves }));
                          }}
                        />
                      </label>
                      {activeEnemy.moves.length > 1 && (
                        <div className="dev-field">
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
                  </div>
                ))}
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
              {cardsList.map((c, idx) => {
                const q = searchQuery.toLowerCase();
                const matches =
                  !q ||
                  c.id.toLowerCase().includes(q) ||
                  c.names.easy.toLowerCase().includes(q) ||
                  c.names.medium.toLowerCase().includes(q) ||
                  c.description.toLowerCase().includes(q);
                if (!matches) return null;
                return (
                  <button
                    key={`${c.id}_${idx}`}
                    type="button"
                    className={`dev-list-item ${
                      idx === selectedCardIdx ? 'dev-list-item-active' : ''
                    }`}
                    onClick={() => setSelectedCardIdx(idx)}
                  >
                    {c.art.spriteUrl && (
                      <img src={c.art.spriteUrl} alt="" className="dev-list-thumb" />
                    )}
                    <div className="dev-list-meta">
                      <div className="dev-list-title">
                        {c.names.easy} ({c.cost}⚡)
                      </div>
                      <div className="dev-list-sub">
                        {c.rarity} · {c.type} · {c.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="dev-detail-pane">
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
                    checked={Boolean(activeCard.burnDraft)}
                    onChange={(e) =>
                      updateActiveCard((c) => ({ ...c, burnDraft: e.target.checked }))
                    }
                  />
                  Once Per Combat (Burn Draft)
                </label>
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
                <span>Card Description</span>
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
                <button
                  type="button"
                  className="dev-btn-mini"
                  onClick={() =>
                    updateActiveCard((c) => ({
                      ...c,
                      effects: [...c.effects, { type: 'damage', amount: 5 }],
                    }))
                  }
                >
                  + Add Effect
                </button>
              </div>
              {activeCard.effects.map((eff: CardEffect, eIdx: number) => (
                <div key={eIdx} className="dev-subcard dev-fields-grid">
                  <label className="dev-field">
                    <span>Effect Type</span>
                    <select
                      value={eff.type}
                      onChange={(e) => {
                        const next = [...activeCard.effects];
                        next[eIdx] = { ...eff, type: e.target.value as EffectType };
                        updateActiveCard((c) => ({ ...c, effects: next }));
                      }}
                    >
                      {ALL_EFFECT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
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
                    <span>Hits (Optional)</span>
                    <input
                      type="number"
                      value={eff.hits ?? 1}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const next = [...activeCard.effects];
                        next[eIdx] = { ...eff, hits: val > 1 ? val : undefined };
                        updateActiveCard((c) => ({ ...c, effects: next }));
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="dev-btn dev-btn-danger"
                    onClick={() => {
                      const next = activeCard.effects.filter((_, i) => i !== eIdx);
                      updateActiveCard((c) => ({ ...c, effects: next }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
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
                      value={activeCard.upgrade.names[diff]}
                      onChange={(e) =>
                        updateActiveCard((c) => ({
                          ...c,
                          upgrade: {
                            ...c.upgrade,
                            names: { ...c.upgrade.names, [diff]: e.target.value },
                          },
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="dev-field" style={{ marginTop: 10 }}>
                <span>Upgraded Description</span>
                <input
                  type="text"
                  value={activeCard.upgrade.description}
                  onChange={(e) =>
                    updateActiveCard((c) => ({
                      ...c,
                      upgrade: { ...c.upgrade, description: e.target.value },
                    }))
                  }
                />
              </label>
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
                      <div className="dev-list-title">{r.names.easy}</div>
                      <div className="dev-list-sub">
                        {r.rarity} · {r.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="dev-detail-pane">
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

          <main className="dev-detail-pane">
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
                    <div className="dev-list-title">{ev.title}</div>
                    <div className="dev-list-sub">
                      {ev.id} · {ev.choices.length} choices
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="dev-detail-pane">
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
