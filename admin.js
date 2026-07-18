// ========================================
// GENOMA ADMIN DASHBOARD SCRIPT
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

// State management
let authEmail = sessionStorage.getItem('admin_email') || '';
let authPass = sessionStorage.getItem('admin_pass') || '';
let currentTab = 'dashboard';
let allLeads = [];
let allVisits = [];
let allSurveys = [];
let filteredLeads = [];
let leadsPage = 1;
const leadsPerPage = 15;

// Chart.js instances
let chartUtmSourceInstance = null;
let chartLandingInstance = null;

// ===== DOM INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkAuth();
});

// ===== AUTHENTICATED FETCH WRAPPER =====
async function dbFetch(path, options = {}) {
  const headers = Object.assign({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }, options.headers || {});

  // Pass admin credentials for verify/change endpoints or custom actions if needed
  const config = Object.assign({}, options, { headers });
  
  const res = await fetch(SUPABASE_URL + path, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error ${res.status}`);
  }
  return res.json();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Login Form
  document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);

  // Logout Button
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  // Tab Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      switchTab(tab);
    });
  });

  // Leads Filters
  document.getElementById('lead-search').addEventListener('input', handleFilterChange);
  document.getElementById('filter-landing').addEventListener('change', handleFilterChange);
  document.getElementById('filter-survey').addEventListener('change', handleFilterChange);

  // Leads Pagination
  document.getElementById('btn-prev-page').addEventListener('click', () => {
    if (leadsPage > 1) {
      leadsPage--;
      renderLeadsTable();
    }
  });
  document.getElementById('btn-next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
    if (leadsPage < totalPages) {
      leadsPage++;
      renderLeadsTable();
    }
  });

  // Modal Close
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('lead-modal').style.display = 'none';
  });

  // Export Buttons
  document.getElementById('btn-export-leads').addEventListener('click', exportLeadsCSV);
  document.getElementById('btn-export-surveys').addEventListener('click', exportSurveysCSV);

  // Settings Forms
  document.getElementById('settings-webhooks-form').addEventListener('submit', handleSaveWebhooks);
  document.getElementById('settings-password-form').addEventListener('submit', handleSavePassword);
}

// ===== AUTH CHECK =====
async function checkAuth() {
  if (authEmail && authPass) {
    try {
      const isValid = await verifyCredentials(authEmail, authPass);
      if (isValid) {
        showDashboard();
        return;
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  }
  showLoginForm();
}

async function verifyCredentials(email, password) {
  const result = await dbFetch('/rest/v1/rpc/verify_admin_user', {
    method: 'POST',
    body: JSON.stringify({ p_email: email, p_password: password })
  });
  return !!result;
}

function showLoginForm() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('dashboard-wrapper').style.display = 'none';
  document.body.style.background = '#0a0e13';
}

function showDashboard() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('dashboard-wrapper').style.display = 'flex';
  document.getElementById('user-display').textContent = authEmail;
  loadData();
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login-submit');
  const errorEl = document.getElementById('login-error');

  errorEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Verificando...';

  try {
    const isValid = await verifyCredentials(email, password);
    if (isValid) {
      authEmail = email;
      authPass = password;
      sessionStorage.setItem('admin_email', email);
      sessionStorage.setItem('admin_pass', password);
      showDashboard();
    } else {
      errorEl.style.display = 'block';
    }
  } catch (err) {
    console.error('Login error:', err);
    errorEl.textContent = 'Error de conexión con el servidor.';
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ingresar al Sistema';
  }
}

function handleLogout() {
  authEmail = '';
  authPass = '';
  sessionStorage.removeItem('admin_email');
  sessionStorage.removeItem('admin_pass');
  showLoginForm();
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tab}`);
  });
}

