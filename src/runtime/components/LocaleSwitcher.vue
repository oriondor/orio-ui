<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface LocaleOption {
  code: string;
  flag: string;
  label: string;
}

interface Props {
  locales?: LocaleOption[];
}

const props = withDefaults(defineProps<Props>(), {
  locales: () => [
    { code: "en", flag: "\uD83C\uDDEC\uD83C\uDDE7", label: "English" },
    { code: "uk", flag: "\uD83C\uDDFA\uD83C\uDDE6", label: "Українська" },
  ],
});

const { locale } = useI18n();

const selected = computed({
  get: () => props.locales.find((l) => l.code === locale.value) ?? props.locales[0]!,
  set: (val) => {
    locale.value = val.code;
  },
});
</script>

<template>
  <orio-selector
    v-model="selected"
    :options="locales"
    field="code"
    option-name="label"
  >
    <template #trigger-label>
      <span class="locale-trigger">
        <span class="locale-flag">{{ selected.flag }}</span>
        <span class="locale-label">{{ selected.label }}</span>
      </span>
    </template>
    <template #option="{ option }">
      <span class="locale-option">
        <span class="locale-flag">{{ (option as LocaleOption).flag }}</span>
        <span>{{ (option as LocaleOption).label }}</span>
      </span>
    </template>
  </orio-selector>
</template>

<style scoped>
.locale-trigger,
.locale-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.locale-flag {
  font-size: 1.25em;
  line-height: 1;
}
</style>
