/**
 * Renderização de categorias, catálogo e página de produto.
 * Consome exclusivamente o ProductService.
 */
(function () {
  const { url, escapeHtml: esc, bindWhatsApp, observeReveal } = window.Maquiminas;
  const icon = window.MaquiminasIcons.get;
  const PS = window.ProductService;
  const wa = window.MaquiminasWhatsApp;

  const isIllustration = (src) => /illustrations\//.test(src);
  const resolveSrc = (src) => (/^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : url(src));

  function productImage(product, category) {
    const src = product.imagem || (product.imagens[0] || '') || (category && category.imagem) || 'assets/illustrations/outros.svg';
    return { src: resolveSrc(src), photo: !isIllustration(src) };
  }

  const productUrl = (p) => url(`pages/produto.html?id=${encodeURIComponent(p.id)}`);
  const quoteUrl = (p) => url(`pages/orcamento.html?produto=${encodeURIComponent(p.id)}`);

  function productCard(product, categories) {
    const category = categories.find((c) => c.slug === product.categoria);
    const img = productImage(product, category);
    const meta = [product.marca, product.modelo].filter(Boolean).join(' · ');
    const spec = PS.getMainSpec(product);
    return `
      <article class="product-card reveal">
        <a class="product-card__media ${img.photo ? 'product-card__media--photo' : 'blueprint'}" href="${productUrl(product)}" tabindex="-1" aria-hidden="true">
          <img src="${img.src}" alt="" loading="lazy" decoding="async" width="400" height="300">
          ${product.demonstrativo ? '<span class="product-card__badges"><span class="tag tag--demo">Demonstrativo</span></span>' : ''}
        </a>
        <div class="product-card__body">
          <span class="product-card__cat">${esc(category ? category.nome : product.categoria)}</span>
          <h3 class="product-card__title"><a href="${productUrl(product)}">${esc(product.nome)}</a></h3>
          ${meta ? `<p class="product-card__meta">${esc(meta)}</p>` : ''}
          ${spec ? `<p class="product-card__spec">${icon('sliders')}${esc(spec)}</p>` : ''}
          <p class="product-card__price">${esc(PS.formatPrice(product))}</p>
        </div>
        <div class="product-card__actions">
          <a href="${productUrl(product)}">Ver detalhes</a>
          <a class="is-primary" href="${quoteUrl(product)}">Solicitar orçamento</a>
        </div>
      </article>`;
  }

  function categoryCard(category, index) {
    const img = { src: resolveSrc(category.imagem), photo: !isIllustration(category.imagem) };
    return `
      <a class="cat-card reveal" style="--delay:${(index % 4) * 0.06}s" href="${url(`pages/equipamentos.html?categoria=${encodeURIComponent(category.slug)}`)}">
        <div class="cat-card__media ${img.photo ? 'cat-card__media--photo' : 'blueprint'}">
          <img src="${img.src}" alt="" loading="lazy" decoding="async" width="400" height="300">
        </div>
        <div class="cat-card__body">
          <h3 class="cat-card__title">${esc(category.nome)}</h3>
          <p class="cat-card__desc">${esc(category.descricao)}</p>
          <span class="cat-card__cta">Ver equipamentos ${icon('arrow')}</span>
        </div>
      </a>`;
  }

  /* ---------------------------------------------------------------- Home */
  async function initHome() {
    const catRoot = document.querySelector('[data-categories]');
    const featRoot = document.querySelector('[data-featured]');
    const categories = await PS.getCategories();
    if (catRoot) {
      catRoot.innerHTML = categories.map(categoryCard).join('');
      observeReveal(catRoot);
    }
    if (featRoot) {
      const featured = await PS.getFeatured();
      const section = featRoot.closest('section');
      if (!featured.length) {
        if (section) section.hidden = true;
        return;
      }
      featRoot.innerHTML = featured.map((p) => productCard(p, categories)).join('');
      observeReveal(featRoot);
    }
  }

  /* ------------------------------------------------------------- Catálogo */
  async function initCatalog() {
    const grid = document.querySelector('[data-catalog-grid]');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    const state = {
      categoria: params.get('categoria') || '',
      busca: params.get('busca') || '',
      marca: params.get('marca') || '',
      voltagem: params.get('voltagem') || '',
      ordenacao: params.get('ordem') || 'relevancia'
    };

    const [categories, facets] = await Promise.all([PS.getCategories(), PS.getFacets()]);
    if (state.categoria && !categories.some((c) => c.slug === state.categoria)) state.categoria = '';

    const searchInput = document.getElementById('catalog-search');
    const sortSelect = document.getElementById('catalog-sort');
    const filtersRoot = document.querySelector('[data-filters]');
    const chipsRoot = document.querySelector('[data-chips]');
    const countEl = document.querySelector('[data-results-count]');
    const clearBtn = document.querySelector('[data-clear-filters]');
    const noticeEl = document.querySelector('[data-demo-notice]');
    const titleEl = document.querySelector('[data-catalog-title]');
    const leadEl = document.querySelector('[data-catalog-lead]');
    const defaultTitle = titleEl ? titleEl.textContent : '';
    const defaultLead = leadEl ? leadEl.textContent : '';

    searchInput.value = state.busca;
    sortSelect.value = state.ordenacao;

    const filterButton = (group, value, label, count) => `
      <li><button type="button" class="filter-btn" data-filter="${group}" data-value="${esc(value)}" aria-pressed="false">
        ${esc(label)}${count !== undefined ? `<span>${count}</span>` : ''}
      </button></li>`;

    const optionalGroup = (key, title, values) =>
      values.length
        ? `<div class="filters__group"><h2 class="filters__title">${title}</h2><ul class="filter-list">
            ${filterButton(key, '', 'Todas')}${values.map((v) => filterButton(key, v, v)).join('')}</ul></div>`
        : '';

    filtersRoot.innerHTML = `
      <div class="filters__group">
        <h2 class="filters__title">Categorias</h2>
        <ul class="filter-list">
          ${filterButton('categoria', '', 'Todas as categorias', facets.total)}
          ${categories.map((c) => filterButton('categoria', c.slug, c.nome, facets.categorias[c.slug] || 0)).join('')}
        </ul>
      </div>
      ${optionalGroup('marca', 'Marca', facets.marcas)}
      ${optionalGroup('voltagem', 'Voltagem', facets.voltagens)}
      <div class="filters__help">
        <strong>Não encontrou o que procura?</strong>
        <p>Informe sua necessidade e nossa equipe indica o equipamento adequado.</p>
        <a class="btn btn--sm" href="${url('pages/orcamento.html')}">Solicitar orçamento</a>
      </div>`;

    chipsRoot.innerHTML = [{ slug: '', nome: 'Todas' }, ...categories]
      .map((c) => `<button type="button" class="chip" data-filter="categoria" data-value="${c.slug}" aria-pressed="false">${esc(c.nome)}</button>`)
      .join('');

    function syncUrl() {
      const next = new URLSearchParams();
      if (state.categoria) next.set('categoria', state.categoria);
      if (state.busca) next.set('busca', state.busca);
      if (state.marca) next.set('marca', state.marca);
      if (state.voltagem) next.set('voltagem', state.voltagem);
      if (state.ordenacao !== 'relevancia') next.set('ordem', state.ordenacao);
      const qs = next.toString();
      history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    }

    function syncControls() {
      document.querySelectorAll('[data-filter]').forEach((btn) => {
        btn.setAttribute('aria-pressed', String(state[btn.dataset.filter] === btn.dataset.value));
      });
      const category = categories.find((c) => c.slug === state.categoria);
      if (titleEl) titleEl.textContent = category ? category.nome : defaultTitle;
      if (leadEl) leadEl.textContent = category ? category.descricao : defaultLead;
      document.title = category
        ? `${category.nome} | Equipamentos | Maquiminas Equipamentos`
        : 'Equipamentos | Maquiminas Equipamentos';
    }

    async function render() {
      const products = await PS.list(state);
      const hasFilters = Boolean(state.categoria || state.busca || state.marca || state.voltagem);
      countEl.textContent = `${products.length} ${products.length === 1 ? 'equipamento encontrado' : 'equipamentos encontrados'}`;
      clearBtn.hidden = !hasFilters;
      if (noticeEl) noticeEl.hidden = !products.some((p) => p.demonstrativo);

      if (!products.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <h3>Nenhum equipamento encontrado</h3>
            <p>${hasFilters ? 'Ajuste a busca ou os filtros. Se preferir, descreva o que precisa e nossa equipe ajuda a encontrar a melhor opção.' : 'O catálogo está sendo atualizado. Fale com nossa equipe para conhecer os equipamentos disponíveis.'}</p>
            <div class="btn-row">
              <a class="btn" href="${url('pages/orcamento.html')}">Solicitar orçamento</a>
              <a class="btn btn--ghost" data-whatsapp>Falar pelo WhatsApp</a>
            </div>
          </div>`;
        bindWhatsApp(grid);
        return;
      }
      grid.innerHTML = products.map((p) => productCard(p, categories)).join('');
      observeReveal(grid);
    }

    function update() {
      syncControls();
      syncUrl();
      render();
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      state[btn.dataset.filter] = btn.dataset.value;
      update();
    });

    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.busca = searchInput.value.trim();
        update();
      }, 200);
    });
    document.querySelector('[data-search-form]').addEventListener('submit', (e) => e.preventDefault());

    sortSelect.addEventListener('change', () => {
      state.ordenacao = sortSelect.value;
      update();
    });

    clearBtn.addEventListener('click', () => {
      Object.assign(state, { categoria: '', busca: '', marca: '', voltagem: '' });
      searchInput.value = '';
      update();
    });

    update();
  }

  /* -------------------------------------------------------------- Produto */
  function setMeta(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  async function initProduct() {
    const rootEl = document.querySelector('[data-product]');
    if (!rootEl) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const product = id ? await PS.getById(id) : null;

    if (!product) {
      rootEl.innerHTML = `
        <div class="not-found">
          <span class="eyebrow">Equipamento</span>
          <h1 class="display h2">Equipamento não encontrado</h1>
          <p class="lead">O item pode ter sido removido ou o endereço está incorreto. Veja o catálogo completo ou fale com nossa equipe.</p>
          <div class="btn-row">
            <a class="btn" href="${url('pages/equipamentos.html')}">Ver equipamentos</a>
            <a class="btn btn--ghost" data-whatsapp>Falar pelo WhatsApp</a>
          </div>
        </div>`;
      bindWhatsApp(rootEl);
      document.querySelector('[data-specs-section]')?.remove();
      document.querySelector('[data-related-section]')?.remove();
      return;
    }

    const categories = await PS.getCategories();
    const category = categories.find((c) => c.slug === product.categoria);
    const gallery = [product.imagem, ...product.imagens].filter(Boolean);
    const unique = [...new Set(gallery)];
    const main = unique.length ? { src: resolveSrc(unique[0]), photo: !isIllustration(unique[0]) } : productImage(product, category);
    const waMessage = wa.productMessage(product);

    const title = `${product.nome}${product.marca ? ` ${product.marca}` : ''}${product.modelo ? ` ${product.modelo}` : ''}`;
    document.title = `${title} | Maquiminas Equipamentos`;
    const description = (product.descricao || `${product.nome} — solicite um orçamento com a Maquiminas Equipamentos.`).slice(0, 158);
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', `${title} | Maquiminas Equipamentos`);
    setMeta('meta[property="og:description"]', 'content', description);

    const crumbCat = document.querySelector('[data-crumb-category]');
    if (crumbCat && category) {
      crumbCat.innerHTML = `<a href="${url(`pages/equipamentos.html?categoria=${category.slug}`)}">${esc(category.nome)}</a>`;
      crumbCat.hidden = false;
    }
    const crumbName = document.querySelector('[data-crumb-name]');
    if (crumbName) crumbName.textContent = product.nome;

    const ids = [
      product.marca && `<span>Marca: <strong>${esc(product.marca)}</strong></span>`,
      product.modelo && `<span>Modelo: <strong>${esc(product.modelo)}</strong></span>`
    ].filter(Boolean);

    rootEl.innerHTML = `
      <div class="gallery">
        <div class="gallery__main ${main.photo ? 'gallery__main--photo' : 'blueprint'}">
          <img src="${main.src}" alt="${esc(product.nome)}" width="800" height="600" data-gallery-main>
        </div>
        ${unique.length > 1 ? `<div class="gallery__thumbs">${unique.map((src, i) => `
          <button type="button" class="gallery__thumb" data-gallery-thumb="${esc(resolveSrc(src))}" aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${unique.length}">
            <img src="${esc(resolveSrc(src))}" alt="" loading="lazy" width="120" height="120">
          </button>`).join('')}</div>` : ''}
      </div>
      <div class="product__info">
        <span class="product__cat">${esc(category ? category.nome : product.categoria)}</span>
        <h1 class="product__title">${esc(product.nome)}</h1>
        ${ids.length ? `<p class="product__ids">${ids.join('')}</p>` : ''}
        ${product.demonstrativo ? '<p><span class="tag tag--demo">Item demonstrativo — conteúdo ilustrativo</span></p>' : ''}
        ${product.descricao ? `<p class="product__desc">${esc(product.descricao)}</p>` : ''}
        <dl class="commercial">
          <div><dt>Condições</dt><dd>${esc(PS.formatPrice(product))}</dd></div>
          <div><dt>Disponibilidade</dt><dd>${esc(PS.formatAvailability(product))}</dd></div>
        </dl>
        <div class="product__ctas">
          <a class="btn" href="${quoteUrl(product)}">Solicitar orçamento <span class="arrow">${icon('arrow')}</span></a>
          <a class="btn btn--whatsapp" data-whatsapp data-whatsapp-message="${esc(waMessage)}">${icon('whatsapp')} WhatsApp</a>
        </div>
        <div class="product__terms">
          <ul>
            <li>${icon('wallet')}<span><strong>50% de entrada</strong> (pode ser paga na entrega) e o restante no boleto parcelado</span></li>
            <li>${icon('truck')}<span><strong>Frete grátis</strong> até 300 km da indústria (sentido Sudeste). Acima disso, frete por conta do comprador</span></li>
            <li>${icon('alert')}<span>Não virar de ponta-cabeça, não desmontar e não abrir. Receber desmontado implica perda da garantia</span></li>
          </ul>
          <a href="${window.Maquiminas.url('pages/condicoes.html')}">Ver todas as condições e políticas ${icon('arrow')}</a>
        </div>
        <div class="product__services">
          <strong>Além do equipamento</strong>
          <p>Frete, montagem, desmontagem e instalação podem ser avaliados no seu orçamento, conforme disponibilidade e destino.</p>
          <div class="service-tags"><span class="tag">Frete</span><span class="tag">Montagem</span><span class="tag">Desmontagem</span><span class="tag">Instalação</span></div>
        </div>
      </div>`;
    bindWhatsApp(rootEl);

    rootEl.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-gallery-thumb]');
      if (!thumb) return;
      rootEl.querySelector('[data-gallery-main]').src = thumb.dataset.galleryThumb;
      rootEl.querySelectorAll('[data-gallery-thumb]').forEach((t) => t.setAttribute('aria-current', String(t === thumb)));
    });

    const specsRoot = document.querySelector('[data-specs]');
    const specs = PS.getSpecs(product);
    if (specsRoot) {
      const hasTechnical = specs.some((s) => !['aplicacao', 'marca', 'modelo'].includes(s.chave));
      const list = specs.length
        ? `<dl class="specs">${specs.map((s) => `<div class="spec"><dt>${esc(s.rotulo)}</dt><dd>${esc(s.valor)}</dd></div>`).join('')}</dl>`
        : '';
      const pending = hasTechnical
        ? ''
        : `<div class="specs-empty"${list ? ' style="margin-top:28px"' : ''}>
             ${icon('doc')}
             <p><strong>Especificações técnicas sob consulta</strong>Capacidade, potência, voltagem e dimensões são confirmadas pela nossa equipe conforme o modelo e a configuração indicados para sua operação.</p>
             <a class="btn btn--dark btn--sm" href="${quoteUrl(product)}">Solicitar ficha técnica</a>
           </div>`;
      const notes = product.observacoes ? `<p class="product-notes"><strong>Observações:</strong> ${esc(product.observacoes)}</p>` : '';
      specsRoot.innerHTML = list + pending + notes;
    }

    const relatedRoot = document.querySelector('[data-related]');
    if (relatedRoot) {
      const related = await PS.getRelated(product, 3);
      if (!related.length) {
        document.querySelector('[data-related-section]')?.remove();
      } else {
        relatedRoot.innerHTML = related.map((p) => productCard(p, categories)).join('');
        observeReveal(relatedRoot);
      }
    }

    if (!product.demonstrativo) {
      const ld = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.nome,
        description: product.descricao || undefined,
        brand: product.marca ? { '@type': 'Brand', name: product.marca } : undefined,
        model: product.modelo || undefined,
        category: category ? category.nome : undefined,
        image: unique.length ? unique.map(resolveSrc) : undefined
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(ld);
      document.head.appendChild(script);
    }
  }

  window.MaquiminasProducts = Object.freeze({ productCard, categoryCard });

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'catalogo') initCatalog();
  if (page === 'produto') initProduct();
})();
