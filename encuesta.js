// ========================================
// ENCUESTA LANZAMIENTO — ENGINE
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

let GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/vSizZsL8C5AkTPpMlfDf';

let currentStep = 1;
let leadData = null;
let isAnonymous = false;  // true when no token
let totalSteps = 2;
let itiInstance = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', init);

async function loadWebhook() {
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/system_settings?key=eq.ghl_survey_webhook', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    const data = await res.json();
    if (data && data.length > 0 && data[0].value) {
      GHL_WEBHOOK = data[0].value;
    }
  } catch (err) {
    console.warn('Error loading survey webhook setting:', err);
  }
}

function trackVisit(pageName) {
  try {
    const sessionKey = 'tracked_visit_' + pageName;
    if (sessionStorage.getItem(sessionKey)) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source') || null;
    const utm_medium = urlParams.get('utm_medium') || null;
    const utm_campaign = urlParams.get('utm_campaign') || null;
    const utm_content = urlParams.get('utm_content') || null;
    const utm_term = urlParams.get('utm_term') || null;

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    fetch(SUPABASE_URL + '/rest/v1/analytics_pageviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        page: pageName,
        utm_source: utm_source,
        utm_medium: utm_medium,
        utm_campaign: utm_campaign,
        utm_content: utm_content,
        utm_term: utm_term,
        session_id: sessionId
      })
    }).catch(function() {});

    sessionStorage.setItem(sessionKey, 'true');
  } catch (err) {
    console.warn('Analytics tracking error:', err);
  }
}

async function init() {
  loadWebhook();
  trackVisit('encuesta');
  const token = new URLSearchParams(window.location.search).get('t');
  
  if (!token) {
    // Anonymous mode — show survey with generic greeting, add registration step
    isAnonymous = true;
    totalSteps = 3;
    setupAnonymousMode();
    showSurvey();
    return;
  }

  try {
    // 1. Validate token — get lead data
    const leadRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_token: token })
    });

    const leadResult = await leadRes.json();
    const lead = Array.isArray(leadResult) ? leadResult[0] : leadResult;

    if (!lead || !lead.id) {
      // Invalid token → treat as anonymous
      isAnonymous = true;
      totalSteps = 3;
      setupAnonymousMode();
      showSurvey();
      return;
    }

    leadData = lead;

    // 2. Check if already completed
    const surveyRes = await fetch(
      SUPABASE_URL + '/rest/v1/survey_responses?lead_id=eq.' + lead.id + '&select=id',
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      }
    );

    const existing = await surveyRes.json();

    if (existing && existing.length > 0) {
      showCompleted();
      return;
    }

    // 3. Show survey (authenticated mode)
    const firstName = (lead.name || '').split(' ')[0] || 'amigo';
    document.getElementById('user-name').textContent = firstName;
    showSurvey();

  } catch (err) {
    console.error('Init error:', err);
    // On error, fall back to anonymous mode
    isAnonymous = true;
    totalSteps = 3;
    setupAnonymousMode();
    showSurvey();
  }
}

// ===== ANONYMOUS MODE SETUP =====
function setupAnonymousMode() {
  // Generic greeting
  document.getElementById('user-name').textContent = 'amigo';
  
  // Hide submit button on step 2, show "Siguiente" button instead
  document.getElementById('submit-btn').style.display = 'none';
  document.getElementById('step2-next-btn').style.display = 'inline-flex';

  // Init intl-tel-input for phone
  setTimeout(function() {
    var phoneEl = document.getElementById('enc-phone');
    if (phoneEl && window.intlTelInput) {
      itiInstance = window.intlTelInput(phoneEl, {
        initialCountry: 'co',
        preferredCountries: ['co', 'us', 'mx', 'es', 'cl', 'pe', 've', 'ca'],
        separateDialCode: true,
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
      });
    }
  }, 100);
}

// ===== SCREEN MANAGEMENT =====
function showError() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('error-screen').style.display = 'flex';
}

function showCompleted() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('completed-screen').style.display = 'flex';
}

function showSurvey() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('survey-screen').style.display = 'block';
  updateProgress();
}

// ===== STEP NAVIGATION =====
function updateProgress() {
  const pct = ((currentStep - 1) / totalSteps) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}

