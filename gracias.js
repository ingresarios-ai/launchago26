// ========================================
// GRACIAS PAGE — LOGIC
// ========================================

(function () {
  // Read URL params
  var params = new URLSearchParams(window.location.search);
  var token = params.get('token') || localStorage.getItem('auth_token') || '';
  
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  var saboteurType = params.get('saboteur') || 'vengador';
  var branch = params.get('branch') || '';

  // Saboteur data
  var saboteurs = {
    vengador: { emoji: '🔥', name: 'EL VENGADOR', color: '#ef4444' },
    euforico: { emoji: '🎰', name: 'EL EUFÓRICO', color: '#f59e0b' },
    impaciente: { emoji: '⚡', name: 'EL IMPACIENTE', color: '#8b5cf6' },
    paralizado: { emoji: '🧊', name: 'EL PARALIZADO', color: '#3b82f6' }
  };

  var sab = saboteurs[saboteurType] || saboteurs.vengador;

  // Populate saboteur card
  var card = document.getElementById('saboteur-card');
  card.setAttribute('data-type', saboteurType);
  document.getElementById('sab-emoji').textContent = sab.emoji;
  document.getElementById('sab-name').textContent = sab.name;
  document.getElementById('sab-name').style.color = sab.color;
  document.getElementById('mission-saboteur-name').textContent = sab.name;
  document.getElementById('mission-saboteur-name').style.color = sab.color;

  // ========================================
  // COUNTDOWN — 3 de agosto 2026
  // ========================================

  var eventDate = new Date('2026-08-04T02:00:00Z'); // Aug 3, 8PM CDT = Aug 4 02:00 UTC

  function updateCountdown() {
    var now = new Date();
    var diff = eventDate - now;

    if (diff <= 0) {
      document.getElementById('ty-days').textContent = '00';
      document.getElementById('ty-hours').textContent = '00';
      document.getElementById('ty-minutes').textContent = '00';
      document.getElementById('ty-seconds').textContent = '00';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('ty-days').textContent = days < 10 ? '0' + days : days;
    document.getElementById('ty-hours').textContent = hours < 10 ? '0' + hours : hours;
    document.getElementById('ty-minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('ty-seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ========================================
  // GTM — Thank You Page View
  // ========================================

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'thank_you_page_view',
    saboteur_type: saboteurType,
    user_branch: branch
  });

})();
