
/* =========================================================
   IMAGE FALLBACK — if any external photo fails to load,
   show a local SVG placeholder instead of a broken image
   ========================================================= */
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el && el.tagName === 'IMG' && !el.dataset.fallback) {
    el.dataset.fallback = '1';
    el.src = 'images/placeholder.svg';
  }
}, true);

/* =========================================================
   DATA
   ========================================================= */
const IMG = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const PROPS = [
  { id: 1, title: 'Glasshouse Residence', type: 'villa',     city: 'malibu',     status: 'sale', price: 4850000, beds: 5, baths: 4, area: 420, img: 'photo-1613490493576-7fde63acd811', feats: ['pool','view','smart','garage'] },
  { id: 2, title: 'Cedar Ridge House',    type: 'house',     city: 'aspen',      status: 'sale', price: 2390000, beds: 4, baths: 3, area: 310, img: 'photo-1600596542815-ffad4c1539a9', feats: ['garden','garage','view'] },
  { id: 3, title: 'Oasis Pool Villa',     type: 'villa',     city: 'miami',      status: 'sale', price: 3750000, beds: 6, baths: 5, area: 480, img: 'photo-1512917774080-9991f1c4c750', feats: ['pool','gym','smart','garden'] },
  { id: 4, title: 'Monolith Loft',        type: 'apartment', city: 'seattle',    status: 'rent', price: 6500,    beds: 2, baths: 2, area: 140, img: 'photo-1600607687939-ce8a6c25118c', feats: ['smart','view','gym'] },
  { id: 5, title: 'Sunset Terrace',       type: 'house',     city: 'austin',     status: 'sale', price: 1480000, beds: 4, baths: 3, area: 260, img: 'photo-1580587771525-78b9dba3b914', feats: ['garden','garage','pool'] },
  { id: 6, title: 'Desert Line Villa',    type: 'villa',     city: 'scottsdale', status: 'sale', price: 2950000, beds: 5, baths: 4, area: 390, img: 'photo-1605276374104-dee2a0ed3cd6', feats: ['pool','view','smart'] },
  { id: 7, title: 'Skyline Penthouse',    type: 'penthouse', city: 'miami',      status: 'rent', price: 14500,   beds: 3, baths: 3, area: 220, img: 'photo-1502672260266-1c1ef2d93688', feats: ['view','gym','smart'] },
  { id: 8, title: 'Willow Creek Home',    type: 'house',     city: 'seattle',    status: 'sale', price: 980000,  beds: 3, baths: 2, area: 190, img: 'photo-1570129477492-45c003edd2be', feats: ['garden','garage'] },
  { id: 9, title: 'Canyon Edge Villa',    type: 'villa',     city: 'malibu',     status: 'sale', price: 6400000, beds: 7, baths: 6, area: 610, img: 'photo-1613977257363-707ba9348227', feats: ['pool','view','gym','smart','garage'] }
];
const INTERIORS = ['photo-1600566753190-17f0baa2a6c3', 'photo-1600210492486-724fe5c67fb0', 'photo-1600607687939-ce8a6c25118c'];
const SPOT_IDS = [2, 6, 5];
const CITIES = {
  seattle:    { x: 215, y: 92 },
  malibu:     { x: 125, y: 315 },
  aspen:      { x: 392, y: 205 },
  scottsdale: { x: 330, y: 392 },
  austin:     { x: 530, y: 372 },
  miami:      { x: 692, y: 445 }
};
const TYPES = ['all', 'villa', 'house', 'apartment', 'penthouse'];
const FAQ_N = 5;

/* =========================================================
   STATE & HELPERS
   ========================================================= */
let lang = 'en';
try { lang = localStorage.getItem('olivea_lang') || 'en'; } catch (e) {}
if (!I18N[lang]) lang = 'en';

const DEFAULT = { status: 'all', city: 'all', type: 'all', budget: 'all', rooms: 0, sort: 'featured' };
const state = { ...DEFAULT };
let deal = 'sale';
let selectedCity = 'malibu';
let spotIdx = 0;
let spotTimer = null;
const liked = new Set();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const t = (k) => (I18N[lang] && I18N[lang][k] !== undefined) ? I18N[lang][k] : (I18N.en[k] ?? k);
const icons = () => window.lucide && lucide.createIcons();

