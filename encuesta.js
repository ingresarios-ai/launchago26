// ========================================
// ENCUESTA LANZAMIENTO — ENGINE
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/vSizZsL8C5AkTPpMlfDf';

let currentStep = 1;
let leadData = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', init);

async function init() {
  const token = new URLSearchParams(window.location.search).get('t');
  
  if (!token) {
    showError();
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
      showError();
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

    // 3. Show survey
    const firstName = (lead.name || '').split(' ')[0] || 'amigo';
    document.getElementById('user-name').textContent = firstName;
    showSurvey();

  } catch (err) {
    console.error('Init error:', err);
    showError();
  }
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
  const totalSteps = 2;
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

  // Check required textareas
  const textareas = stepEl.querySelectorAll('textarea[required]');
  textareas.forEach(ta => {
    const card = ta.closest('.question-card');
    if (!ta.value.trim()) {
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
    // 1. Save to Supabase
    const saveRes = await fetch(SUPABASE_URL + '/rest/v1/survey_responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        lead_id: leadData.id,
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

    if (!saveRes.ok) {
      throw new Error('Error saving to database');
    }

    // 2. Send to GHL webhook (non-blocking)
    sendToGHL(data).catch(err => console.warn('GHL webhook error:', err));

    // 3. Show thank you
    document.getElementById('survey-form').style.display = 'none';
    document.getElementById('survey-intro').style.display = 'none';
    document.querySelector('.step-label')?.remove();
    document.getElementById('thank-you').style.display = 'block';
    document.getElementById('progress-bar').style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error('Submit error:', err);
    btn.disabled = false;
    btn.innerHTML = 'Enviar respuestas <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    alert('Hubo un error al enviar. Por favor intenta de nuevo.');
  }
}

// ===== GHL WEBHOOK =====
async function sendToGHL(data) {
  const payload = {
    // Lead identification
    email: leadData.email,
    name: leadData.name,
    phone: leadData.phone,
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
