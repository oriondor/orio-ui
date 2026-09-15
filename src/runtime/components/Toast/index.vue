<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useI18n } from "vue-i18n";
import type { ToastAction, ToastVariant } from "../../composables/useToast";

export interface ToastProps {
  message?: string;
  title?: string;
  variant?: ToastVariant;
  closable?: boolean;
  /** Milliseconds the countdown bar runs for; also the toast's own timeout. */
  timeout?: number;
  showTimeout?: boolean;
  /** Freezes the countdown bar — the host pauses a whole stack at once. */
  paused?: boolean;
  actions?: ToastAction[];
}

const props = withDefaults(defineProps<ToastProps>(), {
  message: "",
  title: undefined,
  variant: "info",
  closable: true,
  timeout: 0,
  showTimeout: false,
  paused: false,
  actions: () => [],
});

const emit = defineEmits<{
  close: [];
  action: [action: ToastAction];
}>();

const { t } = useI18n();

const slots = useSlots();

// Danger interrupts the screen reader; everything else waits its turn.
const role = computed(() => (props.variant === "danger" ? "alert" : "status"));

const hasActions = computed(() => {
  return Boolean(props.actions.length || slots.actions);
});

// A sticky toast has nothing to count down, so it never grows a bar.
const hasProgress = computed(() => props.showTimeout && props.timeout > 0);

const progressStyle = computed(() => ({
  "--toast-timeout": `${props.timeout}ms`,
}));

function close() {
  emit("close");
}
</script>

<template>
  <div class="toast" :class="[variant]" :role>
    <div class="toast-body">
      <orio-view-text v-if="title" type="subtitle" class="toast-title">
        {{ title }}
      </orio-view-text>

      <orio-view-text class="toast-message">
        <slot>{{ message }}</slot>
      </orio-view-text>
    </div>

    <div v-if="hasActions" class="toast-actions">
      <slot name="actions" :actions :close>
        <orio-button
          v-for="action in actions"
          :key="action.label"
          :variant="action.variant ?? 'secondary'"
          :icon="action.icon"
          size="xs"
          @click="emit('action', action)"
        >
          {{ action.label }}
        </orio-button>
      </slot>
    </div>

    <orio-button
      v-if="closable"
      icon="close-rounded"
      variant="subdued"
      class="toast-close"
      size="xs"
      :aria-label="t('toast.close')"
      @click="close"
    />

    <div
      v-if="hasProgress"
      class="toast-progress"
      :class="{ paused }"
      :style="progressStyle"
    />
  </div>
</template>

<style scoped lang="scss">
.toast {
  pointer-events: auto;
  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  gap: 0.75rem;

  min-width: 16rem;
  max-width: min(24rem, calc(100vw - 2rem));
  padding: 0.5rem;

  color: var(--color-text);
  background-color: var(--color-surface);
  --toast-rail: var(--color-border);

  border: 1px solid var(--color-border);
  border-inline-start: 3px solid var(--toast-rail);
  border-radius: var(--border-radius-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);

  &.info {
    --toast-rail: var(--color-info);

    background-color: var(--color-info-soft);
    border-color: var(--color-info-border);
  }

  &.success {
    --toast-rail: var(--color-success);

    background-color: var(--color-success-soft);
    border-color: var(--color-success-border);
  }

  &.alert {
    --toast-rail: var(--color-alert);

    background-color: var(--color-alert-soft);
    border-color: var(--color-alert-border);
  }

  &.danger {
    --toast-rail: var(--color-danger);

    background-color: var(--color-danger-soft);
    border-color: var(--color-danger-border);
  }
}

.toast-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
}

.toast-message {
  font-size: var(--font-md);
}

.toast-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.toast-close {
  flex-shrink: 0;
  margin-inline-start: -0.25rem;
}

.toast-progress {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  height: 2px;

  background-color: var(--toast-rail);
  transform-origin: 0 50%;

  animation: toast-countdown var(--toast-timeout) linear forwards;

  &.paused {
    animation-play-state: paused;
  }
}

@keyframes toast-countdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