const money = (n) => '$' + n.toLocaleString('en-US');
const short = (n) => n >= 1e6 ? '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M' : '$' + Math.round(n / 1e3) + 'K';
const priceLabel = (p) => money(p.price) + (p.status === 'rent' ? t('per_month') : '');

function toast(msg) {
  const el = $('#toast');
  $('#toastText').textContent = msg;
  el.classList.add('toast-show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('toast-show'), 2800);
}

/* =========================================================
   I18N APPLY
   ========================================================= */
function applyI18n() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  $$('[data-i18n-html]').forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  $$('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  $$('.lang-btn').forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('bg-ink', on);
    b.classList.toggle('text-white', on);
    b.classList.toggle('text-ink-mute', !on);
  });
  renderTabs(); renderCatalog(); renderSpot(); renderMap(); renderFaq(); renderActive();
}

function setLang(l) {
  lang = l;
  try { localStorage.setItem('olivea_lang', l); } catch (e) {}
  applyI18n();
}

/* =========================================================
   CATALOG
   ========================================================= */
function budgetOk(p) {
  if (state.budget === 'all' || p.status === 'rent') return true;
  if (state.budget === 'b1') return p.price < 1e6;
  if (state.budget === 'b2') return p.price >= 1e6 && p.price < 3e6;
  return p.price >= 3e6;
}
function filtered() {
  let list = PROPS.filter(p =>
    (state.status === 'all' || p.status === state.status) &&
    (state.city === 'all' || p.city === state.city) &&
    (state.type === 'all' || p.type === state.type) &&
    p.beds >= state.rooms && budgetOk(p));
  if (state.sort === 'low') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'high') list.sort((a, b) => b.price - a.price);
  return list;
}

function renderTabs() {
  $('#typeTabs').innerHTML = TYPES.map(ty => {
    const on = state.type === ty;
    const n = ty === 'all' ? PROPS.length : PROPS.filter(p => p.type === ty).length;
    return `<button data-type="${ty}" class="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition
      ${on ? 'bg-olive-600 text-white shadow-md shadow-olive-600/25' : 'bg-white border border-line text-ink-soft hover:border-olive-300 hover:text-ink'}">
      ${t(ty === 'all' ? 'tab_all' : 'type_' + ty)}
      <span class="rounded-full px-1.5 text-[11px] ${on ? 'bg-white/20' : 'bg-paper'}">${n}</span></button>`;
  }).join('');
}

