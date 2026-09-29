/**
 * ProductService — única porta de entrada para dados de produtos e categorias.
 *
 * Nenhuma página deve ler MAQUIMINAS_PRODUCTS diretamente. Hoje a fonte é local (mock);
 * quando MAQUIMINAS_CONFIG.api.produtos for definido, a fonte passa a ser a API
 * (backend -> ERP Callinfo -> banco) sem alterar as páginas.
 *
 * Todos os métodos são assíncronos para manter o mesmo contrato da futura API.
 * A AXIA também deverá consultar produtos exclusivamente por este serviço (ou pela mesma API).
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;

  const EMPTY_PRODUCT = {
    id: '',
    nome: '',
    categoria: '',
    marca: '',
    modelo: '',
    descricao: '',
    imagem: '',
    imagens: [],
    preco: null,
    capacidade: '',
    potencia: '',
    voltagem: '',
    dimensoes: '',
    peso: '',
    material: '',
    producao: '',
    aplicacao: '',
    observacoes: '',
    especificacoes: [],
    disponivel: null,
    destaque: false,
    demonstrativo: false
  };

  const clean = (value) => (typeof value === 'string' ? value.trim() : value);

  function normalizeProduct(raw) {
    const product = { ...EMPTY_PRODUCT };
    Object.keys(EMPTY_PRODUCT).forEach((key) => {
      if (raw[key] !== undefined && raw[key] !== null) product[key] = clean(raw[key]);
    });
    product.imagens = Array.isArray(raw.imagens) ? raw.imagens.filter(Boolean) : [];
    product.especificacoes = Array.isArray(raw.especificacoes)
      ? raw.especificacoes.filter((s) => s && s.rotulo && s.valor)
      : [];
    if (typeof product.preco !== 'number' || product.preco <= 0) product.preco = null;
    return product;
  }

  const normalizeText = (text) =>
    String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  /** Fonte local (mock). */
  const LocalAdapter = {
    async fetchProducts() {
      const all = (window.MAQUIMINAS_PRODUCTS || []).map(normalizeProduct);
      return config.catalogo.exibirDemonstrativos ? all : all.filter((p) => !p.demonstrativo);
    },
    async fetchCategories() {
      return window.MAQUIMINAS_CATEGORIES || [];
    }
  };

  /**
   * Fonte remota. O contrato exato será definido junto ao backend do ERP Callinfo.
   * Expectativa: GET {api.produtos} -> Produto[] e GET {api.produtos}/categorias -> Categoria[].
   */
  const ApiAdapter = {
    async fetchProducts() {
      const response = await fetch(config.api.produtos, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Falha ao carregar produtos (${response.status})`);
      const data = await response.json();
      return (Array.isArray(data) ? data : data.produtos || []).map(normalizeProduct);
    },
    async fetchCategories() {
      const response = await fetch(`${config.api.produtos}/categorias`, { headers: { Accept: 'application/json' } });
      if (!response.ok) return LocalAdapter.fetchCategories();
      return response.json();
    }
  };

  const adapter = config.api.produtos ? ApiAdapter : LocalAdapter;
  let productsCache = null;
  let categoriesCache = null;

  async function getAll() {
    if (!productsCache) {
      try {
        productsCache = await adapter.fetchProducts();
      } catch (error) {
        console.error('[ProductService]', error);
        productsCache = [];
      }
    }
    return productsCache;
  }

  async function getCategories() {
    if (!categoriesCache) categoriesCache = await adapter.fetchCategories();
    return categoriesCache;
  }

  async function getCategory(slug) {
    return (await getCategories()).find((c) => c.slug === slug) || null;
  }

  const SORTERS = {
    relevancia: (a, b) => Number(b.destaque) - Number(a.destaque),
    'nome-asc': (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
    'nome-desc': (a, b) => b.nome.localeCompare(a.nome, 'pt-BR'),
    categoria: (a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR') || a.nome.localeCompare(b.nome, 'pt-BR')
  };

  /**
   * @param {{busca?: string, categoria?: string, marca?: string, voltagem?: string, ordenacao?: string}} filtros
   */
  async function list(filtros = {}) {
    const termo = normalizeText(filtros.busca);
    let result = (await getAll()).filter((p) => {
      if (filtros.categoria && p.categoria !== filtros.categoria) return false;
      if (filtros.marca && p.marca !== filtros.marca) return false;
      if (filtros.voltagem && p.voltagem !== filtros.voltagem) return false;
      if (!termo) return true;
      const haystack = normalizeText([p.nome, p.marca, p.modelo, p.descricao, p.aplicacao, p.categoria].join(' '));
      return termo.split(/\s+/).every((word) => haystack.includes(word));
    });
    result = [...result].sort(SORTERS[filtros.ordenacao] || SORTERS.relevancia);
    return result;
  }

  async function getById(id) {
    return (await getAll()).find((p) => p.id === id) || null;
  }

  async function getFeatured(limit = config.catalogo.itensPorDestaque) {
    const all = await getAll();
    const featured = all.filter((p) => p.destaque);
    return (featured.length ? featured : all).slice(0, limit);
  }

  async function getRelated(product, limit = 3) {
    const all = await getAll();
    const same = all.filter((p) => p.id !== product.id && p.categoria === product.categoria);
    const others = all.filter((p) => p.id !== product.id && p.categoria !== product.categoria);
    return [...same, ...others].slice(0, limit);
  }

  /** Valores disponíveis para filtros (somente campos realmente preenchidos). */
  async function getFacets() {
    const all = await getAll();
    const unique = (key) => [...new Set(all.map((p) => p[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const counts = all.reduce((acc, p) => ({ ...acc, [p.categoria]: (acc[p.categoria] || 0) + 1 }), {});
    return { marcas: unique('marca'), voltagens: unique('voltagem'), categorias: counts, total: all.length };
  }

  /** Texto comercial para preço — nunca estima valores. */
  function formatPrice(product) {
    if (product.preco === null) return 'Consulte condições';
    return product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatAvailability(product) {
    if (product.disponivel === true) return 'Disponível';
    if (product.disponivel === false) return 'Sob consulta';
    return 'Consulte disponibilidade';
  }

  /** Especificações exibíveis: somente campos preenchidos. */
  function getSpecs(product) {
    const fields = [
      ['marca', 'Marca'],
      ['modelo', 'Modelo'],
      ['capacidade', 'Capacidade'],
      ['producao', 'Produção'],
      ['potencia', 'Potência'],
      ['voltagem', 'Voltagem'],
      ['dimensoes', 'Dimensões'],
      ['peso', 'Peso'],
      ['material', 'Material'],
      ['aplicacao', 'Aplicação']
    ];
    const base = fields.filter(([key]) => product[key]).map(([key, rotulo]) => ({ chave: key, rotulo, valor: product[key] }));
    return [...base, ...product.especificacoes.map((s) => ({ chave: 'extra', rotulo: s.rotulo, valor: s.valor }))];
  }

  /** Especificação principal para o card (primeiro dado técnico disponível). */
  function getMainSpec(product) {
    const key = ['capacidade', 'producao', 'potencia', 'voltagem'].find((k) => product[k]);
    return key ? product[key] : '';
  }

  window.ProductService = Object.freeze({
    list,
    getById,
    getFeatured,
    getRelated,
    getCategories,
    getCategory,
    getFacets,
    formatPrice,
    formatAvailability,
    getSpecs,
    getMainSpec,
    normalizeProduct
  });
})();
