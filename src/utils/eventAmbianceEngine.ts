/**
 * eventAmbianceEngine.ts
 * Procedural Real-Time Web Audio Ambiance Engine for all 48 Typemancer Mystery Encounters.
 *
 * Implements physically modeled acoustic environments for each unique narrative encounter:
 * - Grounded in real physical materials (parchment, iron, wood, brass, stone, wax, fluid, steam, glass).
 * - Organic non-repeating Brownian drift and randomized stochastic event scheduling.
 * - Elevated presence and foreground highlight elements tailored to immersive narrative reading.
 */

import type { GameSettings } from '../types/game';

type SourceList = (AudioScheduledSourceNode | AudioNode)[];

export class EventAmbianceBuilder {
  /**
   * Helper to schedule an organic, non-periodic event that fires repeatedly with randomized delays.
   */
  public static scheduleRandom(
    minMs: number,
    maxMs: number,
    intervalIds: number[],
    ctx: AudioContext,
    _masterGain: GainNode,
    fn: () => void
  ): void {
    const next = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      const tid = window.setTimeout(() => {
        if (ctx.state !== 'running') return;
        try {
          fn();
        } catch {}
        next();
      }, delay);
      intervalIds.push(tid);
    };
    next();
  }

  /**
   * Create an authentic continuous noise buffer source (pink, white, or brownian).
   */
  public static createNoise(
    ctx: AudioContext,
    type: 'pink' | 'white' | 'brown',
    noiseBuffers: Map<string, AudioBuffer>
  ): AudioBufferSourceNode {
    let buf = noiseBuffers.get(type);
    if (!buf) {
      const sampleRate = ctx.sampleRate;
      const dur = 5.0;
      const numSamples = Math.floor(sampleRate * dur);
      buf = ctx.createBuffer(2, numSamples, sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        if (type === 'white') {
          for (let i = 0; i < numSamples; i++) data[i] = Math.random() * 2 - 1;
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
        } else {
          let last = 0.0;
          for (let i = 0; i < numSamples; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (last + 0.02 * white) / 1.02;
            last = data[i];
            data[i] *= 3.5;
          }
        }
      }
      noiseBuffers.set(type, buf);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  /**
   * Continuous filtered noise atmospheric bed (e.g. wind, air draft, subterranean rumble).
   */
  public static addNoiseBed(
    ctx: AudioContext,
    noiseBuffers: Map<string, AudioBuffer>,
    type: 'pink' | 'white' | 'brown',
    filterType: BiquadFilterType,
    freq: number,
    Q: number,
    gainVal: number,
    sources: SourceList,
    masterGain: GainNode
  ): { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } {
    const src = this.createNoise(ctx, type, noiseBuffers);
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, ctx.currentTime);
    filter.Q.setValueAtTime(Q, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
    sources.push(src, filter, gain);
    return { source: src, filter, gain };
  }

  /**
   * Continuous harmonic or sub-bass drone tone with subtle warmth drift.
   */
  public static addDrone(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType,
    gainVal: number,
    sources: SourceList,
    masterGain: GainNode,
    lfoFreq = 0.04,
    lfoDepth = 1.2
  ): { osc: OscillatorNode; gain: GainNode } {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(lfoFreq, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(lfoDepth, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, now);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    sources.push(osc, gain, lfo, lfoGain);
    return { osc, gain };
  }

  /**
   * Physical model of delicate paper/parchment flutter or unrolling vellum.
   */
  public static playParchmentFlutter(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.038
  ): void {
    const curr = ctx.currentTime;
    const noise = this.createNoise(ctx, 'pink', noiseBuffers);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1100 + Math.random() * 450, curr);
    bp.Q.setValueAtTime(2.2, curr);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * (0.8 + Math.random() * 0.4), curr);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.18 + Math.random() * 0.12);
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start(curr);
    noise.stop(curr + 0.32);
  }

  /**
   * Physical model of nib scratching on dry parchment.
   */
  public static playQuillScratch(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.045
  ): void {
    const curr = ctx.currentTime;
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = curr + i * (0.05 + Math.random() * 0.04);
      const noise = this.createNoise(ctx, 'white', noiseBuffers);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(3200 + Math.random() * 800, t);
      bp.Q.setValueAtTime(4.2, t);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      noise.connect(bp);
      bp.connect(gain);
      gain.connect(masterGain);
      noise.start(t);
      noise.stop(t + 0.045);
    }
  }

  /**
   * Physical model of cavern water drop hitting a deep pool with optional acoustic reflection.
   */
  public static playWaterDrop(
    ctx: AudioContext,
    masterGain: GainNode,
    vol = 0.045,
    pitch = 1400,
    withEcho = true
  ): void {
    const curr = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const startF = pitch * (0.9 + Math.random() * 0.2);
    osc.frequency.setValueAtTime(startF, curr);
    osc.frequency.exponentialRampToValueAtTime(startF * 0.42, curr + 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, curr);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.065);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(curr);
    osc.stop(curr + 0.075);

    if (withEcho) {
      const echoTime = curr + 0.22 + Math.random() * 0.12;
      const echoOsc = ctx.createOscillator();
      echoOsc.type = 'sine';
      echoOsc.frequency.setValueAtTime(startF * 0.85, echoTime);
      echoOsc.frequency.exponentialRampToValueAtTime(startF * 0.38, echoTime + 0.05);
      const echoGain = ctx.createGain();
      echoGain.gain.setValueAtTime(vol * 0.28, echoTime);
      echoGain.gain.exponentialRampToValueAtTime(0.0001, echoTime + 0.055);
      echoOsc.connect(echoGain);
      echoGain.connect(masterGain);
      echoOsc.start(echoTime);
      echoOsc.stop(echoTime + 0.065);
    }
  }

  /**
   * Physical model of viscous bubble expanding and bursting (syrupy ink or potion fluid).
   */
  public static playViscousBubble(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.05,
    basePitch = 220
  ): void {
    const curr = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const startF = basePitch + Math.random() * 40;
    osc.frequency.setValueAtTime(startF, curr);
    osc.frequency.exponentialRampToValueAtTime(startF * 0.45, curr + 0.07);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, curr);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.075);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(curr);
    osc.stop(curr + 0.08);

    const noise = this.createNoise(ctx, 'pink', noiseBuffers);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(750 + Math.random() * 200, curr);
    bp.Q.setValueAtTime(2.8, curr);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(vol * 0.65, curr);
    nGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.09);
    noise.connect(bp);
    bp.connect(nGain);
    nGain.connect(masterGain);
    noise.start(curr);
    noise.stop(curr + 0.1);
  }

  /**
   * Modal synthesis of crystal/glass chime or acoustic ringing partials.
   */
  public static playCrystalChime(
    ctx: AudioContext,
    masterGain: GainNode,
    freq = 1760,
    vol = 0.025,
    ringDur = 1.4
  ): void {
    const curr = ctx.currentTime;
    const partials = [1.0, 1.48, 2.12];
    partials.forEach((mult, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, curr);
      const gain = ctx.createGain();
      const pVol = (vol / (idx + 1)) * (0.8 + Math.random() * 0.4);
      gain.gain.setValueAtTime(pVol, curr);
      gain.gain.exponentialRampToValueAtTime(0.0001, curr + ringDur / (idx + 1));
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(curr);
      osc.stop(curr + ringDur + 0.05);
    });
  }

  /**
   * Physical modeling of mechanical escapement or gear click.
   */
  public static playMechanicalClick(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.04,
    bodyFreq = 420
  ): void {
    const curr = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bodyFreq, curr);
    osc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.5, curr + 0.025);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, curr);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.03);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(curr);
    osc.stop(curr + 0.035);

    const noise = this.createNoise(ctx, 'white', noiseBuffers);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(2400, curr);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(vol * 0.7, curr);
    nGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.018);
    noise.connect(hp);
    hp.connect(nGain);
    nGain.connect(masterGain);
    noise.start(curr);
    noise.stop(curr + 0.022);
  }

  /**
   * Physical modeling of high-pressure steam valve release.
   */
  public static playSteamPuff(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.045,
    dur = 0.55
  ): void {
    const curr = ctx.currentTime;
    const noise = this.createNoise(ctx, 'pink', noiseBuffers);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1600, curr);
    bp.frequency.linearRampToValueAtTime(3200, curr + 0.06);
    bp.frequency.exponentialRampToValueAtTime(1100, curr + dur);
    bp.Q.setValueAtTime(1.8, curr);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, curr);
    gain.gain.linearRampToValueAtTime(vol, curr + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + dur);
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start(curr);
    noise.stop(curr + dur + 0.05);
  }

  /**
   * Physical model of an authentic coin clink on wood or brass.
   */

  /**
   * Resonant laboratory glass potion vial or alembic clink.
   */
  public static playGlassClink(
    ctx: AudioContext,
    masterGain: GainNode,
    freq = 1850,
    vol = 0.04
  ): void {
    const curr = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, curr);
    osc2.frequency.setValueAtTime(freq * 2.76, curr);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, curr);
    gain.gain.linearRampToValueAtTime(vol, curr + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start(curr);
    osc2.start(curr);
    osc1.stop(curr + 0.36);
    osc2.stop(curr + 0.36);
  }

  public static playCoinClink(
    ctx: AudioContext,
    masterGain: GainNode,
    vol = 0.035
  ): void {
    const curr = ctx.currentTime;
    const freqs = [3800 + Math.random() * 400, 4900 + Math.random() * 500];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, curr);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * 0.5, curr);
      g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.08);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(curr);
      osc.stop(curr + 0.09);
    });
  }

  /**
   * Physical modeling of burning wood ember snap and pop.
   */
  public static playFireCrackle(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.04
  ): void {
    const curr = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, curr);
    osc.frequency.exponentialRampToValueAtTime(70, curr + 0.035);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, curr);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.038);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(curr);
    osc.stop(curr + 0.042);

    const snapNoise = this.createNoise(ctx, 'white', noiseBuffers);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(2900, curr);
    const sGain = ctx.createGain();
    sGain.gain.setValueAtTime(vol * 0.75, curr);
    sGain.gain.exponentialRampToValueAtTime(0.0001, curr + 0.02);
    snapNoise.connect(hp);
    hp.connect(sGain);
    sGain.connect(masterGain);
    snapNoise.start(curr);
    snapNoise.stop(curr + 0.025);
  }

  /**
   * Spectral vocal formant whisper that swells and fades.
   */
  public static playSpectralWhisper(
    ctx: AudioContext,
    masterGain: GainNode,
    noiseBuffers: Map<string, AudioBuffer>,
    vol = 0.035,
    dur = 1.6
  ): void {
    const curr = ctx.currentTime;
    const noise = this.createNoise(ctx, 'pink', noiseBuffers);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(650, curr);
    bp.frequency.linearRampToValueAtTime(1150, curr + dur * 0.5);
    bp.frequency.linearRampToValueAtTime(720, curr + dur);
    bp.Q.setValueAtTime(3.8, curr);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, curr);
    gain.gain.linearRampToValueAtTime(vol, curr + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, curr + dur);
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(masterGain);
    noise.start(curr);
    noise.stop(curr + dur + 0.05);
  }
}

