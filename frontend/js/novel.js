const API_BASE = '/api';
const params = new URLSearchParams(location.search);
const novelId = params.get('id');
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
  restoreTheme();
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  initStarPicker();
  if (!novelId) { showError(); return; }
  loadNovel();
});

async function loadNovel() {
  try {
    const res = await fetch(`${API_BASE}/novels/${novelId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const novel = await res.json();
    renderNovel(novel);
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('content').classList.remove('d-none');
    await Promise.all([loadReviews(), loadRecommendations(novel)]);
  } catch (e) {
    console.error(e);
    showError();
  }
}

function renderNovel(n) {
  document.title = `${esc(n.book_name || n.name)} | WebNovel Nexus`;
  document.getElementById('breadcrumbTitle').textContent = n.book_name || n.name || 'Novel';
  document.getElementById('novelName').textContent = n.book_name || n.name || 'Untitled';

  // Status badge
  const statusEl = document.getElementById('novelStatus');
  const statusMap = {
    'completed': 'bg-success',
    'ongoing':   'bg-warning text-dark',
    'hiatus':    'bg-secondary',
  };
  if (n.status) {
    const key = n.status.toLowerCase();
    statusEl.textContent = n.status;
    statusEl.className = `badge ${statusMap[key] || 'bg-secondary'}`;
  }
  document.getElementById('novelAuthor').textContent = n.author || 'Unknown Author';
  document.getElementById('novelDesc').textContent = n.description || n.desc || 'No synopsis available.';
  document.getElementById('novelReads').textContent = fmtNum(n.read || 0);

  if (n.rating != null) {
    document.getElementById('novelRating').innerHTML =
      `${renderStars(n.rating)} <span class="ms-1">${Number(n.rating).toFixed(1)}</span>`;
  }

  if (n.createdAt || n.date) {
    const d = new Date(n.createdAt || n.date);
    document.getElementById('novelDate').textContent =
      d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  }

  // Genre + tags (deduplicated, all grey)
  const row = document.getElementById('genreTagsRow');
  row.innerHTML = '';
  const seen = new Set();

  [n.genre, n.tag1, n.tag2, n.tag3].forEach(val => {
    const v = (val || '').toString().trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      const b = document.createElement('span');
      b.className = 'badge bg-secondary bg-opacity-75 tag-badge';
      b.textContent = v;
      row.appendChild(b);
    }
  });
}

async function loadReviews() {
  const el = document.getElementById('reviewsList');
  try {
    const res = await fetch(`${API_BASE}/novels/${novelId}/reviews`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderReviews(Array.isArray(data) ? data : (data.reviews || []));
  } catch (e) {
    console.error(e);
    el.innerHTML = `<p class="text-muted small text-center py-3">Failed to load reviews.</p>`;
  }
}

function renderReviews(reviews) {
  const el = document.getElementById('reviewsList');
  document.getElementById('reviewCount').textContent = reviews.length;

  if (!reviews.length) {
    el.innerHTML = `
      <div class="text-center py-4 text-muted">
        <span class="material-symbols-outlined d-block mb-2" style="font-size:36px">chat_bubble_outline</span>
        <small>No reviews yet. Be the first to review!</small>
      </div>`;
    return;
  }

  el.innerHTML = reviews.map(r => {
    const date = r.createdAt
      ? new Date(r.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
      : '';
    return `
      <div class="review-card border rounded p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <div class="d-flex align-items-center gap-2">
            <span class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style="width:32px;height:32px;font-size:.8rem;flex-shrink:0">
              ${esc((r.username || r.user || 'A').charAt(0).toUpperCase())}
            </span>
            <div>
              <div class="fw-semibold small">${esc(r.username || r.user || 'Anonymous')}</div>
              ${date ? `<div class="text-muted" style="font-size:.7rem">${date}</div>` : ''}
            </div>
          </div>
          <div class="star-rating small">${renderStars(r.rating || 0)}</div>
        </div>
        <p class="mb-0 small text-muted mt-2" style="line-height:1.6">
          ${esc(r.body || r.comment || r.content || '')}
        </p>
      </div>`;
  }).join('');
}

// eslint-disable-next-line no-unused-vars
async function loadRecommendations(novel) {
  const el = document.getElementById('recList');
  try {
    const res = await fetch(`${API_BASE}/novels/${novelId}/recommendations`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const recs = await res.json();
    renderRecommendations(Array.isArray(recs) ? recs : []);
  } catch (e) {
    console.error(e);
    el.innerHTML = `<p class="text-muted small text-center py-3">Failed to load recommendations.</p>`;
  }
}

function renderRecommendations(recs) {
  const el = document.getElementById('recList');
  if (!recs.length) {
    el.innerHTML = `<p class="text-muted small text-center py-3">No recommendations available.</p>`;
    return;
  }

  el.innerHTML = recs.map((n, i) => `
    <div class="rec-item d-flex align-items-center gap-3 p-2 rounded"
         onclick="location.href='novel.html?id=${n.id}'">
      <div class="bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center flex-shrink-0"
           style="width:40px;height:56px;font-size:.7rem;font-weight:700">${i + 1}</div>
      <div class="overflow-hidden flex-grow-1">
        <div class="fw-semibold small text-truncate">${esc(n.book_name || n.name)}</div>
        <div class="text-muted small text-truncate">${esc(n.author)}</div>
        <div class="d-flex align-items-center gap-1 flex-wrap mt-1" style="font-size:.7rem">
          ${[n.genre, n.tag1, n.tag2, n.tag3]
              .filter(v => v && v.toString().trim())
              .filter((v, idx, arr) => arr.indexOf(v) === idx)
              .map(v => `<span class="badge bg-secondary bg-opacity-75 tag-badge">${esc(v)}</span>`)
              .join('')}
          <span class="text-muted ms-1">
            <span class="material-symbols-outlined align-middle" style="font-size:11px">visibility</span>
            ${fmtNum(n.read || 0)}
          </span>
        </div>
      </div>
    </div>
    ${i < recs.length - 1 ? '<hr class="my-1">' : ''}`
  ).join('');
}

// eslint-disable-next-line no-unused-vars
async function submitReview() {
  const user    = document.getElementById('reviewUser').value.trim();
  const comment = document.getElementById('reviewBody').value.trim();
  const rating  = parseInt(document.getElementById('selectedRating').value);
  const errEl   = document.getElementById('reviewError');

  if (!user || !comment || rating < 1) { errEl.classList.remove('d-none'); return; }
  errEl.classList.add('d-none');

  try {
    const res = await fetch(`${API_BASE}/novels/${novelId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, body: comment, rating })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    document.getElementById('reviewUser').value = '';
    document.getElementById('reviewBody').value = '';
    document.getElementById('selectedRating').value = '0';
    selectedRating = 0;
    document.querySelectorAll('.star-pick').forEach(s => s.classList.replace('text-warning', 'text-muted'));
    bootstrap.Collapse.getInstance(document.getElementById('writeReview'))?.hide();

    showToast('Review submitted!', 'success');
    await loadReviews();
  } catch (e) {
    console.error(e);
    showToast('Failed to submit review. Please try again.', 'danger');
  }
}


