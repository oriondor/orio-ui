<script setup lang="ts">
import { ref, computed, watch, watchEffect } from "vue";
import Input from "./Input.vue";
import { useTemplateRef } from "vue";
import { onKeyDown } from "@vueuse/core";

interface Props {
  segments?: number | string;
  segmentSize?: number | string;
  type?: "number" | "string";
}
const { segments = 6, segmentSize = 1, type = "number" } = defineProps<Props>();

const emit = defineEmits<{
  (e: "start"): void;
  (e: "end"): void;
}>();

const modelValue = defineModel<string | number>({ default: "" });

function applyModel(index: number) {
  return String(modelValue.value).slice(
    index * Number(segmentSize),
    index * Number(segmentSize) + Number(segmentSize),
  );
}

function setupValue() {
  return Array.from({ length: Number(segments) }, (_, index) =>
    applyModel(index),
  );
}

const inputComponents = useTemplateRef("inputComponents");
const inputComponentsModel = ref<string[]>(setupValue());

function focusSegment(index: number) {
  const target = inputComponents.value?.[index];
  if (target) target.focused = true;
}

const focusState = computed(() => {
  const currentIndex = inputComponents.value?.findIndex(
    (inputComponent) => inputComponent?.focused,
  );
  if (currentIndex === undefined || currentIndex === -1)
    return { currentIndex: undefined, focusedElement: null };
  const focusedElement = inputComponents.value?.[currentIndex];
  return { currentIndex, focusedElement };
});

function focusMove(delta: 1 | -1) {
  if (focusState.value.currentIndex === undefined) return;

  let newIndex = focusState.value.currentIndex + delta;
  const maxIndex = inputComponents.value?.length ?? 0;

  if (newIndex >= maxIndex - 1) {
    emit("end");
    newIndex = maxIndex - 1;
  }

  if (newIndex <= 0) {
    emit("start");
    newIndex = 0;
  }
  focusSegment(newIndex);
}

onKeyDown(true, (event) => {
  const { currentIndex } = focusState.value;
  if (currentIndex === undefined) return;

  if (event.key === "Backspace") {
    if (inputComponentsModel.value[currentIndex]?.length === 0) focusMove(-1);
    return;
  }
  // Ignore shortcuts and non-printable keys (Tab, arrows, Cmd+V, …).
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key.length > 1) return;

  if (type === "number" && !/^\d$/.test(event.key)) {
    event.preventDefault();
    return;
  }
  // Keydown fires before the character lands: when the focused segment is
  // already full, advance so the character lands in the next segment.
  const currentValue = inputComponentsModel.value[currentIndex] ?? "";
  if (currentValue.length >= Number(segmentSize)) focusMove(1);
});

function handlePaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData("text") ?? "";
  const sanitizedText =
    type === "number" ? pastedText.replace(/\D/g, "") : pastedText.trim();
  if (!sanitizedText) return;
  const capacity = Number(segments) * Number(segmentSize);
  modelValue.value = sanitizedText.slice(0, capacity);
  if (sanitizedText.length >= capacity) emit("end");
}

watch(
  () => inputComponentsModel.value.join(""),
  (joinedValue) => {
    modelValue.value = joinedValue;
  },
);

watchEffect(() => {
  inputComponentsModel.value = setupValue();
});
</script>

<template>
  <div class="segmented-input" @paste.prevent="handlePaste">
    <Input
      v-for="(segment, index) in inputComponentsModel"
      :key="index"
      ref="inputComponents"
      v-model="inputComponentsModel[index]"
      :maxlength="segmentSize"
      :inputmode="type === 'number' ? 'numeric' : undefined"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
    />
  </div>
</template>

<style scoped lang="scss">
.segmented-input {
  display: flex;
  > div {
    flex: 1 1 0;
    min-width: 0;
  }
  :deep(input) {
    text-align: center;
  }
}
</style>
