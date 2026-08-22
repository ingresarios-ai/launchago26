document.addEventListener('DOMContentLoaded', () => {
    // 1. VTurb Video Script Injection (Lote 1: 69f30bf860a0504bace79458, Lote 2: 69f3961fc864fc4eeacc1a99)
    const scriptId = 'vturb-player-script';
    const playerId = '69f30bf860a0504bace79458'; // Defaults to Lote 1 based on HTML scrape
    const scriptSrc = `https://scripts.converteai.net/6f88db54-0f9b-4a7c-af05-9ae2f56f3fdf/players/${playerId}/v4/player.js`;

    if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.src = scriptSrc;
        s.async = true;
        document.head.appendChild(s);
    }

    // 2. Smooth Scrolling to #checkout
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#checkout') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 3. FAQ Accordion Logic
    const faqButtons = document.querySelectorAll('.faq-btn');
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const svgIcon = button.querySelector('svg');
            const isOpen = content.style.display === 'block';

            // Close all others
            document.querySelectorAll('.faq-content').forEach(c => {
                c.style.display = 'none';
                c.style.height = '0';
            });
            document.querySelectorAll('.faq-btn svg').forEach(svg => {
                // Reset to ChevronDown
                svg.innerHTML = '<path d="m6 9 6 6 6-6"></path>';
            });

            if (!isOpen) {
                // Open this one
                content.style.display = 'block';
                content.style.height = 'auto';
                // Change to ChevronUp
                svgIcon.innerHTML = '<path d="m18 15-6-6-6 6"></path>';
            }
        });
    });

    // 4. Countdown Timer Logic (Closes Friday Aug 21, 2026 at 11:59:59 PM Bogotá / UTC-5)
    const targetDate = new Date('2026-08-21T23:59:59-05:00');
    const countdownContainer = document.getElementById('countdown-container');
    let closedScreenShown = false;

    function showClosedScreen() {
        if (closedScreenShown) return;
        closedScreenShown = true;

        // Hide urgency banner, main content, sticky buttons, WhatsApp
        const banner = document.getElementById('urgency-banner');
        const mainEl = document.querySelector('main');
        const stickyBtn = document.getElementById('sticky-cart-btn');
        const waBtn = document.querySelector('a[href*="walink.co"]');
        if (banner) banner.style.display = 'none';
        if (mainEl) mainEl.style.display = 'none';
        if (stickyBtn) stickyBtn.style.display = 'none';
        if (waBtn) waBtn.style.display = 'none';

        // Create full-screen closed overlay
        const overlay = document.createElement('div');
        overlay.id = 'closed-overlay';
        overlay.innerHTML = `
<style>
  #closed-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #03120A;
    display: flex; align-items: center; justify-content: center;
    overflow-y: auto; padding: 24px 16px;
    font-family: inherit; color: white;
  }
  #closed-overlay * { box-sizing: border-box; }
  .closed-card {
    width: 100%; max-width: 520px;
    background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px; padding: 40px 32px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 80px rgba(0,209,255,0.08), 0 0 40px rgba(0,230,118,0.05);
    text-align: center;
  }
  .closed-card .closed-emoji { font-size: 56px; margin-bottom: 16px; display: block; }
  .closed-card h1 {
    font-size: 28px; font-weight: 900; text-transform: uppercase;
    letter-spacing: 0.02em; margin: 0 0 8px; line-height: 1.2;
    background: linear-gradient(135deg, #ef4444, #f97316);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .closed-card .sub {
    font-size: 15px; color: rgba(255,255,255,0.6); margin: 0 0 32px;
    line-height: 1.6; font-weight: 400;
  }
  .closed-card .sub strong { color: white; font-weight: 700; }
  .closed-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
  .closed-form input {
    width: 100%; padding: 14px 16px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: white;
    font-size: 15px; outline: none; transition: border-color 0.2s;
  }
  .closed-form input:focus { border-color: rgba(0,209,255,0.5); }
  .closed-form input::placeholder { color: rgba(255,255,255,0.35); }
  .closed-form .iti { width: 100%; }
  .closed-form .iti input { padding-left: 52px; }
  .closed-submit {
    width: 100%; padding: 16px; border: none; border-radius: 14px;
    background: linear-gradient(135deg, #00e676, #00c853);
    color: #03120A; font-size: 16px; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer; transition: all 0.3s;
    box-shadow: 0 0 20px rgba(0,230,118,0.25);
  }
  .closed-submit:hover {
    box-shadow: 0 0 30px rgba(0,230,118,0.5);
    transform: translateY(-1px);
  }
  .closed-submit:disabled { opacity: 0.6; cursor: wait; }
  .closed-card .closed-footer {
    font-size: 12px; color: rgba(255,255,255,0.35);
    margin-top: 16px; line-height: 1.5;
  }
  .closed-card .closed-logo { height: 36px; margin: 0 auto 24px; display: block; }
  .closed-success {
    padding: 32px 0; text-align: center;
  }
  .closed-success .check-icon {
    width: 64px; height: 64px; margin: 0 auto 16px;
    background: rgba(0,230,118,0.1); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(0,230,118,0.3);
  }
  .closed-success h2 {
    font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #00e676;
  }
  .closed-success p {
    font-size: 14px; color: rgba(255,255,255,0.6); margin: 0;
    line-height: 1.6;
  }
  @media (max-width: 480px) {
    .closed-card { padding: 32px 20px; }
    .closed-card h1 { font-size: 22px; }
  }
</style>
<div class="closed-card">
  <img src="/ingresarios-logo.webp" alt="Ingresarios" class="closed-logo" />
  <span class="closed-emoji">🔒</span>
  <h1>Inscripciones Cerradas</h1>
  <p class="sub">
    El período de inscripción al <strong>Método Ingresarios</strong> ha finalizado.<br>
    Déjanos tus datos y te avisaremos cuando abramos la próxima convocatoria.
  </p>
  <form id="closed-waitlist-form" class="closed-form">
    <input type="text" name="name" placeholder="Tu nombre completo" required autocomplete="name" />
    <input type="email" name="email" placeholder="Tu correo electrónico" required autocomplete="email" />
    <input type="tel" name="phone" class="closed-phone-input" placeholder="Tu WhatsApp" required autocomplete="tel" />
    <button type="submit" class="closed-submit">Quiero que me avisen →</button>
  </form>
  <p class="closed-footer">🔒 Tus datos están seguros. No compartimos tu información con terceros.</p>
</div>
`;
        document.body.appendChild(overlay);

        // Initialize intl-tel-input on the closed form phone field
        const closedPhoneInput = overlay.querySelector('.closed-phone-input');
        if (closedPhoneInput && window.intlTelInput) {
            const closedIti = window.intlTelInput(closedPhoneInput, {
                initialCountry: 'auto',
                geoIpLookup: function (cb) {
                    fetch('https://ipapi.co/json/')
                        .then(r => r.json())
                        .then(d => cb(d.country_code))
                        .catch(() => cb('mx'));
                },
                preferredCountries: ['mx', 'co', 'ar', 'es', 'cl', 'pe', 'br', 'us'],
                separateDialCode: true,
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js',
            });

            // Handle form submission
            const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

            overlay.querySelector('#closed-waitlist-form').addEventListener('submit', async function (ev) {
                ev.preventDefault();
                const form = ev.target;
                const btn = form.querySelector('.closed-submit');
                const name = form.querySelector('input[name="name"]').value.trim();
                const email = form.querySelector('input[name="email"]').value.trim();
                let phone = closedIti.getNumber() || closedPhoneInput.value.trim();

                if (!name || !email) return;

                btn.disabled = true;
                btn.textContent = 'REGISTRANDO...';

                // Get UTM params from URL
                const urlParams = new URLSearchParams(window.location.search);

                const leadData = {
                    name, email, phone,
                    landing: 'Lista de Espera',
                    utm_source: urlParams.get('utm_source') || null,
                    utm_medium: urlParams.get('utm_medium') || null,
                    utm_campaign: urlParams.get('utm_campaign') || null,
                    utm_content: urlParams.get('utm_content') || null,
                    utm_term: urlParams.get('utm_term') || null,
                };

                try {
                    await fetch(SUPABASE_URL + '/rest/v1/leads', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(leadData)
                    });
                } catch (e) {
                    // Non-blocking — continue to thank you
                }

                // Show success state
                const card = overlay.querySelector('.closed-card');
                card.innerHTML = `
                    <img src="/ingresarios-logo.webp" alt="Ingresarios" class="closed-logo" />
                    <div class="closed-success">
                        <div class="check-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e676" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2>¡Registro Exitoso!</h2>
                        <p>
                            Gracias, <strong style="color:white">${name}</strong>.<br>
                            Te notificaremos a <strong style="color:white">${email}</strong><br>
                            cuando abramos la próxima convocatoria.
                        </p>
                    </div>
                    <p class="closed-footer">Síguenos en redes sociales para no perderte ninguna novedad.</p>
                `;
            });
        }
    }

    function updateTimer() {
        if (!countdownContainer) return;
        
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
            showClosedScreen();
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        let html = '';
        
        if (days > 0) {
            html += `
                <div class="flex flex-col items-center">
                    <span class="bg-[#03120A] text-red-500 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xl md:text-3xl min-w-[40px] md:min-w-[60px] text-center shadow-inner border border-red-500/30 font-mono">
                        ${String(days).padStart(2, '0')}
                    </span>
                    <span class="text-[10px] md:text-xs uppercase font-bold mt-1 opacity-90 tracking-widest">Días</span>
                </div>
                <span class="text-xl md:text-3xl font-black mb-4 opacity-80 animate-pulse">:</span>
            `;
        }

        html += `
            <div class="flex flex-col items-center">
                <span class="bg-[#03120A] text-red-500 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xl md:text-3xl min-w-[40px] md:min-w-[60px] text-center shadow-inner border border-red-500/30 font-mono">
                    ${String(hours).padStart(2, '0')}
                </span>
                <span class="text-[10px] md:text-xs uppercase font-bold mt-1 opacity-90 tracking-widest">Hrs</span>
            </div>
            <span class="text-xl md:text-3xl font-black mb-4 opacity-80 animate-pulse">:</span>
            <div class="flex flex-col items-center">
                <span class="bg-[#03120A] text-red-500 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xl md:text-3xl min-w-[40px] md:min-w-[60px] text-center shadow-inner border border-red-500/30 font-mono">
                    ${String(minutes).padStart(2, '0')}
                </span>
                <span class="text-[10px] md:text-xs uppercase font-bold mt-1 opacity-90 tracking-widest">Min</span>
            </div>
            <span class="text-xl md:text-3xl font-black mb-4 opacity-80 animate-pulse">:</span>
            <div class="flex flex-col items-center">
                <span class="bg-[#03120A] text-red-500 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xl md:text-3xl min-w-[40px] md:min-w-[60px] text-center shadow-inner border border-red-500/30 font-mono">
                    ${String(seconds).padStart(2, '0')}
                </span>
                <span class="text-[10px] md:text-xs uppercase font-bold mt-1 opacity-90 tracking-widest">Seg</span>
            </div>
        `;

        countdownContainer.innerHTML = html;
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    // 5. Sticky Cart Button Scroll Visibility
    const stickyCartBtn = document.getElementById('sticky-cart-btn');
    if (stickyCartBtn) {
        const handleScroll = () => {
            const checkoutSec = document.getElementById('checkout');
            if (checkoutSec) {
                const rect = checkoutSec.getBoundingClientRect();
                // If user is inside checkout section, hide sticky button to avoid duplication
                if (rect.top <= window.innerHeight - 100 && rect.bottom >= 100) {
                    stickyCartBtn.classList.add('is-hidden');
                } else {
                    stickyCartBtn.classList.remove('is-hidden');
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

});

