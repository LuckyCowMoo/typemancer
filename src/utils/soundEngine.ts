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
   * Audition any sound by sound ID, handling both file samples and synthesized engine audio.
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
}

export const soundEngine = new SoundEngine();