function cardHTML(p, i) {
  const isLiked = liked.has(p.id);
  return `
  <article class="card-in group relative rounded-[22px] bg-white p-3 shadow-soft border border-line/60 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift cursor-pointer" style="animation-delay:${i * 60}ms" data-open="${p.id}">
    <div class="relative overflow-hidden rounded-2xl aspect-[4/3]">
      <img src="${IMG(p.img, 900)}" alt="${p.title}" loading="lazy" class="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100"></div>
      <span class="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur ${p.status === 'rent' ? 'bg-ink/80 text-white' : 'bg-white/90 text-olive-700'}">${t(p.status === 'rent' ? 'badge_rent' : 'badge_sale')}</span>
      <button data-like="${p.id}" aria-label="Like" class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110 ${isLiked ? 'text-red-500' : 'text-ink'}">
        <i data-lucide="heart" class="h-4 w-4 ${isLiked ? 'fill-current' : ''}"></i>
      </button>
      <button data-qv="${p.id}" class="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[12px] font-bold shadow-lg transition duration-300 lg:translate-y-3 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-olive-600 hover:text-white">
        <i data-lucide="eye" class="h-3.5 w-3.5"></i>${t('quick_view')}
      </button>
    </div>
    <div class="px-2 pt-4 pb-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[20px] font-extrabold tracking-tight">${priceLabel(p)}</p>
        <span class="rounded-full bg-olive-50 px-2.5 py-1 text-[11px] font-bold text-olive-700">${t('type_' + p.type)}</span>
      </div>
      <h3 class="mt-1.5 text-[16px] font-bold">${p.title}</h3>
      <p class="mt-1 flex items-center gap-1 text-[13px] text-ink-mute"><i data-lucide="map-pin" class="h-3.5 w-3.5"></i>${t('city_' + p.city)}</p>
      <div class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3.5 text-[12px] text-ink-soft">
        <span class="flex items-center gap-1.5"><i data-lucide="bed-double" class="h-4 w-4 text-olive-600"></i><b>${p.beds}</b> <span class="text-ink-mute hidden sm:inline">${t('beds')}</span></span>
        <span class="flex items-center gap-1.5"><i data-lucide="bath" class="h-4 w-4 text-olive-600"></i><b>${p.baths}</b> <span class="text-ink-mute hidden sm:inline">${t('baths')}</span></span>
        <span class="flex items-center gap-1.5"><i data-lucide="maximize" class="h-4 w-4 text-olive-600"></i><b>${p.area}</b> <span class="text-ink-mute">${t('sqm')}</span></span>
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const list = filtered();
  $('#grid').innerHTML = list.map(cardHTML).join('');
  $('#resCount').textContent = list.length;
  $('#empty').classList.toggle('hidden', list.length > 0);
  icons();
}

function renderActive() {
  const box = $('#activeFilters');
  const chips = [];
  if (state.status !== 'all') chips.push(t(state.status === 'rent' ? 'tab_rent' : 'tab_buy'));
  if (state.city !== 'all') chips.push(t('city_' + state.city));
  if (state.budget !== 'all') chips.push(t(state.budget));
  if (state.rooms > 0) chips.push(state.rooms + '+ ' + t('beds').toLowerCase());
  if (!chips.length) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = `<span class="font-semibold text-olive-800">${t('active_filters')}</span>
    ${chips.map(c => `<span class="rounded-full bg-white px-3 py-1 font-semibold border border-olive-100">${c}</span>`).join('')}
    <button class="reset-btn ml-auto inline-flex items-center gap-1 font-bold text-olive-700 hover:text-ink"><i data-lucide="x" class="h-4 w-4"></i>${t('reset')}</button>`;
  icons();
}

function resetFilters() {
  Object.assign(state, DEFAULT, { sort: state.sort });
  $('#sCity').value = 'all'; $('#sType').value = 'all'; $('#sBudget').value = 'all'; $('#sRooms').value = '0';
  renderTabs(); renderCatalog(); renderActive();
}

/* =========================================================
   MODAL
   ========================================================= */
function openModal(id) {
  const p = PROPS.find(x => x.id === +id);
  if (!p) return;
  const gallery = [p.img, ...INTERIORS.filter(x => x !== p.img).slice(0, 2)];
  $('#modalPanel').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2">
      <div class="p-3 sm:p-4">
        <div class="relative overflow-hidden rounded-[20px] aspect-[4/3] md:aspect-auto md:h-[360px]">
          <img id="mMain" src="${IMG(gallery[0], 1400)}" class="h-full w-full object-cover transition duration-500" alt="${p.title}" />
          <button id="mClose" class="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 hover:bg-ink hover:text-white transition" aria-label="Close"><i data-lucide="x" class="h-5 w-5"></i></button>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          ${gallery.map((g, i) => `<button data-thumb="${g}" class="overflow-hidden rounded-xl ring-2 ${i === 0 ? 'ring-olive-500' : 'ring-transparent'} transition hover:ring-olive-300"><img src="${IMG(g, 400)}" class="h-20 w-full object-cover" alt="" /></button>`).join('')}
        </div>
      </div>
      <div class="p-5 sm:p-7 md:pl-3 flex flex-col">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full px-3 py-1 text-[11px] font-bold ${p.status === 'rent' ? 'bg-ink text-white' : 'bg-olive-50 text-olive-700'}">${t(p.status === 'rent' ? 'badge_rent' : 'badge_sale')}</span>
          <span class="rounded-full bg-paper px-3 py-1 text-[11px] font-bold">${t('type_' + p.type)}</span>
        </div>
        <h3 class="mt-3 text-2xl sm:text-[28px] font-bold tracking-tight">${p.title}</h3>
        <p class="mt-1 flex items-center gap-1 text-[14px] text-ink-mute"><i data-lucide="map-pin" class="h-4 w-4"></i>${t('city_' + p.city)}</p>
        <p class="mt-4 text-3xl font-extrabold tracking-tight">${priceLabel(p)}</p>
        <div class="mt-5 grid grid-cols-3 gap-2">
          <div class="rounded-xl bg-paper p-3 text-center"><i data-lucide="bed-double" class="mx-auto h-5 w-5 text-olive-600"></i><p class="mt-1 font-bold">${p.beds}</p><p class="text-[11px] text-ink-mute">${t('beds')}</p></div>
          <div class="rounded-xl bg-paper p-3 text-center"><i data-lucide="bath" class="mx-auto h-5 w-5 text-olive-600"></i><p class="mt-1 font-bold">${p.baths}</p><p class="text-[11px] text-ink-mute">${t('baths')}</p></div>
          <div class="rounded-xl bg-paper p-3 text-center"><i data-lucide="maximize" class="mx-auto h-5 w-5 text-olive-600"></i><p class="mt-1 font-bold">${p.area}</p><p class="text-[11px] text-ink-mute">${t('sqm')}</p></div>
        </div>
        <p class="mt-5 text-[14px] leading-relaxed text-ink-soft">${t('m_desc')}</p>
        <p class="mt-5 text-[12px] font-bold uppercase tracking-[.12em] text-ink-mute">${t('m_features')}</p>
        <div class="mt-2 flex flex-wrap gap-2">${p.feats.map(f => `<span class="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold"><i data-lucide="check" class="h-3.5 w-3.5 text-olive-600"></i>${t('feat_' + f)}</span>`).join('')}</div>
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 md:mt-auto md:pt-6">
          <button id="mBook" class="inline-flex items-center justify-center gap-2 rounded-xl bg-olive-600 px-5 py-3.5 text-[14px] font-bold text-white transition hover:bg-olive-700 active:scale-[.98]"><i data-lucide="calendar-check" class="h-4 w-4"></i>${t('m_book')}</button>
          <button id="mCall" class="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3.5 text-[14px] font-bold transition hover:bg-ink hover:text-white hover:border-ink"><i data-lucide="phone" class="h-4 w-4"></i>${t('m_call')}</button>
        </div>
      </div>
    </div>`;
  icons();
  const m = $('#modal');
  m.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    $('#modalBg').classList.replace('opacity-0', 'opacity-100');
    $('#modalPanel').classList.remove('translate-y-8', 'opacity-0');
  });
  $('#mClose').onclick = closeModal;
  $('#mBook').onclick = () => { closeModal(); toast(t('toast_booked')); };
  $('#mCall').onclick = () => toast(t('toast_call'));
  $$('[data-thumb]', $('#modalPanel')).forEach(b => b.onclick = () => {
    $('#mMain').src = IMG(b.dataset.thumb, 1400);
    $$('[data-thumb]').forEach(x => { x.classList.remove('ring-olive-500'); x.classList.add('ring-transparent'); });
    b.classList.add('ring-olive-500'); b.classList.remove('ring-transparent');
  });
}
function closeModal() {
  $('#modalBg').classList.replace('opacity-100', 'opacity-0');
  $('#modalPanel').classList.add('translate-y-8', 'opacity-0');
  setTimeout(() => { $('#modal').classList.add('hidden'); document.body.style.overflow = ''; }, 280);
}

