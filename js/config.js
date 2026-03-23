// Animation Configuration Module
// Centralized configuration for all animation parameters

const AnimationConfig = {
  durations: {
    cursorFollow: 100,        // ms
    cursorHover: 200,         // ms
    fadeIn: 600,              // ms
    slideUp: 600,             // ms
    cardHover: 300,           // ms
    buttonClick: 100,         // ms
    navUnderline: 300,        // ms
    inputFocus: 200,          // ms
    pageTransition: 300,      // ms
    heroBlob: 4000,           // ms
    gradientShift: 8000       // ms
  },
  
  delays: {
    staggerIncrement: 100,    // ms
    cursorFadeOut: 2000       // ms
  },
  
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ease: 'ease',
    easeInOut: 'ease-in-out'
  },
  
  thresholds: {
    intersectionObserver: 0.1,
    maxObservers: 50,
    targetFPS: 60
  },
  
  transforms: {
    cursorScale: 1.5,
    buttonHoverScale: 1.05,
    buttonActiveScale: 0.95,
    cardHoverTranslateY: -8,  // px
    slideUpDistance: 40       // px
  },
  
  performance: {
    mouseMoveThrottle: 16,    // ms (60fps)
    maxBundleSize: 15360      // bytes (15KB)
  },
  
  responsive: {
    mobileBreakpoint: 768,    // px
    touchDurationMultiplier: 0.5  // Reduce animation duration by 50% on touch devices
  }
};

// Validation function
function validateConfig(config) {
  Object.entries(config.durations).forEach(([key, value]) => {
    if (value < 50 || value > 2000) {
      console.warn(`Duration ${key} (${value}ms) outside recommended range (50-2000ms)`);
    }
  });
  return config;
}

/**
 * Get adjusted durations for touch devices
 * @param {Object} config - Animation config
 * @returns {Object} Adjusted config
 */
function getResponsiveConfig(config) {
  const isTouchDevice = ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0) || 
                        (navigator.msMaxTouchPoints > 0);
  
  if (!isTouchDevice) {
    return config;
  }
  
  // Create a copy of config with reduced durations for touch devices
  const responsiveConfig = { ...config };
  responsiveConfig.durations = { ...config.durations };
  
  Object.keys(responsiveConfig.durations).forEach(key => {
    responsiveConfig.durations[key] = Math.round(
      responsiveConfig.durations[key] * config.responsive.touchDurationMultiplier
    );
  });
  
  return responsiveConfig;
}

/**
 * Detect slow network connection
 * @returns {boolean} True if connection is slow
 */
function isSlowConnection() {
  if (!('connection' in navigator) && !('mozConnection' in navigator) && !('webkitConnection' in navigator)) {
    return false;
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  // Check for slow connection types
  if (connection.effectiveType) {
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  
  // Check for save-data preference
  if (connection.saveData) {
    return true;
  }
  
  return false;
}

export { AnimationConfig, validateConfig, getResponsiveConfig, isSlowConnection };
