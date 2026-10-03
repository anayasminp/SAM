
const screens = ['s-welcome', 's-input', 's-check', 's-story', 's-brand'];

let dailyMinutes = 0;
let sceneIndex = 0;
let scenes = [];
let portalOpened = false;
let splashTimers = [];
let sceneTimer = null;
let sceneLockTimer = null;
let sceneLocked = false;
let brandTimers = [];

const $ = id => document.getElementById(id);

function bind(id, event, callback) {
  const el = $(id);
  if (el) el.addEventListener(event, callback);
}

function clearSplashTimers() {
  splashTimers.forEach(t => clearTimeout(t));
  splashTimers = [];
}

function clearSceneTimers() {
  if (sceneTimer) clearTimeout(sceneTimer);
  if (sceneLockTimer) clearTimeout(sceneLockTimer);

  sceneTimer = null;
  sceneLockTimer = null;
  sceneLocked = false;
}

function clearBrandTimers() {
  brandTimers.forEach(t => clearTimeout(t));
  brandTimers = [];
}

function removeSplash(instant = false) {
  const sp = $('splash');
  if (!sp) return;

  sp.classList.add('pointer-events-none');

  if (instant) {
    sp.remove();
    return;
  }

  sp.style.transition = 'opacity 0.7s ease, visibility 0.7s';
  sp.style.opacity = '0';
  sp.style.visibility = 'hidden';
  sp.style.pointerEvents = 'none';

  setTimeout(() => {
    if (sp.parentNode) sp.remove();
  }, 800);
}

function show(id) {
  screens.forEach(screenId => {
    const el = $(screenId);
    if (!el) return;

    if (screenId === id) {
      el.classList.remove('screen-hidden');
      el.style.opacity = '';
    } else {
      el.classList.add('screen-hidden');
    }
  });
}

function parseTime() {
  const hours = parseInt($('time-h')?.value, 10) || 0;
  const minutes = parseInt($('time-m')?.value, 10) || 0;

  if (hours < 0 || minutes < 0 || minutes > 59) return -1;

  return hours * 60 + minutes;
}

function fmt(mins) {
  mins = Math.max(0, Math.round(mins));

  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  if (hours && minutes) {
    return hours + 'h' + String(minutes).padStart(2, '0');
  }

  if (hours) return hours + (hours === 1 ? ' hora' : ' horas');

  return minutes + (minutes === 1 ? ' minuto' : ' minutos');
}

function fmtH(mins) {
  const hours = Math.round(mins / 60);
  return hours.toLocaleString('pt-BR') +
    (hours === 1 ? ' hora' : ' horas');
}

const nf = n => Math.max(0, n).toLocaleString('pt-BR');

function buildScenes() {
  const d = dailyMinutes;
  const y = d * 365;

  scenes = [
    {
      text: 'Você dedica <span class="font-display text-6xl sm:text-7xl font-semibold countup block mt-4">' +
        fmt(d) + '</span> por dia às telas.'
    },
    {
      text: 'Isso representa <span class="font-display text-6xl sm:text-7xl font-semibold block mt-4">' +
        fmtH(d * 7) + '</span> por semana.'
    },
    {
      text: 'Aproximadamente <span class="font-display text-6xl sm:text-7xl font-semibold block mt-4">' +
        fmtH(d * 30) + '</span> por mês.'
    },
    {
      text: 'Mais de <span class="font-display text-6xl sm:text-7xl font-semibold block mt-4">' +
        fmtH(y) + '</span> por ano.',
      hint: 'Isso é quase ' + nf(Math.round(y / 1440)) +
        ' dias inteiros por ano.'
    },
    {
      text: '“Parece pouco, né?”',
      small: true
    },
    {
      text: '“Então vamos transformar esse tempo em coisas que você consegue imaginar.”',
      small: true
    },
    {
      text: 'Com esse tempo, você poderia ler aproximadamente <span class="font-semibold">' +
        nf(Math.floor(y / 480)) + ' livros</span>.',
      note: 'Estimativa: cerca de 8 horas de leitura por livro.'
    },
    {
      text: 'Poderia assistir a <span class="font-semibold">' +
        nf(Math.floor(y / 120)) + ' filmes</span>.',
      note: 'Estimativa: cerca de 2 horas por filme.'
    },
    {
      text: 'Poderia fazer <span class="font-semibold">' +
        nf(Math.floor(y / 60)) + ' caminhadas de uma hora</span>.',
      note: 'Estimativa: cerca de 1 hora por caminhada.'
    },
    {
      text: 'Poderia dedicar <span class="font-semibold">' +
        fmtH(y / 2) + '</span> a um novo hobby ou projeto pessoal.',
      note: 'Aproximação.'
    },
    {
      text: 'Ou aprender um idioma por <span class="font-semibold">' +
        fmtH(y / 3) + '</span> — o equivalente a vários anos de aulas semanais.',
      note: 'Estimativa.'
    },
    {
      text: '“Agora parece pouco para você?”',
      small: true,
      pause: 2600,
      last: true
    }
  ];
}

