/**
 * AxiaService — contrato da futura assistente AXIA.
 *
 * Nesta etapa NÃO há IA: o widget oferece atalhos e encaminhamento para um especialista.
 * Quando MAQUIMINAS_CONFIG.api.axia existir (backend próprio), `ask()` passa a enviar as
 * mensagens para lá. Chaves de modelos de IA nunca devem ficar no front-end.
 *
 * REGRA FUNDAMENTAL: a AXIA nunca inventa preço, especificação, prazo, frete,
 * disponibilidade ou condição comercial. Ela responde apenas com dados oficiais
 * obtidos pelas ferramentas abaixo; sem dado cadastrado, usa FALLBACK_MESSAGE e
 * oferece transferência para um especialista mantendo o contexto (buildHandoff).
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;

  const FALLBACK_MESSAGE =
    'Não encontrei uma informação cadastrada para essa condição. Posso encaminhar você para um especialista da Maquiminas.';

  const RULES = Object.freeze({
    naoInventar: ['preço', 'especificação', 'prazo', 'frete', 'disponibilidade', 'condição comercial'],
    fonteDeDados: 'Somente dados oficiais (ProductService / API do ERP Callinfo / LogisticsService).',
    semInformacao: FALLBACK_MESSAGE,
    transferenciaHumana: 'Sempre disponível, mantendo o contexto do atendimento.'
  });

  /**
   * Ferramentas que o backend da AXIA poderá expor ao modelo.
   * Cada uma deve consultar a fonte oficial correspondente.
   */
  const TOOLS = Object.freeze([
    { nome: 'buscarProdutos', fonte: 'ProductService.list / ERP', retorna: 'produtos, especificações, voltagens, aplicações' },
    { nome: 'detalharProduto', fonte: 'ProductService.getById / ERP', retorna: 'ficha técnica completa' },
    { nome: 'consultarPrecoEstoque', fonte: 'ERP Callinfo', retorna: 'preço, estoque, disponibilidade (somente se cadastrados)' },
    { nome: 'consultarRegrasComerciais', fonte: 'ERP Callinfo', retorna: 'condições comerciais vigentes' },
    { nome: 'consultarServicos', fonte: 'ERP Callinfo', retorna: 'montagem, desmontagem, instalação' },
    { nome: 'solicitarCotacaoFrete', fonte: 'LogisticsService', retorna: 'status da cotação, prazo e valor quando disponíveis' },
    { nome: 'registrarOrcamento', fonte: 'LeadService / ERP', retorna: 'protocolo do orçamento' },
    { nome: 'transferirParaEspecialista', fonte: 'buildHandoff', retorna: 'atendimento humano com contexto' }
  ]);

  /**
   * Estrutura de intenção que a AXIA deverá extrair.
   * Ex.: "Quero uma masseira para entregar no Amazonas" ->
   * { intencao: 'compra', produto: 'masseira', destino: { uf: 'AM' },
   *   proximasInformacoes: ['capacidade', 'producao', 'voltagem', 'quantidade', 'cidade'] }
   */
  function createIntent(partial = {}) {
    return {
      intencao: null,       // 'compra' | 'duvida_tecnica' | 'frete' | 'pos_venda' | 'outro'
      produto: null,
      produtoId: null,
      destino: null,        // { cidade, uf }
      voltagem: null,
      quantidade: null,
      proximasInformacoes: [],
      ...partial
    };
  }

  /** Contexto para transferência a um vendedor. */
  function buildHandoff(context = {}) {
    const rows = [
      ['Cliente', context.cliente],
      ['Interesse', context.interesse],
      ['Destino', context.destino],
      ['Produto', context.produto],
      ['Voltagem', context.voltagem],
      ['Quantidade', context.quantidade],
      ['Status', context.status || 'Solicitou atendimento com especialista']
    ];
    return ['ATENDIMENTO VIA SITE / AXIA', ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join('\n');
  }

  function isOnline() {
    return config.axia.ativo && config.axia.modo === 'online' && Boolean(config.api.axia);
  }

  /**
   * Envia uma mensagem para a AXIA. Em modo preview, retorna a resposta padrão de encaminhamento.
   * @returns {Promise<{texto: string, acoes: string[], intencao?: Object}>}
   */
  async function ask(message, history = []) {
    if (!isOnline()) {
      return {
        texto: 'A AXIA está em fase de preparação e ainda não responde automaticamente. ' +
          'Para não passar nenhuma informação sem confirmação, vou encaminhar você para um especialista da Maquiminas.',
        acoes: ['especialista', 'orcamento', 'catalogo']
      };
    }
    try {
      const response = await fetch(config.api.axia, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ mensagem: message, historico: history, pagina: window.location.pathname })
      });
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    } catch (error) {
      console.error('[AxiaService]', error);
      return { texto: FALLBACK_MESSAGE, acoes: ['especialista'] };
    }
  }

  window.AxiaService = Object.freeze({ RULES, TOOLS, FALLBACK_MESSAGE, createIntent, buildHandoff, isOnline, ask });
})();
