// Build trigger: 2026-03-05 
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Alpine.js loaded manually via CDN to avoid conflicts with React hydration

// Build a URL -> lastmod map from blog frontmatter so the sitemap carries real
// freshness dates. @astrojs/sitemap's serialize() does not receive frontmatter,
// so we precompute it here at config load. Uses updatedDate, falling back to
// publishDate. Other page types fall back to the build date.
const SITE = 'https://relofinder.ch';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lastmodByUrl = {};
try {
  const blogDir = path.join(__dirname, 'src', 'content', 'blog');
  for (const file of fs.readdirSync(blogDir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const fm = raw.split(/^---\s*$/m)[1] || '';
    const pub = fm.match(/^publishDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
    const upd = fm.match(/^updatedDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
    const date = (upd && upd[1]) || (pub && pub[1]);
    if (date) {
      const slug = file.replace(/\.mdx?$/, '');
      lastmodByUrl[`${SITE}/blog/${slug}/`] = new Date(date).toISOString();
    }
  }
} catch (e) {
  console.warn('[sitemap lastmod] could not read blog frontmatter:', e?.message);
}
const buildLastmod = new Date().toISOString();

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
      serialize(item) {
        // Boost priority for key pages
        if (item.url === 'https://relofinder.ch/') { item.priority = 1.0; item.changefreq = 'daily'; }
        else if (item.url.includes('/companies/') && !item.url.endsWith('/companies/')) { item.priority = 0.8; }
        else if (item.url.includes('/blog/')) { item.priority = 0.8; }
        else if (item.url.includes('/services/')) { item.priority = 0.8; }
        else if (item.url.includes('/regions/')) { item.priority = 0.7; }
        else if (item.url.endsWith('/companies/') || item.url.endsWith('/blog/') || item.url.endsWith('/services/')) { item.priority = 0.9; }
        // Real lastmod for blog posts (from frontmatter); build date for the rest.
        item.lastmod = lastmodByUrl[item.url] || buildLastmod;
        return item;
      }
    })
  ],
  output: 'static',
  adapter: netlify(),
  site: 'https://relofinder.ch',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
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
