// ========================================
// GENOMA CERO - JOURNEY ENGINE
// ========================================

const STORAGE_KEY = 'genoma_current_activity';
const MAX_ACTIVITIES = 9;

// Current state (starts at 1 if not set)
let currentActivity = parseInt(localStorage.getItem(STORAGE_KEY)) || 1;

// Activity Data Map (Phase 1 implementations)
const activitiesData = {
  1: {
    title: "Preparación: Genoma 0",
    reward: "+20 pts",
    render: () => {
      // Always show the welcome video
      return `
        <p class="activity-desc">Tu viaje para recuperar el control comienza aquí. Observa el video, entiende las reglas del juego y da el primer paso.</p>
        <div style="margin-bottom: 24px;">
          <vturb-smartplayer id="vid-6a595795c02fb54b9a39a625" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"><div class="vturb-player-placeholder" style="position: relative; width: 100%; padding: 176.66666666666666% 0 0; z-index: 0; background-color: black;"></div></vturb-smartplayer>
        </div>
        <div class="checklist">
          <label class="check-item" onclick="this.classList.toggle('checked')">
            <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
            <span>He visto el video completo</span>
          </label>
          <label class="check-item" onclick="this.classList.toggle('checked')">
            <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
            <span>Agregado al calendario</span>
          </label>
        </div>
      `;
    }
  },
  2: {
    title: "Test del Saboteador",
    reward: "+30 pts",
    render: () => {
      const hasSaboteur = localStorage.getItem('saboteur_result');
      if (hasSaboteur) {
        // Already completed test — show result summary
        const saboteur = hasSaboteur;
        const sabMap = {
          vengador: { emoji: '🔥', name: 'El Vengador', desc: 'Sientes la necesidad urgente de recuperar lo perdido inmediatamente, rompiendo tus reglas y aumentando tu riesgo por venganza emocional.' },
          euforico: { emoji: '🎰', name: 'El Eufórico', desc: 'Ganas y te sientes invencible. Aumentas el tamaño de tu posición ignorando tu plan por exceso de confianza.' },
          impaciente: { emoji: '⚡', name: 'El Impaciente', desc: 'No puedes esperar. Entras al mercado antes de que tu sistema te dé confirmación por miedo a quedarte fuera (FOMO).' },
          paralizado: { emoji: '🧊', name: 'El Paralizado', desc: 'El miedo a equivocarte te congela. Ves pasar las oportunidades claras frente a ti y no ejecutas por sobrepensarlo todo.' }
        };
        const info = sabMap[saboteur] || sabMap.vengador;
        return `
          <p class="activity-desc">Los resultados de tu diagnóstico revelan que este es el principal patrón mental que debes dominar para tener éxito.</p>
          <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 24px; border-radius: 16px; text-align: center; margin-top: 16px;">
            <div style="font-size: 48px; margin-bottom: 12px;">${info.emoji}</div>
            <h3 style="color: var(--text-main); font-size: 1.5rem; margin: 0 0 8px 0;">${info.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin:0 0 20px 0;">${info.desc}</p>
            <button class="btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="retakeTest()">
              REPETIR EL TEST
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </button>
          </div>
        `;
      } else {
        // No test done yet — render the saboteur test inline
        return `
          <div id="inline-test">
            <div id="test-intro-section">
              <div style="text-align:center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 12px;">🧠</div>
                <h3 style="color: var(--text-main); font-size: 1.3rem; margin: 0 0 8px 0;">Test del Saboteador</h3>
              </div>
              <p class="activity-desc">Dos personas con la misma estrategia: una quiebra, la otra vive de esto. La diferencia nunca fue la estrategia — fue <strong>quién ejecutaba.</strong></p>
              <p class="activity-desc" style="margin-bottom: 4px;">Responde 8 situaciones reales y descubre cuál de los <strong>4 saboteadores</strong> controla tu cuenta.</p>
              <p style="color: var(--text-muted); font-size: 0.8rem; display: flex; align-items: center; gap: 6px; margin-bottom: 20px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                2 minutos
              </p>
              <button class="btn-primary" style="width:100%" onclick="startInlineTest()">DESCUBRIR MI SABOTEADOR</button>
            </div>
            <div id="test-question-section" style="display:none;">
              <div style="margin-bottom: 16px;">
                <div class="inline-test-progress-track">
                  <div class="inline-test-progress-fill" id="inline-test-progress" style="width: 0%;"></div>
                </div>
                <p id="inline-test-counter" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">Pregunta 1 de 8</p>
              </div>
              <h3 id="inline-test-question" style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 16px; line-height: 1.4;"></h3>
              <div id="inline-test-options"></div>
            </div>
            <div id="test-analyzing-section" style="display:none; text-align: center; padding: 40px 0;">
              <div style="font-size: 48px; margin-bottom: 16px; animation: spin 2s linear infinite;">🧠</div>
              <h3 style="color: var(--text-main); font-size: 1.2rem; margin-bottom: 12px;">Analizando tus respuestas...</h3>
              <div class="inline-test-progress-track" style="margin-bottom: 12px;">
                <div class="inline-test-progress-fill" id="analyzing-progress" style="width: 0%;"></div>
              </div>
              <p id="analyzing-step-text" style="color: var(--text-muted); font-size: 0.85rem;">Identificando patrones mentales...</p>
            </div>
            <div id="test-result-section" style="display:none;">
              <p style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; color: var(--text-muted); text-align: center; margin-bottom: 12px;">TU SABOTEADOR DOMINANTE ES</p>
              <div id="inline-result-card" style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 24px; border-radius: 16px; text-align: center; margin-bottom: 16px;">
                <div id="inline-result-emoji" style="font-size: 48px; margin-bottom: 8px;"></div>
                <h3 id="inline-result-name" style="color: var(--text-main); font-size: 1.5rem; margin: 0 0 8px 0;"></h3>
                <p id="inline-result-desc" style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0;"></p>
              </div>
              <div id="inline-result-scores" style="margin-bottom: 20px;"></div>
            </div>
          </div>
        `;
      }
    }
  },
  3: {
    title: "Diseña tu entorno",
    reward: "+20 pts",
    render: () => `
      <p class="activity-desc">El éxito es predecible si preparas tu entorno. Verifica que tienes todo listo antes del evento en vivo.</p>
      <div class="checklist" id="checklist-act3">
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>Tengo libreta exclusiva</span>
        </label>
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>Tengo audífonos listos</span>
        </label>
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>Tengo Zoom actualizado</span>
        </label>
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>Ya bloqueé mi agenda</span>
        </label>
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>Tengo conexión estable</span>
        </label>
      </div>
    `
  },
  4: {
    title: "Observa tus decisiones",
    reward: "+15 pts",
    render: () => `
      <p class="activity-desc">Tu saboteador vive en tus hábitos diarios. Registra aquí una situación de hoy donde sentiste el impulso de tu patrón dominante.</p>
      <textarea class="text-input" id="decisions-input" rows="3" placeholder="Ej: Hoy sentí urgencia de operar tras una pequeña pérdida..."></textarea>
      <label class="check-item" onclick="toggleCheck(this)" id="decisions-check" style="display:none; margin-bottom: 24px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Situación Registrada</span>
      </label>
    `
  },
  5: {
    title: "Cumple una promesa",
    reward: "+15 pts",
    render: () => `
      <p class="activity-desc">Ejecuta una acción pequeña que tome menos de 5 minutos y cumplela AHORA. El compromiso se construye con victorias pequeñas.</p>
      <textarea class="text-input" id="promise-input" rows="3" placeholder="Ej: Voy a tomar un vaso de agua y respirar 2 minutos..."></textarea>
      <label class="check-item" onclick="toggleCheck(this)" id="promise-check" style="display:none; margin-bottom: 24px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>¡Promesa Cumplida!</span>
      </label>
    `
  },
  6: {
    title: "Activa tus notificaciones",
    reward: "+20 pts",
    render: () => `
      <p class="activity-desc">Toda la comunicación oficial, recursos exclusivos y el enlace de acceso al evento en vivo se enviarán por nuestro grupo VIP de WhatsApp. Únete ahora para asegurar tu lugar.</p>
      <a href="https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1" target="_blank" class="btn-secondary" style="display:block; text-align:center; text-decoration:none; margin-bottom: 16px;">
        Unirme al Grupo de WhatsApp
      </a>
      <label class="check-item" onclick="toggleCheck(this)">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Ya me uní al grupo oficial</span>
      </label>
    `
  },
  7: {
    title: "Conoce a GENY",
    reward: "+15 pts",
    render: () => `
      <p class="activity-desc">GENY es nuestra inteligencia artificial diseñada para operar contigo. Aprende sus 3 reglas sagradas antes de entrar a la sala.</p>
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; color: var(--text-main);"><strong>1.</strong> No toma decisiones emocionales.</p>
        <p style="margin: 0 0 8px 0; color: var(--text-main);"><strong>2.</strong> Opera 100% por probabilidad.</p>
        <p style="margin: 0; color: var(--text-main);"><strong>3.</strong> Nunca se salta el plan de trading.</p>
      </div>
      <label class="check-item" onclick="toggleCheck(this)">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Comprendo las reglas de GENY</span>
      </label>
    `
  },
  8: {
    title: "Confirma tu asistencia",
    reward: "+20 pts",
    render: () => `
      <p class="activity-desc">Llegó el momento de la verdad. Confirma tu pase de entrada al Día 1 de GENOMA.</p>
      <div style="text-align:center; margin-bottom: 16px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" style="margin-bottom: 12px;">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <label class="check-item" onclick="toggleCheck(this)">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Confirmo mi asistencia en vivo</span>
      </label>
    `
  },
  9: {
    title: "¡Todo Listo!",
    reward: "+50 pts",
    render: () => `
      <div style="text-align: center; padding: 20px 0;">
        <div style="font-size: 64px; margin-bottom: 16px;">🚀</div>
        <h3 style="color: var(--green); font-size: 1.5rem; margin-bottom: 8px;">Genoma Cero Completado</h3>
        <p class="activity-desc" style="margin-bottom: 24px;">Has neutralizado a tu Saboteador y preparado tu entorno. Estás oficialmente listo para el evento.</p>
      </div>
    `
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Process Magic Link token or Preview mode (?ver=true / ?ver / ?preview)
  const urlParams = new URLSearchParams(window.location.search);
  const isVerMode = urlParams.has('ver') || urlParams.has('preview') || urlParams.has('unlock') || localStorage.getItem('is_ver_preview_mode') === 'true';

  if (urlParams.has('ver') || urlParams.has('preview') || urlParams.has('unlock')) {
    localStorage.setItem('is_ver_preview_mode', 'true');
  }

  if (isVerMode) {
    localStorage.setItem('auth_token', 'preview_admin_token');
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, '9');
    }
    localStorage.setItem('app_has_entered', 'true');
    currentActivity = parseInt(localStorage.getItem(STORAGE_KEY)) || 9;
  }

  const urlToken = urlParams.get('token');
  if (urlToken) {
    localStorage.setItem('auth_token', urlToken);
    if (!isVerMode) history.replaceState(null, '', '/app');
  }

  const token = localStorage.getItem('auth_token') || '';
  if (!token) {
    // No active session/token, redirect immediately to optin landing page
    window.location.href = '/';
    return;
  }

  // 1b. Load progress from Supabase (only for real users)
  if (token && token !== 'preview_admin_token') {
    fetch('https://chnpzcpczjtdsbfmjhei.supabase.co/rest/v1/rpc/get_progress_by_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU'
      },
      body: JSON.stringify({ p_token: token })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const dbProgress = data[0];
        if (dbProgress.activation_score) {
          const localProgress = parseInt(localStorage.getItem(STORAGE_KEY)) || 1;
          const finalProgress = Math.max(localProgress, dbProgress.activation_score);
          localStorage.setItem(STORAGE_KEY, finalProgress.toString());
          currentActivity = finalProgress;
          renderJourney();
        }
      }
    })
    .catch(err => console.error('Error fetching progress:', err));
  }

  // 2. Render initial journey & live cards
  renderJourney();
  updateLiveCardsUI();
  
  // 3. Track saboteur from test
  const saboteur = localStorage.getItem('saboteur_result');
  if (saboteur) {
    const sabMap = {
      vengador: { emoji: '🔥', name: 'El Vengador' },
      euforico: { emoji: '🎰', name: 'El Eufórico' },
      impaciente: { emoji: '⚡', name: 'El Impaciente' },
      paralizado: { emoji: '🧊', name: 'El Paralizado' }
    };
    if (sabMap[saboteur]) {
      document.getElementById('saboteur-emoji').textContent = sabMap[saboteur].emoji;
      document.getElementById('saboteur-name').textContent = sabMap[saboteur].name;
    }

    if (!isVerMode) {
      const localProgress = parseInt(localStorage.getItem(STORAGE_KEY)) || 1;
      if (localProgress < 3) {
        localStorage.setItem(STORAGE_KEY, '3');
        currentActivity = 3;
        renderJourney();
        saveProgress(3);
      }
    }
  }

  // 4. Auto-open Activity 1 on first entry (only for real users)
  if (!isVerMode) {
    const hasEntered = localStorage.getItem('app_has_entered');
    if (!hasEntered) {
      localStorage.setItem('app_has_entered', 'true');
      currentActivity = 1;
      localStorage.setItem(STORAGE_KEY, '1');
      renderJourney();
      showJourney();
      openActivity(1);
    }
  }
});

