const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

async function exportCompletedLeads() {
  console.log('🚀 Iniciando extracción de usuarios que han realizado actividades...');

  // Fetch missions, pageviews, and surveys from Supabase
  const [missions, pageviews, surveys] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/mission_responses?select=*&limit=10000', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(r => r.json()).catch(() => []),
    fetch(SUPABASE_URL + '/rest/v1/analytics_pageviews?select=*&limit=10000', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(r => r.json()).catch(() => []),
    fetch(SUPABASE_URL + '/rest/v1/survey_responses?select=*&limit=10000', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(r => r.json()).catch(() => [])
  ]);

  console.log(`📊 Registros en DB -> Misiones: ${missions.length}, Visitas: ${pageviews.length}, Encuestas: ${surveys.length}`);

  // Info lookup by email
  const infoByEmail = {};
  const infoByToken = {};

  surveys.forEach(s => {
    const email = (s.email || '').toLowerCase().trim();
    const name = s.name || s.nombre || '';
    const phone = s.phone || s.telefono || s.whatsapp || '';

    if (email) {
      infoByEmail[email] = { name: name || (infoByEmail[email] ? infoByEmail[email].name : ''), phone: phone || (infoByEmail[email] ? infoByEmail[email].phone : '') };
    }
    if (s.auth_token) {
      infoByToken[s.auth_token] = { name: name || (infoByToken[s.auth_token] ? infoByToken[s.auth_token].name : ''), phone: phone || (infoByToken[s.auth_token] ? infoByToken[s.auth_token].phone : '') };
    }
  });

  // User Map: key (email or token) -> { name, email, phone, token, completedDays: Set }
  const userMap = {};

  function getOrCreateUser(email, token, extraName, extraPhone) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const info = (cleanEmail && infoByEmail[cleanEmail]) ? infoByEmail[cleanEmail] : ((token && infoByToken[token]) ? infoByToken[token] : null);

    const key = cleanEmail || token;
    if (!key) return null;

    if (!userMap[key]) {
      userMap[key] = {
        key: key,
        token: token || '',
        email: cleanEmail,
        name: (info ? info.name : '') || extraName || '',
        phone: (info ? info.phone : '') || extraPhone || '',
        completedDays: new Set()
      };
    } else {
      if (!userMap[key].email && cleanEmail) userMap[key].email = cleanEmail;
      if (!userMap[key].name && info && info.name) userMap[key].name = info.name;
      if (!userMap[key].name && extraName) userMap[key].name = extraName;
      if (!userMap[key].phone && info && info.phone) userMap[key].phone = info.phone;
      if (!userMap[key].phone && extraPhone) userMap[key].phone = extraPhone;
    }
    return userMap[key];
  }

  // 1. Process mission_responses
  missions.forEach(m => {
    let day = parseInt(m.mission_id);
    if (isNaN(day) && m.mission_id === 'mission_01') day = 1;
    if (isNaN(day) || day < 1 || day > 10) return;

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

    const u = getOrCreateUser(email, m.auth_token, name, phone);
    if (u) u.completedDays.add(day);
  });

  // 2. Process survey_responses
  surveys.forEach(s => {
    let email = (s.email || '').toLowerCase().trim();
    let name = s.name || s.nombre || '';
    let phone = s.phone || s.telefono || s.whatsapp || '';
    const u = getOrCreateUser(email, s.auth_token, name, phone);
    if (u) u.completedDays.add(1); // Day 1 completed
  });

  // 3. Process analytics_pageviews
  pageviews.forEach(p => {
    if (p.user_agent && typeof p.user_agent === 'string' && p.user_agent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(p.user_agent);
        const email = (parsed.email || '').toLowerCase().trim();
        const name = parsed.name || '';
        const phone = parsed.phone || '';
        const d = parsed.day ? parseInt(parsed.day) : (p.page && p.page.includes('actividad1') ? 1 : 0);

        if (d >= 1 && d <= 10) {
          const u = getOrCreateUser(email, p.visitor_id, name, phone);
          if (u) u.completedDays.add(d);
        }
      } catch(e) {}
    }
  });

  // Filter users with at least 1 completed activity
  const completedLeads = Object.values(userMap).filter(u => u.completedDays.size > 0 && (u.email || u.name || u.phone));

  // Sort by count of completed days descending
  completedLeads.sort((a, b) => b.completedDays.size - a.completedDays.size);

  console.log(`✅ Total leads identificados que han realizado actividades: ${completedLeads.length}`);

  // Build CSV
  const csvHeaders = ['Nombre', 'Correo', 'Telefono', 'Actividades_Completadas_Count', 'Lista_Actividades', 'Puntos_Acumulados'];
  const csvRows = [csvHeaders.join(',')];

  completedLeads.forEach(u => {
    const sortedDays = Array.from(u.completedDays).sort((a, b) => a - b);
    const dayStr = sortedDays.map(d => `Dia ${d}`).join(' | ');
    const count = sortedDays.length;
    const points = count * 30;

    const name = `"${(u.name || '').replace(/"/g, '""')}"`;
    const email = `"${(u.email || '').replace(/"/g, '""')}"`;
    const phone = `"${(u.phone || '').replace(/"/g, '""')}"`;
    const list = `"${dayStr}"`;

    csvRows.push([name, email, phone, count, list, `${points} PC`].join(','));
  });

  const csvContent = csvRows.join('\n');
  const outputPath = path.join('/Users/josuegarcia/Antigravity/Launch Jul 26', 'leads_actividades_completadas.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf8');

  console.log(`🎉 CSV generado exitosamente con ${completedLeads.length} filas en: ${outputPath}`);
}

exportCompletedLeads();
