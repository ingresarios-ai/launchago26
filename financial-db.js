/**
 * FINANCIAL DB & GHL INTEGRATION — EL OTRO 10%
 * Sincronización segura de respuestas en Supabase y GoHighLevel.
 * Soporta usuarios autenticados (auth_token) y usuarios anónimos con modal inteligente.
 */

const FINANCIAL_SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const FINANCIAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

let financialGhlWebhook = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/vSizZsL8C5AkTPpMlfDf';
let currentFinancialUser = null; // { id, name, email, phone, auth_token }
let pendingSavePayload = null;

// Cargar Webhook dinámico desde Supabase
async function loadFinancialWebhook() {
  try {
    const res = await fetch(`${FINANCIAL_SUPABASE_URL}/rest/v1/system_settings?key=eq.ghl_financial_exercises_webhook`, {
      headers: {
        'apikey': FINANCIAL_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${FINANCIAL_SUPABASE_ANON_KEY}`
      }
    });
    const data = await res.json();
    if (data && data.length > 0 && data[0].value) {
      financialGhlWebhook = data[0].value;
    } else {
      // Fallback al webhook de encuesta/registro existente
      const fbRes = await fetch(`${FINANCIAL_SUPABASE_URL}/rest/v1/system_settings?key=eq.ghl_survey_webhook`, {
        headers: {
          'apikey': FINANCIAL_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${FINANCIAL_SUPABASE_ANON_KEY}`
        }
      });
      const fbData = await fbRes.json();
      if (fbData && fbData.length > 0 && fbData[0].value) {
        financialGhlWebhook = fbData[0].value;
      }
    }
  } catch (e) {
    console.warn('[FinancialDB] Usando webhook predeterminado');
  }
}

