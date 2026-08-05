// ========================================
// ACTIVIDAD DEL DÍA — ENGINE
// ========================================

const SUPABASE_URL = 'https://chnpzcpczjtdsbfmjhei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnB6Y3Bjemp0ZHNiZm1qaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc5ODYsImV4cCI6MjA5OTY3Mzk4Nn0.-0v-yxG8M4aAmt-TEezV-4il22ZqW9wSA0XwspmwQRU';
const GHL_WEBHOOK_REG = 'https://services.leadconnectorhq.com/hooks/jTugwykceKyJlATOSvkb/webhook-trigger/deaadf50-9f15-4372-a5b4-5ec030b01fea';

let currentDay = 1;
let leadData = null;
let isLoggedIn = false;
let itiInstance = null;

// Daily Missions Data
const dailyMissions = {
  1: {
    dayDate: "3 de Agosto",
    title: "Día 1: La Anatomía del Saboteador",
    desc: "Identifica cuál de los 4 saboteadores financieros (El Vengador, El Eufórico, El Impaciente o El Paralizado) controla tu cuenta.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">¿Cuál es tu Saboteador Financiero dominante o mayor reto emocional?</label>
        <select id="field-saboteur-type" class="form-input" required style="margin-bottom:12px;">
          <option value="">-- Selecciona tu Saboteador o mayor reto --</option>
          <option value="El Vengador">🥊 El Vengador (Quiero recuperar pérdidas inmediatamente)</option>
          <option value="El Eufórico">🚀 El Eufórico (Sobre-arriesgo después de ganar)</option>
          <option value="El Impaciente">⚡ El Impaciente (Entro antes de la confirmación)</option>
          <option value="El Paralizado">🧊 El Paralizado (Dudo y me me da miedo ejecutar)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">¿En qué situación sientes que tu Saboteador toma el control?</label>
        <textarea id="field-saboteur-desc" class="form-textarea" rows="3" placeholder="Ej: Cuando pierdo un trade, me da rabia y abro otra posición sin analizar..." required></textarea>
      </div>
    `
  },
  2: {
    dayDate: "4 de Agosto",
    title: "Día 2: Cuenta Abierta: El Espejo de la Mente",
    desc: "Redacta tu Regla #1 Anti-Saboteador para evitar que las emociones controlen tus operaciones o tu proceso de aprendizaje.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Escribe tu Regla #1 Anti-Saboteador <span style="color:#ef4444;">*</span></label>
        
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; margin-bottom: 12px; font-size: 0.82rem; color: #94a3b8; line-height: 1.45;">
          <strong style="color: var(--accent-yellow); display: block; margin-bottom: 4px;">💡 Ejemplos de referencia según tu nivel:</strong>
          <p style="margin-bottom: 6px; color: #f8fafc;"><strong>• Si ya operas:</strong> <em>"Si pierdo 2 trades seguidos en el día, apago la pantalla por hoy."</em></p>
          <p style="margin: 0; color: #f8fafc;"><strong>• Si estás empezando o aún no operas:</strong> <em>"Si siento ansiedad por empezar a ganar dinero rápido, no invertiré todavía. Primero completaré mi formación y practicaré en una cuenta demo."</em></p>
        </div>

        <textarea id="field-day2-rule" class="form-textarea" rows="3" placeholder="Escribe aquí tu Regla #1 Anti-Saboteador..." required></textarea>
      </div>
    `
  },
  3: {
    dayDate: "5 de Agosto",
    title: "Día 3: P de Planear — Gastos Hormiga a Inversiones Hormiga",
    desc: "Diagnostica tus salidas invisibles de dinero, calcula su impacto a 10 y 20 años y define tu Cláusula Anti-Saboteador.",
    renderForm: () => `
      <!-- WIZARD STEP HEADER -->
      <div style="margin-bottom: 20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.8rem; font-weight:700;">
          <span id="gastos-step-badge" style="color:#38bdf8; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.8px;">Paso 1 de 3: Diagnóstico de Gastos</span>
          <span id="gastos-step-pct" style="color:#22c55e; font-weight:800; font-size:0.82rem;">33%</span>
        </div>
        <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:100px; overflow:hidden;">
          <div id="gastos-step-bar" style="width:33%; height:100%; background:linear-gradient(90deg, #3b82f6, #22c55e); transition:width 0.35s ease; border-radius:100px;"></div>
        </div>
      </div>

      <!-- PASO 1: DIAGNÓSTICO (MONEDA Y 10 CATEGORÍAS) -->
      <div id="gastos-step-1" style="display:block;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px;">
            <div>
              <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#3b82f6; display:block;">Paso 1</span>
              <strong style="font-size:0.95rem; color:#f8fafc;">Selecciona tu Moneda de Trabajo</strong>
            </div>
            <input type="hidden" id="field-day3-currency" class="form-input" value="cop" />
            <div style="display:flex; gap:8px;">
              <button type="button" class="curr-btn-opt active" data-curr="cop" onclick="selectGastosCurr('cop', this)" style="padding:6px 14px; border-radius:8px; border:1px solid #3b82f6; background:rgba(59,130,246,0.25); color:#fff; font-weight:700; font-size:0.8rem; cursor:pointer;">🇨🇴 COP</button>
              <button type="button" class="curr-btn-opt" data-curr="mxn" onclick="selectGastosCurr('mxn', this)" style="padding:6px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#94a3b8; font-weight:700; font-size:0.8rem; cursor:pointer;">🇲🇽 MXN</button>
              <button type="button" class="curr-btn-opt" data-curr="usd" onclick="selectGastosCurr('usd', this)" style="padding:6px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#94a3b8; font-weight:700; font-size:0.8rem; cursor:pointer;">🇺🇸 USD</button>
            </div>
          </div>
          <p style="font-size:0.82rem; color:#94a3b8; margin:0; line-height:1.45;">
            Ingresa una estimación de lo que gastas al mes en cada categoría. Si no aplica a ti, déjalo en blanco o en 0.
          </p>
        </div>

        <div style="margin-bottom:24px;">
          <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#f59e0b; display:block; margin-bottom:10px;">Tus 10 Salidas Invisibles (Monto Mensual)</span>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
            <!-- 1. Café -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">☕ Café / Bebidas fuera</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-cafe" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Café, jugos, gaseosas de paso</span>
            </div>

            <!-- 2. Delivery -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">🍔 Delivery / Comida rápida</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-delivery" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Rappi, UberEats, antojos</span>
            </div>

            <!-- 3. Suscripciones -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">📺 Suscripciones digitales</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-streaming" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Netflix, Spotify, apps sin uso</span>
            </div>

            <!-- 4. Snacks -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">🍫 Snacks / Mecatos</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-snacks" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Dulces, chips, energéticas</span>
            </div>

            <!-- 5. Transporte -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">🚗 Transporte extra / VTC</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-transporte" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Uber / InDriver no planeados</span>
            </div>

            <!-- 6. Salidas -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">🎬 Salidas / Entretenimiento</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-salidas" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Cine, bares, eventos impulso</span>
            </div>

            <!-- 7. Compras -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">🛍️ Compras impulsivas</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-compras" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Ropa o gadgets fuera de plan</span>
            </div>

            <!-- 8. Tabaco -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">💨 Cigarrillos / Vapes</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-tabaco" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Tabaco, vapes y similares</span>
            </div>

            <!-- 9. Cuidado Personal -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">💄 Cuidado personal extra</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-belleza" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Tratamientos o cosméticos de paso</span>
            </div>

            <!-- 10. Apps -->
            <div class="gasto-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.85rem; font-weight:700; color:#f1f5f9;">🎮 Apps / Microtransacciones</span>
                <span class="curr-sym" style="font-size:0.75rem; color:#38bdf8; font-weight:700;">COP $</span>
              </div>
              <input type="number" id="gasto-apps" class="form-input gasto-input" placeholder="0" min="0" oninput="recalcGastosHormiga()" style="padding:8px 10px; font-size:0.88rem;" />
              <span style="font-size:0.7rem; color:#64748b; margin-top:4px; display:block;">Juegos, compras in-app</span>
            </div>
          </div>
        </div>

        <button type="button" onclick="goToGastosStep(2)" class="btn-submit" style="margin-top:16px; background:linear-gradient(135deg, #3b82f6, #2563eb); color:#fff; font-weight:800; width:100%; font-size:0.92rem; padding:14px; cursor:pointer;">
          VER MI DIAGNÓSTICO FINANCIERO ➔
        </button>
      </div>

      <!-- PASO 2: REVELACIÓN & PROYECCIÓN FINANCIERA -->
      <div id="gastos-step-2" style="display:none;">
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
          <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#22c55e; display:block; margin-bottom:12px;">Paso 2 • Tu Diagnóstico Financiero & Poder de Inversión</span>
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:16px;">
            <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:0.75rem; color:#94a3b8; font-weight:600; display:block;">Gasto Hormiga Mensual:</span>
              <strong id="res-gastos-mensual" style="font-size:1.3rem; color:#ef4444; font-weight:800;">$0 COP</strong>
              <input type="hidden" id="field-day3-gastos-total-mensual" class="form-input" value="0" />
            </div>
            <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:0.75rem; color:#94a3b8; font-weight:600; display:block;">Fuga Total al Año:</span>
              <strong id="res-gastos-anual" style="font-size:1.3rem; color:#f59e0b; font-weight:800;">$0 COP</strong>
              <input type="hidden" id="field-day3-gastos-total-anual" class="form-input" value="0" />
            </div>
          </div>

          <!-- TARJETA INTERÉS COMPUESTO -->
          <div style="background:rgba(34, 197, 94, 0.08); border:1px solid rgba(34, 197, 94, 0.25); padding:16px; border-radius:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <strong style="font-size:0.88rem; color:#22c55e;">📈 Si invirtieras esta fuga (7% anual compuesto):</strong>
              <span style="font-size:0.72rem; background:rgba(34, 197, 94, 0.2); color:#22c55e; padding:3px 8px; border-radius:100px; font-weight:700;">Interés Compuesto</span>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <div>
                <span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block;">En 10 Años Tendrías:</span>
                <strong id="res-proj-10a" style="font-size:1.2rem; color:#38bdf8; font-weight:900;">$0 COP</strong>
                <input type="hidden" id="field-day3-gastos-proj-10a" class="form-input" value="0" />
              </div>
              <div>
                <span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block;">En 20 Años Tendrías:</span>
                <strong id="res-proj-20a" style="font-size:1.25rem; color:#22c55e; font-weight:900;">$0 COP</strong>
                <input type="hidden" id="field-day3-gastos-proj-20a" class="form-input" value="0" />
              </div>
            </div>
          </div>

          <div id="res-recomendacion-box" style="font-size:0.8rem; color:#cbd5e1; background:rgba(255,255,255,0.03); padding:12px 14px; border-radius:10px; line-height:1.45;">
            💡 <span id="res-recomendacion-text">Ingresa tus gastos en el paso anterior para ver tu diagnóstico de inversión.</span>
          </div>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:20px;">
          <button type="button" onclick="goToGastosStep(1)" style="flex:1; min-width:130px; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#cbd5e1; font-weight:700; cursor:pointer;">
            ⬅ Modificar Gastos
          </button>
          <button type="button" onclick="goToGastosStep(3)" class="btn-submit" style="flex:2; min-width:170px; margin:0; background:linear-gradient(135deg, #10b981, #059669); color:#fff; font-weight:800; font-size:0.92rem; padding:14px; cursor:pointer;">
            DEFINIR MI PLAN DE ACCIÓN ➔
          </button>
        </div>
      </div>

      <!-- PASO 3: REDIRECCIÓN & CLÁUSULA ANTI-SABOTEADOR -->
      <div id="gastos-step-3" style="display:none;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom:16px;">
          <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#38bdf8; display:block; margin-bottom:12px;">Paso 3 • Redirección & Cláusula Anti-Saboteador</span>

          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Selecciona tu Ruta de Trabajo <span style="color:#ef4444;">*</span></label>
            <select id="field-day3-route" class="form-input" required style="padding:10px; font-weight:600;">
              <option value="Ruta Cero — Dinero Consciente">🌱 Ruta Cero — Plan de Dinero Consciente (Sin experiencia / Finanzas personales)</option>
              <option value="Ruta Experiencia — Plan de Mercado">⚡ Ruta Experiencia — Plan de Mercado Profesional (Trader / Inversionista)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label">Monto de Redirección Sostenible Mensual <span style="color:#ef4444;">*</span></label>
            <input id="field-day3-redirect-amount" type="text" class="form-input" placeholder="Ej: $30 USD / $100,000 COP al mes para mi bolsillo de construcción" required />
          </div>

          <div class="form-group">
            <label class="form-label">Escribe tu Cláusula Anti-Saboteador <span style="color:#ef4444;">*</span></label>
            <textarea id="field-day3-saboteur-clause" class="form-textarea" rows="3" placeholder="Ej (Ruta Cero): La separación ocurre el día 1 antes de cualquier gasto discrecional. No usaré dinero real hasta simular 4 semanas.\nEj (Ruta Experiencia): Si no está en mi plan no existe. Después de 2 pérdidas consecutivas cierro plataforma." required></textarea>
          </div>
        </div>

        <button type="button" onclick="goToGastosStep(2)" style="margin-bottom:14px; width:100%; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#94a3b8; font-weight:700; cursor:pointer;">
          ⬅ Volver al Diagnóstico
        </button>
      </div>
    `
  },
  4: {
    dayDate: "6 de Agosto",
    title: "Día 4: Ejecución con IA (Conoce a GENY)",
    desc: "Registra tu primer Paper Trade (simulado) con gestión de riesgo previa.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Activo Financiero (Ej: BTC/USD, Nasdaq, Gold)</label>
        <input id="field-day4-asset" type="text" class="form-input" placeholder="Ej: BTC/USD" required />
      </div>
      <div class="form-group">
        <label class="form-label">Señal de IA / Análisis (Ej: Geny Trend Alcista 15M)</label>
        <input id="field-day4-signal" type="text" class="form-input" placeholder="Ej: Geny Trend Alcista 15M" required />
      </div>
      <div class="form-group">
        <label class="form-label">Nivel de Stop Loss de Invalidación</label>
        <input id="field-day4-stop" type="text" class="form-input" placeholder="Ej: $64,200" required />
      </div>
    `
  },
  5: {
    dayDate: "7 de Agosto",
    title: "Día 5: La Bitácora del Saboteador",
    desc: "Documenta tu trade en la Bitácora PEDEM registrando las emociones de tu Saboteador.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Registro de Bitácora PEDEM y Emociones <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day5-log" class="form-textarea" rows="3" placeholder="Ej: Trade en Nasdaq. Sentí ansiedad al inicio pero respeté el Stop Loss al 100%..." required></textarea>
      </div>
    `
  },
  6: {
    dayDate: "8 de Agosto",
    title: "Día 6: La Rúbrica PEDEM",
    desc: "Evalúa del 1 al 5 la disciplina con la que ejecutaste tu plan en la sesión de hoy.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Calificación de Disciplina (1 al 5)</label>
        <select id="field-day6-score" class="form-input" required>
          <option value="5">5 — Disciplina Perfecta (Seguí el plan 100%)</option>
          <option value="4">4 — Alta Disciplina (Mínimas dudas)</option>
          <option value="3">3 — Disciplina Media (Tuve tentación de romper reglas)</option>
          <option value="2">2 — Baja Disciplina (Improvisé en 1 trade)</option>
          <option value="1">1 — Sin Disciplina (El Saboteador tomó el control)</option>
        </select>
      </div>
    `
  },
  7: {
    dayDate: "9 de Agosto",
    title: "Día 7: Asistencia a la Masterclass en Vivo",
    desc: "Confirma tu asistencia a la Masterclass interactiva de 120 minutos.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">¿Qué aprendizaje principal te llevas de la Masterclass?</label>
        <textarea id="field-day7-learning" class="form-textarea" rows="3" placeholder="Ej: Entendí la importancia de la regla de invalidación y la gestión dinámica..." required></textarea>
      </div>
    `
  },
  8: {
    dayDate: "10 de Agosto",
    title: "Día 8: Panel de Casos Reales (Q&A)",
    desc: "Escribe tu pregunta o duda personal para que Juan la responda en vivo.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Tu Pregunta Personal para el Q&A <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day8-question" class="form-textarea" rows="3" placeholder="Escribe aquí tu pregunta o duda de trading o mentalidad..." required></textarea>
      </div>
    `
  },
  9: {
    dayDate: "11 de Agosto",
    title: "Día 9: Autoevaluación de Evolución Mental",
    desc: "Compara tu estado mental del Día 1 vs hoy. Describe tu transformación.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Tu Autoevaluación de Evolución Mental <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day9-eval" class="form-textarea" rows="3" placeholder="Ej: Llegué como Vengador impulsivo y hoy opero bajo un sistema de reglas estrictas..." required></textarea>
      </div>
    `
  },
  10: {
    dayDate: "12 de Agosto",
    title: "Día 10: La Gran Final y Premiación",
    desc: "Reclama tu Bonus de Racha Perfecta y valida tus entradas al Sorteo Final.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Comentario Final / Testimonio del Taller</label>
        <textarea id="field-day10-feedback" class="form-textarea" rows="3" placeholder="Escribe tu testimonio sobre tu experiencia en el taller..." required></textarea>
      </div>
    `
  }
};

// DOM Init
document.addEventListener('DOMContentLoaded', initActivity);

function determineDay() {
  if (window.FORCE_DAY) return window.FORCE_DAY;
  const urlParams = new URLSearchParams(window.location.search);
  let day = parseInt(urlParams.get('dia') || urlParams.get('d') || '1', 10);
  
  // Match path /actividad1, /mision1 etc.
  const path = window.location.pathname;
  const match = path.match(/(?:actividad|mision)(\d+)/i);
  if (match) {
    day = parseInt(match[1], 10);
  }

  if (isNaN(day) || day < 1 || day > 10) day = 1;
  return day;
}

async function initActivity() {
  currentDay = determineDay();
  
  // Setup Day Data
  const mission = dailyMissions[currentDay] || dailyMissions[1];
  document.getElementById('day-badge').textContent = `Día ${currentDay}`;
  document.getElementById('act-title').textContent = mission.title;
  document.getElementById('act-desc').textContent = mission.desc;

  const resContainer = document.getElementById('activity-resource-container');
  if (resContainer) {
    if (mission.resourceLink && mission.resourceLink !== '#') {
      resContainer.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(37, 211, 102, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%); border: 1px solid rgba(37, 211, 102, 0.35); padding: 14px 16px; border-radius: 14px; margin-bottom: 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.6rem; background:rgba(37, 211, 102, 0.15); border:1px solid rgba(37, 211, 102, 0.4); border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">📚</span>
            <div>
              <strong style="font-size:0.88rem; color:#f8fafc; display:block;">Material Extra Descargable:</strong>
              <span style="font-size:0.8rem; color:#25d366; font-weight:600;">${mission.resourceName || 'Recurso Descargable'}</span>
            </div>
          </div>
          <a href="${mission.resourceLink}" download target="_blank" class="btn-submit" style="font-size:0.82rem; padding:8px 16px; background:#25d366; color:#000; font-weight:800; text-decoration:none; width:auto; margin:0; display:inline-flex; align-items:center; gap:6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            DESCARGAR MATERIAL (PDF)
          </a>
        </div>
      `;
    } else {
      resContainer.innerHTML = '';
    }
  }

  document.getElementById('activity-fields').innerHTML = mission.renderForm();
  if (currentDay === 3 && window.goToGastosStep) {
    setTimeout(function() { window.goToGastosStep(1); }, 30);
  }

  // Check Login / Session Status
  const urlParams = new URLSearchParams(window.location.search);
  let token = urlParams.get('token') || urlParams.get('t') || localStorage.getItem('auth_token') || '';
  let storedEmail = localStorage.getItem('user_email') || '';

  // If user has stored email or auth_token, mark as logged in immediately to hide reg-section
  if (storedEmail || token) {
    isLoggedIn = true;
    if (storedEmail && !leadData) {
      leadData = { email: storedEmail, name: localStorage.getItem('user_name') || '' };
    }
  }

  // Resolve token from email if missing
  if (!token && storedEmail) {
    try {
      const tokenRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_email: storedEmail })
      });
      const tokenData = await tokenRes.json();
      if (Array.isArray(tokenData) && tokenData.length > 0) {
        token = tokenData[0].get_token_by_email || tokenData[0].auth_token || (typeof tokenData[0] === 'string' ? tokenData[0] : '');
      } else if (tokenData) {
        token = tokenData.get_token_by_email || tokenData.auth_token || (typeof tokenData === 'string' ? tokenData : '');
      }
      if (token) localStorage.setItem('auth_token', token);
    } catch (e) {
      console.warn('Email lookup error:', e);
    }
  }

  if (token) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_token: token })
      });
      const leads = await res.json();
      if (Array.isArray(leads) && leads.length > 0) {
        leadData = leads[0];
        isLoggedIn = true;
        localStorage.setItem('auth_token', token);
        if (leadData.email) localStorage.setItem('user_email', leadData.email);
        if (leadData.name) localStorage.setItem('user_name', leadData.name);
      }
    } catch (err) {
      console.warn('Session lookup error:', err);
    }
  }

  updateRaffleBanner();

  const regSection = document.getElementById('reg-section');
  if (isLoggedIn) {
    if (regSection) regSection.style.display = 'none';
  } else {
    if (regSection) regSection.style.display = 'block';
    
    // Init Phone Input
    const phoneInput = document.getElementById('reg-phone');
    if (phoneInput && window.intlTelInput) {
      itiInstance = window.intlTelInput(phoneInput, {
        initialCountry: 'co',
        preferredCountries: ['co', 'mx', 'pe', 'ar', 'cl', 'us'],
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
      });
    }

    // Email listener to auto-toggle name/phone if new user
    const emailEl = document.getElementById('reg-email');
    if (emailEl) {
      emailEl.addEventListener('blur', checkEmailExists);
    }
  }
}

