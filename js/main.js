/**
 * Comportamentos globais: menu, links centralizados, botões flutuantes e animações de entrada.
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  const wa = window.MaquiminasWhatsApp;
  const root = document.documentElement.dataset.root || '';

  const url = (path) => `${root}${path}`;

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Aplica em qualquer <a data-whatsapp> o link do WhatsApp (ou a página de contato, se não configurado). */
  function bindWhatsApp(scope = document) {
    scope.querySelectorAll('[data-whatsapp]').forEach((el) => {
      const link = wa.buildUrl(el.dataset.whatsappMessage || config.whatsappMensagemPadrao);
      if (link) {
        el.href = link;
        el.target = '_blank';
        el.rel = 'noopener';
      } else if (el.hasAttribute('data-whatsapp-optional')) {
        el.hidden = true;
      } else {
        el.href = url('pages/contato.html#canais');
        el.removeAttribute('target');
      }
    });
    if (wa.isConfigured()) {
      scope.querySelectorAll('[data-whatsapp-number]').forEach((el) => {
        el.textContent = wa.displayNumber();
      });
    }
  }

  function bindConfigLinks() {
    document.querySelectorAll('[data-config-link="areaCliente"]').forEach((el) => {
      el.href = config.areaCliente;
    });
    document.querySelectorAll('[data-config-link="instagram"]').forEach((el) => {
      el.href = config.instagram;
    });
    document.querySelectorAll('[data-config-text]').forEach((el) => {
      const value = el.dataset.configText.split('.').reduce((obj, key) => obj && obj[key], config);
      if (value) el.textContent = value;
    });
    const cnpj = config.empresa && config.empresa.cnpj;
    document.querySelectorAll('[data-empresa-cnpj]').forEach((el) => {
      if (!cnpj) {
        el.remove();
        return;
      }
      el.hidden = false;
      el.textContent = el.dataset.empresaCnpj === 'plain' ? cnpj : `CNPJ ${cnpj}`;
    });
    // Canais opcionais: exibidos somente quando configurados.
    document.querySelectorAll('[data-config-link="email"]').forEach((el) => {
      if (!config.email) return el.remove();
      el.hidden = false;
      el.href = `mailto:${config.email}`;
      const label = el.querySelector('[data-label]');
      if (label) label.textContent = config.email;
    });
    document.querySelectorAll('[data-config-link="telefone"]').forEach((el) => {
      if (!config.telefone) return el.remove();
      el.hidden = false;
      el.href = `tel:${config.telefone.replace(/[^\d+]/g, '')}`;
      const label = el.querySelector('[data-label]');
      if (label) label.textContent = config.telefone;
    });
    bindWhatsApp();
  }

  function setupMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  function setupFloating() {
    const wrap = document.createElement('div');
    wrap.className = 'floating';
    wrap.innerHTML = `
      <a class="fab-wa" data-whatsapp aria-label="Falar pelo WhatsApp">${window.MaquiminasIcons.get('whatsapp')}</a>`;
    document.body.appendChild(wrap);
    bindWhatsApp(wrap);
  }

  function setupReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((el) => observer.observe(el));
  }

  function observeReveal(scope) {
    scope.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

  function setYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  function setupMvpNotice() {
    if (/orcamento-maquiminas\.html$/.test(window.location.pathname)) return;
    const proposta = url('proposta/orcamento-maquiminas.html');
    const headerInner = document.querySelector('.site-header__inner');
    if (headerInner && !headerInner.querySelector('.mvp-badge')) {
      const badge = document.createElement('span');
      badge.className = 'mvp-badge';
      badge.textContent = 'Versão MVP';
      const brand = headerInner.querySelector('.brand');
      if (brand) brand.insertAdjacentElement('afterend', badge);
      else headerInner.prepend(badge);
    }
    const header = document.querySelector('.site-header');
    if (header && !document.querySelector('.mvp-bar')) {
      const bar = document.createElement('div');
      bar.className = 'mvp-bar';
      bar.innerHTML = `
        <div class="container mvp-bar__inner">
          <p>Este site está em <strong>versão MVP</strong>.</p>
          <a class="btn btn--sm" href="${proposta}" aria-label="Visualizar proposta para adquirir o projeto">Visualizar proposta</a>
        </div>`;
      header.insertAdjacentElement('afterend', bar);
    }
    const bottom = document.querySelector('.footer-bottom');
    if (bottom && !bottom.querySelector('[data-mvp-proposta]')) {
      const a = document.createElement('a');
      a.href = proposta;
      a.dataset.mvpProposta = '1';
      a.setAttribute('aria-label', 'Visualizar proposta para adquirir o projeto');
      a.textContent = 'Visualizar proposta';
      bottom.appendChild(a);
    }
  }

  window.Maquiminas = Object.freeze({ root, url, escapeHtml, bindWhatsApp, observeReveal });

  window.MaquiminasIcons.render();
  bindConfigLinks();
  setupMenu();
  setupMvpNotice();
  setupFloating();
  setupReveal();
  setYear();
})();
