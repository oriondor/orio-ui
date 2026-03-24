export interface SoundOptions {
  src?: string;
  volume?: number;
}

const DEFAULT_SOUND =
  "https://cdn.jsdelivr.net/gh/oriondor/orio-ui@main/docs/public/sounds/mechanical-switch.wav";

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

async function fetchBuffer(
  ctx: AudioContext,
  src: string,
): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(src);
  if (cached) return cached;

  try {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(src, buffer);
    return buffer;
  } catch {
    return null;
  }
}

export function useSound(options: SoundOptions = {}) {
  const { src = DEFAULT_SOUND, volume = 0.3 } = options;

  // Pre-fetch the audio buffer
  const ctx = getAudioContext();
  if (ctx) fetchBuffer(ctx, src);

  const play = async () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (e.g. before first user gesture)
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }

    const buffer = await fetchBuffer(ctx, src);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  };

  return { play };
}