/* =========================================================
   SPOTLIGHT
   ========================================================= */
function renderSpot() {
  const p = PROPS.find(x => x.id === SPOT_IDS[spotIdx]);
  const box = $('#spotlight');
  box.style.opacity = 0;
  setTimeout(() => {
    box.innerHTML = `
      <div class="group relative overflow-hidden rounded-2xl aspect-[16/10]">
        <img src="${IMG(p.img, 1000)}" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" alt="${p.title}" />
        <span class="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-olive-700">${t('type_' + p.type)}</span>
      </div>
      <div class="mt-4 flex-1 flex flex-col px-1">
        <h3 class="text-xl font-bold tracking-tight">${p.title}</h3>
        <p class="mt-1 flex items-center gap-1 text-[13px] text-ink-mute"><i data-lucide="map-pin" class="h-3.5 w-3.5"></i>${t('city_' + p.city)} · ${p.beds} ${t('beds').toLowerCase()} · ${p.area} ${t('sqm')}</p>
        <div class="mt-auto pt-4 flex items-end justify-between gap-3">
          <div><p class="text-[12px] text-ink-mute">${t('spot_from')}</p><p class="text-2xl font-extrabold tracking-tight">${short(p.price)}</p></div>
          <button data-open="${p.id}" class="inline-flex items-center gap-1.5 rounded-full bg-olive-600 px-5 py-3 text-[13px] font-bold text-white transition hover:bg-olive-700 hover:gap-2.5">${t('btn_details')}<i data-lucide="arrow-right" class="h-4 w-4"></i></button>
        </div>
      </div>`;
    $('#spotDots').innerHTML = SPOT_IDS.map((_, i) => `<button data-dot="${i}" aria-label="Slide ${i + 1}" class="h-1.5 rounded-full transition-all ${i === spotIdx ? 'w-6 bg-olive-600' : 'w-1.5 bg-line hover:bg-olive-300'}"></button>`).join('');
    icons();
    box.style.opacity = 1;
  }, 180);
}
function spotGo(d) { spotIdx = (spotIdx + d + SPOT_IDS.length) % SPOT_IDS.length; renderSpot(); restartSpot(); }
function restartSpot() { clearInterval(spotTimer); spotTimer = setInterval(() => { spotIdx = (spotIdx + 1) % SPOT_IDS.length; renderSpot(); }, 6000); }