function nextStep(from) {
  // Validate required fields in current step
  const stepEl = document.querySelector(`.step[data-step="${from}"]`);
  if (!validateStep(stepEl)) return;

  stepEl.style.display = 'none';
  currentStep = from + 1;
  const nextEl = document.querySelector(`.step[data-step="${currentStep}"]`);
  nextEl.style.display = 'block';
  nextEl.style.animation = 'none';
  nextEl.offsetHeight; // trigger reflow
  nextEl.style.animation = 'fadeIn 0.4s ease';
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(from) {
  const stepEl = document.querySelector(`.step[data-step="${from}"]`);
  stepEl.style.display = 'none';
  currentStep = from - 1;
  const prevEl = document.querySelector(`.step[data-step="${currentStep}"]`);
  prevEl.style.display = 'block';
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== VALIDATION =====
function validateStep(stepEl) {
  let valid = true;

  // Check required radio groups
  const radioGroups = stepEl.querySelectorAll('.radio-group[data-name]');
  radioGroups.forEach(group => {
    const name = group.dataset.name;
    const checked = stepEl.querySelector(`input[name="${name}"]:checked`);
    const card = group.closest('.question-card');
    if (!checked && stepEl.querySelector(`input[name="${name}"][required]`)) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 500);
      if (valid) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      valid = false;
    }
  });

  // Check required textareas and inputs
  const requiredFields = stepEl.querySelectorAll('textarea[required], input[type="text"][required], input[type="email"][required], input[type="tel"][required]');
  requiredFields.forEach(field => {
    const card = field.closest('.question-card');
    if (!field.value.trim()) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 500);
      if (valid) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      valid = false;
    }
  });

  // Check required checkboxes
  const requiredChecks = stepEl.querySelectorAll('input[type="checkbox"][required]');
  requiredChecks.forEach(cb => {
    if (!cb.checked) {
      const card = cb.closest('.question-card');
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 500);
      if (valid) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      valid = false;
    }
  });

  return valid;
}

// ===== FORM SUBMISSION =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('survey-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
});

async function handleSubmit(e) {
  e.preventDefault();

  if (isAnonymous) {
    await handleAnonymousSubmit(e);
  } else {
    await handleAuthenticatedSubmit(e);
  }
}

// ===== AUTHENTICATED SUBMIT (with token) =====
async function handleAuthenticatedSubmit(e) {
  // Validate step 2
  const stepEl = document.querySelector(`.step[data-step="2"]`);
  if (!validateStep(stepEl)) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></span> Enviando...';

  const formData = new FormData(e.target);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });

  try {
    // Save session locally
    if (leadData && leadData.auth_token) {
      localStorage.setItem('auth_token', leadData.auth_token);
    }
    if (leadData && leadData.email) {
      localStorage.setItem('user_email', leadData.email);
    }

    // 1. Save to Supabase (safe non-blocking)
    try {
      await fetch(SUPABASE_URL + '/rest/v1/survey_responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          lead_id: leadData ? leadData.id : null,
          edad: data.edad || null,
          pais: data.pais || null,
          genero: data.genero || null,
          situacion: data.situacion || null,
          area_trabajo: data.area_trabajo || null,
          estudios: data.estudios || null,
          ingresos: data.ingresos || null,
          tiene_hijos: data.tiene_hijos || null,
          tiempo_conociendo: data.tiempo_conociendo || null,
          razon_inscripcion: data.razon_inscripcion || null,
          mayor_reto: data.mayor_reto || null,
          por_que_inversion: data.por_que_inversion || null,
          ha_invertido: data.ha_invertido || null,
          tema_especifico: data.tema_especifico || null,
          nivel_experiencia: data.nivel_experiencia || null,
          pregunta_cafe: data.pregunta_cafe || null
        })
      });
    } catch (dbErr) {
      console.warn('Supabase survey_responses save error:', dbErr);
    }

    // 2. Send to GHL webhook (safe)
    try {
      await sendToGHL(data);
    } catch (ghlErr) {
      console.warn('GHL webhook error:', ghlErr);
    }

    // 3. Always show thank you
    showThankYou();

  } catch (err) {
    console.error('Submit error:', err);
    showThankYou();
  }
}

