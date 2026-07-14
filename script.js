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
// FORM SUBMISSION HANDLER
// ========================================

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[type="text"]').value.trim();
  const email = form.querySelector('input[type="email"]').value.trim();

  if (!name || !email) return;

  const btn = form.querySelector('.btn');
  const originalText = btn.innerHTML;

  btn.innerHTML = '✓ ¡INSCRIPCIÓN REALIZADA!';
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.8';

  setTimeout(function () {
    btn.innerHTML = originalText;
    btn.style.pointerEvents = '';
    btn.style.opacity = '';
    form.reset();
  }, 3000);
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
