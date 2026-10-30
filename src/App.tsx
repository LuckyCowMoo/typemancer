import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { EntitySprite, IntentBadge } from './components/EntitySprite';
import type {
  ActiveEnemy,
  CardEffect,
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
  calculateSpeedEffectiveness,
  calculateWpm,
  evaluateCandidates,
  getPhraseDifficulty,
  matchCommand,
  normalizeText,
} from './utils/typingEngine';

type GameScreen =
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
type ModalOverlay = 'none' | 'help' | 'options' | 'deck' | 'discard' | 'burn_draft' | 'relics' | 'save';

interface ShopInventory {
  cards: { instance: CardInstance; price: number; sold: boolean }[];
  relics: { relic: RelicDefinition; price: number; sold: boolean }[];
  removeServicePrice: number;
  removeUsed: boolean;
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

export function App() {
  // Settings & Overlay state
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [overlay, setOverlay] = useState<ModalOverlay>('none');
  const [extraHardAvailable, setExtraHardAvailable] = useState<boolean>(() => isExtraHardUnlocked());

  // Main Screen & Intro Flow
  const [screen, setScreen] = useState<GameScreen>('peasant_intro');
  const [introStep, setIntroStep] = useState<IntroStep>('ask_name');

  // Player & Run State
  const [playerName, setPlayerName] = useState<string>('Scribe');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const phraseDiff = useMemo(() => getPhraseDifficulty(difficulty), [difficulty]);

  const [hp, setHp] = useState<number>(75);
  const [maxHp, setMaxHp] = useState<number>(75);
  const [gold, setGold] = useState<number>(99);
  const [deck, setDeck] = useState<CardInstance[]>(() => createStarterDeck());
  const [relicIds, setRelicIds] = useState<string[]>(['magical_typewriter']);
  const [metrics, setMetrics] = useState<RunMetrics>(() => INITIAL_METRICS());

  // Map State (24 Floors)
  const [mapFloors, setMapFloors] = useState<MapNode[][]>(() => generateProceduralMap());
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [activeNodeType, setActiveNodeType] = useState<'battle' | 'elite' | 'boss'>('battle');

  // Combat State
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
  const [combatLog, setCombatLog] = useState<string>('Type the name of a card to begin casting!');

  // Non-Combat Encounter States
  const [rewardCards, setRewardCards] = useState<CardInstance[]>([]);
  const [rewardRelics, setRewardRelics] = useState<RelicDefinition[]>([]);
  const [rewardGoldClaimed, setRewardGoldClaimed] = useState<number>(0);
  const [campfireSubMode, setCampfireSubMode] = useState<'choose' | 'revise_select'>('choose');
  const [shopSubMode, setShopSubMode] = useState<'browse' | 'remove_select'>('browse');
  const [shopInventory, setShopInventory] = useState<ShopInventory | null>(null);
  const [activeEvent, setActiveEvent] = useState<MysteryEventDefinition | null>(null);
  const [eventOutcomeText, setEventOutcomeText] = useState<string | null>(null);

  // Typing Console & Forgiving WPM Timer State
  const [typedInput, setTypedInput] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<string>('');
  const [actionStartTime, setActionStartTime] = useState<number | null>(null);
  const [actionCharAccum, setActionCharAccum] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(40);

  // Tick live WPM meter while typing on Extra Hard (or for live display)
  useEffect(() => {
    if (!actionStartTime || typedInput.trim().length === 0) {
      setLiveWpm(40);
      return;
    }
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - actionStartTime;
      const totalChars = actionCharAccum + typedInput.trim().length;
      setLiveWpm(calculateWpm(totalChars, elapsed));
    }, 80);
    return () => window.clearInterval(interval);
  }, [actionStartTime, actionCharAccum, typedInput]);

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

  // Helper to record a completed typed phrase in student metrics
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

  // Draw cards helper
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

  // Start a Battle Encounter
  const startBattle = useCallback(
    (floorNum: number, nodeType: 'battle' | 'elite' | 'boss', currentDeck: CardInstance[], currentRelics: string[]) => {
      setActiveNodeType(nodeType);
      const spawnedEnemies = generateEncounter(floorNum, nodeType, phraseDiff);

      // Compute relic passive bonuses
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

      // Magical typewriter always grants +1 opening draw
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
      setCombatLog(
        `Floor ${floorNum} ${nodeType.toUpperCase()}: Type a card name on the left to cast, or type "end turn".`
      );
      resetTypingBuffer(true);
      setScreen('battle');
    },
    [drawCards, phraseDiff, resetTypingBuffer]
  );

  // Trigger Victory after defeating all enemies in a fight
  const handleCombatVictory = useCallback(
    (survivingHp: number) => {
      // Check Floor 24 Boss Victory!
      if (currentFloor >= 24 || activeNodeType === 'boss') {
        if (difficulty === 'hard' || difficulty === 'extra_hard') {
          setExtraHardUnlocked(true);
          setExtraHardAvailable(true);
        }
        clearLocalRun();
        setScreen('victory');
        setCombatLog('You shattered the Evil Wizard’s silence! Song and speech return to the realm!');
        return;
      }

      let healOnWin = 0;
      relicIds.forEach((id) => {
        const r = getRelicDefinition(id);
        if (r && r.trigger === 'combat_victory' && r.effectType === 'heal') {
          healOnWin += r.amount;
        }
      });

      const finalHp = Math.min(maxHp, survivingHp + healOnWin);
      setHp(finalHp);

      const goldEarned =
        activeNodeType === 'elite'
          ? 35 + Math.floor(Math.random() * 15)
          : 18 + Math.floor(Math.random() * 12);
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
      setFeedbackBanner(
        `Victory! Earned ${goldEarned} Gold${healOnWin > 0 ? ` and healed ${healOnWin} HP` : ''}. Choose 1 of 4 cards (or type "skip").`
      );
    },
    [activeNodeType, currentFloor, difficulty, maxHp, relicIds, resetTypingBuffer]
  );

  // Execute a selected card against a target (or self / all enemies)
  const executeCardPlay = useCallback(
    (cardInst: CardInstance, targetEnemy: ActiveEnemy | null, speedMult: number) => {
      const resolved = resolveCardInstance(cardInst, phraseDiff);
      if (energy < resolved.cost) {
        soundEngine.playError(settings);
        setFeedbackBanner(`Not enough Energy! Need ${resolved.cost} Energy (or type "end turn").`);
        return;
      }

      let nextEnergy = energy - resolved.cost;
      let nextWard = playerWard;
      let nextHp = hp;
      const nextPlayerStatuses = { ...playerStatuses };
      let nextEnemies = enemies.map((e) => ({
        ...e,
        statuses: { ...e.statuses },
      }));

      let totalDmgDealtThisCard = 0;
      let extraDraw = 0;

      const scaleAmount = (raw: number): number => {
        if (difficulty !== 'extra_hard') return raw;
        return Math.max(1, Math.round(raw * speedMult));
      };

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
      };

      resolved.effects.forEach((eff: CardEffect) => {
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
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'double_ward': {
            const gained = nextWard;
            nextWard += gained;
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'gain_ward_per_card_in_hand': {
            const gained = scaleAmount(eff.amount) * Math.max(0, hand.length - 1);
            nextWard += gained;
            setMetrics((m) => ({ ...m, totalWardGained: m.totalWardGained + gained }));
            break;
          }
          case 'bold': {
            nextPlayerStatuses.bold += scaleAmount(eff.amount);
            break;
          }
          case 'faded': {
            targetList.forEach((en) => {
              en.statuses.faded += scaleAmount(eff.amount);
            });
            break;
          }
          case 'exposed': {
            targetList.forEach((en) => {
              en.statuses.exposed += scaleAmount(eff.amount);
            });
            break;
          }
          case 'ink_burn': {
            targetList.forEach((en) => {
              en.statuses.ink_burn += scaleAmount(eff.amount);
            });
            break;
          }
          case 'double_ink_burn': {
            targetList.forEach((en) => {
              en.statuses.ink_burn *= 2;
            });
            break;
          }
          case 'draw': {
            extraDraw += eff.amount;
            break;
          }
          case 'energy': {
            nextEnergy += eff.amount;
            break;
          }
          case 'heal': {
            nextHp = Math.min(maxHp, nextHp + scaleAmount(eff.amount));
            break;
          }
          case 'self_damage': {
            nextHp = Math.max(1, nextHp - eff.amount);
            break;
          }
        }
      });

      // Check on_card_play or on_attack relics
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

      // Count defeated enemies
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

      // Move played card from hand to Discard or Burn Draft
      const remainingHand = hand.filter((c) => c.instanceId !== cardInst.instanceId);
      let nextDiscard = [...discardPile];
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
      setSelectedCard(null);
      resetTypingBuffer(true);

      setMetrics((prev) => ({
        ...prev,
        cardsPlayed: prev.cardsPlayed + 1,
        totalDamageDealt: prev.totalDamageDealt + totalDmgDealtThisCard,
        enemiesDefeated: prev.enemiesDefeated + killedCount,
      }));

      const speedNote =
        difficulty === 'extra_hard' ? ` (${Math.round(speedMult * 100)}% speed power!)` : '';
      setCombatLog(
        `Cast "${resolved.name}"${targetEnemy ? ` at ${targetEnemy.displayName}` : ''}${speedNote}!`
      );

      if (aliveEnemies.length === 0) {
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
      maxHp,
      phraseDiff,
      playerStatuses,
      playerWard,
      relicIds,
      resetTypingBuffer,
      settings,
    ]
  );

  // End Player Turn & Execute Enemy Intents
  const executeEndTurn = useCallback(() => {
    soundEngine.playConfirm(settings);

    let nextPlayerHp = hp;
    let nextPlayerWard = playerWard;
    const nextPlayerStats = { ...playerStatuses };

    // End of player turn relic triggers
    relicIds.forEach((rId) => {
      const rel = getRelicDefinition(rId);
      if (rel && rel.trigger === 'turn_end' && rel.effectType === 'ward') {
        nextPlayerWard += rel.amount;
      }
    });

    // Process each living enemy's turn (Ink Burn ticks first, then enemy executes move)
    let killedByInkBurn = 0;
    let totalBurnDamage = 0;
    const updatedEnemies: ActiveEnemy[] = [];

    for (const enemy of enemies) {
      const en = { ...enemy, statuses: { ...enemy.statuses } };

      // 1. Tick Ink Burn at start of enemy turn
      if (en.statuses.ink_burn > 0) {
        const burnDmg = en.statuses.ink_burn;
        en.hp = Math.max(0, en.hp - burnDmg);
        totalBurnDamage += burnDmg;
        en.statuses.ink_burn = Math.max(0, en.statuses.ink_burn - 1);
      }

      if (en.hp <= 0) {
        killedByInkBurn += 1;
        continue;
      }

      // Reset enemy Ward at start of its action
      en.ward = 0;

      // 2. Execute Enemy Move
      const move = en.currentMove;
      if (move.damage && move.damage > 0) {
        const hits = move.hits || 1;
        for (let h = 0; h < hits; h++) {
          let dmg = move.damage + en.statuses.bold;
          if (en.statuses.faded > 0) dmg = Math.floor(dmg * 0.75);
          if (nextPlayerStats.exposed > 0) dmg = Math.floor(dmg * 1.5);
          dmg = Math.max(0, dmg);

          const blocked = Math.min(nextPlayerWard, dmg);
          nextPlayerWard -= blocked;
          const unblocked = dmg - blocked;
          nextPlayerHp = Math.max(0, nextPlayerHp - unblocked);
          if (unblocked > 0) {
            setMetrics((m) => ({ ...m, totalDamageTaken: m.totalDamageTaken + unblocked }));
          }
        }
      }

      if (move.ward && move.ward > 0) {
        en.ward += move.ward;
      }

      if (move.heal && move.heal > 0) {
        en.hp = Math.min(en.maxHp, en.hp + move.heal);
      }

      if (move.statusEffects) {
        move.statusEffects.forEach((se) => {
          if (se.target === 'player') {
            nextPlayerStats[se.status] += se.amount;
          } else if (se.target === 'self') {
            en.statuses[se.status] += se.amount;
          }
        });
      }

      // Decrement enemy temporary debuffs (Faded & Exposed)
      if (en.statuses.faded > 0) en.statuses.faded -= 1;
      if (en.statuses.exposed > 0) en.statuses.exposed -= 1;

      // Pick next move
      const def = ENEMIES_CATALOG.find((d) => d.id === en.enemyId);
      en.currentMove = def ? chooseEnemyMove(def.moves) : en.currentMove;
      updatedEnemies.push(en);
    }

    // Apply any enemy "all_allies" Bold buffs
    enemies.forEach((e) => {
      if (e.hp > 0 && e.currentMove.statusEffects) {
        e.currentMove.statusEffects.forEach((se) => {
          if (se.target === 'all_allies') {
            updatedEnemies.forEach((ally) => {
              ally.statuses[se.status] += se.amount;
            });
          }
        });
      }
    });

    if (killedByInkBurn > 0 || totalBurnDamage > 0) {
      setMetrics((m) => ({
        ...m,
        totalDamageDealt: m.totalDamageDealt + totalBurnDamage,
        enemiesDefeated: m.enemiesDefeated + killedByInkBurn,
      }));
    }

    // Check if all enemies died from Ink Burn!
    if (updatedEnemies.length === 0) {
      setHp(nextPlayerHp);
      handleCombatVictory(nextPlayerHp);
      return;
    }

    // Check Player Ink Burn & Defeat
    if (nextPlayerStats.ink_burn > 0) {
      nextPlayerHp = Math.max(0, nextPlayerHp - nextPlayerStats.ink_burn);
      nextPlayerStats.ink_burn -= 1;
    }

    if (nextPlayerHp <= 0) {
      setHp(0);
      clearLocalRun();
      setScreen('game_over');
      setCombatLog('Your typewriter falls silent... You were defeated on Floor ' + currentFloor + '.');
      return;
    }

    // Decrement player temporary debuffs at start of new turn
    if (nextPlayerStats.faded > 0) nextPlayerStats.faded -= 1;
    if (nextPlayerStats.exposed > 0) nextPlayerStats.exposed -= 1;

    // Start of new player turn: reset Ward (unless a relic retains or grants Ward)
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
    setEnemies(updatedEnemies);
    setSelectedCard(null);
    resetTypingBuffer(true);
    setCombatLog('Your turn begins! Energy refilled and 5 fresh pages drawn.');
  }, [
    currentFloor,
    discardPile,
    drawCards,
    drawPile,
    enemies,
    hand,
    handleCombatVictory,
    hp,
    maxEnergy,
    playerStatuses,
    playerWard,
    relicIds,
    resetTypingBuffer,
    settings,
  ]);

  // Enter a chosen Map Node
  const enterMapNode = useCallback(
    (node: MapNode) => {
      setCurrentNodeId(node.id);
      setMapFloors((prev) =>
        prev.map((row) =>
          row.map((n) => (n.id === node.id ? { ...n, completed: true } : n))
        )
      );

      // Auto-save run state to localStorage on every floor transition
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
        setFeedbackBanner('Warm Campfire: Type "rest" to heal 30% HP, or type "revise" / "edit" to upgrade a card.');
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
        setFeedbackBanner('The Arcane Bookshop: Type an item name to purchase it, "burn card" to remove a card, or "leave" to continue.');
        return;
      }

      if (node.type === 'treasure') {
        setRewardRelics(generateRelicRewards(relicIds, 3));
        resetTypingBuffer(true);
        setScreen('treasure');
        setFeedbackBanner('Ancient Relic Vault: Type the name of 1 of the 3 relics to claim it, or type "skip".');
        return;
      }

      if (node.type === 'mystery') {
        const ev = pickRandom(EVENTS_CATALOG);
        setActiveEvent(ev);
        setEventOutcomeText(null);
        resetTypingBuffer(true);
        setScreen('mystery');
        setFeedbackBanner('Mystery Encounter: Type your chosen action below and press Enter.');
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
    ]
  );

  // Advance to the next floor on the map
  const advanceToMapNextFloor = useCallback(() => {
    const nextF = Math.min(24, currentFloor + 1);
    setCurrentFloor(nextF);
    resetTypingBuffer(true);
    setScreen('map');
    setFeedbackBanner(`Floor ${nextF} of 24: Type the path phrase for your chosen destination.`);
  }, [currentFloor, resetTypingBuffer]);

  // Available map nodes for the current floor
  const availableMapNodes = useMemo(() => {
    const floorRow = mapFloors[currentFloor - 1] || [];
    if (currentFloor === 1 || !currentNodeId) return floorRow;
    const prevRow = mapFloors[currentFloor - 2] || [];
    const prevNode = prevRow.find((n) => n.id === currentNodeId);
    if (!prevNode || prevNode.nextNodeIds.length === 0) return floorRow;
    const connected = floorRow.filter((n) => prevNode.nextNodeIds.includes(n.id));
    return connected.length > 0 ? connected : floorRow;
  }, [currentFloor, currentNodeId, mapFloors]);

  // Live candidate evaluation for Battle Cards & Targets
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

  const highlightedCardIds = useMemo(() => {
    if (!typedInput.trim() || selectedCard) return new Set<string>();
    const matches = evaluatedHand.filter((m) => m.isPrefixMatch);
    return new Set(matches.map((m) => m.item.item.instanceId));
  }, [evaluatedHand, selectedCard, typedInput]);

  // When narrowed down to 1 card (or top match while typing), inspect that card!
  const inspectedCard = useMemo(() => {
    if (selectedCard) {
      return resolveCardInstance(selectedCard, phraseDiff);
    }
    if (!typedInput.trim()) return null;
    const prefixMatches = evaluatedHand.filter((m) => m.isPrefixMatch);
    if (prefixMatches.length === 1) {
      return prefixMatches[0].item.resolved;
    }
    if (prefixMatches.length > 1 && prefixMatches[0].isValidConfirm) {
      return prefixMatches[0].item.resolved;
    }
    return null;
  }, [evaluatedHand, phraseDiff, selectedCard, typedInput]);

  // Live candidate evaluation for Enemy Targets when a single-enemy card is selected
  const evaluatedEnemies = useMemo(() => {
    if (screen !== 'battle' || !selectedCard) return [];
    const resolved = resolveCardInstance(selectedCard, phraseDiff);
    if (resolved.target !== 'enemy') return [];
    return evaluateCandidates(
      typedInput,
      enemies.map((e) => ({ item: e, phrase: e.displayName })),
      difficulty
    );
  }, [difficulty, enemies, phraseDiff, screen, selectedCard, typedInput]);

  const highlightedEnemyIds = useMemo(() => {
    if (!selectedCard || !typedInput.trim()) return new Set<string>();
    const matches = evaluatedEnemies.filter((m) => m.isPrefixMatch);
    return new Set(matches.map((m) => m.item.instanceId));
  }, [evaluatedEnemies, selectedCard, typedInput]);

  // Start a fresh new run
  const startNewRun = useCallback(
    (chosenName: string, chosenDiff: Difficulty) => {
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
      setFeedbackBanner(
        `Welcome, ${chosenName}! Floor 1 of 24: Type a path below to begin your ascent toward the Wizard's Tower.`
      );
    },
    [resetTypingBuffer]
  );

  // Load a saved run from a Save Code
  const restoreFromSavePayload = useCallback(
    (rawCode: string): boolean => {
      const payload = decodeSaveCode(rawCode);
      if (!payload) return false;

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
      setFeedbackBanner(`Save Code Loaded! Welcome back, ${payload.name} (Floor ${payload.floor}).`);
      return true;
    },
    [resetTypingBuffer]
  );

  // Handle pressing Enter on any screen
  const handleEnterSubmit = useCallback(() => {
    const raw = typedInput.trim();
    const norm = normalizeText(raw);

    // 1. Check Modal Overlay Commands first
    if (overlay !== 'none') {
      if (
        !raw ||
        matchCommand(raw, ['back', 'return', 'close', 'exit', 'cancel', 'resume', 'done'], 'easy')
      ) {
        soundEngine.playConfirm(settings);
        setOverlay('none');
        resetTypingBuffer(false);
        return;
      }

      if (overlay === 'options') {
        if (matchCommand(raw, ['mute', 'unmute', 'toggle mute'], 'easy')) {
          setSettings((s) => ({ ...s, muted: !s.muted }));
          soundEngine.playConfirm(settings);
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['typewriter', 'mechanical typewriter'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'mechanical_typewriter' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'mechanical_typewriter' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['telegraph', 'vintage telegraph'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'vintage_telegraph' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'vintage_telegraph' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['quill', 'arcane quill'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'arcane_quill' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'arcane_quill' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['chalk', 'soft chalk'], 'easy')) {
          setSettings((s) => ({ ...s, typingSound: 'soft_chalk' }));
          soundEngine.playConfirm({ ...settings, typingSound: 'soft_chalk' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['bell', 'carriage bell'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'carriage_bell' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'carriage_bell' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['chime', 'spell chime'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'spell_chime' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'spell_chime' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['stamp', 'heavy stamp'], 'easy')) {
          setSettings((s) => ({ ...s, confirmSound: 'heavy_stamp' }));
          soundEngine.playConfirm({ ...settings, confirmSound: 'heavy_stamp' });
          resetTypingBuffer(false);
          return;
        }
        if (matchCommand(raw, ['contrast', 'high contrast'], 'easy')) {
          setSettings((s) => ({ ...s, highContrast: !s.highContrast }));
          soundEngine.playConfirm(settings);
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
      setFeedbackBanner('Type "back" or "close" (or press Enter on empty input) to return.');
      resetTypingBuffer(false);
      return;
    }

    // 2. Universal Meta-Commands across all screens
    if (matchCommand(raw, ['help', 'commands', 'what can i type'], 'easy')) {
      soundEngine.playConfirm(settings);
      setOverlay('help');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['options', 'settings', 'audio', 'sound'], 'easy')) {
      soundEngine.playConfirm(settings);
      setOverlay('options');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['mute'], 'easy')) {
      setSettings((s) => ({ ...s, muted: true }));
      setFeedbackBanner('Audio muted. Type "unmute" at any time to restore sound.');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['unmute'], 'easy')) {
      const next = { ...settings, muted: false };
      setSettings(next);
      soundEngine.playConfirm(next);
      setFeedbackBanner('Audio unmuted!');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view deck', 'deck', 'show deck'], 'easy') && screen !== 'peasant_intro') {
      soundEngine.playConfirm(settings);
      setOverlay('deck');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view discard', 'discard', 'discard pile'], 'easy') && screen === 'battle') {
      soundEngine.playConfirm(settings);
      setOverlay('discard');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view burn', 'burn draft', 'burned'], 'easy') && screen === 'battle') {
      soundEngine.playConfirm(settings);
      setOverlay('burn_draft');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['view relics', 'relics', 'inspect relics'], 'easy') && screen !== 'peasant_intro') {
      soundEngine.playConfirm(settings);
      setOverlay('relics');
      resetTypingBuffer(false);
      return;
    }
    if (matchCommand(raw, ['save', 'save code', 'export save', 'load'], 'easy')) {
      soundEngine.playConfirm(settings);
      setOverlay('save');
      resetTypingBuffer(false);
      return;
    }

    // 3. Screen-Specific Logic: PEASANT OPENING SEQUENCE
    if (screen === 'peasant_intro') {
      if (introStep === 'ask_name') {
        if (matchCommand(raw, ['load', 'load save', 'continue'], 'easy')) {
          const localSave = loadRunFromLocal();
          if (localSave) {
            soundEngine.playConfirm(settings);
            const localCode = localStorage.getItem('typemancer_save_v1') || '';
            restoreFromSavePayload(localCode);
            return;
          }
          setIntroStep('load_save');
          resetTypingBuffer(true);
          return;
        }
        if (raw.toUpperCase().startsWith('TM1-') && restoreFromSavePayload(raw)) {
          soundEngine.playConfirm(settings);
          return;
        }
        if (raw.length < 1) {
          soundEngine.playError(settings);
          setFeedbackBanner('Please type your name and press Enter!');
          return;
        }
        soundEngine.playConfirm(settings);
        setPlayerName(raw.slice(0, 28));
        setIntroStep('ask_difficulty');
        resetTypingBuffer(true);
        return;
      }

      if (introStep === 'load_save') {
        if (matchCommand(raw, ['back', 'return', 'cancel'], 'easy')) {
          setIntroStep('ask_name');
          resetTypingBuffer(true);
          return;
        }
        if (restoreFromSavePayload(raw)) {
          soundEngine.playConfirm(settings);
          return;
        }
        soundEngine.playError(settings);
        setFeedbackBanner('Invalid Save Code! Paste or type your TM1-... code, or type "back".');
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
        setFeedbackBanner('The peasant tilts their head. Type one of the difficulty phrases shown above!');
        return;
      }
    }

    // 4. Screen-Specific Logic: MAP
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
      setFeedbackBanner('Could not match that path! Type one of the highlighted route phrases above.');
      return;
    }

    // 5. Screen-Specific Logic: BATTLE
    if (screen === 'battle') {
      // Allow deselecting a card at any time by typing back / return / cancel / deselect
      if (
        selectedCard &&
        matchCommand(raw, ['back', 'return', 'cancel', 'deselect', 'abort'], 'easy')
      ) {
        soundEngine.playBackspace(settings);
        setSelectedCard(null);
        resetTypingBuffer(true);
        setCombatLog('Card deselected. Timer reset—type a card name to cast!');
        return;
      }

      if (matchCommand(raw, ['end turn', 'pass turn', 'finish turn', 'end'], difficulty)) {
        executeEndTurn();
        return;
      }

      // STEP 1: Selecting a card from hand
      if (!selectedCard) {
        const bestCard = evaluatedHand[0];
        if (bestCard && bestCard.isValidConfirm) {
          const chosenInst = bestCard.item.item;
          const resolved = bestCard.item.resolved;

          if (energy < resolved.cost) {
            soundEngine.playError(settings);
            setFeedbackBanner(
              `"${resolved.name}" costs ${resolved.cost} Energy, but you only have ${energy} Energy! Type another card or "end turn".`
            );
            resetTypingBuffer(true);
            return;
          }

          soundEngine.playConfirm(settings);
          setSelectedCard(chosenInst);
          // Accumulate the characters typed for Step 1 so the total action WPM covers the full sentence
          setActionCharAccum((prev) => prev + resolved.name.length);
          setTypedInput('');
          if (resolved.target === 'enemy') {
            setCombatLog(
              `Selected "${resolved.name}" -${resolved.connector}- ... Now type the target enemy's name (or "back" to cancel)!`
            );
          } else {
            setCombatLog(
              `Ready: "${resolved.name} ${resolved.connector}". Press Enter again to confirm, or type "back" / "cancel"!`
            );
          }
          return;
        }

        soundEngine.playError(settings);
        setFeedbackBanner(
          'No matching card in hand! Type a card name from the left column, or type "end turn".'
        );
        return;
      }

      // STEP 2: Card is already selected -> confirm self/all_enemies on Enter, or match target enemy name
      const resolvedSelected = resolveCardInstance(selectedCard, phraseDiff);
      if (resolvedSelected.target === 'self' || resolvedSelected.target === 'all_enemies') {
        if (!norm || matchCommand(raw, ['confirm', 'cast', 'yes', resolvedSelected.connector], 'easy')) {
          soundEngine.playConfirm(settings);
          const speedMult = recordActionMetrics('', 0);
          executeCardPlay(selectedCard, null, speedMult);
          return;
        }
        soundEngine.playError(settings);
        setFeedbackBanner('Press Enter with an empty box to confirm casting, or type "back" / "cancel".');
        return;
      }

      // Single-enemy targeted card: match enemy name
      const bestEnemy = evaluatedEnemies[0];
      if (bestEnemy && bestEnemy.isValidConfirm) {
        soundEngine.playConfirm(settings);
        const speedMult = recordActionMetrics(bestEnemy.phrase, bestEnemy.distance);
        executeCardPlay(selectedCard, bestEnemy.item, speedMult);
        return;
      }

      soundEngine.playError(settings);
      setFeedbackBanner(
        'Could not match that enemy target! Type one of the living enemy names on the right, or type "back" to deselect.'
      );
      return;
    }

    // 6. Screen-Specific Logic: POST-BATTLE REWARD (1 of 4 Cards + 1 of 3 Relics on Elites)
    if (screen === 'reward') {
      if (matchCommand(raw, ['skip', 'continue', 'next', 'leave', 'pass'], 'easy')) {
        soundEngine.playConfirm(settings);
        advanceToMapNextFloor();
        return;
      }

      // Check card reward match
      if (rewardCards.length > 0) {
        const cardCands = rewardCards.map((c) => {
          const res = resolveCardInstance(c, phraseDiff);
          return { item: c, phrase: res.name };
        });
        const evalCards = evaluateCandidates(raw, cardCands, difficulty);
        if (evalCards[0] && evalCards[0].isValidConfirm) {
          soundEngine.playConfirm(settings);
          const picked = evalCards[0].item;
          const pickedName = resolveCardInstance(picked, phraseDiff).name;
          setDeck((d) => [...d, picked]);
          setRewardCards([]);
          resetTypingBuffer(true);
          if (rewardRelics.length === 0) {
            advanceToMapNextFloor();
          } else {
            setFeedbackBanner(`Added "${pickedName}" to your deck! Now choose 1 of the 3 Elite Relics (or type "skip").`);
          }
          return;
        }
      }

      // Check relic reward match (if Elite fight)
      if (rewardRelics.length > 0) {
        const relicCands = rewardRelics.map((r) => ({
          item: r,
          phrase: r.names[phraseDiff],
        }));
        const evalRelics = evaluateCandidates(raw, relicCands, difficulty);
        if (evalRelics[0] && evalRelics[0].isValidConfirm) {
          soundEngine.playConfirm(settings);
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
          } else {
            setFeedbackBanner(`Claimed Relic "${pickedRelic.names[phraseDiff]}"! Now choose 1 of the 4 cards (or type "skip").`);
          }
          return;
        }
      }

      soundEngine.playError(settings);
      setFeedbackBanner('Type the name of a reward card/relic to claim it, or type "skip" to move on.');
      return;
    }

    // 7. Screen-Specific Logic: CAMPFIRE (Rest or Revise/Edit)
    if (screen === 'campfire') {
      if (campfireSubMode === 'choose') {
        if (matchCommand(raw, ['rest', 'sleep', 'heal', 'rest by the fire'], difficulty)) {
          soundEngine.playConfirm(settings);
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
          setCampfireSubMode('revise_select');
          resetTypingBuffer(true);
          setFeedbackBanner('Type the name of an unrevised card from your deck below to upgrade it (or type "back").');
          return;
        }
        if (matchCommand(raw, ['skip', 'leave'], 'easy')) {
          soundEngine.playConfirm(settings);
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        setFeedbackBanner('Type "rest" to heal 30% HP, or type "revise" / "edit" to upgrade a card!');
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
        setFeedbackBanner('Could not match that card! Type the name of one of the unrevised cards shown, or "back".');
        return;
      }
    }

    // 8. Screen-Specific Logic: MERCHANT / BOOKSHOP
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
          const toRemove = evalRem[0].item;
          setDeck((prev) => prev.filter((c) => c.instanceId !== toRemove.instanceId));
          setGold((g) => g - shopInventory.removeServicePrice);
          setShopInventory({ ...shopInventory, removeUsed: true });
          setShopSubMode('browse');
          resetTypingBuffer(true);
          setFeedbackBanner('Card permanently burned from your deck! Type another item or "leave".');
          return;
        }
        soundEngine.playError(settings);
        setFeedbackBanner('Type the name of a card in your deck to remove it, or type "back".');
        return;
      }

      if (matchCommand(raw, ['leave', 'exit', 'continue', 'skip', 'back'], 'easy')) {
        soundEngine.playConfirm(settings);
        advanceToMapNextFloor();
        return;
      }

      if (matchCommand(raw, ['burn card', 'remove card', 'purge card', 'remove'], difficulty)) {
        if (shopInventory.removeUsed) {
          soundEngine.playError(settings);
          setFeedbackBanner('You already used the card removal service at this shop!');
          return;
        }
        if (gold < shopInventory.removeServicePrice) {
          soundEngine.playError(settings);
          setFeedbackBanner(`Not enough Gold! Card removal costs ${shopInventory.removeServicePrice} Gold.`);
          return;
        }
        soundEngine.playConfirm(settings);
        setShopSubMode('remove_select');
        resetTypingBuffer(true);
        setFeedbackBanner('Select a card from your deck to permanently burn (or type "back").');
        return;
      }

      // Check shop cards
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
          setFeedbackBanner(`Not enough Gold! Need ${entry.price} Gold.`);
          return;
        }
        soundEngine.playConfirm(settings);
        setGold((g) => g - entry.price);
        setDeck((d) => [...d, entry.instance]);
        setShopInventory({
          ...shopInventory,
          cards: shopInventory.cards.map((c) =>
            c.instance.instanceId === entry.instance.instanceId ? { ...c, sold: true } : c
          ),
        });
        resetTypingBuffer(true);
        setFeedbackBanner(`Purchased "${evalShopCards[0].phrase}"!`);
        return;
      }

      // Check shop relics
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
          setFeedbackBanner(`Not enough Gold! Need ${entry.price} Gold.`);
          return;
        }
        soundEngine.playConfirm(settings);
        setGold((g) => g - entry.price);
        setRelicIds((ids) => [...ids, entry.relic.id]);
        setShopInventory({
          ...shopInventory,
          relics: shopInventory.relics.map((r) =>
            r.relic.id === entry.relic.id ? { ...r, sold: true } : r
          ),
        });
        resetTypingBuffer(true);
        setFeedbackBanner(`Purchased Relic "${evalShopRelics[0].phrase}"!`);
        return;
      }

      soundEngine.playError(settings);
      setFeedbackBanner('Type the name of an item on sale, "burn card", or "leave".');
      return;
    }

    // 9. Screen-Specific Logic: TREASURE CHEST (1 of 3 Relics)
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
      setFeedbackBanner('Type the name of 1 of the 3 Relics to claim it, or type "skip".');
      return;
    }

    // 10. Screen-Specific Logic: MYSTERY ENCOUNTER (?)
    if (screen === 'mystery' && activeEvent) {
      if (eventOutcomeText !== null) {
        if (!norm || matchCommand(raw, ['continue', 'onward', 'next', 'leave'], 'easy')) {
          soundEngine.playConfirm(settings);
          advanceToMapNextFloor();
          return;
        }
        soundEngine.playError(settings);
        setFeedbackBanner('Press Enter or type "continue" to proceed to the next floor.');
        return;
      }

      const evalChoices = evaluateCandidates(
        raw,
        activeEvent.choices.map((ch) => ({ item: ch, phrase: ch.phrases[phraseDiff] })),
        difficulty
      );
      if (evalChoices[0] && evalChoices[0].isValidConfirm) {
        soundEngine.playConfirm(settings);
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
      setFeedbackBanner('Type one of the choice phrases listed above and press Enter!');
      return;
    }

    // 11. Screen-Specific Logic: GAME OVER / VICTORY REPORT CARD
    if (screen === 'game_over' || screen === 'victory') {
      if (matchCommand(raw, ['new run', 'restart', 'play again', 'again', 'start'], 'easy')) {
        soundEngine.playConfirm(settings);
        setIntroStep('ask_name');
        setScreen('peasant_intro');
        resetTypingBuffer(true);
        return;
      }
      soundEngine.playError(settings);
      setFeedbackBanner('Type "new run" or "play again" and press Enter to start a new quest!');
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
    startNewRun,
    typedInput,
  ]);

  // Global 100% Keyboard Listener (No Mouse Needed anywhere)
  const handleEnterRef = useRef(handleEnterSubmit);
  useEffect(() => {
    handleEnterRef.current = handleEnterSubmit;
  }, [handleEnterSubmit]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        // Allow Ctrl+V for pasting save codes if needed
        return;
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
          // Forgive initial typing if the user clears the input to rethink or re-type faster!
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
  }, [actionStartTime, overlay, resetTypingBuffer, selectedCard, settings]);

  // Render active sentence preview in the bottom typing bar
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

  return (
    <div className={`typemancer-viewport ${settings.highContrast ? 'high-contrast' : ''}`}>
      {/* ==================== BATTLE SCENE (Exact Layout from User Mockup) ==================== */}
      {screen === 'battle' && (
        <div className="battle-layout">
          {/* LEFT COLUMN: Stacked Card Banners */}
          <aside className="cards-column" aria-label="Player Hand">
            <div className="cards-stack">
              {handCandidates.map(({ item, phrase, resolved }, idx) => {
                const isSelected = selectedCard?.instanceId === item.instanceId;
                const isHighlighted = highlightedCardIds.has(item.instanceId) || isSelected;
                const canAfford = energy >= resolved.cost;
                return (
                  <div
                    key={item.instanceId}
                    className={`card-tab ${idx % 2 === 0 ? 'card-tab-light' : 'card-tab-dark'} ${
                      isHighlighted ? 'card-tab-highlighted' : ''
                    } ${isSelected ? 'card-tab-selected' : ''} ${!canAfford ? 'card-tab-unaffordable' : ''}`}
                  >
                    <div className="card-tab-header">
                      <span className="card-cost-pill">{resolved.cost}⚡</span>
                      <span className="card-tab-name">
                        {phrase}
                        {item.upgraded ? ' +' : ''}
                      </span>
                    </div>
                    <div className="card-tab-sub">{resolved.description}</div>
                  </div>
                );
              })}
            </div>
            <div className="cards-footer-box">
              <div className="cards-footer-title">cards ({hand.length})</div>
              <div className="cards-pile-counts">
                <span>Draw: {drawPile.length}</span>
                <span>Discard: {discardPile.length}</span>
                {burnDraftPile.length > 0 && <span>Burned: {burnDraftPile.length}</span>}
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN AREA: Arena + Energy/Stats + Typing Console */}
          <main className="battle-main">
            {/* Top Status Strip (Floor, Relics, Quick Command Hints) */}
            <header className="arena-top-bar">
              <div className="arena-floor-badge">
                Floor {currentFloor}/24 — {activeNodeType.toUpperCase()} ({difficulty.replace('_', ' ').toUpperCase()})
              </div>
              <div className="arena-relics-strip">
                {relicIds.map((rId) => {
                  const rel = getRelicDefinition(rId);
                  if (!rel) return null;
                  return (
                    <span key={rId} className="relic-chip">
                      ✒️ {rel.names.easy}
                    </span>
                  );
                })}
              </div>
              <div className="arena-hint-strip">
                Commands: <code>end turn</code> · <code>view deck</code> · <code>help</code> · <code>options</code>
              </div>
            </header>

            {/* ARENA: Player Capsule on Left, Inspected Card Popup in Center, Enemy Formation on Right */}
            <section className="arena-stage">
              {/* Player Entity */}
              <div className="player-spot">
                <div className="entity-name-label">{playerName}</div>
                <div className="hp-bar-frame player-hp-bar">
                  <div
                    className="hp-bar-fill"
                    style={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}
                  />
                  <span className="hp-bar-text">
                    {hp}/{maxHp} {playerWard > 0 ? `(🛡️${playerWard})` : ''}
                  </span>
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

              {/* Dynamic Card Inspector (Appears automatically when typing narrows down a card) */}
              <div className="arena-center-inspector">
                {inspectedCard ? (
                  <div className="inspected-card-panel">
                    <div className="inspected-card-badge">
                      {inspectedCard.rarity.toUpperCase()} {inspectedCard.type.toUpperCase()} · {inspectedCard.cost} Energy
                    </div>
                    <h3 className="inspected-card-title">{inspectedCard.name}</h3>
                    <p className="inspected-card-desc">{inspectedCard.description}</p>
                    <div className="inspected-card-connector">
                      Sentence: <em>"{inspectedCard.name}" -{inspectedCard.connector}- ...</em>
                    </div>
                    {inspectedCard.burnDraft && (
                      <div className="inspected-burn-tag">🔥 Burn Draft (Removed for rest of combat)</div>
                    )}
                  </div>
                ) : (
                  <div className="combat-log-callout">{combatLog}</div>
                )}
              </div>

              {/* Enemy Formation (Staggered layout matching the mockup) */}
              <div className="enemies-formation">
                {enemies.map((enemy, index) => {
                  const isTargetHighlighted = highlightedEnemyIds.has(enemy.instanceId);
                  return (
                    <div
                      key={enemy.instanceId}
                      className={`enemy-spot enemy-slot-${index} ${
                        isTargetHighlighted ? 'enemy-spot-highlighted' : ''
                      }`}
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
                          {enemy.hp}/{enemy.maxHp} {enemy.ward > 0 ? `(🛡️${enemy.ward})` : ''}
                        </span>
                      </div>
                      <EntitySprite
                        art={enemy.art}
                        width={68}
                        height={132}
                        isHighlighted={isTargetHighlighted}
                      />
                      <IntentBadge
                        intent={enemy.currentMove.intent}
                        damage={enemy.currentMove.damage}
                        hits={enemy.currentMove.hits}
                        ward={enemy.currentMove.ward}
                        heal={enemy.currentMove.heal}
                      />
                      <div className="status-pills-row">
                        {enemy.ward > 0 && <span className="status-pill ward-pill">🛡️{enemy.ward}</span>}
                        {enemy.statuses.bold > 0 && <span className="status-pill bold-pill">Bold +{enemy.statuses.bold}</span>}
                        {enemy.statuses.faded > 0 && <span className="status-pill faded-pill">Faded {enemy.statuses.faded}</span>}
                        {enemy.statuses.exposed > 0 && <span className="status-pill exposed-pill">Exposed {enemy.statuses.exposed}</span>}
                        {enemy.statuses.ink_burn > 0 && <span className="status-pill burn-pill">💧{enemy.statuses.ink_burn}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* MIDDLE ROW: Energy Box + Area for Stats ( + WPM Speed Gauge) */}
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
                    <strong>Gold:</strong> {gold}g
                  </div>
                  <div>
                    <strong>Avg WPM:</strong> {avgWpm || '—'}
                  </div>
                </div>

                {/* Linear Speed Effectiveness Meter (Always shown, with active scaling on Extra Hard) */}
                <div className="wpm-meter-container">
                  <div className="wpm-meter-labels">
                    <span>
                      Typing Speed: <strong>{liveWpm} WPM</strong>
                    </span>
                    <span>
                      Card Power:{' '}
                      <strong>
                        {difficulty === 'extra_hard'
                          ? `${liveEffectiveness.displayPercent}%`
                          : `100% (Live ${ Math.round(liveWpm * 2.5)}% on Extra Hard)`}
                      </strong>
                    </span>
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
                    <div className="wpm-cap-marker" style={{ left: '100%' }} title="40 WPM = 100% Power" />
                  </div>
                </div>
              </div>
            </section>

            {/* BOTTOM ROW: Dedicated Typing Bar matching Mockup */}
            <section className="typing-console-box">
              {feedbackBanner && <div className="typing-feedback-toast">{feedbackBanner}</div>}
              <div className="typing-sentence-display">
                {selectedCardResolved ? (
                  <>
                    <span className="sentence-locked-card">"{selectedCardResolved.name}"</span>
                    <span className="sentence-connector"> -{selectedCardResolved.connector}- </span>
                    {selectedCardResolved.target === 'enemy' ? (
                      <span className="sentence-live-input">
                        "{typedInput}
                        <span className="typing-caret">▋</span>"
                      </span>
                    ) : (
                      <span className="sentence-confirm-prompt">
                        [Press ENTER to cast, or type "{typedInput || 'back'}" to cancel]
                      </span>
                    )}
                  </>
                ) : (
                  <span className="sentence-live-input">
                    {typedInput ? (
                      <>
                        {typedInput}
                        <span className="typing-caret">▋</span>
                      </>
                    ) : (
                      <span className="typing-placeholder">
                        Area for typing — type a card name, "end turn", "view deck", or "help" and press Enter...
                      </span>
                    )}
                  </span>
                )}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ==================== NON-BATTLE SCREENS ==================== */}
      {screen !== 'battle' && (
        <div className="narrative-screen-layout">
          {/* Top Status Header */}
          <header className="narrative-header">
            <div className="narrative-brand">✒️ TYPEMANCER</div>
            {screen !== 'peasant_intro' && (
              <div className="narrative-stats-strip">
                <span>👤 {playerName}</span>
                <span>❤️ {hp}/{maxHp} HP</span>
                <span>💰 {gold} Gold</span>
                <span>🃏 {deck.length} Cards</span>
                <span>🏰 Floor {currentFloor}/24</span>
                <span>⌨️ Avg {avgWpm} WPM ({accuracyPercent}% Acc)</span>
              </div>
            )}
            <div className="narrative-help-hint">
              Type <code>help</code>, <code>options</code>, <code>save</code>, or <code>view deck</code> anytime
            </div>
          </header>

          {/* Main Content Stage */}
          <main className="narrative-stage">
            {/* 1. OPENING SEQUENCE: THE PEASANT & THE TYPEWRITER */}
            {screen === 'peasant_intro' && (
              <div className="story-card">
                <h1 className="story-title">The Curse of Silence & The Magical Typewriter</h1>
                <p className="story-paragraph">
                  In this dystopian world, an Evil Wizard has stolen the beauty of speech and song.
                  All must write to one another to do anything at all—until you unearth an ancient
                  magical relic: <strong>A TYPEWRITER!</strong>
                </p>
                <p className="story-paragraph">
                  Its brass keys let your words strike faster and stronger than anyone else alive.
                  Determined to free the world from eternal silence, you march toward the Wizard’s Tower.
                  At the edge of the Whispering Forest, a curious peasant spots your typewriter and steps forward.
                </p>

                {introStep === 'ask_name' && (
                  <div className="prompt-panel">
                    <h2>The Peasant Asks Your Name:</h2>
                    <p>
                      <em>"Stranger! With a relic like that, your name will echo across history. Who are you?"</em>
                    </p>
                    <div className="choice-list">
                      <div className="choice-item">
                        👉 <strong>Type your character's name</strong> for this run and press <code>Enter</code>.
                      </div>
                      <div className="choice-item">
                        💾 Or type <code>load</code> (or paste a <code>TM1-...</code> Save Code) to resume a saved run.
                      </div>
                    </div>
                  </div>
                )}

                {introStep === 'load_save' && (
                  <div className="prompt-panel">
                    <h2>Restore a Classroom Save Code:</h2>
                    <p>Type or paste your <code>TM1-...</code> Save Code below and press <code>Enter</code> (or type <code>back</code>).</p>
                  </div>
                )}

                {introStep === 'ask_difficulty' && (
                  <div className="prompt-panel">
                    <h2>"Greetings, {playerName}! How difficult do you expect this journey to be?"</h2>
                    <p>Type one of the exact difficulty phrases below and press <code>Enter</code> (or type <code>back</code>):</p>
                    <div className="choice-list">
                      <div className="choice-item">
                        🟢 <strong>Easy (1-Word Names & Forgiving Autocorrect):</strong>
                        <div className="phrase-to-type">"easy"</div>
                      </div>
                      <div className="choice-item">
                        🟡 <strong>Medium (2–3 Word Names & Moderate Autocorrect):</strong>
                        <div className="phrase-to-type">"a fair challenge"</div>
                      </div>
                      <div className="choice-item">
                        🔴 <strong>Hard (Full Evocative Clauses & Strict Precision):</strong>
                        <div className="phrase-to-type">"i expect this quest to be a grueling endeavour"</div>
                      </div>
                      <div className={`choice-item ${!extraHardAvailable ? 'choice-locked' : ''}`}>
                        ⚡ <strong>Extra Hard (Hard Sentences + Live WPM Speed Scaling: 40 WPM = 100%, 20 WPM = 50%):</strong>
                        {extraHardAvailable ? (
                          <div className="phrase-to-type">"my fingers move faster than lightning itself"</div>
                        ) : (
                          <div className="phrase-locked-note">
                            🔒 Locked — Beat Hard difficulty (or load an unlocked Save Code) to unlock!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. PROCEDURAL 24-FLOOR MAP */}
            {screen === 'map' && (
              <div className="story-card">
                <h1 className="story-title">
                  The Ascent to the Wizard's Tower — Floor {currentFloor} of 24
                </h1>
                <p className="story-paragraph">
                  Choose your path forward by typing its highlighted route phrase below and pressing <code>Enter</code>:
                </p>

                <div className="map-paths-grid">
                  {availableMapNodes.map((node) => {
                    const phrase = node.phrases[phraseDiff];
                    const evalMatch = evaluateCandidates(
                      typedInput,
                      [{ item: node, phrase }],
                      difficulty
                    )[0];
                    const isMatch = typedInput.trim().length > 0 && evalMatch?.isPrefixMatch;

                    return (
                      <div
                        key={node.id}
                        className={`map-path-card ${isMatch ? 'map-path-highlighted' : ''}`}
                      >
                        <div className="map-node-type-badge">{node.type.toUpperCase()}</div>
                        <div className="map-phrase-callout">"{phrase}"</div>
                        <div className="map-next-preview">
                          Leads to Floor {Math.min(24, currentFloor + 1)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mini Upcoming Floors Preview */}
                <div className="map-horizon-box">
                  <h4>Upcoming Floors Ahead:</h4>
                  <div className="map-horizon-list">
                    {mapFloors.slice(currentFloor, currentFloor + 4).map((row, idx) => (
                      <div key={idx} className="map-horizon-row">
                        <strong>Floor {currentFloor + idx + 1}:</strong>{' '}
                        {row.map((n) => n.type.toUpperCase()).join('  |  ')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. POST-BATTLE REWARDS (1 of 4 Cards + 1 of 3 Relics on Elites) */}
            {screen === 'reward' && (
              <div className="story-card">
                <h1 className="story-title">Spoils of Battle (+{rewardGoldClaimed} Gold)</h1>
                {rewardCards.length > 0 && (
                  <>
                    <h3>Choose 1 of 4 Cards to Add to Your Deck (or type "skip"):</h3>
                    <div className="reward-cards-grid">
                      {rewardCards.map((inst) => {
                        const res = resolveCardInstance(inst, phraseDiff);
                        return (
                          <div key={inst.instanceId} className="reward-card-box">
                            <div className="reward-card-top">
                              <span>{res.cost}⚡</span>
                              <span>{res.rarity.toUpperCase()}</span>
                            </div>
                            <div className="phrase-to-type">"{res.name}"</div>
                            <p>{res.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {rewardRelics.length > 0 && (
                  <>
                    <h3>Elite Trophy — Choose 1 of 3 Relics (or type "skip"):</h3>
                    <div className="reward-cards-grid">
                      {rewardRelics.map((rel) => (
                        <div key={rel.id} className="reward-card-box relic-reward-box">
                          <div className="phrase-to-type">"{rel.names[phraseDiff]}"</div>
                          <p>{rel.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 4. CAMPFIRE (Rest or Revise/Edit) */}
            {screen === 'campfire' && (
              <div className="story-card">
                <h1 className="story-title">🔥 A Sheltered Campfire</h1>
                {campfireSubMode === 'choose' ? (
                  <div className="choice-list">
                    <div className="choice-item">
                      💤 <strong>Rest by the Fire (Heal 30% Max HP):</strong>
                      <div className="phrase-to-type">"rest"</div>
                    </div>
                    <div className="choice-item">
                      ✒️ <strong>Revise & Edit a Page (Upgrade a Card in Your Deck):</strong>
                      <div className="phrase-to-type">"revise" (or "edit")</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3>Type the Name of a Card to Revise & Upgrade (or type "back"):</h3>
                    <div className="reward-cards-grid">
                      {deck
                        .filter((c) => !c.upgraded)
                        .map((inst) => {
                          const baseRes = resolveCardInstance(inst, phraseDiff);
                          const upRes = resolveCardInstance({ ...inst, upgraded: true }, phraseDiff);
                          return (
                            <div key={inst.instanceId} className="reward-card-box">
                              <div className="phrase-to-type">"{baseRes.name}"</div>
                              <p>
                                <strong>Upgrades to:</strong> "{upRes.name}" ({upRes.description})
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. MERCHANT / BOOKSHOP */}
            {screen === 'merchant' && shopInventory && (
              <div className="story-card">
                <h1 className="story-title">📚 The Wandering Scribe's Bookshop (Gold: {gold}g)</h1>
                {shopSubMode === 'browse' ? (
                  <>
                    <h3>Pages for Sale (Type name to buy, "burn card" [{shopInventory.removeServicePrice}g], or "leave"):</h3>
                    <div className="reward-cards-grid">
                      {shopInventory.cards.map(({ instance, price, sold }) => {
                        const res = resolveCardInstance(instance, phraseDiff);
                        return (
                          <div
                            key={instance.instanceId}
                            className={`reward-card-box ${sold ? 'choice-locked' : ''}`}
                          >
                            <div className="reward-card-top">
                              <span>{res.cost}⚡</span>
                              <span>💰 {sold ? 'SOLD' : `${price}g`}</span>
                            </div>
                            <div className="phrase-to-type">"{res.name}"</div>
                            <p>{res.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    <h3>Arcane Relics for Sale:</h3>
                    <div className="reward-cards-grid">
                      {shopInventory.relics.map(({ relic, price, sold }) => (
                        <div
                          key={relic.id}
                          className={`reward-card-box ${sold ? 'choice-locked' : ''}`}
                        >
                          <div className="reward-card-top">
                            <span>RELIC</span>
                            <span>💰 {sold ? 'SOLD' : `${price}g`}</span>
                          </div>
                          <div className="phrase-to-type">"{relic.names[phraseDiff]}"</div>
                          <p>{relic.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <h3>Type a Card Name to Burn from Your Deck ({shopInventory.removeServicePrice}g) or type "back":</h3>
                    <div className="reward-cards-grid">
                      {deck.map((inst) => {
                        const res = resolveCardInstance(inst, phraseDiff);
                        return (
                          <div key={inst.instanceId} className="reward-card-box">
                            <div className="phrase-to-type">"{res.name}"</div>
                            <p>{res.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. TREASURE VAULT */}
            {screen === 'treasure' && (
              <div className="story-card">
                <h1 className="story-title">💎 Ancient Relic Vault</h1>
                <p className="story-paragraph">
                  Inside the stone chest rest three humming artifacts. Type the name of <strong>1 of the 3 relics</strong> to claim it, or type <code>skip</code>:
                </p>
                <div className="reward-cards-grid">
                  {rewardRelics.map((rel) => (
                    <div key={rel.id} className="reward-card-box">
                      <div className="phrase-to-type">"{rel.names[phraseDiff]}"</div>
                      <p>{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. MYSTERY ENCOUNTER (?) */}
            {screen === 'mystery' && activeEvent && (
              <div className="story-card">
                <h1 className="story-title">❓ {activeEvent.title}</h1>
                <p className="story-paragraph">{activeEvent.narrative}</p>
                {eventOutcomeText === null ? (
                  <div className="choice-list">
                    {activeEvent.choices.map((ch) => (
                      <div key={ch.id} className="choice-item">
                        <div className="phrase-to-type">"{ch.phrases[phraseDiff]}"</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prompt-panel">
                    <h3>Outcome:</h3>
                    <p>{eventOutcomeText}</p>
                    <div className="phrase-to-type">Press Enter or type "continue"</div>
                  </div>
                )}
              </div>
            )}

            {/* 8. END-OF-RUN TYPING & COMBAT REPORT CARD */}
            {(screen === 'game_over' || screen === 'victory') && (
              <div className="story-card report-card">
                <h1 className="story-title">
                  {screen === 'victory'
                    ? '🏆 VICTORY! The Wizard’s Silence is Broken!'
                    : '📜 Run Concluded — Typemancer Report Card'}
                </h1>
                <p className="story-paragraph">{combatLog}</p>

                <div className="report-columns">
                  <div className="report-box">
                    <h3>⌨️ Typing Performance</h3>
                    <ul>
                      <li>
                        <strong>Average Typing Speed:</strong> {avgWpm} WPM
                      </li>
                      <li>
                        <strong>Peak Typing Speed:</strong> {metrics.peakWpm} WPM
                      </li>
                      <li>
                        <strong>Typing Accuracy:</strong> {accuracyPercent}%
                      </li>
                      <li>
                        <strong>Total Characters Typed:</strong> {metrics.totalCharsTyped}
                      </li>
                      <li>
                        <strong>Actions Executed:</strong> {metrics.totalActionsSubmitted}
                      </li>
                    </ul>
                  </div>

                  <div className="report-box">
                    <h3>⚔️ Combat & Quest Performance</h3>
                    <ul>
                      <li>
                        <strong>Difficulty:</strong> {difficulty.replace('_', ' ').toUpperCase()}
                      </li>
                      <li>
                        <strong>Floor Reached:</strong> {currentFloor} / 24
                      </li>
                      <li>
                        <strong>Total Damage Dealt:</strong> {metrics.totalDamageDealt}
                      </li>
                      <li>
                        <strong>Total Ward Gained:</strong> {metrics.totalWardGained}
                      </li>
                      <li>
                        <strong>Enemies Defeated:</strong> {metrics.enemiesDefeated}
                      </li>
                      <li>
                        <strong>Cards Cast:</strong> {metrics.cardsPlayed}
                      </li>
                      <li>
                        <strong>Run Duration:</strong>{' '}
                        {Math.max(1, Math.floor((Date.now() - metrics.startTimeMs) / 1000))}s
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="save-code-box">
                  <strong>Classroom Progress & Unlock Code:</strong>
                  <code className="save-code-string">{currentSaveCode}</code>
                </div>

                <div className="phrase-to-type">
                  Type "new run" or "play again" and press Enter!
                </div>
              </div>
            )}
          </main>

          {/* Bottom Dedicated Typing Console */}
          <footer className="typing-console-box narrative-console">
            {feedbackBanner && <div className="typing-feedback-toast">{feedbackBanner}</div>}
            <div className="typing-sentence-display">
              <span className="sentence-live-input">
                {typedInput ? (
                  <>
                    {typedInput}
                    <span className="typing-caret">▋</span>
                  </>
                ) : (
                  <span className="typing-placeholder">
                    Area for typing — type your command or phrase and press Enter...
                  </span>
                )}
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* ==================== KEYBOARD-CONTROLLED MODAL OVERLAYS ==================== */}
      {overlay !== 'none' && (
        <div className="keyboard-modal-backdrop">
          <div className="keyboard-modal-card">
            {overlay === 'help' && (
              <>
                <h2>⌨️ Typemancer — Universal Commands</h2>
                <p>Everything in Typemancer is controlled by typing and pressing <code>Enter</code>:</p>
                <ul className="modal-list">
                  <li><code>back</code> / <code>return</code> / <code>cancel</code> / <code>deselect</code> — Cancel a selected card or close a menu</li>
                  <li><code>end turn</code> — Finish your turn during battle</li>
                  <li><code>view deck</code> — Inspect all cards currently in your deck</li>
                  <li><code>view discard</code> / <code>view burn</code> — Inspect your discard or burned piles in battle</li>
                  <li><code>view relics</code> — Inspect all relics you have collected</li>
                  <li><code>options</code> — Change typewriter sound effects, confirm bells, mute, or high contrast</li>
                  <li><code>save</code> — View or load your classroom <code>TM1-...</code> Save Code</li>
                </ul>
              </>
            )}

            {overlay === 'options' && (
              <>
                <h2>⚙️ Audio & Classroom Options</h2>
                <p>Type any option command below and press <code>Enter</code>:</p>
                <ul className="modal-list">
                  <li>
                    <strong>Audio Status:</strong> {settings.muted ? '🔇 Muted' : '🔊 Active'} — Type <code>mute</code> or <code>unmute</code>
                  </li>
                  <li>
                    <strong>Typing Keystroke Sound ({settings.typingSound}):</strong> Type <code>typewriter</code>, <code>telegraph</code>, <code>quill</code>, or <code>chalk</code>
                  </li>
                  <li>
                    <strong>Confirm Enter Sound ({settings.confirmSound}):</strong> Type <code>bell</code>, <code>chime</code>, or <code>stamp</code>
                  </li>
                  <li>
                    <strong>High Contrast Mode ({settings.highContrast ? 'ON' : 'OFF'}):</strong> Type <code>contrast</code>
                  </li>
                </ul>
              </>
            )}

            {overlay === 'deck' && (
              <>
                <h2>🃏 Your Deck ({deck.length} Cards)</h2>
                <div className="modal-grid">
                  {deck.map((inst) => {
                    const res = resolveCardInstance(inst, phraseDiff);
                    return (
                      <div key={inst.instanceId} className="modal-item-chip">
                        <strong>
                          [{res.cost}⚡] {res.name}
                        </strong>
                        <div>{res.description}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {overlay === 'discard' && (
              <>
                <h2>♻️ Discard Pile ({discardPile.length} Cards)</h2>
                <div className="modal-grid">
                  {discardPile.map((inst) => {
                    const res = resolveCardInstance(inst, phraseDiff);
                    return (
                      <div key={inst.instanceId} className="modal-item-chip">
                        <strong>{res.name}</strong> — {res.description}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {overlay === 'burn_draft' && (
              <>
                <h2>🔥 Burned Drafts ({burnDraftPile.length} Cards)</h2>
                <div className="modal-grid">
                  {burnDraftPile.map((inst) => {
                    const res = resolveCardInstance(inst, phraseDiff);
                    return (
                      <div key={inst.instanceId} className="modal-item-chip">
                        <strong>{res.name}</strong> — {res.description}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {overlay === 'relics' && (
              <>
                <h2>🏺 Collected Relics ({relicIds.length})</h2>
                <div className="modal-grid">
                  {relicIds.map((rId) => {
                    const rel = getRelicDefinition(rId);
                    if (!rel) return null;
                    return (
                      <div key={rId} className="modal-item-chip">
                        <strong>{rel.names[phraseDiff]}</strong>
                        <div>{rel.description}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {overlay === 'save' && (
              <>
                <h2>💾 Classroom Save Code</h2>
                <p>Copy or write down this code to resume your run on any school computer, or paste a <code>TM1-...</code> code below and press <code>Enter</code>:</p>
                <div className="save-code-box">
                  <code className="save-code-string">{currentSaveCode}</code>
                </div>
              </>
            )}

            <div className="modal-footer-prompt">
              Type <strong>"back"</strong> (or press <code>Enter</code> on empty input) to return:{' '}
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
