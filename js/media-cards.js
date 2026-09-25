// 1. Photo Card
class PhotoCard extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('data-initialized')) return;
    this.setAttribute('data-initialized', 'true');

    const imageId = this.getAttribute('image-id');
    const cardClass = this.getAttribute('card-class') || '';
    const title = this.getAttribute('title') || '';
    const meta = this.getAttribute('meta') || '';
    const gallery = this.getAttribute('gallery') || 'photo-gallery';
    const alt = this.getAttribute('alt') || '';
    const name = this.getAttribute('name') || '';
    const sub = this.getAttribute('sub') || '';

    this.className = `photo-card ${cardClass}`;
    this.setAttribute('data-cinema-trigger', '');
    this.setAttribute('data-cinema-type', 'image');
    this.setAttribute('data-cinema-src', `assets/images/full/${imageId}`);
    this.setAttribute('data-cinema-title', title);
    this.setAttribute('data-cinema-meta', meta);
    this.setAttribute('data-cinema-gallery', gallery);

    const smSrc = `assets/images/sm/${imageId}`;
    const mdSrc = `assets/images/md/${imageId}`;
    const lgSrc = `assets/images/lg/${imageId}`;

    this.innerHTML = `
      <img decoding="async" class="photo-card-img" src="${mdSrc}" alt="${alt}" loading="lazy" 
           srcset="${smSrc} 480w, ${mdSrc} 960w, ${lgSrc} 1800w" 
           sizes="(max-width: 600px) 100vw, (max-width: 1024px) 100vw, 50vw">
      <div class="photo-card-overlay">
        <div class="photo-card-info">
          <h4>${name}</h4>
          <p>${sub}</p>
        </div>
      </div>
    `;
  }
}
customElements.define('photo-card', PhotoCard);

// 2. Ceramic Frame
class CeramicFrame extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('data-initialized')) return;
    this.setAttribute('data-initialized', 'true');

    const imageId = this.getAttribute('image-id');
    const title = this.getAttribute('title') || '';
    const meta = this.getAttribute('meta') || '';
    const gallery = this.getAttribute('gallery') || 'photo-ceramic';
    const alt = this.getAttribute('alt') || '';

    this.className = 'ceramic-frame';
    this.setAttribute('data-cinema-trigger', '');
    this.setAttribute('data-cinema-type', 'image');
    this.setAttribute('data-cinema-src', `assets/images/full/${imageId}`);
    this.setAttribute('data-cinema-title', title);
    this.setAttribute('data-cinema-meta', meta);
    this.setAttribute('data-cinema-gallery', gallery);

    const smSrc = `assets/images/sm/${imageId}`;
    const mdSrc = `assets/images/md/${imageId}`;

    this.innerHTML = `
      <img decoding="async" class="ceramic-img" src="${mdSrc}" alt="${alt}" loading="lazy" 
           srcset="${smSrc} 480w, ${mdSrc} 960w" 
           sizes="(max-width: 600px) 75vw, 320px">
    `;
  }
}
customElements.define('ceramic-frame', CeramicFrame);

// 3. Kunst Ticker Card
class KunstCard extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('data-initialized')) return;
    this.setAttribute('data-initialized', 'true');

    const imageId = this.getAttribute('image-id');
    const title = this.getAttribute('title') || '';
    const meta = this.getAttribute('meta') || '';
    const gallery = this.getAttribute('gallery') || 'akademische-kunst';
    const alt = this.getAttribute('alt') || '';
    const isClone = this.hasAttribute('clone-of');
    const cloneRef = this.getAttribute('clone-of');
    const cardId = this.getAttribute('card-id');

    if (cardId) this.id = cardId;

    this.className = 'kunst-ticker-card';
    this.setAttribute('data-cinema-trigger', '');
    this.setAttribute('data-cinema-type', 'image');
    this.setAttribute('data-cinema-src', `assets/images/full/${imageId}`);
    this.setAttribute('data-cinema-title', title || alt);
    this.setAttribute('data-cinema-meta', meta || 'Akademische Zeichnung • Figürliche Studie');
    this.setAttribute('data-cinema-gallery', gallery);
    
    if (isClone) {
      this.setAttribute('data-clone-of', cloneRef);
    }

    const mdSrc = `assets/images/md/${imageId}`;

    this.innerHTML = `
      <div class="kunst-ticker-img-box">
        <img decoding="async" class="kunst-ticker-img" src="${mdSrc}" alt="${alt}" loading="lazy">
      </div>
    `;
  }
}
customElements.define('kunst-card', KunstCard);
