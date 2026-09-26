const header = document.querySelector('.header');
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  header.classList.remove('menu-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
}));
document.querySelector('#year').textContent = new Date().getFullYear();
