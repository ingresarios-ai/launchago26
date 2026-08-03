// ========================================
// ACTIVIDAD DEL DÍA — ENGINE
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
const GHL_WEBHOOK_REG = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/deaadf50-9f15-4372-a5b4-5ec030b01fea';

let currentDay = 1;
let leadData = null;
let isLoggedIn = false;
let itiInstance = null;

// Daily Missions Data
const dailyMissions = {
  1: {
    dayDate: "3 de Agosto",
    title: "Día 1: La Anatomía del Saboteador",
    desc: "Identifica cuál de los 4 saboteadores financieros (El Vengador, El Eufórico, El Impaciente o El Paralizado) controla tu cuenta.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">¿Cuál es tu Saboteador Financiero dominante o mayor reto emocional?</label>
        <select id="field-saboteur-type" class="form-input" required style="margin-bottom:12px;">
          <option value="">-- Selecciona tu Saboteador o mayor reto --</option>
          <option value="El Vengador">🥊 El Vengador (Quiero recuperar pérdidas inmediatamente)</option>
          <option value="El Eufórico">🚀 El Eufórico (Sobre-arriesgo después de ganar)</option>
          <option value="El Impaciente">⚡ El Impaciente (Entro antes de la confirmación)</option>
          <option value="El Paralizado">🧊 El Paralizado (Dudo y me me da miedo ejecutar)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">¿En qué situación sientes que tu Saboteador toma el control?</label>
        <textarea id="field-saboteur-desc" class="form-textarea" rows="3" placeholder="Ej: Cuando pierdo un trade, me da rabia y abro otra posición sin analizar..." required></textarea>
      </div>
    `
  },
  2: {
    dayDate: "4 de Agosto",
    title: "Día 2: Cuenta Abierta: El Espejo de la Mente",
    desc: "Redacta tu Regla #1 Anti-Saboteador para evitar que las emociones controlen tus operaciones.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Escribe tu Regla #1 Anti-Saboteador <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day2-rule" class="form-textarea" rows="3" placeholder="Ej: Si pierdo 2 trades seguidos en el día, apago la pantalla por hoy..." required></textarea>
      </div>
    `
  },
  3: {
    dayDate: "5 de Agosto",
    title: "Día 3: El Plan que Tu Saboteador No Puede Renegociar",
    desc: "Describe el peor trade que tu Saboteador hizo por ti y qué le faltó al plan con el hashtag #JuegoMental.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Misión Viral: Describe tu peor trade por Saboteador <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day3-trade" class="form-textarea" rows="3" placeholder="Ej: Entré por impulsividad en Bitcoin sin Stop Loss y mi Saboteador Eufórico me hizo perder... #JuegoMental" required></textarea>
      </div>
    `
  },
  4: {
    dayDate: "6 de Agosto",
    title: "Día 4: Ejecución con IA (Conoce a GENY)",
    desc: "Registra tu primer Paper Trade (simulado) con gestión de riesgo previa.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Activo Financiero (Ej: BTC/USD, Nasdaq, Gold)</label>
        <input id="field-day4-asset" type="text" class="form-input" placeholder="Ej: BTC/USD" required />
      </div>
      <div class="form-group">
        <label class="form-label">Señal de IA / Análisis (Ej: Geny Trend Alcista 15M)</label>
        <input id="field-day4-signal" type="text" class="form-input" placeholder="Ej: Geny Trend Alcista 15M" required />
      </div>
      <div class="form-group">
        <label class="form-label">Nivel de Stop Loss de Invalidación</label>
        <input id="field-day4-stop" type="text" class="form-input" placeholder="Ej: $64,200" required />
      </div>
    `
  },
  5: {
    dayDate: "7 de Agosto",
    title: "Día 5: La Bitácora del Saboteador",
    desc: "Documenta tu trade en la Bitácora PEDEM registrando las emociones de tu Saboteador.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Registro de Bitácora PEDEM y Emociones <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day5-log" class="form-textarea" rows="3" placeholder="Ej: Trade en Nasdaq. Sentí ansiedad al inicio pero respeté el Stop Loss al 100%..." required></textarea>
      </div>
    `
  },
  6: {
    dayDate: "8 de Agosto",
    title: "Día 6: La Rúbrica PEDEM",
    desc: "Evalúa del 1 al 5 la disciplina con la que ejecutaste tu plan en la sesión de hoy.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Calificación de Disciplina (1 al 5)</label>
        <select id="field-day6-score" class="form-input" required>
          <option value="5">5 — Disciplina Perfecta (Seguí el plan 100%)</option>
          <option value="4">4 — Alta Disciplina (Mínimas dudas)</option>
          <option value="3">3 — Disciplina Media (Tuve tentación de romper reglas)</option>
          <option value="2">2 — Baja Disciplina (Improvisé en 1 trade)</option>
          <option value="1">1 — Sin Disciplina (El Saboteador tomó el control)</option>
        </select>
      </div>
    `
  },
  7: {
    dayDate: "9 de Agosto",
    title: "Día 7: Asistencia a la Masterclass en Vivo",
    desc: "Confirma tu asistencia a la Masterclass interactiva de 120 minutos.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">¿Qué aprendizaje principal te llevas de la Masterclass?</label>
        <textarea id="field-day7-learning" class="form-textarea" rows="3" placeholder="Ej: Entendí la importancia de la regla de invalidación y la gestión dinámica..." required></textarea>
      </div>
    `
  },
  8: {
    dayDate: "10 de Agosto",
    title: "Día 8: Panel de Casos Reales (Q&A)",
    desc: "Escribe tu pregunta o duda personal para que Juan la responda en vivo.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Tu Pregunta Personal para el Q&A <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day8-question" class="form-textarea" rows="3" placeholder="Escribe aquí tu pregunta o duda de trading o mentalidad..." required></textarea>
      </div>
    `
  },
  9: {
    dayDate: "11 de Agosto",
    title: "Día 9: Autoevaluación de Evolución Mental",
    desc: "Compara tu estado mental del Día 1 vs hoy. Describe tu transformación.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Tu Autoevaluación de Evolución Mental <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day9-eval" class="form-textarea" rows="3" placeholder="Ej: Llegué como Vengador impulsivo y hoy opero bajo un sistema de reglas estrictas..." required></textarea>
      </div>
    `
  },
  10: {
    dayDate: "12 de Agosto",
    title: "Día 10: La Gran Final y Premiación",
    desc: "Reclama tu Bonus de Racha Perfecta y valida tus entradas al Sorteo Final.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Comentario Final / Testimonio del Taller</label>
        <textarea id="field-day10-feedback" class="form-textarea" rows="3" placeholder="Escribe tu testimonio sobre tu experiencia en el taller..." required></textarea>
      </div>
    `
  }
};

