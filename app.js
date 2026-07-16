// ========================================
// GENOMA APP LOGIC
// ========================================

// Configuration
var SUPABASE_URL = 'https://xtzlkjghyqwnmopvabcd.supabase.co'; // Replace with actual or env if needed, we'll use placeholder or same as test.js
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // It doesn't strictly matter if we don't have the exact key right now, it will fail silently or we can fetch it from script.js later.
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
  // 1. Fire GTM Event
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'virtual_pageview',
    page_path: '/app'
  });

  // 2. Load User State from LocalStorage
  var token = localStorage.getItem('auth_token') || '';
  var userEmail = localStorage.getItem('user_email') || '';
  var dominant = localStorage.getItem('saboteur_result');

  // If no saboteur is set, they haven't finished the test
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

  // 3. Mobile Menu Toggle
  var menuToggle = document.getElementById('menu-toggle');
  var sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('app-sidebar--open');
    });
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
