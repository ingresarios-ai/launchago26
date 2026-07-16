// ========================================
// TEST DEL SABOTEADOR — LOGIC
// Bifurcación: traders vs no-traders
// ========================================

var SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

// GHL Webhooks
var GHL_WEBHOOK_WHATSAPP = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/c17e220a-db9c-42ba-8665-421ed7c223a4';
var GHL_WEBHOOK_VIDEO = '';    // TODO: add when ready
var GHL_WEBHOOK_MISSION = '';  // TODO: add when ready
var GHL_WEBHOOK_TEST = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/AF9SlEmf2Qj2H4GxsFjf';

// ========================================
// PREGUNTA FILTRO
// ========================================

var filterQuestion = {
  text: '¿Ya operas en mercados financieros (Forex, cripto, acciones, futuros)?',
  options: [
    { text: 'Sí, ya opero o he operado activamente.', branch: 'trader' },
    { text: 'Aún no, pero quiero empezar o estoy aprendiendo.', branch: 'no-trader' }
  ]
};

// ========================================
// PREGUNTAS PARA TRADERS (7 preguntas)
// Cada opción: [vengador, euforico, impaciente, paralizado]
// ========================================

var traderQuestions = [
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
    text: 'Ves una oportunidad pero no cumple al 100% con tu plan de trading. ¿Qué haces?',
    options: [
      { text: 'Entro igual — si espero la señal perfecta, pierdo la oportunidad.', scores: [0, 0, 3, 0] },
      { text: 'No entro, pero me quedo mirando la pantalla esperando que se confirme.', scores: [0, 0, 1, 2] },
      { text: 'La descarto completamente y busco una que cumpla las reglas.', scores: [0, 0, 0, 0] },
      { text: 'Pienso: "ya me perdí muchas así" y entro con posición más grande.', scores: [2, 1, 1, 0] }
    ]
  },
  {
    text: 'Tu stop loss se activa y el precio se da la vuelta justo después. ¿Qué sientes?',
    options: [
      { text: 'Rabia — voy a entrar de nuevo con más volumen para compensar.', scores: [3, 0, 1, 0] },
      { text: 'Frustración, pero entiendo que forma parte del proceso.', scores: [0, 0, 0, 0] },
      { text: 'Reentro inmediatamente sin pensarlo, el precio va para donde dije.', scores: [1, 0, 3, 0] },
      { text: 'Me paralizo. Empiezo a dudar de toda mi estrategia.', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Es viernes y piensas en tu semana de trading. ¿Cuál es tu reflexión más frecuente?',
    options: [
      { text: '"Si no hubiera perdido ese trade del martes, estaría en positivo."', scores: [3, 0, 0, 0] },
      { text: '"Fue una gran semana, el lunes voy con todo."', scores: [0, 3, 0, 0] },
      { text: '"Operé demasiado. Muchas entradas sin filtro."', scores: [0, 0, 3, 0] },
      { text: '"Vi muchas oportunidades pero no tomé ninguna."', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Llevas una operación con buena ganancia y el precio empieza a retroceder. ¿Qué haces?',
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
// PREGUNTAS PARA NO-TRADERS (7 preguntas)
// Mismos arquetipos, contexto de dinero cotidiano
// ========================================

var noTraderQuestions = [
  {
    text: 'Haces una inversión o compra importante y pierdes dinero. ¿Cuál es tu reacción?',
    options: [
      { text: 'Busco recuperar ese dinero lo más rápido posible, aunque sea arriesgando más.', scores: [3, 0, 1, 0] },
      { text: 'Necesito actuar ya — no puedo quedarme de brazos cruzados.', scores: [0, 0, 3, 0] },
      { text: 'Me bloqueo. No quiero pensar más en dinero por un tiempo.', scores: [0, 0, 0, 3] },
      { text: 'Analizo qué pasó y tomo nota para la próxima vez.', scores: [0, 1, 0, 0] }
    ]
  },
  {
    text: 'Recibes un ingreso extra que no esperabas. ¿Qué haces?',
    options: [
      { text: 'Lo invierto todo de una — hay que aprovechar mientras tengo capital.', scores: [0, 3, 1, 0] },
      { text: 'Busco la mejor oportunidad rápido antes de que se me vaya la plata.', scores: [0, 1, 3, 0] },
      { text: 'Lo guardo y espero. Necesito investigar más antes de moverlo.', scores: [0, 0, 0, 3] },
      { text: 'Divido: una parte la invierto y otra la reservo.', scores: [0, 0, 0, 0] }
    ]
  },
  {
    text: 'Alguien te habla de una oportunidad de negocio o inversión. ¿Cómo reaccionas?',
    options: [
      { text: 'Si suena bien, entro de una. Las oportunidades no esperan.', scores: [0, 0, 3, 0] },
      { text: 'Investigo, pero al final nunca me decido. Siempre falta algo.', scores: [0, 0, 0, 3] },
      { text: 'Me emociono y quiero entrar con todo lo que tengo.', scores: [0, 3, 0, 0] },
      { text: 'Evalúo con calma si encaja con mi situación actual.', scores: [0, 0, 0, 0] }
    ]
  },
  {
    text: 'Un amigo te cuenta que ganó mucho dinero con algo. ¿Qué sientes?',
    options: [
      { text: '"¿Por qué no fui yo? Necesito encontrar MI oportunidad ahora."', scores: [2, 0, 2, 0] },
      { text: '"Yo también puedo. Voy a meterle con todo."', scores: [1, 3, 0, 0] },
      { text: 'Me alegro por él, pero sigo con mi camino.', scores: [0, 0, 0, 0] },
      { text: 'Me desanimo. Siento que siempre llego tarde a todo.', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Piensas en tu situación financiera actual. ¿Cuál frase te identifica más?',
    options: [
      { text: '"Si no hubiera cometido ese error, estaría mucho mejor."', scores: [3, 0, 0, 0] },
      { text: '"Siento que estoy a punto de dar un gran salto."', scores: [0, 3, 0, 0] },
      { text: '"Necesito generar más ingresos ya, no puedo esperar."', scores: [0, 0, 3, 0] },
      { text: '"Quiero empezar algo, pero no sé por dónde ni cuándo."', scores: [0, 0, 0, 3] }
    ]
  },
  {
    text: 'Tienes que tomar una decisión financiera importante. ¿Cómo la enfrentas?',
    options: [
      { text: 'Decido rápido. Si sale mal, ajusto sobre la marcha.', scores: [0, 1, 3, 0] },
      { text: 'Siento que si no actúo ahora, la oportunidad desaparece.', scores: [1, 2, 1, 0] },
      { text: 'Analizo tanto que a veces se me pasa el momento.', scores: [0, 0, 0, 3] },
      { text: 'Busco información, pido opiniones y luego decido.', scores: [0, 0, 0, 0] }
    ]
  },
  {
    text: 'Si pudieras cambiar UNA cosa de tu relación con el dinero, ¿cuál sería?',
    options: [
      { text: 'Dejar de intentar recuperar lo que ya perdí.', scores: [3, 0, 0, 0] },
      { text: 'No dejarme llevar por la emoción cuando las cosas van bien.', scores: [0, 3, 0, 0] },
      { text: 'Tener más paciencia y no actuar por impulso.', scores: [0, 0, 3, 0] },
      { text: 'Dejar de pensar tanto y empezar a actuar de una vez.', scores: [0, 0, 0, 3] }
    ]
  }
];

// ========================================
// SABOTEUR PROFILES (universales)
// ========================================

var saboteurs = {
  vengador: {
    emoji: '🔥',
    name: 'EL VENGADOR',
    desc: 'Actúas desde la revancha. Cada pérdida se convierte en una batalla personal que necesitas ganar, así que aumentas el riesgo para "recuperar". El problema: ni el mercado ni el dinero te deben nada.',
    insight: 'Tu Saboteador se activa después de cada pérdida. Te susurra: "recupéralo ya". Pero las decisiones tomadas desde la rabia amplían la pérdida el 78% de las veces.',
    color: '#ef4444'
  },
  euforico: {
    emoji: '🎰',
    name: 'EL EUFÓRICO',
    desc: 'Cuando las cosas van bien, te sientes invencible. Arriesgas más, dejas de seguir las reglas y sobreactúas. Tu peor enemigo no es el fracaso — es el éxito mal gestionado.',
    insight: 'Tu Saboteador se activa cuando las cosas van bien. Te convence de que "estás en racha" y que las reglas ya no aplican. Las personas más peligrosas con el dinero no son las que pierden — son las que no saben ganar.',
    color: '#f59e0b'
  },
  impaciente: {
    emoji: '⚡',
    name: 'EL IMPACIENTE',
    desc: 'Necesitas acción constante. Actúas antes de tiempo, decides sin confirmación y confundes movimiento con progreso. Tu bolsillo paga el costo de tu ansiedad.',
    insight: 'Tu Saboteador te hace creer que si no estás actuando, estás perdiendo. Pero las mejores decisiones financieras suelen ser las que NO tomas impulsivamente. La paciencia no es pasividad — es precisión.',
    color: '#8b5cf6'
  },
  paralizado: {
    emoji: '🧊',
    name: 'EL PARALIZADO',
    desc: 'Analizas todo pero no decides nada. El miedo a equivocarte te congela y las oportunidades pasan frente a ti mientras buscas "más información". Tu inacción también cuesta dinero.',
    insight: 'Tu Saboteador usa la perfección como excusa para la inacción. Te convence de que necesitas más datos, más seguridad. Pero el costo de NO actuar es invisible — y acumulativo.',
    color: '#3b82f6'
  }
};

// ========================================
// STATE
// ========================================

var currentQuestion = 0;
var answers = [];
var scores = { vengador: 0, euforico: 0, impaciente: 0, paralizado: 0 };
var token = new URLSearchParams(window.location.search).get('token') || localStorage.getItem('auth_token') || '';

// Persist token to localStorage so app.html can pick it up
if (token && !localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', token);
}

if (!token) {
  // window.location.href = '/';
}
var userEmail = localStorage.getItem('user_email') || '';
var userBranch = ''; // 'trader' or 'no-trader'
var activeQuestions = []; // set after filter question
var totalQuestions = 8; // filter + 7 branch questions

// GTM Conversion Tracking on Load (Fires only once per session)
if (token && !sessionStorage.getItem('lead_pixel_fired')) {
  sessionStorage.setItem('lead_pixel_fired', 'true');
  console.log('Lead pixel tracked by GTM native pageview.');
}

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
  renderFilterQuestion();
  updateProgress(0);
});

// ========================================
// RENDER FILTER QUESTION (Pregunta 1)
// ========================================

function renderFilterQuestion() {
  var container = document.getElementById('question-container');
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';

  setTimeout(function () {
    document.getElementById('question-counter').textContent = 'Pregunta 1 de ' + totalQuestions;
    document.getElementById('question-text').textContent = filterQuestion.text;

    var optionsHtml = '';
    var letters = ['A', 'B'];
    filterQuestion.options.forEach(function (opt, i) {
      optionsHtml += '<button class="test-option" data-branch="' + opt.branch + '">' +
        '<span class="test-option__letter">' + letters[i] + '</span>' +
        '<span>' + opt.text + '</span>' +
        '</button>';
    });
    document.getElementById('question-options').innerHTML = optionsHtml;

    document.querySelectorAll('.test-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Visual feedback
        document.querySelectorAll('.test-option').forEach(function (b) { b.style.pointerEvents = 'none'; });
        this.classList.add('test-option--selected');

        // Set branch
        userBranch = this.getAttribute('data-branch');
        activeQuestions = userBranch === 'trader' ? traderQuestions : noTraderQuestions;
        answers.push(userBranch);
        localStorage.setItem('genoma_user_branch', userBranch);

        // Move to first real question
        setTimeout(function () {
          currentQuestion = 0;
          renderQuestion();
        }, 600);
      });
    });

    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }, 200);
}

// ========================================
// RENDER QUESTION (preguntas 2-8)
// ========================================

function renderQuestion() {
  var q = activeQuestions[currentQuestion];
  var container = document.getElementById('question-container');

  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';

  setTimeout(function () {
    // +2 because filter is question 1, and currentQuestion is 0-indexed
    document.getElementById('question-counter').textContent = 'Pregunta ' + (currentQuestion + 2) + ' de ' + totalQuestions;
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

    document.querySelectorAll('.test-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectOption(parseInt(this.getAttribute('data-index')));
      });
    });

    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }, 200);

  updateProgress(((currentQuestion + 1) / totalQuestions) * 100);
}

