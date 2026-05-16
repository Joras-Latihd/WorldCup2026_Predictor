/* ═══════════════════════════════════════════════════════════
   FIFA WC 2026 — Prediction Showdown
   app.js — Full application logic + localStorage
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── Storage keys ── */
const LS_KEY = 'wc2026_predictions_v2';
const LS_PARTICIPANTS_KEY = 'wc2026_participants_v1';

/* ── Default participants (fallback if nothing in localStorage) ── */
const DEFAULT_PARTICIPANTS = [
  { key: 'saroj', label: 'Saroj', fullName: 'Saroj Dhital',   avatar: 'SA', color: '#22d3ee' },
  { key: 'rijan', label: 'Rijan', fullName: 'Rijan Maharjan', avatar: 'RI', color: '#a78bfa' },
  { key: 'rahul', label: 'Rahul', fullName: 'Rahul Adhikari', avatar: 'RA', color: '#fb923c' },
];

/* ── PARTICIPANTS — loaded live from localStorage ── */
function loadParticipants() {
  try {
    const raw = localStorage.getItem(LS_PARTICIPANTS_KEY);
    if (!raw) return DEFAULT_PARTICIPANTS.map(p => ({ ...p }));
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PARTICIPANTS.map(p => ({ ...p }));
  } catch { return DEFAULT_PARTICIPANTS.map(p => ({ ...p })); }
}

function saveParticipants(list) {
  localStorage.setItem(LS_PARTICIPANTS_KEY, JSON.stringify(list));
}

/* ── Live reference — always call PARTICIPANTS() to get current list ── */
let PARTICIPANTS = loadParticipants();

/* ── Field definitions ── */
const AWARDS_FIELDS = [
  { key: 'goldenBall',  label: 'Golden Ball',        desc: 'Best player of the tournament',  icon: '⚽', bg: 'rgba(251,191,36,0.12)', iconColor: '#fbbf24' },
  { key: 'goldenBoot',  label: 'Golden Boot',        desc: 'Top scorer',                     icon: '👟', bg: 'rgba(34,211,238,0.10)', iconColor: '#22d3ee' },
  { key: 'topAssister', label: 'Top Assister',       desc: 'Most assists in the tournament',  icon: '🎯', bg: 'rgba(167,139,250,0.10)', iconColor: '#a78bfa' },
  { key: 'goldenGlove', label: 'Golden Glove',       desc: 'Best goalkeeper',                icon: '🧤', bg: 'rgba(74,222,128,0.10)',  iconColor: '#4ade80' },
  { key: 'youngPlayer', label: 'Young Player Award', desc: 'Best U-21 player',               icon: '⭐', bg: 'rgba(251,146,60,0.10)',  iconColor: '#fb923c' },
];

const NARRATIVE_FIELDS = [
  { key: 'darkHorse',   label: 'The Dark Horse',          desc: 'Deepest underdog run',       icon: '🐴', bg: 'rgba(167,139,250,0.10)', iconColor: '#a78bfa' },
  { key: 'biggestFlop', label: 'The Biggest Flop',        desc: 'Giant exits group stage',    icon: '💀', bg: 'rgba(239,68,68,0.10)',   iconColor: '#f87171' },
  { key: 'hostNation',  label: 'Host Nation Performance', desc: 'USA / Mexico / Canada',      icon: '🏟️', bg: 'rgba(34,211,238,0.10)',  iconColor: '#22d3ee' },
  { key: 'hotTake',     label: 'Boldest / Hot Take',      desc: 'The spiciest prediction',    icon: '🔥', bg: 'rgba(251,146,60,0.10)',  iconColor: '#fb923c' },
];

