/**
 * LeadService — envio de orçamentos e contatos.
 *
 * Ordem de canais:
 *   1. MAQUIMINAS_CONFIG.api.leads  -> backend próprio -> ERP Callinfo (futuro)
 *   2. WhatsApp comercial (mensagem formatada)
 *   3. E-mail (mailto)
 * Não existe backend fictício: se nenhum canal estiver configurado, o envio falha com aviso.
 *
 * O objeto Lead também é o "contexto de atendimento" que a AXIA usará para transferir
 * a conversa a um vendedor sem perder informações (ver AxiaService.buildHandoff).
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  const whatsapp = window.MaquiminasWhatsApp;

  /**
   * @typedef {Object} Lead
   * @property {'orcamento'|'contato'} tipo
   * @property {string} nome
   * @property {string} [empresa]
   * @property {string} whatsapp
   * @property {string} email
   * @property {string} [cidade]
   * @property {string} [estado]
   * @property {string} [equipamento]
   * @property {string} [produtoId]
   * @property {number} [quantidade]
   * @property {string[]} [servicos]   frete, montagem, desmontagem, instalação
   * @property {string} [assunto]
   * @property {string} [mensagem]
   * @property {Object} origem         página, referrer e UTM
   * @property {string} status
   */
  function buildLead(tipo, data) {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
      if (params.get(key)) utm[key] = params.get(key);
    });
    return {
      tipo,
      ...data,
      quantidade: data.quantidade ? Number(data.quantidade) : undefined,
      status: tipo === 'orcamento' ? 'Solicitou orçamento' : 'Enviou mensagem',
      origem: {
        canal: 'site',
        pagina: window.location.pathname,
        referrer: document.referrer || null,
        utm,
        criadoEm: new Date().toISOString()
      }
    };
  }

  function formatMessage(lead) {
    const title = lead.tipo === 'orcamento' ? 'SOLICITAÇÃO DE ORÇAMENTO — SITE' : 'CONTATO — SITE';
    const rows = [
      ['Nome', lead.nome],
      ['Empresa', lead.empresa],
      ['WhatsApp', lead.whatsapp],
      ['E-mail', lead.email],
      ['Cidade/UF', [lead.cidade, lead.estado].filter(Boolean).join(' - ')],
      ['Equipamento', lead.equipamento],
      ['Quantidade', lead.quantidade],
      ['Serviços', (lead.servicos || []).join(', ')],
      ['Assunto', lead.assunto],
      ['Mensagem', lead.mensagem]
    ];
    return [title, ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join('\n');
  }

  async function sendToApi(lead) {
    const response = await fetch(config.api.leads, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(lead)
    });
    if (!response.ok) throw new Error(`Falha no envio (${response.status})`);
    return { ok: true, canal: 'api' };
  }

  /**
   * @returns {Promise<{ok: boolean, canal?: 'api'|'whatsapp'|'email', url?: string, motivo?: string}>}
   */
  async function submit(tipo, data) {
    const lead = buildLead(tipo, data);

    if (config.api.leads) {
      try {
        return await sendToApi(lead);
      } catch (error) {
        console.error('[LeadService]', error);
      }
    }

    const message = formatMessage(lead);
    if (whatsapp.isConfigured()) {
      return { ok: true, canal: 'whatsapp', url: whatsapp.buildUrl(message) };
    }
    if (config.email) {
      const subject = lead.tipo === 'orcamento' ? 'Solicitação de orçamento' : lead.assunto || 'Contato pelo site';
      return {
        ok: true,
        canal: 'email',
        url: `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
      };
    }

    console.warn('[LeadService] Nenhum canal de envio configurado. Defina api.leads, whatsapp ou email em js/config.js.');
    return { ok: false, motivo: 'sem-canal' };
  }

  window.LeadService = Object.freeze({ submit, buildLead, formatMessage });
})();