function initStarPicker() {
  document.querySelectorAll('.star-pick').forEach(s => {
    s.addEventListener('mouseover', () => highlightStars(parseInt(s.dataset.v)));
    s.addEventListener('mouseout',  () => highlightStars(selectedRating));
    s.addEventListener('click', () => {
      selectedRating = parseInt(s.dataset.v);
      document.getElementById('selectedRating').value = selectedRating;
      highlightStars(selectedRating);
    });
  });
}

function highlightStars(n) {
  document.querySelectorAll('.star-pick').forEach(s => {
    const v = parseInt(s.dataset.v);
    s.classList.toggle('text-warning', v <= n);
    s.classList.toggle('text-muted',   v > n);
  });
}

function renderStars(rating) {
  const full = Math.floor(rating), half = rating - full >= 0.5;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= full)               html += '<span class="material-symbols-outlined" style="font-size:14px;color:#f5a623">star</span>';
    else if (i === full+1 && half) html += '<span class="material-symbols-outlined" style="font-size:14px;color:#f5a623">star_half</span>';
    else                         html += '<span class="material-symbols-outlined" style="font-size:14px;color:#ccc">star</span>';
  }
  return html;
}

function showError() {
  document.getElementById('loadingState').classList.add('d-none');
  document.getElementById('errorState').classList.remove('d-none');
}

function showToast(msg, type = 'secondary') {
  const id = 'toast_' + Date.now();
  document.getElementById('toastContainer').insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  new bootstrap.Toast(document.getElementById(id), { delay: 3000 }).show();
}

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function toggleTheme() {
  const html = document.documentElement;
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
