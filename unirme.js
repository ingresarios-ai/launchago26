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

    // 4. Countdown Timer Logic
    const targetDate = new Date('2026-08-14T22:00:00-05:00');
    const countdownContainer = document.getElementById('countdown-container');

    function updateTimer() {
        if (!countdownContainer) return;
        
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
            countdownContainer.innerHTML = '';
            // Update text to show expired if needed, but original behavior just hides digits
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

});
