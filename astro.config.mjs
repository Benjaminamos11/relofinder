import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

export default defineConfig({
  integrations: [
    tailwind(), 
    react(), 
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/private'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        'https://relofinder.ch/swiss-relocation-guide',
        'https://relofinder.ch/cost-calculator',
        'https://relofinder.ch/regions/zurich',
        'https://relofinder.ch/regions/geneva',
        'https://relofinder.ch/services/corporate',
        'https://relofinder.ch/services/expat'
      ]
    }),
    compress({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
    })
  ],
  output: 'static',
  site: 'https://relofinder.ch',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
    },
  }
});