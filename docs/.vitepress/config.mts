import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Buildll SDK",
  description: "The React SDK for Buildll",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/install' },
      { text: 'Examples', link: '/examples/nextjs-landing' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Installation', link: '/guide/install' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'API Reference', link: '/guide/api-reference' },
            { text: 'Next.js Example', link: '/guide/nextjs-example' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Next.js Landing Page', link: '/examples/nextjs-landing' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Types', link: '/reference/types' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/buildll/sdk' }
    ]
  }
})
