<script setup lang="ts">
import { ref } from "vue";
import { useDragSource } from "../composables/useDragAndDrop";

export interface DraggableProps {
  /** handed to the drop zone's `drop` event */
  data?: unknown;
  /** only drop zones with the same group (or none) accept it */
  group?: string;
  disabled?: boolean;
  /**
   * "auto": mouse/pen drag on movement, touch after `delay`.
   * "longpress": every pointer must hold first, with the long-press shrink
   * and Safari force click.
   */
  activation?: "auto" | "longpress";
  /** hold in ms; defaults to 300 for auto touch, 500 for longpress */
  delay?: number;
}

const props = withDefaults(defineProps<DraggableProps>(), {
  data: undefined,
  group: undefined,
  disabled: false,
  activation: "auto",
  delay: undefined,
});

const emit = defineEmits<{
  dragStart: [data: unknown];
  dragEnd: [dropped: boolean];
}>();

const root = ref<HTMLElement | null>(null);

const { isDragging, start } = useDragSource(root, {
  data: () => props.data,
  group: () => props.group,
  disabled: () => props.disabled,
  delay: () => props.delay,
  activation: () => (props.activation === "longpress" ? "manual" : "auto"),
  onStart: (data) => emit("dragStart", data),
  onEnd: (dropped) => emit("dragEnd", dropped),
});
</script>

<template>
  <div ref="root" class="draggable" :class="{ dragging: isDragging, disabled }">
    <orio-long-press
      v-if="activation === 'longpress'"
      :delay
      :disabled
      @trigger="start()"
    >
      <slot :is-dragging />
    </orio-long-press>
    <slot v-else :is-dragging />
  </div>
</template>

<style scoped>
.draggable {
  display: inline-flex;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.draggable.disabled {
  cursor: auto;
}

.draggable.dragging {
  opacity: 0.4;
}
</style>
