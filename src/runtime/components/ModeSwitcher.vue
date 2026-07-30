<script setup lang="ts">
import { computed, onMounted } from "vue";
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

// A stored mode outside MODES would leave the selector showing the fallback
// while `data-mode` / the cookie keep the bogus value — normalize on mount so
// all three agree.
onMounted(() => {
  if (!(MODES as readonly string[]).includes(mode.value)) {
    setMode(selected.value.code);
  }
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