// DOM Init
document.addEventListener('DOMContentLoaded', initActivity);

function determineDay() {
  if (window.FORCE_DAY) return window.FORCE_DAY;
  const urlParams = new URLSearchParams(window.location.search);
  let day = parseInt(urlParams.get('dia') || urlParams.get('d') || '1', 10);
  
  // Match path /actividad1, /mision1 etc.
  const path = window.location.pathname;
  const match = path.match(/(?:actividad|mision)(\d+)/i);
  if (match) {
    day = parseInt(match[1], 10);
  }

  if (isNaN(day) || day < 1 || day > 10) day = 1;
  return day;
}

async function initActivity() {
  currentDay = determineDay();
  
  // Setup Day Data
  const mission = dailyMissions[currentDay] || dailyMissions[1];
  document.getElementById('day-badge').textContent = `Día ${currentDay}`;
  document.getElementById('act-title').textContent = mission.title;
  document.getElementById('act-desc').textContent = mission.desc;
  document.getElementById('activity-fields').innerHTML = mission.renderForm();

  // Check Login / Session Status
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || urlParams.get('t') || localStorage.getItem('auth_token') || '';
  const storedEmail = localStorage.getItem('user_email') || '';

  if (token) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_token: token })
      });
      const leads = await res.json();
      if (Array.isArray(leads) && leads.length > 0) {
        leadData = leads[0];
        isLoggedIn = true;
        localStorage.setItem('auth_token', token);
        if (leadData.email) localStorage.setItem('user_email', leadData.email);
      }
    } catch (err) {
      console.warn('Session lookup error:', err);
    }
  }

  updateRaffleBanner();

  if (!isLoggedIn) {
    // Show registration fields inline if not logged in
    document.getElementById('reg-section').style.display = 'block';
    
    // Init Phone Input
    const phoneInput = document.getElementById('reg-phone');
    if (phoneInput && window.intlTelInput) {
      itiInstance = window.intlTelInput(phoneInput, {
        initialCountry: 'co',
        preferredCountries: ['co', 'mx', 'pe', 'ar', 'cl', 'us'],
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
      });
    }

    // Email listener to auto-toggle name/phone if new user
    const emailEl = document.getElementById('reg-email');
    if (emailEl) {
      emailEl.addEventListener('blur', checkEmailExists);
    }
  }
}

