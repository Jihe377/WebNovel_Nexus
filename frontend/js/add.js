const API_BASE = '/api';
const tags = [];

const PRESET_TAGS = [
  'Rebirth', 'Infinite Flow', 'Apocalypse', 'Interstellar', 'Cultivation',
  'Strong vs. Strong', 'Arranged Marriage', 'Reconciliation', 'Unrequited Love',
  'Pursuing Wife Through Fire', 'Satisfying Read', 'Angsty Read', 'Sweet Read',
  'Suspense', 'Leveling Up', 'Beautiful Strong and Tragic', 'Crazy',
  'Yandere', 'Cold', 'Loyal Dog',
];

function buildPresetTags() {
  const container = document.getElementById('presetTags');
  PRESET_TAGS.forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-secondary btn-sm';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener('click', () => togglePresetTag(btn, tag));
    container.appendChild(btn);
  });
}

function togglePresetTag(btn, tag) {
  if (tags.includes(tag)) {
    // Deselect
    tags.splice(tags.indexOf(tag), 1);
    btn.className = 'btn btn-outline-secondary btn-sm';
    document.getElementById('tagError').classList.add('d-none');
  } else {
    if (tags.length >= 3) {
      document.getElementById('tagError').classList.remove('d-none');
      return;
    }
    tags.push(tag);
    btn.className = 'btn btn-primary btn-sm';
  }
  renderTags();
}

document.addEventListener('DOMContentLoaded', () => {
  restoreTheme();
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  buildPresetTags();
});

// eslint-disable-next-line no-unused-vars
function addTag() {
  const input = document.getElementById('tagInput');
  const val = input.value.trim();
  const errEl = document.getElementById('tagError');

  if (!val) return;

  if (tags.length >= 3) {
    errEl.classList.remove('d-none');
    input.value = '';
    return;
  }

  // Deduplicate
  if (tags.includes(val)) { input.value = ''; return; }

  tags.push(val);
  errEl.classList.add('d-none');
  input.value = '';
  renderTags();
}

// eslint-disable-next-line no-unused-vars
function removeTag(idx) {
  tags.splice(idx, 1);
  document.getElementById('tagError').classList.add('d-none');
  renderTags();
}

function renderTags() {
  document.getElementById('tagList').innerHTML = tags.map((t, i) => `
    <span class="tag-item">
      ${esc(t)}
      <button type="button" onclick="removeTag(${i})" title="Remove">
        <span class="material-symbols-outlined" style="font-size:16px">close</span>
      </button>
    </span>`).join('');
  document.querySelectorAll('#presetTags button').forEach(btn => {
    btn.className = tags.includes(btn.dataset.tag)
      ? 'btn btn-primary btn-sm'
      : 'btn btn-outline-secondary btn-sm';
  });
}

// eslint-disable-next-line no-unused-vars
async function submitNovel() {
  const bookName    = document.getElementById('bookName').value.trim();
  const author      = document.getElementById('author').value.trim();
  const description = document.getElementById('description').value.trim();
  const status      = document.getElementById('status').value;
  const genre       = document.getElementById('genre').value.trim();
  const sourceUrl   = document.getElementById('sourceUrl').value.trim();
  const errEl       = document.getElementById('formError');

  // Clear previous validation
  ['bookName','author','description','genre','sourceUrl'].forEach(id => {
    document.getElementById(id).classList.remove('is-invalid');
  });
  errEl.classList.add('d-none');

  // Validate
  let valid = true;
  if (!bookName)    { document.getElementById('bookName').classList.add('is-invalid');    valid = false; }
  if (!author)      { document.getElementById('author').classList.add('is-invalid');      valid = false; }
  if (!description) { document.getElementById('description').classList.add('is-invalid'); valid = false; }
  if (!genre)       { document.getElementById('genre').classList.add('is-invalid');       valid = false; }
  if (!sourceUrl)   { document.getElementById('sourceUrl').classList.add('is-invalid');   valid = false; }

  if (!valid) return;

  const payload = {
    book_name: bookName,
    author,
    description,
    status,
    genre,
    tag1: tags[0] || '',
    tag2: tags[1] || '',
    tag3: tags[2] || '',
    source_url: sourceUrl,
    read: 0,
  };

  try {
    const res = await fetch(`${API_BASE}/novels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Failed to add novel.';
      errEl.classList.remove('d-none');
      return;
    }

    showToast('Novel added successfully!', 'success');

    // Redirect to the new novel's page after short delay
    setTimeout(() => {
      window.location.href = `novel.html?id=${data.novel.id}`;
    }, 1200);

  } catch (e) {
    console.error(e);
    errEl.textContent = 'Network error. Please try again.';
    errEl.classList.remove('d-none');
  }
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
  new bootstrap.Toast(document.getElementById(id), { delay: 2000 }).show();
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
