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

  /**
   * Respostas oficiais sobre condições e políticas, montadas a partir de
   * MAQUIMINAS_CONFIG.condicoes / presenca (nunca texto livre inventado).
   */
  function policyAnswer(message) {
    const c = config.condicoes;
    const p = config.presenca || {};
    if (!c) return null;
    const text = String(message || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const raio = p.freteGratis ? p.freteGratis.raioKm : null;
    const cidade = p.industria ? `${p.industria.cidade} (${p.industria.uf})` : 'nossa indústria';
    const emp = config.empresa || {};
    const partes = [];
    if (/cnpj|quem somos|vovo odete|odete|fundad|historia da empresa/.test(text) && emp.cnpj) {
      partes.push(
        `A Maquiminas Equipamentos (CNPJ ${emp.cnpj}) foi fundada a partir da tradicional ${emp.origem || 'Padaria Vovó Odete'}. ` +
        `Atuamos há ${emp.tempoMercado || 'décadas'}, com fábrica, estoque próprio e estrutura para atendimento e suporte em ${cidade}. ` +
        'Emitimos nota fiscal, as máquinas são testadas e o atendimento é direto e humanizado. ' +
        'O Instagram oficial é @maquiminasequipamentos.'
      );
    }

    if (/pag|parcel|boleto|entrada|prazo de pag|forma de pag|condic|pix|cartao/.test(text)) {
      const ufs = (c.entradaNaEntregaEstados || []).join(', ');
      partes.push(
        `Pagamento: ${c.entradaPercentual}% de entrada${c.pixEntrada ? ' no PIX' : ''} e o restante no ${c.restante}.` +
        (c.boletoAposAnaliseCadastral ? ' O boleto é gerado após análise cadastral e contrato.' : '') +
        (c.naoAceitaCartao ? ' Não trabalhamos com cartão de crédito no site.' : '') +
        ' O número de parcelas é definido no orçamento.'
      );
      if (c.entradaNaEntrega) {
        partes.push(
          `Entrada na entrega: ${c.entradaNaEntregaQuando || 'conforme orçamento'}${ufs ? ` (${ufs})` : ''}. ` +
          `Fora desse recorte, ${c.entradaForaDoEscopo}.`
        );
      }
    }
    if (/voltag|220|380|tensao|energia/.test(text) && c.voltagemObrigatoria) {
      partes.push('Voltagem: é obrigatório informar se a rede é 220 V ou 380 V. A voltagem errada pode exigir conversão no destino, por conta do comprador.');
    }
    if (/frete|envio|transport|quilometr|distancia/.test(text) && raio) {
      partes.push(
        `Frete: entregamos em todo o Brasil. Frete grátis em um raio de ${raio} km da indústria, em ${cidade}, no sentido ${p.freteGratis.regiao}. Acima disso, o frete é ${c.freteForaDoRaio}.` +
        (c.fretePagoNoCarregamento ? ' O frete é pago no carregamento.' : '')
      );
    }
    if (/descarg|caminhao|porta|espaco|passar|receb|carga|carreg/.test(text)) {
      const carga = c.cargaPorContaDaIndustria ? 'O carregamento na indústria é por conta da Maquiminas. ' : '';
      partes.push(`${carga}A retirada da máquina do caminhão e o espaço para ela passar até o local na loja são por conta do comprador.`);
    }
    if (/montad|montar|desmont/.test(text)) {
      partes.push(
        `Envio: o equipamento segue montado. Até ${c.desmontadoComMontadorAteKm} km da indústria, o envio desmontado com montador pode ser avaliado e a montagem é cobrada no orçamento.` +
        (c.desmontadoPerdeGarantia ? ' Se o comprador optar por receber desmontado, a garantia é perdida.' : '')
      );
    }
    if (/garantia|semi-novo|seminovo|reformad/.test(text)) {
      partes.push(
        `Garantia: equipamentos novos fabricados pela Maquiminas têm ${c.garantiaNovoMeses} meses. Semi-novos e reformados têm ${c.garantiaSemiNovoDias} dias.` +
        (c.desmontadoPerdeGarantia ? ' Receber desmontado implica perda da garantia.' : '')
      );
    }
    if (/tecnico|assistenc|manutenc|conserto/.test(text) && c.assistenciaTecnicaRaioKm) {
      partes.push(`Assistência: em um raio de ${c.assistenciaTecnicaRaioKm} km da indústria, a manutenção pode ser feita por técnico da Maquiminas. Fora desse raio, indicamos técnico da região. Condições conforme o orçamento e a garantia vigente.`);
    }
    if (/virar|ponta|cabeca|abrir|manuse|regra|deitar|lastro/.test(text) && c.regrasManuseio.length) {
      partes.push(`Regras de manuseio: ${c.regrasManuseio.join('; ')}. Fornos de lastro não podem ser deitados: a pedra quebra.`);
    }
    if (!partes.length) return null;
    return { texto: partes.join('\n\n'), acoes: ['condicoes', 'orcamento', 'especialista'] };
  }

  function isOnline() {
    return config.axia.ativo && config.axia.modo === 'online' && Boolean(config.api.axia);
  }

  /**
   * Envia uma mensagem para a AXIA. Em modo preview, retorna a resposta padrão de encaminhamento.
   * @returns {Promise<{texto: string, acoes: string[], intencao?: Object}>}
   */
  async function ask(message, history = []) {
    const policy = policyAnswer(message);
    if (policy) return policy;
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

  window.AxiaService = Object.freeze({ RULES, TOOLS, FALLBACK_MESSAGE, createIntent, buildHandoff, policyAnswer, isOnline, ask });
})();
