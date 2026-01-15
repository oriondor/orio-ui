<script setup lang="ts">
import { useDropZone, useFileDialog } from "@vueuse/core";
import { toRefs, useTemplateRef } from "vue";

interface Props {
  multiple?: boolean;
  allowedTypes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  allowedTypes: undefined,
});

const { multiple, allowedTypes } = toRefs(props);

const dropZone = useTemplateRef("dropZone");

const modelValue = defineModel<File[] | null>();

function onDrop(files: File[] | null) {
  if (files && files.length > 0) {
    modelValue.value = files;
  } else {
    modelValue.value = null;
  }
}

const { isOverDropZone } = useDropZone(dropZone, {
  onDrop,
  multiple: multiple.value,
  dataTypes: allowedTypes.value,
  preventDefaultForUnhandled: false,
});

const { open, onChange } = useFileDialog({
  multiple: multiple.value,
  accept: allowedTypes.value?.join(","),
});

onChange((files) => onDrop(files as File[] | null));
</script>

<template>
  <div ref="dropZone">
    <slot :is-over-drop-zone :open />
  </div>
</template>
