/**
 * Ícones SVG inline (traço 1.75, 24x24). Uso no HTML: <span data-icon="nome"></span>
 */
(function () {
  const s = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

  const ICONS = {
    arrow: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    'arrow-up-right': s('<path d="M7 17L17 7M8 7h9v9"/>'),
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.23 8.23 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.22-8.24 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>',
    user: s('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'),
    lock: s('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 118 0v3"/>'),
    instagram: s('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>'),
    mail: s('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    phone: s('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'),
    search: s('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    close: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    send: s('<path d="M4 12l16-8-6 16-2-7-8-1z"/>'),
    box: s('<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),
    compass: s('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
    truck: s('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    wrench: s('<path d="M14.7 6.3a4 4 0 00-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 005.1-5.4l-2.4 2.4-2.8-.8-.8-2.8z"/>'),
    tools: s('<path d="M3 21l7-7M14 4l6 6-3 3-6-6zM5 3l3 3-2 2-3-3z"/><path d="M13 13l6 6"/>'),
    plug: s('<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4"/>'),
    unpack: s('<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/><path d="M7.5 5l9 4"/>'),
    headset: s('<path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/><path d="M19 20a3 3 0 01-3 2h-3"/>'),
    shield: s('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
    check: s('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    pin: s('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    sliders: s('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    info: s('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h0"/>'),
    chat: s('<path d="M4 5h16v11H9l-5 4z"/>'),
    grid: s('<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'),
    doc: s('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>'),
    route: s('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H16a3 3 0 000-6H8a3 3 0 010-6h7.5"/>'),
    wallet: s('<path d="M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a1 1 0 01-1-1z"/><path d="M4 7l11-3v3M16 13.5h.01"/>'),
    barcode: s('<path d="M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12"/>'),
    alert: s('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h0"/>'),
    door: s('<path d="M5 21V4h10v17M15 6h4v15M3 21h18"/><path d="M12 12h.01"/>'),
    dolly: s('<path d="M5 3h2l3 14"/><circle cx="11" cy="19" r="2"/><path d="M13 18l8-2"/><rect x="11" y="7" width="8" height="7" transform="rotate(-12 15 10.5)"/>'),
    'no-flip': s('<circle cx="12" cy="12" r="10"/><path d="M5 5l14 14"/><rect x="8.5" y="11.5" width="7" height="6" rx="0.5"/><path d="M7.5 10a5 5 0 019 0"/><path d="M16.5 10l.4-2.3M16.5 10l-2.3-.5"/>'),
    'no-disassemble': s('<circle cx="12" cy="12" r="10"/><path d="M5 5l14 14"/><path d="M14.5 7.5a2.5 2.5 0 00-3.3 3.1L7.5 14.3l1.9 1.9 3.7-3.7a2.5 2.5 0 003.1-3.3l-1.5 1.5-1.4-.4-.4-1.4z"/>'),
    'no-open': s('<circle cx="12" cy="12" r="10"/><path d="M5 5l14 14"/><path d="M7.5 11h9v6h-9z"/><path d="M7.5 11l1.5-3.5h6L16.5 11"/>')
  };

  function render(root = document) {
    root.querySelectorAll('[data-icon]').forEach((el) => {
      if (el.dataset.iconRendered) return;
      const svg = ICONS[el.dataset.icon];
      if (svg) {
        el.innerHTML = svg;
        el.dataset.iconRendered = '1';
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  window.MaquiminasIcons = Object.freeze({ ICONS, render, get: (name) => ICONS[name] || '' });
})();
