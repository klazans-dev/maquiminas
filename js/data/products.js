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
 *   ilustracao: "",      // desenho técnico do card (SVG). Não substituir por foto.
 *   imagem: "",          // foto principal (quando houver)
 *   imagens: [],         // galeria de fotos. O card continua com a ilustração.
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
 *   condicao: "",        // "novo" | "semi-novo" | "reformado"
 *   equivalentes: [],    // ids de produtos equivalentes (mesma função, outra marca/modelo)
 *   disponivel: null,    // true | false | null (null = "Consulte disponibilidade")
 *   destaque: false,
 *   demonstrativo: false // true = item ilustrativo, não é produto real cadastrado
 * }
 *
 * IMPORTANTE: os itens abaixo são DEMONSTRATIVOS (tipos genéricos de equipamento, sem marca,
 * modelo, especificação ou preço). Substitua pelo catálogo oficial da Maquiminas.
 * Fotos reais: preencha `imagens` (e `imagem` se quiser foto na página do produto).
 * O card do catálogo e da home continua com `ilustracao` (desenho técnico).
 * Para ocultá-los: MAQUIMINAS_CONFIG.catalogo.exibirDemonstrativos = false.
 */
window.MAQUIMINAS_PRODUCTS = [
  {
    id: 'masseira-espiral',
    nome: 'Masseira espiral',
    categoria: 'panificacao',
    ilustracao: 'assets/illustrations/panificacao.svg',
    descricao: 'Equipamento para mistura e sova de massas em produção profissional. Capacidade, voltagem e configuração definidas conforme a necessidade da operação.',
    aplicacao: 'Panificação e produção de massas',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'cilindro-laminador',
    nome: 'Cilindro laminador',
    categoria: 'panificacao',
    ilustracao: 'assets/illustrations/panificacao.svg',
    descricao: 'Equipamento para laminação e refinamento de massas. Consulte modelos e configurações disponíveis.',
    aplicacao: 'Panificação',
    demonstrativo: true
  },
  {
    id: 'divisora-massas',
    nome: 'Divisora de massas',
    categoria: 'panificacao',
    ilustracao: 'assets/illustrations/panificacao.svg',
    descricao: 'Equipamento para divisão de massas em porções. Consulte capacidades e configurações.',
    aplicacao: 'Panificação',
    demonstrativo: true
  },
  {
    id: 'boleadeira',
    nome: 'Boleadeira',
    categoria: 'panificacao',
    ilustracao: 'assets/illustrations/panificacao.svg',
    descricao: 'Equipamento para boleamento de massas. Modelos e produção sob consulta.',
    aplicacao: 'Panificação',
    demonstrativo: true
  },
  {
    id: 'camara-fermentacao',
    nome: 'Câmara de fermentação',
    categoria: 'panificacao',
    ilustracao: 'assets/illustrations/panificacao.svg',
    descricao: 'Câmara para fermentação controlada de massas. Volumes e controles conforme a operação.',
    aplicacao: 'Panificação',
    demonstrativo: true
  },
  {
    id: 'fatiadora-paes',
    nome: 'Fatiadora de pães',
    categoria: 'panificacao',
    ilustracao: 'assets/illustrations/panificacao.svg',
    descricao: 'Equipamento para fatiamento de pães. Espessura e capacidade sob consulta.',
    aplicacao: 'Panificação e atendimento de balcão',
    demonstrativo: true
  },
  {
    id: 'modeladora',
    nome: 'Modeladora de pães',
    categoria: 'industriais',
    ilustracao: 'assets/illustrations/industriais.svg',
    descricao: 'Equipamento para modelagem de massas em linhas de produção. Consulte configurações.',
    aplicacao: 'Produção em escala',
    demonstrativo: true
  },
  {
    id: 'batedeira-planetaria',
    nome: 'Batedeira planetária',
    categoria: 'confeitaria',
    ilustracao: 'assets/illustrations/confeitaria.svg',
    descricao: 'Equipamento para bater, misturar e emulsionar massas leves, cremes e coberturas.',
    aplicacao: 'Confeitaria e panificação',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'forno-turbo',
    nome: 'Forno de convecção',
    categoria: 'coccao',
    ilustracao: 'assets/illustrations/coccao.svg',
    descricao: 'Forno com circulação de ar para assamento uniforme. Consulte capacidades e alimentação disponíveis.',
    aplicacao: 'Panificação, confeitaria e gastronomia',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'forno-lastro',
    nome: 'Forno de lastro',
    categoria: 'coccao',
    ilustracao: 'assets/illustrations/coccao.svg',
    descricao: 'Forno de câmaras com lastro para assamento direto. Configuração conforme a necessidade de produção.',
    aplicacao: 'Panificação',
    destaque: true,
    demonstrativo: true
  },
  {
    id: 'fogao-industrial',
    nome: 'Fogão industrial',
    categoria: 'gastronomia',
    ilustracao: 'assets/illustrations/gastronomia.svg',
    descricao: 'Fogão para cozinhas profissionais. Número de bocas e tipo de alimentação sob consulta.',
    aplicacao: 'Cozinhas profissionais',
    demonstrativo: true
  },
  {
    id: 'fritadeira',
    nome: 'Fritadeira industrial',
    categoria: 'gastronomia',
    ilustracao: 'assets/illustrations/gastronomia.svg',
    descricao: 'Fritadeira para cozinhas profissionais. Capacidade e alimentação sob consulta.',
    aplicacao: 'Cozinhas profissionais',
    demonstrativo: true
  },
  {
    id: 'processador-alimentos',
    nome: 'Processador de alimentos',
    categoria: 'preparacao',
    ilustracao: 'assets/illustrations/preparacao.svg',
    descricao: 'Equipamento para corte, fatiamento e processamento no pré-preparo.',
    aplicacao: 'Pré-preparo em cozinhas profissionais',
    demonstrativo: true
  },
  {
    id: 'descascador',
    nome: 'Descascador',
    categoria: 'preparacao',
    ilustracao: 'assets/illustrations/preparacao.svg',
    descricao: 'Equipamento para descasque em pré-preparo. Capacidade sob consulta.',
    aplicacao: 'Pré-preparo',
    demonstrativo: true
  },
  {
    id: 'outros-equipamentos',
    nome: 'Outros equipamentos',
    categoria: 'outros',
    ilustracao: 'assets/illustrations/outros.svg',
    descricao: 'Demais linhas e equipamentos sob consulta. Descreva a necessidade no orçamento.',
    aplicacao: 'Sob consulta',
    demonstrativo: true
  }
];
