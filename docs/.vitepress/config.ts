import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';
import { SidebarItem } from 'vitepress-sidebar/types';

export default defineConfig({
  title: 'Orio UI',
  description: 'A delightful component library for Nuxt 3',

  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [{ text: 'Guide', link: '/getting-started' }],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/getting-started' },
            { text: 'Theming', link: '/theming' },
          ],
        },
        {
          text: 'Components',
          items: generateSidebar({
            documentRootPath: '/docs',
            scanStartPath: '/components',
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }) as SidebarItem[],
        },
        {
          text: 'Composables',
          items: generateSidebar({
            documentRootPath: '/docs',
            scanStartPath: '/composables',
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }) as SidebarItem[],
        },
        {
          text: 'Utils',
          items: generateSidebar({
            documentRootPath: '/docs',
            scanStartPath: '/utils',
            useTitleFromFrontmatter: true,
            useTitleFromFileHeading: true,
            collapseDepth: 1,
            capitalizeFirst: true,
          }) as SidebarItem[],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/oriondor/orio-ui' },
    ],
  },
});
