// ========================================
// PRE-ACTIVIDAD #2 — LOGIC & CALCULATOR
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

let selectedMonthlyText = '';
let isUserRecognized = false;
let existingToken = '';
let existingEmail = '';

document.addEventListener('DOMContentLoaded', () => {
  checkUserSession();
});

function checkUserSession() {
  existingToken = localStorage.getItem('auth_token') || '';
  existingEmail = localStorage.getItem('user_email') || localStorage.getItem('genoma_user_email') || '';

  const authBlock = document.getElementById('auth-block');
  if (!authBlock) return;

  if (existingToken || existingEmail) {
    isUserRecognized = true;
    authBlock.innerHTML = `
      <div class="auth-block-box">
        <div class="auth-recognized">
          <span class="auth-recognized-icon">✅</span>
          <div class="auth-recognized-info">
            <span class="title">Sesión Activa Detectada</span>
            <span class="sub">${existingEmail ? existingEmail : 'Cuenta vinculada a este dispositivo'}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    isUserRecognized = false;
    authBlock.innerHTML = `
      <div class="auth-block-box">
        <label class="form-label" style="margin-bottom: 8px;">
          <span class="step-num">3</span>
          Ingresa tu correo registrado en el taller
        </label>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">
          Para vincular esta actividad a tu perfil y darte acceso a la App.
        </p>
        <input type="email" id="input-user-email" class="form-input" placeholder="tu-correo@ejemplo.com" required />
      </div>
    `;
  }
}

function calculateLoss() {
  const inputEl = document.getElementById('input-idle-money');
  const cardEl = document.getElementById('impact-card');
  const loss1yrEl = document.getElementById('loss-1yr');
  const loss5yrEl = document.getElementById('loss-5yr');

  if (!inputEl || !cardEl) return;

  const val = parseFloat(inputEl.value);

  if (isNaN(val) || val <= 0) {
    cardEl.style.display = 'none';
    return;
  }

  // Inflation rate assumption: 7.5% per year
  const loss1yr = val * 0.075;
  // 5-year purchasing power loss: ~31% cumulative inflation loss
  const loss5yr = val * 0.31;

  loss1yrEl.textContent = '-$' + Math.round(loss1yr).toLocaleString('en-US') + ' USD';
  loss5yrEl.textContent = '-$' + Math.round(loss5yr).toLocaleString('en-US') + ' USD';
  cardEl.style.display = 'block';
}

function selectMonthly(btnElement, text) {
  const allBtns = document.querySelectorAll('#options-monthly .opt-btn');
  allBtns.forEach(b => b.classList.remove('selected'));

  btnElement.classList.add('selected');
  selectedMonthlyText = text;
}

async function handlePreact2Submit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('btn-submit');
  const idleInput = document.getElementById('input-idle-money');
  const idleAmount = parseFloat(idleInput ? idleInput.value : 0);

  if (isNaN(idleAmount) || idleAmount < 0) {
    showFeedback('Por favor ingresa un monto válido de dinero quieto (o 0).', 'error');
    return;
  }

  if (!selectedMonthlyText) {
    showFeedback('Por favor selecciona una opción de monto mensual en el paso 2.', 'error');
    return;
  }

  let userEmail = existingEmail;
  if (!isUserRecognized) {
    const emailInput = document.getElementById('input-user-email');
    userEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';

    if (!userEmail || !userEmail.includes('@')) {
      showFeedback('Por favor ingresa un correo electrónico válido.', 'error');
      return;
    }
  }

  // Disable button while processing
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg>
      GUARDANDO...
    </span>
  `;

  if (!document.getElementById('spinner-style')) {
    const st = document.createElement('style');
    st.id = 'spinner-style';
    st.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(st);
  }

  try {
    let resolvedToken = existingToken;

    if (!resolvedToken && userEmail) {
      try {
        const resToken = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ p_email: userEmail })
        });
        const dataToken = await resToken.json();

        if (Array.isArray(dataToken) && dataToken.length > 0) {
          resolvedToken = dataToken[0].get_token_by_email || dataToken[0].auth_token || '';
        } else if (dataToken && typeof dataToken === 'string') {
          resolvedToken = dataToken;
        }
      } catch (e) {
        console.warn('Could not resolve token via RPC:', e);
      }
    }

    if (resolvedToken) localStorage.setItem('auth_token', resolvedToken);
    if (userEmail) {
      localStorage.setItem('user_email', userEmail);
      localStorage.setItem('genoma_user_email', userEmail);
    }

    // Save response locally
    const preact2Data = {
      idle_money: idleAmount,
      monthly_investment: selectedMonthlyText,
      email: userEmail,
      completed_at: new Date().toISOString()
    };
    localStorage.setItem('genoma_preact2', JSON.stringify(preact2Data));

    // Send payload to Supabase analytics log
    try {
      await fetch(SUPABASE_URL + '/rest/v1/analytics_pageviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          page: 'preactividad2_submission',
          utm_source: userEmail,
          utm_medium: 'Idle: $' + idleAmount,
          utm_campaign: 'Monthly: ' + selectedMonthlyText
        })
      });
    } catch (errDb) {
      console.warn('Supabase log warning:', errDb);
    }

    showFeedback('¡Excelente! Actividad #2 completada. Redirigiendo a tu App...', 'success');

    setTimeout(() => {
      window.location.href = '/app' + (resolvedToken ? '?token=' + resolvedToken : '');
    }, 1500);

  } catch (err) {
    console.error('Error submitting pre-activity 2:', err);
    showFeedback('Hubo un error al guardar. Por favor intenta de nuevo.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Enviar Actividad</span>';
  }
}

function showFeedback(msg, type) {
  const el = document.getElementById('feedback-msg');
  if (!el) return;
  el.textContent = msg;
  el.className = 'feedback-msg ' + type;
  el.style.display = 'block';
}
