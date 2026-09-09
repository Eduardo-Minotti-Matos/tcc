/**
 * Descomplica3D - Módulo de Acessibilidade (v2)
 * Corrigido: filtro de daltonismo NÃO é aplicado no body
 * (isso quebrava position:fixed do botão e da navbar).
 *
 * Inclua em todas as páginas:
 *   <script src="acessibilidade.js"></script>
 *   ou <script src="../acessibilidade.js"></script>
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'd3d_a11y';

  const DEFAULTS = {
    daltonismo: 'none',
    altoContraste: false,
    fonteGrande: false,
    espacamento: false,
    sublinharLinks: false,
    reduzirMovimento: false,
    destacarFoco: true
  };

  const FILTERS = {
    none: '',
    protanopia: 'url(#d3d-protanopia)',
    deuteranopia: 'url(#d3d-deuteranopia)',
    tritanopia: 'url(#d3d-tritanopia)',
    acromatopsia: 'grayscale(1) contrast(1.05)'
  };

  function loadPrefs() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }

  function isA11yNode(el) {
    if (!el || el.nodeType !== 1) return true;
    const id = el.id || '';
    return (
      id === 'd3d-a11y-btn' ||
      id === 'd3d-a11y-panel' ||
      id === 'd3d-a11y-svg' ||
      id === 'd3d-a11y-css'
    );
  }

  /** Aplica filtro nos filhos do body, exceto o painel/botão de acessibilidade */
  function applyDaltonismoFilter(type) {
    const value = FILTERS[type] || '';
    Array.from(document.body.children).forEach((el) => {
      if (isA11yNode(el)) {
        el.style.filter = 'none';
        return;
      }
      if (value) {
        el.style.filter = value;
        el.setAttribute('data-d3d-filter', '1');
      } else if (el.getAttribute('data-d3d-filter')) {
        el.style.filter = '';
        el.removeAttribute('data-d3d-filter');
      }
    });
  }

  function applyPrefs(prefs) {
    const root = document.documentElement;

    // NUNCA filtrar body/html — quebra position:fixed
    document.body.style.filter = '';
    root.style.filter = '';

    applyDaltonismoFilter(prefs.daltonismo);
    root.classList.toggle('d3d-has-daltonismo', prefs.daltonismo !== 'none');

    root.classList.toggle('d3d-alto-contraste', !!prefs.altoContraste);
    root.classList.toggle('d3d-fonte-grande', !!prefs.fonteGrande);
    root.classList.toggle('d3d-espacamento', !!prefs.espacamento);
    root.classList.toggle('d3d-sublinhar-links', !!prefs.sublinharLinks);
    root.classList.toggle('d3d-reduzir-movimento', !!prefs.reduzirMovimento);
    root.classList.toggle('d3d-destacar-foco', prefs.destacarFoco !== false);

    const sel = document.getElementById('d3d-daltonismo');
    if (sel) sel.value = prefs.daltonismo;
    setCheck('d3d-alto-contraste', prefs.altoContraste);
    setCheck('d3d-fonte-grande', prefs.fonteGrande);
    setCheck('d3d-espacamento', prefs.espacamento);
    setCheck('d3d-sublinhar-links', prefs.sublinharLinks);
    setCheck('d3d-reduzir-movimento', prefs.reduzirMovimento);
    setCheck('d3d-destacar-foco', prefs.destacarFoco);
  }

  function setCheck(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  }

  function injectSVGFilters() {
    if (document.getElementById('d3d-a11y-svg')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'd3d-a11y-svg';
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    svg.innerHTML = `
      <defs>
        <filter id="d3d-protanopia" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="
            0.567 0.433 0 0 0
            0.558 0.442 0 0 0
            0 0.242 0.758 0 0
            0 0 0 1 0"/>
        </filter>
        <filter id="d3d-deuteranopia" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="
            0.625 0.375 0 0 0
            0.7 0.3 0 0 0
            0 0.3 0.7 0 0
            0 0 0 1 0"/>
        </filter>
        <filter id="d3d-tritanopia" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="
            0.95 0.05 0 0 0
            0 0.433 0.567 0 0
            0 0.475 0.525 0 0
            0 0 0 1 0"/>
        </filter>
      </defs>`;
    document.body.appendChild(svg);
  }

  function injectStyles() {
    if (document.getElementById('d3d-a11y-css')) return;
    const style = document.createElement('style');
    style.id = 'd3d-a11y-css';
    style.textContent = `
      #d3d-a11y-btn {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        left: auto !important;
        top: auto !important;
        z-index: 2147483000 !important;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.25);
        cursor: pointer;
        background: #7c3aed !important;
        color: #fff !important;
        font-size: 22px;
        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5);
        display: flex !important;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background 0.2s;
        margin: 0 !important;
        filter: none !important;
        transform: none;
      }
      #d3d-a11y-btn:hover {
        background: #6d28d9 !important;
        transform: scale(1.06);
      }
      #d3d-a11y-btn:focus-visible {
        outline: 3px solid #fbbf24 !important;
        outline-offset: 3px;
      }

      #d3d-a11y-panel {
        position: fixed !important;
        bottom: 92px !important;
        right: 24px !important;
        left: auto !important;
        top: auto !important;
        z-index: 2147483001 !important;
        width: min(340px, calc(100vw - 32px));
        max-height: min(70vh, 520px);
        overflow-y: auto;
        background: #18181b !important;
        color: #fafafa !important;
        border: 1px solid #3f3f46;
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.55);
        padding: 20px;
        display: none;
        font-family: Inter, system-ui, sans-serif;
        filter: none !important;
        transform: none !important;
      }
      #d3d-a11y-panel.open { display: block !important; }

      #d3d-a11y-panel h3 {
        margin: 0 0 4px;
        font-size: 1.15rem;
        font-weight: 700;
        color: #fff !important;
      }
      #d3d-a11y-panel .d3d-sub {
        font-size: 0.8rem;
        color: #a1a1aa !important;
        margin: 0 0 16px;
      }
      #d3d-a11y-panel label.d3d-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid #27272a;
        font-size: 0.9rem;
        cursor: pointer;
        color: #f4f4f5 !important;
      }
      #d3d-a11y-panel select {
        background: #27272a !important;
        color: #fff !important;
        border: 1px solid #3f3f46;
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 0.85rem;
        max-width: 160px;
      }
      #d3d-a11y-panel input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #7c3aed;
        cursor: pointer;
      }
      #d3d-a11y-panel .d3d-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }
      #d3d-a11y-panel .d3d-actions button {
        flex: 1;
        padding: 10px;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
      }
      #d3d-a11y-reset { background: #27272a !important; color: #e4e4e7 !important; }
      #d3d-a11y-close { background: #7c3aed !important; color: #fff !important; }

      /* Com daltonismo: navbar sticky vira fixed (filtro quebra sticky) */
      html.d3d-has-daltonismo nav.sticky,
      html.d3d-has-daltonismo nav[class*="sticky"] {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        z-index: 50 !important;
      }
      /* Empurra o conteúdo: navbar fixed sai do fluxo e cobria o título */
      html.d3d-has-daltonismo body {
        padding-top: 88px !important;
        box-sizing: border-box;
      }
      html.d3d-has-daltonismo main,
      html.d3d-has-daltonismo body > section:not(nav),
      html.d3d-has-daltonismo body > header {
        scroll-margin-top: 96px;
      }

      /* Alto contraste — sem esconder botões da navbar */
      html.d3d-alto-contraste body {
        background: #000 !important;
        color: #fff !important;
      }
      html.d3d-alto-contraste .bg-zinc-900,
      html.d3d-alto-contraste .bg-zinc-950,
      html.d3d-alto-contraste .bg-black,
      html.d3d-alto-contraste nav {
        background: #000 !important;
      }
      html.d3d-alto-contraste a {
        color: #ffe566 !important;
      }
      html.d3d-alto-contraste .text-purple-400,
      html.d3d-alto-contraste .text-purple-500 {
        color: #ffe566 !important;
      }
      /* Botões de ação: contraste alto, mas continuam visíveis */
      html.d3d-alto-contraste main button,
      html.d3d-alto-contraste main .bg-purple-500,
      html.d3d-alto-contraste main .bg-purple-600,
      html.d3d-alto-contraste header button.bg-purple-500,
      html.d3d-alto-contraste header button.bg-purple-600 {
        background: #ffe566 !important;
        color: #000 !important;
        border: 2px solid #fff !important;
      }
      /* Navbar: não invertida a ponto de sumir */
      html.d3d-alto-contraste nav a,
      html.d3d-alto-contraste nav button,
      html.d3d-alto-contraste #userNav button,
      html.d3d-alto-contraste #userNav a,
      html.d3d-alto-contraste #userNav span {
        color: #fff !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      html.d3d-alto-contraste nav .bg-purple-600,
      html.d3d-alto-contraste nav .bg-purple-700,
      html.d3d-alto-contraste #userNav .bg-purple-600 {
        background: #7c3aed !important;
        color: #fff !important;
        border: 1px solid #fff !important;
      }

      html.d3d-fonte-grande { font-size: 118% !important; }
      html.d3d-fonte-grande body { line-height: 1.7 !important; }

      html.d3d-espacamento body,
      html.d3d-espacamento p,
      html.d3d-espacamento li {
        letter-spacing: 0.04em !important;
        word-spacing: 0.1em !important;
        line-height: 1.85 !important;
      }

      html.d3d-sublinhar-links a {
        text-decoration: underline !important;
        text-underline-offset: 3px !important;
      }

      html.d3d-reduzir-movimento *,
      html.d3d-reduzir-movimento *::before,
      html.d3d-reduzir-movimento *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }

      html.d3d-destacar-foco *:focus-visible {
        outline: 3px solid #fbbf24 !important;
        outline-offset: 3px !important;
      }

      @media (max-width: 480px) {
        #d3d-a11y-btn { bottom: 16px !important; right: 16px !important; width: 52px; height: 52px; }
        #d3d-a11y-panel { bottom: 80px !important; right: 16px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildUI() {
    if (document.getElementById('d3d-a11y-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'd3d-a11y-btn';
    btn.type = 'button';
    btn.title = 'Acessibilidade';
    btn.setAttribute('aria-label', 'Abrir menu de acessibilidade');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'd3d-a11y-panel');
    // Ícone com SVG inline (não depende do Font Awesome)
    btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm7 7h-5v12h-2v-5h-2v5H8V9H3V7h16v2z"/>
      </svg>`;

    const panel = document.createElement('div');
    panel.id = 'd3d-a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Opções de acessibilidade');
    panel.innerHTML = `
      <h3>Acessibilidade</h3>
      <p class="d3d-sub">Ajustes para leitura e visão. Preferências salvas neste dispositivo.</p>

      <label class="d3d-row">
        <span>Daltonismo / filtro de cores</span>
        <select id="d3d-daltonismo" aria-label="Tipo de filtro de daltonismo">
          <option value="none">Padrão</option>
          <option value="protanopia">Protanopia (vermelho)</option>
          <option value="deuteranopia">Deuteranopia (verde)</option>
          <option value="tritanopia">Tritanopia (azul)</option>
          <option value="acromatopsia">Escala de cinza</option>
        </select>
      </label>

      <label class="d3d-row">
        <span>Alto contraste</span>
        <input type="checkbox" id="d3d-alto-contraste">
      </label>

      <label class="d3d-row">
        <span>Aumentar fonte</span>
        <input type="checkbox" id="d3d-fonte-grande">
      </label>

      <label class="d3d-row">
        <span>Mais espaçamento</span>
        <input type="checkbox" id="d3d-espacamento">
      </label>

      <label class="d3d-row">
        <span>Sublinhar links</span>
        <input type="checkbox" id="d3d-sublinhar-links">
      </label>

      <label class="d3d-row">
        <span>Reduzir animações</span>
        <input type="checkbox" id="d3d-reduzir-movimento">
      </label>

      <label class="d3d-row">
        <span>Destacar foco (teclado)</span>
        <input type="checkbox" id="d3d-destacar-foco" checked>
      </label>

      <div class="d3d-actions">
        <button type="button" id="d3d-a11y-reset">Restaurar</button>
        <button type="button" id="d3d-a11y-close">Fechar</button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.getElementById('d3d-a11y-close').addEventListener('click', () => {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    });

    document.getElementById('d3d-a11y-reset').addEventListener('click', () => {
      const prefs = { ...DEFAULTS };
      savePrefs(prefs);
      applyPrefs(prefs);
    });

    const bind = (id, key, isSelect) => {
      const el = document.getElementById(id);
      el.addEventListener('change', () => {
        const prefs = loadPrefs();
        prefs[key] = isSelect ? el.value : el.checked;
        savePrefs(prefs);
        applyPrefs(prefs);
      });
    };

    bind('d3d-daltonismo', 'daltonismo', true);
    bind('d3d-alto-contraste', 'altoContraste', false);
    bind('d3d-fonte-grande', 'fonteGrande', false);
    bind('d3d-espacamento', 'espacamento', false);
    bind('d3d-sublinhar-links', 'sublinharLinks', false);
    bind('d3d-reduzir-movimento', 'reduzirMovimento', false);
    bind('d3d-destacar-foco', 'destacarFoco', false);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  function init() {
    injectStyles();
    injectSVGFilters();
    buildUI();
    applyPrefs(loadPrefs());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
