import { effectScope, onBeforeUnmount, watch, type Ref } from "vue";
import { useScrollLock } from "@vueuse/core";

// shared across every caller: first lock locks the page, last release frees
// it, so stacked overlays don't unlock each other
let holders = 0;
let bodyLock: Ref<boolean> | undefined;
// body's own inline padding-right, restored on the last release
let savedPadding = "";

// locking hides the scrollbar; pad body by its width so content doesn't jump.
// --orio-scrollbar-gap lets consumers pad their position: fixed elements too.
function lockPage() {
  holders += 1;
  if (holders > 1) return;

  const root = document.documentElement;
  // measure before locking, while the scrollbar is still there
  const gap = window.innerWidth - root.clientWidth;
  if (gap > 0) {
    const body = document.body;
    savedPadding = body.style.paddingRight;
    // add to whatever padding body already has (inline or stylesheet)
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${padding + gap}px`;
    root.style.setProperty("--orio-scrollbar-gap", `${gap}px`);
  }
  bodyLock ??= effectScope(true).run(() => useScrollLock(document.body));
  if (bodyLock) bodyLock.value = true;
}

function unlockPage() {
  holders = Math.max(0, holders - 1);
  if (holders > 0) return;

  if (bodyLock) bodyLock.value = false;
  if (document.documentElement.style.getPropertyValue("--orio-scrollbar-gap")) {
    document.body.style.paddingRight = savedPadding;
  }
  document.documentElement.style.removeProperty("--orio-scrollbar-gap");
}

export function usePageScrollLock(locked: Ref<boolean | undefined>) {
  // whether this caller counts toward holders
  let holdsLock = false;

  function setLocked(lock: boolean) {
    if (typeof document === "undefined" || lock === holdsLock) return;
    holdsLock = lock;
    if (lock) lockPage();
    else unlockPage();
  }

  watch(locked, (lock) => setLocked(Boolean(lock)), { immediate: true });
  onBeforeUnmount(() => setLocked(false));
}
