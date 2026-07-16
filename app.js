// ========================================
// GENOMA APP LOGIC
// ========================================

// Configuration
var SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
var GHL_WEBHOOK_MISSION = 'https://services.leadconnectorhq.com/hooks/5lqXoVlR4T1kO7P6Jb9/webhook-trigger/446a81ca-9430-4e3e-8c3f-7f7813a0429f';
var GHL_WEBHOOK_INTENTION = 'https://services.leadconnectorhq.com/hooks/5lqXoVlR4T1kO7P6Jb9/webhook-trigger/intention-webhook-id'; // To be configured

// Saboteur Data map
var saboteurs = {
  vengador: { emoji: '🔥', name: 'El Vengador' },
  euforico: { emoji: '🎰', name: 'El Eufórico' },
  impaciente: { emoji: '⚡', name: 'El Impaciente' },
  paralizado: { emoji: '🧊', name: 'El Paralizado' }
};

document.addEventListener('DOMContentLoaded', function () {

  // 1. Check Magic Link & WhatsApp Progress
  var params = new URLSearchParams(window.location.search);
  var urlToken = params.get('token');
  var token = urlToken || localStorage.getItem('auth_token') || '';
  
  if (!token) {
    window.location.href = '/';
    return;
  }
  
  if (urlToken) {
    localStorage.setItem('auth_token', urlToken);
  }

  document.body.style.opacity = '0.5';
  document.body.style.pointerEvents = 'none';

  fetch(SUPABASE_URL + '/rest/v1/rpc/get_progress_by_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
    body: JSON.stringify({ p_token: token })
  })
  .then(function(r) { return r.json(); })
  .then(function(progress) {
    var hasWhatsapp = progress && progress.length > 0 && progress.some(function(p) { return p.milestone === 'whatsapp_clicked'; });
    if (!hasWhatsapp) {
      window.location.href = 'test.html?token=' + token;
      return;
    }
    
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
    initApp();
  })
  .catch(function(err) {
    console.error('Magic link check failed', err);
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
    initApp();
  });

  function initApp() {
    var userEmail = localStorage.getItem('user_email') || '';
    var dominant = localStorage.getItem('saboteur_result');

    if (!dominant) {
      window.location.href = 'test.html';
      return;
    }

    var sab = saboteurs[dominant];
    if (sab) {
      document.getElementById('saboteur-emoji').textContent = sab.emoji;
      document.getElementById('saboteur-name').textContent = sab.name;
      
      var missionSab = document.getElementById('mission-saboteur');
      if (missionSab) {
        missionSab.textContent = sab.name;
      }
    }

    var menuToggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('app-sidebar--open');
      });
    }
  }
});

// ========================================
// INTERACTIONS
// ========================================

function submitIntention() {
  var inputEl = document.getElementById('intention-input');
  var btnEl = document.getElementById('btn-intention');
  var val = inputEl.value.trim();

  if (!val) {
    inputEl.style.borderColor = '#ef4444';
    setTimeout(function () { inputEl.style.borderColor = ''; }, 2000);
    return;
  }

  btnEl.style.pointerEvents = 'none';
  btnEl.innerHTML = 'Guardando...';

  var token = localStorage.getItem('auth_token') || '';
  var email = localStorage.getItem('user_email') || '';

  // Fire Webhook or save to DB (Silently for now)
  // fetch(GHL_WEBHOOK_INTENTION, { ... })

  setTimeout(function () {
    btnEl.innerHTML = '✓ Intención Establecida';
    btnEl.style.background = 'transparent';
    btnEl.style.border = '1px solid var(--green)';
    btnEl.style.color = 'var(--green)';
    inputEl.disabled = true;
  }, 800);
}

function submitMission() {
  var responseEl = document.getElementById('mission-input');
  var btn = document.getElementById('btn-mission');
  var response = responseEl.value.trim();

  if (!response) {
    responseEl.style.borderColor = '#ef4444';
    responseEl.setAttribute('placeholder', 'Escribe algo antes de enviar...');
    setTimeout(function () {
      responseEl.style.borderColor = '';
      responseEl.setAttribute('placeholder', 'Mi Saboteador me hizo...');
    }, 2500);
    return;
  }

  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';
  btn.innerHTML = 'Enviando...';

  var token = localStorage.getItem('auth_token') || '';
  var userEmail = localStorage.getItem('user_email') || '';

  // Fire GHL webhook
  if (GHL_WEBHOOK_MISSION) {
    fetch(GHL_WEBHOOK_MISSION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'mission_completed',
        auth_token: token,
        email: userEmail,
        mission_id: 'mission_01',
        response: response,
        timestamp: new Date().toISOString()
      })
    }).catch(function () {});
  }

  // Visual success
  setTimeout(function () {
    btn.innerHTML = '✓ Misión Completada';
    btn.style.opacity = '1';
    btn.style.background = 'rgba(34, 197, 94, 0.1)';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    responseEl.disabled = true;
  }, 1000);
}
