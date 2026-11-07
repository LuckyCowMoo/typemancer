import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import {
  CardBanner,
  CARD_CATEGORY_LABELS,
  getCardVisualCategory,
  sortCardsByCategoryAndRarity,
} from './components/CardBanner';
import type { CardVisualCategory } from './components/CardBanner';
import { renderHighlightedCardText, formatCardDescription } from './utils/textHighlight';
import { CodexModal } from './components/CodexModal';
import type { CodexTab } from './components/CodexModal';
import { DevJsonEditor } from './components/DevJsonEditor';
import { EntitySprite, IntentBadge } from './components/EntitySprite';
import { MAP_NODE_STYLES, ScrollableMap } from './components/ScrollableMap';
import { MysteryChanceWheel } from './components/MysteryChanceWheel';
import { TutorialScreen, type TutorialMapNode } from './components/TutorialScreen';
import { TypingConsoleDisplay } from './components/TypingConsoleDisplay';
import type {
  ActiveEnemy,
  ActivePower,
  BattleEnvironmentDefinition,
  CardInstance,
  Difficulty,
  GameSettings,
  MapNode,
  MysteryChoice,
  MysteryEffects,
  MysteryEventDefinition,
  PhraseDifficulty,
  PowerEffectType,
  RelicDefinition,
  RunMetrics,
  StatusState,
} from './types/game';
import {
  CARDS_CATALOG,
  chooseBattleEnvironment,
  chooseEnemyMoveForContext,
  createStarterDeck,
  createSummonInstance,
  describeCardEffects,
  ENEMIES_CATALOG,
  ENVIRONMENTS_CATALOG,
  EVENTS_CATALOG,
  generateCardRewards,
  generateConsecratedEffect,
  generateCustomEncounter,
  generateEncounter,
  generateProceduralMap,
  generateRelicRewards,
  getCardDefinition,
  getCardEffectiveDropRarity,
  getEnemyMoveEffects,
  getRelicDefinition,
  nextUid,
  pickRandom,
  RELICS_CATALOG,
  resolveCardInstance,
  shuffleArray,
} from './utils/gameContent';
import {
  loadCodexState,
  unlockCodexEntries,
  unlockAllCodexEntries,
} from './utils/codexEngine';
import type { CodexDiscoveryState } from './utils/codexEngine';
import {
  clearLocalRun,
  decodeSaveCode,
  encodeSaveCode,
  isExtraHardUnlocked,
  loadRunFromLocal,
  saveRunToLocal,
  setExtraHardUnlocked,
} from './utils/saveEngine';
import { soundEngine } from './utils/soundEngine';
import {
  describeEnemyIntentInEnglish,
  lookupWordDefinition,
  STATUS_DEFINITIONS,
} from './utils/statusCatalog';
import type { DictionaryResult } from './utils/statusCatalog';
import {
  analyzeTypingWithWordAnchors,
  calculateSpeedEffectiveness,
  calculateWpm,
  evaluateCandidates,
  getPhraseDifficulty,
  matchCommand,
  normalizeText,
} from './utils/typingEngine';

type GameScreen =
  | 'main_menu'
  | 'tutorial'
  | 'peasant_intro'
  | 'map'
  | 'battle'
  | 'reward'
  | 'campfire'
  | 'merchant'
  | 'treasure'
  | 'mystery'
  | 'game_over'
  | 'victory';

type IntroStep = 'ask_name' | 'ask_difficulty' | 'load_save';
type ModalOverlay =
  | 'none'
  | 'help'
  | 'options'
  | 'deck'
  | 'discard'
  | 'burn_draft'
  | 'relics'
  | 'gold'
  | 'save'
  | 'status_effects'
  | 'entity_inspect'
  | 'dictionary'
  | 'codex'
  | 'combat_tutorial';

interface ShopInventory {
  cards: { instance: CardInstance; price: number; sold: boolean }[];
  relics: { relic: RelicDefinition; price: number; sold: boolean }[];
  removeServicePrice: number;
  removeUsed: boolean;
}

export interface CombatProjectile {
  id: string;
  from: 'player' | number;
  to: 'player' | number;
  color: string;
}

export interface FloatingCombatPopup {
  id: string;
  target: 'player' | string;
  text: string;
  color: string;
}

export interface InkParticleBurst {
  id: string;
  x: number;
  y: number;
  isPixel?: boolean;
  particles: {
    x?: number;
    y?: number;
    dx: number;
    dy: number;
    size: number;
    color: string;
    rot: number;
  }[];
}

export interface ExitingCardState {
  instance: CardInstance;
  resolved: ReturnType<typeof resolveCardInstance>;
  topOffset: number;
  leftOffset: number;
  discardIdx: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  muted: false,
  volume: 0.75,
  typingSound: 'mechanical_typewriter',
  confirmSound: 'carriage_bell',
  highContrast: false,
};

const INITIAL_METRICS = (): RunMetrics => ({
  totalCharsTyped: 0,
  totalErrorsCost: 0,
  totalActionsSubmitted: 0,
  wpmSamples: [],
  peakWpm: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalWardGained: 0,
  cardsPlayed: 0,
  enemiesDefeated: 0,
  floorsCleared: 0,
  startTimeMs: Date.now(),
  elapsedSeconds: 0,
});

