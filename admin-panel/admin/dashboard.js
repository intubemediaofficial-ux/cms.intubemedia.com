const API = '/api/data.php';
const LOGIN_API = '/api/login.php';
const LOGOUT_API = '/api/logout.php';
let DATA = {};

// ─── Toast ───
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── API helpers ───
async function api(method, section, body, id) {
  let url = API + '?section=' + section;
  if (id) url += '&id=' + id;
  const opts = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

async function loadData() {
  try {
    const res = await fetch(API + '?section=public');
    DATA = await res.json();
  } catch (e) {
    console.error('Load failed', e);
  }
}

// ─── Login ───
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;
  try {
    const res = await fetch(LOGIN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('dashboard').style.display = 'flex';
      await loadData();
      showSection('overview');
    } else {
      document.getElementById('loginError').textContent = 'Invalid credentials';
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Connection error';
  }
});

// ─── Logout ───
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch(LOGOUT_API, { credentials: 'include' });
  location.reload();
});

// ─── Navigation ───
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    showSection(item.dataset.section);
  });
});

const TITLES = {
  overview: 'Dashboard Overview',
  banners: 'Hero Banners',
  releases: 'Latest Releases',
  artists: 'Artists',
  videos: 'Videos',
  catalogue: 'Music Catalogue',
  licensing: 'Licensing',
  inquiries: 'Contact Inquiries',
  settings: 'Settings'
};

function showSection(s) {
  document.getElementById('pageTitle').textContent = TITLES[s] || s;
  const area = document.getElementById('contentArea');
  switch (s) {
    case 'overview': renderOverview(area); break;
    case 'banners': renderCRUD(area, 'banners', ['image', 'title'], bannerForm); break;
    case 'releases': renderCRUD(area, 'releases', ['image', 'hindi_title', 'eng_title', 'artist', 'url'], releaseForm); break;
    case 'artists': renderCRUD(area, 'artists', ['image', 'name', 'role', 'genre'], artistForm); break;
    case 'videos': renderCRUD(area, 'videos', ['thumbnail', 'hindi_title', 'eng_title', 'duration', 'views', 'youtube_id'], videoForm); break;
    case 'catalogue': renderCRUD(area, 'catalogue', ['name', 'hindi', 'count'], catalogueForm); break;
    case 'licensing': renderCRUD(area, 'licensing', ['title', 'description'], licensingForm); break;
    case 'inquiries': renderInquiries(area); break;
    case 'settings': renderSettings(area); break;
  }
}

