const DATA = [
  {
    id: 1, editor: true,
    title: "Best Xianxia of the Decade",
    creator: "CultivationKing99", initials: "CK",
    books: 32, views: "18.4K", saves: 247,
    desc: "The definitive ranking of Xianxia and Cultivation novels — from ISSTH to A Will Eternal.",
    novels: [
      { name: "I Shall Seal the Heavens",    author: "Er Gen",         tag: "Xianxia"     },
      { name: "A Will Eternal",              author: "Er Gen",         tag: "Xianxia"     },
      { name: "Lord of the Mysteries",       author: "Cuttlefish",     tag: "Mystery"     },
      { name: "The Desolate Era",            author: "I Eat Tomatoes", tag: "Cultivation" },
      { name: "Coiling Dragon",              author: "I Eat Tomatoes", tag: "Xianxia"     },
    ]
  },
  {
    id: 2, editor: true,
    title: "LitRPG Must-Reads 2024",
    creator: "DungeonDelver", initials: "DD",
    books: 19, views: "12.1K", saves: 183,
    desc: "System apocalypse, dungeon-core, and progression fantasy ranked by actual readers.",
    novels: [
      { name: "The Beginning After the End", author: "TurtleMe",      tag: "LitRPG"      },
      { name: "Dungeon Crawler Carl",        author: "Matt Dinniman", tag: "Dungeon Core" },
      { name: "He Who Fights With Monsters", author: "Jason Cheyne",  tag: "LitRPG"      },
      { name: "Primal Hunter",               author: "Zogarth",       tag: "Progression" },
      { name: "Azarinth Healer",             author: "Rhaegar",       tag: "LitRPG"      },
    ]
  },
  {
    id: 3, editor: false,
    title: "Isekai Hidden Gems",
    creator: "AnotherWorldFan", initials: "AW",
    books: 14, views: "8.7K", saves: 95,
    desc: "Not your typical truck-kun stories. Under-appreciated isekai titles that deserve more attention.",
    novels: [
      { name: "Mother of Learning",          author: "Domagoj Kurmaic", tag: "Time Loop" },
      { name: "Unsouled",                    author: "Will Wight",      tag: "Isekai"    },
      { name: "Forgotten Conqueror",         author: "darkwolf76",      tag: "Action"    },
      { name: "An Outcast in Another World", author: "Ringo",           tag: "Isekai"    },
      { name: "The New World",               author: "Monsoon117",      tag: "LitRPG"    },
    ]
  },
  {
    id: 4, editor: false,
    title: "Completed Stories Only",
    creator: "NoCliffhangers", initials: "NC",
    books: 28, views: "21K", saves: 412,
    desc: "For readers tired of hiatus and dropped series. Every title here is fully completed.",
    novels: [
      { name: "The Wandering Inn",        author: "pirateaba",     tag: "Portal Fantasy" },
      { name: "Worm",                     author: "Wildbow",       tag: "Superhero"      },
      { name: "Practical Guide to Evil",  author: "ErraticErrata", tag: "Dark Fantasy"   },
      { name: "Ward",                     author: "Wildbow",       tag: "Superhero"      },
      { name: "Pact",                     author: "Wildbow",       tag: "Urban Fantasy"  },
    ]
  },
  {
    id: 5, editor: false,
    title: "Slow Burn Romance in Cultivation",
    creator: "CloudNineReads", initials: "CN",
    books: 11, views: "6.3K", saves: 134,
    desc: "Cultivation stories with beautiful romantic subplots — no forced pairings.",
    novels: [
      { name: "Heaven Official's Blessing",           author: "MXTX",         tag: "Cultivation" },
      { name: "Scum Villain's Self-Saving System",    author: "MXTX",         tag: "BL"          },
      { name: "Grandmaster of Demonic Cultivation",   author: "MXTX",         tag: "BL"          },
      { name: "To Be a Power in the Shadows",         author: "Aizawa Daisuke",tag: "Comedy"     },
      { name: "Reborn as a Vending Machine",          author: "Hiru Kuma",    tag: "Isekai"      },
    ]
  },
];

