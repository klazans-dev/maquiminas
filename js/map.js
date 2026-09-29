/**
 * Mapa de atendimento: estados com entrega, área de frete grátis (raio a partir da
 * indústria, limitado aos estados configurados) e marcador da indústria.
 * Tudo é lido de MAQUIMINAS_CONFIG.presenca.
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  const mapa = window.MAQUIMINAS_BRASIL_MAPA;
  const { escapeHtml: esc } = window.Maquiminas;
  if (!mapa) return;

  const presenca = config.presenca || {};
  const industria = presenca.industria;
  const frete = presenca.freteGratis;
  const todos = presenca.entregaEstados === 'todos';
  const entrega = new Set(todos ? mapa.estados.map((e) => e.uf) : (presenca.entregaEstados || []).map((uf) => String(uf).toUpperCase()));
  const freteUfs = new Set(((frete && frete.estados) || []).map((uf) => String(uf).toUpperCase()));

  const { lonMin, latMax, k } = mapa.projecao;
  const project = (lat, lon) => [(lon - lonMin) * k, (latMax - lat) * k];

  document.querySelectorAll('[data-presence-map]').forEach((root) => {
    const svgWrap = root.querySelector('[data-presence-svg]');
    const tip = root.querySelector('[data-presence-tip]');
    const cidade = industria ? `${industria.cidade} (${industria.uf})` : '';

    root.querySelectorAll('[data-presence-count]').forEach((el) => { el.textContent = String(entrega.size); });
    root.querySelectorAll('[data-presence-count-label]').forEach((el) => {
      el.textContent = entrega.size === 1 ? 'estado atendido' : 'estados atendidos';
    });
    root.querySelectorAll('[data-presence-city]').forEach((el) => { if (cidade) el.textContent = cidade; });
    if (frete) {
      root.querySelectorAll('[data-presence-radius]').forEach((el) => { el.textContent = String(frete.raioKm); });
      root.querySelectorAll('[data-presence-radius-text]').forEach((el) => { el.textContent = `${frete.raioKm} km`; });
    }

    const statusOf = (uf) => {
      const parts = [];
      if (industria && uf === industria.uf) parts.push(`Indústria em ${industria.cidade}`);
      if (frete && freteUfs.has(uf)) parts.push(`Entrega · frete grátis até ${frete.raioKm} km da indústria`);
      else if (entrega.has(uf)) parts.push('Entrega · frete informado no orçamento');
      else parts.push('Atendimento sob consulta');
      return parts;
    };

    const paths = mapa.estados
      .map((e) => {
        const on = entrega.has(e.uf);
        return `<path class="uf${on ? ' is-on' : ''}" data-uf="${e.uf}" data-nome="${esc(e.nome)}" d="${e.d}" aria-hidden="true"/>`;
      })
      .join('');

    let freeZone = '';
    let factory = '';
    if (industria) {
      const [fx, fy] = project(industria.lat, industria.lon);
      if (frete && frete.raioKm) {
        const ry = (frete.raioKm / 111.2) * k;
        const rx = (frete.raioKm / (111.32 * Math.cos((industria.lat * Math.PI) / 180))) * k;
        const clip = mapa.estados.filter((e) => freteUfs.has(e.uf)).map((e) => `<path d="${e.d}"/>`).join('');
        freeZone = `
          <defs><clipPath id="mq-free-clip">${clip}</clipPath></defs>
          <g class="free-zone" aria-hidden="true">
            <ellipse class="free-zone__fill" cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" clip-path="url(#mq-free-clip)"/>
            <ellipse class="free-zone__edge" cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"/>
          </g>`;
      }
      factory = `
        <g class="factory" transform="translate(${fx.toFixed(1)} ${fy.toFixed(1)})" aria-hidden="true">
          <circle class="factory__ring" r="12"/>
          <circle class="factory__dot" r="6"/>
        </g>`;
    }

    const resumo = `Mapa do Brasil: entrega em ${todos ? 'todos os estados' : `${entrega.size} estados`}${
      industria ? `, indústria em ${cidade}` : ''
    }${frete ? ` e frete grátis em um raio de ${frete.raioKm} km da indústria no sentido ${frete.regiao}` : ''}.`;

    svgWrap.innerHTML = `<svg viewBox="${mapa.viewBox}" role="group" aria-label="${esc(resumo)}" focusable="false">${paths}${freeZone}${factory}</svg>`;
    if (industria) {
      const [fx, fy] = project(industria.lat, industria.lon);
      const [, , vw, vh] = mapa.viewBox.split(' ').map(Number);
      const badge = document.createElement('div');
      badge.className = 'presence__factory';
      badge.style.left = `${(fx / vw) * 100}%`;
      badge.style.top = `${(fy / vh) * 100}%`;
      badge.innerHTML = `<strong>Indústria</strong><span>${esc(cidade)}</span>`;
      svgWrap.appendChild(badge);
    }

    const svg = svgWrap.querySelector('svg');
    const mapBox = root.querySelector('.presence__map');

    function showTip(path) {
      const uf = path.dataset.uf;
      const [first, ...rest] = statusOf(uf);
      tip.innerHTML = `<strong>${esc(path.dataset.nome)}</strong><span>${esc(first)}</span>${rest.map((r) => `<span>${esc(r)}</span>`).join('')}`;
      tip.classList.toggle('is-free', !!(frete && freteUfs.has(uf)));
      tip.hidden = false;
      const box = path.getBBox();
      const vb = svg.viewBox.baseVal;
      const rect = svg.getBoundingClientRect();
      const wrapRect = mapBox.getBoundingClientRect();
      const x = rect.left - wrapRect.left + ((box.x + box.width / 2) / vb.width) * rect.width;
      const y = rect.top - wrapRect.top + (box.y / vb.height) * rect.height;
      tip.style.left = `${Math.max(90, Math.min(wrapRect.width - 90, x))}px`;
      tip.style.top = `${Math.max(0, y)}px`;
      svg.querySelectorAll('.uf.is-active').forEach((p) => p.classList.remove('is-active'));
      path.classList.add('is-active');
    }

    function hideTip() {
      tip.hidden = true;
      svg.querySelectorAll('.uf.is-active').forEach((p) => p.classList.remove('is-active'));
    }

    const pick = (e) => {
      const path = e.target.closest('.uf');
      if (path) showTip(path);
    };
    svg.addEventListener('pointerover', pick);
    svg.addEventListener('click', pick);
    svg.addEventListener('pointerleave', hideTip);
  });
})();
