<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ResumeDate } from './view/Dates.vue';

export interface DateRangePickerProps {
  month?: boolean;
}

defineProps<DateRangePickerProps>();

const dates = defineModel<ResumeDate>('dates', { required: true });

const present = ref(dates.value.endDate !== '' && !dates.value.endDate);

watch(present, (value) => {
  if (value) {
    dates.value.endDate = null; // Set end date to null when present is checked
  } else {
    dates.value.endDate = ''; // Reset end date when present is unchecked
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
  <div>
    <orio-control-element v-bind="$attrs">
      <div class="date-range-picker">
        <orio-date-picker v-model:date="dates.startDate" :month />
        <orio-date-picker v-model:date="dates.endDate" :month />
        <orio-check-box v-model="present"> Present </orio-check-box>
      </div>
    </orio-control-element>
    <div v-if="!dateIsCorrect" class="error-message">
      <p>Start date must be before end date.</p>
    </div>
  </div>
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
.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