/* =========================================================
   MAP
   ========================================================= */
let mapZoom = 1;
function cityStats(c) {
  const all = PROPS.filter(p => p.city === c);
  const sale = all.filter(p => p.status === 'sale');
  const avg = sale.length ? sale.reduce((s, p) => s + p.price, 0) / sale.length : 0;
  const min = sale.length ? Math.min(...sale.map(p => p.price)) : 0;
  const best = sale.slice().sort((a, b) => a.price / a.area - b.price / b.area)[0];
  return { all, count: all.length, avg, min, best };
}
function renderMap() {
  const pins = Object.entries(CITIES).map(([c, pos]) => {
    const s = cityStats(c);
    const on = c === selectedCity;
    const label = `${t('city_' + c)} · ${t('map_from')} ${short(s.min)}`;
    const w = label.length * 6.6 + 24;
    return `<g data-city="${c}" transform="translate(${pos.x},${pos.y})" style="cursor:pointer">
      ${on ? '<circle r="14" fill="#859752" class="pin-pulse"/>' : ''}
      <circle r="${on ? 13 : 10}" fill="${on ? '#6C7C40' : '#FFFFFF'}" stroke="#6C7C40" stroke-width="3"/>
      <circle r="4" fill="${on ? '#FFFFFF' : '#6C7C40'}"/>
      <g transform="translate(${-w / 2},${-50})">
        <rect width="${w}" height="30" rx="15" fill="${on ? '#16181A' : '#FFFFFF'}" stroke="${on ? '#16181A' : '#E6E6E0'}"/>
        <text x="${w / 2}" y="19.5" text-anchor="middle" font-family="Manrope" font-size="12" font-weight="700" fill="${on ? '#FFFFFF' : '#16181A'}">${label}</text>
      </g>
    </g>`;
  }).join('');
  $('#pins').innerHTML = pins;

  $('#regionChips').innerHTML = Object.keys(CITIES).map(c => {
    const on = c === selectedCity;
    return `<button data-region="${c}" class="shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${on ? 'bg-ink text-white' : 'bg-paper text-ink-soft hover:bg-olive-50'}">${t('city_' + c)}</button>`;
  }).join('');

  const s = cityStats(selectedCity);
  const b = s.best;
  $('#mapPanel').innerHTML = `
    <p class="text-[12px] font-bold uppercase tracking-[.12em] text-ink-mute">${t('map_selected')}</p>
    <p class="mt-1 text-2xl font-bold tracking-tight">${t('city_' + selectedCity)}</p>
    <div class="mt-4 grid grid-cols-2 gap-2">
      <div class="rounded-xl bg-white p-3"><p class="text-[12px] text-ink-mute">${t('map_listings')}</p><p class="text-xl font-extrabold">${s.count}</p></div>
      <div class="rounded-xl bg-white p-3"><p class="text-[12px] text-ink-mute">${t('map_avg')}</p><p class="text-xl font-extrabold">${short(s.avg)}</p></div>
    </div>
    ${b ? `
    <p class="mt-4 text-[12px] font-bold uppercase tracking-[.12em] text-ink-mute">${t('map_best')}</p>
    <button data-open="${b.id}" class="mt-2 w-full flex items-center gap-3 rounded-xl bg-white p-2 text-left transition hover:shadow-soft hover:-translate-y-0.5">
      <img src="${IMG(b.img, 300)}" class="h-14 w-16 rounded-lg object-cover" alt="" />
      <span class="flex-1 min-w-0"><span class="block truncate font-bold text-[14px]">${b.title}</span><span class="block text-[12px] text-ink-mute">${money(Math.round(b.price / b.area))} / ${t('sqm')}</span></span>
      <i data-lucide="chevron-right" class="h-4 w-4 text-ink-mute mr-1"></i>
    </button>` : ''}
    <button id="viewRegion" class="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-olive-600 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-olive-700">${t('btn_view_region')}<i data-lucide="arrow-right" class="h-4 w-4"></i></button>`;
  icons();
  $('#viewRegion').onclick = () => {
    Object.assign(state, DEFAULT, { city: selectedCity, sort: state.sort });
    $('#sCity').value = selectedCity;
    renderTabs(); renderCatalog(); renderActive();
    $('#catalog').scrollIntoView({ behavior: 'smooth' });
  };
}
function applyZoom() {
  const svg = $('#mapSvg');
  const c = CITIES[selectedCity];
  const w = 800 / mapZoom, h = 520 / mapZoom;
  const x = Math.max(0, Math.min(800 - w, c.x - w / 2));
  const y = Math.max(0, Math.min(520 - h, c.y - h / 2));
  svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
}

