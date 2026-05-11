// Build trigger: 2026-03-05 
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
// Alpine.js loaded manually via CDN to avoid conflicts with React hydration

export default defineConfig({
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
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
        && !page.includes('/todos')
        && !page.includes('/index_old')
        && !page.includes('/design-')
        && !page.includes('/new-design')
        && !page.includes('/housing_old')
        && !page.includes('/agency')
        && !page.includes('/my-move')
        && !page.includes('/search')
        && !page.includes('/dashboard')
        && !page.endsWith('/sitemap/')
        && !page.endsWith('/sitemap')
        && !page.endsWith('/en/corporate/')
        && !page.includes('/design-comparison')
        && !page.includes('/design-concept')
        && !page.includes('/design-system'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Boost priority for key pages
        if (item.url === 'https://relofinder.ch/') { item.priority = 1.0; item.changefreq = 'daily'; }
        else if (item.url.includes('/companies/') && !item.url.endsWith('/companies/')) { item.priority = 0.8; }
        else if (item.url.includes('/blog/')) { item.priority = 0.8; }
        else if (item.url.includes('/services/')) { item.priority = 0.8; }
        else if (item.url.includes('/regions/')) { item.priority = 0.7; }
        else if (item.url.endsWith('/companies/') || item.url.endsWith('/blog/') || item.url.endsWith('/services/')) { item.priority = 0.9; }
        return item;
      }
    })
  ],
  output: 'static',
  adapter: netlify(),
  site: 'https://relofinder.ch',
  trailingSlash: 'always',
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
      noExternal: ['@nanostores/react', 'nanostores', 'lucide-react'],
      external: ['@anthropic-ai/sdk']
    },
    resolve: {
      alias: {
        '@': './src'
      }
    }
  }
});