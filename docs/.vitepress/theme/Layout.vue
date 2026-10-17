<script setup lang="ts">
import { watch, onMounted } from "vue";
import { useData, useRoute, useRouter } from "vitepress";
import { useI18n } from "vue-i18n";
import DefaultTheme from "vitepress/theme";
import { useTheme } from "../../../src/runtime/composables/useTheme";
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
import LocaleSwitcher from "../../../src/runtime/components/LocaleSwitcher.vue";

const { isDark, lang } = useData();
const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const { mode, setMode } = useTheme();

// Sync VitePress appearance with Orio UI mode
watch(
  isDark,
  (dark) => {
    const newMode = dark ? "dark" : "light";
    if (mode.value !== newMode) {
      setMode(newMode);
    }
  },
  { immediate: true },
);

// The page's locale (English at the root, Ukrainian under /uk/) drives
// vue-i18n, so component strings follow the docs language.
watch(
  lang,
  (pageLang) => {
    locale.value = pageLang;
  },
  { immediate: true },
);

// Picking a language in the switcher moves to the same page in that locale.
watch(locale, (code) => {
  if (code === lang.value) return;
  const pagePath = route.path.replace(/^\/uk(\/|$)/, "/");
  router.go(code === "uk" ? `/uk${pagePath}` : pagePath);
});

// On mount, sync initial state
onMounted(() => {
  setMode(isDark.value ? "dark" : "light");
});
</script>

<template>
  <default-theme.Layout>
    <template #nav-bar-content-after>
      <locale-switcher />
      <theme-switcher />
    </template>
  </default-theme.Layout>
</template>
