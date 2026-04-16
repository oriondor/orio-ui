<script setup lang="ts">
import { ref, computed, h } from "vue";
import { useCanvasContext } from "../context";
import type { CanvasTool } from "../types";

interface Props {
  tool: CanvasTool;
}

const props = defineProps<Props>();

const ctx = useCanvasContext();

const kind = computed(() => props.tool.kind ?? "interaction");

const isActive = computed(
  () =>
    kind.value === "interaction" && ctx.activeToolId.value === props.tool.id,
);

const showTooltip = ref(true);

const isDisabled = computed(() => {
  if (!props.tool.disabled) return false;
  return props.tool.disabled(ctx.getToolApi(props.tool.id));
});

function onClick() {
  showTooltip.value = false;
  if (kind.value === "action") {
    props.tool.action?.(ctx.getToolApi(props.tool.id));
  } else if (kind.value === "interaction") {
    ctx.setActiveTool(props.tool.id);
  }
}

const tooltip = computed(() => {
  if (props.tool.tooltip) {
    return h(props.tool.tooltip);
  }
  return h("span", props.tool.label ?? props.tool.id);
});
</script>

<template>
  <component
    :is="tool.toolbar"
    v-if="kind === 'widget' && tool.toolbar"
    :tool
  />

  <orio-tooltip v-else :disabled="!showTooltip">
    <template #default>
      <orio-button
        appearance="minimal"
        :variant="isActive ? 'primary' : 'subdued'"
        :aria-pressed="kind === 'interaction' ? isActive : undefined"
        :disabled="isDisabled"
        @click="onClick"
        @mouseleave="showTooltip = true"
      >
        <slot :tool :is-active :activate="onClick">
          <orio-icon v-if="tool.icon" :name="tool.icon" />
          <span v-else>{{ tool.label ?? tool.id }}</span>
        </slot>
      </orio-button>
    </template>
    <template #content>
      <slot name="tooltip">
        <component :is="tooltip" />
      </slot>
    </template>
  </orio-tooltip>
</template>

<style scoped></style>
