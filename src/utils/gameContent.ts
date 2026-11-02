import type {
  ActiveEnemy,
  BattleEnvironmentDefinition,
  CardDefinition,
  CardEffect,
  CardInstance,
  DifficultyStrings,
  EnemyBehaviorCondition,
  EnemyDefinition,
  EnemyFaction,
  EnemyMove,
  MapNode,
  MapNodeType,
  MapPhrasesCatalog,
  MysteryEventDefinition,
  PhraseDifficulty,
  RelicDefinition,
} from '../types/game';
import cardsRaw from '../data/cards.json';
import enemiesRaw from '../data/enemies.json';
import relicsRaw from '../data/relics.json';
import eventsRaw from '../data/events.json';
import environmentsRaw from '../data/environments.json';
import mapPhrasesRaw from '../data/map_phrases.json';
import { cleanCardDescriptionForPlay } from './textHighlight';

const CATALOG_SESSION_VERSION = 'v3_cost_sort_and_tiles';

/**
 * Loads a catalog from sessionStorage if present (retaining user edits during the current browser session),
 * otherwise falling back to the raw JSON file bundled with the build.
 */
function loadCatalogFromSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.sessionStorage) return fallback;
  try {
    const version = window.sessionStorage.getItem('typemancer_session_version');
    if (version !== CATALOG_SESSION_VERSION) {
      clearSessionCatalogs();
      window.sessionStorage.setItem('typemancer_session_version', CATALOG_SESSION_VERSION);
      return fallback;
    }
    const raw = window.sessionStorage.getItem(`typemancer_session_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback) && Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T;
      }
      if (!Array.isArray(fallback) && parsed && typeof parsed === 'object') {
        return parsed as T;
      }
    }
  } catch (e) {
    console.warn(`Failed to read sessionStorage for ${key}:`, e);
  }
  return fallback;
}

export function saveCatalogToSession(key: string, data: unknown): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(`typemancer_session_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to write sessionStorage for ${key}:`, e);
  }
}

export function clearSessionCatalogs(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem('typemancer_session_cards');
    window.sessionStorage.removeItem('typemancer_session_enemies');
    window.sessionStorage.removeItem('typemancer_session_relics');
    window.sessionStorage.removeItem('typemancer_session_events');
    window.sessionStorage.removeItem('typemancer_session_environments');
    window.sessionStorage.removeItem('typemancer_session_map_phrases');
  } catch (e) {
    console.warn('Failed to clear sessionStorage catalogs:', e);
  }
}

export const CARDS_CATALOG: CardDefinition[] = loadCatalogFromSession(
  'cards',
  cardsRaw as unknown as CardDefinition[]
);
export const ENEMIES_CATALOG: EnemyDefinition[] = loadCatalogFromSession(
  'enemies',
  enemiesRaw as unknown as EnemyDefinition[]
);
export const RELICS_CATALOG: RelicDefinition[] = loadCatalogFromSession(
  'relics',
  relicsRaw as unknown as RelicDefinition[]
);
export const EVENTS_CATALOG: MysteryEventDefinition[] = loadCatalogFromSession(
  'events',
  eventsRaw as unknown as MysteryEventDefinition[]
);
export const ENVIRONMENTS_CATALOG: BattleEnvironmentDefinition[] = loadCatalogFromSession(
  'environments',
  environmentsRaw as unknown as BattleEnvironmentDefinition[]
);
export const MAP_PHRASES: MapPhrasesCatalog = loadCatalogFromSession(
  'map_phrases',
  mapPhrasesRaw as unknown as MapPhrasesCatalog
);

export function chooseBattleEnvironment(floor: number): BattleEnvironmentDefinition {
  const eligible = ENVIRONMENTS_CATALOG.filter(
    (env) =>
      (env.minFloor === undefined || floor >= env.minFloor) &&
      (env.maxFloor === undefined || floor <= env.maxFloor)
  );
  const pool = eligible.length > 0 ? eligible : ENVIRONMENTS_CATALOG;
  const totalWeight = pool.reduce((sum, env) => sum + (env.weight ?? 10), 0);
  let roll = Math.random() * totalWeight;
  for (const env of pool) {
    roll -= env.weight ?? 10;
    if (roll <= 0) return env;
  }
  return pool[0];
}

let uidCounter = 1;
export function nextUid(prefix: string = 'id'): string {
  uidCounter += 1;
  return `${prefix}_${Date.now()}_${uidCounter}_${Math.floor(Math.random() * 1000)}`;
}

export function getCardDefinition(cardId: string): CardDefinition {
  const found = CARDS_CATALOG.find((c) => c.id === cardId);
  if (found) return found;
  return CARDS_CATALOG[0];
}

export function getRelicDefinition(relicId: string): RelicDefinition | undefined {
  return RELICS_CATALOG.find((r) => r.id === relicId);
}

/** Effects that must land on an enemy (never on the player). */
const ENEMY_DIRECTED_EFFECTS: CardEffect['type'][] = [
  'damage',
  'faded',
  'exposed',
  'ink_burn',
  'double_ink_burn',
  'damage_per_ward',
];

/**
 * Safety net so a card can never be un-targetable: if a card is marked `self` but carries
 * single-target enemy effects (e.g. Ink Burn), the student targets an enemy instead.
 */
export function deriveEffectiveTarget(
  declared: CardDefinition['target'],
  effects: CardEffect[]
): CardDefinition['target'] {
  if (declared !== 'self') return declared;
  const enemyEffects = effects.filter(
    (e) => ENEMY_DIRECTED_EFFECTS.includes(e.type) && e.target !== 'self'
  );
  if (enemyEffects.length === 0) return 'self';
  return enemyEffects.every((e) => e.target === 'all_enemies') ? 'all_enemies' : 'enemy';
}

/**
 * Resolves a CardInstance into its active stats (accounting for whether it is upgraded).
 */
export function resolveCardInstance(
  instance: CardInstance,
  phraseDiff: PhraseDifficulty
): {
  instanceId: string;
  cardId: string;
  upgraded: boolean;
  name: string;
  connector: string;
  cost: number;
  xCost?: boolean;
  type: CardDefinition['type'];
  rarity: CardDefinition['rarity'];
  target: CardDefinition['target'];
  description: string;
  effects: CardEffect[];
  burnDraft: boolean;
  art: CardDefinition['art'];
  sfx?: string;
} {
  const def = getCardDefinition(instance.cardId);
  const isXCost =
    instance.upgraded && def.upgrade && def.upgrade.xCost !== undefined
      ? def.upgrade.xCost
      : Boolean(def.xCost);

  if (instance.upgraded && def.upgrade) {
    const upEffects = def.upgrade.effects || def.effects;
    return {
      instanceId: instance.instanceId,
      cardId: def.id,
      upgraded: true,
      name: def.upgrade.names[phraseDiff] || def.names[phraseDiff],
      connector:
        (def.upgrade.connectors && def.upgrade.connectors[phraseDiff]) ||
        def.connectors[phraseDiff],
      cost: isXCost
        ? -1
        : def.upgrade.cost !== undefined
        ? def.upgrade.cost
        : def.cost,
      xCost: isXCost,
      type: def.type,
      rarity: def.rarity,
      target: deriveEffectiveTarget(def.target, upEffects),
      description: def.upgrade.description || def.description,
      effects: upEffects,
      burnDraft:
        def.type === 'power'
          ? true
          : def.upgrade.burnDraft !== undefined
          ? def.upgrade.burnDraft
          : Boolean(def.burnDraft),
      art: def.art,
      sfx: def.sfx,
    };
  }

  return {
    instanceId: instance.instanceId,
    cardId: def.id,
    upgraded: false,
    name: def.names[phraseDiff],
    connector: def.connectors[phraseDiff],
    cost: isXCost ? -1 : def.cost,
    xCost: isXCost,
    type: def.type,
    rarity: def.rarity,
    target: deriveEffectiveTarget(def.target, def.effects),
    description: cleanCardDescriptionForPlay(def.description),
    effects: def.effects,
    burnDraft: def.type === 'power' ? true : Boolean(def.burnDraft),
    art: def.art,
    sfx: def.sfx,
  };
}

/**
 * Builds the 10-card starter deck for the Typemancer:
 * - 4x ink_strike
 * - 4x page_ward
 * - 1x boulder_barrage
 * - 1x blotting_cloud
 */
export function createStarterDeck(): CardInstance[] {
  const starterIds = [
    'ink_strike',
    'ink_strike',
    'ink_strike',
    'ink_strike',
    'page_ward',
    'page_ward',
    'page_ward',
    'page_ward',
    'boulder_barrage',
    'blotting_cloud',
  ];

  return starterIds.map((cardId) => ({
    instanceId: nextUid('card'),
    cardId: CARDS_CATALOG.some((c) => c.id === cardId) ? cardId : CARDS_CATALOG[0].id,
    upgraded: false,
  }));
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Resolves an enemy move's effects into a unified CardEffect array.
 * If move.effects is defined and non-empty, returns it.
 * Otherwise, synthesizes CardEffects from legacy damage, hits, ward, heal, and statusEffects.
 */
export function getEnemyMoveEffects(move: EnemyMove): CardEffect[] {
  if (move.effects && move.effects.length > 0) {
    return move.effects;
  }
  const synth: CardEffect[] = [];
  if (move.damage && move.damage > 0) {
    synth.push({
      type: 'damage',
      amount: move.damage,
      target: 'player',
      hits: move.hits && move.hits > 1 ? move.hits : 1,
    });
  }
  if (move.ward && move.ward > 0) {
    synth.push({
      type: 'ward',
      amount: move.ward,
      target: 'self',
    });
  }
  if (move.heal && move.heal > 0) {
    synth.push({
      type: 'heal',
      amount: move.heal,
      target: 'self',
    });
  }
  if (move.statusEffects && move.statusEffects.length > 0) {
    for (const se of move.statusEffects) {
      synth.push({
        type: se.status,
        amount: se.amount,
        target: se.target === 'player' ? 'player' : se.target === 'all_allies' ? 'all_allies' : 'self',
      });
    }
  }
  return synth;
}

/**
 * Synchronizes legacy move fields (damage, hits, ward, heal) from move.effects
 * to ensure intent badges, tooltips, and sprite previews reflect the effects accurately.
 */
export function syncEnemyMoveStats(move: EnemyMove): EnemyMove {
  const effects = move.effects;
  if (!effects || effects.length === 0) return move;

  const dmgEff = effects.find((e) => e.type === 'damage');
  const wardEff = effects.find((e) => e.type === 'ward');
  const healEff = effects.find((e) => e.type === 'heal');
  const debuffEff = effects.find(
    (e) =>
      e.type === 'bold' ||
      e.type === 'faded' ||
      e.type === 'exposed' ||
      e.type === 'ink_burn'
  );

  const damage = dmgEff ? dmgEff.amount : undefined;
  const hits = dmgEff && dmgEff.hits && dmgEff.hits > 1 ? dmgEff.hits : undefined;
  const ward = wardEff ? wardEff.amount : undefined;
  const heal = healEff ? healEff.amount : undefined;

  let intent = move.intent;
  if (!intent) {
    if (damage && ward) intent = 'attack_defend';
    else if (damage && debuffEff) intent = 'attack_debuff';
    else if (damage && hits && hits > 1) intent = 'multi_attack';
    else if (damage) intent = 'attack';
    else if (ward) intent = 'defend';
    else if (heal) intent = 'heal';
    else if (debuffEff) intent = 'debuff';
    else intent = 'buff';
  }

  return {
    ...move,
    damage,
    hits,
    ward,
    heal,
    intent,
  };
}

/**
 * Picks a weighted random move from an enemy's move list.
 */
export function chooseEnemyMove(moves: EnemyMove[]): EnemyMove {
  if (!moves || moves.length === 0) {
    return syncEnemyMoveStats({
      id: 'default_attack',
      name: 'Strike',
      intent: 'attack',
      weight: 10,
      damage: 5,
    });
  }
  const totalWeight = moves.reduce((sum, m) => sum + (m.weight || 10), 0);
  let roll = Math.random() * totalWeight;
  for (const m of moves) {
    roll -= m.weight || 10;
    if (roll <= 0) return syncEnemyMoveStats({ ...m });
  }
  return syncEnemyMoveStats({ ...moves[0] });
}

/**
 * Resolves the active behavior profile for an enemy based on current battle circumstances:
 * - 'last_standing': Sole survivor remaining in combat
 * - 'below_half_hp': Current HP <= 50% of Max HP
 * - 'normal': Default baseline behaviour
 */
export function resolveEnemyBehavior(
  def: EnemyDefinition,
  enemyHp: number,
  enemyMaxHp: number,
  totalAliveEnemies: number = 1
): { condition: EnemyBehaviorCondition; name: string; moves: EnemyMove[] } {
  if (def.behaviors && def.behaviors.length > 0) {
    // 1. Check for matching conditional behaviors in the order defined
    for (const b of def.behaviors) {
      if (!b.moves || b.moves.length === 0) continue;
      if (b.condition === 'last_standing' && totalAliveEnemies === 1) {
        return { condition: 'last_standing', name: b.name || 'Last Stand', moves: b.moves };
      }
      if (b.condition === 'below_half_hp' && enemyHp <= enemyMaxHp * 0.5) {
        return { condition: 'below_half_hp', name: b.name || 'Below 1/2 HP', moves: b.moves };
      }
    }

    // 2. Fallback to normal behavior set if configured
    const normalSet = def.behaviors.find(
      (b) => b.condition === 'normal' && b.moves && b.moves.length > 0
    );
    if (normalSet) {
      return { condition: 'normal', name: normalSet.name || 'Normal Behaviour', moves: normalSet.moves };
    }
  }

  // 3. Fallback to default def.moves
  return {
    condition: 'normal',
    name: 'Normal Behaviour',
    moves: def.moves && def.moves.length > 0 ? def.moves : [],
  };
}

/**
 * Picks an enemy move and its behavior tag based on battle circumstances.
 */
export function chooseEnemyMoveForContext(
  def: EnemyDefinition,
  enemyHp: number,
  enemyMaxHp: number,
  totalAliveEnemies: number = 1
): { move: EnemyMove; behavior: { condition: EnemyBehaviorCondition; name: string } } {
  const behavior = resolveEnemyBehavior(def, enemyHp, enemyMaxHp, totalAliveEnemies);
  const pickedMove =
    behavior.moves.length > 0 ? chooseEnemyMove(behavior.moves) : chooseEnemyMove(def.moves);
  return {
    move: pickedMove,
    behavior: {
      condition: behavior.condition,
      name: behavior.name,
    },
  };
}

/**
 * Calculates the visual sprite scale factor for an enemy:
 * - Scales up with diminishing effectiveness (sub-linear logarithmic growth) based on max health.
 * - Elite enemies gain a flat 25% (+0.25) extra size.
 */
export function calculateEnemySpriteScale(maxHp: number = 20, isElite: boolean = false): number {
  const baseHp = 20;
  // Sub-linear diminishing returns curve: as HP increases, size grows, but each additional HP yields progressively less scale
  const hpBonus = 0.22 * Math.log(1 + Math.max(0, maxHp - baseHp) / 40);
  const eliteBonus = isElite ? 0.25 : 0;
  return Number((1 + hpBonus + eliteBonus).toFixed(3));
}

/**
 * Generates an encounter for a given floor (1 to 24) and node type ('battle' | 'elite' | 'boss').
 * Ensures:
 * - All 3 factions ('goblins', 'rock_monsters', 'evil_plants') have an equal chance of being encountered.
 * - Harder and more enemies spawn as the floor progresses.
 * - Every enemy spawned in the encounter is assigned a UNIQUE name for the current difficulty
 *   so two identical enemy types can always be targeted separately.
 */
export function generateEncounter(
  floor: number,
  nodeType: 'battle' | 'elite' | 'boss',
  phraseDiff: PhraseDifficulty
): ActiveEnemy[] {
  const usedNames = new Set<string>();

  const instantiateEnemy = (
    def: EnemyDefinition,
    hpScale: number = 1,
    isEliteEnemy: boolean = false
  ): ActiveEnemy => {
    const pool = def.namePools[phraseDiff] || def.namePools.easy;
    const availableNames = pool.filter((n) => !usedNames.has(n.toLowerCase()));
    let chosenName =
      availableNames.length > 0 ? pickRandom(availableNames) : pickRandom(pool);

    // Fallback suffix if an encounter ever exceeds the name pool size
    if (usedNames.has(chosenName.toLowerCase())) {
      const suffixes = ['alpha', 'beta', 'gamma', 'prime', 'elder'];
      for (const suf of suffixes) {
        const candidate = `${chosenName} ${suf}`;
        if (!usedNames.has(candidate.toLowerCase())) {
          chosenName = candidate;
          break;
        }
      }
    }
    usedNames.add(chosenName.toLowerCase());

    const baseHp =
      def.minHp + Math.floor(Math.random() * Math.max(1, def.maxHp - def.minHp + 1));
    const scaledHp = Math.max(10, Math.round(baseHp * hpScale));
    const { move, behavior } = chooseEnemyMoveForContext(def, scaledHp, scaledHp, 1);
    const isElite = Boolean(isEliteEnemy || def.role === 'elite');

    return {
      instanceId: nextUid('enemy'),
      enemyId: def.id,
      displayName: chosenName,
      faction: def.faction,
      role: def.role,
      isElite,
      hp: scaledHp,
      maxHp: scaledHp,
      ward: 0,
      statuses: {
        bold: 0,
        faded: 0,
        exposed: 0,
        ink_burn: 0,
        plated_armor: 0,
        thorns: 0,
      },
      currentMove: move,
      currentBehavior: behavior,
      art: def.art,
    };
  };

  const finalizeEncounter = (list: ActiveEnemy[]): ActiveEnemy[] => {
    list.forEach((en) => {
      const def = ENEMIES_CATALOG.find((d) => d.id === en.enemyId);
      if (def) {
        const { move, behavior } = chooseEnemyMoveForContext(def, en.hp, en.maxHp, list.length);
        en.currentMove = move;
        en.currentBehavior = behavior;
      }
    });
    return list;
  };

  // Boss floor (Floor 24 or mid-boss Floor 12)
  if (nodeType === 'boss') {
    const bosses = ENEMIES_CATALOG.filter((e) => e.tier === 4 || e.role === 'boss');
    if (bosses.length > 0) {
      // Prefer 'the_evil_wizard' on floor 24 if present
      const wizard = bosses.find((b) => b.id.includes('wizard'));
      const chosenBoss = floor >= 20 && wizard ? wizard : pickRandom(bosses);
      return finalizeEncounter([instantiateEnemy(chosenBoss, floor >= 20 ? 1.15 : 1.0)]);
    }
    // Fallback if boss catalog is still loading
    const fallback = ENEMIES_CATALOG[ENEMIES_CATALOG.length - 1];
    return finalizeEncounter([instantiateEnemy(fallback, 2.8)]);
  }

  // Pick one of the 3 factions with equal 1/3 probability
  const factions: EnemyFaction[] = ['goblins', 'rock_monsters', 'evil_plants'];
  const availableFactions = factions.filter((f) =>
    ENEMIES_CATALOG.some((e) => e.faction === f)
  );
  const chosenFaction =
    availableFactions.length > 0 ? pickRandom(availableFactions) : 'goblins';

  const factionPool = ENEMIES_CATALOG.filter((e) => e.faction === chosenFaction);
  const poolToUse = factionPool.length > 0 ? factionPool : ENEMIES_CATALOG;

  if (nodeType === 'elite') {
    const elites = poolToUse.filter((e) => e.role === 'elite' || e.tier === 3);
    const mainElite = elites.length > 0 ? pickRandom(elites) : pickRandom(poolToUse);
    const hpScale = 1 + floor * 0.04;
    const result = [instantiateEnemy(mainElite, elites.length > 0 ? hpScale : hpScale * 1.5, true)];

    // Later elites bring a support or skirmisher minion
    if (floor >= 12) {
      const minions = poolToUse.filter((e) => e.tier === 1);
      if (minions.length > 0) {
        result.push(instantiateEnemy(pickRandom(minions), hpScale * 0.85));
      }
    }
    return finalizeEncounter(result);
  }

  // Standard Battle scaling across 24 floors (~150% StS act length)
  const hpScale = 0.9 + floor * 0.035;
  let enemyCount = 1;
  if (floor <= 3) {
    enemyCount = Math.random() < 0.45 ? 1 : 2;
  } else if (floor <= 10) {
    enemyCount = 2;
  } else if (floor <= 17) {
    enemyCount = Math.random() < 0.5 ? 2 : 3;
  } else {
    enemyCount = 3;
  }

  const maxTierAllowed = floor <= 7 ? 1 : floor <= 15 ? 2 : 3;
  const eligible = poolToUse.filter((e) => e.tier <= maxTierAllowed && e.role !== 'boss');
  const spawnCandidates = eligible.length > 0 ? eligible : poolToUse;

  const spawned: ActiveEnemy[] = [];
  for (let i = 0; i < enemyCount; i++) {
    const def = pickRandom(spawnCandidates);
    spawned.push(instantiateEnemy(def, hpScale));
  }

  return finalizeEncounter(spawned);
}

/**
 * Generates an organic 24 ± 2 floor procedural map (22 to 26 floors).
 * Features continuous horizontal (xRatio) and vertical (yOffset) scatter,
 * 1-4 encounters per layer, guaranteed planar non-crossing roads, and
 * 100% reachability from floor 1 to the final Evil Wizard boss.
 */
export function generateProceduralMap(): MapNode[][] {
  const TOTAL_FLOORS = 22 + Math.floor(Math.random() * 5); // 22, 23, 24, 25, or 26
  const floors: MapNode[][] = [];

  // Pick two distinct natural treasure floors in the first and second thirds of the run
  const treasureFloor1 = 7 + Math.floor(Math.random() * 4); // 7, 8, 9, or 10
  const treasureFloor2 = 15 + Math.floor(Math.random() * 4); // 15, 16, 17, or 18

  // Helper to choose node type organically for a layer
  const chooseOrganicNodeType = (
    f: number,
    isTreasureNode: boolean,
    usedTypes: Set<MapNodeType>
  ): MapNodeType => {
    if (f === 1) return 'battle';
    if (f === TOTAL_FLOORS) return 'boss';
    if (isTreasureNode) return 'treasure';

    if (f === TOTAL_FLOORS - 1) {
      if (!usedTypes.has('campfire')) return 'campfire';
      return Math.random() < 0.5 ? 'battle' : 'merchant';
    }

    const roll = Math.random();
    let picked: MapNodeType;
    if (f >= 5) {
      if (roll < 0.38) picked = 'battle';
      else if (roll < 0.60) picked = 'mystery';
      else if (roll < 0.74) picked = 'campfire';
      else if (roll < 0.86) picked = 'merchant';
      else picked = 'elite';
    } else {
      if (roll < 0.44) picked = 'battle';
      else if (roll < 0.70) picked = 'mystery';
      else if (roll < 0.86) picked = 'campfire';
      else picked = 'merchant';
    }

    // Avoid duplicate special types on the same layer when possible
    const specialTypes: MapNodeType[] = ['campfire', 'merchant', 'elite', 'treasure'];
    if (specialTypes.includes(picked) && usedTypes.has(picked)) {
      picked = Math.random() < 0.65 ? 'battle' : 'mystery';
    }
    return picked;
  };

  // Stage 1: Scatter Encounters Across the Forest
  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    let count: number;
    if (f === TOTAL_FLOORS) {
      count = 1;
    } else if (f === 1) {
      count = pickRandom([2, 3, 3, 4]);
    } else {
      const prevCount = floors[f - 2].length;
      if (prevCount > 1 && f < TOTAL_FLOORS - 1 && Math.random() < 0.12) {
        count = 1;
      } else {
        const roll = Math.random();
        if (roll < 0.38) count = 2;
        else if (roll < 0.80) count = 3;
        else count = 4;
      }
    }

    const row: MapNode[] = [];
    const usedTypes = new Set<MapNodeType>();
    const isTreasureFloor = f === treasureFloor1 || f === treasureFloor2;
    const treasureCol = isTreasureFloor ? Math.floor(Math.random() * count) : -1;

    if (f === TOTAL_FLOORS) {
      const xRatio = 0.46 + Math.random() * 0.08;
      const yOffset = 0;
      row.push({
        id: `floor_${f}_col_0`,
        floor: f,
        column: 0,
        xRatio,
        yOffset,
        type: 'boss',
        nextNodeIds: [],
        completed: false,
        phrases: { easy: '', medium: '', hard: '' }, // assigned in Step C
      });
    } else if (count === 1) {
      const xRatio = 0.28 + Math.random() * 0.44;
      let yOffset = (Math.random() - 0.5) * 90;
      if (f > 1) {
        const prevFloor = floors[f - 2];
        prevFloor.forEach((pn) => {
          const pxr = pn.xRatio ?? 0.5;
          const pyo = pn.yOffset ?? 0;
          if (Math.abs(pxr - xRatio) < 0.18) {
            if (yOffset > 90 + pyo) {
              yOffset = 90 + pyo;
            }
          }
        });
      }
      yOffset = Math.max(-85, Math.min(85, yOffset));

      const nType = chooseOrganicNodeType(f, treasureCol === 0, usedTypes);
      usedTypes.add(nType);

      row.push({
        id: `floor_${f}_col_0`,
        floor: f,
        column: 0,
        xRatio,
        yOffset,
        type: nType,
        nextNodeIds: [],
        completed: false,
        phrases: { easy: '', medium: '', hard: '' },
      });
    } else {
      const sectorW = 0.74 / count;
      for (let c = 0; c < count; c++) {
        let xRatio =
          0.13 + c * sectorW + 0.02 + Math.random() * (sectorW - 0.04);
        if (c > 0 && row[c - 1].xRatio !== undefined) {
          if (xRatio < row[c - 1].xRatio! + 0.16) {
            xRatio = Math.min(0.87, row[c - 1].xRatio! + 0.16);
          }
        }
        xRatio = Math.max(0.13, Math.min(0.87, xRatio));

        let yOffset = (Math.random() - 0.5) * 150;
        if (f > 1) {
          const prevFloor = floors[f - 2];
          prevFloor.forEach((pn) => {
            const pxr = pn.xRatio ?? 0.5;
            const pyo = pn.yOffset ?? 0;
            if (Math.abs(pxr - xRatio) < 0.18) {
              if (yOffset > 90 + pyo) {
                yOffset = 90 + pyo;
              }
            }
          });
        }
        yOffset = Math.max(-85, Math.min(85, yOffset));

        const nType = chooseOrganicNodeType(f, treasureCol === c, usedTypes);
        usedTypes.add(nType);

        row.push({
          id: `floor_${f}_col_${c}`,
          floor: f,
          column: c,
          xRatio,
          yOffset,
          type: nType,
          nextNodeIds: [],
          completed: false,
          phrases: { easy: '', medium: '', hard: '' },
        });
      }
    }

    floors.push(row);
  }

  // Stage 2: Draw the Roads Between Placed Encounters (Planar + 100% Reachable)
  for (let i = 0; i < floors.length - 1; i++) {
    const curr = floors[i];
    const next = floors[i + 1];
    const M = curr.length;
    const N = next.length;

    const edges: [number, number][] = [];

    const canAddPlanar = (u: number, v: number): boolean => {
      if (edges.some(([eu, ev]) => eu === u && ev === v)) return false;
      return !edges.some(([u2, v2]) => (u2 < u && v2 > v) || (u2 > u && v2 < v));
    };

    // Step A: Guarantee 100% in-degree >= 1 and out-degree >= 1 via monotonic walk
    let u = 0;
    let v = 0;
    edges.push([0, 0]);

    while (u < M - 1 || v < N - 1) {
      if (u === M - 1) {
        v++;
      } else if (v === N - 1) {
        u++;
      } else {
        const distStepU = Math.abs((curr[u + 1].xRatio ?? 0.5) - (next[v].xRatio ?? 0.5));
        const distStepV = Math.abs((curr[u].xRatio ?? 0.5) - (next[v + 1].xRatio ?? 0.5));

        if ((u + 1) / M < (v + 1) / N - 0.15 || (distStepU < distStepV && Math.random() < 0.6)) {
          u++;
        } else if ((v + 1) / N < (u + 1) / M - 0.15 || (distStepV < distStepU && Math.random() < 0.6)) {
          v++;
        } else if (Math.random() < 0.45) {
          u++;
          v++;
        } else {
          if (distStepU <= distStepV) {
            u++;
          } else {
            v++;
          }
        }
      }
      if (!edges.some(([eu, ev]) => eu === u && ev === v)) {
        edges.push([u, v]);
      }
    }

    // Step B: Add natural extra nearby cross-roads without crossing
    for (let uIdx = 0; uIdx < M; uIdx++) {
      const currentOut = edges.filter(([eu]) => eu === uIdx);
      if (currentOut.length < 2 && N > 1) {
        const candidates: { v: number; dist: number }[] = [];
        for (let vIdx = 0; vIdx < N; vIdx++) {
          if (canAddPlanar(uIdx, vIdx)) {
            const diffX = Math.abs((curr[uIdx].xRatio ?? 0.5) - (next[vIdx].xRatio ?? 0.5));
            if (diffX < 0.38) {
              const uY = (curr[uIdx].yOffset ?? 0) / 1440;
              const vY = (next[vIdx].yOffset ?? 0) / 1440;
              const dist = Math.hypot(diffX, uY - vY);
              candidates.push({ v: vIdx, dist });
            }
          }
        }
        if (candidates.length > 0 && Math.random() < 0.60) {
          candidates.sort((a, b) => a.dist - b.dist);
          edges.push([uIdx, candidates[0].v]);
        }
      }
    }

    // Assign nextNodeIds
    for (let uIdx = 0; uIdx < M; uIdx++) {
      curr[uIdx].nextNodeIds = edges
        .filter(([eu]) => eu === uIdx)
        .map(([, ev]) => next[ev].id);
    }
  }

  // Step C: Assign distinct direction-aware phrases to each node
  const buildPhrase = (
    dirKey: 'left' | 'middle' | 'right' | 'single',
    nodeType: MapNodeType
  ): DifficultyStrings => {
    const dirPools = MAP_PHRASES.directions[dirKey] || MAP_PHRASES.directions.single;
    const destPools = MAP_PHRASES.destinations[nodeType] || MAP_PHRASES.destinations.battle;

    const easyDest = pickRandom(destPools.easy);
    const easyDir = pickRandom(dirPools.easy);
    const easyPhrase = dirKey === 'single' ? easyDest : `${easyDir} ${easyDest}`;

    const medDir = pickRandom(dirPools.medium);
    const medDest = pickRandom(destPools.medium);
    const mediumPhrase =
      dirKey === 'single' ? medDest : `${medDir} to ${medDest}`;

    const hardDir = pickRandom(dirPools.hard);
    const hardDest = pickRandom(destPools.hard);
    const hardPhrase = `${hardDir}, ${hardDest}`;

    return {
      easy: easyPhrase,
      medium: mediumPhrase,
      hard: hardPhrase,
    };
  };

  floors.forEach((row) => {
    const usedEasy = new Set<string>();
    const usedMedium = new Set<string>();
    const usedHard = new Set<string>();

    row.forEach((node) => {
      const dirKey: 'left' | 'middle' | 'right' | 'single' =
        row.length === 1
          ? 'single'
          : (node.xRatio ?? 0.5) < 0.38
          ? 'left'
          : (node.xRatio ?? 0.5) > 0.62
          ? 'right'
          : 'middle';

      let phrases = buildPhrase(dirKey, node.type);
      for (let attempt = 0; attempt < 8; attempt++) {
        if (
          !usedEasy.has(phrases.easy) &&
          !usedMedium.has(phrases.medium) &&
          !usedHard.has(phrases.hard)
        ) {
          break;
        }
        phrases = buildPhrase(dirKey, node.type);
      }
      usedEasy.add(phrases.easy);
      usedMedium.add(phrases.medium);
      usedHard.add(phrases.hard);
      node.phrases = phrases;
    });
  });

  return floors;
}

/**
 * Generates 4 distinct card rewards after combat.
 */
export function generateCardRewards(count: number = 4, isEliteOrBoss: boolean = false): CardInstance[] {
  const pool = CARDS_CATALOG.filter((c) => c.rarity !== 'starter');
  const source = pool.length >= count ? pool : CARDS_CATALOG;
  const chosenDefs: CardDefinition[] = [];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let targetRarity: CardDefinition['rarity'] = 'common';
    if (isEliteOrBoss) {
      targetRarity = roll < 0.25 ? 'rare' : roll < 0.7 ? 'uncommon' : 'common';
    } else {
      targetRarity = roll < 0.08 ? 'rare' : roll < 0.40 ? 'uncommon' : 'common';
    }

    const candidates = source.filter(
      (c) => c.rarity === targetRarity && !chosenDefs.some((d) => d.id === c.id)
    );
    const fallback = source.filter((c) => !chosenDefs.some((d) => d.id === c.id));
    const pickFrom = candidates.length > 0 ? candidates : fallback.length > 0 ? fallback : source;
    chosenDefs.push(pickRandom(pickFrom));
  }

  return chosenDefs.map((def) => ({
    instanceId: nextUid('reward_card'),
    cardId: def.id,
    upgraded: isEliteOrBoss && Math.random() < 0.25,
  }));
}

/**
 * Generates 3 distinct relic rewards after defeating an Elite (or 1 for a Treasure chest).
 */
export function generateRelicRewards(ownedRelicIds: string[], count: number = 3): RelicDefinition[] {
  const unowned = RELICS_CATALOG.filter(
    (r) => r.rarity !== 'starter' && !ownedRelicIds.includes(r.id)
  );
  const pool = unowned.length > 0 ? unowned : RELICS_CATALOG;
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
