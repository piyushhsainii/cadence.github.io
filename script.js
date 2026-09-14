const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const observe = (callback, options) => new IntersectionObserver(callback, options);

// Keep reserved image areas and CSS illustrations intact when supplied assets are absent.
$$('img').forEach(img => {
  const fallback = () => img.classList.add('missing');
  img.addEventListener('error', fallback);
  if (img.complete && !img.naturalWidth) fallback();
});
if (!motion.matches) document.documentElement.classList.add('js-motion');
const revealObserver = observe(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .06 });
$$('.reveal').forEach(section => revealObserver.observe(section));

const header = $('.header'), menu = $('.menu-toggle');
const closeMenu = () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); };
menu.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
$$('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
// Cal.com owns these clicks; prevent the fallback hash from jumping to the footer.
// Keeping the event alive lets Cal's element-click listener open the booking UI.
$$('[data-cal-link]').forEach(control => control.addEventListener('click', event => {
  event.preventDefault();
  closeMenu();
}));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && header.classList.contains('menu-open')) { closeMenu(); menu.focus(); } });
const scrollHeader = () => header.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', scrollHeader, { passive: true }); scrollHeader();

// CSS owns the single mount timeline; completion removes its trigger permanently.
const hero = $('.hero'), heroScroll = $('.hero-scroll');
let heroFinished = !document.documentElement.classList.contains('hero-sequence');
function finishHero() {
  if (heroFinished) return;
  heroFinished = true;
  document.documentElement.classList.remove('hero-sequence');
}
hero.addEventListener('animationend', event => {
  if (event.target.matches('.hero-cta') && event.animationName === 'hero-enter') finishHero();
});
motion.addEventListener('change', () => {
  document.documentElement.classList.toggle('js-motion', !motion.matches);
  if (motion.matches) finishHero();
});

// The rectangular intro stays time-based. Only the separate aircraft responds to input.
const plane = $('.hero-plane'), flight = $('.hero-flight'), trailPaths = $$('.hero-trail path');
const flightStarted = performance.now(), pointer = { x: 0, y: 0 };
let flightFrame = 0, flightVisible = true, flightX = 0, flightY = 0, flightScale = 1, tailX = 0, tailY = 0;
let flightWidth = 0, flightHeight = 0, flightReady = false;
const headline = $('#hero-title'), headlineWords = [$('.hero-word-first'), $('.hero-word-second')];
let headlineProgress = 0, headlineCollapse = 0, planeRestY = 0;
function measureFlight() {
  flightWidth = hero.clientWidth; flightHeight = hero.clientHeight;
  const first = headlineWords[0], second = headlineWords[1];
  const gapTop = first.offsetTop + first.offsetHeight;
  const gap = second.offsetTop - gapTop;
  headlineCollapse = Math.max(0, gap - 24);
  // Use layout offsets for the gap, so previous scroll transforms cannot skew it.
  planeRestY = headline.getBoundingClientRect().top - hero.getBoundingClientRect().top + gapTop + gap / 2;
}
function animateFlight(now) {
  flightFrame = 0;
  const w = flightWidth, h = flightHeight;
  const intro = motion.matches || heroFinished ? 1 : clamp((now - flightStarted - 1100) / 600, 0, 1);
  const eased = 1 - Math.pow(1 - intro, 3);
  const progress = motion.matches || !heroFinished ? 0 : clamp(-heroScroll.getBoundingClientRect().top / Math.max(1, heroScroll.offsetHeight - h), 0, 1);
  const alignTarget = motion.matches ? 0 : clamp(progress / .4, 0, 1);
  headlineProgress += (alignTarget - headlineProgress) * (motion.matches ? 1 : .12);
  const lift = headlineCollapse * headlineProgress / 2;
  headlineWords[0].style.transform = 'translateY(' + lift + 'px)';
  headlineWords[1].style.transform = 'translateY(' + (-lift) + 'px)';
  $('.hero-settled').style.transform = 'translateY(' + (-lift) + 'px)';
  const x = w * (-.2 + .7 * eased + .75 * progress) + (intro === 1 ? pointer.x : 0);
  const y = h * 1.1 + (planeRestY - h * 1.1) * eased - h * .48 * progress + (intro === 1 ? pointer.y : 0);
  const scale = 1 + Math.sin(progress * Math.PI) * .4;
  const smooth = motion.matches || !flightReady ? 1 : .09;
  flightX += (x - flightX) * smooth; flightY += (y - flightY) * smooth;
  flightScale += (scale - flightScale) * smooth;
  const length = Math.min(w * .4, 420) * eased;
  tailX += (flightX - length - tailX) * (flightReady ? .06 : 1);
  tailY += (flightY + length * .65 - tailY) * (flightReady ? .06 : 1);
  flightReady = true;
  const bank = clamp((x - flightX) * .035 + (y - flightY) * .07, -12, 12);
  plane.style.transform = 'translate(' + flightX + 'px,' + flightY + 'px) translate(-50%,-50%) rotate(' + bank + 'deg) scale(' + flightScale + ')';
  flight.style.opacity = motion.matches ? '1' : String(clamp(intro * 3, 0, 1));
  const endX = flightX - plane.clientWidth * .16 * flightScale, endY = flightY + 14;
  const d = 'M ' + tailX + ' ' + tailY + ' Q ' + (tailX + length * .7) + ' ' + (tailY + pointer.y * .4) + ' ' + endX + ' ' + endY;
  trailPaths.forEach(path => path.setAttribute('d', d));
  $('.trail-sparks').style.strokeDashoffset = String(-flightX * .25);
  const unsettled = Math.abs(alignTarget - headlineProgress) * 100 + Math.abs(x - flightX) + Math.abs(y - flightY) + Math.abs(flightX - length - tailX) + Math.abs(flightY + length * .65 - tailY) > .2;
  if (!motion.matches && flightVisible && (!heroFinished || unsettled)) flightFrame = requestAnimationFrame(animateFlight);
}
function wakeFlight() { if (!flightFrame && flightVisible) flightFrame = requestAnimationFrame(animateFlight); }
hero.addEventListener('pointermove', event => {
  if (motion.matches || !heroFinished || event.pointerType === 'touch') return;
  const rect = hero.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width - .5) * Math.min(90, rect.width * .12);
  pointer.y = ((event.clientY - rect.top) / rect.height - .5) * 24;
  wakeFlight();
});
hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; wakeFlight(); });
addEventListener('scroll', wakeFlight, { passive: true });
addEventListener('resize', () => { measureFlight(); wakeFlight(); });
const flightObserver = observe(entries => {
  flightVisible = entries[0].isIntersecting;
  if (flightVisible) wakeFlight(); else { cancelAnimationFrame(flightFrame); flightFrame = 0; }
});
flightObserver.observe(hero);
motion.addEventListener('change', () => {
  cancelAnimationFrame(flightFrame); flightFrame = 0; pointer.x = pointer.y = 0;
  if (motion.matches) animateFlight(performance.now()); else wakeFlight();
});
measureFlight();
if (document.fonts) document.fonts.ready.then(() => { measureFlight(); wakeFlight(); });
if (motion.matches) animateFlight(performance.now()); else wakeFlight();

