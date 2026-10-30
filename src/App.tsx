import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { CardBanner } from './components/CardBanner';
import { EntitySprite, IntentBadge } from './components/EntitySprite';
import { ScrollableMap } from './components/ScrollableMap';
import type {
  ActiveEnemy,
  CardInstance,
  Difficulty,
  GameSettings,
  MapNode,
  MysteryEventDefinition,
  RelicDefinition,
  RunMetrics,
  StatusState,
} from './types/game';
import {
  chooseEnemyMove,
  createStarterDeck,
  ENEMIES_CATALOG,
  EVENTS_CATALOG,
  generateCardRewards,
  generateEncounter,
  generateProceduralMap,
  generateRelicRewards,
  getCardDefinition,
  getRelicDefinition,
  nextUid,
  pickRandom,
  resolveCardInstance,
  shuffleArray,
} from './utils/gameContent';
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
  | 'save'
  | 'status_effects'
  | 'entity_inspect'
  | 'dictionary';

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
  particles: {
    dx: number;
    dy: number;
    size: number;
    color: string;
    rot: number;
  }[];
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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function App() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [overlay, setOverlay] = useState<ModalOverlay>('none');
  const [extraHardAvailable, setExtraHardAvailable] = useState<boolean>(() => isExtraHardUnlocked());

  const [screen, setScreen] = useState<GameScreen>('main_menu');
  const [tutorialStep, setTutorialStep] = useState<number>(0);
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
  const [mapScrollOffset, setMapScrollOffset] = useState<number>(3600);

  const [energy, setEnergy] = useState<number>(3);
  const [maxEnergy, setMaxEnergy] = useState<number>(3);
  const [playerWard, setPlayerWard] = useState<number>(0);
  const [playerStatuses, setPlayerStatuses] = useState<StatusState>({
    bold: 0,
    faded: 0,
    exposed: 0,
    ink_burn: 0,
  });
  const [hand, setHand] = useState<CardInstance[]>([]);
  const [drawPile, setDrawPile] = useState<CardInstance[]>([]);
  const [discardPile, setDiscardPile] = useState<CardInstance[]>([]);
  const [burnDraftPile, setBurnDraftPile] = useState<CardInstance[]>([]);
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);
  const [isAnimatingTurn, setIsAnimatingTurn] = useState<boolean>(false);
  const [activeProjectile, setActiveProjectile] = useState<CombatProjectile | null>(null);
  const [floatingPopups, setFloatingPopups] = useState<FloatingCombatPopup[]>([]);
  const [particleBursts, setParticleBursts] = useState<InkParticleBurst[]>([]);

  const [rewardCards, setRewardCards] = useState<CardInstance[]>([]);
  const [rewardRelics, setRewardRelics] = useState<RelicDefinition[]>([]);
  const [rewardGoldClaimed, setRewardGoldClaimed] = useState<number>(0);
  const [campfireSubMode, setCampfireSubMode] = useState<'choose' | 'revise_select'>('choose');
  const [shopSubMode, setShopSubMode] = useState<'browse' | 'remove_select'>('browse');
  const [shopInventory, setShopInventory] = useState<ShopInventory | null>(null);
  const [activeEvent, setActiveEvent] = useState<MysteryEventDefinition | null>(null);
  const [eventOutcomeText, setEventOutcomeText] = useState<string | null>(null);

  const [typedInput, setTypedInput] = useState<string>('');
  const [actionStartTime, setActionStartTime] = useState<number | null>(null);
  const [actionCharAccum, setActionCharAccum] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(40);

  /**
   * Spawns a tactile ink-splatter / parchment-spark particle burst whenever an action is confirmed!
   */
  const triggerActionParticles = useCallback((xPct: number = 50, yPct: number = 88) => {
    const id = nextUid('burst');
    const colors = ['#137547', '#bc5215', '#102a3a', '#d97706', '#ffd166'];
    const particles = Array.from({ length: 24 }, (_, idx) => {
      const angle = (Math.PI * 2 * idx) / 24 + (Math.random() - 0.5) * 0.35;
      const dist = 36 + Math.random() * 115;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 22,
        size: 5 + Math.random() * 7,
        color: colors[idx % colors.length],
        rot: Math.floor(Math.random() * 360),
      };
    });
    setParticleBursts((prev) => [...prev, { id, x: xPct, y: yPct, particles }]);
    window.setTimeout(() => {
      setParticleBursts((prev) => prev.filter((b) => b.id !== id));
    }, 750);
  }, []);

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
      currentDiscard: CardInstance[]
    ): { nextHand: CardInstance[]; nextDraw: CardInstance[]; nextDiscard: CardInstance[] } => {
      const nextHand = [...currentHand];
      let nextDraw = [...currentDraw];
      let nextDiscard = [...currentDiscard];

      for (let i = 0; i < count; i++) {
        if (nextHand.length >= 10) break;
        if (nextDraw.length === 0) {
          if (nextDiscard.length === 0) break;
          nextDraw = shuffleArray(nextDiscard);
          nextDiscard = [];
        }
        const drawn = nextDraw.shift();
        if (drawn) nextHand.push(drawn);
      }

      return { nextHand, nextDraw, nextDiscard };
    },
    []
  );

  const startBattle = useCallback(
    (floorNum: number, nodeType: 'battle' | 'elite' | 'boss', currentDeck: CardInstance[], currentRelics: string[]) => {
      setActiveNodeType(nodeType);
      const spawnedEnemies = generateEncounter(floorNum, nodeType, phraseDiff);

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

      const baseTurnEnergy = 3 + bonusEnergy;
      setMaxEnergy(baseTurnEnergy);
      setEnergy(baseTurnEnergy);
      setPlayerWard(startWard);
      setPlayerStatuses({
        bold: startBold,
        faded: 0,
        exposed: 0,
        ink_burn: 0,
      });

      const shuffled = shuffleArray(currentDeck);
      const initialDrawCount = Math.min(8, 5 + bonusDraw);
      const { nextHand, nextDraw, nextDiscard } = drawCards(initialDrawCount, [], shuffled, []);

      setHand(nextHand);
      setDrawPile(nextDraw);
      setDiscardPile(nextDiscard);
      setBurnDraftPile([]);
      setEnemies(spawnedEnemies);
      setSelectedCard(null);
      setFloatingPopups([]);
      resetTypingBuffer(true);
      setScreen('battle');
    },
    [drawCards, phraseDiff, resetTypingBuffer]
  );

  const handleCombatVictory = useCallback(
    (survivingHp: number) => {
      if (currentFloor >= 24 || activeNodeType === 'boss') {
        if (difficulty === 'hard' || difficulty === 'extra_hard') {
          setExtraHardUnlocked(true);
          setExtraHardAvailable(true);
        }
        clearLocalRun();
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

      setRewardCards(generateCardRewards(4, activeNodeType === 'elite'));
      setRewardRelics(activeNodeType === 'elite' ? generateRelicRewards(relicIds, 3) : []);

      setMetrics((prev) => ({
        ...prev,
        floorsCleared: prev.floorsCleared + 1,
      }));

      setSelectedCard(null);
      resetTypingBuffer(true);
      setScreen('reward');
    },
    [activeNodeType, currentFloor, difficulty, maxHp, relicIds, resetTypingBuffer]
  );

  const executeCardPlay = useCallback(
    async (cardInst: CardInstance, targetEnemy: ActiveEnemy | null, speedMult: number) => {
      const resolved = resolveCardInstance(cardInst, phraseDiff);
      if (energy < resolved.cost || isAnimatingTurn) {
        soundEngine.playError(settings);
        return;
      }

      triggerActionParticles(50, 86);
      setIsAnimatingTurn(true);
      setSelectedCard(null);
      resetTypingBuffer(true);

      let nextEnergy = energy - resolved.cost;
      let nextWard = playerWard;
      let nextHp = hp;
      const nextPlayerStatuses = { ...playerStatuses };
      const nextEnemies = enemies.map((e) => ({
        ...e,
        statuses: { ...e.statuses },
      }));

      let totalDmgDealtThisCard = 0;
      let extraDraw = 0;

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

      const dealHitToEnemy = (enemyObj: ActiveEnemy, baseDamage: number) => {
        let dmg = scaleAmount(baseDamage) + nextPlayerStatuses.bold;
        if (nextPlayerStatuses.faded > 0) {
          dmg = Math.floor(dmg * 0.75);
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

        if (blocked > 0 && hpLoss > 0) {
          spawnPopup(enemyObj.instanceId, `-${hpLoss} HP (${blocked} Blocked)`, '#e63946');
        } else if (blocked > 0) {
          spawnPopup(enemyObj.instanceId, `${blocked} Blocked`, '#1d6fa5');
        } else if (hpLoss > 0) {
          spawnPopup(enemyObj.instanceId, `-${hpLoss} HP`, '#e63946');
        }
      };

      for (const eff of resolved.effects) {
        const effTarget = eff.target || resolved.target;
        const targetList =
          effTarget === 'all_enemies'
            ? nextEnemies
            : targetEnemy
            ? nextEnemies.filter((e) => e.instanceId === targetEnemy.instanceId)
            : nextEnemies.slice(0, 1);

        const hits = eff.hits || 1;

        switch (eff.type) {
          case 'damage': {
            for (let h = 0; h < hits; h++) {
              targetList.forEach((en) => {
                if (en.hp > 0) dealHitToEnemy(en, eff.amount);
              });
              if (hits > 1 && h < hits - 1) await delay(180);
            }
            break;
          }
          case 'damage_per_ward': {
            targetList.forEach((en) => {
              if (en.hp > 0) dealHitToEnemy(en, nextWard * eff.amount);
            });
            break;
          }
          case 'ward': {
            const gained = scaleAmount(eff.amount);
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
            const gained = scaleAmount(eff.amount) * Math.max(0, hand.length - 1);
            nextWard += gained;
            spawnPopup('player', `+${gained} Ward`, '#1d6fa5');
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'bold': {
            const amt = scaleAmount(eff.amount);
            nextPlayerStatuses.bold += amt;
            spawnPopup('player', `+${amt} Bold`, '#d97706');
            break;
          }
          case 'faded': {
            const amt = scaleAmount(eff.amount);
            targetList.forEach((en) => {
              en.statuses.faded += amt;
              spawnPopup(en.instanceId, `+${amt} Faded`, '#64748b');
            });
            break;
          }
          case 'exposed': {
            const amt = scaleAmount(eff.amount);
            targetList.forEach((en) => {
              en.statuses.exposed += amt;
              spawnPopup(en.instanceId, `+${amt} Exposed`, '#be123c');
            });
            break;
          }
          case 'ink_burn': {
            const amt = scaleAmount(eff.amount);
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
            extraDraw += eff.amount;
            break;
          }
          case 'energy': {
            nextEnergy += eff.amount;
            spawnPopup('player', `+${eff.amount} Energy`, '#2a9d8f');
            break;
          }
          case 'heal': {
            const healAmt = scaleAmount(eff.amount);
            nextHp = Math.min(maxHp, nextHp + healAmt);
            spawnPopup('player', `+${healAmt} HP`, '#3a8918');
            break;
          }
          case 'self_damage': {
            nextHp = Math.max(1, nextHp - eff.amount);
            spawnPopup('player', `-${eff.amount} HP`, '#e63946');
            break;
          }
        }
      }

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

      const killedCount = nextEnemies.filter((e) => e.hp <= 0).length;
      if (killedCount > 0) {
        relicIds.forEach((rId) => {
          const rel = getRelicDefinition(rId);
          if (rel && rel.trigger === 'on_kill') {
            if (rel.effectType === 'energy') nextEnergy += rel.amount * killedCount;
            if (rel.effectType === 'heal') nextHp = Math.min(maxHp, nextHp + rel.amount * killedCount);
          }
        });
      }

      const aliveEnemies = nextEnemies.filter((e) => e.hp > 0);
      const remainingHand = hand.filter((c) => c.instanceId !== cardInst.instanceId);
      const nextDiscard = [...discardPile];
      const nextBurn = [...burnDraftPile];

      if (resolved.burnDraft || resolved.type === 'power') {
        nextBurn.push(cardInst);
      } else {
        nextDiscard.push(cardInst);
      }

      const drawnResult =
        extraDraw > 0
          ? drawCards(extraDraw, remainingHand, drawPile, nextDiscard)
          : { nextHand: remainingHand, nextDraw: drawPile, nextDiscard };

      setEnergy(nextEnergy);
      setPlayerWard(nextWard);
      setHp(nextHp);
      setPlayerStatuses(nextPlayerStatuses);
      setHand(drawnResult.nextHand);
      setDrawPile(drawnResult.nextDraw);
      setDiscardPile(drawnResult.nextDiscard);
      setBurnDraftPile(nextBurn);
      setEnemies(aliveEnemies);

      setMetrics((prev) => ({
        ...prev,
        cardsPlayed: prev.cardsPlayed + 1,
        totalDamageDealt: prev.totalDamageDealt + totalDmgDealtThisCard,
        enemiesDefeated: prev.enemiesDefeated + killedCount,
      }));

      setIsAnimatingTurn(false);

      if (aliveEnemies.length === 0) {
        await delay(300);
        handleCombatVictory(nextHp);
      }
    },
    [
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
      settings,
      spawnPopup,
      triggerActionParticles,
      triggerProjectile,
    ]
  );

  const executeEndTurn = useCallback(async () => {
    if (isAnimatingTurn) return;
    setIsAnimatingTurn(true);
    soundEngine.playConfirm(settings);
    triggerActionParticles(50, 86);
    setSelectedCard(null);
    resetTypingBuffer(true);

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

    for (let idx = 0; idx < workingEnemies.length; idx++) {
      const en = workingEnemies[idx];
      if (en.hp <= 0) continue;

      if (en.statuses.ink_burn > 0) {
        const burnDmg = en.statuses.ink_burn;
        en.hp = Math.max(0, en.hp - burnDmg);
        totalBurnDamage += burnDmg;
        en.statuses.ink_burn = Math.max(0, en.statuses.ink_burn - 1);
        spawnPopup(en.instanceId, `-${burnDmg} Ink Burn`, '#6d28d9');
        setEnemies([...workingEnemies.filter((x) => x.hp > 0)]);
        await delay(420);
      }

      if (en.hp <= 0) {
        killedByInkBurn += 1;
        continue;
      }

      if (en.ward > 0) {
        en.ward = 0;
        spawnPopup(en.instanceId, `Ward wore off`, '#64748b');
      }

      const move = en.currentMove;
      if (move.damage && move.damage > 0) {
        const hits = move.hits || 1;
        for (let h = 0; h < hits; h++) {
          await triggerProjectile(idx, 'player', '#b84a14');
          let dmg = move.damage + en.statuses.bold;
          if (en.statuses.faded > 0) dmg = Math.floor(dmg * 0.75);
          if (nextPlayerStats.exposed > 0) dmg = Math.floor(dmg * 1.5);
          dmg = Math.max(0, dmg);

          const blocked = Math.min(nextPlayerWard, dmg);
          nextPlayerWard -= blocked;
          const unblocked = dmg - blocked;
          nextPlayerHp = Math.max(0, nextPlayerHp - unblocked);

          totalBlockedSummary += blocked;
          totalHpLostSummary += unblocked;

          if (blocked > 0 && unblocked > 0) {
            spawnPopup('player', `-${unblocked} HP (${blocked} Blocked)`, '#e63946');
          } else if (blocked > 0) {
            spawnPopup('player', `${blocked} Blocked`, '#1d6fa5');
          } else if (unblocked > 0) {
            spawnPopup('player', `-${unblocked} HP`, '#e63946');
          }

          setPlayerWard(nextPlayerWard);
          setHp(nextPlayerHp);
          await delay(320);
        }
      } else {
        await delay(300);
      }

      if (move.ward && move.ward > 0) {
        en.ward += move.ward;
        spawnPopup(en.instanceId, `+${move.ward} Ward`, '#1d6fa5');
      }

      if (move.heal && move.heal > 0) {
        en.hp = Math.min(en.maxHp, en.hp + move.heal);
        spawnPopup(en.instanceId, `+${move.heal} HP`, '#3a8918');
      }

      if (move.statusEffects) {
        move.statusEffects.forEach((se) => {
          if (se.target === 'player') {
            nextPlayerStats[se.status] += se.amount;
            spawnPopup('player', `+${se.amount} ${se.status.replace('_', ' ')}`, '#6d28d9');
          } else if (se.target === 'self') {
            en.statuses[se.status] += se.amount;
            spawnPopup(en.instanceId, `+${se.amount} ${se.status.replace('_', ' ')}`, '#d97706');
          } else if (se.target === 'all_allies') {
            workingEnemies.forEach((ally) => {
              if (ally.hp > 0) {
                ally.statuses[se.status] += se.amount;
                spawnPopup(ally.instanceId, `+${se.amount} ${se.status.replace('_', ' ')}`, '#d97706');
              }
            });
          }
        });
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

      const def = ENEMIES_CATALOG.find((d) => d.id === en.enemyId);
      en.currentMove = def ? chooseEnemyMove(def.moves) : en.currentMove;

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

    if (nextPlayerStats.ink_burn > 0) {
      const pBurn = nextPlayerStats.ink_burn;
      nextPlayerHp = Math.max(0, nextPlayerHp - pBurn);
      totalHpLostSummary += pBurn;
      nextPlayerStats.ink_burn -= 1;
      spawnPopup('player', `-${pBurn} Ink Burn`, '#6d28d9');
    }

    if (nextPlayerHp <= 0) {
      setHp(0);
      setIsAnimatingTurn(false);
      clearLocalRun();
      setScreen('game_over');
      return;
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

    let newTurnWard = 0;
    relicIds.forEach((rId) => {
      const rel = getRelicDefinition(rId);
      if (rel && rel.trigger === 'turn_start' && rel.effectType === 'ward') {
        newTurnWard += rel.amount;
      }
    });

    const discardedHand = [...discardPile, ...hand];
    let turnDrawCount = 5;
    relicIds.forEach((rId) => {
      const rel = getRelicDefinition(rId);
      if (rel && rel.trigger === 'passive_draw' && rel.effectType === 'draw') {
        turnDrawCount += rel.amount;
      }
    });

    const { nextHand, nextDraw, nextDiscard } = drawCards(
      turnDrawCount,
      [],
      drawPile,
      discardedHand
    );

    setHp(nextPlayerHp);
    setPlayerWard(newTurnWard);
    setPlayerStatuses(nextPlayerStats);
    setEnergy(maxEnergy);
    setHand(nextHand);
    setDrawPile(nextDraw);
    setDiscardPile(nextDiscard);
    setEnemies(survivingEnemies);
    setIsAnimatingTurn(false);
  }, [
    discardPile,
    drawCards,
    drawPile,
    enemies,
    hand,
    handleCombatVictory,
    hp,
    isAnimatingTurn,
    maxEnergy,
    playerStatuses,
    playerWard,
    relicIds,
    resetTypingBuffer,
    settings,
    spawnPopup,
    triggerActionParticles,
    triggerProjectile,
  ]);

  const enterMapNode = useCallback(
    (node: MapNode) => {
      triggerActionParticles(50, 75);
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
        setCampfireSubMode('choose');
        resetTypingBuffer(true);
        setScreen('campfire');
        return;
      }

      if (node.type === 'merchant') {
        const shopCards = generateCardRewards(4, false).map((inst) => {
          const def = getCardDefinition(inst.cardId);
          const price = def.rarity === 'rare' ? 130 : def.rarity === 'uncommon' ? 85 : 50;
          return { instance: inst, price, sold: false };
        });
        const shopRelics = generateRelicRewards(relicIds, 2).map((rel) => ({
          relic: rel,
          price: rel.price || 145,
          sold: false,
        }));
        setShopInventory({
          cards: shopCards,
          relics: shopRelics,
          removeServicePrice: 65,
          removeUsed: false,
        });
        setShopSubMode('browse');
        resetTypingBuffer(true);
        setScreen('merchant');
        return;
      }

      if (node.type === 'treasure') {
        setRewardRelics(generateRelicRewards(relicIds, 3));
        resetTypingBuffer(true);
        setScreen('treasure');
        return;
      }

      if (node.type === 'mystery') {
        const ev = pickRandom(EVENTS_CATALOG);
        setActiveEvent(ev);
        setEventOutcomeText(null);
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
      startBattle,
      triggerActionParticles,
    ]
  );

  const advanceToMapNextFloor = useCallback(() => {
    const nextF = Math.min(24, currentFloor + 1);
    setCurrentFloor(nextF);
    resetTypingBuffer(true);
    setScreen('map');
  }, [currentFloor, resetTypingBuffer]);

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

  const evaluatedHand = useMemo(() => {
    if (screen !== 'battle' || selectedCard) return [];
    return evaluateCandidates(
      typedInput,
      handCandidates.map((c) => ({ item: c, phrase: c.phrase })),
      difficulty
    );
  }, [difficulty, handCandidates, screen, selectedCard, typedInput]);

  const { highlightedCardIds, enterReadyCardId } = useMemo(() => {
    if (!typedInput.trim() || selectedCard) {
      return { highlightedCardIds: new Set<string>(), enterReadyCardId: null as string | null };
    }
    const matches = evaluatedHand.filter((m) => m.isPrefixMatch);
    const top = evaluatedHand[0];
    return {
      highlightedCardIds: new Set(matches.map((m) => m.item.item.instanceId)),
      enterReadyCardId: top && top.isValidConfirm ? top.item.item.instanceId : null,
    };
  }, [evaluatedHand, selectedCard, typedInput]);

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
    if (!typedInput.trim()) {
      return { highlightedEnemyIds: new Set<string>(), enterReadyEnemyId: null as string | null };
    }
    const matches = evaluatedEnemies.filter((m) => m.isPrefixMatch);
    const top = evaluatedEnemies[0];
    return {
      highlightedEnemyIds: new Set(matches.map((m) => m.item.instanceId)),
      enterReadyEnemyId: top && top.isValidConfirm ? top.item.instanceId : null,
    };
  }, [evaluatedEnemies, typedInput]);

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
      triggerActionParticles(50, 82);
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
      resetTypingBuffer(true);
      setScreen('map');
    },
    [resetTypingBuffer, triggerActionParticles]
  );

  const restoreFromSavePayload = useCallback(
    (rawCode: string): boolean => {
      const payload = decodeSaveCode(rawCode);
      if (!payload) return false;

      triggerActionParticles(50, 82);
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
      resetTypingBuffer(true);
      setOverlay('none');
      setScreen('map');
      return true;
    },
    [resetTypingBuffer, triggerActionParticles]
  );

  const handleEnterSubmit = useCallback(() => {
    if (isAnimatingTurn) return;
    const raw = typedInput.trim();
    const norm = normalizeText(raw);

    // 0. Live Word Dictionary Lookup (`<word>?`)
    if (raw.endsWith('?') && raw.length > 1) {
      const queryWord = raw.slice(0, -1).trim();
      if (queryWord.length > 0 && !queryWord.includes(' ')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 88);
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

    // 1. Modal Overlay Commands
    if (overlay !== 'none') {
      if (
        !raw ||
        matchCommand(raw, ['back', 'return', 'close', 'exit', 'cancel', 'resume', 'done'], 'easy')
      ) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 85);
        setOverlay('none');
        setHighlightedStatusId(null);
        setInspectedEntity(null);
        resetTypingBuffer(false);
        return;
      }

      if (overlay === 'options') {
        if (matchCommand(raw, ['mute', 'unmute', 'toggle mute'], 'easy')) {
          setSettings((s) => ({ ...s, muted: !s.muted }));
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['typewriter', 'mechanical typewriter'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'mechanical_typewriter' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'mechanical_typewriter' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['telegraph', 'vintage telegraph'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'vintage_telegraph' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'vintage_telegraph' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['quill', 'arcane quill'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'arcane_quill' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'arcane_quill' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['chalk', 'soft chalk'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'soft_chalk' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'soft_chalk' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['bell', 'carriage bell'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'carriage_bell' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'carriage_bell' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['chime', 'spell chime'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'spell_chime' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'spell_chime' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['stamp', 'heavy stamp'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'heavy_stamp' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'heavy_stamp' });
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['contrast', 'high contrast'], 'easy')) {
          setSettings((s) => ({ ...s, highContrast: !s.highContrast }));
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 85);
          resetTypingBuffer(false);
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
    if (matchCommand(raw, ['help', 'commands', 'what can i type'], 'easy')) {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('help');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['options', 'settings', 'audio', 'sound'], 'easy')) {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('options');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['mute'], 'easy')) {
      setSettings((s) => ({ ...s, muted: true }));
      triggerActionParticles(50, 88);
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['unmute'], 'easy')) {
      const next = { ...settings, muted: false };
      setSettings(next);
      soundEngine.playConfirm(next);
      triggerActionParticles(50, 88);
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['status effects', 'statuses', 'status', 'effects'], 'easy')) {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setHighlightedStatusId(null);
      setOverlay('status_effects');
      resetTypingBuffer(false);
      return;
    }
    for (const st of STATUS_DEFINITIONS) {
      if (matchCommand(raw, [st.name, `inspect ${st.name}`], 'easy')) {
        const collidesWithHandCard =
          screen === 'battle' &&
          !selectedCard &&
          evaluatedHand[0]?.isValidConfirm &&
          normalizeText(evaluatedHand[0].phrase) === norm;
        if (!collidesWithHandCard) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 88);
          setHighlightedStatusId(st.id);
          setOverlay('status_effects');
          resetTypingBuffer(false);
          return;
        }
      }
    }

    if (
      matchCommand(raw, ['view deck', 'deck', 'show deck'], 'easy') &&
      screen !== 'main_menu' &&
      screen !== 'peasant_intro'
    ) {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('deck');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view discard', 'discard', 'discard pile'], 'easy') && screen === 'battle') {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('discard');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view burn', 'burn draft', 'burned'], 'easy') && screen === 'battle') {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('burn_draft');
      resetTypingBuffer(false);
      return;
    }
    if (
      matchCommand(raw, ['relics', 'view relics', 'inspect relics'], 'easy') &&
      screen !== 'main_menu' &&
      screen !== 'peasant_intro'
    ) {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('relics');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['save', 'save code', 'export save'], 'easy')) {
      soundEngine.playConfirm(settings);
      triggerActionParticles(50, 88);
      setOverlay('save');
      resetTypingBuffer(false);
      return;
    }

    // 3. MAIN MENU
    if (screen === 'main_menu') {
      if (matchCommand(raw, ['new run', 'new', 'start', 'play'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
        setIntroStep('ask_name');
        setScreen('peasant_intro');
        resetTypingBuffer(true);
        return;
      }
      if (matchCommand(raw, ['tutorial', 'learn', 'how to play'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
        setTutorialStep(0);
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
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

    // 4. TUTORIAL
    if (screen === 'tutorial') {
      if (matchCommand(raw, ['back', 'exit', 'menu', 'skip'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 80);
        setScreen('main_menu');
        resetTypingBuffer(true);
        return;
      }
      if (tutorialStep === 0 && matchCommand(raw, ['strike'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 75);
        setTutorialStep(1);
        resetTypingBuffer(true);
        return;
      }
      if (tutorialStep === 1 && matchCommand(raw, ['goblin scout', 'goblin'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 75);
        setTutorialStep(2);
        resetTypingBuffer(true);
        return;
      }
      if (tutorialStep === 2 && (!norm || matchCommand(raw, ['new run', 'start', 'menu', 'done'], 'easy'))) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 75);
        setIntroStep('ask_name');
        setScreen('peasant_intro');
        resetTypingBuffer(true);
        return;
      }
      soundEngine.playError(settings);
      return;
    }

    // 5. PEASANT INTRO
    if (screen === 'peasant_intro') {
      if (introStep === 'ask_name') {
        if (matchCommand(raw, ['back', 'menu', 'return'], 'easy')) {
          soundEngine.playConfirm(settings);
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 78);
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
          soundEngine.playConfirm(settings);
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
      if (
        selectedCard &&
        matchCommand(raw, ['back', 'return', 'cancel', 'deselect', 'abort'], 'easy')
      ) {
        soundEngine.playBackspace(settings);
        setSelectedCard(null);
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

          if (energy < resolved.cost) {
            soundEngine.playError(settings);
            spawnPopup('player', `Need ${resolved.cost} Energy!`, '#b84a14');
            resetTypingBuffer(true);
            return;
          }

          soundEngine.playConfirm(settings);
          triggerActionParticles(18, 52);
          setSelectedCard(chosenInst);
          setActionCharAccum((prev) => prev + resolved.name.length);
          setTypedInput('');
          return;
        }

        const bestEnemyInspect = evaluatedEnemies[0];
        if (bestEnemyInspect && bestEnemyInspect.isValidConfirm) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(75, 50);
          setInspectedEntity(bestEnemyInspect.item);
          setOverlay('entity_inspect');
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['player', 'myself', playerName], 'easy')) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(35, 50);
          setInspectedEntity('player');
          setOverlay('entity_inspect');
          resetTypingBuffer(false);
          return;
        }

        soundEngine.playError(settings);
        return;
      }

      const resolvedSelected = resolveCardInstance(selectedCard, phraseDiff);
      if (resolvedSelected.target === 'self' || resolvedSelected.target === 'all_enemies') {
        if (!norm || matchCommand(raw, ['confirm', 'cast', 'yes', resolvedSelected.connector], 'easy')) {
          soundEngine.playConfirm(settings);
          const speedMult = recordActionMetrics('', 0);
          executeCardPlay(selectedCard, null, speedMult);
          return;
        }
        soundEngine.playError(settings);
        return;
      }

      const bestEnemy = evaluatedEnemies[0];
      if (bestEnemy && bestEnemy.isValidConfirm) {
        soundEngine.playConfirm(settings);
        const speedMult = recordActionMetrics(bestEnemy.phrase, bestEnemy.distance);
        executeCardPlay(selectedCard, bestEnemy.item, speedMult);
        return;
      }

      soundEngine.playError(settings);
      return;
    }

    // 8. POST-BATTLE REWARD
    if (screen === 'reward') {
      if (matchCommand(raw, ['skip', 'continue', 'next', 'leave', 'pass'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 82);
        advanceToMapNextFloor();
        return;
      }

      if (rewardCards.length > 0) {
        const cardCands = rewardCards.map((c) => {
          const res = resolveCardInstance(c, phraseDiff);
          return { item: c, phrase: res.name };
        });
        const evalCards = evaluateCandidates(raw, cardCands, difficulty);
        if (evalCards[0] && evalCards[0].isValidConfirm) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 65);
          const picked = evalCards[0].item;
          setDeck((d) => [...d, picked]);
          setRewardCards([]);
          resetTypingBuffer(true);
          if (rewardRelics.length === 0) {
            advanceToMapNextFloor();
          }
          return;
        }
      }

      if (rewardRelics.length > 0) {
        const relicCands = rewardRelics.map((r) => ({
          item: r,
          phrase: r.names[phraseDiff],
        }));
        const evalRelics = evaluateCandidates(raw, relicCands, difficulty);
        if (evalRelics[0] && evalRelics[0].isValidConfirm) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 65);
          const pickedRelic = evalRelics[0].item;
          setRelicIds((ids) => [...ids, pickedRelic.id]);
          if (pickedRelic.trigger === 'passive_max_hp' && pickedRelic.effectType === 'max_hp') {
            setMaxHp((m) => m + pickedRelic.amount);
            setHp((h) => h + pickedRelic.amount);
          }
          setRewardRelics([]);
          resetTypingBuffer(true);
          if (rewardCards.length === 0) {
            advanceToMapNextFloor();
          }
          return;
        }
      }

      soundEngine.playError(settings);
      return;
    }

    // 9. CAMPFIRE
    if (screen === 'campfire') {
      if (campfireSubMode === 'choose') {
        if (matchCommand(raw, ['rest', 'sleep', 'heal', 'rest by the fire'], difficulty)) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 65);
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
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 65);
          setCampfireSubMode('revise_select');
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
          resetTypingBuffer(true);
          return;
        }
        const upgradable = deck.filter((c) => !c.upgraded);
        const cands = upgradable.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c, phraseDiff).name,
        }));
        const evalUp = evaluateCandidates(raw, cands, difficulty);
        if (evalUp[0] && evalUp[0].isValidConfirm) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 65);
          const targetInst = evalUp[0].item;
          setDeck((prev) =>
            prev.map((c) =>
              c.instanceId === targetInst.instanceId ? { ...c, upgraded: true } : c
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
        const cands = deck.map((c) => ({
          item: c,
          phrase: resolveCardInstance(c, phraseDiff).name,
        }));
        const evalRem = evaluateCandidates(raw, cands, difficulty);
        if (evalRem[0] && evalRem[0].isValidConfirm) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 65);
          const toRemove = evalRem[0].item;
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 82);
        advanceToMapNextFloor();
        return;
      }

      if (matchCommand(raw, ['burn card', 'remove card', 'purge card', 'remove'], difficulty)) {
        if (shopInventory.removeUsed || gold < shopInventory.removeServicePrice) {
          soundEngine.playError(settings);
          return;
        }
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
        const picked = evalRelics[0].item;
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
      if (eventOutcomeText !== null) {
        if (!norm || matchCommand(raw, ['continue', 'onward', 'next', 'leave'], 'easy')) {
          soundEngine.playConfirm(settings);
          triggerActionParticles(50, 75);
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
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 65);
        const choice = evalChoices[0].item;
        const eff = choice.effects;

        if (eff.maxHpChange) {
          setMaxHp((m) => Math.max(10, m + eff.maxHpChange!));
          if (eff.maxHpChange > 0) setHp((h) => h + eff.maxHpChange!);
        }
        if (eff.hpChange) {
          setHp((h) => Math.max(1, Math.min(maxHp, h + eff.hpChange!)));
        }
        if (eff.goldChange) {
          setGold((g) => Math.max(0, g + eff.goldChange!));
        }
        if (eff.gainRandomCard) {
          const newCard = generateCardRewards(1, false)[0];
          setDeck((d) => [...d, newCard]);
        }
        if (eff.upgradeRandomCard) {
          setDeck((prev) => {
            const unup = prev.filter((c) => !c.upgraded);
            if (unup.length === 0) return prev;
            const pick = pickRandom(unup);
            return prev.map((c) =>
              c.instanceId === pick.instanceId ? { ...c, upgraded: true } : c
            );
          });
        }
        if (eff.gainRandomRelic) {
          const newRel = generateRelicRewards(relicIds, 1)[0];
          if (newRel) setRelicIds((ids) => [...ids, newRel.id]);
        }
        if (eff.removeRandomCard && deck.length > 5) {
          const pick = pickRandom(deck);
          setDeck((prev) => prev.filter((c) => c.instanceId !== pick.instanceId));
        }

        setEventOutcomeText(choice.outcomeText);
        resetTypingBuffer(true);
        return;
      }

      soundEngine.playError(settings);
      return;
    }

    // 13. GAME OVER / VICTORY REPORT CARD
    if (screen === 'game_over' || screen === 'victory') {
      if (matchCommand(raw, ['new run', 'restart', 'play again', 'again', 'start', 'menu'], 'easy')) {
        soundEngine.playConfirm(settings);
        triggerActionParticles(50, 75);
        setScreen('main_menu');
        resetTypingBuffer(true);
        return;
      }
      soundEngine.playError(settings);
    }
  }, [
    activeEvent,
    advanceToMapNextFloor,
    availableMapNodes,
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
    extraHardAvailable,
    gold,
    introStep,
    isAnimatingTurn,
    maxHp,
    overlay,
    phraseDiff,
    playerName,
    recordActionMetrics,
    relicIds,
    resetTypingBuffer,
    restoreFromSavePayload,
    rewardCards,
    rewardRelics,
    screen,
    selectedCard,
    settings,
    shopInventory,
    shopSubMode,
    spawnPopup,
    startNewRun,
    triggerActionParticles,
    tutorialStep,
    typedInput,
  ]);

  const handleEnterRef = useRef(handleEnterSubmit);
  useEffect(() => {
    handleEnterRef.current = handleEnterSubmit;
  }, [handleEnterSubmit]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (screen === 'map' && overlay === 'none') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.max(0, prev - 160));
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.min(4800, prev + 160));
          return;
        }
        if (e.key === 'PageUp') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.max(0, prev - 420));
          return;
        }
        if (e.key === 'PageDown') {
          e.preventDefault();
          setMapScrollOffset((prev) => Math.min(4800, prev + 420));
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
        soundEngine.playBackspace(settings);
        if (overlay !== 'none') {
          setOverlay('none');
          return;
        }
        if (selectedCard) {
          setSelectedCard(null);
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
  }, [actionStartTime, overlay, resetTypingBuffer, screen, selectedCard, settings]);

  const selectedCardResolved = useMemo(
    () => (selectedCard ? resolveCardInstance(selectedCard, phraseDiff) : null),
    [phraseDiff, selectedCard]
  );

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

  return (
    <div className={`typemancer-viewport ${settings.highContrast ? 'high-contrast' : ''}`}>
      {/* GLOBAL INK & PARCHMENT ACTION PARTICLE BURSTS */}
      <div className="particles-overlay-layer" aria-hidden="true">
        {particleBursts.map((burst) => (
          <div
            key={burst.id}
            className="particle-burst-origin"
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
          >
            {burst.particles.map((p, idx) => (
              <span
                key={idx}
                className="ink-particle-dot"
                style={
                  {
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

      {/* ==================== BATTLE SCENE ==================== */}
      {screen === 'battle' && (
        <div className="battle-layout">
          {/* LEFT COLUMN: Stacked Paper Card Banners */}
          <aside className="cards-column" aria-label="Player Hand">
            <div className="cards-stack">
              {handCandidates.map(({ item, resolved }, idx) => {
                const isSelected = selectedCard?.instanceId === item.instanceId;
                const isHighlighted = highlightedCardIds.has(item.instanceId);
                const isEnterReady = enterReadyCardId === item.instanceId;
                const canAfford = energy >= resolved.cost;
                return (
                  <CardBanner
                    key={item.instanceId}
                    instance={item}
                    phraseDiff={phraseDiff}
                    index={idx}
                    isHighlighted={isHighlighted}
                    isEnterCandidate={isEnterReady}
                    isSelected={isSelected}
                    isUnaffordable={!canAfford}
                  />
                );
              })}
            </div>
            <div className="cards-footer-box">
              <div className="cards-footer-title">cards ({hand.length})</div>
              <div className="cards-pile-counts">
                <span>Draw {drawPile.length}</span>
                <span>Discard {discardPile.length}</span>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN AREA */}
          <main className="battle-main">
            <header className="minimal-top-bar">
              {renderRelicIconsBar()}
              <div className="minimal-command-hint">
                type (end turn) (relics) (status effects) (help) (options)
              </div>
            </header>

            <section className="arena-stage">
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

              {/* Player Entity */}
              <div className="player-spot paper-sway-slow">
                <div className="entity-name-label">{playerName}</div>
                <div className="hp-bar-frame player-hp-bar">
                  <div
                    className="hp-bar-fill"
                    style={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}
                  />
                  <span className="hp-bar-text">
                    {hp}/{maxHp} {playerWard > 0 ? `(${playerWard})` : ''}
                  </span>
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
                  }}
                  width={112}
                  height={200}
                />
                <div className="status-pills-row">
                  {playerWard > 0 && <span className="status-pill ward-pill">Ward {playerWard}</span>}
                  {playerStatuses.bold > 0 && <span className="status-pill bold-pill">Bold +{playerStatuses.bold}</span>}
                  {playerStatuses.faded > 0 && <span className="status-pill faded-pill">Faded {playerStatuses.faded}</span>}
                  {playerStatuses.exposed > 0 && <span className="status-pill exposed-pill">Exposed {playerStatuses.exposed}</span>}
                  {playerStatuses.ink_burn > 0 && <span className="status-pill burn-pill">Ink Burn {playerStatuses.ink_burn}</span>}
                </div>
              </div>

              {/* Center Area: Single-Card Inspector */}
              <div className="arena-center-inspector">
                {inspectedCard && (
                  <div className="inspected-card-panel paper-sheet-float">
                    <div className="inspected-card-badge">
                      {inspectedCard.rarity.toUpperCase()} {inspectedCard.type.toUpperCase()} · {inspectedCard.cost} Energy
                    </div>
                    <h3 className="inspected-card-title">{inspectedCard.name}</h3>
                    <p className="inspected-card-desc">{inspectedCard.description}</p>
                    <div className="inspected-card-connector">
                      "{inspectedCard.name}" -{inspectedCard.connector}- ...
                    </div>
                    {inspectedCard.burnDraft && (
                      <div className="inspected-burn-tag">Burn Draft</div>
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
                      className={`enemy-spot enemy-slot-${index} ${
                        isTargetHighlighted ? 'enemy-spot-highlighted' : ''
                      } ${isTargetEnterReady ? 'enemy-spot-enter-ready' : ''}`}
                    >
                      <div className="entity-name-label enemy-name-label">{enemy.displayName}</div>
                      <div className="hp-bar-frame enemy-hp-bar">
                        <div
                          className="hp-bar-fill"
                          style={{
                            width: `${Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100))}%`,
                          }}
                        />
                        <span className="hp-bar-text">
                          {enemy.hp}/{enemy.maxHp} {enemy.ward > 0 ? `(${enemy.ward})` : ''}
                        </span>
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
                        width={68}
                        height={132}
                        isHighlighted={isTargetHighlighted || isTargetEnterReady}
                      />
                      <IntentBadge
                        intent={enemy.currentMove.intent}
                        damage={enemy.currentMove.damage}
                        hits={enemy.currentMove.hits}
                        ward={enemy.currentMove.ward}
                        heal={enemy.currentMove.heal}
                      />
                      <div className="status-pills-row">
                        {enemy.ward > 0 && <span className="status-pill ward-pill">Ward {enemy.ward}</span>}
                        {enemy.statuses.bold > 0 && <span className="status-pill bold-pill">Bold +{enemy.statuses.bold}</span>}
                        {enemy.statuses.faded > 0 && <span className="status-pill faded-pill">Faded {enemy.statuses.faded}</span>}
                        {enemy.statuses.exposed > 0 && <span className="status-pill exposed-pill">Exposed {enemy.statuses.exposed}</span>}
                        {enemy.statuses.ink_burn > 0 && <span className="status-pill burn-pill">Ink Burn {enemy.statuses.ink_burn}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* MIDDLE ROW: Energy Box + Area for Stats */}
            <section className="battle-stats-row">
              <div className="energy-box">
                <div className="energy-value">
                  {energy}/{maxEnergy}
                </div>
                <div className="energy-label">energy</div>
              </div>

              <div className="stats-area-box">
                <div className="stats-grid">
                  <div>
                    <strong>Ward:</strong> {playerWard}
                  </div>
                  <div>
                    <strong>Bold:</strong> {playerStatuses.bold}
                  </div>
                  <div>
                    <strong>Faded:</strong> {playerStatuses.faded}
                  </div>
                  <div>
                    <strong>Exposed:</strong> {playerStatuses.exposed}
                  </div>
                  <div>
                    <strong>Gold:</strong> {gold}g
                  </div>
                </div>

                {difficulty === 'extra_hard' && (
                  <div className="wpm-meter-container">
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
            </section>

            {/* BOTTOM ROW: Clean Typing Bar */}
            <section className="typing-console-box">
              <div className="typing-sentence-display">
                {selectedCardResolved ? (
                  <>
                    <span className="sentence-locked-card">"{selectedCardResolved.name}"</span>
                    <span className="sentence-connector"> -{selectedCardResolved.connector}- </span>
                    <span className="sentence-live-input">
                      {typedInput}
                      <span className="typing-caret">▋</span>
                    </span>
                  </>
                ) : (
                  <span className="sentence-live-input">
                    {typedInput}
                    <span className="typing-caret">▋</span>
                  </span>
                )}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ==================== NON-BATTLE SCREENS ==================== */}
      {screen !== 'battle' && (
        <div className={`narrative-screen-layout ${screen === 'map' ? 'map-fullscreen-mode' : ''}`}>
          {/* Minimal Floating Top Bar */}
          <header className="minimal-top-bar">
            {screen !== 'main_menu' && screen !== 'tutorial' && screen !== 'peasant_intro' ? (
              <div className="minimal-run-status">
                {renderRelicIconsBar()}
                <span className="minimal-stat-chip">HP {hp}/{maxHp}</span>
                <span className="minimal-stat-chip">Gold {gold}</span>
              </div>
            ) : (
              <div />
            )}
            <div className="minimal-command-hint">
              type (help) (options) (save) (relics) (view deck)
            </div>
          </header>

          {/* Main Content Stage */}
          <main className="narrative-stage">
            {/* 0. PAPER MAIN MENU WITH 2-TIER HIGHLIGHTING */}
            {screen === 'main_menu' && (
              <div className="clean-menu-card paper-sheet-float">
                <h1 className="clean-menu-title">TYPEMANCER</h1>
                <div className="clean-menu-options">
                  {(['new run', 'tutorial', 'load', 'options'] as const).map((opt, idx) => {
                    const st = getPhraseHighlightState(opt, 'easy');
                    return (
                      <div
                        key={opt}
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
            )}

            {/* 0.5 SHORT INTERACTIVE TUTORIAL */}
            {screen === 'tutorial' && (
              <div className="story-card paper-sheet-float">
                <h1 className="story-title">How to Play Typemancer</h1>
                {tutorialStep === 0 && (
                  <div className="prompt-panel">
                    <h2>Step 1 of 3 — Casting a Card</h2>
                    <p>
                      In Typemancer, your keyboard controls everything. Notice how options glow warm amber as you start typing, then turn <strong>emerald green and enlarge</strong> when pressing <code>Enter</code> will select them!
                    </p>
                    <p>Try selecting the basic attack card now by typing:</p>
                    {(() => {
                      const st = getPhraseHighlightState('strike', 'easy');
                      return (
                        <div
                          className={`choice-item ${st.isHighlighted ? 'option-highlighted' : ''} ${
                            st.isEnterReady ? 'option-enter-ready' : ''
                          }`}
                        >
                          <div className="phrase-to-type">strike</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {tutorialStep === 1 && (
                  <div className="prompt-panel">
                    <h2>Step 2 of 3 — Targeting an Enemy</h2>
                    <p>
                      Once a card is selected, the game fills in the middle connector of the sentence:
                      <em> "strike" -at- ...</em>
                    </p>
                    <p>Finish the sentence by typing the target enemy's name:</p>
                    {(() => {
                      const st = getPhraseHighlightState('goblin scout', 'easy');
                      return (
                        <div
                          className={`choice-item ${st.isHighlighted ? 'option-highlighted' : ''} ${
                            st.isEnterReady ? 'option-enter-ready' : ''
                          }`}
                        >
                          <div className="phrase-to-type">goblin scout</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {tutorialStep === 2 && (
                  <div className="prompt-panel">
                    <h2>Step 3 of 3 — Helpful Tips</h2>
                    <ul className="modal-list">
                      <li>Type <code>back</code> or <code>cancel</code> anytime to deselect a card.</li>
                      <li>Type an enemy's name or status effect name (like <code>ward</code> or <code>ink burn</code>) to inspect what it does.</li>
                      <li>Unsure what an English word means? Type the word followed by <code>?</code> (for example <code>pavilion?</code>) to look up its definition!</li>
                    </ul>
                    {(() => {
                      const st = getPhraseHighlightState('new run', 'easy');
                      return (
                        <div
                          className={`choice-item ${st.isHighlighted ? 'option-highlighted' : ''} ${
                            st.isEnterReady ? 'option-enter-ready' : ''
                          }`}
                        >
                          <div className="phrase-to-type">new run</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 1. OPENING SEQUENCE: THE PEASANT & THE TYPEWRITER */}
            {screen === 'peasant_intro' && (
              <div className="story-card paper-sheet-float">
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
            )}

            {/* 2. FULL-SCREEN SCROLLABLE 24-FLOOR PROCEDURAL MAP */}
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
              <div className="story-card paper-sheet-float">
                <h2 className="story-title">Rewards (+{rewardGoldClaimed} Gold) — or type (skip)</h2>
                {rewardCards.length > 0 && (
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
                )}

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
              </div>
            )}

            {/* 4. CAMPFIRE */}
            {screen === 'campfire' && (
              <div className="story-card paper-sheet-float">
                <h2 className="story-title">Campfire</h2>
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
                ) : (
                  <div className="deck-banner-grid">
                    {deck
                      .filter((c) => !c.upgraded)
                      .map((inst, idx) => {
                        const baseRes = resolveCardInstance(inst, phraseDiff);
                        const upRes = resolveCardInstance({ ...inst, upgraded: true }, phraseDiff);
                        const st = getPhraseHighlightState(baseRes.name, difficulty);
                        return (
                          <CardBanner
                            key={inst.instanceId}
                            instance={inst}
                            phraseDiff={phraseDiff}
                            index={idx}
                            isHighlighted={st.isHighlighted}
                            isEnterCandidate={st.isEnterReady}
                            subtitleOverride={`Upgrades to: ${upRes.name} (${upRes.description})`}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* 5. MERCHANT */}
            {screen === 'merchant' && shopInventory && (
              <div className="story-card paper-sheet-float">
                <h2 className="story-title">
                  Merchant ({gold} Gold) — type item name, (burn card [{shopInventory.removeServicePrice}g]), or (leave)
                </h2>
                {shopSubMode === 'browse' ? (
                  <>
                    <div className="deck-banner-grid">
                      {shopInventory.cards.map(({ instance, price, sold }, idx) => {
                        const res = resolveCardInstance(instance, phraseDiff);
                        const st = !sold
                          ? getPhraseHighlightState(res.name, difficulty)
                          : { isHighlighted: false, isEnterReady: false };
                        return (
                          <CardBanner
                            key={instance.instanceId}
                            instance={instance}
                            phraseDiff={phraseDiff}
                            index={idx}
                            isHighlighted={st.isHighlighted}
                            isEnterCandidate={st.isEnterReady}
                            isUnaffordable={sold || gold < price}
                            priceBadge={sold ? 'SOLD' : `${price}g`}
                          />
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
                    {deck.map((inst, idx) => {
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
            )}

            {/* 6. TREASURE VAULT */}
            {screen === 'treasure' && (
              <div className="story-card paper-sheet-float">
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
            )}

            {/* 7. MYSTERY ENCOUNTER */}
            {screen === 'mystery' && activeEvent && (
              <div className="story-card paper-sheet-float">
                <h2 className="story-title">{activeEvent.title}</h2>
                <p className="story-paragraph">{activeEvent.narrative}</p>
                {eventOutcomeText === null ? (
                  <div className="choice-list">
                    {activeEvent.choices.map((ch) => {
                      const phrase = ch.phrases[phraseDiff];
                      const st = getPhraseHighlightState(phrase, difficulty);
                      return (
                        <div
                          key={ch.id}
                          className={`choice-item ${
                            st.isHighlighted ? 'option-highlighted' : ''
                          } ${st.isEnterReady ? 'option-enter-ready' : ''}`}
                        >
                          <div className="phrase-to-type">{phrase}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="prompt-panel">
                    <p>{eventOutcomeText}</p>
                    <div className="phrase-to-type">continue</div>
                  </div>
                )}
              </div>
            )}

            {/* 8. END-OF-RUN TYPING & COMBAT REPORT CARD */}
            {(screen === 'game_over' || screen === 'victory') && (
              <div className="story-card report-card paper-sheet-float">
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
                      <li>Floor Reached: {currentFloor} / 24</li>
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
            )}
          </main>

          {/* Clean Bottom Typing Console */}
          <footer className="typing-console-box narrative-console">
            <div className="typing-sentence-display">
              <span className="sentence-live-input">
                {typedInput}
                <span className="typing-caret">▋</span>
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* ==================== KEYBOARD-CONTROLLED MODAL OVERLAYS ==================== */}
      {overlay !== 'none' && (
        <div className="keyboard-modal-backdrop">
          <div className="keyboard-modal-card paper-sheet-float">
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
                  <li><code>view deck</code> / <code>view discard</code> — View cards</li>
                  <li><code>options</code> / <code>save</code> — Audio settings or Save Code</li>
                </ul>
              </>
            )}

            {overlay === 'status_effects' && (
              <>
                <h2>Status Effects</h2>
                <div className="status-definitions-list">
                  {STATUS_DEFINITIONS.map((st) => (
                    <div
                      key={st.id}
                      className={`status-def-card ${
                        highlightedStatusId === st.id ? 'status-def-highlighted' : ''
                      }`}
                    >
                      <span className="status-pill" style={{ backgroundColor: st.color }}>
                        {st.name}
                      </span>
                      <p>{st.summary}</p>
                    </div>
                  ))}
                </div>
              </>
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
                          <strong>Faded ({playerStatuses.faded}):</strong> Attacks deal 25% less damage.
                        </li>
                      )}
                      {playerStatuses.exposed > 0 && (
                        <li>
                          <strong>Exposed ({playerStatuses.exposed}):</strong> Taking 50% more damage from attacks.
                        </li>
                      )}
                      {playerStatuses.ink_burn > 0 && (
                        <li>
                          <strong>Ink Burn ({playerStatuses.ink_burn}):</strong> Takes {playerStatuses.ink_burn} damage at turn end.
                        </li>
                      )}
                      {playerWard === 0 &&
                        playerStatuses.bold === 0 &&
                        playerStatuses.faded === 0 &&
                        playerStatuses.exposed === 0 &&
                        playerStatuses.ink_burn === 0 && <li>No active status effects.</li>}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h2>{inspectedEntity.displayName}</h2>
                    <p>
                      HP: {inspectedEntity.hp}/{inspectedEntity.maxHp} · Ward: {inspectedEntity.ward}
                    </p>
                    <div className="entity-intent-english-box">
                      <IntentBadge
                        intent={inspectedEntity.currentMove.intent}
                        damage={inspectedEntity.currentMove.damage}
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
                          <strong>Faded ({inspectedEntity.statuses.faded}):</strong> Deals 25% less attack damage ({inspectedEntity.statuses.faded} turns left).
                        </li>
                      )}
                      {inspectedEntity.statuses.exposed > 0 && (
                        <li>
                          <strong>Exposed ({inspectedEntity.statuses.exposed}):</strong> Takes 50% more attack damage ({inspectedEntity.statuses.exposed} turns left).
                        </li>
                      )}
                      {inspectedEntity.statuses.ink_burn > 0 && (
                        <li>
                          <strong>Ink Burn ({inspectedEntity.statuses.ink_burn}):</strong> Takes {inspectedEntity.statuses.ink_burn} damage at start of its turn, then decreases by 1.
                        </li>
                      )}
                      {inspectedEntity.ward === 0 &&
                        inspectedEntity.statuses.bold === 0 &&
                        inspectedEntity.statuses.faded === 0 &&
                        inspectedEntity.statuses.exposed === 0 &&
                        inspectedEntity.statuses.ink_burn === 0 && <li>No active status effects.</li>}
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
              <>
                <h2>Options</h2>
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
              </>
            )}

            {/* VIEW DECK / DISCARD / BURNED: Same size & format as Battle Side-Column Cards, with Rarity & Upgraded tags! */}
            {overlay === 'deck' && (
              <>
                <h2>Deck ({deck.length} Cards)</h2>
                <div className="deck-banner-grid">
                  {deck.map((inst, idx) => (
                    <CardBanner
                      key={inst.instanceId}
                      instance={inst}
                      phraseDiff={phraseDiff}
                      index={idx}
                    />
                  ))}
                </div>
              </>
            )}

            {overlay === 'discard' && (
              <>
                <h2>Discard Pile ({discardPile.length} Cards)</h2>
                <div className="deck-banner-grid">
                  {discardPile.map((inst, idx) => (
                    <CardBanner
                      key={inst.instanceId}
                      instance={inst}
                      phraseDiff={phraseDiff}
                      index={idx}
                    />
                  ))}
                </div>
              </>
            )}

            {overlay === 'burn_draft' && (
              <>
                <h2>Burned Drafts ({burnDraftPile.length} Cards)</h2>
                <div className="deck-banner-grid">
                  {burnDraftPile.map((inst, idx) => (
                    <CardBanner
                      key={inst.instanceId}
                      instance={inst}
                      phraseDiff={phraseDiff}
                      index={idx}
                    />
                  ))}
                </div>
              </>
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
              type (back){' '}
              <span className="sentence-live-input">
                {typedInput}
                <span className="typing-caret">▋</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
