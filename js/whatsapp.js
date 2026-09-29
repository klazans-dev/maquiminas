/**
 * WhatsApp — construção centralizada de links a partir de MAQUIMINAS_CONFIG.whatsapp.
 * Nenhum número deve ser escrito diretamente no HTML ou em outros scripts.
 */
(function () {
  const config = window.MAQUIMINAS_CONFIG;
  const number = String(config.whatsapp || '').replace(/\D/g, '');

  function isConfigured() {
    return number.length >= 10;
  }

  function buildUrl(message = config.whatsappMensagemPadrao) {
    if (!isConfigured()) return null;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  /** Número no formato brasileiro de exibição: (32) 98481-8603. */
  function displayNumber() {
    if (!isConfigured()) return '';
    const local = number.startsWith('55') && number.length > 11 ? number.slice(2) : number;
    const ddd = local.slice(0, 2);
    const rest = local.slice(2);
    return `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }

  function productMessage(product) {
    const parts = [`Olá! Tenho interesse no equipamento: ${product.nome}`];
    if (product.marca) parts.push(`Marca: ${product.marca}`);
    if (product.modelo) parts.push(`Modelo: ${product.modelo}`);
    parts.push('Poderia me passar mais informações e condições?');
    return parts.join('\n');
  }

  window.MaquiminasWhatsApp = Object.freeze({ isConfigured, buildUrl, displayNumber, productMessage });
})();
