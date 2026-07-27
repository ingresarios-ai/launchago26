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
let allTests = [];
let allLeadMagnets = [];
let filteredLeads = [];
let filteredLeadMagnets = [];
let leadsPage = 1;
const leadsPerPage = 15;
let lmPage = 1;
const lmPerPage = 15;

// Chart.js instances
let chartUtmSourceInstance = null;
let chartLandingInstance = null;
let chartTestParticipationInstance = null;
let chartTestArchetypesInstance = null;
let chartSurveyConversionInstance = null;
let chartSurveyExperienceInstance = null;
let chartSurveyAgeInstance = null;

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// Chart.js instances
let chartUtmSourceInstance = null;
let chartLandingInstance = null;
let chartTestParticipationInstance = null;
let chartTestArchetypesInstance = null;

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

async function dbFetchAll(path, bodyParams = {}) {
  let allRows = [];
  let page = 0;
  let fetchedAll = false;
  
  while (!fetchedAll && page < 100) {
    const offset = page * 1000;
    const requestParams = Object.assign({}, bodyParams, {
      p_limit: 1000,
      p_offset: offset
    });
    
    const chunk = await dbFetch(path, {
      method: 'POST',
      body: JSON.stringify(requestParams)
    });
    
    allRows = allRows.concat(chunk);
    if (chunk.length < 1000) {
      fetchedAll = true;
    } else {
      page++;
    }
  }
  return allRows;
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
  document.getElementById('filter-test').addEventListener('change', handleFilterChange);

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
  const btnExportPreact = document.getElementById('btn-export-preactivities');
  if (btnExportPreact) btnExportPreact.addEventListener('click', exportPreactivitiesCSV);
  const btnExportLm = document.getElementById('btn-export-leadmagnets');
  if (btnExportLm) btnExportLm.addEventListener('click', exportLeadMagnetsCSV);

  // Lead Magnets Filters
  const lmSearch = document.getElementById('lm-search');
  if (lmSearch) lmSearch.addEventListener('input', handleLmFilterChange);
  const filterLmType = document.getElementById('filter-lm-type');
  if (filterLmType) filterLmType.addEventListener('change', handleLmFilterChange);
  const filterLmTaller = document.getElementById('filter-lm-taller');
  if (filterLmTaller) filterLmTaller.addEventListener('change', handleLmFilterChange);
  const filterLmSource = document.getElementById('filter-lm-source');
  if (filterLmSource) filterLmSource.addEventListener('change', handleLmFilterChange);

  // Lead Magnets Pagination
  const btnLmPrev = document.getElementById('btn-lm-prev-page');
  if (btnLmPrev) btnLmPrev.addEventListener('click', () => {
    if (lmPage > 1) {
      lmPage--;
      renderLeadMagnetsTable();
    }
  });
  const btnLmNext = document.getElementById('btn-lm-next-page');
  if (btnLmNext) btnLmNext.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredLeadMagnets.length / lmPerPage) || 1;
    if (lmPage < totalPages) {
      lmPage++;
      renderLeadMagnetsTable();
    }
  });

  // Settings Forms
  document.getElementById('settings-webhooks-form').addEventListener('submit', handleSaveWebhooks);
  document.getElementById('settings-password-form').addEventListener('submit', handleSavePassword);
  document.getElementById('settings-new-admin-form').addEventListener('submit', handleCreateAdminSubmit);
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
    const authParams = { p_email: authEmail, p_password: authPass };

    // 1. Fetch leads via secure admin RPC function
    allLeads = await dbFetchAll('/rest/v1/rpc/admin_get_leads', authParams);

    // Unify "Landing A Org" with "Facebook"
    allLeads.forEach(l => {
      if (l.landing === 'Landing A Org') {
        l.landing = 'Facebook';
      }
    });
    
    // Process survey counts mapping (survey_responses count for each lead)
    // We will do this by looking up the responses locally since we retrieve both lists securely.
    
    // 2. Fetch page visits via secure admin RPC function
    allVisits = await dbFetchAll('/rest/v1/rpc/admin_get_pageviews', authParams);

    // 3. Fetch surveys via secure admin RPC function
    allSurveys = await dbFetchAll('/rest/v1/rpc/admin_get_surveys', authParams);

    // 4. Fetch tests via secure admin RPC function
    allTests = await dbFetchAll('/rest/v1/rpc/admin_get_tests', authParams);

    // 5. Fetch lead magnets via RPC (with direct REST fallback)
    try {
      allLeadMagnets = await dbFetchAll('/rest/v1/rpc/admin_get_leads_magnets', authParams);
    } catch (err) {
      try {
        allLeadMagnets = await dbFetch('/rest/v1/leads_magnets?select=*&order=created_at.desc', { method: 'GET' });
      } catch (e) {
        allLeadMagnets = [];
      }
    }

    // Cross-reference Lead Magnets with Workshop Leads by email
    const workshopEmailMap = new Map();
    allLeads.forEach(l => {
      if (l.email) workshopEmailMap.set(l.email.toLowerCase().trim(), l);
    });

    allLeadMagnets.forEach(lm => {
      const lmEmail = (lm.email || '').toLowerCase().trim();
      const parentWorkshopLead = workshopEmailMap.get(lmEmail);
      lm.is_workshop_registered = !!parentWorkshopLead;
      lm.workshop_lead = parentWorkshopLead || null;
    });

    // Also link Lead Magnet data to taller lead objects in memory
    const lmEmailMap = new Map();
    allLeadMagnets.forEach(lm => {
      if (lm.email) lmEmailMap.set(lm.email.toLowerCase().trim(), lm);
    });

    allLeads.forEach(l => {
      const lmObj = lmEmailMap.get((l.email || '').toLowerCase().trim());
      l.lead_magnet_info = lmObj || null;
    });

    // Match survey responses back to the lead objects in-memory for UI badges
    const surveyLeadIds = new Set(allSurveys.map(s => s.lead_id));
    
    // Match test results back to the lead objects in-memory for UI badges & filtering
    const testLeadMap = {};
    allTests.forEach(t => {
      testLeadMap[t.lead_id] = t;
    });

    allLeads.forEach(l => {
      l.survey_responses = surveyLeadIds.has(l.id) ? [{ id: true }] : [];
      l.saboteur_test = testLeadMap[l.id] || null;
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
    buildPreactivitiesTab();
    buildLeadMagnetsTab();
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

  // Lead Magnets Dashboard KPI
  const lmCount = allLeadMagnets.length;
  const lmConvCount = allLeadMagnets.filter(lm => lm.is_workshop_registered).length;
  const lmConvRate = lmCount > 0 ? ((lmConvCount / lmCount) * 100).toFixed(1) : '0';

  const elLmTotal = document.getElementById('kpi-total-lm');
  const elLmSub = document.getElementById('kpi-lm-conv-sub');
  if (elLmTotal) elLmTotal.textContent = lmCount;
  if (elLmSub) elLmSub.textContent = `${lmConvCount} inscritos (${lmConvRate}%)`;

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
  const testFilter = document.getElementById('filter-test').value;

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

    // Test check
    const tookTest = !!l.saboteur_test;
    const testMatch = !testFilter ||
      (testFilter === 'si' && tookTest) ||
      (testFilter === 'no' && !tookTest) ||
      (['vengador', 'euforico', 'impaciente', 'paralizado'].includes(testFilter) && tookTest && l.saboteur_test.saboteur_type === testFilter);

    return searchMatch && landingMatch && surveyMatch && testMatch;
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
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No se encontraron leads con los filtros seleccionados.</td></tr>';
    return;
  }

  pageLeads.forEach(l => {
    const dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    
    const hasSurvey = l.survey_responses && l.survey_responses.length > 0;
    const surveyBadge = hasSurvey ? '<span class="badge badge--green">Sí</span>' : '<span class="badge badge--red">No</span>';

    const testObj = l.saboteur_test;
    let testBadge = '<span class="badge badge--red">No</span>';
    if (testObj) {
      const type = testObj.saboteur_type || 'completado';
      let badgeClass = 'badge--blue';
      if (type === 'vengador') badgeClass = 'badge--red';
      else if (type === 'euforico') badgeClass = 'badge--orange';
      else if (type === 'impaciente') badgeClass = 'badge--orange'; // Eufórico is yellow/orange, Impaciente is purple/orange in css we did badge--orange and badge--purple
      else if (type === 'paralizado') badgeClass = 'badge--purple';
      
      if (type === 'euforico') badgeClass = 'badge--orange'; // eufórico maps to badge--orange
      if (type === 'impaciente') badgeClass = 'badge--blue'; // impaciente maps to badge--blue
      if (type === 'paralizado') badgeClass = 'badge--purple'; // paralizado maps to badge--purple
      if (type === 'vengador') badgeClass = 'badge--red'; // vengador maps to badge--red
      
      const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
      testBadge = `<span class="badge ${badgeClass}">${typeCapitalized}</span>`;
    }

    // Progreso
    const currentAct = l.activation_score || 1;
    const completedMissions = Math.min(Math.max(0, currentAct - 1), 9);
    const progressPct = Math.round((completedMissions / 9) * 100);
    const totalPoints = l.total_points || 0;
    
    const progressHTML = `
      <div style="min-width: 100px;">
        <div style="font-size:0.75rem; font-weight:600; display:flex; justify-content:space-between; margin-bottom:3px; color:var(--text-white);">
          <span>${completedMissions}/9 mis.</span>
          <span style="color:var(--yellow); font-weight:700;">⚡${totalPoints}</span>
        </div>
        <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:100px; overflow:hidden;">
          <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #f59e0b, #22c55e); border-radius:100px;"></div>
        </div>
      </div>
    `;

    // Landing / Lead Magnet Badge
    let landingBadge = `<span class="badge badge--blue">${escapeHtml(l.landing || 'Registro')}</span>`;
    if (l.lead_magnet_info || (l.landing && l.landing.includes('Lead Magnet'))) {
      landingBadge = `<span class="badge badge--purple">🧲 ${escapeHtml(l.landing || 'Lead Magnet')}</span>`;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${escapeHtml(l.name || '-')}</strong></td>
      <td>
        <div style="font-size:0.85rem;">✉️ ${escapeHtml(l.email || '-')}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">📱 ${escapeHtml(l.phone || '-')}</div>
      </td>
      <td>${landingBadge}</td>
      <td><span class="badge badge--gray">${escapeHtml(l.utm_source || 'directo')}</span></td>
      <td><span class="badge badge--gray">${escapeHtml(l.utm_campaign || 'ninguna')}</span></td>
      <td>${surveyBadge}</td>
      <td>${testBadge}</td>
      <td>${progressHTML}</td>
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

  // Render analytics charts for the leads list
  renderLeadsCharts();
}

function renderLeadsCharts() {
  const ctxParticipation = document.getElementById('chart-test-participation');
  const ctxArchetypes = document.getElementById('chart-test-archetypes');
  if (!ctxParticipation || !ctxArchetypes) return;

  // Calculate participation and archetype frequencies based on filteredLeads
  let completedCount = 0;
  let pendingCount = 0;
  const archetypeCounts = {
    vengador: 0,
    euforico: 0,
    impaciente: 0,
    paralizado: 0
  };

  filteredLeads.forEach(l => {
    if (l.saboteur_test) {
      completedCount++;
      const type = l.saboteur_test.saboteur_type;
      if (type && archetypeCounts.hasOwnProperty(type)) {
        archetypeCounts[type]++;
      }
    } else {
      pendingCount++;
    }
  });

  // Destroy previous chart instances safely
  if (chartTestParticipationInstance) {
    chartTestParticipationInstance.destroy();
  }
  if (chartTestArchetypesInstance) {
    chartTestArchetypesInstance.destroy();
  }

  // Draw Participation Pie Chart
  chartTestParticipationInstance = new Chart(ctxParticipation, {
    type: 'pie',
    data: {
      labels: ['Completado', 'Pendiente'],
      datasets: [{
        data: [completedCount, pendingCount],
        backgroundColor: ['rgba(34, 197, 94, 0.75)', 'rgba(239, 68, 68, 0.75)'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1.5
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
            font: { family: 'Inter', size: 10 }
          }
        }
      }
    }
  });

  // Draw Archetypes Pie Chart
  chartTestArchetypesInstance = new Chart(ctxArchetypes, {
    type: 'pie',
    data: {
      labels: ['Vengador', 'Eufórico', 'Impaciente', 'Paralizado'],
      datasets: [{
        data: [
          archetypeCounts.vengador,
          archetypeCounts.euforico,
          archetypeCounts.impaciente,
          archetypeCounts.paralizado
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(59, 130, 246, 0.75)',
          'rgba(139, 92, 246, 0.75)'
        ],
        borderColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'],
        borderWidth: 1.5
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
            font: { family: 'Inter', size: 10 }
          }
        }
      }
    }
  });
}

// ===== SURVEYS TAB CONTROL =====
function buildSurveysTab() {
  const listEl = document.getElementById('survey-responses-list');
  listEl.innerHTML = '';

  const totalLeadsCount = allLeads.length;
  const completedSurveysCount = allSurveys.length;
  const pendingSurveysCount = Math.max(0, totalLeadsCount - completedSurveysCount);
  const surveyConvRate = totalLeadsCount > 0 ? ((completedSurveysCount / totalLeadsCount) * 100).toFixed(1) : '0';

  const elConv = document.getElementById('stat-survey-conv');
  const elSub = document.getElementById('stat-survey-sub');
  const elTotal = document.getElementById('stat-survey-total');

  if (elConv) elConv.textContent = `${surveyConvRate}%`;
  if (elSub) elSub.textContent = `${completedSurveysCount} de ${totalLeadsCount} leads`;
  if (elTotal) elTotal.textContent = completedSurveysCount;

  if (allSurveys.length === 0) {
    listEl.innerHTML = '<div class="text-center text-muted" style="padding:40px 0;">Aún no se han recibido respuestas a la encuesta.</div>';
    document.getElementById('stat-top-edad').textContent = '-';
    document.getElementById('stat-top-pais').textContent = '-';
    renderSurveyCharts(0, totalLeadsCount, {}, {});
    return;
  }

  // Aggregate values for summary cards & charts
  const ageCounts = {};
  const countryCounts = {};
  const expCounts = {};
  const retosList = [];

  allSurveys.forEach(s => {
    if (s.edad) ageCounts[s.edad] = (ageCounts[s.edad] || 0) + 1;
    if (s.pais) countryCounts[s.pais] = (countryCounts[s.pais] || 0) + 1;
    if (s.ha_invertido) expCounts[s.ha_invertido] = (expCounts[s.ha_invertido] || 0) + 1;
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

  // Render Charts for Survey Conversion & Demographics
  renderSurveyCharts(completedSurveysCount, pendingSurveysCount, expCounts, ageCounts);
}

function renderSurveyCharts(completedCount, pendingCount, expCounts, ageCounts) {
  const ctxConv = document.getElementById('chart-survey-conversion');
  const ctxExp = document.getElementById('chart-survey-experience');
  const ctxAge = document.getElementById('chart-survey-age');
  if (!ctxConv || !ctxExp || !ctxAge) return;

  // Destroy previous chart instances
  if (chartSurveyConversionInstance) chartSurveyConversionInstance.destroy();
  if (chartSurveyExperienceInstance) chartSurveyExperienceInstance.destroy();
  if (chartSurveyAgeInstance) chartSurveyAgeInstance.destroy();

  // 1. Conversion Pie Chart
  chartSurveyConversionInstance = new Chart(ctxConv, {
    type: 'doughnut',
    data: {
      labels: ['Encuesta Completada', 'Pendiente de Encuesta'],
      datasets: [{
        data: [completedCount, pendingCount],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.6)'],
        borderColor: ['#22c55e', '#eab308'],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });

  // 2. Experience Chart
  const expLabels = Object.keys(expCounts);
  const expData = Object.values(expCounts);
  chartSurveyExperienceInstance = new Chart(ctxExp, {
    type: 'pie',
    data: {
      labels: expLabels.length > 0 ? expLabels : ['Sin datos'],
      datasets: [{
        data: expData.length > 0 ? expData : [1],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#cbd5e1', font: { family: 'Inter', size: 10 } }
        }
      }
    }
  });

  // 3. Age Distribution Chart
  const ageLabels = Object.keys(ageCounts);
  const ageData = Object.values(ageCounts);
  chartSurveyAgeInstance = new Chart(ctxAge, {
    type: 'bar',
    data: {
      labels: ageLabels.length > 0 ? ageLabels : ['Sin datos'],
      datasets: [{
        label: 'Participantes',
        data: ageData.length > 0 ? ageData : [0],
        backgroundColor: 'rgba(34, 197, 94, 0.75)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
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

  // Check Lead Magnet Download
  const lmInfoContainer = document.getElementById('modal-leadmagnet-info');
  if (lmInfoContainer) {
    lmInfoContainer.innerHTML = '';
    const lmObj = l.lead_magnet_info || allLeadMagnets.find(lm => (lm.email || '').toLowerCase().trim() === (l.email || '').toLowerCase().trim());
    if (lmObj) {
      const rawType = (lmObj.lead_magnet || lmObj.landing || '').toLowerCase();
      let lmName = '🗺️ La Ruta del Inversionista desde Cero';
      if (rawType.includes('estafa') || rawType.includes('anti')) {
        lmName = '🛡️ Guía Anti-Estafas del Inversionista';
      }
      const lmDate = lmObj.created_at ? formatDate(lmObj.created_at) : '-';

      lmInfoContainer.innerHTML = `
        <div class="survey-answer-row">
          <span class="survey-q">PDF Descargado</span>
          <span class="survey-a"><strong style="color:var(--text-white);">${lmName}</strong></span>
        </div>
        <div class="survey-answer-row">
          <span class="survey-q">Fecha de Descarga</span>
          <span class="survey-a">${lmDate}</span>
        </div>
        <div class="survey-answer-row">
          <span class="survey-q">Landing de Captación</span>
          <span class="survey-a">${escapeHtml(lmObj.landing || '-')}</span>
        </div>
        <div class="survey-answer-row">
          <span class="survey-q">UTM Source</span>
          <span class="survey-a">${escapeHtml(lmObj.utm_source || 'directo')}</span>
        </div>
      `;
    } else {
      lmInfoContainer.innerHTML = '<p class="text-muted">El lead no proviene de una descarga de Lead Magnet.</p>';
    }
  }

  // Check Saboteur Test Answers
  const testContainer = document.getElementById('modal-test-results');
  testContainer.innerHTML = '';

  const test = l.saboteur_test;
  if (test) {
    // Archetype metadata mapper matching test.js
    const archetypes = {
      vengador: { emoji: '🔥', name: 'EL VENGADOR', desc: 'Actúas desde la revancha. Cada pérdida se convierte en una batalla personal que necesitas ganar, así que aumentas el riesgo para "recuperar". El problema: ni el mercado ni el dinero te deben nada.', insight: 'Tu Saboteador se activa después de cada pérdida. Te susurra: "recupéralo ya". Pero las decisiones tomadas desde la rabia amplían la pérdida el 78% de las veces.', color: '#ef4444', fillClass: 'fill-red' },
      euforico: { emoji: '🎰', name: 'EL EUFÓRICO', desc: 'Cuando las cosas van bien, te sientes invencible. Arriesgas más, dejas de seguir las reglas y sobreactúas. Tu peor enemigo no es el fracaso — es el éxito mal gestionado.', insight: 'Tu Saboteador se activa cuando las cosas van bien. Te convence de que "estás en racha" y que las reglas ya no aplican. Las personas más peligrosas con el dinero no son las que pierden — son las que no saben ganar.', color: '#f59e0b', fillClass: 'fill-yellow' },
      impaciente: { emoji: '⚡', name: 'EL IMPACIENTE', desc: 'Necesitas acción constante. Actúas antes de tiempo, decides sin confirmación y confundes movimiento con progreso. Tu bolsillo paga el costo de tu ansiedad.', insight: 'Tu Saboteador te hace creer que si no estás actuando, estás perdiendo. Pero las mejores decisiones financieras suelen ser las que NO tomas impulsivamente. La paciencia no es pasividad — es precisión.', color: '#8b5cf6', fillClass: 'fill-purple' },
      paralizado: { emoji: '🧊', name: 'EL PARALIZADO', desc: 'Analizas todo pero no decides nada. El miedo a equivocarte te congela y las oportunidades pasan frente a ti mientras buscas "más información". Tu inacción también cuesta dinero.', insight: 'Tu Saboteador usa la perfección como excusa para la inacción. Te convence de que necesitas más datos, más seguridad. Pero el costo de NO actuar es invisible — y acumulativo.', color: '#3b82f6', fillClass: 'fill-blue' }
    };

    const type = test.saboteur_type || 'vengador';
    const profile = archetypes[type] || archetypes.vengador;
    
    // Draw Banner & Description
    let html = `
      <div class="archetype-banner">
        <span class="archetype-emoji">${profile.emoji}</span>
        <div class="archetype-title">
          <h4>${profile.name}</h4>
          <span class="badge" style="background:${profile.color}20; color:${profile.color}; border:1px solid ${profile.color}40;">Tipo Dominante</span>
        </div>
      </div>
      <p class="archetype-desc">${profile.desc}</p>
      <p class="archetype-insight"><strong>Perspectiva:</strong> ${profile.insight}</p>
      
      <div class="scores-header">Puntuaciones por Arquetipo</div>
    `;

    // Render scores progress bars
    const scores = test.scores || {};
    const keys = ['vengador', 'euforico', 'impaciente', 'paralizado'];
    keys.forEach(k => {
      const arch = archetypes[k];
      const val = scores[k] || 0;
      // Max score is 21 (7 questions * 3 pts)
      const percent = Math.min(Math.round((val / 21) * 100), 100);
      
      html += `
        <div class="archetype-bar-row">
          <span>${arch.name.split(' ')[1]}</span>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${arch.fillClass}" style="width: ${percent}%"></div>
          </div>
          <span class="score-num">${val} pts</span>
        </div>
      `;
    });

    // Add branch info
    const branch = (test.answers && test.answers.branch) || 'Desconocida';
    const dateStr = test.completed_at ? new Date(test.completed_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    html += `
      <div style="margin-top:14px; padding-top: 10px; border-top: 1px solid var(--border-subtle); font-size:0.82rem; color:var(--text-muted); line-height: 1.5;">
        <div><strong>Perfil del Test:</strong> ${branch === 'trader' ? 'Trader Activo 📈' : 'No-Trader / Principiante 🪙'}</div>
        <div><strong>Completado el:</strong> ${dateStr}</div>
      </div>
    `;

    testContainer.innerHTML = html;
  } else {
    testContainer.innerHTML = '<p class="text-muted">El lead aún no ha realizado el test del saboteador.</p>';
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

  // Load registered system administrators
  loadAdminsList();
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

async function handleCreateAdminSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-create-admin');
  const statusEl = document.getElementById('admin-create-status');

  const nameVal = document.getElementById('new-admin-name').value.trim();
  const emailVal = document.getElementById('new-admin-email').value.trim();
  const passVal = document.getElementById('new-admin-password').value;

  btn.disabled = true;
  btn.textContent = 'Registrando...';
  statusEl.style.display = 'none';

  try {
    await dbFetch('/rest/v1/rpc/admin_create_user', {
      method: 'POST',
      body: JSON.stringify({
        p_admin_email: authEmail,
        p_admin_password: authPass,
        p_new_email: emailVal,
        p_new_name: nameVal,
        p_new_password: passVal
      })
    });

    statusEl.textContent = '¡Administrador registrado exitosamente!';
    statusEl.className = 'status-msg success';
    statusEl.style.display = 'block';

    // Clear form fields
    document.getElementById('settings-new-admin-form').reset();

    // Reload admins list
    loadAdminsList();

  } catch (err) {
    console.error('Error creating admin:', err);
    statusEl.textContent = '❌ Error: ' + (err.message || 'Error al registrar al administrador.');
    statusEl.className = 'status-msg error';
    statusEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar Administrador';
  }
}

async function loadAdminsList() {
  const tbody = document.getElementById('admins-list-tbody');
  if (!tbody) return;

  try {
    const admins = await dbFetch('/rest/v1/rpc/admin_get_users', {
      method: 'POST',
      body: JSON.stringify({ p_email: authEmail, p_password: authPass })
    });

    tbody.innerHTML = '';
    if (admins.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay administradores registrados.</td></tr>';
      return;
    }

    admins.forEach(adm => {
      const dateStr = adm.out_created_at ? new Date(adm.out_created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${adm.out_name || '-'}</strong></td>
        <td>${adm.out_email}</td>
        <td style="font-size:0.82rem; color:var(--text-muted);">${dateStr}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Error loading admins list:', err);
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Error al cargar administradores.</td></tr>';
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

// ===== PRE-ACTIVITIES TAB =====
let allPreactivities = [];

function buildPreactivitiesTab() {
  const tbody = document.getElementById('preactivities-tbody');
  if (!tbody) return;

  // Filter pageviews for preactivity submissions
  allPreactivities = (allVisits || []).filter(v => v.page && v.page.startsWith('preactividad'));

  const count1 = allPreactivities.filter(v => v.page === 'preactividad1_submission').length;
  const count2 = allPreactivities.filter(v => v.page === 'preactividad2_submission').length;

  const kpi1 = document.getElementById('kpi-preact1-count');
  const kpi2 = document.getElementById('kpi-preact2-count');
  if (kpi1) kpi1.textContent = count1;
  if (kpi2) kpi2.textContent = count2;

  tbody.innerHTML = '';

  if (allPreactivities.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 24px;">Aún no hay respuestas registradas de pre-actividades.</td></tr>';
    return;
  }

  allPreactivities.forEach(item => {
    const isAct1 = item.page === 'preactividad1_submission';
    const actBadge = isAct1 
      ? '<span class="badge badge--orange">Pre-Actividad 1 (Mindset)</span>'
      : '<span class="badge badge--green">Pre-Actividad 2 (Dinero Quieto)</span>';
      
    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }) : '-';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-size:0.85rem; color:var(--text-muted);">${dateStr}</td>
      <td>${actBadge}</td>
      <td><strong style="color:var(--text-white);">✉️ ${item.utm_source || 'Sin correo'}</strong></td>
      <td style="font-weight:600; color:var(--text-white);">${item.utm_medium || '-'}</td>
      <td style="font-size:0.88rem; color:var(--text-secondary); max-width:320px; word-break:break-word;">${item.utm_campaign || '-'}</td>
    `;
    tbody.appendChild(row);
  });
}

function exportPreactivitiesCSV() {
  if (!allPreactivities || allPreactivities.length === 0) {
    alert('No hay respuestas de pre-actividades para exportar.');
    return;
  }
  const headers = ['Fecha', 'Actividad', 'Correo Usuario', 'Respuesta Principal', 'Detalle / Reflexion'];
  const rows = allPreactivities.map(item => [
    item.created_at || '',
    item.page === 'preactividad1_submission' ? 'Pre-Actividad 1 (Mindset)' : 'Pre-Actividad 2 (Dinero Quieto)',
    item.utm_source || '',
    item.utm_medium || '',
    item.utm_campaign || ''
  ]);
  triggerCSVDownload('preactividades_lanzamiento.csv', headers, rows);
}

// ===== LEAD MAGNETS TAB CONTROL =====
function buildLeadMagnetsTab() {
  const total = allLeadMagnets.length;
  const convertedCount = allLeadMagnets.filter(lm => lm.is_workshop_registered).length;
  const convRate = total > 0 ? ((convertedCount / total) * 100).toFixed(1) : '0';

  // Breakdown by PDF guide
  const rutaLeads = allLeadMagnets.filter(lm => {
    const type = (lm.lead_magnet || lm.landing || '').toLowerCase();
    return type.includes('ruta') || type.includes('inversionista');
  });
  const rutaTotal = rutaLeads.length;
  const rutaConv = rutaLeads.filter(lm => lm.is_workshop_registered).length;

  const antiLeads = allLeadMagnets.filter(lm => {
    const type = (lm.lead_magnet || lm.landing || '').toLowerCase();
    return type.includes('estafa') || type.includes('anti');
  });
  const antiTotal = antiLeads.length;
  const antiConv = antiLeads.filter(lm => lm.is_workshop_registered).length;

  // Set KPIs
  const elTotal = document.getElementById('kpi-lm-total');
  const elConv = document.getElementById('kpi-lm-converted');
  const elRate = document.getElementById('kpi-lm-conv-rate');
  const elRuta = document.getElementById('kpi-lm-ruta');
  const elRutaConv = document.getElementById('kpi-lm-ruta-conv');
  const elAnti = document.getElementById('kpi-lm-antiestafas');
  const elAntiConv = document.getElementById('kpi-lm-antiestafas-conv');

  if (elTotal) elTotal.textContent = total;
  if (elConv) elConv.textContent = convertedCount;
  if (elRate) elRate.textContent = `${convRate}% conversión al taller`;
  if (elRuta) elRuta.textContent = rutaTotal;
  if (elRutaConv) elRutaConv.textContent = `${rutaConv} en taller`;
  if (elAnti) elAnti.textContent = antiTotal;
  if (elAntiConv) elAntiConv.textContent = `${antiConv} en taller`;

  // Populate source options dropdown
  const sources = new Set(allLeadMagnets.map(lm => lm.utm_source || 'directo'));
  const sourceSelect = document.getElementById('filter-lm-source');
  if (sourceSelect) {
    sourceSelect.innerHTML = '<option value="">Todas las Fuentes (UTM)</option>' +
      Array.from(sources).map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  }

  handleLmFilterChange();
}

function handleLmFilterChange() {
  const searchTerm = (document.getElementById('lm-search')?.value || '').toLowerCase().trim();
  const lmType = document.getElementById('filter-lm-type')?.value || '';
  const tallerStatus = document.getElementById('filter-lm-taller')?.value || '';
  const source = document.getElementById('filter-lm-source')?.value || '';

  filteredLeadMagnets = allLeadMagnets.filter(lm => {
    // Search filter
    if (searchTerm) {
      const name = (lm.name || '').toLowerCase();
      const email = (lm.email || '').toLowerCase();
      const phone = (lm.phone || '').toLowerCase();
      const utm = (lm.utm_source || '').toLowerCase();
      if (!name.includes(searchTerm) && !email.includes(searchTerm) && !phone.includes(searchTerm) && !utm.includes(searchTerm)) {
        return false;
      }
    }

    // Lead Magnet Type filter
    if (lmType === 'ruta') {
      const type = (lm.lead_magnet || lm.landing || '').toLowerCase();
      if (!type.includes('ruta') && !type.includes('inversionista')) return false;
    } else if (lmType === 'antiestafas') {
      const type = (lm.lead_magnet || lm.landing || '').toLowerCase();
      if (!type.includes('estafa') && !type.includes('anti')) return false;
    }

    // Taller status filter
    if (tallerStatus === 'si' && !lm.is_workshop_registered) return false;
    if (tallerStatus === 'no' && lm.is_workshop_registered) return false;

    // Source filter
    if (source && (lm.utm_source || 'directo') !== source) return false;

    return true;
  });

  lmPage = 1;
  renderLeadMagnetsTable();
}

function renderLeadMagnetsTable() {
  const tbody = document.getElementById('leadmagnets-tbody');
  if (!tbody) return;

  const total = filteredLeadMagnets.length;
  const totalPages = Math.ceil(total / lmPerPage) || 1;
  if (lmPage > totalPages) lmPage = totalPages;

  const startIdx = (lmPage - 1) * lmPerPage;
  const endIdx = startIdx + lmPerPage;
  const pageItems = filteredLeadMagnets.slice(startIdx, endIdx);

  const pageIndicator = document.getElementById('lm-page-indicator');
  if (pageIndicator) pageIndicator.textContent = `Página ${lmPage} de ${totalPages} (${total} total)`;

  const btnPrev = document.getElementById('btn-lm-prev-page');
  const btnNext = document.getElementById('btn-lm-next-page');
  if (btnPrev) btnPrev.disabled = lmPage <= 1;
  if (btnNext) btnNext.disabled = lmPage >= totalPages;

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No se encontraron descargas de lead magnets.</td></tr>';
    return;
  }

  tbody.innerHTML = pageItems.map((lm, idx) => {
    const rowNum = startIdx + idx + 1;
    const name = escapeHtml(lm.name || 'Sin nombre');
    const email = escapeHtml(lm.email || 'Sin correo');
    const phone = escapeHtml(lm.phone || 'Sin teléfono');
    
    // Identify lead magnet type nicely
    const rawType = (lm.lead_magnet || lm.landing || '').toLowerCase();
    let lmBadge = '<span class="badge badge--blue">🗺️ Ruta Inversionista</span>';
    if (rawType.includes('estafa') || rawType.includes('anti')) {
      lmBadge = '<span class="badge badge--purple">🛡️ Guía Anti-Estafas</span>';
    }

    // Workshop registration status
    let tallerBadge = lm.is_workshop_registered
      ? '<span class="badge badge--green" style="background:rgba(34, 197, 94, 0.15); color:#4ade80; border:1px solid rgba(34, 197, 94, 0.3);">🟢 Inscrito al Taller</span>'
      : '<span class="badge badge--gray">⚪ Solo Descargó PDF</span>';

    // Source
    const source = escapeHtml(lm.utm_source || 'directo');
    const date = formatDate(lm.created_at);

    return `
      <tr>
        <td><strong>#${rowNum}</strong></td>
        <td><strong>${name}</strong></td>
        <td>
          <div style="font-size:0.85rem;">✉️ ${email}</div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">📱 ${phone}</div>
        </td>
        <td>${lmBadge}</td>
        <td>${tallerBadge}</td>
        <td><span class="badge badge--gray">${source}</span></td>
        <td style="font-size:0.82rem; color:var(--text-muted);">${date}</td>
      </tr>
    `;
  }).join('');
}

function exportLeadMagnetsCSV() {
  if (!filteredLeadMagnets || filteredLeadMagnets.length === 0) {
    alert('No hay leads magnets para exportar.');
    return;
  }

  const headers = [
    'Nombre',
    'Email',
    'Telefono',
    'Lead Magnet',
    'Inscrito al Taller',
    'Landing',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Content',
    'UTM Term',
    'Fecha Descarga'
  ];

  const rows = filteredLeadMagnets.map(lm => [
    lm.name || '',
    lm.email || '',
    lm.phone || '',
    lm.lead_magnet || lm.landing || '',
    lm.is_workshop_registered ? 'SI' : 'NO',
    lm.landing || '',
    lm.utm_source || '',
    lm.utm_medium || '',
    lm.utm_campaign || '',
    lm.utm_content || '',
    lm.utm_term || '',
    lm.created_at || ''
  ]);

  triggerCSVDownload('lead_magnets_descargas.csv', headers, rows);
}


