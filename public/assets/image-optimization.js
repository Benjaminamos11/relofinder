// Advanced Image Optimization System - ReloFinder
// Intelligent image loading and performance enhancement

(function() {
  'use strict';

  const ImageOptimizer = {
    // Configuration
    config: {
      lazyLoadOffset: '50px',
      intersectionThreshold: 0.1,
      maxRetries: 3,
      webpSupport: null,
      avifSupport: null,
      connection: null
    },

    // Initialize the image optimization system
    init() {
      this.checkFormatSupport();
      this.detectConnection();
      this.setupLazyLoading();
      this.setupProgressiveLoading();
      this.optimizeExistingImages();
      this.setupErrorHandling();
    },

    // Check browser support for modern image formats
    checkFormatSupport() {
      // Check WebP support
      const webpTest = document.createElement('canvas');
      webpTest.width = 1;
      webpTest.height = 1;
      this.config.webpSupport = webpTest.toDataURL('image/webp').includes('data:image/webp');

      // Check AVIF support
      const avifTest = new Image();
      avifTest.onload = () => this.config.avifSupport = true;
      avifTest.onerror = () => this.config.avifSupport = false;
      avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    },

    // Detect user's connection speed
    detectConnection() {
      if ('connection' in navigator) {
        this.config.connection = navigator.connection;
      } else if ('mozConnection' in navigator) {
        this.config.connection = navigator.mozConnection;
      } else if ('webkitConnection' in navigator) {
        this.config.connection = navigator.webkitConnection;
      }
    },

    // Get optimal image quality based on connection
    getOptimalQuality() {
      if (!this.config.connection) return 'auto';
      
      const effectiveType = this.config.connection.effectiveType;
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'low';
        case '3g':
          return 'medium';
        case '4g':
        default:
          return 'high';
      }
    },

    // Setup lazy loading with Intersection Observer
    setupLazyLoading() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        this.loadAllImages();
        return;
      }

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            imageObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: this.config.lazyLoadOffset,
        threshold: this.config.intersectionThreshold
      });

      // Observe images with data-src
      const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
      lazyImages.forEach(img => {
        this.addLoadingPlaceholder(img);
        imageObserver.observe(img);
      });
    },

    // Add loading placeholder
    addLoadingPlaceholder(img) {
      if (!img.src && !img.dataset.placeholder) {
        img.style.backgroundColor = '#f0f0f0';
        img.style.backgroundImage = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
        img.style.backgroundSize = '200px 100%';
        img.style.animation = 'shimmer 1.5s infinite';
        img.dataset.placeholder = 'true';
      }
    },

    // Remove loading placeholder
    removeLoadingPlaceholder(img) {
      img.style.backgroundColor = '';
      img.style.backgroundImage = '';
      img.style.backgroundSize = '';
      img.style.animation = '';
      delete img.dataset.placeholder;
    },

    // Load image with optimization
    loadImage(img) {
      const originalSrc = img.dataset.src || img.src;
      const optimizedSrc = this.optimizeImageUrl(originalSrc);
      
      // Create a new image to preload
      const newImg = new Image();
      
      newImg.onload = () => {
        img.src = optimizedSrc;
        img.classList.add('loaded');
        this.removeLoadingPlaceholder(img);
        
        // Trigger fade-in animation
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        setTimeout(() => img.style.opacity = '1', 10);
        
        // Remove data-src to prevent reprocessing
        delete img.dataset.src;
      };
      
      newImg.onerror = () => {
        this.handleImageError(img, originalSrc);
      };
      
      newImg.src = optimizedSrc;
    },

    // Optimize image URL based on format support and connection
    optimizeImageUrl(url) {
      // Only optimize Cloudinary images
      if (!url.includes('cloudinary.com')) return url;
      
      const quality = this.getOptimalQuality();
      let optimizations = [];
      
      // Add format optimization
      if (this.config.avifSupport) {
        optimizations.push('f_avif');
      } else if (this.config.webpSupport) {
        optimizations.push('f_webp');
      } else {
        optimizations.push('f_auto');
      }
      
      // Add quality optimization
      switch (quality) {
        case 'low':
          optimizations.push('q_auto:low', 'w_800');
          break;
        case 'medium':
          optimizations.push('q_auto:good', 'w_1200');
          break;
        case 'high':
        default:
          optimizations.push('q_auto:best');
          break;
      }
      
      // Add other optimizations
      optimizations.push('dpr_auto', 'c_scale');
      
      // Insert optimizations into URL
      const optimizationString = optimizations.join(',');
      if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/${optimizationString}/`);
      }
      
      return url;
    },

    // Handle image loading errors
    handleImageError(img, originalUrl) {
      const retryCount = parseInt(img.dataset.retryCount || '0');
      
      if (retryCount < this.config.maxRetries) {
        img.dataset.retryCount = (retryCount + 1).toString();
        
        // Try loading original URL without optimizations
        setTimeout(() => {
          img.src = originalUrl;
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        // Final fallback - show error placeholder
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIHVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
        img.classList.add('error');
        this.removeLoadingPlaceholder(img);
      }
    },

    // Setup progressive loading for large images
    setupProgressiveLoading() {
      const largeImages = document.querySelectorAll('img[data-large]');
      
      largeImages.forEach(img => {
        const smallSrc = img.src;
        const largeSrc = img.dataset.large;
        
        // Load small image first (already loaded)
        const largeImg = new Image();
        largeImg.onload = () => {
          img.src = largeSrc;
          img.classList.add('progressive-loaded');
        };
        largeImg.src = largeSrc;
      });
    },

    // Optimize existing images on the page
    optimizeExistingImages() {
      const existingImages = document.querySelectorAll('img:not([data-src]):not([data-optimized])');
      
      existingImages.forEach(img => {
        if (img.src && img.src.includes('cloudinary.com')) {
          const optimizedSrc = this.optimizeImageUrl(img.src);
          if (optimizedSrc !== img.src) {
            img.src = optimizedSrc;
          }
        }
        img.dataset.optimized = 'true';
      });
    },

    // Setup error handling and retry logic
    setupErrorHandling() {
      document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
          this.handleImageError(e.target, e.target.src);
        }
      }, true);
    },

    // Fallback for browsers without Intersection Observer
    loadAllImages() {
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => this.loadImage(img));
    },

    // Preload critical images
    preloadCriticalImages() {
      const criticalImages = document.querySelectorAll('img[data-critical]');
      
      criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = this.optimizeImageUrl(img.src || img.dataset.src);
        document.head.appendChild(link);
      });
    },

    // Monitor image loading performance
    trackImagePerformance() {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('cloudinary.com')) {
              const loadTime = entry.responseEnd - entry.responseStart;
              
              // Log slow images for optimization
              if (loadTime > 1000) {
                console.warn(`Slow image load: ${entry.name} took ${Math.round(loadTime)}ms`);
              }
            }
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ImageOptimizer.init();
      ImageOptimizer.preloadCriticalImages();
      ImageOptimizer.trackImagePerformance();
    });
  } else {
    ImageOptimizer.init();
    ImageOptimizer.preloadCriticalImages();
    ImageOptimizer.trackImagePerformance();
  }

  // Export for external access
  window.ReloFinderImageOptimizer = ImageOptimizer;

})(); 