const BRACKET_FIELDS = [
  { key: 'sf1',         label: 'Semi-Final 1', desc: 'SF1 - pick a winner', icon: '⚔️', bg: 'rgba(34,211,238,0.08)',  iconColor: '#22d3ee', group: 'semis' },
  { key: 'sf2',         label: 'Semi-Final 2', desc: 'SF2 - pick a winner', icon: '⚔️', bg: 'rgba(34,211,238,0.08)',  iconColor: '#22d3ee', group: 'semis' },
  { key: 'sf3',         label: 'Semi-Final 3', desc: 'SF3 - pick a winner', icon: '⚔️', bg: 'rgba(167,139,250,0.08)', iconColor: '#a78bfa', group: 'semis2' },
  { key: 'sf4',         label: 'Semi-Final 4', desc: 'SF4 - pick a winner', icon: '⚔️', bg: 'rgba(167,139,250,0.08)', iconColor: '#a78bfa', group: 'semis2' },
  { key: 'grandFinale', label: 'Grand Finale', desc: 'The Final match',      icon: '🏆', bg: 'rgba(251,191,36,0.10)',  iconColor: '#fbbf24', group: 'final' },
  { key: 'champions',   label: '🏆 Champions', desc: 'World Cup winners',    icon: '👑', bg: 'rgba(251,191,36,0.15)',  iconColor: '#fbbf24', group: 'champion', isChampion: true },
];

/* ── Default state — dynamic per current participants ── */
function defaultState() {
  const base = {};
  [...AWARDS_FIELDS, ...NARRATIVE_FIELDS, ...BRACKET_FIELDS].forEach(f => {
    base[f.key] = {};
    PARTICIPANTS.forEach(p => { base[f.key][p.key] = ''; });
  });
  base.lastUpdated = '';
  return base;
}

/* ── Storage helpers ── */
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch { return defaultState(); }
}

function saveState(state) {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) { console.error('Storage error:', e); }
}

/* ── App state ── */
let state = loadState();

/* ═══════════════════════════════════
   PARTICLES BACKGROUND
   ═══════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.25,
    dy: (Math.random() - 0.5) * 0.25,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,211,238,${p.opacity})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════
   TOAST
   ═══════════════════════════════════ */
let toastTimer;
function showToast(msg, type = 'default') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 2800);
}

/* ═══════════════════════════════════
   HERO PARTICIPANTS CHIPS
   ═══════════════════════════════════ */
