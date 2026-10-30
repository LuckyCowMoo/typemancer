import type {
  ActiveEnemy,
  CardDefinition,
  CardEffect,
  CardInstance,
  DifficultyStrings,
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
import mapPhrasesRaw from '../data/map_phrases.json';

export const CARDS_CATALOG: CardDefinition[] = cardsRaw as unknown as CardDefinition[];
export const ENEMIES_CATALOG: EnemyDefinition[] = enemiesRaw as unknown as EnemyDefinition[];
export const RELICS_CATALOG: RelicDefinition[] = relicsRaw as unknown as RelicDefinition[];
export const EVENTS_CATALOG: MysteryEventDefinition[] = eventsRaw as unknown as MysteryEventDefinition[];
export const MAP_PHRASES: MapPhrasesCatalog = mapPhrasesRaw as unknown as MapPhrasesCatalog;

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
  type: CardDefinition['type'];
  rarity: CardDefinition['rarity'];
  target: CardDefinition['target'];
  description: string;
  effects: CardEffect[];
  burnDraft: boolean;
  art: CardDefinition['art'];
} {
  const def = getCardDefinition(instance.cardId);
  if (instance.upgraded && def.upgrade) {
    return {
      instanceId: instance.instanceId,
      cardId: def.id,
      upgraded: true,
      name: def.upgrade.names[phraseDiff] || def.names[phraseDiff],
      connector:
        (def.upgrade.connectors && def.upgrade.connectors[phraseDiff]) ||
        def.connectors[phraseDiff],
      cost: def.upgrade.cost !== undefined ? def.upgrade.cost : def.cost,
      type: def.type,
      rarity: def.rarity,
      target: def.target,
      description: def.upgrade.description || def.description,
      effects: def.upgrade.effects || def.effects,
      burnDraft:
        def.upgrade.burnDraft !== undefined
          ? def.upgrade.burnDraft
          : Boolean(def.burnDraft),
      art: def.art,
    };
  }

  return {
    instanceId: instance.instanceId,
    cardId: def.id,
    upgraded: false,
    name: def.names[phraseDiff],
    connector: def.connectors[phraseDiff],
    cost: def.cost,
    type: def.type,
    rarity: def.rarity,
    target: def.target,
    description: def.description,
    effects: def.effects,
    burnDraft: Boolean(def.burnDraft),
    art: def.art,
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
 * Picks a weighted random move from an enemy's move list.
 */
export function chooseEnemyMove(moves: EnemyMove[]): EnemyMove {
  const totalWeight = moves.reduce((sum, m) => sum + (m.weight || 10), 0);
  let roll = Math.random() * totalWeight;
  for (const m of moves) {
    roll -= m.weight || 10;
    if (roll <= 0) return m;
  }
  return moves[0];
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

  const instantiateEnemy = (def: EnemyDefinition, hpScale: number = 1): ActiveEnemy => {
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

    return {
      instanceId: nextUid('enemy'),
      enemyId: def.id,
      displayName: chosenName,
      faction: def.faction,
      role: def.role,
      hp: scaledHp,
      maxHp: scaledHp,
      ward: 0,
      statuses: {
        bold: 0,
        faded: 0,
        exposed: 0,
        ink_burn: 0,
      },
      currentMove: chooseEnemyMove(def.moves),
      art: def.art,
    };
  };

  // Boss floor (Floor 24 or mid-boss Floor 12)
  if (nodeType === 'boss') {
    const bosses = ENEMIES_CATALOG.filter((e) => e.tier === 4 || e.role === 'boss');
    if (bosses.length > 0) {
      // Prefer 'the_evil_wizard' on floor 24 if present
      const wizard = bosses.find((b) => b.id.includes('wizard'));
      const chosenBoss = floor >= 20 && wizard ? wizard : pickRandom(bosses);
      return [instantiateEnemy(chosenBoss, floor >= 20 ? 1.15 : 1.0)];
    }
    // Fallback if boss catalog is still loading
    const fallback = ENEMIES_CATALOG[ENEMIES_CATALOG.length - 1];
    return [instantiateEnemy(fallback, 2.8)];
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
    const result = [instantiateEnemy(mainElite, elites.length > 0 ? hpScale : hpScale * 1.5)];

    // Later elites bring a support or skirmisher minion
    if (floor >= 12) {
      const minions = poolToUse.filter((e) => e.tier === 1);
      if (minions.length > 0) {
        result.push(instantiateEnemy(pickRandom(minions), hpScale * 0.85));
      }
    }
    return result;
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

  return spawned;
}

/**
 * Generates a 24-floor procedural map (~150% the length of a 15-floor Slay the Spire act).
 * Includes Battles, Elites, Campfires, Merchants, Treasure Chests (Floor 8 & 16),
 * Mystery (?) Encounters, a Mid-Act Guardian on Floor 12, and the Evil Wizard Boss on Floor 24.
 */
export function generateProceduralMap(): MapNode[][] {
  const TOTAL_FLOORS = 24;
  const floors: MapNode[][] = [];

  const buildPhrase = (
    dirKey: 'left' | 'middle' | 'right' | 'single',
    nodeType: MapNodeType
  ): DifficultyStrings => {
    const dirPools = MAP_PHRASES.directions[dirKey] || MAP_PHRASES.directions.single;
    const destPools = MAP_PHRASES.destinations[nodeType] || MAP_PHRASES.destinations.battle;

    const easyDest = pickRandom(destPools.easy);
    const easyDir = pickRandom(dirPools.easy);
    // On easy, keep it super punchy (e.g. "left battle" or "campfire")
    const easyPhrase = dirKey === 'single' ? easyDest : `${easyDir} ${easyDest}`;

    const medDir = pickRandom(dirPools.medium);
    const medDest = pickRandom(destPools.medium);
    const mediumPhrase =
      dirKey === 'single' ? medDest : `${medDir} to ${medDest}`;

    const hardDir = pickRandom(dirPools.hard);
    const hardDest = pickRandom(destPools.hard);
    const hardPhrase = `${hardDir} ${hardDest}`;

    return {
      easy: easyPhrase,
      medium: mediumPhrase,
      hard: hardPhrase,
    };
  };

  const chooseNodeType = (floorNum: number, colIndex: number): MapNodeType => {
    if (floorNum === 1) return 'battle';
    if (floorNum === 8 || floorNum === 16) return 'treasure';
    if (floorNum === 11 || floorNum === 23) return 'campfire';
    if (floorNum === 24) return 'boss';

    const roll = Math.random();
    if (floorNum >= 5 && floorNum % 4 === 0 && colIndex === 1) {
      return 'campfire';
    }
    if (floorNum >= 6 && roll < 0.16) return 'elite';
    if (roll < 0.34) return 'mystery';
    if (roll < 0.48) return 'campfire';
    if (roll < 0.60) return 'merchant';
    return 'battle';
  };

  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    if (f === 24 || f === 8 || f === 16) {
      const nodeType: MapNodeType = f === 24 ? 'boss' : 'treasure';
      floors.push([
        {
          id: `floor_${f}_col_0`,
          floor: f,
          column: 1,
          type: nodeType,
          nextNodeIds: [],
          completed: false,
          phrases: buildPhrase('single', nodeType),
        },
      ]);
      continue;
    }

    // 2 or 3 branching paths per floor
    const count = f === 1 ? 3 : Math.random() < 0.65 ? 3 : 2;
    const row: MapNode[] = [];
    const usedTypesOnRow = new Set<MapNodeType>();

    for (let c = 0; c < count; c++) {
      let nType = chooseNodeType(f, c);
      // Try to vary node types across the same row so students have meaningful tactical choices
      if (usedTypesOnRow.has(nType) && f > 1 && f !== 11 && f !== 23) {
        const alternatives: MapNodeType[] = ['battle', 'mystery', 'campfire', 'merchant', 'elite'];
        const unused = alternatives.filter(
          (t) => !usedTypesOnRow.has(t) && (f >= 6 || t !== 'elite')
        );
        if (unused.length > 0) nType = pickRandom(unused);
      }
      usedTypesOnRow.add(nType);

      const dirKey: 'left' | 'middle' | 'right' =
        count === 2
          ? c === 0
            ? 'left'
            : 'right'
          : c === 0
          ? 'left'
          : c === 1
          ? 'middle'
          : 'right';

      row.push({
        id: `floor_${f}_col_${c}`,
        floor: f,
        column: c,
        type: nType,
        nextNodeIds: [],
        completed: false,
        phrases: buildPhrase(dirKey, nType),
      });
    }

    floors.push(row);
  }

  // Connect each floor's nodes to the next floor
  for (let i = 0; i < floors.length - 1; i++) {
    const currentRow = floors[i];
    const nextRow = floors[i + 1];

    currentRow.forEach((node, idx) => {
      if (nextRow.length === 1) {
        node.nextNodeIds = [nextRow[0].id];
      } else {
        const primaryIdx = Math.min(idx, nextRow.length - 1);
        node.nextNodeIds.push(nextRow[primaryIdx].id);
        // Add a branching neighbor so paths interweave like Slay the Spire
        const neighborIdx = primaryIdx + 1 < nextRow.length ? primaryIdx + 1 : Math.max(0, primaryIdx - 1);
        if (!node.nextNodeIds.includes(nextRow[neighborIdx].id)) {
          node.nextNodeIds.push(nextRow[neighborIdx].id);
        }
      }
    });
  }

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
