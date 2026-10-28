<script setup lang="ts">
import { computed } from "vue";

interface Props {
  icon?: string;
  text?: string;
  size?: "small" | "medium" | "large";
}
const props = withDefaults(defineProps<Props>(), {
  size: "medium",
});
defineEmits(["click"]);

const iconSize = computed(() => {
  switch (props.size) {
    case "small":
      return "2rem";
    case "large":
      return "5rem";
    default:
      return "3rem";
  }
});
</script>
<template>
  <button type="button" class="dashed-container" @click="$emit('click')">
    <slot name="icon" :iconSize>
      <span v-if="icon" class="icon-chip">
        <orio-icon :name="icon" :size="iconSize" />
      </span>
    </slot>
    <slot>
      <span v-if="text" class="text-class">{{ text }}</span>
    </slot>
  </button>
</template>

<style scoped lang="scss">
/* native <button>: keyboard + focus for free; label stays a <span>
   because a button only allows phrasing content */
.dashed-container {
  --dashed-color: color-mix(
    in srgb,
    var(--color-border) 70%,
    var(--color-muted)
  );
  --dashed-ease: var(--motion-ease-smooth);
  --dashed-speed: 0.25s;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 2rem;

  font: inherit;
  color: var(--color-muted);
  cursor: pointer;

  background: color-mix(in srgb, var(--color-surface) 40%, transparent);
  border: 1.5px dashed var(--dashed-color);
  border-radius: var(--border-radius-lg);

  transition:
    border-color var(--dashed-speed) var(--dashed-ease),
    background-color var(--dashed-speed) var(--dashed-ease),
    color var(--dashed-speed) var(--dashed-ease),
    scale var(--dashed-speed) var(--dashed-ease);

  &:hover {
    --dashed-color: var(--color-accent);
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  &:active {
    scale: 0.98;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }
}

.icon-chip {
  display: grid;
  place-items: center;
  padding: 0.35em;
  border-radius: var(--border-radius-pill);

  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);

  transition:
    background-color var(--dashed-speed) var(--dashed-ease),
    scale var(--dashed-speed) var(--dashed-ease);

  .dashed-container:hover & {
    scale: 1.08;
    background: color-mix(in srgb, var(--color-accent) 22%, transparent);
  }
}

.text-class {
  font-size: var(--font-md);
  font-weight: 500;
}

@media (prefers-reduced-motion: reduce) {
  .dashed-container,
  .icon-chip {
    transition: none;
  }
  .dashed-container:active,
  .dashed-container:hover .icon-chip {
    scale: none;
  }
}
</style>
