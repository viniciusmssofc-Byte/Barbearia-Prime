'use strict';

/* PERSONALIZAÇÃO: número internacional, somente dígitos (DDI + DDD + número).
   Deixe vazio para manter a demonstração sem contato real.
   Redes sociais: deixe vazio ou use a URL HTTPS do perfil autorizado. */
const CONFIG = Object.freeze({
  whatsappNumber: '',
  whatsappMessage: 'Olá! Gostaria de saber mais sobre os serviços da Barbearia Prime.',
  instagramUrl: '',
  facebookUrl: ''
});

document.body.classList.add('js-ready');
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.menu-toggle');
const toggleLabel = toggle.querySelector('.sr-only');
toggle.hidden = false;

function closeMenu(returnFocus = false) {
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggleLabel.textContent = 'Abrir menu';
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggleLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
});
menu.addEventListener('click', event => {
  const link = event.target.closest('a');
  // Mantém o acionador do diálogo visível para restaurar o foco ao fechar.
  if (!link || dialog.open) return;
  const wasOpen = menu.classList.contains('is-open');
  closeMenu();
  if (wasOpen && link.hash) {
    const destination = document.querySelector(link.hash);
    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  } else if (wasOpen) {
    toggle.focus();
  }
});
document.addEventListener('keydown', event => {
  if (dialog.open) return;
  if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (dialog.open) return;
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', () => closeMenu());

const dialog = document.querySelector('#demo-dialog');
function showDemo(message) {
  document.querySelector('#dialog-description').textContent = message;
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
  } else {
    // Fallback para navegadores antigos sem suporte a dialog.
    window.alert(message);
  }
}
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

const number = CONFIG.whatsappNumber.trim();
// Validação de formato internacional; a existência do número deve ser verificada pelo proprietário.
const validNumber = /^[1-9]\d{9,14}$/.test(number);
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  if (validNumber) {
    const message = link.dataset.service
      ? `Olá! Tenho interesse no serviço ${link.dataset.service} da Barbearia Prime.`
      : CONFIG.whatsappMessage;
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.addEventListener('click', event => {
      event.preventDefault();
      showDemo('Esta barbearia é fictícia. Nenhum número de WhatsApp está ativo e nenhum agendamento será realizado. Para adaptar o site, configure um número autorizado em CONFIG.whatsappNumber no arquivo script.js.');
    });
  }
});
if (validNumber) {
  document.querySelector('#contact-note').textContent = 'O botão abre o WhatsApp em uma nova aba. O contato acontece no serviço externo; este site não coleta dados nem confirma reservas.';
} else if (number) {
  console.warn('WhatsApp desativado: use somente dígitos no formato internacional, com 10 a 15 dígitos.');
}

document.querySelectorAll('[data-demo]').forEach(link => {
  const url = link.dataset.demo === 'Instagram' ? CONFIG.instagramUrl : CONFIG.facebookUrl;
  let validUrl = false;
  try { validUrl = Boolean(url) && new URL(url).protocol === 'https:'; } catch { /* Permanece demonstrativo. */ }
  if (validUrl) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.addEventListener('click', event => {
      event.preventDefault();
      showDemo(`${link.dataset.demo} demonstrativo: a Barbearia Prime não possui um perfil real vinculado. Configure a URL do seu próprio perfil em script.js para personalizar este link.`);
    });
  }
});

const filters = document.querySelector('.gallery-filters');
filters.hidden = false;
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  document.querySelectorAll('.gallery-item').forEach(item => {
    const visible = button.dataset.filter === 'todos' || item.dataset.category === button.dataset.filter;
    item.hidden = !visible;
    if (visible) count++;
  });
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'referência exibida' : 'referências exibidas'}.`;
});

// O conteúdo continua visível se JavaScript ou IntersectionObserver não estiver disponível.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

  const navLinks = [...menu.querySelectorAll('a:not(.button)')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  navLinks.forEach(link => {
    const section = document.querySelector(link.hash);
    if (section) sectionObserver.observe(section);
  });
}
document.querySelector('#year').textContent = new Date().getFullYear();
