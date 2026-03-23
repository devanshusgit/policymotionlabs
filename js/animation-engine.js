// Animation Engine - Core Orchestrator
// Manages initialization, lifecycle, and coordination of all animation modules

import { AnimationConfig, validateConfig, getResponsiveConfig, isSlowConnection } from './config.js';
import CustomCursor from './cursor.js';
import ScrollAnimations from './scroll-animations.js';
import VideoAutoplay from './video-autoplay.js';
import VisualEffects from './visual-effects.js';

class AnimationEngine {
  constructor(config = {}) {
    // Apply responsive adjustments for touch devices
    const baseConfig = getResponsiveConfig({ ...AnimationConfig, ...config });
    
    // Merge user config with defaults and validate
    this.config = validateConfig(baseConfig);
    
    // Module registry
    this.modules = new Map();
    
    // State tracking
    this.initialized = false;
    this.reducedMotion = false;
    this.slowConnection = isSlowConnection();
    this.performanceMonitorId = null;
    this.performanceMetrics = {
      fps: 60,
      frameTime: 16.67,
      animationCount: 0,
      observerCount: 0,
      lastFrameTime: 0
    };
    
    // Feature detection
    this.features = {
      intersectionObserver: 'IntersectionObserver' in window,
      backdropFilter: this.detectBackdropFilter(),
      transform: this.detectTransform(),
      touch: this.detectTouch()
    };
  }
  
