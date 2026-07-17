// ========================================
// GRACIAS PAGE — LOGIC v2
// 90% Progress bar + WhatsApp unlock + Platform reveal
// ========================================

(function () {
  // ========================================
  // AUTH CHECK
  // ========================================
  var token = localStorage.getItem('auth_token') || '';
  
  if (!token) {
    window.location.href = '/';
    return;
  }

  // ========================================
  // SUPABASE CONFIG
  // ========================================
  var SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
  var GHL_WEBHOOK_WHATSAPP = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/c17e220a-db9c-42ba-8665-421ed7c223a4';

  // ========================================
  // WHATSAPP BUTTON (must be declared before unlockStep2 call)
  // ========================================
  var waBtn = document.getElementById('whatsapp-btn');

  // ========================================
  // CHECK IF ALREADY CLICKED WHATSAPP
  // ========================================
  var alreadyClicked = localStorage.getItem('whatsapp_clicked_local') === 'true';
  
  if (alreadyClicked) {
    unlockStep2(true); // instant, no animation
  }

  // ========================================
  // WHATSAPP BUTTON CLICK HANDLER
  // ========================================
  
  waBtn.addEventListener('click', function () {
    // Mark as clicked
    localStorage.setItem('whatsapp_clicked_local', 'true');

    // Fire GHL webhook (fire and forget)
    if (GHL_WEBHOOK_WHATSAPP) {
      fetch(GHL_WEBHOOK_WHATSAPP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'whatsapp_clicked',
          auth_token: token,
          email: localStorage.getItem('user_email') || '',
          timestamp: new Date().toISOString()
        })
      }).catch(function () {});
    }

    // Save progress to Supabase
    fetch(SUPABASE_URL + '/rest/v1/user_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        auth_token: token,
        milestone: 'whatsapp_clicked',
        completed_at: new Date().toISOString()
      })
    }).catch(function () {});

    // Push GTM event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'whatsapp_group_joined',
        auth_token: token
      });
    }

    // Unlock step 2 with animation (delay for WA to open first)
    setTimeout(function () {
      unlockStep2(false);
    }, 800);
  });

  // ========================================
  // UNLOCK STEP 2
  // ========================================
  function unlockStep2(instant) {
    var progressFill = document.getElementById('progress-fill');
    var progressPercent = document.getElementById('progress-percent');
    var progressHint = document.getElementById('progress-hint');
    var step1 = document.getElementById('step-1');
    var step1Status = document.getElementById('step1-status');
    var step2 = document.getElementById('step-2');
    var step2Status = document.getElementById('step2-status');
    var lockedMsg = document.getElementById('locked-msg');
    var platformBtn = document.getElementById('platform-btn');
    var stepNumber = step2.querySelector('.ty-step__number');
    var stepTitle = step2.querySelector('.ty-step__title');

    if (instant) {
      // No animation, just set final state
      progressFill.style.transition = 'none';
    }

    // 1. Progress bar → 100%
    progressFill.style.width = '100%';
    progressPercent.textContent = '100%';
    progressHint.textContent = '¡Registro completo!';
    progressHint.classList.add('ty-progress__hint--complete');

    // 2. Step 1 → completed state
    step1.classList.remove('ty-step--active');
    step1.classList.add('ty-step--completed');
    step1Status.textContent = '✅ COMPLETADO';
    step1Status.className = 'ty-step__status ty-step__status--complete';

    // Update WhatsApp button to "done" state
    waBtn.classList.remove('ty-btn--whatsapp');
    waBtn.classList.add('ty-btn--whatsapp-done');
    waBtn.innerHTML = '✅ Ya estás en el grupo de WhatsApp';

    // 3. Step 2 → unlocked
    step2.classList.remove('ty-step--locked');
    step2.classList.add('ty-step--unlocked');
    step2Status.textContent = 'DESBLOQUEADO';
    step2Status.className = 'ty-step__status ty-step__status--complete';
    
    // Update step number
    stepNumber.classList.remove('ty-step__number--locked');
    stepNumber.classList.add('ty-step__number--unlocked');
    stepNumber.innerHTML = '2';
    
    // Update title
    stepTitle.classList.remove('ty-step__title--locked');
    stepTitle.classList.add('ty-step__title--unlocked');

    // Hide locked message
    lockedMsg.style.display = 'none';

    // Show platform button
    platformBtn.style.display = 'flex';
    platformBtn.href = 'app.html?token=' + token;
  }

  // ========================================
  // COUNTDOWN — 3 de agosto 2026
  // ========================================

  var eventDate = new Date('2026-08-04T02:00:00Z'); // Aug 3, 8PM CDT = Aug 4 02:00 UTC

  function updateCountdown() {
    var now = new Date();
    var diff = eventDate - now;

    if (diff <= 0) {
      document.getElementById('ty-days').textContent = '00';
      document.getElementById('ty-hours').textContent = '00';
      document.getElementById('ty-minutes').textContent = '00';
      document.getElementById('ty-seconds').textContent = '00';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('ty-days').textContent = days < 10 ? '0' + days : days;
    document.getElementById('ty-hours').textContent = hours < 10 ? '0' + hours : hours;
    document.getElementById('ty-minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('ty-seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

})();
