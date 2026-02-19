
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  restoreTheme();
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  loadCharts();
});

async function loadCharts() {
  document.getElementById('globalError').classList.add('d-none');
  document.getElementById('loadingState').classList.remove('d-none');

  try {
    const res = await fetch(`${API_BASE}/novels?limit=1000&page=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const novels = data.novels || [];

    const genreMap = {};
    novels.forEach(n => {
      const g = (n.genre || 'Unknown').trim();
      if (!genreMap[g]) genreMap[g] = [];
      genreMap[g].push(n);
    });

    const genreList = Object.entries(genreMap)
      .map(([genre, list]) => {
        const sorted = list.sort((a, b) => (b.read || 0) - (a.read || 0));
        const totalReads = sorted.reduce((s, n) => s + (n.read || 0), 0);
        return { genre, books: sorted.slice(0, 5), totalReads };
      })
      .sort((a, b) => b.totalReads - a.totalReads)
      .slice(0, 10);

    document.getElementById('loadingState').classList.add('d-none');

    if (genreList.length === 0) {
      document.getElementById('chartsGrid').innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          <span class="material-symbols-outlined d-block mb-2" style="font-size:48px">library_books</span>
          <h6 class="fw-bold">No novels found</h6>
          <small>Add some novels first to see genre charts.</small>
        </div>`;
      return;
    }

    renderCharts(genreList);
  } catch (err) {
    console.error(err);
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('globalError').classList.remove('d-none');
  }
}

function renderCharts(genreList) {
  const grid = document.getElementById('chartsGrid');
  grid.innerHTML = '';

  genreList.forEach(({ genre, books }) => {
    const rankBadges = ['bg-warning text-dark', 'bg-secondary text-white', 'bg-danger text-white'];

    const booksHtml = books.length === 0
      ? `<p class="text-muted small text-center py-3 mb-0">No novels yet</p>`
      : books.map((novel, rank) => {
          const badgeCls = rankBadges[rank] || 'bg-light text-dark';
          return `
            <div class="d-flex align-items-center gap-3 p-2 rounded" role="button"
                 onclick="goToNovel('${novel.id}')"
                 onmouseover="this.classList.add('bg-body-secondary')"
                 onmouseout="this.classList.remove('bg-body-secondary')">
              <span class="badge ${badgeCls} rounded-circle d-flex align-items-center justify-content-center"
                    style="width:26px;height:26px;flex-shrink:0;font-size:.75rem">${rank + 1}</span>
              <div class="overflow-hidden flex-grow-1">
                <div class="fw-semibold small text-truncate">${esc(novel.book_name)}</div>
                <div class="text-muted d-flex align-items-center gap-1" style="font-size:.7rem">
                  <span class="material-symbols-outlined" style="font-size:12px">visibility</span>
                  ${fmtNum(novel.read || 0)} reads
                </div>
              </div>
            </div>
            ${rank < books.length - 1 ? '<hr class="my-1">' : ''}`;
        }).join('');

    grid.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 col-xl-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header d-flex align-items-center py-3">
            <span class="fw-bold">
              <span class="material-symbols-outlined align-middle text-primary me-1" style="font-size:18px">menu_book</span>
              ${esc(genre)}
            </span>
          </div>
          <div class="card-body py-2 px-3">${booksHtml}</div>
          <div class="card-footer text-end">
            <a href="index.html" class="btn btn-outline-primary btn-sm">
              View all
              <span class="material-symbols-outlined align-middle" style="font-size:14px">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>`);
  });
}

// eslint-disable-next-line no-unused-vars
function goToNovel(id) { window.location.href = `novel.html?id=${id}`; }

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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
