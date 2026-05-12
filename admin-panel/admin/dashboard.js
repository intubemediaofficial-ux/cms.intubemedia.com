/* ═══ AUTH ═══ */
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Bainsla@2024';

function checkAuth() {
  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    loadDashboardData();
  }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem('admin_logged_in', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    loadDashboardData();
  } else {
    document.getElementById('loginError').textContent = 'Invalid username or password';
  }
});

function logout() {
  sessionStorage.removeItem('admin_logged_in');
  location.reload();
}

/* ═══ NAVIGATION ═══ */
document.querySelectorAll('[data-section]').forEach(el => {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    const sec = this.dataset.section;
    showSection(sec);
  });
});

function showSection(sec) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById('sec-' + sec);
  if (target) target.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-section="${sec}"]`);
  if (navItem) navItem.classList.add('active');
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ═══ DATA ═══ */
const DATA = {
  artists: [
    { name: 'Bhumika Sharma', role: 'Singer', genre: 'Devotional, Folk', desc: 'Versatile playback singer specializing in devotional and folk music with a soulful voice.', phone: '+91 72978 97628', email: 'bhumika@bainslamusic.com', songs: ['Shyam Teri Bansi Pagaal Kar Jaati Hai', 'Radha Rani Meri Hai', 'Mere Banke Bihari Lal'], featured: true, img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { name: 'DG Mawai', role: 'Singer', genre: 'Rasiya, Folk', desc: 'Popular Rasiya singer known for his energetic performances and unique voice.', phone: '+91 81071 12345', email: 'dgmawai@bainslamusic.com', songs: ['Rasiya 2024 Nonstop', 'Gajab Lage Ghaghro', 'Teri Aakhya Ka Yo Kajal'], featured: true, img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' },
    { name: 'Rashmi Nishad', role: 'Singer', genre: 'Devotional, Bhajan', desc: 'Devotional singer delivering heart-touching bhajans and spiritual melodies.', phone: '+91 63504 56789', email: 'rashmi@bainslamusic.com', songs: ['Shyam Tere Charno Mein', 'Mere Shyam Sahara', 'Govind Bolo Hari Gopal Bolo'], featured: true, img: 'https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg' },
    { name: 'Ajeet Bainsla', role: 'Producer', genre: 'Music Producer', desc: 'Music producer and composer with expertise in devotional and folk music production.', phone: '+91 89490 11223', email: 'ajeet@bainslamusic.com', songs: ['Ram Naam Ki Mahima', 'Hanuman Chalisa (Music)', 'Bhakti Ras'], featured: true, img: 'https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg' },
    { name: 'Gurjar Rasiya', role: 'Singer', genre: 'Rasiya, Folk', desc: 'Rising star in Rasiya music with a fresh voice and vibrant performances.', phone: '+91 95497 31202', email: 'gurjar@bainslamusic.com', songs: ['Gurjar Rasiya 2024', 'Teri Yaad Satave', 'Chhori Teri Smile'], featured: true, img: 'https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg' },
    { name: 'Ram Naam', role: 'Singer', genre: 'Bhajan, Devotional', desc: 'Devotional singer dedicated to spreading spiritual music and positivity.', phone: '+91 72228 99887', email: 'ramnaam@bainslamusic.com', songs: ['Ram Naam Ki Mahima', 'Sita Ram Sita Ram', 'Jai Shree Ram'], featured: true, img: 'https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg' }
  ],
  releases: [
    { title: 'श्याम तेरी बंसी', sub: 'Shyam Teri Bansi', artist: 'Bhumika Sharma', date: '15 May 2024', status: 'PUBLISHED', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'राधा रानी मेरी है', sub: 'Radha Rani Meri Hai', artist: 'Rashmi Nishad', date: '10 May 2024', status: 'PUBLISHED', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' },
    { title: 'हनुमान चालीसा', sub: 'Hanuman Chalisa', artist: 'Bainsla Music', date: '05 May 2024', status: 'PUBLISHED', img: 'https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg' },
    { title: 'राम नाम की महिमा', sub: 'Ram Naam Ki Mahima', artist: 'DG Mawai', date: '01 May 2024', status: 'SCHEDULED', img: 'https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg' },
    { title: 'गुर्जर रसिया', sub: 'Gurjar Rasiya', artist: 'Gurjar Rasiya', date: '28 Apr 2024', status: 'DRAFT', img: 'https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg' },
    { title: 'डीजे रसिया 2024', sub: 'DJ Rasiya 2024', artist: 'DJ Rasiya', date: '25 Apr 2024', status: 'PUBLISHED', img: 'https://img.youtube.com/vi/GwQnIPL68y8/hqdefault.jpg' },
    { title: 'भजन संध्या', sub: 'Bhajan Sandhya', artist: 'Various Artists', date: '20 Apr 2024', status: 'PUBLISHED', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'मोहन मेरे', sub: 'Mohan Mere', artist: 'Ajeet Bainsla', date: '18 Apr 2024', status: 'DRAFT', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' }
  ],
  videos: [
    { title: 'श्याम तेरी बंसी', sub: 'Shyam Teri Bansi Pagaal Kar Jaati Hai', cat: 'Krishna Bhajan', dur: '04:35', views: '1.2M', date: '20 May 2024 10:30 AM', status: 'Published', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'राधा रानी मेरी है', sub: 'Radha Rani Meri Hai', cat: 'Radha Bhajan', dur: '04:12', views: '856K', date: '18 May 2024 09:15 AM', status: 'Published', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' },
    { title: 'हनुमान चालीसा', sub: 'Hanuman Chalisa', cat: 'Hanuman Bhajan', dur: '06:21', views: '2.4M', date: '15 May 2024 08:45 AM', status: 'Published', img: 'https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg' },
    { title: 'गुरु चरणों में', sub: 'Guru Charno Mein', cat: 'Guru Bhajan', dur: '05:08', views: '452K', date: '12 May 2024 07:20 PM', status: 'Draft', img: 'https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg' },
    { title: 'मेरे बांके बिहारी', sub: 'Mere Banke Bihari', cat: 'Krishna Bhajan', dur: '04:50', views: '789K', date: '10 May 2024 11:10 AM', status: 'Scheduled', img: 'https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg' },
    { title: 'जय श्री राम', sub: 'Jai Shri Ram', cat: 'Ram Bhajan', dur: '03:58', views: '1.5M', date: '08 May 2024 06:00 PM', status: 'Published', img: 'https://img.youtube.com/vi/GwQnIPL68y8/hqdefault.jpg' }
  ],
  catalogue: [
    { title: 'श्याम तेरी बंसी पुकारे', sub: 'Krishna Bhajan', artist: 'Shyam Teri Bansi', label: 'Bainsla Music', album: 'Shyam Bhakti Sagar', dur: '04:35', status: 'Published', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'राधा रानी मेरी है', sub: 'Radha Bhajan', artist: 'Radha Rani Meri Hai', label: 'Bainsla Music', album: 'Radha Ras', dur: '04:12', status: 'Published', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' },
    { title: 'हनुमान चालीसा', sub: 'Hanuman Bhajan', artist: 'Hanuman Chalisa', label: 'Bainsla Music', album: 'Hanuman Amritwani', dur: '06:21', status: 'Published', img: 'https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg' },
    { title: 'राम नाम की महिमा', sub: 'Ram Bhajan', artist: 'Ram Naam Ki Mahima', label: 'Bainsla Music', album: 'Ram Bhakti', dur: '05:08', status: 'Published', img: 'https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg' },
    { title: 'भोलेनाथ की शरण', sub: 'Shiv Bhajan', artist: 'Bholenath Ki Sharan', label: 'Bainsla Music', album: 'Shiv Shakti', dur: '04:48', status: 'Published', img: 'https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg' },
    { title: 'गुर्जर रसिया 2024', sub: 'Gurjar Rasiya', artist: 'Gurjar Rasiya', label: 'Bainsla Music', album: 'Gurjar Rasiya Hits', dur: '03:52', status: 'Published', img: 'https://img.youtube.com/vi/GwQnIPL68y8/hqdefault.jpg' },
    { title: 'डीजे रसिया धमाल', sub: 'DJ Rasiya', artist: 'DJ Rasiya 2024', label: 'Bainsla Music', album: 'DJ Rasiya Dhamal', dur: '05:11', status: 'Published', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'देसी लोकगीत', sub: 'Folk Song', artist: 'Desi Lokgeet', label: 'Bainsla Music', album: 'Desi Dhun', dur: '03:45', status: 'Draft', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' }
  ],
  inquiries: [
    { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', type: 'Licensing', msg: 'Hi, I would like to license your devotional tracks for...', assigned: 'Meera Joshi', status: 'Open', date: 'May 23, 2024 11:42 AM' },
    { name: 'Priya Mehta', email: 'priya.mehta@waves.com', type: 'Collaboration', msg: 'We are interested in collaborating for a new...', assigned: 'Arjun Bainsla', status: 'In Progress', date: 'May 23, 2024 10:15 AM' },
    { name: 'Amit Verma', email: 'amit.verma@filmstudio.in', type: 'CMS / Distribution', msg: 'Please share the requirements for CMS...', assigned: 'Sneha Rathi', status: 'Open', date: 'May 22, 2024 04:33 PM' },
    { name: 'Neha Kapoor', email: 'neha.kapoor@gmail.com', type: 'General Contact', msg: 'I wanted to know more about your upcoming...', assigned: 'Vikram Singh', status: 'Resolved', date: 'May 22, 2024 02:20 PM' },
    { name: 'Vikash Singh', email: 'vikash.singh@tunes.in', type: 'Licensing', msg: 'Looking to license your folk songs for a web series...', assigned: 'Meera Joshi', status: 'In Progress', date: 'May 21, 2024 01:05 PM' },
    { name: 'Sunita Rao', email: 'sunita.rao@musicbox.com', type: 'Collaboration', msg: 'We represent independent artists and would like to...', assigned: 'Arjun Bainsla', status: 'Open', date: 'May 21, 2024 10:18 AM' },
    { name: 'Deepak Joshi', email: 'deepak.joshi@devmedia.in', type: 'CMS / Distribution', msg: 'Need assistance with content upload and distribution on...', assigned: 'Sneha Rathi', status: 'In Progress', date: 'May 20, 2024 06:42 PM' },
    { name: 'Kavita Patel', email: 'kavita.patel@live.com', type: 'General Contact', msg: 'Huge fan of your music! Just wanted to appreciate your work.', assigned: 'Vikram Singh', status: 'Resolved', date: 'May 20, 2024 03:11 PM' }
  ],
  licensing: [
    { id: 'LIC-2024-128', client: 'Saregama India Ltd.', song: 'Shyam Teri Bansi Pagaal Kar...', type: 'Synchronization', usage: 'Music Video', territory: 'Worldwide', status: 'Under Review', assigned: 'Rashmi Nishad', date: '12 May 2024' },
    { id: 'LIC-2024-127', client: 'Zee Entertainment', song: 'Radha Rani Meri Hai', type: 'Broadcast', usage: 'TV Program', territory: 'India', status: 'In Discussion', assigned: 'DG Mawai', date: '11 May 2024' },
    { id: 'LIC-2024-126', client: 'Times Music', song: 'Hanuman Chalisa', type: 'Digital', usage: 'YouTube', territory: 'Worldwide', status: 'Approved', assigned: 'Ajeet Bainsla', date: '10 May 2024' },
    { id: 'LIC-2024-125', client: 'Sony Music India', song: 'Ram Naam Ki Mahima', type: 'Synchronization', usage: 'Film', territory: 'India', status: 'Approval Pending', assigned: 'Bhumika Sharma', date: '09 May 2024' },
    { id: 'LIC-2024-124', client: 'Spiritual TV', song: 'Shyam Teri Bansi Pagaal Kar...', type: 'Broadcast', usage: 'TV Channel', territory: 'India', status: 'License Issued', assigned: 'Rashmi Nishad', date: '08 May 2024' }
  ],
  categories: [
    { name: 'Krishna Bhajan', count: 128 },
    { name: 'Radha Bhajan', count: 102 },
    { name: 'Hanuman Bhajan', count: 96 },
    { name: 'Ram Bhajan', count: 88 },
    { name: 'Shiv Bhajan', count: 74 },
    { name: 'Gurjar Rasiya', count: 111 },
    { name: 'DJ Rasiya', count: 67 },
    { name: 'Folk Songs', count: 139 }
  ],
  platforms: [
    { name: 'YouTube', pct: 98, del: '128 / 131', status: 'Delivered' },
    { name: 'Spotify', pct: 96, del: '125 / 131', status: 'Delivered' },
    { name: 'JioSaavn', pct: 95, del: '124 / 131', status: 'Delivered' },
    { name: 'Apple Music', pct: 93, del: '122 / 131', status: 'Delivered' },
    { name: 'Amazon Music', pct: 90, del: '118 / 131', status: 'Delivered' },
    { name: 'Wynk Music', pct: 85, del: '117 / 131', status: 'In Progress' },
    { name: 'Hungama', pct: 85, del: '111 / 131', status: 'In Progress' },
    { name: 'Resso', pct: 82, del: '107 / 131', status: 'In Progress' }
  ]
};

/* ═══ LOAD DATA ═══ */
function loadDashboardData() {
  loadRecentReleases();
  loadDashArtists();
  loadDashInquiries();
  loadArtistsGrid();
  loadReleasesTable();
  loadVideoTable();
  loadCatalogueTable();
  loadBannerTable();
  loadInquiryTable();
  loadLicensingTable();
  loadCategoryGrid();
  loadPlatformStatus();
  loadReleaseQueue();
  loadUploadChecklist();
  loadDistTable();
  loadTopSongs();
  loadTopVideos();
  loadTopLocations();
  loadPlaylistList();
}

function loadRecentReleases() {
  const tbody = document.getElementById('recentReleases');
  if (!tbody) return;
  tbody.innerHTML = DATA.releases.slice(0, 5).map((r, i) => `
    <tr><td>${i + 1}</td><td><div style="display:flex;align-items:center;gap:8px"><img src="${r.img}" style="width:32px;height:32px;border-radius:6px;object-fit:cover"><div><strong>${r.title}</strong><br><small style="color:#888">${r.sub}</small></div></div></td><td>${r.artist}</td><td>${r.date}</td><td><span class="status status-${r.status.toLowerCase()}">${r.status}</span></td><td><span style="color:#dc2626">▶</span> <span style="color:#22c55e">●</span> <span style="color:#e57e25">●</span></td></tr>
  `).join('');
}

function loadDashArtists() {
  const el = document.getElementById('dashArtists');
  if (!el) return;
  el.innerHTML = DATA.artists.slice(0, 4).map(a => `
    <div class="artist-sm"><div class="artist-sm-img"><img src="${a.img}" alt="${a.name}"></div><div class="artist-sm-name">${a.name}</div><div class="artist-sm-role">${a.role}</div></div>
  `).join('');
}

function loadDashInquiries() {
  const el = document.getElementById('dashInquiries');
  if (!el) return;
  const colors = ['#dc2626', '#3b82f6', '#22c55e', '#a855f7', '#eab308'];
  el.innerHTML = DATA.inquiries.slice(0, 5).map((inq, i) => `
    <div class="inq-item"><div class="inq-avatar" style="background:${colors[i % colors.length]}">${inq.name.split(' ').map(n => n[0]).join('')}</div><div class="inq-info"><div class="inq-name">${inq.name}</div><div class="inq-type">${inq.type}</div></div><div class="inq-time">${inq.date.split(',')[0].split(' ').slice(0, 2).join(' ')}</div>${inq.status === 'Open' ? '<span class="inq-badge">New</span>' : ''}</div>
  `).join('');
}

function loadArtistsGrid() {
  const el = document.getElementById('artistsGrid');
  if (!el) return;
  el.innerHTML = DATA.artists.map(a => `
    <div class="artist-card">
      ${a.featured ? '<span class="artist-badge">FEATURED</span>' : ''}
      <div class="artist-avatar"><img src="${a.img}" alt="${a.name}"></div>
      <div class="artist-name">${a.name}</div>
      <div class="artist-role">${a.role}</div>
      <div class="artist-genre">${a.genre}</div>
      <div class="artist-desc">${a.desc}</div>
      <div class="artist-contact">📞 ${a.phone}<br>✉️ ${a.email}</div>
      <div class="artist-social"><a href="#" class="social-yt" style="width:24px;height:24px;font-size:8px">YT</a><a href="#" class="social-ig" style="width:24px;height:24px;font-size:8px">IG</a><a href="#" class="social-fb" style="width:24px;height:24px;font-size:8px">FB</a><a href="#" style="background:#22c55e;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:700">SP</a></div>
      <div class="artist-songs"><h5>Top Songs</h5>${a.songs.map(s => `<p>🎵 ${s}</p>`).join('')}</div>
    </div>
  `).join('');
}

function loadReleasesTable() {
  const tbody = document.getElementById('releasesTable');
  if (!tbody) return;
  tbody.innerHTML = DATA.releases.map(r => `
    <tr><td><img src="${r.img}" style="width:40px;height:40px;border-radius:6px;object-fit:cover"></td><td><strong>${r.title}</strong><br><small style="color:#888">${r.sub}</small></td><td>${r.artist}</td><td>${r.date}</td><td><span class="status status-${r.status.toLowerCase()}">${r.status}</span></td><td><span style="color:#dc2626">▶</span> <span style="color:#22c55e">●</span> <span style="color:#e57e25">●</span> +2</td><td><button class="btn-icon">✏️</button> <button class="btn-icon">🗑️</button></td></tr>
  `).join('');
}

function loadVideoTable() {
  const tbody = document.getElementById('videoTable');
  if (!tbody) return;
  tbody.innerHTML = DATA.videos.map((v, i) => `
    <tr><td>${i + 1}</td><td><img src="${v.img}" style="width:80px;height:45px;border-radius:6px;object-fit:cover"></td><td><strong>${v.title}</strong><br><small style="color:#888">${v.sub}</small></td><td>${v.cat}</td><td>${v.dur}</td><td>${v.views}</td><td>${v.date}</td><td><span class="status status-${v.status.toLowerCase()}">● ${v.status}</span></td><td><button class="btn-icon">👁️</button> <button class="btn-icon">✏️</button> <button class="btn-icon">⋮</button></td></tr>
  `).join('');
}

function loadCatalogueTable() {
  const tbody = document.getElementById('catalogueTable');
  if (!tbody) return;
  tbody.innerHTML = DATA.catalogue.map((c, i) => `
    <tr><td>${i + 1}</td><td><div style="display:flex;align-items:center;gap:8px"><img src="${c.img}" style="width:40px;height:40px;border-radius:6px;object-fit:cover"><div><strong>${c.title}</strong><br><small style="color:#888">${c.sub}</small></div></div></td><td>${c.artist}<br><small style="color:#888">${c.label}</small></td><td>${c.album}</td><td>${c.dur}</td><td><span style="color:#dc2626">▶</span> <span style="color:#22c55e">●</span> <span style="color:#e57e25">●</span> +2</td><td><span class="status status-${c.status.toLowerCase()}">● ${c.status}</span></td><td><button class="btn-icon">✏️</button> <button class="btn-icon">📊</button> <button class="btn-icon">⋮</button></td></tr>
  `).join('');
}

function loadBannerTable() {
  const tbody = document.getElementById('bannerTable');
  if (!tbody) return;
  const banners = [
    { title: 'Krishna Flute Devotiona...', status: 'Active', schedule: '01 May 2024 - 31 Dec 2024' },
    { title: 'Radha Krishna Bhakti', status: 'Scheduled', schedule: '01 Jan 2025 - 30 Apr 2025' },
    { title: 'Devotional Bhajans', status: 'Inactive', schedule: '01 Jan 2024 - 30 Apr 2024' },
    { title: 'Rasiya Music Collection', status: 'Inactive', schedule: '01 Sep 2023 - 31 Dec 2023' },
    { title: 'Bainsla Music Artists', status: 'Inactive', schedule: '01 Jun 2023 - 31 Aug 2023' }
  ];
  tbody.innerHTML = banners.map((b, i) => `
    <tr><td>${i + 1}</td><td><div style="width:60px;height:35px;background:#1a1a0a;border-radius:4px"></div></td><td>${b.title}</td><td><span class="status status-${b.status.toLowerCase()}">${b.status}</span></td><td>${b.schedule}</td><td><button class="btn-icon">✏️</button> <button class="btn-icon">📋</button> <button class="btn-icon">👁️</button> <button class="btn-icon">🗑️</button></td></tr>
  `).join('');
}

function loadInquiryTable() {
  const tbody = document.getElementById('inquiryTable');
  if (!tbody) return;
  const typeColors = { 'Licensing': '#22c55e', 'Collaboration': '#3b82f6', 'CMS / Distribution': '#a855f7', 'General Contact': '#888' };
  tbody.innerHTML = DATA.inquiries.map(inq => `
    <tr><td>${inq.name}</td><td style="font-size:11px;color:#888">${inq.email}</td><td><span style="background:${typeColors[inq.type] || '#888'}22;color:${typeColors[inq.type] || '#888'};padding:2px 8px;border-radius:4px;font-size:10px">${inq.type}</span></td><td style="font-size:11px;color:#888;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inq.msg}</td><td style="font-size:11px">${inq.assigned}</td><td><span style="color:${inq.status === 'Open' ? '#22c55e' : inq.status === 'In Progress' ? '#eab308' : '#888'}">● ${inq.status}</span></td><td style="font-size:10px;color:#888">${inq.date}</td><td><button class="btn-outline btn-sm" onclick="viewInquiry('${inq.name}')">Reply</button></td></tr>
  `).join('');
}

function loadLicensingTable() {
  const tbody = document.getElementById('licensingTable');
  if (!tbody) return;
  const statusMap = { 'Under Review': 'review', 'In Discussion': 'discussion', 'Approved': 'approved', 'Approval Pending': 'pending', 'License Issued': 'issued' };
  tbody.innerHTML = DATA.licensing.map(l => `
    <tr><td>${l.id}</td><td>${l.client}</td><td>${l.song}</td><td>${l.type}</td><td>${l.usage}</td><td>${l.territory}</td><td><span class="status status-${statusMap[l.status] || ''}">${l.status}</span></td><td>${l.assigned}</td><td>${l.date}</td><td><button class="btn-icon">👁️</button></td></tr>
  `).join('');
}

function loadCategoryGrid() {
  const el = document.getElementById('categoryGrid');
  if (!el) return;
  el.innerHTML = DATA.categories.map(c => `
    <div class="cat-item"><div class="cat-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div><span class="cat-name">${c.name}</span><span class="cat-count">${c.count}</span></div>
  `).join('');
}

function loadPlatformStatus() {
  const el = document.getElementById('platformStatus');
  if (!el) return;
  el.innerHTML = DATA.platforms.map(p => `
    <div class="platform-item"><span class="platform-name">${p.name}</span><span class="platform-pct">${p.pct}%</span><span style="font-size:10px;color:#888">${p.del}</span><span class="platform-status ${p.status === 'Delivered' ? 'status-delivered' : 'status-progress'}">${p.status}</span></div>
  `).join('');
}

function loadReleaseQueue() {
  const el = document.getElementById('releaseQueue');
  if (!el) return;
  const queue = [
    { title: 'Radha Rani Meri Hai', artist: 'Bainsla Music', priority: 'High', date: 'May 25, 2024', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' },
    { title: 'Shyam Teri Bansi', artist: 'Bainsla Music', priority: 'Medium', date: 'May 26, 2024', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'Hanuman Chalisa (New)', artist: 'Bainsla Music', priority: 'Medium', date: 'May 27, 2024', img: 'https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg' },
    { title: 'Gurjar Rasiya 2024', artist: 'Bainsla Music', priority: 'Low', date: 'May 28, 2024', img: 'https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg' },
    { title: 'Ram Naam Ki Mahima', artist: 'Bainsla Music', priority: 'Low', date: 'May 30, 2024', img: 'https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg' }
  ];
  el.innerHTML = queue.map(q => `
    <div class="queue-item"><div class="queue-thumb"><img src="${q.img}" alt="${q.title}"></div><div class="queue-info"><div class="queue-title">${q.title}</div><div class="queue-artist">${q.artist}</div></div><span class="queue-priority priority-${q.priority.toLowerCase()}">${q.priority} Priority</span><span style="font-size:10px;color:#888">Scheduled<br>${q.date}</span></div>
  `).join('');
}

function loadUploadChecklist() {
  const el = document.getElementById('uploadChecklist');
  if (!el) return;
  const items = [
    { name: 'Audio Files', done: 15, total: 15 },
    { name: 'Artwork', done: 15, total: 15 },
    { name: 'Metadata', done: 13, total: 15 },
    { name: 'ISRC Codes', done: 15, total: 15 },
    { name: 'Permissions', done: 10, total: 15 },
    { name: 'Release Notes', done: 15, total: 15 }
  ];
  el.innerHTML = `<div style="text-align:center;margin-bottom:16px"><div style="font-size:36px;font-weight:800">80%</div><div style="font-size:11px;color:#888">Overall Progress</div></div>` + items.map(item => `
    <div class="checklist-item"><span class="${item.done === item.total ? 'check' : 'pending'}">${item.done === item.total ? '✅' : '⬜'}</span><span>${item.name}</span><span class="checklist-val">${item.done} / ${item.total}</span></div>
  `).join('');
}

function loadDistTable() {
  const tbody = document.getElementById('distTable');
  if (!tbody) return;
  const dist = [
    { title: 'Shyam Teri Bansi', artist: 'Bainsla Music', date: 'May 20, 2024', status: 'Delivered', pct: 100, earnings: '₹48,750' },
    { title: 'Radha Rani Meri Hai', artist: 'Bainsla Music', date: 'May 18, 2024', status: 'Delivered', pct: 100, earnings: '₹37,620' },
    { title: 'Hanuman Chalisa', artist: 'Bainsla Music', date: 'May 15, 2024', status: 'Delivered', pct: 100, earnings: '₹28,450' },
    { title: 'Ram Naam Ki Mahima', artist: 'Bainsla Music', date: 'May 10, 2024', status: 'Partially Delivered', pct: 85, earnings: '₹18,780' },
    { title: 'Gurjar Rasiya 2024', artist: 'Bainsla Music', date: 'May 05, 2024', status: 'In Progress', pct: 60, earnings: '₹12,340' }
  ];
  tbody.innerHTML = dist.map((d, i) => `
    <tr><td>${i + 1}</td><td>${d.title}</td><td>${d.artist}</td><td><span style="color:#dc2626">▶</span> <span style="color:#22c55e">●</span> <span style="color:#e57e25">●</span> +7</td><td>${d.date}</td><td><span class="status ${d.status === 'Delivered' ? 'status-delivered' : d.status === 'In Progress' ? 'status-progress' : 'status-discussion'}">${d.status}</span></td><td>${d.pct}%</td><td>${d.earnings}</td><td><button class="btn-icon">👁️</button> <button class="btn-icon">⬇️</button></td></tr>
  `).join('');
}

function loadTopSongs() {
  const el = document.getElementById('topSongs');
  if (!el) return;
  const songs = [
    { title: 'Shyam Teri Bansi Pagaal Kar Jaati Hai', sub: 'Bainsla Music', val: '1.24M' },
    { title: 'Radha Rani Meri Hai', sub: 'Bainsla Music', val: '1.08M' },
    { title: 'Hanuman Chalisa', sub: 'Bainsla Music', val: '985K' },
    { title: 'Ram Naam Ki Mahima', sub: 'Bainsla Music', val: '842K' },
    { title: 'Gurjar Rasiya', sub: 'Bainsla Music', val: '764K' }
  ];
  el.innerHTML = songs.map((s, i) => `<div class="top-item"><span class="top-rank">${i + 1}</span><div class="top-info"><div class="top-title">${s.title}</div><div class="top-sub">${s.sub}</div></div><span class="top-value">${s.val}</span></div>`).join('');
}

function loadTopVideos() {
  const el = document.getElementById('topVideos');
  if (!el) return;
  const vids = [
    { title: 'Shyam Teri Bansi Pagaal Kar Jaati Hai', sub: 'Bainsla Music', val: '2.45M' },
    { title: 'Radha Rani Meri Hai', sub: 'Bainsla Music', val: '2.12M' },
    { title: 'Hanuman Chalisa', sub: 'Bainsla Music', val: '1.78M' },
    { title: 'Ram Naam Ki Mahima', sub: 'Bainsla Music', val: '1.45M' },
    { title: 'DJ Rasiya 2024', sub: 'Bainsla Music', val: '1.10M' }
  ];
  el.innerHTML = vids.map((v, i) => `<div class="top-item"><span class="top-rank">${i + 1}</span><div class="top-info"><div class="top-title">${v.title}</div><div class="top-sub">${v.sub}</div></div><span class="top-value">${v.val}</span></div>`).join('');
}

function loadTopLocations() {
  const el = document.getElementById('topLocations');
  if (!el) return;
  const locs = [
    { name: 'India', pct: '78.6%' },
    { name: 'United States', pct: '6.4%' },
    { name: 'Nepal', pct: '3.2%' },
    { name: 'United Arab Emirates', pct: '2.1%' },
    { name: 'United Kingdom', pct: '1.7%' },
    { name: 'Others', pct: '8.0%' }
  ];
  el.innerHTML = locs.map((l, i) => `<div class="top-item"><span class="top-rank">${i + 1}</span><div class="top-info"><div class="top-title">${l.name}</div></div><span class="top-value">${l.pct}</span></div>`).join('');
}

function loadPlaylistList() {
  const el = document.getElementById('playlistList');
  if (!el) return;
  const playlists = [
    { title: 'Top Krishna Bhajans', count: '25 Songs', img: 'https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg' },
    { title: 'Radha Rani Special', count: '18 Songs', img: 'https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg' },
    { title: 'Hanuman Chalisa Collection', count: '20 Songs', img: 'https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg' },
    { title: 'Top Gurjar Rasiya', count: '30 Songs', img: 'https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg' }
  ];
  el.innerHTML = playlists.map(p => `
    <div class="pl-item"><div class="pl-thumb"><img src="${p.img}" alt="${p.title}"></div><div class="pl-info"><div class="pl-title">${p.title}</div><div class="pl-count">${p.count}</div></div><button class="btn-icon">▶</button><button class="btn-icon">✏️</button><button class="btn-icon">⋮</button></div>
  `).join('');
}

/* ═══ ACTIONS ═══ */
function viewInquiry(name) {
  const inq = DATA.inquiries.find(i => i.name === name);
  if (!inq) return;
  const el = document.getElementById('inquiryDetail');
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><div class="inq-avatar" style="background:var(--gold);width:48px;height:48px;font-size:16px">${inq.name.split(' ').map(n => n[0]).join('')}</div><div><strong style="font-size:15px">${inq.name}</strong> <span class="status status-${inq.type.toLowerCase().replace(/[^a-z]/g, '')}">${inq.type}</span><br><span style="font-size:11px;color:#888">${inq.email}<br>${inq.date}</span></div></div>
    <div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:16px"><p style="font-size:13px;color:#ccc">${inq.msg}</p></div>
    <h4 style="font-size:12px;color:var(--gold);margin-bottom:8px">REPLY MESSAGE</h4>
    <textarea rows="4" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:12px" placeholder="Type your reply here..."></textarea>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn-outline btn-sm">SAVE DRAFT</button><button class="btn-primary btn-sm">SEND REPLY</button></div>
  `;
}

function saveBanner() { alert('Banner settings saved!'); }
function addBanner() { alert('Add new banner'); }
function showAddArtist() { alert('Add new artist form'); }
function saveSettings() { alert('Settings saved successfully!'); }
function saveAllSettings() { alert('All settings saved!'); }

/* ═══ INIT ═══ */
checkAuth();
