// ========================================
// GENOMA CERO - JOURNEY ENGINE
// ========================================

const STORAGE_KEY = 'genoma_current_activity';
const MAX_ACTIVITIES = 10;

// Current state (starts at 1 if not set)
let currentActivity = parseInt(localStorage.getItem(STORAGE_KEY)) || 1;

// Activity Data Map (Phase 1 implementations)
const activitiesData = {
  1: {
    title: "Bienvenido a GENOMA",
    reward: "+20 pts",
    render: () => `
      <p class="activity-desc">Tu viaje para recuperar el control comienza aquí. Observa el video, entiende las reglas del juego y da el primer paso.</p>
      <div class="video-wrapper">
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" frameborder="0" allow="autoplay; encrypted-media" style="position:absolute; top:0; left:0;" allowfullscreen></iframe>
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
    `
  },
  2: {
    title: "Punto de Partida",
    reward: "+30 pts",
    render: () => {
      const hasTest = localStorage.getItem('saboteur_result');
      if (hasTest) {
        return `
          <p class="activity-desc">Detectamos que ya completaste tu Test de Saboteador durante tu registro inicial. ¡Excelente iniciativa!</p>
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid var(--green); padding: 16px; border-radius: 12px; margin-top: 16px;">
            <h4 style="color: var(--green); margin:0 0 8px 0; display:flex; align-items:center; gap:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Diagnóstico Completado
            </h4>
            <p style="color: var(--green); margin:0; font-size:0.9rem; opacity: 0.9;">Tus datos genómicos ya están guardados en la bóveda. Puedes reclamar tus puntos de inmediato.</p>
          </div>
        `;
      } else {
        return `
          <p class="activity-desc">Para poder avanzar, necesitamos perfilar tu Genoma y descubrir qué Saboteador te está frenando.</p>
          <button class="btn-primary" style="margin-top: 16px;" onclick="window.location.href='test.html'">Ir al Diagnóstico AHORA</button>
        `;
      }
    }
  },
  3: {
    title: "Tu Patrón Dominante",
    reward: "+15 pts",
    render: () => {
      const saboteur = localStorage.getItem('saboteur_result') || 'vengador';
      const sabMap = {
        vengador: { emoji: '🔥', name: 'El Vengador', desc: 'Sientes la necesidad urgente de recuperar lo perdido inmediatamente, rompiendo tus reglas y aumentando tu riesgo por venganza emocional.' },
        euforico: { emoji: '🎰', name: 'El Eufórico', desc: 'Ganas y te sientes invencible. Aumentas el tamaño de tu posición ignorando tu plan por exceso de confianza.' },
        impaciente: { emoji: '⚡', name: 'El Impaciente', desc: 'No puedes esperar. Entras al mercado antes de que tu sistema te dé confirmación por miedo a quedarte fuera (FOMO).' },
        paralizado: { emoji: '🧊', name: 'El Paralizado', desc: 'El miedo a equivocarte te congela. Ves pasar las oportunidades claras frente a ti y no ejecutas por sobrepensarlo todo.' }
      };
      const info = sabMap[saboteur];
      return `
        <p class="activity-desc">Los resultados de tu diagnóstico revelan que este es el principal patrón mental que debes dominar para tener éxito.</p>
        <div style="background: var(--surface); border: 1px solid var(--border-subtle); padding: 24px; border-radius: 16px; text-align: center; margin-top: 16px;">
          <div style="font-size: 48px; margin-bottom: 12px;">${info.emoji}</div>
          <h3 style="color: var(--text-main); font-size: 1.5rem; margin: 0 0 8px 0;">${info.name}</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin:0;">${info.desc}</p>
        </div>
      `;
    }
  },
  4: {
    title: "Diseña tu entorno",
    reward: "+20 pts",
    render: () => `
      <p class="activity-desc">El éxito es predecible si preparas tu entorno. Verifica que tienes todo listo antes del evento en vivo.</p>
      <div class="checklist" id="checklist-act4">
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
  6: {
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
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderJourney();
  
  // Track saboteur from test
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
  }
});

// ========================================
// CORE ENGINE FUNCTIONS
// ========================================

function renderJourney() {
  // Update progress bar
  const progressPercent = Math.min(((currentActivity - 1) / MAX_ACTIVITIES) * 100, 100);
  document.getElementById('journey-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('current-day-text').textContent = currentActivity;

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
    if (actId === 6) {
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

function completeActivity(actId) {
  // 1. Confetti animation
  const btn = document.querySelector('.activity-footer button');
  btn.style.animation = 'popConfetti 0.6s ease';
  btn.innerHTML = '¡Completado! 🎉';
  
  setTimeout(() => {
    // 2. Advance state if it's the current one
    if (actId === currentActivity && currentActivity < MAX_ACTIVITIES) {
      currentActivity++;
      localStorage.setItem(STORAGE_KEY, currentActivity.toString());
      renderJourney();
    }
    
    // 3. Close
    closeActivity();
  }, 1000);
}

// Helpers
function toggleCheck(el) {
  el.classList.toggle('checked');
}
