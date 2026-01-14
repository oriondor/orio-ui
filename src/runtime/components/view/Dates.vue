<script setup lang="ts">
import { computed, toRefs } from "vue";

export interface ResumeDate {
  startDate: string;
  endDate?: string | null; // undefined - mean single date, null - means "Present"
}

interface Props {
  dates: ResumeDate;
  month?: boolean; // Optional prop to indicate if the date should be displayed as month/year
  size?: "small" | "medium" | "large";
  type?: "text" | "title" | "subtitle" | "italics";
}

const props = withDefaults(defineProps<Props>(), {
  size: "small",
  type: "italics",
});

const { dates } = toRefs(props);

function formatMonthYear(value: string) {
  if (!value) return "";
  if (!props.month)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const startDate = computed(() => formatMonthYear(dates.value.startDate));

const endDate = computed(() => {
  if (dates.value.endDate === undefined) return null;
  return dates.value.endDate !== null
    ? formatMonthYear(dates.value.endDate)
    : "Present";
});
</script>

<template>
  <div class="view-date">
    <orio-view-text :model-value="startDate" :type :size />
    <template v-if="endDate">
      <span v-if="startDate"> - </span>
      <orio-view-text :model-value="endDate" :type :size />
    </template>
  </div>
</template>

<style scoped>
.view-date * {
  display: inline;
}
</style>