/**
 * Master dispatcher for all 48 Typemancer Mystery Event Ambiance Environments.
 */
export function buildEventAmbianceGraph(
  eventId: string,
  ctx: AudioContext,
  masterGain: GainNode,
  sources: SourceList,
  intervalIds: number[],
  noiseBuffers: Map<string, AudioBuffer>,
  _settings: GameSettings
): boolean {
  switch (eventId) {
    // The Whispering Inkwell: Swirling violet fluid bed, arcane whisper drafts, viscous ink bubble bursts
    case 'glowing_inkwell': {
// Swirling violet ink fluid bed
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 380, 2.2, 0.08, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 58.27, 'sine', 0.024, sources, masterGain, 0.05, 1.4); // Bb1 sub
      EventAmbianceBuilder.addDrone(ctx, 155.56, 'triangle', 0.012, sources, masterGain, 0.03, 1.8); // D#3 violet harmonic

      // Highlights: Viscous violet ink bubble plops (every 3.5s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3500, 7500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.045, 190);
      });
      // Highlights: Ethereal whisper draft (every 7s - 15s)
      EventAmbianceBuilder.scheduleRandom(7000, 15000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.032, 1.8);
      });
      // Highlights: High luminescence crystal shimmer (every 6s - 13s)
      EventAmbianceBuilder.scheduleRandom(6000, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1860, 0.022, 1.6);
      });
      return true;
    }

    // The Silent Choir: Cold marble cathedral air tone with breathless choir vowel formants (600Hz / 1040Hz) and stone echoes
    case 'silent_choir': {
// Cathedral stone room tone
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 420, 1.2, 0.07, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 65.41, 'sine', 0.022, sources, masterGain, 0.03, 0.8); // C2 cathedral foundation

      // Breathing open-vocal formants (ah/oh) that swell and fade without singing
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const formants = [600, 1040, 2400];
        const fMaster = ctx.createGain();
        fMaster.gain.setValueAtTime(0.0001, curr);
        fMaster.gain.linearRampToValueAtTime(0.028, curr + 2.4);
        fMaster.gain.exponentialRampToValueAtTime(0.0001, curr + 6.2);
        fMaster.connect(masterGain);
        formants.forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f + (Math.random() * 8 - 4), curr);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.33, curr);
          osc.connect(g);
          g.connect(fMaster);
          osc.start(curr);
          osc.stop(curr + 6.4);
        });
      });

      // Highlights: Breath drawn into stone lips (every 8s - 16s)
      EventAmbianceBuilder.scheduleRandom(8000, 16000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.035, 2.0);
      });
      // Highlights: Distant cold stone droplet ping (every 9s - 19s)
      EventAmbianceBuilder.scheduleRandom(9000, 19000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playWaterDrop(ctx, masterGain, 0.032, 1600, true);
      });
      return true;
    }

    // Pyre of Words: Roaring fire combustion bed, thermal wood snaps, curling parchment crinkles
    case 'burning_library': {
// Roaring combustion bed
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 240, 1.4, 0.09, sources, masterGain);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'white', 'highpass', 2800, 1.0, 0.025, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 48.0, 'sine', 0.028, sources, masterGain, 0.08, 2.5); // Deep fire rumble

      // Highlights: Resin pops and snaps (frequent: every 1.2s - 2.8s)
      EventAmbianceBuilder.scheduleRandom(1200, 2800, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playFireCrackle(ctx, masterGain, noiseBuffers, 0.045);
      });
      // Highlights: Crisp paper curling in intense heat (every 3s - 7s)
      EventAmbianceBuilder.scheduleRandom(3000, 7000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.05);
      });
      // Highlights: Collapsing charred timber beam settling (every 9s - 18s)
      EventAmbianceBuilder.scheduleRandom(9000, 18000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.055, 140);
      });
      return true;
    }

    // The Synonym Smuggler: Rainy midnight alleyway breeze, wool coat movement, muffled brass coin clinks
    case 'smuggler_of_words': {
// Midnight alley breeze & distant foggy town tone
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 460, 1.8, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 73.42, 'sine', 0.018, sources, masterGain, 0.04, 1.2); // D2 alley hum

      // Highlights: Heavy trenchcoat wool rustling (every 3.5s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3500, 7500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.035);
      });
      // Highlights: Clandestine brass coins jingling in leather purse (every 5s - 11s)
      EventAmbianceBuilder.scheduleRandom(5000, 11000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCoinClink(ctx, masterGain, 0.045);
      });
      // Highlights: Quiet boot scuff on wet cobblestones (every 8s - 16s)
      EventAmbianceBuilder.scheduleRandom(8000, 16000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.038, 260);
      });
      return true;
    }

    // The Last Gramophone: Abandoned gothic parlor stillness, hand-wound clockwork cylinder escapement ticking, melancholic acoustic brass horn waltz
    case 'cursed_gramophone': {
      // Dusty gothic parlor room draft through heavy velvet curtains
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 320, 1.5, 0.045, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 98.0, 'sine', 0.016, sources, masterGain, 0.03, 0.8); // G2 floorboard resonance

      // Highlights: Hand-wound clockwork cylinder escapement ticking (every 1.2s - 2.4s)
      EventAmbianceBuilder.scheduleRandom(1200, 2400, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.032, 780);
      });

      // Highlights: Melancholic acoustic brass horn waltz tines (every 6.0s - 12.0s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const notes = [293.66, 349.23, 440.0, 523.25, 440.0]; // D4, F4, A4, C5 minor
        notes.forEach((f, idx) => {
          const t = curr + idx * 0.32;
          const osc = ctx.createOscillator();
          osc.type = 'triangle'; // Warm acoustic horn/tine tone
          osc.frequency.setValueAtTime(f, t);
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(f * 1.5, t);
          bp.Q.setValueAtTime(3.2, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.018, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
          osc.connect(bp);
          bp.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.45);
        });
      });

      // Highlights: Brittle wax cylinder surface friction (every 4.0s - 8.0s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.025);
      });
      return true;
    }

    // The Wall of Defiance: Crumbling stone corridor wind, luminous alchemical phosphorus ink drone, dagger carving into brick, wet horsehair ink brush strokes
    case 'graffiti_wall': {
      // Midnight alley breeze whispering through ancient crumbling mortar
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 420, 1.8, 0.07, sources, masterGain);
      // Luminous alchemical ink glow drone (sacred G3 196Hz + D4 293.66Hz fifth harmonic)
      EventAmbianceBuilder.addDrone(ctx, 196.0, 'sine', 0.018, sources, masterGain, 0.04, 1.2);
      EventAmbianceBuilder.addDrone(ctx, 293.66, 'triangle', 0.012, sources, masterGain, 0.03, 1.5);

      // Highlights: Rebel dagger and iron chisel carving forbidden runes into brick (every 2.8s - 6.0s)
      EventAmbianceBuilder.scheduleRandom(2800, 6000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.045);
      });
      // Highlights: Wet horsehair brush dripping and sloshing glowing alchemical ink on porous stone (every 4.5s - 9.0s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.038, 260);
      });
      // Highlights: Distant nocturnal lantern bracket creaking softly in the fog (every 6.5s - 13.0s)
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1320, 0.02, 1.2);
      });
      return true;
    }

    // Flock of Pages: Violent canyon gale with rapid rhythmic paper wing flaps passing across the stereo field
    case 'torn_pages_wind': {
// Howling canyon gale bed
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 650, 1.2, 0.09, sources, masterGain);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'brown', 'lowpass', 140, 1.8, 0.08, sources, masterGain);

      // Highlights: Flock of paper pages flapping wings (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const flaps = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < flaps; i++) {
          const t = curr + i * (0.05 + Math.random() * 0.03);
          const noise = EventAmbianceBuilder.createNoise(ctx, 'pink', noiseBuffers);
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(1400 + Math.random() * 600, t);
          bp.Q.setValueAtTime(2.5, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.045, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
          noise.connect(bp);
          bp.connect(g);
          g.connect(masterGain);
          noise.start(t);
          noise.stop(t + 0.06);
        }
      });
      // Highlights: Sudden gust tearing pages past ears (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.065);
      });
      return true;
    }

    // The Desperate Mime: Melancholic cobblestone stillness, burlap friction, wooden beggar bowl token rattle
    case 'miming_beggar': {
// Melancholic street stillness & cello/glass resonance
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 320, 1.0, 0.05, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.018, sources, masterGain, 0.04, 0.6); // A2 mournful tone

      // Highlights: Burlap sleeve gesture friction (every 3s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3000, 6500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.032);
      });
      // Highlights: Single wooden token rolling in wooden bowl (every 5s - 10s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.042, 380);
      });
      return true;
    }

    // The Ink-String Lute: Hollow wooden lute body resonance (110Hz), discordant ink-string plucks, soundhole breeze
    case 'broken_instrument': {
// Open meadow breeze and wooden lute cavity air resonance
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 360, 1.4, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'triangle', 0.022, sources, masterGain, 0.05, 1.0); // A2 lute body

      // Highlights: Plucked dissonant ink-sinew string twangs (every 3s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3000, 6500, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const freqs = [146.8, 196.0, 220.0, 261.6, 311.1]; // G3, A3, C4, Eb4 out of tune
        const f = freqs[Math.floor(Math.random() * freqs.length)];
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, curr);
        osc.frequency.exponentialRampToValueAtTime(f * 0.96, curr + 0.6);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(f * 2.2, curr);
        bp.Q.setValueAtTime(3.5, curr);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.045, curr);
        g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.65);
        osc.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        osc.start(curr);
        osc.stop(curr + 0.7);
      });
      // Highlights: Ink string fret buzz (every 7s - 14s)
      EventAmbianceBuilder.scheduleRandom(7000, 14000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.038, 540);
      });
      return true;
    }

    // Cave of Echoes: Deep limestone cave sub-drone (44Hz), multi-tap delayed water drops, crystal singing tones
    case 'whispering_echo_cave': {
// Deep cave sub-drone and cold cavern draft
      EventAmbianceBuilder.addDrone(ctx, 43.65, 'sine', 0.03, sources, masterGain, 0.03, 1.0); // F1 subterranean
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 520, 2.5, 0.065, sources, masterGain);

      // Highlights: Resonant cave water drop with slapback echoes (every 3s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3000, 6500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playWaterDrop(ctx, masterGain, 0.05, 1550, true);
      });
      // Highlights: Spectral reversed whisper drifting across cavern (every 6s - 13s)
      EventAmbianceBuilder.scheduleRandom(6000, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.038, 2.2);
      });
      // Highlights: Acoustic crystal stalactite chime (every 8s - 16s)
      EventAmbianceBuilder.scheduleRandom(8000, 16000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 2100, 0.028, 2.0);
      });
      return true;
    }

    // The Gagged Idol: Subterranean marble courtyard tone, rattling iron chains, muffled opera humming behind iron gag
    case 'gagged_statue': {
// Marble courtyard tone (C# minor 69.3Hz foundation)
      EventAmbianceBuilder.addDrone(ctx, 69.30, 'sine', 0.024, sources, masterGain, 0.03, 0.8);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 380, 1.2, 0.065, sources, masterGain);

      // Highlights: Heavy rusted iron chains rattling against marble (every 3.5s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3500, 7500, intervalIds, ctx, masterGain, () => {
        for (let i = 0; i < 3; i++) {
          window.setTimeout(() => {
            if (ctx.state === 'running') {
              EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.04, 680);
            }
          }, i * 80);
        }
      });
      // Highlights: Muffled vocal aria humming behind closed lips (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const humNotes = [277.18, 329.63, 415.30]; // C#4, E4, G#4 minor
        humNotes.forEach((f, idx) => {
          const t = curr + idx * 0.45;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(550, t); // closed lips formant
          bp.Q.setValueAtTime(4.0, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.026, t + 0.15);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
          osc.connect(bp);
          bp.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.6);
        });
      });
      // Highlights: Water droplet on padlock (every 9s - 18s)
      EventAmbianceBuilder.scheduleRandom(9000, 18000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playWaterDrop(ctx, masterGain, 0.035, 1750, false);
      });
      return true;
    }

    // The Obsidian Fountain: Heavy dark viscous fluid rush, syrupy ink bubbling plops, heavy fountain cascades
    case 'ink_blood_fountain': {
// Heavy viscous fluid rushing bed
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 280, 1.8, 0.09, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 52.0, 'sine', 0.026, sources, masterGain, 0.07, 2.0);

      // Highlights: Thick syrupy ink bubbling plops (frequent: every 2.2s - 4.8s)
      EventAmbianceBuilder.scheduleRandom(2200, 4800, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.055, 160);
      });
      // Highlights: Heavy fountain ink cascade splashing against stone basin (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const noise = EventAmbianceBuilder.createNoise(ctx, 'pink', noiseBuffers);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(420, curr);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.055, curr);
        g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.6);
        noise.connect(lp);
        lp.connect(g);
        g.connect(masterGain);
        noise.start(curr);
        noise.stop(curr + 0.65);
      });
      return true;
    }

    // The Hollow Tree: Ancient oak canopy wind, fragile parchment envelope cracking, wood borer clicks in hollow trunk
    case 'lost_love_letters': {
// Oak forest canopy breeze and creaking wood
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 380, 1.2, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 82.41, 'sine', 0.016, sources, masterGain, 0.03, 1.0); // E2 forest root

      // Highlights: Ancient parchment envelope cracking open (every 3.5s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3500, 7500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.045);
      });
      // Highlights: Dry wax ribbon flutter (every 5.5s - 11s)
      EventAmbianceBuilder.scheduleRandom(5500, 11000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.032);
      });
      // Highlights: Wood borer beetle clicking in hollow oak (every 7s - 15s)
      EventAmbianceBuilder.scheduleRandom(7000, 15000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.035, 480);
      });
      return true;
    }

    // The Floating Edict: Arcane levitation updraft, warm floating vellum fifth-drone, parchment banner flutters, resonant royal wax seal chimes
    case 'wizard_proclamation': {
      // Ethereal levitation wind draft holding the giant proclamation aloft
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 520, 2.0, 0.065, sources, masterGain);
      // Warm levitation aura drone (A2 110Hz + E3 164.81Hz harmonic fifth)
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.022, sources, masterGain, 0.04, 1.0);
      EventAmbianceBuilder.addDrone(ctx, 164.81, 'triangle', 0.014, sources, masterGain, 0.03, 1.4);

      // Highlights: Massive enchanted vellum banner fluttering in mid-air (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.048);
      });
      // Highlights: Glowing royal imperial wax seal shimmer (every 5.0s - 10.0s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1188, 0.035, 2.0);
      });
      // Highlights: Arcane warning rune flare chime (every 7.0s - 14.0s)
      EventAmbianceBuilder.scheduleRandom(7000, 14000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 792, 0.028, 2.5);
      });
      return true;
    }

    // The Glowing Jar: Resonant glass cavity tone (820Hz), singing trapped vocal cords vibrating through curved glass
    case 'stolen_vocal_cords': {
// Glass jar cavity acoustic tone & roadside breeze
      EventAmbianceBuilder.addDrone(ctx, 820.0, 'sine', 0.012, sources, masterGain, 0.05, 4.0); // glass cavity
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 340, 1.0, 0.05, sources, masterGain);

      // Highlights: Muffled vocal cord singing melody through glass (every 3s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3000, 6500, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const melody = [329.63, 392.0, 440.0, 493.88]; // E4, G4, A4, B4
        melody.forEach((f, idx) => {
          const t = curr + idx * 0.32;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(820, t);
          bp.Q.setValueAtTime(3.5, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.028, t + 0.1);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
          osc.connect(bp);
          bp.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.5);
        });
      });
      // Highlights: Curious finger tap against curved glass jar (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playGlassClink(ctx, masterGain, 1650, 0.045);
      });
      return true;
    }

    // The Clockwork Typesetter: Gnomish clockwork foundry hearth, bubbling molten lead font crucible, brass escapement gears meshing, movable-type font blocks sliding
    case 'mechanical_typesetter': {
      // Coal hearth firebed rumble and copper boiler steam draft
      EventAmbianceBuilder.addDrone(ctx, 73.42, 'triangle', 0.02, sources, masterGain, 0.04, 1.2);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'brown', 'lowpass', 240, 1.6, 0.065, sources, masterGain);

      // Highlights: Molten lead font crucible bubbling (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.045, 180);
      });
      // Highlights: Intricate brass clockwork escapement gear meshing (every 2.0s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2000, 4500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.042, 620);
      });
      // Highlights: Movable-type brass font punches locking into composing stick (every 3.2s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3200, 6500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCoinClink(ctx, masterGain, 0.038);
      });
      // Highlights: Soft copper boiler steam relief hiss (every 5.5s - 11.0s)
      EventAmbianceBuilder.scheduleRandom(5500, 11000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSteamPuff(ctx, masterGain, noiseBuffers, 0.042, 0.45);
      });
      return true;
    }

    // The Spectral Editor: Frosty ethereal room tone, rapid phantom quill scratching, ghostly sigh
    case 'phantom_proofreader': {
// Frosty supernatural study room tone (diminished chord pad)
      EventAmbianceBuilder.addDrone(ctx, 174.61, 'sine', 0.016, sources, masterGain, 0.03, 1.2); // F3
      EventAmbianceBuilder.addDrone(ctx, 246.94, 'sine', 0.012, sources, masterGain, 0.03, 1.5); // B3 (tritone coldness)
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'highpass', 900, 1.0, 0.03, sources, masterGain);

      // Highlights: Relentless phantom quill scratching corrections (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.045);
      });
      // Highlights: Ethereal scholar throat clearing / sigh (every 6s - 13s)
      EventAmbianceBuilder.scheduleRandom(6000, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.035, 1.5);
      });
      // Highlights: Translucent book page turn (every 8s - 16s)
      EventAmbianceBuilder.scheduleRandom(8000, 16000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.038);
      });
      return true;
    }

    // The Origami Chasm: Bottomless chasm updraft, creaking parchment tension folds, whistling paper lattices
    case 'origami_bridge': {
// Terrifying bottomless abyss updraft
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 450, 1.2, 0.09, sources, masterGain);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'brown', 'lowpass', 95, 2.0, 0.08, sources, masterGain);

      // Highlights: Creaking parchment tension folds straining (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.055);
      });
      // Highlights: Paper fiber groaning under structural stress (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.042, 210);
      });
      return true;
    }

    // The Underground Press: Secret cellar dampness, heavy iron screw press groan, squelching ink roller
    case 'forbidden_printing_press': {
// Cellar dampness and oil lamp sizzle
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 290, 1.4, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 55.0, 'sine', 0.024, sources, masterGain, 0.04, 1.0); // A1 cellar

      // Highlights: Cast-iron hand-crank press rolling over paper (every 3s - 6s)
      EventAmbianceBuilder.scheduleRandom(3000, 6000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.05, 180);
      });
      // Highlights: Squelching sticky ink roller against type (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.04, 240);
      });
      // Highlights: Fresh printed rebel broadsheet peeling off platen (every 7s - 13s)
      EventAmbianceBuilder.scheduleRandom(7000, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.055);
      });
      return true;
    }

    // Shrine of the Crimson Seal: Sacred altar hush, dripping scarlet sealing wax, heavy brass seal stamp strikes
    case 'wax_seal_altar': {
// Sacred stone shrine silence and sputtering candle wax
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 410, 1.4, 0.06, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.016, sources, masterGain, 0.03, 0.6); // A2 shrine

      // Highlights: Molten red wax drop falling onto stone (every 2.2s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2200, 4500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.038, 320);
      });
      // Highlights: Sputtering candle wick flare (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playFireCrackle(ctx, masterGain, noiseBuffers, 0.032);
      });
      // Highlights: Heavy brass seal stamp striking warm wax (every 7s - 14s)
      EventAmbianceBuilder.scheduleRandom(7000, 14000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.055, 160);
      });
      return true;
    }

    // The Censored Cartographer: Crossroads desolate wind, sharp brass divider calipers scratching vellum
    case 'censored_cartographer': {
// Crossroads wind whipping across milestone
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 480, 1.4, 0.075, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 77.78, 'sine', 0.016, sources, masterGain, 0.03, 0.8); // Eb2 milestone

      // Highlights: Brass divider calipers clicking and scratching vellum (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.042);
      });
      // Highlights: Ticking brass pocket sundial (every 5s - 9s)
      EventAmbianceBuilder.scheduleRandom(5000, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.032, 850);
      });
      // Highlights: Map paper fluttering in the wind (every 7s - 13s)
      EventAmbianceBuilder.scheduleRandom(7000, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.048);
      });
      return true;
    }

    // The Vowel Tax Collector: Carriage cabin interior, iron lockbox key turning, vigorous tax ledger quill scratches
    case 'vowel_tax_collector': {
// Carriage framing creak and light rain on leather roof
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 360, 1.6, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 65.41, 'sine', 0.02, sources, masterGain, 0.04, 1.2); // C2 carriage body

      // Highlights: Vigorous quill scratching tax fines in ledger (every 2s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2000, 4500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.048);
      });
      // Highlights: Heavy iron lockbox key turning with a 'ka-chunk' (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.055, 340);
      });
      // Highlights: Imperial magistrate seal stamp slamming desk (every 7s - 14s)
      EventAmbianceBuilder.scheduleRandom(7000, 14000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.06, 120);
      });
      return true;
    }

    // The Mirror-Script Wall: Polished obsidian stone drone, singing wineglass harmonics, backward acoustic breath
    case 'mirror_script_wall': {
// Obsidian stone drone (55Hz & 110Hz octaves)
      EventAmbianceBuilder.addDrone(ctx, 55.0, 'sine', 0.025, sources, masterGain, 0.03, 1.2);
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.016, sources, masterGain, 0.04, 1.0);

      // Highlights: Glassy singing wineglass resonance in pure fifths (every 3.5s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3500, 7500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1320, 0.035, 2.2);
      });
      // Highlights: Reverse acoustic breath drifting across the room (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.04, 2.4);
      });
      // Highlights: Crystalline obsidian ping (every 8s - 15s)
      EventAmbianceBuilder.scheduleRandom(8000, 15000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 2400, 0.024, 1.4);
      });
      return true;
    }

    // The Gilded Palimpsest: Quiet scriptorium silence, bone scraper shaving dried ink, gold leaf foil fluttering
    case 'gilded_palimpsest': {
// Scriptorium quiet and warm sunbeam dust tone
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 350, 1.0, 0.05, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 98.0, 'sine', 0.016, sources, masterGain, 0.03, 0.6); // G2 scriptorium

      // Highlights: Bone scraper shaving dried ink off calfskin vellum (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.042);
      });
      // Highlights: Gold leaf foil flakes fluttering down to desk (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.032);
      });
      // Highlights: Heavy calfskin binding leather spine creak (every 7s - 14s)
      EventAmbianceBuilder.scheduleRandom(7000, 14000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.035, 220);
      });
      return true;
    }

    // The Iron Bookbinder's Vise: Workshop iron enclosure, squeaking cast-iron screw press, linen thread whip
    case 'iron_bookbinder': {
// Workshop iron enclosure and hide glue pot simmer
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 320, 1.6, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 65.41, 'triangle', 0.02, sources, masterGain, 0.04, 1.0); // C2 forge

      // Highlights: Squeaking cast-iron screw turning under heavy torque (every 3s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3000, 6500, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(620, curr);
        osc.frequency.linearRampToValueAtTime(740, curr + 0.35);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(680, curr);
        bp.Q.setValueAtTime(4.5, curr);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.035, curr);
        g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.38);
        osc.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        osc.start(curr);
        osc.stop(curr + 0.4);
      });
      // Highlights: Waxed linen thread pulling through leather hole with a crisp whip (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.04);
      });
      // Highlights: Wooden binding mallet thudding book spine (every 6.5s - 13s)
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.055, 130);
      });
      return true;
    }

    // The Weeping Apostrophe: Ancient mossy glade tone, heavy dewdrop bloops into moss, singing stone chime
    case 'weeping_apostrophe': {
// Sacred mossy glade air tone & ancient standing stone foundation
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 360, 1.0, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 87.31, 'sine', 0.02, sources, masterGain, 0.03, 0.8); // F2 stone

      // Highlights: Heavy dewdrop falling from curved apostrophe into moss pool (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playWaterDrop(ctx, masterGain, 0.048, 1250, false);
      });
      // Highlights: Resonant singing stone harmonic chime (every 5s - 10s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1560, 0.032, 2.0);
      });
      return true;
    }

    // The Carrier Pigeon Loft: Watchtower timber wind, mechanical pigeon cooing, brass message cylinder clicks
    case 'carrier_pigeon_loft': {
// Watchtower timber slats wind & high altitude air
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 580, 1.3, 0.075, sources, masterGain);

      // Highlights: Mechanical pigeon cooing (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const cooNotes = [310, 290, 310];
        cooNotes.forEach((f, idx) => {
          const t = curr + idx * 0.18;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.032, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.19);
        });
      });
      // Highlights: Rapid feathered wing flaps (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.05);
      });
      // Highlights: Brass message capsule clicking against stone perch (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCoinClink(ctx, masterGain, 0.035);
      });
      return true;
    }

    // The Blindfolded Scrivener: Sensory deprivation cell, mathematical wooden stylus tapping, deliberate monk breath
    case 'blindfolded_scrivener': {
// Extreme quiet monastic cell room tone & heartbeat pulse
      EventAmbianceBuilder.addDrone(ctx, 45.0, 'sine', 0.016, sources, masterGain, 0.02, 0.5);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 240, 1.0, 0.03, sources, masterGain);

      // Highlights: Mathematical, hypnotic wooden stylus tapping on parchment (every 1.8s - 3.5s)
      EventAmbianceBuilder.scheduleRandom(1800, 3500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.038, 480);
      });
      // Highlights: Blindfold cloth rustling as head tilts (every 5s - 10s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.025);
      });
      // Highlights: Deep deliberate monk breath (every 7s - 14s)
      EventAmbianceBuilder.scheduleRandom(7000, 14000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.028, 2.0);
      });
      return true;
    }

    // The Suffix Bazaar: Exotic night bazaar tent murmur, clinking glass potion vials, effervescent suffix tinctures
    case 'suffix_bazaar': {
// Bazaar canvas tent flutter and warm evening air
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 450, 1.4, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.016, sources, masterGain, 0.03, 1.0); // A2 market

      // Highlights: Glass elixir bottles clinking on wooden rack (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playGlassClink(ctx, masterGain, 2100, 0.04);
      });
      // Highlights: Effervescent bubbling of glowing suffix tinctures (every 3.5s - 7s)
      EventAmbianceBuilder.scheduleRandom(3500, 7000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.038, 380);
      });
      // Highlights: Brass coin scales rocking and clicking (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCoinClink(ctx, masterGain, 0.04);
      });
      return true;
    }

    // The Library of Dust: Cathedral-scale vaulted stone stillness, stone dust avalanche trickles, chipped petrified pages
    case 'petrified_reading_room': {
// Grand vaulted stone silence & cold mineral resonance
      EventAmbianceBuilder.addDrone(ctx, 48.0, 'sine', 0.026, sources, masterGain, 0.02, 0.8);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 280, 1.5, 0.055, sources, masterGain);

      // Highlights: Stone dust avalanche trickling down archway (every 3s - 6.5s)
      EventAmbianceBuilder.scheduleRandom(3000, 6500, intervalIds, ctx, masterGain, () => {
        for (let i = 0; i < 4; i++) {
          window.setTimeout(() => {
            if (ctx.state === 'running') {
              EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.03, 1100);
            }
          }, i * 45);
        }
      });
      // Highlights: Petrified stone book page chipping (every 5s - 10s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 750);
      });
      return true;
    }

    // The Thesaurus Wyrm: Heavy iron snare tension, thousand leather dictionary scales sliding, reptilian papery hiss
    case 'thesaurus_wyrm': {
// Snare chain tension & dead forest floor rustle
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 380, 1.6, 0.07, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 58.27, 'sawtooth', 0.016, sources, masterGain, 0.06, 1.8); // Bb1 wyrm growl

      // Highlights: Leather dictionary scales sliding like serpent scales (every 2.2s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2200, 4500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.055);
      });
      // Highlights: Iron snare chain rattling (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 620);
      });
      // Highlights: Guttural reptilian papery hiss (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSteamPuff(ctx, masterGain, noiseBuffers, 0.042, 0.65);
      });
      return true;
    }

    // The Sunken Scriptorium: Flooded basement water lapping, floating leather manuscripts bumping stone, submerged bubble plops
    case 'sunken_scriptorium': {
// Flooded stone basement water wash
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 340, 1.4, 0.08, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 60.0, 'sine', 0.024, sources, masterGain, 0.04, 1.2);

      // Highlights: Water splashing floating wooden lecterns (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playWaterDrop(ctx, masterGain, 0.045, 1100, true);
      });
      // Highlights: Buoyant leather codex bumping stone archway (every 4s - 8.5s)
      EventAmbianceBuilder.scheduleRandom(4000, 8500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 180);
      });
      // Highlights: Submerged air pocket bubbling up to surface (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.048, 220);
      });
      return true;
    }

    // The Ink Bleach Vat: Simmering cauldron of boiling lye, wooden paddle stirring paper pulp, caustic steam sizzles
    case 'ink_bleach_vat': {
// Cauldron simmer and caustic vapor bed
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 420, 1.8, 0.075, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 65.41, 'sine', 0.02, sources, masterGain, 0.05, 1.4);

      // Highlights: Wooden paddle stirring thick boiling paper pulp (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.048, 180);
      });
      // Highlights: Caustic bleach steam hiss burst (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSteamPuff(ctx, masterGain, noiseBuffers, 0.05, 0.5);
      });
      return true;
    }

    // The Tree of Confession: Weeping willow canopy wind, hundreds of silk confession ribbons fluttering, whispered secrets
    case 'tree_of_confession': {
// Weeping willow canopy wind and branch creak
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 380, 1.3, 0.07, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 77.78, 'sine', 0.018, sources, masterGain, 0.03, 1.0); // Eb2 tree root

      // Highlights: Hundreds of silk ribbons fluttering in wind (every 2.2s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2200, 4500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.05);
      });
      // Highlights: Whispered confessions carried on breeze (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSpectralWhisper(ctx, masterGain, noiseBuffers, 0.038, 2.0);
      });
      return true;
    }

    // The Vowel Black Market: Damp sewer brick tone, goblin counting illicit brass letter stamps, coin purse jingling
    case 'vowel_black_market': {
// Damp sewer brick tone and dripping culvert
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 310, 1.4, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 61.74, 'sine', 0.022, sources, masterGain, 0.04, 1.0); // B1 sewer

      // Highlights: Counting brass alphabet stamps on velvet counter (every 2.2s - 4.8s)
      EventAmbianceBuilder.scheduleRandom(2200, 4800, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 820);
      });
      // Highlights: Heavy leather coin pouch jingling (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCoinClink(ctx, masterGain, 0.05);
      });
      // Highlights: Sewer water drip (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playWaterDrop(ctx, masterGain, 0.035, 1450, false);
      });
      return true;
    }

    // The Living Footnote: Cozy study room tone, high-pitched animated asterisk ink-feet scurrying across books
    case 'living_footnote': {
// Quiet library desk room tone & gentle clock tick
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.016, sources, masterGain, 0.03, 0.8);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 380, 1.0, 0.05, sources, masterGain);

      // Highlights: Animated asterisk ink-feet scurrying across paper (every 2s - 4.2s)
      EventAmbianceBuilder.scheduleRandom(2000, 4200, intervalIds, ctx, masterGain, () => {
        const steps = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < steps; i++) {
          window.setTimeout(() => {
            if (ctx.state === 'running') {
              EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.03, 1350 + Math.random() * 300);
            }
          }, i * 65);
        }
      });
      // Highlights: Tiny ink homunculus chirp/sneeze (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 2600, 0.025, 0.5);
      });
      // Highlights: Little hop impact off book edge (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.04, 380);
      });
      return true;
    }

    // The Anagram Crucible: Foundry furnace roar, molten lead bubbling in iron crucible, red-hot font blocks quenched
    case 'anagram_crucible': {
// Blacksmith foundry heat roar & molten metal bed
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 290, 1.5, 0.08, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 50.0, 'sawtooth', 0.018, sources, masterGain, 0.05, 1.5); // Foundry flame

      // Highlights: Molten lead bubbling in iron crucible (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.048, 190);
      });
      // Highlights: Steel tongs gripping heavy casting mold (every 4s - 8s)
      EventAmbianceBuilder.scheduleRandom(4000, 8000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.05, 750);
      });
      // Highlights: Steam hiss of red-hot font blocks quenched in cold ink (every 6.5s - 13s)
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playSteamPuff(ctx, masterGain, noiseBuffers, 0.065, 0.7);
      });
      return true;
    }

    // The Astrolabe of Leylines: Celestial observatory resonance, rotating brass gimbal gears meshing, cosmic alignment ring
    case 'leyline_astrolabe': {
// Celestial observatory resonance and night chill
      EventAmbianceBuilder.addDrone(ctx, 65.41, 'sine', 0.024, sources, masterGain, 0.03, 1.2); // C2 observatory
      EventAmbianceBuilder.addDrone(ctx, 196.0, 'triangle', 0.014, sources, masterGain, 0.04, 1.5); // G3 celestial

      // Highlights: Precision brass gimbal gears meshing (every 2.2s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2200, 4500, intervalIds, ctx, masterGain, () => {
        for (let i = 0; i < 3; i++) {
          window.setTimeout(() => {
            if (ctx.state === 'running') {
              EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.042, 1150);
            }
          }, i * 90);
        }
      });
      // Highlights: Cosmic astrolabe ring alignment chime (every 5.5s - 11s)
      EventAmbianceBuilder.scheduleRandom(5500, 11000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1680, 0.035, 2.2);
      });
      return true;
    }

    // The Echo Cavern: Acoustic crystal cave body (196Hz G3), stuttering multi-bounce stereo echoes, crystal singing rings
    case 'stuttering_echo_cavern': {
// Resonant acoustic crystal cave body
      EventAmbianceBuilder.addDrone(ctx, 196.0, 'sine', 0.022, sources, masterGain, 0.05, 1.8); // G3 crystal
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 620, 2.8, 0.06, sources, masterGain);

      // Highlights: Stuttering echo bounces (e-e-echo pinging across ears) (every 2.5s - 5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5000, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const notes = [1400, 1400, 1400];
        notes.forEach((f, idx) => {
          const t = curr + idx * 0.16;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          const g = ctx.createGain();
          const amp = 0.045 / (idx + 1);
          g.gain.setValueAtTime(amp, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.16);
        });
      });
      // Highlights: Crystal stalactite singing resonance (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 2450, 0.03, 2.4);
      });
      return true;
    }

    // The Blacklist Bounty Hunter: Mountain pass wind, coarse whetstone sharpening steel nib dagger, Wanted poster flapping
    case 'blacklist_bounty_hunter': {
// Mountain timber outpost wind and timber creaks
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 490, 1.4, 0.08, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 73.42, 'sine', 0.018, sources, masterGain, 0.03, 1.0); // D2 outpost

      // Highlights: Coarse whetstone steadily sharpening steel nib blade (every 2.2s - 4.5s)
      EventAmbianceBuilder.scheduleRandom(2200, 4500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.05);
      });
      // Highlights: Leather armor buckle adjustment (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.042, 420);
      });
      // Highlights: Wanted poster parchment flapping against timber post (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.055);
      });
      return true;
    }

    // The Origami Master's Workshop: Peaceful tatami room quiet, boxwood folding bone creasing mulberry paper, bamboo clack
    case 'origami_master_workshop': {
// Peaceful tatami room stillness and bamboo water trickle
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 320, 1.0, 0.05, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 130.81, 'sine', 0.016, sources, masterGain, 0.02, 0.6); // C3 peaceful

      // Highlights: Boxwood folding bone creasing heavy mulberry paper (every 2.2s - 4.8s)
      EventAmbianceBuilder.scheduleRandom(2200, 4800, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.048);
      });
      // Highlights: Bamboo water fountain 'clack' against stone (every 5.5s - 11s)
      EventAmbianceBuilder.scheduleRandom(5500, 11000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 360);
      });
      return true;
    }

    // The Red Ink Audit Bureau: Cold imperial audit room tone, heavy bureaucratic iron seal stamps, aggressive crimson nib scratches
    case 'red_ink_audit': {
// Bureaucratic stone chamber chill
      EventAmbianceBuilder.addDrone(ctx, 55.0, 'sine', 0.022, sources, masterGain, 0.03, 1.0); // A1 institutional
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 350, 1.4, 0.065, sources, masterGain);

      // Highlights: Aggressive crimson correction nib scratching across paper (every 2s - 4.2s)
      EventAmbianceBuilder.scheduleRandom(2000, 4200, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playQuillScratch(ctx, masterGain, noiseBuffers, 0.05);
      });
      // Highlights: Heavy bureaucratic iron seal stamp thudding onto ledger (every 3.8s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3800, 7500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.065, 120);
      });
      return true;
    }

    // The Clockwork Metronome: Abandoned conservatory space, colossal swinging brass pendulum swoosh, strict alternating tick-tock
    case 'clockwork_metronome': {
// Empty conservatory acoustic space & piano string resonance
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'triangle', 0.016, sources, masterGain, 0.03, 1.0);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 450, 1.5, 0.06, sources, masterGain);

      // Strict metronome alternating tick (520Hz) and tock (380Hz) every 1.25s
      let tickTockState = false;
      const metroTimer = window.setInterval(() => {
        if (ctx.state !== 'running') return;
        tickTockState = !tickTockState;
        const f = tickTockState ? 520 : 380;
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.05, f);
      }, 1250);
      intervalIds.push(metroTimer);

      // Highlights: Colossal pendulum arm swoosh across air (every 2.5s)
      const swooshTimer = window.setInterval(() => {
        if (ctx.state !== 'running') return;
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.035);
      }, 2500);
      intervalIds.push(swooshTimer);
      return true;
    }

    // The Two Sentry Sphinxes (Riddle 1): Desert portal wind through stone pylons, amber earth resonance, sapphire astral chime, granite eyelid grinding
    case 'two_sentries_portal': {
      // Desert portal wind whispering between colossal granite pylons
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 440, 1.6, 0.075, sources, masterGain);
      // Twin elemental magical drones: C2 65.41Hz amber earth + G2 98.0Hz sapphire astral
      EventAmbianceBuilder.addDrone(ctx, 65.41, 'sine', 0.022, sources, masterGain, 0.03, 1.0);
      EventAmbianceBuilder.addDrone(ctx, 98.0, 'sine', 0.018, sources, masterGain, 0.03, 1.2);

      // Highlights: Sapphire sentry eye flashing radiant quartz crystal chimes (every 3.5s - 7.5s)
      EventAmbianceBuilder.scheduleRandom(3500, 7500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1318.5, 0.032, 2.0); // E6 sapphire
      });
      // Highlights: Heavy granite eyelids grinding against stone brow (every 5.0s - 10.0s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 220);
      });
      // Highlights: Amber sentry chest warming with deep harmonic resonance (every 6.5s - 13.0s)
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 587.33, 0.025, 2.4); // D5 amber
      });
      return true;
    }

    // The Sphinx of the Silent Vowel (Riddle 2): Granite crypt air, deep feline granite throat purr, stone claw scrapes
    case 'sphinx_silent_vowel': {
// Granite crypt draft and deep subterranean stone body
      EventAmbianceBuilder.addDrone(ctx, 55.0, 'sine', 0.024, sources, masterGain, 0.04, 1.0); // A1 crypt
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 320, 1.2, 0.065, sources, masterGain);

      // Highlights: Deep feline granite throat rumble / stone purr (every 2.8s - 5.8s)
      EventAmbianceBuilder.scheduleRandom(2800, 5800, intervalIds, ctx, masterGain, () => {
        const curr = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, curr);
        osc.frequency.linearRampToValueAtTime(110, curr + 0.4);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(160, curr);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, curr);
        g.gain.linearRampToValueAtTime(0.035, curr + 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, curr + 0.55);
        osc.connect(lp);
        lp.connect(g);
        g.connect(masterGain);
        osc.start(curr);
        osc.stop(curr + 0.6);
      });
      // Highlights: Granite claws scraping stone pedestal (every 5s - 10s)
      EventAmbianceBuilder.scheduleRandom(5000, 10000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 420);
      });
      return true;
    }

    // The Three Alchemical Flasks (Riddle 3): Apothecary lab simmer, crystal stopper squeak, bubbling glass alembic
    case 'three_alchemist_flasks': {
// Apothecary laboratory air and Bunsen burner simmer
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'bandpass', 380, 1.6, 0.065, sources, masterGain);
      EventAmbianceBuilder.addDrone(ctx, 110.0, 'sine', 0.016, sources, masterGain, 0.03, 0.8);

      // Highlights: Crystal flask stopper squeaking out of ground-glass neck (every 2.8s - 6s)
      EventAmbianceBuilder.scheduleRandom(2800, 6000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playGlassClink(ctx, masterGain, 2400, 0.042);
      });
      // Highlights: Effervescent bubbling inside amber and violet glass alembics (every 3.5s - 7s)
      EventAmbianceBuilder.scheduleRandom(3500, 7000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playViscousBubble(ctx, masterGain, noiseBuffers, 0.042, 340);
      });
      // Highlights: Glass retort gentle clink against brass shelf (every 6s - 12s)
      EventAmbianceBuilder.scheduleRandom(6000, 12000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playGlassClink(ctx, masterGain, 1750, 0.035);
      });
      return true;
    }

    // The Palindrome Vault Door (Riddle 4): Ancient subterranean dwarven stone rune-vault draft, concentric granite wheels grinding, heavy brass letter tumblers clicking, symmetry bronze bell chime
    case 'palindrome_vault': {
      // Subterranean granite masonry cavern draft and ancient vault resonance
      EventAmbianceBuilder.addDrone(ctx, 43.65, 'sine', 0.024, sources, masterGain, 0.03, 0.9); // F1 stone foundation
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 280, 1.5, 0.065, sources, masterGain);

      // Highlights: Heavy brass letter tumblers clicking into alignment (every 2.2s - 4.8s)
      EventAmbianceBuilder.scheduleRandom(2200, 4800, intervalIds, ctx, masterGain, () => {
        for (let i = 0; i < 3; i++) {
          window.setTimeout(() => {
            if (ctx.state === 'running') {
              EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.045, 820);
            }
          }, i * 75);
        }
      });
      // Highlights: Concentric circular granite vault wheels grinding (every 4.5s - 9.0s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.05, 140);
      });
      // Highlights: Resonant symmetry bronze bell chime echoing down stone corridors (every 6.5s - 13.0s)
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playCrystalChime(ctx, masterGain, 1046.5, 0.035, 2.2); // C6 bell
      });
      return true;
    }

    // The Weighing of the Sins (Riddle 5): Solemn court chamber hush, brass balance beam pivot creaks, lead-pan clangs, wax seal crack
    case 'scales_of_the_censor': {
// Solemn court chamber hush & judicial gravity drone
      EventAmbianceBuilder.addDrone(ctx, 60.0, 'sine', 0.024, sources, masterGain, 0.02, 0.8);
      EventAmbianceBuilder.addNoiseBed(ctx, noiseBuffers, 'pink', 'lowpass', 280, 1.2, 0.06, sources, masterGain);

      // Highlights: Brass balance beam tilting and creaking on central knife-edge pivot (every 2.5s - 5.5s)
      EventAmbianceBuilder.scheduleRandom(2500, 5500, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.04, 520);
      });
      // Highlights: Heavy lead-weighted pan clanging onto magistrate bench (every 4.5s - 9s)
      EventAmbianceBuilder.scheduleRandom(4500, 9000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playMechanicalClick(ctx, masterGain, noiseBuffers, 0.055, 150);
      });
      // Highlights: Brittle seal wax cracking on parchment scroll (every 6.5s - 13s)
      EventAmbianceBuilder.scheduleRandom(6500, 13000, intervalIds, ctx, masterGain, () => {
        EventAmbianceBuilder.playParchmentFlutter(ctx, masterGain, noiseBuffers, 0.045);
      });
      return true;
    }

    default:
      return false;
  }
}
