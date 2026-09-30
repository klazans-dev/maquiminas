/**
 * LogisticsService — preparação para cotação de transporte.
 *
 * Fluxo futuro:
 *   Produto -> Peso -> Dimensões -> Origem -> Destino -> Cotação de transporte -> Prazo -> Valor -> Orçamento
 *
 * Hoje a cotação é feita manualmente pela equipe Maquiminas.
 * Não há integração automática: este serviço apenas organiza os dados necessários
 * e indica o que ainda falta para a equipe cotar. Nenhum valor ou prazo é calculado no front-end.
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  const INDUSTRIA = (config.presenca && config.presenca.industria) || null;
  const FRETE_GRATIS = (config.presenca && config.presenca.freteGratis) || null;

  /** Fatores que influenciam o transporte — exibidos no site e usados como checklist. */
  const FATORES = [
    { chave: 'origem', rotulo: 'Origem' },
    { chave: 'destino', rotulo: 'Destino' },
    { chave: 'peso', rotulo: 'Peso' },
    { chave: 'dimensoes', rotulo: 'Dimensões' },
    { chave: 'quantidade', rotulo: 'Quantidade' },
    { chave: 'tipoEquipamento', rotulo: 'Tipo de equipamento' },
    { chave: 'montagem', rotulo: 'Necessidade de montagem' },
    { chave: 'desmontagem', rotulo: 'Necessidade de desmontagem' }
  ];

  /**
   * Monta a solicitação de cotação a partir do produto e do destino informado pelo cliente.
   * @returns {{ solicitacao: Object, pendentes: string[] }}
   */
  function buildQuoteRequest({ produto = null, destinoCidade = '', destinoUF = '', quantidade = 1, servicos = [] } = {}) {
    const solicitacao = {
      produtoId: produto ? produto.id : null,
      tipoEquipamento: produto ? produto.categoria : null,
      peso: produto && produto.peso ? produto.peso : null,
      dimensoes: produto && produto.dimensoes ? produto.dimensoes : null,
      origem: INDUSTRIA ? { cidade: INDUSTRIA.cidade, uf: INDUSTRIA.uf } : null,
      destino: destinoCidade || destinoUF ? { cidade: destinoCidade, uf: destinoUF } : null,
      // A elegibilidade ao frete grátis (distância real até o destino) é confirmada pela equipe.
      politicaFreteGratis: FRETE_GRATIS
        ? { raioKm: FRETE_GRATIS.raioKm, regiao: FRETE_GRATIS.regiao, destinoNaRegiao: FRETE_GRATIS.estados.includes(destinoUF) }
        : null,
      quantidade: Number(quantidade) || 1,
      montagem: servicos.includes('Montagem'),
      desmontagem: servicos.includes('Desmontagem'),
      instalacao: servicos.includes('Instalação')
    };
    const pendentes = ['produtoId', 'peso', 'dimensoes', 'destino'].filter((k) => !solicitacao[k]);
    return { solicitacao, pendentes };
  }

  /**
   * Cotação. Enquanto api.logistica não existir, retorna status "manual":
   * a equipe comercial realiza a cotação e informa valor e prazo no orçamento.
   */
  async function quote(request) {
    if (!config.api.logistica) {
      return { status: 'manual', mensagem: 'A cotação de transporte é realizada pela equipe Maquiminas e informada no orçamento.' };
    }
    const response = await fetch(config.api.logistica, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) return { status: 'manual', mensagem: 'Não foi possível cotar automaticamente. Nossa equipe fará a cotação.' };
    return response.json();
  }

  window.LogisticsService = Object.freeze({ FATORES, INDUSTRIA, FRETE_GRATIS, buildQuoteRequest, quote });
})();
