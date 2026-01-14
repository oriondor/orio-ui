import { defineConfig } from "vitepress";
import { generateSidebar } from "vitepress-sidebar";
import { SidebarItem } from "vitepress-sidebar/types";

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
    nav: [{ text: "Guide", link: "/getting-started" }],

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
          items: generateSidebar({
            documentRootPath: "/docs",
            scanStartPath: "/components",
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }) as SidebarItem[],
        },
        {
          text: "Composables",
          items: generateSidebar({
            documentRootPath: "/docs",
            scanStartPath: "/composables",
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }) as SidebarItem[],
        },
        {
          text: "Utils",
          items: generateSidebar({
            documentRootPath: "/docs",
            scanStartPath: "/utils",
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }) as SidebarItem[],
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
  },
});
