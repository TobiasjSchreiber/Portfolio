class PortfolioText extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized) return;
    this.dataset.initialized = 'true';

    // Attribute auslesen
    const tag = this.getAttribute('tag') || '';
    const title = this.getAttribute('title') || '';
    const level = this.getAttribute('level') || '3'; 
    const extra = this.getAttribute('extra-classes') || '';
    const isReveal = this.getAttribute('reveal') !== 'false';
    const lettersFadeIn = this.hasAttribute('letters-fade-in') || this.hasAttribute('text-split');
    const splitBody = this.hasAttribute('split-body');
    
    // Textinhalt sichern
    const content = this.innerHTML.trim();

    // HTML-Struktur der Vorlage generieren: Titel erhält kinetic letter fade, Fließtext bleibt ultra-performant als Block
    this.innerHTML = `
      <div class="uni-text-block ${isReveal ? 'reveal-on-scroll uni-stagger-reveal' : ''} ${extra}">
        ${tag ? `<div class="uni-text-mask"><span class="uni-text-tag">${tag}</span></div>` : ''}
        ${title ? `<div class="uni-text-mask"><h${level} class="uni-text-title" ${lettersFadeIn ? 'letters-fade-in="" text-split=""' : ''}>${title}</h${level}></div>` : ''}
        ${content ? `<div class="uni-text-mask"><p class="uni-text-desc" ${splitBody ? 'letters-fade-in="" text-split=""' : ''}>${content}</p></div>` : ''}
      </div>
    `;

    if (extra) {
      extra.split(/\s+/).forEach(cls => {
        if (cls) this.classList.add(cls);
      });
    }

    // Das Host-Element selbst von Reveal- und Split-Attributen befreien
    this.removeAttribute('letters-fade-in');
    this.removeAttribute('text-split');
    this.removeAttribute('data-text-fade');
    this.classList.remove('reveal-on-scroll');
  }
}
customElements.define('portfolio-text', PortfolioText);
