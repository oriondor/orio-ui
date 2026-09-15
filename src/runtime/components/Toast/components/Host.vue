<script setup lang="ts">
import { computed, reactive, unref, watchEffect } from "vue";
import Toast from "../index.vue";
import {
  useToast,
  type ToastItem,
  type ToastPosition,
  type ToastTarget,
} from "../../../composables/useToast";

interface ToastStack {
  position: ToastPosition;
  toasts: ToastItem[];
}

interface ToastGroup {
  key: string;
  destination: string | HTMLElement;
  isScoped: boolean;
  stacks: ToastStack[];
}

const POSITIONS: ToastPosition[] = [
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
];

const { toasts, closeToast, pauseToast, resumeToast, triggerAction } =
  useToast();

// Element and ref targets have no printable identity, so they earn one here
// and keep it — the key has to stay stable or Vue re-creates the teleport.
const targetKeys = new WeakMap<object, string>();
let lastTargetKey = 0;

function targetKey(target?: ToastTarget): string {
  if (!target) return "body";
  if (typeof target === "string") return `selector:${target}`;

  const known = targetKeys.get(target);
  if (known) return known;

  lastTargetKey += 1;
  const key = `target-${lastTargetKey}`;
  targetKeys.set(target, key);

  return key;
}

function resolveTarget(target?: ToastTarget): string | HTMLElement {
  if (!target) return "body";
  if (typeof target === "string") return target;

  return unref(target) ?? "body";
}

const groups = computed<ToastGroup[]>(() => {
  const grouped = new Map<string, ToastItem[]>();
  const targets = new Map<string, ToastTarget | undefined>();

  toasts.value.forEach((toast) => {
    const key = targetKey(toast.target);
    targets.set(key, toast.target);
    grouped.set(key, [...(grouped.get(key) ?? []), toast]);
  });

  return [...grouped.entries()].map(([key, groupToasts]) => {
    const destination = resolveTarget(targets.get(key));

    return {
      key,
      destination,
      isScoped: destination !== "body",
      stacks: POSITIONS.map((position) => ({
        position,
        toasts: groupToasts.filter((toast) => toast.position === position),
      })).filter((stack) => stack.toasts.length > 0),
    };
  });
});

// A statically positioned target would let its toasts escape to the viewport.
watchEffect(() => {
  groups.value.forEach((group) => {
    const element = group.destination;
    if (typeof element === "string") return;

    const position =
      element.style.position || getComputedStyle(element).position;
    if (position && position !== "static") return;

    element.style.position = "relative";
  });
});

// Hover and focus pause a whole stack, so the cards in it need to know —
// their countdown bars freeze with the timers.
const pausedStacks = reactive(new Set<string>());

function stackKey(group: ToastGroup, stack: ToastStack): string {
  return `${group.key}|${stack.position}`;
}

function pauseStack(group: ToastGroup, stack: ToastStack) {
  pausedStacks.add(stackKey(group, stack));
  stack.toasts.forEach((toast) => pauseToast(toast.id));
}

function resumeStack(group: ToastGroup, stack: ToastStack) {
  pausedStacks.delete(stackKey(group, stack));
  stack.toasts.forEach((toast) => resumeToast(toast.id));
}
</script>

<template>
  <teleport v-for="group in groups" :key="group.key" :to="group.destination">
    <div
      v-for="stack in group.stacks"
      :key="stack.position"
      class="toast-stack"
      :class="[stack.position, { scoped: group.isScoped }]"
      @mouseenter="pauseStack(group, stack)"
      @mouseleave="resumeStack(group, stack)"
      @focusin="pauseStack(group, stack)"
      @focusout="resumeStack(group, stack)"
    >
      <transition-group name="toast-list">
        <Toast
          v-for="toast in stack.toasts"
          :key="toast.id"
          :message="toast.message"
          :title="toast.title"
          :variant="toast.variant"
          :closable="toast.closable"
          :timeout="toast.timeout"
          :showTimeout="toast.showTimeout"
          :paused="pausedStacks.has(stackKey(group, stack))"
          :actions="toast.actions"
          @close="closeToast(toast.id)"
          @action="triggerAction(toast, $event)"
        />
      </transition-group>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.toast-stack {
  position: fixed;
  z-index: 200;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;

  max-height: 100%;
  overflow: hidden;

  /* The stack spans a whole edge; only the toasts themselves take clicks. */
  pointer-events: none;

  &.scoped {
    position: absolute;
    padding: 0.5rem;
  }

  &.top-start,
  &.top-center,
  &.top-end {
    inset-block-start: 0;
  }

  &.bottom-start,
  &.bottom-center,
  &.bottom-end {
    inset-block-end: 0;
  }

  &.top-start,
  &.bottom-start {
    inset-inline-start: 0;
    align-items: flex-start;
  }

  &.top-end,
  &.bottom-end {
    inset-inline-end: 0;
    align-items: flex-end;
  }

  &.top-center,
  &.bottom-center {
    inset-inline: 0;
    align-items: center;
  }
}

.toast-list-enter-active,
.toast-list-leave-active,
.toast-list-move {
  transition:
    opacity var(--motion-duration-medium) var(--motion-ease-smooth),
    transform var(--motion-duration-medium) var(--motion-ease-smooth);
}

.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateY(var(--motion-distance-medium));
}

.top-start,
.top-center,
.top-end {
  .toast-list-enter-from,
  .toast-list-leave-to {
    transform: translateY(calc(-1 * var(--motion-distance-medium)));
  }
}
</style>
