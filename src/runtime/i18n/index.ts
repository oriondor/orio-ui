import { createI18n } from "vue-i18n";
import en from "./en.json";
import uk from "./uk.json";

export type LocaleMessages = Record<string, string | LocaleMessages>;

export const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: { en, uk },
});

export function addLocale(code: string, messages: LocaleMessages) {
  i18n.global.setLocaleMessage(code, messages);
}

export function mergeLocale(code: string, messages: LocaleMessages) {
  i18n.global.mergeLocaleMessage(code, messages);
}

export function setLocale(code: string) {
  i18n.global.locale.value = code;
}

export { en, uk };
