import { onMounted } from "vue";
import { useLocalStorage } from "@vueuse/core";

export function useTheme() {
  // Namespace storage keys to avoid conflicts with consumer apps
  const theme = useLocalStorage<string>("orio-theme", "navy");
  const mode = useLocalStorage<string>("orio-mode", "dark");

  function setTheme(name: string) {
    theme.value = name;
    // Only set DOM attributes on client side
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", name);
    }
  }

  function setMode(name: string) {
    mode.value = name;
    // Only set DOM attributes on client side
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-mode", name);
    }
  }

  onMounted(() => {
    setTheme(theme.value);
    setMode(mode.value);
  });

  return { theme, setTheme, mode, setMode };
}
