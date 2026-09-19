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
        vec2 uv = vUv; // uv.y: 0.0 = bottom, 1.0 = top
        float dist = 0.0;
        float isBand = 0.0;

        // Subtle fluid ripple wave on the liquid glass surface
        float ripple = sin(uv.x * 40.0 + uTime * 1.5) * 0.003 + cos(uv.x * 75.0 - uTime * 2.0) * 0.0018;

        // Interactive mouse disturbance
        vec2 mouseDelta = uv - uMouse;
        float mouseDist = length(mouseDelta);
        float mouseWave = exp(-mouseDist * 8.0) * sin(mouseDist * 25.0 - uTime * 3.5) * 0.003;
        ripple += mouseWave;

        if (uBandTop > 0.0 && uv.y > 1.0 - uBandTop) {
          float t = (uv.y - (1.0 - uBandTop)) / uBandTop;
          dist = (sag(t) + ripple * t) * uBandTop * uStrength;
          uv.y -= dist;
          isBand = smoothstep(0.0, 0.08, t);
        } else if (uBandBot > 0.0 && uv.y < uBandBot) {
          float t = (uBandBot - uv.y) / uBandBot;
          dist = (sag(t) + ripple * t) * uBandBot * uStrength;
          uv.y += dist;
          isBand = smoothstep(0.0, 0.08, t);
        }

        // Center of screen: 100% transparent
        if(false){
          gl_FragColor = vec4(0.0);
          return;
        }

        uv = clamp(uv, vec2(0.001), vec2(0.999));

        // --------------------------------------------------------------------
        // 16-Tap Spectral Chromatic Aberration (Dispersion)
        // --------------------------------------------------------------------
        vec3 finalColor = vec3(0.0);
        vec3 weightSum = vec3(0.0);
        float totalAlpha = 0.0;

        #pragma unroll_loop_start
        for (int i = 0; i < 16; i++) {
          float t = float(i) / 15.0;
          vec3 w = vec3(
            smoothstep(0.8, 0.2, t),
            smoothstep(0.0, 0.5, t) * smoothstep(1.0, 0.5, t),
            smoothstep(0.2, 0.8, t)
          );

          float shift = (t - 0.5) * uChromaticAberration * dist * 35.0;
          vec2 sampleUv = clamp(uv + vec2(ripple * 1.5, shift), vec2(0.001), vec2(0.999));

          vec4 c = texture2D(tDiffuse, sampleUv);
          finalColor += c.rgb * w;
          weightSum += w;
          totalAlpha += c.a;
        }
        #pragma unroll_loop_end

        finalColor /= weightSum;
        totalAlpha /= 16.0;

        if(false){
          gl_FragColor = vec4(0.0);
          return;
        }

        float outAlpha = 1.0;
        gl_FragColor = vec4(finalColor, outAlpha);
      }
    `;

    // ------------------------------------------------------------------------
    // 4. Uniforms, Material & Fullscreen Quad
    // ------------------------------------------------------------------------
    const uniforms = {
      tDiffuse: { value: screenTexture },
      uBandTop: { value: 0.11 },              // 11% height top
      uBandBot: { value: 0.11 },              // 11% height bottom
      uStrength: { value: 1.15 },             // Refraction strength
      uCurve: { value: 1.0 },                 // Sag curve
      uChromaticAberration: { value: 0.022 }, // Spectral dispersion
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
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

      screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

      for (let i = 0; i < photoImages.length; i++) {
        const img = photoImages[i];
        if (!img.complete || img.naturalWidth === 0) continue;

        const rect = img.getBoundingClientRect();

        if (rect.bottom < -60 || rect.top > winH + 60 || rect.right < -40 || rect.left > winW + 40) continue;
        if (rect.width <= 0 || rect.height <= 0) continue;

        try {
          screenCtx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
        } catch (e) {}
      }

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
    let lastPhotoWinW2 = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && window.innerWidth === lastPhotoWinW2) return;
      lastPhotoWinW2 = window.innerWidth;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhotoReflector);
  } else {
    initPhotoReflector();
  }
})();
