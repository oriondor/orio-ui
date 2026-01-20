export interface SoundOptions {
  src?: string;
  volume?: number;
}

const DEFAULT_SOUND =
  "https://cdn.jsdelivr.net/gh/oriondor/0re0-ui@main/docs/public/sounds/mechanical-switch.wav";

export function useSound(options: SoundOptions = {}) {
  const { src = DEFAULT_SOUND, volume = 0.3 } = options;

  const audio =
    typeof window !== "undefined" ? new Audio(src) : null;

  const play = () => {
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  return { play };
}
