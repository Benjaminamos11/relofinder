import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import alpinejs from '@astrojs/alpinejs';

export default defineConfig({
  site: 'https://relofinder.ch',
  integrations: [
    tailwind(),
    react(),
    alpinejs()
  ],
  vite: {
    build: {
      sourcemap: true
    },
    optimizeDeps: {
      exclude: ['@supabase/supabase-js']
    },
    ssr: {
      noExternal: ['@supabase/supabase-js']
    }
  }
});