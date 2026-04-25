/**
 * Web Audio soundscape for the reading experience.
 * Uses only synthesized audio so the app stays self-contained.
 */

type AmbientMode = 'quiet' | 'rain' | 'tension' | 'release';

type AmbientState = {
  source: AudioBufferSourceNode;
  hiss: GainNode;
  hissFilter: BiquadFilterNode;
  pad: OscillatorNode;
  padGain: GainNode;
  shimmer: OscillatorNode;
  shimmerGain: GainNode;
  output: GainNode;
  mode: AmbientMode;
};

let audioCtx: AudioContext | null = null;
let ambientState: AmbientState | null = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const makeNoiseBuffer = (ctx: AudioContext, durationSeconds = 2) => {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * durationSeconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

const makeEnvelope = (gain: GainNode, ctx: AudioContext, peak: number, release: number) => {
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + release);
};

const stopAmbient = () => {
  if (!ambientState) return;
  const { source, pad, shimmer, output } = ambientState;
  try {
    source.stop();
    pad.stop();
    shimmer.stop();
  } catch {
    // Ignore stop errors when the browser has already cleaned up nodes.
  }
  output.disconnect();
  ambientState = null;
};

const applyAmbientMode = (mode: AmbientMode) => {
  if (!ambientState || ambientState.mode === mode) return;

  const { hissFilter, pad, padGain, shimmer, shimmerGain } = ambientState;
  ambientState.mode = mode;

  const now = getAudioCtx().currentTime;
  const presets: Record<AmbientMode, { filter: number; pad: number; padGain: number; shimmer: number; shimmerGain: number }> = {
    quiet: { filter: 520, pad: 48, padGain: 0.018, shimmer: 0.12, shimmerGain: 0.004 },
    rain: { filter: 860, pad: 58, padGain: 0.024, shimmer: 0.18, shimmerGain: 0.006 },
    tension: { filter: 640, pad: 36, padGain: 0.03, shimmer: 0.28, shimmerGain: 0.01 },
    release: { filter: 980, pad: 72, padGain: 0.02, shimmer: 0.1, shimmerGain: 0.003 },
  };

  const preset = presets[mode];
  hissFilter.frequency.cancelScheduledValues(now);
  hissFilter.frequency.linearRampToValueAtTime(preset.filter, now + 0.4);
  pad.frequency.cancelScheduledValues(now);
  pad.frequency.linearRampToValueAtTime(preset.pad, now + 0.4);
  padGain.gain.cancelScheduledValues(now);
  padGain.gain.linearRampToValueAtTime(preset.padGain, now + 0.4);
  shimmer.frequency.cancelScheduledValues(now);
  shimmer.frequency.linearRampToValueAtTime(preset.shimmer, now + 0.4);
  shimmerGain.gain.cancelScheduledValues(now);
  shimmerGain.gain.linearRampToValueAtTime(preset.shimmerGain, now + 0.4);
};

export const setAmbientMode = (mode: AmbientMode, enabled = true) => {
  if (!enabled) {
    stopAmbient();
    return;
  }

  const ctx = getAudioCtx();
  if (!ambientState) {
    const source = ctx.createBufferSource();
    source.buffer = makeNoiseBuffer(ctx, 2);
    source.loop = true;

    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'lowpass';

    const hiss = ctx.createGain();
    hiss.gain.value = 0.002;

    const output = ctx.createGain();
    output.gain.value = 0.65;

    const pad = ctx.createOscillator();
    pad.type = 'sine';

    const padGain = ctx.createGain();
    padGain.gain.value = 0.02;

    const shimmer = ctx.createOscillator();
    shimmer.type = 'triangle';

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.004;

    source.connect(hissFilter);
    hissFilter.connect(hiss);
    hiss.connect(output);
    output.connect(ctx.destination);

    pad.connect(padGain);
    padGain.connect(output);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(output);

    source.start();
    pad.start();
    shimmer.start();

    ambientState = {
      source,
      hiss,
      hissFilter,
      pad,
      padGain,
      shimmer,
      shimmerGain,
      output,
      mode,
    };
  }

  applyAmbientMode(mode);
};

const playTone = (shape: OscillatorType, start: number, end: number, volume: number, filterType?: BiquadFilterType) => {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = shape;
  if (filterType) {
    filter.type = filterType;
    filter.frequency.value = 1800;
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }

  gain.connect(ctx.destination);
  makeEnvelope(gain, ctx, volume, end);
  osc.start();
  osc.stop(ctx.currentTime + end);
};

export const playHoverSound = () => playTone('sine', 0.01, 0.05, 0.015, 'highpass');

export const playClickSound = () => playTone('triangle', 0.02, 0.12, 0.05, 'bandpass');

export const playOpenSound = () => {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  makeEnvelope(gain, ctx, 0.04, 0.45);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
};

export const playPageTurnSound = () => {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  makeEnvelope(gain, ctx, 0.02, 0.16);
  osc.start();
  osc.stop(ctx.currentTime + 0.16);
};

export const playClueSound = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(740, now);
  osc.frequency.exponentialRampToValueAtTime(1040, now + 0.14);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  osc.start();
  osc.stop(now + 0.3);
};

export const playCloseSound = () => {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  makeEnvelope(gain, ctx, 0.03, 0.25);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
};

export const stopAmbientAudio = stopAmbient;
