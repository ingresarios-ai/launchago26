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
});
