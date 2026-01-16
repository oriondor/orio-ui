<script setup lang="ts">
import { useDropZone, useFileDialog } from "@vueuse/core";
import { computed, toRefs, useTemplateRef } from "vue";

interface Props {
  maxFiles?: number;
  allowedTypes?: string[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: undefined,
  allowedTypes: undefined,
  disabled: false,
});

const { maxFiles, allowedTypes, disabled } = toRefs(props);

const isMultiple = computed(
  () => maxFiles.value === undefined || maxFiles.value > 1,
);

const dropZone = useTemplateRef("dropZone");

const modelValue = defineModel<File[]>({ default: () => [] });

function onDrop(files: File[] | null) {
  if (disabled.value) return;
  if (files && files.length > 0) {
    const finalFiles = [...modelValue.value, ...files].slice(
      0,
      maxFiles.value ?? -1,
    );
    modelValue.value = finalFiles;
  }
}

// Since we want to have more control over disabled upload - rename the isOverDropZone to overwrite it as a computed
const { isOverDropZone: overDropZone } = useDropZone(dropZone, {
  onDrop,
  multiple: isMultiple.value,
  dataTypes: allowedTypes.value,
  preventDefaultForUnhandled: false,
});

const { open, onChange } = useFileDialog({
  multiple: isMultiple.value,
  accept: allowedTypes.value?.join(","),
});

function openDialog() {
  if (disabled.value) return;
  open();
}

const isOverDropZone = computed(() => !disabled.value && overDropZone.value);

onChange((files) => onDrop(files as File[] | null));
</script>

<template>
  <div ref="dropZone">
    <slot :is-over-drop-zone :open-dialog />
  </div>
</template>
