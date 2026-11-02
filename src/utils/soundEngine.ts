import type { ConfirmSoundProfile, GameSettings, SoundProfile } from '../types/game';

export const CARD_SFX_MAP: Record<string, { sfx: string; volume?: number }> = {
  ink_strike: { sfx: 'cards/blade_01.wav', volume: 0.75 },
  page_ward: { sfx: 'ward_block.ogg', volume: 0.78 },
  boulder_barrage: { sfx: 'cards/boulder_smash.wav', volume: 0.85 },
  blotting_cloud: { sfx: 'spell_cast.ogg', volume: 0.75 },
  fire_breathing: { sfx: 'cards/flamethrower.ogg', volume: 0.78 },
  metallicize: { sfx: 'cards/metal_01.wav', volume: 0.75 },
  well_laid_plans: { sfx: 'cards/book_01.ogg', volume: 0.7 },
  noxious_fumes: { sfx: 'cards/steam.ogg', volume: 0.72 },
  demon_form: { sfx: 'cards/creature_roar_01.ogg', volume: 0.82 },
  evolve: { sfx: 'cards/enchant.ogg', volume: 0.75 },
  tools_of_the_trade: { sfx: 'cards/metalClick.ogg', volume: 0.72 },
  caltrops: { sfx: 'cards/metal_small1.wav', volume: 0.72 },
  berserk: { sfx: 'cards/creature_roar_02.ogg', volume: 0.85 },
  echo_form: { sfx: 'cards/forcepulse.ogg', volume: 0.8 },
  accuracy: { sfx: 'cards/metalLatch.ogg', volume: 0.72 },
  juggernaut: { sfx: 'cards/metalPot1.wav', volume: 0.82 },
  inflame: { sfx: 'cards/spell_fire_01.ogg', volume: 0.78 },
  feel_no_pain: { sfx: 'cards/magicshield.wav', volume: 0.75 },
  steady_margins: { sfx: 'cards/item_wood_01.wav', volume: 0.75 },
  flowing_quill: { sfx: 'cards/wind_trimmed.wav', volume: 0.7 },
  rain_of_full_stops: { sfx: 'cards/forcepush.ogg', volume: 0.8 },
  echoing_exclamations: { sfx: 'cards/metal_ringing.wav', volume: 0.75 },
  wraith_form: { sfx: 'cards/curse3.ogg', volume: 0.75 },
  venomous_bite: { sfx: 'cards/bite_small.wav', volume: 0.75 },
  flurry_of_blows: { sfx: 'cards/swing3.wav', volume: 0.78 },
  heavy_blow: { sfx: 'cards/doorClose_1.wav', volume: 0.85 },
  vampiric_bite: { sfx: 'cards/curse2.wav', volume: 0.75 },
  barricade: { sfx: 'cards/bookClose.ogg', volume: 0.82 },
  twin_strike: { sfx: 'cards/swing2.wav', volume: 0.74 },
  prepare: { sfx: 'cards/bookFlip1.ogg', volume: 0.7 },
  reckless_charge: { sfx: 'cards/chop.ogg', volume: 0.82 },
  fortify: { sfx: 'cards/chainmail1.wav', volume: 0.78 },
  expose_weakness: { sfx: 'cards/knifeSlice.wav', volume: 0.72 },
  shadow_strike: { sfx: 'cards/knifeSlice2.wav', volume: 0.75 },
  adrenaline: { sfx: 'cards/bubble.wav', volume: 0.75 },
  shield_bash: { sfx: 'cards/bookPlace1.ogg', volume: 0.8 },
  lacerate: { sfx: 'cards/knifeSlice2.wav', volume: 0.74 },
  execute: { sfx: 'cards/blade_guillotine.wav', volume: 0.88 },
  blur: { sfx: 'cards/pencil_speedwrite.wav', volume: 0.74 },
  defend: { sfx: 'cards/blade_03.wav', volume: 0.75 },
  backflip: { sfx: 'cards/bookFlip2.ogg', volume: 0.72 },
  fiery_slash: { sfx: 'cards/spell_fire_02.ogg', volume: 0.78 },
  weaken: { sfx: 'cards/steam.ogg', volume: 0.7 },
  corrosive_spit: { sfx: 'cards/creature_slime_01.ogg', volume: 0.78 },
  toxic_dart: { sfx: 'cards/shot.wav', volume: 0.76 },
  cleave: { sfx: 'cards/swing.wav', volume: 0.8 },
  meteor_smash: { sfx: 'cards/explode.ogg', volume: 0.9 },
  warcry: { sfx: 'cards/creature_monster_01.ogg', volume: 0.8 },
  quick_slash: { sfx: 'cards/quick_slash.wav', volume: 0.74 },
  outmaneuver: { sfx: 'cards/clothBelt.ogg', volume: 0.7 },
  panic_button: { sfx: 'cards/metalPot2.wav', volume: 0.82 },
  draining_touch: { sfx: 'cards/curse3.ogg', volume: 0.74 },
  thunder_strike: { sfx: 'cards/zap.wav', volume: 0.82 },
  concentrate: { sfx: 'cards/spell_fire_03.ogg', volume: 0.76 },
  expertise: { sfx: 'cards/book_02.ogg', volume: 0.7 },
  iron_skin: { sfx: 'cards/chainmail1.wav', volume: 0.78 },
  piercing_stab: { sfx: 'cards/knifeSlice.wav', volume: 0.75 },
  ink_spill: { sfx: 'cards/creature_slime_02.ogg', volume: 0.76 },
  wild_swing: { sfx: 'cards/metalPot3.wav', volume: 0.8 },
  blunt_force: { sfx: 'cards/bookPlace2.ogg', volume: 0.82 },
  sweeping_blow: { sfx: 'cards/clothBelt2.ogg', volume: 0.74 },
  sunder: { sfx: 'cards/paper_tear.wav', volume: 0.82 },
  smoke_bomb: { sfx: 'cards/magicdrop.wav', volume: 0.74 },
  tactics: { sfx: 'cards/beltHandle1.ogg', volume: 0.7 },
  entrench: { sfx: 'cards/bookClose.ogg', volume: 0.82 },
  catalyst: { sfx: 'cards/bubble.wav', volume: 0.78 },
  empower: { sfx: 'cards/enchant.ogg', volume: 0.8 },
  bandaging: { sfx: 'cards/heal.wav', volume: 0.78 },
  meditate: { sfx: 'cards/blessing2.ogg', volume: 0.76 },
  calculated_gamble: { sfx: 'cards/bookFlip3.ogg', volume: 0.72 },
  acrobatics: { sfx: 'cards/book_03.ogg', volume: 0.7 },
  dodge: { sfx: 'cards/cloth1.ogg', volume: 0.68 },
  deflect: { sfx: 'cards/spell_01.ogg', volume: 0.78 },
  deep_breath: { sfx: 'cards/wind_trimmed.wav', volume: 0.68 },
  final_draft: { sfx: 'cards/explode1.ogg', volume: 0.88 },
  blank_page_sanctuary: { sfx: 'cards/blessing3.wav', volume: 0.82 },
  bookmark: { sfx: 'cards/bookFlip1.ogg', volume: 0.75 },
  dog_ear: { sfx: 'cards/bookFlip2.ogg', volume: 0.75 },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sampleCache: Map<string, HTMLAudioElement> = new Map();
  private activeAmbiance: {
    key: string;
    gain: GainNode;
    sources: (AudioScheduledSourceNode | AudioNode)[];
    intervalIds: number[];
  } | null = null;
  private noiseBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const resumeAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('pointerdown', resumeAudio, { passive: true });
      window.addEventListener('keydown', resumeAudio, { passive: true });
    }
  }

  // Multi-sample pools for natural acoustic typing variations
  private typewriterSamples: string[] = [
    'typing/typewriter_1.wav',
    'typing/typewriter_2.wav',
    'typing/typewriter_3.wav',
    'typing/typewriter_4.wav',
  ];
  private keyboardSamples: string[] = [
    'typing/keyboard_1.wav',
    'typing/keyboard_2.wav',
    'typing/keyboard_3.wav',
    'typing/keyboard_4.wav',
  ];
  private quillSamples: string[] = [
    'typing/quill_1.wav',
    'typing/quill_2.wav',
    'typing/quill_3.wav',
    'typing/quill_4.wav',
  ];
  private chalkSamples: string[] = [
    'typing/chalk_1.wav',
    'typing/chalk_2.wav',
    'typing/chalk_3.wav',
    'typing/chalk_4.wav',
  ];

  public playSample(
    filename: string,
    settings: GameSettings,
    volumeMultiplier = 0.65,
    rateJitter = 0.06
  ): void {
    if (typeof window === 'undefined' || settings.muted || settings.volume <= 0) return;
    try {
      const src = filename.startsWith('/') || filename.startsWith('./') ? filename : `./assets/sfx/${filename}`;
      let baseAudio = this.sampleCache.get(src);
      if (!baseAudio) {
        baseAudio = new Audio(src);
        baseAudio.preload = 'auto';
        this.sampleCache.set(src, baseAudio);
      }
      const instance = baseAudio.cloneNode(true) as HTMLAudioElement;
      instance.volume = Math.min(1, Math.max(0, settings.volume * volumeMultiplier));
      if (rateJitter > 0) {
        instance.playbackRate = Math.max(0.6, 1 + (Math.random() * 2 - 1) * rateJitter);
      }
      instance.play().catch(() => {});
    } catch {
      // Ignore audio playback errors if blocked by browser autoplay policy
    }
  }

  public playShuffle(settings: GameSettings): void {
    this.playSample('shuffle.wav', settings, 0.7, 0.04);
  }

  /**
   * Play card draw sound effect.
   * When drawing multiple cards, plays a rapid staggered cascade with slight pitch variation.
   */
  public playDrawCards(count: number, settings: GameSettings): void {
    const total = Math.max(1, Math.min(10, count));
    for (let i = 0; i < total; i++) {
      window.setTimeout(() => {
        this.playSample('draw.wav', settings, 0.52, 0.12);
      }, i * 65);
    }
  }

  public playDrawCard(settings: GameSettings): void {
    this.playDrawCards(1, settings);
  }

  public playCardCast(settings: GameSettings): void {
    this.playSample('play_card.wav', settings, 0.72, 0.06);
  }

  /**
   * Plays the distinctive custom sound effect assigned to a specific card,
   * layering in the subtle tactile card flick for satisfying audio feedback.
   * Handles special audio processing for Twin Strike, Echo cards, and Flurry.
   */
  public playCardSound(cardId: string, settings: GameSettings, sfxOverride?: string): void {
    // Subtle physical card flick sound
    this.playCardCast(settings);

    // Twin strike / double tap: play twice with offset
    if (cardId === 'twin_strike' || cardId.includes('twin') || cardId.includes('double')) {
      const sfx = sfxOverride || CARD_SFX_MAP[cardId]?.sfx || 'cards/swing2.wav';
      this.playSample(sfx, settings, 0.75, 0.04);
      window.setTimeout(() => {
        this.playSample(sfx, settings, 0.72, 0.08);
      }, 110);
      return;
    }

    // Echo card: apply multi-tap echo processing
    if (cardId === 'echoing_exclamations' || cardId === 'echo_form') {
      const sfx = sfxOverride || CARD_SFX_MAP[cardId]?.sfx || 'cards/metal_ringing.wav';
      this.playSample(sfx, settings, 0.78, 0.02);
      window.setTimeout(() => {
        this.playSample(sfx, settings, 0.44, 0.05);
      }, 140);
      window.setTimeout(() => {
        this.playSample(sfx, settings, 0.22, 0.08);
      }, 290);
      return;
    }

    // Flurry of blows: play rapid triple swing
    if (cardId === 'flurry_of_blows') {
      const sfx = sfxOverride || CARD_SFX_MAP[cardId]?.sfx || 'cards/swing3.wav';
      this.playSample(sfx, settings, 0.76, 0.04);
      window.setTimeout(() => this.playSample(sfx, settings, 0.7, 0.06), 85);
      window.setTimeout(() => this.playSample(sfx, settings, 0.65, 0.09), 175);
      return;
    }

    // If an explicit SFX is provided (e.g. from editor or card JSON definition), play that directly
    if (sfxOverride) {
      this.playSample(sfxOverride, settings, 0.76, 0.05);
      return;
    }

    // Look up card's unique SFX from registry
    const mapped = CARD_SFX_MAP[cardId];
    if (mapped) {
      this.playSample(mapped.sfx, settings, mapped.volume ?? 0.76, 0.05);
      return;
    }

    // Default fallback
    this.playSample('cards/blade_01.wav', settings, 0.7, 0.05);
  }

  /**
   * Play any audio sample directly by path for previewing in the Dev JSON Editor sound studio.
   */
  public playSampleDirect(
    filename: string,
    settings?: Partial<GameSettings>,
    volumeMultiplier = 0.8
  ): void {
    const fullSettings: GameSettings = {
      volume: 0.8,
      typingSound: 'mechanical_typewriter',
      confirmSound: 'carriage_bell',
      highContrast: false,
      muted: false,
      ...settings,
    };
    this.playSample(filename, fullSettings, volumeMultiplier, 0);
  }

  /**
   * Audition any sound by sound ID, handling file samples, synthesized engine audio, and continuous ambiances.
   */
  public playAudition(soundId: string, settings?: Partial<GameSettings>): void {
    const fullSettings: GameSettings = {
      volume: 0.85,
      typingSound: 'mechanical_typewriter',
      confirmSound: 'carriage_bell',
      highContrast: false,
      muted: false,
      ...settings,
    };

    if (soundId.startsWith('ambiance:') || soundId.startsWith('ambiance/')) {
      const ambianceKey = soundId.replace(/^ambiance[:/]/, '');
      if (this.getCurrentAmbianceKey() === ambianceKey) {
        this.stopAmbiance(0.4);
      } else {
        this.startAmbiance(ambianceKey, fullSettings);
      }
      return;
    }

    const AMBIANCE_KEYS = [
      'rocky_desert',
      'flowing_riverbank',
      'magical_forest_clearing',
      'volcanic_caldera',
      'crystal_bastion',
      'fuming_ink_marsh',
      'sunlit_sanctuary',
      'whispering_library_ruins',
      'calm_parchment_meadow',
      'campfire',
      'merchant',
      'treasure',
      'mystery',
      'map',
      'main_menu',
    ];

    if (AMBIANCE_KEYS.includes(soundId)) {
      if (this.getCurrentAmbianceKey() === soundId) {
        this.stopAmbiance(0.4);
      } else {
        this.startAmbiance(soundId, fullSettings);
      }
      return;
    }

    switch (soundId) {
      case 'wheel_tick':
        this.playWheelTick(fullSettings);
        break;
      case 'typewriter':
        this.playKeystroke({ ...fullSettings, typingSound: 'mechanical_typewriter' });
        break;
      case 'telegraph':
        this.playKeystroke({ ...fullSettings, typingSound: 'vintage_telegraph' });
        break;
      case 'quill':
        this.playKeystroke({ ...fullSettings, typingSound: 'arcane_quill' });
        break;
      case 'chalk':
        this.playKeystroke({ ...fullSettings, typingSound: 'soft_chalk' });
        break;
      case 'carriage_bell':
        this.playConfirm({ ...fullSettings, confirmSound: 'carriage_bell' });
        break;
      case 'spell_chime':
        this.playConfirm({ ...fullSettings, confirmSound: 'spell_chime' });
        break;
      case 'heavy_stamp':
        this.playConfirm({ ...fullSettings, confirmSound: 'heavy_stamp' });
        break;
      default:
        this.playSample(soundId, fullSettings, 0.8, 0);
        break;
    }
  }

  /**
   * Update or override card SFX mapping in memory when edited in DevJsonEditor.
   */
  public updateCardSfx(cardId: string, sfx: string, volume = 0.76): void {
    CARD_SFX_MAP[cardId] = { sfx, volume };
  }

  /**
   * Retrieve current mapped SFX for a card.
   */
  public getCardSfx(cardId: string): string | undefined {
    return CARD_SFX_MAP[cardId]?.sfx;
  }

  public playMapOpen(settings: GameSettings): void {
    this.playSample('map_open.mp3', settings, 0.68, 0.04);
  }

  public playChooseRoad(settings: GameSettings): void {
    this.playSample('road_choose.mp3', settings, 0.75, 0.05);
  }

  public playPageTurn(settings: GameSettings): void {
    this.playSample('page_turn.mp3', settings, 0.65, 0.06);
  }

  public playBurnCard(settings: GameSettings): void {
    this.playSample('burn_card.mp3', settings, 0.7, 0.05);
  }

  public playHit(settings: GameSettings): void {
    this.playSample('attack_hit.wav', settings, 0.72, 0.08);
  }

  public playWardBlock(settings: GameSettings): void {
    this.playSample('ward_block.ogg', settings, 0.65, 0.06);
  }

  /**
   * UI sound for navigating in the Codex (changing tabs or selecting entries).
   * Uses drawKnife1.ogg with slight pitch randomization.
   */
  public playCodexNav(settings: GameSettings): void {
    this.playSample('cards/drawKnife1.ogg', settings, 0.48, 0.14);
  }

  /**
   * Special entrance audio when entering the Merchant / Shop.
   * Layers the divine choir tone with merchant counter pebbles and coin clinks.
   */
  public playShopEntrance(settings: GameSettings): void {
    this.playSample('cards/blessing.ogg', settings, 0.65, 0.02);
    window.setTimeout(() => {
      this.playSample('cards/stones_01.ogg', settings, 0.5, 0.08);
      this.playSample('cards/chain_01.ogg', settings, 0.6, 0.06);
    }, 180);
  }

  /**
   * Peaceful restorative chime when entering the Campfire rest site.
   */
  public playCampfireEntrance(settings: GameSettings): void {
    this.playSample('cards/blessing2.ogg', settings, 0.72, 0.02);
  }

  /**
   * Ominous dark curse omen played on entering an Elite or Boss battle.
   */
  public playEliteBossEntrance(settings: GameSettings): void {
    this.playSample('cards/curse.ogg', settings, 0.75, 0.03);
  }

  /**
   * Martial combat initiation sound when entering a standard battle encounter.
   */
  public playBattleEntrance(settings: GameSettings): void {
    this.playSample('cards/quick_slash.wav', settings, 0.72, 0.05);
  }

  /**
   * Rewarding combat victory stinger when clearing a battle encounter.
   */
  public playBattleVictory(settings: GameSettings): void {
    this.playSample('cards/blessing2.ogg', settings, 0.75, 0.02);
  }

  /**
   * Shop door chime and latch when departing the Merchant.
   */
  public playShopExit(settings: GameSettings): void {
    this.playSample('typing/carriage_bell.wav', settings, 0.65, 0.05);
    window.setTimeout(() => {
      this.playSample('cards/item_wood_01.wav', settings, 0.55, 0.08);
    }, 120);
  }

  /**
   * Transaction coin clink played when gaining or spending gold at the Merchant.
   */
  public playCoinClink(settings: GameSettings): void {
    this.playSample('cards/chain_01.ogg', settings, 0.65, 0.08);
  }

  /**
   * Heavy boulder explosive shatter played when high-tier rock enemies are defeated.
   */
  public playRockBossDefeat(settings: GameSettings): void {
    this.playSample('cards/explode1.ogg', settings, 0.85, 0.04);
  }

  /**
   * Resonant steel draw played when upgrading a Strike card.
   */
  public playStrikeUpgrade(settings: GameSettings): void {
    this.playSample('cards/sword_unsheathe.wav', settings, 0.8, 0.04);
  }

  /**
   * Crisp mechanical flapper tick for the chance wheel as each rim knob/peg
   * passes the top stationary pointer.
   */
  public playWheelTick(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const pitch = 1180 + (Math.random() * 2 - 1) * 75;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.022);

    const vol = Math.min(1, Math.max(0, settings.volume)) * 0.38;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Authentic tactile typing sound execution using multi-sampled acoustic audio files.
   * Completely replaces 8-bit synthetic oscillators with realistic typewriter and keyboard clicks!
   */
  public playKeystroke(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;

    const profile: SoundProfile = settings.typingSound;
    let pool: string[];
    let volMult = 0.52;

    if (profile === 'mechanical_typewriter') {
      pool = this.typewriterSamples;
      volMult = 0.54;
    } else if (profile === 'vintage_telegraph') {
      pool = this.keyboardSamples;
      volMult = 0.52;
    } else if (profile === 'arcane_quill') {
      pool = this.quillSamples;
      volMult = 0.48;
    } else {
      pool = this.chalkSamples;
      volMult = 0.46;
    }

    const sample = pool[Math.floor(Math.random() * pool.length)];
    this.playSample(sample, settings, volMult, 0.08);
  }

  public playBackspace(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    // Tactile reverse mechanical key click
    this.playSample('typing/keyboard_3.wav', settings, 0.42, 0.12);
  }

  public playConfirm(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const profile: ConfirmSoundProfile = settings.confirmSound;

    if (profile === 'carriage_bell') {
      // Classic typewriter carriage return bell ding & slide
      this.playSample('typing/carriage_bell.wav', settings, 0.72, 0.03);
    } else if (profile === 'spell_chime') {
      // Resonant harmonic enchantment chime
      this.playSample('cards/enchant.ogg', settings, 0.68, 0.04);
    } else {
      // Heavy wax seal book thud
      this.playSample('cards/doorClose_1.wav', settings, 0.75, 0.05);
    }
  }

  public playError(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const vol = Math.min(1, Math.max(0, settings.volume)) * 0.22;
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(135, now + 0.08);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playWardBreak(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/ward_break.wav', settings, 0.82, 0.08);
  }

  public playChestOpen(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/chest_open.wav', settings, 0.78, 0.05);
  }

  public playRelicGain(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/relic_gain.wav', settings, 0.85, 0.04);
  }

  public playMysteryWin(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/mystery_win.wav', settings, 0.88, 0.04);
  }

  public playMysteryFail(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/mystery_fail.wav', settings, 0.82, 0.05);
  }

  public playVictoryFanfare(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/victory.wav', settings, 0.95, 0);
  }

  public playDefeatSound(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/game_over.wav', settings, 0.92, 0);
  }

  public playCampfireRest(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/campfire_rest.wav', settings, 0.85, 0.03);
  }

  public playEnemyBuff(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/curse2.ogg', settings, 0.65, 0.08);
  }

  public playEnemyHeal(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/heal.ogg', settings, 0.7, 0.05);
  }

  public playAllyDefeated(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    this.playSample('cards/paper_tear.wav', settings, 0.68, 0.1);
  }

  // ==========================================
  // PROCEDURAL CONTINUOUS AMBIANCE ENGINE
  // ==========================================

  public getCurrentAmbianceKey(): string | null {
    return this.activeAmbiance?.key || null;
  }

  public updateAmbianceVolume(settings: GameSettings): void {
    if (!this.activeAmbiance) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const targetVol = settings.muted ? 0 : Math.min(1, Math.max(0, settings.volume)) * 0.28;
    const now = ctx.currentTime;
    this.activeAmbiance.gain.gain.cancelScheduledValues(now);
    this.activeAmbiance.gain.gain.linearRampToValueAtTime(Math.max(0.0001, targetVol), now + 0.15);
  }

  public stopAmbiance(fadeSec = 1.0): void {
    if (!this.activeAmbiance) return;
    const current = this.activeAmbiance;
    this.activeAmbiance = null;

    current.intervalIds.forEach((id) => {
      window.clearInterval(id);
      window.clearTimeout(id);
    });

    const ctx = this.getContext();
    if (ctx && ctx.state === 'running') {
      const now = ctx.currentTime;
      current.gain.gain.cancelScheduledValues(now);
      current.gain.gain.setValueAtTime(current.gain.gain.value, now);
      current.gain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
      window.setTimeout(() => {
        current.sources.forEach((s) => {
          try {
            if ('stop' in s && typeof (s as AudioScheduledSourceNode).stop === 'function') {
              (s as AudioScheduledSourceNode).stop();
            }
          } catch {}
          try {
            s.disconnect();
          } catch {}
        });
        try {
          current.gain.disconnect();
        } catch {}
      }, fadeSec * 1000 + 120);
    } else {
      current.sources.forEach((s) => {
        try {
          s.disconnect();
        } catch {}
      });
      try {
        current.gain.disconnect();
      } catch {}
    }
  }

  public startAmbiance(key: string, settings: GameSettings): void {
    if (this.activeAmbiance && this.activeAmbiance.key === key) {
      this.updateAmbianceVolume(settings);
      return;
    }

    if (this.activeAmbiance) {
      this.stopAmbiance(1.2);
    }

    const ctx = this.getContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const targetVol = settings.muted ? 0 : Math.min(1, Math.max(0, settings.volume)) * 0.28;
    const now = ctx.currentTime;
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(Math.max(0.0001, targetVol), now + 1.2);
    masterGain.connect(ctx.destination);

    const sources: (AudioScheduledSourceNode | AudioNode)[] = [];
    const intervalIds: number[] = [];

    this.buildAmbianceGraph(key, ctx, masterGain, sources, intervalIds, settings);

    this.activeAmbiance = {
      key,
      gain: masterGain,
      sources,
      intervalIds,
    };
  }

  private scheduleRandomEvent(
    minMs: number,
    maxMs: number,
    intervalIds: number[],
    ctx: AudioContext,
    masterGain: GainNode,
    fn: () => void
  ): void {
    const scheduleNext = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      const tid = window.setTimeout(() => {
        if (
          ctx.state !== 'running' ||
          !this.activeAmbiance ||
          this.activeAmbiance.gain !== masterGain
        ) {
          return;
        }
        try {
          fn();
        } catch {}
        scheduleNext();
      }, delay);
      intervalIds.push(tid);
    };
    scheduleNext();
  }

  private generateNoiseBuffer(
    ctx: AudioContext,
    type: 'pink' | 'white' | 'brown',
    durationSeconds = 6.0
  ): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const buffer = ctx.createBuffer(2, numSamples, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      if (type === 'white') {
        for (let i = 0; i < numSamples; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < numSamples; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < numSamples; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      }
    }
    return buffer;
  }

  private createNoiseSource(
    ctx: AudioContext,
    type: 'pink' | 'white' | 'brown'
  ): AudioBufferSourceNode {
    let buf = this.noiseBuffers.get(type);
    if (!buf) {
      buf = this.generateNoiseBuffer(ctx, type, 6.0);
      this.noiseBuffers.set(type, buf);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  private createLfo(
    ctx: AudioContext,
    freq: number,
    depth: number,
    target: AudioParam,
    sources: (AudioScheduledSourceNode | AudioNode)[]
  ): OscillatorNode {
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(freq, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(depth, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(target);
    lfo.start();
    sources.push(lfo, lfoGain);
    return lfo;
  }

  private buildAmbianceGraph(
    key: string,
    ctx: AudioContext,
    masterGain: GainNode,
    sources: (AudioScheduledSourceNode | AudioNode)[],
    intervalIds: number[],
    settings: GameSettings
  ): void {
    const now = ctx.currentTime;

    switch (key) {
      // 1. Rocky Desert: Canyon wind, howling dust & sandstone rumble + occasional falling pebbles / tumbleweed
      case 'rocky_desert': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(420, now);
        bp.Q.setValueAtTime(1.8, now);
        this.createLfo(ctx, 0.05, 160, bp.frequency, sources);
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.13, now);
        pink.connect(bp);
        bp.connect(windGain);
        windGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, windGain);

        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(120, now);
        lp.Q.setValueAtTime(1.2, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.11, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        const white = this.createNoiseSource(ctx, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1800, now);
        const sandGain = ctx.createGain();
        sandGain.gain.setValueAtTime(0.025, now);
        this.createLfo(ctx, 0.09, 0.015, sandGain.gain, sources);
        white.connect(hp);
        hp.connect(sandGain);
        sandGain.connect(masterGain);
        white.start();
        sources.push(white, hp, sandGain);

        // Occasional highlights: falling pebbles bouncing down rockface OR tumbleweed brushing by
        this.scheduleRandomEvent(7000, 15000, intervalIds, ctx, masterGain, () => {
          const isPebble = Math.random() > 0.45;
          const curr = ctx.currentTime;
          if (isPebble) {
            // Pebbles bouncing down canyon rockface (3 to 5 little acoustic bounces)
            const bounceCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < bounceCount; i++) {
              const bDelay = i * 0.075 + Math.random() * 0.045;
              const bNoise = this.createNoiseSource(ctx, 'white');
              const bFilter = ctx.createBiquadFilter();
              bFilter.type = 'bandpass';
              bFilter.frequency.setValueAtTime(450 + Math.random() * 500, curr + bDelay);
              bFilter.Q.setValueAtTime(4.0, curr + bDelay);
              const bGain = ctx.createGain();
              const bVol = (0.045 - i * 0.007) * (0.8 + Math.random() * 0.4);
              bGain.gain.setValueAtTime(Math.max(0.005, bVol), curr + bDelay);
              bGain.gain.exponentialRampToValueAtTime(0.0001, curr + bDelay + 0.028);
              bNoise.connect(bFilter);
              bFilter.connect(bGain);
              bGain.connect(masterGain);
              bNoise.start(curr + bDelay);
              bNoise.stop(curr + bDelay + 0.035);
            }
          } else {
            // Tumbleweed / dry brush rubbing across sandstone
            const tNoise = this.createNoiseSource(ctx, 'pink');
            const tFilter = ctx.createBiquadFilter();
            tFilter.type = 'bandpass';
            tFilter.frequency.setValueAtTime(800, curr);
            tFilter.frequency.linearRampToValueAtTime(1700, curr + 0.7);
            tFilter.frequency.linearRampToValueAtTime(750, curr + 1.4);
            tFilter.Q.setValueAtTime(2.5, curr);
            const tGain = ctx.createGain();
            tGain.gain.setValueAtTime(0.001, curr);
            tGain.gain.linearRampToValueAtTime(0.028, curr + 0.7);
            tGain.gain.linearRampToValueAtTime(0.0001, curr + 1.4);
            tNoise.connect(tFilter);
            tFilter.connect(tGain);
            tGain.connect(masterGain);
            tNoise.start(curr);
            tNoise.stop(curr + 1.45);
          }
        });
        break;
      }

      // 2. Flowing Riverbank: Faint rushing water of a small stream with liquid ripples & trickles (distinct from wind)
      case 'flowing_riverbank': {
        // Deep water current bed
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(280, now);
        lp.Q.setValueAtTime(1.2, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.08, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        // Mid-frequency rushing water body with fast liquid ripples (distinct from wind)
        const pink1 = this.createNoiseSource(ctx, 'pink');
        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(680, now);
        bp1.Q.setValueAtTime(3.2, now);
        const ripGain1 = ctx.createGain();
        ripGain1.gain.setValueAtTime(0.075, now);
        this.createLfo(ctx, 5.8, 0.022, ripGain1.gain, sources); // 5.8Hz rapid liquid ripple
        this.createLfo(ctx, 0.18, 0.018, ripGain1.gain, sources); // slow river swell
        pink1.connect(bp1);
        bp1.connect(ripGain1);
        ripGain1.connect(masterGain);
        pink1.start();
        sources.push(pink1, bp1, ripGain1);

        // Water surface froth & bubbling eddies
        const pink2 = this.createNoiseSource(ctx, 'pink');
        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(1350, now);
        bp2.Q.setValueAtTime(3.8, now);
        const frothGain = ctx.createGain();
        frothGain.gain.setValueAtTime(0.045, now);
        this.createLfo(ctx, 7.4, 0.015, frothGain.gain, sources); // 7.4Hz froth texture
        pink2.connect(bp2);
        bp2.connect(frothGain);
        frothGain.connect(masterGain);
        pink2.start();
        sources.push(pink2, bp2, frothGain);

        // High crystal splash spray
        const white = this.createNoiseSource(ctx, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'bandpass';
        hp.frequency.setValueAtTime(2400, now);
        hp.Q.setValueAtTime(2.2, now);
        const sprayGain = ctx.createGain();
        sprayGain.gain.setValueAtTime(0.018, now);
        white.connect(hp);
        hp.connect(sprayGain);
        sprayGain.connect(masterGain);
        white.start();
        sources.push(white, hp, sprayGain);

        // Faint liquid water stream trickles (granular droplets over river stones)
        this.scheduleRandomEvent(380, 850, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const freq = 1200 + Math.random() * 600;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, curr);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.75, curr + 0.028);
          g.gain.setValueAtTime(0.016, curr);
          g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.028);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(curr);
          osc.stop(curr + 0.035);
        });
        break;
      }

      // 3. Magical Forest Clearing: Canopy whisper & floating leyline melody (changes tone, breathes in & out)
      case 'magical_forest_clearing': {
        // Rustling woodland canopy breeze
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(480, now);
        bp.Q.setValueAtTime(1.2, now);
        this.createLfo(ctx, 0.07, 130, bp.frequency, sources);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.085, now);
        pink.connect(bp);
        bp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, breezeGain);

        // Faint shimmering canopy air
        const white = this.createNoiseSource(ctx, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(2600, now);
        const shimGain = ctx.createGain();
        shimGain.gain.setValueAtTime(0.014, now);
        this.createLfo(ctx, 0.12, 0.008, shimGain.gain, sources);
        white.connect(hp);
        hp.connect(shimGain);
        shimGain.connect(masterGain);
        white.start();
        sources.push(white, hp, shimGain);

        // Floating woodland leyline melody (notes swell in, change tone, and dissolve into breeze)
        const LEYLINE_PITCHES = [432, 486, 540, 648, 720, 540, 486];
        let melodyIdx = 0;
        this.scheduleRandomEvent(5500, 8500, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const pitch = LEYLINE_PITCHES[melodyIdx % LEYLINE_PITCHES.length];
          melodyIdx++;

          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, curr);

          // Subtle natural warm vibrato
          const vOsc = ctx.createOscillator();
          const vGain = ctx.createGain();
          vOsc.frequency.setValueAtTime(4.6, curr);
          vGain.gain.setValueAtTime(2.0, curr);
          vOsc.connect(vGain);
          vGain.connect(osc.frequency);
          vOsc.start(curr);
          vOsc.stop(curr + 5.2);

          // Breathe in (1.8s), hold (1.4s), dissolve out (2.0s)
          g.gain.setValueAtTime(0.0001, curr);
          g.gain.linearRampToValueAtTime(0.022, curr + 1.8);
          g.gain.setValueAtTime(0.022, curr + 3.2);
          g.gain.linearRampToValueAtTime(0.0001, curr + 5.2);

          osc.connect(g);
          g.connect(masterGain);
          osc.start(curr);
          osc.stop(curr + 5.3);
        });
        break;
      }

      // 4. Volcanic Caldera / Seismic Vents: Audible physical magma rumble + rare but OBVIOUS steam vents
      case 'volcanic_caldera': {
        // Heavy resonant subterranean magma rumble
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(58, now);
        lp.Q.setValueAtTime(4.2, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.24, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        // Sub-bass ground tremor tones (physical seismic bass)
        const sub1 = ctx.createOscillator();
        sub1.type = 'sine';
        sub1.frequency.setValueAtTime(38, now);
        const subGain1 = ctx.createGain();
        subGain1.gain.setValueAtTime(0.05, now);
        this.createLfo(ctx, 0.16, 0.025, subGain1.gain, sources); // slow seismic trembling
        sub1.connect(subGain1);
        subGain1.connect(masterGain);
        sub1.start();
        sources.push(sub1, subGain1);

        const sub2 = ctx.createOscillator();
        sub2.type = 'sine';
        sub2.frequency.setValueAtTime(52, now);
        const subGain2 = ctx.createGain();
        subGain2.gain.setValueAtTime(0.035, now);
        sub2.connect(subGain2);
        subGain2.connect(masterGain);
        sub2.start();
        sources.push(sub2, subGain2);

        // Seismic ground tremor swell (every 9-16s, deep ground shifts)
        this.scheduleRandomEvent(9000, 16000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          brownGain.gain.cancelScheduledValues(curr);
          brownGain.gain.setValueAtTime(0.24, curr);
          brownGain.gain.linearRampToValueAtTime(0.36, curr + 1.2);
          brownGain.gain.linearRampToValueAtTime(0.24, curr + 3.0);
        });

        // Rare but OBVIOUS pressurized steam vent eruptions (every 13-22s)
        this.scheduleRandomEvent(13000, 22000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const sNoise = this.createNoiseSource(ctx, 'white');
          const sFilter = ctx.createBiquadFilter();
          sFilter.type = 'bandpass';
          // Surges up from low hiss to roaring vent, then diffuses
          sFilter.frequency.setValueAtTime(550, curr);
          sFilter.frequency.exponentialRampToValueAtTime(2200, curr + 0.35);
          sFilter.frequency.linearRampToValueAtTime(1400, curr + 2.0);
          sFilter.frequency.linearRampToValueAtTime(700, curr + 4.2);
          sFilter.Q.setValueAtTime(2.2, curr);

          const sGain = ctx.createGain();
          sGain.gain.setValueAtTime(0.001, curr);
          sGain.gain.linearRampToValueAtTime(0.095, curr + 0.35); // Obvious punchy vent eruption!
          sGain.gain.setValueAtTime(0.08, curr + 1.8);
          sGain.gain.linearRampToValueAtTime(0.0001, curr + 4.2);

          sNoise.connect(sFilter);
          sFilter.connect(sGain);
          sGain.connect(masterGain);
          sNoise.start(curr);
          sNoise.stop(curr + 4.3);
        });
        break;
      }

      // 5. Crystal Bastion: Evolving melodic singing crystal intervals (swells in, changes tone, and dissolves)
      case 'crystal_bastion': {
        // Faint subterranean crystal cavern resonance
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(528, now);
        bp.Q.setValueAtTime(7.0, now);
        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.018, now);
        pink.connect(bp);
        bp.connect(airGain);
        airGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, airGain);

        // Melodic singing crystal intervals that swell in, change tone, and fade out
        const CRYSTAL_CHORDS = [
          [528, 792],   // C5 & G5 pure fifth
          [594, 891],   // D5 & A5
          [660, 990],   // E5 & B5
          [704, 1056],  // F5 & C6
          [528, 1056],  // C5 & C6 octave shimmer
        ];
        let chordIdx = 0;

        this.scheduleRandomEvent(6000, 8500, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const [f1, f2] = CRYSTAL_CHORDS[chordIdx % CRYSTAL_CHORDS.length];
          chordIdx++;

          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const g = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(f1, curr);
          osc2.frequency.setValueAtTime(f2, curr);

          // Gentle choral detune sweep
          osc1.frequency.linearRampToValueAtTime(f1 + 1.2, curr + 3.0);
          osc2.frequency.linearRampToValueAtTime(f2 - 1.2, curr + 3.0);

          // Swell in over 2.4s, sing for 1.6s, dissolve over 2.8s
          g.gain.setValueAtTime(0.0001, curr);
          g.gain.linearRampToValueAtTime(0.024, curr + 2.4);
          g.gain.setValueAtTime(0.024, curr + 4.0);
          g.gain.linearRampToValueAtTime(0.0001, curr + 6.8);

          osc1.connect(g);
          osc2.connect(g);
          g.connect(masterGain);
          osc1.start(curr);
          osc2.start(curr);
          osc1.stop(curr + 6.9);
          osc2.stop(curr + 6.9);
        });

        // Occasional crystal ping chime (every 9-16s)
        this.scheduleRandomEvent(9000, 16000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const pitches = [1056, 1584, 2112, 2640];
          const pitch = pitches[Math.floor(Math.random() * pitches.length)];
          const pOsc = ctx.createOscillator();
          const pGain = ctx.createGain();
          pOsc.type = 'sine';
          pOsc.frequency.setValueAtTime(pitch, curr);
          pGain.gain.setValueAtTime(0.03, curr);
          pGain.gain.exponentialRampToValueAtTime(0.0001, curr + 1.8);
          pOsc.connect(pGain);
          pGain.connect(masterGain);
          pOsc.start(curr);
          pOsc.stop(curr + 1.85);
        });
        break;
      }

      // 6. Fuming Ink Marsh: Murky swamp drone + occasional deep bubble build-up & burst
      case 'fuming_ink_marsh': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(160, now);
        lp.Q.setValueAtTime(2.0, now);
        const swampGain = ctx.createGain();
        swampGain.gain.setValueAtTime(0.13, now);
        brown.connect(lp);
        lp.connect(swampGain);
        swampGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, swampGain);

        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(460, now);
        bp.Q.setValueAtTime(2.2, now);
        const vaporGain = ctx.createGain();
        vaporGain.gain.setValueAtTime(0.045, now);
        this.createLfo(ctx, 0.11, 0.02, vaporGain.gain, sources);
        pink.connect(bp);
        bp.connect(vaporGain);
        vaporGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, vaporGain);

        // Frequent small simmering marsh bubbles
        this.scheduleRandomEvent(1100, 2400, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          const startFreq = 200 + Math.random() * 80;
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(startFreq, curr);
          bOsc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, curr + 0.07);
          bGain.gain.setValueAtTime(0.03, curr);
          bGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.07);
          bOsc.connect(bGain);
          bGain.connect(masterGain);
          bOsc.start(curr);
          bOsc.stop(curr + 0.08);
        });

        // Occasional deep bubble build-up and burst (gas pocket rising then erupting)
        this.scheduleRandomEvent(8000, 15000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          // Step 1: Sub gurgle rising build-up
          const gOsc = ctx.createOscillator();
          const gGain = ctx.createGain();
          gOsc.type = 'sine';
          gOsc.frequency.setValueAtTime(65, curr);
          gOsc.frequency.exponentialRampToValueAtTime(145, curr + 0.65);
          gGain.gain.setValueAtTime(0.01, curr);
          gGain.gain.linearRampToValueAtTime(0.045, curr + 0.65);
          gOsc.connect(gGain);
          gGain.connect(masterGain);
          gOsc.start(curr);
          gOsc.stop(curr + 0.66);

          // Step 2: Sudden deep GLOOP-POP burst at 0.65s!
          const bTime = curr + 0.65;
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'sine';
          popOsc.frequency.setValueAtTime(290, bTime);
          popOsc.frequency.exponentialRampToValueAtTime(80, bTime + 0.075);
          popGain.gain.setValueAtTime(0.065, bTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, bTime + 0.075);
          popOsc.connect(popGain);
          popGain.connect(masterGain);
          popOsc.start(bTime);
          popOsc.stop(bTime + 0.085);

          // Wet ink splatter noise
          const spNoise = this.createNoiseSource(ctx, 'pink');
          const spFilter = ctx.createBiquadFilter();
          spFilter.type = 'bandpass';
          spFilter.frequency.setValueAtTime(850, bTime);
          spFilter.Q.setValueAtTime(3.0, bTime);
          const spGain = ctx.createGain();
          spGain.gain.setValueAtTime(0.04, bTime);
          spGain.gain.exponentialRampToValueAtTime(0.0001, bTime + 0.16);
          spNoise.connect(spFilter);
          spFilter.connect(spGain);
          spGain.connect(masterGain);
          spNoise.start(bTime);
          spNoise.stop(bTime + 0.18);
        });
        break;
      }

      // 7. Sunlit Sanctuary: Breathing celestial chord progressions that gently billow in and out
      case 'sunlit_sanctuary': {
        // Serene cathedral air presence
        const pink = this.createNoiseSource(ctx, 'pink');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(540, now);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.05, now);
        this.createLfo(ctx, 0.035, 0.02, breezeGain.gain, sources);
        pink.connect(lp);
        lp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, lp, breezeGain);

        // Radiant celestial chords that swell in, shift harmonies, and gently dissolve
        const SANCTUARY_CHORDS = [
          [220.0, 277.2, 329.6, 440.0],  // A major
          [293.7, 369.9, 440.0, 554.4],  // D major9
          [220.0, 261.6, 329.6, 440.0],  // F# minor7
          [246.9, 329.6, 392.0, 493.9],  // E sus4
        ];
        let sChordIdx = 0;

        this.scheduleRandomEvent(7500, 11500, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const freqs = SANCTUARY_CHORDS[sChordIdx % SANCTUARY_CHORDS.length];
          sChordIdx++;

          const chordMaster = ctx.createGain();
          chordMaster.gain.setValueAtTime(0.0001, curr);
          chordMaster.gain.linearRampToValueAtTime(0.022, curr + 2.8); // Swell in
          chordMaster.gain.setValueAtTime(0.022, curr + 5.0);
          chordMaster.gain.linearRampToValueAtTime(0.0001, curr + 8.2); // Fade out
          chordMaster.connect(masterGain);

          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, curr);
            // Gentle warmth drift
            osc.frequency.linearRampToValueAtTime(freq + (idx % 2 === 0 ? 0.8 : -0.8), curr + 8.0);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.25, curr);
            osc.connect(g);
            g.connect(chordMaster);
            osc.start(curr);
            osc.stop(curr + 8.3);
          });
        });
        break;
      }

      // 8. Whispering Library Ruins: Vaulted stone room tone, drafts & faint flutter
      case 'whispering_library_ruins': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(105, now);
        lp.Q.setValueAtTime(1.5, now);
        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.12, now);
        brown.connect(lp);
        lp.connect(roomGain);
        roomGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, roomGain);

        const stoneOsc = ctx.createOscillator();
        stoneOsc.type = 'sine';
        stoneOsc.frequency.setValueAtTime(110, now);
        const stoneGain = ctx.createGain();
        stoneGain.gain.setValueAtTime(0.016, now);
        stoneOsc.connect(stoneGain);
        stoneGain.connect(masterGain);
        stoneOsc.start();
        sources.push(stoneOsc, stoneGain);

        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(880, now);
        bp.Q.setValueAtTime(3.4, now);
        this.createLfo(ctx, 0.06, 200, bp.frequency, sources);
        const draftGain = ctx.createGain();
        draftGain.gain.setValueAtTime(0.045, now);
        pink.connect(bp);
        bp.connect(draftGain);
        draftGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, draftGain);

        this.scheduleRandomEvent(6000, 11000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const fPink = this.createNoiseSource(ctx, 'pink');
          const fFilter = ctx.createBiquadFilter();
          fFilter.type = 'bandpass';
          fFilter.frequency.setValueAtTime(1200 + Math.random() * 300, curr);
          fFilter.Q.setValueAtTime(2.0, curr);
          const fGain = ctx.createGain();
          fGain.gain.setValueAtTime(0.024, curr);
          fGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.16);
          fPink.connect(fFilter);
          fFilter.connect(fGain);
          fGain.connect(masterGain);
          fPink.start(curr);
          fPink.stop(curr + 0.18);
        });
        break;
      }

      // 9. Calm Parchment Meadow: Minimalist gentle open field breeze
      case 'calm_parchment_meadow': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(380, now);
        lp.Q.setValueAtTime(0.8, now);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(120, now);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.12, now);
        this.createLfo(ctx, 0.05, 0.035, breezeGain.gain, sources);
        this.createLfo(ctx, 0.082, 45, lp.frequency, sources);
        pink.connect(lp);
        lp.connect(hp);
        hp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, lp, hp, breezeGain);
        break;
      }

      // 10. Campfire: Waving turbulent flames & authentic foreground wood crackling clusters
      case 'campfire': {
        // Turbulent waving flame combustion body (stereo)
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(320, now);
        bp.Q.setValueAtTime(1.4, now);
        const fireGain = ctx.createGain();
        fireGain.gain.setValueAtTime(0.08, now);
        this.createLfo(ctx, 1.6, 0.035, fireGain.gain, sources); // Flame waving turbulence
        pink.connect(bp);
        bp.connect(fireGain);
        fireGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, fireGain);

        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(180, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.07, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        // Continuous subtle wood sizzle & burning sap hiss
        const whiteSizzle = this.createNoiseSource(ctx, 'white');
        const sizzleFilter = ctx.createBiquadFilter();
        sizzleFilter.type = 'bandpass';
        sizzleFilter.frequency.setValueAtTime(2800, now);
        sizzleFilter.Q.setValueAtTime(2.8, now);
        const sizzleGain = ctx.createGain();
        sizzleGain.gain.setValueAtTime(0.016, now);
        this.createLfo(ctx, 11.2, 0.008, sizzleGain.gain, sources); // Fast erratic sizzle tremolo
        whiteSizzle.connect(sizzleFilter);
        sizzleFilter.connect(sizzleGain);
        sizzleGain.connect(masterGain);
        whiteSizzle.start();
        sources.push(whiteSizzle, sizzleFilter, sizzleGain);

        // Foreground wood crackling clusters (sharp snaps and resonant wood pops)
        this.scheduleRandomEvent(160, 420, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          // 1 to 3 micro-pops in rapid succession (splintering wood)
          const popCount = Math.random() > 0.65 ? (Math.random() > 0.4 ? 2 : 3) : 1;
          for (let p = 0; p < popCount; p++) {
            const pOffset = p * 0.035 + Math.random() * 0.02;

            // Sharp high-frequency wood crack
            const clickSrc = this.createNoiseSource(ctx, 'white');
            const cFilter = ctx.createBiquadFilter();
            cFilter.type = 'bandpass';
            cFilter.frequency.setValueAtTime(2200 + Math.random() * 2400, curr + pOffset);
            cFilter.Q.setValueAtTime(4.2, curr + pOffset);
            const cGain = ctx.createGain();
            const dur = 0.008 + Math.random() * 0.012;
            cGain.gain.setValueAtTime(0.045 + Math.random() * 0.035, curr + pOffset);
            cGain.gain.exponentialRampToValueAtTime(0.0001, curr + pOffset + dur);
            clickSrc.connect(cFilter);
            cFilter.connect(cGain);
            cGain.connect(masterGain);
            clickSrc.start(curr + pOffset);
            clickSrc.stop(curr + pOffset + dur + 0.01);

            // Resonant woody hollow pop thump
            const wOsc = ctx.createOscillator();
            const wGain = ctx.createGain();
            wOsc.type = 'sine';
            const wFreq = 520 + Math.random() * 260;
            wOsc.frequency.setValueAtTime(wFreq, curr + pOffset);
            wOsc.frequency.exponentialRampToValueAtTime(wFreq * 0.5, curr + pOffset + 0.022);
            wGain.gain.setValueAtTime(0.03, curr + pOffset);
            wGain.gain.exponentialRampToValueAtTime(0.0001, curr + pOffset + 0.022);
            wOsc.connect(wGain);
            wGain.connect(masterGain);
            wOsc.start(curr + pOffset);
            wOsc.stop(curr + pOffset + 0.025);
          }
        });
        break;
      }

      // 11. Merchant: Curiosity shop room tone, natural acoustic grandfather clock (1.8s, misses a beat) + decoupled counter sounds (coins rustling, counter pebbles, ledger writing)
      case 'merchant': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(140, now);
        lp.Q.setValueAtTime(1.0, now);
        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.08, now);
        brown.connect(lp);
        lp.connect(roomGain);
        roomGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, roomGain);

        // Acoustic Grandfather Clock: 1.8s cadence, mechanical escapement click + cabinet wood body resonance
        let tickToggle = false;
        let tickCounter = 0;
        this.scheduleRandomEvent(1780, 1820, intervalIds, ctx, masterGain, () => {
          tickCounter++;
          // Misses a beat every now and then (15% chance after 6 ticks)
          if (tickCounter > 6 && Math.random() < 0.16) {
            tickCounter = 0;
            return; // Antique pendulum hesitation / skip
          }

          const curr = ctx.currentTime;
          tickToggle = !tickToggle;

          // 1. Escapement anchor pallet drop (crisp metallic click)
          const escOsc = ctx.createOscillator();
          const escGain = ctx.createGain();
          escOsc.type = 'sine';
          escOsc.frequency.setValueAtTime(2900, curr);
          escGain.gain.setValueAtTime(0.024, curr);
          escGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.008);
          escOsc.connect(escGain);
          escGain.connect(masterGain);
          escOsc.start(curr);
          escOsc.stop(curr + 0.01);

          // 2. Oak cabinet hollow body resonance (385Hz tick / 295Hz tock)
          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'sine';
          bodyOsc.frequency.setValueAtTime(tickToggle ? 385 : 295, curr);
          bodyGain.gain.setValueAtTime(0.032, curr);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.038);
          bodyOsc.connect(bodyGain);
          bodyGain.connect(masterGain);
          bodyOsc.start(curr);
          bodyOsc.stop(curr + 0.042);
        });

        // Decoupled Merchant Counter Sounds (coins rustling, counter pebbles, ledger writing, catalog page turn)
        // Runs on an independent, non-synchronized 8-18s scheduler!
        this.scheduleRandomEvent(8000, 18000, intervalIds, ctx, masterGain, () => {
          const choice = Math.random();
          if (choice < 0.35) {
            // Coins rustling in purse
            const coinFile = Math.random() > 0.5 ? 'cards/chain_01.ogg' : 'cards/chain_02.ogg';
            this.playSample(coinFile, settings, 0.40, 0.08);
          } else if (choice < 0.60) {
            // Counter pebbles dropping on wood
            this.playSample('cards/stones_01.ogg', settings, 0.35, 0.06);
          } else if (choice < 0.80) {
            // Shopkeeper writing in ledger
            this.playSample('cards/pencil_speedwrite.wav', settings, 0.28, 0.08);
          } else {
            // Codex catalog page turn
            this.playSample('page_turn.mp3', settings, 0.30, 0.08);
          }
        });
        break;
      }

      // 12. Treasure: Subterranean chamber & infrequent, non-repetitive echoing water droplets
      case 'treasure': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(95, now);
        lp.Q.setValueAtTime(2.2, now);
        const vaultGain = ctx.createGain();
        vaultGain.gain.setValueAtTime(0.12, now);
        brown.connect(lp);
        lp.connect(vaultGain);
        vaultGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, vaultGain);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(65.4, now);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.02, now);
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start();
        sources.push(subOsc, subGain);

        // Infrequent, atmospheric water drips (every 14-26 seconds, varying patterns & pitches)
        this.scheduleRandomEvent(14000, 26000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const dropPattern = Math.random();
          const basePitch = 1350 + Math.random() * 850;

          if (dropPattern < 0.45) {
            // Pattern 1: Solitary crystal droplet with long cavern echo
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(basePitch, curr);
            osc.frequency.exponentialRampToValueAtTime(basePitch * 0.72, curr + 0.035);
            g.gain.setValueAtTime(0.038, curr);
            g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.035);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(curr);
            osc.stop(curr + 0.04);

            // Lingering cavern echo reflection
            const eOsc = ctx.createOscillator();
            const eGain = ctx.createGain();
            eOsc.type = 'sine';
            eOsc.frequency.setValueAtTime(basePitch * 0.85, curr + 0.32);
            eGain.gain.setValueAtTime(0.012, curr + 0.32);
            eGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.32 + 1.8);
            eOsc.connect(eGain);
            eGain.connect(masterGain);
            eOsc.start(curr + 0.32);
            eOsc.stop(curr + 2.2);
          } else if (dropPattern < 0.80) {
            // Pattern 2: Dual pitter-patter droplet
            const p2 = basePitch * (Math.random() > 0.5 ? 1.15 : 0.82);
            [
              { delay: 0, pitch: basePitch, vol: 0.032 },
              { delay: 0.22, pitch: p2, vol: 0.022 },
            ].forEach((d) => {
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(d.pitch, curr + d.delay);
              osc.frequency.exponentialRampToValueAtTime(d.pitch * 0.75, curr + d.delay + 0.03);
              g.gain.setValueAtTime(d.vol, curr + d.delay);
              g.gain.exponentialRampToValueAtTime(0.0001, curr + d.delay + 0.03);
              osc.connect(g);
              g.connect(masterGain);
              osc.start(curr + d.delay);
              osc.stop(curr + d.delay + 0.035);
            });
          } else {
            // Pattern 3: Soft hollow splash
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(basePitch * 0.9, curr);
            osc.frequency.exponentialRampToValueAtTime(basePitch * 0.5, curr + 0.045);
            g.gain.setValueAtTime(0.026, curr);
            g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.045);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(curr);
            osc.stop(curr + 0.05);
          }
        });
        break;
      }

      // 13. Mystery: Tritone curiosity drone & eerie draft
      case 'mystery': {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(98, now);
        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0.022, now);
        osc1.connect(g1);
        g1.connect(masterGain);
        osc1.start();
        sources.push(osc1, g1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(138.6, now);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.016, now);
        this.createLfo(ctx, 0.07, 0.008, g2.gain, sources);
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start();
        sources.push(osc2, g2);

        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1650, now);
        bp.Q.setValueAtTime(3.2, now);
        this.createLfo(ctx, 0.09, 250, bp.frequency, sources);
        const draftGain = ctx.createGain();
        draftGain.gain.setValueAtTime(0.035, now);
        pink.connect(bp);
        bp.connect(draftGain);
        draftGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, draftGain);
        break;
      }

      // 14. Map: Open road breeze & shifting harmonic fifths with organic variance
      case 'map': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(420, now);
        bp.Q.setValueAtTime(1.3, now);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.10, now);
        this.createLfo(ctx, 0.045, 0.035, breezeGain.gain, sources);
        pink.connect(bp);
        bp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, breezeGain);

        // Shifting harmonic tones with slow organic variance (no static drone!)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(130.8, now); // C3
        this.createLfo(ctx, 0.035, 16, osc1.frequency, sources); // slowly drifts C3 -> D3 -> Bb2
        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0.014, now);
        this.createLfo(ctx, 0.04, 0.007, g1.gain, sources); // swells in and out
        osc1.connect(g1);
        g1.connect(masterGain);
        osc1.start();
        sources.push(osc1, g1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(196.0, now); // G3
        this.createLfo(ctx, 0.028, 24, osc2.frequency, sources); // slowly drifts G3 -> A3 -> F3
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.011, now);
        this.createLfo(ctx, 0.055, 0.006, g2.gain, sources);
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start();
        sources.push(osc2, g2);

        // Occasional gentle parchment unroll / map edge flutter
        this.scheduleRandomEvent(9000, 18000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const pNoise = this.createNoiseSource(ctx, 'pink');
          const pFilter = ctx.createBiquadFilter();
          pFilter.type = 'bandpass';
          pFilter.frequency.setValueAtTime(950 + Math.random() * 250, curr);
          pFilter.Q.setValueAtTime(2.0, curr);
          const pGain = ctx.createGain();
          pGain.gain.setValueAtTime(0.02, curr);
          pGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.22);
          pNoise.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(masterGain);
          pNoise.start(curr);
          pNoise.stop(curr + 0.25);
        });
        break;
      }

      // 15. Main Menu: Antiquarian study room tone & natural acoustic grandfather clock (1.8s, misses a beat, NO merchant objects)
      case 'main_menu':
      default: {
        const pink = this.createNoiseSource(ctx, 'pink');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(160, now);
        lp.Q.setValueAtTime(0.9, now);
        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.08, now);
        pink.connect(lp);
        lp.connect(roomGain);
        roomGain.connect(masterGain);
        pink.start();
        sources.push(pink, lp, roomGain);

        // Natural Acoustic Grandfather Clock: 1.8s cadence, escapement click + cabinet wood resonance, skips a beat
        let toggle = false;
        let menuTickCounter = 0;
        this.scheduleRandomEvent(1780, 1820, intervalIds, ctx, masterGain, () => {
          menuTickCounter++;
          // Misses a beat every now and then (15% chance after 6 ticks)
          if (menuTickCounter > 6 && Math.random() < 0.16) {
            menuTickCounter = 0;
            return;
          }

          const curr = ctx.currentTime;
          toggle = !toggle;

          // 1. Escapement anchor pallet drop
          const escOsc = ctx.createOscillator();
          const escGain = ctx.createGain();
          escOsc.type = 'sine';
          escOsc.frequency.setValueAtTime(2800, curr);
          escGain.gain.setValueAtTime(0.022, curr);
          escGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.008);
          escOsc.connect(escGain);
          escGain.connect(masterGain);
          escOsc.start(curr);
          escOsc.stop(curr + 0.01);

          // 2. Oak cabinet hollow body resonance (380Hz tick / 295Hz tock)
          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'sine';
          bodyOsc.frequency.setValueAtTime(toggle ? 380 : 295, curr);
          bodyGain.gain.setValueAtTime(0.028, curr);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.038);
          bodyOsc.connect(bodyGain);
          bodyGain.connect(masterGain);
          bodyOsc.start(curr);
          bodyOsc.stop(curr + 0.042);
        });
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