// ========================================
// CORE ENGINE FUNCTIONS
// ========================================

function calculatePoints(activityLevel) {
  const pointsMap = {
    1: 20, 2: 30, 3: 20, 4: 15, 5: 15, 6: 20, 7: 15, 8: 20, 9: 50
  };
  let total = 0;
  for (let i = 1; i < activityLevel; i++) {
    total += pointsMap[i] || 0;
  }

  // Phase 2 Live Session rewards
  const liveRewards = { 1: 30, 2: 30, 3: 30, 4: 30, 5: 30, 6: 30, 7: 35, 8: 30, 9: 30, 10: 100 };
  for (let day = 1; day <= 10; day++) {
    if (localStorage.getItem(`live_session_${day}_completed`) === 'true') {
      total += liveRewards[day] || 30;
    }
  }

  return total;
}

function updatePointsDisplay() {
  const pts = calculatePoints(currentActivity);
  
  // Genoma 0 completed count
  const g0Completed = Math.min(currentActivity - 1, 9);
  
  // Phase 2 completed count
  let livesCompleted = 0;
  for (let d = 1; d <= 10; d++) {
    if (localStorage.getItem(`live_session_${d}_completed`) === 'true') {
      livesCompleted++;
    }
  }

  const totalCompleted = g0Completed + livesCompleted;

  // Rank Calculation
  let rank = { title: 'Operador Reactivo', badge: '🔴', color: '#ef4444' };
  if (pts >= 401) {
    rank = { title: 'Trader Inquebrantable', badge: '🏆', color: '#eab308' };
  } else if (pts >= 251) {
    rank = { title: 'Operador PEDEM', badge: '🟢', color: '#22c55e' };
  } else if (pts >= 101) {
    rank = { title: 'Operador Consciente', badge: '🟡', color: '#f59e0b' };
  }

  // Topbar Points Badge
  const elTopbarPoints = document.getElementById('topbar-points-text');
  if (elTopbarPoints) {
    elTopbarPoints.textContent = `${pts} pts`;
  }

  // Dashboard Points Val
  const elDashPoints = document.getElementById('dashboard-points-val');
  if (elDashPoints) {
    elDashPoints.textContent = pts;
  }

  // Dashboard Completed Val
  const elDashCompleted = document.getElementById('dashboard-completed-val');
  if (elDashCompleted) {
    elDashCompleted.textContent = totalCompleted;
  }

  // Dashboard Rank UI
  const elRankTitle = document.getElementById('dashboard-rank-title');
  if (elRankTitle) {
    elRankTitle.textContent = rank.title;
    elRankTitle.style.color = rank.color;
  }
  const elRankIcon = document.getElementById('dashboard-rank-icon');
  if (elRankIcon) {
    elRankIcon.textContent = rank.badge;
  }

  // Journey Points Text
  const elJourneyPoints = document.getElementById('journey-points-text');
  if (elJourneyPoints) {
    elJourneyPoints.textContent = pts;
  }
}