/* =========================================================
   FAQ
   ========================================================= */
function renderFaq() {
  const openIdx = $$('.faq-item.open').map(el => +el.dataset.i);
  $('#faqList').innerHTML = Array.from({ length: FAQ_N }, (_, i) => {
    const open = openIdx.length ? openIdx.includes(i) : i === 0;
    return `<div class="faq-item ${open ? 'open' : ''} rounded-[20px] bg-white border border-line/60 shadow-soft transition hover:border-olive-200" data-i="${i}">
      <button class="faq-q w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left">
        <span class="text-[15px] sm:text-[17px] font-bold">${t('q' + (i + 1))}</span>
        <span class="faq-icon grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper transition duration-300"><i data-lucide="plus" class="h-4 w-4"></i></span>
      </button>
      <div class="faq-body"><div class="overflow-hidden"><p class="px-5 sm:px-6 pb-6 -mt-1 text-[14px] sm:text-[15px] leading-relaxed text-ink-mute max-w-2xl">${t('a' + (i + 1))}</p></div></div>
    </div>`;
  }).join('');
  icons();
}

/* =========================================================
   EVENTS
   ========================================================= */
document.addEventListener('click', (e) => {
  const langBtn = e.target.closest('.lang-btn');
  if (langBtn) return setLang(langBtn.dataset.lang);

  const like = e.target.closest('[data-like]');
  if (like) {
    e.stopPropagation();
    const id = +like.dataset.like;
    liked.has(id) ? (liked.delete(id), toast(t('toast_unlike'))) : (liked.add(id), toast(t('toast_like')));
    const ic = like.querySelector('svg');
    like.classList.toggle('text-red-500', liked.has(id));
    like.classList.toggle('text-ink', !liked.has(id));
    if (ic) ic.classList.toggle('fill-current', liked.has(id));
    like.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300 });
    return;
  }

  const qv = e.target.closest('[data-qv]');
  if (qv) { e.stopPropagation(); return openModal(qv.dataset.qv); }

  const open = e.target.closest('[data-open]');
  if (open) return openModal(open.dataset.open);

  const tab = e.target.closest('[data-type]');
  if (tab) { state.type = tab.dataset.type; $('#sType').value = state.type; renderTabs(); renderCatalog(); return; }

  if (e.target.closest('.reset-btn')) return resetFilters();

  const pin = e.target.closest('[data-city]') || e.target.closest('[data-region]');
  if (pin) { selectedCity = pin.dataset.city || pin.dataset.region; renderMap(); if (mapZoom > 1) applyZoom(); return; }

  const dot = e.target.closest('[data-dot]');
  if (dot) { spotIdx = +dot.dataset.dot; renderSpot(); restartSpot(); return; }

  const fq = e.target.closest('.faq-q');
  if (fq) {
    const item = fq.parentElement;
    const was = item.classList.contains('open');
    $$('.faq-item').forEach(x => x.classList.remove('open'));
    if (!was) item.classList.add('open');
  }
});

