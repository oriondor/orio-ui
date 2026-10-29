import type { InjectionKey, Ref } from "vue";

/**
 * `#id` selector of the open modal's dialog element (caller id or generated). Popovers inside a modal
 * teleport there instead of `<body>`, so they stay inside the `aria-modal`
 * dialog (screen readers treat everything outside it as inert).
 */
export const modalTeleportTarget: InjectionKey<Readonly<Ref<string>>> = Symbol(
  "orio-modal-teleport-target",
);
