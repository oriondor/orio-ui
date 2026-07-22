<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme";
import { MODES, THEME_DEFAULTS } from "../constants/theme";

export interface ModeOption {
  code: string;
  label: string;
}

const { t } = useI18n();
const { mode, setMode } = useTheme();

const modeOptions = computed<ModeOption[]>(() =>
  MODES.map((code) => ({ code, label: t(`modeSwitcher.${code}`) })),
);

const selected = computed({
  get: () =>
    modeOptions.value.find((option) => option.code === mode.value) ??
    modeOptions.value.find((option) => option.code === THEME_DEFAULTS.mode) ??
    modeOptions.value[0]!,
  set: (option: ModeOption) => setMode(option.code),
});
</script>

<template>
  <orio-selector
    v-model="selected"
    :options="modeOptions"
    field="code"
    option-name="label"
  />
</template>
