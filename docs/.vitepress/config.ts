import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import {
  generateSidebar,
  type VitePressSidebarOptions,
} from "vitepress-sidebar";
import { SidebarItem } from "vitepress-sidebar/types";

// `vitepress-sidebar` emits root-relative links *without* a leading slash
// (e.g. "components/number-input"). VitePress only flags a sidebar item as
// active when its link matches the absolute route ("/components/number-input"),
// so without the slash nothing ever highlights. Prepend it recursively.
function withAbsoluteLinks(items: SidebarItem[]): SidebarItem[] {
  return items.map((item) => ({
    ...item,
    ...(item.link && !item.link.startsWith("/")
      ? { link: `/${item.link}` }
      : {}),
    ...(item.items ? { items: withAbsoluteLinks(item.items) } : {}),
  }));
}

const sidebarSection = (options: VitePressSidebarOptions): SidebarItem[] =>
  withAbsoluteLinks(generateSidebar(options) as SidebarItem[]);

const SIDEBAR_LABELS = {
  en: {
    gettingStarted: "Getting Started",
    introduction: "Introduction",
    installation: "Installation",
    theming: "Theming",
    components: "Components",
    composables: "Composables",
    utils: "Utils",
    experiments: "Experiments",
  },
  uk: {
    gettingStarted: "Початок роботи",
    introduction: "Вступ",
    installation: "Встановлення",
    theming: "Теми",
    components: "Компоненти",
    composables: "Композабли",
    utils: "Утиліти",
    experiments: "Експерименти",
  },
};

// English pages live at the docs root, Ukrainian ones mirror them under /uk/.
function sidebar(locale: keyof typeof SIDEBAR_LABELS): SidebarItem[] {
  const labels = SIDEBAR_LABELS[locale];
  const base = locale === "en" ? "" : `/${locale}`;
  const scan = (folder: string) =>
    sidebarSection({
      documentRootPath: "/docs",
      scanStartPath: `${base}/${folder}`,
      useTitleFromFrontmatter: true,
      useTitleFromFileHeading: true,
      collapseDepth: 1,
      capitalizeFirst: true,
    });

  return [
    {
      text: labels.gettingStarted,
      items: [
        { text: labels.introduction, link: `${base}/` },
        { text: labels.installation, link: `${base}/getting-started` },
        { text: labels.theming, link: `${base}/theming` },
      ],
    },
    { text: labels.components, items: scan("components") },
    { text: labels.composables, items: scan("composables") },
    { text: labels.utils, items: scan("utils") },
    { text: labels.experiments, items: scan("experiments") },
  ];
}

export default defineConfig({
  title: "Orio UI",
  description: "A delightful component library for Nuxt 3",

  head: [
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Orio UI" }],
    [
      "meta",
      {
        property: "og:description",
        content: "A delightful component library for Nuxt 3",
      },
    ],
    [
      "meta",
      {
        property: "og:url",
        content: "https://github.com/oriondor/orio-ui",
      },
    ],
    ["meta", { property: "og:site_name", content: "Orio UI" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://orio-ui.vercel.app/og-image.png",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://orio-ui.vercel.app/og-image.png",
      },
    ],
    ["meta", { name: "twitter:title", content: "Orio UI" }],
    [
      "meta",
      {
        name: "twitter:description",
        content: "A delightful component library for Nuxt 3",
      },
    ],
  ],

  locales: {
    root: { label: "English", lang: "en" },
    uk: {
      label: "Українська",
      lang: "uk",
      description: "Бібліотека компонентів для Nuxt 3",
      themeConfig: {
        nav: [
          { text: "Посібник", link: "/uk/getting-started" },
          { text: "Журнал змін", link: "/uk/changelog" },
        ],
        sidebar: { "/uk/": sidebar("uk") },
        outline: { label: "На цій сторінці" },
        docFooter: { prev: "Попередня сторінка", next: "Наступна сторінка" },
        lastUpdated: { text: "Оновлено" },
        returnToTopLabel: "Повернутися нагору",
        sidebarMenuLabel: "Меню",
        darkModeSwitchLabel: "Тема",
        lightModeSwitchTitle: "Світла тема",
        darkModeSwitchTitle: "Темна тема",
        notFound: {
          title: "СТОРІНКУ НЕ ЗНАЙДЕНО",
          quote: "Схоже, такої сторінки тут немає.",
          linkLabel: "На головну",
          linkText: "На головну",
        },
      },
    },
  },

  themeConfig: {
    search: {
      provider: "local",
      options: {
        locales: {
          uk: {
            translations: {
              button: { buttonText: "Пошук", buttonAriaLabel: "Пошук" },
              modal: {
                displayDetails: "Показати деталі",
                resetButtonTitle: "Скинути пошук",
                backButtonTitle: "Закрити пошук",
                noResultsText: "Нічого не знайдено",
                footer: {
                  selectText: "вибрати",
                  navigateText: "перейти",
                  closeText: "закрити",
                },
              },
            },
          },
        },
      },
    },
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Changelog", link: "/changelog" },
    ],
    sidebar: { "/": sidebar("en") },
    socialLinks: [
      { icon: "github", link: "https://github.com/oriondor/orio-ui" },
    ],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
        },
      },
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
      __INTLIFY_JIT_COMPILATION__: true,
      __INTLIFY_DROP_MESSAGE_COMPILER__: false,
    },
    resolve: {
      alias: {
        "vue-i18n": "vue-i18n/dist/vue-i18n.esm-bundler.js",
        // Shim Nuxt's `#imports` virtual module. Works in dev *and* build,
        // unlike `build.rollupOptions.external` which dev's import-analysis
        // ignores. Lets composables like `useUrlSync` resolve `useRoute`.
        "#imports": fileURLToPath(
          new URL("./shims/imports.ts", import.meta.url),
        ),
      },
    },
    ssr: {
      noExternal: ["vue-i18n", "@intlify/core-base", "@intlify/shared"],
    },
  },
});