function renderJourney() {
  // Update progress bar
  const progressPercent = Math.min(((currentActivity - 1) / MAX_ACTIVITIES) * 100, 100);
  document.getElementById('journey-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('current-day-text').textContent = Math.min(currentActivity, MAX_ACTIVITIES);

  // Update nodes
  const nodes = document.querySelectorAll('.node');

  nodes.forEach((node) => {
    const actId = parseInt(node.getAttribute('data-act'));
    const connector = node.querySelector('.node-connector-line');
    
    // Reset classes
    node.className = 'node';
    if (connector) connector.classList.remove('completed');
    
    if (actId < currentActivity) {
      node.classList.add('completed');
      if (connector) connector.classList.add('completed');
    } else if (actId === currentActivity) {
      node.classList.add('active');
    } else {
      node.classList.add('locked');
    }
  });

  // Sync dashboard module progress
  const dashProgress = document.getElementById('dashboard-g0-progress');
  const dashText = document.getElementById('dashboard-g0-text');
  if (dashProgress && dashText) {
    dashProgress.style.width = `${progressPercent}%`;
    dashText.textContent = Math.min(currentActivity, MAX_ACTIVITIES);
  }

  // Sync gamification & hero display
  updatePointsDisplay();
  updateNextStepHero();
}

function updateNextStepHero() {
  const heroBadge = document.getElementById('next-step-badge-text');
  const heroTitle = document.getElementById('next-step-title');
  const heroDesc = document.getElementById('next-step-desc');
  const heroBtn = document.getElementById('next-step-btn');
  const heroFill = document.getElementById('next-step-progress-fill');
  const heroText = document.getElementById('next-step-progress-text');
  const topbarStep = document.getElementById('topbar-step-badge');
  const statusTag = document.getElementById('next-step-status-tag');

  if (!heroTitle) return;

  if (currentActivity <= MAX_ACTIVITIES) {
    const act = activitiesData[currentActivity];
    if (act) {
      if (heroBadge) heroBadge.textContent = `FASE 1: PREPARACIÓN • MISIÓN ${currentActivity} DE 19`;
      heroTitle.textContent = `${currentActivity}. ${act.title}`;
      heroDesc.textContent = `Completa la Misión ${currentActivity} de Genoma Cero para acondicionar tu mente y sumar tus ${act.reward}.`;
      if (heroBtn) heroBtn.innerHTML = `<span>ABRIR MISIÓN ${currentActivity} AHORA</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
      if (topbarStep) topbarStep.textContent = `🎯 Misión ${currentActivity}/19`;
      if (statusTag) statusTag.textContent = 'EN PROGRESO 🟢';
    }
  } else {
    // All Genoma 0 missions done, check next incomplete live session
    let nextLive = 10;
    for (let d = 1; d <= 10; d++) {
      if (localStorage.getItem(`live_session_${d}_completed`) !== 'true') {
        nextLive = d;
        break;
      }
    }
    const liveData = liveSessionsData[nextLive];
    if (liveData) {
      if (heroBadge) heroBadge.textContent = `FASE 2: EVENTO EN VIVO • DÍA ${nextLive} DE 10`;
      heroTitle.textContent = liveData.title;
      heroDesc.textContent = `Asiste a la sesión en vivo o mira el replay y completa la Misión del Día ${nextLive} para ganar tus ${liveData.reward}.`;
      if (heroBtn) heroBtn.innerHTML = `<span>VER MISIÓN DEL DÍA ${nextLive}</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
      if (topbarStep) topbarStep.textContent = `🎯 Día Live ${nextLive}/10`;
      if (statusTag) statusTag.textContent = 'EVENTO EN VIVO 🔴';
    }
  }

  // Calculate total completed out of 19
  let completedCount = Math.min(currentActivity - 1, 9);
  for (let d = 1; d <= 10; d++) {
    if (localStorage.getItem(`live_session_${d}_completed`) === 'true') completedCount++;
  }
  const pct = Math.round((completedCount / 19) * 100);
  if (heroFill) heroFill.style.width = `${pct}%`;
  if (heroText) heroText.textContent = `Progreso total: ${pct}% (${completedCount} de 19 misiones completadas)`;
}

function continueNextStep() {
  if (currentActivity <= MAX_ACTIVITIES) {
    showJourney();
    openActivity(currentActivity);
  } else {
    let nextLive = 10;
    for (let d = 1; d <= 10; d++) {
      if (localStorage.getItem(`live_session_${d}_completed`) !== 'true') {
        nextLive = d;
        break;
      }
    }
    showDashboard();
    openLiveSession(nextLive);
  }
}

function openActivity(actId) {
  if (actId > currentActivity) {
    // Locked! Maybe show a small toast, but for now just do nothing.
    return;
  }

  const modal = document.getElementById('activity-modal');
  const content = document.getElementById('activity-content');
  const pointsIndicator = document.getElementById('activity-points-indicator');
  const rewardText = document.getElementById('activity-reward-text');

  // Load Content
  const data = activitiesData[actId];
  if (data) {
    pointsIndicator.style.display = 'flex';
    rewardText.textContent = data.reward;
    
    let html = `<h2 class="activity-title">${data.title}</h2>`;
    html += data.render();
    
    // Footer button
    if (actId === currentActivity) {
      html += `
        <div class="activity-footer">
          <button class="btn-primary" style="width:100%" onclick="completeActivity(${actId})">Completar Actividad</button>
        </div>
      `;
    } else {
      html += `
        <div class="activity-footer">
          <button class="btn-secondary" style="width:100%" onclick="closeActivity()">Cerrar</button>
        </div>
      `;
    }
    
    content.innerHTML = html;

    // Specific logic listeners
    if (actId === 1) {
      // Defer script load by one frame so the vturb-smartplayer container is rendered first
      requestAnimationFrame(() => {
        const oldScript = document.querySelector('script[src*="6a595795c02fb54b9a39a625"]');
        if (oldScript) oldScript.remove();
        var s = document.createElement("script");
        s.src = "https://scripts.converteai.net/6f88db54-0f9b-4a7c-af05-9ae2f56f3fdf/players/6a595795c02fb54b9a39a625/v4/player.js";
        s.async = true;
        document.head.appendChild(s);
      });
    }

    // If Activity 2 has the test (not yet completed), hide "Completar" until test finishes
    if (actId === 2 && !localStorage.getItem('saboteur_result')) {
      const footer = document.querySelector('.activity-footer');
      if (footer) footer.style.display = 'none';
    }
    
    if (actId === 4) {
      const input = document.getElementById('decisions-input');
      const check = document.getElementById('decisions-check');
      input.addEventListener('input', () => {
        if (input.value.trim().length > 3) {
          check.style.display = 'flex';
        } else {
          check.style.display = 'none';
        }
      });
    }
    
    if (actId === 5) {
      const input = document.getElementById('promise-input');
      const check = document.getElementById('promise-check');
      input.addEventListener('input', () => {
        if (input.value.trim().length > 3) {
          check.style.display = 'flex';
        } else {
          check.style.display = 'none';
        }
      });
    }

  } else {
    // Phase placeholder
    pointsIndicator.style.display = 'none';
    content.innerHTML = `
      <h2 class="activity-title">Próximamente</h2>
      <p class="activity-desc">Esta actividad está en construcción para la Fase 2 del despliegue.</p>
      <div class="activity-footer">
        <button class="btn-primary" style="width:100%" onclick="completeActivity(${actId})">Simular Completado</button>
      </div>
    `;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeActivity() {
  const modal = document.getElementById('activity-modal');
  modal.classList.remove('open');
  document.body.style.overflow = 'auto';
  
  // Clean up content after animation
  setTimeout(() => {
    document.getElementById('activity-content').innerHTML = '';
  }, 400);
}

function saveProgress(actId) {
  const token = localStorage.getItem('auth_token') || '';
  if (!token) return;

  const pts = calculatePoints(actId);

  fetch('https://chnpzcpczjtdsbfmjhei.supabase.co/rest/v1/rpc/save_user_progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU'
    },
    body: JSON.stringify({
      p_token: token,
      p_activity: actId,
      p_points: pts
    })
  })
  .catch(err => console.error('Error saving progress:', err));
}

function completeActivity(actId) {
  // 1. Confetti animation
  const btn = document.querySelector('.activity-footer button');
  btn.style.animation = 'popConfetti 0.6s ease';
  btn.innerHTML = '¡Completado! 🎉';
  
  setTimeout(() => {
    // 2. Advance state if it's the current one
    if (actId === currentActivity) {
      currentActivity++;
      localStorage.setItem(STORAGE_KEY, currentActivity.toString());
      renderJourney();
      
      // Save progress to Supabase
      saveProgress(currentActivity);
    }
    
    // 3. Close
    closeActivity();
  }, 1000);
}

// Helpers
function toggleCheck(el) {
  el.classList.toggle('checked');
}

// ========================================
// DASHBOARD VIEWS & LOGIC
// ========================================

function showDashboard() {
  document.getElementById('view-journey').style.display = 'none';
  document.getElementById('view-dashboard').style.display = 'block';
  // Scroll to top
  window.scrollTo(0, 0);
}

function showJourney() {
  document.getElementById('view-dashboard').style.display = 'none';
  document.getElementById('view-journey').style.display = 'block';
  window.scrollTo(0, 0);
}

// ========================================
// COUNTDOWN TIMER
// ========================================

function initCountdown() {
  // Target: August 3, 2026, 19:00:00 (Colombia Time is UTC-5)
  // Local dates in JS read the system timezone. To be safe, we parse an ISO string with offset.
  const targetDate = new Date("2026-08-03T19:00:00-05:00").getTime();
  
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');

  if (!elDays) return; // Guard if not found

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMins.textContent = "00";
      elSecs.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    elDays.textContent = String(days).padStart(2, '0');
    elHours.textContent = String(hours).padStart(2, '0');
    elMins.textContent = String(mins).padStart(2, '0');
    elSecs.textContent = String(secs).padStart(2, '0');
  }

  update(); // Initial call
  setInterval(update, 1000);
}

