<script setup lang="ts">
import { ref } from "vue";
import { useDropTarget } from "../composables/useDragAndDrop";

export interface DropZoneProps {
  /** accepts only draggables with this group; unset accepts all */
  group?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<DropZoneProps>(), {
  group: undefined,
  disabled: false,
});

const emit = defineEmits<{
  drop: [data: unknown, event: PointerEvent];
}>();

const root = ref<HTMLElement | null>(null);

const { isDragging, isOver } = useDropTarget(root, {
  group: () => props.group,
  disabled: () => props.disabled,
  onDrop: (data, event) => emit("drop", data, event),
});
</script>

<template>
  <div
    ref="root"
    class="drop-zone"
    :class="{ 'drag-active': isDragging, 'drag-over': isOver }"
  >
    <slot :is-dragging :is-over />
  </div>
</template>

<style scoped>
.drop-zone {
  border-radius: var(--border-radius-md);
  transition: outline-color 150ms ease-out;
  outline: 2px dashed transparent;
  outline-offset: 2px;
}

.drop-zone.drag-over {
  outline-color: var(--color-accent);
}
</style>
