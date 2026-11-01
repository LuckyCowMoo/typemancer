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
  | 'gain_ward_per_card_in_hand'
  | 'discard'
  | 'discard_random'
  | 'keep_card' // Choose X card(s) in hand to keep from being discarded at the end of this turn
  | 'plated_armor'
  | 'thorns'
  // ---- Persistent "rest of this combat" powers (stack if played more than once) ----
  | 'power_ward_each_turn' // Gain X Ward at the start of each of your turns
  | 'power_bold_each_turn' // Gain X Bold at the start of each of your turns
  | 'power_draw_each_turn' // Draw X extra cards at the start of each of your turns
  | 'power_energy_each_turn' // Gain X extra Energy at the start of each of your turns
  | 'power_heal_each_turn' // Heal X HP at the start of each of your turns
  | 'power_ink_burn_all_each_turn' // Apply X Ink Burn to ALL enemies at the end of each of your turns
  | 'power_damage_all_each_turn' // Deal X damage to ALL enemies at the end of each of your turns
  | 'power_ward_on_card_play' // Gain X Ward whenever you play a card
  | 'power_damage_all_on_attack' // Deal X damage to ALL enemies whenever you play an Attack
  | 'power_keep_card_each_turn'; // Choose X card(s) to keep at the end of each of your turns

export type PowerEffectType = Extract<EffectType, `power_${string}`>;

export interface ActivePower {
  id: string;
  name: string;
  type: PowerEffectType;
  amount: number;
  label: string;
}

export interface CardEffect {
  type: EffectType;
  amount: number;
  target?: 'enemy' | 'all_enemies' | 'self' | 'player' | 'all_allies';
  hits?: number; // For multi-hit attacks (defaults to 1)
  targetCount?: number; // Amount of targets per tile
}

export interface ArtPlaceholder {
  primaryColor: string;
  secondaryColor: string;
  shape: 'capsule' | 'hexagon' | 'diamond' | 'shield' | 'scroll' | 'spiky' | 'thorn' | 'crown';
  icon?: string;
  spriteUrl?: string; // Drop-in path for non-AI custom art later
  flip?: boolean;
}

export interface CardUpgradeData {
  names: DifficultyStrings;
  connectors?: DifficultyStrings;
  cost?: number;
  xCost?: boolean;
  description: string;
  effects: CardEffect[];
  burnDraft?: boolean;
}

export interface CardDefinition {
  id: string;
  rarity: CardRarity;
  type: CardType;
  cost: number;
  xCost?: boolean;
  target: CardTarget;
  names: DifficultyStrings;
  connectors: DifficultyStrings;
  description: string;
  effects: CardEffect[];
  burnDraft?: boolean; // Functions like Exhaust in StS
  art: ArtPlaceholder;
  upgrade: CardUpgradeData;
  sfx?: string;
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
  effects?: CardEffect[];
}

export interface EnemyDefinition {
  id: string;
  faction: EnemyFaction;
  role: EnemyRole;
  tier: 1 | 2 | 3 | 4; // 1: Early (Floors 1-8), 2: Mid (9-16), 3: Late (17-23) / Elites, 4: Bosses
  minHp: number;
  maxHp: number;
  description?: string;
  namePools: DifficultyStringPools;
  art: ArtPlaceholder;
  moves: EnemyMove[];
}

export interface StatusState {
  bold: number;
  faded: number;
  exposed: number;
  ink_burn: number;
  plated_armor: number;
  thorns: number;
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
  floor: number; // 1 to totalFloors (22..26)
  column: number; // Left-to-right index within the layer
  xRatio?: number; // Continuous horizontal ratio in [0.13, 0.87]
  yOffset?: number; // Continuous vertical offset in px [-85, +85]
  type: MapNodeType;
  nextNodeIds: string[];
  completed: boolean;
  phrases: DifficultyStrings; // Assigned from map_phrases.json so player types e.g. "take the left path towards the warm campsite"
}

export interface MysteryEffects {
  hpChange?: number;
  maxHpChange?: number;
  goldChange?: number;
  gainRandomCard?: boolean;
  gainRareCard?: boolean;
  upgradeRandomCard?: boolean;
  gainRandomRelic?: boolean;
  removeRandomCard?: boolean;
  /** Start a battle against an ordinary encounter for the current floor after the event. */
  startBattle?: boolean;
}

export interface MysteryChoice {
  id: string;
  phrases: DifficultyStrings;
  /** Text shown when the choice is guaranteed, or when a chance roll SUCCEEDS. */
  outcomeText: string;
  /** Guaranteed effects (or the SUCCESS effects when `chance` is set). */
  effects: MysteryEffects;
  /** Optional 1-99 percent chance of success. When set, failure applies `failEffects`. */
  chance?: number;
  failText?: string;
  failEffects?: MysteryEffects;
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

export interface BattleEnvironmentModifiers {
  /** Extra Ward/block added to ALL player Ward cards/powers AND enemy Ward moves (e.g., +2 in Rocky Desert) */
  wardBonus?: number;
  /** Extra max Energy per turn for the player (e.g., +1 in Flowing Riverbank) */
  energyBonus?: number;
  /** Extra attack damage added to enemy attacks when energy/tempo is boosted (or general enemy damage modifier) */
  enemyDamageBonus?: number;
  /** Extra stacks added whenever ANY status effect (Bold, Faded, Exposed, Ink Burn) is applied by player OR enemies */
  statusBonus?: number;
  /** Flat bonus attack damage for BOTH player attacks and enemy attacks */
  damageBonus?: number;
  /** Extra HP restored whenever player OR enemies heal */
  healBonus?: number;
  /** Ward automatically granted to BOTH player and all enemies at the start of each round */
  turnStartWardAll?: number;
  /** Ink Burn automatically applied to BOTH player and all enemies at the end of each round */
  turnEndInkBurnAll?: number;
  /** Extra cards drawn by the player each turn */
  drawBonus?: number;
}

export interface BattleEnvironmentDefinition {
  id: string;
  name: string;
  description: string;
  backgroundTint: string;
  accentColor: string;
  minFloor?: number;
  maxFloor?: number;
  weight?: number;
  art: ArtPlaceholder;
  modifiers: BattleEnvironmentModifiers;
}