// Start Countdown on load
initCountdown();

// ========================================
// INLINE SABOTEUR TEST ENGINE
// Runs inside Activity 1 modal
// ========================================

const SUPABASE_URL_TEST = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY_TEST = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
const GHL_WEBHOOK_TEST = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/AF9SlEmf2Qj2H4GxsFjf';

const inlineFilterQuestion = {
  text: '¿Ya operas en mercados financieros (Forex, cripto, acciones, futuros)?',
  options: [
    { text: 'Sí, ya opero o he operado activamente.', branch: 'trader' },
    { text: 'Aún no, pero quiero empezar o estoy aprendiendo.', branch: 'no-trader' }
  ]
};

const inlineTraderQuestions = [
  { text: 'Acabas de cerrar una operación con pérdida. ¿Cuál es tu primer impulso?', options: [
    { text: 'Abrir otra posición inmediatamente para recuperar lo perdido.', scores: [3, 0, 1, 0] },
    { text: 'Buscar la siguiente señal rápido, necesito sentir que estoy avanzando.', scores: [0, 0, 3, 0] },
    { text: 'Cerrar la plataforma. No quiero ver los números.', scores: [0, 0, 0, 3] },
    { text: 'Revisar qué salió mal con calma y anotar la lección.', scores: [0, 1, 0, 0] }
  ]},
  { text: 'Llevas 3 operaciones ganadoras seguidas. ¿Qué haces?', options: [
    { text: 'Aumento el tamaño de la posición — estoy en racha.', scores: [0, 3, 0, 0] },
    { text: 'Busco más entradas, el mercado me está dando la razón.', scores: [0, 1, 3, 0] },
    { text: 'Sigo el plan exactamente igual, sin cambiar el riesgo.', scores: [0, 0, 0, 0] },
    { text: 'Me da miedo que la racha se acabe y dejo de operar.', scores: [0, 0, 0, 3] }
  ]},
  { text: 'Ves una oportunidad pero no cumple al 100% con tu plan de trading. ¿Qué haces?', options: [
    { text: 'Entro igual — si espero la señal perfecta, pierdo la oportunidad.', scores: [0, 0, 3, 0] },
    { text: 'No entro, pero me quedo mirando la pantalla esperando que se confirme.', scores: [0, 0, 1, 2] },
    { text: 'La descarto completamente y busco una que cumpla las reglas.', scores: [0, 0, 0, 0] },
    { text: 'Pienso: "ya me perdí muchas así" y entro con posición más grande.', scores: [2, 1, 1, 0] }
  ]},
  { text: 'Tu stop loss se activa y el precio se da la vuelta justo después. ¿Qué sientes?', options: [
    { text: 'Rabia — voy a entrar de nuevo con más volumen para compensar.', scores: [3, 0, 1, 0] },
    { text: 'Frustración, pero entiendo que forma parte del proceso.', scores: [0, 0, 0, 0] },
    { text: 'Reentro inmediatamente sin pensarlo, el precio va para donde dije.', scores: [1, 0, 3, 0] },
    { text: 'Me paralizo. Empiezo a dudar de toda mi estrategia.', scores: [0, 0, 0, 3] }
  ]},
  { text: 'Es viernes y piensas en tu semana de trading. ¿Cuál es tu reflexión más frecuente?', options: [
    { text: '"Si no hubiera perdido ese trade del martes, estaría en positivo."', scores: [3, 0, 0, 0] },
    { text: '"Fue una gran semana, el lunes voy con todo."', scores: [0, 3, 0, 0] },
    { text: '"Operé demasiado. Muchas entradas sin filtro."', scores: [0, 0, 3, 0] },
    { text: '"Vi muchas oportunidades pero no tomé ninguna."', scores: [0, 0, 0, 3] }
  ]},
  { text: 'Llevas una operación con buena ganancia y el precio empieza a retroceder. ¿Qué haces?', options: [
    { text: 'Muevo mi take profit más lejos — puedo sacar más.', scores: [0, 3, 0, 0] },
    { text: 'Cierro inmediatamente antes de que se borre toda la ganancia.', scores: [0, 0, 2, 2] },
    { text: 'Respeto mi plan: dejo el stop y el take donde los puse.', scores: [0, 0, 0, 0] },
    { text: 'No sé qué hacer. Congelo la pantalla y espero.', scores: [0, 0, 0, 3] }
  ]},
  { text: 'Si pudieras cambiar UNA cosa de tu forma de operar, ¿cuál sería?', options: [
    { text: 'Dejar de intentar recuperar las pérdidas en la misma sesión.', scores: [3, 0, 0, 0] },
    { text: 'No sobreoperar cuando las cosas van bien.', scores: [0, 3, 0, 0] },
    { text: 'Tener más paciencia para esperar las buenas señales.', scores: [0, 0, 3, 0] },
    { text: 'Dejar de analizar tanto y empezar a ejecutar.', scores: [0, 0, 0, 3] }
  ]}
];

const inlineNoTraderQuestions = [
  { text: 'Haces una inversión o compra importante y pierdes dinero. ¿Cuál es tu reacción?', options: [
    { text: 'Busco recuperar ese dinero lo más rápido posible, aunque sea arriesgando más.', scores: [3, 0, 1, 0] },
    { text: 'Necesito actuar ya — no puedo quedarme de brazos cruzados.', scores: [0, 0, 3, 0] },
    { text: 'Me bloqueo. No quiero pensar más en dinero por un tiempo.', scores: [0, 0, 0, 3] },
    { text: 'Analizo qué pasó y tomo nota para la próxima vez.', scores: [0, 1, 0, 0] }
  ]},
  { text: 'Recibes un ingreso extra que no esperabas. ¿Qué haces?', options: [
    { text: 'Lo invierto todo de una — hay que aprovechar mientras tengo capital.', scores: [0, 3, 1, 0] },
    { text: 'Busco la mejor oportunidad rápido antes de que se me vaya la plata.', scores: [0, 1, 3, 0] },
    { text: 'Lo guardo y espero. Necesito investigar más antes de moverlo.', scores: [0, 0, 0, 3] },
    { text: 'Divido: una parte la invierto y otra la reservo.', scores: [0, 0, 0, 0] }
  ]},
  { text: 'Alguien te habla de una oportunidad de negocio o inversión. ¿Cómo reaccionas?', options: [
    { text: 'Si suena bien, entro de una. Las oportunidades no esperan.', scores: [0, 0, 3, 0] },
    { text: 'Investigo, pero al final nunca me decido. Siempre falta algo.', scores: [0, 0, 0, 3] },
    { text: 'Me emociono y quiero entrar con todo lo que tengo.', scores: [0, 3, 0, 0] },
    { text: 'Evalúo con calma si encaja con mi situación actual.', scores: [0, 0, 0, 0] }
  ]},
  { text: 'Un amigo te cuenta que ganó mucho dinero con algo. ¿Qué sientes?', options: [
    { text: '"¿Por qué no fui yo? Necesito encontrar MI oportunidad ahora."', scores: [2, 0, 2, 0] },
    { text: '"Yo también puedo. Voy a meterle con todo."', scores: [1, 3, 0, 0] },
    { text: 'Me alegro por él, pero sigo con mi camino.', scores: [0, 0, 0, 0] },
    { text: 'Me desanimo. Siento que siempre llego tarde a todo.', scores: [0, 0, 0, 3] }
  ]},
  { text: 'Piensas en tu situación financiera actual. ¿Cuál frase te identifica más?', options: [
    { text: '"Si no hubiera cometido ese error, estaría mucho mejor."', scores: [3, 0, 0, 0] },
    { text: '"Siento que estoy a punto de dar un gran salto."', scores: [0, 3, 0, 0] },
    { text: '"Necesito generar más ingresos ya, no puedo esperar."', scores: [0, 0, 3, 0] },
    { text: '"Quiero empezar algo, pero no sé por dónde ni cuándo."', scores: [0, 0, 0, 3] }
  ]},
  { text: 'Tienes que tomar una decisión financiera importante. ¿Cómo la enfrentas?', options: [
    { text: 'Decido rápido. Si sale mal, ajusto sobre la marcha.', scores: [0, 1, 3, 0] },
    { text: 'Siento que si no actúo ahora, la oportunidad desaparece.', scores: [1, 2, 1, 0] },
    { text: 'Analizo tanto que a veces se me pasa el momento.', scores: [0, 0, 0, 3] },
    { text: 'Busco información, pido opiniones y luego decido.', scores: [0, 0, 0, 0] }
  ]},
  { text: 'Si pudieras cambiar UNA cosa de tu relación con el dinero, ¿cuál sería?', options: [
    { text: 'Dejar de intentar recuperar lo que ya perdí.', scores: [3, 0, 0, 0] },
    { text: 'No dejarme llevar por la emoción cuando las cosas van bien.', scores: [0, 3, 0, 0] },
    { text: 'Tener más paciencia y no actuar por impulso.', scores: [0, 0, 3, 0] },
    { text: 'Dejar de pensar tanto y empezar a actuar de una vez.', scores: [0, 0, 0, 3] }
  ]}
];

