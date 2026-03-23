// Custom Cursor Module
// Creates and manages a custom cursor that follows mouse movements with smooth easing

class CustomCursor {
  constructor(config) {
    this.config = config;
    this.position = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.isHovering = false;
    this.element = null;
    this.rafId = null;
    this.inactivityTimer = null;
    this.onMouseMove = null;
    this.onMouseEnter = null;
    this.onMouseLeave = null;
  }

  init() {
    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    // Skip on small screens
    if (window.innerWidth < 768) {
      return;
    }

    this.createCursorElement();
    this.attachEventListeners();
    this.startAnimation();
  }

  createCursorElement() {
    this.element = document.createElement('div');
    this.element.id = 'custom-cursor';
    this.element.className = 'custom-cursor';
    this.element.innerHTML = '<div class="cursor-inner"></div>';
    document.body.appendChild(this.element);
  }

  attachEventListeners() {
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseEnter = this.handleMouseEnter.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);

    document.addEventListener('mousemove', this.onMouseMove);

    // Attach to all interactive elements
    const interactiveSelectors = 'a, button, input, textarea, [role="button"], [onclick]';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', this.onMouseEnter);
      el.addEventListener('mouseleave', this.onMouseLeave);
    });
  }

  handleMouseMove(e) {
    this.targetPosition.x = e.clientX;
    this.targetPosition.y = e.clientY;

    // Reset inactivity timer
    clearTimeout(this.inactivityTimer);
    if (this.element) {
      this.element.classList.remove('cursor-hidden');
    }
    
    this.inactivityTimer = setTimeout(() => {
      if (this.element) {
        this.element.classList.add('cursor-hidden');
      }
    }, this.config.delays.cursorFadeOut);
  }

  handleMouseEnter() {
    if (this.element) {
      this.element.classList.add('cursor-hover');
    }
  }

  handleMouseLeave() {
    if (this.element) {
      this.element.classList.remove('cursor-hover');
    }
  }

  startAnimation() {
    const animate = () => {
      // Smooth easing toward target (ease factor 0.15)
      const ease = 0.15;
      this.position.x += (this.targetPosition.x - this.position.x) * ease;
      this.position.y += (this.targetPosition.y - this.position.y) * ease;

      // Update cursor position using transform for GPU acceleration
      if (this.element) {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
      }

      this.rafId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.element) {
      this.element.remove();
    }
    if (this.onMouseMove) {
      document.removeEventListener('mousemove', this.onMouseMove);
    }
    
    // Remove event listeners from interactive elements
    const interactiveSelectors = 'a, button, input, textarea, [role="button"], [onclick]';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      if (this.onMouseEnter) {
        el.removeEventListener('mouseenter', this.onMouseEnter);
      }
      if (this.onMouseLeave) {
        el.removeEventListener('mouseleave', this.onMouseLeave);
      }
    });
  }
}

export default CustomCursor;
