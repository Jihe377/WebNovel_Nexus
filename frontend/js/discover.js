const API_BASE = '/api';

const ALL_GENRES = [
  'Fantasy', 'Urban', 'Xianxia', 'Historical',
  'Game', 'Science Fiction', 'Suspense', 'Romance', 'Fanfiction',
];

const ALL_INCLUDE_TAGS = [
  'Rebirth', 'Infinite Flow', 'Apocalypse', 'Interstellar', 'Cultivation',
  'Strong vs. Strong', 'Arranged Marriage', 'Reconciliation', 'Unrequited Love',
  'Pursuing Wife Through Fire', 'Satisfying Read', 'Angsty Read', 'Sweet Read',
  'Suspense', 'Leveling Up', 'Beautiful Strong and Tragic', 'Crazy',
  'Yandere', 'Cold', 'Loyal Dog',
];

const ALL_EXCLUDE_TAGS = [
  'Rebirth', 'Infinite Flow', 'Apocalypse', 'Interstellar', 'Cultivation',
  'Strong vs. Strong', 'Arranged Marriage', 'Reconciliation', 'Unrequited Love',
  'Pursuing Wife Through Fire', 'Satisfying Read', 'Angsty Read', 'Sweet Read',
  'Suspense', 'Leveling Up', 'Beautiful Strong and Tragic', 'Crazy',
  'Yandere', 'Cold', 'Loyal Dog',
];

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
const state = {
  search:      '',
  includeTags: new Set(),
  excludeTags: new Set(),
  page:        1,
  limit:       20,
  total:       0,
  totalPages:  0,
  loading:     false,
};
let searchTimer = null;

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  restoreTheme();
  buildTagUI();
  bindEvents();
  fetchNovels();
});

/* ═══════════════════════════════════════
   TAG UI
═══════════════════════════════════════ */
function buildTagUI() {
  // Genre buttons
  const genreContainer = document.getElementById('genreFilters');
  ALL_GENRES.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary btn-sm';
    btn.textContent = g;
    btn.dataset.genre = g;
    btn.addEventListener('click', () => toggleGenre(btn, g));
    genreContainer.appendChild(btn);
  });

  ALL_INCLUDE_TAGS.forEach(tag => {
    const btn = makeTagBtn(tag, () => toggleIncludeTag(btn, tag));
    document.getElementById('includeTags').appendChild(btn);
  });
  ALL_EXCLUDE_TAGS.forEach(tag => {
    const btn = makeTagBtn(tag, () => toggleExcludeTag(btn, tag));
    document.getElementById('excludeTags').appendChild(btn);
  });
}

function makeTagBtn(label, onClick) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-outline-secondary btn-sm';
  btn.textContent = label;
  btn.dataset.tag = label;
  btn.addEventListener('click', onClick);
  return btn;
}

/* ═══════════════════════════════════════
   EVENTS
═══════════════════════════════════════ */
function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      updateActiveFiltersSummary();
      fetchNovels();
    }, 400);
  });

  document.getElementById('limitSelect').addEventListener('change', e => {
    state.limit = parseInt(e.target.value);
    state.page = 1;
    fetchNovels();
  });

  document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

/* ═══════════════════════════════════════
   TAG TOGGLES
═══════════════════════════════════════ */

function toggleGenre(btn, genre) {
  if (state.genre === genre) {
    // Deselect
    state.genre = '';
    btn.className = 'btn btn-outline-primary btn-sm';
  } else {
    // Deselect previous
    document.querySelectorAll('#genreFilters .btn').forEach(b => {
      b.className = 'btn btn-outline-primary btn-sm';
    });
    state.genre = genre;
    btn.className = 'btn btn-primary btn-sm';
  }
  state.page = 1;
  updateActiveFiltersSummary();
  fetchNovels();
}


function toggleIncludeTag(btn, tag) {
  // Remove from exclude if there
  if (state.excludeTags.has(tag)) {
    state.excludeTags.delete(tag);
    document.querySelectorAll(`#excludeTags [data-tag="${tag}"]`)
      .forEach(b => { b.className = 'btn btn-outline-secondary btn-sm'; });
  }
  if (state.includeTags.has(tag)) {
    state.includeTags.delete(tag);
    btn.className = 'btn btn-outline-secondary btn-sm';
  } else {
    state.includeTags.add(tag);
    btn.className = 'btn btn-primary btn-sm';
  }
  state.page = 1;
  updateActiveFiltersSummary();
  fetchNovels();
}