function updateRaffleBanner() {
  const banner = document.getElementById('raffle-banner');
  const title = document.getElementById('raffle-banner-title');
  const desc = document.getElementById('raffle-banner-desc');

  if (isLoggedIn) {
    banner.classList.add('raffle-banner--logged');
    title.textContent = '🔥 ¡Ya estás participando oficialmente en el Gran Sorteo!';
    desc.innerHTML = `Hola <strong>${leadData ? (leadData.name || 'participante') : ''}</strong>. Al enviar tu respuesta ganas <strong>+30 Puntos Genoma</strong> y aumentas tus oportunidades en el sorteo de la <strong>Beca Método Ingresarios + Algoritmos + IA + Computador</strong>. ¡Sigue conectado a los en vivos a las 8:00 PM (CO) para multiplicar tus puntos! 🚀`;
  } else {
    banner.classList.remove('raffle-banner--logged');
    title.textContent = '🔥 ¡Gana tus primeros +30 puntos para el Gran Sorteo!';
    desc.innerHTML = `Responde libremente la actividad. Al finalizar, ingresa tu correo para guardar tu respuesta, asegurar tu boleto para la <strong>Beca Método Ingresarios + Algoritmos + IA + Computador</strong> y multiplicar tus puntos en los en vivos. 🚀`;
  }
}

