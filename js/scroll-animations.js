/**
 * ScrollAnimations Module
 * Implements Intersection Observer-based scroll animations for viewport detection
 * Handles fade-in, slide-up, staggered, and parallax effects
 */

class ScrollAnimations {
  constructor(config) {
    this.config = config;
    this.observers = new Map();
    this.observerCount = 0;
  }

  /**
   * Initialize scroll animations with Intersection Observer support detection
   */
  init() {
    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer not supported - applying graceful degradation');
      this.gracefulDegradation();
      return;
    }

    // Observe all elements with data-animate attribute
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => this.observe(el));

    // Setup parallax effects
    this.setupParallax();
  }

  /**
   * Add element to observation with observer count limiting (max 50)
   * @param {HTMLElement} element - Element to observe
   */
  observe(element) {
    // Limit observer count to prevent performance issues
    if (this.observerCount >= this.config.thresholds.maxObservers) {
      console.warn('Max observers reached, queuing element');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: '0px',
        threshold: this.config.thresholds.intersectionObserver
      }
    );

    observer.observe(element);
    this.observers.set(element, observer);
    this.observerCount++;

    // Apply stagger delay if parent has data-animate-stagger
    this.applyStaggerDelay(element);
  }

  /**
   * Remove element from observation
   * @param {HTMLElement} element - Element to unobserve
   */
  unobserve(element) {
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      this.observers.delete(element);
      this.observerCount--;
    }
  }

  /**
   * Intersection Observer callback for animation triggering
   * @param {IntersectionObserverEntry[]} entries - Observed entries
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      // Only trigger animation once when element enters viewport
      if (entry.isIntersecting && !entry.target.classList.contains('animate-complete')) {
        // Add active class to trigger animation
        entry.target.classList.add('animate-active');

        // Mark as complete after animation duration to prevent re-trigger
        setTimeout(() => {
          entry.target.classList.add('animate-complete');
          
          // Unobserve to free up observer slot
          const observer = this.observers.get(entry.target);
          if (observer) {
            observer.unobserve(entry.target);
            this.observers.delete(entry.target);
            this.observerCount--;
          }
        }, this.config.durations.fadeIn);
      }
    });
  }

  /**
   * Apply staggered animation delays to grouped elements
   * @param {HTMLElement} element - Element to apply stagger delay to
   */
  applyStaggerDelay(element) {
    const parent = element.parentElement;
    const staggerValue = parent?.getAttribute('data-animate-stagger');
    
    if (staggerValue) {
      const siblings = Array.from(parent.children).filter(
        child => child.hasAttribute('data-animate')
      );
      const index = siblings.indexOf(element);
      const delay = index * parseInt(staggerValue);
      
      element.style.transitionDelay = `${delay}ms`;
    }
  }

  /**
   * Setup parallax scroll effects for hero blobs
   */
  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
        const yPos = -(scrollY * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    };

    // Throttle scroll events using requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Graceful degradation for unsupported browsers
   * Shows all content immediately without animations
   */
  gracefulDegradation() {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('animate-active', 'animate-complete');
    });
  }

  /**
   * Cleanup method for removing observers and event listeners
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.observerCount = 0;
  }
}

export default ScrollAnimations;
