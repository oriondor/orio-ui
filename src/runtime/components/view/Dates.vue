<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate, type DateRange } from "../../utils/date";

interface Props {
  dates: DateRange;
  month?: boolean;
  size?: "small" | "medium" | "large";
  type?: "text" | "title" | "subtitle" | "italics";
}

const props = withDefaults(defineProps<Props>(), {
  size: "small",
  type: "italics",
});

const { dates } = toRefs(props);
const { locale } = useI18n();

const formatOptions = computed<Intl.DateTimeFormatOptions>(() => ({
  day: props.month ? undefined : "numeric",
  month: "short",
  year: "numeric",
}));

const startText = computed(() =>
  formatDate(dates.value?.start, locale.value, formatOptions.value),
);
const endText = computed(() =>
  formatDate(dates.value?.end, locale.value, formatOptions.value),
);
</script>

<template>
  <div class="view-date">
    <orio-view-text :model-value="startText" :type :size />
    <template v-if="endText">
      <span v-if="startText"> - </span>
      <orio-view-text :model-value="endText" :type :size />
    </template>
  </div>
</template>

<style scoped>
.view-date * {
  display: inline;
}
</style>