async function checkEmailExists() {
  const emailEl = document.getElementById('reg-email');
  if (!emailEl) return;
  const email = emailEl.value.trim().toLowerCase();
  if (!email || !email.includes('@')) return;

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_email: email })
    });
    const data = await res.json();
    let token = '';
    if (Array.isArray(data) && data.length > 0) {
      token = data[0].get_token_by_email || data[0].auth_token || (typeof data[0] === 'string' ? data[0] : '');
    } else if (data) {
      token = data.get_token_by_email || data.auth_token || (typeof data === 'string' ? data : '');
    }

    const newFields = document.getElementById('new-user-fields');
    if (!token) {
      // New user -> show name and phone fields
      if (newFields) newFields.style.display = 'block';
    } else {
      // Existing user -> hide extra fields
      if (newFields) newFields.style.display = 'none';
    }
  } catch (err) {
    console.warn('Check email error:', err);
  }
}

async function handleActivitySubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-activity');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block; animation:spin 0.8s linear infinite;">⏳</span> Guardando...';

  // Gather Form Data
  const formData = {};
  const inputs = document.querySelectorAll('.form-input, .form-textarea, select');
  inputs.forEach(inp => {
    if (inp.id) formData[inp.id] = inp.value;
  });

  try {
    if (!isLoggedIn) {
      // Handle Identification / Registration
      const emailEl = document.getElementById('reg-email');
      const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
      if (!email) {
        alert('Por favor ingresa tu correo electrónico.');
        btn.disabled = false;
        btn.innerHTML = '<span>GUARDAR Y PARTICIPAR EN EL SORTEO</span> 🚀';
        return;
      }

      // Check if email exists
      let token = '';
      const tokenRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_token_by_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_email: email })
      });
      const tokenData = await tokenRes.json();
      if (Array.isArray(tokenData) && tokenData.length > 0) {
        token = tokenData[0].get_token_by_email || tokenData[0].auth_token || (typeof tokenData[0] === 'string' ? tokenData[0] : '');
      } else if (tokenData) {
        token = tokenData.get_token_by_email || tokenData.auth_token || (typeof tokenData === 'string' ? tokenData : '');
      }

      if (!token) {
        // Register New Lead
        const nameEl = document.getElementById('reg-name');
        const name = nameEl ? nameEl.value.trim() : '';
        let phone = '';
        if (itiInstance) phone = itiInstance.getNumber();
        if (!phone) {
          const phoneEl = document.getElementById('reg-phone');
          if (phoneEl) phone = phoneEl.value.trim();
        }

        if (!name || !phone) {
          alert('Por favor ingresa tu nombre y teléfono para completar tu registro.');
          document.getElementById('new-user-fields').style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = '<span>GUARDAR Y PARTICIPAR EN EL SORTEO</span> 🚀';
          return;
        }

        // Create Lead
        const createRes = await fetch(SUPABASE_URL + '/rest/v1/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            landing: `Actividad Día ${currentDay}`
          })
        });

        if (createRes.ok) {
          const resData = await createRes.json();
          token = Array.isArray(resData) ? (resData[0].auth_token || '') : (resData.auth_token || '');
        }

        // Fire GHL Webhook
        fetch(GHL_WEBHOOK_REG, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            event: 'activity_registration',
            day: currentDay
          })
        }).catch(() => {});
      }

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', email);
        
        // Fetch Lead
        const leadRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_lead_by_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ p_token: token })
        });
        const leads = await leadRes.json();
        if (Array.isArray(leads) && leads.length > 0) leadData = leads[0];
      }
    }

    // Save Mission Response to Supabase
    try {
      const authTokenVal = localStorage.getItem('auth_token') || (leadData ? leadData.auth_token : '') || token || 'anon';
      await fetch(SUPABASE_URL + '/rest/v1/mission_responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          auth_token: authTokenVal,
          mission_id: currentDay,
          response: typeof formData === 'object' ? JSON.stringify(formData) : String(formData),
          points: 30,
          created_at: new Date().toISOString()
        })
      });
    } catch (saveErr) {
      console.warn('Mission response save warning:', saveErr);
    }

    // Dual Log to analytics_pageviews for Admin Panel visibility
    try {
      const emailVal = localStorage.getItem('user_email') || (leadData ? leadData.email : '');
      const phoneVal = leadData ? leadData.phone : '';
      const nameVal = leadData ? leadData.name : '';
      await fetch(SUPABASE_URL + '/rest/v1/analytics_pageviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          page: `actividad${currentDay}_submission`,
          visitor_id: (leadData && leadData.auth_token) ? leadData.auth_token : (emailVal || 'anon'),
          user_agent: JSON.stringify({
            email: emailVal,
            name: nameVal,
            phone: phoneVal,
            day: currentDay,
            response_data: formData
          })
        })
      });
    } catch (pvErr) {}

    // Save Progress Milestone & Unlock Insignia
    try {
      var unlocked = JSON.parse(localStorage.getItem('unlocked_insignias') || '[]');
      if (!unlocked.includes(currentDay)) {
        unlocked.push(currentDay);
        localStorage.setItem('unlocked_insignias', JSON.stringify(unlocked));
      }
      localStorage.setItem(`live_session_${currentDay}_completed`, 'true');
      localStorage.setItem('genoma_current_activity', String(currentDay + 1));

      var calcPts = unlocked.length * 30;
      if (token) {
        fetch(SUPABASE_URL + '/rest/v1/rpc/save_user_progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            p_token: token,
            p_activity: currentDay + 1,
            p_points: calcPts
          })
        }).catch(function() {});
      }

      if (leadData && leadData.id) {
        await fetch(SUPABASE_URL + '/rest/v1/user_progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            lead_id: leadData.id,
            milestone: `day_${currentDay}_completed`,
            completed_at: new Date().toISOString()
          })
        });
      }
    } catch (progErr) {
      console.warn('User progress save warning:', progErr);
    }

    // Always Show Success View
    showSuccessView();

  } catch (err) {
    console.error('Activity submission error:', err);
    showSuccessView();
  }
}

