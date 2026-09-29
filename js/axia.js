/**
 * Interface da AXIA (modo preview). A lógica de atendimento fica no AxiaService.
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  if (!config.axia.ativo) return;

  const { url, escapeHtml: esc } = window.Maquiminas;
  const icon = window.MaquiminasIcons.get;
  const axia = window.AxiaService;
  const wa = window.MaquiminasWhatsApp;
  const history = [];

  function specialistUrl() {
    const context = {
      interesse: history.filter((m) => m.autor === 'cliente').map((m) => m.texto).join(' | ') || undefined,
      produto: document.body.dataset.page === 'produto' ? document.querySelector('.product__title')?.textContent : undefined,
      status: 'Solicitou atendimento com especialista pela AXIA'
    };
    return wa.buildUrl(axia.buildHandoff(context)) || url('pages/contato.html');
  }

  const ACTIONS = {
    catalogo: () => ({ label: 'Encontrar um equipamento', href: url('pages/equipamentos.html'), icon: 'search' }),
    orcamento: () => ({ label: 'Solicitar orçamento', href: url('pages/orcamento.html'), icon: 'doc' }),
    especialista: () => ({ label: 'Falar com um especialista', href: specialistUrl(), icon: 'headset', external: wa.isConfigured() }),
    cliente: () => ({ label: 'Acessar Área do Cliente', href: config.areaCliente, icon: 'user', external: true }),
    condicoes: () => ({ label: 'Condições de pagamento e políticas', href: url('pages/condicoes.html'), icon: 'wallet' })
  };

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'fab-axia';
  fab.setAttribute('aria-controls', 'axia-panel');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<span class="fab-axia__dot" aria-hidden="true">A</span><span class="fab-axia__label">Fale com a AXIA</span>';
  fab.setAttribute('aria-label', 'Abrir assistente AXIA');

  const panel = document.createElement('section');
  panel.className = 'axia';
  panel.id = 'axia-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'axia-title');
  panel.innerHTML = `
    <header class="axia__head">
      <span class="axia__avatar" aria-hidden="true">A</span>
      <div class="axia__title"><strong id="axia-title">AXIA</strong><small>Assistente Maquiminas · em preparação</small></div>
      <button type="button" class="axia__close" aria-label="Fechar assistente">${icon('close')}</button>
    </header>
    <div class="axia__body" aria-live="polite"></div>
    <form class="axia__form">
      <label class="sr-only" for="axia-input">Escreva sua mensagem</label>
      <input id="axia-input" type="text" autocomplete="off" placeholder="Descreva o que você precisa…" maxlength="500">
      <button type="submit" aria-label="Enviar mensagem">${icon('send')}</button>
    </form>
    <p class="axia__foot">A AXIA não informa preços, prazos ou fretes sem dados oficiais.</p>`;

  const floating = document.querySelector('.floating');
  (floating || document.body).appendChild(fab);
  document.body.appendChild(panel);

  const body = panel.querySelector('.axia__body');
  const form = panel.querySelector('.axia__form');
  const input = panel.querySelector('#axia-input');

  function addMessage(text, author) {
    const el = document.createElement('div');
    el.className = `axia-msg axia-msg--${author === 'cliente' ? 'user' : 'bot'}`;
    el.textContent = text;
    body.appendChild(el);
    history.push({ autor: author, texto: text });
    body.scrollTop = body.scrollHeight;
  }

  function addActions(keys) {
    const wrap = document.createElement('div');
    wrap.className = 'axia__actions';
    wrap.innerHTML = keys
      .map((key) => {
        const a = ACTIONS[key]();
        return `<a class="axia-action" href="${esc(a.href)}" ${a.external ? 'target="_blank" rel="noopener"' : ''}>${esc(a.label)}${icon(a.icon)}</a>`;
      })
      .join('');
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    addMessage('Olá! Sou a AXIA, assistente da Maquiminas. Posso ajudar você a encontrar um equipamento, solicitar um orçamento ou falar com um especialista.', 'axia');
    addActions(['catalogo', 'orcamento', 'condicoes', 'especialista', 'cliente']);
  }

  /* ---------- Saudação automática (uma vez por sessão) ---------- */
  const GREET_KEY = 'mq_axia_saudacao';
  let greet = null;

  function greetSeen() {
    try { return sessionStorage.getItem(GREET_KEY) === '1'; } catch (e) { return false; }
  }
  function markGreetSeen() {
    try { sessionStorage.setItem(GREET_KEY, '1'); } catch (e) { /* armazenamento indisponível */ }
  }

  function hideGreet() {
    if (!greet) return;
    markGreetSeen();
    greet.classList.remove('is-visible');
    const el = greet;
    greet = null;
    setTimeout(() => el.remove(), 250);
  }

  function showGreet() {
    if (greet || greetSeen() || panel.classList.contains('is-open')) return;
    greet = document.createElement('aside');
    greet.className = 'axia-greet';
    greet.setAttribute('aria-label', 'Mensagem da assistente AXIA');
    const options = ['catalogo', 'orcamento', 'especialista', 'cliente'].map((key) => {
      const a = ACTIONS[key]();
      return `<a class="axia-greet__opt" href="${esc(a.href)}" ${a.external ? 'target="_blank" rel="noopener"' : ''}>${icon(a.icon)}<span>${esc(a.label)}</span></a>`;
    });
    greet.innerHTML = `
      <button type="button" class="axia-greet__close" aria-label="Fechar mensagem da AXIA">${icon('close')}</button>
      <div class="axia-greet__head">
        <span class="axia__avatar" aria-hidden="true">A</span>
        <p role="status"><strong>Olá! Sou a AXIA.</strong> Assistente da Maquiminas. Como posso ajudar você hoje?</p>
      </div>
      <div class="axia-greet__opts">${options.join('')}</div>
      <button type="button" class="axia-greet__chat">Conversar com a AXIA ${icon('arrow')}</button>`;
    (floating || document.body).prepend(greet);
    requestAnimationFrame(() => requestAnimationFrame(() => greet && greet.classList.add('is-visible')));

    greet.querySelector('.axia-greet__close').addEventListener('click', hideGreet);
    greet.querySelector('.axia-greet__chat').addEventListener('click', () => {
      hideGreet();
      setOpen(true);
    });
    greet.querySelectorAll('.axia-greet__opt').forEach((a) => a.addEventListener('click', markGreetSeen));
  }

  if (config.axia.saudacaoAutomatica && !greetSeen()) {
    setTimeout(showGreet, config.axia.saudacaoAtrasoMs || 2500);
  }

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) {
      hideGreet();
      start();
      setTimeout(() => input.focus(), 150);
    } else {
      fab.focus();
    }
  }

  fab.addEventListener('click', () => setOpen(true));
  panel.querySelector('.axia__close').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-axia-open]');
    if (trigger) {
      e.preventDefault();
      setOpen(true);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage(text, 'cliente');
    const reply = await axia.ask(text, history);
    addMessage(reply.texto, 'axia');
    if (reply.acoes && reply.acoes.length) addActions(reply.acoes.filter((k) => ACTIONS[k]));
  });
})();
