// ========================================
// TEST DEL SABOTEADOR — LOGIC
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

// ========================================
// QUESTIONS — 8 situaciones reales
// Cada opción puntúa: [vengador, euforico, impaciente, paralizado]
// ========================================

var questions = [
  {
    text: 'Acabas de cerrar una operación con pérdida. ¿Cuál es tu primer impulso?',
    options: [
      { text: 'Abrir otra posición inmediatamente para recuperar lo perdido.', scores: [3, 0, 1, 0] },
      { text: 'Buscar la siguiente señal rápido, necesito sentir que estoy avanzando.', scores: [0, 0, 3, 0] },
      { text: 'Cerrar la plataforma. No quiero ver los números.', scores: [0, 0, 0, 3] },
      { text: 'Revisar qué salió mal con calma y anotar la lección.', scores: [0, 1, 0, 0] }
    ]
  },
  {
    text: 'Llevas 3 operaciones ganadoras seguidas. ¿Qué haces?',
    options: [
      { text: 'Aumento el tamaño de la posición — estoy en racha.', scores: [0, 3, 0, 0] },
      { text: 'Busco más entradas, el mercado me está dando la razón.', scores: [0, 1, 3, 0] },
      { text: 'Sigo el plan exactamente igual, sin cambiar el riesgo.', scores: [0, 0, 0, 0] },
      { text: 'Me da miedo que la racha se acabe y dejo de operar.', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Ves una oportunidad en el mercado pero no cumple al 100% con tu plan de trading. ¿Qué haces?',
    options: [
      { text: 'Entro igual — si espero la señal perfecta, pierdo la oportunidad.', scores: [0, 0, 3, 0] },
      { text: 'No entro, pero me quedo mirando la pantalla esperando que se confirme.', scores: [0, 0, 1, 2] },
      { text: 'La descarto completamente y busco una que cumpla las reglas.', scores: [0, 0, 0, 0] },
      { text: 'Pienso: "ya me perdí muchas así" y entro con posición más grande.', scores: [2, 1, 1, 0] }
    ]
  },
  {
    text: 'Tu stop loss se activa y el precio se da la vuelta exactamente después. ¿Qué sientes?',
    options: [
      { text: 'Rabia — voy a entrar de nuevo con más volumen para compensar.', scores: [3, 0, 1, 0] },
      { text: 'Frustración, pero entiendo que forma parte del proceso.', scores: [0, 0, 0, 0] },
      { text: 'Reentro inmediatamente sin pensarlo, el precio va para donde dije.', scores: [1, 0, 3, 0] },
      { text: 'Me paralizo. Empiezo a dudar de toda mi estrategia.', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Es viernes por la noche y piensas en tu semana de trading. ¿Cuál es tu reflexión más frecuente?',
    options: [
      { text: '"Si no hubiera perdido ese trade del martes, estaría en positivo."', scores: [3, 0, 0, 0] },
      { text: '"Fue una gran semana, el lunes voy con todo."', scores: [0, 3, 0, 0] },
      { text: '"Operé demasiado. Muchas entradas sin filtro."', scores: [0, 0, 3, 0] },
      { text: '"Vi muchas oportunidades pero no tomé ninguna."', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Alguien de tu entorno te cuenta que ganó mucho dinero con una operación. ¿Cómo reaccionas?',
    options: [
      { text: 'Siento urgencia por buscar mi propia operación grande ahora mismo.', scores: [1, 0, 3, 0] },
      { text: 'Pienso: "yo soy mejor, necesito demostrar que también puedo."', scores: [2, 2, 0, 0] },
      { text: 'Me alegro por él y sigo con mi plan como si nada.', scores: [0, 0, 0, 0] },
      { text: 'Me desanimo. Quizás no soy bueno para esto.', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Llevas una operación abierta con buena ganancia y el precio empieza a retroceder. ¿Qué haces?',
    options: [
      { text: 'Muevo mi take profit más lejos — puedo sacar más.', scores: [0, 3, 0, 0] },
      { text: 'Cierro inmediatamente antes de que se borre toda la ganancia.', scores: [0, 0, 2, 2] },
      { text: 'Respeto mi plan: dejo el stop y el take donde los puse.', scores: [0, 0, 0, 0] },
      { text: 'No sé qué hacer. Congelo la pantalla y espero.', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Si pudieras cambiar UNA cosa de tu forma de operar, ¿cuál sería?',
    options: [
      { text: 'Dejar de intentar recuperar las pérdidas en la misma sesión.', scores: [3, 0, 0, 0] },
      { text: 'No sobreoperar cuando las cosas van bien.', scores: [0, 3, 0, 0] },
      { text: 'Tener más paciencia para esperar las buenas señales.', scores: [0, 0, 3, 0] },
      { text: 'Dejar de analizar tanto y empezar a ejecutar.', scores: [0, 0, 0, 3] }
    ]
  }
];

// ========================================
// SABOTEUR PROFILES
// ========================================

var saboteurs = {
  vengador: {
    emoji: '🔥',
    name: 'EL VENGADOR',
    desc: 'Operas desde la revancha. Cada pérdida se convierte en una batalla personal que necesitas ganar, así que aumentas el riesgo para "recuperar". El problema: el mercado no te debe nada.',
    insight: 'Tu Saboteador se activa después de cada pérdida. Te susurra: "duplica la posición y sales en cero". Pero las estadísticas muestran que el 78% de las veces eso amplifica la pérdida.',
    color: '#ef4444'
  },
  euforico: {
    emoji: '🎰',
    name: 'EL EUFÓRICO',
    desc: 'Después de ganar, te sientes invencible. Aumentas el tamaño, sobreoperas y dejas de seguir las reglas que te dieron la ganancia. Tu peor enemigo no es la pérdida — es la racha ganadora.',
    insight: 'Tu Saboteador se activa cuando las cosas van bien. Te convence de que "estás en racha" y que las reglas ya no aplican. Los traders más peligrosos no son los que pierden — son los que no saben ganar.',
    color: '#f59e0b'
  },
  impaciente: {
    emoji: '⚡',
    name: 'EL IMPACIENTE',
    desc: 'Necesitas acción constante. Entras antes de tiempo, operas sin confirmación y confundes movimiento con progreso. Tu cuenta paga el costo de tu ansiedad.',
    insight: 'Tu Saboteador te hace creer que si no estás operando, estás perdiendo. Pero en trading, las mejores decisiones suelen ser las que NO tomas. La paciencia no es pasividad — es precisión.',
    color: '#8b5cf6'
  },
  paralizado: {
    emoji: '🧊',
    name: 'EL PARALIZADO',
    desc: 'Analizas todo pero no ejecutas nada. El miedo a equivocarte te congela y la oportunidad pasa frente a tus ojos mientras buscas "una señal más". Tu parálisis también cuesta dinero.',
    insight: 'Tu Saboteador usa la perfección como excusa para la inacción. Te convence de que necesitas más datos, más análisis, más confirmación. Pero el costo de NO actuar es invisible — y acumulativo.',
    color: '#3b82f6'
  }
};

// ========================================
// STATE
// ========================================

var currentQuestion = 0;
var answers = [];
var scores = { vengador: 0, euforico: 0, impaciente: 0, paralizado: 0 };
var token = new URLSearchParams(window.location.search).get('token') || '';

// ========================================
// SCREEN MANAGEMENT
// ========================================

function showScreen(screenId) {
  document.querySelectorAll('.test-screen').forEach(function (s) {
    s.classList.remove('test-screen--active');
  });
  document.getElementById(screenId).classList.add('test-screen--active');
}

function updateProgress(percent) {
  document.getElementById('progress-bar').style.width = percent + '%';
}

// ========================================
// START QUIZ
// ========================================

document.getElementById('btn-start').addEventListener('click', function () {
  showScreen('screen-questions');
  renderQuestion();
  updateProgress(0);
});

// ========================================
// RENDER QUESTION
// ========================================

function renderQuestion() {
  var q = questions[currentQuestion];
  var container = document.getElementById('question-container');

  // Fade out
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';

  setTimeout(function () {
    document.getElementById('question-counter').textContent = 'Pregunta ' + (currentQuestion + 1) + ' de ' + questions.length;
    document.getElementById('question-text').textContent = q.text;

    var optionsHtml = '';
    var letters = ['A', 'B', 'C', 'D'];
    q.options.forEach(function (opt, i) {
      optionsHtml += '<button class="test-option" data-index="' + i + '">' +
        '<span class="test-option__letter">' + letters[i] + '</span>' +
        '<span>' + opt.text + '</span>' +
        '</button>';
    });
    document.getElementById('question-options').innerHTML = optionsHtml;

    // Add click handlers
    document.querySelectorAll('.test-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectOption(parseInt(this.getAttribute('data-index')));
      });
    });

    // Fade in
    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }, 200);

  updateProgress(((currentQuestion) / questions.length) * 100);
}

// ========================================
// SELECT OPTION
// ========================================

function selectOption(index) {
  var q = questions[currentQuestion];
  var opt = q.options[index];

  // Visual feedback
  var allOptions = document.querySelectorAll('.test-option');
  allOptions.forEach(function (btn) { btn.style.pointerEvents = 'none'; });
  allOptions[index].classList.add('test-option--selected');

  // Record answer and accumulate scores
  answers.push(index);
  scores.vengador += opt.scores[0];
  scores.euforico += opt.scores[1];
  scores.impaciente += opt.scores[2];
  scores.paralizado += opt.scores[3];

  // Next question or results
  setTimeout(function () {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      renderQuestion();
    } else {
      updateProgress(100);
      showAnalyzing();
    }
  }, 600);
}

// ========================================
// ANALYZING ANIMATION
// ========================================

function showAnalyzing() {
  showScreen('screen-analyzing');

  var bar = document.getElementById('analyzing-bar');
  var text = document.getElementById('analyzing-text');
  var steps = [
    { progress: 25, text: 'Identificando patrones mentales...' },
    { progress: 50, text: 'Analizando respuestas emocionales...' },
    { progress: 75, text: 'Calculando tu arquetipo dominante...' },
    { progress: 100, text: '¡Resultado encontrado!' }
  ];

  var i = 0;
  function nextStep() {
    if (i < steps.length) {
      bar.style.width = steps[i].progress + '%';
      text.textContent = steps[i].text;
      i++;
      setTimeout(nextStep, 700);
    } else {
      setTimeout(showResult, 500);
    }
  }
  setTimeout(nextStep, 400);
}

// ========================================
// SHOW RESULT
// ========================================

function showResult() {
  // Determine dominant saboteur
  var maxScore = 0;
  var dominant = 'vengador';
  Object.keys(scores).forEach(function (key) {
    if (scores[key] > maxScore) {
      maxScore = scores[key];
      dominant = key;
    }
  });

  var sab = saboteurs[dominant];

  // Populate result card
  document.getElementById('result-card').setAttribute('data-type', dominant);
  document.getElementById('result-emoji').textContent = sab.emoji;
  document.getElementById('result-name').textContent = sab.name;
  document.getElementById('result-desc').textContent = sab.desc;
  document.getElementById('result-insight').innerHTML = '<strong>💡 Insight:</strong> ' + sab.insight;

  // Score bars
  var totalMax = Math.max(scores.vengador, scores.euforico, scores.impaciente, scores.paralizado, 1);
  var scoresHtml = '';
  var sabKeys = [
    { key: 'vengador', label: '🔥 Vengador', color: '#ef4444' },
    { key: 'euforico', label: '🎰 Eufórico', color: '#f59e0b' },
    { key: 'impaciente', label: '⚡ Impaciente', color: '#8b5cf6' },
    { key: 'paralizado', label: '🧊 Paralizado', color: '#3b82f6' }
  ];

  sabKeys.forEach(function (s) {
    var pct = Math.round((scores[s.key] / totalMax) * 100);
    scoresHtml += '<div class="score-bar">' +
      '<div class="score-bar__label" style="color:' + s.color + ';">' + s.label + ' <span style="color:var(--text-muted);font-weight:400;">' + scores[s.key] + ' pts</span></div>' +
      '<div class="score-bar__track"><div class="score-bar__fill" style="width:0%;background:' + s.color + ';" data-width="' + pct + '%"></div></div>' +
      '</div>';
  });
  document.getElementById('result-scores').innerHTML = scoresHtml;

  showScreen('screen-result');

  // Animate score bars after screen transition
  setTimeout(function () {
    document.querySelectorAll('.score-bar__fill').forEach(function (bar) {
      bar.style.width = bar.getAttribute('data-width');
    });
  }, 300);

  // Save to Supabase
  saveResult(dominant);
}

// ========================================
// SAVE RESULT TO SUPABASE
// ========================================

function saveResult(dominant) {
  if (!token) return;

  // First, get the lead_id by token
  fetch(SUPABASE_URL + '/rest/v1/leads?auth_token=eq.' + token + '&select=id', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'x-auth-token': token
    }
  })
  .then(function (res) { return res.json(); })
  .then(function (leads) {
    if (!leads || !leads.length) return;

    var leadId = leads[0].id;

    // Save test result
    return fetch(SUPABASE_URL + '/rest/v1/saboteur_test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        lead_id: leadId,
        answers: { responses: answers },
        saboteur_type: dominant,
        scores: scores
      })
    });
  })
  .then(function () {
    console.log('Test result saved to Supabase');
  })
  .catch(function (err) {
    console.error('Error saving test result:', err);
  });
}

// ========================================
// SHARE RESULT
// ========================================

function shareResult() {
  var dominant = document.getElementById('result-card').getAttribute('data-type');
  var sab = saboteurs[dominant];
  var shareText = 'Mi Saboteador es ' + sab.name + ' ' + sab.emoji + ' — ¿Cuál opera TU cuenta? Descúbrelo en 2 minutos:';
  var shareUrl = 'https://taller.ingresarios.net/test.html';

  if (navigator.share) {
    navigator.share({
      title: 'Test del Saboteador',
      text: shareText,
      url: shareUrl
    }).catch(function () {});
  } else {
    // Fallback: copy to clipboard
    var fullText = shareText + ' ' + shareUrl;
    navigator.clipboard.writeText(fullText).then(function () {
      var btn = document.getElementById('btn-share');
      btn.innerHTML = '✓ ¡COPIADO AL PORTAPAPELES!';
      setTimeout(function () {
        btn.innerHTML = 'COMPARTIR MI RESULTADO <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
      }, 2000);
    });
  }
}