// ========================================
// SELECT OPTION
// ========================================

function selectOption(index) {
  var q = activeQuestions[currentQuestion];
  var opt = q.options[index];

  var allOptions = document.querySelectorAll('.test-option');
  allOptions.forEach(function (btn) { btn.style.pointerEvents = 'none'; });
  allOptions[index].classList.add('test-option--selected');

  answers.push(index);
  scores.vengador += opt.scores[0];
  scores.euforico += opt.scores[1];
  scores.impaciente += opt.scores[2];
  scores.paralizado += opt.scores[3];

  setTimeout(function () {
    currentQuestion++;
    if (currentQuestion < activeQuestions.length) {
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
// SHOW RESULT — brief, then redirect to thank you
// ========================================

function showResult(skipPushState) {
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

  // Persist for SPA reloads
  localStorage.setItem('saboteur_scores', JSON.stringify(scores));
  localStorage.setItem('saboteur_result', dominant);
  // Populate mission saboteur name
  var missionEl = document.getElementById('mission-saboteur-name');
  if (missionEl) missionEl.textContent = sab.name;

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

  if (!skipPushState) {
    navigateTo('/resultado', 'screen-result');
  } else {
    showScreen('screen-result');
  }

  // Animate score bars
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

  fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ p_token: token })
  })
  .then(function (res) { return res.json(); })
  .then(function (leads) {
    if (!leads || !leads.length) return;
    var leadId = leads[0].id;

    return fetch(SUPABASE_URL + '/rest/v1/saboteur_test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        lead_id: leadId,
        answers: { branch: userBranch, responses: answers },
        saboteur_type: dominant,
        scores: scores
      })
    });
  })
  .then(function () { 
    console.log('Test result saved'); 
    
    // Fire GHL Webhook for Test Completion
    if (GHL_WEBHOOK_TEST) {
      fetch(GHL_WEBHOOK_TEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          auth_token: token, 
          saboteur_type: dominant,
          action: 'test_completed'
        })
      }).catch(function() {});
    }
  })
  .catch(function (err) { console.error('Error saving:', err); });
}

