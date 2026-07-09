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

  themeConfig: {
    search: {
      provider: "local",
    },
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Changelog", link: "/changelog" },
    ],

    sidebar: {
      "/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/" },
            { text: "Installation", link: "/getting-started" },
            { text: "Theming", link: "/theming" },
          ],
        },
        {
          text: "Components",
          items: sidebarSection({
            documentRootPath: "/docs",
            scanStartPath: "/components",
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }),
        },
        {
          text: "Composables",
          items: sidebarSection({
            documentRootPath: "/docs",
            scanStartPath: "/composables",
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }),
        },
        {
          text: "Utils",
          items: sidebarSection({
            documentRootPath: "/docs",
            scanStartPath: "/utils",
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }),
        },
      ],
    },
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