function showSuccessView() {
  document.getElementById('activity-view').style.display = 'none';
  document.getElementById('success-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Celebratory Confetti Burst 🎉
  if (typeof confetti === 'function') {
    try {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      setTimeout(() => {
        try { confetti({ particleCount: 70, angle: 60, spread: 55, origin: { x: 0 } }); } catch(e){}
        try { confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1 } }); } catch(e){}
      }, 250);
    } catch (e) {}
  }
}

function goToAppWithInsignia() {
  const token = localStorage.getItem('auth_token') || '';
  window.location.href = '/app' + (token ? '?token=' + token + '&unlocked=1#actividades' : '?unlocked=1#actividades');
}

// ========================================
// GASTOS HORMIGA ENGINE (DÍA 3)
// ========================================
window.selectGastosCurr = function(currCode, btnEl) {
  var hiddenInp = document.getElementById('field-day3-currency');
  if (hiddenInp) hiddenInp.value = currCode;

  var btns = document.querySelectorAll('.curr-btn-opt');
  btns.forEach(function(b) {
    b.style.border = '1px solid rgba(255,255,255,0.1)';
    b.style.background = 'rgba(255,255,255,0.04)';
    b.style.color = '#94a3b8';
    b.classList.remove('active');
  });

  if (btnEl) {
    btnEl.style.border = '1px solid #3b82f6';
    btnEl.style.background = 'rgba(59,130,246,0.25)';
    btnEl.style.color = '#ffffff';
    btnEl.classList.add('active');
  }

  var sym = currCode === 'cop' ? 'COP $' : (currCode === 'mxn' ? 'MXN $' : 'USD $');
  var symEls = document.querySelectorAll('.curr-sym');
  symEls.forEach(function(el) { el.textContent = sym; });

  window.recalcGastosHormiga();
};

