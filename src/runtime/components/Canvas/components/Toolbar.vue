<script setup lang="ts">
import { computed, provide, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { CANVAS_CONTEXT, type CanvasContext } from "../context";
import { canvasRegistry } from "../registry";
import ToolButton from "./ToolButton.vue";

interface Props {
  /**
   * Name of the `<orio-canvas>` instance to bind to. Lets the toolbar live
   * anywhere in the app — header, sidebar, modal — not just inside the canvas.
   */
  canvas: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

const ctx = computed(() => canvasRegistry.get(props.canvas));

watchEffect(() => {
  if (import.meta.env.DEV && !ctx.value) {
    console.warn(
      `[orio-canvas-toolbar] no canvas registered with name "${props.canvas}". ` +
        `Make sure <orio-canvas name="${props.canvas}" /> is mounted.`,
    );
  }
});

// Re-provide a reactive proxy so descendants (ToolButton, widget tools)
// resolve the current canvas via `useCanvasContext()` even when the toolbar
// lives outside the canvas component subtree.
const proxy = new Proxy({} as CanvasContext, {
  get(_, key) {
    const real = ctx.value;
    if (!real) return undefined;
    return real[key as keyof CanvasContext];
  },
});
provide(CANVAS_CONTEXT, proxy);
</script>

<template>
  <div
    v-if="ctx"
    class="canvas-toolbar"
    role="toolbar"
    :aria-label="t('canvas.toolbarLabel')"
  >
    <slot
      :tools="ctx.tools.value"
      :active-tool-id="ctx.activeToolId.value"
      :set-active-tool="ctx.setActiveTool"
    >
      <ToolButton v-for="tool in ctx.tools.value" :key="tool.id" :tool />
    </slot>
  </div>
</template>

<style scoped>
.canvas-toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
}
</style>