const inlineSaboteurs = {
  vengador: { emoji: '🔥', name: 'EL VENGADOR', desc: 'Actúas desde la revancha. Cada pérdida se convierte en una batalla personal que necesitas ganar.', color: '#ef4444' },
  euforico: { emoji: '🎰', name: 'EL EUFÓRICO', desc: 'Cuando las cosas van bien, te sientes invencible. Arriesgas más y dejas de seguir las reglas.', color: '#f59e0b' },
  impaciente: { emoji: '⚡', name: 'EL IMPACIENTE', desc: 'Necesitas acción constante. Actúas antes de tiempo y confundes movimiento con progreso.', color: '#8b5cf6' },
  paralizado: { emoji: '🧊', name: 'EL PARALIZADO', desc: 'Analizas todo pero no decides nada. El miedo a equivocarte te congela.', color: '#3b82f6' }
};

// State
let itCurrentQ = 0;
let itBranch = '';
let itQuestions = [];
let itScores = { vengador: 0, euforico: 0, impaciente: 0, paralizado: 0 };
let itAnswers = [];
const itTotalQ = 8;

function startInlineTest() {
  itCurrentQ = 0;
  itBranch = '';
  itQuestions = [];
  itScores = { vengador: 0, euforico: 0, impaciente: 0, paralizado: 0 };
  itAnswers = [];

  const elIntro = document.getElementById('test-intro-section');
  if (elIntro) elIntro.style.display = 'none';

  const elResult = document.getElementById('test-result-section');
  if (elResult) elResult.style.display = 'none';

  const elQSection = document.getElementById('test-question-section');
  if (elQSection) elQSection.style.display = 'block';
  
  // Hide the "Completar Actividad" button during test
  const footer = document.querySelector('.activity-footer');
  if (footer) footer.style.display = 'none';
  
  renderInlineFilterQ();
}

function renderInlineFilterQ() {
  const container = document.getElementById('test-question-section');
  document.getElementById('inline-test-counter').textContent = 'Pregunta 1 de ' + itTotalQ;
  document.getElementById('inline-test-question').textContent = inlineFilterQuestion.text;
  document.getElementById('inline-test-progress').style.width = '0%';

  let html = '';
  const letters = ['A', 'B'];
  inlineFilterQuestion.options.forEach((opt, i) => {
    html += `<button class="inline-test-option" data-branch="${opt.branch}" onclick="selectInlineFilter(this)">
      <span class="inline-test-option__letter">${letters[i]}</span>
      <span>${opt.text}</span>
    </button>`;
  });
  document.getElementById('inline-test-options').innerHTML = html;
}

function selectInlineFilter(btn) {
  // Disable all
  document.querySelectorAll('.inline-test-option').forEach(b => b.style.pointerEvents = 'none');
  btn.classList.add('inline-test-option--selected');

  itBranch = btn.getAttribute('data-branch');
  itQuestions = itBranch === 'trader' ? inlineTraderQuestions : inlineNoTraderQuestions;
  itAnswers.push(itBranch);
  localStorage.setItem('genoma_user_branch', itBranch);

  setTimeout(() => {
    itCurrentQ = 0;
    renderInlineQuestion();
  }, 500);
}

function renderInlineQuestion() {
  const q = itQuestions[itCurrentQ];
  document.getElementById('inline-test-counter').textContent = 'Pregunta ' + (itCurrentQ + 2) + ' de ' + itTotalQ;
  document.getElementById('inline-test-question').textContent = q.text;
  document.getElementById('inline-test-progress').style.width = (((itCurrentQ + 1) / itTotalQ) * 100) + '%';

  let html = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    html += `<button class="inline-test-option" data-index="${i}" onclick="selectInlineOption(${i})">
      <span class="inline-test-option__letter">${letters[i]}</span>
      <span>${opt.text}</span>
    </button>`;
  });
  document.getElementById('inline-test-options').innerHTML = html;
}

function selectInlineOption(index) {
  const q = itQuestions[itCurrentQ];
  const opt = q.options[index];

  document.querySelectorAll('.inline-test-option').forEach(b => b.style.pointerEvents = 'none');
  document.querySelectorAll('.inline-test-option')[index].classList.add('inline-test-option--selected');

  itAnswers.push(index);
  itScores.vengador += opt.scores[0];
  itScores.euforico += opt.scores[1];
  itScores.impaciente += opt.scores[2];
  itScores.paralizado += opt.scores[3];

  setTimeout(() => {
    itCurrentQ++;
    if (itCurrentQ < itQuestions.length) {
      renderInlineQuestion();
    } else {
      document.getElementById('inline-test-progress').style.width = '100%';
      showInlineAnalyzing();
    }
  }, 500);
}

function showInlineAnalyzing() {
  document.getElementById('test-question-section').style.display = 'none';
  document.getElementById('test-analyzing-section').style.display = 'block';

  const bar = document.getElementById('analyzing-progress');
  const text = document.getElementById('analyzing-step-text');
  const steps = [
    { progress: 25, text: 'Identificando patrones mentales...' },
    { progress: 50, text: 'Analizando respuestas emocionales...' },
    { progress: 75, text: 'Calculando tu arquetipo dominante...' },
    { progress: 100, text: '¡Resultado encontrado!' }
  ];

  let i = 0;
  function nextStep() {
    if (i < steps.length) {
      bar.style.width = steps[i].progress + '%';
      text.textContent = steps[i].text;
      i++;
      setTimeout(nextStep, 700);
    } else {
      setTimeout(showInlineResult, 500);
    }
  }
  setTimeout(nextStep, 400);
}