function renderScene(i) {
  const stage = $('story-stage');
  const hint = $('story-hint');
  const s = scenes[i];

  if (!stage || !s) return;

  if (sceneTimer) {
    clearTimeout(sceneTimer);
    sceneTimer = null;
  }

  if (hint) {
    hint.textContent = window.innerWidth < 768
      ? 'Toque para continuar'
      : 'Clique ou pressione espaço';
  }

  stage.innerHTML =
    '<p class="font-display ' +
    (s.small
      ? 'text-3xl sm:text-4xl font-light'
      : 'text-2xl sm:text-3xl font-light') +
    ' leading-snug scene">' + s.text + '</p>' +

    (s.hint
      ? '<p class="mt-6 text-clay text-sm scene">' + s.hint + '</p>'
      : '') +

    (s.note
      ? '<p class="mt-6 text-xs text-clay scene">' + s.note + '</p>'
      : '');

  requestAnimationFrame(() => {
    stage.querySelectorAll('.scene').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 1s ease, transform 1s ease';

      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
  });

  renderDots();

  if (s.pause) {
    sceneTimer = setTimeout(() => {
      if (sceneIndex === i && !portalOpened) {
        nextScene();
      }
    }, s.pause);
  }
}

function renderDots() {
  const dots = $('story-dots');
  if (!dots) return;

  dots.innerHTML = scenes.map((_, i) =>
    '<span class="w-2 h-2 rounded-full ' +
    (i <= sceneIndex ? 'bg-bark' : 'bg-sand/50') +
    '"></span>'
  ).join('');
}

function nextScene() {
  if (sceneLocked || portalOpened) return;

  sceneLocked = true;

  if (sceneTimer) {
    clearTimeout(sceneTimer);
    sceneTimer = null;
  }

  if (sceneIndex >= scenes.length - 1) {
    endStory();
    return;
  }

  sceneIndex++;
  renderScene(sceneIndex);

  sceneLockTimer = setTimeout(() => {
    sceneLocked = false;
    sceneLockTimer = null;
  }, 350);
}

function endStory() {
  const story = $('s-story');
  if (!story) return;

  if (sceneTimer) {
    clearTimeout(sceneTimer);
    sceneTimer = null;
  }

  sceneLocked = true;
  story.style.opacity = '0';

  setTimeout(() => {
    if (portalOpened) return;

    story.classList.add('screen-hidden');
    story.style.opacity = '';

    show('s-brand');
    brandReveal();
  }, 700);
}

function brandReveal() {
  if (portalOpened) return;

  clearBrandTimers();

  const brand = $('s-brand');
  if (!brand) return;

  const els = brand.querySelectorAll('.reveal');

  els.forEach((el, i) => {
    const timer = setTimeout(() => {
      el.classList.add('in');
    }, 400 + i * 500);

    brandTimers.push(timer);
  });

  brandTimers.push(setTimeout(openPortal, 3800));
}

function openPortal() {
  if (portalOpened) return;

  portalOpened = true;

  clearSplashTimers();
  clearSceneTimers();
  clearBrandTimers();

  removeSplash(false);
  show(null);

  const brand = $('s-brand');
  const story = $('s-story');
  const portal = $('portal');
  const header = $('site-header');
  const footer = $('site-footer');

  brand?.classList.add('screen-hidden');
  story?.classList.add('screen-hidden');

  if (story) story.style.opacity = '';

  if (portal) {
    portal.classList.remove('hidden');
  }

  header?.classList.remove('opacity-0', 'pointer-events-none');
  footer?.classList.remove('hidden');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      portal?.classList.remove('opacity-0');
      footer?.classList.remove('opacity-0');
    });
  });

  window.scrollTo({ top: 0 });

  fillEntenda();
  initReveal();
  initDesafio();
}

function fillEntenda() {
  if (!dailyMinutes) return;

  const empty = $('entenda-empty');
  const grid = $('entenda-grid');
  const note = $('entenda-note');

  if (!grid) return;

  empty?.classList.add('hidden');

  const d = dailyMinutes;

  const items = [
    ['Por dia', fmt(d)],
    ['Por semana', fmtH(d * 7)],
    ['Por mês', fmtH(d * 30)],
    ['Por ano', fmtH(d * 365)]
  ];

  grid.innerHTML = items.map(([label, value]) =>
    '<div class="bg-linen border border-sand/40 rounded-2xl p-6 reveal">' +
      '<p class="text-xs uppercase tracking-widest text-clay">' +
        label +
      '</p>' +
      '<p class="mt-2 font-display text-3xl font-semibold">' +
        value +
      '</p>' +
    '</div>'
  ).join('');

  grid.classList.remove('hidden');
  note?.classList.remove('hidden');

  grid.querySelectorAll('.reveal').forEach(el => {
    if (revealObserver) revealObserver.observe(el);
  });
}

