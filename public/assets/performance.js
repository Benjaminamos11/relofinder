// Performance Monitoring Script for ReloFinder
// Tracks Core Web Vitals and user experience metrics

(function() {
  'use strict';

  // Performance tracking utilities
  const performanceTracker = {
    // Track Core Web Vitals
    trackWebVitals() {
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        this.observeLCP();
        
        // First Input Delay (FID)
        this.observeFID();
        
        // Cumulative Layout Shift (CLS)
        this.observeCLS();
        
        // First Contentful Paint (FCP)
        this.observeFCP();
        
        // Time to First Byte (TTFB)
        this.observeTTFB();
      }
    },

    observeLCP() {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Track LCP
          const lcp = entry.startTime;
          this.sendMetric('LCP', lcp);
          
          // Optimize images if LCP is slow
          if (lcp > 2500) {
            this.optimizeImages();
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    },

    observeFID() {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          this.sendMetric('FID', fid);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    },

    observeCLS() {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.sendMetric('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    },

    observeFCP() {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.sendMetric('FCP', entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    },

    observeTTFB() {
      if ('navigation' in performance) {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          const ttfb = navTiming.responseStart - navTiming.requestStart;
          this.sendMetric('TTFB', ttfb);
        }
      }
    },

    // Image optimization for slow LCP
    optimizeImages() {
      const images = document.querySelectorAll('img:not([data-optimized])');
      images.forEach(img => {
        if (img.src && img.src.includes('cloudinary')) {
          // Add aggressive optimization for slow connections
          const optimizedSrc = img.src.replace(
            '/upload/',
            '/upload/f_auto,q_auto:low,w_auto,dpr_auto,c_scale,fl_progressive/'
          );
          
          // Preload the optimized version
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = optimizedSrc;
          document.head.appendChild(link);
          
          img.setAttribute('data-optimized', 'true');
        }
      });
    },

    // Resource loading optimization
    optimizeResourceLoading() {
      // Preload critical resources based on page type
      if (document.body.classList.contains('blog-post')) {
        this.preloadBlogResources();
      }
      
      // Lazy load non-critical resources
      this.lazyLoadResources();
    },

    preloadBlogResources() {
      // Preload likely next articles
      const relatedLinks = document.querySelectorAll('a[href^="/blog/"]:not([data-preloaded])');
      let preloadCount = 0;
      
      relatedLinks.forEach(link => {
        if (preloadCount < 3) { // Limit preloading
          link.addEventListener('mouseenter', () => {
            if (!link.dataset.preloaded) {
              const linkEl = document.createElement('link');
              linkEl.rel = 'prefetch';
              linkEl.href = link.href;
              document.head.appendChild(linkEl);
              link.dataset.preloaded = 'true';
              preloadCount++;
            }
          }, { once: true });
        }
      });
    },

    lazyLoadResources() {
      // Lazy load social media widgets, comments, etc.
      if ('IntersectionObserver' in window) {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        const lazyObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              this.loadLazyElement(element);
              lazyObserver.unobserve(element);
            }
          });
        }, { rootMargin: '100px' });

        lazyElements.forEach(el => lazyObserver.observe(el));
      }
    },

    loadLazyElement(element) {
      const type = element.dataset.lazy;
      
      switch (type) {
        case 'social':
          this.loadSocialWidgets(element);
          break;
        case 'map':
          this.loadMap(element);
          break;
        case 'video':
          this.loadVideo(element);
          break;
      }
    },

    loadSocialWidgets(container) {
      // Load social media widgets only when needed
      if (container.dataset.platform === 'twitter') {
        // Load Twitter widget script
        this.loadScript('https://platform.twitter.com/widgets.js');
      }
    },

    loadScript(src) {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
    },

    // Memory management
    optimizeMemoryUsage() {
      // Clean up observers when leaving the page
      window.addEventListener('beforeunload', () => {
        if (this.observers) {
          this.observers.forEach(observer => observer.disconnect());
        }
      });
      
      // Throttle scroll-based operations
      this.throttleScrollOperations();
    },

    throttleScrollOperations() {
      let ticking = false;
      
      const scrollHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            // Perform scroll-based optimizations
            this.updateProgressIndicator();
            ticking = false;
          });
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', scrollHandler, { passive: true });
    },

    updateProgressIndicator() {
      const indicator = document.querySelector('.reading-progress');
      if (indicator) {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        indicator.style.width = `${Math.min(100, scrolled)}%`;
      }
    },

    // Analytics integration
    sendMetric(name, value) {
      // Send to analytics (Google Analytics, etc.)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'web_vitals', {
          metric_name: name,
          metric_value: Math.round(value),
          custom_parameter: navigator.connection?.effectiveType || 'unknown'
        });
      }
      
      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${name}: ${Math.round(value)}ms`);
      }
    },

    // Connection-aware optimizations
    adaptToConnection() {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          // Aggressive optimizations for slow connections
          this.enableSlowConnectionMode();
        } else if (connection.effectiveType === '4g') {
          // Enhanced experience for fast connections
          this.enableFastConnectionMode();
        }
      }
    },

    enableSlowConnectionMode() {
      // Reduce image quality, disable non-essential features
      document.body.classList.add('slow-connection');
      
      // Disable autoplay videos
      document.querySelectorAll('video[autoplay]').forEach(video => {
        video.removeAttribute('autoplay');
      });
    },

    enableFastConnectionMode() {
      // Preload more resources, enable enhanced features
      document.body.classList.add('fast-connection');
      
      // Preload more content
      this.preloadAdditionalContent();
    },

    preloadAdditionalContent() {
      // Preload next/previous blog posts
      const nextLink = document.querySelector('a[rel="next"]');
      if (nextLink) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextLink.href;
        document.head.appendChild(link);
      }
    },

    // Initialize all optimizations
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }

      this.trackWebVitals();
      this.optimizeResourceLoading();
      this.optimizeMemoryUsage();
      this.adaptToConnection();
      
      // Mark performance tracking as initialized
      window.relofinderPerformanceTracker = this;
    }
  };

  // Initialize when script loads
  performanceTracker.init();

})(); 