// ===== ANONYMOUS SUBMIT (no token — register + save) =====
async function handleAnonymousSubmit(e) {
  // Validate step 3 (registration)
  const stepEl = document.querySelector(`.step[data-step="3"]`);
  if (!validateStep(stepEl)) return;

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></span> Registrando...';

  const formData = new FormData(e.target);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });

  // Get registration data
  const name = (data.reg_name || '').trim();
  const email = (data.reg_email || '').trim().toLowerCase();
  var phone = '';
  if (itiInstance) {
    phone = itiInstance.getNumber();
  }
  if (!phone) phone = (data.reg_phone || '').trim();

  try {
    // 1. Create lead in Supabase
    const leadPayload = {
      name: name,
      email: email,
      phone: phone,
      landing: 'Encuesta Directa'
    };

    const createRes = await fetch(SUPABASE_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(leadPayload)
    });

    var token = '';

    if (createRes.ok) {
      const createdData = await createRes.json();
      if (Array.isArray(createdData) && createdData.length > 0) {
        token = createdData[0].auth_token || '';
      } else if (createdData) {
        token = createdData.auth_token || '';
      }
    } else {
      const errData = await createRes.json();
      if (errData.code === '23505') {
        // Already registered — get token via RPC
        const tokenRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ p_email: email })
        });
        const tokenData = await tokenRes.json();
        if (Array.isArray(tokenData) && tokenData.length > 0) {
          token = tokenData[0].get_token_by_email || tokenData[0].auth_token || (typeof tokenData[0] === 'string' ? tokenData[0] : '');
        } else if (tokenData) {
          token = tokenData.get_token_by_email || tokenData.auth_token || (typeof tokenData === 'string' ? tokenData : '');
        }
      } else {
        throw new Error(errData.message || 'Error al registrar');
      }
    }

    if (!token) {
      // Fallback query if token still empty
      const tokenRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_email: email })
      });
      const tokenData = await tokenRes.json();
      if (Array.isArray(tokenData) && tokenData.length > 0) {
        token = tokenData[0].get_token_by_email || tokenData[0].auth_token || (typeof tokenData[0] === 'string' ? tokenData[0] : '');
      } else if (tokenData) {
        token = tokenData.get_token_by_email || tokenData.auth_token || (typeof tokenData === 'string' ? tokenData : '');
      }
    }

    if (!token) throw new Error('No se pudo obtener el token');

    // 2. Get lead ID for survey save
    const leadRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_token: token })
    });
    const leadResult = await leadRes.json();
    const lead = Array.isArray(leadResult) ? leadResult[0] : leadResult;

    if (!lead || !lead.id) throw new Error('Lead not found');
    leadData = lead;

    // 3. Save magic links on lead
    var magicLink = 'https://taller.ingresarios.net/app?token=' + token;
    var magicLinkEncuesta = 'https://taller.ingresarios.net/encuesta?t=' + token;

    fetch(SUPABASE_URL + '/rest/v1/leads?auth_token=eq.' + token, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        magic_link: magicLink,
        magic_link_encuesta: magicLinkEncuesta
      })
    }).catch(function() {});

    // 4. Save survey responses
    const saveRes = await fetch(SUPABASE_URL + '/rest/v1/survey_responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        lead_id: lead.id,
        edad: data.edad || null,
        pais: data.pais || null,
        genero: data.genero || null,
        situacion: data.situacion || null,
        area_trabajo: data.area_trabajo || null,
        estudios: data.estudios || null,
        ingresos: data.ingresos || null,
        tiene_hijos: data.tiene_hijos || null,
        tiempo_conociendo: data.tiempo_conociendo || null,
        razon_inscripcion: data.razon_inscripcion || null,
        mayor_reto: data.mayor_reto || null,
        por_que_inversion: data.por_que_inversion || null,
        ha_invertido: data.ha_invertido || null,
        tema_especifico: data.tema_especifico || null,
        nivel_experiencia: data.nivel_experiencia || null,
        pregunta_cafe: data.pregunta_cafe || null
      })
    });

    // Ignore duplicate error (they already responded)
    if (!saveRes.ok && saveRes.status !== 409) {
      throw new Error('Error saving survey');
    }

    // 5. Send to GHL webhook with registration + survey data
    var ghlPayload = {
      name: name,
      email: email,
      phone: phone,
      source: 'encuesta_directa',
      landing: 'Encuesta Directa',
      auth_token: token,
      magic_link: magicLink,
      'contact.el__magic_link_encuesta': magicLinkEncuesta,
      'contact.el__rango_de_edad': data.edad || '',
      'contact.el__pas': data.pais || '',
      'contact.el__gnero': data.genero || '',
      'contact.el__situacin_laboral': data.situacion || '',
      'contact.el__rea_de_trabajo': data.area_trabajo || '',
      'contact.el__grado_de_estudios': data.estudios || '',
      'contact.el__ingresos_mensuales_usd': data.ingresos || '',
      'contact.el__tiene_hijos': data.tiene_hijos || '',
      'contact.el__tiempo_conociendo': data.tiempo_conociendo || '',
      'contact.el__razn_de_inscripcin': data.razon_inscripcion || '',
      'contact.el__mayor_reto_riqueza': data.mayor_reto || '',
      'contact.el__por_qu_inversin': data.por_que_inversion || '',
      'contact.el__ha_invertido': data.ha_invertido || '',
      'contact.el__tema_especfico': data.tema_especifico || '',
      'contact.el__nivel_experiencia_trading': data.nivel_experiencia || '',
      'contact.el__pregunta_del_caf': data.pregunta_cafe || '',
      'contact.el__encuesta_completada': 'Sí'
    };

    fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ghlPayload)
    }).catch(function() {});

    // 6. Store token and redirect to gracias
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    window.location.href = 'gracias.html';

  } catch (err) {
    console.error('Registration error:', err);
    btn.disabled = false;
    btn.innerHTML = 'INSCRIBIRME Y ENVIAR <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    alert('Hubo un error al registrar. Por favor intenta de nuevo.');
  }
}

