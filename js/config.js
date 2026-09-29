/**
 * MAQUIMINAS EQUIPAMENTOS — Configuração central do site.
 *
 * Todo link de contato, canal comercial e integração futura deve ler daqui.
 * Não coloque senhas, tokens ou chaves neste arquivo: ele é público no navegador.
 * Integrações com ERP Callinfo / AXIA / logística devem passar por um backend próprio,
 * e aqui ficam apenas as URLs públicas desses endpoints.
 */
const MAQUIMINAS_CONFIG = Object.freeze({
  empresa: Object.freeze({
    nome: 'Maquiminas Equipamentos',
    nomeCurto: 'Maquiminas',
    // Preencher somente com dados oficiais. Campos vazios não são exibidos no site.
    cidade: 'Rosário da Limeira',
    estado: 'MG',
    endereco: '',
    horario: ''
  }),

  // Somente dígitos, com DDI e DDD. Ex.: '5531999999999'
  whatsapp: '5532984818603',
  email: '',
  telefone: '',
  instagram: 'https://www.instagram.com/maquiminasequipamentos/',
  instagramUsuario: '@maquiminasequipamentos',

  // Área do Cliente = SaaS Callinfo. O site não possui login, cadastro ou painel próprio.
  areaCliente: 'https://saa-s-callinfo.vercel.app/login.html',

  // Domínio público do site (usado em SEO/Open Graph quando definido).
  siteUrl: '',

  whatsappMensagemPadrao: 'Olá! Vim pelo site da Maquiminas e gostaria de atendimento.',

  /**
   * Endpoints do backend (a ser construído). Enquanto forem null, o site usa
   * dados locais para o catálogo e WhatsApp/e-mail como canal de envio de formulários.
   */
  api: Object.freeze({
    baseUrl: null,     // Ex.: 'https://api.maquiminas.com.br'
    produtos: null,    // GET  lista/detalhe de produtos (ERP Callinfo)
    leads: null,       // POST orçamentos e contatos (ERP Callinfo)
    logistica: null,   // POST solicitação de cotação de transporte
    axia: null         // POST mensagens para a AXIA
  }),

  catalogo: Object.freeze({
    // Itens demonstrativos servem apenas para validar o layout. Desative quando o catálogo real for cadastrado.
    exibirDemonstrativos: true,
    itensPorDestaque: 4
  }),

  axia: Object.freeze({
    ativo: true,
    // 'preview' = somente interface e encaminhamento humano. 'online' = requer api.axia configurada.
    modo: 'preview',
    // Saudação automática exibida uma vez por sessão ao entrar no site.
    saudacaoAutomatica: true,
    saudacaoAtrasoMs: 2500
  }),

  /**
   * Mapa de atendimento (home).
   * - industria: localização da fábrica (marcador no mapa).
   * - entregaEstados: 'todos' ou lista de UFs atendidas. Ex.: ['MG', 'RJ'].
   * - freteGratis: raio a partir da indústria, limitado aos estados listados (sentido Sudeste).
   */
  presenca: Object.freeze({
    industria: Object.freeze({ cidade: 'Rosário da Limeira', uf: 'MG', lat: -20.98, lon: -42.512 }),
    entregaEstados: 'todos',
    freteGratis: Object.freeze({
      raioKm: 300,
      regiao: 'Sudeste',
      estados: Object.freeze(['MG', 'ES', 'RJ', 'SP'])
    })
  })
});

window.MAQUIMINAS_CONFIG = MAQUIMINAS_CONFIG;
