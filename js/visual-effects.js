// Visual Effects Module
// Manages continuous CSS animations for hero blobs and gradient backgrounds

class VisualEffects {
  constructor(config) {
    this.config = config;
    this.heroBlobElements = [];
    this.gradientElements = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      console.warn('VisualEffects already initialized');
      return;
    }

    // Initialize hero blob animations
    this.animateHeroBlobs();

    // Initialize gradient animations
    this.animateGradients();

    this.isInitialized = true;
  }

  animateHeroBlobs() {
    // Find all elements with .hero-blob class
    this.heroBlobElements = Array.from(document.querySelectorAll('.hero-blob'));

    if (this.heroBlobElements.length === 0) {
      return;
    }

    // Apply animation class to each hero blob
    this.heroBlobElements.forEach(blob => {
      // Add the animation class if not already present
      if (!blob.classList.contains('hero-blob-animated')) {
        blob.classList.add('hero-blob-animated');
      }
    });
  }

  animateGradients() {
    // Find all elements with .bg-gradient-pml class
    this.gradientElements = Array.from(document.querySelectorAll('.bg-gradient-pml'));

    if (this.gradientElements.length === 0) {
      return;
    }

    // Apply animation class to each gradient element
    this.gradientElements.forEach(gradient => {
      // Add the animation class if not already present
      if (!gradient.classList.contains('gradient-animated')) {
        gradient.classList.add('gradient-animated');
      }
    });
  }

  destroy() {
    // Remove animation classes from hero blobs
    this.heroBlobElements.forEach(blob => {
      blob.classList.remove('hero-blob-animated');
    });

    // Remove animation classes from gradients
    this.gradientElements.forEach(gradient => {
      gradient.classList.remove('gradient-animated');
    });

    // Clear element arrays
    this.heroBlobElements = [];
    this.gradientElements = [];
    this.isInitialized = false;
  }
}

export default VisualEffects;