function showInlineResult() {
  // Find dominant
  let maxScore = 0;
  let dominant = 'vengador';
  Object.keys(itScores).forEach(key => {
    if (itScores[key] > maxScore) {
      maxScore = itScores[key];
      dominant = key;
    }
  });

  const sab = inlineSaboteurs[dominant];

  // Save to localStorage
  localStorage.setItem('saboteur_result', dominant);
  localStorage.setItem('saboteur_scores', JSON.stringify(itScores));

  // Update topbar
  const sabMap = {
    vengador: { emoji: '🔥', name: 'El Vengador' },
    euforico: { emoji: '🎰', name: 'El Eufórico' },
    impaciente: { emoji: '⚡', name: 'El Impaciente' },
    paralizado: { emoji: '🧊', name: 'El Paralizado' }
  };
  if (sabMap[dominant]) {
    document.getElementById('saboteur-emoji').textContent = sabMap[dominant].emoji;
    document.getElementById('saboteur-name').textContent = sabMap[dominant].name;
  }

  // Render result
  document.getElementById('test-analyzing-section').style.display = 'none';
  document.getElementById('test-result-section').style.display = 'block';

  document.getElementById('inline-result-emoji').textContent = sab.emoji;
  document.getElementById('inline-result-name').textContent = sab.name;
  document.getElementById('inline-result-name').style.color = sab.color;
  document.getElementById('inline-result-desc').textContent = sab.desc;

  // Score bars
  const totalMax = Math.max(itScores.vengador, itScores.euforico, itScores.impaciente, itScores.paralizado, 1);
  const sabKeys = [
    { key: 'vengador', label: '🔥 Vengador', color: '#ef4444' },
    { key: 'euforico', label: '🎰 Eufórico', color: '#f59e0b' },
    { key: 'impaciente', label: '⚡ Impaciente', color: '#8b5cf6' },
    { key: 'paralizado', label: '🧊 Paralizado', color: '#3b82f6' }
  ];

  let scoresHtml = '';
  sabKeys.forEach(s => {
    const pct = Math.round((itScores[s.key] / totalMax) * 100);
    scoresHtml += `<div style="margin-bottom: 10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:0.8rem;color:${s.color};font-weight:600;">${s.label}</span>
        <span style="font-size:0.75rem;color:var(--text-muted);">${itScores[s.key]} pts</span>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${s.color};border-radius:100px;transition:width 0.8s ease;"></div>
      </div>
    </div>`;
  });
  document.getElementById('inline-result-scores').innerHTML = scoresHtml;

  // Show the "Completar Actividad" button again
  const footer = document.querySelector('.activity-footer');
  if (footer) footer.style.display = 'block';

  // Save to Supabase
  const token = localStorage.getItem('auth_token') || '';
  if (token) {
    fetch(SUPABASE_URL_TEST + '/rest/v1/rpc/get_lead_by_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY_TEST,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY_TEST
      },
      body: JSON.stringify({ p_token: token })
    })
    .then(res => res.json())
    .then(leads => {
      if (!leads || !leads.length) return;
      const leadId = leads[0].id;

      return fetch(SUPABASE_URL_TEST + '/rest/v1/saboteur_test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY_TEST,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY_TEST
        },
        body: JSON.stringify({
          lead_id: leadId,
          answers: { branch: itBranch, responses: itAnswers },
          saboteur_type: dominant,
          scores: itScores
        })
      });
    })
    .then(() => {
      // Fire GHL Webhook
      if (GHL_WEBHOOK_TEST) {
        fetch(GHL_WEBHOOK_TEST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_token: token,
            saboteur_type: dominant,
            action: 'test_completed'
          })
        }).catch(() => {});
      }
    })
    .catch(err => console.error('Error saving test:', err));
  }

  // Push GTM event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'saboteur_test_completed',
      saboteur_type: dominant,
      branch: itBranch
    });
  }
}

function retakeTest() {
  if (!confirm('¿Estás seguro de que quieres repetir el test? Tus respuestas actuales se borrarán.')) return;
  
  localStorage.removeItem('saboteur_result');
  localStorage.removeItem('saboteur_scores');
  localStorage.removeItem('genoma_user_branch');
  localStorage.removeItem('user_branch');

  const token = localStorage.getItem('auth_token') || '';
  if (token && token !== 'preview_admin_token') {
    fetch(SUPABASE_URL_TEST + '/rest/v1/rpc/reset_lead_test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY_TEST,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY_TEST
      },
      body: JSON.stringify({ p_token: token })
    }).catch(err => console.error('Error resetting test:', err));
  }

  // Open Activity 2 and start test inline
  openActivity(2);
  startInlineTest();
}

// ========================================
// FASE 2: 10 LIVE SESSIONS & DAILY MISSIONS
// ========================================