function toggleExcludeTag(btn, tag) {
  // Remove from include if there
  if (state.includeTags.has(tag)) {
    state.includeTags.delete(tag);
    document.querySelectorAll(`#includeTags [data-tag="${tag}"]`)
      .forEach(b => { b.className = 'btn btn-outline-secondary btn-sm'; });
  }
  if (state.excludeTags.has(tag)) {
    state.excludeTags.delete(tag);
    btn.className = 'btn btn-outline-secondary btn-sm';
  } else {
    state.excludeTags.add(tag);
    btn.className = 'btn btn-danger btn-sm';
  }
  state.page = 1;
  updateActiveFiltersSummary();
  fetchNovels();
}

function clearAllFilters() {
  state.search = ''; state.genre = ''; state.includeTags.clear(); state.excludeTags.clear(); state.page = 1;
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('#includeTags .btn, #excludeTags .btn')
    .forEach(b => { b.className = 'btn btn-outline-secondary btn-sm'; });
  updateActiveFiltersSummary();
  fetchNovels();
}

/* ═══════════════════════════════════════
   ACTIVE FILTERS SUMMARY
═══════════════════════════════════════ */
function updateActiveFiltersSummary() {
  const wrap = document.getElementById('activeFiltersWrap');
  const list = document.getElementById('activeFiltersList');
  const has = state.search || state.genre || state.includeTags.size || state.excludeTags.size;
  if (!has) { wrap.classList.add('d-none'); return; }
  wrap.classList.remove('d-none');
  list.innerHTML = '';
  if (state.search)
    list.insertAdjacentHTML('beforeend',
      `<span class="badge text-bg-secondary">🔍 "${esc(state.search)}"</span>`);
  if (state.genre)
    list.insertAdjacentHTML('beforeend',
      `<span class="badge text-bg-primary">📚 ${esc(state.genre)}</span>`);
  state.includeTags.forEach(t =>
    list.insertAdjacentHTML('beforeend',
      `<span class="badge text-bg-primary">+${esc(t)}</span>`));
  state.excludeTags.forEach(t =>
    list.insertAdjacentHTML('beforeend',
      `<span class="badge text-bg-danger">−${esc(t)}</span>`));
}

