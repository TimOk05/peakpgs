const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const quoteForm = document.querySelector('[data-quote-form]');
const dialog = document.querySelector('[data-dialog]');
const dialogClose = document.querySelector('[data-dialog-close]');
const messagePreview = document.querySelector('[data-message-preview]');
const copyButton = document.querySelector('[data-copy-message]');
const dialogStatus = document.querySelector('[data-dialog-status]');
let lastFocusedElement = null;
let preparedMessage = '';

const setHeaderState = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 28);
};

const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Open navigation';
  nav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

const openMenu = () => {
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.querySelector('.sr-only').textContent = 'Close navigation';
  nav.classList.add('is-open');
  document.body.classList.add('menu-open');
};

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const validateField = (field) => {
  const wrapper = field.closest('.field');
  const isValid = field.checkValidity();
  wrapper.classList.toggle('is-invalid', !isValid);
  field.setAttribute('aria-invalid', String(!isValid));
  return isValid;
};

quoteForm.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.closest('.field').classList.contains('is-invalid')) validateField(field);
  });
});

const closeDialog = () => {
  dialog.hidden = true;
  document.body.classList.remove('dialog-open');
  dialogStatus.textContent = '';
  lastFocusedElement?.focus();
};

const openDialog = () => {
  lastFocusedElement = document.activeElement;
  dialog.hidden = false;
  document.body.classList.add('dialog-open');
  dialogClose.focus();
};

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...quoteForm.querySelectorAll('input, select, textarea')];
  const isValid = fields.map(validateField).every(Boolean);
  if (!isValid) {
    fields.find((field) => !field.checkValidity())?.focus();
    return;
  }

  const data = new FormData(quoteForm);
  preparedMessage = [
    'Hi Peak, I would like a free quote.',
    '',
    `Name: ${data.get('name')}`,
    `Service: ${data.get('service')}`,
    `Postcode: ${String(data.get('postcode')).toUpperCase()}`,
    `Job details: ${data.get('details')}`
  ].join('\n');
  messagePreview.textContent = preparedMessage;
  openDialog();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(preparedMessage);
    dialogStatus.textContent = 'Copied — you can now paste it into Instagram.';
    copyButton.textContent = 'Message copied ✓';
    window.setTimeout(() => { copyButton.textContent = 'Copy message'; }, 2200);
  } catch {
    dialogStatus.textContent = 'Select the message above and copy it manually.';
  }
});

dialogClose.addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!dialog.hidden) closeDialog();
    else closeMenu();
  }
});
