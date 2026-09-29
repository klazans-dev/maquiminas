/**
 * Categorias do catálogo (editáveis).
 * `slug` é usado na URL: equipamentos.html?categoria=<slug>
 * `imagem` aceita foto real (recomendado: .webp 800x600) ou a ilustração padrão.
 */
window.MAQUIMINAS_CATEGORIES = [
  {
    slug: 'panificacao',
    nome: 'Panificação',
    descricao: 'Equipamentos para produção de pães e massas em escala profissional.',
    imagem: 'assets/illustrations/panificacao.svg'
  },
  {
    slug: 'confeitaria',
    nome: 'Confeitaria',
    descricao: 'Soluções para preparo de massas, cremes e produção de doces.',
    imagem: 'assets/illustrations/confeitaria.svg'
  },
  {
    slug: 'gastronomia',
    nome: 'Gastronomia',
    descricao: 'Equipamentos para cozinhas profissionais e operações de alimentação.',
    imagem: 'assets/illustrations/gastronomia.svg'
  },
  {
    slug: 'industriais',
    nome: 'Equipamentos Industriais',
    descricao: 'Máquinas para operações de maior porte e produção contínua.',
    imagem: 'assets/illustrations/industriais.svg'
  },
  {
    slug: 'refrigeracao',
    nome: 'Refrigeração',
    descricao: 'Conservação e armazenamento para diferentes volumes de operação.',
    imagem: 'assets/illustrations/refrigeracao.svg'
  },
  {
    slug: 'preparacao',
    nome: 'Preparação',
    descricao: 'Equipamentos para processamento e pré-preparo de alimentos.',
    imagem: 'assets/illustrations/preparacao.svg'
  },
  {
    slug: 'coccao',
    nome: 'Cocção',
    descricao: 'Fornos e equipamentos de cocção para rotina profissional.',
    imagem: 'assets/illustrations/coccao.svg'
  },
  {
    slug: 'outros',
    nome: 'Outros',
    descricao: 'Outras linhas e equipamentos sob consulta com nossa equipe.',
    imagem: 'assets/illustrations/outros.svg'
  }
];