function renderHeroChips() {
  const el = document.getElementById('heroParticipants');
  if (!el) return;
  el.innerHTML = PARTICIPANTS.map(p => `
    <div class="participant-chip">
      <span class="participant-avatar" style="background:${p.color};">${p.avatar}</span>
      <span>${p.fullName || p.label}</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════
   RENDER HELPERS
   ═══════════════════════════════════ */
function participantRow(fieldKey, participant) {
  const val = (state[fieldKey] || {})[participant.key] || '';
  const hasVal = val.trim() !== '';
  return `
    <div class="participant-row ${hasVal ? 'has-value' : ''}" data-field="${fieldKey}" data-p="${participant.key}">
      <span class="p-avatar" style="background:${participant.color};">${participant.avatar}</span>
      <span class="p-name" style="color:${participant.color};">${participant.label}</span>
      <span class="p-value ${hasVal ? '' : 'empty'}">${hasVal ? val : 'Not set'}</span>
      <button class="p-edit-btn" title="Quick edit" onclick="quickEdit('${fieldKey}','${participant.key}',this)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
    </div>`;
}

function predCard(field, section) {
  const isChamp = field.isChampion;
  const num = section.indexOf(field) + 1;
  return `
    <div class="pred-card ${isChamp ? 'champion-card' : ''}">
      <div class="card-num-badge">${String(num).padStart(2,'0')}</div>
      ${isChamp ? `<div style="padding:16px 20px 0;"><span class="crown-badge">World Cup Winner</span></div>` : ''}
      <div class="pred-card-header">
        <div class="pred-card-icon" style="background:${field.bg};">
          <span style="font-size:18px;">${field.icon}</span>
        </div>
        <div>
          <div class="pred-card-label">${field.label}</div>
          <div class="pred-card-desc">${field.desc}</div>
        </div>
      </div>
      <div class="pred-card-body">
        ${PARTICIPANTS.map(p => participantRow(field.key, p)).join('')}
      </div>
    </div>`;
}

function renderAwards() {
  document.getElementById('awardsGrid').innerHTML =
    AWARDS_FIELDS.map(f => predCard(f, AWARDS_FIELDS)).join('');
}

function renderNarratives() {
  document.getElementById('narrativesGrid').innerHTML =
    NARRATIVE_FIELDS.map(f => predCard(f, NARRATIVE_FIELDS)).join('');
}

function renderBracket() {
  const container = document.getElementById('bracketGrid');
  const semis1 = BRACKET_FIELDS.filter(f => f.group === 'semis');
  const semis2 = BRACKET_FIELDS.filter(f => f.group === 'semis2');
  const final  = BRACKET_FIELDS.filter(f => f.group === 'final');
  const champ  = BRACKET_FIELDS.filter(f => f.group === 'champion');

  container.innerHTML = `
    <div class="bracket-divider"><div class="bracket-divider-line"></div><span class="bracket-divider-label">Semi-Finals (Group 1)</span><div class="bracket-divider-line"></div></div>
    <div class="bracket-row semis">${semis1.map(f => predCard(f, BRACKET_FIELDS)).join('')}</div>
    <div class="bracket-divider"><div class="bracket-divider-line"></div><span class="bracket-divider-label">Semi-Finals (Group 2)</span><div class="bracket-divider-line"></div></div>
    <div class="bracket-row semis">${semis2.map(f => predCard(f, BRACKET_FIELDS)).join('')}</div>
    <div class="bracket-divider"><div class="bracket-divider-line"></div><span class="bracket-divider-label">Grand Finale</span><div class="bracket-divider-line"></div></div>
    <div class="bracket-row finals">${final.map(f => predCard(f, BRACKET_FIELDS)).join('')}</div>
    <div class="bracket-divider"><div class="bracket-divider-line"></div><span class="bracket-divider-label" style="color:#fbbf24;">🏆 Champions</span><div class="bracket-divider-line"></div></div>
    <div class="bracket-row champion">${champ.map(f => predCard(f, BRACKET_FIELDS)).join('')}</div>
  `;
}

function renderAll() {
  renderHeroChips();
  renderAwards();
  renderNarratives();
  renderBracket();
}

/* ═══════════════════════════════════
   QUICK EDIT
   ═══════════════════════════════════ */
window.quickEdit = function(fieldKey, participantKey, btn) {
  const row = btn.closest('.participant-row');
  const valEl = row.querySelector('.p-value');
  const currentVal = (state[fieldKey] || {})[participantKey] || '';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentVal;
  input.style.cssText = `flex:1;background:transparent;border:none;outline:none;color:#f1f5f9;font-size:14px;font-weight:600;font-family:inherit;border-bottom:1px solid rgba(34,211,238,0.5);padding-bottom:2px;`;

  valEl.replaceWith(input);
  input.focus();
  btn.style.display = 'none';

  function commit() {
    const newVal = input.value.trim();
    if (!state[fieldKey]) state[fieldKey] = {};
    state[fieldKey][participantKey] = newVal;
    saveState(state);
    renderAll();
    syncAdminForms();
    if (newVal) showToast(`Saved: ${newVal}`, 'success');
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { renderAll(); }
  });
  input.addEventListener('blur', commit);
};

/* ═══════════════════════════════════
   ADMIN PANEL — PREDICTION FORMS
   ═══════════════════════════════════ */
function buildAdminField(field) {
  const val = state[field.key] || {};
  return `
    <div class="admin-field">
      <div class="admin-field-label">
        <span style="font-size:18px;">${field.icon}</span>
        <span class="admin-field-label-text">${field.label}</span>
        <span class="admin-field-label-desc">${field.desc}</span>
      </div>
      <div class="admin-participants-row">
        ${PARTICIPANTS.map(p => `
          <div class="admin-participant-input">
            <div class="admin-p-label" style="color:${p.color};">
              <span class="admin-p-dot" style="background:${p.color};"></span>
              ${p.label}
            </div>
            <input
              class="admin-input"
              type="text"
              data-field="${field.key}"
              data-p="${p.key}"
              value="${(val[p.key] || '').replace(/"/g, '&quot;')}"
              placeholder="Enter prediction..."
            />
          </div>
        `).join('')}
      </div>
    </div>`;
}

/* ═══════════════════════════════════
   ADMIN PANEL — PARTICIPANTS MANAGER
   ═══════════════════════════════════ */
