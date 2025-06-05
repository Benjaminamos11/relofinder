// Advanced Resource Preloading & Performance Optimization
// Intelligently preloads resources based on user behavior and connection

(function() {
  'use strict';

  const ResourceOptimizer = {
    // Configuration
    config: {
      maxPreloadImages: 3,
      maxPrefetchPages: 2,
      preloadDelay: 100,
      intersectionThreshold: 0.1,
      connection: {
        slow: ['slow-2g', '2g'],
        fast: ['4g']
      }
    },

    // Initialize all optimization strategies
    init() {
      this.setupConnectionAwareness();
      this.setupImagePreloading();
      this.setupPagePrefetching();
      this.setupFontOptimization();
      this.setupCriticalResourceHints();
      this.setupLazyLoading();
      this.trackPerformanceMetrics();
    },

    // Detect and adapt to connection speed
    setupConnectionAwareness() {
      this.connection = this.getConnectionInfo();
      document.body.classList.add(`connection-${this.connection.type}`);
      
      if (this.connection.isSlow) {
        this.enableDataSaverMode();
      }
    },

    getConnectionInfo() {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (!connection) {
        return { type: 'unknown', isSlow: false, isFast: false };
      }

      const effectiveType = connection.effectiveType;
      return {
        type: effectiveType,
        isSlow: this.config.connection.slow.includes(effectiveType),
        isFast: this.config.connection.fast.includes(effectiveType),
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    },

    enableDataSaverMode() {
      // Reduce image quality and disable non-essential preloading
      const images = document.querySelectorAll('img[src*="cloudinary"]');
      images.forEach(img => {
        if (img.src.includes('/upload/') && !img.dataset.optimized) {
          img.src = img.src.replace('/upload/', '/upload/q_auto:eco,f_auto,w_auto,dpr_1.0/');
          img.dataset.optimized = 'true';
        }
      });

      // Disable some preloading on slow connections
      this.config.maxPreloadImages = 1;
      this.config.maxPrefetchPages = 0;
    },

    // Intelligent image preloading based on viewport and user behavior
    setupImagePreloading() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.preloadImage(entry.target);
            }
          });
        }, {
          rootMargin: '100px 0px',
          threshold: this.config.intersectionThreshold
        });

        // Observe images that are about to come into view
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        images.forEach(img => imageObserver.observe(img));
      }
    },

    preloadImage(img) {
      if (img.dataset.preloaded) return;

      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = img.dataset.src || img.src;
      
      // Add responsive image support
      if (img.dataset.srcset) {
        preloadLink.imageSrcset = img.dataset.srcset;
      }

      document.head.appendChild(preloadLink);
      img.dataset.preloaded = 'true';
    },

    // Smart page prefetching based on user behavior
    setupPagePrefetching() {
      const prefetchedUrls = new Set();
      let prefetchCount = 0;

      // Prefetch on hover with delay
      this.addHoverPrefetch(prefetchedUrls, prefetchCount);
      
      // Prefetch visible links
      this.addVisibilityPrefetch(prefetchedUrls, prefetchCount);
      
      // Prefetch next/previous navigation
      this.addNavigationPrefetch(prefetchedUrls);
    },

    addHoverPrefetch(prefetchedUrls, prefetchCount) {
      let hoverTimer = null;

      document.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'A' && e.target.href) {
          hoverTimer = setTimeout(() => {
            this.prefetchPage(e.target.href, prefetchedUrls, prefetchCount);
          }, this.config.preloadDelay);
        }
      });

      document.addEventListener('mouseout', () => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
      });
    },

    addVisibilityPrefetch(prefetchedUrls, prefetchCount) {
      if ('IntersectionObserver' in window && !this.connection.isSlow) {
        const linkObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && prefetchCount < this.config.maxPrefetchPages) {
              const link = entry.target;
              if (link.href && this.shouldPrefetch(link.href)) {
                this.prefetchPage(link.href, prefetchedUrls, prefetchCount);
                prefetchCount++;
              }
            }
          });
        }, { rootMargin: '100px' });

        const importantLinks = document.querySelectorAll('a[href^="/blog/"], a[href^="/services/"], a[href^="/locations/"]');
        importantLinks.forEach(link => linkObserver.observe(link));
      }
    },

    addNavigationPrefetch(prefetchedUrls) {
      // Prefetch pagination and related content
      const navLinks = document.querySelectorAll('a[rel="next"], a[rel="prev"], .related-posts a');
      navLinks.forEach(link => {
        if (link.href && !prefetchedUrls.has(link.href)) {
          this.prefetchPage(link.href, prefetchedUrls, 0, true);
        }
      });
    },

    shouldPrefetch(url) {
      // Don't prefetch external links, current page, or already prefetched
      return url.startsWith(window.location.origin) && 
             url !== window.location.href && 
             !url.includes('#') &&
             !url.includes('mailto:') &&
             !url.includes('tel:');
    },

    prefetchPage(url, prefetchedUrls, prefetchCount, isHighPriority = false) {
      if (prefetchedUrls.has(url) || (!isHighPriority && prefetchCount >= this.config.maxPrefetchPages)) {
        return;
      }

      prefetchedUrls.add(url);

      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = url;
      prefetchLink.crossOrigin = 'anonymous';
      
      document.head.appendChild(prefetchLink);
    },

    // Optimize font loading
    setupFontOptimization() {
      // Preload critical font weights
      const criticalFonts = [
        { weight: '400', display: 'swap' },
        { weight: '600', display: 'swap' },
        { weight: '700', display: 'swap' }
      ];

      criticalFonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.href = `/fonts/inter-var.woff2`;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Add font loading class
      document.documentElement.classList.add('fonts-loading');
      
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          document.documentElement.classList.remove('fonts-loading');
          document.documentElement.classList.add('fonts-loaded');
        });
      }
    },

    // Setup critical resource hints
    setupCriticalResourceHints() {
      // DNS prefetch for external resources
      const externalDomains = [
        'res.cloudinary.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'www.google-analytics.com'
      ];

      externalDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });

      // Preconnect to critical resources
      const criticalDomains = ['res.cloudinary.com'];
      criticalDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `https://${domain}`;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    },

    // Enhanced lazy loading with intersection observer
    setupLazyLoading() {
      if ('IntersectionObserver' in window) {
        const lazyElements = document.querySelectorAll('[data-lazy-src], [data-lazy-bg]');
        
        const lazyObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadLazyElement(entry.target);
              lazyObserver.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });

        lazyElements.forEach(el => lazyObserver.observe(el));
      }
    },

    loadLazyElement(element) {
      if (element.dataset.lazySrc) {
        element.src = element.dataset.lazySrc;
        element.removeAttribute('data-lazy-src');
      }
      
      if (element.dataset.lazyBg) {
        element.style.backgroundImage = `url(${element.dataset.lazyBg})`;
        element.removeAttribute('data-lazy-bg');
      }

      element.classList.add('loaded');
    },

    // Track performance metrics
    trackPerformanceMetrics() {
      if ('PerformanceObserver' in window) {
        // Track resource loading times
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('/assets/') || entry.name.includes('cloudinary')) {
              this.logResourceMetric(entry);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Track navigation timing
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
              this.logNavigationMetrics(navigation);
            }
          }, 1000);
        });
      }
    },

    logResourceMetric(entry) {
      const loadTime = entry.responseEnd - entry.responseStart;
      if (loadTime > 1000) { // Log slow resources
        console.warn(`Slow resource: ${entry.name} took ${Math.round(loadTime)}ms`);
      }
    },

    logNavigationMetrics(navigation) {
      const metrics = {
        ttfb: navigation.responseStart - navigation.requestStart,
        domLoad: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        fullLoad: navigation.loadEventEnd - navigation.loadEventStart
      };
      
      // Log to analytics or console
      console.log('Navigation metrics:', metrics);
    },

    // Progressive enhancement check
    supportsModernFeatures() {
      return 'IntersectionObserver' in window &&
             'Promise' in window &&
             'fetch' in window &&
             'Map' in window;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (ResourceOptimizer.supportsModernFeatures()) {
        ResourceOptimizer.init();
      }
    });
  } else {
    if (ResourceOptimizer.supportsModernFeatures()) {
      ResourceOptimizer.init();
    }
  }

  // Export for external access
  window.ReloFinderResourceOptimizer = ResourceOptimizer;

})(); 