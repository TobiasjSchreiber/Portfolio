/**
 * TOBIAS SCHREIBER — PORTFOLIO (MEDIENTECHNIK)
 * Section 03 / Fotografie: Liquid Glass Reflector mit 16-Tap Chromatischer Aberration
 * Exakte Shader-Architektur & Mathematik von Gionatan Nese (gionatannese.com)
 *
 * - Sphärisches Sag-Linsenprofil an uBandTop & uBandBot
 * - 16-Tap Spektrale Farbzerlegung (Dispersion: Rot / Grün / Blau)
 * - 1:1 Screen-Space-Abtastung aller Fotomotive in #fotografie
 * - Mitte des Bildschirms ist 100% transparent (freie Sicht auf Text & Grid)
 * - Keine künstlichen Aufhellungen / Zero Blue Tint gem. GEMINI.md
 */

(function () {
  'use strict';

  function initPhotoReflector() {
    console.log("initPhotoReflector called");
    if (window.innerWidth <= 768) return; // Deaktiviert auf mobilen Geräten
    if (typeof THREE === 'undefined') {
      setTimeout(initPhotoReflector, 60);
      return;
    }

    const photoSection = document.getElementById('fotografie');
    if (!photoSection) return;

    let container = document.getElementById('photo-liquid-reflector');
    if (!container) {
      container = document.createElement('div');
      container.id = 'photo-liquid-reflector';
      container.className = 'photo-liquid-reflector';
      container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(container);
    }

    // ------------------------------------------------------------------------
    // 1. Fullscreen Offscreen Capture Canvas
    // ------------------------------------------------------------------------
    let winW = window.innerWidth;
    let winH = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = Math.round(winW);
    screenCanvas.height = Math.round(winH);
    const screenCtx = screenCanvas.getContext('2d', { alpha: true });

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;
    screenTexture.generateMipmaps = false;

    // ------------------------------------------------------------------------
    // 2. Three.js Scene, Camera & Renderer
    // ------------------------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false
    });
    renderer.setClearColor(0x000000, 0.0);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(winW, winH);
    container.appendChild(renderer.domElement);

    // Force LinearEncoding (3000) so WebGL doesn't touch the color values at all.
    // The browser gives us sRGB pixels, we process them as raw numbers, and output them as raw numbers.
    // This guarantees a 100% identical color match with the background DOM image!
    screenTexture.encoding = 3000;

    // ------------------------------------------------------------------------
    // 3. GLSL Shader (Original Gionatan Nese Sag-Lens & 16-Tap Spectral Dispersion)
    // ------------------------------------------------------------------------
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform sampler2D tDiffuse;
      uniform float uBandTop;
      uniform float uBandBot;
      uniform float uStrength;
      uniform float uCurve;
      uniform float uChromaticAberration;
      uniform float uTime;
      uniform vec2 uMouse;

      varying vec2 vUv;

      // Spherical lens sagitta profile (from gionatannese.com)
      float sag(float t) {
        t = clamp(pow(t, uCurve), 0.0, 1.0);
        return 1.0 - sqrt(1.0 - t * t);
      }

      void main() {
        vec2 uv = vUv; 
        float dist = 0.0;
        float edgeAlpha = 1.0;

        if (uBandTop > 0.0 && uv.y > 1.0 - uBandTop) {
          float t = (uv.y - (1.0 - uBandTop)) / uBandTop;
          dist = sag(t) * uBandTop * uStrength;
          uv.y -= dist;
        } else if (uBandBot > 0.0 && uv.y < uBandBot) {
          float t = (uBandBot - uv.y) / uBandBot;
          dist = sag(t) * uBandBot * uStrength;
          uv.y += dist;
        }

        if (dist <= 0.0001) {
          gl_FragColor = vec4(0.0);
          return;
        }

        uv = clamp(uv, vec2(0.001), vec2(0.999));

        vec3 finalColor = vec3(0.0);
        vec3 weightSum = vec3(0.0);
        float totalAlpha = 0.0;

        for (int i = 0; i < 16; i++) {
          float t = float(i) / 15.0;
          vec3 w = vec3(
            smoothstep(0.8, 0.2, t),
            smoothstep(0.0, 0.5, t) * smoothstep(1.0, 0.5, t),
            smoothstep(0.2, 0.8, t)
          );

          float shift = (t - 0.5) * uChromaticAberration * dist * 35.0;
          vec2 sampleUv = clamp(uv + vec2(0.0, shift), vec2(0.001), vec2(0.999));

          vec4 c = texture2D(tDiffuse, sampleUv);
          finalColor += c.rgb * w;
          weightSum += w;
          totalAlpha += c.a;
        }

        finalColor /= weightSum;
        totalAlpha /= 16.0;

        if (totalAlpha <= 0.001) {
          gl_FragColor = vec4(0.0);
          return;
        }

        gl_FragColor = vec4(finalColor, totalAlpha);
      }
    `;

    // ------------------------------------------------------------------------
    // 4. Uniforms, Material & Fullscreen Quad
    // ------------------------------------------------------------------------
    const uniforms = {
      tDiffuse: { value: screenTexture },
      uBandTop: { value: 0.10 },              // 10% height top
      uBandBot: { value: 0.10 },              // 10% height bottom
      uStrength: { value: 1.2 },              // Refraction strength
      uCurve: { value: 1.2 },                 // Slightly steeper curve
      uChromaticAberration: { value: 0.035 }, // More noticeable RGB split
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false
    });

    const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quadMesh.frustumCulled = false;
    scene.add(quadMesh);

    // ------------------------------------------------------------------------
    // 5. High-Performance Screen-Space Sampling
    // ------------------------------------------------------------------------
    let photoImages = [];
    function cachePhotos() {
      photoImages = Array.from(photoSection.querySelectorAll('.photo-card img, .ceramic-frame img'));
      photoImages.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', samplePhotos, { once: true });
        }
      });
    }
    cachePhotos();
    window.addEventListener('load', () => {
      cachePhotos();
      samplePhotos();
    });

    function samplePhotos() {
      winW = window.innerWidth;
      winH = window.innerHeight;

      // Create a high-res canvas to match the screen's pixel density
      screenCanvas.width = Math.round(winW * pixelRatio);
      screenCanvas.height = Math.round(winH * pixelRatio);
      screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

      // We must scale the context so our logical bounding rects map correctly to the high-res canvas
      screenCtx.save();
      screenCtx.scale(pixelRatio, pixelRatio);

      for (let i = 0; i < photoImages.length; i++) {
        const img = photoImages[i];
        if (!img.complete || img.naturalWidth === 0) continue;

        const imgRect = img.getBoundingClientRect();
        const parent = img.closest('.photo-card, .ceramic-frame, .cgi-parallax-card, .cinematic-video');
        const parentRect = parent ? parent.getBoundingClientRect() : imgRect;

        // Skip if outside viewport
        if (parentRect.bottom < -60 || parentRect.top > winH + 60 || parentRect.right < -40 || parentRect.left > winW + 40) continue;
        if (imgRect.width <= 0 || imgRect.height <= 0) continue;

        try {
          const computedStyle = window.getComputedStyle(img);
          if (computedStyle.filter !== 'none') {
            screenCtx.filter = computedStyle.filter;
          } else {
            screenCtx.filter = 'none';
          }
          
          screenCtx.save();
          
          // 1. Replicate `overflow: hidden` of the parent container!
          // This ensures scaled or parallax-shifted images do not spill into the reflection!
          screenCtx.beginPath();
          screenCtx.rect(Math.round(parentRect.left), Math.round(parentRect.top), Math.round(parentRect.width), Math.round(parentRect.height));
          screenCtx.clip();

          // 1.5. Replicate `overflow: hidden` of any scrolling carousel wrappers!
          const wrapper = img.closest('.ceramic-strip-wrap, .ceramic-strip');
          if (wrapper) {
            const wrapperRect = wrapper.getBoundingClientRect();
            screenCtx.beginPath();
            screenCtx.rect(Math.round(wrapperRect.left), Math.round(wrapperRect.top), Math.round(wrapperRect.width), Math.round(wrapperRect.height));
            screenCtx.clip();
          }

          // 2. Replicate `object-fit: cover` math using ONLY destination coordinates!
          // Using sx, sy, sw, sh causes high-DPI srcset bugs where the browser crops the top-left!
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const rectRatio = imgRect.width / imgRect.height;
          
          let dw, dh, dx, dy;
          
          if (imgRatio > rectRatio) {
            dh = imgRect.height;
            dw = imgRect.height * imgRatio;
            dx = imgRect.left - (dw - imgRect.width) / 2;
            dy = imgRect.top;
          } else {
            dw = imgRect.width;
            dh = imgRect.width / imgRatio;
            dx = imgRect.left;
            dy = imgRect.top - (dh - imgRect.height) / 2;
          }
          
          // 3. Draw the full image mapped to the covering coordinates, relying on parent clip to hide overflow
          screenCtx.drawImage(img, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
          
          screenCtx.restore(); // removes clipping and filter
        } catch (e) {
        }
      }

      screenCtx.restore();
      screenTexture.needsUpdate = true;
    }

    function onResize() {
      winW = window.innerWidth;
      winH = window.innerHeight;

      screenCanvas.width = Math.round(winW);
      screenCanvas.height = Math.round(winH);

      renderer.setSize(winW, winH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      samplePhotos();
    }
    let lastPhotoWinW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && window.innerWidth === lastPhotoWinW) return;
      lastPhotoWinW = window.innerWidth;
      onResize();
    }, { passive: true });

    // ------------------------------------------------------------------------
    // 6. Intersection & Lifecycle Controller
    // ------------------------------------------------------------------------
    let isActive = false;
    let animFrameId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate();
          } else {
            deactivate();
          }
        });
      },
      { root: null, rootMargin: '100px 0px 100px 0px', threshold: 0 }
    );
    observer.observe(photoSection);

    function activate() {
      if (isActive) return;
      console.log("Photo Reflector ACTIVATED");
      isActive = true;
      container.classList.add('is-active');
      samplePhotos();
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    }

    function deactivate() {
      if (!isActive) return;
      isActive = false;
      container.classList.remove('is-active');
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }

    // ------------------------------------------------------------------------
    // 7. Mouse & Scroll Listeners
    // ------------------------------------------------------------------------
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;

    window.addEventListener(
      'mousemove',
      (e) => {
        targetMouseX = e.clientX / window.innerWidth;
        targetMouseY = 1.0 - e.clientY / window.innerHeight;
      },
      { passive: true }
    );

    function onScrollUpdate() {
      if (!isActive) return;
      samplePhotos();
    }

    window.addEventListener('scroll', onScrollUpdate, { passive: true });

    function attachLenis() {
      if (window.lenis && typeof window.lenis.on === 'function') {
        window.lenis.on('scroll', onScrollUpdate);
      } else {
        setTimeout(attachLenis, 250);
      }
    }
    attachLenis();

    // ------------------------------------------------------------------------
    // 8. 60fps Render Loop
    // ------------------------------------------------------------------------
    const clock = new THREE.Clock();

    function renderLoop() {
      if (!isActive) return;

      const elapsedTime = clock.getElapsedTime();

      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      uniforms.uTime.value = elapsedTime;
      uniforms.uMouse.value.set(currentMouseX, currentMouseY);

      samplePhotos();

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    }
  }

  // Defer heavy Three.js initialization so it doesn't block LCP/DOM rendering
  function lazyInit() {
    const photoSection = document.getElementById('fotografie');
    if (!photoSection) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          // Initialize WebGL in the next animation frame to prevent stutter
          requestAnimationFrame(() => requestAnimationFrame(initPhotoReflector));
        }
      }, { rootMargin: '800px 0px 800px 0px' });
      observer.observe(photoSection);
    } else {
      // Fallback
      window.addEventListener('load', () => setTimeout(initPhotoReflector, 800));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lazyInit);
  } else {
    lazyInit();
  }
})();