// ===== LOAD DATA FROM SUPABASE =====
async function loadData() {
  try {
    // 1. Fetch leads via secure admin RPC function
    allLeads = await dbFetch('/rest/v1/rpc/admin_get_leads', {
      method: 'POST',
      body: JSON.stringify({ p_email: authEmail, p_password: authPass })
    });
    
    // Process survey counts mapping (survey_responses count for each lead)
    // We will do this by looking up the responses locally since we retrieve both lists securely.
    
    // 2. Fetch page visits via secure admin RPC function
    allVisits = await dbFetch('/rest/v1/rpc/admin_get_pageviews', {
      method: 'POST',
      body: JSON.stringify({ p_email: authEmail, p_password: authPass })
    });

    // 3. Fetch surveys via secure admin RPC function
    allSurveys = await dbFetch('/rest/v1/rpc/admin_get_surveys', {
      method: 'POST',
      body: JSON.stringify({ p_email: authEmail, p_password: authPass })
    });

    // Match survey responses back to the lead objects in-memory for UI badges
    const surveyLeadIds = new Set(allSurveys.map(s => s.lead_id));
    allLeads.forEach(l => {
      l.survey_responses = surveyLeadIds.has(l.id) ? [{ id: true }] : [];
    });

    // Also link lead details to surveys in-memory since REST joined leads isn't directly returned by RPC
    allSurveys.forEach(s => {
      const parentLead = allLeads.find(l => l.id === s.lead_id);
      if (parentLead) {
        s.leads = {
          name: parentLead.name,
          email: parentLead.email
        };
      }
    });

    // Populate filters & build dashboard
    populateFilterOptions();
    buildAnalytics();
    buildLeadsTab();
    buildSurveysTab();
    buildSettingsTab();

  } catch (err) {
    console.error('Load data error:', err);
    alert('Error al descargar datos de Supabase. Revisa las políticas RLS o conexión.');
  }
}

