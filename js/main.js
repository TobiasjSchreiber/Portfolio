/**
 * TOBIAS SCHREIBER — PORTFOLIO (MEDIENTECHNIK)
 * High-Performance Interactive Engine & Cinematic Intro Loader:
 * - Phase 1: Asset Preloader & Name Unfold ("Tobias Schreiber")
 * - Phase 2: Video Portal pushes name apart
 * - Phase 3: Video expands fullscreen & reveals portfolio page
 * - 60/120fps Lenis Smooth Scrolling (Zero Layout Thrashing)
 * - Smart Video Viewport Manager (Auto-pause offscreen videos)
 */

// Force manual scroll restoration so reloading always starts at the top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Reset anchor hash on reload so the browser does not jump down
if (window.location.hash) {
  history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  // --------------------------------------------------------------------------
  // Ambient Atmosphere & Chromatic Mood Manager
  // --------------------------------------------------------------------------
  const AMBIENT_THEMES = {
    hero: {
      glow1: 'rgba(230, 175, 105, 0.16)',
      glow2: 'rgba(215, 135, 75, 0.13)',
      glow3: 'rgba(150, 130, 110, 0.10)'
    },
    bmw: {
      glow1: 'rgba(245, 210, 60, 0.20)',
      glow2: 'rgba(235, 185, 110, 0.14)',
      glow3: 'rgba(190, 160, 115, 0.11)'
    },
    cgi: {
      glow1: 'rgba(225, 125, 65, 0.18)',
      glow2: 'rgba(230, 165, 60, 0.15)',
      glow3: 'rgba(180, 110, 80, 0.12)'
    },
    film: {
      glow1: 'rgba(210, 160, 95, 0.18)',
      glow2: 'rgba(235, 125, 45, 0.16)',
      glow3: 'rgba(145, 105, 70, 0.12)'
    },
    fotografie: {
      glow1: 'rgba(220, 110, 70, 0.17)',
      glow2: 'rgba(235, 170, 120, 0.14)',
      glow3: 'rgba(155, 135, 120, 0.12)'
    },
    kunst: {
      glow1: 'rgba(235, 185, 125, 0.17)',
      glow2: 'rgba(195, 150, 95, 0.14)',
      glow3: 'rgba(130, 115, 100, 0.12)'
    },
    uni: {
      glow1: 'rgba(225, 65, 45, 0.17)',
      glow2: 'rgba(215, 140, 50, 0.14)',
      glow3: 'rgba(185, 90, 45, 0.12)'
    },
    about: {
      glow1: 'rgba(225, 215, 200, 0.14)',
      glow2: 'rgba(215, 185, 145, 0.13)',
      glow3: 'rgba(150, 140, 130, 0.10)'
    },
    kontakt: {
      glow1: 'rgba(225, 215, 200, 0.14)',
      glow2: 'rgba(215, 185, 145, 0.13)',
      glow3: 'rgba(150, 140, 130, 0.10)'
    }
  };

  let currentAmbientTheme = 'hero';
  let ambientTargetScroll = window.scrollY || 0;

  function setAmbientTheme(themeKey) {
    if (!themeKey || !AMBIENT_THEMES[themeKey]) return;
    if (currentAmbientTheme === themeKey) return;
    currentAmbientTheme = themeKey;

    document.body.setAttribute('data-ambient-theme', themeKey);
    const theme = AMBIENT_THEMES[themeKey];
    if (theme) {
      document.documentElement.style.setProperty('--glow-1', theme.glow1);
      document.documentElement.style.setProperty('--glow-2', theme.glow2);
      document.documentElement.style.setProperty('--glow-3', theme.glow3);
    }
  }

  // --------------------------------------------------------------------------
  // 0. Cinematic Intro Preloader Sequence
  // --------------------------------------------------------------------------
  const loader = document.getElementById('cinematic-loader');
  const progressFill = document.getElementById('loader-progress-fill');
  const percentText = document.getElementById('loader-percent-text');
  const statusText = document.getElementById('loader-status-text');
  const heroVideo = document.getElementById('hero-video');

  let loaderFinished = false;
  let lenis = null;
  let updateCgiParallax = null;
  let updateKunstParallax = null;
  let updateFilmParallax = null;

  // Strict scroll lock while loading animation is running
  function blockScrollEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  const scrollBlockKeys = new Set(['Space', ' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']);
  function blockScrollKeys(e) {
    if (scrollBlockKeys.has(e.code) || scrollBlockKeys.has(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function forceScrollTop() {
    if (document.documentElement.classList.contains('is-loading')) {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener('wheel', blockScrollEvent, { passive: false });
  window.addEventListener('touchmove', blockScrollEvent, { passive: false });
  window.addEventListener('keydown', blockScrollKeys, { passive: false });
  window.addEventListener('scroll', forceScrollTop, { passive: false });

  function finishLoader() {
    if (loaderFinished) return;
    loaderFinished = true;

    // Step 3: Expand single hero video fullscreen smoothly from center (0.85s transition)
    if (loader) {
      loader.classList.add('step-expand');
    }
    document.body.classList.add('step-expand');

    // Reveal UI softly at 380ms as the expanding video approaches fullscreen
    setTimeout(() => {
      document.body.classList.add('hero-ui-reveal');
    }, 380);

    // Expansion finishes at ~850ms -> begin final fade of loader overlay
    setTimeout(() => {
      if (loader) {
        loader.classList.add('loader-finished');
      }
      document.body.classList.add('loader-finished');

      // 250ms later: cleanly remove loader, unlock scroll and activate site
      setTimeout(() => {
        if (loader) {
          loader.style.display = 'none';
        }

        document.documentElement.classList.remove('is-loading');
        document.body.classList.remove('is-loading', 'step-push', 'step-expand', 'loader-finished', 'hero-ui-reveal');
        document.body.classList.add('is-loaded');

        // Unbind scroll lock listeners
        window.removeEventListener('wheel', blockScrollEvent);
        window.removeEventListener('touchmove', blockScrollEvent);
        window.removeEventListener('keydown', blockScrollKeys);
        window.removeEventListener('scroll', forceScrollTop);

        // Ensure page is cleanly at top
        window.scrollTo(0, 0);
        updateNavHeaderVisibility(0);

        // Initialize smooth scroll engine
        initLenis();
        initScrollFeatures();
        initBouncyTabsNav();
        if (typeof updateSectionBounds === 'function') {
          updateSectionBounds();
        }
        if (typeof updateCgiParallax === 'function') {
          updateCgiParallax();
        }
        if (typeof updateKunstParallax === 'function') {
          updateKunstParallax();
        }
        if (typeof updateFilmParallax === 'function') {
          updateFilmParallax();
        }
        if (typeof initMediaLoadingShine === 'function') {
          initMediaLoadingShine();
        }
      }, 250);
    }, 850);
  }

  // Preloading & Calm Cinematic Animation Driver (Waits for all media)
  function startCinematicSequence() {
    // Ensure single hero background video is queued at frame 0 and paused while loading
    if (heroVideo) {
      heroVideo.pause();
      heroVideo.currentTime = 0;
    }

    // 1. Gather all media on the page to wait for them
    const images = Array.from(document.querySelectorAll('img[src]'));
    const videos = Array.from(document.querySelectorAll('video'));
    const totalMedia = images.length + videos.length;
    let loadedMedia = 0;

    function checkMediaDone() {
      loadedMedia++;
    }

    images.forEach(img => {
      if (img.complete) {
        checkMediaDone();
      } else {
        img.addEventListener('load', checkMediaDone, { once: true });
        img.addEventListener('error', checkMediaDone, { once: true });
      }
    });

    videos.forEach(vid => {
      // readyState >= 2 (HAVE_CURRENT_DATA) means the video is loaded enough to show a frame/poster
      if (vid.readyState >= 2) {
        checkMediaDone();
      } else {
        vid.addEventListener('loadeddata', checkMediaDone, { once: true });
        vid.addEventListener('error', checkMediaDone, { once: true });
      }
    });

    const minLoadDuration = 2000; // Minimum visual duration before 100% can be reached
    const maxWaitTime = 12000;    // Absolute maximum wait time (12s) before forcing the site to open
    const startTime = performance.now();
    let animFrame = null;
    let hasUnfolded = false;
    let hasSetText = false;
    let mediaReadyTime = null;

    function updateProgress(now) {
      const elapsed = now - startTime;
      const isMediaReady = (loadedMedia >= totalMedia) || (elapsed > maxWaitTime);
      const minTimePassed = elapsed >= minLoadDuration;

      let displayProgress;

      if (!isMediaReady) {
        // Asymptotic curve: always moving, never stops, approaches 99% but never reaches it
        // At 2s → ~39%, 4s → ~63%, 8s → ~86%, 12s → ~95%
        displayProgress = (1 - Math.exp(-elapsed / 3000)) * 0.99;
      } else {
        // Media ready — smoothly fill from current to 100%
        if (!mediaReadyTime) mediaReadyTime = now;
        const currentAsymptotic = (1 - Math.exp(-elapsed / 3000)) * 0.99;
        const fillElapsed = now - mediaReadyTime;
        const fillDuration = minTimePassed ? 300 : Math.max(300, (minLoadDuration - elapsed));
        const fillFraction = Math.min(1, fillElapsed / fillDuration);
        displayProgress = currentAsymptotic + (1.0 - currentAsymptotic) * fillFraction;
      }

      const currentPercent = Math.min(100, Math.floor(displayProgress * 100));

      if (progressFill) progressFill.style.width = `${currentPercent}%`;
      if (percentText) percentText.textContent = `${currentPercent}%`;

      // Phase 1: Name Unfolds gently at ~28%
      if (currentPercent >= 28 && !hasUnfolded) {
        hasUnfolded = true;
        if (loader) loader.classList.add('step-unfold');
      }

      if (currentPercent >= 28 && !hasSetText && statusText) {
        hasSetText = true;
        statusText.textContent = 'Lade Medien...';
      }

      if (displayProgress >= 1.0 && isMediaReady && minTimePassed) {
        // 100% Reached & Media Loaded!
        if (progressFill) progressFill.style.width = '100%';
        if (percentText) percentText.textContent = '100%';
        if (statusText) statusText.textContent = 'Bereit';

        // Serene pause before pushing
        setTimeout(() => {
          // Phase 2: Start single hero video from frame 0 as the aperture opens!
          if (heroVideo) {
            heroVideo.currentTime = 0;
            heroVideo.play().catch(() => {});
          }
          if (loader) loader.classList.add('step-push');
          document.body.classList.add('step-push');

          // Let the user appreciate the video playing from the beginning for 1.4s
          setTimeout(() => {
            finishLoader();
          }, 1400);
        }, 450);
      } else {
        animFrame = requestAnimationFrame(updateProgress);
      }
    }

    animFrame = requestAnimationFrame(updateProgress);
  }

  // --------------------------------------------------------------------------
  // Floating Nav Header Scroll Visibility Controller (Hidden at very top)
  // --------------------------------------------------------------------------
  const navHeader = document.querySelector('.nav-header');
  const heroSection = document.getElementById('hero');
  let isNavHeaderVisible = false;

  function updateNavHeaderVisibility(scrollPos) {
    if (!navHeader) return;
    const currentScroll = typeof scrollPos === 'number'
      ? scrollPos
      : (window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0) || 0);

    // Only reveal when scrolled below the intro section (entering section 01 BMW)
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
    const revealThreshold = heroHeight - 100;
    const hideThreshold = heroHeight - 180;

    if (!isNavHeaderVisible && currentScroll >= revealThreshold) {
      isNavHeaderVisible = true;
      navHeader.classList.add('is-visible');
      if (typeof updateBouncyTabsIndicator === 'function') {
        requestAnimationFrame(() => updateBouncyTabsIndicator(false));
      }
    } else if (isNavHeaderVisible && currentScroll < hideThreshold) {
      isNavHeaderVisible = false;
      navHeader.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', () => {
    updateNavHeaderVisibility();
    if (typeof updateActiveSection === 'function') {
      updateActiveSection();
    }
    if (typeof updateFilmParallax === 'function') {
      updateFilmParallax();
    }
  }, { passive: true });

  // --------------------------------------------------------------------------
  // Bouncy Tabs Navigation Controller (Ghost Hover & Elastic Spring Indicator)
  // --------------------------------------------------------------------------
  let updateBouncyTabsIndicator = () => {};
  let syncBouncyTabsToSection = () => {};
  let updateActiveSection = () => {};
  let currentActiveSectionId = null;
  let performSmoothNavigation = () => {};

  function initBouncyTabsNav() {
    const nav = document.querySelector('[data-bouncy-tabs-nav]');
    if (!nav) return;

    const ghost = nav.querySelector('[data-bouncy-tabs-ghost]');
    const indicator = nav.querySelector('[data-bouncy-tabs-indicator]');
    const buttons = Array.from(nav.querySelectorAll('[data-bouncy-tabs-button]'));
    if (buttons.length === 0) return;

    let isManualClick = false;
    let manualClickTimer = null;
    let lastActiveX = null;

    function getCoords(btn) {
      return {
        x: btn.offsetLeft,
        y: btn.offsetTop,
        width: btn.offsetWidth,
        height: btn.offsetHeight
      };
    }

    function setIndicator(btn, animate = true) {
      if (!btn || !indicator) return;
      const { x, y, width, height } = getCoords(btn);
      if (width === 0 || height === 0) return;

      if (!animate || lastActiveX === null) {
        lastActiveX = x;
        indicator.style.transition = 'none';
        indicator.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        indicator.style.width = `${width}px`;
        indicator.style.height = `${height}px`;
        indicator.style.opacity = '1';
        indicator.style.visibility = 'visible';
        return;
      }

      const diffX = x - lastActiveX;
      lastActiveX = x;

      // Calm, stable transition without bounce or squash (strict GEMINI.md compliance)
      indicator.style.transition = 'transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1), width 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), height 0.25s ease, opacity 0.2s ease';
      indicator.style.transform = `translate(${x}px, ${y}px) scale(1, 1)`;

      indicator.style.width = `${width}px`;
      indicator.style.height = `${height}px`;
      indicator.style.opacity = '1';
      indicator.style.visibility = 'visible';
    }

    function setGhost(btn) {
      if (!btn || !ghost) return;
      // Don't show ghost over already active button
      if (btn.hasAttribute('data-active')) {
        hideGhost();
        return;
      }
      const { x, y, width, height } = getCoords(btn);
      ghost.style.transform = `translate(${x}px, ${y}px)`;
      ghost.style.width = `${width}px`;
      ghost.style.height = `${height}px`;
      ghost.style.opacity = '1';
      ghost.style.visibility = 'visible';
    }

    function hideGhost() {
      if (!ghost) return;
      ghost.style.opacity = '0';
      ghost.style.visibility = 'hidden';
    }

    function setActiveButton(targetBtn, animate = true) {
      if (!targetBtn) return;
      buttons.forEach((b) => {
        b.removeAttribute('data-active');
        b.removeAttribute('aria-current');
      });
      targetBtn.setAttribute('data-active', '');
      targetBtn.setAttribute('aria-current', 'true');
      setIndicator(targetBtn, animate);

      // On mobile / narrow viewports, gently scroll active tab into view
      if (nav.scrollWidth > nav.clientWidth) {
        const navRect = nav.getBoundingClientRect();
        const btnRect = targetBtn.getBoundingClientRect();
        if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
          targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }

    // Hover interactions
    buttons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => setGhost(btn));
    });
    nav.addEventListener('mouseleave', () => hideGhost());

    // Precise Navigation Engine: Positions content cleanly ~18px below the fixed hero bar
    performSmoothNavigation = function(rawTargetId) {
      const targetId = rawTargetId ? rawTargetId.replace(/^#/, '') : '';
      if (!targetId) return;

      let targetElement = document.getElementById(targetId);
      if (!targetElement && (targetId === 'intro' || targetId === 'hero')) targetElement = document.getElementById('hero');
      if (!targetElement && (targetId === 'work' || targetId === 'bmw' || targetId === 'cgi')) targetElement = document.getElementById('cgi');
      if (!targetElement && (targetId === 'approach' || targetId === 'about')) targetElement = document.getElementById('about');
      if (!targetElement) return;

      isManualClick = true;
      currentActiveSectionId = targetId;
      clearTimeout(manualClickTimer);
      manualClickTimer = setTimeout(() => {
        isManualClick = false;
      }, 1400);

      const sectionTheme = (targetId === 'intro' || targetId === 'hero') ? 'hero' : (targetId === 'work' || targetId === 'bmw' || targetId === 'cgi' ? 'cgi' : (targetId === 'approach' ? 'about' : targetId));
      setAmbientTheme(sectionTheme);

      if (targetId === 'hero' || targetId === 'intro') {
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(0, { duration: 1.0 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // Height and bottom of fixed navigation bar (.nav-header is top: 1.4rem ~ 22px, height ~ 48px -> bottom ~ 72px)
      const navHeader = document.querySelector('.nav-header');
      let navBottom = 72;
      if (navHeader) {
        const rect = navHeader.getBoundingClientRect();
        if (rect.height > 0) {
          navBottom = Math.max(navBottom, rect.bottom);
        }
      }

      // For sticky section #uni, target the top of the section element so slide 1 starts cleanly
      if (targetId === 'uni' || targetElement.classList.contains('uni-sticky-section')) {
        const currentScroll = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0);
        const secRect = targetElement.getBoundingClientRect();
        const targetScroll = Math.max(0, Math.round(secRect.top + currentScroll));
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(targetScroll, { duration: 1.0 });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
        return;
      }

      // For other sections, target the primary heading or visual anchor
      const anchorEl = targetElement.querySelector('.section-header, .kunst-feature-hero, .about-section-inner, .contact-huge-link') || targetElement;
      const currentScroll = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0);
      const anchorRect = anchorEl.getBoundingClientRect();
      const absoluteTop = anchorRect.top + currentScroll;
      
      // Position heading cleanly below the herobar:
      // In general ~18px below the herobar; for #kunst we provide extra breathing room (~46px) so the hand and text are not tucked directly under the bar
      const offsetBelowNav = (targetId === 'kunst') ? 46 : 18;
      const targetScroll = Math.max(0, Math.round(absoluteTop - (navBottom + offsetBelowNav)));

      if (typeof lenis !== 'undefined' && lenis) {
        lenis.scrollTo(targetScroll, { duration: 1.0 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }

    // Click interactions
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        
        e.preventDefault();
        const targetId = href.substring(1);
        setActiveButton(btn, true);
        hideGhost();
        performSmoothNavigation(targetId);
      });
    });

    // Sync on scroll
    syncBouncyTabsToSection = function(sectionId) {
      if (isManualClick) return;
      let match = buttons.find((b) => b.getAttribute('href') === `#${sectionId}`);
      if (!match && (sectionId === 'hero' || sectionId === 'intro')) {
        match = buttons.find((b) => b.getAttribute('href') === '#hero' || b.getAttribute('href') === '#intro');
      }
      if (!match && (sectionId === 'bmw' || sectionId === 'work' || sectionId === 'cgi')) {
        match = buttons.find((b) => b.getAttribute('href') === '#cgi');
      }
      if (!match && (sectionId === 'about' || sectionId === 'approach' || sectionId === 'kontakt')) {
        match = buttons.find((b) => b.getAttribute('href') === '#about' || b.getAttribute('href') === '#approach');
      }
      if (match && !match.hasAttribute('data-active')) {
        setActiveButton(match, true);
      }
    };

    updateBouncyTabsIndicator = function(animate = false) {
      const activeBtn = nav.querySelector('[data-bouncy-tabs-button][data-active]') || buttons[0];
      if (activeBtn) setIndicator(activeBtn, animate);
    };

    // Position initial indicator
    const initialActive = nav.querySelector('[data-bouncy-tabs-button][data-active]') || buttons[0];
    if (initialActive) {
      setActiveButton(initialActive, false);
    }

    window.addEventListener('resize', () => {
      updateBouncyTabsIndicator(false);
    }, { passive: true });

    setTimeout(() => updateBouncyTabsIndicator(false), 300);
    setTimeout(() => updateBouncyTabsIndicator(false), 1200);
  }

  // Kick off sequence
  startCinematicSequence();
  initBouncyTabsNav();

  // --------------------------------------------------------------------------
  // 1. Lenis Smooth Scrolling Initialization (Called after loader completes)
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress');

  function initLenis() {
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easeOutExpo
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1.0,
        smoothTouch: false,
        touchMultiplier: 2
      });
      window.lenis = lenis; // Expose globally for other scripts

      // Force Lenis to acknowledge top position immediately
      lenis.scrollTo(0, { immediate: true });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Smooth progress & ambient scroll tracking
      lenis.on('scroll', (e) => {
        ambientTargetScroll = e.scroll;
        updateNavHeaderVisibility(e.scroll);
        if (typeof updateActiveSection === 'function') {
          updateActiveSection();
        }
        if (typeof updateFilmParallax === 'function') {
          updateFilmParallax();
        }
        if (progressBar) {
          progressBar.style.width = `${Math.min(100, Math.max(0, e.progress * 100))}%`;
        }
      });

      // Anchor smooth scrolling
      document.querySelectorAll('a[href^="#"]:not([data-bouncy-tabs-button])').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          if (!targetId || targetId === '#') return;
          e.preventDefault();
          performSmoothNavigation(targetId);
        });
      });
    } else {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        ambientTargetScroll = scrollTop;
        updateNavHeaderVisibility(scrollTop);
        if (typeof updateActiveSection === 'function') {
          updateActiveSection();
        }
        if (typeof updateFilmParallax === 'function') {
          updateFilmParallax();
        }
        if (progressBar) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          progressBar.style.width = `${progress}%`;
        }
      }, { passive: true });
    }
  }

  // --------------------------------------------------------------------------
  // 2. Scroll Observers & Performance Features
  // --------------------------------------------------------------------------
  function initScrollFeatures() {
    // Active Nav Link Tracking & Dynamic Ambient Theme Sync (Reliable Focal Scanline Scrollspy)
    // Avoids IntersectionObserver area-ratio collapse on tall sections like Film (450vh) & Fotografie (350vh)
    const trackedSections = Array.from(document.querySelectorAll('section[id], footer[id]'));
    currentActiveSectionId = null;

    updateActiveSection = function() {
      if (trackedSections.length === 0) return;
      const windowH = window.innerHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0) || 0;
      const totalDocH = document.documentElement.scrollHeight;

      // Bottom of page: highlight last section (about / kontakt)
      if (windowH + scrollY >= totalDocH - 60) {
        const lastSec = trackedSections[trackedSections.length - 1];
        const lastId = lastSec ? lastSec.getAttribute('id') : null;
        if (lastId && lastId !== currentActiveSectionId) {
          currentActiveSectionId = lastId;
          syncBouncyTabsToSection(lastId);
          setAmbientTheme(lastId === 'kontakt' ? 'about' : lastId);
        }
        return;
      }

      // Focal scanline ~30% below top of viewport (clamped between 140px and 260px)
      const focalY = Math.min(260, Math.max(140, windowH * 0.30));
      let dominantId = null;

      // Find the section that currently intersects the focal line
      for (let i = 0; i < trackedSections.length; i++) {
        const sec = trackedSections[i];
        const rect = sec.getBoundingClientRect();
        if (rect.top <= focalY && rect.bottom > focalY) {
          dominantId = sec.getAttribute('id');
          break;
        }
      }

      // Fallback: closest section above focal line
      if (!dominantId) {
        for (let i = trackedSections.length - 1; i >= 0; i--) {
          const sec = trackedSections[i];
          const rect = sec.getBoundingClientRect();
          if (rect.top <= focalY) {
            dominantId = sec.getAttribute('id');
            break;
          }
        }
      }

      if (!dominantId && trackedSections.length > 0) {
        dominantId = trackedSections[0].getAttribute('id');
      }

      if (dominantId && dominantId !== currentActiveSectionId) {
        currentActiveSectionId = dominantId;
        syncBouncyTabsToSection(dominantId);
        setAmbientTheme(dominantId === 'kontakt' ? 'about' : dominantId);
      }
    };

    updateActiveSection();

    // Smart Video Viewport Manager (Auto-pause offscreen videos, pre-roll ~350px before entering viewport)
    // Note: Film parallax videos (#film-parallax-stage) are managed exclusively by updateFilmParallax() to prevent race conditions.
    const standaloneVideos = Array.from(document.querySelectorAll('video')).filter((v) => {
      if (v.id === 'modal-video') return false;
      if (v.closest('#film-parallax-stage')) return false;
      return true;
    });

    if ('IntersectionObserver' in window && standaloneVideos.length > 0) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (video.dataset.manuallyPaused === 'true') return;

          if (entry.isIntersecting) {
            if (video.paused) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {});
              }
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      }, {
        root: null,
        threshold: 0,
        rootMargin: '350px 0px 350px 0px'
      });

      standaloneVideos.forEach((v) => {
        videoObserver.observe(v);
      });
    }

    // Scroll Reveal Animations (Replays smoothly on scrolling up and down)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Re-arm animation when scrolled out of view
            entry.target.classList.remove('is-visible');
          }
        });
      }, {
        root: null,
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach((el) => revealObserver.observe(el));
    }

    // --------------------------------------------------------------------------
    // Dynamic Scroll Depth & Multiplane Parallax Engine (Silky 60-120fps)
    // --------------------------------------------------------------------------
    const heroVideoEl = document.getElementById('hero-video');
    const heroContentEl = document.querySelector('.hero-content');
    const sectionNums = Array.from(document.querySelectorAll('.section-num'));
    const parallaxMediaItems = Array.from(document.querySelectorAll(
      '.cinematic-hero-player .cinematic-video, .about-portrait-wrap img, .photo-card--hero .photo-card-img'
    ));

    let isParallaxTicking = false;

    function updateContinuousParallax() {
      const scrollY = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0) || 0;
      const windowH = window.innerHeight;

      // 1. Hero Dynamic Depth Shift (Video moves down gently, Content moves up and dissolves)
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight || windowH;
        if (scrollY <= heroHeight * 1.15) {
          if (heroVideoEl) {
            heroVideoEl.style.transform = `translate3d(0, ${(scrollY * 0.32).toFixed(1)}px, 0)`;
          }
          if (heroContentEl) {
            const fade = Math.max(0, 1 - (scrollY / (heroHeight * 0.72)));
            heroContentEl.style.transform = `translate3d(0, ${(-scrollY * 0.18).toFixed(1)}px, 0)`;
            heroContentEl.style.opacity = fade.toFixed(3);
          }
        }
      }

      // 2. Section Numbers Floating Multiplane Parallax (Entfernt wegen Jitter-Effekt)
      // sectionNums.forEach((num) => { ... });

      // 3. Focal Media Window Parallax (Entfernt wegen Konflikten mit CSS Transitions)
      // parallaxMediaItems.forEach((media) => { ... });

      isParallaxTicking = false;
    }

    function triggerContinuousParallax() {
      if (!isParallaxTicking) {
        requestAnimationFrame(updateContinuousParallax);
        isParallaxTicking = true;
      }
    }

    window.addEventListener('scroll', triggerContinuousParallax, { passive: true });
    window.addEventListener('resize', triggerContinuousParallax, { passive: true });
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.on('scroll', triggerContinuousParallax);
    }
    triggerContinuousParallax();
  }

  // --------------------------------------------------------------------------
  // 3. Hero Video Controls
  // --------------------------------------------------------------------------
  const heroSoundToggle = document.getElementById('hero-sound-toggle');
  const heroSoundIcon = document.getElementById('hero-sound-icon');
  const heroSoundText = document.getElementById('hero-sound-text');
  const heroPlayToggle = document.getElementById('hero-play-toggle');
  const heroPlayText = document.getElementById('hero-play-text');

  if (heroVideo && heroSoundToggle) {
    heroSoundToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      if (heroVideo.muted) {
        if (heroSoundText) heroSoundText.textContent = 'Ton an';
        if (heroSoundIcon) {
          heroSoundIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          `;
        }
      } else {
        if (heroSoundText) heroSoundText.textContent = 'Stumm';
        if (heroSoundIcon) {
          heroSoundIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          `;
        }
      }
    });
  }

  if (heroVideo && heroPlayToggle) {
    heroPlayToggle.addEventListener('click', () => {
      if (heroVideo.paused) {
        delete heroVideo.dataset.manuallyPaused;
        heroVideo.play().catch(() => {});
        if (heroPlayText) heroPlayText.textContent = 'Pause';
      } else {
        heroVideo.dataset.manuallyPaused = 'true';
        heroVideo.pause();
        if (heroPlayText) heroPlayText.textContent = 'Play';
      }
    });
  }

  // Hero Scroll Indicator Click
  const heroScrollIndicator = document.querySelector('.scroll-indicator');
  if (heroScrollIndicator) {
    heroScrollIndicator.style.cursor = 'pointer';
    heroScrollIndicator.addEventListener('click', () => {
      const bmw = document.getElementById('bmw');
      if (bmw) {
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(bmw, { offset: -30, duration: 1.0 });
        } else {
          bmw.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // 4. Global Cinema Lightbox Modal & Document Engine (Zero Acrobat, Pure High-Res)
  // --------------------------------------------------------------------------
  const DOC_REGISTRY = {
    festival: {
      title: 'Festival Design — In Nomine Teufel',
      subtitle: 'Publikation & Corporate Identity • 9 Seiten',
      meta: 'Festival-Plakat & Publikation',
      pdfSrc: 'assets/docs/Festival.pdf',
      downloadName: 'Festival_In_Nomine_Teufel_Tobias_Schreiber.pdf',
      pages: [
        'assets/docs/festival/page_1.webp',
        'assets/docs/festival/page_2.webp',
        'assets/docs/festival/page_3.webp',
        'assets/docs/festival/page_4.webp',
        'assets/docs/festival/page_5.webp',
        'assets/docs/festival/page_6.webp',
        'assets/docs/festival/page_7.webp',
        'assets/docs/festival/page_8.webp',
        'assets/docs/festival/page_9.webp'
      ]
    },
    magicflow: {
      title: 'MagicFlow — UI/UX Interaktionsdesign',
      subtitle: 'Motion Interface & Prototyping Board',
      meta: 'UI/UX Interaktionsdesign & Flow Board',
      pdfSrc: 'assets/docs/MagicFlow-Präsentation.pdf',
      downloadName: 'MagicFlow_Praesentation_Tobias_Schreiber.pdf',
      isLongBoard: true,
      pages: [
        'assets/docs/magicflow/page_1.webp'
      ]
    },
    layout: {
      title: 'Selbst Layout — Redaktionelle Konzeption',
      subtitle: 'Magazinkonzept & typografischer Aufbau • 12 Doppelseiten',
      meta: 'Magazinkonzept & Satzspiegel',
      pdfSrc: 'assets/docs/Selbst%20Layout.pdf',
      downloadName: 'Selbst_Layout_Tobias_Schreiber.pdf',
      pages: [
        'assets/docs/layout/page_1.webp',
        'assets/docs/layout/page_2.webp',
        'assets/docs/layout/page_3.webp',
        'assets/docs/layout/page_4.webp',
        'assets/docs/layout/page_5.webp',
        'assets/docs/layout/page_6.webp',
        'assets/docs/layout/page_7.webp',
        'assets/docs/layout/page_8.webp',
        'assets/docs/layout/page_9.webp',
        'assets/docs/layout/page_10.webp',
        'assets/docs/layout/page_11.webp',
        'assets/docs/layout/page_12.webp'
      ]
    },
    landschaft: {
      title: 'Landschafts- & Umweltstudie',
      subtitle: 'Freiraumplanung & Topografieanalyse • 14 Seiten',
      meta: 'Freiraumplanung & Topografieanalyse',
      pdfSrc: 'assets/docs/Schreiber%20Landschaft.pdf',
      downloadName: 'Schreiber_Landschaft_Studie.pdf',
      pages: [
        'assets/docs/landschaft/page_1.webp',
        'assets/docs/landschaft/page_2.webp',
        'assets/docs/landschaft/page_3.webp',
        'assets/docs/landschaft/page_4.webp',
        'assets/docs/landschaft/page_5.webp',
        'assets/docs/landschaft/page_6.webp',
        'assets/docs/landschaft/page_7.webp',
        'assets/docs/landschaft/page_8.webp',
        'assets/docs/landschaft/page_9.webp',
        'assets/docs/landschaft/page_10.webp',
        'assets/docs/landschaft/page_11.webp',
        'assets/docs/landschaft/page_12.webp',
        'assets/docs/landschaft/page_13.webp',
        'assets/docs/landschaft/page_14.webp'
      ]
    }
  };

  const cinemaModal = document.getElementById('cinema-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalVideo = document.getElementById('modal-video');
  const modalImage = document.getElementById('modal-image');
  const modalPdf = document.getElementById('modal-pdf');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');

  let currentGallery = [];
  let currentGalleryIndex = 0;
  let activeDocCinema = null;

  function openCinemaDoc(docKey, pageIndex) {
    const doc = DOC_REGISTRY[docKey];
    if (!doc) return;
    if (pageIndex < 0) pageIndex = 0;
    if (pageIndex >= doc.pages.length) pageIndex = doc.pages.length - 1;

    activeDocCinema = { key: docKey, pageIndex: pageIndex };
    currentGallery = [];

    if (modalTitle) modalTitle.textContent = doc.title;
    if (modalMeta) {
      modalMeta.textContent = doc.isLongBoard 
        ? `${doc.meta} • Vollansicht`
        : `Seite ${pageIndex + 1} von ${doc.pages.length} • ${doc.meta}`;
    }

    if (modalVideo) { modalVideo.pause(); modalVideo.style.display = 'none'; modalVideo.src = ''; }
    if (modalPdf) { modalPdf.style.display = 'none'; modalPdf.src = ''; }
    if (modalImage) {
      modalImage.style.display = 'block';
      modalImage.src = doc.pages[pageIndex];
    }

    if (modalPrev && modalNext) {
      modalPrev.style.display = doc.pages.length > 1 ? 'flex' : 'none';
      modalNext.style.display = doc.pages.length > 1 ? 'flex' : 'none';
    }

    if (cinemaModal) {
      cinemaModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }
  }

  function openCinemaModal(item) {
    activeDocCinema = null;
    const type = item.getAttribute('data-cinema-type');
    const src = item.getAttribute('data-cinema-src');
    const title = item.getAttribute('data-cinema-title') || '';
    const meta = item.getAttribute('data-cinema-meta') || '';
    const galleryGroup = item.getAttribute('data-cinema-gallery');

    if (modalTitle) modalTitle.textContent = title;
    if (modalMeta) modalMeta.textContent = meta;

    if (galleryGroup) {
      const allItems = Array.from(document.querySelectorAll(`[data-cinema-gallery="${galleryGroup}"]`));
      currentGallery = allItems.filter(el => !el.closest('.filter-hidden'));
      currentGalleryIndex = currentGallery.indexOf(item);
      if (modalPrev && modalNext) {
        modalPrev.style.display = currentGallery.length > 1 ? 'flex' : 'none';
        modalNext.style.display = currentGallery.length > 1 ? 'flex' : 'none';
      }
    } else {
      currentGallery = [];
      if (modalPrev && modalNext) {
        modalPrev.style.display = 'none';
        modalNext.style.display = 'none';
      }
    }

    const modalStage = cinemaModal ? cinemaModal.querySelector('.modal-stage') : null;
    if (modalStage) {
      modalStage.classList.add('media-loading');
      modalStage.classList.remove('media-loaded');
    }

    if (type === 'video') {
      if (modalPdf) { modalPdf.style.display = 'none'; modalPdf.src = ''; }
      if (modalImage) modalImage.style.display = 'none';
      if (modalVideo) {
        modalVideo.style.display = 'block';
        modalVideo.src = src;
        modalVideo.muted = false;
        const startTime = parseFloat(item.getAttribute('data-start-time') || '0');
        modalVideo.currentTime = startTime;
        const onModalVideoReady = () => {
          if (modalStage) {
            modalStage.classList.remove('media-loading');
            modalStage.classList.add('media-loaded');
          }
          if (startTime > 0 && modalVideo.currentTime < startTime) {
            modalVideo.currentTime = startTime;
          }
          modalVideo.removeEventListener('loadeddata', onModalVideoReady);
          modalVideo.removeEventListener('canplay', onModalVideoReady);
        };
        if (modalVideo.readyState >= 2) {
          onModalVideoReady();
        } else {
          modalVideo.addEventListener('loadeddata', onModalVideoReady);
          modalVideo.addEventListener('canplay', onModalVideoReady);
        }
        modalVideo.play().catch(() => {});
      }

      // Mute background inline videos while viewing in modal
      document.querySelectorAll('video').forEach((v) => {
        if (v !== modalVideo) v.muted = true;
      });
      document.querySelectorAll('.video-audio-toggle').forEach((b) => {
        b.classList.add('is-muted');
        b.setAttribute('aria-label', 'Ton einschalten');
        b.setAttribute('title', 'Ton einschalten');
        const lbl = b.querySelector('.audio-label');
        if (lbl) lbl.textContent = 'Ton aus';
      });
    } else {
      if (modalVideo) { modalVideo.pause(); modalVideo.style.display = 'none'; modalVideo.src = ''; }
      if (modalPdf) { modalPdf.style.display = 'none'; modalPdf.src = ''; }
      if (modalImage) {
        modalImage.style.display = 'block';
        modalImage.src = src;
        const onModalImgLoad = () => {
          if (modalStage) {
            modalStage.classList.remove('media-loading');
            modalStage.classList.add('media-loaded');
          }
          modalImage.removeEventListener('load', onModalImgLoad);
        };
        if (modalImage.complete && modalImage.naturalWidth > 0) {
          onModalImgLoad();
        } else {
          modalImage.addEventListener('load', onModalImgLoad);
        }
      }
    }

    if (cinemaModal) {
      cinemaModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }
  }

  function closeCinemaModal() {
    activeDocCinema = null;
    if (cinemaModal) {
      cinemaModal.classList.remove('open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
    }
    if (modalImage) {
      modalImage.src = '';
    }
    if (modalPdf) {
      modalPdf.src = '';
      modalPdf.style.display = 'none';
    }
  }

  function showGalleryItem(index) {
    if (activeDocCinema) {
      const doc = DOC_REGISTRY[activeDocCinema.key];
      if (!doc || doc.pages.length <= 1) return;
      if (index < 0) index = doc.pages.length - 1;
      if (index >= doc.pages.length) index = 0;
      openCinemaDoc(activeDocCinema.key, index);
      return;
    }
    if (!currentGallery || currentGallery.length === 0) return;
    if (index < 0) index = currentGallery.length - 1;
    if (index >= currentGallery.length) index = 0;
    currentGalleryIndex = index;
    const targetItem = currentGallery[currentGalleryIndex];
    openCinemaModal(targetItem);
  }

  document.querySelectorAll('[data-cinema-trigger]').forEach((trigger) => {
    if (trigger.classList.contains('cgi-parallax-card') || trigger.classList.contains('ceramic-frame') || trigger.classList.contains('kunst-ticker-card')) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openCinemaModal(trigger);
    });
  });

  // --------------------------------------------------------------------------
  // 4b. Fullscreen Vertical Film Parallax Showcase Engine
  // --------------------------------------------------------------------------
  function initFilmVerticalParallax() {
    const stage = document.getElementById('film-parallax-stage');
    if (!stage) return () => {};

    const cards = Array.from(stage.querySelectorAll('.film-text-card'));
    const panels = Array.from(stage.querySelectorAll('.film-video-panel'));
    const dots = Array.from(stage.querySelectorAll('.film-dot'));
    const counter = document.getElementById('film-sticky-counter');
    const label = document.getElementById('film-sticky-label');
    const globalAudioBtn = document.getElementById('film-global-audio-btn');
    const cinemaOpenBtn = document.getElementById('film-cinema-open-btn');
    const stillsToggle = document.getElementById('film-stills-toggle');
    let activeFilmIndex = -1;

    // Configure custom start times: Spielfilm (Kurzfilm) ab Sekunde 8, Interview ab Sekunde 4
    panels.forEach((p, idx) => {
      const v = p.querySelector('video');
      if (!v) return;
      const startOffset = idx === 2 ? 8 : (idx === 3 ? 4 : 0);
      if (startOffset > 0) {
        v.setAttribute('data-start-time', startOffset.toString());

        const applyStartTime = () => {
          if (v.currentTime < startOffset) {
            v.currentTime = startOffset;
          }
        };

        if (v.readyState >= 1) {
          applyStartTime();
        } else {
          v.addEventListener('loadedmetadata', applyStartTime, { once: true });
        }

        // Loop wrap-around: ensure video stays after the start offset
        v.addEventListener('timeupdate', () => {
          if (v.currentTime > 0 && v.currentTime < (startOffset - 0.6) && v.dataset.hasPassedStart === 'true') {
            v.currentTime = startOffset;
          }
          if (v.currentTime >= startOffset + 0.8) {
            v.dataset.hasPassedStart = 'true';
          }
        });
      }
    });

    function syncActiveFilmUI(newIndex) {
      if (newIndex === activeFilmIndex || newIndex < 0 || newIndex >= cards.length) return;
      activeFilmIndex = newIndex;

      // 1. Text Cards transition
      cards.forEach((card, idx) => {
        if (idx === activeFilmIndex) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      // 2. Dots
      dots.forEach((dot, idx) => {
        if (idx === activeFilmIndex) {
          dot.classList.add('is-active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('is-active');
          dot.setAttribute('aria-selected', 'false');
        }
      });

      // 3. Counter & Category Label
      if (counter) {
        counter.textContent = `0${activeFilmIndex + 1} / 04`;
      }
      const activeCard = cards[activeFilmIndex];
      if (label && activeCard) {
        label.textContent = activeCard.getAttribute('data-label') || '';
      }

      // 4. Panel active classes
      panels.forEach((p, idx) => {
        if (idx === activeFilmIndex) {
          p.classList.add('is-active');
        } else {
          p.classList.remove('is-active');
        }
      });

      // 5. Update Cinema Open Button data attributes for modal lightbox
      if (cinemaOpenBtn && activeCard) {
        cinemaOpenBtn.setAttribute('data-cinema-trigger', '');
        cinemaOpenBtn.setAttribute('data-cinema-type', 'video');
        cinemaOpenBtn.setAttribute('data-cinema-src', activeCard.getAttribute('data-video-src') || '');
        cinemaOpenBtn.setAttribute('data-cinema-title', activeCard.getAttribute('data-video-title') || '');
        cinemaOpenBtn.setAttribute('data-cinema-meta', activeCard.getAttribute('data-video-meta') || '');
        cinemaOpenBtn.setAttribute('data-start-time', activeCard.getAttribute('data-start-time') || '0');
      }

      // 6. Audio toggle state for active video
      const activeVideo = document.getElementById(`film-video-${activeFilmIndex}`);
      if (activeVideo && globalAudioBtn) {
        if (activeVideo.muted) {
          globalAudioBtn.classList.add('is-muted');
          globalAudioBtn.setAttribute('aria-label', 'Ton einschalten');
          globalAudioBtn.setAttribute('title', 'Ton einschalten');
        } else {
          globalAudioBtn.classList.remove('is-muted');
          globalAudioBtn.setAttribute('aria-label', 'Stummschalten');
          globalAudioBtn.setAttribute('title', 'Stummschalten');
        }
      }
    }

    let snapTimeout = null;
    let isProgrammaticSnap = false;

    // Smoothstep Hermite curve for smooth entry and exit between resting plateaus
    function getTransitionStep(t, i) {
      if (t <= i) return 0;
      if (t >= i + 1) return 1;
      const f = t - i;
      // 22% of each step is a pure resting plateau (where only ONE video is visible)
      // 56% is the smooth parallax transition
      if (f <= 0.22) return 0;
      if (f >= 0.78) return 1;
      const u = (f - 0.22) / 0.56;
      return u * u * (3 - 2 * u);
    }

    // Optical Sliding Curtain Parallax with Rest Plateaus & Magnetic Snap
    function updateFilmParallax() {
      const stageRect = stage.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Pre-roll window: 350px before entering or after leaving the film stage
      const isNearFilmStage = (stageRect.top <= windowH + 350 && stageRect.bottom >= -350);
      if (!isNearFilmStage) {
        // User is outside the film section range: strictly pause all 4 film videos
        panels.forEach((p) => {
          const v = p.querySelector('video');
          if (v && !v.paused) v.pause();
        });

        // Set stable edge transforms when scrolled far away
        if (stageRect.top > windowH + 350) {
          if (panels[0]) {
            panels[0].style.transform = 'translate3d(0, 0%, 0)';
            panels[0].style.opacity = '1';
          }
          for (let i = 1; i < panels.length; i++) {
            if (panels[i]) panels[i].style.transform = 'translate3d(0, 100%, 0)';
          }
        } else if (stageRect.bottom < -350) {
          for (let i = 0; i < panels.length - 1; i++) {
            if (panels[i]) panels[i].style.transform = 'translate3d(0, -100%, 0)';
          }
          const last = panels[panels.length - 1];
          if (last) {
            last.style.transform = 'translate3d(0, 0%, 0)';
            last.style.opacity = '1';
          }
        }
        return;
      }

      // Total distance the stage can scroll while pinned
      const totalScrollable = stageRect.height - windowH;
      if (totalScrollable <= 0) return;

      // Scrolled distance into the stage
      const scrolledInto = -stageRect.top;
      
      // Normalize progress across the 3 transitions (0.0 to 3.0)
      const rawProgress = (scrolledInto / totalScrollable) * 3;
      const progress = Math.max(0, Math.min(3, rawProgress));

      // Active film determination based on resting and crossover points
      let activeIdx = 0;
      if (progress >= 2.5) {
        activeIdx = 3;
      } else if (progress >= 1.5) {
        activeIdx = 2;
      } else if (progress >= 0.5) {
        activeIdx = 1;
      } else {
        activeIdx = 0;
      }

      const s01 = getTransitionStep(progress, 0); // Transition 0 -> 1
      const s12 = getTransitionStep(progress, 1); // Transition 1 -> 2
      const s23 = getTransitionStep(progress, 2); // Transition 2 -> 3

      // Panel 0: Schattenwolf
      const p0 = panels[0];
      if (p0) {
        const vid0 = p0.querySelector('video');
        const wrap0 = p0.querySelector('.film-video-wrap');
        if (progress < 1.0) {
          p0.style.transform = `translate3d(0, ${(-s01 * 35).toFixed(2)}%, 0)`;
          p0.style.opacity = `${(1 - s01 * 0.45).toFixed(2)}`;
          if (wrap0) wrap0.style.transform = `translate3d(0, ${(s01 * 15).toFixed(2)}%, 0)`;
          if (vid0 && vid0.paused) vid0.play().catch(() => {});
        } else {
          p0.style.transform = 'translate3d(0, -100%, 0)';
          if (vid0 && !vid0.paused) vid0.pause();
        }
      }

      // Panel 1: 1 Tag als Bergmann
      const p1 = panels[1];
      if (p1) {
        const vid1 = p1.querySelector('video');
        const wrap1 = p1.querySelector('.film-video-wrap');
        if (progress < 0.15) {
          p1.style.transform = 'translate3d(0, 100%, 0)';
          if (vid1 && !vid1.paused) vid1.pause();
        } else if (progress <= 1.0) {
          // Pre-roll (from 0.15) & Arriving over Panel 0
          p1.style.transform = `translate3d(0, ${((1 - s01) * 100).toFixed(2)}%, 0)`;
          p1.style.opacity = '1';
          if (wrap1) wrap1.style.transform = `translate3d(0, ${((1 - s01) * -15).toFixed(2)}%, 0)`;
          if (vid1 && vid1.paused) vid1.play().catch(() => {});
        } else if (progress < 2.0) {
          // Resting then departing under Panel 2
          p1.style.transform = `translate3d(0, ${(-s12 * 35).toFixed(2)}%, 0)`;
          p1.style.opacity = `${(1 - s12 * 0.45).toFixed(2)}`;
          if (wrap1) wrap1.style.transform = `translate3d(0, ${(s12 * 15).toFixed(2)}%, 0)`;
          if (vid1 && vid1.paused) vid1.play().catch(() => {});
        } else {
          p1.style.transform = 'translate3d(0, -100%, 0)';
          if (vid1 && !vid1.paused) vid1.pause();
        }
      }

      // Panel 2: Inszenierter Kurzfilm (Spielfilm startet ab Sekunde 8)
      const p2 = panels[2];
      if (p2) {
        const vid2 = p2.querySelector('video');
        const wrap2 = p2.querySelector('.film-video-wrap');
        if (progress < 1.15) {
          p2.style.transform = 'translate3d(0, 100%, 0)';
          if (vid2 && !vid2.paused) vid2.pause();
          if (progress < 1.0 && vid2 && vid2.currentTime < 8) {
            vid2.currentTime = 8;
          }
        } else if (progress <= 2.0) {
          // Pre-roll (from 1.15) & Arriving over Panel 1
          p2.style.transform = `translate3d(0, ${((1 - s12) * 100).toFixed(2)}%, 0)`;
          p2.style.opacity = '1';
          if (wrap2) wrap2.style.transform = `translate3d(0, ${((1 - s12) * -15).toFixed(2)}%, 0)`;
          if (vid2) {
            if (vid2.currentTime < 8) vid2.currentTime = 8;
            if (vid2.paused) vid2.play().catch(() => {});
          }
        } else if (progress < 3.0) {
          // Resting then departing under Panel 3
          p2.style.transform = `translate3d(0, ${(-s23 * 35).toFixed(2)}%, 0)`;
          p2.style.opacity = `${(1 - s23 * 0.45).toFixed(2)}`;
          if (wrap2) wrap2.style.transform = `translate3d(0, ${(s23 * 15).toFixed(2)}%, 0)`;
          if (vid2 && vid2.paused) vid2.play().catch(() => {});
        } else {
          p2.style.transform = 'translate3d(0, -100%, 0)';
          if (vid2 && !vid2.paused) vid2.pause();
        }
      }

      // Panel 3: Offline statt hochgeladen (Interview startet ab Sekunde 4)
      const p3 = panels[3];
      if (p3) {
        const vid3 = p3.querySelector('video');
        const wrap3 = p3.querySelector('.film-video-wrap');
        if (progress < 2.15) {
          p3.style.transform = 'translate3d(0, 100%, 0)';
          if (vid3 && !vid3.paused) vid3.pause();
          if (progress < 2.0 && vid3 && vid3.currentTime < 4) {
            vid3.currentTime = 4;
          }
        } else {
          // Pre-roll (from 2.15) & Arriving over Panel 2 and resting
          p3.style.transform = `translate3d(0, ${((1 - s23) * 100).toFixed(2)}%, 0)`;
          p3.style.opacity = '1';
          if (wrap3) wrap3.style.transform = `translate3d(0, ${((1 - s23) * -15).toFixed(2)}%, 0)`;
          if (vid3) {
            if (vid3.currentTime < 4) vid3.currentTime = 4;
            if (vid3.paused) vid3.play().catch(() => {});
          }
        }
      }

      syncActiveFilmUI(activeIdx);

      // Magnetic Snapping (Einrasten bei Pause an einem der 4 Ruhepunkte)
      if (!isProgrammaticSnap) {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(checkAndSnapToRestingPoint, 200);
      }
    }

    // Helper: Snaps smoothly to nearest video resting position when user finishes scrolling
    function checkAndSnapToRestingPoint() {
      const stageRect = stage.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalScrollable = stageRect.height - windowH;
      if (totalScrollable <= 0) return;

      // Only snap if currently inside the film showcase section
      // (avoid snapping if user scrolled past into adjacent sections)
      if (stageRect.top > 60 || stageRect.bottom < windowH - 60) {
        return;
      }

      const scrolledInto = -stageRect.top;
      const rawProgress = (scrolledInto / totalScrollable) * 3;
      const progress = Math.max(0, Math.min(3, rawProgress));

      // Calculate nearest resting index: 0, 1, 2, 3
      const nearestIdx = Math.round(progress);

      const stageTop = stage.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      const targetScroll = stageTop + (nearestIdx / 3) * totalScrollable;
      const currentScroll = window.scrollY || window.pageYOffset || (lenis ? lenis.scroll : 0) || 0;

      // Only perform magnetic snap if not already at the resting point
      const scrollDiff = Math.abs(currentScroll - targetScroll);
      if (scrollDiff > 14) {
        isProgrammaticSnap = true;
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(targetScroll, {
            duration: 0.65,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            onComplete: () => {
              isProgrammaticSnap = false;
            }
          });
          // Fallback reset in case onComplete isn't fired
          setTimeout(() => { isProgrammaticSnap = false; }, 750);
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          setTimeout(() => { isProgrammaticSnap = false; }, 500);
        }
      }
    }

    // Global Audio Button listener
    if (globalAudioBtn) {
      globalAudioBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const activeVideo = document.getElementById(`film-video-${activeFilmIndex}`);
        if (!activeVideo) return;

        const willMute = !activeVideo.muted;
        activeVideo.muted = willMute;

        if (willMute) {
          globalAudioBtn.classList.add('is-muted');
          globalAudioBtn.setAttribute('aria-label', 'Ton einschalten');
          globalAudioBtn.setAttribute('title', 'Ton einschalten');
        } else {
          document.querySelectorAll('video').forEach((v) => {
            if (v !== activeVideo && v.id !== 'modal-video') {
              v.muted = true;
            }
          });
          document.querySelectorAll('.video-audio-toggle').forEach((b) => {
            if (b !== globalAudioBtn) {
              b.classList.add('is-muted');
              b.setAttribute('aria-label', 'Ton einschalten');
            }
          });

          activeVideo.volume = 1.0;
          activeVideo.play().catch(() => {});
          globalAudioBtn.classList.remove('is-muted');
          globalAudioBtn.setAttribute('aria-label', 'Stummschalten');
          globalAudioBtn.setAttribute('title', 'Stummschalten');
        }
      });
    }

    // Cinema Lightbox Button listener
    if (cinemaOpenBtn) {
      cinemaOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof openCinemaModal === 'function') {
          openCinemaModal(cinemaOpenBtn);
        }
      });
    }

    // Stills Lightbox Trigger listener (Schattenwolf)
    const schattenwolfStill1 = document.getElementById('schattenwolf-still-1');
    if (stillsToggle && schattenwolfStill1) {
      stillsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        schattenwolfStill1.click();
      });
    }

    // Dots Click Navigation
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(dot.getAttribute('data-dot-index'), 10);
        const stageTop = stage.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
        const windowH = window.innerHeight;
        const totalScrollable = stage.offsetHeight - windowH;
        const targetScroll = stageTop + (targetIdx / 3) * totalScrollable;

        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(targetScroll, { duration: 1.1 });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
    });

    // Initial setup
    syncActiveFilmUI(0);
    updateFilmParallax();
    window.addEventListener('resize', updateFilmParallax, { passive: true });

    return updateFilmParallax;
  }

  // Initialize Fullscreen Vertical Film Parallax Showcase
  updateFilmParallax = initFilmVerticalParallax();

  // --------------------------------------------------------------------------
  // 5. Photography Ceramic 360 Strip Engine
  // --------------------------------------------------------------------------

  function initCeramicShowcase() {
    const strip = document.getElementById('ceramic-strip');
    if (!strip) return;

    const prevBtn = document.getElementById('ceramic-btn-prev');
    const nextBtn = document.getElementById('ceramic-btn-next');
    const counterIdx = document.getElementById('ceramic-current-idx');
    const progressBar = document.getElementById('ceramic-progress-bar');
    const frames = Array.from(strip.querySelectorAll('.ceramic-frame'));

    let isDown = false;
    let hasDragged = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let downPageX = 0;
    let downPageY = 0;

    function updateControls() {
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      const currentScroll = strip.scrollLeft;

      if (prevBtn) prevBtn.classList.toggle('is-disabled', currentScroll <= 4);
      if (nextBtn) nextBtn.classList.toggle('is-disabled', currentScroll >= maxScroll - 4);

      if (progressBar && maxScroll > 0) {
        const progress = Math.min(1, Math.max(0, currentScroll / maxScroll));
        progressBar.style.transform = `translateX(${progress * 1200}%)`;
      }

      if (counterIdx && frames.length > 0) {
        const stripLeft = strip.getBoundingClientRect().left;
        let activeIdx = 0;
        let minDiff = Infinity;

        frames.forEach((frame, idx) => {
          const frameLeft = frame.getBoundingClientRect().left;
          const diff = Math.abs(frameLeft - stripLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = idx;
          }
        });

        counterIdx.textContent = String(activeIdx + 1).padStart(2, '0');
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const step = frames[0] ? (frames[0].offsetWidth + 19) * 2 : 560;
        strip.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const step = frames[0] ? (frames[0].offsetWidth + 19) * 2 : 560;
        strip.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    strip.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls, { passive: true });

    // Interactive Scrubber Bar for Ceramic Strip
    const scrubberTrack = progressBar ? progressBar.parentElement : null;
    if (scrubberTrack) {
      let isScrubbing = false;

      function seekToPosition(clientX) {
        const rect = scrubberTrack.getBoundingClientRect();
        if (rect.width <= 0) return;
        const clickX = clientX - rect.left;
        const progress = Math.max(0, Math.min(1, clickX / rect.width));
        const maxScroll = Math.max(1, strip.scrollWidth - strip.clientWidth);
        strip.scrollLeft = progress * maxScroll;
      }

      scrubberTrack.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        isScrubbing = true;
        scrubberTrack.classList.add('is-scrubbing');
        try { scrubberTrack.setPointerCapture(e.pointerId); } catch (_) {}
        seekToPosition(e.clientX);
      });

      scrubberTrack.addEventListener('pointermove', (e) => {
        if (!isScrubbing) return;
        seekToPosition(e.clientX);
      });

      const stopScrub = (e) => {
        if (!isScrubbing) return;
        isScrubbing = false;
        scrubberTrack.classList.remove('is-scrubbing');
        try { if (e && e.pointerId) scrubberTrack.releasePointerCapture(e.pointerId); } catch (_) {}
      };

      scrubberTrack.addEventListener('pointerup', stopScrub);
      scrubberTrack.addEventListener('pointercancel', stopScrub);
    }

    // Drag-to-scroll for mouse
    strip.addEventListener('mousedown', (e) => {
      isDown = true;
      hasDragged = false;
      downPageX = e.pageX;
      downPageY = e.pageY;
      startX = e.pageX - strip.offsetLeft;
      scrollLeftStart = strip.scrollLeft;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - strip.offsetLeft;
      const walk = x - startX;
      const dist = Math.hypot(e.pageX - downPageX, e.pageY - downPageY);
      if (dist > 14) {
        hasDragged = true;
        strip.classList.add('is-dragging');
      }
      if (hasDragged) {
        strip.scrollLeft = scrollLeftStart - walk;
      }
    });

    function endDrag(e) {
      if (!isDown) return;
      isDown = false;
      strip.classList.remove('is-dragging');
      const currentX = e ? e.pageX : downPageX;
      const currentY = e ? e.pageY : downPageY;
      const totalDist = Math.hypot(currentX - downPageX, currentY - downPageY);
      if (totalDist <= 12) {
        hasDragged = false;
      } else {
        setTimeout(() => { hasDragged = false; }, 80);
      }
    }

    window.addEventListener('mouseup', endDrag);

    // Dedicated click on ceramic-frame
    frames.forEach((frame) => {
      frame.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        openCinemaModal(frame);
      });
    });

    updateControls();
    setTimeout(updateControls, 300);
  }

  initCeramicShowcase();

  // --------------------------------------------------------------------------
  // 6. Native Borderless Document Reader (100% Acrobat-Free, Zero Blue Tones)
  // --------------------------------------------------------------------------
  const uniTabs = document.querySelectorAll('.uni-project-tab');
  const docActiveTitle = document.getElementById('doc-active-title');
  const docActiveSubtitle = document.getElementById('doc-active-subtitle');
  const docPageControls = document.getElementById('doc-page-controls');
  const docBtnPrev = document.getElementById('doc-btn-prev');
  const docBtnNext = document.getElementById('doc-btn-next');
  const docCurrPage = document.getElementById('doc-current-page');
  const docTotalPages = document.getElementById('doc-total-pages');
  const docFullscreenTrigger = document.getElementById('doc-fullscreen-trigger');
  const docDownloadLink = document.getElementById('doc-download-link');
  const docFloatingPrev = document.getElementById('doc-floating-prev');
  const docFloatingNext = document.getElementById('doc-floating-next');
  const docPageDisplay = document.getElementById('doc-page-display');
  const docImgA = document.getElementById('doc-page-img-a');
  const docImgB = document.getElementById('doc-page-img-b');
  const docLongboardDisplay = document.getElementById('doc-longboard-display');
  const docLongboardImage = document.getElementById('doc-longboard-image');

  let currentDocKey = 'layout';
  let currentDocPageIndex = 0;
  let activeImgLayer = 'a'; // 'a' or 'b'
  let currentDocSrc = 'assets/docs/layout/page_1.webp';

  // Smooth optical crossfade between document pages (0.38s ease, identical to MagicFlow)
  function crossfadeDocImage(newSrc) {
    if (!newSrc || !docImgA || !docImgB) return;
    if (docPageDisplay) docPageDisplay.classList.remove('media-loaded', 'media-loading');
    if (newSrc === currentDocSrc) return;

    currentDocSrc = newSrc;

    const incoming = activeImgLayer === 'a' ? docImgB : docImgA;
    const outgoing = activeImgLayer === 'a' ? docImgA : docImgB;

    activeImgLayer = activeImgLayer === 'a' ? 'b' : 'a';

    const executeFade = () => {
      incoming.src = newSrc;
      void incoming.offsetWidth;
      incoming.classList.add('doc-page-img-active');
      outgoing.classList.remove('doc-page-img-active');
    };

    const preloader = new Image();
    preloader.src = newSrc;
    if (preloader.complete) {
      executeFade();
    } else {
      preloader.onload = executeFade;
      preloader.onerror = executeFade;
      setTimeout(executeFade, 100);
    }
  }

  function padNumber(num) {
    return num < 10 ? '0' + num : '' + num;
  }

  function renderDocPage(pageIndex) {
    const doc = DOC_REGISTRY[currentDocKey];
    if (!doc) return;

    if (doc.isLongBoard) {
      if (docPageDisplay) docPageDisplay.classList.add('is-hidden');
      if (docLongboardDisplay) {
        docLongboardDisplay.classList.remove('is-hidden');
        docLongboardDisplay.scrollTop = 0;
      }
      if (docFloatingPrev) docFloatingPrev.style.display = 'none';
      if (docFloatingNext) docFloatingNext.style.display = 'none';
      if (docBtnPrev) docBtnPrev.classList.add('is-disabled');
      if (docBtnNext) docBtnNext.classList.add('is-disabled');
      if (docCurrPage) docCurrPage.textContent = '01';
      if (docTotalPages) docTotalPages.textContent = '01';
      return;
    }

    if (docLongboardDisplay) docLongboardDisplay.classList.add('is-hidden');
    if (docPageDisplay) docPageDisplay.classList.remove('is-hidden');

    if (pageIndex < 0) pageIndex = 0;
    if (pageIndex >= doc.pages.length) pageIndex = doc.pages.length - 1;
    currentDocPageIndex = pageIndex;

    // Smooth optical crossfade between pages / documents
    crossfadeDocImage(doc.pages[currentDocPageIndex]);

    // Update counters if present
    if (docCurrPage) docCurrPage.textContent = padNumber(currentDocPageIndex + 1);
    if (docTotalPages) docTotalPages.textContent = padNumber(doc.pages.length);

    // Update button states
    const isAtStart = currentDocPageIndex === 0;
    const isAtEnd = currentDocPageIndex === doc.pages.length - 1;

    if (docBtnPrev) docBtnPrev.classList.toggle('is-disabled', isAtStart);
    if (docBtnNext) docBtnNext.classList.toggle('is-disabled', isAtEnd);
    if (docFloatingPrev) {
      docFloatingPrev.style.display = 'flex';
      docFloatingPrev.classList.toggle('is-disabled', isAtStart);
    }
    if (docFloatingNext) {
      docFloatingNext.style.display = 'flex';
      docFloatingNext.classList.toggle('is-disabled', isAtEnd);
    }

    // Update work__dots slide indicators
    const docDotsWrap = document.getElementById('doc-work-dots');
    if (docDotsWrap) {
      const dots = docDotsWrap.querySelectorAll('.work__dot');
      dots.forEach((dot, idx) => {
        const isActive = idx === currentDocPageIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }
  }

  function rebuildDocViewer(docKey) {
    currentDocKey = docKey;
    currentDocPageIndex = 0;
    const doc = DOC_REGISTRY[docKey];
    if (!doc) return;

    // Preload document pages for immediate zero-latency crossfading
    if (doc.pages && doc.pages.length) {
      doc.pages.forEach((pageUrl) => {
        const img = new Image();
        img.src = pageUrl;
      });
    }

    // Header info if still in DOM
    if (docActiveTitle) docActiveTitle.textContent = doc.title;
    if (docActiveSubtitle) docActiveSubtitle.textContent = doc.subtitle;

    // Download button if still in DOM
    if (docDownloadLink) {
      docDownloadLink.href = doc.pdfSrc;
      docDownloadLink.setAttribute('download', doc.downloadName);
    }

    // Build work__dots slide indicators
    const docDotsWrap = document.getElementById('doc-work-dots');
    if (docDotsWrap) {
      docDotsWrap.innerHTML = '';
      if (!doc.isLongBoard && doc.pages.length > 1) {
        docDotsWrap.style.visibility = 'visible';
        docDotsWrap.style.opacity = '1';
        docDotsWrap.style.pointerEvents = 'auto';
        doc.pages.forEach((_, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'work__dot' + (idx === 0 ? ' is-active' : '');
          btn.setAttribute('aria-label', `Go to slide ${idx + 1} of ${doc.pages.length}`);
          btn.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            renderDocPage(idx);
          });
          docDotsWrap.appendChild(btn);
        });
      } else {
        docDotsWrap.style.visibility = 'hidden';
        docDotsWrap.style.opacity = '0';
        docDotsWrap.style.pointerEvents = 'none';
      }
    }

    renderDocPage(0);
  }

  // Prev / Next button listeners
  if (docBtnPrev) {
    docBtnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      renderDocPage(currentDocPageIndex - 1);
    });
  }
  if (docBtnNext) {
    docBtnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      renderDocPage(currentDocPageIndex + 1);
    });
  }
  if (docFloatingPrev) {
    docFloatingPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      renderDocPage(currentDocPageIndex - 1);
    });
  }
  if (docFloatingNext) {
    docFloatingNext.addEventListener('click', (e) => {
      e.stopPropagation();
      renderDocPage(currentDocPageIndex + 1);
    });
  }

  // Fullscreen trigger and direct click on document page -> Opens Cinema Modal
  if (docFullscreenTrigger) {
    docFullscreenTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openCinemaDoc(currentDocKey, currentDocPageIndex);
    });
  }
  if (docPageDisplay) {
    docPageDisplay.addEventListener('click', () => {
      openCinemaDoc(currentDocKey, currentDocPageIndex);
    });
  }
  if (docLongboardDisplay) {
    let isLongboardDragging = false;
    let longboardStartY = 0;
    let longboardScrollTopStart = 0;
    let longboardHasDragged = false;

    // Direct mouse wheel scrolling (prevents Lenis window hijack, but allows page scroll at boundaries)
    docLongboardDisplay.addEventListener('wheel', (e) => {
      const isAtTop = docLongboardDisplay.scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = docLongboardDisplay.scrollTop + docLongboardDisplay.clientHeight >= docLongboardDisplay.scrollHeight && e.deltaY > 0;
      
      // If we are scrolling out of bounds, let the event bubble to scroll the main page
      if (isAtTop || isAtBottom) {
        return; 
      }
      
      // Otherwise, scroll the longboard and prevent page scroll
      e.stopPropagation();
      docLongboardDisplay.scrollTop += e.deltaY;
      e.preventDefault();
    }, { passive: false });

    // Mouse click-and-drag (grab-to-scroll)
    docLongboardDisplay.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only primary mouse click
      isLongboardDragging = true;
      longboardHasDragged = false;
      longboardStartY = e.clientY;
      longboardScrollTopStart = docLongboardDisplay.scrollTop;
      docLongboardDisplay.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isLongboardDragging || !docLongboardDisplay) return;
      const deltaY = e.clientY - longboardStartY;
      if (Math.abs(deltaY) > 4) {
        longboardHasDragged = true;
      }
      docLongboardDisplay.scrollTop = longboardScrollTopStart - deltaY;
    });

    window.addEventListener('mouseup', () => {
      if (isLongboardDragging) {
        isLongboardDragging = false;
        if (docLongboardDisplay) {
          docLongboardDisplay.classList.remove('is-dragging');
        }
      }
    });

    // Only open Cinema Lightbox on static click (not after dragging)
    docLongboardDisplay.addEventListener('click', (e) => {
      if (longboardHasDragged) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      openCinemaDoc(currentDocKey, 0);
    });
  }

  // Apple-Inspired Interactive Document Explorer & Accordion Controls
  const controlItems = Array.from(document.querySelectorAll('.uni-controls-panel .control-item, .uni-project-tab'));
  const paddlePrev = document.getElementById('doc-paddlenav-prev');
  const paddleNext = document.getElementById('doc-paddlenav-next');

  function updatePaddleNav(activeIndex) {
    if (paddlePrev) paddlePrev.classList.toggle('is-disabled', activeIndex <= 0);
    if (paddleNext) paddleNext.classList.toggle('is-disabled', activeIndex >= controlItems.length - 1);
  }

  function setActiveDocItem(targetIndex) {
    if (targetIndex < 0 || targetIndex >= controlItems.length) return;
    const activeItem = controlItems[targetIndex];
    const key = activeItem.getAttribute('data-pdf-key');

    controlItems.forEach((item, idx) => {
      const isActive = idx === targetIndex;
      item.classList.toggle('active', isActive);
      const btn = item.querySelector('.control-item-open');
      const content = item.querySelector('.control-item-content');
      if (btn) btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      if (content) content.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    updatePaddleNav(targetIndex);
    rebuildDocViewer(key);
  }

  controlItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      // Don't intercept clicks on download links
      if (e.target.closest('.control-dossier-link')) return;
      
      const uniSection = document.getElementById('uni');
      if (uniSection && window.innerWidth > 1024) {
        const top = uniSection.getBoundingClientRect().top + window.scrollY;
        const targetScroll = top + ((index + 0.1) / controlItems.length) * (uniSection.offsetHeight - window.innerHeight);
        if (typeof lenis !== 'undefined' && lenis) {
           lenis.scrollTo(targetScroll, { duration: 1.0 });
        } else {
           window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      } else {
        setActiveDocItem(index);
      }
    });
  });

  if (paddlePrev) {
    paddlePrev.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
      if (currentIndex > 0) {
        controlItems[currentIndex - 1].click();
      }
    });
  }

  if (paddleNext) {
    paddleNext.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
      if (currentIndex >= 0 && currentIndex < controlItems.length - 1) {
        controlItems[currentIndex + 1].click();
      }
    });
  }

  // Initialize with layout
  setActiveDocItem(0);

  // Scroll-Driven Accordion Logic
  const uniSection = document.getElementById('uni');
  if (uniSection) {
    function updateUniScroll() {
      const rect = uniSection.getBoundingClientRect();
      const start = 0;
      const end = rect.height - window.innerHeight;
      const scrolled = -rect.top;

      if (window.innerWidth > 1024) {
        if (scrolled >= 0 && scrolled <= end && end > 0) {
          let progress = scrolled / end;
          let numItems = controlItems.length;
          let index = Math.floor(progress * numItems);
          if (index >= numItems) index = numItems - 1;
          
          const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
          if (currentIndex !== index) {
            setActiveDocItem(index);
          }
        } else if (scrolled < 0) {
          const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
          if (currentIndex !== 0) setActiveDocItem(0);
        } else if (scrolled > end && end > 0) {
          const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
          if (currentIndex !== controlItems.length - 1) setActiveDocItem(controlItems.length - 1);
        }
      }
    }
    
    window.addEventListener('scroll', updateUniScroll, { passive: true });
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.on('scroll', updateUniScroll);
    }
    updateUniScroll();
  }

  // Background idle preloading of all document pages for instantaneous crossfading
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      Object.keys(DOC_REGISTRY).forEach((k) => {
        const d = DOC_REGISTRY[k];
        if (d && d.pages) {
          d.pages.forEach((p) => { const im = new Image(); im.src = p; });
        }
      });
    });
  } else {
    setTimeout(() => {
      Object.keys(DOC_REGISTRY).forEach((k) => {
        const d = DOC_REGISTRY[k];
        if (d && d.pages) {
          d.pages.forEach((p) => { const im = new Image(); im.src = p; });
        }
      });
    }, 1200);
  }

  // --------------------------------------------------------------------------
  // 7. Video Audio Toggle Controller (Muted by default, one active audio at a time)
  // --------------------------------------------------------------------------
  const audioToggleBtns = document.querySelectorAll('.video-audio-toggle');

  audioToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Avoid triggering lightbox modal

      // Find the associated video in this container
      const parentContainer = btn.closest('.cinematic-hero-player, .film-preview-box, .cgi-card-half, .cgi-card-full, .cgi-card-wide, .cgi-main-media, .motion-video-frame');
      if (!parentContainer) return;

      const targetVideo = parentContainer.querySelector('video');
      if (!targetVideo) return;

      const isCurrentlyMuted = targetVideo.muted;

      if (isCurrentlyMuted) {
        // Mute all other videos on the page
        document.querySelectorAll('video').forEach((v) => {
          if (v !== targetVideo && v.id !== 'modal-video') {
            v.muted = true;
          }
        });

        // Reset all other audio buttons to muted state
        audioToggleBtns.forEach((b) => {
          if (b !== btn) {
            b.classList.add('is-muted');
            b.setAttribute('aria-label', 'Ton einschalten');
            b.setAttribute('title', 'Ton einschalten');
            const lbl = b.querySelector('.audio-label');
            if (lbl) lbl.textContent = 'Ton aus';
          }
        });

        // Unmute target video
        targetVideo.muted = false;
        targetVideo.volume = 1.0;
        const p = targetVideo.play();
        if (p !== undefined) p.catch(() => {});

        btn.classList.remove('is-muted');
        btn.setAttribute('aria-label', 'Stummschalten');
        btn.setAttribute('title', 'Stummschalten');
        const lbl = btn.querySelector('.audio-label');
        if (lbl) lbl.textContent = 'Ton an';
      } else {
        // Mute target video
        targetVideo.muted = true;

        btn.classList.add('is-muted');
        btn.setAttribute('aria-label', 'Ton einschalten');
        btn.setAttribute('title', 'Ton einschalten');
        const lbl = btn.querySelector('.audio-label');
        if (lbl) lbl.textContent = 'Ton aus';
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCinemaModal);

  if (modalPrev) {
    modalPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      showGalleryItem(activeDocCinema ? activeDocCinema.pageIndex - 1 : currentGalleryIndex - 1);
    });
  }

  if (modalNext) {
    modalNext.addEventListener('click', (e) => {
      e.stopPropagation();
      showGalleryItem(activeDocCinema ? activeDocCinema.pageIndex + 1 : currentGalleryIndex + 1);
    });
  }

  if (cinemaModal) {
    cinemaModal.addEventListener('click', (e) => {
      if (e.target === cinemaModal) closeCinemaModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!cinemaModal || !cinemaModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeCinemaModal();
    else if (e.key === 'ArrowLeft') {
      if (activeDocCinema) showGalleryItem(activeDocCinema.pageIndex - 1);
      else if (currentGallery.length > 1) showGalleryItem(currentGalleryIndex - 1);
    }
    else if (e.key === 'ArrowRight') {
      if (activeDocCinema) showGalleryItem(activeDocCinema.pageIndex + 1);
      else if (currentGallery.length > 1) showGalleryItem(currentGalleryIndex + 1);
    }
  });

  // --------------------------------------------------------------------------
  // 4b. Horizontal Stills Strip Navigation Arrows, Smooth Scrolling & Slide Dots
  // --------------------------------------------------------------------------
  document.querySelectorAll('.stills-strip-wrap').forEach((wrap) => {
    const strip = wrap.querySelector('.stills-strip');
    const prevBtn = wrap.querySelector('.strip-arrow-prev');
    const nextBtn = wrap.querySelector('.strip-arrow-next');
    const dotsWrap = wrap.querySelector('.work__dots');
    const cards = Array.from(strip ? strip.querySelectorAll('.still-card') : []);

    if (!strip) return;

    // Connect or build work__dots
    if (dotsWrap && cards.length > 0) {
      let dotButtons = Array.from(dotsWrap.querySelectorAll('.work__dot'));
      if (dotButtons.length === 0) {
        dotsWrap.innerHTML = '';
        cards.forEach((_, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'work__dot' + (idx === 0 ? ' is-active' : '');
          btn.setAttribute('aria-label', `Go to slide ${idx + 1} of ${cards.length}`);
          btn.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
          dotsWrap.appendChild(btn);
        });
        dotButtons = Array.from(dotsWrap.querySelectorAll('.work__dot'));
      }

      dotButtons.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          if (cards[idx]) {
            const targetLeft = cards[idx].offsetLeft - strip.offsetLeft;
            strip.scrollTo({ left: targetLeft, behavior: 'smooth' });
          }
        });
      });
    }

    function updateArrowVisibility() {
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      const currentScroll = strip.scrollLeft;

      if (prevBtn) prevBtn.classList.toggle('is-disabled', currentScroll <= 6);
      if (nextBtn) nextBtn.classList.toggle('is-disabled', currentScroll >= maxScroll - 6);

      if (dotsWrap && cards.length > 0) {
        const dotButtons = dotsWrap.querySelectorAll('.work__dot');
        const stripLeft = strip.getBoundingClientRect().left;
        let activeIdx = 0;
        let minDiff = Infinity;

        cards.forEach((card, idx) => {
          const cardLeft = card.getBoundingClientRect().left;
          const diff = Math.abs(cardLeft - stripLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = idx;
          }
        });

        dotButtons.forEach((dot, idx) => {
          const isActive = idx === activeIdx;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const firstCard = strip.querySelector('.still-card');
        const step = firstCard ? (firstCard.offsetWidth + 26) * 1.5 : 420;
        strip.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const firstCard = strip.querySelector('.still-card');
        const step = firstCard ? (firstCard.offsetWidth + 26) * 1.5 : 420;
        strip.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    strip.addEventListener('scroll', updateArrowVisibility, { passive: true });
    window.addEventListener('resize', updateArrowVisibility, { passive: true });

    // Initial state check
    updateArrowVisibility();
    setTimeout(updateArrowVisibility, 300);
    setTimeout(updateArrowVisibility, 1000);
  });

  // --------------------------------------------------------------------------
  // 4c. Reusable Horizontal Parallax Showcase Engine (Smooth Drag, Swipe & Parallax)
  // --------------------------------------------------------------------------
  function initParallaxCarousel({
    viewportId,
    trackId,
    prevId,
    nextId,
    currentId,
    totalId,
    scrubberId,
    dotsId
  }) {
    const viewport = document.getElementById(viewportId);
    const track = document.getElementById(trackId);
    if (!viewport || !track) return null;

    const cards = Array.from(track.querySelectorAll('.cgi-parallax-card'));
    if (cards.length === 0) return null;

    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const currentNum = document.getElementById(currentId);
    const totalNum = document.getElementById(totalId);
    const scrubberBar = document.getElementById(scrubberId);
    const dotsWrap = dotsId ? document.getElementById(dotsId) : null;

    if (totalNum) {
      totalNum.textContent = String(cards.length).padStart(2, '0');
    }

    // Build work__dots if present
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      cards.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'work__dot' + (idx === 0 ? ' is-active' : '');
        btn.setAttribute('aria-label', `Go to slide ${idx + 1} of ${cards.length}`);
        btn.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetLeft = cards[idx].offsetLeft - track.offsetLeft;
          viewport.scrollTo({ left: targetLeft, behavior: 'smooth' });
        });
        dotsWrap.appendChild(btn);
      });
    }

    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let hasDragged = false;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumRafId = null;
    let ticking = false;

    // Pre-cache card offsets and widths to eliminate all layout thrashing during scroll
    let cardLayout = [];
    function measureCards() {
      const trackOffset = track.offsetLeft;
      cardLayout = cards.map((card) => {
        const media = card.querySelector('.cgi-parallax-media');
        const offsetLeft = card.offsetLeft - trackOffset;
        const width = card.offsetWidth;
        return {
          card,
          media,
          center: offsetLeft + width / 2,
          width
        };
      });
    }
    measureCards();

    // High-performance, zero-latency optical parallax calculation
    function updateParallaxAndUI() {
      ticking = false;
      const scrollLeft = viewport.scrollLeft;
      const viewportWidth = viewport.clientWidth;
      const viewportCenter = scrollLeft + viewportWidth / 2;
      const maxScroll = Math.max(1, viewport.scrollWidth - viewportWidth);

      // 1. Scrubber bar update
      if (scrubberBar) {
        const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
        const barWidthPct = Math.max(8, 100 / cards.length);
        const maxOffsetPct = 100 - barWidthPct;
        scrubberBar.style.width = `${barWidthPct}%`;
        scrubberBar.style.transform = `translate3d(${progress * maxOffsetPct * (100 / barWidthPct)}%, 0, 0)`;
      }

      // 2. Button states
      if (prevBtn) {
        prevBtn.classList.toggle('is-disabled', scrollLeft <= 8);
      }
      if (nextBtn) {
        nextBtn.classList.toggle('is-disabled', scrollLeft >= maxScroll - 8);
      }

      // 3. Instant optical counter-parallax & active card detection (pure arithmetic, 0ms latency)
      let closestCardIndex = 0;
      let minDistance = Infinity;
      const halfViewport = viewportWidth / 2;

      for (let i = 0; i < cardLayout.length; i++) {
        const item = cardLayout[i];
        const distToCenter = item.center - viewportCenter;
        const absDist = Math.abs(distToCenter);

        if (absDist < minDistance) {
          minDistance = absDist;
          closestCardIndex = i;
        }

        // Only transform cards currently in or immediately adjacent to the viewport
        if (absDist <= halfViewport + item.width / 2 + 100) {
          const normDist = distToCenter / halfViewport;
          const clampedNorm = Math.max(-1.3, Math.min(1.3, normDist));
          const shiftPct = -clampedNorm * 16;

          if (item.media) {
            item.media.style.transform = `translate3d(${shiftPct.toFixed(2)}%, 0, 0)`;
          }
        }
      }

      if (currentNum) {
        currentNum.textContent = String(closestCardIndex + 1).padStart(2, '0');
      }

      // 4. Update dots
      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll('.work__dot');
        dots.forEach((dot, idx) => {
          const isActive = idx === closestCardIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }
    }

    function requestUpdate() {
      if (!ticking) {
        requestAnimationFrame(updateParallaxAndUI);
        ticking = true;
      }
    }

    // Scroll & Resize listeners
    viewport.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => {
      measureCards();
      requestUpdate();
    }, { passive: true });

    // Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = cards[0];
        const step = card ? card.offsetWidth + 32 : 440;
        viewport.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = cards[0];
        const step = card ? card.offsetWidth + 32 : 440;
        viewport.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    // Momentum Inertia
    function stopMomentum() {
      if (momentumRafId) {
        cancelAnimationFrame(momentumRafId);
        momentumRafId = null;
      }
    }

    function startMomentum() {
      let currentVelocity = velocity * 14;
      function momentumStep() {
        if (Math.abs(currentVelocity) < 0.3) {
          momentumRafId = null;
          return;
        }
        const prevScroll = viewport.scrollLeft;
        viewport.scrollLeft -= currentVelocity;
        if (viewport.scrollLeft === prevScroll) {
          momentumRafId = null;
          return;
        }
        updateParallaxAndUI();
        currentVelocity *= 0.93;
        momentumRafId = requestAnimationFrame(momentumStep);
      }
      momentumRafId = requestAnimationFrame(momentumStep);
    }

    // Mouse Drag events
    let downPageX = 0;
    let downPageY = 0;

    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.video-audio-toggle, button, a, .work__dot')) return;
      isDown = true;
      hasDragged = false;
      stopMomentum();
      downPageX = e.pageX;
      downPageY = e.pageY;
      startX = e.pageX - viewport.offsetLeft;
      scrollLeftStart = viewport.scrollLeft;
      lastX = e.pageX;
      lastTime = performance.now();
      velocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - viewport.offsetLeft;
      const walk = x - startX;
      const dist = Math.hypot(e.pageX - downPageX, e.pageY - downPageY);
      
      // Intentional drag threshold: > 12px
      if (dist > 12) {
        hasDragged = true;
        viewport.classList.add('is-dragging');
      }
      if (hasDragged) {
        viewport.scrollLeft = scrollLeftStart - walk;
        updateParallaxAndUI();
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 10) {
          velocity = (e.pageX - lastX) / dt;
          lastX = e.pageX;
          lastTime = now;
        }
      }
    });

    function endDrag(e) {
      if (!isDown) return;
      isDown = false;
      viewport.classList.remove('is-dragging');

      const currentX = e ? e.pageX : lastX;
      const currentY = e ? e.pageY : downPageY;
      const totalDist = Math.hypot(currentX - downPageX, currentY - downPageY);

      if (totalDist <= 12) {
        hasDragged = false;
      } else if (hasDragged && Math.abs(velocity) > 0.12) {
        startMomentum();
        setTimeout(() => {
          hasDragged = false;
        }, 120);
      } else {
        setTimeout(() => {
          hasDragged = false;
        }, 120);
      }
    }

    window.addEventListener('mouseup', endDrag);

    // Touch Swipe events
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastX = 0;
    let touchLastY = 0;

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      stopMomentum();
      isDown = true;
      hasDragged = false;
      touchStartX = e.touches[0].pageX;
      touchStartY = e.touches[0].pageY;
      touchLastX = touchStartX;
      touchLastY = touchStartY;
      scrollLeftStart = viewport.scrollLeft;
      lastX = touchStartX;
      lastTime = performance.now();
      velocity = 0;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (!isDown || e.touches.length !== 1) return;
      const currentTouchX = e.touches[0].pageX;
      const currentTouchY = e.touches[0].pageY;
      touchLastX = currentTouchX;
      touchLastY = currentTouchY;
      const diffX = currentTouchX - touchStartX;
      const totalTouchDist = Math.hypot(currentTouchX - touchStartX, currentTouchY - touchStartY);

      if (totalTouchDist > 12) {
        hasDragged = true;
        viewport.classList.add('is-dragging');
      }
      if (hasDragged) {
        viewport.scrollLeft = scrollLeftStart - diffX;
        updateParallaxAndUI();
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 10) {
          velocity = (currentTouchX - lastX) / dt;
          lastX = currentTouchX;
          lastTime = now;
        }
      }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      if (!isDown) return;
      isDown = false;
      viewport.classList.remove('is-dragging');
      const totalDist = Math.hypot(touchLastX - touchStartX, touchLastY - touchStartY);
      if (totalDist <= 12) {
        hasDragged = false;
      } else if (hasDragged && Math.abs(velocity) > 0.15) {
        startMomentum();
        setTimeout(() => {
          hasDragged = false;
        }, 120);
      } else {
        setTimeout(() => {
          hasDragged = false;
        }, 120);
      }
    }, { passive: true });

    // Dedicated Click Handler for Parallax Cards
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.video-audio-toggle, button, a, .work__dot')) {
          return;
        }
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        openCinemaModal(card);
      });
    });

    // Interactive Scrubber Bar: Click or Drag to scroll through 3D & CGI images
    const scrubberTrack = scrubberBar ? scrubberBar.parentElement : null;
    if (scrubberTrack) {
      let isScrubbing = false;

      function seekToPosition(clientX, smooth = false) {
        const rect = scrubberTrack.getBoundingClientRect();
        if (rect.width <= 0) return;
        const clickX = clientX - rect.left;
        const progress = Math.max(0, Math.min(1, clickX / rect.width));
        const maxScroll = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
        const targetScroll = progress * maxScroll;
        if (smooth) {
          viewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
        } else {
          viewport.scrollLeft = targetScroll;
          updateParallaxAndUI();
        }
      }

      scrubberTrack.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        isScrubbing = true;
        scrubberTrack.classList.add('is-scrubbing');
        stopMomentum();
        try {
          scrubberTrack.setPointerCapture(e.pointerId);
        } catch (_) {}
        seekToPosition(e.clientX, false);
      });

      scrubberTrack.addEventListener('pointermove', (e) => {
        if (!isScrubbing) return;
        seekToPosition(e.clientX, false);
      });

      function stopScrub(e) {
        if (!isScrubbing) return;
        isScrubbing = false;
        scrubberTrack.classList.remove('is-scrubbing');
        try {
          if (e && e.pointerId) {
            scrubberTrack.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}
      }

      scrubberTrack.addEventListener('pointerup', stopScrub);
      scrubberTrack.addEventListener('pointercancel', stopScrub);
    }

    // Initial calculations
    setTimeout(() => {
      measureCards();
      updateParallaxAndUI();
    }, 50);
    setTimeout(() => {
      measureCards();
      updateParallaxAndUI();
    }, 300);
    setTimeout(() => {
      measureCards();
      updateParallaxAndUI();
    }, 1200);

    return updateParallaxAndUI;
  }

  // Initialize CGI Parallax Showcase
  updateCgiParallax = initParallaxCarousel({
    viewportId: 'cgi-parallax-viewport',
    trackId: 'cgi-parallax-track',
    prevId: 'cgi-parallax-prev',
    nextId: 'cgi-parallax-next',
    currentId: 'cgi-parallax-current',
    totalId: 'cgi-parallax-total',
    scrubberId: 'cgi-parallax-scrubber-bar',
    dotsId: 'cgi-parallax-dots'
  });

  // Kunst Ticker: Seamless Click & Lightbox Integration (Supports cloned cards)
  document.querySelectorAll('.kunst-ticker-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cloneTargetId = card.getAttribute('data-clone-of');
      const target = cloneTargetId ? document.getElementById(cloneTargetId) : card;
      if (typeof openCinemaModal === 'function') {
        openCinemaModal(target || card);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4d. Kaserne Before / After Comparison Slider (Fotoreferenz vs. 3D-CGI)
  // --------------------------------------------------------------------------
  function initBeforeAfterSlider() {
    const slider = document.getElementById('kaserne-compare-slider');
    if (!slider) return;

    let isDragging = false;

    function setPosition(xPos) {
      const rect = slider.getBoundingClientRect();
      const relativeX = xPos - rect.left;
      let percentage = (relativeX / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      slider.style.setProperty('--pos', `${percentage.toFixed(2)}%`);
      slider.setAttribute('aria-valuenow', Math.round(percentage));
    }

    slider.addEventListener('pointerdown', (e) => {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      slider.classList.add('is-dragging');
      setPosition(e.clientX);
    });

    slider.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      setPosition(e.clientX);
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      if (e && e.pointerId && slider.hasPointerCapture(e.pointerId)) {
        slider.releasePointerCapture(e.pointerId);
      }
      slider.classList.remove('is-dragging');
    }

    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);

    // Keyboard support
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-label', 'Vorher-Nachher Bildvergleich Kaserne');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '50');

    slider.addEventListener('keydown', (e) => {
      let currentPos = parseFloat(getComputedStyle(slider).getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        currentPos = Math.max(0, currentPos - 3);
        slider.style.setProperty('--pos', `${currentPos}%`);
        slider.setAttribute('aria-valuenow', Math.round(currentPos));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        currentPos = Math.min(100, currentPos + 3);
        slider.style.setProperty('--pos', `${currentPos}%`);
        slider.setAttribute('aria-valuenow', Math.round(currentPos));
      }
    });

    slider.style.setProperty('--pos', '50%');
  }

  initBeforeAfterSlider();

  // --------------------------------------------------------------------------
  // 5. Ambient Atmosphere Parallax Engine & Continuous Theme Resolver
  // --------------------------------------------------------------------------
  const ambientGlow1 = document.querySelector('.ambient-glow-1');
  const ambientGlow2 = document.querySelector('.ambient-glow-2');
  const ambientGlow3 = document.querySelector('.ambient-glow-3');

  let updateSectionBounds = () => {};

  if (ambientGlow1 || ambientGlow2 || ambientGlow3) {
    let currentScroll = ambientTargetScroll;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    // Zero-DOM boundary cache for instant, silky theme detection during fast scrolls
    let cachedSections = [];
    updateSectionBounds = function() {
      cachedSections = Array.from(document.querySelectorAll('section[id], footer[id]')).map((el) => ({
        id: el.id,
        top: el.offsetTop,
        bottom: el.offsetTop + el.offsetHeight
      }));
    };
    updateSectionBounds();
    window.addEventListener('resize', updateSectionBounds, { passive: true });

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5);
      targetMouseY = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      ambientTargetScroll = window.scrollY || document.documentElement.scrollTop || 0;
    }, { passive: true });

    function updateAmbient(time) {
      // Lerp interpolation for fluid, cinematic responsiveness
      const scrollDiff = ambientTargetScroll - currentScroll;
      if (Math.abs(scrollDiff) > 1000) {
        currentScroll += scrollDiff * 0.25;
      } else {
        currentScroll += scrollDiff * 0.08;
      }

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Real-time active section resolver based on scroll focal line
      if (cachedSections.length > 0) {
        if (ambientTargetScroll < 120 || currentScroll < 120) {
          setAmbientTheme('hero');
        } else {
          const focalPoint = currentScroll + window.innerHeight * 0.38;
          for (let i = 0; i < cachedSections.length; i++) {
            const sec = cachedSections[i];
            if (focalPoint >= sec.top && focalPoint < sec.bottom) {
              setAmbientTheme(sec.id);
              break;
            }
          }
        }
      }

      // Continuous harmonic parallax progression
      const scrollProg = currentScroll * 0.0022;
      const idleFloat = time * 0.0006;

      // Blob 1: Upper-left orbital drift & harmonic breathing
      if (ambientGlow1) {
        const x1 = Math.sin(scrollProg * 0.75 + idleFloat) * 110 + currentMouseX * 35;
        const y1 = Math.cos(scrollProg * 0.65 + idleFloat * 0.8) * 125 + Math.sin(scrollProg * 1.3) * 50 + currentMouseY * 35;
        const s1 = 1.0 + Math.sin(scrollProg * 0.5 + idleFloat * 0.7) * 0.12;
        ambientGlow1.style.transform = `translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) scale(${s1.toFixed(3)})`;
      }

      // Blob 2: Mid-right counter-orbital drift & expansion
      if (ambientGlow2) {
        const x2 = -Math.sin(scrollProg * 0.85 + idleFloat * 0.9) * 120 - currentMouseX * 40;
        const y2 = -Math.cos(scrollProg * 0.7 + idleFloat) * 135 - Math.sin(scrollProg * 1.1) * 65 - currentMouseY * 40;
        const s2 = 1.0 + Math.cos(scrollProg * 0.55 + idleFloat * 0.8) * 0.14;
        ambientGlow2.style.transform = `translate3d(${x2.toFixed(1)}px, ${y2.toFixed(1)}px, 0) scale(${s2.toFixed(3)})`;
      }

      // Blob 3: Lower-center sweeping ambient wave
      if (ambientGlow3) {
        const x3 = Math.cos(scrollProg * 0.95 + idleFloat * 1.1) * 95 + currentMouseX * 28;
        const y3 = Math.sin(scrollProg * 0.75 + idleFloat * 0.9) * 105 - currentMouseY * 28;
        const s3 = 1.0 + Math.sin(scrollProg * 0.65 + idleFloat) * 0.10;
        ambientGlow3.style.transform = `translate3d(${x3.toFixed(1)}px, ${y3.toFixed(1)}px, 0) scale(${s3.toFixed(3)})`;
      }

      requestAnimationFrame(updateAmbient);
    }
    requestAnimationFrame(updateAmbient);
  }

  // --------------------------------------------------------------------------
  // Media Loading Skeleton Shimmer / Shine Effect Controller
  // --------------------------------------------------------------------------
  function initMediaLoadingShine() {
    const selectors = [
      '.still-card',
      '.gallery-item',
      '.cgi-parallax-card',
      '.cgi-main-media',
      '.film-preview-box',
      '.bmw-visual-wrap',
      '.about-portrait-wrap',
      '.photo-card',
      '.ceramic-frame',
      '.kunst-feature-img-frame',
      '.kunst-ticker-card'
    ];

    const mediaWrappers = document.querySelectorAll(selectors.join(', '));

    mediaWrappers.forEach((wrap) => {
      const img = wrap.querySelector('img');
      const video = wrap.querySelector('video');

      if (img) {
        if (img.complete && img.naturalWidth > 0) {
          wrap.classList.remove('media-loading');
          wrap.classList.add('media-loaded');
          img.classList.add('is-loaded');
        } else {
          wrap.classList.add('media-loading');
          wrap.classList.remove('media-loaded');

          const onImgLoad = () => {
            wrap.classList.remove('media-loading');
            wrap.classList.add('media-loaded');
            img.classList.add('is-loaded');
            img.removeEventListener('load', onImgLoad);
            img.removeEventListener('error', onImgLoad);
          };

          img.addEventListener('load', onImgLoad);
          img.addEventListener('error', onImgLoad);
        }
      } else if (video) {
        if (video.readyState >= 2) {
          wrap.classList.remove('media-loading');
          wrap.classList.add('media-loaded');
          video.classList.add('is-loaded');
        } else {
          wrap.classList.add('media-loading');
          wrap.classList.remove('media-loaded');

          const onVideoReady = () => {
            wrap.classList.remove('media-loading');
            wrap.classList.add('media-loaded');
            video.classList.add('is-loaded');
            video.removeEventListener('loadeddata', onVideoReady);
            video.removeEventListener('canplay', onVideoReady);
          };

          video.addEventListener('loadeddata', onVideoReady);
          video.addEventListener('canplay', onVideoReady);
        }
      }
    });
  }

  initMediaLoadingShine();

  // --------------------------------------------------------------------------
  // Contact Form & Mailto Anchor Shield (Prevents browser jump/scroll to top)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form') || document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const subject = contactForm.querySelector('input[name="subject"]')?.value || '';
      const message = contactForm.querySelector('textarea[name="message"]')?.value || '';
      const mailtoUrl = `mailto:tobiasjschreiber@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      
      const currentY = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0);
      
      const tempLink = document.createElement('a');
      tempLink.href = mailtoUrl;
      tempLink.style.display = 'none';
      document.body.appendChild(tempLink);
      tempLink.click();
      
      setTimeout(() => {
        tempLink.remove();
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(currentY, { immediate: true });
        } else {
          window.scrollTo(0, currentY);
        }
      }, 50);
    });
  }

  document.querySelectorAll('a[href^="mailto:"]').forEach((mailLink) => {
    mailLink.addEventListener('click', () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0);
      setTimeout(() => {
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(currentY, { immediate: true });
        } else {
          window.scrollTo(0, currentY);
        }
      }, 50);
    });
  });
});
