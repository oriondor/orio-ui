<script setup lang="ts">
import { useCanvasContext } from "../context";
import type { CanvasTool } from "../types";

interface Props {
  tool: CanvasTool;
}

const props = defineProps<Props>();
const ctx = useCanvasContext();

interface ColorPickerOptions extends Record<string, unknown> {
  color: string;
  targets: string[];
}

const options = ctx.getToolOptions<ColorPickerOptions>(props.tool.id);

function onChange(e: Event) {
  const color = (e.target as HTMLInputElement).value;
  options.color = color;
  for (const targetId of options.targets ?? []) {
    const targetOpts = ctx.getToolOptions<Record<string, unknown>>(targetId);
    if (targetOpts) targetOpts.color = color;
  }
}
</script>

<template>
  <orio-control-element>
    <input
      type="color"
      :value="options.color"
      :title="tool.label ?? 'Color'"
      class="canvas-color-picker"
      @input="onChange"
    />
  </orio-control-element>
</template>

<style scoped>
.canvas-color-picker {
  width: 2rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  cursor: pointer;
  background: none;
}
</style>
