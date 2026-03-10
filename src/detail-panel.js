/**
 * detail-panel.js — Full hero profile card with photo, awards, bio, and news
 */

let panelEl, nameEl, portraitEl, rankBranchEl, unitEl, statsEl, bioEl, awardsEl, newsLinkEl, memorialNoteEl, closeBtn;

export function initDetailPanel() {
  panelEl = document.getElementById('detail-panel');
  nameEl = document.getElementById('hero-name');
  portraitEl = document.getElementById('hero-portrait');
  rankBranchEl = document.getElementById('hero-rank-branch');
  unitEl = document.getElementById('hero-unit');
  statsEl = document.getElementById('hero-stats');
  bioEl = document.getElementById('hero-bio');
  awardsEl = document.getElementById('hero-awards');
  newsLinkEl = document.getElementById('hero-news-link');
  memorialNoteEl = document.getElementById('hero-memorial-note');
  closeBtn = document.getElementById('close-panel');

  closeBtn.addEventListener('click', hideDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideDetail();
  });
}

export function showDetail(hero) {
  nameEl.textContent = hero.name.toUpperCase();
  rankBranchEl.textContent = `${hero.rank} · ${hero.branch}`;
  unitEl.textContent = hero.unit;

  // Portrait
  portraitEl.src = `./portraits/${hero.photo_id}.png`;
  portraitEl.alt = `Tribute portrait for ${hero.name}`;

  // Stats grid
  const dateObj = new Date(hero.date_of_death + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  statsEl.innerHTML = `
    <div class="stat">
      <span class="stat-label">CONFLICT</span>
      <span class="stat-value">${hero.conflict}</span>
    </div>
    <div class="stat">
      <span class="stat-label">DATE</span>
      <span class="stat-value">${dateStr}</span>
    </div>
    <div class="stat">
      <span class="stat-label">AGE</span>
      <span class="stat-value">${hero.age}</span>
    </div>
    <div class="stat">
      <span class="stat-label">HOMETOWN</span>
      <span class="stat-value">${hero.hometown}</span>
    </div>
  `;

  // Bio
  bioEl.textContent = hero.description;

  // Awards
  if (hero.awards && hero.awards.length > 0) {
    awardsEl.innerHTML = '<h3 class="awards-title">Awards & Decorations</h3>' +
      hero.awards.map((a) => `<span class="award-badge">${a}</span>`).join('');
    awardsEl.style.display = 'block';
  } else {
    awardsEl.style.display = 'none';
  }

  // Memorial note
  if (hero.memorial_note) {
    memorialNoteEl.textContent = hero.memorial_note;
    memorialNoteEl.style.display = 'block';
  } else {
    memorialNoteEl.style.display = 'none';
  }

  // News link
  if (hero.news_url) {
    newsLinkEl.href = hero.news_url;
    newsLinkEl.style.display = 'inline-flex';
  } else {
    newsLinkEl.style.display = 'none';
  }

  panelEl.classList.remove('hidden');
  panelEl.classList.add('visible');
}

export function hideDetail() {
  panelEl.classList.remove('visible');
  panelEl.classList.add('hidden');
}