// ========================================
// CONTINUE TO THANK YOU PAGE
// ========================================

function goToThankYou() {
  var dominant = document.getElementById('result-card').getAttribute('data-type');
  var params = 'token=' + token + '&saboteur=' + dominant + '&branch=' + userBranch;
  window.location.href = 'gracias.html?' + params;
}

// ========================================
// SHARE RESULT
// ========================================

function shareResult() {
  var dominant = document.getElementById('result-card').getAttribute('data-type');
  var sab = saboteurs[dominant];
  var shareText = 'Mi Saboteador es ' + sab.name + ' ' + sab.emoji + ' — ¿Cuál es el tuyo? Descúbrelo en 2 minutos:';
  var shareUrl = 'https://taller.ingresarios.net/test';

  if (navigator.share) {
    navigator.share({ title: 'Test del Saboteador', text: shareText, url: shareUrl }).catch(function () {});
  } else {
    navigator.clipboard.writeText(shareText + ' ' + shareUrl).then(function () {
      var btn = document.getElementById('btn-share');
      var orig = btn.innerHTML;
      btn.innerHTML = '✓ ¡COPIADO!';
      setTimeout(function () { btn.innerHTML = orig; }, 2000);
    });
  }
}

// ========================================
// WHATSAPP CLICK TRACKING
// ========================================

