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
  private loopBufferCache: Map<string, AudioBuffer> = new Map();
  private loopBufferLoading: Map<string, Promise<AudioBuffer | null>> = new Map();
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
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        this.preloadTypingSounds();
        this.loadAudioBuffer('ambiance/campfire_loop.ogg').catch(() => {});
        this.loadAudioBuffer('ambiance/river_stony.ogg').catch(() => {});
      };
      window.addEventListener('pointerdown', resumeAudio, { passive: true });
      window.addEventListener('keydown', resumeAudio, { passive: true });
      // Preload typing audio buffers immediately so they are hot in memory
      this.preloadTypingSounds();
    }
  }

  /**
   * Preload all acoustic keystroke, backspace, and confirm audio files into Web Audio RAM buffers.
   */
  public preloadTypingSounds(): void {
    const list = [
      ...this.typewriterSamples,
      ...this.keyboardSamples,
      ...this.quillSamples,
      ...this.chalkSamples,
      'typing/carriage_bell.wav',
      'cards/enchant.ogg',
      'cards/doorClose_1.wav',
      'typing/keyboard_3.wav',
      'draw.wav',
      'play_card.wav',
      'shuffle.wav',
    ];
    for (const item of list) {
      this.loadAudioBuffer(item).catch(() => {});
    }
  }

  /**
   * Asynchronously load and cache a Web Audio AudioBuffer for seamless looping ambiances and zero-latency SFX.
   */
  public async loadAudioBuffer(path: string): Promise<AudioBuffer | null> {
    const cleanPath = path.replace(/^\.?\/?(assets\/sfx\/)?/, '');
    const cached = this.loopBufferCache.get(cleanPath) || this.loopBufferCache.get(path);
    if (cached) return cached;

    const existing = this.loopBufferLoading.get(cleanPath) || this.loopBufferLoading.get(path);
    if (existing) return existing;

    const loadPromise = (async () => {
      const ctx = this.getContext();
      if (!ctx) return null;
      try {
        const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : '/';
        const src = `${base.replace(/\/$/, '')}/assets/sfx/${cleanPath}`;
        const resp = await fetch(src);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} fetching ${src}`);
        }
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        this.loopBufferCache.set(path, audioBuf);
        this.loopBufferCache.set(cleanPath, audioBuf);
        return audioBuf;
      } catch (err) {
        console.warn(`[SoundEngine] Failed to load audio buffer: ${path}`, err);
        return null;
      } finally {
        this.loopBufferLoading.delete(path);
        this.loopBufferLoading.delete(cleanPath);
      }
    })();

    this.loopBufferLoading.set(path, loadPromise);
    this.loopBufferLoading.set(cleanPath, loadPromise);
    return loadPromise;
  }

  /**
   * Play an AudioBuffer via the Web Audio API.
   * Has true 0ms latency, zero HTMLMediaElement overhead, and no browser concurrency limits.
   */
  public playBuffer(
    buffer: AudioBuffer,
    settings: GameSettings,
    volumeMultiplier = 0.65,
    rateJitter = 0.06
  ): boolean {
    if (settings.muted || settings.volume <= 0) return false;
    const ctx = this.getContext();
    if (!ctx) return false;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      if (rateJitter > 0) {
        source.playbackRate.value = Math.max(0.6, 1 + (Math.random() * 2 - 1) * rateJitter);
      }
      const gain = ctx.createGain();
      const vol = Math.min(1, Math.max(0, settings.volume * volumeMultiplier));
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Seamlessly loop an AudioBufferSourceNode connected into an ambiance graph.
   */
  private playLoopSource(
    path: string,
    ctx: AudioContext,
    targetGain: GainNode,
    sources: (AudioScheduledSourceNode | AudioNode)[],
    gainMultiplier = 1.0,
    filter?: BiquadFilterNode
  ): void {
    const nodeGain = ctx.createGain();
    nodeGain.gain.setValueAtTime(gainMultiplier, ctx.currentTime);

    if (filter) {
      nodeGain.connect(filter);
      filter.connect(targetGain);
      sources.push(filter);
    } else {
      nodeGain.connect(targetGain);
    }
    sources.push(nodeGain);

    const startBuffer = (buffer: AudioBuffer) => {
      if (!this.activeAmbiance || targetGain !== this.activeAmbiance.gain) return;
      try {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(nodeGain);
        src.start();
        sources.push(src);
      } catch {}
    };

    const cached = this.loopBufferCache.get(path);
    if (cached) {
      startBuffer(cached);
    } else {
      this.loadAudioBuffer(path).then((buf) => {
        if (buf) startBuffer(buf);
      });
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
      const cleanPath = filename.replace(/^\.?\/?(assets\/sfx\/)?/, '');

      // 1. If buffer is cached in Web Audio RAM, play with 0ms latency and zero DOM overhead
      const cachedBuffer = this.loopBufferCache.get(cleanPath) || this.loopBufferCache.get(filename);
      if (cachedBuffer) {
        this.playBuffer(cachedBuffer, settings, volumeMultiplier, rateJitter);
        return;
      }

      // 2. Queue asynchronous decoding into Web Audio API cache for future plays
      this.loadAudioBuffer(cleanPath).catch(() => {});

      // 3. Fallback: HTMLAudioElement playback (reusing finished elements where possible)
      const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : '/';
      const src = `${base.replace(/\/$/, '')}/assets/sfx/${cleanPath}`;
      let baseAudio = this.sampleCache.get(src);
      if (!baseAudio) {
        baseAudio = new Audio(src);
        baseAudio.preload = 'auto';
        this.sampleCache.set(src, baseAudio);
      }
      if (baseAudio.paused || baseAudio.ended) {
        baseAudio.currentTime = 0;
        baseAudio.volume = Math.min(1, Math.max(0, settings.volume * volumeMultiplier));
        if (rateJitter > 0) {
          baseAudio.playbackRate = Math.max(0.6, 1 + (Math.random() * 2 - 1) * rateJitter);
        }
        baseAudio.play().catch(() => {});
        return;
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
      }, i * 120);
    }
  }

  public playDrawCard(settings: GameSettings): void {
    this.playDrawCards(1, settings);
  }

  /**
   * Play card discard sound effect in succession for cards sliding out.
   */
  public playDiscardCards(count: number, settings: GameSettings): void {
    const total = Math.max(1, Math.min(10, count));
    for (let i = 0; i < total; i++) {
      window.setTimeout(() => {
        this.playSample('page_turn.mp3', settings, 0.48, 0.08);
      }, i * 90);
    }
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
   * Authentic tactile typing sound execution using multi-sampled acoustic audio files
   * with zero-latency Web Audio buffers and instantaneous synthesized fallbacks.
   */
  public playKeystroke(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;

    const profile: SoundProfile = settings.typingSound;
    let pool: string[];
    let volMult = 0.54;

    if (profile === 'mechanical_typewriter') {
      pool = this.typewriterSamples;
      volMult = 0.56;
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
    const cleanPath = sample.replace(/^\.?\/?(assets\/sfx\/)?/, '');
    const buffer = this.loopBufferCache.get(cleanPath) || this.loopBufferCache.get(sample);

    if (buffer) {
      this.playBuffer(buffer, settings, volMult, 0.08);
      return;
    }

    // Queue buffer load in background
    this.loadAudioBuffer(cleanPath).catch(() => {});

    // Immediate synthesized click fallback so keystroke is NEVER dropped or silent
    this.playSynthesizedKeystroke(profile, settings, volMult);
  }

  public playBackspace(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const cleanPath = 'typing/keyboard_3.wav';
    const buffer = this.loopBufferCache.get(cleanPath) || this.loopBufferCache.get('assets/sfx/' + cleanPath);
    if (buffer) {
      this.playBuffer(buffer, settings, 0.45, 0.12);
      return;
    }
    this.loadAudioBuffer(cleanPath).catch(() => {});

    // Immediate synthesized reverse key click
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.045);
    gain.gain.setValueAtTime(settings.volume * 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playConfirm(settings: GameSettings): void {
    if (settings.muted || settings.volume <= 0) return;
    const profile: ConfirmSoundProfile = settings.confirmSound;

    let samplePath = 'typing/carriage_bell.wav';
    let vol = 0.72;
    if (profile === 'spell_chime') {
      samplePath = 'cards/enchant.ogg';
      vol = 0.68;
    } else if (profile === 'heavy_stamp') {
      samplePath = 'cards/doorClose_1.wav';
      vol = 0.75;
    }

    const cleanPath = samplePath.replace(/^\.?\/?(assets\/sfx\/)?/, '');
    const buffer = this.loopBufferCache.get(cleanPath) || this.loopBufferCache.get(samplePath);
    if (buffer) {
      this.playBuffer(buffer, settings, vol, 0.03);
      return;
    }
    this.loadAudioBuffer(cleanPath).catch(() => {});
    this.playSynthesizedConfirm(profile, settings);
  }

  private playSynthesizedKeystroke(profile: SoundProfile, settings: GameSettings, volMult = 0.52): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = Math.min(1, Math.max(0, settings.volume * volMult));

    if (profile === 'mechanical_typewriter') {
      // 1. High-frequency metallic typebar slap (bandpass filtered noise burst)
      const sampleRate = ctx.sampleRate;
      const numSamples = Math.floor(sampleRate * 0.02);
      const noiseBuf = ctx.createBuffer(1, numSamples, sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < numSamples; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / numSamples);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2800 + Math.random() * 400, now);
      bp.Q.setValueAtTime(3.5, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(vol * 0.45, now);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.02);

      // 2. Heavy mechanical key chassis strike
      const osc = ctx.createOscillator();
      const oGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.024);
      oGain.gain.setValueAtTime(vol * 0.35, now);
      oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);
      osc.connect(oGain);
      oGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.026);
    } else if (profile === 'vintage_telegraph') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(950 + Math.random() * 150, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.018);
      gain.gain.setValueAtTime(vol * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.022);
    } else if (profile === 'arcane_quill') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980 + Math.random() * 240, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.035);
      gain.gain.setValueAtTime(vol * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else {
      // Soft chalk scrape
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(170, now + 0.028);
      gain.gain.setValueAtTime(vol * 0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.032);
    }
  }

  private playSynthesizedConfirm(profile: ConfirmSoundProfile, settings: GameSettings): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = Math.min(1, Math.max(0, settings.volume)) * 0.35;

    if (profile === 'carriage_bell') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1760, now);
      osc2.frequency.setValueAtTime(3520, now);
      gain.gain.setValueAtTime(vol * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (profile === 'spell_chime') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol * 0.5, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
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

    // CRITICAL: Initialize activeAmbiance BEFORE buildAmbianceGraph so that any
    // preloaded/cached AudioBuffers (e.g. campfire_loop, river_stony) pass the
    // activeAmbiance check and immediately begin looping!
    this.activeAmbiance = {
      key,
      gain: masterGain,
      sources,
      intervalIds,
    };

    this.buildAmbianceGraph(key, ctx, masterGain, sources, intervalIds, settings);
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
      // 1. Rocky Desert: Canyon wind, howling dust & sandstone rumble + organic wind gusts & audible falling rock cascades
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

        // High sand blowing in the wind: completely randomized Brownian drift (no predictable LFO cycle!)
        const white = this.createNoiseSource(ctx, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1800, now);
        const sandGain = ctx.createGain();
        sandGain.gain.setValueAtTime(0.022, now);
        white.connect(hp);
        hp.connect(sandGain);
        sandGain.connect(masterGain);
        white.start();
        sources.push(white, hp, sandGain);

        // Continuously modulate sand wind volume and frequency unpredictably like real organic desert gusts
        this.scheduleRandomEvent(1100, 3200, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const rampDur = 1.0 + Math.random() * 2.2;
          const targetVol = 0.006 + Math.random() * 0.038;
          const targetFreq = 1350 + Math.random() * 1300;
          sandGain.gain.cancelScheduledValues(curr);
          sandGain.gain.setValueAtTime(sandGain.gain.value, curr);
          sandGain.gain.linearRampToValueAtTime(targetVol, curr + rampDur);
          hp.frequency.cancelScheduledValues(curr);
          hp.frequency.setValueAtTime(hp.frequency.value, curr);
          hp.frequency.linearRampToValueAtTime(targetFreq, curr + rampDur);
        });

        // Helper to synthesize a distant sandstone rock bounce against a canyon cliff ledge
        const playDistantRockBounce = (
          impactTime: number,
          mass: 'heavy' | 'medium' | 'small',
          gainMul = 1.0,
          triggerEcho = true
        ) => {
          // Distance lowpass filter: distance absorbs high frequencies, placing the sound deep into the canyon background
          const distFilter = ctx.createBiquadFilter();
          distFilter.type = 'lowpass';
          distFilter.frequency.setValueAtTime(mass === 'heavy' ? 1000 : mass === 'medium' ? 1400 : 1800, impactTime);
          distFilter.Q.setValueAtTime(0.7, impactTime);
          distFilter.connect(masterGain);

          // 1. Solid sandstone impact body resonance (sine pitch drop simulating rock mass)
          const bodyOsc = ctx.createOscillator();
          bodyOsc.type = 'sine';
          const startPitch = mass === 'heavy' ? 150 + Math.random() * 25 : mass === 'medium' ? 220 + Math.random() * 35 : 320 + Math.random() * 50;
          const endPitch = startPitch * 0.42;
          const dur = mass === 'heavy' ? 0.055 : mass === 'medium' ? 0.042 : 0.030;
          bodyOsc.frequency.setValueAtTime(startPitch, impactTime);
          bodyOsc.frequency.exponentialRampToValueAtTime(endPitch, impactTime + dur);

          const bodyGain = ctx.createGain();
          const baseVol = (mass === 'heavy' ? 0.055 : mass === 'medium' ? 0.042 : 0.026) * gainMul;
          bodyGain.gain.setValueAtTime(baseVol, impactTime);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + dur);

          bodyOsc.connect(bodyGain);
          bodyGain.connect(distFilter);
          bodyOsc.start(impactTime);
          bodyOsc.stop(impactTime + dur + 0.01);

          // 2. Sandstone fracture crunch (bandpassed noise impulse)
          const cNoise = this.createNoiseSource(ctx, 'pink');
          const cFilter = ctx.createBiquadFilter();
          cFilter.type = 'bandpass';
          const centerFreq = mass === 'heavy' ? 620 : mass === 'medium' ? 950 : 1350;
          cFilter.frequency.setValueAtTime(centerFreq + (Math.random() * 120 - 60), impactTime);
          cFilter.Q.setValueAtTime(3.2, impactTime);

          const cGain = ctx.createGain();
          const cVol = (mass === 'heavy' ? 0.038 : mass === 'medium' ? 0.030 : 0.018) * gainMul;
          cGain.gain.setValueAtTime(cVol, impactTime);
          cGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + dur * 1.1);

          cNoise.connect(cFilter);
          cFilter.connect(cGain);
          cGain.connect(distFilter);
          cNoise.start(impactTime);
          cNoise.stop(impactTime + dur * 1.2);

          // 3. Canyon wall slapback echo reflection (delayed 200-340ms, muffled reflection)
          if (triggerEcho) {
            const echoDelay = 0.20 + Math.random() * 0.14;
            const echoTime = impactTime + echoDelay;
            const echoOsc = ctx.createOscillator();
            echoOsc.type = 'sine';
            echoOsc.frequency.setValueAtTime(startPitch * 0.78, echoTime);
            echoOsc.frequency.exponentialRampToValueAtTime(endPitch * 0.7, echoTime + 0.08);

            const echoGain = ctx.createGain();
            const echoVol = baseVol * 0.28;
            echoGain.gain.setValueAtTime(echoVol, echoTime);
            echoGain.gain.exponentialRampToValueAtTime(0.0001, echoTime + 0.12);

            echoOsc.connect(echoGain);
            echoGain.connect(distFilter);
            echoOsc.start(echoTime);
            echoOsc.stop(echoTime + 0.14);
          }
        };

        // Distant sandstone rockfalls tumbling down cliff ledges (less frequent: every 24-52s, varied variations)
        this.scheduleRandomEvent(24000, 52000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const variation = Math.random();

          if (variation < 0.45) {
            // Variation 1: Multi-bounce boulder cascading down cliff ledges
            // Impacts accelerate under gravity as distance between ledges decreases, finishing with tumbling pebbles
            const bounces: { offset: number; mass: 'heavy' | 'medium' | 'small'; gain: number }[] = [
              { offset: 0.00, mass: 'medium', gain: 0.85 }, // initial break & first ledge strike
              { offset: 0.38, mass: 'heavy', gain: 1.00 },  // second lower ledge impact (hard hit)
              { offset: 0.69, mass: 'medium', gain: 0.78 }, // third ledge bounce
              { offset: 0.92, mass: 'small', gain: 0.60 },  // fourth ledge bounce
              { offset: 1.10, mass: 'small', gain: 0.45 },  // rolls off onto scree
              { offset: 1.24, mass: 'small', gain: 0.32 },  // tumbling pebble
              { offset: 1.36, mass: 'small', gain: 0.20 },  // final settling stone
            ];
            bounces.forEach((b) => {
              playDistantRockBounce(curr + b.offset, b.mass, b.gain, b.mass === 'heavy');
            });
          } else if (variation < 0.78) {
            // Variation 2: Talus / Scree slope shower (loose gravel & stones skittering down a canyon chute)
            playDistantRockBounce(curr, 'medium', 0.7, false);
            const pebbleCount = 7 + Math.floor(Math.random() * 5);
            for (let i = 0; i < pebbleCount; i++) {
              const pOffset = 0.12 + Math.pow(i / pebbleCount, 1.3) * 1.5 + Math.random() * 0.08;
              const pGain = (0.2 + Math.random() * 0.35) * (1 - i / (pebbleCount * 1.2));
              playDistantRockBounce(curr + pOffset, 'small', pGain, false);
            }
          } else {
            // Variation 3: Distant high cliff slab drop (prolonged freefall followed by thunderous distant impact & secondary bounce)
            playDistantRockBounce(curr, 'small', 0.5, false); // initial dislodge clink
            // Freefall drop silence for 0.52s... then heavy canyon ledge collision!
            playDistantRockBounce(curr + 0.52, 'heavy', 1.15, true);
            playDistantRockBounce(curr + 0.94, 'medium', 0.80, true);
            playDistantRockBounce(curr + 1.22, 'small', 0.50, false);
            playDistantRockBounce(curr + 1.40, 'small', 0.30, false);
          }
        });

        // Occasional desert tumbleweed rustling across canyon floor (every 15-26s)
        this.scheduleRandomEvent(15000, 26000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const tNoise = this.createNoiseSource(ctx, 'pink');
          const tFilter = ctx.createBiquadFilter();
          tFilter.type = 'bandpass';
          tFilter.frequency.setValueAtTime(750, curr);
          tFilter.frequency.linearRampToValueAtTime(1600, curr + 0.7);
          tFilter.frequency.linearRampToValueAtTime(700, curr + 1.4);
          tFilter.Q.setValueAtTime(2.2, curr);
          const tGain = ctx.createGain();
          tGain.gain.setValueAtTime(0.001, curr);
          tGain.gain.linearRampToValueAtTime(0.032, curr + 0.7);
          tGain.gain.linearRampToValueAtTime(0.0001, curr + 1.4);
          tNoise.connect(tFilter);
          tFilter.connect(tGain);
          tGain.connect(masterGain);
          tNoise.start(curr);
          tNoise.stop(curr + 1.45);
        });
        break;
      }

      // 2. Flowing Riverbank: Authentic recorded mountain river stream with stone bed & liquid trickles + Andy Farnell physical acoustics
      case 'flowing_riverbank': {
        const riverHp = ctx.createBiquadFilter();
        riverHp.type = 'highpass';
        riverHp.frequency.setValueAtTime(110, now);
        riverHp.Q.setValueAtTime(0.7, now);

        // Seamless authentic audio recording of stony river stream
        this.playLoopSource('ambiance/river_stony.ogg', ctx, masterGain, sources, 0.22, riverHp);

        // Layer 1: Deep rolling river body (brown noise filtered through lowpass with slow swell LFO)
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(340, now);
        lp.Q.setValueAtTime(1.3, now);
        this.createLfo(ctx, 0.16, 45, lp.frequency, sources);
        const currentGain = ctx.createGain();
        currentGain.gain.setValueAtTime(0.065, now);
        this.createLfo(ctx, 0.12, 0.02, currentGain.gain, sources);
        brown.connect(lp);
        lp.connect(currentGain);
        currentGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, currentGain);

        // Layer 2: Surface churning foam & white water rush (bandpassed pink noise with slow turbulence)
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1350, now);
        bp.Q.setValueAtTime(1.1, now);
        this.createLfo(ctx, 0.22, 180, bp.frequency, sources);
        const surfGain = ctx.createGain();
        surfGain.gain.setValueAtTime(0.038, now);
        this.createLfo(ctx, 0.18, 0.012, surfGain.gain, sources);
        pink.connect(bp);
        bp.connect(surfGain);
        surfGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, surfGain);

        // Layer 3: Stochastic water bubbles & droplet ripples (Andy Farnell resonant cavity model)
        // Frequent natural bubbling plops every 120ms to 360ms
        this.scheduleRandomEvent(120, 360, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const baseFreq = 950 + Math.random() * 1250;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, curr);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, curr + 0.042);
          g.gain.setValueAtTime(0.001, curr);
          g.gain.linearRampToValueAtTime(0.022 + Math.random() * 0.012, curr + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.048);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(curr);
          osc.stop(curr + 0.052);
        });

        // Layer 4: Occasional clear water eddy splash over mossy river stones (every 3.5-7.5s)
        this.scheduleRandomEvent(3500, 7500, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          [0, 0.06].forEach((offset, idx) => {
            const t = curr + offset;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            const freq = (1400 + Math.random() * 600) * (idx === 0 ? 1 : 1.25);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.68, t + 0.035);
            g.gain.setValueAtTime(0.016, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.04);
          });
        });
        break;
      }

      // 3. Magical Forest Clearing: Canopy whisper & gentle Celtic woodland acoustic windchimes stirred by breeze
      case 'magical_forest_clearing': {
        // Rustling woodland canopy breeze
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(460, now);
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
        hp.frequency.setValueAtTime(2800, now);
        const shimGain = ctx.createGain();
        shimGain.gain.setValueAtTime(0.012, now);
        this.createLfo(ctx, 0.12, 0.006, shimGain.gain, sources);
        white.connect(hp);
        hp.connect(shimGain);
        shimGain.connect(masterGain);
        white.start();
        sources.push(white, hp, shimGain);

        // Celtic treetop acoustic windchimes: pentatonic resonance stirred by woodland gusts (every 7-13s)
        const CHIME_PITCHES = [659.3, 784.0, 880.0, 987.8, 1174.7, 1318.5]; // E5, G5, A5, B5, D6, E6
        this.scheduleRandomEvent(7000, 13000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const noteCount = 2 + Math.floor(Math.random() * 3);
          for (let i = 0; i < noteCount; i++) {
            const chimeDelay = i * (0.06 + Math.random() * 0.12);
            const pitch = CHIME_PITCHES[Math.floor(Math.random() * CHIME_PITCHES.length)];

            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(pitch, curr + chimeDelay);

            // Resonant acoustic chime strike & long pure decay
            const decay = 1.6 + Math.random() * 1.0;
            g.gain.setValueAtTime(0.022 / Math.sqrt(noteCount), curr + chimeDelay);
            g.gain.exponentialRampToValueAtTime(0.0001, curr + chimeDelay + decay);

            osc.connect(g);
            g.connect(masterGain);
            osc.start(curr + chimeDelay);
            osc.stop(curr + chimeDelay + decay + 0.05);
          }
        });
        break;
      }

      // 4. Volcanic Caldera / Seismic Vents: Restored physical magma rumble + varied pressurized steam vents
      case 'volcanic_caldera': {
        // Deep subterranean magma rumble (restored full presence!)
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(95, now);
        lp.Q.setValueAtTime(2.4, now);
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.24, now);
        brown.connect(lp);
        lp.connect(brownGain);
        brownGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, brownGain);

        // Low-mid magma body presence
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(155, now);
        bp.Q.setValueAtTime(1.8, now);
        const magmaGain = ctx.createGain();
        magmaGain.gain.setValueAtTime(0.12, now);
        pink.connect(bp);
        bp.connect(magmaGain);
        magmaGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, magmaGain);

        // Sub-bass ground tremor tones
        const sub1 = ctx.createOscillator();
        sub1.type = 'sine';
        sub1.frequency.setValueAtTime(48, now);
        const subGain1 = ctx.createGain();
        subGain1.gain.setValueAtTime(0.065, now);
        this.createLfo(ctx, 0.12, 0.025, subGain1.gain, sources); // slow seismic trembling
        sub1.connect(subGain1);
        subGain1.connect(masterGain);
        sub1.start();
        sources.push(sub1, subGain1);

        const sub2 = ctx.createOscillator();
        sub2.type = 'sine';
        sub2.frequency.setValueAtTime(74, now);
        const subGain2 = ctx.createGain();
        subGain2.gain.setValueAtTime(0.045, now);
        sub2.connect(subGain2);
        subGain2.connect(masterGain);
        sub2.start();
        sources.push(sub2, subGain2);

        // Periodic tectonic ground shift surge (every 8-15s)
        this.scheduleRandomEvent(8000, 15000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          brownGain.gain.cancelScheduledValues(curr);
          brownGain.gain.setValueAtTime(0.24, curr);
          brownGain.gain.linearRampToValueAtTime(0.36, curr + 1.2);
          brownGain.gain.linearRampToValueAtTime(0.24, curr + 2.8);
        });

        // Varied pressurized steam vent eruptions (every 11-19s)
        this.scheduleRandomEvent(11000, 19000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const ventType = Math.random();

          if (ventType < 0.40) {
            // Variation 1: Massive thermal geyser roar & prolonged diffusion (3.8s)
            const sNoise = this.createNoiseSource(ctx, 'white');
            const sFilter = ctx.createBiquadFilter();
            sFilter.type = 'bandpass';
            sFilter.frequency.setValueAtTime(500, curr);
            sFilter.frequency.exponentialRampToValueAtTime(2400, curr + 0.35);
            sFilter.frequency.linearRampToValueAtTime(1200, curr + 2.0);
            sFilter.frequency.linearRampToValueAtTime(600, curr + 3.8);
            sFilter.Q.setValueAtTime(2.4, curr);

            const sGain = ctx.createGain();
            sGain.gain.setValueAtTime(0.001, curr);
            sGain.gain.linearRampToValueAtTime(0.11, curr + 0.35);
            sGain.gain.setValueAtTime(0.09, curr + 1.8);
            sGain.gain.linearRampToValueAtTime(0.0001, curr + 3.8);

            sNoise.connect(sFilter);
            sFilter.connect(sGain);
            sGain.connect(masterGain);
            sNoise.start(curr);
            sNoise.stop(curr + 3.9);
          } else if (ventType < 0.75) {
            // Variation 2: Sharp high-pressure fissure puncture (1.6s punchy burst)
            const sNoise = this.createNoiseSource(ctx, 'white');
            const sFilter = ctx.createBiquadFilter();
            sFilter.type = 'bandpass';
            sFilter.frequency.setValueAtTime(1800, curr);
            sFilter.frequency.exponentialRampToValueAtTime(3200, curr + 0.15);
            sFilter.frequency.linearRampToValueAtTime(1400, curr + 1.5);
            sFilter.Q.setValueAtTime(3.5, curr);

            const sGain = ctx.createGain();
            sGain.gain.setValueAtTime(0.001, curr);
            sGain.gain.linearRampToValueAtTime(0.12, curr + 0.12);
            sGain.gain.exponentialRampToValueAtTime(0.0001, curr + 1.6);

            sNoise.connect(sFilter);
            sFilter.connect(sGain);
            sGain.connect(masterGain);
            sNoise.start(curr);
            sNoise.stop(curr + 1.65);
          } else {
            // Variation 3: Double-puff steam vent (two quick successive chuffs)
            [0, 0.35].forEach((puffOffset, pIdx) => {
              const pTime = curr + puffOffset;
              const sNoise = this.createNoiseSource(ctx, 'white');
              const sFilter = ctx.createBiquadFilter();
              sFilter.type = 'bandpass';
              sFilter.frequency.setValueAtTime(900 + pIdx * 400, pTime);
              sFilter.frequency.exponentialRampToValueAtTime(2200, pTime + 0.12);
              sFilter.frequency.linearRampToValueAtTime(800, pTime + 0.8);
              sFilter.Q.setValueAtTime(3.0, pTime);

              const sGain = ctx.createGain();
              sGain.gain.setValueAtTime(0.001, pTime);
              sGain.gain.linearRampToValueAtTime(0.09, pTime + 0.12);
              sGain.gain.exponentialRampToValueAtTime(0.0001, pTime + 0.85);

              sNoise.connect(sFilter);
              sFilter.connect(sGain);
              sGain.connect(masterGain);
              sNoise.start(pTime);
              sNoise.stop(pTime + 0.9);
            });
          }
        });
        break;
      }

      // 5. Crystal Bastion: Pure Tibetan quartz singing bowl harmonics (peaceful C-major triad) & crystal facet pings
      case 'crystal_bastion': {
        // Faint subterranean crystal cavern resonance
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(528, now);
        bp.Q.setValueAtTime(6.0, now);
        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.02, now);
        pink.connect(bp);
        bp.connect(airGain);
        airGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, airGain);

        // Pure Tibetan quartz singing bowl harmonics in C major Solfeggio tuning (528Hz C5, 660Hz E5, 792Hz G5, 1056Hz C6)
        const BOWL_HARMONICS = [
          [528, 792],   // Root & pure 5th
          [528, 660],   // Root & pure major 3rd
          [660, 1056],  // Major 3rd & octave
          [528, 1056],  // Solfeggio octave
        ];
        let bowlIdx = 0;

        this.scheduleRandomEvent(6000, 9500, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const [f1, f2] = BOWL_HARMONICS[bowlIdx % BOWL_HARMONICS.length];
          bowlIdx++;

          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const g = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(f1, curr);
          osc2.frequency.setValueAtTime(f2, curr);

          // Gentle acoustic choral chorus detune (+/- 0.6Hz)
          osc1.frequency.linearRampToValueAtTime(f1 + 0.6, curr + 3.5);
          osc2.frequency.linearRampToValueAtTime(f2 - 0.6, curr + 3.5);

          // Deep, smooth swell in (2.6s), sing (1.8s), and dissolve (3.0s)
          g.gain.setValueAtTime(0.0001, curr);
          g.gain.linearRampToValueAtTime(0.022, curr + 2.6);
          g.gain.setValueAtTime(0.022, curr + 4.4);
          g.gain.linearRampToValueAtTime(0.0001, curr + 7.4);

          osc1.connect(g);
          osc2.connect(g);
          g.connect(masterGain);
          osc1.start(curr);
          osc2.start(curr);
          osc1.stop(curr + 7.5);
          osc2.stop(curr + 7.5);
        });

        // Occasional delicate crystal facet pings (every 8-15s)
        this.scheduleRandomEvent(8000, 15000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const pitches = [1584, 2112, 2640];
          const pitch = pitches[Math.floor(Math.random() * pitches.length)];
          const pOsc = ctx.createOscillator();
          const pGain = ctx.createGain();
          pOsc.type = 'sine';
          pOsc.frequency.setValueAtTime(pitch, curr);
          pGain.gain.setValueAtTime(0.026, curr);
          pGain.gain.exponentialRampToValueAtTime(0.0001, curr + 2.2);
          pOsc.connect(pGain);
          pGain.connect(masterGain);
          pOsc.start(curr);
          pOsc.stop(curr + 2.25);
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

      // 7. Sunlit Sanctuary & Main Menu: Breathing celestial chord progressions that gently billow in and out
      case 'main_menu':
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

      // 10. Campfire: Authentic recorded campfire with crackling wood embers + Andy Farnell physical acoustics
      case 'campfire': {
        // Seamless authentic audio loop of real crackling campfire
        this.playLoopSource('ambiance/campfire_loop.ogg', ctx, masterGain, sources, 0.25);

        // Layer 1: Warm thermal combustion roar (pink noise in low-mid bandpass with thermal convection drift)
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(250, now);
        bp.Q.setValueAtTime(1.1, now);
        this.createLfo(ctx, 0.08, 40, bp.frequency, sources);
        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.038, now);
        this.createLfo(ctx, 0.11, 0.012, airGain.gain, sources);
        pink.connect(bp);
        bp.connect(airGain);
        airGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, airGain);

        // Layer 2: Fire combustion hiss / oxygen flow (bandpassed pink noise at 1150Hz)
        const hissNoise = this.createNoiseSource(ctx, 'pink');
        const hissBp = ctx.createBiquadFilter();
        hissBp.type = 'bandpass';
        hissBp.frequency.setValueAtTime(1150, now);
        hissBp.Q.setValueAtTime(0.9, now);
        this.createLfo(ctx, 0.14, 160, hissBp.frequency, sources);
        const hissGain = ctx.createGain();
        hissGain.gain.setValueAtTime(0.022, now);
        hissNoise.connect(hissBp);
        hissBp.connect(hissGain);
        hissGain.connect(masterGain);
        hissNoise.start();
        sources.push(hissNoise, hissBp, hissGain);

        // Layer 3: Stochastic micro-crackles (Andy Farnell procedural fire transient model)
        // High-frequency decaying noise impulses simulating escaping pockets of superheated resin (every 45ms - 150ms)
        this.scheduleRandomEvent(45, 150, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          const dur = 0.012 + Math.random() * 0.018; // 12ms to 30ms impulse
          const cNoise = this.createNoiseSource(ctx, 'white');
          const cFilter = ctx.createBiquadFilter();
          cFilter.type = 'bandpass';
          cFilter.frequency.setValueAtTime(2400 + Math.random() * 2800, curr);
          cFilter.Q.setValueAtTime(4.5 + Math.random() * 2.5, curr);
          const cGain = ctx.createGain();
          const amp = 0.05 + Math.random() * 0.08;
          cGain.gain.setValueAtTime(amp, curr);
          cGain.gain.exponentialRampToValueAtTime(0.0001, curr + dur);
          cNoise.connect(cFilter);
          cFilter.connect(cGain);
          cGain.connect(masterGain);
          cNoise.start(curr);
          cNoise.stop(curr + dur + 0.005);
        });

        // Layer 4: Deep wood pop & thermal fissure snap (every 2.2s - 5.0s)
        this.scheduleRandomEvent(2200, 5000, intervalIds, ctx, masterGain, () => {
          const curr = ctx.currentTime;
          // Resonant hollow wood pop
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'sine';
          popOsc.frequency.setValueAtTime(340, curr);
          popOsc.frequency.exponentialRampToValueAtTime(80, curr + 0.035);
          popGain.gain.setValueAtTime(0.045, curr);
          popGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.038);
          popOsc.connect(popGain);
          popGain.connect(masterGain);
          popOsc.start(curr);
          popOsc.stop(curr + 0.042);

          // Accompanied by a sharp high snap
          const snapNoise = this.createNoiseSource(ctx, 'white');
          const snapFilter = ctx.createBiquadFilter();
          snapFilter.type = 'highpass';
          snapFilter.frequency.setValueAtTime(3200, curr);
          const snapGain = ctx.createGain();
          snapGain.gain.setValueAtTime(0.035, curr);
          snapGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.02);
          snapNoise.connect(snapFilter);
          snapFilter.connect(snapGain);
          snapGain.connect(masterGain);
          snapNoise.start(curr);
          snapNoise.stop(curr + 0.025);
        });
        break;
      }

      // 11. Merchant: Curiosity shop room tone, natural acoustic grandfather clock (1.8s, misses a beat) + decoupled soft counter sounds (muffled coins, counter pebbles, measured quill writing)
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

        // Decoupled Merchant Counter Sounds: soft muffled coins, counter pebbles, measured quill writing, catalog page turn
        this.scheduleRandomEvent(8000, 18000, intervalIds, ctx, masterGain, () => {
          const choice = Math.random();
          if (choice < 0.35) {
            // Soft muffled coins rustling in purse (gentle volume 0.18, not jarring!)
            const coinFile = Math.random() > 0.5 ? 'cards/chain_01.ogg' : 'cards/chain_02.ogg';
            this.playSample(coinFile, settings, 0.18, 0.04);
          } else if (choice < 0.60) {
            // Counter pebbles dropping on wooden counter
            this.playSample('cards/stones_01.ogg', settings, 0.35, 0.06);
          } else if (choice < 0.80) {
            // Shopkeeper measured ledger writing with quill (slow & natural, not frantic speedwrite!)
            const quill = Math.random() > 0.5 ? 'typing/quill_1.wav' : 'typing/quill_2.wav';
            this.playSample(quill, settings, 0.20, 0.06);
          } else {
            // Codex catalog page turn
            this.playSample('page_turn.mp3', settings, 0.30, 0.08);
          }
        });
        break;
      }

      // 12. Treasure: Restored subterranean vault room tone & infrequent, non-repetitive echoing water droplets
      case 'treasure': {
        // Restored full hollow stone presence
        const brown = this.createNoiseSource(ctx, 'brown');
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(145, now);
        lp.Q.setValueAtTime(1.8, now);
        const vaultGain = ctx.createGain();
        vaultGain.gain.setValueAtTime(0.20, now);
        brown.connect(lp);
        lp.connect(vaultGain);
        vaultGain.connect(masterGain);
        brown.start();
        sources.push(brown, lp, vaultGain);

        // Hollow cavern air draft
        const pink = this.createNoiseSource(ctx, 'pink');
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(380, now);
        bp.Q.setValueAtTime(2.0, now);
        const draftGain = ctx.createGain();
        draftGain.gain.setValueAtTime(0.055, now);
        this.createLfo(ctx, 0.06, 0.02, draftGain.gain, sources);
        pink.connect(bp);
        bp.connect(draftGain);
        draftGain.connect(masterGain);
        pink.start();
        sources.push(pink, bp, draftGain);

        // Vault stone sub-resonance
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(72, now);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.038, now);
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start();
        sources.push(subOsc, subGain);

        const sub2 = ctx.createOscillator();
        sub2.type = 'sine';
        sub2.frequency.setValueAtTime(130.8, now);
        const subGain2 = ctx.createGain();
        subGain2.gain.setValueAtTime(0.025, now);
        sub2.connect(subGain2);
        subGain2.connect(masterGain);
        sub2.start();
        sources.push(sub2, subGain2);

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

      // 14. Map: Open road breeze & subtle quiet harmonic fifths with organic variance
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

        // Shifting harmonic tones made quiet and subtle (no overpowering static drone!)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(130.8, now); // C3
        this.createLfo(ctx, 0.035, 16, osc1.frequency, sources); // slowly drifts C3 -> D3 -> Bb2
        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0.0048, now); // reduced by ~65% for subtle background ambiance
        this.createLfo(ctx, 0.04, 0.0022, g1.gain, sources);
        osc1.connect(g1);
        g1.connect(masterGain);
        osc1.start();
        sources.push(osc1, g1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(196.0, now); // G3
        this.createLfo(ctx, 0.028, 24, osc2.frequency, sources); // slowly drifts G3 -> A3 -> F3
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.0036, now); // reduced by ~65%
        this.createLfo(ctx, 0.055, 0.0018, g2.gain, sources);
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start();
        sources.push(osc2, g2);

        // Occasional gentle parchment unroll / map edge flutter (every 9-18s)
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

      default: {
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