// ===== ANALS & METRICS GENERATION =====
function buildAnalytics() {
  // We only count visits and leads after tracking was deployed (2026-07-18 05:00:00 UTC)
  // to avoid historic data skew (which results in unrealistic > 100% conversion rates).
  const TRACKING_START_TIME = new Date('2026-07-18T05:00:00Z').getTime();

  // KPIs
  const totalLeads = allLeads.length;
  const landingVisits = allVisits.filter(v => v.page === 'landing' && new Date(v.created_at).getTime() >= TRACKING_START_TIME);
  const uniqueVisitsCount = new Set(landingVisits.map(v => v.session_id)).size;
  const totalSurveys = allSurveys.length;

  document.getElementById('kpi-total-leads').textContent = totalLeads;
  document.getElementById('kpi-total-visits').textContent = uniqueVisitsCount;
  
  // Leads registered since tracking deployment
  const leadsAfterTracking = allLeads.filter(l => new Date(l.created_at).getTime() >= TRACKING_START_TIME);
  const leadsAfterTrackingCount = leadsAfterTracking.length;

  const convRate = uniqueVisitsCount > 0 ? ((leadsAfterTrackingCount / uniqueVisitsCount) * 100).toFixed(1) : '0';
  document.getElementById('kpi-conversion-rate').textContent = convRate + '%';
  document.getElementById('kpi-total-surveys').textContent = totalSurveys;

  const surveyRatio = totalLeads > 0 ? ((totalSurveys / totalLeads) * 100).toFixed(1) : '0';
  document.getElementById('kpi-survey-ratio').textContent = `${surveyRatio}% de leads completados`;

  // UTM Source table aggregation
  const utmSources = {};
  
  // 1. Gather all unique UTM sources from visits and leads
  landingVisits.forEach(v => {
    const src = v.utm_source || 'Tráfico Directo / Orgánico';
    if (!utmSources[src]) utmSources[src] = { visits: 0, leads: 0 };
    utmSources[src].visits++;
  });
  
  allLeads.forEach(l => {
    const src = l.utm_source || 'Tráfico Directo / Orgánico';
    if (!utmSources[src]) utmSources[src] = { visits: 0, leads: 0 };
    // We increment historical leads for the raw table display so data isn't empty,
    // but we compute conversion correctly using the tracked subset.
    utmSources[src].leads++;
  });

  const sourceTableBody = document.querySelector('#utm-source-table tbody');
  sourceTableBody.innerHTML = '';
  Object.keys(utmSources).sort((a,b) => utmSources[b].leads - utmSources[a].leads).forEach(src => {
    const data = utmSources[src];
    
    // Calculate conversions strictly within the tracking window
    const srcVisits = landingVisits.filter(v => (v.utm_source || 'Tráfico Directo / Orgánico') === src).length;
    const srcLeads = leadsAfterTracking.filter(l => (l.utm_source || 'Tráfico Directo / Orgánico') === src).length;
    
    const rate = srcVisits > 0 ? ((srcLeads / srcVisits) * 100).toFixed(1) + '%' : '0.0%';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${src}</strong></td>
      <td>${srcVisits}</td>
      <td>${data.leads}</td>
      <td><span class="badge ${parseFloat(rate) > 10 ? 'badge--green' : 'badge--gray'}">${rate}</span></td>
    `;
    sourceTableBody.appendChild(row);
  });

  // Landing distribution
  const landings = {};
  allLeads.forEach(l => {
    const lName = l.landing || 'Registro Principal';
    landings[lName] = (landings[lName] || 0) + 1;
  });

  const landingTableBody = document.querySelector('#landing-dist-table tbody');
  landingTableBody.innerHTML = '';
  Object.keys(landings).sort((a,b) => landings[b] - landings[a]).forEach(lName => {
    const count = landings[lName];
    const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) + '%' : '0%';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${lName}</strong></td>
      <td>${count}</td>
      <td><span class="badge badge--blue">${pct}</span></td>
    `;
    landingTableBody.appendChild(row);
  });

  // UTM Campaigns table aggregation
  const campaigns = {};
  allLeads.forEach(l => {
    if (l.utm_campaign) {
      const key = `${l.utm_campaign}::${l.utm_source || ''}::${l.utm_medium || ''}`;
      campaigns[key] = (campaigns[key] || 0) + 1;
    }
  });

  const campaignTableBody = document.querySelector('#utm-campaign-table tbody');
  campaignTableBody.innerHTML = '';
  const sortedCampaigns = Object.keys(campaigns).sort((a,b) => campaigns[b] - campaigns[a]);
  if (sortedCampaigns.length === 0) {
    campaignTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Ningún lead con parámetros de campaña UTM registrado.</td></tr>';
  } else {
    sortedCampaigns.forEach(key => {
      const [campaign, source, medium] = key.split('::');
      const count = campaigns[key];
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${campaign}</strong></td>
        <td><span class="badge badge--gray">${source || 'n/a'}</span></td>
        <td><span class="badge badge--gray">${medium || 'n/a'}</span></td>
        <td><span class="badge badge--blue">${count} leads</span></td>
      `;
      campaignTableBody.appendChild(row);
    });
  }

  // Draw Pie Charts
  renderPieCharts(utmSources, landings);
}

// ===== RENDER PIE CHARTS =====
function renderPieCharts(utmSources, landings) {
  if (typeof Chart === 'undefined') return;

  // 1. UTM Source Chart
  const ctxUtm = document.getElementById('chart-utm-source').getContext('2d');
  if (chartUtmSourceInstance) {
    chartUtmSourceInstance.destroy();
  }

  const sortedUtmKeys = Object.keys(utmSources).sort((a, b) => utmSources[b].leads - utmSources[a].leads);
  const utmLabels = sortedUtmKeys;
  const utmData = sortedUtmKeys.map(k => utmSources[k].leads);

  chartUtmSourceInstance = new Chart(ctxUtm, {
    type: 'pie',
    data: {
      labels: utmLabels,
      datasets: [{
        data: utmData,
        backgroundColor: [
          'rgba(59, 130, 246, 0.75)', // blue
          'rgba(16, 185, 129, 0.75)', // green
          'rgba(168, 85, 247, 0.75)', // purple
          'rgba(250, 204, 21, 0.75)', // yellow
          'rgba(239, 68, 68, 0.75)',  // red
          'rgba(100, 116, 139, 0.75)'  // slate
        ],
        borderWidth: 1,
        borderColor: '#0f141a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#cbd5e1',
            font: { family: 'Inter', size: 9 }
          }
        }
      }
    }
  });

  // 2. Landing Chart
  const ctxLanding = document.getElementById('chart-landing').getContext('2d');
  if (chartLandingInstance) {
    chartLandingInstance.destroy();
  }

  const sortedLandingKeys = Object.keys(landings).sort((a, b) => landings[b] - landings[a]);
  const landingLabels = sortedLandingKeys;
  const landingData = sortedLandingKeys.map(k => landings[k]);

  chartLandingInstance = new Chart(ctxLanding, {
    type: 'pie',
    data: {
      labels: landingLabels,
      datasets: [{
        data: landingData,
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)', // green
          'rgba(59, 130, 246, 0.75)', // blue
          'rgba(168, 85, 247, 0.75)', // purple
          'rgba(250, 204, 21, 0.75)', // yellow
          'rgba(239, 68, 68, 0.75)',  // red
          'rgba(100, 116, 139, 0.75)'  // slate
        ],
        borderWidth: 1,
        borderColor: '#0f141a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#cbd5e1',
            font: { family: 'Inter', size: 9 }
          }
        }
      }
    }
  });
}

// ===== LEADS TAB CONTROL =====
function populateFilterOptions() {
  const landingSelect = document.getElementById('filter-landing');
  // clear previous except first
  landingSelect.innerHTML = '<option value="">Todas las Landings</option>';
  
  const landings = new Set(allLeads.map(l => l.landing).filter(Boolean));
  landings.forEach(lName => {
    const opt = document.createElement('option');
    opt.value = lName;
    opt.textContent = lName;
    landingSelect.appendChild(opt);
  });
}

function buildLeadsTab() {
  handleFilterChange();
}

function handleFilterChange() {
  const search = document.getElementById('lead-search').value.toLowerCase().trim();
  const landingFilter = document.getElementById('filter-landing').value;
  const surveyFilter = document.getElementById('filter-survey').value;

  filteredLeads = allLeads.filter(l => {
    // Search
    const searchMatch = !search || 
      (l.name || '').toLowerCase().includes(search) ||
      (l.email || '').toLowerCase().includes(search) ||
      (l.phone || '').toLowerCase().includes(search) ||
      (l.utm_source || '').toLowerCase().includes(search) ||
      (l.utm_campaign || '').toLowerCase().includes(search);

    // Landing
    const landingMatch = !landingFilter || l.landing === landingFilter;

    // Survey responses check
    const answered = l.survey_responses && l.survey_responses.length > 0;
    const surveyMatch = !surveyFilter || 
      (surveyFilter === 'si' && answered) ||
      (surveyFilter === 'no' && !answered);

    return searchMatch && landingMatch && surveyMatch;
  });

  leadsPage = 1;
  renderLeadsTable();
}

function renderLeadsTable() {
  const tbody = document.getElementById('leads-tbody');
  tbody.innerHTML = '';

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage) || 1;
  
  // Update pagination UI
  document.getElementById('page-indicator').textContent = `Página ${leadsPage} de ${totalPages}`;
  document.getElementById('btn-prev-page').disabled = leadsPage === 1;
  document.getElementById('btn-next-page').disabled = leadsPage === totalPages;

  const start = (leadsPage - 1) * leadsPerPage;
  const end = start + leadsPerPage;
  const pageLeads = filteredLeads.slice(start, end);

  if (pageLeads.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No se encontraron leads con los filtros seleccionados.</td></tr>';
    return;
  }

  pageLeads.forEach(l => {
    const dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    
    const hasSurvey = l.survey_responses && l.survey_responses.length > 0;
    const surveyBadge = hasSurvey ? '<span class="badge badge--green">Sí</span>' : '<span class="badge badge--red">No</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${l.name || '-'}</strong></td>
      <td>
        <div style="font-size:0.85rem;">✉️ ${l.email || '-'}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">📱 ${l.phone || '-'}</div>
      </td>
      <td><span class="badge badge--blue">${l.landing || 'Registro'}</span></td>
      <td><span class="badge badge--gray">${l.utm_source || 'directo'}</span></td>
      <td><span class="badge badge--gray">${l.utm_campaign || 'ninguna'}</span></td>
      <td>${surveyBadge}</td>
      <td style="font-size:0.82rem; color:var(--text-muted);">${dateStr}</td>
      <td>
        <button class="btn btn--secondary btn--sm btn-view-lead" data-id="${l.id}">Detalles</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach modal detail triggers
  document.querySelectorAll('.btn-view-lead').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const leadId = e.currentTarget.dataset.id;
      showLeadModal(leadId);
    });
  });
}

// ===== SURVEYS TAB CONTROL =====
function buildSurveysTab() {
  const listEl = document.getElementById('survey-responses-list');
  listEl.innerHTML = '';

  if (allSurveys.length === 0) {
    listEl.innerHTML = '<div class="text-center text-muted" style="padding:40px 0;">Aún no se han recibido respuestas a la encuesta.</div>';
    
    document.getElementById('stat-top-reto').textContent = 'Ninguno';
    document.getElementById('stat-top-edad').textContent = '-';
    document.getElementById('stat-top-pais').textContent = '-';
    return;
  }

  // Aggregate values for summary cards
  const ageCounts = {};
  const countryCounts = {};
  const retosList = [];

  allSurveys.forEach(s => {
    if (s.edad) ageCounts[s.edad] = (ageCounts[s.edad] || 0) + 1;
    if (s.pais) countryCounts[s.pais] = (countryCounts[s.pais] || 0) + 1;
    if (s.mayor_reto) retosList.push(s.mayor_reto);

    // Render individual survey card
    const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    const leadName = s.leads ? s.leads.name : 'Participante';
    const leadEmail = s.leads ? s.leads.email : '';

    const card = document.createElement('div');
    card.className = 'survey-response-card';
    card.innerHTML = `
      <div class="survey-card-header">
        <div class="survey-card-title">
          <h3>${leadName}</h3>
          <div class="survey-card-meta">
            <span>✉️ ${leadEmail}</span>
            <span>📅 ${dateStr}</span>
          </div>
        </div>
        <span class="badge badge--green">Encuesta Completada</span>
      </div>
      <div class="survey-answers-summary">
        <div class="answer-item">
          <strong>Rango de Edad:</strong>
          <span>${s.edad || '-'}</span>
        </div>
        <div class="answer-item">
          <strong>País:</strong>
          <span>${s.pais || '-'}</span>
        </div>
        <div class="answer-item">
          <strong>Género:</strong>
          <span>${s.genero || '-'}</span>
        </div>
        <div class="answer-item">
          <strong>Situación Laboral:</strong>
          <span>${s.situacion || '-'}</span>
        </div>
        <div class="answer-item" style="grid-column: 1 / -1;">
          <strong>Área de Trabajo / Profesión:</strong>
          <span>${s.area_trabajo || '-'}</span>
        </div>
        <div class="answer-item" style="grid-column: 1 / -1;">
          <strong>¿Qué te motivó a inscribirte?:</strong>
          <span>${s.razon_inscripcion || 'No especificado'}</span>
        </div>
        <div class="answer-item" style="grid-column: 1 / -1;">
          <strong>¿Cuál es tu mayor reto financiero?:</strong>
          <span style="color:#facc15; font-weight:500;">${s.mayor_reto || '-'}</span>
        </div>
        <div class="answer-item" style="grid-column: 1 / -1;">
          <strong>Pregunta del Café (Pregunta libre):</strong>
          <span style="font-style:italic;">"${s.pregunta_cafe || '-'}"</span>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });

  // Calculate top values
  const topAge = Object.keys(ageCounts).sort((a,b) => ageCounts[b] - ageCounts[a])[0] || '-';
  const topCountry = Object.keys(countryCounts).sort((a,b) => countryCounts[b] - countryCounts[a])[0] || '-';
  
  document.getElementById('stat-top-edad').textContent = topAge;
  document.getElementById('stat-top-pais').textContent = topCountry;

  // Simple keyword matching for "top retos" (money, time, freedom, learn, etc)
  const keywords = {
    'Falta de capital / dinero': ['dinero', 'capital', 'ingresos', 'recursos', 'sueldo', 'ahorro'],
    'Falta de tiempo': ['tiempo', 'trabajo', 'horas', 'libre', 'dia'],
    'Miedo / Psicología / Emociones': ['miedo', 'emocion', 'psicolog', 'mente', 'mental', 'sabot', 'perder'],
    'Falta de conocimiento': ['conocimiento', 'aprender', 'saber', 'educacion', 'estudiar', 'estrategia'],
    'Libertad Financiera': ['libertad', 'jubilar', 'retirar', 'futuro']
  };

  const retoStats = {};
  retosList.forEach(reto => {
    let matched = false;
    const rLower = reto.toLowerCase();
    for (const [key, kwList] of Object.entries(keywords)) {
      if (kwList.some(kw => rLower.includes(kw))) {
        retoStats[key] = (retoStats[key] || 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) {
      retoStats['Otros / Específico'] = (retoStats['Otros / Específico'] || 0) + 1;
    }
  });

  const topReto = Object.keys(retoStats).sort((a,b) => retoStats[b] - retoStats[a])[0] || 'Varios/Otros';
  document.getElementById('stat-top-reto').textContent = topReto;
}

// ===== LEAD DETAIL MODAL =====
function showLeadModal(leadId) {
  const l = allLeads.find(lead => lead.id.toString() === leadId.toString());
  if (!l) return;

  document.getElementById('modal-lead-name').textContent = l.name || 'Detalles del Lead';
  document.getElementById('modal-lead-email').textContent = l.email || '-';
  document.getElementById('modal-lead-phone').textContent = l.phone || '-';
  document.getElementById('modal-lead-landing').textContent = l.landing || '-';
  
  const dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  document.getElementById('modal-lead-date').textContent = dateStr;

  // UTMs
  document.getElementById('modal-lead-source').textContent = l.utm_source || 'n/a';
  document.getElementById('modal-lead-medium').textContent = l.utm_medium || 'n/a';
  document.getElementById('modal-lead-campaign').textContent = l.utm_campaign || 'n/a';
  document.getElementById('modal-lead-content').textContent = l.utm_content || 'n/a';
  document.getElementById('modal-lead-term').textContent = l.utm_term || 'n/a';

  // Check Survey Answers
  const answersGrid = document.getElementById('modal-survey-answers');
  answersGrid.innerHTML = '';

  const survey = allSurveys.find(s => s.lead_id.toString() === l.id.toString());
  if (survey) {
    const qaPairs = [
      { q: 'Rango de Edad', a: survey.edad },
      { q: 'País', a: survey.pais },
      { q: 'Género', a: survey.genero },
      { q: 'Grado de estudios', a: survey.estudios },
      { q: 'Situación Laboral', a: survey.situacion },
      { q: 'Área de Trabajo', a: survey.area_trabajo },
      { q: 'Ingresos Mensuales (USD)', a: survey.ingresos },
      { q: '¿Tiene hijos?', a: survey.tiene_hijos },
      { q: 'Tiempo conociendo la marca', a: survey.tiempo_conociendo },
      { q: 'Motivo de inscripción', a: survey.razon_inscripcion },
      { q: 'Mayor reto financiero', a: survey.mayor_reto },
      { q: '¿Por qué aprender a invertir?', a: survey.por_que_inversion },
      { q: '¿Ha invertido antes?', a: survey.ha_invertido },
      { q: 'Tema específico de interés', a: survey.tema_especifico },
      { q: 'Nivel de experiencia', a: survey.nivel_experiencia },
      { q: 'Si pudieras tomar un café conmigo, ¿qué preguntarías?', a: survey.pregunta_cafe }
    ];

    qaPairs.forEach(pair => {
      const row = document.createElement('div');
      row.className = 'survey-answer-row';
      row.innerHTML = `
        <span class="survey-q">${pair.q}</span>
        <span class="survey-a">${pair.a || 'No contestado'}</span>
      `;
      answersGrid.appendChild(row);
    });
  } else {
    answersGrid.innerHTML = '<p class="text-muted">El lead aún no ha completado la encuesta de lanzamiento.</p>';
  }

  document.getElementById('lead-modal').style.display = 'flex';
}

// ===== CONFIGURATION & WEBHOOKS TAB =====
async function buildSettingsTab() {
  try {
    const settings = await dbFetch('/rest/v1/system_settings?select=*');
    
    const regWebhook = settings.find(s => s.key === 'ghl_registration_webhook');
    const survWebhook = settings.find(s => s.key === 'ghl_survey_webhook');

    if (regWebhook) document.getElementById('setting-webhook-registration').value = regWebhook.value;
    if (survWebhook) document.getElementById('setting-webhook-survey').value = survWebhook.value;

  } catch (err) {
    console.error('Error loading webhooks configuration:', err);
  }
}

async function handleSaveWebhooks(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-webhooks');
  const statusEl = document.getElementById('webhook-save-status');

  const regVal = document.getElementById('setting-webhook-registration').value.trim();
  const survVal = document.getElementById('setting-webhook-survey').value.trim();

  btn.disabled = true;
  btn.textContent = 'Guardando...';
  statusEl.style.display = 'none';

  try {
    // Save webhooks via secure admin RPC function
    await dbFetch('/rest/v1/rpc/admin_update_settings', {
      method: 'POST',
      body: JSON.stringify({
        p_email: authEmail,
        p_password: authPass,
        p_settings: {
          ghl_registration_webhook: regVal,
          ghl_survey_webhook: survVal
        }
      })
    });

    statusEl.className = 'status-msg success';
    statusEl.textContent = '✓ Webhooks actualizados correctamente.';
    statusEl.style.display = 'block';

  } catch (err) {
    console.error('Webhook save error:', err);
    statusEl.className = 'status-msg error';
    statusEl.textContent = '❌ Error al guardar configuraciones: ' + err.message;
    statusEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Actualizar Webhooks';
  }
}

async function handleSavePassword(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-password');
  const statusEl = document.getElementById('password-save-status');

  const oldPass = document.getElementById('pass-old').value;
  const newPass = document.getElementById('pass-new').value;
  const confirmPass = document.getElementById('pass-confirm').value;

  statusEl.style.display = 'none';

  if (newPass !== confirmPass) {
    statusEl.className = 'status-msg error';
    statusEl.textContent = '❌ La nueva contraseña y su confirmación no coinciden.';
    statusEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Actualizando contraseña...';

  try {
    const success = await dbFetch('/rest/v1/rpc/change_admin_user_password', {
      method: 'POST',
      body: JSON.stringify({
        p_email: authEmail,
        p_old_password: oldPass,
        p_new_password: newPass
      })
    });

    if (success) {
      authPass = newPass;
      sessionStorage.setItem('admin_pass', newPass);
      statusEl.className = 'status-msg success';
      statusEl.textContent = '✓ Contraseña actualizada correctamente.';
      statusEl.style.display = 'block';
      document.getElementById('settings-password-form').reset();
    } else {
      statusEl.className = 'status-msg error';
      statusEl.textContent = '❌ La contraseña actual ingresada es incorrecta.';
      statusEl.style.display = 'block';
    }
  } catch (err) {
    console.error('Password change error:', err);
    statusEl.className = 'status-msg error';
    statusEl.textContent = '❌ Error de red o permisos: ' + err.message;
    statusEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Cambiar Contraseña';
  }
}

// ===== EXPORT TO CSV FUNCTIONS =====
function exportLeadsCSV() {
  if (filteredLeads.length === 0) return;

  const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'Landing/Canal', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Registro Completado', 'Fecha Registro'];
  
  const rows = filteredLeads.map(l => {
    const hasSurvey = l.survey_responses && l.survey_responses.length > 0 ? 'Si' : 'No';
    return [
      l.id,
      l.name || '',
      l.email || '',
      l.phone || '',
      l.landing || '',
      l.utm_source || '',
      l.utm_medium || '',
      l.utm_campaign || '',
      hasSurvey,
      l.created_at || ''
    ];
  });

  triggerCSVDownload('leads_genoma.csv', headers, rows);
}

function exportSurveysCSV() {
  if (allSurveys.length === 0) return;

  const headers = [
    'ID Respuesta', 'ID Lead', 'Nombre Lead', 'Email Lead', 'Edad', 'Pais', 'Genero', 
    'Estudios', 'Situacion Laboral', 'Area Trabajo', 'Ingresos USD', 'Tiene Hijos', 
    'Tiempo Conociendo', 'Motivo Inscripcion', 'Mayor Reto', 'Por que Inversion', 
    'Ha Invertido', 'Tema Interes', 'Nivel Experiencia', 'Pregunta Cafe', 'Fecha Encuesta'
  ];

  const rows = allSurveys.map(s => [
    s.id,
    s.lead_id,
    s.leads ? s.leads.name : '',
    s.leads ? s.leads.email : '',
    s.edad || '',
    s.pais || '',
    s.genero || '',
    s.estudios || '',
    s.situacion || '',
    s.area_trabajo || '',
    s.ingresos || '',
    s.tiene_hijos || '',
    s.tiempo_conociendo || '',
    s.razon_inscripcion || '',
    s.mayor_reto || '',
    s.por_que_inversion || '',
    s.ha_invertido || '',
    s.tema_especifico || '',
    s.nivel_experiencia || '',
    s.pregunta_cafe || '',
    s.created_at || ''
  ]);

  triggerCSVDownload('encuestas_lanzamiento.csv', headers, rows);
}

function triggerCSVDownload(filename, headers, rows) {
  // Add BOM for Excel UTF-8 display compatibility
  let csvContent = '\uFEFF';
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
  
  rows.forEach(row => {
    csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