function whatsappClicked() {
  var dominant = document.getElementById('result-card').getAttribute('data-type');
  var sab = saboteurs[dominant];

  localStorage.setItem('whatsapp_clicked_local', 'true');

  // 1. Fire GHL webhook (fire and forget)
  if (GHL_WEBHOOK_WHATSAPP) {
    fetch(GHL_WEBHOOK_WHATSAPP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'whatsapp_clicked',
        auth_token: token,
        email: userEmail,
        saboteur: dominant,
        saboteur_name: sab.name,
        branch: userBranch,
        timestamp: new Date().toISOString()
      })
    }).catch(function () {});
  }

  // 2. Save progress to Supabase
  trackProgress('whatsapp_clicked');


}

// ========================================
// PROGRESS TRACKING (Supabase)
// ========================================

function trackProgress(milestone) {
  if (!token) return;

  fetch(SUPABASE_URL + '/rest/v1/user_progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      auth_token: token,
      milestone: milestone,
      completed_at: new Date().toISOString()
    })
  }).catch(function (err) {
    console.error('Progress tracking error:', err);
  });
}

// ========================================
// SUBMIT MISSION RESPONSE
// ========================================

function submitMission() {
  var responseEl = document.getElementById('mission-response');
  var btn = document.getElementById('btn-submit-mission');
  var response = responseEl.value.trim();

  if (!response) {
    responseEl.style.borderColor = '#ef4444';
    responseEl.setAttribute('placeholder', '⚠️ Escribe tu respuesta antes de enviar...');
    setTimeout(function () {
      responseEl.style.borderColor = '';
      responseEl.setAttribute('placeholder', '🎯 Mi Saboteador me hizo: ...\n📍 Lo que debí hacer: ...');
    }, 2500);
    return;
  }

  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';
  btn.innerHTML = 'Enviando...';

  // 1. Save to Supabase
  fetch(SUPABASE_URL + '/rest/v1/mission_responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      auth_token: token,
      mission_id: 'mission_01',
      response: response,
      points: 20
    })
  })
  .then(function () {
    // 2. Track milestone
    trackProgress('mission_01_completed');

    // 3. Fire GHL webhook if configured
    if (GHL_WEBHOOK_MISSION) {
      fetch(GHL_WEBHOOK_MISSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'mission_completed',
          auth_token: token,
          email: userEmail,
          mission_id: 'mission_01',
          response: response,
          timestamp: new Date().toISOString()
        })
      }).catch(function () {});
    }



    // 5. Success state
    btn.innerHTML = '✅ ¡MISIÓN COMPLETADA! +20 pts';
    btn.style.background = 'rgba(34, 197, 94, 0.2)';
    btn.style.borderColor = 'var(--green)';
    btn.style.opacity = '1';
    responseEl.disabled = true;
    responseEl.style.opacity = '0.6';
  })
  .catch(function (err) {
    console.error('Mission submit error:', err);
    btn.innerHTML = '⚠️ Error — Intenta de nuevo';
    btn.style.pointerEvents = '';
    btn.style.opacity = '';
    setTimeout(function () {
      btn.innerHTML = 'COMPLETAR MISIÓN  +20 pts';
    }, 2500);
  });
}