function buildParticipantsAdmin() {
  return `
    <div class="admin-form-section" id="participants-admin">

      <div class="pm-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.6;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Add or remove participants. Changes apply instantly to all prediction cards.
      </div>

      <div class="pm-list" id="pmList"></div>

      <div class="pm-add-form" id="pmAddForm">
        <div class="pm-add-title">Add New Participant</div>
        <div class="pm-add-fields">
          <div class="pm-field-group">
            <label class="pm-label">Full Name</label>
            <input type="text" class="admin-input" id="pmFullName" placeholder="e.g. Aashish Pokhrel" maxlength="40" />
          </div>
          <div class="pm-field-group">
            <label class="pm-label">Short Label</label>
            <input type="text" class="admin-input" id="pmLabel" placeholder="e.g. Aashish" maxlength="12" />
          </div>
          <div class="pm-field-group">
            <label class="pm-label">Initials (2 chars)</label>
            <input type="text" class="admin-input" id="pmAvatar" placeholder="e.g. AP" maxlength="2" style="text-transform:uppercase;" />
          </div>
          <div class="pm-field-group">
            <label class="pm-label">Color</label>
            <div class="pm-color-row">
              <input type="color" class="pm-color-input" id="pmColor" value="#38bdf8" />
              <div class="pm-color-presets">
                <button class="pm-preset" style="background:#22d3ee;" data-color="#22d3ee" title="Cyan"></button>
                <button class="pm-preset" style="background:#a78bfa;" data-color="#a78bfa" title="Violet"></button>
                <button class="pm-preset" style="background:#fb923c;" data-color="#fb923c" title="Orange"></button>
                <button class="pm-preset" style="background:#4ade80;" data-color="#4ade80" title="Green"></button>
                <button class="pm-preset" style="background:#f472b6;" data-color="#f472b6" title="Pink"></button>
                <button class="pm-preset" style="background:#facc15;" data-color="#facc15" title="Yellow"></button>
                <button class="pm-preset" style="background:#f87171;" data-color="#f87171" title="Red"></button>
                <button class="pm-preset" style="background:#60a5fa;" data-color="#60a5fa" title="Blue"></button>
              </div>
            </div>
          </div>
        </div>
        <button class="pm-add-btn" id="pmAddBtn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Participant
        </button>
      </div>

    </div>`;
}

function renderPmList() {
  const list = document.getElementById('pmList');
  if (!list) return;

  if (PARTICIPANTS.length === 0) {
    list.innerHTML = `<div class="pm-empty">No participants yet. Add one below.</div>`;
    return;
  }

  list.innerHTML = PARTICIPANTS.map((p, i) => `
    <div class="pm-item" data-key="${p.key}">
      <span class="pm-item-avatar" style="background:${p.color};">${p.avatar}</span>
      <div class="pm-item-info">
        <span class="pm-item-name">${p.fullName || p.label}</span>
        <span class="pm-item-meta" style="color:${p.color};">${p.label} · ${p.avatar}</span>
      </div>
      <div class="pm-item-swatch" style="background:${p.color};" title="${p.color}"></div>
      ${PARTICIPANTS.length > 1
        ? `<button class="pm-remove-btn" onclick="removeParticipant('${p.key}')" title="Remove ${p.label}">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           </button>`
        : `<span class="pm-last-badge">Last</span>`
      }
    </div>
  `).join('');
}

window.removeParticipant = function(key) {
  if (PARTICIPANTS.length <= 1) { showToast('Need at least one participant.'); return; }
  const p = PARTICIPANTS.find(x => x.key === key);
  if (!confirm(`Remove ${p ? p.fullName || p.label : key}? Their predictions will be kept in storage but hidden.`)) return;

  PARTICIPANTS = PARTICIPANTS.filter(x => x.key !== key);
  saveParticipants(PARTICIPANTS);
  renderPmList();
  renderAll();
  showToast(`Removed ${p ? p.label : key}`, 'default');
};

