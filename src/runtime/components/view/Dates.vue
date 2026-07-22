<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "../../utils/date";

export interface ViewDatesRange {
  start: string | null;
  /** null = ongoing (renders the present label); undefined = single date */
  end?: string | null;
}

interface Props {
  dates: ViewDatesRange;
  month?: boolean;
  presentText?: string;
  size?: "small" | "medium" | "large";
  type?: "text" | "title" | "subtitle" | "italics";
}

const props = withDefaults(defineProps<Props>(), {
  size: "small",
  type: "italics",
});

const { dates } = toRefs(props);
const { locale, t } = useI18n();

const formatOptions = computed<Intl.DateTimeFormatOptions>(() => ({
  day: props.month ? undefined : "numeric",
  month: "short",
  year: "numeric",
}));

const startText = computed(() =>
  formatDate(dates.value?.start, locale.value, formatOptions.value),
);

const isOngoing = computed(() => dates.value?.end === null);

const endText = computed(() => {
  if (isOngoing.value) return props.presentText ?? t("dates.present");
  return formatDate(dates.value?.end, locale.value, formatOptions.value);
});
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