// ========================================
// COUNTDOWN TIMER — Aug 3, 2026
// ========================================
var testEventDate = new Date('2026-08-04T02:00:00Z'); // Aug 3, 8PM CDT = Aug 4 02:00 UTC

function updateTestCountdown() {
  var now = new Date();
  var diff = testEventDate - now;

  var daysEl = document.getElementById('test-days');
  var hoursEl = document.getElementById('test-hours');
  var minsEl = document.getElementById('test-minutes');
  var secsEl = document.getElementById('test-seconds');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  if (diff <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minsEl.textContent = '00';
    secsEl.textContent = '00';
    return;
  }

  var days = Math.floor(diff / (1000 * 60 * 60 * 24));
  var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((diff % (1000 * 60)) / 1000);

  daysEl.textContent = days < 10 ? '0' + days : days;
  hoursEl.textContent = hours < 10 ? '0' + hours : hours;
  minsEl.textContent = minutes < 10 ? '0' + minutes : minutes;
  secsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
}

updateTestCountdown();
setInterval(updateTestCountdown, 1000);

// ========================================
// SPA ROUTER
// ========================================

function navigateTo(path, screenId) {
  if (window.location.pathname !== path) {
    history.pushState({ screen: screenId }, '', path);
  }
  showScreen(screenId);
  window.scrollTo(0,0);
  

}

