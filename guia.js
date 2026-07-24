// ========================================
// LEAD MAGNET — guia.js
// Handles: Canvas animation, Phone input, UTMs, Form submission
// Sends to SEPARATE table + webhook (NOT taller leads)
// ========================================

// ---- Supabase Config (same project) ----
const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

// Lead magnet webhook (SEPARATE from taller registration)
const LM_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/a67a6c81-5b0a-4d33-af79-6ed894c3d64c';

// ========================================
// ANIMATED BACKGROUND — Floating particles / coins
// ========================================

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles;
  const GOLD = { r: 212, g: 168, b: 83 };
  const PARTICLE_COUNT = 60;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.05,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const opacity = (1 - dist / 150) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.pulse += p.pulseSpeed;
      const dynamicAlpha = p.alpha + Math.sin(p.pulse) * 0.1;

      // Outer glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${dynamicAlpha * 0.15})`;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${dynamicAlpha})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
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
  window.addEventListener('resize', function () {
    resize();
    createParticles();
  });
})();

// ========================================
// PHONE INPUT WITH FLAGS
// ========================================

(function () {
  const phoneInputs = document.querySelectorAll('.phone-input');
  const itiInstances = [];

  phoneInputs.forEach(function (input) {
    const iti = window.intlTelInput(input, {
      initialCountry: 'auto',
      geoIpLookup: function (callback) {
        fetch('https://ipapi.co/json/')
          .then(function (res) { return res.json(); })
          .then(function (data) { callback(data.country_code); })
          .catch(function () { callback('mx'); });
      },
      preferredCountries: ['mx', 'co', 'ar', 'es', 'cl', 'pe', 'br', 'us'],
      separateDialCode: true,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js',
    });
    itiInstances.push(iti);
  });

  window.__itiInstances = itiInstances;
})();

// ========================================
// UTM CAPTURE
// ========================================

function populateUTMs() {
  const urlParams = new URLSearchParams(window.location.search);
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  utms.forEach(function (utm) {
    const value = urlParams.get(utm) || '';
    document.querySelectorAll('input[name="' + utm + '"]').forEach(function (input) {
      input.value = value;
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  populateUTMs();
});
populateUTMs();

// ========================================
// SCROLL REVEAL ANIMATIONS
// ========================================

(function () {
  var revealEls = document.querySelectorAll('.lm-inside__card, .lm-urgency__stat, .lm-urgency__cta, .lm-author__container');
  revealEls.forEach(function (el) {
    el.classList.add('lm-reveal');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.15 });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

// ========================================
// FORM SUBMISSION — LEAD MAGNET ONLY
// ========================================

document.getElementById('lm-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('.lm-btn');
  var originalText = btn.innerHTML;

  // Get values
  var name = form.querySelector('input[name="name"]').value.trim();
  var email = form.querySelector('input[name="email"]').value.trim();
  var phoneInput = form.querySelector('.phone-input');

  if (!name || !email) return;

  // Full international phone
  var phone = '';
  if (window.__itiInstances) {
    var itiIndex = Array.from(document.querySelectorAll('.phone-input')).indexOf(phoneInput);
    if (itiIndex >= 0 && window.__itiInstances[itiIndex]) {
      phone = window.__itiInstances[itiIndex].getNumber();
    }
  }
  if (!phone) phone = phoneInput.value.trim();

  // UTMs
  var utm_source = form.querySelector('input[name="utm_source"]').value;
  var utm_medium = form.querySelector('input[name="utm_medium"]').value;
  var utm_campaign = form.querySelector('input[name="utm_campaign"]').value;
  var utm_content = form.querySelector('input[name="utm_content"]').value;
  var utm_term = form.querySelector('input[name="utm_term"]').value;
  var landing = form.querySelector('input[name="landing"]').value;
  var lead_magnet = form.querySelector('input[name="lead_magnet"]').value;

  // Disable button
  btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="16" height="16" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> ENVIANDO...</span>';
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.8';

  if (!document.getElementById('spinner-style')) {
    var spinStyle = document.createElement('style');
    spinStyle.id = 'spinner-style';
    spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);
  }

  var leadData = {
    name: name,
    email: email,
    phone: phone,
    landing: landing,
    lead_magnet: lead_magnet,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null
  };

  // 1. POST to Supabase — leads_magnets table (SEPARATE from taller leads)
  var supabasePromise = fetch(SUPABASE_URL + '/rest/v1/leads_magnets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(leadData)
  }).catch(function (err) {
    console.warn('Supabase leads_magnets error:', err);
  });

  // 2. POST to Lead Magnet webhook (GHL — separate automation)
  var webhookPayload = Object.assign({}, leadData, {
    source: 'leadmagnet_ruta_inversionista'
  });

  var webhookPromise = fetch(LM_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload),
    keepalive: true
  }).catch(function (err) {
    console.warn('LM Webhook error:', err);
  });

  // Wait for both, then redirect
  Promise.all([supabasePromise, webhookPromise]).then(function () {
    btn.innerHTML = '✓ ¡LISTO! PREPARANDO TU GUÍA...';

    // Store lead data for the thank you page (1-click taller registration)
    localStorage.setItem('lm_name', name);
    localStorage.setItem('lm_email', email);
    localStorage.setItem('lm_phone', phone);
    localStorage.setItem('lm_utm_source', utm_source || '');
    localStorage.setItem('lm_utm_medium', utm_medium || '');
    localStorage.setItem('lm_utm_campaign', utm_campaign || '');
    localStorage.setItem('lm_utm_content', utm_content || '');
    localStorage.setItem('lm_utm_term', utm_term || '');
    localStorage.setItem('lm_lead_magnet', lead_magnet);
    localStorage.setItem('lm_pdf_url', '/referencias/La-Ruta-del-Inversionista-desde-Cero.pdf');
    localStorage.setItem('lm_pdf_title', 'La Ruta del Inversionista desde Cero');

    setTimeout(function () {
      var redirectUrl = window.__lmRedirectUrl || 'guia-gracias.html';
      window.location.href = redirectUrl;
    }, 400);
  }).catch(function (err) {
    console.error('Registration error:', err);
    btn.innerHTML = '⚠️ Error — intenta de nuevo';
    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
    }, 3000);
  });
});