$('#modalBg').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });

$('#spotPrev').onclick = () => spotGo(-1);
$('#spotNext').onclick = () => spotGo(1);
$('#zoomIn').onclick = () => { mapZoom = Math.min(2.2, mapZoom + 0.4); applyZoom(); };
$('#zoomOut').onclick = () => { mapZoom = Math.max(1, mapZoom - 0.4); applyZoom(); };

$$('.deal-btn').forEach(b => b.addEventListener('click', () => {
  deal = b.dataset.deal;
  $$('.deal-btn').forEach(x => {
    const on = x === b;
    x.classList.toggle('bg-ink', on); x.classList.toggle('text-white', on); x.classList.toggle('text-ink-soft', !on);
  });
}));

$('#heroSearch').addEventListener('submit', (e) => {
  e.preventDefault();
  Object.assign(state, {
    status: deal,
    city: $('#sCity').value,
    type: $('#sType').value,
    budget: $('#sBudget').value,
    rooms: +$('#sRooms').value
  });
  renderTabs(); renderCatalog(); renderActive();
  $('#catalog').scrollIntoView({ behavior: 'smooth' });
});

$('#sortSel').addEventListener('change', e => { state.sort = e.target.value; renderCatalog(); });

$('#newsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#newsEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    $('#newsEmail').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    return toast(t('toast_invalid'));
  }
  $('#newsEmail').value = '';
  toast(t('toast_sub'));
});

$('#ctaStart').addEventListener('click', (e) => {
  e.preventDefault();
  $('#heroSearch').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => $('#sCity').focus({ preventScroll: true }), 600);
});

// Mobile menu
$('#burger').onclick = () => $('#mobileMenu').classList.toggle('hidden');
$$('.m-link').forEach(a => a.addEventListener('click', () => $('#mobileMenu').classList.add('hidden')));

// Header on scroll
window.addEventListener('scroll', () => {
  $('#headerBar').classList.toggle('shadow-lift', window.scrollY > 20);
}, { passive: true });

/* =========================================================
   OBSERVERS: reveal + counters
   ========================================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => io.observe(el));

const co = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1600;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * eased).toLocaleString('en-US') + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    co.unobserve(el);
  });
}, { threshold: 0.5 });
$$('[data-count]').forEach(el => co.observe(el));

/* =========================================================
   INIT
   ========================================================= */
$('#year').textContent = new Date().getFullYear();
applyI18n();
restartSpot();
icons();
