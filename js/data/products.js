/**
 * Base local de produtos (mock).
 *
 * Estrutura oficial do produto — a mesma que a API/ERP Callinfo deverá devolver:
 * {
 *   id: "",              // slug único, usado na URL: produto.html?id=<id>
 *   nome: "",
 *   categoria: "",       // slug de MAQUIMINAS_CATEGORIES
 *   marca: "",
 *   modelo: "",
 *   descricao: "",
 *   imagem: "",          // imagem principal
 *   imagens: [],         // galeria
 *   preco: null,         // null = "Consulte condições". Nunca preencher com valor estimado.
 *   capacidade: "",
 *   potencia: "",
 *   voltagem: "",
 *   dimensoes: "",
 *   peso: "",            // usado futuramente na cotação de frete
 *   material: "",
 *   producao: "",
 *   aplicacao: "",
 *   observacoes: "",
 *   especificacoes: [],  // [{ rotulo: "", valor: "" }]
 *   disponivel: null,    // true | false | null (null = "Consulte disponibilidade")
 *   destaque: false,
 *   demonstrativo: false // true = item ilustrativo, não é produto real cadastrado
 * }
 *
 * IMPORTANTE: os itens abaixo são DEMONSTRATIVOS (tipos genéricos de equipamento, sem marca,
 * modelo, especificação ou preço). Substitua pelo catálogo oficial da Maquiminas.
 * Para ocultá-los: MAQUIMINAS_CONFIG.catalogo.exibirDemonstrativos = false.
 */
window.MAQUIMINAS_PRODUCTS = [
  {
    id: 'masseira-espiral',
    nome: 'Masseira espiral',
    categoria: 'panificacao',
    descricao: 'Equipamento para mistura e sova de massas em produção profissional. Capacidade, voltagem e configuração definidas conforme a necessidade da operação.',
    aplicacao: 'Panificação e produção de massas',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'cilindro-laminador',
    nome: 'Cilindro laminador',
    categoria: 'panificacao',
    descricao: 'Equipamento para laminação e refinamento de massas. Consulte modelos e configurações disponíveis.',
    aplicacao: 'Panificação',
    demonstrativo: true
  },
  {
    id: 'batedeira-planetaria',
    nome: 'Batedeira planetária',
    categoria: 'confeitaria',
    descricao: 'Equipamento para bater, misturar e emulsionar massas leves, cremes e coberturas.',
    aplicacao: 'Confeitaria e panificação',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'forno-turbo',
    nome: 'Forno de convecção',
    categoria: 'coccao',
    descricao: 'Forno com circulação de ar para assamento uniforme. Consulte capacidades e alimentação disponíveis.',
    aplicacao: 'Panificação, confeitaria e gastronomia',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'forno-lastro',
    nome: 'Forno de lastro',
    categoria: 'coccao',
    descricao: 'Forno de câmaras com lastro para assamento direto. Configuração conforme a necessidade de produção.',
    aplicacao: 'Panificação',
    demonstrativo: true
  },
  {
    id: 'fogao-industrial',
    nome: 'Fogão industrial',
    categoria: 'gastronomia',
    descricao: 'Fogão para cozinhas profissionais. Número de bocas e tipo de alimentação sob consulta.',
    aplicacao: 'Cozinhas profissionais',
    demonstrativo: true
  },
  {
    id: 'refrigerador-comercial',
    nome: 'Refrigerador comercial',
    categoria: 'refrigeracao',
    descricao: 'Equipamento para conservação refrigerada em operações comerciais. Volumes e configurações sob consulta.',
    aplicacao: 'Conservação e armazenamento',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'processador-alimentos',
    nome: 'Processador de alimentos',
    categoria: 'preparacao',
    descricao: 'Equipamento para corte, fatiamento e processamento no pré-preparo.',
    aplicacao: 'Pré-preparo em cozinhas profissionais',
    demonstrativo: true
  },
  {
    id: 'modeladora',
    nome: 'Modeladora de pães',
    categoria: 'industriais',
    descricao: 'Equipamento para modelagem de massas em linhas de produção. Consulte configurações.',
    aplicacao: 'Produção em escala',
    demonstrativo: true
  }
];
