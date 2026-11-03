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

export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'curse';
export type CardType = 'attack' | 'skill' | 'power' | 'curse';
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
  | 'summon' // Summon an ally or enemy NPC into battle
  // ---- Persistent "rest of this combat" powers (once per combat) ----
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
  target?: 'enemy' | 'all_enemies' | 'self' | 'player' | 'all_allies' | 'ally_or_player';
  hits?: number; // For multi-hit attacks (defaults to 1)
  targetCount?: number; // Amount of targets per tile
  summonId?: string; // ID of the enemy definition from ENEMIES_CATALOG to summon
  team?: 'player' | 'enemy'; // Which team the summoned NPC joins (defaults to 'player' for card plays)
  hpBonus?: number;
  wardBonus?: number;
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
  unplayable?: boolean;
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
  inverted?: boolean;
  additionalEffects?: CardEffect[];
}

export type EnemyFaction = 'goblins' | 'rock_monsters' | 'evil_plants' | 'boss' | 'origami' | 'wizards_guard';
export type EnemyRole = 'tank' | 'glass_cannon' | 'support' | 'balanced' | 'elite' | 'boss';

export type EnemyIntentType =
  | 'attack'
  | 'multi_attack'
  | 'defend'
  | 'attack_defend'
  | 'buff'
  | 'debuff'
  | 'attack_debuff'
  | 'heal'
  | 'summon';

export interface EnemyMove {
  id: string;
  name: string;
  intent: EnemyIntentType;
  weight: number;
  damage?: number;
  hits?: number;
  ward?: number;
  heal?: number;
  target?: 'player' | 'self' | 'all_allies' | 'ally_or_player';
  summonId?: string; // Specific enemy ID from ENEMIES_CATALOG to summon
  summonPool?: string[]; // Array of low-level faction enemy IDs to summon from
  summonCount?: number; // How many copies to summon (1 or 2)
  statusEffects?: {
    status: 'bold' | 'faded' | 'exposed' | 'ink_burn';
    amount: number;
    target: 'self' | 'all_allies' | 'player' | 'ally_or_player';
  }[];
  effects?: CardEffect[];
}

export type EnemyBehaviorCondition = 'normal' | 'below_half_hp' | 'last_standing';

export interface EnemyBehaviorSet {
  id: string;
  name: string;
  condition: EnemyBehaviorCondition;
  moves: EnemyMove[];
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
  behaviors?: EnemyBehaviorSet[];
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
  isElite?: boolean;
  team?: 'player' | 'enemy'; // 'player' = summoned ally, 'enemy' = opposing team
  hp: number;
  maxHp: number;
  ward: number;
  statuses: StatusState;
  currentMove: EnemyMove;
  currentBehavior?: {
    condition: EnemyBehaviorCondition;
    name: string;
  };
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
  isSecretNode?: boolean;
  isSecretPath?: boolean;
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
  /** Spawns a secret unredacted detour node on the map connecting to all next floor encounters. */
  revealSecretPath?: boolean;
  /** Triggers interactive campfire-style card selection to upgrade any card in deck. */
  chooseCardToUpgrade?: boolean;
  /** Triggers interactive campfire-style card selection to invert a card in deck. */
  chooseCardToInvert?: boolean;
  /** Adds a specified curse/unplayable card ID to the player's deck. */
  gainCurseCard?: string;
  /** Triggers interactive card selection BEFORE rolling the Wheel of Fate, modifying the chosen card on outcome. */
  chooseCardBeforeRoll?: boolean;
  /** Starts an immediate combat encounter with specific enemy IDs (e.g. ['vowel_tax_collector', 'ink_hound', 'ink_hound']). */
  startBattleEnemies?: string[];
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
  /** Minimum floor required before this event can appear in mystery encounters (e.g. 5 for elite encounters). */
  minFloor?: number;
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
