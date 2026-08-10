const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';

async function fetchAllPaginated(table) {
  let all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    offset += limit;
    if (data.length < limit) break;
  }
  return all;
}

async function lookupLeadByToken(token) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_lead_by_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      },
      body: JSON.stringify({ p_token: token })
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0];
    if (data && data.email) return data;
    return null;
  } catch (e) {
    return null;
  }
}

// Rate-limited batch lookup (5 concurrent)
async function batchLookupTokens(tokens) {
  const results = {};
  const concurrency = 5;
  let idx = 0;

  async function worker() {
    while (idx < tokens.length) {
      const i = idx++;
      const token = tokens[i];
      if (i % 50 === 0) process.stdout.write(`  Buscando leads... ${i}/${tokens.length}\r`);
      const lead = await lookupLeadByToken(token);
      if (lead) {
        results[token] = {
          email: (lead.email || '').toLowerCase().trim(),
          name: lead.name || '',
          phone: lead.phone || ''
        };
      }
    }
  }

  const workers = [];
  for (let w = 0; w < concurrency; w++) workers.push(worker());
  await Promise.all(workers);
  console.log(`  Leads encontrados via token lookup: ${Object.keys(results).length}/${tokens.length}`);
  return results;
}

async function main() {
  console.log('🚀 Extrayendo usuarios que han realizado actividades...');

  const [missions, pageviews, surveys] = await Promise.all([
    fetchAllPaginated('mission_responses'),
    fetchAllPaginated('analytics_pageviews'),
    fetchAllPaginated('survey_responses')
  ]);

  console.log(`📊 Registros -> Misiones: ${missions.length}, Visitas: ${pageviews.length}, Encuestas: ${surveys.length}`);

  // 1. Build user map keyed by auth_token
  const userMap = {}; // token -> { email, name, phone, completedDays: Set }

  function getOrCreate(token) {
    if (!token) return null;
    if (!userMap[token]) {
      userMap[token] = { email: '', name: '', phone: '', completedDays: new Set() };
    }
    return userMap[token];
  }

  function mergeInfo(user, email, name, phone) {
    if (email && !user.email) user.email = email.toLowerCase().trim();
    if (name && !user.name) user.name = name;
    if (phone && !user.phone) user.phone = phone;
  }

  // Process mission_responses
  missions.forEach(m => {
    let day = parseInt(m.mission_id);
    if (isNaN(day) && m.mission_id === 'mission_01') day = 1;
    if (isNaN(day) || day < 1 || day > 10) return;

    const token = m.auth_token;
    if (!token) return;

    const u = getOrCreate(token);
    u.completedDays.add(day);

    // Try to extract email/name/phone from JSON response
    if (m.response && typeof m.response === 'string' && m.response.trim().startsWith('{')) {
      try {
        const p = JSON.parse(m.response);
        mergeInfo(u, p.email || p['reg-email'], p.name || p['reg-name'], p.phone || p['reg-phone']);
      } catch (e) {}
    }
  });

  // Process survey_responses (linked by lead_id, not directly by token)
  // We'll use them later for enrichment

  // Process analytics_pageviews (activity submissions)
  pageviews.forEach(p => {
    if (!p.user_agent || typeof p.user_agent !== 'string' || !p.user_agent.trim().startsWith('{')) return;
    try {
      const parsed = JSON.parse(p.user_agent);
      const email = (parsed.email || '').toLowerCase().trim();
      const name = parsed.name || '';
      const phone = parsed.phone || '';
      const d = parsed.day ? parseInt(parsed.day) : 0;
      const token = p.visitor_id;

      if (d >= 1 && d <= 10 && token) {
        const u = getOrCreate(token);
        u.completedDays.add(d);
        mergeInfo(u, email, name, phone);
      }
    } catch (e) {}
  });

  // 2. Collect tokens that have no email yet, for DB lookup
  const tokensNeedingLookup = [];
  for (const [token, u] of Object.entries(userMap)) {
    if (!u.email && u.completedDays.size > 0 && token.length > 10) {
      tokensNeedingLookup.push(token);
    }
  }

  console.log(`🔍 Tokens sin email que necesitan lookup: ${tokensNeedingLookup.length}`);

  // 3. Batch lookup tokens against leads table via RPC
  const leadLookups = await batchLookupTokens(tokensNeedingLookup);

  // Enrich userMap with lookup results
  for (const [token, info] of Object.entries(leadLookups)) {
    if (userMap[token]) {
      mergeInfo(userMap[token], info.email, info.name, info.phone);
    }
  }

  // 4. Deduplicate by email (merge tokens that share the same email)
  const emailMap = {}; // email -> merged user
  const finalList = [];

  for (const [token, u] of Object.entries(userMap)) {
    if (u.completedDays.size === 0) continue;

    if (u.email && emailMap[u.email]) {
      // Merge into existing
      const existing = emailMap[u.email];
      u.completedDays.forEach(d => existing.completedDays.add(d));
      mergeInfo(existing, u.email, u.name, u.phone);
    } else if (u.email) {
      emailMap[u.email] = u;
      finalList.push(u);
    } else {
      // No email at all — include as standalone entry
      finalList.push(u);
    }
  }

  // Sort by number of completed days descending
  finalList.sort((a, b) => b.completedDays.size - a.completedDays.size);

  let withEmail = 0, withName = 0, withPhone = 0;
  finalList.forEach(u => {
    if (u.email) withEmail++;
    if (u.name) withName++;
    if (u.phone) withPhone++;
  });

  console.log(`\n✅ TOTAL USUARIOS ÚNICOS: ${finalList.length}`);
  console.log(`   Con email: ${withEmail}`);
  console.log(`   Con nombre: ${withName}`);
  console.log(`   Con teléfono: ${withPhone}`);

  // 5. Build CSV
  const headers = ['Nombre', 'Correo', 'Telefono', 'Actividades_Completadas', 'Lista_Actividades', 'Puntos_Acumulados'];
  const csvRows = [headers.join(',')];

  finalList.forEach(u => {
    const sortedDays = Array.from(u.completedDays).sort((a, b) => a - b);
    const dayStr = sortedDays.map(d => `Dia ${d}`).join(' | ');
    const count = sortedDays.length;
    const points = count * 30;

    const esc = (v) => `"${(v || '').replace(/"/g, '""')}"`;
    csvRows.push([esc(u.name), esc(u.email), esc(u.phone), count, esc(dayStr), `${points} PC`].join(','));
  });

  const outputPath = path.join('/Users/josuegarcia/Antigravity/Launch Jul 26', 'leads_actividades_completadas.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');
  console.log(`🎉 CSV generado: ${outputPath} (${finalList.length} filas)`);
}

main();