// ─── Overview ───
function renderOverview(area) {
  const s = DATA.settings || {};
  area.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="number">${(DATA.releases || []).length}</div><div class="label">Releases</div></div>
      <div class="stat-card"><div class="number">${(DATA.artists || []).length}</div><div class="label">Artists</div></div>
      <div class="stat-card"><div class="number">${(DATA.videos || []).length}</div><div class="label">Videos</div></div>
      <div class="stat-card"><div class="number">${(DATA.catalogue || []).reduce((a, c) => a + (c.count || 0), 0)}</div><div class="label">Total Songs</div></div>
      <div class="stat-card"><div class="number">${(DATA.banners || []).length}</div><div class="label">Banners</div></div>
      <div class="stat-card"><div class="number">${(DATA.inquiries || []).length}</div><div class="label">Inquiries</div></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="number">${s.stats_songs || '0'}</div><div class="label">Songs (Display)</div></div>
      <div class="stat-card"><div class="number">${s.stats_artists || '0'}</div><div class="label">Artists (Display)</div></div>
      <div class="stat-card"><div class="number">${s.stats_videos || '0'}</div><div class="label">Videos (Display)</div></div>
      <div class="stat-card"><div class="number">${s.stats_views || '0'}</div><div class="label">Views (Display)</div></div>
    </div>`;
}

// ─── Generic CRUD ───
function renderCRUD(area, section, cols, formFn) {
  const items = DATA[section] || [];
  const imgCols = ['image', 'thumbnail'];
  area.innerHTML = `
    <div class="section-header">
      <h2>${TITLES[section]} (${items.length})</h2>
      <button class="btn btn-primary" id="addBtn">+ Add New</button>
    </div>
    ${items.length === 0 ? '<div class="empty-state"><p>No items yet. Click "Add New" to get started.</p></div>' : `
    <table class="data-table">
      <thead><tr>${cols.map(c => `<th>${c.replace(/_/g, ' ')}</th>`).join('')}<th>Actions</th></tr></thead>
      <tbody>${items.map(item => `<tr>
        ${cols.map(c => `<td>${imgCols.includes(c) && item[c] ? `<img src="${item[c]}" alt="">` : (item[c] || '-')}</td>`).join('')}
        <td class="actions">
          <button class="btn btn-primary btn-sm edit-btn" data-id="${item.id}">Edit</button>
          <button class="btn btn-danger btn-sm del-btn" data-id="${item.id}">Delete</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>`}`;

  document.getElementById('addBtn').addEventListener('click', () => showModal(section, null, formFn));
  area.querySelectorAll('.edit-btn').forEach(b => {
    b.addEventListener('click', () => {
      const item = items.find(i => i.id === b.dataset.id);
      showModal(section, item, formFn);
    });
  });
  area.querySelectorAll('.del-btn').forEach(b => {
    b.addEventListener('click', async () => {
      if (!confirm('Delete this item?')) return;
      await api('DELETE', section, null, b.dataset.id);
      toast('Deleted');
      await loadData();
      showSection(section);
    });
  });
}

// ─── Modal ───
function showModal(section, item, formFn) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<h3>${item ? 'Edit' : 'Add'} ${TITLES[section]?.replace(/s$/, '') || section}</h3>` + formFn(item);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  modal.querySelector('.cancel-btn')?.addEventListener('click', () => overlay.remove());
  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd.entries());
    // Convert count to number if present
    if (obj.count) obj.count = parseInt(obj.count) || 0;
    if (item) {
      await api('PUT', section, obj, item.id);
      toast('Updated');
    } else {
      await api('POST', section, obj);
      toast('Added');
    }
    overlay.remove();
    await loadData();
    showSection(section);
  });
}

// ─── Form generators ───
function field(label, name, value, type = 'text') {
  return `<div class="form-group"><label>${label}</label><input type="${type}" name="${name}" value="${value || ''}" ${type !== 'url' ? '' : ''}></div>`;
}
function textareaField(label, name, value) {
  return `<div class="form-group"><label>${label}</label><textarea name="${name}">${value || ''}</textarea></div>`;
}
function formActions() {
  return `<div class="form-actions"><button type="button" class="btn cancel-btn" style="background:#333;color:#999">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>`;
}

function bannerForm(item) {
  return `<form>
    ${field('Image URL', 'image', item?.image)}
    ${field('Title', 'title', item?.title)}
    ${item?.image ? `<img src="${item.image}" class="img-preview">` : ''}
    ${formActions()}
  </form>`;
}

function releaseForm(item) {
  return `<form>
    ${field('Hindi Title', 'hindi_title', item?.hindi_title)}
    ${field('English Title', 'eng_title', item?.eng_title)}
    ${field('Artist', 'artist', item?.artist)}
    ${field('Label', 'label', item?.label || 'Bainsla Music')}
    ${field('Image URL', 'image', item?.image)}
    ${field('YouTube / Link URL', 'url', item?.url, 'url')}
    ${item?.image ? `<img src="${item.image}" class="img-preview">` : ''}
    ${formActions()}
  </form>`;
}

function artistForm(item) {
  return `<form>
    ${field('Name', 'name', item?.name)}
    ${field('Role', 'role', item?.role)}
    ${field('Genre', 'genre', item?.genre)}
    ${field('Image URL', 'image', item?.image)}
    ${item?.image ? `<img src="${item.image}" class="img-preview">` : ''}
    ${formActions()}
  </form>`;
}

function videoForm(item) {
  return `<form>
    ${field('Hindi Title', 'hindi_title', item?.hindi_title)}
    ${field('English Title', 'eng_title', item?.eng_title)}
    ${field('Category', 'category', item?.category)}
    ${field('Duration', 'duration', item?.duration)}
    ${field('Views', 'views', item?.views)}
    ${field('YouTube Video ID', 'youtube_id', item?.youtube_id)}
    ${field('Thumbnail URL', 'thumbnail', item?.thumbnail)}
    ${item?.thumbnail ? `<img src="${item.thumbnail}" class="img-preview">` : ''}
    ${formActions()}
  </form>`;
}

function catalogueForm(item) {
  return `<form>
    ${field('Category Name', 'name', item?.name)}
    ${field('Hindi Name', 'hindi', item?.hindi)}
    ${field('Song Count', 'count', item?.count, 'number')}
    ${formActions()}
  </form>`;
}

function licensingForm(item) {
  return `<form>
    ${field('Title', 'title', item?.title)}
    ${textareaField('Description', 'description', item?.description)}
    ${formActions()}
  </form>`;
}

// ─── Inquiries ───
function renderInquiries(area) {
  const items = DATA.inquiries || [];
  if (items.length === 0) {
    area.innerHTML = '<div class="empty-state"><p>No inquiries yet.</p></div>';
    return;
  }
  area.innerHTML = `
    <div class="section-header"><h2>Inquiries (${items.length})</h2></div>
    ${items.map(i => `
      <div class="inquiry-card">
        <span class="inquiry-type">${i.type || 'General'}</span>
        <div class="inquiry-name">${i.name || 'Anonymous'}</div>
        <div class="inquiry-msg">${i.message || ''}</div>
        <div class="inquiry-meta">${i.email || ''} · ${i.phone || ''} · ${i.created_at || ''}</div>
        <button class="btn btn-danger btn-sm del-inquiry" data-id="${i.id}" style="margin-top:8px">Delete</button>
      </div>
    `).join('')}`;
  area.querySelectorAll('.del-inquiry').forEach(b => {
    b.addEventListener('click', async () => {
      if (!confirm('Delete this inquiry?')) return;
      await api('DELETE', 'inquiries', null, b.dataset.id);
      toast('Deleted');
      await loadData();
      renderInquiries(area);
    });
  });
}

// ─── Settings ───
function renderSettings(area) {
  const s = DATA.settings || {};
  area.innerHTML = `
    <form id="settingsForm">
      <div class="stats-grid" style="grid-template-columns:1fr 1fr">
        <div>
          <h3 style="font-size:14px;margin-bottom:12px;color:#f59e0b">Company Info</h3>
          ${field('Company Name', 'company_name', s.company_name)}
          ${field('Tagline', 'tagline', s.tagline)}
          ${textareaField('Short Description', 'description', s.description)}
          ${textareaField('About Text', 'about_text', s.about_text)}
        </div>
        <div>
          <h3 style="font-size:14px;margin-bottom:12px;color:#f59e0b">Contact</h3>
          ${field('Phone', 'phone', s.phone)}
          ${field('Email', 'email', s.email, 'email')}
          ${field('WhatsApp (without +)', 'whatsapp', s.whatsapp)}
          ${textareaField('Address', 'address', s.address)}
        </div>
      </div>
      <div class="stats-grid" style="grid-template-columns:1fr 1fr">
        <div>
          <h3 style="font-size:14px;margin-bottom:12px;color:#f59e0b">Social Links</h3>
          ${field('YouTube URL', 'youtube_url', s.youtube_url, 'url')}
          ${field('Instagram URL', 'instagram_url', s.instagram_url, 'url')}
          ${field('Facebook URL', 'facebook_url', s.facebook_url, 'url')}
        </div>
        <div>
          <h3 style="font-size:14px;margin-bottom:12px;color:#f59e0b">Display Stats</h3>
          ${field('Songs Count', 'stats_songs', s.stats_songs)}
          ${field('Artists Count', 'stats_artists', s.stats_artists)}
          ${field('Videos Count', 'stats_videos', s.stats_videos)}
          ${field('Views Count', 'stats_views', s.stats_views)}
        </div>
      </div>
      <div style="text-align:right;margin-top:16px">
        <button type="submit" class="btn btn-primary" style="padding:12px 32px">Save Settings</button>
      </div>
    </form>`;

  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd.entries());
    await api('PUT', 'settings', obj);
    toast('Settings saved');
    await loadData();
  });
}
