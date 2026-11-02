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

    current.intervalIds.forEach((id) => window.clearInterval(id));

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

    this.buildAmbianceGraph(key, ctx, masterGain, sources, intervalIds);

    this.activeAmbiance = {
      key,
      gain: masterGain,
      sources,
      intervalIds,
    };
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
    intervalIds: number[]
  ): void {
    const now = ctx.currentTime;

    switch (key) {
      // 1. Rocky Desert: Canyon wind, howling dust & sandstone rumble
      case 'rocky_desert': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(460, now);
        bp.Q.setValueAtTime(2.2, now);
        this.createLfo(ctx, 0.065, 180, bp.frequency, sources);
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.14, now);
        pink.connect(bp);
        bp.connect(windGain);
        windGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, windGain);

        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(140, now);
        lp.Q.setValueAtTime(1.0, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.12, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        const white = this.createNoiseSource(ctx, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1600, now);
        const sandGain = ctx.createGain();
        sandGain.gain.setValueAtTime(0.035, now);
        this.createLfo(ctx, 0.11, 0.02, sandGain.gain, sources);
        white.connect(hp);
        hp.connect(sandGain);
        sandGain.connect(masterGain);
        white.start();
        sources.push(white, hp, sandGain);
        break;
      }

      // 2. Flowing Riverbank: Rushing currents, bubbling ripples & froth
      case 'flowing_riverbank': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(380, now);
        lp.Q.setValueAtTime(1.4, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.13, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        const pink1 = this.createNoiseSource(ctx, 'pink');
        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(820, now);
        bp1.Q.setValueAtTime(3.0, now);
        const ripGain = ctx.createGain();
        ripGain.gain.setValueAtTime(0.08, now);
        this.createLfo(ctx, 0.23, 0.035, ripGain.gain, sources);
        pink1.connect(bp1);
        bp1.connect(ripGain);
        ripGain.connect(masterGain);
        pink1.start();
        sources.push(pink1, bp1, ripGain);

        const pink2 = this.createNoiseSource(ctx, 'pink');
        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(1550, now);
        bp2.Q.setValueAtTime(3.8, now);
        const frothGain = ctx.createGain();
        frothGain.gain.setValueAtTime(0.045, now);
        this.createLfo(ctx, 0.36, 0.025, frothGain.gain, sources);
        pink2.connect(bp2);
        bp2.connect(frothGain);
        frothGain.connect(masterGain);
        pink2.start();
        sources.push(pink2, bp2, frothGain);
        break;
      }

      // 3. Magical Forest Clearing: Canopy whisper & leyline shimmer
      case 'magical_forest_clearing': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(520, now);
        bp.Q.setValueAtTime(1.1, now);
        this.createLfo(ctx, 0.08, 140, bp.frequency, sources);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.09, now);
        pink.connect(bp);
        bp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, breezeGain);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, now);
        const droneGain1 = ctx.createGain();
        droneGain1.gain.setValueAtTime(0.016, now);
        this.createLfo(ctx, 0.09, 2.5, osc1.frequency, sources);
        osc1.connect(droneGain1);
        droneGain1.connect(masterGain);
        osc1.start();
        sources.push(osc1, droneGain1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(648, now);
        const droneGain2 = ctx.createGain();
        droneGain2.gain.setValueAtTime(0.012, now);
        osc2.connect(droneGain2);
        droneGain2.connect(masterGain);
        osc2.start();
        sources.push(osc2, droneGain2);

        const white = this.createNoiseSource(ctx, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(2800, now);
        const shimGain = ctx.createGain();
        shimGain.gain.setValueAtTime(0.02, now);
        this.createLfo(ctx, 0.14, 0.012, shimGain.gain, sources);
        white.connect(hp);
        hp.connect(shimGain);
        shimGain.connect(masterGain);
        white.start();
        sources.push(white, hp, shimGain);
        break;
      }

      // 4. Volcanic Caldera: Magma drone, seismic rumble & steam vents
      case 'volcanic_caldera': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(85, now);
        lp.Q.setValueAtTime(2.8, now);
        this.createLfo(ctx, 0.055, 25, lp.frequency, sources);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.18, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(48, now);
        const subGain1 = ctx.createGain();
        subGain1.gain.setValueAtTime(0.038, now);
        osc1.connect(subGain1);
        subGain1.connect(masterGain);
        osc1.start();
        sources.push(osc1, subGain1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(73, now);
        const subGain2 = ctx.createGain();
        subGain2.gain.setValueAtTime(0.024, now);
        osc2.connect(subGain2);
        subGain2.connect(masterGain);
        osc2.start();
        sources.push(osc2, subGain2);

        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(460, now);
        bp.Q.setValueAtTime(1.8, now);
        const steamGain = ctx.createGain();
        steamGain.gain.setValueAtTime(0.04, now);
        this.createLfo(ctx, 0.07, 0.02, steamGain.gain, sources);
        pink.connect(bp);
        bp.connect(steamGain);
        steamGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, steamGain);
        break;
      }

      // 5. Crystal Bastion: Quartz harmonic drone & resonant chimes
      case 'crystal_bastion': {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(528, now);
        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0.022, now);
        this.createLfo(ctx, 0.04, 1.2, osc1.frequency, sources);
        osc1.connect(g1);
        g1.connect(masterGain);
        osc1.start();
        sources.push(osc1, g1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(792, now);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.015, now);
        this.createLfo(ctx, 0.06, 1.5, osc2.frequency, sources);
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start();
        sources.push(osc2, g2);

        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(528, now);
        bp.Q.setValueAtTime(8.5, now);
        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.035, now);
        pink.connect(bp);
        bp.connect(airGain);
        airGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, airGain);

        const pingInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const pitches = [1056, 1584, 2112, 2640];
          const pitch = pitches[Math.floor(Math.random() * pitches.length)];
          const pOsc = ctx.createOscillator();
          const pGain = ctx.createGain();
          pOsc.type = 'sine';
          pOsc.frequency.setValueAtTime(pitch, ctx.currentTime);
          pGain.gain.setValueAtTime(0.028, ctx.currentTime);
          pGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.3);
          pOsc.connect(pGain);
          pGain.connect(masterGain);
          pOsc.start(ctx.currentTime);
          pOsc.stop(ctx.currentTime + 1.35);
        }, 4800);
        intervalIds.push(pingInterval);
        break;
      }

      // 6. Fuming Ink Marsh: Murky swamp drone & simmering mud/ink bubbles
      case 'fuming_ink_marsh': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(175, now);
        lp.Q.setValueAtTime(2.0, now);
        const swampGain = ctx.createGain();
        swampGain.gain.setValueAtTime(0.14, now);
        brown.connect(lp);
        lp.connect(swampGain);
        swampGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, swampGain);

        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(480, now);
        bp.Q.setValueAtTime(2.2, now);
        const vaporGain = ctx.createGain();
        vaporGain.gain.setValueAtTime(0.05, now);
        this.createLfo(ctx, 0.12, 0.025, vaporGain.gain, sources);
        pink.connect(bp);
        bp.connect(vaporGain);
        vaporGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, vaporGain);

        const bubbleInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const curr = ctx.currentTime;
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          const startFreq = 220 + Math.random() * 80;
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(startFreq, curr);
          bOsc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, curr + 0.08);
          bGain.gain.setValueAtTime(0.035, curr);
          bGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.08);
          bOsc.connect(bGain);
          bGain.connect(masterGain);
          bOsc.start(curr);
          bOsc.stop(curr + 0.09);
        }, 2200);
        intervalIds.push(bubbleInterval);
        break;
      }

      // 7. Sunlit Sanctuary: Celestial major triad & warm radiant air
      case 'sunlit_sanctuary': {
        const chord = [220.0, 277.18, 329.63, 440.0];
        const chordGains = [0.016, 0.014, 0.012, 0.008];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          const g = ctx.createGain();
          g.gain.setValueAtTime(chordGains[idx], now);
          this.createLfo(ctx, 0.04 + idx * 0.015, 0.8, osc.frequency, sources);
          osc.connect(g);
          g.connect(masterGain);
          osc.start();
          sources.push(osc, g);
        });

        const pink = this.createNoiseSource(ctx, 'pink');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(620, now);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.065, now);
        this.createLfo(ctx, 0.04, 0.025, breezeGain.gain, sources);
        pink.connect(lp);
        lp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, lp, breezeGain);
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

        const flutterInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
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
        }, 6500);
        intervalIds.push(flutterInterval);
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

      // 10. Campfire: Warm crackling hearth & natural popping embers
      case 'campfire': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(360, now);
        bp.Q.setValueAtTime(1.6, now);
        const fireGain = ctx.createGain();
        fireGain.gain.setValueAtTime(0.09, now);
        pink.connect(bp);
        bp.connect(fireGain);
        fireGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, fireGain);

        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(200, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.08, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        const emberInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const curr = ctx.currentTime;
          const clickSrc = this.createNoiseSource(ctx, 'white');
          const cFilter = ctx.createBiquadFilter();
          cFilter.type = 'bandpass';
          cFilter.frequency.setValueAtTime(1400 + Math.random() * 1800, curr);
          cFilter.Q.setValueAtTime(3.5, curr);
          const cGain = ctx.createGain();
          const dur = 0.012 + Math.random() * 0.016;
          cGain.gain.setValueAtTime(0.02 + Math.random() * 0.025, curr);
          cGain.gain.exponentialRampToValueAtTime(0.0001, curr + dur);
          clickSrc.connect(cFilter);
          cFilter.connect(cGain);
          cGain.connect(masterGain);
          clickSrc.start(curr);
          clickSrc.stop(curr + dur + 0.01);
        }, 260);
        intervalIds.push(emberInterval);
        break;
      }

      // 11. Merchant: Curiosity shop interior, pendulum clock & subtle coin chime
      case 'merchant': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(160, now);
        lp.Q.setValueAtTime(1.0, now);
        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.10, now);
        brown.connect(lp);
        lp.connect(roomGain);
        roomGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, roomGain);

        let tickToggle = false;
        const clockInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const curr = ctx.currentTime;
          tickToggle = !tickToggle;
          const freq = tickToggle ? 740 : 560;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, curr);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.028, curr);
          g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.022);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(curr);
          osc.stop(curr + 0.025);
        }, 1000);
        intervalIds.push(clockInterval);

        const chimeInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const curr = ctx.currentTime;
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(Math.random() > 0.5 ? 880 : 1174, curr);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.018, curr);
          g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.9);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(curr);
          osc.stop(curr + 0.95);
        }, 14000);
        intervalIds.push(chimeInterval);
        break;
      }

      // 12. Treasure: Subterranean chamber & echoing water drips
      case 'treasure': {
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(110, now);
        lp.Q.setValueAtTime(2.2, now);
        const vaultGain = ctx.createGain();
        vaultGain.gain.setValueAtTime(0.13, now);
        brown.connect(lp);
        lp.connect(vaultGain);
        vaultGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, vaultGain);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(65.4, now);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.022, now);
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start();
        sources.push(subOsc, subGain);

        const dripInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const playDrip = (offsetSec: number, pitchStart: number, pitchEnd: number, vol: number) => {
            const curr = ctx.currentTime + offsetSec;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(pitchStart, curr);
            osc.frequency.exponentialRampToValueAtTime(pitchEnd, curr + 0.035);
            const g = ctx.createGain();
            g.gain.setValueAtTime(vol, curr);
            g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.035);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(curr);
            osc.stop(curr + 0.04);
          };
          playDrip(0, 1750, 1350, 0.038);
          playDrip(0.18, 1550, 1200, 0.014);
          playDrip(0.36, 1400, 1100, 0.006);
        }, 4400);
        intervalIds.push(dripInterval);
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

      // 14. Map: Open road breeze & adventurous fifth drone
      case 'map': {
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(440, now);
        bp.Q.setValueAtTime(1.3, now);
        const breezeGain = ctx.createGain();
        breezeGain.gain.setValueAtTime(0.11, now);
        this.createLfo(ctx, 0.05, 0.035, breezeGain.gain, sources);
        pink.connect(bp);
        bp.connect(breezeGain);
        breezeGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, breezeGain);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(130.8, now);
        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0.015, now);
        osc1.connect(g1);
        g1.connect(masterGain);
        osc1.start();
        sources.push(osc1, g1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(196.0, now);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.012, now);
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start();
        sources.push(osc2, g2);
        break;
      }

      // 15. Main Menu: Antiquarian study & clockwork pendulum
      case 'main_menu':
      default: {
        const pink = this.createNoiseSource(ctx, 'pink');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(170, now);
        lp.Q.setValueAtTime(0.9, now);
        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.09, now);
        pink.connect(lp);
        lp.connect(roomGain);
        roomGain.connect(masterGain);
        pink.start();
        sources.push(pink, lp, roomGain);

        let toggle = false;
        const clockInterval = window.setInterval(() => {
          if (ctx.state !== 'running' || !this.activeAmbiance || this.activeAmbiance.gain !== masterGain) return;
          const curr = ctx.currentTime;
          toggle = !toggle;
          const freq = toggle ? 680 : 510;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, curr);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.022, curr);
          g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.02);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(curr);
          osc.stop(curr + 0.024);
        }, 1000);
        intervalIds.push(clockInterval);
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
