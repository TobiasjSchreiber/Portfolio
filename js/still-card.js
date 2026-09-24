class StillCard extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('data-initialized')) return;
    this.setAttribute('data-initialized', 'true');

    const imageId = this.getAttribute('image-id');
    const title = this.getAttribute('title') || '';
    const meta = this.getAttribute('meta') || '';
    const alt = this.getAttribute('alt') || '';
    const gallery = this.getAttribute('gallery') || '';
    const caption = this.getAttribute('caption') || '';
    const hasLg = this.hasAttribute('has-lg');

    // CSS Klassen setzen
    this.classList.add('still-card');

    // Modal data attributes
    this.setAttribute('data-cinema-trigger', '');
    this.setAttribute('data-cinema-type', 'image');
    this.setAttribute('data-cinema-gallery', gallery);
    this.setAttribute('data-cinema-title', title);
    this.setAttribute('data-cinema-meta', meta);

    const basePath = 'assets/images';
    const fullSrc = `${basePath}/full/${imageId}`;
    const mdSrc = `${basePath}/md/${imageId}`;
    const smSrc = `${basePath}/sm/${imageId}`;
    
    this.setAttribute('data-cinema-src', fullSrc);

    // Build srcset
    let srcset = `${smSrc} 480w, ${mdSrc} 960w`;
    let defaultSrc = mdSrc; // Fallback src

    if (hasLg) {
      const lgSrc = `${basePath}/lg/${imageId}`;
      // Assuming 1800w for lg if not specified, but 1200w/1800w is fine. Browser picks best.
      // We will use 1800w as generic lg width for still cards
      srcset += `, ${lgSrc} 1800w`;
      defaultSrc = lgSrc;
    } else {
      defaultSrc = smSrc; // Forkasern images, the original HTML used sm for src fallback
    }

    this.innerHTML = `
      <img decoding="async" class="still-img" 
           src="${defaultSrc}" 
           alt="${alt}" loading="lazy" 
           srcset="${srcset}" 
           sizes="(max-width: 768px) 75vw, 340px">
      <div class="still-caption">${caption}</div>
    `;
  }
}

customElements.define('still-card', StillCard);