function updateRaffleBanner() {
  const banner = document.getElementById('raffle-banner');
  const title = document.getElementById('raffle-banner-title');
  const desc = document.getElementById('raffle-banner-desc');

  if (isLoggedIn) {
    banner.classList.add('raffle-banner--logged');
    title.textContent = '🔥 ¡Ya estás participando oficialmente en el Gran Sorteo!';
    desc.innerHTML = `Hola <strong>${leadData ? (leadData.name || 'participante') : ''}</strong>. Al enviar tu respuesta ganas <strong>+30 Puntos Genoma</strong> y aumentas tus oportunidades en el sorteo de la <strong>Beca Método Ingresarios + Algoritmos + IA + Computador</strong>. ¡Sigue conectado a los en vivos a las 8:00 PM (CO) para multiplicar tus puntos! 🚀`;
  } else {
    banner.classList.remove('raffle-banner--logged');
    title.textContent = '🔥 ¡Gana tus primeros +30 puntos para el Gran Sorteo!';
    desc.innerHTML = `Responde libremente la actividad. Al finalizar, ingresa tu correo para guardar tu respuesta, asegurar tu boleto para la <strong>Beca Método Ingresarios + Algoritmos + IA + Computador</strong> y multiplicar tus puntos en los en vivos. 🚀`;
  }
}

async function checkEmailExists() {
  const emailEl = document.getElementById('reg-email');
  if (!emailEl) return;
  const email = emailEl.value.trim().toLowerCase();
  if (!email || !email.includes('@')) return;

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_email: email })
    });
    const data = await res.json();
    let token = '';
    if (Array.isArray(data) && data.length > 0) {
      token = data[0].get_token_by_email || data[0].auth_token || (typeof data[0] === 'string' ? data[0] : '');
    } else if (data) {
      token = data.get_token_by_email || data.auth_token || (typeof data === 'string' ? data : '');
    }

    const newFields = document.getElementById('new-user-fields');
    if (!token) {
      // New user -> show name and phone fields
      if (newFields) newFields.style.display = 'block';
    } else {
      // Existing user -> hide extra fields
      if (newFields) newFields.style.display = 'none';
    }
  } catch (err) {
    console.warn('Check email error:', err);
  }
}

async function handleActivitySubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-activity');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block; animation:spin 0.8s linear infinite;">⏳</span> Guardando...';

  // Gather Form Data
  const formData = {};
  const inputs = document.querySelectorAll('.form-input, .form-textarea, select');
  inputs.forEach(inp => {
    if (inp.id) formData[inp.id] = inp.value;
  });

  try {
    if (!isLoggedIn) {
      // Handle Identification / Registration
      const emailEl = document.getElementById('reg-email');
      const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
      if (!email) {
        alert('Por favor ingresa tu correo electrónico.');
        btn.disabled = false;
        btn.innerHTML = '<span>GUARDAR Y PARTICIPAR EN EL SORTEO</span> 🚀';
        return;
      }

      // Check if email exists
      let token = '';
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

      if (!token) {
        // Register New Lead
        const nameEl = document.getElementById('reg-name');
        const name = nameEl ? nameEl.value.trim() : '';
        let phone = '';
        if (itiInstance) phone = itiInstance.getNumber();
        if (!phone) {
          const phoneEl = document.getElementById('reg-phone');
          if (phoneEl) phone = phoneEl.value.trim();
        }

        if (!name || !phone) {
          alert('Por favor ingresa tu nombre y teléfono para completar tu registro.');
          document.getElementById('new-user-fields').style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = '<span>GUARDAR Y PARTICIPAR EN EL SORTEO</span> 🚀';
          return;
        }

        // Create Lead
        const createRes = await fetch(SUPABASE_URL + '/rest/v1/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            landing: `Actividad Día ${currentDay}`
          })
        });

        if (createRes.ok) {
          const resData = await createRes.json();
          token = Array.isArray(resData) ? (resData[0].auth_token || '') : (resData.auth_token || '');
        }

        // Fire GHL Webhook
        fetch(GHL_WEBHOOK_REG, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            event: 'activity_registration',
            day: currentDay
          })
        }).catch(() => {});
      }

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', email);
        
        // Fetch Lead
        const leadRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ p_token: token })
        });
        const leads = await leadRes.json();
        if (Array.isArray(leads) && leads.length > 0) leadData = leads[0];
      }
    }

    // Save Mission Response to Supabase
    try {
      await fetch(SUPABASE_URL + '/rest/v1/mission_responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          lead_id: leadData ? leadData.id : null,
          day: currentDay,
          response_data: formData,
          points_awarded: 30,
          created_at: new Date().toISOString()
        })
      });
    } catch (saveErr) {
      console.warn('Mission response save warning:', saveErr);
    }

    // Save Progress Milestone
    try {
      if (leadData && leadData.auth_token) {
        await fetch(SUPABASE_URL + '/rest/v1/user_progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            lead_id: leadData.id,
            milestone: `day_${currentDay}_completed`,
            completed_at: new Date().toISOString()
          })
        });
      }
    } catch (progErr) {
      console.warn('User progress save warning:', progErr);
    }

    // Always Show Success View
    showSuccessView();

  } catch (err) {
    console.error('Activity submission error:', err);
    showSuccessView();
  }
}

function showSuccessView() {
  document.getElementById('activity-view').style.display = 'none';
  document.getElementById('success-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