  /**
   * Initialize the animation engine
   * Detects user preferences and initializes appropriate modules
   */
  init() {
    if (this.initialized) {
      console.warn('AnimationEngine already initialized');
      return;
    }
    
    // Detect prefers-reduced-motion
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Listen for changes to motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      if (this.reducedMotion) {
        this.initEssentialOnly();
      } else {
        this.initAllModules();
      }
    });
    
    // Initialize modules based on motion preference
    if (this.reducedMotion) {
      this.initEssentialOnly();
    } else {
      this.initAllModules();
    }
    
    this.initialized = true;
    
    // Apply vendor prefixes where necessary
    this.applyVendorPrefixes();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    console.log('AnimationEngine initialized', {
      reducedMotion: this.reducedMotion,
      features: this.features
    });
  }
  
  /**
   * Initialize all animation modules (full experience)
   */
  initAllModules() {
    console.log('Initializing all animation modules');
    
    // Validate accessibility before initializing
    this.validateAccessibility();
    
    // Check for slow connection and disable non-critical animations
    if (this.slowConnection) {
      console.log('Slow connection detected - disabling non-critical animations');
      document.documentElement.classList.add('slow-connection');
    }
    
    try {
      // Initialize cursor module (desktop only)
      if (!this.features.touch && window.innerWidth >= this.config.responsive.mobileBreakpoint) {
        const cursor = new CustomCursor(this.config);
        cursor.init();
        this.registerModule('cursor', cursor);
      }
      
      // Initialize scroll animations module
      const scrollAnimations = new ScrollAnimations(this.config);
      scrollAnimations.init();
      this.registerModule('scrollAnimations', scrollAnimations);
      
      // Initialize video autoplay module
      const videoAutoplay = new VideoAutoplay(this.config);
      videoAutoplay.init();
      this.registerModule('videoAutoplay', videoAutoplay);
      
      // Initialize visual effects module (if not slow connection)
      if (!this.slowConnection) {
        const visualEffects = new VisualEffects(this.config);
        visualEffects.init();
        this.registerModule('visualEffects', visualEffects);
      }
      
      // Apply backdrop-filter fallback if needed
      if (!this.features.backdropFilter) {
        console.log('Backdrop-filter not supported - applying fallback');
        document.documentElement.classList.add('no-backdrop-filter');
      }
      
      // Apply transform fallback if needed
      if (!this.features.transform) {
        console.warn('CSS transforms not supported - animations will be degraded');
        document.documentElement.classList.add('no-transform');
      }
      
      console.log('All modules initialized successfully', {
        modules: Array.from(this.modules.keys())
      });
    } catch (error) {
      console.error('Error initializing animation modules:', error);
      // Continue gracefully even if some modules fail
    }
  }
  
  /**
   * Initialize only essential animations (reduced motion mode)
   */
  initEssentialOnly() {
    console.log('Initializing essential animations only (reduced motion)');
    
    try {
      // Initialize scroll animations with minimal effects
      const scrollAnimations = new ScrollAnimations(this.config);
      scrollAnimations.init();
      this.registerModule('scrollAnimations', scrollAnimations);
      
      // Add reduced-motion class to document
      document.documentElement.classList.add('reduce-motion');
      
      console.log('Essential modules initialized');
    } catch (error) {
      console.error('Error initializing essential modules:', error);
    }
  }
  
  /**
   * Register a module with the engine
   * @param {string} name - Module name
   * @param {Object} module - Module instance
   */
  registerModule(name, module) {
    if (this.modules.has(name)) {
      console.warn(`Module ${name} already registered`);
      return;
    }
    
    this.modules.set(name, module);
    console.log(`Module registered: ${name}`);
  }
  
  /**
   * Get a registered module
   * @param {string} name - Module name
   * @returns {Object|null} Module instance or null
   */
  getModule(name) {
    return this.modules.get(name) || null;
  }
  
  /**
   * Update configuration dynamically
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = validateConfig({ ...this.config, ...newConfig });
    
    // Notify all modules of config update
    this.modules.forEach((module, name) => {
      if (typeof module.updateConfig === 'function') {
        module.updateConfig(this.config);
        console.log(`Config updated for module: ${name}`);
      }
    });
    
    console.log('AnimationEngine configuration updated');
  }
  
  /**
   * Get current performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  
  /**
   * Start performance monitoring
   * Tracks FPS, frame time, and logs warnings if performance degrades
   */
  startPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    let lastFrameTime = performance.now();
    
    const monitor = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      
      frameCount++;
      
      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        const avgFrameTime = 1000 / fps;
        
        // Update metrics
        this.performanceMetrics.fps = fps;
        this.performanceMetrics.frameTime = avgFrameTime;
        this.performanceMetrics.lastFrameTime = currentTime;
        
        // Update animation and observer counts
        this.performanceMetrics.animationCount = this.getActiveAnimationCount();
        this.performanceMetrics.observerCount = this.getObserverCount();
        
        // Log warning if FPS drops below 30
        if (fps < 30) {
          console.warn(`Performance warning: FPS dropped to ${fps}`, {
            frameTime: avgFrameTime.toFixed(2),
            animationCount: this.performanceMetrics.animationCount,
            observerCount: this.performanceMetrics.observerCount
          });
        }
        
        // Reset counter
        frameCount = 0;
        lastTime = currentTime;
      }
      
      this.performanceMonitorId = requestAnimationFrame(monitor);
    };
    
    this.performanceMonitorId = requestAnimationFrame(monitor);
  }
  
  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring() {
    if (this.performanceMonitorId) {
      cancelAnimationFrame(this.performanceMonitorId);
      this.performanceMonitorId = null;
    }
  }
  
  /**
   * Get count of active animations
   * @returns {number} Active animation count
   */
  getActiveAnimationCount() {
    let count = 0;
    
    // Count animations from scroll module
    const scrollModule = this.modules.get('scrollAnimations');
    if (scrollModule) {
      count += document.querySelectorAll('[data-animate].animate-active:not(.animate-complete)').length;
    }
    
    // Count cursor animation if active
    const cursorModule = this.modules.get('cursor');
    if (cursorModule && cursorModule.rafId) {
      count += 1;
    }
    
    // Count visual effects animations
    const effectsModule = this.modules.get('visualEffects');
    if (effectsModule) {
      count += document.querySelectorAll('.hero-blob, .bg-gradient-pml').length;
    }
    
    return count;
  }
  
  /**
   * Get count of active Intersection Observers
   * @returns {number} Observer count
   */
  getObserverCount() {
    const scrollModule = this.modules.get('scrollAnimations');
    return scrollModule ? scrollModule.observerCount : 0;
  }
  
  /**
   * Validate accessibility features
   * Checks color contrast and ARIA label preservation
   */
  validateAccessibility() {
    // Check for ARIA labels on animated elements
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
      // Preserve existing ARIA labels
      if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
        // Mark element as having accessibility attributes
        element.setAttribute('data-has-aria', 'true');
      }
    });
    
    // Validate color contrast for animated elements (basic check)
    this.validateColorContrast();
    
    console.log('Accessibility validation complete');
  }
  
  /**
   * Validate color contrast for animated elements
   * Logs warnings for potential contrast issues
   */
  validateColorContrast() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Only validate if both colors are defined
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrastRatio(color, backgroundColor);
        
        // WCAG AA requires 4.5:1 for normal text
        if (contrast < 4.5) {
          console.warn(`Color contrast warning: Element has contrast ratio of ${contrast.toFixed(2)}:1 (minimum 4.5:1 required)`, element);
        }
      }
    });
  }
  
  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (CSS color string)
   * @param {string} color2 - Second color (CSS color string)
   * @returns {number} Contrast ratio
   */
  calculateContrastRatio(color1, color2) {
    // Parse RGB values from CSS color strings
    const rgb1 = this.parseRGB(color1);
    const rgb2 = this.parseRGB(color2);
    
    if (!rgb1 || !rgb2) return 21; // Return max contrast if parsing fails
    
    // Calculate relative luminance
    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);
    
    // Calculate contrast ratio
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  /**
   * Parse RGB values from CSS color string
   * @param {string} color - CSS color string
   * @returns {Object|null} RGB object or null
   */
  parseRGB(color) {
    // Handle rgb() and rgba() formats
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }
    return null;
  }
  
  /**
   * Calculate relative luminance for a color
   * @param {Object} rgb - RGB color object
   * @returns {number} Relative luminance
   */
  getRelativeLuminance(rgb) {
    // Convert RGB to sRGB
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;
    
    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  /**
   * Update performance metrics
   * @param {Object} metrics - Metrics to update
   */
  updatePerformanceMetrics(metrics) {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  }
  
  /**
   * Detect backdrop-filter support
   * @returns {boolean} True if supported
   */
  detectBackdropFilter() {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
      return false;
    }
    return CSS.supports('backdrop-filter', 'blur(10px)') ||
           CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
  }
  
  /**
   * Detect CSS transform support
   * @returns {boolean} True if supported
   */
  detectTransform() {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
      // Fallback: check for transform property
      const testElement = document.createElement('div');
      return testElement.style.transform !== undefined ||
             testElement.style.webkitTransform !== undefined ||
             testElement.style.mozTransform !== undefined ||
             testElement.style.msTransform !== undefined;
    }
    
    return CSS.supports('transform', 'translateX(0)') ||
           CSS.supports('-webkit-transform', 'translateX(0)') ||
           CSS.supports('-moz-transform', 'translateX(0)') ||
           CSS.supports('-ms-transform', 'translateX(0)');
  }
  
  /**
   * Apply vendor prefixes where necessary
   */
  applyVendorPrefixes() {
    // Check if backdrop-filter needs prefixing
    if (!CSS.supports('backdrop-filter', 'blur(10px)') && 
        CSS.supports('-webkit-backdrop-filter', 'blur(10px)')) {
      document.documentElement.classList.add('webkit-backdrop-filter');
    }
    
    // Check if transform needs prefixing
    if (!CSS.supports('transform', 'translateX(0)')) {
      if (CSS.supports('-webkit-transform', 'translateX(0)')) {
        document.documentElement.classList.add('webkit-transform');
      } else if (CSS.supports('-moz-transform', 'translateX(0)')) {
        document.documentElement.classList.add('moz-transform');
      } else if (CSS.supports('-ms-transform', 'translateX(0)')) {
        document.documentElement.classList.add('ms-transform');
      }
    }
  }
  
  /**
   * Detect touch device
   * @returns {boolean} True if touch device
   */
  detectTouch() {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0);
  }
  
  /**
   * Cleanup and destroy the animation engine
   */
  destroy() {
    console.log('Destroying AnimationEngine');
    
    try {
      // Stop performance monitoring
      this.stopPerformanceMonitoring();
      
      // Destroy all registered modules in reverse order
      const moduleNames = Array.from(this.modules.keys()).reverse();
      moduleNames.forEach(name => {
        const module = this.modules.get(name);
        if (module && typeof module.destroy === 'function') {
          try {
            module.destroy();
            console.log(`Module destroyed: ${name}`);
          } catch (error) {
            console.error(`Error destroying module ${name}:`, error);
          }
        }
      });
      
      // Clear module registry
      this.modules.clear();
      
      // Remove classes
      document.documentElement.classList.remove(
        'no-backdrop-filter', 
        'reduce-motion', 
        'slow-connection',
        'no-transform',
        'webkit-backdrop-filter',
        'webkit-transform',
        'moz-transform',
        'ms-transform'
      );
      
      // Reset state
      this.initialized = false;
      
      console.log('AnimationEngine destroyed successfully');
    } catch (error) {
      console.error('Error destroying AnimationEngine:', error);
    }
  }
}

// Auto-initialize on DOMContentLoaded
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.animationEngine = new AnimationEngine();
      window.animationEngine.init();
    });
  } else {
    // DOM already loaded
    window.animationEngine = new AnimationEngine();
    window.animationEngine.init();
  }
}

export { AnimationEngine };
