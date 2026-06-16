import {
  computed,
  inject,
  provide,
  ref,
  type ComputedRef,
  type Ref,
} from "vue";
import type { ControlSize } from "../components/ControlElement.vue";

const CONTROL_SIZE_KEY = Symbol("control-size");

const sizeTokens: Record<ControlSize, Record<string, string>> = {
  xs: {
    "--control-font-size": "var(--font-sm)",
    "--control-label-font-size": "var(--font-xs)",
    "--control-py": "0.125rem",
    "--control-px": "0.25rem",
    "--control-gap": "0.125rem",
    "--control-radius": "var(--border-radius-sm)",
    "--control-icon-size": "0.625rem",
    "--control-inner-block-start": "0.85rem",
    "--control-inner-block-end": "0.1rem",
    "--control-label-block-start": "0.15rem",
  },
  sm: {
    "--control-font-size": "var(--font-sm)",
    "--control-label-font-size": "var(--font-xs)",
    "--control-py": "0.25rem",
    "--control-px": "0.5rem",
    "--control-gap": "0.25rem",
    "--control-radius": "var(--border-radius-sm)",
    "--control-icon-size": "0.75rem",
    "--control-inner-block-start": "1rem",
    "--control-inner-block-end": "0.1rem",
    "--control-label-block-start": "0.2rem",
  },
  md: {
    "--control-font-size": "var(--font-md)",
    "--control-label-font-size": "var(--font-sm)",
    "--control-py": "0.5rem",
    "--control-px": "0.75rem",
    "--control-gap": "0.5rem",
    "--control-radius": "var(--border-radius-md)",
    "--control-icon-size": "1rem",
    "--control-inner-block-start": "1.25rem",
    "--control-inner-block-end": "0.2rem",
    "--control-label-block-start": "0.25rem",
  },
  lg: {
    "--control-font-size": "var(--font-lg)",
    "--control-label-font-size": "var(--font-md)",
    "--control-py": "0.625rem",
    "--control-px": "1rem",
    "--control-gap": "0.5rem",
    "--control-radius": "var(--border-radius-md)",
    "--control-icon-size": "1.25rem",
    "--control-inner-block-start": "1.1rem",
    "--control-inner-block-end": "0.2rem",
    "--control-label-block-start": "0.25rem",
  },
  xl: {
    "--control-font-size": "var(--font-xl)",
    "--control-label-font-size": "var(--font-lg)",
    "--control-py": "0.75rem",
    "--control-px": "1.25rem",
    "--control-gap": "0.75rem",
    "--control-radius": "var(--border-radius-lg)",
    "--control-icon-size": "1.5rem",
    "--control-inner-block-start": "1.5rem",
    "--control-inner-block-end": "0",
    "--control-label-block-start": "0.25rem",
  },
};

export function provideControlSize(
  size: Ref<ControlSize> | ComputedRef<ControlSize>,
) {
  provide(CONTROL_SIZE_KEY, size);
}

export function useControlTokens(
  explicit?:
    | Ref<ControlSize | undefined>
    | ComputedRef<ControlSize | undefined>,
  fallback: ControlSize = "md",
) {
  const injected = inject<Ref<ControlSize>>(CONTROL_SIZE_KEY, ref(fallback));
  const size = computed(() => explicit?.value ?? injected.value);
  const tokens = computed(() => sizeTokens[size.value]);
  return { size, tokens };
}

export { sizeTokens };