window.recalcGastosHormiga = function() {
  var currInp = document.getElementById('field-day3-currency');
  var curr = currInp ? currInp.value : 'cop';

  var catIds = [
    'gasto-cafe', 'gasto-delivery', 'gasto-streaming', 'gasto-snacks', 'gasto-transporte',
    'gasto-salidas', 'gasto-compras', 'gasto-tabaco', 'gasto-belleza', 'gasto-apps'
  ];

  var monthlyTotal = 0;
  catIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      var val = parseFloat(el.value) || 0;
      monthlyTotal += val;
    }
  });

  var annualTotal = monthlyTotal * 12;

  // Compound interest calculation: 7% annual rate
  var r = 0.07 / 12;
  var proj10 = monthlyTotal > 0 ? Math.round(monthlyTotal * ((Math.pow(1 + r, 120) - 1) / r)) : 0;
  var proj20 = monthlyTotal > 0 ? Math.round(monthlyTotal * ((Math.pow(1 + r, 240) - 1) / r)) : 0;

  function fmt(val) {
    if (curr === 'cop') {
      return '$' + Math.round(val).toLocaleString('es-CO') + ' COP';
    } else if (curr === 'mxn') {
      return '$' + Math.round(val).toLocaleString('es-MX') + ' MXN';
    } else {
      return '$' + Math.round(val).toLocaleString('en-US') + ' USD';
    }
  }

  var elMensual = document.getElementById('res-gastos-mensual');
  var elAnual = document.getElementById('res-gastos-anual');
  var elProj10 = document.getElementById('res-proj-10a');
  var elProj20 = document.getElementById('res-proj-20a');
  var elRecText = document.getElementById('res-recomendacion-text');

  if (elMensual) elMensual.textContent = fmt(monthlyTotal);
  if (elAnual) elAnual.textContent = fmt(annualTotal);
  if (elProj10) elProj10.textContent = fmt(proj10);
  if (elProj20) elProj20.textContent = fmt(proj20);

  var hMensual = document.getElementById('field-day3-gastos-total-mensual');
  var hAnual = document.getElementById('field-day3-gastos-total-anual');
  var hP10 = document.getElementById('field-day3-gastos-proj-10a');
  var hP20 = document.getElementById('field-day3-gastos-proj-20a');

  if (hMensual) hMensual.value = monthlyTotal;
  if (hAnual) hAnual.value = annualTotal;
  if (hP10) hP10.value = proj10;
  if (hP20) hP20.value = proj20;

  if (elRecText) {
    var lowT = curr === 'usd' ? 12 : (curr === 'mxn' ? 200 : 50000);
    var midT = curr === 'usd' ? 50 : (curr === 'mxn' ? 900 : 200000);

    if (monthlyTotal === 0) {
      elRecText.innerHTML = 'Ingresa tus gastos en las casillas para ver tu diagnóstico de inversión.';
    } else if (monthlyTotal < lowT) {
      elRecText.innerHTML = '<strong>Estrategia ETF de Bajo Costo (SCHD / VTI):</strong> Con este monto la clave es consistencia. Pequeñas cantidades invertidas a 20 años superan millones gracias al interés compuesto.';
    } else if (monthlyTotal < midT) {
      elRecText.innerHTML = '<strong>Combo INGRESARIOS (JEPQ + SCHD + VCIT):</strong> Combina ingresos mensuales (JEPQ) + crecimiento (SCHD) + estabilidad (VCIT). Empezarás a recibir dividendos reales en 3-5 años.';
    } else {
      elRecText.innerHTML = '<strong>Portafolio Income Completo INGRESARIOS (JEPQ + SCHD + VCIT + BTAL):</strong> El portafolio profesional de Juan Villegas con cobertura anticrisis. ¡Tu fuga actual puede financiar tu libertad financiera!';
    }
  }
};

