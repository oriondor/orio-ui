import { ref } from "vue";

export function usePressAndHold() {
  const interval = ref<number | null>(null);
  const timeout = ref<number | null>(null);

  function pressAndHold(callback: () => void) {
    callback();
    timeout.value = window.setTimeout(() => {
      interval.value = window.setInterval(callback, 50);
    }, 500);
  }

  function stop() {
    if (timeout.value) {
      window.clearTimeout(timeout.value);
      timeout.value = null;
    }
    if (interval.value) {
      window.clearInterval(interval.value);
      interval.value = null;
    }
  }

  return { pressAndHold, stop };
}
