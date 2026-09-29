/**
 * Formulários de orçamento e contato: validação acessível, máscara e envio via LeadService.
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  const { escapeHtml: esc } = window.Maquiminas;

  const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function maskPhone(value) {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function validateField(input) {
    const field = input.closest('.field');
    if (!field) return true;
    const value = input.value.trim();
    let message = '';

    if (input.required && !value) message = input.dataset.msgRequired || 'Preencha este campo.';
    else if (value && input.type === 'email' && !EMAIL_RE.test(value)) message = 'Informe um e-mail válido.';
    else if (value && input.dataset.type === 'phone' && value.replace(/\D/g, '').length < 10) message = 'Informe um WhatsApp com DDD.';
    else if (value && input.type === 'number' && (Number(value) < Number(input.min || 1))) message = 'Informe uma quantidade válida.';

    const error = field.querySelector('.field__error');
    field.classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  }

  function collect(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (key === 'website') return;
      if (key === 'servicos') {
        data.servicos = [...(data.servicos || []), value];
        return;
      }
      if (typeof value === 'string' && value.trim()) data[key] = value.trim();
    });
    return data;
  }

  function showStatus(form, type, html, focus = true) {
    const status = form.querySelector('.form-status');
    if (!status) return;
    status.className = `form-status form-status--${type} is-visible`;
    status.innerHTML = html;
    if (focus) status.focus();
  }

  async function prefillProduct(form) {
    const input = form.querySelector('[name="equipamento"]');
    if (!input) return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('produto');
    if (productId && window.ProductService) {
      const product = await window.ProductService.getById(productId);
      if (product) {
        input.value = [product.nome, product.marca, product.modelo].filter(Boolean).join(' ');
        const hidden = form.querySelector('[name="produtoId"]');
        if (hidden) hidden.value = product.id;
        return;
      }
    }
    if (params.get('equipamento')) input.value = params.get('equipamento');
  }

  function setupForm(form) {
    const tipo = form.dataset.leadForm;
    form.noValidate = true;

    form.querySelectorAll('select[data-uf]').forEach((select) => {
      select.insertAdjacentHTML('beforeend', UFS.map((uf) => `<option value="${uf}">${uf}</option>`).join(''));
    });

    form.querySelectorAll('[data-type="phone"]').forEach((input) => {
      input.addEventListener('input', () => {
        input.value = maskPhone(input.value);
      });
    });

    form.querySelectorAll('.input, .textarea, select').forEach((input) => {
      input.addEventListener('blur', () => {
        if (form.dataset.submitted) validateField(input);
      });
      input.addEventListener('input', () => {
        if (input.closest('.field.has-error')) validateField(input);
      });
    });

    prefillProduct(form);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      form.dataset.submitted = '1';

      if (form.querySelector('[name="website"]')?.value) return; // honeypot

      const inputs = [...form.querySelectorAll('.input, .textarea, select')];
      const invalid = inputs.filter((input) => !validateField(input));
      if (invalid.length) {
        showStatus(form, 'error', 'Revise os campos destacados para continuar.', false);
        invalid[0].focus();
        return;
      }

      const submit = form.querySelector('[type="submit"]');
      const label = submit.innerHTML;
      submit.disabled = true;
      submit.textContent = 'Enviando…';

      const data = collect(form);
      if (tipo === 'orcamento' && window.LogisticsService) {
        const produto = data.produtoId && window.ProductService ? await window.ProductService.getById(data.produtoId) : null;
        data.logistica = window.LogisticsService.buildQuoteRequest({
          produto,
          destinoCidade: data.cidade,
          destinoUF: data.estado,
          quantidade: data.quantidade,
          servicos: data.servicos || []
        });
      }

      const result = await window.LeadService.submit(tipo, data);

      submit.disabled = false;
      submit.innerHTML = label;

      if (!result.ok) {
        const instagram = `<a href="${esc(config.instagram)}" target="_blank" rel="noopener">Instagram</a>`;
        showStatus(form, 'error', `Não foi possível enviar sua solicitação por aqui no momento. Por favor, fale com a Maquiminas pelo ${instagram}.`);
        return;
      }

      if (result.canal === 'api') {
        showStatus(form, 'ok', '<strong>Solicitação enviada.</strong> Nossa equipe vai analisar e retornar pelo contato informado.');
        form.reset();
        delete form.dataset.submitted;
        return;
      }

      if (result.canal === 'whatsapp') {
        window.open(result.url, '_blank', 'noopener');
        showStatus(form, 'ok', `<strong>Quase lá!</strong> Abrimos o WhatsApp com sua solicitação preenchida — é só enviar a mensagem. Se a janela não abriu, <a href="${esc(result.url)}" target="_blank" rel="noopener">clique aqui</a>.`);
        return;
      }

      if (result.canal === 'email') {
        window.location.href = result.url;
        showStatus(form, 'ok', `<strong>Quase lá!</strong> Abrimos seu aplicativo de e-mail com a solicitação preenchida. Se ele não abriu, <a href="${esc(result.url)}">clique aqui</a>.`);
      }
    });
  }

  document.querySelectorAll('form[data-lead-form]').forEach(setupForm);
})();
