/**
 * detail-panel.js — Show/hide biographical detail panel
 */

const panel = () => document.getElementById('detail-panel');
const closeBtn = () => document.getElementById('detail-close');

let isOpen = false;

export function initDetailPanel() {
  closeBtn()?.addEventListener('click', hideDetail);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) hideDetail();
  });
}

export function showDetail(hero) {
  const p = panel();
  if (!p) return;

  document.getElementById('detail-name').textContent = hero.name;
  document.getElementById('detail-rank').textContent = hero.rank;
  document.getElementById('detail-branch').textContent = hero.branch;
  document.getElementById('detail-unit').textContent = hero.unit;
  document.getElementById('detail-conflict').textContent = hero.conflict;
  document.getElementById('detail-date').textContent = formatDate(hero.date_of_death);
  document.getElementById('detail-age').textContent = hero.age;
  document.getElementById('detail-hometown').textContent = hero.hometown;
  document.getElementById('detail-description').textContent = hero.description;

  p.classList.remove('hidden');
  p.classList.add('visible');
  isOpen = true;

  // Hide hint after first interaction
  const hint = document.getElementById('hint');
  if (hint) hint.classList.add('hidden');
}

export function hideDetail() {
  const p = panel();
  if (!p) return;

  p.classList.remove('visible');
  p.classList.add('hidden');
  isOpen = false;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
