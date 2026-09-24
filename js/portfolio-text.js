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
    
    // Textinhalt sichern
    const content = this.innerHTML.trim();

    // HTML-Struktur der Vorlage generieren
    this.innerHTML = `
      <div class="uni-text-block ${isReveal ? 'reveal-on-scroll uni-stagger-reveal' : ''} ${extra}">
        ${tag ? `<div class="uni-text-mask"><span class="uni-text-tag">${tag}</span></div>` : ''}
        ${title ? `<div class="uni-text-mask"><h${level} class="uni-text-title">${title}</h${level}></div>` : ''}
        ${content ? `<div class="uni-text-mask"><p class="uni-text-desc">${content}</p></div>` : ''}
      </div>
    `;

    // Das Host-Element selbst sollte reveal-on-scroll nicht mehr triggern
    this.classList.remove('reveal-on-scroll');
  }
}
customElements.define('portfolio-text', PortfolioText);
