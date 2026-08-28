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

/**
 * Infer country code from phone number pattern + optional country from survey.
 * LATAM phone patterns:
 * - Colombia (+57): 10 digits starting with 3 (mobile)
 * - Mexico (+52): 10 digits starting with other digits
 * - Venezuela (+58): starts with 04 (e.g., 0412, 0414, 0416, 0424, 0426) = 11 digits
 * - Peru (+51): 9 digits starting with 9
 * - Argentina (+54): 10+ digits
 * - Chile (+56): 9 digits starting with 9
 * - Ecuador (+593): 9-10 digits
 * - Dominican Republic (+1): 10 digits starting with 8 or 9
 * - US (+1): 10 digits
 */
function addCountryCode(phone, surveyCountry) {
  if (!phone) return '';
  
  // Clean: remove spaces, dashes, parentheses
  let clean = phone.replace(/[\s\-\(\)\.\+]/g, '');
  
  // Already has country code
  if (phone.startsWith('+')) return phone;
  
  // Try to infer from survey country first
  const countryLower = (surveyCountry || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const countryCodeMap = {
    'colombia': '+57',
    'mexico': '+52',
    'venezuela': '+58',
    'peru': '+51',
    'argentina': '+54',
    'chile': '+56',
    'ecuador': '+593',
    'republica dominicana': '+1',
    'dominicana': '+1',
    'panama': '+507',
    'costa rica': '+506',
    'guatemala': '+502',
    'honduras': '+504',
    'el salvador': '+503',
    'uruguay': '+598',
    'bolivia': '+591',
    'paraguay': '+595',
    'estados unidos': '+1',
    'usa': '+1',
    'espana': '+34',
    'spain': '+34',
    'puerto rico': '+1',
    'brasil': '+55',
    'brazil': '+55',
    'nicaragua': '+505',
  };
  
  // Match survey country
  for (const [key, code] of Object.entries(countryCodeMap)) {
    if (countryLower.includes(key)) {
      // Venezuela: remove leading 0 if present (e.g., 04121117038 -> +584121117038)
      if (code === '+58' && clean.startsWith('0')) {
        clean = clean.slice(1);
      }
      return code + clean;
    }
  }
  
  // No survey country — infer from phone pattern
  // Venezuela: 11 digits starting with 04
  if (clean.length === 11 && clean.startsWith('04')) {
    return '+58' + clean.slice(1);
  }
  
  // Colombia: 10 digits starting with 3
  if (clean.length === 10 && clean.startsWith('3')) {
    return '+57' + clean;
  }
  
  // Mexico: 10 digits starting with other (1-9, not 3)
  if (clean.length === 10 && !clean.startsWith('3')) {
    return '+52' + clean;
  }
  
  // Peru/Chile: 9 digits starting with 9
  if (clean.length === 9 && clean.startsWith('9')) {
    return '+51' + clean; // Default to Peru (larger audience)
  }
  
  // Argentina: 10-11 digits starting with non-3
  if (clean.length === 11 && !clean.startsWith('04') && clean.startsWith('1')) {
    return '+54' + clean;
  }
  
  // Fallback: return as-is with a note
  return clean;
}

async function main() {
  console.log('🚀 Extrayendo leads con 4+ actividades (con código de área)...\n');

  // 1. Fetch all data sources
  const [missions, pageviews, surveys] = await Promise.all([
    fetchAllPaginated('mission_responses'),
    fetchAllPaginated('analytics_pageviews'),
    fetchAllPaginated('survey_responses')
  ]);

  console.log(`📊 Registros -> Misiones: ${missions.length}, Visitas: ${pageviews.length}, Encuestas: ${surveys.length}`);

  // 2. Build survey country map (lead_id -> country)
  const surveyCountryByLeadId = {};
  const surveyCountryByEmail = {};
  surveys.forEach(s => {
    if (s.lead_id && s.pais) surveyCountryByLeadId[s.lead_id] = s.pais;
  });

  // 3. Build user map keyed by auth_token
  const userMap = {};

  function getOrCreate(token) {
    if (!token) return null;
    if (!userMap[token]) {
      userMap[token] = { email: '', name: '', phone: '', completedDays: new Set(), leadId: null };
    }
    return userMap[token];
  }

  function mergeInfo(user, email, name, phone) {
    if (email && !user.email) user.email = email.toLowerCase().trim();
    if (name && !user.name) user.name = name;
    if (phone && !user.phone) user.phone = phone;
    // Prefer phone with country code
    if (phone && phone.startsWith('+') && (!user.phone || !user.phone.startsWith('+'))) {
      user.phone = phone;
    }
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

    if (m.response && typeof m.response === 'string' && m.response.trim().startsWith('{')) {
      try {
        const p = JSON.parse(m.response);
        mergeInfo(u, p.email || p['reg-email'], p.name || p['reg-name'], p.phone || p['reg-phone']);
      } catch (e) {}
    }
  });

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

  // 4. Collect tokens needing lookup
  const tokensNeedingLookup = [];
  for (const [token, u] of Object.entries(userMap)) {
    if (!u.email && u.completedDays.size > 0 && token.length > 10) {
      tokensNeedingLookup.push(token);
    }
  }

  console.log(`🔍 Tokens sin email que necesitan lookup: ${tokensNeedingLookup.length}`);

  // 5. Batch lookup ALL tokens to get lead_id and phone from DB
  // (not just missing emails — we want to enrich phone for everyone)
  const allTokens = Object.keys(userMap).filter(t => t.length > 10);
  console.log(`🔍 Lookup de TODOS los tokens para enriquecer teléfonos: ${allTokens.length}`);
  
  const leadLookups = await batchLookupTokens(allTokens);

  // Enrich userMap with lookup results
  for (const [token, info] of Object.entries(leadLookups)) {
    if (userMap[token]) {
      mergeInfo(userMap[token], info.email, info.name, info.phone);
    }
  }

  // Also get lead_id from lookup results for survey country matching
  for (const [token, u] of Object.entries(userMap)) {
    // Look up via get_lead_by_token returns the full lead object
    // We already have it in leadLookups but we need to re-fetch for lead_id
  }

  // 6. Deduplicate by email
  const emailMap = {};
  const finalList = [];

  for (const [token, u] of Object.entries(userMap)) {
    if (u.completedDays.size === 0) continue;

    if (u.email && emailMap[u.email]) {
      const existing = emailMap[u.email];
      u.completedDays.forEach(d => existing.completedDays.add(d));
      mergeInfo(existing, u.email, u.name, u.phone);
    } else if (u.email) {
      emailMap[u.email] = u;
      finalList.push(u);
    } else {
      finalList.push(u);
    }
  }

  // 7. Build survey country map by email (from survey_responses linking through lead_id)
  // We need to do a second pass: look up lead_id -> email mapping
  // Since we have leadLookups with token -> {email}, and surveys have lead_id,
  // let's build a reverse map: we need lead_id for each token
  
  // Do targeted lookups for lead_id
  console.log('🌎 Enriching with survey country data...');
  
  // Build a map of email -> survey country by matching lead_ids
  // First, get all lead_ids from the lookup results
  const tokenToLeadId = {};
  for (const [token, _] of Object.entries(userMap)) {
    if (token.length > 10) {
      // We need to find the lead_id — let's look it up from our earlier results
      // Actually the batchLookupTokens doesn't return lead_id. Let's match via email.
    }
  }
  
  // Match surveys to emails: survey has lead_id, we need lead_id -> email
  // Since we can't query leads directly, let's do it differently:
  // Look up each lead_id from surveys by token
  
  // Alternative approach: for each user in finalList, try to find their survey by matching
  // We'll use a different strategy - look up surveys linked to each auth_token
  // survey_responses has lead_id, and leads has auth_token
  // So we need: auth_token -> lead_id -> survey_response.pais
  
  // Since we already did token lookups, let's do another batch specifically for lead_ids
  const tokenToFullLead = {};
  console.log('  Re-fetching lead IDs for survey matching...');
  
  // We need to get lead_id for email -> survey country matching
  // Let's batch fetch all surveys and match by lead_id
  // Since survey_responses have lead_id, and we know lead emails,
  // we can match via: for each survey, lookup lead by lead_id to get email
  
  // Actually, let's just fetch leads that have auth_tokens matching our users
  // More efficient: build email->country from survey + existing lead data
  
  // Approach: For each survey, look up the lead by lead_id to get email, then map email->country
  console.log(`  Processing ${surveys.length} surveys to extract country by email...`);
  
  // Batch lookup survey lead_ids
  const uniqueLeadIds = [...new Set(surveys.map(s => s.lead_id).filter(Boolean))];
  console.log(`  Unique survey lead_ids to lookup: ${uniqueLeadIds.length}`);
  
  // We can't query leads table directly (RLS), so let's match through our existing data
  // We already have token -> email from lookups. And leads have auth_token.
  // So: survey.lead_id = lead.id, and lead.auth_token = token, and we know token -> email
  // We need: lead_id -> token mapping
  
  // Let's do targeted lookups for survey lead_ids
  let surveyLookupCount = 0;
  const concurrency = 5;
  let surveyIdx = 0;
  
  async function surveyWorker() {
    while (surveyIdx < uniqueLeadIds.length) {
      const i = surveyIdx++;
      const leadId = uniqueLeadIds[i];
      if (i % 50 === 0) process.stdout.write(`  Survey lead lookup... ${i}/${uniqueLeadIds.length}\r`);
      
      try {
        // Try direct REST query by id
        const url = `${SUPABASE_URL}/rest/v1/leads?select=email&id=eq.${leadId}&limit=1`;
        const res = await fetch(url, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].email) {
          const email = data[0].email.toLowerCase().trim();
          const survey = surveys.find(s => s.lead_id === leadId);
          if (survey && survey.pais) {
            surveyCountryByEmail[email] = survey.pais;
            surveyLookupCount++;
          }
        }
      } catch (e) {}
    }
  }
  
  // RLS blocks direct queries, so instead match through our existing token->email data
  // Build leadId -> email from our full lookup results
  // Actually we didn't save lead_id. Let me use a different approach.
  
  // Best approach: Just look up by email matching between surveys and leads
  // We'll match the token-based emails to survey emails through lead_id
  
  // Since direct REST is blocked by RLS, let's use what we have:
  // Our finalList has emails. Surveys have lead_id + pais.
  // Let's do individual token lookups for leads that DON'T have country codes.
  
  // Actually the SIMPLEST approach: use phone number patterns to infer country
  // We know the audience is primarily Colombia + Mexico
  
  console.log('\n📱 Applying country codes based on phone patterns...');
  
  let codesAdded = 0;
  let alreadyHadCode = 0;
  let noPhone = 0;
  let patternStats = { CO: 0, MX: 0, VE: 0, PE: 0, AR: 0, other: 0 };
  
  finalList.forEach(u => {
    if (!u.phone) {
      noPhone++;
      return;
    }
    if (u.phone.startsWith('+')) {
      alreadyHadCode++;
      return;
    }
    
    const enriched = addCountryCode(u.phone, surveyCountryByEmail[u.email] || '');
    if (enriched !== u.phone) {
      codesAdded++;
      if (enriched.startsWith('+57')) patternStats.CO++;
      else if (enriched.startsWith('+52')) patternStats.MX++;
      else if (enriched.startsWith('+58')) patternStats.VE++;
      else if (enriched.startsWith('+51')) patternStats.PE++;
      else if (enriched.startsWith('+54')) patternStats.AR++;
      else patternStats.other++;
    }
    u.phone = enriched;
  });
  
  console.log(`  Ya tenían código: ${alreadyHadCode}`);
  console.log(`  Códigos agregados: ${codesAdded}`);
  console.log(`  Sin teléfono: ${noPhone}`);
  console.log(`  Distribución: CO=${patternStats.CO}, MX=${patternStats.MX}, VE=${patternStats.VE}, PE=${patternStats.PE}, AR=${patternStats.AR}, otros=${patternStats.other}`);

  // 8. Filter: only leads with >= 4 activities
  const filtered = finalList.filter(u => u.completedDays.size >= 4);
  filtered.sort((a, b) => b.completedDays.size - a.completedDays.size);

  console.log(`\n📋 TOTAL con al menos 1 actividad: ${finalList.length}`);
  console.log(`✅ TOTAL con 4+ actividades: ${filtered.length}`);

  let withEmail = 0, withName = 0, withPhone = 0;
  filtered.forEach(u => {
    if (u.email) withEmail++;
    if (u.name) withName++;
    if (u.phone) withPhone++;
  });

  console.log(`   Con email: ${withEmail}`);
  console.log(`   Con nombre: ${withName}`);
  console.log(`   Con teléfono: ${withPhone}`);

  // 9. Build CSV
  const headers = ['Nombre', 'Email', 'Telefono', 'Actividades_Completadas', 'Lista_Actividades'];
  const csvRows = [headers.join(',')];

  filtered.forEach(u => {
    const sortedDays = Array.from(u.completedDays).sort((a, b) => a - b);
    const dayStr = sortedDays.map(d => `Dia ${d}`).join(' | ');
    const count = sortedDays.length;

    const esc = (v) => `"${(v || '').replace(/"/g, '""')}"`;
    csvRows.push([esc(u.name), esc(u.email), esc(u.phone), count, esc(dayStr)].join(','));
  });

  const outputPath = path.join('/Users/josuegarcia/Antigravity/Launch Jul 26', 'leads_4plus_actividades.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');
  console.log(`\n🎉 CSV generado: ${outputPath} (${filtered.length} filas)`);
}

main();
