<script setup lang="ts">
import { ref } from "vue";
import { useDragSource } from "../composables/useDragAndDrop";

export interface DraggableProps {
  /** handed to the drop zone's `drop` event */
  data?: unknown;
  /** only drop zones with the same group (or none) accept it */
  group?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<DraggableProps>(), {
  data: undefined,
  group: undefined,
  disabled: false,
});

const emit = defineEmits<{
  dragStart: [data: unknown];
  dragEnd: [dropped: boolean];
}>();

const root = ref<HTMLElement | null>(null);

const { isDragging } = useDragSource(root, {
  data: () => props.data,
  group: () => props.group,
  disabled: () => props.disabled,
  onStart: (data) => emit("dragStart", data),
  onEnd: (dropped) => emit("dragEnd", dropped),
});
</script>

<template>
  <div ref="root" class="draggable" :class="{ dragging: isDragging, disabled }">
    <slot :is-dragging />
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