const likedIds = new Set();

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

document.addEventListener('DOMContentLoaded', () => {
  restoreTheme();
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('community-lists').innerHTML = DATA.map(d => buildCard(d, false)).join('');
});

function novelRows(novels, count) {
  return novels.slice(0, count).map((n, i) => `
    <div class="novel-row d-flex align-items-center gap-2 px-2 py-1 rounded small">
      <span class="text-muted" style="width:18px">${i + 1}</span>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-medium text-truncate">${n.name}</div>
        <div class="text-muted" style="font-size:.75rem">${n.author}</div>
      </div>
      <span class="badge bg-success-subtle text-success fw-normal">${n.tag}</span>
    </div>`).join('');
}

function buildCard(d, isRight) {
  const isLiked = likedIds.has(d.id);
  const count = isRight ? 3 : 5;
  return `
    <div class="card mb-3 shadow-sm" id="card-${isRight ? 'r' : 'l'}-${d.id}">
      <div class="card-body">

        <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
          <div class="flex-grow-1 overflow-hidden">
            ${d.editor ? '<span class="badge text-bg-success mb-1">Editor\'s Choice</span><br>' : ''}
            <a href="#" class="fw-semibold text-dark text-decoration-none text-truncate d-block">${d.title}</a>
          </div>
          <div class="text-end flex-shrink-0">
            <div class="fw-medium text-warning-emphasis small">${d.creator}</div>
            <div class="text-muted d-flex gap-2 justify-content-end" style="font-size:.75rem">
              <span>${d.books} books</span>
              <span>${d.views} views</span>
              <span>${d.saves} saves</span>
            </div>
          </div>
        </div>

        ${!isRight ? `<p class="text-muted small mb-2">${d.desc}</p>` : ''}

        <div class="d-flex flex-column gap-1 mb-3">${novelRows(d.novels, count)}</div>

        <div class="d-flex gap-2 border-top pt-2">
          <button class="btn btn-sm btn-outline-secondary btn-like ${isLiked ? 'active' : ''}"
                  onclick="toggleLike(${d.id})">
            ${isLiked ? 'Liked' : 'Like'}
          </button>
          <button class="btn btn-sm btn-outline-secondary btn-follow"
                  onclick="toggleFollow(this, '${d.creator}')">
            Follow ${d.creator}
          </button>
        </div>

      </div>
    </div>`;
}

// eslint-disable-next-line no-unused-vars
function toggleFollow(btn, creator) {
  const active = btn.classList.toggle('active');
  btn.classList.toggle('btn-outline-secondary', !active);
  btn.classList.toggle('btn-secondary', active);
  btn.textContent = active ? `Following ${creator}` : `Follow ${creator}`;
  showToast(active ? `Now following ${creator}` : `Unfollowed ${creator}`);
}

// eslint-disable-next-line no-unused-vars
function toggleLike(id) {
  const d = DATA.find(x => x.id === id);
  const likedEl = document.getElementById('liked-lists');
  const emptyEl = document.getElementById('empty-liked');

  if (likedIds.has(id)) {
    likedIds.delete(id);
    const rc = document.getElementById(`card-r-${id}`);
    if (rc) rc.remove();
    if (likedIds.size === 0 && emptyEl) emptyEl.style.display = '';

    const lc = document.getElementById(`card-l-${id}`);
    if (lc) {
      const btn = lc.querySelector('.btn-like');
      btn.classList.remove('active');
      btn.textContent = 'Like';
    }
    showToast('Removed from liked lists');
  } else {
    likedIds.add(id);
    if (emptyEl) emptyEl.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.innerHTML = buildCard(d, true);
    const inner = wrap.firstElementChild;
    inner.classList.add('card-enter');
    likedEl.appendChild(inner);

    const lc = document.getElementById(`card-l-${id}`);
    if (lc) {
      const btn = lc.querySelector('.btn-like');
      btn.classList.add('active');
      btn.textContent = 'Liked';
    }
    showToast(`"${d.title}" saved to your liked lists`);
  }
}