// Inicializar y detectar token de usuario existente
async function initFinancialUser() {
  await loadFinancialWebhook();
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || urlParams.get('t') || localStorage.getItem('auth_token') || '';

  if (token) {
    try {
      const res = await fetch(`${FINANCIAL_SUPABASE_URL}/rest/v1/rpc/get_lead_by_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': FINANCIAL_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${FINANCIAL_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ p_token: token })
      });
      const result = await res.json();
      const lead = Array.isArray(result) ? result[0] : result;
      if (lead && (lead.id || lead.auth_token)) {
        currentFinancialUser = lead;
        localStorage.setItem('auth_token', lead.auth_token || token);
        renderUserStatus();
      }
    } catch (e) {
      console.warn('[FinancialDB] No se pudo resolver lead por token:', e);
    }
  }
}

// Actualizar indicador visual de usuario en el Navbar
function renderUserStatus() {
  const container = document.getElementById('user-status-container');
  if (!container || !currentFinancialUser) return;

  const displayName = currentFinancialUser.name 
    ? currentFinancialUser.name.split(' ')[0] 
    : (currentFinancialUser.email ? currentFinancialUser.email.split('@')[0] : 'Usuario');

  container.innerHTML = `
    <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.12);border:1px solid rgba(74,222,128,0.3);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;color:#4ade80;">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;"></span>
      <span>${displayName}</span>
    </div>
  `;
}

// Inyectar Modal y Toast en el DOM si no existen
function ensureModalDOM() {
  if (document.getElementById('financial-modal-backdrop')) return;

  const modalHtml = `
    <!-- Backdrop del Modal -->
    <div id="financial-modal-backdrop" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(3,7,18,0.85);backdrop-filter:blur(8px);z-index:99999;align-items:center;justify-content:center;padding:16px;">
      <div id="financial-modal-box" style="background:#0f172a;border:1px solid rgba(74,222,128,0.3);box-shadow:0 20px 40px -10px rgba(0,0,0,0.8),0 0 25px rgba(34,197,94,0.15);border-radius:18px;width:100%;max-width:440px;padding:26px;position:relative;color:#f8fafc;font-family:'Inter',sans-serif;">
        
        <!-- Cerrar -->
        <button type="button" onclick="closeFinancialModal()" style="position:absolute;top:16px;right:16px;background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:18px;line-height:1;padding:4px;">✕</button>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(34,197,94,0.15);border:1px solid rgba(74,222,128,0.3);display:flex;align-items:center;justify-content:center;color:#4ade80;font-size:18px;">💾</div>
          <div>
            <h3 style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#ffffff;margin:0;">Guardar mi Diagnóstico</h3>
            <p style="font-size:11.5px;color:#94a3b8;margin:2px 0 0;">Respalda tus cifras en tu cuenta de Ingresarios</p>
          </div>
        </div>

        <p style="font-size:12.5px;color:#cbd5e1;line-height:1.45;margin-bottom:18px;">
          Ingresa tus datos para vincular este ejercicio con tu progreso y recibir un resumen de tus métricas financieras.
        </p>

        <form id="financial-ident-form" onsubmit="handleModalSubmit(event)" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:12px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">Nombre completo</label>
            <input type="text" id="modal-input-name" required placeholder="Ej. Josué García" style="width:100%;height:42px;background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:0 12px;color:#ffffff;font-size:14px;outline:none;box-sizing:border-box;" />
          </div>

          <div>
            <label style="display:block;font-size:12px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">Correo electrónico</label>
            <input type="email" id="modal-input-email" required placeholder="tu@correo.com" style="width:100%;height:42px;background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:0 12px;color:#ffffff;font-size:14px;outline:none;box-sizing:border-box;" />
          </div>

          <div>
            <label style="display:block;font-size:12px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">WhatsApp (opcional con código de país)</label>
            <input type="tel" id="modal-input-phone" placeholder="Ej. +52 55 1234 5678" style="width:100%;height:42px;background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:0 12px;color:#ffffff;font-size:14px;outline:none;box-sizing:border-box;" />
          </div>

          <div id="modal-error-msg" style="display:none;color:#f87171;font-size:12px;padding:8px;border-radius:6px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);"></div>

          <button type="submit" id="modal-submit-btn" style="height:44px;margin-top:6px;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#041f0f;border:none;border-radius:10px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 15px rgba(34,197,94,0.4);">
            <span>Guardar y Respaldar Respuestas</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="financial-toast" style="display:none;position:fixed;bottom:24px;right:24px;background:#0f172a;border:1px solid #22c55e;color:#ffffff;padding:14px 20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.8),0 0 20px rgba(34,197,94,0.3);z-index:999999;font-family:'Inter',sans-serif;align-items:center;gap:12px;">
      <span style="font-size:20px;">✅</span>
      <div>
        <div style="font-weight:800;font-size:13.5px;color:#4ade80;">¡Respuestas Guardadas!</div>
        <div style="font-size:12px;color:#cbd5e1;" id="financial-toast-msg">Tus datos quedaron respaldados en tu cuenta.</div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openFinancialModal() {
  ensureModalDOM();
  const backdrop = document.getElementById('financial-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'flex';
  }
}

function closeFinancialModal() {
  const backdrop = document.getElementById('financial-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
  }
}

function showFinancialToast(msg) {
  ensureModalDOM();
  const toast = document.getElementById('financial-toast');
  const msgEl = document.getElementById('financial-toast-msg');
  if (msg && msgEl) msgEl.textContent = msg;
  if (toast) {
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 4500);
  }
}

// Envío a Supabase y GHL
async function executeSave(leadInfo, payload) {
  const { exerciseType, data, summary } = payload;
  const token = leadInfo.auth_token || '';
  const leadId = leadInfo.id || null;
  const email = leadInfo.email || '';
  const name = leadInfo.name || '';
  const phone = leadInfo.phone || '';

  // 1. Guardar en Supabase (tabla financial_exercises)
  try {
    await fetch(`${FINANCIAL_SUPABASE_URL}/rest/v1/financial_exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': FINANCIAL_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${FINANCIAL_SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        auth_token: token || null,
        lead_id: leadId,
        email: email || null,
        name: name || null,
        exercise_type: exerciseType,
        data: data || {},
        summary: summary || {},
        source_url: window.location.href,
        updated_at: new Date().toISOString()
      })
    });
  } catch (dbErr) {
    console.warn('[FinancialDB] Error guardando en Supabase:', dbErr);
  }

  // 2. Disparar Webhook a GoHighLevel (Non-blocking)
  try {
    const tag = exerciseType === 'mapa_capital' 
      ? 'ejercicio-mapa-capital-completado' 
      : 'ejercicio-inventario-completado';

    const ghlPayload = {
      name: name,
      email: email,
      phone: phone,
      auth_token: token,
      exercise_type: exerciseType,
      tag: tag,
      submitted_at: new Date().toISOString(),
      ...summary
    };

    fetch(financialGhlWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ghlPayload)
    }).catch(() => {});
  } catch (ghlErr) {
    console.warn('[FinancialDB] Error disparando Webhook GHL:', ghlErr);
  }

  // Feedback de éxito
  showFinancialToast(`Respuestas guardadas para ${email || name || 'tu cuenta'}.`);
  renderUserStatus();
}

// Manejador del Formulario del Modal (para anónimos)
async function handleModalSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('modal-submit-btn');
  const errBox = document.getElementById('modal-error-msg');
  if (errBox) errBox.style.display = 'none';

  const name = document.getElementById('modal-input-name').value.trim();
  const email = document.getElementById('modal-input-email').value.trim().toLowerCase();
  const phone = document.getElementById('modal-input-phone').value.trim();

  if (!email || !name) return;

  btn.disabled = true;
  btn.innerHTML = '<span>Guardando...</span>';

  try {
    let token = '';
    let leadId = null;

    // 1. Intentar registrar en leads
    const leadRes = await fetch(`${FINANCIAL_SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': FINANCIAL_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${FINANCIAL_SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone || '',
        landing: pendingSavePayload ? pendingSavePayload.exerciseType : 'Ejercicio Financiero'
      })
    });

    if (leadRes.ok) {
      const created = await leadRes.json();
      const lead = Array.isArray(created) ? created[0] : created;
      token = lead ? lead.auth_token : '';
      leadId = lead ? lead.id : null;
    } else {
      // Si ya existe (código 23505 u otro), buscar el token existente por email
      const tokenRes = await fetch(`${FINANCIAL_SUPABASE_URL}/rest/v1/rpc/get_token_by_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': FINANCIAL_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${FINANCIAL_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ p_email: email })
      });
      const tData = await tokenRes.json();
      if (Array.isArray(tData) && tData.length > 0) {
        token = tData[0].get_token_by_email || tData[0].auth_token || (typeof tData[0] === 'string' ? tData[0] : '');
      } else if (tData) {
        token = tData.get_token_by_email || tData.auth_token || (typeof tData === 'string' ? tData : '');
      }
    }

    if (token) {
      localStorage.setItem('auth_token', token);
      currentFinancialUser = { id: leadId, name, email, phone, auth_token: token };
    } else {
      currentFinancialUser = { id: leadId, name, email, phone, auth_token: '' };
    }

    closeFinancialModal();

    if (pendingSavePayload) {
      await executeSave(currentFinancialUser, pendingSavePayload);
    }
  } catch (err) {
    console.error('[FinancialDB] Error en registro modal:', err);
    if (errBox) {
      errBox.textContent = 'Hubo un inconveniente al guardar. Tus datos se enviaron de respaldo.';
      errBox.style.display = 'block';
    }
    // Fallback: guardar con los datos proporcionados
    currentFinancialUser = { name, email, phone, auth_token: '' };
    closeFinancialModal();
    if (pendingSavePayload) {
      executeSave(currentFinancialUser, pendingSavePayload);
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Guardar y Respaldar Respuestas</span>';
  }
}

/**
 * Función Pública para Disparar Guardado de Cualquier Ejercicio
 * @param {Object} opts - { exerciseType, data, summary }
 */
async function saveFinancialExercise(opts) {
  ensureModalDOM();
  pendingSavePayload = opts;

  if (currentFinancialUser && (currentFinancialUser.auth_token || currentFinancialUser.email)) {
    // Usuario ya conocido: guardar con 1 clic
    const saveBtn = document.getElementById('btn-save-exercise') || document.getElementById('btn-save-db');
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<span>Guardando...</span>';
      saveBtn.disabled = true;
      await executeSave(currentFinancialUser, opts);
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    } else {
      await executeSave(currentFinancialUser, opts);
    }
  } else {
    // Usuario anónimo: abrir modal
    openFinancialModal();
  }
}

// Iniciar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initFinancialUser();
  ensureModalDOM();
});