const carousel = $('.carousel'), track = $('.carousel-track'), cards = $$('.quote-card');
let slide = 0, dragStart = null;
function selectSlide(index) {
  slide = (index + cards.length) % cards.length;
  track.style.transform = `translateX(-${slide * (cards[0].getBoundingClientRect().width + 20)}px)`;
  $('.slide-count').textContent = `0${slide + 1} / 03`;
  cards.forEach((card, i) => card.setAttribute('aria-hidden', String(i !== slide)));
}
$('.previous').addEventListener('click', () => selectSlide(slide - 1));
$('.next').addEventListener('click', () => selectSlide(slide + 1));
carousel.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); selectSlide(slide + (event.key === 'ArrowRight' ? 1 : -1)); } });
carousel.addEventListener('pointerdown', event => { dragStart = event.clientX; carousel.setPointerCapture(event.pointerId); });
carousel.addEventListener('pointerup', event => { if (dragStart !== null && Math.abs(event.clientX - dragStart) > 40) selectSlide(slide + (event.clientX < dragStart ? 1 : -1)); dragStart = null; });
carousel.addEventListener('pointercancel', () => dragStart = null);
addEventListener('resize', () => selectSlide(slide)); selectSlide(0);

const features = $('.features'), tabs = $$('[role="tab"]'), panels = $$('[role="tabpanel"]');
let activeTab = 0, elapsed = 0, previousTime = performance.now(), hovered = false, focused = false;
function selectTab(index, focus = false) {
  activeTab = (index + tabs.length) % tabs.length; elapsed = 0;
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === activeTab)); tab.tabIndex = i === activeTab ? 0 : -1; $('.tab-progress', tab).style.transform = 'scaleX(0)'; panels[i].hidden = i !== activeTab; });
  if (focus) tabs[activeTab].focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(i));
  tab.addEventListener('keydown', event => {
    const keys = { ArrowRight: activeTab + 1, ArrowLeft: activeTab - 1, Home: 0, End: 3 };
    if (event.key in keys) { event.preventDefault(); selectTab(keys[event.key], true); }
  });
});
features.addEventListener('mouseenter', () => hovered = true);
features.addEventListener('mouseleave', () => hovered = false);
features.addEventListener('focusin', () => focused = true);
features.addEventListener('focusout', event => focused = features.contains(event.relatedTarget));
setInterval(() => {
  const now = performance.now(), delta = Math.min(now - previousTime, 150); previousTime = now;
  if (hovered || focused || motion.matches || document.hidden) return;
  elapsed += delta;
  if (elapsed >= 3500) selectTab(activeTab + 1);
  $('.tab-progress', tabs[activeTab]).style.transform = `scaleX(${elapsed / 3500})`;
}, 50);

// Honest, replaceable endpoints: no invented contact address, prices, or legal policy.
const dialog = $('#info-dialog');
const messages = {
  pricing: ['A plan for your pace.', 'Packages will be tailored to your content formats, platforms, and publishing frequency. Pricing has not been published yet.'],
  social: ['More Cadence, coming soon.', 'Our social profile links will be added here before launch.'],
  privacy: ['Privacy policy', 'When you send a demo request, Cadence uses your name, email and project details to respond to your inquiry. Connected submissions are stored in Google Sheets. To request deletion, email sainipiyush8860@gmail.com. Google Fonts is loaded from Google.'],
  terms: ['Terms of service', 'Service terms have not been published. Add your business terms here before accepting bookings or payments.']
};
$$('[data-dialog]').forEach(button => button.addEventListener('click', () => {
  const [title, copy] = messages[button.dataset.dialog];
  $('#dialog-title').textContent = title; $('#dialog-copy').textContent = copy;
  dialog.setAttribute('aria-labelledby', 'dialog-title'); dialog.showModal();
}));
$$('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
$('#year').textContent = new Date().getFullYear();
