export type Difficulty = 'easy' | 'medium' | 'hard' | 'extra_hard';
export type PhraseDifficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyStrings {
  easy: string;
  medium: string;
  hard: string;
}

export interface DifficultyStringPools {
  easy: string[];
  medium: string[];
  hard: string[];
}

export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare';
export type CardType = 'attack' | 'skill' | 'power';
export type CardTarget = 'enemy' | 'all_enemies' | 'self';

export type EffectType =
  | 'damage'
  | 'ward'
  | 'bold'
  | 'faded'
  | 'exposed'
  | 'ink_burn'
  | 'draw'
  | 'energy'
  | 'heal'
  | 'self_damage'
  | 'damage_per_ward'
  | 'double_ward'
  | 'double_ink_burn'
  | 'gain_ward_per_card_in_hand';

export interface CardEffect {
  type: EffectType;
  amount: number;
  target?: 'enemy' | 'all_enemies' | 'self';
  hits?: number; // For multi-hit attacks (defaults to 1)
}

export interface ArtPlaceholder {
  primaryColor: string;
  secondaryColor: string;
  shape: 'capsule' | 'hexagon' | 'diamond' | 'shield' | 'scroll' | 'spiky' | 'thorn' | 'crown';
  icon?: string;
  spriteUrl?: string; // Drop-in path for non-AI custom art later
}

export interface CardUpgradeData {
  names: DifficultyStrings;
  connectors?: DifficultyStrings;
  cost?: number;
  description: string;
  effects: CardEffect[];
  burnDraft?: boolean;
}

export interface CardDefinition {
  id: string;
  rarity: CardRarity;
  type: CardType;
  cost: number;
  target: CardTarget;
  names: DifficultyStrings;
  connectors: DifficultyStrings;
  description: string;
  effects: CardEffect[];
  burnDraft?: boolean; // Functions like Exhaust in StS
  art: ArtPlaceholder;
  upgrade: CardUpgradeData;
}

export interface CardInstance {
  instanceId: string;
  cardId: string;
  upgraded: boolean;
}

export type EnemyFaction = 'goblins' | 'rock_monsters' | 'evil_plants' | 'boss';
export type EnemyRole = 'tank' | 'glass_cannon' | 'support' | 'balanced' | 'elite' | 'boss';

export type EnemyIntentType =
  | 'attack'
  | 'multi_attack'
  | 'defend'
  | 'attack_defend'
  | 'buff'
  | 'debuff'
  | 'attack_debuff'
  | 'heal';

export interface EnemyMove {
  id: string;
  name: string;
  intent: EnemyIntentType;
  weight: number;
  damage?: number;
  hits?: number;
  ward?: number;
  heal?: number;
  statusEffects?: {
    status: 'bold' | 'faded' | 'exposed' | 'ink_burn';
    amount: number;
    target: 'self' | 'all_allies' | 'player';
  }[];
}

export interface EnemyDefinition {
  id: string;
  faction: EnemyFaction;
  role: EnemyRole;
  tier: 1 | 2 | 3 | 4; // 1: Early (Floors 1-8), 2: Mid (9-16), 3: Late (17-23) / Elites, 4: Bosses
  minHp: number;
  maxHp: number;
  namePools: DifficultyStringPools;
  art: ArtPlaceholder;
  moves: EnemyMove[];
}

export interface StatusState {
  bold: number;
  faded: number;
  exposed: number;
  ink_burn: number;
}

export interface ActiveEnemy {
  instanceId: string;
  enemyId: string;
  displayName: string; // Assigned unique name for current difficulty
  faction: EnemyFaction;
  role: EnemyRole;
  hp: number;
  maxHp: number;
  ward: number;
  statuses: StatusState;
  currentMove: EnemyMove;
  art: ArtPlaceholder;
}

export type RelicRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'boss' | 'shop';

export type RelicTrigger =
  | 'combat_start'
  | 'turn_start'
  | 'turn_end'
  | 'on_card_play'
  | 'on_attack'
  | 'on_kill'
  | 'combat_victory'
  | 'on_rest'
  | 'passive_max_hp'
  | 'passive_energy'
  | 'passive_draw'
  | 'passive_wpm_forgiveness';

export interface RelicDefinition {
  id: string;
  rarity: RelicRarity;
  names: DifficultyStrings;
  description: string;
  trigger: RelicTrigger;
  effectType: 'ward' | 'bold' | 'heal' | 'energy' | 'draw' | 'gold' | 'max_hp' | 'damage_all' | 'ink_burn_all' | 'exposed_all' | 'faded_all' | 'wpm_boost';
  amount: number;
  art: ArtPlaceholder;
  price?: number;
}

export type MapNodeType = 'battle' | 'elite' | 'campfire' | 'merchant' | 'treasure' | 'mystery' | 'boss';

export interface MapNode {
  id: string;
  floor: number; // 1 to 24
  column: number; // 0, 1, 2
  type: MapNodeType;
  nextNodeIds: string[];
  completed: boolean;
  phrases: DifficultyStrings; // Assigned from map_phrases.json so player types e.g. "take the left path towards the warm campsite"
}

export interface MysteryChoice {
  id: string;
  phrases: DifficultyStrings;
  outcomeText: string;
  effects: {
    hpChange?: number;
    maxHpChange?: number;
    goldChange?: number;
    gainRandomCard?: boolean;
    upgradeRandomCard?: boolean;
    gainRandomRelic?: boolean;
    removeRandomCard?: boolean;
  };
}

export interface MysteryEventDefinition {
  id: string;
  title: string;
  narrative: string;
  choices: MysteryChoice[];
}

export interface MapPhrasesCatalog {
  directions: {
    left: DifficultyStringPools;
    middle: DifficultyStringPools;
    right: DifficultyStringPools;
    single: DifficultyStringPools;
  };
  destinations: Record<MapNodeType, DifficultyStringPools>;
}

export interface RunMetrics {
  totalCharsTyped: number;
  totalErrorsCost: number;
  totalActionsSubmitted: number;
  wpmSamples: number[];
  peakWpm: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalWardGained: number;
  cardsPlayed: number;
  enemiesDefeated: number;
  floorsCleared: number;
  startTimeMs: number;
  elapsedSeconds: number;
}

export type SoundProfile = 'mechanical_typewriter' | 'vintage_telegraph' | 'arcane_quill' | 'soft_chalk';
export type ConfirmSoundProfile = 'carriage_bell' | 'spell_chime' | 'heavy_stamp';

export interface GameSettings {
  muted: boolean;
  volume: number;
  typingSound: SoundProfile;
  confirmSound: ConfirmSoundProfile;
  highContrast: boolean;
}