const liveSessionsData = {
  1: {
    dayDate: "3 de Agosto",
    title: "1. La Anatomía del Saboteador",
    reward: "+30 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Guía: Anatomía de los 4 Saboteadores Financieros (PDF)",
    resourceLink: "#",
    missionTitle: "Misión del Día 1: Identifica tu Saboteador",
    missionDesc: "Realiza o repite el Test del Saboteador (8 preguntas) para descubrir o actualizar tu arquetipo mental dominante.",
    renderMission: () => `
      <div id="live1-saboteur-container"></div>
      <label class="check-item" onclick="toggleCheck(this)" style="margin-top:14px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Confirmar asistencia en vivo + Resultado de mi Saboteador</span>
      </label>
    `
  },
  2: {
    dayDate: "4 de Agosto",
    title: "2. Cuenta Abierta — El Espejo de la Mente",
    reward: "+30 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Plantilla: Definición de Meta de Proceso (PDF)",
    resourceLink: "#",
    missionTitle: "Misión del Día 2: Regla #1 Anti-Saboteador",
    missionDesc: "Define tu meta de proceso para los 10 días y redacta la Regla #1 que impedirá que tu Saboteador tome el control.",
    renderMission: () => `
      <textarea class="text-input" id="live2-rule-input" rows="3" placeholder="Ej: Mi meta es seguir el riesgo al 100%. Regla #1: Si pierdo 2 trades seguidos, apago la pantalla por hoy."></textarea>
      <label class="check-item" onclick="toggleCheck(this)" style="margin-top: 12px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Regla #1 Anti-Saboteador Registrada</span>
      </label>
    `
  },
  3: {
    dayDate: "5 de Agosto",
    title: "3. P — El Plan que Tu Saboteador No Puede Renegociar",
    reward: "+30 PC (+15 extra por compartir)",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Plantilla: Plan de Trading Anti-Saboteador (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Viral Día 3: El Trade de Mi Saboteador",
    missionDesc: "Publica en tus redes o en la comunidad el peor trade que tu Saboteador hizo por ti y qué le faltó al plan con el hashtag #JuegoMental.",
    renderMission: () => `
      <textarea class="text-input" id="live3-worst-trade" rows="3" placeholder="Ej: Entré por FOMO en Bitcoin sin stop loss y mi Saboteador Eufórico me hizo perder $500... #JuegoMental"></textarea>
      <button id="copy-viral-btn" class="btn-secondary" style="width: 100%; margin-top: 10px; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="copyViralPost()">
        <span>📋</span> COPIAR POST VIRAL (#JuegoMental)
      </button>
      <label class="check-item" onclick="toggleCheck(this)" style="margin-top: 12px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Misión Viral Publicada en Redes / Comunidad</span>
      </label>
    `
  },
  4: {
    dayDate: "6 de Agosto",
    title: "4. E — Ejecución con IA: Conoce a GENY",
    reward: "+30 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Guía de Parámetros: Algoritmo Geny Trend (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 4: Tu Primer Paper Trade con Plan",
    missionDesc: "Haz 1 Paper Trade (simulado) definiendo tu activo, señal de Geny y nivel de Stop Loss.",
    renderMission: () => `
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
        <input class="text-input" id="live4-asset" type="text" placeholder="Activo (Ej: BTC/USD, Nasdaq, Gold)">
        <input class="text-input" id="live4-signal" type="text" placeholder="Señal de IA (Ej: Geny Trend Alcista 15M)">
        <input class="text-input" id="live4-stop" type="text" placeholder="Nivel de Stop Loss de Invalidación (Ej: $64,200)">
      </div>
      <label class="check-item" onclick="toggleCheck(this)">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Paper Trade registrado con gestión de riesgo previa</span>
      </label>
    `
  },
  5: {
    dayDate: "7 de Agosto",
    title: "5. D — La Bitácora del Saboteador",
    reward: "+30 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Plantilla Oficial: Bitácora PEDEM (Excel / PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 5: Registro en la Bitácora PEDEM",
    missionDesc: "Documenta tu Paper Trade del Día 4 en la Bitácora PEDEM registrando las emociones de tu Saboteador.",
    renderMission: () => `
      <textarea class="text-input" id="live5-logbook-reflection" rows="3" placeholder="Ej: Documenté mi trade en la bitácora. Mi Saboteador sintió impaciencia antes del gatillo..."></textarea>
      <label class="check-item" onclick="toggleCheck(this)" style="margin-top: 12px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Trade Registrado en la Bitácora PEDEM</span>
      </label>
    `
  },
  6: {
    dayDate: "8 de Agosto",
    title: "6. E · M — Evaluación: Reditum Sniper",
    reward: "+30 PC (+10 por reservar)",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Rúbrica de Evaluación Semanal PEDEM (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 6: Rúbrica PEDEM + Asiento Masterclass",
    missionDesc: "Responde la rúbrica de evaluación semanal (3 preguntas) y asegura tu cupo para la Masterclass de mañana.",
    renderMission: () => `
      <div class="checklist">
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>1. Definí mi riesgo ANTES de entrar a cada trade</span>
        </label>
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>2. Respeté mi Regla #1 Anti-Saboteador esta semana</span>
        </label>
        <label class="check-item" onclick="toggleCheck(this)">
          <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span>3. Reservé mi Asiento VIP para la Masterclass del Domingo</span>
        </label>
      </div>
    `
  },
  7: {
    dayDate: "9 de Agosto",
    title: "7. Masterclass — Mente · Sistema · Entorno",
    reward: "+35 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Roadmap: Método INGRESARIOS 3.0 (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 7: Asistencia a la Masterclass",
    missionDesc: "Asiste a la Masterclass de apertura oficial del Método INGRESARIOS 3.0 y toma tu decisión de transformación.",
    renderMission: () => `
      <label class="check-item" onclick="toggleCheck(this)">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Asistí a la Masterclass + Decisión de Transformación Tomada</span>
      </label>
    `
  },
  8: {
    dayDate: "10 de Agosto",
    title: "8. Panel de Casos Reales — Historias Sin Saboteador",
    reward: "+30 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Casos de Estudio: De Reactivo a Inquebrantable (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 8: Escribe tu Duda u Objeción Personal",
    missionDesc: "Escribe la pregunta o inquietud que te está frenando para que Juan la responda en vivo mañana.",
    renderMission: () => `
      <textarea class="text-input" id="live8-question-input" rows="3" placeholder="Escribe tu pregunta o duda personal..."></textarea>
      <label class="check-item" onclick="toggleCheck(this)" style="margin-top: 12px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Pregunta Enviada para el Q&A</span>
      </label>
    `
  },
  9: {
    dayDate: "11 de Agosto",
    title: "9. La Nómina del Saboteador — El Costo de No Decidir",
    reward: "+30 PC",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Calculadora de Costo de Inacción (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 9: Autoevaluación de Evolución Mental",
    missionDesc: "Compara tu estado mental del Día 1 vs el de hoy. Describe la principal transformación en tu disciplina.",
    renderMission: () => `
      <textarea class="text-input" id="live9-evolution-input" rows="3" placeholder="Ej: Llegué como Vengador impulsivo y hoy opero bajo un sistema de reglas estrictas..."></textarea>
      <label class="check-item" onclick="toggleCheck(this)" style="margin-top: 12px;">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Autoevaluación Final Publicada</span>
      </label>
    `
  },
  10: {
    dayDate: "12 de Agosto",
    title: "10. La Gran Final — Premiación y Cierre",
    reward: "+100 PC Bonus",
    liveUrl: "https://chat.whatsapp.com/EM5Zb8qmS8O4CDdnYKeZhY?s=sh&p=a&ilr=1",
    resourceName: "Certificado del Juego Mental del Dinero (PDF)",
    resourceLink: "#",
    missionTitle: "Misión Día 10: Racha Perfecta y Premiación",
    missionDesc: "Asiste a la ceremonia de premiación del Leaderboard y reclama tu Bonus de Racha Perfecta.",
    renderMission: () => `
      <div style="text-align:center; padding: 16px 0;">
        <div style="font-size: 48px; margin-bottom: 8px;">🏆</div>
        <h3 style="color: var(--yellow); margin-bottom: 8px;">¡Felicidades por completar el entrenamiento!</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">Has dominado el Juego Mental del Dinero.</p>
      </div>
      <label class="check-item" onclick="toggleCheck(this)">
        <div class="check-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>Reclamar 100 PC Bonus Racha Perfecta</span>
      </label>
    `
  }
};

function copyViralPost() {
  const textInput = document.getElementById('live3-worst-trade');
  if (textInput && textInput.value) {
    navigator.clipboard.writeText(textInput.value).then(() => {
      const btn = document.getElementById('copy-viral-btn');
      if (btn) btn.innerHTML = '<span>✅</span> ¡COPIADO AL PORTAPAPELES!';
      showMissionToast('📋 Texto copiado. ¡Ahora publícalo con el hashtag #JuegoMental!');
    });
  } else {
    showMissionToast('⚠️ Escribe el texto de tu trade antes de copiar');
  }
}

function showMissionToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #18181b;
      border: 1px solid rgba(34, 197, 94, 0.6);
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 3500);
}

function openLiveSession(dayNum) {
  const data = liveSessionsData[dayNum];
  if (!data) return;

  const modal = document.getElementById('activity-modal');
  const content = document.getElementById('activity-content');
  const pointsIndicator = document.getElementById('activity-points-indicator');
  const rewardText = document.getElementById('activity-reward-text');

  if (pointsIndicator) pointsIndicator.style.display = 'flex';
  if (rewardText) rewardText.textContent = data.reward;

  const isCompleted = localStorage.getItem(`live_session_${dayNum}_completed`) === 'true';

  let html = `
    <div style="margin-bottom: 12px; display:inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 20px; color: #4ade80; font-weight: 700; font-size: 0.8rem;">
      📅 ${data.dayDate} • 7:00 PM (Colombia)
    </div>
    <h2 class="activity-title" style="margin-top: 4px; font-size:1.4rem;">${data.title}</h2>

    <!-- PASO 1: EN VIVO / REPLAY -->
    <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 18px; border-radius: 14px; margin-bottom: 16px;">
      <h3 style="font-size: 1rem; color: var(--text-main); margin: 0 0 8px 0; display:flex; align-items:center; gap:8px;">
        <span>🔴</span> Paso 1: Transmisión en Vivo
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">Accede a la sala oficial de Zoom / YouTube o mira el Replay grabado.</p>
      <a href="${data.liveUrl}" target="_blank" class="btn-primary" style="display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; width:100%;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
        INGRESAR AL LIVE EN VIVO
      </a>
    </div>

    <!-- PASO 2: RECURSO / PLANTILLA -->
    <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 18px; border-radius: 14px; margin-bottom: 16px;">
      <h3 style="font-size: 1rem; color: var(--text-main); margin: 0 0 8px 0; display:flex; align-items:center; gap:8px;">
        <span>📄</span> Paso 2: Recurso del Día
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">${data.resourceName}</p>
      <a href="${data.resourceLink}" target="_blank" class="btn-secondary" style="display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; width:100%;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        DESCARGAR MATERIAL DEL DÍA
      </a>
    </div>

    <!-- PASO 3: MISIÓN PRÁCTICA DEL DÍA -->
    <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 18px; border-radius: 14px; margin-bottom: 16px;">
      <h3 style="font-size: 1rem; color: var(--text-main); margin: 0 0 8px 0; display:flex; align-items:center; gap:8px;">
        <span>⚡</span> Paso 3: ${data.missionTitle}
      </h3>
      <p class="activity-desc" style="margin-bottom: 14px;">${data.missionDesc}</p>
      ${data.renderMission()}
    </div>

    <div class="activity-footer">
      ${isCompleted 
        ? `<button class="btn-secondary" style="width:100%" onclick="closeActivity()">Cerrar (Misión Completada ✅)</button>`
        : `<button class="btn-primary" style="width:100%" onclick="completeLiveSession(${dayNum})">Completar Misión + Sumar Puntos</button>`}
    </div>
  `;

  content.innerHTML = html;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Restore saved input values if available
  const savedData = localStorage.getItem(`live_session_${dayNum}_data`);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      Object.keys(parsed).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = parsed[id];
      });
    } catch(e) {}
  }

  // Render standalone Saboteur test UI for Day 1
  if (dayNum === 1) {
    renderLive1SaboteurUI();
  }
}

let l1QIndex = 0;
let l1Branch = '';
let l1Questions = [];
let l1Scores = { vengador: 0, euforico: 0, impaciente: 0, paralizado: 0 };
let l1Answers = [];

