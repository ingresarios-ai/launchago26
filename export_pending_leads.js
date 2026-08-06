const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

async function exportPendingLeads() {
  console.log('🚀 Iniciando análisis de actividades de usuarios...');

  // 1. Fetch missions, pageviews, and surveys from Supabase
  const [missions, pageviews, surveys] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/mission_responses?select=*', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(r => r.json()).catch(() => []),
    fetch(SUPABASE_URL + '/rest/v1/analytics_pageviews?select=*&limit=5000', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(r => r.json()).catch(() => []),
    fetch(SUPABASE_URL + '/rest/v1/survey_responses?select=*&limit=5000', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(r => r.json()).catch(() => [])
  ]);

  console.log(`📊 Registros obtenidos -> Misiones: ${missions.length}, Visitas: ${pageviews.length}, Encuestas: ${surveys.length}`);

  // User Map: key (email or token) -> { name, email, phone, token, completedDays: Set }
  const userMap = {};

  // Track from mission_responses
  missions.forEach(m => {
    let day = parseInt(m.mission_id);
    if (isNaN(day) && m.mission_id === 'mission_01') day = 1;
    if (isNaN(day)) return;

    let email = '';
    let name = '';
    let phone = '';

    if (m.response && typeof m.response === 'string' && m.response.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(m.response);
        email = (parsed.email || parsed['reg-email'] || '').toLowerCase().trim();
        name = parsed.name || parsed['reg-name'] || '';
        phone = parsed.phone || parsed['reg-phone'] || '';
      } catch(e) {}
    }

    const key = email || m.auth_token;
    if (!key) return;

    if (!userMap[key]) {
      userMap[key] = {
        key: key,
        token: m.auth_token || '',
        email: email,
        name: name,
        phone: phone,
        completedDays: new Set()
      };
    }

    if (email && !userMap[key].email) userMap[key].email = email;
    if (name && !userMap[key].name) userMap[key].name = name;
    if (phone && !userMap[key].phone) userMap[key].phone = phone;
    userMap[key].completedDays.add(day);
  });

  // Track from analytics_pageviews
  pageviews.forEach(p => {
    if (p.user_agent && typeof p.user_agent === 'string' && p.user_agent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(p.user_agent);
        const email = (parsed.email || '').toLowerCase().trim();
        const key = email || p.visitor_id;
        if (!key) return;

        if (!userMap[key]) {
          userMap[key] = {
            key: key,
            token: p.visitor_id || '',
            email: email,
            name: parsed.name || '',
            phone: parsed.phone || '',
            completedDays: new Set()
          };
        }

        if (email && !userMap[key].email) userMap[key].email = email;
        if (parsed.name && !userMap[key].name) userMap[key].name = parsed.name;
        if (parsed.phone && !userMap[key].phone) userMap[key].phone = parsed.phone;

        if (parsed.day) userMap[key].completedDays.add(parseInt(parsed.day));
        if (p.page && p.page.includes('actividad')) {
          const match = p.page.match(/actividad(\d+)/);
          if (match) userMap[key].completedDays.add(parseInt(match[1]));
        }
      } catch(e) {}
    }
  });

  // Current active released days: Días 1, 2, 3 y 4
  const activeDays = [1, 2, 3, 4];
  const pendingLeads = [];

  Object.values(userMap).forEach(u => {
    const days = u.completedDays;
    // Condition: Completed Day 1 BUT missing at least one active day (Day 2, Day 3, or Day 4)
    const completedDay1 = days.has(1);
    const missingAnyActive = activeDays.some(d => !days.has(d));

    if (completedDay1 && missingAnyActive) {
      const completedList = activeDays.filter(d => days.has(d)).map(d => `Día ${d}`);
      const missingList = activeDays.filter(d => !days.has(d)).map(d => `Día ${d}`);
      const userEmail = u.email || (u.key.includes('@') ? u.key : '');
      const userPhone = u.phone || '';
      const userName = u.name || 'Participante';
      const customLink = userEmail 
        ? `https://taller.ingresarios.net/misiones?email=${encodeURIComponent(userEmail)}`
        : `https://taller.ingresarios.net/misiones?token=${encodeURIComponent(u.token || u.key)}`;

      pendingLeads.push({
        name: userName,
        email: userEmail,
        phone: userPhone,
        completed: completedList.join(' | '),
        pending: missingList.join(' | '),
        link: customLink
      });
    }
  });

  console.log(`🔍 Total de usuarios que completaron la Actividad 1 pero tienen pendientes: ${pendingLeads.length}`);

  // Build CSV
  const csvHeaders = ['Nombre', 'Email', 'Telefono', 'Actividades_Completadas', 'Actividades_Pendientes', 'Link_Personalizado'];
  const csvRows = pendingLeads.map(l => [
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.completed.replace(/"/g, '""')}"`,
    `"${l.pending.replace(/"/g, '""')}"`,
    `"${l.link}"`
  ].join(','));

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const outputPath = path.join(__dirname, 'leads_actividades_pendientes.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf8');

  console.log(`✅ Archivo exportado exitosamente en: ${outputPath}`);
}

exportPendingLeads();
