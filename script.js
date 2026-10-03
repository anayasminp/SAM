const screens = ['s-welcome','s-input','s-check','s-story','s-brand'];
let dailyMinutes = 0, sceneIndex = 0, scenes = [];
let portalOpened = false;
let splashTimers = [];

function clearSplashTimers(){
  splashTimers.forEach(t => clearTimeout(t));
  splashTimers = [];
}

function removeSplash(instant){
  const sp = document.getElementById('splash');
  if (!sp) return;
  
  sp.classList.add('pointer-events-none');
  if (instant) { sp.remove(); return; }
  sp.style.transition = 'opacity 0.7s ease, visibility 0.7s';
  sp.style.opacity = 0;
  sp.style.visibility = 'hidden';
  sp.style.pointerEvents = 'none';
  setTimeout(() => sp.remove(), 800);
}

function show(id){
  screens.forEach(s => {
    const el = document.getElementById(s);
    if (s === id) { el.classList.remove('screen-hidden'); el.style.opacity = ''; }
    else el.classList.add('screen-hidden');
  });
}

function parseTime(){
  const h = parseInt(document.getElementById('time-h').value) || 0;
  const m = parseInt(document.getElementById('time-m').value) || 0;
  return h * 60 + m;
}

function fmt(mins){
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h && m) return h + 'h' + String(m).padStart(2,'0');
  if (h) return h + ' horas';
  return m + ' minutos';
}

function fmtH(mins){
  return Math.round(mins / 60).toLocaleString('pt-BR') + ' horas';
}

const nf = n => n.toLocaleString('pt-BR');

function buildScenes(){
  const d = dailyMinutes, y = d * 365;
  scenes = [
    { text: 'Você dedica <span class="font-display text-6xl sm:text-7xl font-semibold countup block mt-4">' + fmt(d) + '</span> por dia às telas.' },
    { text: 'Isso representa <span class="font-display text-6xl sm:text-7xl font-semibold block mt-4">' + fmtH(d * 7) + '</span> por semana.' },
    { text: 'Aproximadamente <span class="font-display text-6xl sm:text-7xl font-semibold block mt-4">' + fmtH(d * 30) + '</span> por mês.' },
    { text: 'Mais de <span class="font-display text-6xl sm:text-7xl font-semibold block mt-4">' + fmtH(y) + '</span> por ano.', hint: 'Isso é quase ' + nf(Math.round(y / 1440)) + ' dias inteiros por ano.' },
    { text: '“Parece pouco, né?”', small: true },
    { text: '“Então vamos transformar esse tempo em coisas que você consegue imaginar.”', small: true },
    { text: 'Com esse tempo, você poderia ler aproximadamente <span class="font-semibold">' + nf(Math.floor(y / 8)) + ' livros</span>.', note: 'Estimativa: ~8 horas de leitura por livro.' },
    { text: 'Poderia assistir a <span class="font-semibold">' + nf(Math.floor(y / 2)) + ' filmes</span>.', note: 'Estimativa: ~2 horas por semana.' },
    { text: 'Poderia fazer <span class="font-semibold">' + nf(Math.floor(y / 1)) + ' caminhadas de uma hora</span>.', note: 'Estimativa: ~1 hora por sessão.' },
    { text: 'Poderia dedicar <span class="font-semibold">' + fmtH(y / 2) + '</span> a um novo hobby ou projeto pessoal.', note: 'Aproximação.' },
    { text: 'Ou aprender um idioma por <span class="font-semibold">' + fmtH(y / 3) + '</span> — o equivalente a vários anos de aulas semanais.', note: 'Estimativa.' },
    { text: '“Agora parece pouco para você?”', small: true, pause: 2600, last: true }
  ];
}

function renderScene(i){
  const stage = document.getElementById('story-stage');
  const s = scenes[i];
  const hint = document.getElementById('story-hint');
  hint.textContent = s.last ? 'Toque para continuar' : (window.innerWidth < 768 ? 'Toque para continuar' : 'Clique ou pressione espaço');
  stage.innerHTML = '<p class="font-display ' + (s.small ? 'text-3xl sm:text-4xl font-light' : 'text-2xl sm:text-3xl font-light') + ' leading-snug scene">' + s.text + '</p>' +
    (s.hint ? '<p class="mt-6 text-clay text-sm scene">' + s.hint + '</p>' : '') +
    (s.note ? '<p class="mt-6 text-xs text-clay scene">' + s.note + '</p>' : '');
  requestAnimationFrame(() => {
    stage.querySelectorAll('.scene').forEach(el => {
      el.style.opacity = 0; el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 1s ease, transform 1s ease';
      requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'none'; });
    });
  });
  renderDots();
  if (s.pause) setTimeout(() => { if (sceneIndex === i) nextScene(); }, s.pause);
}

function renderDots(){
  const dots = document.getElementById('story-dots');
  dots.innerHTML = scenes.map((_, i) =>
    '<span class="w-2 h-2 rounded-full ' + (i <= sceneIndex ? 'bg-bark' : 'bg-sand/50') + '"></span>').join('');
}

function nextScene(){
  sceneIndex++;
  if (sceneIndex >= scenes.length) return endStory();
  renderScene(sceneIndex);
}

function endStory(){
  const story = document.getElementById('s-story');
  story.style.opacity = 0;
  setTimeout(() => {
    if (portalOpened) return;
    story.classList.add('screen-hidden');
    story.style.opacity = '';
    show('s-brand');
    brandReveal();
  }, 700);
}

function brandReveal(){
  if (portalOpened) return;
  const brand = document.getElementById('s-brand');
  const els = brand.querySelectorAll('.reveal');
  els.forEach((el, i) => setTimeout(() => el.classList.add('in'), 400 + i * 500));
  setTimeout(openPortal, 3800);
}