/* ═══════════════════════════════════════
   FETCH  — maps to novelRouter.js:
   GET /api/novels?search=&tags=&exclude=&page=&limit=
═══════════════════════════════════════ */
async function fetchNovels() {
  if (state.loading) return;
  state.loading = true;
  showSkeletons();

  const params = new URLSearchParams();
  if (state.search)           params.set('search',  state.search);
  if (state.genre)            params.set('genre',   state.genre);
  if (state.includeTags.size) params.set('tags',    [...state.includeTags].join(','));
  if (state.excludeTags.size) params.set('exclude', [...state.excludeTags].join(','));
  params.set('page',  String(state.page));
  params.set('limit', String(state.limit));

  try {
    const res = await fetch(`${API_BASE}/novels?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();           // { novels, total, page, totalPages }
    state.total      = data.total;
    state.totalPages = data.totalPages;
    renderNovels(data.novels);
    renderPagination();
    updateResultsInfo(data.novels.length, data.total);
  } catch (err) {
    console.error(err);
    renderError();
  } finally {
    state.loading = false;
  }
}

/* ═══════════════════════════════════════
   SKELETONS  — shimmer via custom CSS class nn-shimmer
═══════════════════════════════════════ */
function showSkeletons() {
  document.getElementById('novelGrid').innerHTML =
    Array.from({ length: 6 }).map(() => `
    <div class='col'>
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="nn-shimmer mb-1" style="height:18px;width:55%"></div>
            <div class="nn-shimmer" style="height:22px;width:70px"></div>
          </div>
          <div class="nn-shimmer mb-3" style="height:13px;width:35%"></div>
          <div class="nn-shimmer mb-2" style="height:12px;width:100%"></div>
          <div class="nn-shimmer mb-2" style="height:12px;width:88%"></div>
          <div class="nn-shimmer mb-3" style="height:12px;width:70%"></div>
          <div class="d-flex gap-1">
            <div class="nn-shimmer" style="height:24px;width:70px;border-radius:12px"></div>
            <div class="nn-shimmer" style="height:24px;width:80px;border-radius:12px"></div>
          </div>
        </div>
      </div>
      </div>`).join('');
}

/* ═══════════════════════════════════════
   RENDER NOVELS
═══════════════════════════════════════ */
function renderNovels(novels) {
  const grid = document.getElementById('novelGrid');
  grid.innerHTML = '';

  if (!novels || novels.length === 0) {
    grid.innerHTML = `
      <div class="text-center py-5 text-muted">
        <span class="material-symbols-outlined d-block mb-2" style="font-size:48px;opacity:.4">search_off</span>
        <h6 class="fw-bold">No novels found</h6>
        <small>Try adjusting your search or filters.</small>
      </div>`;
    return;
  }

  novels.forEach(novel => {
    const navId = novel.id ?? novel._id;


    const statusCls = {
      ongoing:   'text-bg-warning',
      completed: 'text-bg-success',
      hiatus:    'text-bg-secondary',
    }[novel.status?.toLowerCase()] || 'text-bg-secondary';
    
    const statusLabel = novel.status
      ? novel.status.charAt(0).toUpperCase() + novel.status.slice(1)
      : 'Ongoing';

    // Genre badge
    // eslint-disable-next-line no-unused-vars
    const genreHtml = novel.genre
      ? `<span class="badge text-bg-secondary">${esc(novel.genre)}</span>`
      : '';

    // Tags (max shown: 3)
    const tagsHtml = [...new Set([novel.tag1, novel.tag2, novel.tag3].filter(Boolean))]
      .map(t => `<span class="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle" style="font-size:0.7rem;font-weight:500">${esc(t)}</span>`)
      .join('');

    // Star rating  (novel.rating optional field; show read count if no rating)
    const ratingHtml = novel.rating != null
      ? `<span class="nn-stars fw-bold">★</span>
         <span class="fw-semibold">${Number(novel.rating).toFixed(1)}</span>`
      : '';

    // Review / read count
    const readHtml = novel.read != null
      ? `<span class="material-symbols-outlined align-middle text-muted" style="font-size:15px">visibility</span>
         <span class="text-muted small">${Number(novel.read).toLocaleString()}</span>`
      : '';

    const reviewHtml = novel.reviewCount != null
      ? `<span class="material-symbols-outlined align-middle text-muted" style="font-size:15px">chat_bubble</span>
         <span class="text-muted small">${Number(novel.reviewCount).toLocaleString()}</span>`
      : '';

    grid.insertAdjacentHTML('beforeend', `
    <div class='col'>
      <div class="card h-100 shadow-sm nn-card" onclick="goToNovel('${navId}')">
        <div class="card-body d-flex flex-column">

          <!-- Title row -->
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h6 class="card-title fw-bold mb-0 flex-grow-1 text-truncate" title="${esc(novel.book_name)}">
              ${esc(novel.book_name)}
            </h6>
            <span class="badge ${statusCls} flex-shrink-0">${statusLabel}</span>
          </div>

          <!-- Author + genre row -->
          <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <small class="text-muted">By ${esc(novel.author)} · ${esc(novel.genre || '')}</small>
          </div>

          <!-- Description -->
          <p class="card-text small text-muted mb-2 nn-line-clamp-3">
            ${esc(novel.description || '')}
          </p>

          <!-- Stats row -->
          <div class="d-flex align-items-center gap-3 mb-2 flex-wrap">
            ${ratingHtml ? `<span class="d-flex align-items-center gap-1">${ratingHtml}</span>` : ''}
            ${readHtml   ? `<span class="d-flex align-items-center gap-1">${readHtml}</span>`   : ''}
            ${reviewHtml ? `<span class="d-flex align-items-center gap-1">${reviewHtml}</span>` : ''}
          </div>

          <!-- Tags + action -->
            <div class="d-flex flex-wrap gap-1 mb-2">${tagsHtml}</div>
            <div class="mt-auto pt-2">
              <button class="btn btn-primary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                onclick="event.stopPropagation(); addToBooklist('${navId}', '${esc(novel.book_name)}')">
                <span class="material-symbols-outlined" style="font-size:15px">library_add</span>
                Add to Booklist
              </button>
            </div>

        </div>
      </div>
    </div>`);
  });
}

function renderError() {
  document.getElementById('novelGrid').innerHTML = `
    <div class="col-12 text-center py-5 text-muted">
      <span class="material-symbols-outlined d-block mb-2" style="font-size:48px;opacity:.4">error</span>
      <h6 class="fw-bold">Failed to load novels</h6>
      <small>Check your connection or server status.</small><br>
      <button onclick="fetchNovels()" class="btn btn-primary btn-sm mt-3">Retry</button>
    </div>`;
  document.getElementById('resultsInfo').textContent = 'Load failed';
}

/* ═══════════════════════════════════════
   PAGINATION
═══════════════════════════════════════ */
function renderPagination() {
  const ul = document.getElementById('pagination');
  ul.innerHTML = '';
  if (state.totalPages <= 1) return;

  const { page, totalPages } = state;

  ul.insertAdjacentHTML('beforeend', `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${page - 1})">‹</button>
    </li>`);

  getPageRange(page, totalPages).forEach((p, i, arr) => {
    if (i > 0 && p - arr[i - 1] > 1)
      ul.insertAdjacentHTML('beforeend',
        `<li class="page-item disabled"><span class="page-link">…</span></li>`);
    ul.insertAdjacentHTML('beforeend', `
      <li class="page-item ${p === page ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${p})">${p}</button>
      </li>`);
  });

  ul.insertAdjacentHTML('beforeend', `
    <li class="page-item ${page === totalPages ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${page + 1})">›</button>
    </li>`);
}

function getPageRange(current, total) {
  const delta = 2, range = new Set([1, total]);
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.add(i);
  return [...range].sort((a, b) => a - b);
}
// eslint-disable-next-line no-unused-vars
function goToPage(p) {
  if (p < 1 || p > state.totalPages || p === state.page || state.loading) return;
  state.page = p;
  fetchNovels();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════
   RESULTS INFO
═══════════════════════════════════════ */
function updateResultsInfo(shown, total) {
  const from = total === 0 ? 0 : (state.page - 1) * state.limit + 1;
  const to   = Math.min(state.page * state.limit, total);
  document.getElementById('resultsInfo').textContent =
    total === 0 ? 'No results found'
                : `Showing ${from}–${to} of ${total} novel${total !== 1 ? 's' : ''}`;
}

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
// eslint-disable-next-line no-unused-vars
function goToNovel(id) { window.location.href = `novel.html?id=${id}`; }
// eslint-disable-next-line no-unused-vars
function addToBooklist(id, name) {
  // Visual-only per design spec (Story 6) — persisted in localStorage
  const shelf = JSON.parse(localStorage.getItem('booklist') || '[]');
  if (!shelf.includes(id)) {
    shelf.push(id);
    localStorage.setItem('booklist', JSON.stringify(shelf));
    showToast(`"${name}" added to your booklist!`, 'success');
  } else {
    showToast('Already on your booklist', 'warning');
  }
}

/* ═══════════════════════════════════════
   THEME  — Bootstrap data-bs-theme + glassmorphism CSS
═══════════════════════════════════════ */
function toggleTheme() {
  const html  = document.documentElement;
  const isDark = html.getAttribute('data-bs-theme') === 'dark';
  html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeIcon').textContent = isDark ? 'dark_mode' : 'light_mode';
  localStorage.setItem('nn-theme', isDark ? 'light' : 'dark');
}

function restoreTheme() {
  const saved = localStorage.getItem('nn-theme');
  if (saved) {
    document.documentElement.setAttribute('data-bs-theme', saved);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = saved === 'dark' ? 'light_mode' : 'dark_mode';
  }
}

/* ═══════════════════════════════════════
   TOAST  — Bootstrap native Toast component
═══════════════════════════════════════ */
function showToast(message, type = 'success') {
  const bg = { success: 'text-bg-success', warning: 'text-bg-warning', danger: 'text-bg-danger' }[type] || 'text-bg-dark';
  const id = `toast-${Date.now()}`;
  document.getElementById('toastContainer').insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center ${bg} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body fw-semibold">${esc(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  const el = document.getElementById(id);
  new bootstrap.Toast(el, { delay: 3000 }).show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}