function initParticipantsAdmin() {
  renderPmList();

  document.querySelectorAll('.pm-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('pmColor').value = btn.dataset.color;
    });
  });

  document.getElementById('pmLabel').addEventListener('input', function() {
    const av = document.getElementById('pmAvatar');
    if (!av.dataset.touched) {
      av.value = this.value.slice(0, 2).toUpperCase();
    }
  });

  document.getElementById('pmAvatar').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    this.dataset.touched = '1';
  });

  document.getElementById('pmAddBtn').addEventListener('click', () => {
    const fullName = document.getElementById('pmFullName').value.trim();
    const label    = document.getElementById('pmLabel').value.trim();
    const avatar   = document.getElementById('pmAvatar').value.trim().toUpperCase().slice(0, 2);
    const color    = document.getElementById('pmColor').value;

    if (!fullName) { showToast('Enter a full name.'); return; }
    if (!label)    { showToast('Enter a short label.'); return; }
    if (!avatar)   { showToast('Enter initials (2 chars).'); return; }

    const key = fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20)
              + '_' + Date.now().toString(36);

    const newP = { key, label, fullName, avatar, color };
    PARTICIPANTS = [...PARTICIPANTS, newP];
    saveParticipants(PARTICIPANTS);

    [...AWARDS_FIELDS, ...NARRATIVE_FIELDS, ...BRACKET_FIELDS].forEach(f => {
      if (!state[f.key]) state[f.key] = {};
      state[f.key][key] = '';
    });
    saveState(state);

    document.getElementById('pmFullName').value = '';
    document.getElementById('pmLabel').value = '';
    document.getElementById('pmAvatar').value = '';
    delete document.getElementById('pmAvatar').dataset.touched;
    document.getElementById('pmColor').value = '#38bdf8';

    renderPmList();
    renderAll();
    showToast(`Added ${label}!`, 'success');
  });
}

/* ═══════════════════════════════════
   BUILD ALL ADMIN FORMS
   ═══════════════════════════════════ */
function buildAdminForms() {
  const container = document.getElementById('adminForms');
  container.innerHTML = `
    <div class="admin-form-section active" id="awards-admin">
      ${AWARDS_FIELDS.map(buildAdminField).join('')}
    </div>
    <div class="admin-form-section" id="narratives-admin">
      ${NARRATIVE_FIELDS.map(buildAdminField).join('')}
    </div>
    <div class="admin-form-section" id="bracket-admin">
      ${BRACKET_FIELDS.map(buildAdminField).join('')}
    </div>
    ${buildParticipantsAdmin()}
  `;

  container.querySelectorAll('.admin-input[data-field]').forEach(input => {
    input.addEventListener('input', () => {
      const field = input.dataset.field;
      const p = input.dataset.p;
      if (!state[field]) state[field] = {};
      state[field][p] = input.value;
    });
  });

  initParticipantsAdmin();
}

function syncAdminForms() {
  document.querySelectorAll('.admin-input[data-field]').forEach(input => {
    const field = input.dataset.field;
    const p = input.dataset.p;
    if (state[field]) input.value = state[field][p] || '';
  });
}

/* ── Admin tabs ── */
function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-form-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.adminTab).classList.add('active');
    });
  });
}

/* ── Open / close admin ── */
function openAdmin() {
  buildAdminForms();
  initAdminTabs();
  document.getElementById('adminOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdmin() {
  document.getElementById('adminOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('adminToggleBtn').addEventListener('click', openAdmin);
document.getElementById('adminCloseBtn').addEventListener('click', closeAdmin);
document.getElementById('adminOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('adminOverlay')) closeAdmin();
});

/* ── Save all predictions ── */
document.getElementById('btnSaveAll').addEventListener('click', () => {
  document.querySelectorAll('.admin-input[data-field]').forEach(input => {
    const field = input.dataset.field;
    const p = input.dataset.p;
    if (!state[field]) state[field] = {};
    state[field][p] = input.value.trim();
  });
  saveState(state);
  renderAll();
  showToast('All predictions saved!', 'success');
  setTimeout(closeAdmin, 800);
});

/* ── Clear all ── */
document.getElementById('btnClearAll').addEventListener('click', () => {
  if (!confirm('Clear ALL predictions? This cannot be undone.')) return;
  state = defaultState();
  saveState(state);
  buildAdminForms();
  renderAll();
  showToast('All predictions cleared.');
});

/* ═══════════════════════════════════
   MAIN TAB NAV
   ═══════════════════════════════════ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ═══════════════════════════════════
   INIT
   ═══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  renderAll();

  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (state.lastUpdated) {
    const d = new Date(state.lastUpdated);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    showToast(`Predictions loaded — last updated ${label}`);
  }
});