<script setup lang="ts">
import { ref, computed, nextTick, watch, watchEffect } from "vue";
import Input from "./Input.vue";
import { useTemplateRef } from "vue";
import { onKeyDown } from "@vueuse/core";
import { useI18n } from "vue-i18n";

interface Props {
  segments?: number | string;
  segmentSize?: number | string;
  type?: "number" | "string";
  /** accessible name per box; defaults to translated "Digit 1 of 6" */
  segmentLabel?: (index: number, total: number) => string;
}
const {
  segments = 6,
  segmentSize = 1,
  type = "number",
  segmentLabel,
} = defineProps<Props>();

const { t } = useI18n();

function labelFor(index: number) {
  const total = Number(segments);
  if (segmentLabel) return segmentLabel(index + 1, total);
  const key =
    type === "number" ? "segmentedInput.digit" : "segmentedInput.character";
  return t(key, { index: index + 1, total });
}

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

  if (newIndex >= maxIndex - 1) newIndex = maxIndex - 1;

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

const capacity = computed(() => Number(segments) * Number(segmentSize));

// replace the whole value (paste, autofill); returns the stored length
function fillValue(text: string) {
  const sanitizedText =
    type === "number" ? text.replace(/\D/g, "") : text.trim();
  if (!sanitizedText) return 0;
  modelValue.value = sanitizedText.slice(0, capacity.value);
  if (sanitizedText.length >= capacity.value) emit("end");
  return Math.min(sanitizedText.length, capacity.value);
}

function handlePaste(event: ClipboardEvent) {
  fillValue(event.clipboardData?.getData("text") ?? "");
}

// one-time-code autofill (and IME) drops the whole code into one box,
// segment 0 has no maxlength so it isn't cut to one character
async function onSegmentInput(index: number, value: string) {
  if (value.length <= Number(segmentSize)) {
    inputComponentsModel.value[index] = value;
    return;
  }
  const before = inputComponentsModel.value.slice(0, index).join("");
  const filledLength = fillValue(before + value);
  await nextTick();
  // the box may keep its old value, so Vue won't re-render the overflow away
  const element = inputComponents.value?.[index]?.input;
  if (element) element.value = inputComponentsModel.value[index] ?? "";
  focusSegment(
    Math.min(
      Math.ceil(filledLength / Number(segmentSize)),
      Number(segments) - 1,
    ),
  );
}

watch(
  () => inputComponentsModel.value.join(""),
  (joinedValue) => {
    // typed by the user, not a re-split of a model write (paste emits itself)
    const typed = joinedValue !== String(modelValue.value);
    modelValue.value = joinedValue;
    if (typed && joinedValue.length >= capacity.value) emit("end");
  },
);

/** focus a segment; defaults to the first one that isn't full */
function focus(index?: number) {
  const firstOpen = inputComponentsModel.value.findIndex(
    (segment) => segment.length < Number(segmentSize),
  );
  focusSegment(index ?? (firstOpen === -1 ? Number(segments) - 1 : firstOpen));
}

defineExpose({ focus });

watchEffect(() => {
  inputComponentsModel.value = setupValue();
});
</script>

<template>
  <div class="segmented-input" role="group" @paste.prevent="handlePaste">
    <Input
      v-for="(segment, index) in inputComponentsModel"
      :key="index"
      ref="inputComponents"
      :model-value="segment"
      :maxlength="index === 0 ? undefined : segmentSize"
      :aria-label="labelFor(index)"
      :inputmode="type === 'number' ? 'numeric' : undefined"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      @update:model-value="onSegmentInput(index, $event)"
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
