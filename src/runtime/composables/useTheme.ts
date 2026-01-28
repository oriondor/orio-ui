import { computed, onMounted } from "vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { THEME_DEFAULTS, COOKIE_NAMES } from "../constants/theme";

export function useTheme() {
  const cookies = useCookies([COOKIE_NAMES.theme, COOKIE_NAMES.mode]);

  const theme = computed({
    get: () => cookies.get(COOKIE_NAMES.theme) || THEME_DEFAULTS.theme,
    set: (value: string) => cookies.set(COOKIE_NAMES.theme, value, { path: "/" }),
  });

  const mode = computed({
    get: () => cookies.get(COOKIE_NAMES.mode) || THEME_DEFAULTS.mode,
    set: (value: string) => cookies.set(COOKIE_NAMES.mode, value, { path: "/" }),
  });

  function setHtmlAttrs() {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme.value);
    document.documentElement.setAttribute("data-mode", mode.value);
  }

  function setTheme(name: string) {
    theme.value = name;
    setHtmlAttrs();
  }

  function setMode(name: string) {
    mode.value = name;
    setHtmlAttrs();
  }

  onMounted(setHtmlAttrs);

  return { theme, setTheme, mode, setMode };
}
