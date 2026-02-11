<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ResumeDate } from "./view/Dates.vue";

export interface DateRangePickerProps {
  month?: boolean;
}

defineProps<DateRangePickerProps>();

const dates = defineModel<ResumeDate>("dates", { required: true });

const present = ref(dates.value.endDate !== "" && !dates.value.endDate);

watch(present, (value) => {
  if (value) {
    dates.value.endDate = null; // Set end date to null when present is checked
  } else {
    dates.value.endDate = ""; // Reset end date when present is unchecked
  }
});

const dateIsCorrect = computed(() => {
  // Ensure that the start date is before the end date
  if (dates.value.startDate && dates.value.endDate) {
    return new Date(dates.value.startDate) <= new Date(dates.value.endDate);
  }
  return true; // If one of the dates is empty, consider it correct
});

defineExpose({ dateIsCorrect });
</script>

<template>
  rio-control-element
   vbind="$attrs"
   :rror="!dateIsCorrect && 'Start date must be before end date.'"
>
  <div class="date-range-picker">
      rio-date-picker v-model:date="dates.startDate" :month />
     <rio-date-picker v-model:date="dates.endDate" :month />
     <rio-check-box v-model="present"> Present </orio-check-box>
  </div>
</orio-control-element>
</template>

<style lang="scss" scoped>
.date-range-picker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  & > * {
    min-width: 0;
  }

  .date-picker {
    margin-inline: 0;
  }
  .date-picker:first-child {
    margin-inline-end: 0.5rem;
  }
  .checkbox {
    margin-inline-start: 0.25rem;
  }
}
</style>