window.addEventListener('popstate', function (event) {
  if (event.state && event.state.screen) {
    showScreen(event.state.screen);
  } else {
    initRouter();
  }
});

function initRouter() {
  var path = window.location.pathname;
  var hasResult = localStorage.getItem('saboteur_result') !== null;
  
  if (path === '/resultado') {
    if (hasResult) {
      var storedScores = localStorage.getItem('saboteur_scores');
      if (storedScores) {
         scores = JSON.parse(storedScores);
         showResult(true); // render without pushing state again
      } else {
         navigateTo('/test', 'screen-intro');
      }
    } else {
      navigateTo('/test', 'screen-intro');
    }
  } else {
    // Default to /test
    if (path !== '/test') {
      history.replaceState({ screen: 'screen-intro' }, '', '/test');
    }
    showScreen('screen-intro');
  }
}

// ========================================
// MAGIC LINK ROUTER
// ========================================
function verifyMagicLink() {
  if (!token) {
    window.location.href = '/';
    return;
  }

  fetch(SUPABASE_URL + '/rest/v1/rpc/get_progress_by_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
    body: JSON.stringify({ p_token: token })
  })
  .then(function(r) { return r.json(); })
  .then(function(progress) {
    var hasWhatsapp = false;
    if (progress && progress.length > 0) {
      hasWhatsapp = progress.some(function(p) { return p.milestone === 'whatsapp_clicked'; });
    }

    if (hasWhatsapp) {
      window.location.href = '/app.html';
      return;
    }

    fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
      body: JSON.stringify({ p_token: token })
    })
    .then(function(r) { return r.json(); })
    .then(function(leads) {
      if (leads && leads.length > 0) {
        var leadId = leads[0].id;
        fetch(SUPABASE_URL + '/rest/v1/rpc/get_test_by_lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
          body: JSON.stringify({ p_lead_id: leadId })
        })
        .then(function(r) { return r.json(); })
        .then(function(tests) {
          if (tests && tests.length > 0) {
            var testData = tests[0];
            localStorage.setItem('saboteur_result', testData.saboteur_type);
            localStorage.setItem('saboteur_scores', JSON.stringify(testData.scores));
            localStorage.setItem('user_branch', testData.answers.branch || '');

            var path = window.location.pathname;
            if (path !== '/resultado') {
              history.replaceState({ screen: 'screen-result' }, '', '/resultado');
            }
            initRouter();

            setTimeout(function() {
              var btn = document.getElementById('whatsapp-link');
              if (btn) {
                btn.classList.add('test-btn--whatsapp-glow');
                btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> ⚠️ SOLO TE FALTA UNIRTE AL GRUPO';
              }
            }, 600);
          } else {
            initRouter();
          }
        }).catch(function() { initRouter(); });
      } else {
        initRouter();
      }
    }).catch(function() { initRouter(); });
  })
  .catch(function(err) {
    initRouter();
  });
}

// Initialize router on load
verifyMagicLink();

function goToApp() {
  var t = localStorage.getItem('auth_token') || token;
  window.location.href = 'app.html' + (t ? '?token=' + t : '');
}