function restartExperience() {
  clearSceneTimers();
  clearBrandTimers();

  portalOpened = false;
  sceneIndex = 0;

  buildScenes();

  const portal = $('portal');
  const header = $('site-header');
  const footer = $('site-footer');
  const story = $('s-story');
  const brand = $('s-brand');

  portal?.classList.add('hidden', 'opacity-0');
  header?.classList.add('opacity-0', 'pointer-events-none');
  footer?.classList.add('hidden', 'opacity-0');

  brand?.classList.remove('screen-hidden');

  if (story) {
    story.classList.remove('screen-hidden');
    story.style.opacity = '1';
  }

  show('s-story');
  renderScene(0);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

let revealObserver = null;

if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
}

function initReveal() {
  if (!revealObserver) {
    document.querySelectorAll('#portal .reveal')
      .forEach(el => el.classList.add('in'));
    return;
  }

  document.querySelectorAll('#portal .reveal').forEach(el => {
    revealObserver.observe(el);
  });
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

function initDesafio() {
  const box = $('desafio');
  if (!box) return;

  box.innerHTML = desafioSteps.map((text, i) =>
    '<label class="flex items-start gap-4 bg-linen border border-sand/40 rounded-xl p-4 cursor-pointer hover:bg-cream transition-colors">' +
      '<input type="checkbox" class="mt-1 w-5 h-5 accent-[#4A2E1F]">' +
      '<span>' +
        '<span class="text-xs uppercase tracking-widest text-clay">Dia ' +
          (i + 1) +
        '</span>' +
        '<span class="block text-sm text-cocoa">' +
          text +
        '</span>' +
      '</span>' +
    '</label>'
  ).join('');
}

// Navegação inicial
bind('btn-start', 'click', () => {
  show('s-input');
});

bind('btn-skip', 'click', openPortal);

bind('btn-confirm', 'click', () => {
  const m = parseTime();
  const error = $('input-error');

  if (m <= 0 || m > 1440) {
    error?.classList.remove('hidden');
    return;
  }

  error?.classList.add('hidden');

  dailyMinutes = m;

  const checkTime = $('check-time');
  if (checkTime) checkTime.textContent = fmt(m);

  show('s-check');
});

bind('btn-fix', 'click', () => {
  show('s-input');
});

bind('btn-yes', 'click', () => {
  if (portalOpened) return;

  clearSceneTimers();

  sceneIndex = 0;
  buildScenes();

  show('s-story');

  const story = $('s-story');
  if (story) story.style.opacity = '1';

  renderScene(0);
});

// Avançar cenas com clique
bind('s-story', 'click', e => {
  if (e.target.closest('button')) return;
  nextScene();
});

// Avançar cenas com espaço
document.addEventListener('keydown', e => {
  const story = $('s-story');
  const active = document.activeElement;

  if (
    e.code === 'Space' &&
    story &&
    !story.classList.contains('screen-hidden') &&
    !['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(active?.tagName)
  ) {
    e.preventDefault();
    nextScene();
  }
});

// Planejamento
bind('plan-form', 'submit', e => {
  e.preventDefault();

  const obj = $('p-obj')?.value.trim() || '';
  const quanto = $('p-quanto')?.value.trim() || '';
  const per = $('p-per')?.value || '';
  const lugar = $('p-lugar')?.value.trim() || '';
  const err = $('plan-error');

  if (!obj || !quanto || !lugar) {
    err?.classList.remove('hidden');
    return;
  }

  err?.classList.add('hidden');

  if ($('r-obj')) $('r-obj').textContent = obj;
  if ($('r-quanto')) $('r-quanto').textContent = quanto;
  if ($('r-per')) $('r-per').textContent = per;
  if ($('r-lugar')) $('r-lugar').textContent = lugar;

  const result = $('plan-result');
  result?.classList.remove('hidden');

  result?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
});

// Menu mobile
const burger = $('burger');
const menu = $('mobile-menu');

if (burger && menu) {
  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('hidden') === false;
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Abertura do site
function startIntro() {
  const splash = $('splash');

  if (!splash) {
    show('s-welcome');
    return;
  }

  splashTimers.push(setTimeout(() => {
    splash.classList.add('open');
  }, 200));

  splashTimers.push(setTimeout(() => {
    if (portalOpened) return;

    removeSplash(false);
    show('s-welcome');
  }, 2800));

  splash.addEventListener('click', () => {
    if (portalOpened) return;

    clearSplashTimers();
    removeSplash(true);
    show('s-welcome');
  });
}

// Inicialização
function initApp() {
  startIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
