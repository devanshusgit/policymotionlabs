// Import animation engine module
import { AnimationEngine } from './animation-engine.js';

// Global error handling for animation failures
window.addEventListener('error', (event) => {
  // Check if error is related to animation modules
  if (event.filename && event.filename.includes('/js/')) {
    console.error('Animation module error:', event.error);
    // Prevent animation errors from breaking the page
    event.preventDefault();
  }
});

// Handle unhandled promise rejections (e.g., from video autoplay)
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Animation promise rejection:', event.reason);
  // Prevent promise rejections from breaking the page
  event.preventDefault();
});

// Theme toggle functionality completely removed to enforce dark cinematic theme.
