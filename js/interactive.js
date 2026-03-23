/* ============================================================
   Policy Motion Labs — Interactive Enhancement Layer
   interactive.js (plain script, no ES modules)
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. HAMBURGER / MOBILE MENU
     ============================================================ */
  function initMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Detect existing nav inner div (always present)
    const navInner = nav.querySelector('.flex.justify-between');
    if (!navInner) return;

    // Build hamburger button if not already present
    if (document.getElementById('pml-hamburger')) return;

    const hamburger = document.createElement('button');
    hamburger.id = 'pml-hamburger';
    hamburger.setAttribute('aria-label', 'Toggle mobile menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = `
      <span class="ham-line"></span>
      <span class="ham-line"></span>
      <span class="ham-line"></span>
    `;
    navInner.appendChild(hamburger);

    // Build mobile menu panel
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'pml-mobile-menu';
    mobileMenu.setAttribute('aria-hidden', 'true');

    // Clone nav links from the desktop nav
    const desktopLinks = nav.querySelector('.hidden.md\\:flex');
    if (desktopLinks) {
      const linksClone = desktopLinks.cloneNode(true);
      linksClone.className = 'pml-mobile-links';
      mobileMenu.appendChild(linksClone);
    }

    // Add vendor register button inside mobile menu
    const vendorBtn = document.createElement('a');
    vendorBtn.href = 'vendor-register.html';
    vendorBtn.className = 'pml-mobile-vendor-btn';
    vendorBtn.textContent = 'Register as a Vendor';
    mobileMenu.appendChild(vendorBtn);

    nav.appendChild(mobileMenu);

    // Toggle logic
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ============================================================
     2. SCROLL PROGRESS BAR
     ============================================================ */
  function initScrollProgress() {
    if (document.getElementById('pml-scroll-progress')) return;

    const bar = document.createElement('div');
    bar.id = 'pml-scroll-progress';
    document.body.prepend(bar);

    function updateBar() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateBar();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateBar();
  }

  /* ============================================================
     3. ANIMATED COUNTER NUMBERS
     ============================================================ */
  function initCounters() {
    // Find stat headings that contain numbers
    const statHeadings = document.querySelectorAll('.font-headline.text-4xl, .font-headline.text-5xl, h5.font-headline');
    
    statHeadings.forEach(function (el) {
      const text = el.textContent.trim();
      // Only animate elements with numeric content that look like stats
      // Must contain at least one digit and be in a stats-bar-like section
      if (!/\d/.test(text)) return;
      if (el.closest('section') === null) return;

      // Mark as counter target
      el.setAttribute('data-counter-original', text);

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !el.dataset.counterDone) {
            el.dataset.counterDone = 'true';
            animateCounter(el, text);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }

  function animateCounter(el, originalText) {
    // Parse the number from the text
    const match = originalText.match(/([\d,\.]+)/);
    if (!match) return;

    const rawNum = parseFloat(match[1].replace(/,/g, ''));
    if (isNaN(rawNum) || rawNum === 0) return;

    const prefix = originalText.slice(0, originalText.search(/[\d]/));
    const suffix = originalText.slice(originalText.search(/[\d,\.]+/) + match[1].length);

    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * rawNum);

      // Format with same style (B = billions, Cr = crore etc)
      let display = current.toString();
      if (rawNum >= 1e9 || originalText.includes('B')) {
        display = (ease * rawNum / 1e9).toFixed(1) + '';
      } else if (rawNum >= 1e7 || originalText.includes('Cr')) {
        display = Math.floor(ease * rawNum).toLocaleString('en-IN');
      }

      el.textContent = prefix + display + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = originalText; // Restore exact original
      }
    }

    requestAnimationFrame(tick);
  }

  /* ============================================================
     4. BACK TO TOP BUTTON
     ============================================================ */
  function initBackToTop() {
    if (document.getElementById('pml-back-top')) return;

    const btn = document.createElement('button');
    btn.id = 'pml-back-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `<span class="material-symbols-outlined">arrow_upward</span>`;
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     5. MOBILE STICKY CTA BAR
     ============================================================ */
  function initMobileCTA() {
    if (document.getElementById('pml-mobile-cta')) return;

    const cta = document.createElement('div');
    cta.id = 'pml-mobile-cta';
    cta.innerHTML = `
      <a href="contact.html" class="pml-cta-btn pml-cta-primary">Request a Pilot</a>
      <a href="vendor-register.html" class="pml-cta-btn pml-cta-secondary">Register Vendor</a>
    `;
    document.body.appendChild(cta);
  }

  /* ============================================================
     6. CONTACT FORM REAL-TIME VALIDATION
     ============================================================ */
  function initContactFormValidation() {
    const form = document.querySelector('form[onsubmit*="handleContactSubmit"]');
    if (!form) return;

    const fields = form.querySelectorAll('input, textarea, select');

    fields.forEach(function (field) {
      // Wrap field in relative div for icon positioning if not already
      field.addEventListener('blur', function () {
        validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('pml-error')) {
          validateField(field);
        }
      });
    });

    // Override submit to add loading state and trigger email
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      fields.forEach(function (f) {
        if (!validateField(f)) valid = false;
      });
      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(function () {
        // Extract values
        const name = document.getElementById('c-name') ? document.getElementById('c-name').value : '';
        const org = document.getElementById('c-org') ? document.getElementById('c-org').value : '';
        const email = document.getElementById('c-email') ? document.getElementById('c-email').value : '';
        const phone = document.getElementById('c-phone') ? document.getElementById('c-phone').value : '';
        const subject = document.getElementById('c-subject') ? document.getElementById('c-subject').value : 'General Inquiry';
        const message = document.getElementById('c-message') ? document.getElementById('c-message').value : '';

        // Construct email body
        const bodyText = `New Contact Form Submission\n\nName: ${name}\nOrganisation: ${org}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`;

        // Trigger Mailto
        const emailSubject = encodeURIComponent(`Contact Inquiry: ${subject}`);
        const emailBody = encodeURIComponent(bodyText);
        window.location.href = `mailto:info@policymotionlabs.com?subject=${emailSubject}&body=${emailBody}`;

        // Hide form and show success
        form.style.display = 'none';
        const success = document.getElementById('contact-success');
        if (success) {
          success.classList.remove('hidden');
          success.style.display = 'block';
        }
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '';
      }, 800);
    });
  }

  function validateField(field) {
    removeFieldError(field);

    const value = field.value.trim();
    let error = '';

    if (field.hasAttribute('required') && !value) {
      error = 'This field is required.';
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Please enter a valid email address.';
    } else if (field.type === 'tel' && value && !/^[+\d\s\-()]{7,}$/.test(value)) {
      error = 'Please enter a valid phone number.';
    } else if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
      error = 'Please select an option.';
    }

    if (error) {
      showFieldError(field, error);
      return false;
    } else if (value) {
      showFieldSuccess(field);
      return true;
    }
    return true;
  }

  function showFieldError(field, message) {
    field.classList.add('pml-error');
    field.classList.remove('pml-success');
    field.style.borderColor = '#ff6b6b';

    const err = document.createElement('p');
    err.className = 'pml-field-error';
    err.textContent = message;
    field.parentNode.appendChild(err);
  }

  function showFieldSuccess(field) {
    field.classList.remove('pml-error');
    field.classList.add('pml-success');
    field.style.borderColor = '#1A7B47';
  }

  function removeFieldError(field) {
    field.classList.remove('pml-error', 'pml-success');
    field.style.borderColor = '';
    const existing = field.parentNode.querySelector('.pml-field-error');
    if (existing) existing.remove();
  }

  /* ============================================================
     7. ACTIVE NAV PULSE ANIMATION
     ============================================================ */
  function initActiveNavPulse() {
    // The active nav link already has border-b styling — add a subtle glow class
    const activeLinks = document.querySelectorAll('.nav-link.text-\\[\\#5B3EC4\\]');
    activeLinks.forEach(function (link) {
      link.classList.add('pml-nav-active');
    });
  }

  /* ============================================================
     8. SERVICE CARD TOOLTIPS
     ============================================================ */
  function initServiceTooltips() {
    const tooltipMap = {
      'Scheme Explainer Films': 'Cinematic storytelling that turns complex policy into clear citizen action.',
      'Audio Spots': 'Localized radio & podcast content optimized for rural India.',
      'Social Media Command': 'Data-driven content that bypasses media noise to reach beneficiaries.',
      'Documentary & Reportage': 'Long-form journalism that captures governance impact on the ground.',
      'Digital Content Campaigns': 'Multi-platform campaigns engineered for viral reach and awareness.',
      'Multi-Lingual Production': 'Native language production across 22+ Indian languages.',
      'Live Event Coverage': 'Real-time broadcast quality coverage of government events.',
      'Animation & Infographics': 'Motion graphics that distill data into compelling narratives.',
    };

    const serviceCards = document.querySelectorAll('.glass-card');
    serviceCards.forEach(function (card) {
      const heading = card.querySelector('h3');
      if (!heading) return;

      const title = heading.textContent.trim();
      const tip = tooltipMap[title];
      if (!tip) return;

      card.style.position = 'relative';
      const tooltip = document.createElement('div');
      tooltip.className = 'pml-tooltip';
      tooltip.textContent = tip;
      card.appendChild(tooltip);
    });
  }

  /* ============================================================
     9. TYPEWRITER HERO EFFECT
     ============================================================ */
  function initTypewriter() {
    const h1 = document.getElementById('pml-hero-h1');
    const heroElements = document.querySelectorAll('.pml-hero-element');
    if (!h1 || !h1.textContent.includes('Making Governance Visible.')) return;

    const originalText = 'Making Governance Visible.';
    h1.textContent = '';
    h1.classList.add('pml-typewriter');
    h1.style.opacity = '1';
    h1.style.visibility = 'visible';

    let i = 0;
    function type() {
      if (i < originalText.length) {
        h1.textContent += originalText.charAt(i);
        i++;
        setTimeout(type, 50);
      } else {
        // Typing finished
        h1.style.borderRight = 'none';
        
        // Fade in remaining elements one by one
        let delay = 0;
        heroElements.forEach((el) => {
          setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          delay += 300;
        });
      }
    }

    // Initialize elements slightly lower for slide up effect
    heroElements.forEach((el) => {
      el.style.transform = 'translateY(20px)';
      el.style.opacity = '0';
    });

    // Small delay before starting
    setTimeout(type, 800);
  }

  /* ============================================================
     10. HOVER-REVEAL STATS (CARD FLIP)
     ============================================================ */
  function initCardFlips() {
    const insights = [
      "Traditional awareness often misses the targeted, digital-first audience critical for modern policy uptake.",
      "Lack of simple, localized communication is the primary barrier between policy intent and ground-level impact.",
      "The massive gap in digital engagement represents a direct loss in effective governance and public service delivery."
    ];

    // Target specifically the 3 stat cards in the stats section
    const statsSection = document.querySelector('section.bg-surface-container-low.py-24');
    if (!statsSection) return;
    
    const cards = statsSection.querySelectorAll('.glass-card');
    cards.forEach(function (card, idx) {
      if (idx > 2) return; 

      // Separate the H3 (Stat) and P (Description)
      const h3El = card.querySelector('h3');
      const pEl = card.querySelector('p');
      
      if (!h3El || !pEl) return;
      
      const statHTML = h3El.outerHTML;
      const descHTML = pEl.outerHTML;
      
      card.innerHTML = '';
      card.style.padding = '0'; // Move padding to faces
      card.style.border = 'none';
      card.classList.remove('pml-glass-hover'); // Avoid double hover

      const scene = document.createElement('div');
      scene.className = 'pml-scene w-full h-full min-h-[220px]';
      
      const flipCard = document.createElement('div');
      flipCard.className = 'pml-card w-full h-full';
      
      const front = document.createElement('div');
      // Front simply displays the stat centered
      front.className = 'pml-card__face pml-card__face--front top-0 left-0 glass-card border-l-4 border-[#5B3EC4] w-full h-full flex items-center justify-center';
      front.innerHTML = statHTML;
      // Override any margin-bottom on the H3 so it perfectly centers
      const frontH3 = front.querySelector('h3');
      if (frontH3) frontH3.style.marginBottom = '0';
      
      const back = document.createElement('div');
      // Back simply displays the description centered
      back.className = 'pml-card__face pml-card__face--back top-0 left-0 w-full h-full flex items-center justify-center p-8 text-center';
      back.innerHTML = descHTML;
      const backP = back.querySelector('p');
      if (backP) {
        // Enforce font properties on the back description
        backP.className = 'font-body text-[#F0EEF8] text-lg leading-relaxed font-medium';
        backP.style.marginBottom = '0';
      }
      
      flipCard.appendChild(front);
      flipCard.appendChild(back);
      scene.appendChild(flipCard);
      card.appendChild(scene);

      card.addEventListener('mouseenter', () => flipCard.classList.add('is-flipped'));
      card.addEventListener('mouseleave', () => flipCard.classList.remove('is-flipped'));
    });
  }

  /* ============================================================
     11. INSTITUTIONAL MEDIUMS ANIMATION
     ============================================================ */
  function initMediumsAnimation() {
    const section = document.querySelector('section.py-32.px-8');
    if (!section) return;
    
    // Check if it's the right section by looking for "Institutional Mediums"
    const title = section.querySelector('h2');
    if (!title || !title.textContent.includes('Institutional Mediums')) return;

    const cards = section.querySelectorAll('.glass-card');
    cards.forEach(card => {
      // Find the headline and description
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');
      const exploreBtn = card.querySelector('a');
      const icon = card.querySelector('.material-symbols-outlined');
      
      if (!h3 || !p || !exploreBtn) return;

      const iconHTML = icon ? icon.outerHTML : '';
      const h3HTML = h3.outerHTML;
      const pHTML = p.outerHTML;
      const exploreHTML = exploreBtn.outerHTML;

      // Extract details for the flip
      const originalInner = card.innerHTML;
      card.innerHTML = '';
      card.style.padding = '0';
      card.style.border = 'none';
      card.style.background = 'transparent';
      
      const scene = document.createElement('div');
      scene.className = 'pml-mediums-scene w-full h-full min-h-[300px] md:min-h-[350px]';
      
      const flipCard = document.createElement('div');
      flipCard.className = 'pml-mediums-card w-full h-full';
      
      const front = document.createElement('div');
      front.className = 'pml-mediums-face pml-mediums-face--front glass-card p-10 flex flex-col items-center justify-center text-center w-full h-full';
      front.innerHTML = `${iconHTML}<div class="mt-4">${h3HTML}</div>`;
      
      const back = document.createElement('div');
      back.className = 'pml-mediums-face pml-mediums-face--back p-10 text-center w-full h-full';
      back.innerHTML = `<div class="mb-6">${pHTML}</div>${exploreHTML}`;

      flipCard.appendChild(front);
      flipCard.appendChild(back);
      scene.appendChild(flipCard);
      card.appendChild(scene);

      card.addEventListener('mouseenter', () => flipCard.classList.add('is-flipped'));
      card.addEventListener('mouseleave', () => flipCard.classList.remove('is-flipped'));
    });
  }

  /* ============================================================
     12. STEP CONNECTOR (how-it-works.html)
     ============================================================ */
  function initStepConnector() {
    const container = document.querySelector('.lg\\:col-span-7.space-y-24.relative');
    if (!container) return;

    // Create the animated connector line
    const connector = document.createElement('div');
    connector.id = 'pml-step-connector';
    container.appendChild(connector);

    const steps = container.querySelectorAll('.relative.flex.gap-12.group');
    
    function updateConnector() {
      const containerRect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the container is visible/scrolled
      // We want the line to grow as steps enter the "active zone" (middle of screen)
      const triggerPoint = viewportHeight * 0.6;
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      
      let lastActiveIndex = -1;
      steps.forEach((step, idx) => {
        const rect = step.getBoundingClientRect();
        if (rect.top < triggerPoint) {
          step.classList.add('pml-step-active');
          lastActiveIndex = idx;
        } else {
          step.classList.remove('pml-step-active');
        }
      });

      if (lastActiveIndex >= 0) {
        const lastStep = steps[lastActiveIndex];
        const lastStepRect = lastStep.getBoundingClientRect();
        const progress = Math.min(1, (triggerPoint - containerTop) / (containerRect.height - 100));
        connector.style.transform = `scaleY(${progress})`;
      } else {
        connector.style.transform = 'scaleY(0)';
      }
    }

    window.addEventListener('scroll', function() {
      requestAnimationFrame(updateConnector);
    });
    updateConnector();
  }

  /* ============================================================
     12. VENDOR FORM MULTI-STEP (vendor-register.html)
     ============================================================ */
  function initVendorWizard() {
    const form = document.querySelector('form[onsubmit="handleSubmit(event)"]');
    if (!form || !window.location.pathname.includes('vendor-register.html')) return;

    // Force form visibility (it might be hidden by existing animation engine)
    form.style.opacity = '1';
    form.style.transform = 'none';
    form.style.visibility = 'visible';

    // Remove existing space-y-8 to handle steps better
    form.classList.remove('space-y-8');

    const sections = form.querySelectorAll('form > div:not(.pt-4)');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitWrapper = submitBtn.closest('.pt-4');

    // Group into 3 steps
    const stepConfigs = [
      { title: 'Org', nodes: [sections[0]] },
      { title: 'Contact', nodes: [sections[1], sections[2]] },
      { title: 'Details', nodes: [sections[3]] }
    ];

    // Create steps
    const steps = [];
    stepConfigs.forEach((config, i) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = `pml-form-step space-y-8 ${i === 0 ? 'active' : ''}`;
      config.nodes.forEach(node => stepDiv.appendChild(node));
      form.insertBefore(stepDiv, submitWrapper);
      steps.push(stepDiv);
    });

    // Create Wizard Header
    const wizardHeader = document.createElement('div');
    wizardHeader.className = 'pml-wizard-header';
    const progress = document.createElement('div');
    progress.className = 'pml-wizard-progress';
    wizardHeader.appendChild(progress);

    const stepNodes = [];
    stepConfigs.forEach((_, i) => {
      const node = document.createElement('div');
      node.className = `pml-wizard-step-node ${i === 0 ? 'active' : ''}`;
      node.textContent = i + 1;
      wizardHeader.appendChild(node);
      stepNodes.push(node);
    });

    form.insertBefore(wizardHeader, steps[0]);

    // Create Controls
    const controls = document.createElement('div');
    controls.className = 'pml-wizard-controls';
    
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn-interactive pml-btn-prev px-8 py-3 rounded-lg font-bold text-sm hidden';
    prevBtn.textContent = 'Previous';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn-interactive bg-[#5B3EC4] text-white px-8 py-3 rounded-lg font-bold text-sm';
    nextBtn.textContent = 'Next Step';

    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    form.insertBefore(controls, submitWrapper);

    // Initial State
    submitWrapper.style.display = 'none';

    let currentStep = 0;

    function updateWizard() {
      steps.forEach((s, i) => s.classList.toggle('active', i === currentStep));
      stepNodes.forEach((n, i) => {
        n.classList.toggle('active', i === currentStep);
        n.classList.toggle('completed', i < currentStep);
      });
      
      progress.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
      
      prevBtn.classList.toggle('hidden', currentStep === 0);
      
      if (currentStep === steps.length - 1) {
        nextBtn.classList.add('hidden');
        submitWrapper.style.display = 'block';
      } else {
        nextBtn.classList.remove('hidden');
        submitWrapper.style.display = 'none';
      }

      window.scrollTo({ top: form.offsetTop - 150, behavior: 'smooth' });
    }

    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        // Simple validation check before proceeding
        const inputs = steps[currentStep].querySelectorAll('input[required], select[required], textarea[required]');
        let valid = true;
        inputs.forEach(input => {
          if (!input.value) {
            input.classList.add('pml-error');
            valid = false;
          }
        });

        if (valid) {
          currentStep++;
          updateWizard();
        }
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateWizard();
      }
    });
  }

  /* ============================================================
     13. VIDEO MODAL / LIGHTBOX (show-reel.html)
     ============================================================ */
  function initVideoModal() {
    if (!window.location.pathname.includes('show-reel.html')) return;

    // Create Modal Elements
    const modal = document.createElement('div');
    modal.id = 'pml-video-modal';
    modal.innerHTML = `
      <div class="pml-modal-content">
        <button class="pml-modal-close">
          <span class="material-symbols-outlined">close</span> CLOSE
        </button>
        <video id="pml-modal-video" controls class="w-full h-full"></video>
      </div>
    `;
    document.body.appendChild(modal);

    const videoEl = modal.querySelector('#pml-modal-video');
    const closeBtn = modal.querySelector('.pml-modal-close');

    function openModal(src) {
      videoEl.src = src;
      modal.classList.add('active');
      videoEl.play();
    }

    function closeModal() {
      modal.classList.remove('active');
      videoEl.pause();
      videoEl.src = '';
    }

    // Attach to play buttons and video cards
    const playButtons = document.querySelectorAll('.group .material-symbols-outlined[style*="play_arrow"]');
    playButtons.forEach(btn => {
      btn.closest('.group').addEventListener('click', function() {
        // For demo, we use the same sample video
        openModal('../assets/PML_Anjadip.mp4'); 
      });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  /* ============================================================
     14. SERVICE FILTER TABS (services.html)
     ============================================================ */
  function initServiceFilters() {
    const grid = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
    if (!grid || !window.location.pathname.includes('services.html')) return;

    const cards = grid.querySelectorAll('.glass-card');
    const categories = ['All', 'Video', 'Audio', 'Digital', 'Broadcast'];
    
    // Map IDs to categories
    const categoryMap = {
      'SML-01': 'Video',
      'SML-02': 'Audio',
      'SML-03': 'Digital',
      'SML-04': 'Broadcast',
      'SML-05': 'Video',
      'SML-06': 'Digital'
    };

    // Create Tabs
    const filterNav = document.createElement('div');
    filterNav.className = 'pml-filter-nav';
    
    categories.forEach((cat, i) => {
      const tab = document.createElement('button');
      tab.className = `pml-filter-tab ${i === 0 ? 'active' : ''}`;
      tab.textContent = cat;
      tab.addEventListener('click', () => filterCards(cat, tab));
      filterNav.appendChild(tab);
    });

    grid.parentNode.insertBefore(filterNav, grid);

    function filterCards(category, activeTab) {
      // Update tabs if activeTab is provided
      if (activeTab) {
        filterNav.querySelectorAll('.pml-filter-tab').forEach(t => t.classList.remove('active'));
        activeTab.classList.add('active');
      }

      cards.forEach(card => {
        const id = card.querySelector('.font-label.text-\\[10px\\]').textContent.trim();
        const cardCat = categoryMap[id];
        
        if (category === 'All' || cardCat === category) {
          card.classList.remove('pml-card-hidden');
          card.classList.add('pml-card-visible');
          // Ensure they are visible if they were hidden by anim engine
          card.style.opacity = '1';
          card.style.transform = 'none';
        } else {
          card.classList.add('pml-card-hidden');
          card.classList.remove('pml-card-visible');
        }
      });
    }

    // Run initial filter to ensure "All" shows cards
    filterCards('All', filterNav.querySelector('.pml-filter-tab'));
  }

  /* ============================================================
     15. PARALLAX MOUSE BLOBS
     ============================================================ */
  function initMouseParallax() {
    const blobs = document.querySelectorAll('.hero-blob');
    if (!blobs.length) return;
    document.addEventListener('mousemove', function(e) {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
      blobs.forEach(blob => {
        const factor = parseFloat(blob.getAttribute('data-parallax') || 0.5);
        blob.style.transform = `translate(${xAxis * factor}px, ${yAxis * factor}px)`;
      });
    });
  }

  /* ============================================================
     16. MAGNETIC BUTTONS // DISABLED DUE TO POTENTIAL CSS CONFLICT, USING NATIVE SCALING
     ============================================================ */
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.btn-interactive');
    btns.forEach(btn => {
      btn.addEventListener('mousemove', function(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });
  }

  /* ============================================================
     17. SMOOTH SCROLLING (LENIS)
     ============================================================ */
  function initSmoothScroll() {
    if (window.innerWidth < 768) return;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
    script.onload = function() {
      if (typeof window.Lenis !== 'undefined') {
        const lenis = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true
        });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    };
    document.body.appendChild(script);
  }

  /* ============================================================
     18. INFINITE MARQUEE
     ============================================================ */
  function initMarquee() {
    const footers = document.querySelectorAll('footer');
    if (!footers.length) return;
    const footer = footers[0];
    const marqueeHTML = `
      <div class="w-full overflow-hidden bg-[#131313] border-t border-b border-[#484554] py-4 flex whitespace-nowrap">
        <div class="flex animate-[pml-marquee-scroll_20s_linear_infinite]">
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">Making Governance Visible</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">Data-Driven Impact</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">Strategic Communication</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">High-Fidelity Storytelling</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">Making Governance Visible</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">Data-Driven Impact</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">Strategic Communication</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
          <span class="px-10 text-[#C9A030] font-mono text-sm uppercase tracking-[0.2em] font-bold inline-flex items-center">High-Fidelity Storytelling</span>
          <span class="material-symbols-outlined text-[#5B3EC4] text-[8px] mx-2 flex items-center">fiber_manual_record</span>
        </div>
      </div>
    `;
    footer.insertAdjacentHTML('beforebegin', marqueeHTML);
  }

  /* ============================================================
     19. PAGE TRANSITIONS
     ============================================================ */
  function initPageTransitions() {
    const transitionEl = document.createElement('div');
    transitionEl.id = 'pml-page-transition';
    transitionEl.className = 'fixed inset-0 bg-[#0A0A0A] z-[99999] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] pointer-events-none flex items-center justify-center flex-col';
    
    const style = document.createElement('style');
    style.innerHTML = `
      .pml-spinner { width: 50px; height: 50px; border: 3px solid rgba(91, 62, 196, 0.3); border-radius: 50%; border-top-color: #5B3EC4; animation: pml-spin 1s ease-in-out infinite; margin-top: 20px; }
      @keyframes pml-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    transitionEl.innerHTML = `<img src="../assets/PML_LOGO.png" class="h-20 opacity-0 transition-opacity duration-300 delay-300 object-contain" id="pml-pt-logo" /><div class="pml-spinner opacity-0 transition-opacity duration-300 delay-300" id="pml-pt-spin"></div>`;
    document.body.appendChild(transitionEl);

    if (sessionStorage.getItem('pml-transition')) {
      transitionEl.style.transition = 'none';
      transitionEl.style.transform = 'translateY(0)';
      transitionEl.querySelector('#pml-pt-logo').style.opacity = '1';
      transitionEl.querySelector('#pml-pt-spin').style.opacity = '1';
      sessionStorage.removeItem('pml-transition');
      
      setTimeout(() => {
        transitionEl.style.transition = 'transform 0.6s cubic-bezier(0.77, 0, 0.175, 1)';
        transitionEl.style.transform = 'translateY(-100%)';
        transitionEl.querySelector('#pml-pt-logo').style.opacity = '0';
        transitionEl.querySelector('#pml-pt-spin').style.opacity = '0';
      }, 50);
    }

    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="tel:"]):not([href^="mailto:"])');
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#') || this.hostname !== window.location.hostname || e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        const targetUrl = this.href;
        
        transitionEl.style.transition = 'none';
        transitionEl.style.transform = 'translateY(100%)';
        
        void transitionEl.offsetWidth;
        
        transitionEl.style.transition = 'transform 0.5s cubic-bezier(0.77, 0, 0.175, 1)';
        transitionEl.style.transform = 'translateY(0)';
        const logo = transitionEl.querySelector('#pml-pt-logo');
        const spin = transitionEl.querySelector('#pml-pt-spin');
        if (logo) logo.style.opacity = '1';
        if (spin) spin.style.opacity = '1';
        
        setTimeout(() => {
          sessionStorage.setItem('pml-transition', '1');
          window.location.href = targetUrl;
        }, 500);
      });
    });
  }

  /* ============================================================
     20. TEXT SCRAMBLE / DECODER HOVER
     ============================================================ */
  function initTextScramble() {
    const chars = '!<>-_\\\\/[]{}—=+*^?#________';
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      const originalText = link.textContent.trim();
      if(!originalText) return;
      
      link.addEventListener('mouseenter', () => {
        let iterations = 0;
        clearInterval(link.scrambleInterval);
        
        link.scrambleInterval = setInterval(() => {
          link.textContent = originalText.split('')
            .map((letter, index) => {
              if (index < iterations) return originalText[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
            
          if (iterations >= originalText.length) {
            clearInterval(link.scrambleInterval);
            link.textContent = originalText;
          }
          iterations += 0.5;
        }, 30);
      });
    });
  }

  /* ============================================================
     21. 3D CARD TILT EFFECT
     ============================================================ */
  function initCardTilt() {
    // Cannot easily filter using :has() in older browsers, so we check inside
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
      if (card.querySelector('.pml-scene') || card.querySelector('.pml-mediums-scene')) return;
      
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none';
      });
      
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease, backdrop-filter 0.3s ease';
      });
    });
  }

  /* ============================================================
     INIT ALL
     ============================================================ */
  function init() {
    initScrollProgress();
    initMobileMenu();
    initBackToTop();
    initMobileCTA();
    initCounters();
    initContactFormValidation();
    initActiveNavPulse();
    initServiceTooltips();
    initTypewriter();
    initCardFlips();
    initMediumsAnimation();
    initStepConnector();
    initVendorWizard();
    initVideoModal();
    initServiceFilters();
    
    // NEW PREMIUM EFFECTS
    initMouseParallax();
    initMagneticButtons();
    initSmoothScroll();
    initMarquee();
    initPageTransitions();
    initTextScramble();
    initCardTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
