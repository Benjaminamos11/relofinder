import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
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
        && !page.includes('/services/banking')
        && !page.includes('/services/immigration-services'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date()
    }),
    compress({
      CSS: {
        csso: {
          comments: false,
          forceMediaMerge: true,
        }
      },
      HTML: {
        'html-minifier-terser': {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true,
        }
      },
      Image: {
        webp: {
          quality: 85,
        },
        avif: {
          quality: 80,
        }
      },
      JavaScript: {
        terser: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          }
        }
      },
      SVG: {
        svgo: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                }
              }
            }
          ]
        }
      }
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
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separate React core (used on most pages)
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Separate large carousel components (only used on homepage and company pages)
            if (id.includes('/AgenciesCarousel') || id.includes('/TrustedProfessionalsSlider')) {
              return 'carousel';
            }
            // Separate modal components (used across site but can be lazy)
            if (id.includes('/UniversalContactModal') || id.includes('/modal')) {
              return 'modal';
            }
            // Separate AI/review components (only on company pages)
            if (id.includes('/AIReviewSummary') || id.includes('/AgencyReviewSummary')) {
              return 'ai-features';
            }
            // Keep other vendor libs together but separate from app code
            if (id.includes('node_modules/')) {
              return 'vendor';
            }
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'images';
            } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
              extType = 'fonts';
            }
            return `assets/${extType}/[name].[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
        },
      },
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
      include: ['react', 'react-dom']
    }
  }
});