const TUTORIAL_MAP_CHOICES_POOL: TutorialMapNode[] = [
  { type: 'battle', name: 'monster patrol' },
  { type: 'battle', name: 'enemy ambush' },
  { type: 'battle', name: 'hostile clearing' },
  { type: 'battle', name: 'combat zone' },
  { type: 'merchant', name: 'wandering merchant' },
  { type: 'merchant', name: 'arcane bookshop' },
  { type: 'merchant', name: 'scribes market' },
  { type: 'campfire', name: 'quiet bonfire' },
  { type: 'campfire', name: 'warm campsite' },
  { type: 'campfire', name: 'safe hearth' },
  { type: 'mystery', name: 'mysterious shrine' },
  { type: 'mystery', name: 'whispering fog' },
  { type: 'mystery', name: 'strange crossroads' },
  { type: 'elite', name: 'deadly champion' },
  { type: 'elite', name: 'fierce warlord' },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function App() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [overlay, setOverlay] = useState<ModalOverlay>('none');
  const [extraHardAvailable, setExtraHardAvailable] = useState<boolean>(() => isExtraHardUnlocked());

  const [screen, setScreen] = useState<GameScreen>('main_menu');
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [combatTutorialStep, setCombatTutorialStep] = useState<number | null>(null);
  const [hasShownCombatTutorialThisRun, setHasShownCombatTutorialThisRun] = useState<boolean>(false);
  const [tutorialDiffPreview, setTutorialDiffPreview] = useState<PhraseDifficulty>('easy');
  const [tutorialFeedback, setTutorialFeedback] = useState<string | null>(null);
  const [tutorialMapLevel, setTutorialMapLevel] = useState<number>(1);
  const [tutorialMapCurrent, setTutorialMapCurrent] = useState<TutorialMapNode>({
    type: 'campfire',
    name: 'quiet bonfire',
  });
  const [tutorialMapOptions, setTutorialMapOptions] = useState<TutorialMapNode[]>([
    { type: 'battle', name: 'monster patrol' },
    { type: 'merchant', name: 'wandering merchant' },
    { type: 'mystery', name: 'mysterious shrine' },
  ]);
  const [tutorialMapScroll, setTutorialMapScroll] = useState<number>(0);
  const [introStep, setIntroStep] = useState<IntroStep>('ask_name');

  const [inspectedEntity, setInspectedEntity] = useState<ActiveEnemy | 'player' | null>(null);
  const [highlightedStatusId, setHighlightedStatusId] = useState<string | null>(null);
  const [dictionaryQuery, setDictionaryQuery] = useState<string>('');
  const [dictionaryLoading, setDictionaryLoading] = useState<boolean>(false);
  const [dictionaryData, setDictionaryData] = useState<DictionaryResult | null>(null);

  const [playerName, setPlayerName] = useState<string>('Scribe');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const phraseDiff = useMemo(() => getPhraseDifficulty(difficulty), [difficulty]);

  const [hp, setHp] = useState<number>(75);
  const [maxHp, setMaxHp] = useState<number>(75);
  const [gold, setGold] = useState<number>(99);
  const [deck, setDeck] = useState<CardInstance[]>(() => createStarterDeck());
  const [relicIds, setRelicIds] = useState<string[]>(['magical_typewriter']);
  const [metrics, setMetrics] = useState<RunMetrics>(() => INITIAL_METRICS());

  const [mapFloors, setMapFloors] = useState<MapNode[][]>(() => generateProceduralMap());
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [activeNodeType, setActiveNodeType] = useState<'battle' | 'elite' | 'boss'>('battle');
  const [mapScrollOffset, setMapScrollOffset] = useState<number>(6800);

  const [energy, setEnergy] = useState<number>(3);
  const [maxEnergy, setMaxEnergy] = useState<number>(3);
  const [playerWard, setPlayerWard] = useState<number>(0);
  const [playerStatuses, setPlayerStatuses] = useState<StatusState>({
    bold: 0,
    faded: 0,
    exposed: 0,
    ink_burn: 0,
    plated_armor: 0,
    thorns: 0,
  });
  const [hand, setHand] = useState<CardInstance[]>([]);
  const [drawPile, setDrawPile] = useState<CardInstance[]>([]);
  const [discardPile, setDiscardPile] = useState<CardInstance[]>([]);
  const [burnDraftPile, setBurnDraftPile] = useState<CardInstance[]>([]);
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const [allies, setAllies] = useState<ActiveEnemy[]>([]);
  const [activePowers, setActivePowers] = useState<ActivePower[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<BattleEnvironmentDefinition>(
    () => ENVIRONMENTS_CATALOG[0]
  );
  const [biomePopupExpanded, setBiomePopupExpanded] = useState<boolean>(true);
  const [biomePopupManual, setBiomePopupManual] = useState<boolean>(false);
  const [codexDiscovery, setCodexDiscovery] = useState<CodexDiscoveryState>(() => loadCodexState());
  const [codexTab, setCodexTab] = useState<CodexTab>('monsters');
  const [codexSelectedId, setCodexSelectedId] = useState<string | null>(null);
  const [codexScrollOffset, setCodexScrollOffset] = useState<number>(0);
  const [devEditorOpen, setDevEditorOpen] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      (window.location.search.includes('editor') || window.location.hash.includes('editor'))
  );
  const [handAnimState, setHandAnimState] = useState<'idle' | 'discarding' | 'drawing'>('idle');
  const [exitingCards, setExitingCards] = useState<ExitingCardState[]>([]);
  const [enteringCardMap, setEnteringCardMap] = useState<Map<string, number>>(() => new Map());
  const cardPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);
  const [selectedTargetEnemy, setSelectedTargetEnemy] = useState<ActiveEnemy | null>(null);
  const [selectedDiscardInstances, setSelectedDiscardInstances] = useState<CardInstance[]>([]);
  const [retainedCardIds, setRetainedCardIds] = useState<Set<string>>(() => new Set());
  const [pendingKeepCount, setPendingKeepCount] = useState<number>(0);
  const [pendingDiscardCount, setPendingDiscardCount] = useState<number>(0);
  const [pendingFollowUpDraw, setPendingFollowUpDraw] = useState<number>(0);
  const [turnLockedCardIds, setTurnLockedCardIds] = useState<Set<string>>(() => new Set());
  const [usedPowerCardIdsThisCombat, setUsedPowerCardIdsThisCombat] = useState<Set<string>>(() => new Set());
  const [isAnimatingTurn, setIsAnimatingTurn] = useState<boolean>(false);
  const [activeProjectile, setActiveProjectile] = useState<CombatProjectile | null>(null);
  const [floatingPopups, setFloatingPopups] = useState<FloatingCombatPopup[]>([]);
  const [particleBursts, setParticleBursts] = useState<InkParticleBurst[]>([]);

  const [rewardCards, setRewardCards] = useState<CardInstance[]>([]);
  const [rewardRelics, setRewardRelics] = useState<RelicDefinition[]>([]);
  const [rewardGoldClaimed, setRewardGoldClaimed] = useState<number>(0);
  const [rewardStep, setRewardStep] = useState<'card' | 'relic'>('card');
  const [skipCardRewardOnBattleWin, setSkipCardRewardOnBattleWin] = useState<boolean>(false);
  const [campfireSubMode, setCampfireSubMode] = useState<
    'choose' | 'revise_select' | 'revise_confirm'
  >('choose');
  const [campfireSelectedCard, setCampfireSelectedCard] = useState<CardInstance | null>(null);
  const [shopSubMode, setShopSubMode] = useState<'browse' | 'remove_select'>('browse');
  const [shopInventory, setShopInventory] = useState<ShopInventory | null>(null);
  const [activeEvent, setActiveEvent] = useState<MysteryEventDefinition | null>(null);
  const [eventOutcomeText, setEventOutcomeText] = useState<string | null>(null);
  const [eventOutcomeSummary, setEventOutcomeSummary] = useState<string[]>([]);
  const [eventRollSucceeded, setEventRollSucceeded] = useState<boolean | null>(null);
  const [pendingChanceChoice, setPendingChanceChoice] = useState<MysteryChoice | null>(null);
  const [pendingConsecrateChoice, setPendingConsecrateChoice] = useState<MysteryChoice | null>(null);
  const [consecratedResultCard, setConsecratedResultCard] = useState<CardInstance | null>(null);
  const [mysterySubMode, setMysterySubMode] = useState<
    | 'event'
    | 'select_card_to_upgrade'
    | 'confirm_card_upgrade'
    | 'select_card_to_invert'
    | 'confirm_card_invert'
    | 'select_card_to_consecrate'
  >('event');
  const [mysterySelectedCard, setMysterySelectedCard] = useState<CardInstance | null>(null);

  // Temporary encounter playtest state & run snapshot backup
  const [playtestBackup, setPlaytestBackup] = useState<{
    screen: GameScreen;
    hp: number;
    maxHp: number;
    gold: number;
    deck: CardInstance[];
    relicIds: string[];
    metrics: RunMetrics;
    mapFloors: MapNode[][];
    currentFloor: number;
    currentNodeId: string | null;
    activeNodeType: 'battle' | 'elite' | 'boss';
    mapScrollOffset: number;
    activeEnvironment: BattleEnvironmentDefinition;
    activeEvent: MysteryEventDefinition | null;
    eventOutcomeText: string | null;
    eventOutcomeSummary: string[];
    eventRollSucceeded: boolean | null;
    pendingChanceChoice: MysteryChoice | null;
    pendingConsecrateChoice: MysteryChoice | null;
    consecratedResultCard: CardInstance | null;
    mysterySubMode:
      | 'event'
      | 'select_card_to_upgrade'
      | 'confirm_card_upgrade'
      | 'select_card_to_invert'
      | 'confirm_card_invert'
      | 'select_card_to_consecrate';
    mysterySelectedCard: CardInstance | null;
    energy: number;
    maxEnergy: number;
    playerWard: number;
    playerStatuses: StatusState;
    hand: CardInstance[];
    drawPile: CardInstance[];
    discardPile: CardInstance[];
    burnDraftPile: CardInstance[];
    enemies: ActiveEnemy[];
    allies: ActiveEnemy[];
    activePowers: ActivePower[];
    rewardCards: CardInstance[];
    rewardRelics: RelicDefinition[];
    rewardGoldClaimed: number;
    rewardStep: 'card' | 'relic';
    skipCardRewardOnBattleWin: boolean;
    shopInventory: ShopInventory | null;
    shopSubMode: 'browse' | 'remove_select';
    campfireSubMode: 'choose' | 'revise_select' | 'revise_confirm';
    campfireSelectedCard: CardInstance | null;
  } | null>(null);
  const [isPlaytestingEncounter, setIsPlaytestingEncounter] = useState<boolean>(false);

  const [typedInput, setTypedInput] = useState<string>('');
  const [actionStartTime, setActionStartTime] = useState<number | null>(null);
  const [actionCharAccum, setActionCharAccum] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(40);

  /**
   * Spawns tactile ink-splatter / parchment-spark particle bursts along the top edge
   * of the typing console area (.typing-console-box / .modal-footer-prompt) when pressing Enter.
   */
  const triggerElementParticles = useCallback(
    (_selector?: string, customPalette?: string[], _fallbackX = 50, _fallbackY = 82) => {
      let left = window.innerWidth * 0.15;
      let width = window.innerWidth * 0.7;
      let top = window.innerHeight * 0.88;

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const typingBox =
          document.querySelector('.typing-console-box') ||
          document.querySelector('.modal-footer-prompt');
        if (typingBox) {
          const rect = typingBox.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            left = rect.left;
            width = rect.width;
            top = rect.top;
          }
        }
      }

      const colors =
        customPalette && customPalette.length > 0
          ? customPalette
          : ['#137547', '#bc5215', '#102a3a', '#d97706', '#ffd166'];

      const id = nextUid('burst_enter');
      const particleCount = 32;
      const particles = Array.from({ length: particleCount }, (_, idx) => {
        const normalizedX = (idx + 0.5) / particleCount;
        const jitter = (Math.random() - 0.5) * (1 / particleCount) * 1.5;
        const xOffset = Math.max(8, Math.min(width - 8, (normalizedX + jitter) * width));
        const yOffset = (Math.random() - 0.5) * 4;
        const centerFactor = 1 - Math.abs(normalizedX - 0.5) * 0.8;
        const upDistance = (45 + Math.random() * 85) * (0.85 + centerFactor * 0.35);
        const xDrift = (normalizedX - 0.5) * 35 + (Math.random() - 0.5) * 45;

        return {
          x: xOffset,
          y: yOffset,
          dx: xDrift,
          dy: -upDistance,
          size: 5 + Math.random() * 6.5,
          color: colors[idx % colors.length],
          rot: Math.floor(Math.random() * 360),
        };
      });

      setParticleBursts((prev) => [
        ...prev,
        { id, x: left, y: top, isPixel: true, particles },
      ]);
      window.setTimeout(() => {
        setParticleBursts((prev) => prev.filter((b) => b.id !== id));
      }, 750);
    },
    []
  );

  const spawnPopup = useCallback((target: 'player' | string, text: string, color: string) => {
    const id = nextUid('popup');
    setFloatingPopups((prev) => [...prev, { id, target, text, color }]);
    window.setTimeout(() => {
      setFloatingPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1850);
  }, []);

  const triggerProjectile = useCallback(
    async (from: 'player' | number, to: 'player' | number, color: string) => {
      const id = nextUid('proj');
      setActiveProjectile({ id, from, to, color });
      await delay(360);
      setActiveProjectile(null);
    },
    []
  );

  useEffect(() => {
    if (difficulty !== 'extra_hard' || !actionStartTime || typedInput.trim().length === 0) {
      setLiveWpm(40);
      return;
    }
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - actionStartTime;
      const totalChars = actionCharAccum + typedInput.trim().length;
      setLiveWpm(calculateWpm(totalChars, elapsed));
    }, 80);
    return () => window.clearInterval(interval);
  }, [actionStartTime, actionCharAccum, difficulty, typedInput]);

  // Biome popup auto-shrinks to top-bar after 15s in battle
  useEffect(() => {
    if (screen === 'battle' && biomePopupExpanded) {
      const timer = window.setTimeout(() => {
        setBiomePopupExpanded(false);
        setBiomePopupManual(false);
      }, 15000);
      return () => window.clearTimeout(timer);
    }
  }, [screen, biomePopupExpanded]);

  // Automatically record newly collected cards and relics in player's Codex
  useEffect(() => {
    if (deck.length > 0 || relicIds.length > 0) {
      setCodexDiscovery(
        unlockCodexEntries({
          cards: deck.map((c) => c.cardId),
          relics: relicIds,
        })
      );
    }
  }, [deck, relicIds]);

  // Continuous background ambiance for every encounter and battle scene biome
  useEffect(() => {
    if (devEditorOpen) {
      soundEngine.stopAmbiance(0.2);
      return;
    }
    if (screen === 'battle' && activeEnvironment) {
      soundEngine.startAmbiance(activeEnvironment.id, settings);
    } else if (screen === 'campfire') {
      soundEngine.startAmbiance('campfire', settings);
    } else if (screen === 'merchant') {
      soundEngine.startAmbiance('merchant', settings);
    } else if (screen === 'treasure') {
      soundEngine.startAmbiance('treasure', settings);
    } else if (screen === 'mystery') {
      soundEngine.startAmbiance('mystery', settings);
    } else if (screen === 'map') {
      soundEngine.startAmbiance('map', settings);
    } else if (screen === 'main_menu' || screen === 'peasant_intro' || screen === 'tutorial') {
      soundEngine.startAmbiance('sunlit_sanctuary', settings);
    } else if (screen === 'reward') {
      if (activeEnvironment) {
        soundEngine.startAmbiance(activeEnvironment.id, settings);
      } else {
        soundEngine.startAmbiance('map', settings);
      }
    } else if (screen === 'victory' || screen === 'game_over') {
      soundEngine.stopAmbiance(1.5);
    }
  }, [devEditorOpen, screen, activeEnvironment?.id, settings.muted, settings.volume]);

  useEffect(() => {
    soundEngine.updateAmbianceVolume(settings);
  }, [settings.muted, settings.volume]);

  useEffect(() => {
    return () => {
      soundEngine.stopAmbiance(0.3);
    };
  }, []);

  const wpmRelicBonus = useMemo(() => {
    return relicIds.reduce((sum, id) => {
      const r = getRelicDefinition(id);
      if (r && r.effectType === 'wpm_boost') return sum + r.amount;
      return sum;
    }, 0);
  }, [relicIds]);

  const liveEffectiveness = useMemo(
    () => calculateSpeedEffectiveness(liveWpm, difficulty, wpmRelicBonus),
    [liveWpm, difficulty, wpmRelicBonus]
  );

  const resetTypingBuffer = useCallback((resetCardTimer: boolean = true) => {
    setTypedInput('');
    if (resetCardTimer) {
      setActionStartTime(null);
      setActionCharAccum(0);
      setLiveWpm(40);
    }
  }, []);

  const recordActionMetrics = useCallback(
    (finalPhrase: string, editDistance: number): number => {
      const elapsed = actionStartTime ? Math.max(400, Date.now() - actionStartTime) : 1500;
      const chars = actionCharAccum + finalPhrase.length;
      const measuredWpm = calculateWpm(chars, elapsed);
      const eff = calculateSpeedEffectiveness(measuredWpm, difficulty, wpmRelicBonus);

      setMetrics((prev) => ({
        ...prev,
        totalCharsTyped: prev.totalCharsTyped + chars,
        totalErrorsCost: prev.totalErrorsCost + editDistance,
        totalActionsSubmitted: prev.totalActionsSubmitted + 1,
        wpmSamples: [...prev.wpmSamples, measuredWpm],
        peakWpm: Math.max(prev.peakWpm, measuredWpm),
      }));

      return eff.multiplier;
    },
    [actionStartTime, actionCharAccum, difficulty, wpmRelicBonus]
  );

  const drawCards = useCallback(
    (
      count: number,
      currentHand: CardInstance[],
      currentDraw: CardInstance[],
      currentDiscard: CardInstance[],
      lockedCardIds?: Set<string>
    ): {
      nextHand: CardInstance[];
      nextDraw: CardInstance[];
      nextDiscard: CardInstance[];
      drawnCards: CardInstance[];
    } => {
      const nextHand = [...currentHand];
      let nextDraw = [...currentDraw];
      let nextDiscard = [...currentDiscard];
      const drawnCards: CardInstance[] = [];
      const locked = lockedCardIds ?? turnLockedCardIds;

      for (let i = 0; i < count; i++) {
        if (nextHand.length >= 10) break;
        if (nextDraw.length === 0) {
          // Exclude cards used or discarded this turn from mid-turn reshuffles
          const eligibleToReshuffle = nextDiscard.filter((c) => !locked.has(c.instanceId));
          if (eligibleToReshuffle.length === 0) break;
          nextDraw = shuffleArray(eligibleToReshuffle);
          nextDiscard = nextDiscard.filter((c) => locked.has(c.instanceId));
        }
        if (nextDraw.length === 0) break;
        const drawn = nextDraw.shift();
        if (drawn) {
          if (locked.has(drawn.instanceId)) {
            // Guard: Never draw a card that was used or discarded this turn! Put it into nextDiscard
            nextDiscard.push(drawn);
            i--; // Retry this draw iteration
            continue;
          }
          nextHand.push(drawn);
          drawnCards.push(drawn);
        }
      }

      return { nextHand, nextDraw, nextDiscard, drawnCards };
    },
    [turnLockedCardIds]
  );

  const captureCardExit = useCallback(
    (cardInst: CardInstance, discardIdx = 0): ExitingCardState => {
      let topOffset = 0;
      let leftOffset = 0;
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const cardEl = document.querySelector(`[data-card-id="${cardInst.instanceId}"]`);
        const stackEl = document.querySelector('.cards-stack');
        if (cardEl && stackEl) {
          const cardRect = cardEl.getBoundingClientRect();
          const stackRect = stackEl.getBoundingClientRect();
          topOffset = cardRect.top - stackRect.top;
          leftOffset = cardRect.left - stackRect.left;
        }
      }
      return {
        instance: cardInst,
        resolved: resolveCardInstance(cardInst, phraseDiff),
        topOffset,
        leftOffset,
        discardIdx,
      };
    },
    [phraseDiff]
  );

  const triggerCardExits = useCallback(
    (cardsToExit: { card: CardInstance; idx: number }[]) => {
      if (cardsToExit.length === 0) return;
      const captured: ExitingCardState[] = cardsToExit.map(({ card, idx }) =>
        captureCardExit(card, idx)
      );
      setExitingCards((prev) => [...prev, ...captured]);
      const maxWait = cardsToExit.length * 90 + 520;
      window.setTimeout(() => {
        const exitedIds = new Set(captured.map((c) => c.instance.instanceId));
        setExitingCards((prev) => prev.filter((c) => !exitedIds.has(c.instance.instanceId)));
      }, maxWait);
    },
    [captureCardExit]
  );

  const markCardsEntering = useCallback((newCards: CardInstance[]) => {
    if (newCards.length === 0) return;
    setEnteringCardMap((prev) => {
      const next = new Map(prev);
      newCards.forEach((c, idx) => {
        next.set(c.instanceId, idx);
      });
      return next;
    });
    const totalDuration = newCards.length * 120 + 650;
    window.setTimeout(() => {
      setEnteringCardMap((prev) => {
        const next = new Map(prev);
        newCards.forEach((c) => {
          next.delete(c.instanceId);
        });
        return next;
      });
    }, totalDuration);
  }, []);

  const startBattle = useCallback(
    (
      floorNum: number,
      nodeType: 'battle' | 'elite' | 'boss',
      currentDeck: CardInstance[],
      currentRelics: string[],
      customEnemies?: ActiveEnemy[],
      noCardReward: boolean = false
    ) => {
      setSkipCardRewardOnBattleWin(noCardReward);
      setActiveNodeType(nodeType);
      if (nodeType === 'elite' || nodeType === 'boss') {
        soundEngine.playEliteBossEntrance(settings);
      } else {
        soundEngine.playBattleEntrance(settings);
      }
      const spawnedEnemies =
        customEnemies && customEnemies.length > 0
          ? customEnemies
          : generateEncounter(floorNum, nodeType, phraseDiff);

      let startWard = 0;
      let startBold = 0;
      let bonusEnergy = 0;
      let bonusDraw = 0;

      currentRelics.forEach((rId) => {
        const rel = getRelicDefinition(rId);
        if (!rel) return;
        if (rel.trigger === 'combat_start') {
          if (rel.effectType === 'ward') startWard += rel.amount;
          if (rel.effectType === 'bold') startBold += rel.amount;
          if (rel.effectType === 'energy') bonusEnergy += rel.amount;
          if (rel.effectType === 'draw') bonusDraw += rel.amount;
          if (rel.effectType === 'exposed_all') {
            spawnedEnemies.forEach((e) => (e.statuses.exposed += rel.amount));
          }
          if (rel.effectType === 'faded_all') {
            spawnedEnemies.forEach((e) => (e.statuses.faded += rel.amount));
          }
          if (rel.effectType === 'ink_burn_all') {
            spawnedEnemies.forEach((e) => (e.statuses.ink_burn += rel.amount));
          }
        }
        if (rel.trigger === 'passive_energy' && rel.effectType === 'energy') {
          bonusEnergy += rel.amount;
        }
        if (rel.trigger === 'passive_draw' && rel.effectType === 'draw') {
          bonusDraw += rel.amount;
        }
      });

      if (currentRelics.includes('magical_typewriter')) {
        bonusDraw += 1;
      }

      const chosenEnv = chooseBattleEnvironment(floorNum);
      setActiveEnvironment(chosenEnv);
      const envMod = chosenEnv.modifiers || {};
      if (envMod.energyBonus) {
        bonusEnergy += envMod.energyBonus;
      }
      if (envMod.drawBonus) {
        bonusDraw += envMod.drawBonus;
      }
      if (envMod.turnStartWardAll) {
        startWard += envMod.turnStartWardAll;
        spawnedEnemies.forEach((e) => {
          e.ward += envMod.turnStartWardAll!;
        });
      }

      const baseTurnEnergy = Math.max(1, 3 + bonusEnergy);
      setMaxEnergy(baseTurnEnergy);
      setEnergy(baseTurnEnergy);
      setPlayerWard(startWard);
      setPlayerStatuses({
        bold: startBold,
        faded: 0,
        exposed: 0,
        ink_burn: 0,
        plated_armor: 0,
        thorns: 0,
      });

      const shuffled = shuffleArray(currentDeck);
      const initialDrawCount = Math.min(8, 5 + bonusDraw);
      const { nextHand, nextDraw, nextDiscard, drawnCards } = drawCards(initialDrawCount, [], shuffled, [], new Set());

      soundEngine.playShuffle(settings);
      soundEngine.playDrawCards(initialDrawCount, settings);
      cardPositionsRef.current.clear();
      setExitingCards([]);
      markCardsEntering(drawnCards);
      setHand(nextHand);
      setDrawPile(nextDraw);
      setDiscardPile(nextDiscard);
      setBurnDraftPile([]);
      setActivePowers([]);
      setRetainedCardIds(new Set());
      setPendingKeepCount(0);
      setPendingDiscardCount(0);
      setPendingFollowUpDraw(0);
      setTurnLockedCardIds(new Set());
      setUsedPowerCardIdsThisCombat(new Set());
      setEnemies(spawnedEnemies);
      setAllies([]);
      setSelectedCard(null);
      setSelectedTargetEnemy(null);
      setSelectedDiscardInstances([]);
      setFloatingPopups([]);
      resetTypingBuffer(true);
      setBiomePopupExpanded(true);
      setBiomePopupManual(false);
      setCodexDiscovery(
        unlockCodexEntries({
          enemies: spawnedEnemies.map((e) => e.enemyId),
          environments: [chosenEnv.id],
          cards: currentDeck.map((c) => c.cardId),
          relics: currentRelics,
        })
      );
      setScreen('battle');
      setHandAnimState('drawing');
      window.setTimeout(() => setHandAnimState('idle'), 420);

      if (!hasShownCombatTutorialThisRun) {
        setHasShownCombatTutorialThisRun(true);
        setCombatTutorialStep(7);
        setOverlay('combat_tutorial');
      }
    },
    [drawCards, hasShownCombatTutorialThisRun, phraseDiff, resetTypingBuffer, settings]
  );

  const handleCombatVictory = useCallback(
    (survivingHp: number) => {
      if (currentFloor >= mapFloors.length || activeNodeType === 'boss') {
        if (difficulty === 'hard' || difficulty === 'extra_hard') {
          setExtraHardUnlocked(true);
          setExtraHardAvailable(true);
        }
        clearLocalRun();
        soundEngine.playVictoryFanfare(settings);
        setScreen('victory');
        return;
      }

      let healOnWin = 0;
      let bonusGold = 0;
      relicIds.forEach((id) => {
        const r = getRelicDefinition(id);
        if (r && r.trigger === 'combat_victory') {
          if (r.effectType === 'heal') healOnWin += r.amount;
          if (r.effectType === 'gold') bonusGold += r.amount;
        }
      });

      const finalHp = Math.min(maxHp, survivingHp + healOnWin);
      setHp(finalHp);

      const goldEarned =
        (activeNodeType === 'elite'
          ? 35 + Math.floor(Math.random() * 15)
          : 18 + Math.floor(Math.random() * 12)) + bonusGold;
      setGold((g) => g + goldEarned);
      setRewardGoldClaimed(goldEarned);
      soundEngine.playBattleVictory(settings);
      if (goldEarned > 0) {
        soundEngine.playCoinClink(settings);
      }

      if (skipCardRewardOnBattleWin) {
        setRewardCards([]);
        if (activeNodeType === 'elite') {
          setRewardRelics(generateRelicRewards(relicIds, 3));
          setRewardStep('relic');
        } else {
          setRewardRelics([]);
        }
      } else {
        setRewardCards(generateCardRewards(4, activeNodeType === 'elite'));
        setRewardRelics(activeNodeType === 'elite' ? generateRelicRewards(relicIds, 3) : []);
        setRewardStep('card');
      }
      setSkipCardRewardOnBattleWin(false);

      setMetrics((prev) => ({
        ...prev,
        floorsCleared: prev.floorsCleared + 1,
      }));

      setSelectedCard(null);
      setSelectedTargetEnemy(null);
      setSelectedDiscardInstances([]);
      setRetainedCardIds(new Set());
      setPendingKeepCount(0);
      setPendingDiscardCount(0);
      setPendingFollowUpDraw(0);
      setTurnLockedCardIds(new Set());
      setUsedPowerCardIdsThisCombat(new Set());
      setAllies([]);
      resetTypingBuffer(true);
      setScreen('reward');
    },
    [activeNodeType, currentFloor, difficulty, mapFloors.length, maxHp, relicIds, resetTypingBuffer]
  );

  const executeCardPlay = useCallback(
    async (
      cardInst: CardInstance,
      targetEnemy: ActiveEnemy | null,
      speedMult: number,
      preConfirmedDiscards: CardInstance[] = []
    ) => {
      const resolved = resolveCardInstance(cardInst, phraseDiff);
      const isXCost = Boolean((resolved as any).xCost || resolved.cost === -1);
      if (resolved.type === 'power' && usedPowerCardIdsThisCombat.has(cardInst.cardId)) {
        soundEngine.playError(settings);
        spawnPopup('player', 'Power already active this combat!', '#ef4444');
        return;
      }
      if ((!isXCost && energy < resolved.cost) || isAnimatingTurn) {
        soundEngine.playError(settings);
        if (!isXCost && energy < resolved.cost) {
          spawnPopup('player', `Need ${resolved.cost} Energy!`, '#b84a14');
        }
        return;
      }
      const xMultiplier = isXCost ? Math.max(0, energy) : 1;
      let nextEnergy = isXCost ? 0 : energy - resolved.cost;

      soundEngine.playCardSound(resolved.cardId, settings, resolved.sfx);
      const cardPalette = [
        resolved.art.primaryColor || '#bc5215',
        resolved.art.secondaryColor || '#d97706',
        '#137547',
        '#ffd166',
      ];
      if (targetEnemy) {
        triggerElementParticles(`[data-enemy-id="${targetEnemy.instanceId}"]`, cardPalette, 72, 46);
      } else if (resolved.target === 'all_enemies') {
        triggerElementParticles('.enemies-formation', cardPalette, 72, 46);
      } else {
        triggerElementParticles('[data-player-spot="true"]', cardPalette, 36, 48);
      }
      setIsAnimatingTurn(true);
      setBiomePopupExpanded(false);
      setBiomePopupManual(false);
      setSelectedCard(null);
      setSelectedTargetEnemy(null);
      setSelectedDiscardInstances([]);
      resetTypingBuffer(true);

      let nextWard = playerWard;
      let nextHp = hp;
      const nextPlayerStatuses = { ...playerStatuses };
      const nextEnemies = enemies.map((e) => ({
        ...e,
        statuses: { ...e.statuses },
      }));
      const nextAllies = allies.map((a) => ({
        ...a,
        statuses: { ...a.statuses },
      }));
      if (retainedCardIds.has(cardInst.instanceId)) {
        setRetainedCardIds((prev) => {
          const next = new Set(prev);
          next.delete(cardInst.instanceId);
          return next;
        });
      }

      let nextHand = hand.filter((c) => c.instanceId !== cardInst.instanceId);
      let nextDiscard = [...discardPile];
      let nextBurn = [...burnDraftPile];

      const activeTurnLockedIds = new Set(turnLockedCardIds);
      activeTurnLockedIds.add(cardInst.instanceId);

      const cardsToExitList: { card: CardInstance; idx: number }[] = [
        { card: cardInst, idx: 0 },
      ];

      if (preConfirmedDiscards.length > 0) {
        const preDiscardIds = new Set(preConfirmedDiscards.map((c) => c.instanceId));
        nextHand = nextHand.filter((c) => !preDiscardIds.has(c.instanceId));
        nextDiscard = [...nextDiscard, ...preConfirmedDiscards];
        preConfirmedDiscards.forEach((c, idx) => {
          cardsToExitList.push({ card: c, idx: idx + 1 });
          activeTurnLockedIds.add(c.instanceId);
          if (retainedCardIds.has(c.instanceId)) {
            setRetainedCardIds((prev) => {
              const next = new Set(prev);
              next.delete(c.instanceId);
              return next;
            });
          }
          const def = getCardDefinition(c.cardId);
          spawnPopup('player', `🗑️ Discarded "${def.names[phraseDiff]}"!`, '#e11d48');
          triggerElementParticles(`[data-card-id="${c.instanceId}"]`, ['#e11d48', '#f43f5e', '#ffd166'], 48, 4);
        });
      }
      triggerCardExits(cardsToExitList);

      let totalDmgDealtThisCard = 0;
      let extraDraw = 0;
      let hasKeepCardEffect = false;
      let keepCardCount = 0;
      let hasDiscardChoiceEffect = false;
      let discardChoiceCount = 0;
      let followUpDraw = 0;

      const scaleAmount = (raw: number): number => {
        if (difficulty !== 'extra_hard') return raw;
        return Math.max(1, Math.round(raw * speedMult));
      };

      if (resolved.target === 'enemy' || resolved.target === 'all_enemies') {
        const targetIdx = targetEnemy
          ? Math.max(0, nextEnemies.findIndex((e) => e.instanceId === targetEnemy.instanceId))
          : 0;
        await triggerProjectile('player', targetIdx, resolved.art.primaryColor || '#bc5215');
      }

      const envMod = activeEnvironment?.modifiers || {};

      const dealHitToEnemy = (enemyObj: ActiveEnemy, baseDamage: number) => {
        let dmg = scaleAmount(baseDamage) + nextPlayerStatuses.bold + (envMod.damageBonus ?? 0);
        if (nextPlayerStatuses.faded > 0) {
          dmg = Math.max(0, dmg - nextPlayerStatuses.faded);
        }
        if (enemyObj.statuses.exposed > 0) {
          dmg = Math.floor(dmg * 1.5);
        }
        dmg = Math.max(0, dmg);

        const blocked = Math.min(enemyObj.ward, dmg);
        enemyObj.ward -= blocked;
        const hpLoss = dmg - blocked;
        enemyObj.hp = Math.max(0, enemyObj.hp - hpLoss);
        totalDmgDealtThisCard += hpLoss;

        const enemyWardBroke = blocked > 0 && enemyObj.ward === 0;

        if (blocked > 0 && hpLoss > 0) {
          if (enemyWardBroke) soundEngine.playWardBreak(settings);
          soundEngine.playHit(settings);
          spawnPopup(enemyObj.instanceId, `-${hpLoss} HP (${blocked} Blocked)`, '#e63946');
        } else if (blocked > 0) {
          if (enemyWardBroke) {
            soundEngine.playWardBreak(settings);
          } else {
            soundEngine.playWardBlock(settings);
          }
          spawnPopup(enemyObj.instanceId, `${blocked} Blocked`, '#1d6fa5');
        } else if (hpLoss > 0) {
          soundEngine.playHit(settings);
          spawnPopup(enemyObj.instanceId, `-${hpLoss} HP`, '#e63946');
        }

        if (enemyObj.statuses.thorns > 0 && hpLoss > 0) {
          const thornsDmg = enemyObj.statuses.thorns;
          nextHp = Math.max(0, nextHp - thornsDmg);
          spawnPopup('player', `-${thornsDmg} Thorns`, '#059669');
          soundEngine.playHit(settings);
        }
      };

      for (const eff of resolved.effects) {
        const effTarget = eff.target || resolved.target;
        let targetList =
          effTarget === 'all_enemies'
            ? nextEnemies
            : targetEnemy
            ? nextEnemies.filter((e) => e.instanceId === targetEnemy.instanceId)
            : nextEnemies.slice(0, 1);

        if (eff.targetCount && eff.targetCount > 1 && effTarget !== 'self') {
          targetList = nextEnemies.filter((e) => e.hp > 0).slice(0, eff.targetCount);
        }

        const hits = eff.hits || 1;

        switch (eff.type) {
          case 'damage': {
            for (let h = 0; h < hits; h++) {
              targetList.forEach((en) => {
                if (en.hp > 0) dealHitToEnemy(en, eff.amount * xMultiplier);
              });
              if (hits > 1 && h < hits - 1) await delay(180);
            }
            break;
          }
          case 'damage_per_ward': {
            targetList.forEach((en) => {
              if (en.hp > 0) dealHitToEnemy(en, nextWard * eff.amount * xMultiplier);
            });
            break;
          }
          case 'ward': {
            const gained = Math.max(0, scaleAmount(eff.amount * xMultiplier) + (envMod.wardBonus ?? 0));
            nextWard += gained;
            spawnPopup('player', `+${gained} Ward`, '#1d6fa5');
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'double_ward': {
            const gained = nextWard;
            nextWard += gained;
            spawnPopup('player', `+${gained} Ward`, '#1d6fa5');
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'gain_ward_per_card_in_hand': {
            const gained = Math.max(
              0,
              scaleAmount(eff.amount * xMultiplier) * Math.max(0, nextHand.length) + (envMod.wardBonus ?? 0)
            );
            nextWard += gained;
            spawnPopup('player', `+${gained} Ward`, '#1d6fa5');
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'bold': {
            const amt = Math.max(0, scaleAmount(eff.amount * xMultiplier) + (envMod.statusBonus ?? 0));
            nextPlayerStatuses.bold += amt;
            spawnPopup('player', `+${amt} Bold`, '#d97706');
            break;
          }
          case 'faded': {
            const amt = Math.max(0, scaleAmount(eff.amount * xMultiplier) + (envMod.statusBonus ?? 0));
            if (eff.target === 'self' || eff.target === 'player' || effTarget === 'self' || effTarget === 'player') {
              nextPlayerStatuses.faded += amt;
              spawnPopup('player', `+${amt} Faded`, '#64748b');
            } else {
              targetList.forEach((en) => {
                en.statuses.faded += amt;
                spawnPopup(en.instanceId, `+${amt} Faded`, '#64748b');
              });
            }
            break;
          }
          case 'exposed': {
            const amt = Math.max(0, scaleAmount(eff.amount * xMultiplier) + (envMod.statusBonus ?? 0));
            if (eff.target === 'self' || eff.target === 'player' || effTarget === 'self' || effTarget === 'player') {
              nextPlayerStatuses.exposed += amt;
              spawnPopup('player', `+${amt} Exposed`, '#be123c');
            } else {
              targetList.forEach((en) => {
                en.statuses.exposed += amt;
                spawnPopup(en.instanceId, `+${amt} Exposed`, '#be123c');
              });
            }
            break;
          }
          case 'ink_burn': {
            const amt = Math.max(0, scaleAmount(eff.amount * xMultiplier) + (envMod.statusBonus ?? 0));
            targetList.forEach((en) => {
              en.statuses.ink_burn += amt;
              spawnPopup(en.instanceId, `+${amt} Ink Burn`, '#6d28d9');
            });
            break;
          }
          case 'double_ink_burn': {
            targetList.forEach((en) => {
              en.statuses.ink_burn *= 2;
              spawnPopup(en.instanceId, `2x Ink Burn!`, '#6d28d9');
            });
            break;
          }
          case 'draw': {
            if (hasDiscardChoiceEffect) {
              followUpDraw += eff.amount * xMultiplier;
            } else {
              extraDraw += eff.amount * xMultiplier;
            }
            break;
          }
          case 'energy': {
            nextEnergy += eff.amount * xMultiplier;
            spawnPopup('player', `+${eff.amount * xMultiplier} Energy`, '#2a9d8f');
            break;
          }
          case 'heal': {
            const healAmt = Math.max(0, scaleAmount(eff.amount * xMultiplier) + (envMod.healBonus ?? 0));
            nextHp = Math.min(maxHp, nextHp + healAmt);
            spawnPopup('player', `+${healAmt} HP`, '#3a8918');
            break;
          }
          case 'self_damage': {
            nextHp = Math.max(1, nextHp - eff.amount);
            spawnPopup('player', `-${eff.amount} HP`, '#e63946');
            break;
          }
          case 'summon': {
            const summonTargetId = eff.summonId || 'origami_cat';
            const summonDef = ENEMIES_CATALOG.find((e) => e.id === summonTargetId);
            const summonTeam = eff.team || 'player';
            const count = Math.max(1, (eff.amount || 1) * xMultiplier);
            const hpBonus = eff.hpBonus || 0;
            const wardBonus = eff.wardBonus || 0;

            if (summonDef) {
              for (let sIdx = 0; sIdx < count; sIdx++) {
                const newEntity = createSummonInstance(
                  summonDef,
                  phraseDiff,
                  summonTeam,
                  hpBonus,
                  wardBonus
                );
                if (summonTeam === 'player') {
                  nextAllies.push(newEntity);
                  soundEngine.playPageTurn(settings);
                  spawnPopup('player', `Summoned ${newEntity.displayName}!`, '#10b981');
                } else {
                  if (nextEnemies.length < 5) {
                    nextEnemies.push(newEntity);
                    soundEngine.playPageTurn(settings);
                    spawnPopup(newEntity.instanceId, `Joined enemy fray!`, '#ef4444');
                  }
                }
              }
            }
            break;
          }
          case 'plated_armor': {
            const gained = Math.max(0, scaleAmount(eff.amount * xMultiplier));
            nextPlayerStatuses.plated_armor += gained;
            spawnPopup('player', `+${gained} Plated Armor`, '#2563eb');
            break;
          }
          case 'thorns': {
            const gained = Math.max(0, scaleAmount(eff.amount * xMultiplier));
            nextPlayerStatuses.thorns += gained;
            spawnPopup('player', `+${gained} Thorns`, '#059669');
            break;
          }
          case 'keep_card': {
            hasKeepCardEffect = true;
            keepCardCount += Math.max(1, eff.amount * xMultiplier);
            break;
          }
          case 'discard_random': {
            const count = Math.max(1, eff.amount * xMultiplier);
            const eligible = nextHand.filter((c) => c.instanceId !== cardInst.instanceId);
            const picked = [...eligible].sort(() => 0.5 - Math.random()).slice(0, count);
            if (picked.length > 0) {
              const pickedIds = new Set(picked.map((p) => p.instanceId));
              nextHand = nextHand.filter((c) => !pickedIds.has(c.instanceId));
              nextDiscard = [...nextDiscard, ...picked];
              soundEngine.playPageTurn(settings);
              picked.forEach((c) => {
                activeTurnLockedIds.add(c.instanceId);
                const def = getCardDefinition(c.cardId);
                spawnPopup('player', `Discarded ${def.names[phraseDiff]}`, '#64748b');
              });
            }
            break;
          }
          case 'discard': {
            const rawDiscardCount = Math.max(1, eff.amount * xMultiplier);
            const remainingDiscardChoice = Math.max(0, rawDiscardCount - preConfirmedDiscards.length);
            if (remainingDiscardChoice > 0 && preConfirmedDiscards.length === 0) {
              hasDiscardChoiceEffect = true;
              discardChoiceCount += remainingDiscardChoice;
            }
            break;
          }
          case 'power_ward_each_turn':
          case 'power_bold_each_turn':
          case 'power_draw_each_turn':
          case 'power_energy_each_turn':
          case 'power_heal_each_turn':
          case 'power_ink_burn_all_each_turn':
          case 'power_damage_all_each_turn':
          case 'power_ward_on_card_play':
          case 'power_damage_all_on_attack':
          case 'power_keep_card_each_turn': {
            const pType = eff.type as PowerEffectType;
            const pAmt = scaleAmount(eff.amount);
            const labelMap: Record<PowerEffectType, string> = {
              power_ward_each_turn: `Ward +${pAmt}/turn`,
              power_bold_each_turn: `Bold +${pAmt}/turn`,
              power_draw_each_turn: `Draw +${pAmt}/turn`,
              power_energy_each_turn: `Energy +${pAmt}/turn`,
              power_heal_each_turn: `Heal +${pAmt}/turn`,
              power_ink_burn_all_each_turn: `Ink Burn ${pAmt}/turn`,
              power_damage_all_each_turn: `Deal ${pAmt} All/turn`,
              power_ward_on_card_play: `Ward +${pAmt}/card`,
              power_damage_all_on_attack: `Fire Breath ${pAmt}/atk`,
              power_keep_card_each_turn: `Keep +${pAmt}/turn`,
            };
            setActivePowers((prev) => {
              const existingIdx = prev.findIndex((p) => p.type === pType);
              if (existingIdx >= 0) {
                const updated = [...prev];
                const newAmt = updated[existingIdx].amount + pAmt;
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  amount: newAmt,
                  label: labelMap[pType].replace(String(pAmt), String(newAmt)),
                };
                return updated;
              }
              return [
                ...prev,
                {
                  id: nextUid('pwr'),
                  name: resolved.name,
                  type: pType,
                  amount: pAmt,
                  label: labelMap[pType],
                },
              ];
            });
            spawnPopup('player', `Power: ${labelMap[pType]}`, '#b67d10');
            break;
          }
        }
      }

      // Trigger active combat powers that fire on card play or attack play
      activePowers.forEach((pwr) => {
        if (pwr.type === 'power_ward_on_card_play') {
          nextWard += pwr.amount;
          spawnPopup('player', `+${pwr.amount} Ward (${pwr.name})`, '#1d6fa5');
          setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + pwr.amount }));
        }
        if (pwr.type === 'power_damage_all_on_attack' && resolved.type === 'attack') {
          nextEnemies.forEach((en) => {
            if (en.hp > 0) dealHitToEnemy(en, pwr.amount);
          });
        }
      });

      relicIds.forEach((rId) => {
        const rel = getRelicDefinition(rId);
        if (!rel) return;
        if (rel.trigger === 'on_card_play' && rel.effectType === 'ward') {
          nextWard += rel.amount;
        }
        if (rel.trigger === 'on_attack' && resolved.type === 'attack' && rel.effectType === 'damage_all') {
          nextEnemies.forEach((en) => {
            en.hp = Math.max(0, en.hp - rel.amount);
            totalDmgDealtThisCard += rel.amount;
          });
        }
      });

      const deadEnemies = nextEnemies.filter((e) => e.hp <= 0);
      const killedCount = deadEnemies.length;
      if (killedCount > 0) {
        if (
          deadEnemies.some(
            (e) =>
              e.enemyId === 'rock_titan' ||
              e.enemyId === 'boss_rock_mountain' ||
              e.enemyId === 'rock_elemental' ||
              e.enemyId === 'rock_golem'
          )
        ) {
          soundEngine.playRockBossDefeat(settings);
        }
        relicIds.forEach((rId) => {
          const rel = getRelicDefinition(rId);
          if (rel && rel.trigger === 'on_kill') {
            if (rel.effectType === 'energy') nextEnergy += rel.amount * killedCount;
            if (rel.effectType === 'heal') nextHp = Math.min(maxHp, nextHp + rel.amount * killedCount);
          }
        });
      }

      const aliveEnemies = nextEnemies.filter((e) => e.hp > 0);

      if (resolved.burnDraft || resolved.type === 'power') {
        soundEngine.playBurnCard(settings);
        nextBurn.push(cardInst);
        if (resolved.type === 'power') {
          setUsedPowerCardIdsThisCombat((prev) => new Set([...prev, cardInst.cardId]));
        }
      } else {
        nextDiscard.push(cardInst);
      }

      const drawnResult =
        extraDraw > 0
          ? drawCards(extraDraw, nextHand, drawPile, nextDiscard, activeTurnLockedIds)
          : { nextHand, nextDraw: drawPile, nextDiscard, drawnCards: [] };

      if (extraDraw > 0) {
        soundEngine.playDrawCards(extraDraw, settings);
        markCardsEntering(drawnResult.drawnCards);
        setHandAnimState('drawing');
        window.setTimeout(() => setHandAnimState('idle'), 380);
      }

      setTurnLockedCardIds(activeTurnLockedIds);

      setEnergy(nextEnergy);
      setPlayerWard(nextWard);
      setHp(nextHp);
      setPlayerStatuses(nextPlayerStatuses);
      setHand(drawnResult.nextHand);
      setDrawPile(drawnResult.nextDraw);
      setDiscardPile(drawnResult.nextDiscard);
      setBurnDraftPile(nextBurn);

      // Health thresholds and "last standing" do not rewrite a move that is already
      // telegraphed. The next intent is chosen after that move resolves.
      setEnemies(aliveEnemies);
      setAllies(nextAllies.filter((a) => a.hp > 0));

      setMetrics((prev) => ({
        ...prev,
        cardsPlayed: prev.cardsPlayed + 1,
        totalDamageDealt: prev.totalDamageDealt + totalDmgDealtThisCard,
        enemiesDefeated: prev.enemiesDefeated + killedCount,
      }));

      setIsAnimatingTurn(false);

      if (aliveEnemies.length > 0 && hasDiscardChoiceEffect) {
        const eligible = drawnResult.nextHand;
        if (eligible.length === 0) {
          spawnPopup('player', 'No cards in hand to discard', '#64748b');
          if (followUpDraw > 0) {
            const drawn = drawCards(
              followUpDraw,
              drawnResult.nextHand,
              drawnResult.nextDraw,
              drawnResult.nextDiscard,
              activeTurnLockedIds
            );
            markCardsEntering(drawn.drawnCards);
            setHand(drawn.nextHand);
            setDrawPile(drawn.nextDraw);
            setDiscardPile(drawn.nextDiscard);
            soundEngine.playDrawCards(followUpDraw, settings);
            setHandAnimState('drawing');
            window.setTimeout(() => setHandAnimState('idle'), 380);
          }
        } else {
          setPendingDiscardCount((prev) => prev + discardChoiceCount);
          if (followUpDraw > 0) {
            setPendingFollowUpDraw((prev) => prev + followUpDraw);
          }
          soundEngine.playPageTurn(settings);
          spawnPopup('player', `🗑️ Choose ${discardChoiceCount} card${discardChoiceCount > 1 ? 's' : ''} to DISCARD!`, '#e11d48');
        }
      }

      if (aliveEnemies.length > 0 && hasKeepCardEffect) {
        const eligible = drawnResult.nextHand.filter((c) => !retainedCardIds.has(c.instanceId));
        if (eligible.length === 0) {
          if (drawnResult.nextHand.length === 0) {
            spawnPopup('player', '📌 Card will be kept once drawn or before discard', '#10b981');
          } else {
            spawnPopup('player', 'All hand cards already kept!', '#059669');
          }
        } else {
          soundEngine.playPageTurn(settings);
          spawnPopup('player', '📌 Choose a card to KEEP!', '#10b981');
        }
        setPendingKeepCount((prev) => prev + keepCardCount);
      }

      if (aliveEnemies.length === 0) {
        await delay(300);
        handleCombatVictory(nextHp);
      }
    },
    [
      activeEnvironment,
      activePowers,
      allies,
      burnDraftPile,
      difficulty,
      discardPile,
      drawCards,
      drawPile,
      enemies,
      energy,
      hand,
      handleCombatVictory,
      hp,
      isAnimatingTurn,
      maxHp,
      phraseDiff,
      playerStatuses,
      playerWard,
      relicIds,
      resetTypingBuffer,
      retainedCardIds,
      settings,
      spawnPopup,
      triggerElementParticles,
      triggerProjectile,
      turnLockedCardIds,
      usedPowerCardIdsThisCombat,
    ]
  );

  const executeEndTurn = useCallback(async () => {
    if (isAnimatingTurn) return;
    setIsAnimatingTurn(true);
    soundEngine.playConfirm(settings);
    triggerElementParticles('[data-cmd="end turn"]', ['#d97706', '#bc5215', '#102a3a', '#ffd166'], 58, 4);
    setSelectedCard(null);
    setSelectedTargetEnemy(null);
    setSelectedDiscardInstances([]);
    setPendingKeepCount(0);
    setPendingDiscardCount(0);
    setPendingFollowUpDraw(0);
    resetTypingBuffer(true);

    const envMod = activeEnvironment?.modifiers || {};

    // Separate kept cards from discarded cards
    const keptCards = hand.filter((c) => retainedCardIds.has(c.instanceId));
    const discardedCards = hand.filter((c) => !retainedCardIds.has(c.instanceId));
    const nextDiscardedPile = [...discardPile, ...discardedCards];
    if (discardedCards.length > 0) {
      soundEngine.playDiscardCards(discardedCards.length, settings);
      triggerCardExits(discardedCards.map((c, i) => ({ card: c, idx: i })));
      setHand(keptCards);
      setDiscardPile(nextDiscardedPile);
      const exitWait = Math.min(1000, Math.max(450, discardedCards.length * 90 + 440));
      await delay(exitWait);
    }
    if (keptCards.length > 0) {
      spawnPopup('player', `📌 Retained ${keptCards.length} card${keptCards.length > 1 ? 's' : ''}!`, '#10b981');
    }

    let nextPlayerHp = hp;
    let nextPlayerWard = playerWard;
    const nextPlayerStats = { ...playerStatuses };

    relicIds.forEach((rId) => {
      const rel = getRelicDefinition(rId);
      if (rel && rel.trigger === 'turn_end' && rel.effectType === 'ward') {
        nextPlayerWard += rel.amount;
        spawnPopup('player', `+${rel.amount} Ward`, '#1d6fa5');
      }
    });
    setPlayerWard(nextPlayerWard);

    let killedByInkBurn = 0;
    let totalBurnDamage = 0;
    let totalBlockedSummary = 0;
    let totalHpLostSummary = 0;
    const workingEnemies = enemies.map((e) => ({ ...e, statuses: { ...e.statuses } }));
    const workingAllies = allies.map((a) => ({ ...a, statuses: { ...a.statuses } }));

    // Environment turn-end Ink Burn hazard (symmetrical: hits all enemies, allies AND the player!)
    if (envMod.turnEndInkBurnAll && envMod.turnEndInkBurnAll > 0) {
      workingEnemies.forEach((en) => {
        if (en.hp > 0) {
          en.statuses.ink_burn += envMod.turnEndInkBurnAll!;
          spawnPopup(
            en.instanceId,
            `+${envMod.turnEndInkBurnAll} Ink Burn (${activeEnvironment.name})`,
            '#6d28d9'
          );
        }
      });
      workingAllies.forEach((ally) => {
        if (ally.hp > 0) {
          ally.statuses.ink_burn += envMod.turnEndInkBurnAll!;
          spawnPopup(
            ally.instanceId,
            `+${envMod.turnEndInkBurnAll} Ink Burn (${activeEnvironment.name})`,
            '#6d28d9'
          );
        }
      });
      nextPlayerStats.ink_burn += envMod.turnEndInkBurnAll;
      spawnPopup(
        'player',
        `+${envMod.turnEndInkBurnAll} Ink Burn (${activeEnvironment.name})`,
        '#6d28d9'
      );
      await delay(220);
    }

    // Trigger end-of-player-turn active powers (Ink Burn all each turn, Damage all each turn)
    for (const pwr of activePowers) {
      if (pwr.type === 'power_ink_burn_all_each_turn') {
        workingEnemies.forEach((en) => {
          if (en.hp > 0) {
            en.statuses.ink_burn += pwr.amount;
            spawnPopup(en.instanceId, `+${pwr.amount} Ink Burn (${pwr.name})`, '#6d28d9');
          }
        });
        await delay(240);
      }
      if (pwr.type === 'power_damage_all_each_turn') {
        workingEnemies.forEach((en) => {
          if (en.hp > 0) {
            const blocked = Math.min(en.ward, pwr.amount);
            en.ward -= blocked;
            const hpLoss = pwr.amount - blocked;
            en.hp = Math.max(0, en.hp - hpLoss);
            totalBurnDamage += hpLoss;
            spawnPopup(en.instanceId, `-${hpLoss} HP (${pwr.name})`, '#e63946');
          }
        });
        setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
        await delay(280);
      }
    }

    // Trigger player turn-end Ink Burn tick (can be blocked by Ward!)
    if (nextPlayerStats.ink_burn > 0) {
      const burnDmg = nextPlayerStats.ink_burn;
      const blocked = Math.min(nextPlayerWard, burnDmg);
      nextPlayerWard -= blocked;
      const hpLoss = burnDmg - blocked;
      nextPlayerHp = Math.max(0, nextPlayerHp - hpLoss);
      totalHpLostSummary += hpLoss;
      totalBlockedSummary += blocked;
      nextPlayerStats.ink_burn = Math.max(0, nextPlayerStats.ink_burn - 1);
      setPlayerWard(nextPlayerWard);
      setHp(nextPlayerHp);
      setPlayerStatuses({ ...nextPlayerStats });

      if (blocked > 0) {
        if (nextPlayerWard === 0) {
          soundEngine.playWardBreak(settings);
        } else {
          soundEngine.playWardBlock(settings);
        }
      }
      if (hpLoss > 0) {
        soundEngine.playHit(settings);
      }

      if (blocked > 0 && hpLoss > 0) {
        spawnPopup('player', `-${hpLoss} HP (${blocked} Blocked - Ink Burn)`, '#6d28d9');
      } else if (blocked > 0) {
        spawnPopup('player', `${blocked} Blocked (Ink Burn)`, '#1d6fa5');
      } else {
        spawnPopup('player', `-${hpLoss} Ink Burn`, '#6d28d9');
      }

      await delay(360);

      if (nextPlayerHp <= 0) {
        setHp(0);
        setIsAnimatingTurn(false);
        clearLocalRun();
        soundEngine.playDefeatSound(settings);
        setScreen('game_over');
        return;
      }
    }

    for (let idx = 0; idx < workingEnemies.length; idx++) {
      const en = workingEnemies[idx];
      if (en.hp <= 0) continue;

      if (en.ward > 0) {
        en.ward = 0;
        spawnPopup(en.instanceId, `Ward wore off`, '#64748b');
      }

      const move = en.currentMove;
      const effectsToRun = getEnemyMoveEffects(move);
      let executedAnyAction = false;

      // Handle enemy summon moves (e.g. Goblin Warlord rally, Rock Titan shatter, etc.)
      if (
        move.intent === 'summon' ||
        effectsToRun.some((e) => e.type === 'summon') ||
        Boolean(move.summonPool && move.summonPool.length > 0) ||
        Boolean(move.summonId)
      ) {
        executedAnyAction = true;
        const pool = move.summonPool || (move.summonId ? [move.summonId] : []);
        const count = move.summonCount || 1;
        if (pool.length > 0) {
          for (let s = 0; s < count; s++) {
            if (workingEnemies.filter((e) => e.hp > 0).length >= 5) break;
            const chosenId = pickRandom(pool);
            const sDef = ENEMIES_CATALOG.find((e) => e.id === chosenId);
            if (sDef) {
              const newMinion = createSummonInstance(sDef, phraseDiff, 'enemy');
              workingEnemies.push(newMinion);
              soundEngine.playPageTurn(settings);
              spawnPopup(en.instanceId, `Summoned ${newMinion.displayName}!`, '#ef4444');
              setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
              await delay(320);
            }
          }
        }
      }

      for (const eff of effectsToRun) {
        if (eff.type === 'summon') continue;
        if (eff.type === 'damage' && eff.amount > 0) {
          executedAnyAction = true;
          const hits = eff.hits || move.hits || 1;
          for (let h = 0; h < hits; h++) {
            const livingAllies = workingAllies.filter((a) => a.hp > 0);
            let targetIsAlly = false;
            let targetAlly: ActiveEnemy | null = null;

            // "enimies have a 50% chance to target you, and then an equal chance to target each of your current summons"
            if (livingAllies.length > 0) {
              if (Math.random() < 0.5) {
                targetIsAlly = false;
              } else {
                targetIsAlly = true;
                targetAlly = pickRandom(livingAllies);
              }
            }

            if (targetIsAlly && targetAlly) {
              await triggerProjectile(idx, 'player', '#b84a14');
              let dmg =
                eff.amount +
                en.statuses.bold +
                (envMod.damageBonus ?? 0) +
                (envMod.enemyDamageBonus ?? 0);
              if (en.statuses.faded > 0) dmg = Math.max(0, dmg - en.statuses.faded);
              if (targetAlly.statuses.exposed > 0) dmg = Math.floor(dmg * 1.5);
              dmg = Math.max(0, dmg);

              const blocked = Math.min(targetAlly.ward, dmg);
              targetAlly.ward -= blocked;
              const unblocked = dmg - blocked;
              targetAlly.hp = Math.max(0, targetAlly.hp - unblocked);

              const allyWardBroke = blocked > 0 && targetAlly.ward === 0;

              if (blocked > 0 && unblocked > 0) {
                if (allyWardBroke) soundEngine.playWardBreak(settings);
                soundEngine.playHit(settings);
                spawnPopup(targetAlly.instanceId, `-${unblocked} HP (${blocked} Blocked)`, '#e63946');
              } else if (blocked > 0) {
                if (allyWardBroke) {
                  soundEngine.playWardBreak(settings);
                } else {
                  soundEngine.playWardBlock(settings);
                }
                spawnPopup(targetAlly.instanceId, `${blocked} Blocked`, '#1d6fa5');
              } else if (unblocked > 0) {
                soundEngine.playHit(settings);
                spawnPopup(targetAlly.instanceId, `-${unblocked} HP`, '#e63946');
              }

              if (targetAlly.statuses.thorns > 0 && dmg > 0) {
                const retal = targetAlly.statuses.thorns;
                en.hp = Math.max(0, en.hp - retal);
                spawnPopup(en.instanceId, `-${retal} Thorns`, '#059669');
                soundEngine.playHit(settings);
              }

              if (targetAlly.hp <= 0) {
                soundEngine.playAllyDefeated(settings);
                spawnPopup(targetAlly.instanceId, `${targetAlly.displayName} defeated!`, '#ef4444');
              }

              setAllies([...workingAllies.filter((x) => x.hp > 0)]);
              await delay(320);
            } else {
              await triggerProjectile(idx, 'player', '#b84a14');
              let dmg =
                eff.amount +
                en.statuses.bold +
                (envMod.damageBonus ?? 0) +
                (envMod.enemyDamageBonus ?? 0);
              if (en.statuses.faded > 0) dmg = Math.max(0, dmg - en.statuses.faded);
              if (nextPlayerStats.exposed > 0) dmg = Math.floor(dmg * 1.5);
              dmg = Math.max(0, dmg);

              const blocked = Math.min(nextPlayerWard, dmg);
              nextPlayerWard -= blocked;
              const unblocked = dmg - blocked;
              nextPlayerHp = Math.max(0, nextPlayerHp - unblocked);

              totalBlockedSummary += blocked;
              totalHpLostSummary += unblocked;

              const playerWardBroke = blocked > 0 && nextPlayerWard === 0;

              if (blocked > 0 && unblocked > 0) {
                if (playerWardBroke) soundEngine.playWardBreak(settings);
                soundEngine.playHit(settings);
                spawnPopup('player', `-${unblocked} HP (${blocked} Blocked)`, '#e63946');
              } else if (blocked > 0) {
                if (playerWardBroke) {
                  soundEngine.playWardBreak(settings);
                } else {
                  soundEngine.playWardBlock(settings);
                }
                spawnPopup('player', `${blocked} Blocked`, '#1d6fa5');
              } else if (unblocked > 0) {
                soundEngine.playHit(settings);
                spawnPopup('player', `-${unblocked} HP`, '#e63946');
              }

              if (nextPlayerStats.thorns > 0 && dmg > 0) {
                const retal = nextPlayerStats.thorns;
                en.hp = Math.max(0, en.hp - retal);
                spawnPopup(en.instanceId, `-${retal} Thorns`, '#059669');
                soundEngine.playHit(settings);
              }

              setPlayerWard(nextPlayerWard);
              setHp(nextPlayerHp);
              await delay(320);
            }
          }
        } else if (eff.type === 'ward' && eff.amount > 0) {
          executedAnyAction = true;
          soundEngine.playWardBlock(settings);
          const enemyWardGained = Math.max(0, eff.amount + (envMod.wardBonus ?? 0));
          if (eff.target === 'all_allies') {
            workingEnemies.forEach((ally) => {
              if (ally.hp > 0) {
                ally.ward += enemyWardGained;
                spawnPopup(ally.instanceId, `+${enemyWardGained} Ward`, '#1d6fa5');
              }
            });
          } else {
            en.ward += enemyWardGained;
            spawnPopup(en.instanceId, `+${enemyWardGained} Ward`, '#1d6fa5');
          }
          await delay(200);
        } else if (eff.type === 'heal' && eff.amount > 0) {
          executedAnyAction = true;
          soundEngine.playEnemyHeal(settings);
          const enemyHealAmt = Math.max(0, eff.amount + (envMod.healBonus ?? 0));
          if (eff.target === 'all_allies') {
            workingEnemies.forEach((ally) => {
              if (ally.hp > 0) {
                ally.hp = Math.min(ally.maxHp, ally.hp + enemyHealAmt);
                spawnPopup(ally.instanceId, `+${enemyHealAmt} HP`, '#3a8918');
              }
            });
          } else {
            en.hp = Math.min(en.maxHp, en.hp + enemyHealAmt);
            spawnPopup(en.instanceId, `+${enemyHealAmt} HP`, '#3a8918');
          }
          await delay(200);
        } else if (
          eff.type === 'bold' ||
          eff.type === 'faded' ||
          eff.type === 'exposed' ||
          eff.type === 'ink_burn' ||
          eff.type === 'plated_armor' ||
          eff.type === 'thorns'
        ) {
          executedAnyAction = true;
          soundEngine.playEnemyBuff(settings);
          const stKey: keyof StatusState = eff.type;
          const effAmt = Math.max(1, eff.amount + (envMod.statusBonus ?? 0));
          const isPositiveBuff = eff.type === 'bold' || eff.type === 'plated_armor' || eff.type === 'thorns';
          const target = isPositiveBuff
            ? (eff.target === 'all_allies' ? 'all_allies' : 'self')
            : (eff.target ?? 'player');
          if (target === 'player' || target === 'enemy') {
            const livingAllies = workingAllies.filter((a) => a.hp > 0);
            if (livingAllies.length > 0 && Math.random() >= 0.5) {
              const targetAlly = pickRandom(livingAllies);
              targetAlly.statuses[stKey] += effAmt;
              spawnPopup(targetAlly.instanceId, `+${effAmt} ${eff.type.replace('_', ' ')}`, '#6d28d9');
              setAllies([...workingAllies.filter((x) => x.hp > 0)]);
            } else {
              nextPlayerStats[stKey] += effAmt;
              spawnPopup('player', `+${effAmt} ${eff.type.replace('_', ' ')}`, '#6d28d9');
            }
          } else if (target === 'all_allies') {
            workingEnemies.forEach((ally) => {
              if (ally.hp > 0) {
                ally.statuses[stKey] += effAmt;
                spawnPopup(ally.instanceId, `+${effAmt} ${eff.type.replace('_', ' ')}`, '#d97706');
              }
            });
          } else {
            en.statuses[stKey] += effAmt;
            spawnPopup(en.instanceId, `+${effAmt} ${eff.type.replace('_', ' ')}`, '#d97706');
          }
          await delay(200);
        } else if (eff.type === 'discard' || eff.type === 'discard_random') {
          executedAnyAction = true;
          const discardAmt = Math.max(1, eff.amount);
          if (hand.length > 0) {
            const nextHand = [...hand];
            const discarded: CardInstance[] = [];
            for (let d = 0; d < discardAmt && nextHand.length > 0; d++) {
              const randIdx = Math.floor(Math.random() * nextHand.length);
              const [rm] = nextHand.splice(randIdx, 1);
              discarded.push(rm);
            }
            if (discarded.length > 0) {
              soundEngine.playDiscardCards(discarded.length, settings);
              triggerCardExits(discarded.map((c, i) => ({ card: c, idx: i })));
              setHand(nextHand);
              setDiscardPile((prev) => [...prev, ...discarded]);
            }
          }
          spawnPopup('player', `Discarded ${discardAmt} Card(s)`, '#94a3b8');
          await delay(250);
        }
      }

      if (!executedAnyAction) {
        await delay(300);
      }

      const woreOffList: string[] = [];
      if (en.statuses.faded > 0) {
        en.statuses.faded -= 1;
        if (en.statuses.faded === 0) woreOffList.push('Faded wore off');
      }
      if (en.statuses.exposed > 0) {
        en.statuses.exposed -= 1;
        if (en.statuses.exposed === 0) woreOffList.push('Exposed wore off');
      }
      if (woreOffList.length > 0) {
        spawnPopup(en.instanceId, woreOffList.join(', '), '#64748b');
      }

      // Enemy turn-end Ink Burn tick (can be blocked by Ward gained or active this turn!)
      if (en.statuses.ink_burn > 0) {
        const burnDmg = en.statuses.ink_burn;
        const blocked = Math.min(en.ward, burnDmg);
        en.ward -= blocked;
        const hpLoss = burnDmg - blocked;
        en.hp = Math.max(0, en.hp - hpLoss);
        totalBurnDamage += hpLoss;
        en.statuses.ink_burn = Math.max(0, en.statuses.ink_burn - 1);

        if (blocked > 0) {
          if (en.ward === 0) {
            soundEngine.playWardBreak(settings);
          } else {
            soundEngine.playWardBlock(settings);
          }
        }
        if (hpLoss > 0) {
          soundEngine.playHit(settings);
        }

        if (blocked > 0 && hpLoss > 0) {
          spawnPopup(en.instanceId, `-${hpLoss} HP (${blocked} Blocked - Ink Burn)`, '#6d28d9');
        } else if (blocked > 0) {
          spawnPopup(en.instanceId, `${blocked} Blocked (Ink Burn)`, '#1d6fa5');
        } else {
          spawnPopup(en.instanceId, `-${hpLoss} Ink Burn`, '#6d28d9');
        }

        setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
        await delay(360);

        if (en.hp <= 0) {
          killedByInkBurn += 1;
          spawnPopup(en.instanceId, `${en.displayName} dissolved in ink!`, '#ef4444');
          if (
            en.enemyId === 'rock_titan' ||
            en.enemyId === 'boss_rock_mountain' ||
            en.enemyId === 'rock_elemental' ||
            en.enemyId === 'rock_golem'
          ) {
            soundEngine.playRockBossDefeat(settings);
          }
          if (workingEnemies.filter((x) => x.hp > 0).length === 0) {
            setEnemies([]);
            setIsAnimatingTurn(false);
            handleCombatVictory(nextPlayerHp);
            return;
          }
          continue;
        }
      }

      const def = ENEMIES_CATALOG.find((d) => d.id === en.enemyId);
      if (def) {
        const aliveCount = workingEnemies.filter((x) => x.hp > 0).length;
        const previousCondition = en.currentBehavior?.condition;
        const { move, behavior } = chooseEnemyMoveForContext(def, en.hp, en.maxHp, aliveCount);
        en.currentMove = move;
        en.currentBehavior = behavior;
        if (previousCondition !== behavior.condition) {
          if (behavior.condition === 'below_half_hp') {
            spawnPopup(en.instanceId, `⚡ ${behavior.name}!`, '#ef4444');
          } else if (behavior.condition === 'last_standing') {
            spawnPopup(en.instanceId, `🐺 ${behavior.name}!`, '#f59e0b');
          }
        }
      }

      setPlayerStatuses({ ...nextPlayerStats });
      setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
      await delay(260);
    }

    if (totalHpLostSummary > 0) {
      setMetrics((m) => ({ ...m, totalDamageTaken: m.totalDamageTaken + totalHpLostSummary }));
    }
    if (killedByInkBurn > 0 || totalBurnDamage > 0) {
      setMetrics((m) => ({
        ...m,
        totalDamageDealt: m.totalDamageDealt + totalBurnDamage,
        enemiesDefeated: m.enemiesDefeated + killedByInkBurn,
      }));
    }

    const survivingEnemies = workingEnemies.filter((x) => x.hp > 0);
    if (survivingEnemies.length === 0) {
      setIsAnimatingTurn(false);
      handleCombatVictory(nextPlayerHp);
      return;
    }

    // ==================== ALLY TURN EXECUTION ====================
    // Allies take their turn after enemies and before the player.
    // The player does not decide what they do.
    for (let aIdx = 0; aIdx < workingAllies.length; aIdx++) {
      const ally = workingAllies[aIdx];
      if (ally.hp <= 0) continue;

      // Ally ward reset at turn start
      if (ally.ward > 0) {
        ally.ward = 0;
        spawnPopup(ally.instanceId, 'Ward wore off', '#64748b');
      }

      const aMove = ally.currentMove;
      const aEffects = getEnemyMoveEffects(aMove);
      let executedAllyAction = false;

      for (const eff of aEffects) {
        if (eff.type === 'damage' && eff.amount > 0) {
          executedAllyAction = true;
          const currentLivingEnemies = workingEnemies.filter((e) => e.hp > 0);
          if (currentLivingEnemies.length === 0) break;

          // "when attacking, each enemy has an equal chance of being targeted"
          const targetEnemy = pickRandom(currentLivingEnemies);
          const rawTargetIdx = workingEnemies.findIndex((e) => e.instanceId === targetEnemy.instanceId);
          const targetIdx = Math.max(0, Math.min(2, rawTargetIdx));
          const hits = eff.hits || aMove.hits || 1;

          for (let h = 0; h < hits; h++) {
            await triggerProjectile('player', targetIdx, '#10b981');
            let dmg = eff.amount + ally.statuses.bold + (envMod.damageBonus ?? 0);
            if (ally.statuses.faded > 0) dmg = Math.max(0, dmg - ally.statuses.faded);
            if (targetEnemy.statuses.exposed > 0) dmg = Math.floor(dmg * 1.5);
            dmg = Math.max(0, dmg);

            const blocked = Math.min(targetEnemy.ward, dmg);
            targetEnemy.ward -= blocked;
            const hpLoss = dmg - blocked;
            targetEnemy.hp = Math.max(0, targetEnemy.hp - hpLoss);

            if (blocked > 0 && hpLoss > 0) {
              soundEngine.playHit(settings);
              spawnPopup(targetEnemy.instanceId, `-${hpLoss} HP (${blocked} Blocked)`, '#e63946');
            } else if (blocked > 0) {
              soundEngine.playWardBlock(settings);
              spawnPopup(targetEnemy.instanceId, `${blocked} Blocked`, '#1d6fa5');
            } else if (hpLoss > 0) {
              soundEngine.playHit(settings);
              spawnPopup(targetEnemy.instanceId, `-${hpLoss} HP`, '#e63946');
            }
            spawnPopup(ally.instanceId, `⚔️ ${aMove.name}!`, '#10b981');

            if (targetEnemy.statuses.thorns > 0 && hpLoss > 0) {
              const retal = targetEnemy.statuses.thorns;
              ally.hp = Math.max(0, ally.hp - retal);
              spawnPopup(ally.instanceId, `-${retal} Thorns`, '#059669');
              soundEngine.playHit(settings);
            }

            setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
            setAllies([...workingAllies.filter((x) => x.hp > 0)]);
            await delay(320);

            if (targetEnemy.hp <= 0) {
              spawnPopup(targetEnemy.instanceId, 'Defeated!', '#e63946');
              if (
                targetEnemy.enemyId === 'rock_titan' ||
                targetEnemy.enemyId === 'boss_rock_mountain' ||
                targetEnemy.enemyId === 'rock_elemental' ||
                targetEnemy.enemyId === 'rock_golem'
              ) {
                soundEngine.playRockBossDefeat(settings);
              }
              break;
            }
          }
        } else if (eff.type === 'ward' && eff.amount > 0) {
          executedAllyAction = true;
          const wardAmt = Math.max(0, eff.amount + (envMod.wardBonus ?? 0));
          // "the cat can sheild itself, the tiger can sheild itself or you"
          const targetPref = eff.target || aMove.target || 'self';
          if (targetPref === 'ally_or_player') {
            if (Math.random() < 0.5) {
              ally.ward += wardAmt;
              spawnPopup(ally.instanceId, `+${wardAmt} Ward`, '#1d6fa5');
            } else {
              nextPlayerWard += wardAmt;
              spawnPopup('player', `+${wardAmt} Ward (${ally.displayName})`, '#1d6fa5');
              setPlayerWard(nextPlayerWard);
            }
          } else if (targetPref === 'player') {
            nextPlayerWard += wardAmt;
            spawnPopup('player', `+${wardAmt} Ward (${ally.displayName})`, '#1d6fa5');
            setPlayerWard(nextPlayerWard);
          } else {
            ally.ward += wardAmt;
            spawnPopup(ally.instanceId, `+${wardAmt} Ward`, '#1d6fa5');
          }
          soundEngine.playWardBlock(settings);
          await delay(240);
        } else if (
          eff.type === 'bold' ||
          eff.type === 'plated_armor' ||
          eff.type === 'thorns'
        ) {
          executedAllyAction = true;
          // "and also buff itself or you, not debuff enimies, and not heal you"
          const stKey = eff.type as keyof StatusState;
          const buffAmt = Math.max(1, eff.amount + (envMod.statusBonus ?? 0));
          const targetPref = eff.target || aMove.target || 'self';
          if (targetPref === 'ally_or_player') {
            if (Math.random() < 0.5) {
              ally.statuses[stKey] += buffAmt;
              spawnPopup(ally.instanceId, `+${buffAmt} ${eff.type.replace('_', ' ')}`, '#d97706');
            } else {
              nextPlayerStats[stKey] += buffAmt;
              spawnPopup('player', `+${buffAmt} ${eff.type.replace('_', ' ')} (${ally.displayName})`, '#d97706');
              setPlayerStatuses({ ...nextPlayerStats });
            }
          } else if (targetPref === 'player') {
            nextPlayerStats[stKey] += buffAmt;
            spawnPopup('player', `+${buffAmt} ${eff.type.replace('_', ' ')} (${ally.displayName})`, '#d97706');
            setPlayerStatuses({ ...nextPlayerStats });
          } else {
            ally.statuses[stKey] += buffAmt;
            spawnPopup(ally.instanceId, `+${buffAmt} ${eff.type.replace('_', ' ')}`, '#d97706');
          }
          await delay(240);
        }
      }

      if (!executedAllyAction) {
        await delay(200);
      }

      // Ally status decay
      if (ally.statuses.faded > 0) ally.statuses.faded -= 1;
      if (ally.statuses.exposed > 0) ally.statuses.exposed -= 1;
      if (ally.statuses.plated_armor > 0) {
        ally.ward += ally.statuses.plated_armor;
        ally.statuses.plated_armor = Math.max(0, ally.statuses.plated_armor - 1);
      }

      // Ally turn-end Ink Burn tick (can be blocked by Ward!)
      if (ally.statuses.ink_burn > 0) {
        const burnDmg = ally.statuses.ink_burn;
        const blocked = Math.min(ally.ward, burnDmg);
        ally.ward -= blocked;
        const hpLoss = burnDmg - blocked;
        ally.hp = Math.max(0, ally.hp - hpLoss);
        ally.statuses.ink_burn = Math.max(0, ally.statuses.ink_burn - 1);

        if (blocked > 0) {
          if (ally.ward === 0) {
            soundEngine.playWardBreak(settings);
          } else {
            soundEngine.playWardBlock(settings);
          }
        }
        if (hpLoss > 0) {
          soundEngine.playHit(settings);
        }

        if (blocked > 0 && hpLoss > 0) {
          spawnPopup(ally.instanceId, `-${hpLoss} HP (${blocked} Blocked - Ink Burn)`, '#6d28d9');
        } else if (blocked > 0) {
          spawnPopup(ally.instanceId, `${blocked} Blocked (Ink Burn)`, '#1d6fa5');
        } else {
          spawnPopup(ally.instanceId, `-${hpLoss} Ink Burn`, '#6d28d9');
        }

        setAllies([...workingAllies.filter((x) => x.hp > 0)]);
        await delay(300);

        if (ally.hp <= 0) {
          spawnPopup(ally.instanceId, `${ally.displayName} fell!`, '#ef4444');
          continue;
        }
      }

      // Roll ally's next move for the upcoming round
      const aDef = ENEMIES_CATALOG.find((d) => d.id === ally.enemyId);
      if (aDef) {
        const aliveAlliesCount = workingAllies.filter((x) => x.hp > 0).length;
        const previousCondition = ally.currentBehavior?.condition;
        const { move, behavior } = chooseEnemyMoveForContext(aDef, ally.hp, ally.maxHp, aliveAlliesCount);
        ally.currentMove = move;
        ally.currentBehavior = behavior;
        if (previousCondition !== behavior.condition) {
          if (behavior.condition === 'below_half_hp') {
            spawnPopup(ally.instanceId, `⚡ ${behavior.name}!`, '#10b981');
          } else if (behavior.condition === 'last_standing') {
            spawnPopup(ally.instanceId, `🐺 ${behavior.name}!`, '#10b981');
          }
        }
      }

      setAllies([...workingAllies.filter((x) => x.hp > 0)]);
      setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
      await delay(200);

      // Check if all enemies were defeated during ally turn
      if (workingEnemies.filter((e) => e.hp > 0).length === 0) {
        setIsAnimatingTurn(false);
        handleCombatVictory(nextPlayerHp);
        return;
      }
    }

    const playerWoreOff: string[] = [];
    if (nextPlayerStats.faded > 0) {
      nextPlayerStats.faded -= 1;
      if (nextPlayerStats.faded === 0) playerWoreOff.push('Faded wore off');
    }
    if (nextPlayerStats.exposed > 0) {
      nextPlayerStats.exposed -= 1;
      if (nextPlayerStats.exposed === 0) playerWoreOff.push('Exposed wore off');
    }

    if (totalBlockedSummary > 0 || totalHpLostSummary > 0 || playerWoreOff.length > 0) {
      const parts: string[] = [];
      if (totalBlockedSummary > 0) parts.push(`${totalBlockedSummary} Blocked`);
      if (totalHpLostSummary > 0) parts.push(`-${totalHpLostSummary} HP`);
      if (playerWoreOff.length > 0) parts.push(playerWoreOff.join(', '));
      spawnPopup('player', `Turn Summary: ${parts.join(' · ')}`, '#102a3a');
    }

    let newTurnWard = envMod.turnStartWardAll ?? 0;
    if (envMod.turnStartWardAll && envMod.turnStartWardAll > 0) {
      survivingEnemies.forEach((en) => {
        en.ward += envMod.turnStartWardAll!;
      });
    }

    if (nextPlayerStats.plated_armor > 0) {
      newTurnWard += nextPlayerStats.plated_armor;
      spawnPopup('player', `+${nextPlayerStats.plated_armor} Ward (Plated Armor)`, '#2563eb');
      nextPlayerStats.plated_armor = Math.max(0, nextPlayerStats.plated_armor - 1);
    }

    survivingEnemies.forEach((en) => {
      if (en.statuses.plated_armor > 0) {
        en.ward += en.statuses.plated_armor;
        spawnPopup(en.instanceId, `+${en.statuses.plated_armor} Ward (Plated Armor)`, '#2563eb');
        en.statuses.plated_armor = Math.max(0, en.statuses.plated_armor - 1);
      }
    });
    let newTurnEnergy = maxEnergy;
    relicIds.forEach((rId) => {
      const rel = getRelicDefinition(rId);
      if (rel && rel.trigger === 'turn_start' && rel.effectType === 'ward') {
        newTurnWard += rel.amount;
      }
    });

    let turnDrawCount = 5 + (envMod.drawBonus ?? 0);
    relicIds.forEach((rId) => {
      const rel = getRelicDefinition(rId);
      if (rel && rel.trigger === 'passive_draw' && rel.effectType === 'draw') {
        turnDrawCount += rel.amount;
      }
    });

    // Trigger start-of-turn active combat powers
    activePowers.forEach((pwr) => {
      if (pwr.type === 'power_ward_each_turn') {
        newTurnWard += pwr.amount;
        spawnPopup('player', `+${pwr.amount} Ward (${pwr.name})`, '#1d6fa5');
      }
      if (pwr.type === 'power_bold_each_turn') {
        nextPlayerStats.bold += pwr.amount;
        spawnPopup('player', `+${pwr.amount} Bold (${pwr.name})`, '#d97706');
      }
      if (pwr.type === 'power_draw_each_turn') {
        turnDrawCount += pwr.amount;
      }
      if (pwr.type === 'power_energy_each_turn') {
        newTurnEnergy += pwr.amount;
        spawnPopup('player', `+${pwr.amount} Energy (${pwr.name})`, '#2a9d8f');
      }
      if (pwr.type === 'power_heal_each_turn') {
        nextPlayerHp = Math.min(maxHp, nextPlayerHp + pwr.amount);
        spawnPopup('player', `+${pwr.amount} HP (${pwr.name})`, '#3a8918');
      }
    });

    const finalTurnDraw = Math.min(10, Math.max(1, turnDrawCount));
    const { nextHand, nextDraw, nextDiscard, drawnCards } = drawCards(
      finalTurnDraw,
      keptCards,
      drawPile,
      nextDiscardedPile,
      new Set()
    );

    soundEngine.playDrawCards(finalTurnDraw, settings);
    markCardsEntering(drawnCards);
    setHp(nextPlayerHp);
    setPlayerWard(newTurnWard);
    setPlayerStatuses(nextPlayerStats);
    setEnergy(newTurnEnergy);
    setHand(nextHand);
    setDrawPile(nextDraw);
    setDiscardPile(nextDiscard);
    setRetainedCardIds(new Set());
    setPendingKeepCount(0);
    setPendingDiscardCount(0);
    setPendingFollowUpDraw(0);
    setTurnLockedCardIds(new Set());
    setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
    setAllies([...workingAllies.filter((x) => x.hp > 0)]);
    setHandAnimState('drawing');
    window.setTimeout(() => setHandAnimState('idle'), 420);
    setIsAnimatingTurn(false);
  }, [
    activeEnvironment,
    activePowers,
    allies,
    discardPile,
    drawCards,
    drawPile,
    enemies,
    hand,
    handleCombatVictory,
    hp,
    isAnimatingTurn,
    maxEnergy,
    maxHp,
    playerStatuses,
    playerWard,
    relicIds,
    resetTypingBuffer,
    retainedCardIds,
    settings,
    spawnPopup,
    triggerElementParticles,
    triggerProjectile,
  ]);

  const enterMapNode = useCallback(
    (node: MapNode) => {
      soundEngine.playChooseRoad(settings);
      const nodeColor = MAP_NODE_STYLES[node.type]?.color || '#137547';
      triggerElementParticles(
        `[data-node-id="${node.id}"]`,
        [nodeColor, '#137547', '#d97706', '#ffd166'],
        50,
        55
      );
      setCurrentNodeId(node.id);
      setMapFloors((prev) =>
        prev.map((row) =>
          row.map((n) => (n.id === node.id ? { ...n, completed: true } : n))
        )
      );

      const code = encodeSaveCode(
        playerName,
        difficulty,
        node.floor,
        hp,
        maxHp,
        gold,
        deck,
        relicIds,
        metrics
      );
      saveRunToLocal(code);

      if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
        startBattle(node.floor, node.type, deck, relicIds);
        return;
      }

      if (node.type === 'campfire') {
        soundEngine.playCampfireEntrance(settings);
        setCampfireSubMode('choose');
        setCampfireSelectedCard(null);
        resetTypingBuffer(true);
        setScreen('campfire');
        return;
      }

      if (node.type === 'merchant') {
        soundEngine.playShopEntrance(settings);
        // Randomise cost of each shop item +/- 25% (range: 0.75x to 1.25x)
        const randomizePrice = (base: number): number => {
          const variance = 0.75 + Math.random() * 0.5;
          return Math.max(1, Math.round(base * variance));
        };

        const shopCards = generateCardRewards(4, false).map((inst) => {
          const def = getCardDefinition(inst.cardId);
          const effRarity = getCardEffectiveDropRarity(def);
          const basePrice =
            effRarity === 'ultra_rare'
              ? 175
              : effRarity === 'rare'
              ? 130
              : effRarity === 'uncommon'
              ? 85
              : 50;
          return { instance: inst, price: randomizePrice(basePrice), sold: false };
        });
        const shopRelics = generateRelicRewards(relicIds, 2).map((rel) => ({
          relic: rel,
          price: randomizePrice(rel.price || 145),
          sold: false,
        }));
        setShopInventory({
          cards: shopCards,
          relics: shopRelics,
          removeServicePrice: randomizePrice(65),
          removeUsed: false,
        });
        setShopSubMode('browse');
        resetTypingBuffer(true);
        setScreen('merchant');
        return;
      }

      if (node.type === 'treasure') {
        soundEngine.playChestOpen(settings);
        setRewardRelics(generateRelicRewards(relicIds, 3));
        resetTypingBuffer(true);
        setScreen('treasure');
        return;
      }

      if (node.type === 'mystery') {
        soundEngine.playSample('cards/book_01.ogg', settings);
        const eligibleEvents = EVENTS_CATALOG.filter(
          (e) => !e.minFloor || node.floor >= e.minFloor
        );
        const ev = pickRandom(eligibleEvents.length > 0 ? eligibleEvents : EVENTS_CATALOG);
        setActiveEvent(ev);
        setMysterySubMode('event');
        setMysterySelectedCard(null);
        setConsecratedResultCard(null);
        setPendingConsecrateChoice(null);
        setEventOutcomeText(null);
        setEventOutcomeSummary([]);
        setEventRollSucceeded(null);
        setPendingChanceChoice(null);
        resetTypingBuffer(true);
        setScreen('mystery');
      }
    },
    [
      deck,
      difficulty,
      gold,
      hp,
      maxHp,
      metrics,
      playerName,
      relicIds,
      resetTypingBuffer,
      settings,
      startBattle,
      triggerElementParticles,
    ]
  );

  const advanceToMapNextFloor = useCallback(() => {
    soundEngine.playMapOpen(settings);
    const nextF = Math.min(mapFloors.length, currentFloor + 1);
    setCurrentFloor(nextF);
    resetTypingBuffer(true);
    setScreen('map');
  }, [currentFloor, mapFloors.length, resetTypingBuffer, settings]);

  const startPlaytestEncounter = useCallback(
    (event: MysteryEventDefinition) => {
      // 1. Snapshot entire live run state safely
      setPlaytestBackup({
        screen,
        hp,
        maxHp,
        gold,
        deck: JSON.parse(JSON.stringify(deck)),
        relicIds: [...relicIds],
        metrics: { ...metrics },
        mapFloors: JSON.parse(JSON.stringify(mapFloors)),
        currentFloor,
        currentNodeId,
        activeNodeType,
        mapScrollOffset,
        activeEnvironment,
        activeEvent,
        eventOutcomeText,
        eventOutcomeSummary: [...eventOutcomeSummary],
        eventRollSucceeded,
        pendingChanceChoice,
        pendingConsecrateChoice,
        consecratedResultCard,
        mysterySubMode,
        mysterySelectedCard,
        energy,
        maxEnergy,
        playerWard,
        playerStatuses: { ...playerStatuses },
        hand: [...hand],
        drawPile: [...drawPile],
        discardPile: [...discardPile],
        burnDraftPile: [...burnDraftPile],
        enemies: JSON.parse(JSON.stringify(enemies)),
        allies: JSON.parse(JSON.stringify(allies)),
        activePowers: [...activePowers],
        rewardCards: [...rewardCards],
        rewardRelics: [...rewardRelics],
        rewardGoldClaimed,
        rewardStep,
        skipCardRewardOnBattleWin,
        shopInventory,
        shopSubMode,
        campfireSubMode,
        campfireSelectedCard,
      });

      setIsPlaytestingEncounter(true);
      setDevEditorOpen(false);

      // Provide temporary combat assets if not currently in a deck-based run
      if (deck.length === 0) {
        setDeck(createStarterDeck());
      }
      if (hp <= 0) {
        setHp(maxHp || 75);
      }

      // 2. Initialize temporary mystery encounter
      soundEngine.playSample('cards/book_01.ogg', settings);
      setActiveEvent(event);
      setMysterySubMode('event');
      setMysterySelectedCard(null);
      setConsecratedResultCard(null);
      setPendingConsecrateChoice(null);
      setEventOutcomeText(null);
      setEventOutcomeSummary([]);
      setEventRollSucceeded(null);
      setPendingChanceChoice(null);
      resetTypingBuffer(true);
      setScreen('mystery');
    },
    [
      screen,
      hp,
      maxHp,
      gold,
      deck,
      relicIds,
      metrics,
      mapFloors,
      currentFloor,
      currentNodeId,
      activeNodeType,
      mapScrollOffset,
      activeEnvironment,
      activeEvent,
      eventOutcomeText,
      eventOutcomeSummary,
      eventRollSucceeded,
      pendingChanceChoice,
      pendingConsecrateChoice,
      consecratedResultCard,
      mysterySubMode,
      mysterySelectedCard,
      energy,
      maxEnergy,
      playerWard,
      playerStatuses,
      hand,
      drawPile,
      discardPile,
      burnDraftPile,
      enemies,
      allies,
      activePowers,
      rewardCards,
      rewardRelics,
      rewardGoldClaimed,
      rewardStep,
      skipCardRewardOnBattleWin,
      shopInventory,
      shopSubMode,
      campfireSubMode,
      campfireSelectedCard,
      resetTypingBuffer,
      settings,
    ]
  );

  const exitPlaytestEncounter = useCallback(() => {
    if (!playtestBackup) {
      setIsPlaytestingEncounter(false);
      setScreen('main_menu');
      setDevEditorOpen(true);
      return;
    }

    // Restore pre-playtest snapshot untouched
    setScreen(playtestBackup.screen);
    setHp(playtestBackup.hp);
    setMaxHp(playtestBackup.maxHp);
    setGold(playtestBackup.gold);
    setDeck(playtestBackup.deck);
    setRelicIds(playtestBackup.relicIds);
    setMetrics(playtestBackup.metrics);
    setMapFloors(playtestBackup.mapFloors);
    setCurrentFloor(playtestBackup.currentFloor);
    setCurrentNodeId(playtestBackup.currentNodeId);
    setActiveNodeType(playtestBackup.activeNodeType);
    setMapScrollOffset(playtestBackup.mapScrollOffset);
    setActiveEnvironment(playtestBackup.activeEnvironment);
    setActiveEvent(playtestBackup.activeEvent);
    setEventOutcomeText(playtestBackup.eventOutcomeText);
    setEventOutcomeSummary(playtestBackup.eventOutcomeSummary);
    setEventRollSucceeded(playtestBackup.eventRollSucceeded);
    setPendingChanceChoice(playtestBackup.pendingChanceChoice);
    setPendingConsecrateChoice(playtestBackup.pendingConsecrateChoice);
    setConsecratedResultCard(playtestBackup.consecratedResultCard);
    setMysterySubMode(playtestBackup.mysterySubMode);
    setMysterySelectedCard(playtestBackup.mysterySelectedCard);
    setEnergy(playtestBackup.energy);
    setMaxEnergy(playtestBackup.maxEnergy);
    setPlayerWard(playtestBackup.playerWard);
    setPlayerStatuses(playtestBackup.playerStatuses);
    setHand(playtestBackup.hand);
    setDrawPile(playtestBackup.drawPile);
    setDiscardPile(playtestBackup.discardPile);
    setBurnDraftPile(playtestBackup.burnDraftPile);
    setEnemies(playtestBackup.enemies);
    setAllies(playtestBackup.allies);
    setActivePowers(playtestBackup.activePowers);
    setRewardCards(playtestBackup.rewardCards);
    setRewardRelics(playtestBackup.rewardRelics);
    setRewardGoldClaimed(playtestBackup.rewardGoldClaimed);
    setRewardStep(playtestBackup.rewardStep);
    setSkipCardRewardOnBattleWin(playtestBackup.skipCardRewardOnBattleWin);
    setShopInventory(playtestBackup.shopInventory);
    setShopSubMode(playtestBackup.shopSubMode);
    setCampfireSubMode(playtestBackup.campfireSubMode);
    setCampfireSelectedCard(playtestBackup.campfireSelectedCard);

    setPlaytestBackup(null);
    setIsPlaytestingEncounter(false);
    resetTypingBuffer(true);
    soundEngine.playConfirm(settings);
    setDevEditorOpen(true);
  }, [playtestBackup, resetTypingBuffer, settings]);

  const availableMapNodes = useMemo(() => {
    const floorRow = mapFloors[currentFloor - 1] || [];
    if (currentFloor === 1 || !currentNodeId) return floorRow;
    const prevRow = mapFloors[currentFloor - 2] || [];
    const prevNode = prevRow.find((n) => n.id === currentNodeId);
    if (!prevNode || prevNode.nextNodeIds.length === 0) return floorRow;
    const connected = floorRow.filter((n) => prevNode.nextNodeIds.includes(n.id));
    return connected.length > 0 ? connected : floorRow;
  }, [currentFloor, currentNodeId, mapFloors]);

  const handCandidates = useMemo(() => {
    return hand.map((inst) => {
      const resolved = resolveCardInstance(inst, phraseDiff);
      return {
        item: inst,
        phrase: resolved.name,
        resolved,
      };
    });
  }, [hand, phraseDiff]);

  const sortedHandCandidates = useMemo(() => {
    return sortCardsByCategoryAndRarity(handCandidates, (c) => c.item, phraseDiff);
  }, [handCandidates, phraseDiff]);

  useLayoutEffect(() => {
    const currentPositions = new Map<string, DOMRect>();
    const stackEl = document.querySelector('.cards-stack');
    if (!stackEl) return;

    const slotEls = stackEl.querySelectorAll<HTMLElement>('.hand-card-slot:not(.card-exiting-right)');
    slotEls.forEach((el) => {
      const id = el.getAttribute('data-slot-id');
      if (!id) return;
      const rect = el.getBoundingClientRect();
      currentPositions.set(id, rect);

      const prevRect = cardPositionsRef.current.get(id);
      if (prevRect && !enteringCardMap.has(id)) {
        const dy = prevRect.top - rect.top;
        const dx = prevRect.left - rect.left;
        if (Math.abs(dy) > 0.5 || Math.abs(dx) > 0.5) {
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          el.style.transition = 'none';
          void el.offsetHeight;

          requestAnimationFrame(() => {
            el.style.transition = '';
            el.style.transform = '';
          });
        }
      }
    });

    cardPositionsRef.current = currentPositions;
  }, [sortedHandCandidates, enteringCardMap]);

  const selectedCardResolved = useMemo(
    () => (selectedCard ? resolveCardInstance(selectedCard, phraseDiff) : null),
    [phraseDiff, selectedCard]
  );

  const selectedCardDiscardEffect = useMemo(() => {
    if (!selectedCardResolved) return null;
    const effects = selectedCardResolved.effects || [];
    const firstDiscardIdx = effects.findIndex((e) => e.type === 'discard');
    if (firstDiscardIdx === -1) return null;
    const firstDrawIdx = effects.findIndex((e) => e.type === 'draw');
    // If draw occurs before discard (e.g. Index: draw 2, discard 1), discard happens AFTER the draw
    // using the combat pending discard workflow so drawn cards can also be discarded.
    if (firstDrawIdx !== -1 && firstDrawIdx < firstDiscardIdx) {
      return null;
    }
    return effects[firstDiscardIdx];
  }, [selectedCardResolved]);

  const selectedCardRequiredDiscardCount = useMemo(() => {
    if (!selectedCardDiscardEffect) return 0;
    const isXCost = Boolean((selectedCardResolved as any)?.xCost || selectedCardResolved?.cost === -1);
    const xMultiplier = isXCost ? Math.max(0, energy) : 1;
    return Math.max(1, (selectedCardDiscardEffect.amount || 1) * xMultiplier);
  }, [energy, selectedCardDiscardEffect, selectedCardResolved]);

  const eligibleDiscardsInHand = useMemo(() => {
    if (!selectedCard) return [];
    const chosenDiscardIds = new Set(selectedDiscardInstances.map((c) => c.instanceId));
    return hand.filter(
      (c) => c.instanceId !== selectedCard.instanceId && !chosenDiscardIds.has(c.instanceId)
    );
  }, [hand, selectedCard, selectedDiscardInstances]);

  const isCardPlayAwaitingDiscard = Boolean(
    selectedCard &&
      selectedCardRequiredDiscardCount > 0 &&
      selectedDiscardInstances.length < selectedCardRequiredDiscardCount &&
      eligibleDiscardsInHand.length > 0 &&
      (selectedCardResolved?.target !== 'enemy' || selectedTargetEnemy !== null)
  );

  const evaluatedDiscardCandidates = useMemo(() => {
    if (screen !== 'battle' || !isCardPlayAwaitingDiscard) return [];
    const candidateItems = eligibleDiscardsInHand.map((c) => ({
      item: c,
      phrase: resolveCardInstance(c, phraseDiff).name,
    }));
    return evaluateCandidates(typedInput, candidateItems, difficulty);
  }, [difficulty, eligibleDiscardsInHand, isCardPlayAwaitingDiscard, phraseDiff, screen, typedInput]);

  const evaluatedHand = useMemo(() => {
    if (screen !== 'battle' || selectedCard) return [];
    return evaluateCandidates(
      typedInput,
      handCandidates.map((c) => ({ item: c, phrase: c.phrase })),
      difficulty
    );
  }, [difficulty, handCandidates, screen, selectedCard, typedInput]);

  const { highlightedCardIds, enterReadyCardId } = useMemo(() => {
    if (!typedInput.trim()) {
      return { highlightedCardIds: new Set<string>(), enterReadyCardId: null as string | null };
    }
    if (isCardPlayAwaitingDiscard) {
      const matches = evaluatedDiscardCandidates.filter((m) => m.isPrefixMatch);
      const top = evaluatedDiscardCandidates[0];
      return {
        highlightedCardIds: new Set(matches.map((m) => m.item.instanceId)),
        enterReadyCardId: top && top.isValidConfirm ? top.item.instanceId : null,
      };
    }
    if (selectedCard) {
      return { highlightedCardIds: new Set<string>(), enterReadyCardId: null as string | null };
    }
    const matches = evaluatedHand.filter((m) => m.isPrefixMatch);
    const top = evaluatedHand[0];
    return {
      highlightedCardIds: new Set(matches.map((m) => m.item.item.instanceId)),
      enterReadyCardId: top && top.isValidConfirm ? top.item.item.instanceId : null,
    };
  }, [evaluatedDiscardCandidates, evaluatedHand, isCardPlayAwaitingDiscard, selectedCard, typedInput]);

  const inspectedCard = useMemo(() => {
    if (selectedCard) {
      return resolveCardInstance(selectedCard, phraseDiff);
    }
    if (!typedInput.trim()) return null;
    const prefixMatches = evaluatedHand.filter((m) => m.isPrefixMatch);
    if (prefixMatches.length === 1) {
      return prefixMatches[0].item.resolved;
    }
    return null;
  }, [evaluatedHand, phraseDiff, selectedCard, typedInput]);

  const evaluatedEnemies = useMemo(() => {
    if (screen !== 'battle') return [];
    return evaluateCandidates(
      typedInput,
      enemies.map((e) => ({ item: e, phrase: e.displayName })),
      difficulty
    );
  }, [difficulty, enemies, screen, typedInput]);

  const { highlightedEnemyIds, enterReadyEnemyId } = useMemo(() => {
    if (!typedInput.trim() || isCardPlayAwaitingDiscard) {
      return {
        highlightedEnemyIds: selectedTargetEnemy
          ? new Set([selectedTargetEnemy.instanceId])
          : new Set<string>(),
        enterReadyEnemyId: null as string | null,
      };
    }
    const matches = evaluatedEnemies.filter((m) => m.isPrefixMatch);
    const top = evaluatedEnemies[0];
    return {
      highlightedEnemyIds: new Set([
        ...matches.map((m) => m.item.instanceId),
        ...(selectedTargetEnemy ? [selectedTargetEnemy.instanceId] : []),
      ]),
      enterReadyEnemyId: top && top.isValidConfirm ? top.item.instanceId : null,
    };
  }, [evaluatedEnemies, isCardPlayAwaitingDiscard, selectedTargetEnemy, typedInput]);

  // Helper to check highlight & enter-ready state on any generic option phrase (Menu, Campfire, Mystery, etc.)
  const getPhraseHighlightState = useCallback(
    (phrase: string, checkDiff: Difficulty = difficulty): { isHighlighted: boolean; isEnterReady: boolean } => {
      if (!typedInput.trim()) return { isHighlighted: false, isEnterReady: false };
      const res = evaluateCandidates(typedInput, [{ item: phrase, phrase }], checkDiff)[0];
      return {
        isHighlighted: Boolean(res?.isPrefixMatch),
        isEnterReady: Boolean(res?.isValidConfirm),
      };
    },
    [difficulty, typedInput]
  );

  const startNewRun = useCallback(
    (chosenName: string, chosenDiff: Difficulty) => {
      soundEngine.playMapOpen(settings);
      triggerElementParticles(undefined, ['#137547', '#d97706', '#102a3a', '#ffd166'], 50, 68);
      const freshDeck = createStarterDeck();
      const freshMap = generateProceduralMap();
      setPlayerName(chosenName);
      setDifficulty(chosenDiff);
      setHp(75);
      setMaxHp(75);
      setGold(99);
      setDeck(freshDeck);
      setRelicIds(['magical_typewriter']);
      setMetrics(INITIAL_METRICS());
      setMapFloors(freshMap);
      setCurrentFloor(1);
      setCurrentNodeId(null);
      setHasShownCombatTutorialThisRun(false);
      setCombatTutorialStep(null);
      resetTypingBuffer(true);
      setScreen('map');
    },
    [resetTypingBuffer, settings, triggerElementParticles]
  );

  const restoreFromSavePayload = useCallback(
    (rawCode: string): boolean => {
      const payload = decodeSaveCode(rawCode);
      if (!payload) return false;

      soundEngine.playMapOpen(settings);
      triggerElementParticles(undefined, ['#137547', '#d97706', '#102a3a', '#ffd166'], 50, 68);
      setPlayerName(payload.name);
      setDifficulty(payload.diff);
      setCurrentFloor(payload.floor);
      setHp(payload.hp);
      setMaxHp(payload.maxHp);
      setGold(payload.gold);
      setDeck(
        payload.deck.map((d) => ({
          instanceId: nextUid('restored_card'),
          cardId: d.c,
          upgraded: d.u === 1,
        }))
      );
      setRelicIds(payload.relics.length > 0 ? payload.relics : ['magical_typewriter']);
      setMapFloors(generateProceduralMap());
      setCurrentNodeId(null);
      setHasShownCombatTutorialThisRun(payload.floor > 1);
      setCombatTutorialStep(null);
      resetTypingBuffer(true);
      setOverlay('none');
      setScreen('map');
      return true;
    },
    [resetTypingBuffer, settings, triggerElementParticles]
  );

  const executeMysteryChoiceEffects = useCallback(
    (choice: MysteryChoice, succeeded: boolean) => {
      const eff: MysteryEffects = succeeded
        ? choice.effects
        : choice.failEffects || {};
      const finalNarrative = succeeded
        ? choice.outcomeText
        : choice.failText || choice.outcomeText;

      const summaryItems: string[] = [];

      if (eff.maxHpChange) {
        setMaxHp((m) => Math.max(10, m + eff.maxHpChange!));
        if (eff.maxHpChange > 0) setHp((h) => h + eff.maxHpChange!);
        summaryItems.push(
          `${eff.maxHpChange > 0 ? '+' : ''}${eff.maxHpChange} Max HP`
        );
      }
      if (eff.hpChange) {
        setHp((h) => Math.max(1, Math.min(maxHp, h + eff.hpChange!)));
        summaryItems.push(
          `${eff.hpChange > 0 ? '+' : ''}${eff.hpChange} HP`
        );
      }
      if (eff.goldChange) {
        setGold((g) => Math.max(0, g + eff.goldChange!));
        summaryItems.push(
          `${eff.goldChange > 0 ? '+' : ''}${eff.goldChange} Gold`
        );
      }
      if (eff.gainRareCard) {
        const newCard = generateCardRewards(1, true, 'rare')[0];
        const cName = resolveCardInstance(newCard, phraseDiff).name;
        setDeck((d) => [...d, newCard]);
        summaryItems.push(`Gained Rare Card: "${cName}"`);
      }
      if (eff.gainRandomCard) {
        const newCard = generateCardRewards(1, false)[0];
        const cName = resolveCardInstance(newCard, phraseDiff).name;
        setDeck((d) => [...d, newCard]);
        summaryItems.push(`Gained Card: "${cName}"`);
      }
      if (eff.upgradeRandomCard) {
        const unup = deck.filter((c) => !c.upgraded);
        if (unup.length > 0) {
          const pick = pickRandom(unup);
          const oldName = resolveCardInstance(pick, phraseDiff).name;
          const newName = resolveCardInstance({ ...pick, upgraded: true }, phraseDiff).name;
          setDeck((prev) =>
            prev.map((c) =>
              c.instanceId === pick.instanceId ? { ...c, upgraded: true } : c
            )
          );
          summaryItems.push(`Upgraded Card: "${oldName}" → "${newName}"`);
        }
      }
      if (eff.gainRandomRelic) {
        const newRel = generateRelicRewards(relicIds, 1)[0];
        if (newRel) {
          setRelicIds((ids) => [...ids, newRel.id]);
          summaryItems.push(`Gained Relic: "${newRel.names[phraseDiff]}"`);
        }
      }
      if (eff.gainSpecificCardId) {
        const specDef = getCardDefinition(eff.gainSpecificCardId);
        if (specDef) {
          const newCard: CardInstance = {
            instanceId: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            cardId: specDef.id,
            upgraded: false,
          };
          setDeck((d) => [...d, newCard]);
          const cName = resolveCardInstance(newCard, phraseDiff).name;
          summaryItems.push(`Gained Card: "${cName}"`);
        }
      }
      if (eff.removeRandomCardsCount && eff.removeRandomCardsCount > 1) {
        let currentDeck = [...deck];
        const toRemove = Math.min(eff.removeRandomCardsCount, Math.max(0, currentDeck.length - 1));
        for (let i = 0; i < toRemove; i++) {
          const nonCurse = currentDeck.filter((c) => getCardDefinition(c.cardId)?.type !== 'curse');
          const pool = nonCurse.length > 0 ? nonCurse : currentDeck;
          const pick = pickRandom(pool);
          currentDeck = currentDeck.filter((c) => c.instanceId !== pick.instanceId);
          const remName = resolveCardInstance(pick, phraseDiff).name;
          summaryItems.push(`Lost Card: "${remName}"`);
        }
        setDeck(currentDeck);
      } else if (eff.removeRandomCard && deck.length > 1) {
        const nonCurse = deck.filter((c) => getCardDefinition(c.cardId)?.type !== 'curse');
        const pool = nonCurse.length > 0 ? nonCurse : deck;
        const pick = pickRandom(pool);
        const remName = resolveCardInstance(pick, phraseDiff).name;
        setDeck((prev) => prev.filter((c) => c.instanceId !== pick.instanceId));
        summaryItems.push(`Removed Card from Deck: "${remName}"`);
      }
      if (eff.gainCurseCard) {
        const curseDef = getCardDefinition(eff.gainCurseCard);
        if (curseDef) {
          const curseInst: CardInstance = {
            instanceId: `curse_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            cardId: curseDef.id,
            upgraded: false,
          };
          setDeck((d) => [...d, curseInst]);
          summaryItems.push(`Gained Curse Card: "${curseDef.names[phraseDiff]}"`);
        }
      }
      if (eff.revealSecretPath) {
        setMapFloors((prev) => {
          const next = prev.map((row) => row.map((n) => ({ ...n })));
          const currFloorIdx = currentFloor - 1;
          const nextFloorIdx = currentFloor;
          const nextNextFloorIdx = currentFloor + 1;
          if (next[currFloorIdx]) {
            const currNode = next[currFloorIdx].find((n) => n.id === currentNodeId);
            if (currNode && nextFloorIdx < next.length) {
              const secretId = `secret_${currentFloor + 1}_${Date.now()}`;
              const nextFloorAfterSecret = nextNextFloorIdx < next.length ? next[nextNextFloorIdx] : [];
              const secretNode: MapNode = {
                id: secretId,
                floor: currentFloor + 1,
                column: next[nextFloorIdx].length,
                type: 'treasure',
                xRatio: Math.min(0.92, Math.max(0.08, (currNode.xRatio ?? 0.5) + 0.28)),
                yOffset: -6,
                nextNodeIds: nextFloorAfterSecret.map((n) => n.id),
                completed: false,
                phrases: {
                  easy: 'secret cache',
                  medium: 'unredacted leyline',
                  hard: 'unredacted cartographer leyline',
                },
                isSecretNode: true,
              };
              next[nextFloorIdx].push(secretNode);
              if (!currNode.nextNodeIds.includes(secretId)) {
                currNode.nextNodeIds.push(secretId);
              }
            }
          }
          return next;
        });
        summaryItems.push("✨ Scraping the ink revealed an unredacted secret leyline on the map!");
      }
      if (eff.chooseCardBeforeRoll && mysterySelectedCard) {
        const existingResolved = resolveCardInstance(mysterySelectedCard, phraseDiff);
        const newEffect = generateConsecratedEffect(existingResolved.effects, succeeded);
        const updatedCard: CardInstance = {
          ...mysterySelectedCard,
          consecrated: succeeded,
          corrupted: !succeeded,
          additionalEffects: [...(mysterySelectedCard.additionalEffects || []), newEffect],
        };
        setDeck((prev) =>
          prev.map((c) => (c.instanceId === mysterySelectedCard.instanceId ? updatedCard : c))
        );
        setConsecratedResultCard(updatedCard);
        const effectSummary = describeCardEffects([newEffect]);
        if (succeeded) {
          summaryItems.push(`✨ Consecrated "${existingResolved.name}": Added [${effectSummary}]!`);
        } else {
          summaryItems.push(`⚡ Corrupted "${existingResolved.name}": Inflicted [${effectSummary}]!`);
        }
      }
      if (eff.chooseCardToUpgrade) {
        setMysterySubMode('select_card_to_upgrade');
        setMysterySelectedCard(null);
        resetTypingBuffer(true);
        return;
      }
      if (eff.chooseCardToInvert) {
        setMysterySubMode('select_card_to_invert');
        setMysterySelectedCard(null);
        resetTypingBuffer(true);
        return;
      }
      if (eff.startBattleEnemies && eff.startBattleEnemies.length > 0) {
        const customEnemies = generateCustomEncounter(eff.startBattleEnemies, currentFloor, phraseDiff);
        startBattle(currentFloor, 'elite', deck, relicIds, customEnemies, Boolean(eff.battleNoCardReward));
        return;
      }

      if (summaryItems.length === 0) {
        summaryItems.push('No stat changes — continued safely.');
      }

      if (eff.chooseCardBeforeRoll) {
        if (succeeded) {
          soundEngine.playCardCast(settings);
          triggerElementParticles(undefined, ['#10b981', '#38bdf8', '#ffd166'], 60, 70);
        } else {
          soundEngine.playHit(settings);
          triggerElementParticles(undefined, ['#ef4444', '#7c3aed', '#64748b'], 60, 70);
        }
      } else if (eff.revealSecretPath) {
        soundEngine.playSample('cards/book_01.ogg', settings);
      } else if (eff.gainCurseCard) {
        soundEngine.playBurnCard(settings);
      } else if (eff.gainRandomRelic) {
        soundEngine.playRelicGain(settings);
      } else if (eff.gainRareCard || eff.gainRandomCard) {
        soundEngine.playDrawCard(settings);
      } else if (eff.upgradeRandomCard) {
        soundEngine.playCardCast(settings);
      } else if (eff.removeRandomCard) {
        soundEngine.playBurnCard(settings);
      } else if (eff.goldChange && eff.goldChange > 0) {
        soundEngine.playCoinClink(settings);
      } else if (eff.hpChange && eff.hpChange > 0) {
        soundEngine.playSample('cards/heal.ogg', settings);
      } else if (eff.hpChange && eff.hpChange < 0) {
        soundEngine.playHit(settings);
      } else if (succeeded) {
        soundEngine.playConfirm(settings);
      }

      setEventRollSucceeded(succeeded);
      setEventOutcomeSummary(summaryItems);
      setEventOutcomeText(finalNarrative);
      setPendingChanceChoice(null);
      resetTypingBuffer(true);
    },
    [
      currentFloor,
      currentNodeId,
      deck,
      maxHp,
      mysterySelectedCard,
      phraseDiff,
      relicIds,
      resetTypingBuffer,
      settings,
      startBattle,
      triggerElementParticles,
    ]
  );

  const handleEnterSubmit = useCallback(() => {
    if (isAnimatingTurn) return;
    const raw = typedInput.trim();
    const norm = normalizeText(raw);

    // 0. Live Word Dictionary Lookup (`<word>?`)
    if (raw.endsWith('?') && raw.length > 1) {
      const queryWord = raw.slice(0, -1).trim();
      if (queryWord.length > 0 && !queryWord.includes(' ')) {
        soundEngine.playPageTurn(settings);
        triggerElementParticles('.typing-console-box', ['#1b6488', '#137547', '#ffd166'], 50, 90);
        setDictionaryQuery(queryWord);
        setDictionaryLoading(true);
        setDictionaryData(null);
        setOverlay('dictionary');
        resetTypingBuffer(false);
        lookupWordDefinition(queryWord).then((res) => {
          setDictionaryData(res);
          setDictionaryLoading(false);
        });
        return;
      }
    }

    // Gold can be inspected from any screen, including while another popup is open.
    // Exact match so it does not steal nearby words such as the Bold status.
    const goldIsTravelChoice =
      screen === 'map' &&
      overlay === 'none' &&
      availableMapNodes.some((n) => normalizeText(n.phrases[phraseDiff]) === 'gold');
    const goldBlockedByNameEntry =
      screen === 'peasant_intro' && (introStep === 'ask_name' || introStep === 'load_save');
    if (norm === 'gold' && !goldIsTravelChoice && !goldBlockedByNameEntry) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles(undefined, ['#e3b341', '#f5d76e', '#8a6410'], 48, 55);
      setOverlay('gold');
      resetTypingBuffer(false);
      return;
    }

    // 1. Modal Overlay Commands
    if (overlay !== 'none') {
      if (overlay === 'combat_tutorial') {
        if (matchCommand(raw, ['skip', 'close', 'exit', 'dismiss'], 'easy')) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles(undefined, ['#137547', '#ffd166'], 40, 50);
          setOverlay('none');
          setCombatTutorialStep(null);
          resetTypingBuffer(true);
          return;
        }
        if (matchCommand(raw, ['next', 'continue', 'forward'], 'easy')) {
          if (combatTutorialStep !== null && combatTutorialStep < 11) {
            soundEngine.playPageTurn(settings);
            triggerElementParticles(undefined, ['#137547', '#ffd166'], 40, 50);
            setCombatTutorialStep((s) => (s !== null ? s + 1 : 7));
          } else {
            soundEngine.playConfirm(settings);
            triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 60);
            setOverlay('none');
            setCombatTutorialStep(null);
          }
          resetTypingBuffer(true);
          return;
        }
        if (matchCommand(raw, ['back', 'prev', 'previous'], 'easy')) {
          if (combatTutorialStep !== null && combatTutorialStep > 7) {
            soundEngine.playPageTurn(settings);
            setCombatTutorialStep((s) => (s !== null ? s - 1 : 7));
          } else {
            soundEngine.playError(settings);
          }
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (
        !raw ||
        matchCommand(raw, ['back', 'return', 'close', 'exit', 'cancel', 'resume', 'done'], 'easy')
      ) {
        soundEngine.playPageTurn(settings);
        triggerElementParticles('.modal-footer-prompt', ['#102a3a', '#d97706', '#137547'], 50, 82);
        setOverlay('none');
        setHighlightedStatusId(null);
        setInspectedEntity(null);
        resetTypingBuffer(false);
        return;
      }

      if (overlay === 'options') {
        if (matchCommand(raw, ['deck', 'view deck', 'cards'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('deck');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['discard', 'view discard'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('discard');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['burned', 'burn draft'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('burn_draft');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['relics'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('relics');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['codex', 'bestiary'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('codex');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['status effects', 'statuses', 'status'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('status_effects');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['help', 'rules'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('help');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['save', 'save code'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('save');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['editor'], 'easy')) {
          setDevEditorOpen(true);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['main menu', 'title screen'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('none');
          setScreen('main_menu');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['surrender', 'abandon', 'give up'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setOverlay('none');
          setHp(0);
          setScreen('game_over');
          resetTypingBuffer(false);
          return;
        }

        if (matchCommand(raw, ['mute', 'unmute', 'toggle mute'], 'easy')) {
          setSettings((s) => ({ ...s, muted: !s.muted }));
          soundEngine.playConfirm(settings);
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['typewriter', 'mechanical typewriter'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'mechanical_typewriter' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'mechanical_typewriter' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['telegraph', 'vintage telegraph'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'vintage_telegraph' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'vintage_telegraph' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['quill', 'arcane quill'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'arcane_quill' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'arcane_quill' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['chalk', 'soft chalk'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'soft_chalk' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'soft_chalk' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['bell', 'carriage bell'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'carriage_bell' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'carriage_bell' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['chime', 'spell chime'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'spell_chime' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'spell_chime' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['stamp', 'heavy stamp'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'heavy_stamp' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'heavy_stamp' });
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['contrast', 'high contrast'], 'easy')) {
          setSettings((s) => ({ ...s, highContrast: !s.highContrast }));
          soundEngine.playConfirm(settings);
          triggerElementParticles('.keyboard-modal-card', ['#137547', '#d97706'], 50, 50);
          resetTypingBuffer(false);
          return;
        }
      }

      if (overlay === 'codex') {
        if (matchCommand(raw, ['monsters', 'enemies'], 'easy')) {
          setCodexTab('monsters');
          setCodexSelectedId(null);
          setInspectedEntity(null);
          setCodexScrollOffset(0);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        if (matchCommand(raw, ['cards'], 'easy')) {
          setCodexTab('cards');
          setInspectedEntity(null);
          setCodexSelectedId(null);
          setCodexScrollOffset(0);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        if (matchCommand(raw, ['environments', 'biomes'], 'easy')) {
          setCodexTab('environments');
          setInspectedEntity(null);
          setCodexSelectedId(null);
          setCodexScrollOffset(0);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        if (matchCommand(raw, ['relics'], 'easy')) {
          setCodexTab('relics');
          setInspectedEntity(null);
          setCodexSelectedId(null);
          setCodexScrollOffset(0);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        if (matchCommand(raw, ['unlock all', 'unlock-all'], 'easy')) {
          setCodexDiscovery(unlockAllCodexEntries());
          resetTypingBuffer(false);
          soundEngine.playConfirm(settings);
          return;
        }

        // Selection by name within current active tab
        if (codexTab === 'monsters') {
          const matchedEnemy = ENEMIES_CATALOG.find((e) => {
            if (!codexDiscovery.enemies.includes(e.id)) return false;
            const names = [e.id, ...(e.namePools[phraseDiff] || e.namePools.easy || [])];
            return matchCommand(raw, names, difficulty);
          });
          if (matchedEnemy) {
            setCodexSelectedId(matchedEnemy.id);
            setInspectedEntity(null);
            resetTypingBuffer(false);
            soundEngine.playPageTurn(settings);
            return;
          }
        } else if (codexTab === 'cards') {
          const matchedCard = CARDS_CATALOG.find((c) => {
            if (!codexDiscovery.cards.includes(c.id)) return false;
            const names = [c.names[phraseDiff], c.names.easy, c.names.medium, c.names.hard, c.id].filter(Boolean);
            return matchCommand(raw, names, difficulty);
          });
          if (matchedCard) {
            setCodexSelectedId(matchedCard.id);
            resetTypingBuffer(false);
            soundEngine.playPageTurn(settings);
            return;
          }
        } else if (codexTab === 'environments') {
          const matchedEnv = ENVIRONMENTS_CATALOG.find((env) => {
            if (!codexDiscovery.environments.includes(env.id)) return false;
            return matchCommand(raw, [env.name, env.id], difficulty);
          });
          if (matchedEnv) {
            setCodexSelectedId(matchedEnv.id);
            resetTypingBuffer(false);
            soundEngine.playPageTurn(settings);
            return;
          }
        } else if (codexTab === 'relics') {
          const matchedRelic = RELICS_CATALOG.find((r) => {
            if (!codexDiscovery.relics.includes(r.id)) return false;
            const names = [r.names[phraseDiff], r.names.easy, r.names.medium, r.names.hard, r.id].filter(Boolean);
            return matchCommand(raw, names, difficulty);
          });
          if (matchedRelic) {
            setCodexSelectedId(matchedRelic.id);
            resetTypingBuffer(false);
            soundEngine.playPageTurn(settings);
            return;
          }
        }

        // Cross-tab fallback search
        const anyEnemy = ENEMIES_CATALOG.find(
          (e) => codexDiscovery.enemies.includes(e.id) && matchCommand(raw, [e.id, ...(e.namePools[phraseDiff] || [])], difficulty)
        );
        if (anyEnemy) {
          setCodexTab('monsters');
          setCodexSelectedId(anyEnemy.id);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        const anyCard = CARDS_CATALOG.find(
          (c) => codexDiscovery.cards.includes(c.id) && matchCommand(raw, [c.names[phraseDiff], c.id], difficulty)
        );
        if (anyCard) {
          setCodexTab('cards');
          setCodexSelectedId(anyCard.id);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        const anyEnv = ENVIRONMENTS_CATALOG.find(
          (env) => codexDiscovery.environments.includes(env.id) && matchCommand(raw, [env.name, env.id], difficulty)
        );
        if (anyEnv) {
          setCodexTab('environments');
          setCodexSelectedId(anyEnv.id);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
        const anyRelic = RELICS_CATALOG.find(
          (r) => codexDiscovery.relics.includes(r.id) && matchCommand(raw, [r.names[phraseDiff], r.id], difficulty)
        );
        if (anyRelic) {
          setCodexTab('relics');
          setCodexSelectedId(anyRelic.id);
          resetTypingBuffer(false);
          soundEngine.playPageTurn(settings);
          return;
        }
      }

      if (overlay === 'save' && raw.toUpperCase().startsWith('TM1-')) {
        if (restoreFromSavePayload(raw)) {
          soundEngine.playConfirm(settings);
          return;
        }
      }

      soundEngine.playError(settings);
      resetTypingBuffer(false);
      return;
    }

    // 2. Universal Meta-Commands
    if (matchCommand(raw, ['codex', 'bestiary', 'compendium', 'collection'], 'easy')) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="codex"]', ['#1b6488', '#d97706', '#ffd166'], 80, 4);
      setCodexSelectedId(null);
      setCodexScrollOffset(0);
      setOverlay('codex');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['help', 'commands', 'what can i type'], 'easy')) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="help"]', ['#1b6488', '#137547', '#ffd166'], 82, 4);
      setOverlay('help');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['options', 'settings', 'audio', 'sound'], 'easy')) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="options"]', ['#1b6488', '#d97706', '#ffd166'], 88, 4);
      setOverlay('options');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['mute'], 'easy')) {
      setSettings((s) => ({ ...s, muted: true }));
      triggerElementParticles('[data-cmd="options"]', ['#64748b', '#102a3a'], 88, 4);
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['unmute'], 'easy')) {
      const next = { ...settings, muted: false };
      setSettings(next);
      soundEngine.playConfirm(next);
      triggerElementParticles('[data-cmd="options"]', ['#137547', '#ffd166'], 88, 4);
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['status effects', 'statuses', 'status', 'effects'], 'easy')) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="status effects"]', ['#6d28d9', '#1d6fa5', '#d97706'], 74, 4);
      setHighlightedStatusId(null);
      setOverlay('status_effects');
      resetTypingBuffer(false);
      return;
    }
    for (const st of STATUS_DEFINITIONS) {
      if (matchCommand(raw, [st.name, `inspect ${st.name}`], 'easy')) {
        const isExplicitInspect = Boolean(matchCommand(raw, [`inspect ${st.name}`], 'easy'));
        const collidesWithHandCard =
          !isExplicitInspect &&
          screen === 'battle' &&
          (
            // 1. In discard confirmation mode, candidate matches
            (isCardPlayAwaitingDiscard &&
              (Boolean(evaluatedDiscardCandidates[0]?.isValidConfirm) ||
                eligibleDiscardsInHand.some((c) => {
                  const cName = normalizeText(resolveCardInstance(c, phraseDiff).name);
                  return cName === norm || Boolean(matchCommand(raw, [cName], difficulty));
                }))) ||
            // 2. Normal hand card selection
            (!selectedCard &&
              (Boolean(evaluatedHand[0]?.isValidConfirm) ||
                handCandidates.some((c) => {
                  const cName = normalizeText(c.phrase);
                  return cName === norm || Boolean(matchCommand(raw, [cName], difficulty));
                }))) ||
            // 3. Confirming selected self/all_enemies card by repeating its name
            (Boolean(selectedCard) &&
              (normalizeText(selectedCardResolved?.name || '') === norm ||
                Object.values(getCardDefinition(selectedCard!.cardId)?.names || {})
                  .map(normalizeText)
                  .includes(norm))) ||
            // 4. In pending discard / keep mode, hand has matching card
            ((pendingDiscardCount > 0 || pendingKeepCount > 0) &&
              hand.some((c) => {
                const cName = normalizeText(resolveCardInstance(c, phraseDiff).name);
                return cName === norm || Boolean(matchCommand(raw, [cName], difficulty));
              }))
          );
        if (!collidesWithHandCard) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles('[data-cmd="status effects"]', [st.color, '#ffd166'], 74, 4);
          setHighlightedStatusId(st.id);
          setOverlay('status_effects');
          resetTypingBuffer(false);
          return;
        }
      }
    }

    if (
      matchCommand(raw, ['view deck', 'deck', 'show deck', 'cards', 'view cards'], 'easy') &&
      screen !== 'main_menu' &&
      screen !== 'peasant_intro'
    ) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="view deck"]', ['#bc5215', '#d97706', '#ffd166'], 92, 4);
      setOverlay('deck');
      resetTypingBuffer(false);
      return;
    }
    if (
      matchCommand(
        raw,
        pendingDiscardCount > 0 || isCardPlayAwaitingDiscard
          ? ['view discard', 'discard pile']
          : ['view discard', 'discard', 'discard pile'],
        'easy'
      ) &&
      screen === 'battle'
    ) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('.cards-footer-box', ['#bc5215', '#102a3a'], 12, 92);
      setOverlay('discard');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view burn', 'burn draft', 'burned'], 'easy') && screen === 'battle') {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('.cards-footer-box', ['#9e2a2b', '#d95d16'], 12, 92);
      setOverlay('burn_draft');
      resetTypingBuffer(false);
      return;
    }
    if (
      matchCommand(raw, ['relics', 'view relics', 'inspect relics'], 'easy') &&
      screen !== 'main_menu' &&
      screen !== 'peasant_intro'
    ) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="relics"]', ['#b67d10', '#ffd166', '#137547'], 66, 4);
      setOverlay('relics');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['save', 'save code', 'export save'], 'easy')) {
      soundEngine.playPageTurn(settings);
      triggerElementParticles('[data-cmd="save"]', ['#137547', '#102a3a', '#ffd166'], 86, 4);
      setOverlay('save');
      resetTypingBuffer(false);
      return;
    }
    if (
      matchCommand(
        raw,
        ['editor', 'dev editor', 'edit json', 'json editor', 'sprite editor', 'edit'],
        'easy'
      )
    ) {
      triggerElementParticles(undefined, ['#137547', '#d97706', '#ffd166'], 50, 50);
      setDevEditorOpen(true);
      resetTypingBuffer(false);
      return;
    }

    // 3. MAIN MENU
    if (screen === 'main_menu') {
      if (matchCommand(raw, ['new run', 'new', 'start', 'play'], 'easy')) {
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#137547', '#bc5215', '#ffd166'], 50, 52);
        setIntroStep('ask_name');
        setScreen('peasant_intro');
        resetTypingBuffer(true);
        return;
      }
      if (matchCommand(raw, ['tutorial', 'learn', 'how to play'], 'easy')) {
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#1b6488', '#137547', '#ffd166'], 50, 58);
        setTutorialStep(0);
        setTutorialFeedback(null);
        setTutorialDiffPreview('easy');
        setTutorialMapLevel(1);
        setTutorialMapCurrent({ type: 'campfire', name: 'quiet bonfire' });
        setTutorialMapOptions([
          { type: 'battle', name: 'monster patrol' },
          { type: 'merchant', name: 'wandering merchant' },
          { type: 'mystery', name: 'mysterious shrine' },
        ]);
        setTutorialMapScroll(0);
        setScreen('tutorial');
        resetTypingBuffer(true);
        return;
      }
      if (matchCommand(raw, ['load', 'load run', 'continue'], 'easy')) {
        const localSave = loadRunFromLocal();
        if (localSave) {
          soundEngine.playConfirm(settings);
          const localCode = localStorage.getItem('typemancer_save_v1') || '';
          restoreFromSavePayload(localCode);
          return;
        }
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#d97706', '#102a3a', '#ffd166'], 50, 64);
        setIntroStep('load_save');
        setScreen('peasant_intro');
        resetTypingBuffer(true);
        return;
      }
      if (raw.toUpperCase().startsWith('TM1-') && restoreFromSavePayload(raw)) {
        soundEngine.playConfirm(settings);
        return;
      }
      soundEngine.playError(settings);
      return;
    }

    // 4. STUDENT-FRIENDLY SPACED-OUT TUTORIAL (13 STEPS, ZERO MOUSE)
    if (screen === 'tutorial') {
      // Exit or Menu
      if (matchCommand(raw, ['exit', 'menu', 'quit'], 'easy')) {
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#102a3a', '#d97706'], 50, 80);
        setScreen('main_menu');
        resetTypingBuffer(true);
        return;
      }

      // Start run command
      if (matchCommand(raw, ['start run', 'new run', 'start', 'begin', 'play'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 65);
        setIntroStep('ask_name');
        setScreen('peasant_intro');
        resetTypingBuffer(true);
        return;
      }

      // Review command (revisit from beginning)
      if (matchCommand(raw, ['review', 'restart tutorial', 'from start'], 'easy')) {
        soundEngine.playPageTurn(settings);
        setTutorialStep(0);
        setTutorialFeedback(null);
        resetTypingBuffer(true);
        return;
      }

      // Universal Next / Continue
      if (matchCommand(raw, ['next', 'continue', 'forward'], 'easy')) {
        if (tutorialStep === 1) {
          soundEngine.playError(settings);
          setTutorialFeedback("Type 'practice practice practice' and press Enter to practice!");
          resetTypingBuffer(true);
          return;
        }
        if (tutorialStep < 15) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 50);
          setTutorialStep((s) => s + 1);
          setTutorialFeedback(null);
        } else {
          soundEngine.playConfirm(settings);
          triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 65);
          setIntroStep('ask_name');
          setScreen('peasant_intro');
        }
        resetTypingBuffer(true);
        return;
      }

      // Universal Back / Prev (or skip -> back)
      if (matchCommand(raw, ['back', 'prev', 'previous', 'skip'], 'easy')) {
        if (tutorialStep > 0) {
          soundEngine.playPageTurn(settings);
          setTutorialStep((s) => s - 1);
          setTutorialFeedback(null);
        } else {
          soundEngine.playPageTurn(settings);
          setScreen('main_menu');
        }
        resetTypingBuffer(true);
        return;
      }

      // Step 1: Practice typing "practice practice practice"
      if (tutorialStep === 1) {
        if (matchCommand(raw, ['practice practice practice', 'practice practice', 'practice'], 'easy')) {
          soundEngine.playHit(settings);
          triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 60);
          setTutorialStep(2);
          setTutorialFeedback(null);
          resetTypingBuffer(true);
          return;
        }
      }

      // Step 2: Goal: Climb & Collect -> typing "cards" triggers next!
      if (tutorialStep === 2) {
        if (matchCommand(raw, ['cards', 'card'], 'easy')) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 50);
          setTutorialStep(3);
          setTutorialFeedback(null);
          resetTypingBuffer(true);
          return;
        }
      }

      // Step 5: Moving on Map (Interactive Example)
      if (tutorialStep === 5) {
        const matched = tutorialMapOptions.find((opt) => matchCommand(raw, [opt.name], 'medium'));
        if (matched) {
          soundEngine.playChooseRoad(settings);
          triggerElementParticles(undefined, ['#137547', '#ffd166'], 40, 50);
          setTutorialMapCurrent(matched);
          setTutorialMapLevel((lvl) => lvl + 1);
          // Pick 3 new distinct options from pool
          const nextPool = TUTORIAL_MAP_CHOICES_POOL.filter((c) => c.name !== matched.name);
          const shuffled = shuffleArray(nextPool).slice(0, 3);
          setTutorialMapOptions(shuffled);
          setTutorialFeedback(null);
          resetTypingBuffer(true);
          return;
        }
      }

      soundEngine.playError(settings);
      return;
    }

    // 5. PEASANT INTRO
    if (screen === 'peasant_intro') {
      if (introStep === 'ask_name') {
        if (matchCommand(raw, ['back', 'menu', 'return'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setScreen('main_menu');
          resetTypingBuffer(true);
          return;
        }
        if (raw.toUpperCase().startsWith('TM1-') && restoreFromSavePayload(raw)) {
          soundEngine.playConfirm(settings);
          return;
        }
        if (raw.length < 1) {
          soundEngine.playError(settings);
          return;
        }
        soundEngine.playPageTurn(settings);
        triggerElementParticles('.prompt-panel', ['#137547', '#bc5215', '#ffd166'], 50, 68);
        setPlayerName(raw.slice(0, 28));
        setIntroStep('ask_difficulty');
        resetTypingBuffer(true);
        return;
      }

      if (introStep === 'load_save') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'menu'], 'easy')) {
          setScreen('main_menu');
          resetTypingBuffer(true);
          return;
        }
        if (restoreFromSavePayload(raw)) {
          soundEngine.playConfirm(settings);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (introStep === 'ask_difficulty') {
        if (matchCommand(raw, ['back', 'return', 'change name'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setIntroStep('ask_name');
          resetTypingBuffer(true);
          return;
        }

        const diffCandidates: { item: Difficulty; phrase: string }[] = [
          { item: 'easy', phrase: 'easy' },
          { item: 'medium', phrase: 'a fair challenge' },
          { item: 'hard', phrase: 'i expect this quest to be a grueling endeavour' },
        ];
        if (extraHardAvailable) {
          diffCandidates.push({
            item: 'extra_hard',
            phrase: 'my fingers move faster than lightning itself',
          });
        }

        const evalDiffs = evaluateCandidates(raw, diffCandidates, 'easy');
        const best = evalDiffs[0];
        if (best && best.isValidConfirm) {
          soundEngine.playConfirm(settings);
          startNewRun(playerName, best.item);
          return;
        }

        soundEngine.playError(settings);
        return;
      }
    }

    // 6. MAP
    if (screen === 'map') {
      const nodeCandidates = availableMapNodes.map((n) => ({
        item: n,
        phrase: n.phrases[phraseDiff],
      }));
      const evalNodes = evaluateCandidates(raw, nodeCandidates, difficulty);
      const best = evalNodes[0];
      if (best && best.isValidConfirm) {
        soundEngine.playConfirm(settings);
        recordActionMetrics(best.phrase, best.distance);
        enterMapNode(best.item);
        return;
      }
      soundEngine.playError(settings);
      return;
    }

    // 7. BATTLE
    if (screen === 'battle') {
      if (biomePopupExpanded && biomePopupManual && matchCommand(raw, ['close', 'back', 'hide', 'dismiss'], 'easy')) {
        soundEngine.playPageTurn(settings);
        setBiomePopupExpanded(false);
        setBiomePopupManual(false);
        resetTypingBuffer(true);
        return;
      }

      if (pendingDiscardCount > 0) {
        if (
          matchCommand(
            raw,
            ['skip', 'pass', 'cancel', 'none', 'done', 'continue', 'end turn', 'pass turn', 'end'],
            'easy'
          )
        ) {
          spawnPopup('player', 'Cannot skip! Choose a card to discard', '#e11d48');
          resetTypingBuffer(true);
          soundEngine.playError(settings);
          return;
        }

        const candidateInstances = hand;
        if (candidateInstances.length === 0) {
          setPendingDiscardCount(0);
          resetTypingBuffer(true);
          if (pendingFollowUpDraw > 0) {
            const drawn = drawCards(
              pendingFollowUpDraw,
              hand,
              drawPile,
              discardPile,
              turnLockedCardIds
            );
            markCardsEntering(drawn.drawnCards);
            setHand(drawn.nextHand);
            setDrawPile(drawn.nextDraw);
            setDiscardPile(drawn.nextDiscard);
            soundEngine.playDrawCards(pendingFollowUpDraw, settings);
            setPendingFollowUpDraw(0);
            setHandAnimState('drawing');
            window.setTimeout(() => setHandAnimState('idle'), 380);
          }
          return;
        }

        const candidateItems = candidateInstances.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c, phraseDiff).name,
        }));
        const evalCandidates = evaluateCandidates(raw, candidateItems, difficulty);
        const best = evalCandidates[0];
        if (best && best.isValidConfirm) {
          const chosen = best.item;
          const def = getCardDefinition(chosen.cardId);
          triggerCardExits([{ card: chosen, idx: 0 }]);
          const nextHandAfterDiscard = hand.filter((c) => c.instanceId !== chosen.instanceId);
          const nextDiscardAfterDiscard = [...discardPile, chosen];
          const nextTurnLockedIds = new Set(turnLockedCardIds);
          nextTurnLockedIds.add(chosen.instanceId);

          setHand(nextHandAfterDiscard);
          setDiscardPile(nextDiscardAfterDiscard);
          setTurnLockedCardIds(nextTurnLockedIds);
          if (retainedCardIds.has(chosen.instanceId)) {
            setRetainedCardIds((prev) => {
              const next = new Set(prev);
              next.delete(chosen.instanceId);
              return next;
            });
          }
          soundEngine.playPageTurn(settings);
          triggerElementParticles(
            `[data-card-id="${chosen.instanceId}"]`,
            ['#e11d48', '#f43f5e', '#ffd166'],
            48,
            4
          );
          spawnPopup('player', `🗑️ Discarded "${def.names[phraseDiff]}"!`, '#e11d48');
          const nextRemainingCount = Math.max(0, pendingDiscardCount - 1);
          const finalRemaining = nextHandAfterDiscard.length === 0 ? 0 : nextRemainingCount;
          setPendingDiscardCount(finalRemaining);
          resetTypingBuffer(true);

          if (finalRemaining === 0 && pendingFollowUpDraw > 0) {
            const drawn = drawCards(
              pendingFollowUpDraw,
              nextHandAfterDiscard,
              drawPile,
              nextDiscardAfterDiscard,
              nextTurnLockedIds
            );
            markCardsEntering(drawn.drawnCards);
            setHand(drawn.nextHand);
            setDrawPile(drawn.nextDraw);
            setDiscardPile(drawn.nextDiscard);
            soundEngine.playDrawCards(pendingFollowUpDraw, settings);
            setPendingFollowUpDraw(0);
            setHandAnimState('drawing');
            window.setTimeout(() => setHandAnimState('idle'), 380);
          }
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (pendingKeepCount > 0) {
        if (matchCommand(raw, ['skip', 'pass', 'cancel', 'none', 'done', 'continue', 'end turn', 'pass turn', 'end'], 'easy')) {
          setPendingKeepCount(0);
          spawnPopup('player', 'Kept no card', '#64748b');
          resetTypingBuffer(true);
          if (matchCommand(raw, ['end turn', 'pass turn', 'end'], 'easy')) {
            executeEndTurn();
          }
          return;
        }

        const candidateInstances = hand.filter((c) => !retainedCardIds.has(c.instanceId));
        const candidateItems = candidateInstances.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c, phraseDiff).name,
        }));
        const evalCandidates = evaluateCandidates(raw, candidateItems, difficulty);
        const best = evalCandidates[0];
        if (best && best.isValidConfirm) {
          const chosen = best.item;
          const def = getCardDefinition(chosen.cardId);
          setRetainedCardIds((prev) => new Set([...prev, chosen.instanceId]));
          soundEngine.playPageTurn(settings);
          triggerElementParticles(`[data-card-id="${chosen.instanceId}"]`, ['#10b981', '#34d399', '#ffd166'], 48, 4);
          spawnPopup('player', `📌 Kept "${def.names[phraseDiff]}"!`, '#059669');
          setPendingKeepCount((c) => Math.max(0, c - 1));
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (
        selectedCard &&
        matchCommand(raw, ['back', 'return', 'cancel', 'deselect', 'abort'], 'easy')
      ) {
        soundEngine.playBackspace(settings);
        if (selectedDiscardInstances.length > 0) {
          setSelectedDiscardInstances((prev) => prev.slice(0, -1));
        } else if (selectedTargetEnemy) {
          setSelectedTargetEnemy(null);
        } else {
          setSelectedCard(null);
        }
        resetTypingBuffer(true);
        return;
      }

      if (!selectedCard && activeEnvironment && matchCommand(raw, [activeEnvironment.name, 'biome', 'environment'], difficulty)) {
        soundEngine.playPageTurn(settings);
        setBiomePopupExpanded(true);
        setBiomePopupManual(true);
        resetTypingBuffer(true);
        return;
      }

      if (matchCommand(raw, ['end turn', 'pass turn', 'finish turn', 'end'], difficulty)) {
        executeEndTurn();
        return;
      }

      if (!selectedCard) {
        const bestCard = evaluatedHand[0];
        if (bestCard && bestCard.isValidConfirm) {
          const chosenInst = bestCard.item.item;
          const resolved = bestCard.item.resolved;

          if (resolved.unplayable) {
            soundEngine.playError(settings);
            spawnPopup('player', 'This card is unplayable!', '#ef4444');
            resetTypingBuffer(true);
            return;
          }

          if (resolved.type === 'power' && usedPowerCardIdsThisCombat.has(chosenInst.cardId)) {
            soundEngine.playError(settings);
            spawnPopup('player', 'Power already active this combat!', '#ef4444');
            resetTypingBuffer(true);
            return;
          }

          if (energy < resolved.cost) {
            soundEngine.playError(settings);
            spawnPopup('player', `Need ${resolved.cost} Energy!`, '#b84a14');
            resetTypingBuffer(true);
            return;
          }

          soundEngine.playDrawCard(settings);
          triggerElementParticles(
            `[data-card-id="${chosenInst.instanceId}"]`,
            [
              resolved.art.primaryColor || '#bc5215',
              resolved.art.secondaryColor || '#d97706',
              '#137547',
              '#ffd166',
            ],
            14,
            45
          );
          setSelectedCard(chosenInst);
          setSelectedTargetEnemy(null);
          setSelectedDiscardInstances([]);
          setActionCharAccum((prev) => prev + resolved.name.length);
          setTypedInput('');
          return;
        }

        const bestEnemyInspect = evaluatedEnemies[0];
        if (bestEnemyInspect && bestEnemyInspect.isValidConfirm) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles(
            `[data-enemy-id="${bestEnemyInspect.item.instanceId}"]`,
            [bestEnemyInspect.item.art.primaryColor, bestEnemyInspect.item.art.secondaryColor, '#ffd166'],
            75,
            48
          );
          setInspectedEntity(bestEnemyInspect.item);
          setCodexTab('monsters');
          setCodexSelectedId(bestEnemyInspect.item.enemyId);
          setCodexDiscovery(
            unlockCodexEntries({
              enemies: [bestEnemyInspect.item.enemyId],
            })
          );
          setOverlay('codex');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['player', 'myself', playerName], 'easy')) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles('[data-player-spot="true"]', ['#165b7d', '#2980b9', '#ffd166'], 36, 48);
          setInspectedEntity('player');
          setOverlay('entity_inspect');
          resetTypingBuffer(false);
          return;
        }

        soundEngine.playError(settings);
        return;
      }

      if (isCardPlayAwaitingDiscard) {
        const bestDiscard = evaluatedDiscardCandidates[0];
        if (bestDiscard && bestDiscard.isValidConfirm) {
          const chosen = bestDiscard.item;
          const nextDiscards = [...selectedDiscardInstances, chosen];
          const remainingDiscardsNeeded = selectedCardRequiredDiscardCount - nextDiscards.length;
          const remainingEligibleCards = eligibleDiscardsInHand.filter((c) => c.instanceId !== chosen.instanceId);

          if (remainingDiscardsNeeded > 0 && remainingEligibleCards.length > 0) {
            setSelectedDiscardInstances(nextDiscards);
            setActionCharAccum((prev) => prev + bestDiscard.phrase.length);
            resetTypingBuffer(true);
            soundEngine.playPageTurn(settings);
            const def = getCardDefinition(chosen.cardId);
            spawnPopup('player', `Selected ${def.names[phraseDiff]} to discard`, '#e11d48');
            return;
          } else {
            soundEngine.playConfirm(settings);
            const speedMult = recordActionMetrics(bestDiscard.phrase, bestDiscard.distance);
            executeCardPlay(selectedCard, selectedTargetEnemy, speedMult, nextDiscards);
            return;
          }
        }
        soundEngine.playError(settings);
        return;
      }

      if (selectedCardResolved && selectedCardResolved.target === 'enemy' && !selectedTargetEnemy) {
        const bestEnemy = evaluatedEnemies[0];
        if (bestEnemy && bestEnemy.isValidConfirm) {
          soundEngine.playConfirm(settings);
          setActionCharAccum((prev) => prev + bestEnemy.phrase.length);
          if (selectedCardRequiredDiscardCount > 0 && eligibleDiscardsInHand.length > 0) {
            setSelectedTargetEnemy(bestEnemy.item);
            resetTypingBuffer(true);
            soundEngine.playPageTurn(settings);
            return;
          } else {
            const speedMult = recordActionMetrics(bestEnemy.phrase, bestEnemy.distance);
            executeCardPlay(selectedCard, bestEnemy.item, speedMult, []);
            return;
          }
        }
        soundEngine.playError(settings);
        return;
      }

      if (
        selectedCardResolved &&
        (selectedCardResolved.target === 'self' || selectedCardResolved.target === 'all_enemies')
      ) {
        const enemyMatch = evaluatedEnemies[0]?.isValidConfirm;
        const cardDef = getCardDefinition(selectedCard.cardId);
        const nameVariants = cardDef ? Object.values(cardDef.names) : [];
        if (
          !norm ||
          enemyMatch ||
          matchCommand(
            raw,
            [
              'confirm',
              'cast',
              'yes',
              'self',
              'myself',
              'me',
              'all',
              'enemies',
              'all enemies',
              playerName,
              selectedCardResolved.connector,
              selectedCardResolved.name,
              ...nameVariants,
            ],
            'easy'
          )
        ) {
          soundEngine.playConfirm(settings);
          const speedMult = recordActionMetrics(raw, 0);
          executeCardPlay(selectedCard, null, speedMult, selectedDiscardInstances);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      const bestEnemy = evaluatedEnemies[0];
      if (bestEnemy && bestEnemy.isValidConfirm) {
        soundEngine.playConfirm(settings);
        const speedMult = recordActionMetrics(bestEnemy.phrase, bestEnemy.distance);
        executeCardPlay(selectedCard, bestEnemy.item, speedMult, selectedDiscardInstances);
        return;
      }

      soundEngine.playError(settings);
      return;
    }

    // 8. POST-BATTLE REWARD
    if (screen === 'reward') {
      // Step 1: Card reward selection
      if (rewardStep === 'card') {
        if (matchCommand(raw, ['skip', 'continue', 'next', 'leave', 'pass'], 'easy')) {
          soundEngine.playConfirm(settings);
          triggerElementParticles(undefined, ['#64748b', '#102a3a'], 50, 82);
          setRewardCards([]);
          if (rewardRelics.length > 0) {
            setRewardStep('relic');
            resetTypingBuffer(true);
          } else {
            advanceToMapNextFloor();
          }
          return;
        }

        if (rewardCards.length > 0) {
          const cardCands = rewardCards.map((c) => {
            const res = resolveCardInstance(c, phraseDiff);
            return { item: c, phrase: res.name };
          });
          const evalCards = evaluateCandidates(raw, cardCands, difficulty);
          if (evalCards[0] && evalCards[0].isValidConfirm) {
            soundEngine.playDrawCard(settings);
            const picked = evalCards[0].item;
            const resPicked = resolveCardInstance(picked, phraseDiff);
            triggerElementParticles(
              `[data-card-id="${picked.instanceId}"]`,
              [resPicked.art.primaryColor, resPicked.art.secondaryColor, '#137547', '#ffd166'],
              50,
              55
            );
            setDeck((d) => [...d, picked]);
            setRewardCards([]);
            resetTypingBuffer(true);
            if (rewardRelics.length > 0) {
              setRewardStep('relic');
            } else {
              advanceToMapNextFloor();
            }
            return;
          }
        }

        soundEngine.playError(settings);
        return;
      }

      // Step 2: Relic reward selection (for elite encounters)
      if (rewardStep === 'relic') {
        if (matchCommand(raw, ['skip', 'continue', 'next', 'leave', 'pass'], 'easy')) {
          soundEngine.playConfirm(settings);
          triggerElementParticles(undefined, ['#64748b', '#102a3a'], 50, 82);
          setRewardRelics([]);
          advanceToMapNextFloor();
          return;
        }

        if (rewardRelics.length > 0) {
          const relicCands = rewardRelics.map((r) => ({
            item: r,
            phrase: r.names[phraseDiff],
          }));
          const evalRelics = evaluateCandidates(raw, relicCands, difficulty);
          if (evalRelics[0] && evalRelics[0].isValidConfirm) {
            soundEngine.playRelicGain(settings);
            const pickedRelic = evalRelics[0].item;
            triggerElementParticles(
              undefined,
              [pickedRelic.art.primaryColor, pickedRelic.art.secondaryColor, '#ffd166'],
              50,
              62
            );
            setRelicIds((ids) => [...ids, pickedRelic.id]);
            if (pickedRelic.trigger === 'passive_max_hp' && pickedRelic.effectType === 'max_hp') {
              setMaxHp((m) => m + pickedRelic.amount);
              setHp((h) => h + pickedRelic.amount);
            }
            setRewardRelics([]);
            resetTypingBuffer(true);
            advanceToMapNextFloor();
            return;
          }
        }

        soundEngine.playError(settings);
        return;
      }
    }

    // 9. CAMPFIRE
    if (screen === 'campfire') {
      if (campfireSubMode === 'choose') {
        if (matchCommand(raw, ['rest', 'sleep', 'heal', 'rest by the fire'], difficulty)) {
          soundEngine.playCampfireRest(settings);
          triggerElementParticles(undefined, ['#3a8918', '#d95d16', '#ffd166'], 50, 58);
          let healAmt = Math.max(10, Math.round(maxHp * 0.3));
          relicIds.forEach((id) => {
            const r = getRelicDefinition(id);
            if (r && r.trigger === 'on_rest' && r.effectType === 'heal') healAmt += r.amount;
          });
          setHp((h) => Math.min(maxHp, h + healAmt));
          advanceToMapNextFloor();
          return;
        }
        if (matchCommand(raw, ['revise', 'edit', 'upgrade', 'smith', 'revise a card'], difficulty)) {
          soundEngine.playPageTurn(settings);
          triggerElementParticles(undefined, ['#d95d16', '#ffd166', '#137547'], 50, 66);
          setCampfireSubMode('revise_select');
          setCampfireSelectedCard(null);
          resetTypingBuffer(true);
          return;
        }
        if (matchCommand(raw, ['skip', 'leave'], 'easy')) {
          soundEngine.playConfirm(settings);
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (campfireSubMode === 'revise_select') {
        if (matchCommand(raw, ['back', 'return', 'cancel'], 'easy')) {
          setCampfireSubMode('choose');
          setCampfireSelectedCard(null);
          resetTypingBuffer(true);
          return;
        }
        const upgradable = sortCardsByCategoryAndRarity(
          deck.filter((c) => !c.upgraded),
          (c) => c,
          phraseDiff
        );
        const cands = upgradable.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c, phraseDiff).name,
        }));
        const evalUp = evaluateCandidates(raw, cands, difficulty);
        if (evalUp[0] && evalUp[0].isValidConfirm) {
          soundEngine.playPageTurn(settings);
          const targetInst = evalUp[0].item;
          setCampfireSelectedCard(targetInst);
          setCampfireSubMode('revise_confirm');
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (campfireSubMode === 'revise_confirm') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'no'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setCampfireSubMode('revise_select');
          setCampfireSelectedCard(null);
          resetTypingBuffer(true);
          return;
        }
        if (matchCommand(raw, ['confirm', 'upgrade', 'revise', 'yes'], difficulty)) {
          if (!campfireSelectedCard) {
            setCampfireSubMode('revise_select');
            resetTypingBuffer(true);
            return;
          }
          const isStrike = campfireSelectedCard.cardId.toLowerCase().includes('strike');
          if (isStrike) {
            soundEngine.playStrikeUpgrade(settings);
          } else {
            soundEngine.playCardCast(settings);
          }
          triggerElementParticles(
            undefined,
            ['#137547', '#ffd166', '#d95d16'],
            60,
            75
          );
          setDeck((prev) =>
            prev.map((c) =>
              c.instanceId === campfireSelectedCard.instanceId ? { ...c, upgraded: true } : c
            )
          );
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        return;
      }
    }

    // 10. MERCHANT
    if (screen === 'merchant' && shopInventory) {
      if (shopSubMode === 'remove_select') {
        if (matchCommand(raw, ['back', 'return', 'cancel'], 'easy')) {
          setShopSubMode('browse');
          resetTypingBuffer(true);
          return;
        }
        const sortedDeck = sortCardsByCategoryAndRarity(deck, (c) => c, phraseDiff);
        const cands = sortedDeck.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c, phraseDiff).name,
        }));
        const evalRem = evaluateCandidates(raw, cands, difficulty);
        if (evalRem[0] && evalRem[0].isValidConfirm) {
          soundEngine.playBurnCard(settings);
          soundEngine.playCoinClink(settings);
          const toRemove = evalRem[0].item;
          triggerElementParticles(
            `[data-card-id="${toRemove.instanceId}"]`,
            ['#9e2a2b', '#d95d16', '#ffd166'],
            50,
            58
          );
          setDeck((prev) => prev.filter((c) => c.instanceId !== toRemove.instanceId));
          setGold((g) => g - shopInventory.removeServicePrice);
          setShopInventory({ ...shopInventory, removeUsed: true });
          setShopSubMode('browse');
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (matchCommand(raw, ['leave', 'exit', 'continue', 'skip', 'back'], 'easy')) {
        soundEngine.playShopExit(settings);
        triggerElementParticles(undefined, ['#1b7a58', '#ffd166'], 50, 82);
        advanceToMapNextFloor();
        return;
      }

      if (matchCommand(raw, ['burn card', 'remove card', 'purge card', 'remove'], difficulty)) {
        if (shopInventory.removeUsed || gold < shopInventory.removeServicePrice) {
          soundEngine.playError(settings);
          return;
        }
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#9e2a2b', '#d95d16'], 50, 35);
        setShopSubMode('remove_select');
        resetTypingBuffer(true);
        return;
      }

      const availCards = shopInventory.cards.filter((c) => !c.sold);
      const evalShopCards = evaluateCandidates(
        raw,
        availCards.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c.instance, phraseDiff).name,
        })),
        difficulty
      );
      if (evalShopCards[0] && evalShopCards[0].isValidConfirm) {
        const entry = evalShopCards[0].item;
        if (gold < entry.price) {
          soundEngine.playError(settings);
          return;
        }
        soundEngine.playDrawCard(settings);
        soundEngine.playCoinClink(settings);
        triggerElementParticles(
          `[data-card-id="${entry.instance.instanceId}"]`,
          ['#1b7a58', '#b67d10', '#ffd166'],
          50,
          55
        );
        setGold((g) => g - entry.price);
        setDeck((d) => [...d, entry.instance]);
        setShopInventory({
          ...shopInventory,
          cards: shopInventory.cards.map((c) =>
            c.instance.instanceId === entry.instance.instanceId ? { ...c, sold: true } : c
          ),
        });
        resetTypingBuffer(true);
        return;
      }

      const availRelics = shopInventory.relics.filter((r) => !r.sold);
      const evalShopRelics = evaluateCandidates(
        raw,
        availRelics.map((r) => ({
          item: r,
          phrase: r.relic.names[phraseDiff],
        })),
        difficulty
      );
      if (evalShopRelics[0] && evalShopRelics[0].isValidConfirm) {
        const entry = evalShopRelics[0].item;
        if (gold < entry.price) {
          soundEngine.playError(settings);
          return;
        }
        soundEngine.playRelicGain(settings);
        soundEngine.playCoinClink(settings);
        triggerElementParticles(
          undefined,
          [entry.relic.art.primaryColor, entry.relic.art.secondaryColor, '#ffd166'],
          50,
          72
        );
        setGold((g) => g - entry.price);
        setRelicIds((ids) => [...ids, entry.relic.id]);
        setShopInventory({
          ...shopInventory,
          relics: shopInventory.relics.map((r) =>
            r.relic.id === entry.relic.id ? { ...r, sold: true } : r
          ),
        });
        resetTypingBuffer(true);
        return;
      }

      soundEngine.playError(settings);
      return;
    }

    // 11. TREASURE CHEST
    if (screen === 'treasure') {
      if (matchCommand(raw, ['skip', 'leave', 'continue'], 'easy')) {
        soundEngine.playConfirm(settings);
        advanceToMapNextFloor();
        return;
      }
      const evalRelics = evaluateCandidates(
        raw,
        rewardRelics.map((r) => ({ item: r, phrase: r.names[phraseDiff] })),
        difficulty
      );
      if (evalRelics[0] && evalRelics[0].isValidConfirm) {
        soundEngine.playRelicGain(settings);
        const picked = evalRelics[0].item;
        triggerElementParticles(
          undefined,
          [picked.art.primaryColor, picked.art.secondaryColor, '#b67d10', '#ffd166'],
          50,
          58
        );
        setRelicIds((ids) => [...ids, picked.id]);
        if (picked.trigger === 'passive_max_hp' && picked.effectType === 'max_hp') {
          setMaxHp((m) => m + picked.amount);
          setHp((h) => h + picked.amount);
        }
        advanceToMapNextFloor();
        return;
      }
      soundEngine.playError(settings);
      return;
    }

    // 12. MYSTERY ENCOUNTER
    if (screen === 'mystery' && activeEvent) {
      if (
        isPlaytestingEncounter &&
        matchCommand(raw, ['exit', 'quit', 'stop', 'leave test', 'end test', 'cancel'], 'easy')
      ) {
        soundEngine.playConfirm(settings);
        exitPlaytestEncounter();
        return;
      }

      if (mysterySubMode === 'select_card_to_upgrade') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'leave', 'skip'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setMysterySubMode('event');
          setMysterySelectedCard(null);
          if (isPlaytestingEncounter) {
            exitPlaytestEncounter();
            return;
          }
          advanceToMapNextFloor();
          return;
        }
        const upgradable = sortCardsByCategoryAndRarity(
          deck.filter((c) => !c.upgraded),
          (c) => c,
          phraseDiff
        );
        const evalUp = evaluateCandidates(
          raw,
          upgradable.map((c) => ({ item: c, phrase: resolveCardInstance(c, phraseDiff).name })),
          difficulty
        );
        if (evalUp[0] && evalUp[0].isValidConfirm) {
          soundEngine.playPageTurn(settings);
          setMysterySelectedCard(evalUp[0].item);
          setMysterySubMode('confirm_card_upgrade');
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (mysterySubMode === 'confirm_card_upgrade') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'no'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setMysterySubMode('select_card_to_upgrade');
          setMysterySelectedCard(null);
          resetTypingBuffer(true);
          return;
        }
        if (matchCommand(raw, ['confirm', 'upgrade', 'revise', 'yes'], difficulty)) {
          if (mysterySelectedCard) {
            setDeck((prev) =>
              prev.map((c) =>
                c.instanceId === mysterySelectedCard.instanceId ? { ...c, upgraded: true } : c
              )
            );
            soundEngine.playCardCast(settings);
            triggerElementParticles(undefined, ['#3b82f6', '#ffd166', '#10b981'], 50, 60);
          }
          setMysterySubMode('event');
          setMysterySelectedCard(null);
          if (isPlaytestingEncounter) {
            exitPlaytestEncounter();
            return;
          }
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (mysterySubMode === 'select_card_to_invert') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'leave', 'skip'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setMysterySubMode('event');
          setMysterySelectedCard(null);
          if (isPlaytestingEncounter) {
            exitPlaytestEncounter();
            return;
          }
          advanceToMapNextFloor();
          return;
        }
        const invertCandidates = sortCardsByCategoryAndRarity(
          deck.filter((c) => !c.inverted && getCardDefinition(c.cardId)?.type !== 'curse'),
          (c) => c,
          phraseDiff
        );
        const evalInv = evaluateCandidates(
          raw,
          invertCandidates.map((c) => ({ item: c, phrase: resolveCardInstance(c, phraseDiff).name })),
          difficulty
        );
        if (evalInv[0] && evalInv[0].isValidConfirm) {
          soundEngine.playPageTurn(settings);
          setMysterySelectedCard(evalInv[0].item);
          setMysterySubMode('confirm_card_invert');
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (mysterySubMode === 'confirm_card_invert') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'no'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setMysterySubMode('select_card_to_invert');
          setMysterySelectedCard(null);
          resetTypingBuffer(true);
          return;
        }
        if (matchCommand(raw, ['confirm', 'invert', 'mirror', 'yes'], difficulty)) {
          if (mysterySelectedCard) {
            setDeck((prev) =>
              prev.map((c) =>
                c.instanceId === mysterySelectedCard.instanceId ? { ...c, inverted: true } : c
              )
            );
            soundEngine.playCardCast(settings);
            triggerElementParticles(undefined, ['#a855f7', '#6366f1', '#38bdf8', '#ffd166'], 60, 65);
          }
          setMysterySubMode('event');
          setMysterySelectedCard(null);
          if (isPlaytestingEncounter) {
            exitPlaytestEncounter();
            return;
          }
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (mysterySubMode === 'select_card_to_consecrate') {
        if (matchCommand(raw, ['back', 'return', 'cancel', 'leave'], 'easy')) {
          soundEngine.playPageTurn(settings);
          setMysterySubMode('event');
          setMysterySelectedCard(null);
          setPendingConsecrateChoice(null);
          resetTypingBuffer(true);
          return;
        }
        const nonCurse = deck.filter((c) => getCardDefinition(c.cardId)?.type !== 'curse');
        const consecrateCandidates = sortCardsByCategoryAndRarity(
          nonCurse.length > 0 ? nonCurse : deck,
          (c) => c,
          phraseDiff
        );
        const evalCons = evaluateCandidates(
          raw,
          consecrateCandidates.map((c) => ({ item: c, phrase: resolveCardInstance(c, phraseDiff).name })),
          difficulty
        );
        if (evalCons[0] && evalCons[0].isValidConfirm && pendingConsecrateChoice) {
          soundEngine.playPageTurn(settings);
          setMysterySelectedCard(evalCons[0].item);
          setMysterySubMode('event');
          setPendingChanceChoice(pendingConsecrateChoice);
          setPendingConsecrateChoice(null);
          resetTypingBuffer(true);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      if (pendingChanceChoice && eventOutcomeText === null) {
        // Wheel of Fate is actively spinning
        return;
      }

      if (eventOutcomeText !== null) {
        if (!norm || matchCommand(raw, ['continue', 'onward', 'next', 'leave'], 'easy')) {
          soundEngine.playConfirm(settings);
          triggerElementParticles('.prompt-panel', ['#1b6488', '#137547', '#ffd166'], 50, 72);
          setPendingChanceChoice(null);
          setConsecratedResultCard(null);
          setEventOutcomeText(null);
          setEventOutcomeSummary([]);
          setEventRollSucceeded(null);
          if (isPlaytestingEncounter) {
            exitPlaytestEncounter();
            return;
          }
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      const evalChoices = evaluateCandidates(
        raw,
        activeEvent.choices.map((ch) => ({ item: ch, phrase: ch.phrases[phraseDiff] })),
        difficulty
      );
      if (evalChoices[0] && evalChoices[0].isValidConfirm) {
        const choice = evalChoices[0].item;

        // If the choice involves risk / % chance, trigger the Wheel of Fate!
        if (typeof choice.chance === 'number') {
          if (choice.effects.chooseCardBeforeRoll) {
            soundEngine.playPageTurn(settings);
            setPendingConsecrateChoice(choice);
            setMysterySubMode('select_card_to_consecrate');
            setMysterySelectedCard(null);
            resetTypingBuffer(true);
            return;
          }
          soundEngine.playPageTurn(settings);
          setPendingChanceChoice(choice);
          resetTypingBuffer(true);
          return;
        }

        // Safe deterministic choice
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#1b6488', '#137547', '#ffd166'], 50, 65);
        executeMysteryChoiceEffects(choice, true);
        return;
      }

      soundEngine.playError(settings);
      return;
    }

    // 13. GAME OVER / VICTORY REPORT CARD
    if (screen === 'game_over' || screen === 'victory') {
      if (isPlaytestingEncounter) {
        soundEngine.playConfirm(settings);
        exitPlaytestEncounter();
        return;
      }
      if (matchCommand(raw, ['new run', 'restart', 'play again', 'again', 'start', 'menu'], 'easy')) {
        soundEngine.playPageTurn(settings);
        triggerElementParticles(undefined, ['#137547', '#ffd166'], 50, 75);
        setScreen('main_menu');
        resetTypingBuffer(true);
        return;
      }
      soundEngine.playError(settings);
    }
  }, [
    activeEnvironment,
    activeEvent,
    advanceToMapNextFloor,
    availableMapNodes,
    biomePopupExpanded,
    biomePopupManual,
    campfireSelectedCard,
    campfireSubMode,
    deck,
    difficulty,
    energy,
    enterMapNode,
    evaluatedEnemies,
    evaluatedHand,
    eventOutcomeText,
    executeCardPlay,
    executeEndTurn,
    executeMysteryChoiceEffects,
    exitPlaytestEncounter,
    extraHardAvailable,
    gold,
    introStep,
    isAnimatingTurn,
    isPlaytestingEncounter,
    maxHp,
    mysterySelectedCard,
    mysterySubMode,
    overlay,
    pendingChanceChoice,
    pendingConsecrateChoice,
    pendingDiscardCount,
    pendingFollowUpDraw,
    pendingKeepCount,
    phraseDiff,
    playerName,
    recordActionMetrics,
    relicIds,
    resetTypingBuffer,
    restoreFromSavePayload,
    retainedCardIds,
    rewardCards,
    rewardRelics,
    rewardStep,
    screen,
    selectedCard,
    selectedCardRequiredDiscardCount,
    selectedCardResolved,
    selectedDiscardInstances,
    selectedTargetEnemy,
    eligibleDiscardsInHand,
    evaluatedDiscardCandidates,
    isCardPlayAwaitingDiscard,
    settings,
    shopInventory,
    shopSubMode,
    spawnPopup,
    startNewRun,
    triggerElementParticles,
    tutorialStep,
    typedInput,
    turnLockedCardIds,
    usedPowerCardIdsThisCombat,
  ]);

  const handleEnterRef = useRef(handleEnterSubmit);
  useEffect(() => {
    handleEnterRef.current = handleEnterSubmit;
  }, [handleEnterSubmit]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (devEditorOpen) {
        return;
      }
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (screen === 'map' && overlay === 'none') {
        const maxScroll = Math.max(5000, mapFloors.length * 340 + 400);
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.max(0, prev - 160));
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.min(maxScroll, prev + 160));
          return;
        }
        if (e.key === 'PageUp') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.max(0, prev - 420));
          return;
        }
        if (e.key === 'PageDown') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.min(maxScroll, prev + 420));
          return;
        }
      }

      if (screen === 'tutorial' && tutorialStep === 5) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setTutorialMapScroll((prev) => Math.min(45, prev + 25));
          soundEngine.playWheelTick(settings);
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setTutorialMapScroll((prev) => Math.max(-45, prev - 25));
          soundEngine.playWheelTick(settings);
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnterRef.current();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        soundEngine.playBackspace(settings);
        if (typedInput.length === 0) {
          if (selectedDiscardInstances.length > 0) {
            setSelectedDiscardInstances((prev) => prev.slice(0, -1));
            return;
          }
          if (selectedTargetEnemy) {
            setSelectedTargetEnemy(null);
            return;
          }
          if (selectedCard) {
            setSelectedCard(null);
            return;
          }
        }
        setTypedInput((prev) => {
          const next = prev.slice(0, -1);
          if (next.trim().length === 0 && !selectedCard) {
            setActionStartTime(null);
            setActionCharAccum(0);
            setLiveWpm(40);
          }
          return next;
        });
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (overlay !== 'none') {
          soundEngine.playPageTurn(settings);
          setOverlay('none');
          setCombatTutorialStep(null);
          return;
        }
        soundEngine.playBackspace(settings);
        if (selectedCard) {
          setSelectedCard(null);
          setSelectedTargetEnemy(null);
          setSelectedDiscardInstances([]);
        }
        resetTypingBuffer(true);
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        soundEngine.playKeystroke(settings);
        setTypedInput((prev) => {
          if (prev.trim().length === 0 && actionStartTime === null) {
            setActionStartTime(Date.now());
          }
          return prev + e.key;
        });
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      if (devEditorOpen) return;
      const text = e.clipboardData?.getData('text');
      if (text) {
        e.preventDefault();
        setTypedInput((prev) => prev + text.trim());
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('paste', onPaste);
    };
  }, [actionStartTime, devEditorOpen, overlay, resetTypingBuffer, screen, selectedCard, selectedDiscardInstances, selectedTargetEnemy, settings, typedInput.length]);

  /**
   * Computes the faint ghost autocomplete suffix shown in front of (after) the cursor
   * and the target phrase once the student has typed at least 5 characters of a matching option!
   */
  const { ghostAutocompleteSuffix, ghostTargetPhrase } = useMemo<{
    ghostAutocompleteSuffix: string;
    ghostTargetPhrase: string;
  }>(() => {
    if (typedInput.length < 5) return { ghostAutocompleteSuffix: '', ghostTargetPhrase: '' };

    const pool: string[] = [];

    if (overlay !== 'none') {
      if (overlay === 'combat_tutorial') {
        pool.push('gold', 'next', 'skip');
        if (combatTutorialStep !== null && combatTutorialStep > 7) {
          pool.push('back');
        }
      } else {
        pool.push('back', 'return', 'close', 'gold');
      }
      if (overlay === 'options') {
        pool.push(
          'deck',
          'view deck',
          'cards',
          'discard',
          'view discard',
          'burned',
          'burn draft',
          'relics',
          'codex',
          'status effects',
          'help',
          'save',
          'editor',
          'main menu',
          'surrender',
          'mute',
          'unmute',
          'typewriter',
          'mechanical typewriter',
          'telegraph',
          'vintage telegraph',
          'quill',
          'arcane quill',
          'chalk',
          'soft chalk',
          'bell',
          'carriage bell',
          'chime',
          'spell chime',
          'stamp',
          'heavy stamp',
          'contrast',
          'high contrast'
        );
      }
    } else {
      if (screen === 'main_menu') {
        pool.push('new run', 'tutorial', 'load', 'options', 'editor', 'help');
      } else if (screen === 'tutorial') {
        pool.push('back', 'menu');
        if (tutorialStep !== 1 && tutorialStep !== 15) {
          pool.push('next');
        }
        if (tutorialStep === 1) pool.push('practice practice practice');
        if (tutorialStep === 5) {
          tutorialMapOptions.forEach((opt) => pool.push(opt.name));
        }
        if (tutorialStep === 15) pool.push('start run', 'review');
      } else if (screen === 'peasant_intro') {
        if (introStep === 'ask_difficulty') {
          pool.push(
            'easy',
            'a fair challenge',
            'i expect this quest to be a grueling endeavour'
          );
          if (extraHardAvailable) {
            pool.push('my fingers move faster than lightning itself');
          }
        }
        pool.push('back');
      } else if (screen === 'map') {
        availableMapNodes.forEach((n) => pool.push(n.phrases[phraseDiff]));
      } else if (screen === 'battle') {
        if (pendingDiscardCount > 0) {
          hand.forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
        } else if (pendingKeepCount > 0) {
          hand
            .filter((c) => !retainedCardIds.has(c.instanceId))
            .forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('skip', 'pass', 'end turn');
        } else if (isCardPlayAwaitingDiscard) {
          eligibleDiscardsInHand.forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('back', 'cancel');
        } else {
          if (biomePopupExpanded && biomePopupManual) {
            pool.push('close', 'back');
          }
          if (!biomePopupExpanded && activeEnvironment) {
            pool.push(activeEnvironment.name);
          }
          if (!selectedCard) {
            handCandidates.forEach((c) => pool.push(c.phrase));
            enemies.forEach((e) => pool.push(e.displayName));
            pool.push('end turn', 'view discard', 'view deck', 'status effects', 'relics');
          } else if (
            selectedCardResolved &&
            (selectedCardResolved.target === 'self' ||
              selectedCardResolved.target === 'all_enemies')
          ) {
            pool.push(
              selectedCardResolved.connector,
              selectedCardResolved.name,
              'confirm',
              'back',
              'cancel'
            );
          } else {
            enemies.forEach((e) => pool.push(e.displayName));
            pool.push('back', 'cancel');
          }
        }
      } else if (screen === 'reward') {
        if (rewardStep === 'card') {
          rewardCards.forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
        } else {
          rewardRelics.forEach((r) => pool.push(r.names[phraseDiff]));
        }
        pool.push('skip', 'continue');
      } else if (screen === 'campfire') {
        if (campfireSubMode === 'choose') {
          pool.push('rest', 'revise', 'skip');
        } else if (campfireSubMode === 'revise_select') {
          deck
            .filter((c) => !c.upgraded)
            .forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('back');
        } else if (campfireSubMode === 'revise_confirm') {
          pool.push('confirm', 'back');
        }
      } else if (screen === 'merchant' && shopInventory) {
        if (shopSubMode === 'remove_select') {
          deck.forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('back');
        } else {
          shopInventory.cards
            .filter((c) => !c.sold)
            .forEach((c) => pool.push(resolveCardInstance(c.instance, phraseDiff).name));
          shopInventory.relics
            .filter((r) => !r.sold)
            .forEach((r) => pool.push(r.relic.names[phraseDiff]));
          pool.push('burn card', 'leave');
        }
      } else if (screen === 'treasure') {
        rewardRelics.forEach((r) => pool.push(r.names[phraseDiff]));
        pool.push('skip');
      } else if (screen === 'mystery' && activeEvent) {
        if (mysterySubMode === 'select_card_to_upgrade') {
          deck
            .filter((c) => !c.upgraded)
            .forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('back');
        } else if (mysterySubMode === 'confirm_card_upgrade') {
          pool.push('confirm', 'back');
        } else if (mysterySubMode === 'select_card_to_invert') {
          deck
            .filter((c) => !c.inverted && getCardDefinition(c.cardId)?.type !== 'curse')
            .forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('back');
        } else if (mysterySubMode === 'confirm_card_invert') {
          pool.push('confirm', 'back');
        } else if (mysterySubMode === 'select_card_to_consecrate') {
          deck
            .filter((c) => getCardDefinition(c.cardId)?.type !== 'curse')
            .forEach((c) => pool.push(resolveCardInstance(c, phraseDiff).name));
          pool.push('back');
        } else if (pendingChanceChoice && eventOutcomeText === null) {
          // Wheel is actively spinning
        } else if (eventOutcomeText === null) {
          activeEvent.choices.forEach((ch) => pool.push(ch.phrases[phraseDiff]));
          if (isPlaytestingEncounter) {
            pool.push('exit');
          }
        } else {
          pool.push('continue');
          if (isPlaytestingEncounter) {
            pool.push('exit');
          }
        }
      } else if (screen === 'game_over' || screen === 'victory') {
        pool.push('new run');
      }

      if (!isCardPlayAwaitingDiscard && pendingDiscardCount === 0 && pendingKeepCount === 0) {
        pool.push('help', 'options', 'save', 'relics', 'gold', 'view deck', 'status effects', 'editor');
        STATUS_DEFINITIONS.forEach((st) => pool.push(st.name));
      }
    }

    const uniquePool = Array.from(new Set(pool));
    const evaluated = evaluateCandidates(
      typedInput,
      uniquePool.map((p) => ({ item: p, phrase: p })),
      difficulty
    );
    const best = evaluated[0];
    if (!best || !best.isPrefixMatch) return { ghostAutocompleteSuffix: '', ghostTargetPhrase: '' };

    const candidatePhrase = best.phrase;
    const { ghostSuffix } = analyzeTypingWithWordAnchors(typedInput, candidatePhrase);
    return {
      ghostAutocompleteSuffix: ghostSuffix,
      ghostTargetPhrase: candidatePhrase,
    };
  }, [
    activeEnvironment,
    activeEvent,
    availableMapNodes,
    biomePopupExpanded,
    biomePopupManual,
    campfireSelectedCard,
    campfireSubMode,
    deck,
    difficulty,
    eligibleDiscardsInHand,
    enemies,
    eventOutcomeText,
    extraHardAvailable,
    handCandidates,
    introStep,
    isCardPlayAwaitingDiscard,
    isPlaytestingEncounter,
    mysterySubMode,
    overlay,
    pendingChanceChoice,
    phraseDiff,
    rewardCards,
    rewardRelics,
    rewardStep,
    screen,
    selectedCard,
    selectedCardResolved,
    shopInventory,
    shopSubMode,
    combatTutorialStep,
    tutorialStep,
    typedInput,
  ]);

  const avgWpm = useMemo(() => {
    if (metrics.wpmSamples.length === 0) return 0;
    return Math.round(
      metrics.wpmSamples.reduce((a, b) => a + b, 0) / metrics.wpmSamples.length
    );
  }, [metrics.wpmSamples]);

  const accuracyPercent = useMemo(() => {
    if (metrics.totalCharsTyped <= 0) return 100;
    const raw =
      ((metrics.totalCharsTyped - metrics.totalErrorsCost) / metrics.totalCharsTyped) * 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [metrics.totalCharsTyped, metrics.totalErrorsCost]);

  const currentSaveCode = useMemo(
    () =>
      encodeSaveCode(
        playerName,
        difficulty,
        currentFloor,
        hp,
        maxHp,
        gold,
        deck,
        relicIds,
        metrics
      ),
    [currentFloor, deck, difficulty, gold, hp, maxHp, metrics, playerName, relicIds]
  );

  const renderRelicIconsBar = () => (
    <div className="relic-icons-bar" aria-label="Collected Relics">
      {relicIds.map((rId, idx) => {
        const rel = getRelicDefinition(rId);
        if (!rel) return null;
        return (
          <div key={`${rId}_${idx}`} className="relic-icon-slot">
            {rel.art.spriteUrl ? (
              <img src={rel.art.spriteUrl} alt="" className="relic-pixel-img" />
            ) : (
              <div className="relic-fallback-dot" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCommandPills = (commands: string[]) => (
    <div className="minimal-command-hint">
      <span className="cmd-hint-prefix">type</span>
      {commands.map((cmd) => {
        const st = getPhraseHighlightState(cmd, 'easy');
        return (
          <span
            key={cmd}
            data-cmd={cmd}
            onClick={cmd === 'editor' ? () => setDevEditorOpen(true) : undefined}
            className={`top-cmd-box ${st.isHighlighted ? 'top-cmd-highlighted' : ''} ${
              st.isEnterReady ? 'top-cmd-enter-ready' : ''
            }`}
          >
            {cmd}
          </span>
        );
      })}
    </div>
  );

  const renderCategorizedCardGrid = (
    cards: CardInstance[],
    emptyLabel = 'No cards',
    enableCombatGlows = false
  ) => {
    if (cards.length === 0) {
      return <p className="deck-empty-note">{emptyLabel}</p>;
    }

    const categoryOrder: CardVisualCategory[] = ['attack', 'defence', 'skill', 'debuff', 'power'];
    const sortedAll = sortCardsByCategoryAndRarity(cards, (c) => c, phraseDiff);

    const isCombatDeck = enableCombatGlows && screen === 'battle';
    const handInstanceIds = isCombatDeck ? new Set(hand.map((c) => c.instanceId)) : null;
    const discardInstanceIds = isCombatDeck ? new Set(discardPile.map((c) => c.instanceId)) : null;
    const burnInstanceIds = isCombatDeck ? new Set(burnDraftPile.map((c) => c.instanceId)) : null;

    return (
      <div className="categorized-deck-container">
        {categoryOrder.map((cat) => {
          const catCards = sortedAll.filter(
            (c) => getCardVisualCategory(resolveCardInstance(c, phraseDiff)) === cat
          );
          if (catCards.length === 0) return null;
          return (
            <div key={cat} className="deck-category-section">
              <h3 className={`deck-category-title deck-cat-title-${cat}`}>
                {CARD_CATEGORY_LABELS[cat]} ({catCards.length})
              </h3>
              <div className="deck-banner-grid">
                {catCards.map((inst, idx) => {
                  let combatGlow: 'purple' | 'red' | 'green' | 'yellow' | undefined = undefined;
                  if (isCombatDeck) {
                    if (discardInstanceIds?.has(inst.instanceId)) {
                      combatGlow = 'purple';
                    } else if (burnInstanceIds?.has(inst.instanceId)) {
                      combatGlow = 'red';
                    } else if (handInstanceIds?.has(inst.instanceId)) {
                      combatGlow = 'green';
                    } else {
                      combatGlow = 'yellow';
                    }
                  }

                  return (
                    <CardBanner
                      key={inst.instanceId}
                      instance={inst}
                      phraseDiff={phraseDiff}
                      index={idx}
                      combatStatusGlow={combatGlow}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTypingInputWithCaret = () => (
    <TypingConsoleDisplay
      typedInput={typedInput}
      ghostAutocompleteSuffix={ghostAutocompleteSuffix}
      suggestedPhrase={ghostTargetPhrase}
      className="modal-embedded-input"
    />
  );

  interface MysteryEffectToken {
    text: string;
    isPositive?: boolean;
    isNegative?: boolean;
  }

  const formatEffectsTokens = (
    eff?: MysteryEffects,
    isFailureContext: boolean = false
  ): MysteryEffectToken[] => {
    if (!eff) return [];
    const tokens: MysteryEffectToken[] = [];
    if (eff.maxHpChange) {
      tokens.push({
        text: `${eff.maxHpChange > 0 ? '+' : ''}${eff.maxHpChange} Max HP`,
        isPositive: eff.maxHpChange > 0,
        isNegative: eff.maxHpChange < 0,
      });
    }
    if (eff.hpChange) {
      tokens.push({
        text: `${eff.hpChange > 0 ? '+' : ''}${eff.hpChange} HP`,
        isPositive: eff.hpChange > 0,
        isNegative: eff.hpChange < 0,
      });
    }
    if (eff.goldChange) {
      tokens.push({
        text: `${eff.goldChange > 0 ? '+' : ''}${eff.goldChange} Gold`,
        isPositive: eff.goldChange > 0,
        isNegative: eff.goldChange < 0,
      });
    }
    if (eff.gainRareCard) tokens.push({ text: '+1 Rare Card', isPositive: true });
    if (eff.gainRandomCard) tokens.push({ text: '+1 Card', isPositive: true });
    if (eff.upgradeRandomCard) tokens.push({ text: 'Upgrade a Card', isPositive: true });
    if (eff.gainRandomRelic) tokens.push({ text: '+1 Relic', isPositive: true });
    if (eff.gainSpecificCardId) {
      const specDef = getCardDefinition(eff.gainSpecificCardId);
      tokens.push({
        text: `+1 '${specDef ? specDef.names[phraseDiff] || specDef.names.easy : eff.gainSpecificCardId}' Card`,
        isPositive: true,
      });
    }
    if (eff.removeRandomCardsCount && eff.removeRandomCardsCount > 1) {
      tokens.push({ text: `Lost ${eff.removeRandomCardsCount} Cards`, isNegative: true });
    } else if (eff.removeRandomCard) {
      tokens.push({ text: 'Remove a Card' });
    }
    if (eff.gainCurseCard) tokens.push({ text: 'Gain Curse', isNegative: true });
    if (eff.chooseCardToInvert) tokens.push({ text: 'Invert a Card' });
    if (eff.chooseCardToUpgrade) tokens.push({ text: 'Choose Card to Upgrade', isPositive: true });
    if (eff.chooseCardBeforeRoll) {
      if (isFailureContext) {
        tokens.push({ text: 'add a random negative flaw to a card', isNegative: true });
      } else {
        tokens.push({ text: 'add a random positive power to a card', isPositive: true });
      }
    }
    if (eff.revealSecretPath) tokens.push({ text: '✨ Secret Leyline', isPositive: true });
    if (eff.startBattleEnemies && eff.startBattleEnemies.length > 0) {
      tokens.push({
        text: eff.battleNoCardReward ? '⚔️ Battle (No Card Reward)' : '⚔️ Battle',
        isNegative: true,
      });
    }
    return tokens;
  };

  const renderEffectTokenSpan = (
    t: MysteryEffectToken,
    idx: number,
    total: number
  ) => (
    <span key={idx}>
      <span
        style={{
          color: t.isPositive ? '#059669' : t.isNegative ? '#dc2626' : 'inherit',
          fontWeight: 700,
        }}
      >
        {t.text}
      </span>
      {idx < total - 1 ? ', ' : ''}
    </span>
  );

  const renderMysteryChoiceOdds = (ch: MysteryChoice) => {
    const winTokens = formatEffectsTokens(ch.effects, false);
    const failTokens = formatEffectsTokens(ch.failEffects, true);
    if (typeof ch.chance === 'number') {
      return (
        <div className="mystery-choice-odds-row">
          <span className="mystery-odds-badge odds-gamble">
            🎲 {ch.chance}% Success:{' '}
            {winTokens.length > 0
              ? winTokens.map((t, i) => renderEffectTokenSpan(t, i, winTokens.length))
              : 'No Change'}
          </span>
          <span className="mystery-odds-badge odds-fail">
            {100 - ch.chance}% Fail:{' '}
            {failTokens.length > 0
              ? failTokens.map((t, i) => renderEffectTokenSpan(t, i, failTokens.length))
              : 'Nothing'}
          </span>
        </div>
      );
    }
    return (
      <div className="mystery-choice-odds-row">
        <span className="mystery-odds-badge odds-certain">
          {winTokens.length > 0
            ? winTokens.map((t, i) => renderEffectTokenSpan(t, i, winTokens.length))
            : 'Safe — Leave Unharmed'}
        </span>
      </div>
    );
  };

  return (
    <div className={`typemancer-viewport ${settings.highContrast ? 'high-contrast' : ''}`}>
      {/* TACTILE PARCHMENT GRAIN / NOISE TEXTURE OVERLAY ACROSS ALL SCENES */}
      <div className="paper-grain-overlay" aria-hidden="true" />

      {/* GLOBAL INK & PARCHMENT ACTION PARTICLE BURSTS */}
      <div className="particles-overlay-layer" aria-hidden="true">
        {particleBursts.map((burst) => (
          <div
            key={burst.id}
            className="particle-burst-origin"
            style={{
              left: burst.isPixel ? `${burst.x}px` : `${burst.x}%`,
              top: burst.isPixel ? `${burst.y}px` : `${burst.y}%`,
            }}
          >
            {burst.particles.map((p, idx) => (
              <span
                key={idx}
                className="ink-particle-dot"
                style={
                  {
                    left: p.x !== undefined ? `${p.x}px` : 0,
                    top: p.y !== undefined ? `${p.y}px` : 0,
                    '--dx': `${p.dx}px`,
                    '--dy': `${p.dy}px`,
                    '--rot': `${p.rot}deg`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* TEMPORARY ENCOUNTER PLAYTEST BANNER */}
      {isPlaytestingEncounter && (
        <div className="playtest-floating-banner">
          <span className="playtest-pill-badge">🧪 Temporary Playtest</span>
          <span className="playtest-banner-title">
            Testing: <strong>{activeEvent?.title}</strong>
          </span>
          <span className="playtest-banner-hint">(Run preserved safely & unaffected)</span>
          <button
            type="button"
            className="playtest-exit-btn"
            onClick={exitPlaytestEncounter}
            title="Stop playtest and restore your actual run untouched"
          >
            ✕ Exit Playtest & Restore Run
          </button>
        </div>
      )}

      {/* ==================== BATTLE SCENE ==================== */}
      {screen === 'battle' && (
        <div key="scene-battle" className="battle-layout scene-page-transition">
          {/* LEFT COLUMN: Stacked Paper Card Cabinet */}
          <aside className="cards-column" aria-label="Player Hand" onWheel={(e) => e.stopPropagation()}>
            {/* Top Cabinet Header: Energy Plaque + WPM Meter */}
            <div className="cabinet-top-header">
              <div className="cabinet-energy-plaque">
                <span className="cabinet-energy-icon">⚡</span>
                <span className="cabinet-energy-text">{energy}/{maxEnergy} Energy</span>
              </div>
              {difficulty === 'extra_hard' && (
                <div className="wpm-meter-standalone cabinet-wpm-meter">
                  <div className="wpm-meter-labels">
                    <span>Speed: {liveWpm} WPM</span>
                    <span>Power: {liveEffectiveness.displayPercent}%</span>
                  </div>
                  <div className="wpm-bar-track">
                    <div
                      className={`wpm-bar-fill ${
                        liveEffectiveness.displayPercent > 100 ? 'wpm-bar-overflow' : ''
                      }`}
                      style={{
                        width: `${Math.min(130, Math.max(15, Math.round(liveWpm * 2.5)))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hand Cards Centered in Cabinet Frame with Dynamic Stacking */}
            {(() => {
              const handCount = sortedHandCandidates.length;
              // Base card height is ~138px. Available stack height is ~calc(100vh - 160px).
              // When handCount is small (1 to 4 cards), overlap is 0 (or slight gap).
              // When handCount >= 5, card below overlaps bottom of card above:
              const overlap = Math.min(
                76,
                Math.max(0, Math.ceil((handCount * 138 - 540) / Math.max(1, handCount - 1)))
              );

              return (
                <div
                  className={`cards-stack hand-anim-${handAnimState}`}
                  style={{
                    justifyContent: overlap === 0 ? 'space-evenly' : 'center',
                  }}
                >
                  {/* Floating exited cards sliding out to the right */}
                  {exitingCards.map((exit) => (
                    <div
                      key={`exiting-${exit.instance.instanceId}`}
                      className="hand-card-slot card-exiting-right"
                      style={
                        {
                          position: 'absolute',
                          top: exit.topOffset,
                          left: exit.leftOffset,
                          '--discard-idx': exit.discardIdx,
                          zIndex: 90,
                        } as React.CSSProperties
                      }
                    >
                      <CardBanner
                        instance={exit.instance}
                        phraseDiff={phraseDiff}
                        isDiscardCandidate={false}
                        isHighlighted={false}
                        isSelected={false}
                        isUnaffordable={false}
                        environmentModifiers={activeEnvironment?.modifiers}
                      />
                    </div>
                  ))}

                  {sortedHandCandidates.map(({ item, resolved }, idx) => {
                    const isSelected = selectedCard?.instanceId === item.instanceId;
                    const isHighlighted = highlightedCardIds.has(item.instanceId);
                    const isEnterReady = enterReadyCardId === item.instanceId;
                    const isPowerAlreadyActive =
                      resolved.type === 'power' && usedPowerCardIdsThisCombat.has(item.cardId);
                    const canAfford = energy >= resolved.cost && !isPowerAlreadyActive;
                    const isKept = retainedCardIds.has(item.instanceId);
                    const isKeepCandidate = pendingKeepCount > 0 && !isKept;
                    const isDiscardCandidate =
                      pendingDiscardCount > 0 ||
                      (isCardPlayAwaitingDiscard &&
                        eligibleDiscardsInHand.some((c) => c.instanceId === item.instanceId));
                    const isPreDiscarded = selectedDiscardInstances.some((c) => c.instanceId === item.instanceId);
                    const isEntering = enteringCardMap.has(item.instanceId);
                    const dealIdx = enteringCardMap.get(item.instanceId) ?? 0;

                    return (
                      <div
                        key={item.instanceId}
                        data-slot-id={item.instanceId}
                        className={`hand-card-slot ${
                          isEntering ? 'card-entering-left' : ''
                        }`}
                        style={
                          {
                            marginTop: idx === 0 ? 0 : `-${overlap}px`,
                            zIndex: isSelected || isEnterReady || isHighlighted ? 100 : idx + 1,
                            '--deal-idx': dealIdx,
                          } as React.CSSProperties
                        }
                      >
                        <CardBanner
                          instance={item}
                          phraseDiff={phraseDiff}
                          index={idx}
                          isHighlighted={isHighlighted}
                          isEnterCandidate={isEnterReady}
                          isSelected={isSelected}
                          isUnaffordable={!canAfford}
                          isKept={isKept}
                          isDiscardCandidate={isDiscardCandidate}
                          className={
                            isDiscardCandidate
                              ? 'card-tab-discard-candidate'
                              : isKeepCandidate
                              ? 'card-tab-keep-candidate'
                              : undefined
                          }
                          subtitleOverride={isPreDiscarded ? '🗑️ Queued Discard' : undefined}
                          isPowerAlreadyActive={isPowerAlreadyActive}
                          environmentModifiers={activeEnvironment?.modifiers}
                          style={{
                            opacity: isPreDiscarded ? 0.45 : undefined,
                            filter: isPreDiscarded ? 'grayscale(0.6)' : undefined,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Cabinet Footer */}
            <div className="cards-footer-box">
              {isCardPlayAwaitingDiscard ? (
                <div
                  className="cards-footer-title"
                  style={{ color: '#e11d48', fontWeight: 900 }}
                  title="Type card name to discard"
                >
                  🗑️ CONFIRM VIA DISCARD ({selectedCardRequiredDiscardCount - selectedDiscardInstances.length} more)
                </div>
              ) : pendingDiscardCount > 0 ? (
                <div
                  className="cards-footer-title"
                  style={{ color: '#e11d48', fontWeight: 900 }}
                  title="Type card name to discard"
                >
                  🗑️ DISCARD {pendingDiscardCount > 1 ? `${pendingDiscardCount} CARDS` : 'A CARD'} (cannot skip)
                </div>
              ) : pendingKeepCount > 0 ? (
                <div
                  className="cards-footer-title"
                  style={{ color: '#10b981', fontWeight: 900 }}
                  title="Type card name or 'skip' to skip keeping a card"
                >
                  📌 KEEP A CARD (type card or 'skip')
                </div>
              ) : (
                <div className="cards-footer-title">type [view deck]</div>
              )}
              <div className="cards-pile-counts">
                <span>Draw {drawPile.length}</span>
                <span>Discard {discardPile.length}</span>
                {burnDraftPile.length > 0 && <span>Burned {burnDraftPile.length}</span>}
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN AREA */}
          <main className="battle-main">
            <header className="minimal-top-bar">
              <div className="minimal-run-status">
                {renderRelicIconsBar()}
                <span className="minimal-stat-chip">
                  HP {hp}/{maxHp}
                </span>
                <span className="minimal-stat-chip gold-stat-chip">Gold {gold}</span>
                {activeEnvironment && !biomePopupExpanded && (() => {
                  const envSt = getPhraseHighlightState(activeEnvironment.name, difficulty);
                  return (
                    <div
                      className={`top-biome-slot-pill ${
                        envSt.isHighlighted ? 'top-biome-slot-highlighted' : ''
                      } ${envSt.isEnterReady ? 'top-biome-slot-enter-ready' : ''}`}
                      title="Type environment name to inspect"
                    >
                      <span className="top-biome-slot-name">{activeEnvironment.name}</span>
                    </div>
                  );
                })()}
              </div>
              {renderCommandPills(['options', 'relics', 'codex'])}
            </header>

            <section
              className="arena-stage"
              style={
                activeEnvironment?.backgroundTint
                  ? { backgroundColor: activeEnvironment.backgroundTint }
                  : undefined
              }
            >
              {activeEnvironment && (
                <div
                  className={`battle-environment-popup ${
                    biomePopupExpanded ? 'biome-popup-expanded' : 'biome-popup-shrinking-to-topbar'
                  }`}
                  style={{
                    borderColor: activeEnvironment.art.primaryColor || '#b89a67',
                  }}
                >
                  {activeEnvironment.art.spriteUrl && (
                    <img
                      src={activeEnvironment.art.spriteUrl}
                      alt=""
                      className="battle-environment-icon"
                    />
                  )}
                  <div className="battle-environment-info">
                    <div className="battle-environment-header-row">
                      <span className="battle-environment-name">{activeEnvironment.name}</span>
                      {biomePopupManual && (
                        <span className="battle-environment-close-hint">(type "close" or "back" to hide)</span>
                      )}
                    </div>
                    <span className="battle-environment-desc">{activeEnvironment.description}</span>
                  </div>
                </div>
              )}

              {activeProjectile && (
                <div
                  key={activeProjectile.id}
                  className={`combat-projectile-ball ${
                    activeProjectile.from === 'player'
                      ? `proj-player-to-${activeProjectile.to}`
                      : `proj-enemy-${activeProjectile.from}-to-player`
                  }`}
                  style={{ backgroundColor: activeProjectile.color }}
                />
              )}

              {/* Player & Allies Side */}
              <div className="player-side-formation">
                {/* Player Entity */}
                <div className="player-spot paper-sway-slow" data-player-spot="true">
                  <div className="entity-name-label">{playerName}</div>
                  <div className="hp-shield-row hp-shield-scroll">
                    <div className="hp-shield-trough">
                      <div className={`hp-bar-frame player-hp-bar ${playerWard > 0 ? 'has-ward' : ''}`}>
                        <div
                          className="hp-bar-fill"
                          style={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}
                        />
                        <span className="hp-bar-text">
                          {hp}/{maxHp}
                        </span>
                      </div>
                      {playerWard > 0 && (
                        <div
                          className="shield-extension-bar"
                          style={{ width: `${Math.min(90, Math.max(34, 24 + playerWard * 3))}px` }}
                          title={`Ward: ${playerWard}`}
                        >
                          <span className="shield-extension-text">🛡 {playerWard}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="floating-popups-anchor">
                    {floatingPopups
                      .filter((p) => p.target === 'player')
                      .map((p) => (
                        <div
                          key={p.id}
                          className="floating-combat-popup"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.text}
                        </div>
                      ))}
                  </div>

                  <EntitySprite
                    art={{
                      primaryColor: '#165b7d',
                      secondaryColor: '#2980b9',
                      shape: 'capsule',
                      spriteUrl: './assets/entities/player.png',
                      flip: false,
                    }}
                    width={128}
                    height={128}
                  />
                  <div className="status-pills-row">
                    {playerWard > 0 && <span className="status-pill ward-pill">Ward {playerWard}</span>}
                    {playerStatuses.bold > 0 && <span className="status-pill bold-pill">Bold +{playerStatuses.bold}</span>}
                    {playerStatuses.faded > 0 && <span className="status-pill faded-pill">Faded {playerStatuses.faded}</span>}
                    {playerStatuses.exposed > 0 && <span className="status-pill exposed-pill">Exposed {playerStatuses.exposed}</span>}
                    {playerStatuses.ink_burn > 0 && <span className="status-pill burn-pill">Ink Burn {playerStatuses.ink_burn}</span>}
                    {playerStatuses.plated_armor > 0 && <span className="status-pill plated-armor-pill">Plated Armor {playerStatuses.plated_armor}</span>}
                    {playerStatuses.thorns > 0 && <span className="status-pill thorns-pill">Thorns {playerStatuses.thorns}</span>}
                    {activePowers.map((pwr) => (
                      <span key={pwr.id} className="status-pill power-active-pill" title={`${pwr.name}: Rest of combat`}>
                        ★ {pwr.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allies Formation */}
                {allies.length > 0 && (
                  <div className="allies-formation">
                    {allies.map((ally, index) => (
                      <div
                        key={ally.instanceId}
                        data-ally-id={ally.instanceId}
                        className={`ally-spot ally-slot-${index}`}
                      >
                        <div className="entity-name-label ally-name-label">
                          🤝 {ally.displayName}
                        </div>
                        <div className="hp-shield-row hp-shield-scroll">
                          <div className="hp-shield-trough">
                            <div className={`hp-bar-frame ally-hp-bar ${ally.ward > 0 ? 'has-ward' : ''}`}>
                              <div
                                className="hp-bar-fill"
                                style={{
                                  width: `${Math.max(0, Math.min(100, (ally.hp / ally.maxHp) * 100))}%`,
                                }}
                              />
                              <span className="hp-bar-text">
                                {ally.hp}/{ally.maxHp}
                              </span>
                            </div>
                            {ally.ward > 0 && (
                              <div
                                className="shield-extension-bar"
                                style={{ width: `${Math.min(70, Math.max(26, 18 + ally.ward * 3))}px` }}
                                title={`Ward: ${ally.ward}`}
                              >
                                <span className="shield-extension-text">🛡 {ally.ward}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="floating-popups-anchor">
                          {floatingPopups
                            .filter((p) => p.target === ally.instanceId)
                            .map((p) => (
                              <div
                                key={p.id}
                                className="floating-combat-popup"
                                style={{ backgroundColor: p.color }}
                              >
                                {p.text}
                              </div>
                            ))}
                        </div>

                        <EntitySprite
                          art={ally.art}
                          width={76}
                          height={76}
                          maxHp={ally.maxHp}
                        />
                        <IntentBadge
                          intent={ally.currentMove.intent}
                          damage={
                            ally.currentMove.damage
                              ? Math.max(
                                  0,
                                  ally.currentMove.damage +
                                    ally.statuses.bold +
                                    (activeEnvironment?.modifiers?.damageBonus ?? 0)
                                )
                              : undefined
                          }
                          faded={ally.statuses.faded}
                          hits={ally.currentMove.hits}
                          ward={
                            ally.currentMove.ward
                              ? Math.max(
                                  0,
                                  ally.currentMove.ward +
                                    (activeEnvironment?.modifiers?.wardBonus ?? 0)
                                )
                              : undefined
                          }
                        />
                        <div className="status-pills-row">
                          {ally.ward > 0 && <span className="status-pill ward-pill">Ward {ally.ward}</span>}
                          {ally.statuses.bold > 0 && <span className="status-pill bold-pill">Bold +{ally.statuses.bold}</span>}
                          {ally.statuses.faded > 0 && <span className="status-pill faded-pill">Faded {ally.statuses.faded}</span>}
                          {ally.statuses.exposed > 0 && <span className="status-pill exposed-pill">Exposed {ally.statuses.exposed}</span>}
                          {ally.statuses.ink_burn > 0 && <span className="status-pill burn-pill">Ink Burn {ally.statuses.ink_burn}</span>}
                          {ally.statuses.plated_armor > 0 && <span className="status-pill plated-armor-pill">Plated Armor {ally.statuses.plated_armor}</span>}
                          {ally.statuses.thorns > 0 && <span className="status-pill thorns-pill">Thorns {ally.statuses.thorns}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Center Area: Single-Card Inspector */}
              <div className="arena-center-inspector">
                {inspectedCard && (
                  <div className="inspected-card-panel paper-sheet-float">
                    <div className="inspected-card-badge">
                      {inspectedCard.rarity.toUpperCase()} {inspectedCard.type.toUpperCase()} ·{' '}
                      <span
                        style={{
                          color: energy >= inspectedCard.cost ? '#2ec4b6' : '#ff4d4d',
                          fontWeight: 900,
                        }}
                      >
                        {inspectedCard.cost} Energy
                      </span>
                    </div>
                    <h3 className="inspected-card-title">{inspectedCard.name}</h3>
                    <p className="inspected-card-desc">
                      {renderHighlightedCardText(
                        formatCardDescription(getCardDefinition(inspectedCard.cardId), {
                          environmentModifiers: activeEnvironment?.modifiers,
                          isAlreadyUpgraded: inspectedCard.upgraded,
                        })
                      )}
                    </p>
                    <div className="inspected-card-connector">
                      "{inspectedCard.name}" -{inspectedCard.connector}-{' '}
                      {inspectedCard.target === 'self' || inspectedCard.target === 'all_enemies'
                        ? '(Press Enter)'
                        : '...'}
                    </div>
                    {inspectedCard.type === 'power' && (
                      <div className="inspected-burn-tag">⚡ Persistent Power (Once Per Combat)</div>
                    )}
                    {inspectedCard.burnDraft && inspectedCard.type !== 'power' && (
                      <div className="inspected-burn-tag">Once Per Combat (Burn Draft)</div>
                    )}
                  </div>
                )}
              </div>

              {/* Enemy Formation */}
              <div className="enemies-formation">
                {enemies.map((enemy, index) => {
                  const isTargetHighlighted = highlightedEnemyIds.has(enemy.instanceId);
                  const isTargetEnterReady = enterReadyEnemyId === enemy.instanceId;
                  return (
                    <div
                      key={enemy.instanceId}
                      data-enemy-id={enemy.instanceId}
                      className={`enemy-spot enemy-slot-${index} ${
                        isTargetHighlighted ? 'enemy-spot-highlighted' : ''
                      } ${isTargetEnterReady ? 'enemy-spot-enter-ready' : ''}`}
                    >
                      <div className="entity-name-label enemy-name-label">
                        {enemy.displayName}
                      </div>
                      <div className="hp-shield-row hp-shield-scroll">
                        <div className="hp-shield-trough">
                          <div className={`hp-bar-frame enemy-hp-bar ${enemy.ward > 0 ? 'has-ward' : ''}`}>
                            <div
                              className="hp-bar-fill"
                              style={{
                                width: `${Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100))}%`,
                              }}
                            />
                            <span className="hp-bar-text">
                              {enemy.hp}/{enemy.maxHp}
                            </span>
                          </div>
                          {enemy.ward > 0 && (
                            <div
                              className="shield-extension-bar"
                              style={{ width: `${Math.min(80, Math.max(30, 20 + enemy.ward * 3))}px` }}
                              title={`Ward: ${enemy.ward}`}
                            >
                              <span className="shield-extension-text">🛡 {enemy.ward}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="floating-popups-anchor">
                        {floatingPopups
                          .filter((p) => p.target === enemy.instanceId)
                          .map((p) => (
                            <div
                              key={p.id}
                              className="floating-combat-popup"
                              style={{ backgroundColor: p.color }}
                            >
                              {p.text}
                            </div>
                          ))}
                      </div>

                      <EntitySprite
                        art={enemy.art}
                        width={96}
                        height={96}
                        maxHp={enemy.maxHp}
                        isElite={Boolean(enemy.isElite || enemy.role === 'elite')}
                        isHighlighted={isTargetHighlighted || isTargetEnterReady}
                      />
                      <IntentBadge
                        intent={enemy.currentMove.intent}
                        damage={
                          enemy.currentMove.damage
                            ? Math.max(
                                0,
                                enemy.currentMove.damage +
                                  enemy.statuses.bold +
                                  (activeEnvironment?.modifiers?.damageBonus ?? 0) +
                                  (activeEnvironment?.modifiers?.enemyDamageBonus ?? 0)
                              )
                            : undefined
                        }
                        faded={enemy.statuses.faded}
                        hits={enemy.currentMove.hits}
                        ward={
                          enemy.currentMove.ward
                            ? Math.max(
                                0,
                                enemy.currentMove.ward +
                                  (activeEnvironment?.modifiers?.wardBonus ?? 0)
                              )
                            : undefined
                        }
                        heal={
                          enemy.currentMove.heal
                            ? Math.max(
                                0,
                                enemy.currentMove.heal +
                                  (activeEnvironment?.modifiers?.healBonus ?? 0)
                              )
                            : undefined
                        }
                      />
                      <div className="status-pills-row">
                        {enemy.currentBehavior && enemy.currentBehavior.condition === 'below_half_hp' && (
                          <span className="status-pill enrage-pill" title="Below 1/2 HP Phase">
                            ⚡ Enraged
                          </span>
                        )}
                        {enemy.currentBehavior && enemy.currentBehavior.condition === 'last_standing' && (
                          <span className="status-pill last-stand-pill" title="Last Standing Phase">
                            🐺 Last Stand
                          </span>
                        )}
                        {enemy.ward > 0 && <span className="status-pill ward-pill">Ward {enemy.ward}</span>}
                        {enemy.statuses.bold > 0 && <span className="status-pill bold-pill">Bold +{enemy.statuses.bold}</span>}
                        {enemy.statuses.faded > 0 && <span className="status-pill faded-pill">Faded {enemy.statuses.faded}</span>}
                        {enemy.statuses.exposed > 0 && <span className="status-pill exposed-pill">Exposed {enemy.statuses.exposed}</span>}
                        {enemy.statuses.ink_burn > 0 && <span className="status-pill burn-pill">Ink Burn {enemy.statuses.ink_burn}</span>}
                        {enemy.statuses.plated_armor > 0 && <span className="status-pill plated-armor-pill">Plated Armor {enemy.statuses.plated_armor}</span>}
                        {enemy.statuses.thorns > 0 && <span className="status-pill thorns-pill">Thorns {enemy.statuses.thorns}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* BOTTOM ROW: Clean Typing Bar */}
            <section className="typing-console-box">
              <TypingConsoleDisplay
                prefix={
                  pendingDiscardCount > 0 ? (
                    <span className="sentence-discard-card-hint">
                      🗑️ DISCARD {pendingDiscardCount > 1 ? `${pendingDiscardCount} CARDS` : 'A CARD'} (type card name):
                    </span>
                  ) : pendingKeepCount > 0 ? (
                    <span className="sentence-keep-card-hint">
                      📌 KEEP A CARD (type card or "skip"):
                    </span>
                  ) : selectedCardResolved ? (
                    <>
                      <span className="sentence-locked-card">"{selectedCardResolved.name}"</span>
                      <span className="sentence-connector">
                        {' '}
                        -{selectedCardResolved.connector}-{' '}
                      </span>
                      {selectedTargetEnemy && (
                        <>
                          <span className="sentence-locked-card">"{selectedTargetEnemy.displayName}"</span>
                          <span className="sentence-connector"> -and- </span>
                        </>
                      )}
                      {selectedDiscardInstances.map((discInst) => (
                        <Fragment key={discInst.instanceId}>
                          <span className="sentence-locked-card" style={{ color: '#e11d48' }}>
                            "{resolveCardInstance(discInst, phraseDiff).name}"
                          </span>
                          <span className="sentence-connector"> -and- </span>
                        </Fragment>
                      ))}
                      {isCardPlayAwaitingDiscard && typedInput.length === 0 && (
                        <span className="sentence-discard-hint">
                          🗑️ Discard ({selectedCardRequiredDiscardCount - selectedDiscardInstances.length} needed)
                        </span>
                      )}
                      {!isCardPlayAwaitingDiscard &&
                        !selectedTargetEnemy &&
                        (selectedCardResolved.target === 'self' ||
                          selectedCardResolved.target === 'all_enemies') && (
                          <span className="sentence-enter-hint">(Press Enter) </span>
                        )}
                    </>
                  ) : undefined
                }
                typedInput={typedInput}
                ghostAutocompleteSuffix={ghostAutocompleteSuffix}
                suggestedPhrase={ghostTargetPhrase}
              />
            </section>
          </main>
        </div>
      )}

      {/* ==================== NON-BATTLE SCREENS ==================== */}
      {screen !== 'battle' && (
        <div
          key={`scene-${screen}`}
          className={`narrative-screen-layout scene-page-transition ${
            screen === 'map' ? 'map-fullscreen-mode' : ''
          }`}
        >
          {/* Minimal Floating Top Bar */}
          <header className="minimal-top-bar">
            {screen !== 'main_menu' && screen !== 'tutorial' && screen !== 'peasant_intro' ? (
              <div className="minimal-run-status">
                {renderRelicIconsBar()}
                <span className="minimal-stat-chip">
                  HP {hp}/{maxHp}
                </span>
                <span className="minimal-stat-chip gold-stat-chip">Gold {gold}</span>
              </div>
            ) : (
              <div />
            )}
            {renderCommandPills(['options', 'relics', 'codex'])}
          </header>

          {/* Main Content Stage */}
          <main className="narrative-stage">
            {/* 0. PAPER MAIN MENU WITH 2-TIER HIGHLIGHTING */}
            {screen === 'main_menu' && (
              <div className="cabinet-menu-frame paper-sheet-float">
                <div className="clean-menu-card">
                  <h1 className="clean-menu-title">TYPEMANCER</h1>
                  <div className="clean-menu-options">
                    {(['new run', 'tutorial', 'load', 'codex', 'options', 'editor'] as const).map((opt, idx) => {
                      const st = getPhraseHighlightState(opt, 'easy');
                      return (
                        <div
                          key={opt}
                          onClick={opt === 'editor' ? () => setDevEditorOpen(true) : undefined}
                          className={`clean-menu-option ${
                            st.isHighlighted ? 'option-highlighted' : ''
                          } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                          style={{ animationDelay: `${idx * 0.25}s` }}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 0.5 VASTLY IMPROVED INTERACTIVE TUTORIAL (STRICT NO-MOUSE) */}
            {screen === 'tutorial' && (
              <TutorialScreen
                step={tutorialStep}
                typedInput={typedInput}
                difficulty={difficulty}
                phraseDiff={phraseDiff}
                diffPreview={tutorialDiffPreview}
                feedbackText={tutorialFeedback}
                interactiveMapCurrent={tutorialMapCurrent}
                interactiveMapOptions={tutorialMapOptions}
                interactiveMapLevel={tutorialMapLevel}
                interactiveMapScroll={tutorialMapScroll}
                getPhraseHighlightState={getPhraseHighlightState}
              />
            )}

            {/* 1. OPENING SEQUENCE: THE PEASANT & THE TYPEWRITER */}
            {screen === 'peasant_intro' && (
              <div className="cabinet-story-frame paper-sheet-float">
                <div className="story-card">
                  <p className="story-paragraph">
                    In this dystopian world, an Evil Wizard has taken away the beauty of speech and song.
                    All must write to each other to do anything—until you find a magical relic: a <strong>TYPEWRITER!</strong>
                    It lets you move quicker and stronger than anyone else. You decide to free the world from this fate
                    and head towards the Wizard’s Tower.
                  </p>

                  {introStep === 'ask_name' && (
                    <div className="prompt-panel">
                      <p>
                        At the edge of the forest you find a peasant. They are interested in your typewriter
                        and ask you your name:
                      </p>
                      <div className="phrase-to-type">(Type your name and press Enter)</div>
                    </div>
                  )}

                  {introStep === 'load_save' && (
                    <div className="prompt-panel">
                      <h2>Load Save Code</h2>
                      <p>Type or paste your <code>TM1-...</code> Save Code and press Enter (or type <code>back</code>):</p>
                    </div>
                  )}

                  {introStep === 'ask_difficulty' && (
                    <div className="prompt-panel">
                      <p>
                        "{playerName}, how difficult do you expect this journey to be?"
                      </p>
                      <div className="choice-list">
                        {[
                          'easy',
                          'a fair challenge',
                          'i expect this quest to be a grueling endeavour',
                          ...(extraHardAvailable
                            ? ['my fingers move faster than lightning itself']
                            : []),
                        ].map((phrase) => {
                          const st = getPhraseHighlightState(phrase, 'easy');
                          return (
                            <div
                              key={phrase}
                              className={`choice-item ${
                                st.isHighlighted ? 'option-highlighted' : ''
                              } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                            >
                              <div className="phrase-to-type">{phrase}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. FULL-SCREEN SCROLLABLE PROCEDURAL MAP */}
            {screen === 'map' && (
              <ScrollableMap
                mapFloors={mapFloors}
                currentFloor={currentFloor}
                currentNodeId={currentNodeId}
                availableNodes={availableMapNodes}
                typedInput={typedInput}
                difficulty={difficulty}
                phraseDiff={phraseDiff}
                scrollOffset={mapScrollOffset}
                setScrollOffset={setMapScrollOffset}
              />
            )}

            {/* 3. POST-BATTLE REWARDS */}
            {screen === 'reward' && (
              <div className="cabinet-story-frame paper-sheet-float">
                <div className="story-card">
                  {rewardStep === 'card' ? (
                    <>
                      {rewardCards.length > 0 ? (
                        <>
                          <h2 className="story-title">
                            {activeNodeType === 'elite'
                              ? `Elite Victory — Choose a Card (+${rewardGoldClaimed} Gold) — or type (skip)`
                              : `Rewards (+${rewardGoldClaimed} Gold) — or type (skip)`}
                          </h2>
                          <div className="deck-banner-grid">
                            {rewardCards.map((inst, idx) => {
                              const res = resolveCardInstance(inst, phraseDiff);
                              const st = getPhraseHighlightState(res.name, difficulty);
                              return (
                                <CardBanner
                                  key={inst.instanceId}
                                  instance={inst}
                                  phraseDiff={phraseDiff}
                                  index={idx}
                                  isHighlighted={st.isHighlighted}
                                  isEnterCandidate={st.isEnterReady}
                                />
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                          <h2 className="story-title">Victory (+{rewardGoldClaimed} Gold)</h2>
                          <p
                            style={{
                              color: '#64748b',
                              fontSize: '0.96rem',
                              margin: '1.25rem 0',
                              fontStyle: 'italic',
                            }}
                          >
                            The beast was vanquished, but no card drafts could be salvaged from this encounter.
                          </p>
                          <div className="phrase-to-type">continue</div>
                        </div>
                      )}
                      {activeNodeType === 'elite' && rewardRelics.length > 0 && (
                        <div
                          style={{
                            marginTop: 14,
                            fontSize: '0.86rem',
                            color: '#64748b',
                            fontStyle: 'italic',
                            textAlign: 'center',
                          }}
                        >
                          ✨ Next Screen: Choose an Elite Relic reward
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="story-title">
                        Elite Spoils — Choose 1 of 3 Relics — or type (skip)
                      </h2>
                      {rewardRelics.length > 0 && (
                        <div className="reward-cards-grid">
                          {rewardRelics.map((rel) => {
                            const st = getPhraseHighlightState(rel.names[phraseDiff], difficulty);
                            return (
                              <div
                                key={rel.id}
                                className={`structured-card-box ${
                                  st.isHighlighted ? 'option-highlighted' : ''
                                } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                              >
                                <div className="card-art-square">
                                  {rel.art.spriteUrl && <img src={rel.art.spriteUrl} alt="" />}
                                </div>
                                <div className="card-info-right">
                                  <div className="phrase-to-type">{rel.names[phraseDiff]}</div>
                                  <div className="card-tab-sub">{rel.description}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 4. CAMPFIRE */}
            {screen === 'campfire' && (
              <div className="cabinet-story-frame paper-sheet-float">
                <div className="story-card">
                  <h2 className="story-title">
                    {campfireSubMode === 'choose'
                      ? 'Campfire'
                      : campfireSubMode === 'revise_select'
                      ? 'Campfire — Select a Card to Revise (or type "back")'
                      : 'Campfire — Confirm Card Revision'}
                  </h2>
                  {campfireSubMode === 'choose' ? (
                    <div className="choice-list">
                      {[
                        { cmd: 'rest', desc: 'Heal 30% Max HP' },
                        { cmd: 'revise', desc: 'Upgrade a card in your deck' },
                      ].map((item) => {
                        const st = getPhraseHighlightState(item.cmd, difficulty);
                        return (
                          <div
                            key={item.cmd}
                            className={`choice-item ${
                              st.isHighlighted ? 'option-highlighted' : ''
                            } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                          >
                            <div className="phrase-to-type">{item.cmd}</div>
                            <div>{item.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : campfireSubMode === 'revise_confirm' && campfireSelectedCard ? (
                    <div className="campfire-upgrade-comparison">
                      <div className="campfire-confirm-cards-row">
                        <div className="campfire-card-preview-box">
                          <div className="campfire-card-preview-tag base-tag">Current Version</div>
                          <CardBanner
                            instance={{ ...campfireSelectedCard, upgraded: false }}
                            phraseDiff={phraseDiff}
                            showUpgradeDelta={false}
                          />
                        </div>
                        <div className="campfire-preview-arrow-box">
                          <div className="campfire-arrow-icon">➔</div>
                          <div className="campfire-arrow-text">Upgrades To</div>
                        </div>
                        <div className="campfire-card-preview-box">
                          <div className="campfire-card-preview-tag upgraded-tag">Upgraded Version (+)</div>
                          <CardBanner
                            instance={{ ...campfireSelectedCard, upgraded: true }}
                            phraseDiff={phraseDiff}
                            showUpgradeDelta={true}
                          />
                        </div>
                      </div>

                      <div className="campfire-confirm-prompt-panel">
                        <p className="campfire-confirm-prompt-title">
                          Confirm upgrading <strong>{resolveCardInstance(campfireSelectedCard, phraseDiff).name}</strong>?
                        </p>
                        <div className="choice-list campfire-confirm-choice-list">
                          {[
                            { cmd: 'confirm', desc: 'Permanently upgrade & proceed to next floor' },
                            { cmd: 'back', desc: 'Choose a different card from your deck' },
                          ].map((item) => {
                            const st = getPhraseHighlightState(item.cmd, difficulty);
                            return (
                              <div
                                key={item.cmd}
                                className={`choice-item ${
                                  st.isHighlighted ? 'option-highlighted' : ''
                                } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                              >
                                <div className="phrase-to-type">{item.cmd}</div>
                                <div>{item.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="deck-banner-grid">
                      {sortCardsByCategoryAndRarity(
                        deck.filter((c) => !c.upgraded),
                        (c) => c,
                        phraseDiff
                      ).map((inst, idx) => {
                          const baseRes = resolveCardInstance(inst, phraseDiff);
                          const st = getPhraseHighlightState(baseRes.name, difficulty);
                          return (
                            <CardBanner
                              key={inst.instanceId}
                              instance={inst}
                              phraseDiff={phraseDiff}
                              index={idx}
                              isHighlighted={st.isHighlighted}
                              isEnterCandidate={st.isEnterReady}
                              showUpgradeDelta={true}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. MERCHANT */}
            {screen === 'merchant' && shopInventory && (
              <div className="cabinet-story-frame paper-sheet-float">
                <div className="story-card">
                  <h2 className="story-title">
                    Merchant ({gold} Gold) — type item name, (burn card [{shopInventory.removeServicePrice}g]), or (leave)
                  </h2>
                  {shopSubMode === 'browse' ? (
                    <>
                      <div className="shop-cards-grid-2x2">
                        {shopInventory.cards.map(({ instance, price, sold }, idx) => {
                          const res = resolveCardInstance(instance, phraseDiff);
                          const st = !sold
                            ? getPhraseHighlightState(res.name, difficulty)
                            : { isHighlighted: false, isEnterReady: false };
                          return (
                            <div key={instance.instanceId} className="shop-card-entry">
                              <CardBanner
                                instance={instance}
                                phraseDiff={phraseDiff}
                                index={idx}
                                isHighlighted={st.isHighlighted}
                                isEnterCandidate={st.isEnterReady}
                                isUnaffordable={sold || gold < price}
                              />
                              <div
                                className={`shop-card-price-tag ${
                                  sold ? 'sold' : gold < price ? 'unaffordable' : 'affordable'
                                } ${st.isHighlighted ? 'highlighted' : ''} ${
                                  st.isEnterReady ? 'enter-ready' : ''
                                }`}
                                title={sold ? 'Sold' : `${price} Gold`}
                              >
                                <span className="shop-price-icon">{sold ? '🏷️' : '💰'}</span>
                                <span className="shop-price-val">{sold ? 'SOLD' : `${price}g`}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="reward-cards-grid">
                        {shopInventory.relics.map(({ relic, price, sold }) => {
                          const st = !sold
                            ? getPhraseHighlightState(relic.names[phraseDiff], difficulty)
                            : { isHighlighted: false, isEnterReady: false };
                          return (
                            <div
                              key={relic.id}
                              className={`structured-card-box ${sold ? 'choice-locked' : ''} ${
                                st.isHighlighted ? 'option-highlighted' : ''
                              } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                            >
                              <div className="card-art-square">
                                {relic.art.spriteUrl && <img src={relic.art.spriteUrl} alt="" />}
                              </div>
                              <div className="card-info-right">
                                <div className="card-tab-header">
                                  <span className="phrase-to-type">{relic.names[phraseDiff]}</span>
                                  <span className="card-cost-pill">{sold ? 'SOLD' : `${price}g`}</span>
                                </div>
                                <div className="card-tab-sub">{relic.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="deck-banner-grid">
                      {sortCardsByCategoryAndRarity(deck, (c) => c, phraseDiff).map((inst, idx) => {
                        const res = resolveCardInstance(inst, phraseDiff);
                        const st = getPhraseHighlightState(res.name, difficulty);
                        return (
                          <CardBanner
                            key={inst.instanceId}
                            instance={inst}
                            phraseDiff={phraseDiff}
                            index={idx}
                            isHighlighted={st.isHighlighted}
                            isEnterCandidate={st.isEnterReady}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. TREASURE VAULT */}
            {screen === 'treasure' && (
              <div className="cabinet-story-frame paper-sheet-float">
                <div className="story-card">
                  <h2 className="story-title">Treasure Chest — Choose 1 of 3 Relics or type (skip)</h2>
                  <div className="reward-cards-grid">
                    {rewardRelics.map((rel) => {
                      const st = getPhraseHighlightState(rel.names[phraseDiff], difficulty);
                      return (
                        <div
                          key={rel.id}
                          className={`structured-card-box ${
                            st.isHighlighted ? 'option-highlighted' : ''
                          } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                        >
                          <div className="card-art-square">
                            {rel.art.spriteUrl && <img src={rel.art.spriteUrl} alt="" />}
                          </div>
                          <div className="card-info-right">
                            <div className="phrase-to-type">{rel.names[phraseDiff]}</div>
                            <div className="card-tab-sub">{rel.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 7. MYSTERY ENCOUNTER */}
            {screen === 'mystery' && activeEvent && (
              <div className="cabinet-story-frame paper-sheet-float">
                {mysterySubMode === 'select_card_to_upgrade' ? (
                  <div className="story-card">
                    <h2 className="story-title">
                      {activeEvent.title} — Select a Card to Revise (or type "back")
                    </h2>
                    <div className="deck-banner-grid">
                      {sortCardsByCategoryAndRarity(
                        deck.filter((c) => !c.upgraded),
                        (c) => c,
                        phraseDiff
                      ).map((inst, idx) => {
                        const baseRes = resolveCardInstance(inst, phraseDiff);
                        const st = getPhraseHighlightState(baseRes.name, difficulty);
                        return (
                          <CardBanner
                            key={inst.instanceId}
                            instance={inst}
                            phraseDiff={phraseDiff}
                            index={idx}
                            isHighlighted={st.isHighlighted}
                            isEnterCandidate={st.isEnterReady}
                            showUpgradeDelta={true}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : mysterySubMode === 'confirm_card_upgrade' && mysterySelectedCard ? (
                  <div className="story-card">
                    <h2 className="story-title">
                      {activeEvent.title} — Confirm Card Revision
                    </h2>
                    <div className="campfire-upgrade-comparison">
                      <div className="campfire-confirm-cards-row">
                        <div className="campfire-card-preview-box">
                          <div className="campfire-card-preview-tag base-tag">Current Version</div>
                          <CardBanner
                            instance={{ ...mysterySelectedCard, upgraded: false }}
                            phraseDiff={phraseDiff}
                            showUpgradeDelta={false}
                          />
                        </div>
                        <div className="campfire-preview-arrow-box">
                          <div className="campfire-arrow-icon">➔</div>
                          <div className="campfire-arrow-text">Upgrades To</div>
                        </div>
                        <div className="campfire-card-preview-box">
                          <div className="campfire-card-preview-tag upgraded-tag">Upgraded Version (+)</div>
                          <CardBanner
                            instance={{ ...mysterySelectedCard, upgraded: true }}
                            phraseDiff={phraseDiff}
                            showUpgradeDelta={true}
                          />
                        </div>
                      </div>

                      <div className="campfire-confirm-prompt-panel">
                        <p className="campfire-confirm-prompt-title">
                          Confirm upgrading <strong>{resolveCardInstance(mysterySelectedCard, phraseDiff).name}</strong>?
                        </p>
                        <div className="choice-list campfire-confirm-choice-list">
                          {[
                            { cmd: 'confirm', desc: 'Permanently upgrade & proceed to next floor' },
                            { cmd: 'back', desc: 'Choose a different card from your deck' },
                          ].map((item) => {
                            const st = getPhraseHighlightState(item.cmd, difficulty);
                            return (
                              <div
                                key={item.cmd}
                                className={`choice-item ${
                                  st.isHighlighted ? 'option-highlighted' : ''
                                } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                              >
                                <div className="phrase-to-type">{item.cmd}</div>
                                <div>{item.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : mysterySubMode === 'select_card_to_invert' ? (
                  <div className="story-card">
                    <h2 className="story-title">
                      {activeEvent.title} — Select a Card to Invert in the Mirror Script (or type "back")
                    </h2>
                    <div className="deck-banner-grid">
                      {sortCardsByCategoryAndRarity(
                        deck.filter((c) => !c.inverted && getCardDefinition(c.cardId)?.type !== 'curse'),
                        (c) => c,
                        phraseDiff
                      ).map((inst, idx) => {
                        const baseRes = resolveCardInstance(inst, phraseDiff);
                        const st = getPhraseHighlightState(baseRes.name, difficulty);
                        return (
                          <CardBanner
                            key={inst.instanceId}
                            instance={inst}
                            phraseDiff={phraseDiff}
                            index={idx}
                            isHighlighted={st.isHighlighted}
                            isEnterCandidate={st.isEnterReady}
                            showUpgradeDelta={false}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : mysterySubMode === 'confirm_card_invert' && mysterySelectedCard ? (
                  <div className="story-card">
                    <h2 className="story-title">
                      {activeEvent.title} — Confirm Card Inversion
                    </h2>
                    <div className="campfire-upgrade-comparison">
                      <div className="campfire-confirm-cards-row">
                        <div className="campfire-card-preview-box">
                          <div className="campfire-card-preview-tag base-tag">Original Form</div>
                          <CardBanner
                            instance={{ ...mysterySelectedCard, inverted: false }}
                            phraseDiff={phraseDiff}
                            showUpgradeDelta={false}
                          />
                        </div>
                        <div className="campfire-preview-arrow-box">
                          <div className="campfire-arrow-icon">🪞</div>
                          <div className="campfire-arrow-text">Inverts Magic Into</div>
                        </div>
                        <div className="campfire-card-preview-box">
                          <div
                            className="campfire-card-preview-tag"
                            style={{ background: '#7e22ce', color: '#f3e8ff' }}
                          >
                            🪞 Inverted Form
                          </div>
                          <CardBanner
                            instance={{ ...mysterySelectedCard, inverted: true }}
                            phraseDiff={phraseDiff}
                            showUpgradeDelta={false}
                          />
                        </div>
                      </div>

                      <div className="campfire-confirm-prompt-panel">
                        <p className="campfire-confirm-prompt-title">
                          Confirm inverting <strong>{resolveCardInstance(mysterySelectedCard, phraseDiff).name}</strong>?
                          <br />
                          <span style={{ fontSize: '0.84rem', color: '#a855f7', fontWeight: 600 }}>
                            (Damage ↔ Ward, Bold ↔ Faded, Exposed ↔ Plated, Ink Burn ↔ Thorns, Targets Inverted)
                          </span>
                        </p>
                        <div className="choice-list campfire-confirm-choice-list">
                          {[
                            { cmd: 'confirm', desc: 'Permanently invert this card and proceed to next floor' },
                            { cmd: 'back', desc: 'Choose a different card from your deck' },
                          ].map((item) => {
                            const st = getPhraseHighlightState(item.cmd, difficulty);
                            return (
                              <div
                                key={item.cmd}
                                className={`choice-item ${
                                  st.isHighlighted ? 'option-highlighted' : ''
                                } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                              >
                                <div className="phrase-to-type">{item.cmd}</div>
                                <div>{item.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : mysterySubMode === 'select_card_to_consecrate' ? (
                  <div className="story-card">
                    <h2 className="story-title">
                      {activeEvent.title} — Select a Card to Offer to the Weeping Monolith (or type "back")
                    </h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                      Choose which draft in your deck to present before casting your fate. Success: add a random positive power to a card. Failure: add a random negative flaw to a card.
                    </p>
                    <div className="deck-banner-grid">
                      {sortCardsByCategoryAndRarity(
                        deck.filter((c) => getCardDefinition(c.cardId)?.type !== 'curse'),
                        (c) => c,
                        phraseDiff
                      ).map((inst, idx) => {
                        const baseRes = resolveCardInstance(inst, phraseDiff);
                        const st = getPhraseHighlightState(baseRes.name, difficulty);
                        return (
                          <div
                            key={inst.instanceId}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (pendingConsecrateChoice) {
                                soundEngine.playPageTurn(settings);
                                setMysterySelectedCard(inst);
                                setMysterySubMode('event');
                                setPendingChanceChoice(pendingConsecrateChoice);
                                setPendingConsecrateChoice(null);
                                resetTypingBuffer(true);
                              }
                            }}
                          >
                            <CardBanner
                              instance={inst}
                              phraseDiff={phraseDiff}
                              index={idx}
                              isHighlighted={st.isHighlighted}
                              isEnterCandidate={st.isEnterReady}
                              showUpgradeDelta={false}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="story-card">
                    <h2 className="story-title">{activeEvent.title}</h2>
                    <p className="story-paragraph">{activeEvent.narrative}</p>
                    {pendingChanceChoice ? (
                      <MysteryChanceWheel
                        chance={pendingChanceChoice.chance!}
                        choiceText={pendingChanceChoice.phrases[phraseDiff]}
                        settings={settings}
                        onSpinComplete={(succeeded) => {
                          executeMysteryChoiceEffects(pendingChanceChoice, succeeded);
                        }}
                        triggerParticles={triggerElementParticles}
                      />
                    ) : eventOutcomeText === null ? (
                      <div className="choice-list">
                        {activeEvent.choices.map((ch) => {
                          const phrase = ch.phrases[phraseDiff];
                          const st = getPhraseHighlightState(phrase, difficulty);
                          return (
                            <div
                              key={ch.id}
                              className={`choice-item mystery-choice-card ${
                                st.isHighlighted ? 'option-highlighted' : ''
                              } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                            >
                              <div className="phrase-to-type">{phrase}</div>
                              {renderMysteryChoiceOdds(ch)}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="prompt-panel mystery-outcome-panel">
                        <div
                          className={`mystery-outcome-summary-box ${
                            eventRollSucceeded === false ? 'outcome-box-failed' : 'outcome-box-success'
                          }`}
                        >
                          <div className="mystery-outcome-header">
                            {eventOutcomeText}
                          </div>
                          {eventOutcomeSummary.length > 0 && (
                            <div className="mystery-outcome-badges">
                              {eventOutcomeSummary.map((line, idx) => {
                                const isPos =
                                  line.startsWith('+') ||
                                  line.includes('Gained') ||
                                  line.includes('Upgraded') ||
                                  line.includes('✨') ||
                                  line.includes('Consecrated');
                                const isNeg =
                                  line.startsWith('-') ||
                                  line.includes('Lost') ||
                                  line.includes('Removed') ||
                                  line.includes('Corrupted') ||
                                  line.includes('Inflicted') ||
                                  line.includes('Curse');
                                return (
                                  <span
                                    key={idx}
                                    className="mystery-outcome-chip"
                                    style={{
                                      background: isPos ? '#ecfdf5' : isNeg ? '#fef2f2' : '#fdf8ef',
                                      color: isPos ? '#065f46' : isNeg ? '#991b1b' : '#102a3a',
                                      borderColor: isPos ? '#059669' : isNeg ? '#dc2626' : '#2b1e16',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {line}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {consecratedResultCard && (
                          <div
                            className="mystery-outcome-card-preview"
                            style={{
                              marginTop: '1.25rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                color: eventRollSucceeded === false ? '#be123c' : '#059669',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              {eventRollSucceeded === false
                                ? '⚡ Inscribed With Flaw (Inspecting Updated Card)'
                                : '✨ Consecrated Boon Inscribed (Inspecting Updated Card)'}
                            </div>
                            <div style={{ maxWidth: '440px', width: '100%' }}>
                              <CardBanner
                                instance={consecratedResultCard}
                                phraseDiff={phraseDiff}
                                showUpgradeDelta={false}
                              />
                            </div>
                          </div>
                        )}
                        <div className="phrase-to-type">continue</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 8. END-OF-RUN TYPING & COMBAT REPORT CARD */}
            {(screen === 'game_over' || screen === 'victory') && (
              <div className="cabinet-story-frame paper-sheet-float">
                <div className="story-card report-card">
                  <h2 className="story-title">
                    {screen === 'victory' ? 'Victory! Report Card' : 'Run Report Card'}
                  </h2>

                  <div className="report-columns">
                    <div className="report-box">
                      <h3>Typing Performance</h3>
                      <ul>
                        <li>Average Speed: {avgWpm} WPM</li>
                        <li>Peak Speed: {metrics.peakWpm} WPM</li>
                        <li>Accuracy: {accuracyPercent}%</li>
                        <li>Characters Typed: {metrics.totalCharsTyped}</li>
                      </ul>
                    </div>

                    <div className="report-box">
                      <h3>Game Performance</h3>
                      <ul>
                        <li>Floor Reached: {currentFloor} / {mapFloors.length}</li>
                        <li>Damage Dealt: {metrics.totalDamageDealt}</li>
                        <li>Enemies Defeated: {metrics.enemiesDefeated}</li>
                        <li>Run Time: {Math.max(1, Math.floor((Date.now() - metrics.startTimeMs) / 1000))}s</li>
                      </ul>
                    </div>
                  </div>

                  <div className="save-code-box">
                    <code className="save-code-string">{currentSaveCode}</code>
                  </div>

                  <div className="phrase-to-type">new run</div>
                </div>
              </div>
            )}
          </main>

          {/* Clean Bottom Typing Console */}
          <footer className="typing-console-box narrative-console">
            <TypingConsoleDisplay
              typedInput={typedInput}
              ghostAutocompleteSuffix={ghostAutocompleteSuffix}
              suggestedPhrase={ghostTargetPhrase}
            />
          </footer>
        </div>
      )}

      {/* ==================== KEYBOARD-CONTROLLED MODAL OVERLAYS ==================== */}
      {overlay !== 'none' && (
        <div className={`keyboard-modal-backdrop ${overlay === 'codex' ? 'codex-backdrop-fullscreen' : ''}`}>
          {overlay === 'codex' ? (
            <CodexModal
              activeTab={codexTab}
              selectedId={codexSelectedId}
              scrollOffset={codexScrollOffset}
              typedInput={typedInput}
              difficulty={difficulty}
              phraseDiff={phraseDiff}
              discovery={codexDiscovery}
              getPhraseHighlightState={getPhraseHighlightState}
              renderTypingInputWithCaret={renderTypingInputWithCaret}
              activeEnemyInstance={inspectedEntity && inspectedEntity !== 'player' ? inspectedEntity : null}
              playerExposed={playerStatuses.exposed}
              onSelectEntry={(id) => {
                setCodexSelectedId(id);
                if (codexTab === 'cards') {
                  soundEngine.playCardSound(id, settings);
                } else {
                  soundEngine.playCodexNav(settings);
                }
                setInspectedEntity(null);
              }}
              onClose={() => {
                soundEngine.playPageTurn(settings);
                setOverlay('none');
                setInspectedEntity(null);
              }}
              onChangeTab={(tab) => {
                setCodexTab(tab);
                setCodexSelectedId(null);
                setCodexScrollOffset(0);
                setInspectedEntity(null);
                soundEngine.playCodexNav(settings);
              }}
            />
          ) : overlay === 'combat_tutorial' ? (
            <TutorialScreen
              step={combatTutorialStep ?? 7}
              typedInput={typedInput}
              difficulty={difficulty}
              phraseDiff={phraseDiff}
              diffPreview="easy"
              feedbackText={null}
              interactiveMapCurrent={tutorialMapCurrent}
              interactiveMapOptions={tutorialMapOptions}
              interactiveMapLevel={tutorialMapLevel}
              interactiveMapScroll={0}
              getPhraseHighlightState={getPhraseHighlightState}
              isBattlePopup={true}
              renderTypingInputWithCaret={renderTypingInputWithCaret}
            />
          ) : (
            <div className={`cabinet-modal-wrapper ${screen === 'battle' && overlay === 'deck' ? 'with-combat-key' : ''}`}>
              <div className="cabinet-modal-frame paper-sheet-float">
                <div className="keyboard-modal-card">
            {overlay === 'help' && (
              <>
                <h2>Commands</h2>
                <ul className="modal-list">
                  <li><code>back</code> / <code>cancel</code> — Deselect card or close popup</li>
                  <li><code>end turn</code> — Finish your turn in battle</li>
                  <li><code>status effects</code> — View all status effect definitions (or type a status name like <code>ward</code>)</li>
                  <li><code>[enemy name]</code> — Type an enemy's name in battle to inspect its intent and statuses</li>
                  <li><code>[word]?</code> — Type any English word ending with <code>?</code> (e.g. <code>pavilion?</code>) to look up its definition</li>
                  <li><code>relics</code> — View names and descriptions of your collected relics</li>
                  <li><code>gold</code> — See how much gold you are carrying</li>
                  <li><code>view deck</code> / <code>view discard</code> — View cards</li>
                  <li><code>options</code> / <code>save</code> — Audio settings or Save Code</li>
                  <li>Art: Dungeon Crawl Stone Soup 32×32 tileset (OpenGameArt, CC0)</li>
                </ul>
              </>
            )}

            {overlay === 'status_effects' && (
              <div className="status-effects-overlay-content">
                <div style={{ marginBottom: 8 }}>
                  <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Combat Status Effects & Afflictions</h2>
                </div>
                <div className="status-definitions-list">
                  {STATUS_DEFINITIONS.map((st) => (
                    <div
                      key={st.id}
                      className={`status-def-card ${
                        highlightedStatusId === st.id ? 'status-def-highlighted' : ''
                      }`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <span className="status-pill" style={{ backgroundColor: st.color }}>
                          {st.name}
                        </span>
                      </div>
                      <p>{st.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overlay === 'entity_inspect' && inspectedEntity && (
              <>
                {inspectedEntity === 'player' ? (
                  <div>
                    <h2>{playerName} (Player)</h2>
                    <p>
                      HP: {hp}/{maxHp} · Ward: {playerWard}
                    </p>
                    <h3>Active Status Effects:</h3>
                    <ul className="modal-list">
                      {playerWard > 0 && (
                        <li>
                          <strong>Ward ({playerWard}):</strong> Prevents {playerWard} incoming damage this turn.
                        </li>
                      )}
                      {playerStatuses.bold > 0 && (
                        <li>
                          <strong>Bold ({playerStatuses.bold}):</strong> Attacks deal +{playerStatuses.bold} extra damage.
                        </li>
                      )}
                      {playerStatuses.faded > 0 && (
                        <li>
                          <strong>Faded ({playerStatuses.faded}):</strong> Attacks deal -{playerStatuses.faded} damage ({playerStatuses.faded} turn{playerStatuses.faded > 1 ? 's' : ''} left).
                        </li>
                      )}
                      {playerStatuses.exposed > 0 && (
                        <li>
                          <strong>Exposed ({playerStatuses.exposed}):</strong> Taking 50% more damage from attacks.
                        </li>
                      )}
                      {playerStatuses.ink_burn > 0 && (
                        <li>
                          <strong>Ink Burn ({playerStatuses.ink_burn}):</strong> Takes {playerStatuses.ink_burn} damage at the end of your turn (can be blocked by Ward), then decreases by 1.
                        </li>
                      )}
                      {playerStatuses.plated_armor > 0 && (
                        <li>
                          <strong>Plated Armor ({playerStatuses.plated_armor}):</strong> Gains {playerStatuses.plated_armor} Ward at turn start, then decreases by 1.
                        </li>
                      )}
                      {playerStatuses.thorns > 0 && (
                        <li>
                          <strong>Thorns ({playerStatuses.thorns}):</strong> Deals {playerStatuses.thorns} damage to attackers when attacked.
                        </li>
                      )}
                      {playerWard === 0 &&
                        playerStatuses.bold === 0 &&
                        playerStatuses.faded === 0 &&
                        playerStatuses.exposed === 0 &&
                        playerStatuses.ink_burn === 0 &&
                        playerStatuses.plated_armor === 0 &&
                        playerStatuses.thorns === 0 && <li>No active status effects.</li>}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h2>{inspectedEntity.displayName}</h2>
                    <p>
                      HP: {inspectedEntity.hp}/{inspectedEntity.maxHp} · Ward: {inspectedEntity.ward}
                      {inspectedEntity.currentBehavior && inspectedEntity.currentBehavior.condition !== 'normal' && (
                        <span> · Phase: <strong>{inspectedEntity.currentBehavior.name}</strong></span>
                      )}
                    </p>
                    <div className="entity-intent-english-box">
                      <IntentBadge
                        intent={inspectedEntity.currentMove.intent}
                        damage={
                          inspectedEntity.currentMove.damage
                            ? Math.max(
                                0,
                                inspectedEntity.currentMove.damage + inspectedEntity.statuses.bold
                              )
                            : undefined
                        }
                        faded={inspectedEntity.statuses.faded}
                        hits={inspectedEntity.currentMove.hits}
                        ward={inspectedEntity.currentMove.ward}
                        heal={inspectedEntity.currentMove.heal}
                      />
                      <p>
                        <strong>
                          {describeEnemyIntentInEnglish(inspectedEntity, playerStatuses.exposed)}
                        </strong>
                      </p>
                    </div>
                    <h3>Active Status Effects:</h3>
                    <ul className="modal-list">
                      {inspectedEntity.ward > 0 && (
                        <li>
                          <strong>Ward ({inspectedEntity.ward}):</strong> Prevents {inspectedEntity.ward} attack damage.
                        </li>
                      )}
                      {inspectedEntity.statuses.bold > 0 && (
                        <li>
                          <strong>Bold ({inspectedEntity.statuses.bold}):</strong> Deals +{inspectedEntity.statuses.bold} attack damage.
                        </li>
                      )}
                      {inspectedEntity.statuses.faded > 0 && (
                        <li>
                          <strong>Faded ({inspectedEntity.statuses.faded}):</strong> Deals -{inspectedEntity.statuses.faded} attack damage ({inspectedEntity.statuses.faded} turn{inspectedEntity.statuses.faded > 1 ? 's' : ''} left).
                        </li>
                      )}
                      {inspectedEntity.statuses.exposed > 0 && (
                        <li>
                          <strong>Exposed ({inspectedEntity.statuses.exposed}):</strong> Takes 50% more attack damage ({inspectedEntity.statuses.exposed} turns left).
                        </li>
                      )}
                      {inspectedEntity.statuses.ink_burn > 0 && (
                        <li>
                          <strong>Ink Burn ({inspectedEntity.statuses.ink_burn}):</strong> Takes {inspectedEntity.statuses.ink_burn} damage at the end of its turn (can be blocked by Ward), then decreases by 1.
                        </li>
                      )}
                      {inspectedEntity.statuses.plated_armor > 0 && (
                        <li>
                          <strong>Plated Armor ({inspectedEntity.statuses.plated_armor}):</strong> Gains {inspectedEntity.statuses.plated_armor} Ward at turn start, then decreases by 1.
                        </li>
                      )}
                      {inspectedEntity.statuses.thorns > 0 && (
                        <li>
                          <strong>Thorns ({inspectedEntity.statuses.thorns}):</strong> Deals {inspectedEntity.statuses.thorns} damage to attackers when attacked.
                        </li>
                      )}
                      {inspectedEntity.ward === 0 &&
                        inspectedEntity.statuses.bold === 0 &&
                        inspectedEntity.statuses.faded === 0 &&
                        inspectedEntity.statuses.exposed === 0 &&
                        inspectedEntity.statuses.ink_burn === 0 &&
                        inspectedEntity.statuses.plated_armor === 0 &&
                        inspectedEntity.statuses.thorns === 0 && <li>No active status effects.</li>}
                    </ul>
                  </div>
                )}
              </>
            )}

            {overlay === 'dictionary' && (
              <>
                <h2>Word Lookup: "{dictionaryQuery}"</h2>
                {dictionaryLoading && <p>Looking up definition...</p>}
                {!dictionaryLoading && !dictionaryData && (
                  <p>No dictionary definition found for "{dictionaryQuery}".</p>
                )}
                {!dictionaryLoading && dictionaryData && (
                  <div className="dictionary-results">
                    {dictionaryData.phonetic && (
                      <div className="dictionary-phonetic">{dictionaryData.phonetic}</div>
                    )}
                    {dictionaryData.meanings.map((m, idx) => (
                      <div key={idx} className="dictionary-meaning-block">
                        <strong>({m.partOfSpeech})</strong>
                        <ul>
                          {m.definitions.map((d, dIdx) => (
                            <li key={dIdx}>{d.definition}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {overlay === 'options' && (
              <div className="options-dialog">
                <h2>Options & Menu</h2>

                <div className="options-group">
                  <h3 className="options-group-title">Navigation & Codex</h3>
                  <div className="options-actions-grid">
                    {[
                      { cmd: 'codex', label: 'Monsters, Cards & Biomes' },
                      { cmd: 'relics', label: 'View Collected Relics' },
                      { cmd: 'deck', label: 'Inspect Deck Cards' },
                      { cmd: 'discard', label: 'Inspect Discard Pile' },
                      { cmd: 'status effects', label: 'Combat Statuses & Afflictions' },
                      { cmd: 'help', label: 'How to Play & Rules' },
                    ].map(({ cmd, label }) => {
                      const st = getPhraseHighlightState(cmd, 'easy');
                      return (
                        <div
                          key={cmd}
                          className={`options-action-chip ${
                            st.isHighlighted ? 'option-highlighted' : ''
                          } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                        >
                          <span className="options-action-cmd">type "{cmd}"</span>
                          <span className="options-action-desc">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="options-group">
                  <h3 className="options-group-title">Audio & Accessibility</h3>
                  <ul className="modal-list">
                    <li>
                      Audio ({settings.muted ? 'Muted' : 'On'}): type <code>mute</code> or <code>unmute</code>
                    </li>
                    <li>
                      Typing Sound ({settings.typingSound}): type <code>typewriter</code>, <code>telegraph</code>, <code>quill</code>, or <code>chalk</code>
                    </li>
                    <li>
                      Confirm Sound ({settings.confirmSound}): type <code>bell</code>, <code>chime</code>, or <code>stamp</code>
                    </li>
                    <li>
                      High Contrast ({settings.highContrast ? 'On' : 'Off'}): type <code>contrast</code>
                    </li>
                  </ul>
                </div>

                <div className="options-group">
                  <h3 className="options-group-title">System & Game</h3>
                  <div className="options-actions-grid">
                    {[
                      { cmd: 'save', label: 'View Run Save Code' },
                      { cmd: 'editor', label: 'Developer JSON Editor' },
                      { cmd: 'main menu', label: 'Exit to Title Screen' },
                      ...(screen === 'battle' ? [{ cmd: 'surrender', label: 'Abandon Battle' }] : []),
                    ].map(({ cmd, label }) => {
                      const st = getPhraseHighlightState(cmd, 'easy');
                      return (
                        <div
                          key={cmd}
                          className={`options-action-chip ${
                            st.isHighlighted ? 'option-highlighted' : ''
                          } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                        >
                          <span className="options-action-cmd">type "{cmd}"</span>
                          <span className="options-action-desc">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW DECK / DISCARD / BURNED: Categorized by visual theme and rarity */}
            {overlay === 'deck' && (
              <>
                <h2>
                  Deck ({deck.length} Cards)
                  {screen === 'battle' && (
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#b45309',
                        marginLeft: 12,
                        letterSpacing: '0.02em',
                      }}
                    >
                      (Combat Pile Key Active)
                    </span>
                  )}
                </h2>
                {renderCategorizedCardGrid(deck, 'No cards', screen === 'battle')}
              </>
            )}

            {overlay === 'discard' && (
              <>
                <h2>Discard Pile ({discardPile.length} Cards)</h2>
                {renderCategorizedCardGrid(discardPile)}
              </>
            )}

            {overlay === 'burn_draft' && (
              <>
                <h2>Burned Drafts ({burnDraftPile.length} Cards)</h2>
                {renderCategorizedCardGrid(burnDraftPile)}
              </>
            )}

            {overlay === 'gold' && (
              <div className="gold-popup">
                <div className="gold-popup-amount">{gold}</div>
                <p className="gold-popup-note">
                  You can spend it if you pass through a shop on your travels.
                </p>
              </div>
            )}

            {overlay === 'relics' && (
              <>
                <h2>Relics ({relicIds.length})</h2>
                <div className="modal-grid">
                  {relicIds.map((rId, idx) => {
                    const rel = getRelicDefinition(rId);
                    if (!rel) return null;
                    return (
                      <div key={`${rId}_${idx}`} className="modal-item-chip relic-modal-item">
                        {rel.art.spriteUrl && (
                          <img src={rel.art.spriteUrl} alt="" className="relic-modal-img" />
                        )}
                        <div>
                          <strong>{rel.names[phraseDiff]}</strong>
                          <div>{rel.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {overlay === 'save' && (
              <>
                <h2>Save Code</h2>
                <div className="save-code-box">
                  <code className="save-code-string">{currentSaveCode}</code>
                </div>
              </>
            )}

            <div className="modal-footer-prompt">
              <span className="cmd-hint-prefix">type</span>{' '}
              <span className="top-cmd-box">back</span>{' '}
              {renderTypingInputWithCaret()}
            </div>
              </div>
            </div>

            {/* Combat Deck Pile Key poking out the side of the window (only in battle & overlay === 'deck') */}
            {screen === 'battle' && overlay === 'deck' && (
              <aside className="deck-combat-key-tab" aria-label="Combat Deck Pile Key">
                <div className="deck-key-header">
                  <span className="deck-key-title">KEY</span>
                </div>
                <div className="deck-key-items">
                  <div className="deck-key-item key-item-yellow" title="Cards in Deck (Draw Pile) — Yellow Glow">
                    <span className="key-glow-indicator glow-yellow" />
                    <span className="key-item-label">Deck</span>
                    <span className="key-item-count">{drawPile.length}</span>
                  </div>
                  <div className="deck-key-item key-item-green" title="Cards in Hand — Green Glow">
                    <span className="key-glow-indicator glow-green" />
                    <span className="key-item-label">Hand</span>
                    <span className="key-item-count">{hand.length}</span>
                  </div>
                  <div className="deck-key-item key-item-purple" title="Cards in Discard Pile — Purple Glow">
                    <span className="key-glow-indicator glow-purple" />
                    <span className="key-item-label">Discard</span>
                    <span className="key-item-count">{discardPile.length}</span>
                  </div>
                  <div className="deck-key-item key-item-red" title="Cards Exhausted this Combat — Red Glow">
                    <span className="key-glow-indicator glow-red" />
                    <span className="key-item-label">Exhausted</span>
                    <span className="key-item-count">{burnDraftPile.length}</span>
                  </div>
                </div>
              </aside>
            )}
          </div>
          )}
        </div>
      )}

      {/* DEVELOPER JSON & SPRITE EDITOR GUI */}
      {devEditorOpen && (
        <DevJsonEditor
          onClose={() => {
            soundEngine.stopAmbiance(0.2);
            setDevEditorOpen(false);
          }}
          settings={settings}
          onPlaytestEvent={startPlaytestEncounter}
        />
      )}
    </div>
  );
}

export default App;