// ===== THANK YOU =====
function showThankYou() {
  document.getElementById('survey-form').style.display = 'none';
  document.getElementById('survey-intro').style.display = 'none';
  document.querySelectorAll('.step-label').forEach(el => el.remove());
  document.getElementById('thank-you').style.display = 'block';
  document.getElementById('progress-bar').style.width = '100%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== GHL WEBHOOK (authenticated mode) =====
async function sendToGHL(data) {
  var magicLink = leadData ? ('https://taller.ingresarios.net/app?token=' + (leadData.auth_token || '')) : '';
  var magicLinkEncuesta = leadData ? ('https://taller.ingresarios.net/encuesta?t=' + (leadData.auth_token || '')) : '';

  const payload = {
    // Lead identification
    email: leadData ? leadData.email : '',
    name: leadData ? leadData.name : '',
    phone: leadData ? leadData.phone : '',
    auth_token: leadData ? (leadData.auth_token || '') : '',
    magic_link: magicLink,
    'contact.el__magic_link_encuesta': magicLinkEncuesta,
    // Survey responses with field keys
    'contact.el__rango_de_edad': data.edad || '',
    'contact.el__pas': data.pais || '',
    'contact.el__gnero': data.genero || '',
    'contact.el__situacin_laboral': data.situacion || '',
    'contact.el__rea_de_trabajo': data.area_trabajo || '',
    'contact.el__grado_de_estudios': data.estudios || '',
    'contact.el__ingresos_mensuales_usd': data.ingresos || '',
    'contact.el__tiene_hijos': data.tiene_hijos || '',
    'contact.el__tiempo_conociendo': data.tiempo_conociendo || '',
    'contact.el__razn_de_inscripcin': data.razon_inscripcion || '',
    'contact.el__mayor_reto_riqueza': data.mayor_reto || '',
    'contact.el__por_qu_inversin': data.por_que_inversion || '',
    'contact.el__ha_invertido': data.ha_invertido || '',
    'contact.el__tema_especfico': data.tema_especifico || '',
    'contact.el__nivel_experiencia_trading': data.nivel_experiencia || '',
    'contact.el__pregunta_del_caf': data.pregunta_cafe || '',
    'contact.el__encuesta_completada': 'Sí'
  };

  await fetch(GHL_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

