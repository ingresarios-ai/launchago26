// ========================================
// PHONE INPUT WITH FLAGS (intl-tel-input)
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

  // Expose instances for form handling
  window.__itiInstances = itiInstances;
})();

// ========================================
// COUNTDOWN TIMER
// ========================================

(function () {
  // Set event date: August 3, 2026
  const eventDate = new Date('2026-08-03T00:00:00-06:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = eventDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();

// ========================================
// SMOOTH SCROLL TO HERO FORM
// ========================================

document.querySelectorAll('.btn--primary').forEach(function (btn) {
  // Only apply scroll behavior to non-submit buttons
  if (!btn.closest('form')) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const heroForm = document.getElementById('hero-form');
      if (heroForm) {
        heroForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        heroForm.querySelector('input').focus();
      }
    });
  }
});

// ========================================
// UTM PARAMETERS CAPTURE AND FIELD POPULATION
// ========================================

function populateUTMs() {
  const urlParams = new URLSearchParams(window.location.search);
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  utms.forEach(function (utm) {
    const value = urlParams.get(utm) || '';
    document.querySelectorAll(`input[name="${utm}"]`).forEach(function (input) {
      input.value = value;
    });
  });
}

// Populate initially on load
document.addEventListener('DOMContentLoaded', function () {
  populateUTMs();
  loadWebhook();
  trackVisit('landing');
});
// Fallback run immediately in case DOMContentLoaded has already fired
populateUTMs();

// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
let GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/deaadf50-9f15-4372-a5b4-5ec030b01fea';

function loadWebhook() {
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
  .catch(function (err) { console.warn('Error loading registration webhook setting:', err); });
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

// ========================================
// FORM SUBMISSION HANDLER
// ========================================

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.btn');
  const originalText = btn.innerHTML;

  // Get form values
  const name = form.querySelector('input[name="name"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const phoneInput = form.querySelector('.phone-input');

  if (!name || !email) return;

  // Get full international phone number from intl-tel-input
  let phone = '';
  if (window.__itiInstances) {
    const itiIndex = Array.from(document.querySelectorAll('.phone-input')).indexOf(phoneInput);
    if (itiIndex >= 0 && window.__itiInstances[itiIndex]) {
      phone = window.__itiInstances[itiIndex].getNumber();
    }
  }
  if (!phone) phone = phoneInput.value.trim();

  // Get hidden fields
  const landing = form.querySelector('input[name="landing"]').value;
  const utm_source = form.querySelector('input[name="utm_source"]').value;
  const utm_medium = form.querySelector('input[name="utm_medium"]').value;
  const utm_campaign = form.querySelector('input[name="utm_campaign"]').value;
  const utm_content = form.querySelector('input[name="utm_content"]').value;
  const utm_term = form.querySelector('input[name="utm_term"]').value;

  // Detect traffic source from UTMs and override landing
  var detectedLanding = landing; // keep original as fallback
  var utmAll = [utm_source, utm_medium, utm_campaign, utm_content, utm_term]
    .filter(Boolean).join(' ').toLowerCase();
  if (utmAll) {
    if (/\b(ig|instagram)\b/.test(utmAll)) {
      detectedLanding = 'Instagram';
    } else if (/\b(meta|facebook|fb)\b/.test(utmAll)) {
      detectedLanding = 'Facebook';
    } else if (/\b(yt|youtube)\b/.test(utmAll)) {
      detectedLanding = 'Youtube';
    } else if (/\bgoogle\b/.test(utmAll)) {
      detectedLanding = 'Google';
    }
  }

  // Disable button
  btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="16" height="16" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> REGISTRANDO...</span>';
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.8';

  // Add spinner keyframes if not already present
  if (!document.getElementById('spinner-style')) {
    const spinStyle = document.createElement('style');
    spinStyle.id = 'spinner-style';
    spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);
  }

  const leadData = {
    name, email, phone, landing: detectedLanding,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null
  };

  var ghlData = Object.assign({}, leadData, {
    source: 'landing_ingresarios'
  });
  // 2. POST to Supabase — create lead
  fetch(SUPABASE_URL + '/rest/v1/leads', {
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
    // Si fue exitoso, igual obtenemos el token de forma segura con la función RPC
    return fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_email: email })
    }).then(function(r) { return r.json(); })
  })
  .then(function (data) {
    var token = '';
    if (Array.isArray(data) && data.length > 0) {
      token = data[0].get_token_by_email || data[0].auth_token || '';
    } else if (data) {
      token = data.get_token_by_email || data.auth_token || (typeof data === 'string' ? data : '');
    }

    // Fire magic link PATCH + GHL update in background (no wait)
    if (token) {
      var magicLink = 'https://taller.ingresarios.net/app?token=' + token;
      var magicLinkEncuesta = 'https://taller.ingresarios.net/encuesta?t=' + token;
      fetch(SUPABASE_URL + '/rest/v1/rpc/update_magic_link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_token: token, p_magic_link: magicLink })
      }).catch(function () {});

      // Save magic_link_encuesta to leads table
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

      // Update GHL with token + magic links
      fetch(GHL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, ghlData, { auth_token: token, magic_link: magicLink, 'contact.el__magic_link_encuesta': magicLinkEncuesta }))
      }).catch(function () {});
    }

    // Show success and redirect FAST
    btn.innerHTML = '✓ ¡INSCRIPCIÓN REALIZADA!';
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_email', email);
      // Remove pixel fired session flag so it triggers fresh on test load
      sessionStorage.removeItem('lead_pixel_fired');
      window.location.href = 'gracias.html';
    } else {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      form.reset();
      populateUTMs();
    }
  })
  .catch(function (err) {
    console.error('Registration error:', err);
    btn.innerHTML = '⚠️ Error: ' + (err.message || 'Intenta de nuevo');
    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
    }, 4000);
  });
}

document.getElementById('hero-form').addEventListener('submit', handleFormSubmit);
document.getElementById('footer-form').addEventListener('submit', handleFormSubmit);

// ========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ========================================

const observerOptions = {
  rootMargin: '0px 0px -40px 0px',
  threshold: 0.15
};

const animateOnScroll = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      animateOnScroll.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements
document.querySelectorAll('.for-who__card, .step-item, .engine-container, .professor__container, .footer-cta__container').forEach(function (el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  animateOnScroll.observe(el);
});

// CSS class for animation
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// ========================================
// TSPARTICLES BACKGROUND (GENOMA / NETWORK)
// ========================================

window.addEventListener("load", function () {
  if (window.tsParticles) {
    tsParticles.load("tsparticles", {
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.5
            }
          }
        }
      },
      particles: {
        color: {
          value: "#22c55e" // Theme green
        },
        links: {
          color: "#22c55e",
          distance: 150,
          enable: true,
          opacity: 0.5, // Brighter links
          width: 1
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce"
          },
          random: false,
          speed: 0.6,
          straight: false
        },
        number: {
          density: {
            enable: true,
            area: 800
          },
          value: 100 // Increased density
        },
        opacity: {
          value: 0.7 // Increased opacity
        },
        shape: {
          type: "circle"
        },
        size: {
          value: { min: 2, max: 4 } // Slightly larger particles
        }
      },
      detectRetina: true
    });
  }
});
