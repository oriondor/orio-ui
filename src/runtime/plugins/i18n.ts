import { defineNuxtPlugin } from "#app";
import { createI18n } from "vue-i18n";
import en from "../i18n/en.json";
import uk from "../i18n/uk.json";

export default defineNuxtPlugin({
  name: "orio-ui-i18n",
  enforce: "pre",
  setup(nuxtApp) {
    const i18n = createI18n({
      legacy: false,
      locale: "en",
      fallbackLocale: "en",
      messages: { en, uk },
    });

    nuxtApp.vueApp.use(i18n);
    nuxtApp.provide("orioI18n", i18n);
  },
});
