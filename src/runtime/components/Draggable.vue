<script setup lang="ts">
import { nextTick, ref } from "vue";
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
  /** longpress only: passed to the wrapped `<orio-long-press>` */
  moveTolerance?: number;
  /** longpress only: passed to the wrapped `<orio-long-press>` */
  scale?: number;
  /** longpress only: passed to the wrapped `<orio-long-press>` */
  progress?: boolean;
}

const props = withDefaults(defineProps<DraggableProps>(), {
  data: undefined,
  group: undefined,
  disabled: false,
  activation: "auto",
  delay: undefined,
  moveTolerance: undefined,
  scale: undefined,
  progress: undefined,
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

// let the shrink classes leave the DOM first, or the drag copy keeps them
function startAfterRender() {
  nextTick(start);
}
</script>

<template>
  <div ref="root" class="draggable" :class="{ dragging: isDragging, disabled }">
    <orio-long-press
      v-if="activation === 'longpress'"
      :delay
      :disabled
      :moveTolerance
      :scale
      :progress
      :keyboard="false"
      @trigger="startAfterRender"
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

/* the wrapper sits between the draggable and the slot; let full-width
   children keep their width */
.draggable > .long-press {
  flex: 1;
  min-width: 0;
}

.draggable.disabled {
  cursor: auto;
}

.draggable.dragging {
  opacity: 0.4;
}
</style>
