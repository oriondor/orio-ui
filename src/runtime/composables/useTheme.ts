import { computed, onMounted } from "vue";
import { useCookies } from "@vueuse/integrations/useCookies";

export function useTheme() {
  const cookies = useCookies(["orio-theme", "orio-mode"]);

  const theme = computed({
    get: () => cookies.get("orio-theme") || "navy",
    set: (value: string) => cookies.set("orio-theme", value, { path: "/" }),
  });

  const mode = computed({
    get: () => cookies.get("orio-mode") || "dark",
    set: (value: string) => cookies.set("orio-mode", value, { path: "/" }),
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
