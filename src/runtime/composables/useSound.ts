export interface SoundOptions {
  src?: string;
  volume?: number;
  prefetch?: boolean;
}

const DEFAULT_SOUND =
  "https://cdn.jsdelivr.net/gh/oriondor/orio-ui@main/docs/public/sounds/mechanical-switch.wav";

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer | null>>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;

  const ContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!ContextClass) return null;

  try {
    audioContext = new ContextClass();
  } catch (e) {
    console.error("[useSound] Failed to create AudioContext:", e);
    return null;
  }

  return audioContext;
}

function fetchBuffer(
  ctx: AudioContext,
  src: string,
): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(src);
  if (cached) return cached;

  const promise = fetch(src)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
    .catch((e) => {
      console.error(`[useSound] Failed to load sound "${src}":`, e);
      bufferCache.delete(src);
      return null;
    });

  bufferCache.set(src, promise);
  return promise;
}

export function useSound(options: SoundOptions = {}) {
  const { src = DEFAULT_SOUND, volume = 0.3, prefetch = false } = options;

  const warmUp = () => {
    const ctx = getAudioContext();
    if (ctx) fetchBuffer(ctx, src);
  };

  if (prefetch) warmUp();

  const play = async () => {
    const ctx = getAudioContext();
    if (!ctx) return;

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

  return { play, prefetch: warmUp };
}
