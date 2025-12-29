import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  integrations: [
    tailwind({
      config: {
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      }
    }),
    react(),
    // preact({
    //   include: 'src/components/common/InteractiveCTAModal.tsx'
    // }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin')
        && !page.includes('/private')
        && !page.includes('/api')
        && !page.includes('/netlify-forms')
        && !page.includes('/login')
        && !page.includes('/todos'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Custom URL entries with priorities
      customPages: [
        'https://relofinder.ch',
        'https://relofinder.ch/about',
        'https://relofinder.ch/contact',
        'https://relofinder.ch/corporate',
        'https://relofinder.ch/partners',
        'https://relofinder.ch/swiss-relocation-guide',
        'https://relofinder.ch/companies',
        'https://relofinder.ch/regions',
        'https://relofinder.ch/blog',
      ]
    })
  ],
  output: 'static',
  site: 'https://relofinder.ch',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'always', // Inline critical CSS for faster FCP
    assets: 'assets'
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      force: true
    },
    ssr: {
      noExternal: ['@nanostores/react', 'nanostores']
    },
    resolve: {
      alias: {
        '@': './src'
      }
    }
  }
});