window.goToGastosStep = function(stepNum) {
  var s1 = document.getElementById('gastos-step-1');
  var s2 = document.getElementById('gastos-step-2');
  var s3 = document.getElementById('gastos-step-3');
  var badge = document.getElementById('gastos-step-badge');
  var pct = document.getElementById('gastos-step-pct');
  var bar = document.getElementById('gastos-step-bar');
  var mainSubmitBtn = document.getElementById('btn-submit-activity');

  if (!s1 || !s2 || !s3) return;

  if (window.recalcGastosHormiga) window.recalcGastosHormiga();

  s1.style.display = 'none';
  s2.style.display = 'none';
  s3.style.display = 'none';

  if (stepNum === 1) {
    s1.style.display = 'block';
    if (badge) badge.textContent = 'Paso 1 de 3: Diagnóstico de Gastos';
    if (pct) pct.textContent = '33%';
    if (bar) bar.style.width = '33%';
    if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
  } else if (stepNum === 2) {
    s2.style.display = 'block';
    if (badge) badge.textContent = 'Paso 2 de 3: Proyección & Portafolio';
    if (pct) pct.textContent = '66%';
    if (bar) bar.style.width = '66%';
    if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
  } else if (stepNum === 3) {
    s3.style.display = 'block';
    if (badge) badge.textContent = 'Paso 3 de 3: Plan & Cláusula Anti-Saboteador';
    if (pct) pct.textContent = '100%';
    if (bar) bar.style.width = '100%';
    if (mainSubmitBtn) mainSubmitBtn.style.display = 'block';
  }

  window.scrollTo({ top: 150, behavior: 'smooth' });
};
