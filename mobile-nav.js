/**
 * Menu mobile compartilhado — Descomplica3D
 * Coloque depois do script.js em todas as páginas.
 */
(function () {
  'use strict';

  function getPrefix() {
    // Detecta se está em subpasta (produtos/, arquivos/)
    const path = window.location.pathname || '';
    if (path.includes('/produtos/') || path.includes('/arquivos/')) return '../';
    return '';
  }

  function ensureStyles() {
    if (document.getElementById('d3d-mobile-css')) return;
    const style = document.createElement('style');
    style.id = 'd3d-mobile-css';
    style.textContent = `
      /* Botão hambúrguer */
      #d3d-menu-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(39,39,42,0.9);
        color: #fff;
        cursor: pointer;
        flex-shrink: 0;
      }
      #d3d-menu-btn:hover { background: #3f3f46; }

      /* Drawer mobile */
      #d3d-mobile-menu {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 200;
      }
      #d3d-mobile-menu.open { display: block; }
      #d3d-mobile-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.65);
        backdrop-filter: blur(4px);
      }
      #d3d-mobile-panel {
        position: absolute;
        top: 0;
        right: 0;
        width: min(300px, 86vw);
        height: 100%;
        background: #09090b;
        border-left: 1px solid #27272a;
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: -12px 0 40px rgba(0,0,0,0.5);
        animation: d3dSlideIn 0.22s ease-out;
      }
      @keyframes d3dSlideIn {
        from { transform: translateX(100%); opacity: 0.6; }
        to { transform: translateX(0); opacity: 1; }
      }
      #d3d-mobile-panel a,
      #d3d-mobile-panel button.d3d-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 14px;
        color: #f4f4f5;
        font-weight: 500;
        font-size: 1rem;
        text-decoration: none;
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
      }
      #d3d-mobile-panel a:hover,
      #d3d-mobile-panel button.d3d-link:hover {
        background: #27272a;
        color: #c084fc;
      }
      #d3d-mobile-panel .d3d-menu-title {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #71717a;
        padding: 8px 16px 4px;
      }
      #d3d-mobile-close {
        align-self: flex-end;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid #3f3f46;
        background: #18181b;
        color: #fff;
        font-size: 1.25rem;
        cursor: pointer;
        margin-bottom: 12px;
      }

      /* Ajustes gerais mobile */
      @media (max-width: 767px) {
        #d3d-menu-btn { display: inline-flex !important; }

        /* Hero index */
        header.h-screen h2,
        header .text-6xl,
        header .md\\:text-7xl {
          font-size: 2.35rem !important;
          line-height: 1.1 !important;
        }
        header .text-xl {
          font-size: 1rem !important;
        }
        header .flex.gap-4 {
          flex-direction: column !important;
          width: 100%;
        }
        header .flex.gap-4 > button {
          width: 100%;
          justify-content: center;
        }

        /* Logo menor */
        nav .logo-font.text-3xl {
          font-size: 1.35rem !important;
        }

        /* Cards de produto */
        #products-grid img,
        #arquivos-grid img {
          height: 220px !important;
        }

        /* Detalhe */
        #detailName {
          font-size: 1.75rem !important;
        }
        #detailPrice {
          font-size: 2rem !important;
        }
        #btnAddCart {
          width: 100% !important;
          padding-left: 1.5rem !important;
          padding-right: 1.5rem !important;
        }
        model-viewer {
          height: 360px !important;
        }

        /* Carrinho */
        #cartItems .sm\\:flex-row {
          flex-direction: column;
        }

        /* Evita zoom estranho em inputs no iOS */
        input, select, textarea {
          font-size: 16px !important;
        }

        /* Padding inferior para não cobrir com botão de acessibilidade */
        body {
          padding-bottom: 72px;
        }
      }

      @media (max-width: 380px) {
        header.h-screen h2 {
          font-size: 1.9rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildMenu() {
    if (document.getElementById('d3d-menu-btn')) return;

    const prefix = getPrefix();
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Container da direita da navbar (último flex com ícones)
    const bar = nav.querySelector('.max-w-7xl') || nav.firstElementChild;
    if (!bar) return;

    const btn = document.createElement('button');
    btn.id = 'd3d-menu-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Abrir menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

    // Insere o botão no final da barra
    bar.appendChild(btn);

    const drawer = document.createElement('div');
    drawer.id = 'd3d-mobile-menu';
    drawer.innerHTML = `
      <div id="d3d-mobile-backdrop"></div>
      <div id="d3d-mobile-panel" role="dialog" aria-label="Menu de navegação">
        <button type="button" id="d3d-mobile-close" aria-label="Fechar menu">×</button>
        <p class="d3d-menu-title">Navegação</p>
        <a href="${prefix}index.html"><i class="fa-solid fa-house" style="width:20px"></i> Início</a>
        <a href="${prefix}produtos/PaginaPrincipalProdutos.html"><i class="fa-solid fa-cube" style="width:20px"></i> Produtos</a>
        <a href="${prefix}arquivos/PaginaPrincipalArquivos.html"><i class="fa-solid fa-file" style="width:20px"></i> Arquivos</a>
        <a href="${prefix}carrinho.html"><i class="fa-solid fa-cart-shopping" style="width:20px"></i> Carrinho</a>
        <p class="d3d-menu-title" style="margin-top:12px">Conta</p>
        <a href="${prefix}index.html#login"><i class="fa-solid fa-user" style="width:20px"></i> Entrar / Cadastrar</a>
      </div>
    `;
    document.body.appendChild(drawer);

    function open() {
      drawer.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', open);
    drawer.querySelector('#d3d-mobile-close').addEventListener('click', close);
    drawer.querySelector('#d3d-mobile-backdrop').addEventListener('click', close);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function init() {
    ensureStyles();
    buildMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
