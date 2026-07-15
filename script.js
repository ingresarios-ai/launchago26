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
  // Set event date: August 10, 2026
  const eventDate = new Date('2026-08-10T00:00:00-06:00').getTime();

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
document.addEventListener('DOMContentLoaded', populateUTMs);
// Fallback run immediately in case DOMContentLoaded has already fired
populateUTMs();

// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/deaadf50-9f15-4372-a5b4-5ec030b01fea';

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
    name, email, phone, landing,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null
  };

  // 1. POST to Supabase — create lead and get auth_token
  fetch(SUPABASE_URL + '/rest/v1/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(leadData)
  })
  .then(function (res) {
    if (!res.ok) {
      return res.json().then(function (err) {
        // If duplicate email, fetch the existing token
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
    return res.json();
  })
  .then(function (data) {
    var token = '';
    if (Array.isArray(data) && data.length > 0) {
      token = data[0].auth_token;
    } else if (data && data.auth_token) {
      token = data.auth_token;
    } else if (typeof data === 'string') {
      token = data;
    }

    // Generate magic link
    var magicLink = 'https://taller.ingresarios.net/app?token=' + token;

    // Update the lead with the magic link
    if (token) {
      fetch(SUPABASE_URL + '/rest/v1/leads?auth_token=eq.' + token, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ magic_link: magicLink })
      }).catch(function () {}); // fire and forget
    }

    // 2. POST to GHL webhook (in parallel, fire and forget)
    var ghlData = Object.assign({}, leadData, {
      magic_link: magicLink,
      auth_token: token,
      source: 'landing_ingresarios'
    });

    fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ghlData)
    }).catch(function () {}); // fire and forget

    // 3. Show success and redirect to test
    btn.innerHTML = '✓ ¡INSCRIPCIÓN REALIZADA!';

    setTimeout(function () {
      if (token) {
        window.location.href = 'test.html?token=' + token;
      } else {
        // Fallback: show success without redirect
        btn.innerHTML = originalText;
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
        form.reset();
        populateUTMs();
      }
    }, 1200);
  })
  .catch(function (err) {
    console.error('Registration error:', err);
    btn.innerHTML = '⚠️ Error — Intenta de nuevo';
    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
    }, 3000);
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