function openPortal(){
  if (portalOpened) return;
  portalOpened = true;
  clearSplashTimers();
  removeSplash(false);
  show(null);
  const brand = document.getElementById('s-brand');
  brand.classList.add('screen-hidden');
  const story = document.getElementById('s-story');
  story.classList.add('screen-hidden');
  story.style.opacity = '';
  const portal = document.getElementById('portal');
  portal.classList.remove('hidden');
  document.getElementById('site-header').classList.remove('opacity-0','pointer-events-none');
  const footer = document.getElementById('site-footer');
  footer.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    portal.classList.remove('opacity-0');
    footer.classList.remove('opacity-0');
  }));
  window.scrollTo({ top: 0 });
  fillEntenda();
  initReveal();
  initDesafio();
}

function fillEntenda(){
  if (!dailyMinutes) return;
  document.getElementById('entenda-empty').classList.add('hidden');
  const grid = document.getElementById('entenda-grid');
  const note = document.getElementById('entenda-note');
  const d = dailyMinutes;
  const items = [['Por dia', fmt(d)], ['Por semana', fmtH(d * 7)], ['Por mês', fmtH(d * 30)], ['Por ano', fmtH(d * 365)]];
  grid.innerHTML = items.map(([label, val]) =>
    '<div class="bg-linen border border-sand/40 rounded-2xl p-6 reveal"><p class="text-xs uppercase tracking-widest text-clay">' + label + '</p><p class="mt-2 font-display text-3xl font-semibold">' + val + '</p></div>').join('');
  grid.classList.remove('hidden');
  note.classList.remove('hidden');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function restartExperience(){
  if (!portalOpened) return;
  location.hash = '';
  sceneIndex = -1;
  buildScenes();
  const story = document.getElementById('s-story');
  story.classList.remove('screen-hidden');
  story.style.opacity = 1;
  renderScene(0);
  window.scrollTo({top: 0, behavior: 'smooth'});
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.15 });

function initReveal(){
  document.querySelectorAll('#portal .reveal').forEach(el => revealObserver.observe(el));
}

const desafioSteps = [
  'Observe seu uso — apenas perceba quanto tempo você passa nas telas.',
  'Desative notificações desnecessárias.',
  'Crie um período do dia sem redes sociais.',
  'Passe algum tempo longe do celular.',
  'Substitua parte do tempo de tela por uma atividade.',
  'Faça uma noite com menos telas.',
  'Compare seu comportamento com o primeiro dia.'
];

function initDesafio(){
  const box = document.getElementById('desafio');
  box.innerHTML = desafioSteps.map((t, i) =>
    '<label class="flex items-start gap-4 bg-linen border border-sand/40 rounded-xl p-4 cursor-pointer hover:bg-cream transition-colors">' +
    '<input type="checkbox" class="mt-1 w-5 h-5 accent-[#4A2E1F]"><span><span class="text-xs uppercase tracking-widest text-clay">Dia ' + (i+1) + '</span><span class="block text-sm text-cocoa">' + t + '</span></span></label>').join('');
}

document.getElementById('btn-start').addEventListener('click', () => show('s-input'));
document.getElementById('btn-skip').addEventListener('click', openPortal);
document.getElementById('btn-confirm').addEventListener('click', () => {
  const m = parseTime();
  if (m <= 0 || m > 1440) { document.getElementById('input-error').classList.remove('hidden'); return; }
  document.getElementById('input-error').classList.add('hidden');
  dailyMinutes = m;
  document.getElementById('check-time').textContent = fmt(m);
  show('s-check');
});
document.getElementById('btn-fix').addEventListener('click', () => show('s-input'));
document.getElementById('btn-yes').addEventListener('click', () => {
  if (portalOpened) return;
  sceneIndex = -1;
  buildScenes();
  show(null);
  const story = document.getElementById('s-story');
  story.classList.remove('screen-hidden');
  story.style.opacity = 1;
  renderScene(0);
});

document.getElementById('s-story').addEventListener('click', e => {
  if (e.target.closest('button')) return;
  nextScene();
});
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !document.getElementById('s-story').classList.contains('screen-hidden')) {
    e.preventDefault(); nextScene();
  }
});

document.getElementById('plan-form').addEventListener('submit', e => {
  e.preventDefault();
  const obj = document.getElementById('p-obj').value.trim();
  const quanto = document.getElementById('p-quanto').value.trim();
  const per = document.getElementById('p-per').value;
  const lugar = document.getElementById('p-lugar').value.trim();
  const err = document.getElementById('plan-error');
  if (!obj || !quanto || !lugar) { err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  document.getElementById('r-obj').textContent = obj;
  document.getElementById('r-quanto').textContent = quanto;
  document.getElementById('r-per').textContent = per;
  document.getElementById('r-lugar').textContent = lugar;
  const res = document.getElementById('plan-result');
  res.classList.remove('hidden');
  res.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

const burger = document.getElementById('burger'), menu = document.getElementById('mobile-menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('hidden') === false;
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.add('hidden'); burger.setAttribute('aria-expanded', 'false');
}));

function startIntro(){
  const sp = document.getElementById('splash');
  if (!sp) { show('s-welcome'); return; }
  splashTimers.push(setTimeout(() => sp.classList.add('open'), 200));
  // Libera a tela inicial junto com a abertura, sem depender de clique ou teclado
  splashTimers.push(setTimeout(() => {
    if (portalOpened) return;
    removeSplash(false);
    show('s-welcome');
  }, 2800));
  // Clique na abertura pula direto para o início
  sp.addEventListener('click', () => {
    if (portalOpened) return;
    clearSplashTimers();
    removeSplash(true);
    show('s-welcome');
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startIntro);
} else {
  startIntro();
}