function renderLive1SaboteurUI() {
  const container = document.getElementById('live1-saboteur-container');
  if (!container) return;

  const sab = localStorage.getItem('saboteur_result');
  if (sab && inlineSaboteurs[sab]) {
    const info = inlineSaboteurs[sab];
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 20px; border-radius: 14px; text-align: center; margin-bottom: 12px;">
        <p style="color: var(--text-muted); font-size: 0.78rem; letter-spacing:0.1em; font-weight:700; margin-bottom: 8px;">TU SABOTEADOR DOMINANTE DETECTADO</p>
        <div style="font-size: 44px; margin-bottom: 6px;">${info.emoji}</div>
        <h3 style="color: ${info.color}; font-size: 1.4rem; margin: 0 0 8px 0; font-weight:800;">${info.name}</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.4; margin:0 0 16px 0;">${info.desc}</p>
        <button class="btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="startLive1Test()">
          <span>🔄</span> REPETIR / VOLVER A HACER EL TEST
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 20px; border-radius: 14px; text-align: center; margin-bottom: 12px;">
        <div style="font-size: 40px; margin-bottom: 8px;">🧠</div>
        <h3 style="color: var(--text-main); font-size: 1.2rem; margin: 0 0 8px 0;">Test del Saboteador (8 Preguntas)</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-bottom: 16px;">Descubre cuál de los 4 Saboteadores Financieros opera en tu mente.</p>
        <button class="btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="startLive1Test()">
          <span>🧠</span> COMENZAR TEST AHORA
        </button>
      </div>
    `;
  }
}

function startLive1Test() {
  l1QIndex = 0;
  l1Branch = '';
  l1Questions = [];
  l1Scores = { vengador: 0, euforico: 0, impaciente: 0, paralizado: 0 };
  l1Answers = [];
  renderLive1FilterQ();
}

function renderLive1FilterQ() {
  const container = document.getElementById('live1-saboteur-container');
  if (!container) return;

  let html = `
    <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 18px; border-radius: 14px; margin-bottom: 12px;">
      <div style="margin-bottom: 12px;">
        <div class="inline-test-progress-track"><div class="inline-test-progress-fill" style="width: 0%;"></div></div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">Pregunta 1 de 8</p>
      </div>
      <h3 style="color: var(--text-main); font-size: 1.05rem; margin-bottom: 14px; line-height: 1.4;">${inlineFilterQuestion.text}</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
  `;
  const letters = ['A', 'B'];
  inlineFilterQuestion.options.forEach((opt, i) => {
    html += `<button class="inline-test-option" onclick="selectLive1Filter('${opt.branch}')">
      <span class="inline-test-option__letter">${letters[i]}</span>
      <span>${opt.text}</span>
    </button>`;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

function selectLive1Filter(branch) {
  l1Branch = branch;
  l1Questions = branch === 'trader' ? inlineTraderQuestions : inlineNoTraderQuestions;
  l1Answers.push(branch);
  l1QIndex = 0;
  renderLive1Question();
}

function renderLive1Question() {
  const container = document.getElementById('live1-saboteur-container');
  if (!container) return;
  const q = l1Questions[l1QIndex];

  const pct = Math.round(((l1QIndex + 1) / 8) * 100);
  let html = `
    <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 18px; border-radius: 14px; margin-bottom: 12px;">
      <div style="margin-bottom: 12px;">
        <div class="inline-test-progress-track"><div class="inline-test-progress-fill" style="width: ${pct}%;"></div></div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">Pregunta ${l1QIndex + 2} de 8</p>
      </div>
      <h3 style="color: var(--text-main); font-size: 1.05rem; margin-bottom: 14px; line-height: 1.4;">${q.text}</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
  `;
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    html += `<button class="inline-test-option" onclick="selectLive1Option(${i})">
      <span class="inline-test-option__letter">${letters[i]}</span>
      <span>${opt.text}</span>
    </button>`;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

function selectLive1Option(index) {
  const q = l1Questions[l1QIndex];
  const opt = q.options[index];

  l1Answers.push(index);
  l1Scores.vengador += opt.scores[0];
  l1Scores.euforico += opt.scores[1];
  l1Scores.impaciente += opt.scores[2];
  l1Scores.paralizado += opt.scores[3];

  l1QIndex++;
  if (l1QIndex < l1Questions.length) {
    renderLive1Question();
  } else {
    // Finish test
    let maxScore = -1;
    let dominant = 'vengador';
    Object.keys(l1Scores).forEach(k => {
      if (l1Scores[k] > maxScore) {
        maxScore = l1Scores[k];
        dominant = k;
      }
    });

    localStorage.setItem('saboteur_result', dominant);
    localStorage.setItem('saboteur_scores', JSON.stringify(l1Scores));

    // Update topbar
    const sabMap = {
      vengador: { emoji: '🔥', name: 'El Vengador' },
      euforico: { emoji: '🎰', name: 'El Eufórico' },
      impaciente: { emoji: '⚡', name: 'El Impaciente' },
      paralizado: { emoji: '🧊', name: 'El Paralizado' }
    };
    if (sabMap[dominant]) {
      document.getElementById('saboteur-emoji').textContent = sabMap[dominant].emoji;
      document.getElementById('saboteur-name').textContent = sabMap[dominant].name;
    }

    renderLive1SaboteurUI();
    showMissionToast(`🧠 Diagnóstico completado: Tu saboteador es ${inlineSaboteurs[dominant].name}`);
  }
}

function completeLiveSession(dayNum) {
  // Capture input data for persistence
  const formData = {};
  const inputIds = [
    'live2-rule-input', 'live3-worst-trade', 'live4-asset', 'live4-signal', 'live4-stop',
    'live5-logbook-reflection', 'live8-question-input', 'live9-evolution-input'
  ];
  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) formData[id] = el.value;
  });
  
  if (Object.keys(formData).length > 0) {
    localStorage.setItem(`live_session_${dayNum}_data`, JSON.stringify(formData));
    if (formData['live2-rule-input']) {
      localStorage.setItem('live_rule', formData['live2-rule-input']);
    }
  }

  localStorage.setItem(`live_session_${dayNum}_completed`, 'true');
  
  closeActivity();
  updateLiveCardsUI();
  updatePointsDisplay();
  updateNextStepHero();
  
  const rewardsMap = { 1: 30, 2: 30, 3: 30, 4: 30, 5: 30, 6: 30, 7: 35, 8: 30, 9: 30, 10: 100 };
  const earnedPts = rewardsMap[dayNum] || 30;
  showMissionToast(`🎉 ¡Misión del Día ${dayNum} completada! +${earnedPts} PC asignados a tu cuenta.`);

  const token = localStorage.getItem('auth_token');
  if (token && token !== 'preview_admin_token') {
    fetch('https://chnpzcpczjtdsbfmjhei.supabase.co/rest/v1/rpc/save_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU'
      },
      body: JSON.stringify({ p_token: token, p_score: 9 + dayNum })
    }).catch(e => console.error(e));
  }
}

function updateLiveCardsUI() {
  document.querySelectorAll('.live-card').forEach(card => {
    const day = parseInt(card.getAttribute('data-live'));
    if (!day) return;
    const isDone = localStorage.getItem(`live_session_${day}_completed`) === 'true';
    const icon = card.querySelector('.live-icon');
    if (isDone) {
      card.style.border = '1px solid rgba(34, 197, 94, 0.4)';
      card.style.background = 'rgba(34, 197, 94, 0.08)';
      if (icon) icon.innerHTML = '<span style="color:#4ade80; font-size:1.2rem;">✅</span>';
    } else {
      card.style.border = '1px solid var(--border-subtle)';
      card.style.background = 'var(--surface)';
      if (icon) icon.innerHTML = '<span style="font-size:1.2rem;">🗓️</span>';
    }
  });
}

function resetPreviewState() {
  if (!confirm('¿Deseas reiniciar todas las misiones y puntos para volver a probar desde cero?')) return;
  for (let d = 1; d <= 10; d++) {
    localStorage.removeItem(`live_session_${d}_completed`);
    localStorage.removeItem(`live_session_${d}_data`);
  }
  localStorage.setItem(STORAGE_KEY, '9');
  currentActivity = 9;
  updateLiveCardsUI();
  updatePointsDisplay();
  showMissionToast('🔄 Misiones de prueba reiniciadas. ¡Puedes completar cualquier día desde cero!');
}

// Initial UI update on page load
document.addEventListener('DOMContentLoaded', () => {
  updateLiveCardsUI();
  updateNextStepHero();
});


