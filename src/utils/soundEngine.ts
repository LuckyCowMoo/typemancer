import type { ConfirmSoundProfile, GameSettings, SoundProfile } from '../types/game';

export const CARD_SFX_MAP: Record<string, { sfx: string; volume?: number }> = {
  ink_strike: { sfx: 'cards/blade_01.ogg', volume: 0.75 },
  page_ward: { sfx: 'ward_block.ogg', volume: 0.78 },
  boulder_barrage: { sfx: 'cards/stones_01.ogg', volume: 0.85 },
  blotting_cloud: { sfx: 'cards/magicerase.ogg', volume: 0.72 },
  fire_breathing: { sfx: 'cards/flamethrower.ogg', volume: 0.78 },
  metallicize: { sfx: 'cards/metal_01.ogg', volume: 0.75 },
  well_laid_plans: { sfx: 'cards/book_01.ogg', volume: 0.7 },
  noxious_fumes: { sfx: 'cards/steam.ogg', volume: 0.72 },
  demon_form: { sfx: 'cards/creature_roar_01.ogg', volume: 0.82 },
  evolve: { sfx: 'cards/enchant.ogg', volume: 0.75 },
  tools_of_the_trade: { sfx: 'cards/metalClick.ogg', volume: 0.72 },
  caltrops: { sfx: 'cards/metal_small1.wav', volume: 0.72 },
  berserk: { sfx: 'cards/creature_roar_02.ogg', volume: 0.85 },
  echo_form: { sfx: 'cards/forcepulse.ogg', volume: 0.8 },
  accuracy: { sfx: 'cards/metalLatch.ogg', volume: 0.72 },
  juggernaut: { sfx: 'cards/metalPot1.ogg', volume: 0.82 },
  inflame: { sfx: 'cards/spell_fire_01.ogg', volume: 0.78 },
  feel_no_pain: { sfx: 'cards/magicshield.ogg', volume: 0.75 },
  steady_margins: { sfx: 'cards/item_wood_01.ogg', volume: 0.75 },
  flowing_quill: { sfx: 'cards/wind.ogg', volume: 0.7 },
  rain_of_full_stops: { sfx: 'cards/forcepush.ogg', volume: 0.8 },
  echoing_exclamations: { sfx: 'cards/metal_ringing.wav', volume: 0.75 },
  wraith_form: { sfx: 'cards/curse.ogg', volume: 0.75 },
  venomous_bite: { sfx: 'cards/bite_small.wav', volume: 0.75 },
  flurry_of_blows: { sfx: 'cards/swing3.wav', volume: 0.78 },
  heavy_blow: { sfx: 'cards/doorClose_1.ogg', volume: 0.85 },
  vampiric_bite: { sfx: 'cards/curse2.ogg', volume: 0.75 },
  barricade: { sfx: 'cards/bookClose.ogg', volume: 0.82 },
  twin_strike: { sfx: 'cards/swing2.wav', volume: 0.74 },
  prepare: { sfx: 'cards/bookFlip1.ogg', volume: 0.7 },
  reckless_charge: { sfx: 'cards/chop.ogg', volume: 0.82 },
  fortify: { sfx: 'cards/chain_01.ogg', volume: 0.78 },
  expose_weakness: { sfx: 'cards/knifeSlice.ogg', volume: 0.72 },
  shadow_strike: { sfx: 'cards/sword_unsheathe.wav', volume: 0.75 },
  adrenaline: { sfx: 'cards/bubble.wav', volume: 0.75 },
  shield_bash: { sfx: 'cards/bookPlace1.ogg', volume: 0.8 },
  lacerate: { sfx: 'cards/knifeSlice2.ogg', volume: 0.74 },
  execute: { sfx: 'cards/blade_02.ogg', volume: 0.85 },
  blur: { sfx: 'cards/wind2.ogg', volume: 0.72 },
  defend: { sfx: 'cards/blade_03.ogg', volume: 0.75 },
  backflip: { sfx: 'cards/bookFlip2.ogg', volume: 0.72 },
  fiery_slash: { sfx: 'cards/spell_fire_02.ogg', volume: 0.78 },
  weaken: { sfx: 'cards/steam.ogg', volume: 0.7 },
  corrosive_spit: { sfx: 'cards/creature_slime_01.ogg', volume: 0.78 },
  toxic_dart: { sfx: 'cards/shot.ogg', volume: 0.75 },
  cleave: { sfx: 'cards/swing.wav', volume: 0.8 },
  meteor_smash: { sfx: 'cards/explode.ogg', volume: 0.9 },
  warcry: { sfx: 'cards/creature_monster_01.ogg', volume: 0.8 },
  quick_slash: { sfx: 'cards/drawKnife1.ogg', volume: 0.74 },
  outmaneuver: { sfx: 'cards/clothBelt.ogg', volume: 0.7 },
  panic_button: { sfx: 'cards/metalPot2.ogg', volume: 0.82 },
  draining_touch: { sfx: 'cards/curse3.ogg', volume: 0.74 },
  thunder_strike: { sfx: 'cards/zap.ogg', volume: 0.82 },
  concentrate: { sfx: 'cards/spell_fire_03.ogg', volume: 0.76 },
  expertise: { sfx: 'cards/book_02.ogg', volume: 0.7 },
  iron_skin: { sfx: 'cards/chainmail1.wav', volume: 0.78 },
  piercing_stab: { sfx: 'cards/knifeSlice.ogg', volume: 0.75 },
  ink_spill: { sfx: 'cards/creature_slime_02.ogg', volume: 0.76 },
  wild_swing: { sfx: 'cards/metalPot3.ogg', volume: 0.8 },
  blunt_force: { sfx: 'cards/bookPlace2.ogg', volume: 0.82 },
  sweeping_blow: { sfx: 'cards/clothBelt2.ogg', volume: 0.74 },
  sunder: { sfx: 'cards/cloth4.ogg', volume: 0.78 },
  smoke_bomb: { sfx: 'cards/magicdrop.ogg', volume: 0.74 },
  tactics: { sfx: 'cards/beltHandle1.ogg', volume: 0.7 },
  entrench: { sfx: 'cards/chain_02.ogg', volume: 0.82 },
  catalyst: { sfx: 'cards/bottle.wav', volume: 0.78 },
  empower: { sfx: 'cards/blessing.ogg', volume: 0.8 },
  bandaging: { sfx: 'cards/heal.ogg', volume: 0.82 },
  meditate: { sfx: 'cards/blessing2.ogg', volume: 0.76 },
  calculated_gamble: { sfx: 'cards/bookFlip3.ogg', volume: 0.72 },
  acrobatics: { sfx: 'cards/book_03.ogg', volume: 0.7 },
  dodge: { sfx: 'cards/cloth1.ogg', volume: 0.68 },
  deflect: { sfx: 'cards/spell_01.ogg', volume: 0.78 },
  deep_breath: { sfx: 'cards/wind.ogg', volume: 0.68 },
  final_draft: { sfx: 'cards/explode1.ogg', volume: 0.88 },
  blank_page_sanctuary: { sfx: 'cards/blessing3.ogg', volume: 0.82 },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sampleCache: Map<string, HTMLAudioElement> = new Map();

  private playSample(
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
        instance.playbackRate = 1 + (Math.random() * 2 - 1) * rateJitter;
      }
      instance.play().catch(() => {});
    } catch {
      // Ignore audio playback errors if blocked by browser autoplay policy
    }
  }

  public playShuffle(settings: GameSettings): void {
    this.playSample('shuffle.wav', settings, 0.7, 0.04);
  }

  public playDrawCard(settings: GameSettings): void {
    this.playSample('draw.wav', settings, 0.55, 0.08);
  }

  public playCardCast(settings: GameSettings): void {
    this.playSample('play_card.wav', settings, 0.72, 0.06);
  }

  /**
   * Plays the distinctive custom sound effect assigned to a specific card,
   * layering in the subtle tactile card flick for satisfying audio feedback.
   */
  public playCardSound(cardId: string, settings: GameSettings): void {
    // Subtle physical card flick sound
    this.playCardCast(settings);

    // Look up card's unique SFX from registry
    const mapped = CARD_SFX_MAP[cardId];
    if (mapped) {
      this.playSample(mapped.sfx, settings, mapped.volume ?? 0.76, 0.05);
      return;
    }

    // Default fallback
    this.playSample('cards/blade_01.ogg', settings, 0.7, 0.05);
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
    this.playSample('attack_hit.ogg', settings, 0.65, 0.08);
  }

  public playWardBlock(settings: GameSettings): void {
    this.playSample('ward_block.ogg', settings, 0.65, 0.06);
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

  public playKeystroke(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const vol = Math.min(1, Math.max(0, settings.volume)) * 0.25;
    const profile: SoundProfile = settings.typingSound;

    if (profile === 'mechanical_typewriter') {
      // Crisp metallic striker click + short low thud
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const pitchJitter = 750 + Math.random() * 180;
      osc.frequency.setValueAtTime(pitchJitter, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.045);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (profile === 'vintage_telegraph') {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);

      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (profile === 'arcane_quill') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980 + Math.random() * 240, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.045);
    } else {
      // soft_chalk
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340 + Math.random() * 70, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

      gain.gain.setValueAtTime(vol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.035);
    }
  }

  public playBackspace(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

    gain.gain.setValueAtTime(settings.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playConfirm(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const vol = Math.min(1, Math.max(0, settings.volume)) * 0.35;
    const profile: ConfirmSoundProfile = settings.confirmSound;

    if (profile === 'carriage_bell') {
      // Classic bright typewriter carriage return bell ("ding!")
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1760, now); // A6
      osc2.frequency.setValueAtTime(3520, now); // Harmonic

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (profile === 'spell_chime') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol * 0.6, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } else {
      // heavy_stamp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.14);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
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
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(135, now + 0.08);

    gain.gain.setValueAtTime(settings.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }
}

export const soundEngine = new SoundEngine();
