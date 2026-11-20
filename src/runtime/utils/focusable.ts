export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary:first-of-type:not([tabindex="-1"])';

/** Tabbable descendants of `root`, in DOM order. */
export function getFocusable(root: Element | null | undefined): HTMLElement[] {
  if (!root) return [];
  // checkVisibility drops display:none / hidden controls (absent in jsdom)
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => element.checkVisibility?.() !== false,
  );
}
