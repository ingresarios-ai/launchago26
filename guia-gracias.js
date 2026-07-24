// ========================================
// GUÍA GRACIAS — Thank You Page JS
// Step 1: Download PDF → Step 2: 1-click Taller Registration
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

// Main taller registration webhook (same as script.js)
let GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/deaadf50-9f15-4372-a5b4-5ec030b01fea';

// ========================================
// BACKGROUND ANIMATION (reuse from guia.js)
// ========================================

(function () {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var width, height, particles;
  var GOLD = { r: 212, g: 168, b: 83 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (var i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.2 + 0.05,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          var opacity = (1 - dist / 120) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(' + GOLD.r + ',' + GOLD.g + ',' + GOLD.b + ',' + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      p.pulse += p.pulseSpeed;
      var da = p.alpha + Math.sin(p.pulse) * 0.08;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + GOLD.r + ',' + GOLD.g + ',' + GOLD.b + ',' + da + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', function () { resize(); createParticles(); });
})();

// ========================================
// LOAD WEBHOOK FROM SUPABASE (same as taller)
// ========================================

(function () {
  fetch(SUPABASE_URL + '/rest/v1/system_settings?key=eq.ghl_registration_webhook', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    if (data && data.length > 0 && data[0].value) {
      GHL_WEBHOOK = data[0].value;
    }
  })
  .catch(function () {});
})();

// ========================================
// POPULATE USER NAME FROM LOCALSTORAGE
// ========================================

var userName = localStorage.getItem('lm_name') || 'Inversionista';
var userNameEl = document.getElementById('user-name');
if (userNameEl) {
  // Show first name only
  var firstName = userName.split(' ')[0];
  userNameEl.textContent = firstName;
}

// ========================================
// STEP 1: DOWNLOAD PDF — UNLOCK STEP 2
// ========================================

var downloadBtn = document.getElementById('download-btn');
var step1 = document.getElementById('step-1');
var step2 = document.getElementById('step-2');
var step1Status = document.getElementById('step1-status');
var step2Status = document.getElementById('step2-status');
var lockedMsg = document.getElementById('locked-msg');
var step2Unlocked = document.getElementById('step2-unlocked');
var progressFill = document.getElementById('progress-fill');
var progressPercent = document.getElementById('progress-percent');

// Check if already downloaded (session persistence)
var hasDownloaded = sessionStorage.getItem('lm_downloaded');
if (hasDownloaded) {
  unlockStep2();
}

downloadBtn.addEventListener('click', function () {
  // Mark as downloaded
  sessionStorage.setItem('lm_downloaded', 'true');

  // Update Step 1 to completed
  step1.classList.remove('gt-step--active');
  step1.classList.add('gt-step--completed');
  step1Status.textContent = '✓ COMPLETADO';
  step1Status.classList.add('gt-step__status--completed');

  // Update step number
  var step1Num = step1.querySelector('.gt-step__number');
  step1Num.innerHTML = '✓';
  step1Num.classList.add('gt-step__number--completed');

  // Progress to 50%
  progressFill.style.width = '50%';
  progressPercent.textContent = '50%';

  // Unlock Step 2 with delay for effect
  setTimeout(function () {
    unlockStep2();
  }, 800);
});

function unlockStep2() {
  // Update step 1 visuals if not already done
  step1.classList.remove('gt-step--active');
  step1.classList.add('gt-step--completed');
  step1Status.textContent = '✓ COMPLETADO';
  step1Status.classList.add('gt-step__status--completed');
  var step1Num = step1.querySelector('.gt-step__number');
  step1Num.innerHTML = '✓';
  step1Num.classList.add('gt-step__number--completed');
  progressFill.style.width = '50%';
  progressPercent.textContent = '50%';

  // Unlock step 2
  step2.classList.remove('gt-step--locked');
  step2.classList.add('gt-step--unlocking');
  step2Status.textContent = 'DESBLOQUEADO';
  step2Status.classList.remove('gt-step__status--locked');

  // Update step 2 number
  var step2Num = step2.querySelector('.gt-step__number');
  step2Num.innerHTML = '2';
  step2Num.classList.remove('gt-step__number--locked');

  // Update title
  var step2Title = step2.querySelector('.gt-step__title');
  step2Title.classList.remove('gt-step__title--locked');

  // Show content, hide locked msg
  lockedMsg.style.display = 'none';
  step2Unlocked.style.display = 'block';

  // Scroll to step 2
  setTimeout(function () {
    step2.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

// ========================================
// STEP 2: 1-CLICK TALLER REGISTRATION
// ========================================

var tallerBtn = document.getElementById('taller-btn');

tallerBtn.addEventListener('click', function () {
  var originalText = tallerBtn.innerHTML;

  // Get stored data from lead magnet registration
  var name = localStorage.getItem('lm_name') || '';
  var email = localStorage.getItem('lm_email') || '';
  var phone = localStorage.getItem('lm_phone') || '';
  var utm_source = localStorage.getItem('lm_utm_source') || '';
  var utm_medium = localStorage.getItem('lm_utm_medium') || '';
  var utm_campaign = localStorage.getItem('lm_utm_campaign') || '';
  var utm_content = localStorage.getItem('lm_utm_content') || '';
  var utm_term = localStorage.getItem('lm_utm_term') || '';

  if (!name || !email) {
    // Fallback: redirect to taller registration page
    window.location.href = 'v2.html';
    return;
  }

  // Disable button
  tallerBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="16" height="16" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> INSCRIBIÉNDOTE...</span>';
  tallerBtn.style.pointerEvents = 'none';
  tallerBtn.style.opacity = '0.8';

  if (!document.getElementById('spinner-style')) {
    var spinStyle = document.createElement('style');
    spinStyle.id = 'spinner-style';
    spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);
  }

  var landing = 'Lead Magnet Ruta del Inversionista';

  var leadData = {
    name: name,
    email: email,
    phone: phone,
    landing: landing,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null
  };

  // 1. POST to Supabase leads table (NOW they are taller leads)
  var supabasePromise = fetch(SUPABASE_URL + '/rest/v1/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    },
    body: JSON.stringify(leadData)
  })
  .then(function (res) {
    if (!res.ok) {
      return res.json().then(function (err) {
        // Duplicate email — get existing token
        if (err.code === '23505') {
          return fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ p_email: email })
          }).then(function (r) { return r.json(); });
        }
        throw new Error(err.message || 'Error al registrar');
      });
    }
    // Get token for new lead
    return fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_email: email })
    }).then(function (r) { return r.json(); });
  });

  supabasePromise.then(function (data) {
    var token = '';
    if (Array.isArray(data) && data.length > 0) {
      token = data[0].get_token_by_email || data[0].auth_token || '';
    } else if (data) {
      token = data.get_token_by_email || data.auth_token || (typeof data === 'string' ? data : '');
    }

    // Fire GHL webhook + magic link in background
    if (token) {
      var magicLink = 'https://taller.ingresarios.net/app?token=' + token;
      var magicLinkEncuesta = 'https://taller.ingresarios.net/encuesta?t=' + token;

      // Update magic link
      fetch(SUPABASE_URL + '/rest/v1/rpc/update_magic_link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_token: token, p_magic_link: magicLink })
      }).catch(function () {});

      // Save magic_link_encuesta
      fetch(SUPABASE_URL + '/rest/v1/leads?auth_token=eq.' + token, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ magic_link_encuesta: magicLinkEncuesta })
      }).catch(function () {});

      // GHL main taller webhook
      var ghlData = Object.assign({}, leadData, {
        source: 'leadmagnet_ruta_inversionista',
        auth_token: token,
        magic_link: magicLink,
        'contact.el__magic_link_encuesta': magicLinkEncuesta
      });

      fetch(GHL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ghlData),
        keepalive: true
      }).catch(function () {});

      // Store token for taller TY page
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_email', email);
      sessionStorage.removeItem('lead_pixel_fired');
    }

    // Update progress
    progressFill.style.width = '100%';
    progressPercent.textContent = '100%';

    // Success state
    tallerBtn.innerHTML = '✓ ¡ESTÁS INSCRITO AL TALLER!';

    // Redirect to taller thank you page
    setTimeout(function () {
      window.location.href = 'gracias.html';
    }, 1200);
  })
  .catch(function (err) {
    console.error('Taller registration error:', err);
    tallerBtn.innerHTML = '⚠️ Error — intenta de nuevo';
    setTimeout(function () {
      tallerBtn.innerHTML = originalText;
      tallerBtn.style.pointerEvents = '';
      tallerBtn.style.opacity = '';
    }, 3000);
  });
});
