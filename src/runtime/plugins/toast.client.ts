import { defineNuxtPlugin } from "#app";
import { mountToastHost } from "../components/Toast/mount";

export default defineNuxtPlugin({
  name: "orio-ui-toast",
  setup(nuxtApp) {
    // Reusing the app's context keeps i18n, theme and provides available
    // inside toasts even though the host lives outside the app's tree.
    nuxtApp.hook("app:mounted", () => {
      mountToastHost(nuxtApp.vueApp._context);
    });
  },
});
