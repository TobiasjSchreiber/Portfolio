class CgiCard extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('data-initialized')) return;
    this.setAttribute('data-initialized', 'true');

    const type = this.getAttribute('type') || 'image';
    const imageId = this.getAttribute('image-id');
    const title = this.getAttribute('title') || '';
    const meta = this.getAttribute('meta') || '';
    const alt = this.getAttribute('alt') || '';
    const name = this.getAttribute('name') || '';
    const sub = this.getAttribute('sub') || '';

    // Add classes
    this.classList.add('cgi-parallax-card');
    if (this.hasAttribute('wide')) {
      this.classList.add('cgi-parallax-card-wide');
    }

    // Modal data attributes
    this.setAttribute('data-cinema-trigger', '');
    this.setAttribute('data-cinema-gallery', 'cgi-renders');
    this.setAttribute('data-cinema-title', title);
    this.setAttribute('data-cinema-meta', meta);
    this.setAttribute('data-cinema-type', type);

    let mediaHTML = '';

    if (type === 'image') {
      const basePath = 'assets/images';
      const fullSrc = `${basePath}/full/${imageId}`;
      const lgSrc = `${basePath}/lg/${imageId}`;
      const mdSrc = `${basePath}/md/${imageId}`;
      const smSrc = `${basePath}/sm/${imageId}`;
      
      this.setAttribute('data-cinema-src', fullSrc);

      mediaHTML = `
        <div class="cgi-parallax-img-box">
          <div class="cgi-parallax-img-wrap">
            <img decoding="async" class="cgi-parallax-media" 
                 src="${lgSrc}" 
                 srcset="${smSrc} 600w, ${mdSrc} 1200w, ${lgSrc} 2400w" 
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                 alt="${alt}" loading="lazy">
          </div>
        </div>
      `;
    } else if (type === 'video') {
      const videoSrc = this.getAttribute('video-src');
      const teaserSrc = this.getAttribute('teaser-src');
      const posterSrc = this.getAttribute('poster-src');
      const posterAttr = posterSrc ? ` poster="${posterSrc}"` : '';
      
      this.setAttribute('data-cinema-src', videoSrc);

      mediaHTML = `
        <div class="cgi-parallax-img-box">
          <div class="cgi-parallax-img-wrap seamless-video-wrap">
            <video class="cgi-parallax-media proxy-video" preload="auto" muted loop playsinline${posterAttr}>
              <source src="${teaserSrc}" type="video/mp4">
            </video>
            <video class="cgi-parallax-media full-video" preload="none" muted loop playsinline style="opacity: 0;">
              <source src="${videoSrc}" type="video/mp4">
            </video>
          </div>
          ${this.hasAttribute('audio') ? `
            <button class="video-audio-toggle is-muted cgi-audio-toggle" type="button" aria-label="Ton einschalten" title="Ton einschalten">
              <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
              <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      `;
    }

    const innerHTML = `
      ${mediaHTML}
      <div class="cgi-parallax-card-info">
        <h4 class="cgi-card-name">${name}</h4>
        <p class="cgi-card-sub">${sub}</p>
      </div>
    `;

    this.innerHTML = innerHTML;
  }
}

customElements.define('cgi-card', CgiCard);
