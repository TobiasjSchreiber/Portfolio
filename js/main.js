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
    'thd-app': {
      glow1: 'rgba(225, 215, 200, 0.14)',
      glow2: 'rgba(215, 185, 145, 0.13)',
      glow3: 'rgba(150, 140, 130, 0.10)'
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

  const LIGHT_SECTIONS = ['thd-app', 'about', 'kontakt'];

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
    if (typeof updateNavTheme === 'function') {
      updateNavTheme();
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
        initMobileNav();
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

        // Eagerly preload ALL remaining media now that the site is open
        // (removes lazy loading so everything loads immediately in the background)
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
          img.removeAttribute('loading');
        });
        
        // ----------------------------------------------------------------------
        // Intelligent Sequential Video Downloader
        // Läd die Videos brav nacheinander vor, bis jedes ca. 2 Sekunden Puffer hat.
        // Verhindert das 30-Sekunden-Netzwerk-Chaos, lädt aber trotzdem im Hintergrund.
        // ----------------------------------------------------------------------
        const backgroundVideos = Array.from(document.querySelectorAll('video[preload="none"], video[preload="metadata"]'));
        let currentQueueIndex = 0;

        function loadNextVideoInQueue() {
          if (currentQueueIndex >= backgroundVideos.length) return; // Fertig!

          const vid = backgroundVideos[currentQueueIndex];
          currentQueueIndex++;

          // Start the download
          vid.preload = 'auto';

          // Wenn das Video genug Puffer aufgebaut hat (canplay), springen wir sofort zum nächsten!
          // So lädt jedes Video ein paar Sekunden vor, bevor das nächste an der Reihe ist.
          let nextTriggered = false;
          const triggerNext = () => {
            if (nextTriggered) return;
            nextTriggered = true;
            loadNextVideoInQueue();
          };

          if (vid.readyState >= 3) {
            triggerNext();
          } else {
            vid.addEventListener('canplay', triggerNext, { once: true });
            vid.addEventListener('error', triggerNext, { once: true });
            // Fallback: Max 3 Sekunden pro Video in der Warteschlange verweilen
            setTimeout(triggerNext, 3000); 
          }
        }
        
        // Start the queue!
        loadNextVideoInQueue();
      }, 250);
    }, 850);
  }

  // Preloading & Calm Cinematic Animation Driver (Hero + CGI only)
  function startCinematicSequence() {
    // Ensure single hero background video is queued at frame 0 and paused while loading
    if (heroVideo) {
      heroVideo.pause();
      heroVideo.currentTime = 0;
    }

    // 1. Only gather Hero video + CGI section media for the preloader
    const cgiSection = document.getElementById('cgi');
    // Wait ONLY for the absolute essentials: The Hero video, and the immediate top CGI slider images.
    // Deep showcase videos (like Kaserne, BMW) are excluded so they don't block the loading screen.
    const criticalImages = cgiSection ? Array.from(cgiSection.querySelectorAll('img.cgi-parallax-media[src]')) : [];
    const criticalVideos = heroVideo ? [heroVideo] : [];

    const totalMedia = criticalImages.length + criticalVideos.length;
    let loadedMedia = 0;
    const pendingNames = new Set();

    function checkMediaDone(name) {
      if (pendingNames.has(name)) {
        pendingNames.delete(name);
        loadedMedia++;
      }
    }

    criticalImages.forEach((img, i) => {
      // Create a readable name from the URL
      const url = img.currentSrc || img.src || '';
      const name = url ? url.split('/').pop() : `Bild ${i}`;
      pendingNames.add(name);

      // Force the browser to fetch this image immediately!
      // (If we leave loading="lazy", Chrome will NEVER load it because it's off-screen,
      // and our preloader would hang forever waiting for the 'load' event).
      img.removeAttribute('loading');

      if (img.complete) {
        checkMediaDone(name);
      } else {
        img.addEventListener('load', () => checkMediaDone(name), { once: true });
        img.addEventListener('error', () => checkMediaDone(name), { once: true });
      }
    });

    criticalVideos.forEach((vid, i) => {
      const src = vid.querySelector('source') ? vid.querySelector('source').src : (vid.src || '');
      const name = src ? src.split('/').pop() : `Video ${i}`;
      pendingNames.add(name);

      if (vid === heroVideo) {
        let isHeroDone = false;
        const markHeroDone = () => {
          if (isHeroDone) return;
          isHeroDone = true;
          checkMediaDone(name);
        };
        vid.addEventListener('error', markHeroDone, { once: true });
        vid.addEventListener('canplay', () => {
          const buffered = vid.buffered.length > 0 ? vid.buffered.end(0) : 0;
          if (buffered >= 2 || vid.readyState >= 4) markHeroDone();
        });

        // Keep a periodic check as fallback
        let bufferCheckInterval = setInterval(() => {
          const buffered = vid.buffered.length > 0 ? vid.buffered.end(0) : 0;
          if (vid.readyState >= 4 || (vid.readyState >= 3 && buffered >= 2)) {
            clearInterval(bufferCheckInterval);
            markHeroDone();
          }
        }, 500);

        const checkHeroBuffer = () => {
          if (isHeroDone) return;
          const buffered = vid.buffered.length > 0 ? vid.buffered.end(0) : 0;
          if (vid.readyState >= 4 || (vid.readyState >= 3 && buffered >= 2)) {
            clearInterval(bufferCheckInterval);
            markHeroDone();
          } else {
            setTimeout(checkHeroBuffer, 100);
          }
        };
        checkHeroBuffer();
        
      } else {
        // Standard CGI preview videos
        if (vid.readyState >= 2) {
          checkMediaDone(name);
        } else {
          vid.addEventListener('loadeddata', () => checkMediaDone(name), { once: true });
          vid.addEventListener('error', () => checkMediaDone(name), { once: true });
        }
      }
    });

    const minLoadDuration = 1200; // Mandatory short 1.2s loading bar
    const maxWaitTime = 12000;    
    const startTime = performance.now();
    let animFrame = null;
    let hasUnfolded = false;
    let mediaReadyTime = null;

    function updateProgress(now) {
      const elapsed = now - startTime;
      const isMediaReady = (loadedMedia >= totalMedia) || (elapsed > maxWaitTime);
      const minTimePassed = elapsed >= minLoadDuration;

      let displayProgress;

      if (!isMediaReady) {
        displayProgress = (1 - Math.exp(-elapsed / 3000)) * 0.99;
      } else {
        if (!mediaReadyTime) mediaReadyTime = now;
        const currentAsymptotic = (1 - Math.exp(-elapsed / 3000)) * 0.99;
        const fillElapsed = now - mediaReadyTime;
        const fillDuration = minTimePassed ? 50 : Math.max(50, (minLoadDuration - elapsed));
        const fillFraction = Math.min(1, fillElapsed / fillDuration);
        displayProgress = currentAsymptotic + (1.0 - currentAsymptotic) * fillFraction;
      }

      const currentPercent = Math.min(100, Math.floor(displayProgress * 100));

      if (progressFill) progressFill.style.width = `${currentPercent}%`;
      if (percentText) percentText.textContent = `${currentPercent}%`;

      // Live Text Updates
      if (statusText) {
        if (!hasUnfolded) {
          // Leave default text during initial phase
        } else if (!isMediaReady) {
          statusText.textContent = 'Laden.';
        } else {
          statusText.textContent = 'Bereit';
        }
      }

      // Phase 1: Name Unfolds gently at ~28%
      if (currentPercent >= 28 && !hasUnfolded) {
        hasUnfolded = true;
        if (loader) loader.classList.add('step-unfold');
      }

      if (displayProgress >= 1.0 && isMediaReady && minTimePassed) {
        if (progressFill) progressFill.style.width = '100%';
        if (percentText) percentText.textContent = '100%';
        if (statusText) statusText.textContent = 'Bereit';

        // Brief cinematic pause
        setTimeout(() => {
          // Phase 2: Start single hero video from frame 0 as the aperture opens!
          if (heroVideo) {
            heroVideo.currentTime = 0;
            heroVideo.play().catch(() => {});
          }
          if (loader) loader.classList.add('step-push');
          document.body.classList.add('step-push');

          // Let the user appreciate the video for 1s
          setTimeout(() => {
            finishLoader();
          }, 1000);
        }, 250);
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

  function updateNavTheme() {
    const brandEl = document.querySelector('.nav-brand');
    const brandRect = brandEl ? brandEl.getBoundingClientRect() : (navHeader ? navHeader.getBoundingClientRect() : { left: 40, top: 25 });
    const checkX = Math.max(10, Math.min(window.innerWidth - 10, (brandRect.left || 40) + 25));
    const checkY = Math.max(10, Math.min(window.innerHeight - 10, (brandRect.top || 25) + 10));

    let elUnder = null;
    if (brandEl) brandEl.style.pointerEvents = 'none';
    try {
      elUnder = document.elementFromPoint(checkX, checkY);
    } catch (e) {}
    if (brandEl) brandEl.style.pointerEvents = 'auto';

    let isOverLight = false;
    if (elUnder) {
      if (
        elUnder.closest('#thd-app') ||
        elUnder.closest('#about') ||
        elUnder.closest('#kontakt') ||
        elUnder.closest('.light-mode-section')
      ) {
        isOverLight = true;
      } else {
        let cur = elUnder;
        while (cur && cur !== document.body && cur !== document.documentElement) {
          const bg = window.getComputedStyle(cur).backgroundColor;
          if (bg && bg !== 'transparent' && !bg.startsWith('rgba(0, 0, 0, 0') && !bg.startsWith('rgba(0,0,0,0')) {
            const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m) {
              const lum = 0.299 * parseInt(m[1]) + 0.587 * parseInt(m[2]) + 0.114 * parseInt(m[3]);
              if (lum > 140) isOverLight = true;
            }
            break;
          }
          cur = cur.parentElement;
        }
      }
    }

    if (isOverLight) {
      document.body.classList.add('light-theme-active');
    } else {
      document.body.classList.remove('light-theme-active');
    }
  }

  function updateNavHeaderVisibility(scrollPos) {
    updateNavTheme();
    if (!navHeader) return;
    if (document.body.classList.contains('cinema-modal-open') || document.body.classList.contains('film-drawer-open') || (cinemaModal && cinemaModal.classList.contains('open'))) {
      isNavHeaderVisible = false;
      navHeader.classList.remove('is-visible');
      return;
    }
    const currentScroll = typeof scrollPos === 'number'
      ? scrollPos
      : (window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0) || 0);

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      isNavHeaderVisible = true;
      navHeader.classList.add('is-visible');
      const navBrand = navHeader.querySelector('.nav-brand');
      if (navBrand) {
        navBrand.style.opacity = '1';
        navBrand.style.pointerEvents = 'auto';
      }
      return;
    }

    const navBrand = navHeader.querySelector('.nav-brand');
    if (navBrand && navBrand.style.opacity) {
      navBrand.style.opacity = '';
      navBrand.style.pointerEvents = '';
    }

    // Desktop logic: Only reveal when scrolled below the intro section (entering section 01 BMW)
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

  window.addEventListener('resize', () => {
    updateNavHeaderVisibility();
  }, { passive: true });

  // --------------------------------------------------------------------------
  // Bouncy Tabs Navigation Controller (Ghost Hover & Elastic Spring Indicator)
  // --------------------------------------------------------------------------
  let updateBouncyTabsIndicator = () => {};
  let syncBouncyTabsToSection = () => {};
  let syncMobileNavToSection = () => {};
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

      const contactBtn = document.querySelector('.nav-contact-btn');
      if (contactBtn) contactBtn.classList.remove('is-active');

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

      // For sticky sections (#film, #uni), target the top of the section element so slide 1 starts cleanly
      if (targetId === 'film' || targetId === 'uni' || targetElement.classList.contains('uni-sticky-section')) {
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
    syncBouncyTabsToSection = function(sectionId, force = false) {
      if (isManualClick && !force) return;
      let match = buttons.find((b) => b.getAttribute('href') === `#${sectionId}`);
      if (!match && (sectionId === 'hero' || sectionId === 'intro')) {
        match = buttons.find((b) => b.getAttribute('href') === '#hero' || b.getAttribute('href') === '#intro');
      }
      if (!match && (sectionId === 'bmw' || sectionId === 'work' || sectionId === 'cgi')) {
        match = buttons.find((b) => b.getAttribute('href') === '#cgi');
      }
      if (!match && (sectionId === 'thd-app' || sectionId === 'uni')) {
        match = buttons.find((b) => b.getAttribute('href') === '#uni');
      }
      if (!match && (sectionId === 'about' || sectionId === 'approach')) {
        match = buttons.find((b) => b.getAttribute('href') === '#about' || b.getAttribute('href') === '#approach');
      }
      
      const contactBtn = document.querySelector('.nav-contact-btn');
      if (sectionId === 'kontakt') {
        if (contactBtn) contactBtn.classList.add('is-active');
      } else {
        if (contactBtn) contactBtn.classList.remove('is-active');
      }

      if (match) {
        if (!match.hasAttribute('data-active')) {
          setActiveButton(match, true);
        }
      } else {
        // No match found in bouncy tabs, clear active button
        const activeBtn = nav.querySelector('[data-bouncy-tabs-button][data-active]');
        if (activeBtn) activeBtn.removeAttribute('data-active');
        indicator.style.opacity = '0';
      }

      // Synchronize mobile FAB button indicator & drawer highlights
      syncMobileNavToSection(sectionId);
    };
    updateBouncyTabsIndicator = function(animate = false) {
      const activeBtn = nav.querySelector('[data-bouncy-tabs-button][data-active]');
      if (activeBtn) {
        indicator.style.opacity = '1';
        setIndicator(activeBtn, animate);
      } else {
        indicator.style.opacity = '0';
      }
    };

    // Position initial indicator
    const initialActive = nav.querySelector('[data-bouncy-tabs-button][data-active]');
    if (initialActive) {
      setActiveButton(initialActive, false);
    }

    window.addEventListener('resize', () => {
      updateBouncyTabsIndicator(false);
    }, { passive: true });

    setTimeout(() => updateBouncyTabsIndicator(false), 300);
    setTimeout(() => updateBouncyTabsIndicator(false), 1200);
  }

  // --------------------------------------------------------------------------
  // Mobile Navigation Drawer & FAB Controller (Framer Aesthetic & Active Section Tracker)
  // --------------------------------------------------------------------------
  const MOBILE_SECTION_MAP = {
    hero: { count: '[01]', short: 'Home', full: 'Home', id: 'hero' },
    intro: { count: '[01]', short: 'Home', full: 'Home', id: 'hero' },
    cgi: { count: '[02]', short: '3D & CGI', full: '3D & CGI', id: 'cgi' },
    bmw: { count: '[02]', short: '3D & CGI', full: '3D & CGI', id: 'cgi' },
    work: { count: '[02]', short: '3D & CGI', full: '3D & CGI', id: 'cgi' },
    film: { count: '[03]', short: 'Film', full: 'Film', id: 'film' },
    fotografie: { count: '[04]', short: 'Fotografie', full: 'Fotografie', id: 'fotografie' },
    kunst: { count: '[05]', short: 'Kunst', full: 'Kunst', id: 'kunst' },
    uni: { count: '[06]', short: 'Uni-Projekte', full: 'Uni-Projekte', id: 'uni' },
    'thd-app': { count: '[06]', short: 'Uni-Projekte', full: 'Uni-Projekte', id: 'uni' },
    about: { count: '[07]', short: 'Über mich', full: 'Über mich', id: 'about' },
    approach: { count: '[07]', short: 'Über mich', full: 'Über mich', id: 'about' },
    kontakt: { count: '[08]', short: 'Kontakt', full: 'Kontakt', id: 'kontakt' }
  };

  syncMobileNavToSection = function(rawSectionId) {
    const fabCount = document.getElementById('mobile-fab-count');
    const fabLabel = document.getElementById('mobile-fab-label');
    const overlay = document.getElementById('mobile-nav-overlay');

    const info = MOBILE_SECTION_MAP[rawSectionId] || { count: '[01]', short: 'Home', full: 'Home', id: 'hero' };
    if (fabCount) fabCount.textContent = info.count;
    if (fabLabel) fabLabel.textContent = info.short;

    if (overlay) {
      const items = overlay.querySelectorAll('.mobile-nav-item');
      items.forEach((item) => {
        const itemSec = item.getAttribute('data-section');
        const isMatch = (itemSec === info.id);
        if (isMatch) {
          item.setAttribute('data-highlight', 'true');
          item.classList.add('is-active');
        } else {
          item.setAttribute('data-highlight', 'false');
          item.classList.remove('is-active');
        }
      });
    }
  };

  function initMobileNav() {
    const fabBtn = document.getElementById('mobile-nav-fab');
    const overlay = document.getElementById('mobile-nav-overlay');
    const closeBtn = document.getElementById('mobile-nav-close');
    if (!fabBtn || !overlay) return;

    let isMenuOpen = false;

    function openMobileMenu() {
      if (isMenuOpen) return;
      isMenuOpen = true;
      document.body.classList.add('mobile-nav-open');
      fabBtn.classList.add('is-open');
      fabBtn.setAttribute('aria-expanded', 'true');
      fabBtn.setAttribute('aria-label', 'Menü schließen');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (typeof updateNavHeaderVisibility === 'function') {
        updateNavHeaderVisibility();
      }
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.stop();
      }
    }

    function closeMobileMenu() {
      if (!isMenuOpen) return;
      isMenuOpen = false;
      document.body.classList.remove('mobile-nav-open');
      fabBtn.classList.remove('is-open');
      fabBtn.setAttribute('aria-expanded', 'false');
      fabBtn.setAttribute('aria-label', 'Menü öffnen');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (typeof updateNavHeaderVisibility === 'function') {
        updateNavHeaderVisibility();
      }
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.start();
      }
    }

    function toggleMobileMenu() {
      if (isMenuOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    fabBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileMenu();
      });
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('mobile-nav-backdrop') || e.target.classList.contains('mobile-nav-container')) {
        closeMobileMenu();
      }
    });

    const navLinks = overlay.querySelectorAll('.mobile-nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const targetId = href.substring(1);
        closeMobileMenu();
        syncMobileNavToSection(targetId);
        if (typeof syncBouncyTabsToSection === 'function') {
          syncBouncyTabsToSection(targetId, true);
        }
        if (typeof performSmoothNavigation === 'function') {
          setTimeout(() => {
            performSmoothNavigation(targetId);
          }, 60);
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMobileMenu();
      }
    });

    // Initial section state
    syncMobileNavToSection('hero');
  }

  // Kick off sequence
  startCinematicSequence();

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
          const cleanId = targetId.replace(/^#/, '');
          if (typeof syncBouncyTabsToSection === 'function') {
            syncBouncyTabsToSection(cleanId, true);
          }
          performSmoothNavigation(cleanId);
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

      // Find the section that currently intersects the focal line (bottom-to-top to give overlap precedence to higher DOM nodes)
      for (let i = trackedSections.length - 1; i >= 0; i--) {
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

    // Scroll Reveal Animations (Replays smoothly on scrolling up and down in both directions)
    const initScrollRevealObserver = () => {
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
        return;
      }

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Re-arm when element has scrolled fully outside viewport (above or below)
            const vh = window.innerHeight || document.documentElement.clientHeight || 800;
            const rect = entry.boundingClientRect;
            if (rect.bottom < -40 || rect.top > vh + 40) {
              entry.target.classList.remove('is-visible');
            }
          }
        });
      }, {
        root: null,
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      });

      document.querySelectorAll('.reveal-on-scroll').forEach((el) => revealObserver.observe(el));

      // Observe dynamically added elements (e.g. from Web Components like <portfolio-text>)
      const mo = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.classList && node.classList.contains('reveal-on-scroll')) {
                revealObserver.observe(node);
              }
              node.querySelectorAll?.('.reveal-on-scroll')?.forEach((el) => revealObserver.observe(el));
            }
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };

    initScrollRevealObserver();

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

      // 1. Hero Dynamic Depth Shift (Desktop: Video moves down, Content moves up; Mobile: Calm fade without transform shifts)
      if (heroSection) {
        const isMobile = window.innerWidth <= 768;
        const heroHeight = heroSection.offsetHeight || windowH;
        if (scrollY <= heroHeight * 1.15) {
          if (heroVideoEl) {
            if (!isMobile) {
              heroVideoEl.style.transform = `translate3d(0, ${(scrollY * 0.32).toFixed(1)}px, 0)`;
            } else if (heroVideoEl.style.transform) {
              heroVideoEl.style.transform = '';
            }
          }
          if (heroContentEl) {
            const fade = Math.max(0, 1 - (scrollY / (heroHeight * (isMobile ? 0.65 : 0.72))));
            if (!isMobile) {
              heroContentEl.style.transform = `translate3d(0, ${(-scrollY * 0.18).toFixed(1)}px, 0)`;
            } else if (heroContentEl.style.transform) {
              heroContentEl.style.transform = '';
            }
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
    let lastWinW2 = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && window.innerWidth === lastWinW2) return;
      lastWinW2 = window.innerWidth;
      triggerContinuousParallax();
    }, { passive: true });
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
      const target = document.getElementById('cgi') || document.getElementById('bmw');
      if (target) {
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(target, { offset: -30, duration: 1.0 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
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
  const modalImagePlaceholder = document.getElementById('modal-image-placeholder');
  const modalPdf = document.getElementById('modal-pdf');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');

  let currentGallery = [];
  let currentGalleryIndex = 0;
  let activeDocCinema = null;

  /**
   * Show skeleton placeholder while the modal image loads.
   * @param {string} src – full-res image URL
   * @param {Element} [triggerEl] – the clicked trigger element; its thumbnail
   *   img is used to read the aspect ratio instantly (already loaded).
   */
  function showModalImageWithPlaceholder(src, triggerEl) {
    if (!modalImage) return;

    // Use a pure decimal ratio to avoid CSS calc() parsing issues across browsers
    let ratioNum = 16 / 9; // 1.7778
    if (triggerEl) {
      const thumb = triggerEl.querySelector('img');
      if (thumb && thumb.naturalWidth > 0 && thumb.naturalHeight > 0) {
        ratioNum = thumb.naturalWidth / thumb.naturalHeight;
      }
    }

    if (modalImagePlaceholder) {
      modalImagePlaceholder.style.setProperty('--placeholder-ratio', ratioNum.toFixed(5));
      modalImagePlaceholder.style.display = 'block';
    }

    // Load the image but keep it invisible and out of flow
    // Using visibility: hidden + position: absolute ensures it doesn't push the text
    modalImage.style.display = 'block';
    modalImage.style.position = 'absolute';
    modalImage.style.visibility = 'hidden';
    modalImage.style.pointerEvents = 'none';
    modalImage.src = src;

    const onLoad = () => {
      // Restore normal flow and reveal
      modalImage.style.position = '';
      modalImage.style.visibility = '';
      modalImage.style.pointerEvents = '';
      
      if (modalImagePlaceholder) {
        modalImagePlaceholder.style.display = 'none';
      }
      modalImage.removeEventListener('load', onLoad);
    };

    if (modalImage.complete && modalImage.naturalWidth > 0) {
      onLoad();
    } else {
      modalImage.addEventListener('load', onLoad);
    }
  }

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
    showModalImageWithPlaceholder(doc.pages[pageIndex]);

    if (modalPrev && modalNext) {
      modalPrev.style.display = doc.pages.length > 1 ? 'flex' : 'none';
      modalNext.style.display = doc.pages.length > 1 ? 'flex' : 'none';
    }

    if (cinemaModal) {
      cinemaModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cinema-modal-open');
      if (lenis) lenis.stop();
      if (typeof updateNavHeaderVisibility === 'function') {
        updateNavHeaderVisibility();
      }
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

    const modalStage = cinemaModal ? cinemaModal.querySelector('.modal-content-stage') : null;

    if (type === 'video') {
      if (modalStage) {
        modalStage.classList.add('media-loading');
        modalStage.classList.remove('media-loaded');
      }
      if (modalPdf) { modalPdf.style.display = 'none'; modalPdf.src = ''; }
      if (modalImage) modalImage.style.display = 'none';
      if (modalImagePlaceholder) modalImagePlaceholder.style.display = 'none';
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
      if (modalStage) {
        // We use our new custom placeholder for images, so clear the global stage loading state
        modalStage.classList.remove('media-loading');
        modalStage.classList.add('media-loaded');
      }
      if (modalVideo) { modalVideo.pause(); modalVideo.style.display = 'none'; modalVideo.src = ''; }
      if (modalPdf) { modalPdf.style.display = 'none'; modalPdf.src = ''; }
      showModalImageWithPlaceholder(src, item);
    }

    if (cinemaModal) {
      cinemaModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cinema-modal-open');
      if (lenis) lenis.stop();
      if (typeof updateNavHeaderVisibility === 'function') {
        updateNavHeaderVisibility();
      }
    }
  }

  function closeCinemaModal() {
    activeDocCinema = null;
    if (cinemaModal) {
      cinemaModal.classList.remove('open');
      document.body.style.overflow = '';
      document.body.classList.remove('cinema-modal-open');
      if (lenis) lenis.start();
      if (typeof updateNavHeaderVisibility === 'function') {
        updateNavHeaderVisibility();
      }
    }
    if (modalVideo) {
      modalVideo.pause();
    }
    // Warten bis der 0.35s Fade-Out abgeschlossen ist, damit das Bild/Placeholder nicht vorzeitig
    // auf 0x0 kollabiert und der Text während des Ausblendens in die Mitte springt.
    setTimeout(() => {
      if (cinemaModal && cinemaModal.classList.contains('open')) return;
      if (modalVideo) {
        modalVideo.src = '';
      }
      if (modalImage) {
        modalImage.src = '';
        modalImage.style.position = '';
        modalImage.style.visibility = '';
        modalImage.style.pointerEvents = '';
      }
      if (modalImagePlaceholder) {
        modalImagePlaceholder.style.display = 'none';
      }
      if (modalPdf) {
        modalPdf.src = '';
        modalPdf.style.display = 'none';
      }
    }, 380);
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
  // Seamless Video Upgrades (Teaser -> Full Video)
  // --------------------------------------------------------------------------
  function initSeamlessVideoUpgrades() {
    const panels = document.querySelectorAll('.seamless-video-wrap');
    panels.forEach(panel => {
      const proxyVid = panel.querySelector('.proxy-video');
      const fullVid = panel.querySelector('.full-video');
      if (!proxyVid || !fullVid) return;

      // Ensure both play when scrolled into view (handled by the parallax script below)
      // but we need to monitor when the full video becomes ready!
      const checkFullReady = () => {
        if (fullVid.readyState >= 3) { // canplay
          // Sync times!
          // Since proxy is 5 seconds long, it will loop. 
          // We set the full video to start at the exact same time as the proxy, 
          // plus the base start time (4s or 8s for some videos)
          const baseTime = parseFloat(fullVid.getAttribute('data-start-time') || '0');
          const proxyCurrent = proxyVid.currentTime;
          
          // Only sync if the full video hasn't been played significantly yet
          if (fullVid.currentTime < baseTime + 5.0) {
            fullVid.currentTime = baseTime + proxyCurrent;
          }

          // Force play
          fullVid.play().then(() => {
            // Once it's actively playing, fade out the proxy!
            // Preserve the smooth hover filter while animating opacity
            fullVid.style.transition = 'opacity 0.8s ease, filter 0.5s ease';
            fullVid.style.opacity = '1';
            setTimeout(() => {
              proxyVid.pause();
              proxyVid.style.display = 'none'; // Save resources
            }, 800);
          }).catch(() => {});
        } else {
          requestAnimationFrame(checkFullReady);
        }
      };

      // We only start checking once the full video starts downloading
      fullVid.addEventListener('play', () => {
        if (fullVid.style.opacity === '0' || fullVid.style.opacity === '') {
          checkFullReady();
        }
      });
    });
  }

  initSeamlessVideoUpgrades();

  // --------------------------------------------------------------------------
  // 4b. Fullscreen Vertical Film Parallax Showcase Engine
  // --------------------------------------------------------------------------
  function initFilmVerticalParallax() {
    const stage = document.getElementById('film-parallax-stage');
    if (!stage) return () => {};

    const centerTitles = Array.from(stage.querySelectorAll('.film-center-title'));
    const centerMetas = Array.from(stage.querySelectorAll('.film-title-meta'));
    const dynamicDivider = document.getElementById('film-dynamic-divider') || stage.querySelector('.film-title-divider');

    function updateDynamicDividerWidth(index) {
      if (!dynamicDivider || centerTitles.length === 0) return;
      const targetIdx = (typeof index === 'number' && index >= 0) ? index : (activeFilmIndex >= 0 ? activeFilmIndex : 0);
      const targetTitle = centerTitles[targetIdx] || centerTitles[0];
      if (!targetTitle) return;

      const rect = targetTitle.getBoundingClientRect();
      const textWidth = rect.width || targetTitle.offsetWidth || 56;
      if (textWidth > 0) {
        dynamicDivider.style.width = `${Math.round(textWidth)}px`;
      }
    }
    const drawer = document.getElementById('film-info-drawer');
    const drawerSheet = document.getElementById('film-info-drawer-sheet');
    const drawerCloseBtn = document.getElementById('film-info-drawer-close');
    const drawerBackdrop = document.getElementById('film-info-drawer-backdrop');
    const moreTriggerBtn = document.getElementById('film-more-trigger');
    const drawerBadge = document.getElementById('film-drawer-badge');
    const drawerPanels = drawer ? Array.from(drawer.querySelectorAll('.film-info-content')) : [];
    const cards = drawerPanels.length ? drawerPanels : Array.from(stage.querySelectorAll('.film-text-card'));
    const panels = Array.from(stage.querySelectorAll('.film-video-panel'));
    const dots = Array.from(stage.querySelectorAll('.film-dot'));
    const counter = document.getElementById('film-sticky-counter');
    const label = document.getElementById('film-sticky-label');
    const globalAudioBtn = document.getElementById('film-global-audio-btn');
    const cinemaOpenBtn = document.getElementById('film-cinema-open-btn');
    const stillsToggle = document.getElementById('film-stills-toggle');
    const filmOverlay = stage.querySelector('.film-sticky-overlay');
    const filmVignette = stage.querySelector('.film-vignette-overlay');
    let activeFilmIndex = -1;
    let filmOverlayVisible = false;

    // Configure custom start times: Spielfilm (Kurzfilm) ab Sekunde 8, Interview (Offline) ab Sekunde 12
    panels.forEach((p, idx) => {
      const v = p.querySelector('video');
      if (!v) return;
      const startOffset = idx === 2 ? 8 : (idx === 3 ? 12 : 0);
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
      if (newIndex === activeFilmIndex || newIndex < 0 || newIndex >= (cards.length || centerTitles.length)) return;
      activeFilmIndex = newIndex;

      // 1. Center Title transition
      centerTitles.forEach((t, idx) => {
        if (idx === activeFilmIndex) {
          t.classList.add('is-active');
        } else {
          t.classList.remove('is-active');
        }
      });

      // 1b. Center Meta transition
      centerMetas.forEach((m, idx) => {
        if (idx === activeFilmIndex) {
          m.classList.add('is-active');
        } else {
          m.classList.remove('is-active');
        }
      });

      // 1c. Dynamic Divider Width: expands/contracts to match active title width
      updateDynamicDividerWidth(activeFilmIndex);

      // 2. Drawer Panels transition
      drawerPanels.forEach((card, idx) => {
        if (idx === activeFilmIndex) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      // 3. Drawer Category Badge
      if (drawerBadge) {
        const activeCard = cards[activeFilmIndex];
        const catLabel = (activeCard ? activeCard.getAttribute('data-label') : '') || 'FILM';
        drawerBadge.textContent = `0${activeFilmIndex + 1} / ${catLabel.toUpperCase()}`;
      }

      // 4. Dots
      dots.forEach((dot, idx) => {
        if (idx === activeFilmIndex) {
          dot.classList.add('is-active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('is-active');
          dot.setAttribute('aria-selected', 'false');
        }
      });

      // 5. Counter & Category Label
      if (counter) {
        counter.textContent = `0${activeFilmIndex + 1} / 04`;
      }
      const activeCard = cards[activeFilmIndex];
      if (label && activeCard) {
        label.textContent = activeCard.getAttribute('data-label') || '';
      }

      // 6. Panel active classes
      panels.forEach((p, idx) => {
        if (idx === activeFilmIndex) {
          p.classList.add('is-active');
        } else {
          p.classList.remove('is-active');
        }
      });

      // 7. Update Cinema Open Button data attributes for modal lightbox
      if (cinemaOpenBtn && activeCard) {
        cinemaOpenBtn.setAttribute('data-cinema-trigger', '');
        cinemaOpenBtn.setAttribute('data-cinema-type', 'video');
        cinemaOpenBtn.setAttribute('data-cinema-src', activeCard.getAttribute('data-video-src') || '');
        cinemaOpenBtn.setAttribute('data-cinema-title', activeCard.getAttribute('data-video-title') || '');
        cinemaOpenBtn.setAttribute('data-cinema-meta', activeCard.getAttribute('data-video-meta') || '');
        cinemaOpenBtn.setAttribute('data-start-time', activeCard.getAttribute('data-start-time') || '0');
      }

      // 8. Audio toggle state for active video
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

    // Contiguous Video Stream with Pinned Sticky UI Overlay
    function updateFilmParallax() {
      const stageRect = stage.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Pre-roll window: check if user is near or inside the film section
      const isNearFilmStage = (stageRect.top <= windowH + 350 && stageRect.bottom >= -350);
      if (!isNearFilmStage) {
        // User is outside the film section: pause all 4 film videos
        panels.forEach((p) => {
          const v = p.querySelector('video');
          if (v && !v.paused) v.pause();
        });
        return;
      }

      // Total distance the stage can scroll while pinned (300vh for 4 videos)
      const totalScrollable = stageRect.height - windowH;
      if (totalScrollable <= 0) return;

      // Scrolled distance into the stage
      const scrolledInto = -stageRect.top;
      
      // Progress across the 4 videos: 0.0 to 3.0
      // 0.0 = Video 0
      // 1.0 = Video 1
      // 2.0 = Video 2
      // 3.0 = Video 3
      const rawProgress = (scrolledInto / totalScrollable) * 3;
      const progress = Math.max(0, Math.min(3, rawProgress));

      // Active film index based on which video is predominantly in view
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

      // Play visible videos, pause offscreen ones
      panels.forEach((p, idx) => {
        const vids = p.querySelectorAll('video');
        if (Math.abs(progress - idx) < 0.75) {
          vids.forEach(v => {
            v.style.transform = '';
            if (v.paused) v.play().catch(()=>{});
          });
        } else {
          vids.forEach(v => {
            v.style.transform = '';
            if (!v.paused) v.pause();
          });
        }
      });

      syncActiveFilmUI(activeIdx);
      if (typeof checkFilmUiLuminance === 'function') {
        checkFilmUiLuminance();
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

    // --------------------------------------------------------------------------
    // Film Info Frosted Blur Drawer Handlers (Slides up from bottom like FAB)
    // --------------------------------------------------------------------------
    let isDrawerOpen = false;

    function openFilmDrawer() {
      if (!drawer || isDrawerOpen) return;
      isDrawerOpen = true;

      // Close mobile navigation overlay if currently open to prevent dual open states
      const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
      const mobileNavFabBtn = document.getElementById('mobile-nav-fab');
      if (document.body.classList.contains('mobile-nav-open') || (mobileNavOverlay && mobileNavOverlay.classList.contains('is-open'))) {
        document.body.classList.remove('mobile-nav-open');
        if (mobileNavFabBtn) {
          mobileNavFabBtn.classList.remove('is-open');
          mobileNavFabBtn.setAttribute('aria-expanded', 'false');
          mobileNavFabBtn.setAttribute('aria-label', 'Menü öffnen');
        }
        if (mobileNavOverlay) {
          mobileNavOverlay.classList.remove('is-open');
          mobileNavOverlay.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
      }

      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('film-drawer-open');

      // Ensure the correct drawer panel is visible for the current film
      const currentIdx = Math.max(0, activeFilmIndex);
      console.log('[FilmDrawer] Opening drawer, activeFilmIndex:', activeFilmIndex, 'currentIdx:', currentIdx, 'drawerPanels.length:', drawerPanels.length);
      drawerPanels.forEach((card, idx) => {
        if (idx === currentIdx) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });
      if (drawerBadge) {
        const activeCard = cards[currentIdx];
        const catLabel = (activeCard ? activeCard.getAttribute('data-label') : '') || 'FILM';
        drawerBadge.textContent = `0${currentIdx + 1} / ${catLabel.toUpperCase()}`;
      }

      // Scroll drawer to top so content is visible
      drawer.scrollTop = 0;

      if (moreTriggerBtn) {
        moreTriggerBtn.classList.add('is-active');
        moreTriggerBtn.setAttribute('aria-expanded', 'true');
        moreTriggerBtn.setAttribute('aria-label', 'Filmdetails schließen');
      }

      const bottomBar = stage.querySelector('.film-sticky-bottom');
      if (bottomBar) {
        bottomBar.classList.remove('is-inverted');
      }

      if (typeof lenis !== 'undefined' && lenis) {
        lenis.stop();
      }
    }

    function closeFilmDrawer() {
      if (!drawer || !isDrawerOpen) return;
      isDrawerOpen = false;

      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('film-drawer-open');

      if (moreTriggerBtn) {
        moreTriggerBtn.classList.remove('is-active');
        moreTriggerBtn.setAttribute('aria-expanded', 'false');
        moreTriggerBtn.setAttribute('aria-label', 'Mehr Details zum Film erfahren');
      }

      if (typeof lenis !== 'undefined' && lenis) {
        lenis.start();
      }
    }

    if (moreTriggerBtn) {
      moreTriggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDrawerOpen) {
          closeFilmDrawer();
        } else {
          openFilmDrawer();
        }
      });
    }

    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeFilmDrawer();
      });
    }

    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) {
          closeFilmDrawer();
        }
      });
      drawer.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
      drawer.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeFilmDrawer();
      }
    });

    // Stills Lightbox Trigger listener (Schattenwolf)
    const schattenwolfStill1 = document.getElementById('schattenwolf-still-1');
    const drawerStillsToggle = document.getElementById('film-stills-toggle');
    if (drawerStillsToggle && schattenwolfStill1) {
      drawerStillsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeFilmDrawer();
        schattenwolfStill1.click();
      });
    }

    // Cinema buttons inside drawer
    if (drawer) {
      const drawerCinemaBtns = drawer.querySelectorAll('.film-info-cinema-btn');
      drawerCinemaBtns.forEach((cBtn) => {
        cBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetIdx = parseInt(cBtn.getAttribute('data-cinema-film-index'), 10);
          if (!isNaN(targetIdx) && targetIdx !== activeFilmIndex) {
            syncActiveFilmUI(targetIdx);
          }
          closeFilmDrawer();
          if (cinemaOpenBtn) {
            cinemaOpenBtn.click();
          }
        });
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

    // --------------------------------------------------------------------------
    // Dynamic Luminance Threshold Contrast Engine for Film UI Elements
    // ("UI elements are white, except when background is very bright -> negative/dark")
    // --------------------------------------------------------------------------
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 64;
    sampleCanvas.height = 36;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    let isTitleInverted = false;
    let isBottomInverted = false;
    let lumInterval = null;

    // Thresholds: raw video luminance > ~71% turns dark, < ~58% restores white
    const LUM_THRESHOLD_INVERT = 142;
    const LUM_THRESHOLD_RESTORE = 118;

    function getActiveVisibleVideo() {
      const activePanel = panels[activeFilmIndex] || panels[0];
      if (!activePanel) return null;
      const fullVid = activePanel.querySelector('.full-video');
      const proxyVid = activePanel.querySelector('.proxy-video');
      if (fullVid && fullVid.readyState >= 2 && !fullVid.paused && (fullVid.style.opacity === '1' || fullVid.style.opacity === '')) {
        return fullVid;
      }
      if (proxyVid && proxyVid.readyState >= 2 && !proxyVid.paused) {
        return proxyVid;
      }
      if (fullVid && fullVid.readyState >= 2) return fullVid;
      if (proxyVid && proxyVid.readyState >= 2) return proxyVid;
      return null;
    }

    function checkFilmUiLuminance() {
      const stageRect = stage.getBoundingClientRect();
      const winH = window.innerHeight;
      const winW = window.innerWidth;

      // Skip when completely offscreen
      if (stageRect.bottom < 0 || stageRect.top > winH) return;
      if (isDrawerOpen) {
        const bottomBar = stage.querySelector('.film-sticky-bottom');
        if (bottomBar) bottomBar.classList.remove('is-inverted');
        return;
      }

      const video = getActiveVisibleVideo();
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      try {
        // Draw current video frame onto 64x36 offscreen canvas
        sampleCtx.drawImage(video, 0, 0, 64, 36);
        const imgData = sampleCtx.getImageData(0, 0, 64, 36);
        const data = imgData.data;

        const centerStage = stage.querySelector('.film-center-stage');
        const bottomBar = stage.querySelector('.film-sticky-bottom');

        // 1. Title Region Sampling
        let titleX0 = 2, titleX1 = 28, titleY0 = 18, titleY1 = 30;
        if (centerStage) {
          const cRect = centerStage.getBoundingClientRect();
          if (cRect.width > 0 && cRect.height > 0) {
            titleX0 = Math.max(0, Math.min(63, Math.floor((cRect.left / winW) * 63)));
            titleX1 = Math.max(0, Math.min(63, Math.ceil((cRect.right / winW) * 63)));
            titleY0 = Math.max(0, Math.min(35, Math.floor((cRect.top / winH) * 35)));
            titleY1 = Math.max(0, Math.min(35, Math.ceil((cRect.bottom / winH) * 35)));
          }
        }

        let titleLumSum = 0, titleCount = 0;
        for (let y = titleY0; y <= titleY1; y++) {
          for (let x = titleX0; x <= titleX1; x++) {
            const idx = (y * 64 + x) * 4;
            titleLumSum += 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
            titleCount++;
          }
        }

        // 2. Bottom Bar Region Sampling
        let btmX0 = 2, btmX1 = 61, btmY0 = 31, btmY1 = 35;
        if (bottomBar) {
          const bRect = bottomBar.getBoundingClientRect();
          if (bRect.width > 0 && bRect.height > 0) {
            btmX0 = Math.max(0, Math.min(63, Math.floor((bRect.left / winW) * 63)));
            btmX1 = Math.max(0, Math.min(63, Math.ceil((bRect.right / winW) * 63)));
            btmY0 = Math.max(0, Math.min(35, Math.floor((bRect.top / winH) * 35)));
            btmY1 = Math.max(0, Math.min(35, Math.ceil((bRect.bottom / winH) * 35)));
          }
        }

        let btmLumSum = 0, btmCount = 0;
        for (let y = btmY0; y <= btmY1; y++) {
          for (let x = btmX0; x <= btmX1; x++) {
            const idx = (y * 64 + x) * 4;
            btmLumSum += 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
            btmCount++;
          }
        }

        // Compensate for stationary .film-vignette-overlay (transmission factor 0.78)
        const avgTitleLum = (titleCount > 0 ? (titleLumSum / titleCount) : 0) * 0.78;
        const avgBtmLum = (btmCount > 0 ? (btmLumSum / btmCount) : 0) * 0.78;

        // Apply hysteresis to Title
        if (!isTitleInverted && avgTitleLum >= LUM_THRESHOLD_INVERT) {
          isTitleInverted = true;
        } else if (isTitleInverted && avgTitleLum <= LUM_THRESHOLD_RESTORE) {
          isTitleInverted = false;
        }

        // Apply hysteresis to Bottom bar
        if (!isBottomInverted && avgBtmLum >= LUM_THRESHOLD_INVERT) {
          isBottomInverted = true;
        } else if (isBottomInverted && avgBtmLum <= LUM_THRESHOLD_RESTORE) {
          isBottomInverted = false;
        }

        if (centerStage) {
          centerStage.classList.toggle('is-inverted', isTitleInverted);
        }
        centerTitles.forEach((t) => {
          t.classList.toggle('is-inverted', isTitleInverted);
        });

        if (bottomBar) {
          bottomBar.classList.toggle('is-inverted', isBottomInverted);
        }
      } catch (err) {
        // Fallback: stay clean white
      }
    }

    // Run dynamic sampling on scroll & throttled timer when stage is visible
    if ('IntersectionObserver' in window) {
      const filmObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!lumInterval) {
              lumInterval = setInterval(checkFilmUiLuminance, 150);
            }
            checkFilmUiLuminance();
          } else {
            if (lumInterval) {
              clearInterval(lumInterval);
              lumInterval = null;
            }
          }
        });
      }, { threshold: 0.05 });
      filmObserver.observe(stage);
    } else {
      setInterval(checkFilmUiLuminance, 250);
    }

    // Initial setup
    syncActiveFilmUI(0);
    updateFilmParallax();
    updateDynamicDividerWidth(0);

    let lastWinW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && window.innerWidth === lastWinW) return;
      lastWinW = window.innerWidth;
      updateFilmParallax();
      updateDynamicDividerWidth(activeFilmIndex);
    }, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateDynamicDividerWidth(activeFilmIndex);
      });
    }

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

    // Preload document start page only
    if (doc.pages && doc.pages.length > 0) {
      const img = new Image();
      img.src = doc.pages[0];
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
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    docPageDisplay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = false;
    }, { passive: true });

    docPageDisplay.addEventListener('touchmove', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (Math.abs(touchEndX - touchStartX) > 15) {
        isSwiping = true;
      }
    }, { passive: true });

    docPageDisplay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        // Swipe left -> Next page
        renderDocPage(currentDocPageIndex + 1);
      } else if (touchEndX - touchStartX > 40) {
        // Swipe right -> Prev page
        renderDocPage(currentDocPageIndex - 1);
      }
    });

    docPageDisplay.addEventListener('click', (e) => {
      if (!isSwiping) {
        openCinemaDoc(currentDocKey, currentDocPageIndex);
      }
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

    const currentlyActiveIdx = controlItems.findIndex(el => el.classList.contains('active'));
    if (currentlyActiveIdx === targetIndex && currentDocKey === key) return;

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

  let isProgrammaticScroll = false;
  let programmaticScrollTimer = null;

  function goToDocIndex(index) {
    if (index < 0 || index >= controlItems.length) return;

    setActiveDocItem(index);

    isProgrammaticScroll = true;
    if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer);

    const uniSection = document.getElementById('uni');
    if (uniSection) {
      const end = uniSection.offsetHeight - window.innerHeight;
      if (end > 50) {
        const exitBuffer = window.innerHeight * 1.0;
        const activeSwitchDistance = Math.max(100, end - exitBuffer);
        const currentScroll = window.scrollY || document.documentElement.scrollTop || (typeof lenis !== 'undefined' && lenis ? lenis.scroll : 0);
        const top = uniSection.getBoundingClientRect().top + currentScroll;
        const numItems = controlItems.length;
        const progressRatio = numItems > 1 ? (index / (numItems - 1)) : 0;
        const targetScroll = Math.round(top + progressRatio * activeSwitchDistance);

        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(targetScroll, {
            duration: 0.5,
            onComplete: () => {
              isProgrammaticScroll = false;
            }
          });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }

    programmaticScrollTimer = setTimeout(() => {
      isProgrammaticScroll = false;
    }, 600);
  }

  controlItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      // Don't intercept clicks on download links
      if (e.target.closest('.control-dossier-link')) return;
      goToDocIndex(index);
    });
  });

  if (paddlePrev) {
    paddlePrev.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
      if (currentIndex > 0) {
        goToDocIndex(currentIndex - 1);
      }
    });
  }

  if (paddleNext) {
    paddleNext.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = controlItems.findIndex(el => el.classList.contains('active'));
      if (currentIndex >= 0 && currentIndex < controlItems.length - 1) {
        goToDocIndex(currentIndex + 1);
      }
    });
  }

  // On mobile: Clicking on the active project description opens Fullscreen Cinema
  // Fullscreen Modal for Document Description Text (Mobile & Desktop)
  const docTextModal = document.getElementById('doc-text-modal');
  const docTextModalTitle = document.getElementById('doc-text-modal-title');
  const docTextModalBadge = document.getElementById('doc-text-modal-badge');
  const docTextModalBody = document.getElementById('doc-text-modal-body');

  window.openDocTextModal = function(title, badge, body) {
    if (!docTextModal) return;
    if (docTextModalTitle) docTextModalTitle.textContent = title;
    if (docTextModalBadge) docTextModalBadge.textContent = badge;
    if (docTextModalBody) docTextModalBody.textContent = body;
    docTextModal.classList.add('is-open');
    docTextModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis) lenis.stop();
  };

  window.closeDocTextModal = function() {
    if (!docTextModal) return;
    docTextModal.classList.remove('is-open');
    docTextModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
  };

  // Close doc text modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && docTextModal && docTextModal.classList.contains('is-open')) {
      closeDocTextModal();
    }
  });

  // Attach click listener strictly to the description text itself (restricted hitbox)
  document.querySelectorAll('.control-item .typography-all-access-pass-pv-item-body').forEach((bodyEl) => {
    let textTouchStartX = 0;
    let textTouchStartY = 0;
    let textTouchMoved = false;

    bodyEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        textTouchStartX = e.touches[0].clientX;
        textTouchStartY = e.touches[0].clientY;
        textTouchMoved = false;
      }
    }, { passive: true });

    bodyEl.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        const diffX = Math.abs(e.touches[0].clientX - textTouchStartX);
        const diffY = Math.abs(e.touches[0].clientY - textTouchStartY);
        if (diffX > 8 || diffY > 8) {
          textTouchMoved = true;
        }
      }
    }, { passive: true });

    bodyEl.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (textTouchMoved) return;

      const controlItem = bodyEl.closest('.control-item');
      if (!controlItem) return;

      const titleEl = controlItem.querySelector('.control-label-text');
      const badgeEl = controlItem.querySelector('.control-item-badge');
      const title = titleEl ? titleEl.childNodes[0].textContent.trim() : 'Projekt';
      const badge = badgeEl ? badgeEl.textContent.trim() : '';

      // Get full text without title prefix
      let fullText = bodyEl.textContent.trim();
      if (title && fullText.startsWith(title)) {
        fullText = fullText.substring(title.length).replace(/^[.\s]+/, '');
      }

      openDocTextModal(title, badge, fullText);
    });
  });

  // Initialize with layout
  setActiveDocItem(0);

  // Scroll-Driven Accordion & Document Switching Logic (Desktop & Mobile)
  const uniSection = document.getElementById('uni');
  if (uniSection) {
    function updateUniScroll() {
      if (isProgrammaticScroll) return;
      const rect = uniSection.getBoundingClientRect();
      const end = rect.height - window.innerHeight;
      const scrolled = -rect.top;

      if (end > 50) {
        // Reserve buffer distance at the end for the last PDF (MagicFlow) before white section enters
        const exitBuffer = window.innerHeight * 1.0; // 100vh of resting space for MagicFlow
        const activeSwitchDistance = Math.max(100, end - exitBuffer);

        if (scrolled >= 0 && scrolled <= end) {
          const clampedScrolled = Math.min(scrolled, activeSwitchDistance);
          let progress = clampedScrolled / activeSwitchDistance;
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
        } else if (scrolled > end) {
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
      const parentContainer = btn.closest('.cinematic-hero-player, .film-preview-box, .cgi-card-half, .cgi-card-full, .cgi-card-wide, .cgi-main-media, .motion-video-frame, .cgi-parallax-card');
      if (!parentContainer) return;

      const targetVideos = parentContainer.querySelectorAll('video');
      if (targetVideos.length === 0) return;

      const isCurrentlyMuted = targetVideos[targetVideos.length - 1].muted;

      if (isCurrentlyMuted) {
        // Mute all other videos on the page
        document.querySelectorAll('video').forEach((v) => {
          if (!parentContainer.contains(v) && v.id !== 'modal-video') {
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

        // Unmute target videos
        targetVideos.forEach(targetVideo => {
          targetVideo.muted = false;
          targetVideo.volume = 1.0;
          const p = targetVideo.play();
          if (p !== undefined) p.catch(() => {});
        });

        btn.classList.remove('is-muted');
        btn.setAttribute('aria-label', 'Stummschalten');
        btn.setAttribute('title', 'Stummschalten');
        const lbl = btn.querySelector('.audio-label');
        if (lbl) lbl.textContent = 'Ton an';
      } else {
        // Mute target videos
        targetVideos.forEach(targetVideo => {
          targetVideo.muted = true;
        });

        btn.classList.add('is-muted');
        btn.setAttribute('aria-label', 'Ton einschalten');
        btn.setAttribute('title', 'Ton einschalten');
        const lbl = btn.querySelector('.audio-label');
        if (lbl) lbl.textContent = 'Ton aus';
      }
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeCinemaModal();
    });
  }

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

    // Touch Swipe navigation for Modal on mobile
    let modalTouchStartX = 0;
    let modalTouchStartY = 0;
    cinemaModal.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      modalTouchStartX = e.touches[0].clientX;
      modalTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    cinemaModal.addEventListener('touchend', (e) => {
      if (!cinemaModal.classList.contains('open') || !e.changedTouches || e.changedTouches.length !== 1) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - modalTouchStartX;
      const diffY = touchEndY - modalTouchStartY;
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          // Swipe left -> Next item
          showGalleryItem(activeDocCinema ? activeDocCinema.pageIndex + 1 : currentGalleryIndex + 1);
        } else {
          // Swipe right -> Previous item
          showGalleryItem(activeDocCinema ? activeDocCinema.pageIndex - 1 : currentGalleryIndex - 1);
        }
      }
    }, { passive: true });
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
    let barWidthPct = 8;
    let maxOffsetPct = 92;

    function measureCards() {
      const trackOffset = track.offsetLeft;
      cardLayout = cards.map((card) => {
        const medias = Array.from(card.querySelectorAll('.cgi-parallax-media'));
        const offsetLeft = card.offsetLeft - trackOffset;
        const width = card.offsetWidth;
        return {
          card,
          medias,
          center: offsetLeft + width / 2,
          width
        };
      });

      // Update scrubber bar width once during layout calculation instead of on every scroll frame
      if (scrubberBar) {
        barWidthPct = Math.max(8, 100 / (cards.length || 1));
        maxOffsetPct = 100 - barWidthPct;
        scrubberBar.style.width = `${barWidthPct}%`;
      }
    }
    measureCards();

    // High-performance, zero-latency optical parallax calculation
    function updateParallaxAndUI() {
      ticking = false;
      const scrollLeft = viewport.scrollLeft;
      const viewportWidth = viewport.clientWidth;
      const viewportCenter = scrollLeft + viewportWidth / 2;
      const maxScroll = Math.max(1, viewport.scrollWidth - viewportWidth);

      // 1. Scrubber bar update (only writing transform now, no layout thrashing)
      if (scrubberBar) {
        const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
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
          
          if (item.medias && item.medias.length > 0) {
            // Re-enabled parallax on all devices, but optimized:
            // 1. Scaled amplitude for smooth performance on mobile
            // 2. Strict DOM write caching
            const isMobile = window.innerWidth <= 768;
            const amplitude = isMobile ? 12 : 18; 
            const shiftPct = -clampedNorm * amplitude;
            const newTransform = `translate3d(${shiftPct.toFixed(2)}%, 0, 0)`;
            
            if (item.lastTransform !== newTransform) {
              item.medias.forEach(m => m.style.transform = newTransform);
              item.lastTransform = newTransform;
            }
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

    // Touch Swipe events with directional scroll locking
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastX = 0;
    let touchLastY = 0;
    let touchIntent = null; // 'horizontal' | 'vertical' | null

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      stopMomentum();
      isDown = true;
      hasDragged = false;
      touchIntent = null;
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
      const diffY = currentTouchY - touchStartY;

      // Determine intent early: horizontal carousel swipe vs vertical page scroll
      if (!touchIntent) {
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        if (absX > 6 || absY > 6) {
          touchIntent = absX >= absY ? 'horizontal' : 'vertical';
        }
      }

      // If vertical scroll, let native page scroll happen without interfering
      if (touchIntent === 'vertical') {
        return;
      }

      if (touchIntent === 'horizontal' && Math.abs(diffX) > 8) {
        hasDragged = true;
        viewport.classList.add('is-dragging');
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
      const wasHorizontal = touchIntent === 'horizontal';
      touchIntent = null;

      if (!wasHorizontal || !hasDragged) {
        hasDragged = false;
        return;
      }

      if (Math.abs(velocity) > 0.12) {
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

    viewport.addEventListener('touchcancel', () => {
      isDown = false;
      hasDragged = false;
      touchIntent = null;
      viewport.classList.remove('is-dragging');
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

  // --------------------------------------------------------------------------
  // Kunst Ticker: Smooth Continuous Auto-Scroll + Interactive Pointer Drag & Click
  // --------------------------------------------------------------------------
  function initKunstTicker() {
    const viewport = document.querySelector('.kunst-ticker-viewport');
    const track = document.querySelector('.kunst-ticker-track');
    const group1 = document.querySelector('.kunst-ticker-group');
    if (!viewport || !track || !group1) return;

    let currentX = 0;
    let isPointerDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let dragStartX = 0;
    let hasDragged = false;
    let lastTime = performance.now();
    const speed = 36; // pixels per second steady scroll

    function getGroupWidth() {
      return group1 ? group1.offsetWidth : 0;
    }

    function step(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const groupWidth = getGroupWidth();

      if (!isDragging && !isPointerDown) {
        // Continuous smooth auto-scroll (does not pause on hover)
        currentX += speed * dt;
        if (groupWidth > 0) {
          while (currentX >= 0) currentX -= groupWidth;
          while (currentX < -groupWidth) currentX += groupWidth;
        }
      }

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);

    viewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isPointerDown = true;
      isDragging = false;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      dragStartX = currentX;
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (!isDragging && dist > 6) {
        isDragging = true;
        hasDragged = true;
        viewport.classList.add('is-dragging');
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch (err) {}
      }

      if (isDragging) {
        currentX = dragStartX + (e.clientX - startX);
        const groupWidth = getGroupWidth();
        if (groupWidth > 0) {
          while (currentX >= 0) currentX -= groupWidth;
          while (currentX < -groupWidth) currentX += groupWidth;
        }
        track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      }
    });

    const stopDragging = (e) => {
      if (!isPointerDown) return;
      const wasDragging = isDragging;
      isPointerDown = false;
      isDragging = false;
      viewport.classList.remove('is-dragging');
      try {
        if (e && e.pointerId && viewport.hasPointerCapture(e.pointerId)) {
          viewport.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}

      if (wasDragging) {
        setTimeout(() => { hasDragged = false; }, 120);
      } else {
        hasDragged = false;
        // Direct click fallback if pointer capture suppressed native click
        if (e) {
          const card = (e.target && e.target.closest) ? e.target.closest('.kunst-ticker-card') : null;
          const fallbackCard = card || document.elementFromPoint(e.clientX, e.clientY)?.closest('.kunst-ticker-card');
          if (fallbackCard && typeof openCinemaModal === 'function') {
            const cloneTargetId = fallbackCard.getAttribute('data-clone-of') || fallbackCard.getAttribute('clone-of');
            const target = cloneTargetId ? (document.getElementById(cloneTargetId) || fallbackCard) : fallbackCard;
            openCinemaModal(target);
          }
        }
      }
    };

    viewport.addEventListener('pointerup', stopDragging);
    viewport.addEventListener('pointercancel', stopDragging);

    // Standard card click handler
    document.querySelectorAll('.kunst-ticker-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        const cloneTargetId = card.getAttribute('data-clone-of') || card.getAttribute('clone-of');
        const target = cloneTargetId ? (document.getElementById(cloneTargetId) || card) : card;
        if (typeof openCinemaModal === 'function') {
          openCinemaModal(target || card);
        }
      });
    });
  }

  initKunstTicker();

  // --------------------------------------------------------------------------
  // 4d. Kaserne Real / 3D Comparison Slider (Fotoreferenz vs. 3D-CGI)
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
    slider.setAttribute('aria-label', 'Real-3D Bildvergleich Kaserne');
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
          for (let i = cachedSections.length - 1; i >= 0; i--) {
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

  // --------------------------------------------------------------------------
  // Competencies Tabs & Drawer (3D & CGI, Fotografie, Film, Kunst)
  // Single active selection, manual click only (no auto-scroll unfold)
  // --------------------------------------------------------------------------
  function initCompetenciesAccordion() {
    const tabs = Array.from(document.querySelectorAll('.competency-tab'));
    const drawer = document.getElementById('competencies-drawer');
    const panels = Array.from(document.querySelectorAll('.competency-panel'));
    if (tabs.length === 0 || !drawer || panels.length === 0) return;

    let activeCategory = null;

    const setCategory = (category) => {
      if (activeCategory === category) {
        // Active item clicked again -> close it
        activeCategory = null;
      } else {
        // Only one active at a time
        activeCategory = category;
      }

      // Update tabs state
      tabs.forEach((tab) => {
        const isCurrent = tab.getAttribute('data-category') === activeCategory;
        tab.classList.toggle('is-active', isCurrent);
        tab.setAttribute('aria-expanded', isCurrent ? 'true' : 'false');
      });

      // Update drawer and panels
      if (activeCategory) {
        panels.forEach((panel) => {
          const isCurrent = panel.getAttribute('data-category') === activeCategory;
          panel.classList.toggle('is-active', isCurrent);
        });
        drawer.classList.add('is-open');
      } else {
        drawer.classList.remove('is-open');
        // Clean up panels when drawer fully closed
        setTimeout(() => {
          if (!activeCategory) {
            panels.forEach((panel) => panel.classList.remove('is-active'));
          }
        }, 400);
      }
    };

    tabs.forEach((tab) => {
      const handleTrigger = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const category = tab.getAttribute('data-category');
        setCategory(category);
      };

      tab.addEventListener('click', handleTrigger);
      tab.addEventListener('keydown', handleTrigger);
    });
  }

  initCompetenciesAccordion();

  // --------------------------------------------------------------------------
  // Scroll-Driven Text Highlight (Progressive Character Reveal on Scroll)
  // Splits [data-highlight-text] elements into word/char spans and scrubs
  // opacity from 0.22 → 1.0 based on scroll progress through the element.
  // --------------------------------------------------------------------------
  function initScrollTextHighlight() {
    const containers = document.querySelectorAll('[data-highlight-text]');
    if (!containers.length) return;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const instances = [];

    containers.forEach((container) => {
      // 1. Extract plain text for aria-label before mutating DOM
      const fullText = container.textContent.replace(/\s+/g, ' ').trim();
      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', fullText);

      // 2. Parse scroll start/end from data attributes
      const scrollStartAttr = container.getAttribute('data-highlight-scroll-start') || 'top 88%';
      const scrollEndAttr = container.getAttribute('data-highlight-scroll-end') || 'bottom 60%';

      // 3. Split child nodes preserving <em> and other inline tags
      const charElements = [];

      function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text.length) return document.createDocumentFragment();

          const frag = document.createDocumentFragment();
          // Split by spaces to create word wraps
          const parts = text.split(/(\s+)/);

          parts.forEach((part) => {
            if (/^\s+$/.test(part)) {
              // Whitespace between words
              const spaceSpan = document.createElement('span');
              spaceSpan.className = 'highlight-space';
              spaceSpan.textContent = ' ';
              spaceSpan.setAttribute('aria-hidden', 'true');
              frag.appendChild(spaceSpan);
            } else if (part.length > 0) {
              // Actual word
              const wordSpan = document.createElement('span');
              wordSpan.className = 'highlight-word';
              wordSpan.setAttribute('aria-hidden', 'true');

              for (let i = 0; i < part.length; i++) {
                const charSpan = document.createElement('span');
                charSpan.className = 'highlight-char';
                charSpan.textContent = part[i];
                charSpan.setAttribute('aria-hidden', 'true');
                if (prefersReducedMotion) {
                  charSpan.style.opacity = '1';
                }
                wordSpan.appendChild(charSpan);
                charElements.push(charSpan);
              }

              frag.appendChild(wordSpan);
            }
          });

          return frag;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Preserve inline elements like <em>, <strong>, <br>, etc.
          if (node.tagName === 'BR') {
            return node.cloneNode(false);
          }

          const cloned = document.createElement(node.tagName);
          // Copy attributes
          for (const attr of node.attributes) {
            cloned.setAttribute(attr.name, attr.value);
          }

          // Process children recursively
          node.childNodes.forEach((child) => {
            const result = processNode(child);
            if (result) cloned.appendChild(result);
          });

          return cloned;
        }
        return null;
      }

      // Build new content
      const newContent = document.createDocumentFragment();
      Array.from(container.childNodes).forEach((child) => {
        const result = processNode(child);
        if (result) newContent.appendChild(result);
      });

      // Replace container contents
      container.innerHTML = '';
      container.appendChild(newContent);

      if (prefersReducedMotion) return;

      // 4. Parse scroll trigger positions
      // Format: "top 88%" means element's top edge at 88% of viewport
      // Format: "bottom 60%" means element's bottom edge at 60% of viewport
      function parseScrollPosition(attr) {
        const parts = attr.trim().split(/\s+/);
        return {
          edge: parts[0] || 'top',         // 'top' or 'bottom' of element
          viewport: parseFloat(parts[1]) / 100 || 0.5  // fraction of viewport height
        };
      }

      const scrollStart = parseScrollPosition(scrollStartAttr);
      const scrollEnd = parseScrollPosition(scrollEndAttr);

      instances.push({
        container,
        chars: charElements,
        scrollStart,
        scrollEnd,
        isInView: false
      });
    });

    if (prefersReducedMotion || instances.length === 0) return;

    // 5. Main update function – called on every scroll frame
    let ticking = false;

    function updateHighlights() {
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 800;

      instances.forEach((inst) => {
        if (!inst.isInView) return;

        const rect = inst.container.getBoundingClientRect();
        const totalChars = inst.chars.length;
        if (totalChars === 0) return;

        // Calculate scroll start/end positions in viewport pixels
        const startEdgePx = inst.scrollStart.edge === 'bottom'
          ? rect.bottom
          : rect.top;
        const startThresholdPx = viewportH * inst.scrollStart.viewport;

        const endEdgePx = inst.scrollEnd.edge === 'bottom'
          ? rect.bottom
          : rect.top;
        const endThresholdPx = viewportH * inst.scrollEnd.viewport;

        // Total scroll range
        const totalRange = startThresholdPx - endThresholdPx;
        if (totalRange <= 0) return;

        // Current progress from 0 (at startThresholdPx) to 1 (at endThresholdPx)
        const currentPx = startEdgePx;
        const rawProgress = (startThresholdPx - currentPx) / totalRange;
        const progress = Math.max(0, Math.min(1, rawProgress));

        // Soft gradient window width (chars that are in transition)
        const windowWidth = Math.max(4, Math.min(8, totalChars * 0.06));

        // Current "cursor" position scaled so all chars reach opacity 1.0 when progress reaches 1.0
        const cursorPos = progress * (totalChars + windowWidth);

        const baseOpacity = 0.12;
        for (let i = 0; i < totalChars; i++) {
          let opacity;
          if (progress >= 1 || i < cursorPos - windowWidth) {
            // Fully revealed
            opacity = 1;
          } else if (progress <= 0 || i > cursorPos) {
            // Not yet reached (less visible unrevealed text)
            opacity = baseOpacity;
          } else {
            // In the transition window – smooth gradient
            const windowProgress = (cursorPos - i) / windowWidth;
            opacity = baseOpacity + (1 - baseOpacity) * Math.max(0, Math.min(1, windowProgress));
          }

          // Only write to DOM if value changed meaningfully (avoid layout thrashing)
          const rounded = Math.round(opacity * 50) / 50; // Snap to 0.02 increments
          if (inst.chars[i]._lastOpacity !== rounded) {
            inst.chars[i].style.opacity = rounded;
            inst.chars[i]._lastOpacity = rounded;
          }
        }
      });

      ticking = false;
    }

    function requestHighlightUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHighlights);
      }
    }

    // 6. IntersectionObserver to process visible and near-visible containers
    const highlightObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const inst = instances.find((i) => i.container === entry.target);
        if (inst) {
          inst.isInView = entry.isIntersecting;
          if (entry.isIntersecting) {
            requestHighlightUpdate();
          }
        }
      });
    }, {
      root: null,
      threshold: 0,
      rootMargin: '250px 0px 250px 0px'
    });

    instances.forEach((inst) => highlightObserver.observe(inst.container));

    // 7. Bind to scroll events (Lenis + native fallback)
    window.addEventListener('scroll', requestHighlightUpdate, { passive: true });
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.on('scroll', requestHighlightUpdate);
    }

    // 8. Handle resize (viewport height changes)
    window.addEventListener('resize', requestHighlightUpdate, { passive: true });

    // 9. Initial update
    requestHighlightUpdate();
  }

  initScrollTextHighlight();

  // --------------------------------------------------------------------------
  // Scroll-Driven Image Curtain Reveal (Top-to-Bottom Unroll on Scroll)
  // --------------------------------------------------------------------------
  function initScrollImageCurtain() {
    const elements = document.querySelectorAll('[data-curtain-reveal], .about-portrait-wrap');
    if (!elements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const instances = [];

    elements.forEach((container) => {
      const img = container.querySelector('img, video');
      if (!img) return;

      const startAttr = container.getAttribute('data-curtain-start') || 'top 92%';
      const endAttr = container.getAttribute('data-curtain-end') || 'top 64%';

      function parsePos(attr) {
        const parts = attr.trim().split(/\s+/);
        return {
          edge: parts[0] || 'top',
          viewport: parseFloat(parts[1]) / 100 || 0.5
        };
      }

      instances.push({
        container,
        img,
        start: parsePos(startAttr),
        end: parsePos(endAttr),
        isInView: true
      });
    });

    let ticking = false;

    function updateCurtains() {
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;

      instances.forEach((inst) => {
        if (!inst.isInView) return;

        const rect = inst.container.getBoundingClientRect();
        const startEdgePx = inst.start.edge === 'bottom' ? rect.bottom : rect.top;
        const startThresholdPx = vh * inst.start.viewport;

        const endEdgePx = inst.end.edge === 'bottom' ? rect.bottom : rect.top;
        const endThresholdPx = vh * inst.end.viewport;

        const totalRange = startThresholdPx - endThresholdPx;
        if (totalRange <= 0) return;

        const currentPx = startEdgePx;
        const rawProgress = (startThresholdPx - currentPx) / totalRange;
        const progress = Math.max(0, Math.min(1, rawProgress));

        // Smooth cubic easing for slow, gentle unrolling
        const eased = progress <= 0 ? 0 : progress >= 1 ? 1 : (progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2);

        const insetBottom = Math.round((1 - eased) * 1000) / 10;
        const translateY = Math.round((1 - eased) * -20 * 10) / 10;

        inst.img.style.clipPath = `inset(0 0 ${insetBottom}% 0)`;
        inst.img.style.transform = `translate3d(0, ${translateY}px, 0)`;
      });

      ticking = false;
    }

    function requestCurtainUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateCurtains);
      }
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const inst = instances.find((i) => i.container === entry.target);
        if (inst) {
          inst.isInView = entry.isIntersecting;
          if (entry.isIntersecting) {
            requestCurtainUpdate();
          }
        }
      });
    }, {
      root: null,
      threshold: 0,
      rootMargin: '250px 0px 250px 0px'
    });

    instances.forEach((inst) => obs.observe(inst.container));

    window.addEventListener('scroll', requestCurtainUpdate, { passive: true });
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.on('scroll', requestCurtainUpdate);
    }
    window.addEventListener('resize', requestCurtainUpdate, { passive: true });

    requestCurtainUpdate();
  }

  initScrollImageCurtain();
});








