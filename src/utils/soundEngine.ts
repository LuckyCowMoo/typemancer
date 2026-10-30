import type { ConfirmSoundProfile, GameSettings, SoundProfile } from '../types/game';

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
      const src = `./assets/sfx/${filename}`;
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
