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
      <!-- MATERIAL EXTRA DE REGALO -->
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%); border: 1.5px solid rgba(56, 189, 248, 0.4); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); border-radius: 14px; padding: 16px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 240px;">
          <div style="font-size: 2.2rem; background: rgba(56, 189, 248, 0.12); border-radius: 12px; padding: 10px 14px; border: 1px solid rgba(56, 189, 248, 0.25);">📘</div>
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; display: block; margin-bottom: 2px;">🎁 MATERIAL EXTRA COMPLEMENTARIO</span>
            <strong style="font-size: 0.95rem; color: #f8fafc; font-family: 'Outfit', sans-serif; display: block;">La Gran Aventura del Dinero y la Bolsa de Valores</strong>
            <span style="font-size: 0.8rem; color: #94a3b8;">Libro / Guía PDF esencial para dominar las reglas del dinero y los mercados.</span>
          </div>
        </div>
        <a href="La_Gran_Aventura_del_Dinero.pdf" target="_blank" download="La_Gran_Aventura_del_Dinero.pdf" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 800; padding: 10px 18px; border-radius: 10px; text-decoration: none; border: 1px solid #38bdf8; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);">
          <span>📥 Descargar PDF</span>
        </a>
      </div>

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
        <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#38bdf8; display:block; margin-bottom:14px;">Paso 3 de 3 • Tu Plan de Acción & Cláusula Anti-Saboteador</span>

        <!-- 1. SELECTOR VISUAL DE RUTA -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom:16px;">
          <label class="form-label" style="margin-bottom:10px; font-weight:700; color:#f8fafc; display:block;">1. Selecciona tu Ruta de Trabajo <span style="color:#ef4444;">*</span></label>
          <input type="hidden" id="field-day3-route" class="form-input" value="Ruta Cero — Dinero Consciente" />
          
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
            <!-- Tarjeta Ruta Cero -->
            <div class="route-card-opt active" onclick="selectGastosRoute('Ruta Cero — Dinero Consciente', this)" style="border: 1px solid #3b82f6; background: rgba(59, 130, 246, 0.15); padding: 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:1.2rem;">🌱</span>
                <strong style="font-size:0.9rem; color:#fff;">Ruta Cero</strong>
              </div>
              <span style="font-size:0.78rem; color:#94a3b8; line-height:1.4; display:block;">
                Plan de Dinero Consciente. Para quienes buscan ordenar sus finanzas personales e iniciar su primer portafolio ETF.
              </span>
            </div>

            <!-- Tarjeta Ruta Experiencia -->
            <div class="route-card-opt" onclick="selectGastosRoute('Ruta Experiencia — Plan de Mercado', this)" style="border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03); padding: 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:1.2rem;">⚡</span>
                <strong style="font-size:0.9rem; color:#fff;">Ruta Experiencia</strong>
              </div>
              <span style="font-size:0.78rem; color:#94a3b8; line-height:1.4; display:block;">
                Plan de Mercado Profesional. Para traders e inversionistas activos con reglas estrictas de gestión de riesgo.
              </span>
            </div>
          </div>
        </div>

        <!-- 2. MONTO DE REDIRECCIÓN -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom:16px;">
          <label class="form-label" style="font-weight:700; color:#f8fafc; margin-bottom:4px; display:block;">2. Monto Sostenible a Redirigir al Mes <span style="color:#ef4444;">*</span></label>
          <span style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:10px;">¿Qué cantidad mensual de la fuga detectada vas a destinar a tu fondo de construcción de patrimonio?</span>
          <input id="field-day3-redirect-amount" type="text" class="form-input" placeholder="Ej: $30 USD / $100,000 COP al mes" required style="padding:12px; font-size:0.9rem;" />
        </div>

        <!-- 3. CLÁUSULA ANTI-SABOTEADOR CON EJEMPLOS GUÍA -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom:16px;">
          <label class="form-label" style="font-weight:700; color:#f8fafc; margin-bottom:4px; display:block;">3. Tu Cláusula Anti-Saboteador (Regla de Oro) <span style="color:#ef4444;">*</span></label>
          <span style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:12px;">Escribe el compromiso innegociable que evitará que vuelvas a caer en gastos por impulso o emoción:</span>

          <!-- Tarjeta de Ejemplos -->
          <div style="background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.2); border-radius:10px; padding:12px; margin-bottom:12px; font-size:0.78rem; color:#cbd5e1; line-height:1.45;">
            <strong style="color:#38bdf8; display:block; margin-bottom:4px;">💡 Ejemplos de Compromiso según tu Ruta:</strong>
            <div style="margin-bottom:6px;">🌱 <strong>Ruta Cero:</strong> "La separación del dinero ocurre el día 1 del mes antes de cualquier gasto discrecional. No usaré dinero real hasta simular 4 semanas."</div>
            <div>⚡ <strong>Ruta Experiencia:</strong> "Si no está en mi plan de mercado, no existe. Después de 2 pérdidas consecutivas en el día, cierro plataforma sin excepción."</div>
          </div>

          <textarea id="field-day3-saboteur-clause" class="form-textarea" rows="3" placeholder="Escribe aquí tu Cláusula Anti-Saboteador innegociable..." required style="padding:12px; font-size:0.88rem; line-height:1.5;"></textarea>
        </div>

        <button type="button" onclick="goToGastosStep(2)" style="margin-bottom:14px; width:100%; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#94a3b8; font-weight:700; font-size:0.88rem; cursor:pointer;">
          ⬅ Volver al Diagnóstico
        </button>
      </div>
    `
  },
  4: {
    dayDate: "6 de Agosto",
    title: "Día 4: Ejecución con IA (Conoce a GENY)",
    desc: "Elige tu nivel para simular tu primer Paper Trade con gestión de riesgo previa.",
    renderForm: () => `
      <div style="margin-bottom:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:16px; text-align:center;">
        <label class="form-label" style="font-size:0.95rem; font-weight:800; color:#fff; margin-bottom:12px; display:block;">
          🎯 ¿Cuál es tu nivel de experiencia en trading?
        </label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <button type="button" id="btn-ruta-cero-4" onclick="selectDay4Path('cero')" style="padding:12px; border-radius:12px; border:2px solid #22c55e; background:rgba(34,197,94,0.15); color:#fff; font-weight:800; font-size:0.85rem; cursor:pointer; transition:all 0.2s;">
            🌱 Ruta Cero<br><span style="font-size:0.72rem; font-weight:400; color:#cbd5e1;">(Voy empezando desde 0)</span>
          </button>
          <button type="button" id="btn-ruta-exp-4" onclick="selectDay4Path('exp')" style="padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#94a3b8; font-weight:700; font-size:0.85rem; cursor:pointer; transition:all 0.2s;">
            ⚡ Ruta Experiencia<br><span style="font-size:0.72rem; font-weight:400; color:#94a3b8;">(Ya tengo experiencia)</span>
          </button>
        </div>
      </div>

      <!-- FORMULARIO RUTA CERO (PRINCIPIANTE - ASISTIDO) -->
      <div id="day4-form-cero" style="display:block;">
        <div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.25); border-radius:14px; padding:14px; margin-bottom:16px; font-size:0.85rem; color:#cbd5e1; line-height:1.45;">
          🌱 <strong>Simulador Asistido:</strong> No necesitas conocimientos previos. Simularás el Paper Trade visto en la clase con los parámetros recomendados por Juan en vivo.
        </div>

        <div class="form-group">
          <label class="form-label">1. Selecciona el Activo de la Clase <span style="color:#ef4444;">*</span></label>
          <select id="field-day4-asset-cero" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
            <option value="Bitcoin (BTC/USD) — Ejemplo de la Clase">🟡 Bitcoin (BTC/USD) — Ejemplo de la Clase</option>
            <option value="Índice Nasdaq (NQ) — Ejemplo de la Clase">🔵 Índice Nasdaq (NQ) — Ejemplo de la Clase</option>
            <option value="Oro (XAU/USD) — Ejemplo de la Clase">🟡 Oro (XAU/USD) — Ejemplo de la Clase</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">2. Señal de IA Confirmada <span style="color:#ef4444;">*</span></label>
          <select id="field-day4-signal-cero" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
            <option value="Geny Trend Alcista 15M (Confirmado por IA)">🤖 Geny Trend Alcista 15M (Confirmado por IA)</option>
            <option value="Filtro de Invalidación de Tendencia (IA)">🛡️ Filtro de Invalidación de Tendencia (IA)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">3. Regla de Invalidación / Stop Loss <span style="color:#ef4444;">*</span></label>
          <select id="field-day4-stop-cero" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
            <option value="Stop Loss del 1% del capital (Sugerido en Clase)">🛡️ Límite Máximo del 1% del Capital (Sugerido en Clase)</option>
            <option value="Nivel de Invalidación Técnico de la Clase ($64,200)">📉 Nivel de Invalidación Técnico de la Clase ($64,200)</option>
          </select>
        </div>

        <input type="hidden" id="field-day4-path-type" value="Ruta Cero (Principiante)" />
      </div>

      <!-- FORMULARIO RUTA EXPERIENCIA (AVANZADO - LIBRE) -->
      <div id="day4-form-exp" style="display:none;">
        <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:14px; margin-bottom:16px; font-size:0.85rem; color:#cbd5e1; line-height:1.45;">
          ⚡ <strong>Trading Personalizado:</strong> Ingresa los parámetros exactos de tu plan de trading o de tu análisis técnico actual.
        </div>

        <div class="form-group">
          <label class="form-label">Activo Financiero (Ej: BTC/USD, Nasdaq, Gold, EUR/USD)</label>
          <input id="field-day4-asset-exp" type="text" class="form-input" placeholder="Ej: BTC/USD o Nasdaq" />
        </div>
        <div class="form-group">
          <label class="form-label">Señal de IA / Análisis Técnico (Ej: Geny Trend Alcista 15M)</label>
          <input id="field-day4-signal-exp" type="text" class="form-input" placeholder="Ej: Geny Trend Alcista 15M" />
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de Stop Loss de Invalidación</label>
          <input id="field-day4-stop-exp" type="text" class="form-input" placeholder="Ej: $64,200 o Riesgo 0.5%" />
        </div>
      </div>
    `
  },
  5: {
    dayDate: "7 de Agosto",
    title: "Día 5: La Bitácora del Saboteador",
    desc: "Registra tus emociones al operar para evitar que el Saboteador tome el control de tu dinero.",
    renderForm: () => `
      <div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.25); border-radius:14px; padding:14px; margin-bottom:16px; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
        💡 <strong>¿Qué es la Bitácora del Saboteador?</strong> Es tu diario emocional de trading. Sirve para anotar si sentiste impaciencia, duda o calma durante tu simulación, entrenando tu mente antes de arriesgar capital real.
      </div>

      <div class="form-group">
        <label class="form-label">1. ¿Qué emoción principal identificaste durante tu ejercicio? <span style="color:#ef4444;">*</span></label>
        <select id="field-day5-emotion" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
          <option value="Mantuve la calma y la disciplina al 100%">🟢 Mantuve la calma y la disciplina al 100%</option>
          <option value="Sentí impaciencia o ganas de acelerar la entrada">🟡 Sentí impaciencia o ganas de acelerar la entrada</option>
          <option value="Sentí duda o miedo a equivocarme">🔴 Sentí duda o miedo a equivocarme</option>
          <option value="Sentí la tentación de operar sin Stop Loss">⚠️ Sentí la tentación de operar sin Stop Loss</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">2. Cumplimiento de tu Plan y Regla de Invalidación <span style="color:#ef4444;">*</span></label>
        <select id="field-day5-compliance" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
          <option value="Respeté mi límite de riesgo / Stop Loss sin excepción">🛡️ Respeté mi límite de riesgo / Stop Loss sin excepción</option>
          <option value="Tuve dudas pero me mantuve dentro de mi plan">⚡ Tuve dudas pero me mantuve dentro de mi plan</option>
          <option value="Es mi primera simulación y estoy aprendiendo a controlar impulsos">🌱 Es mi primera simulación y estoy aprendiendo a controlar impulsos</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">3. Tu Reflexión de Bitácora PEDEM (Opcional / Guiada)</label>
        <textarea id="field-day5-log" class="form-textarea" rows="2" style="font-size:0.9rem;">Registré mi simulación del Día 4 en la Bitácora PEDEM. Mantuve la disciplina y respeté el límite de riesgo sin improvisar.</textarea>
      </div>
    `
  },
  6: {
    dayDate: "8 de Agosto",
    title: "Día 6: La Rúbrica PEDEM — Tu Evaluación de Dominio",
    desc: "Evalúa la disciplina con la que ejecutaste tu plan durante la sesión de hoy. La Rúbrica PEDEM mide 5 pilares clave de tu desempeño como operador consciente.",
    renderForm: () => `
      <div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.25); border-radius:14px; padding:14px; margin-bottom:16px; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
        💡 <strong>¿Qué es la Rúbrica PEDEM?</strong> Es tu sistema de autoevaluación en 5 pilares: <strong>P</strong>lan (seguí mi plan), <strong>E</strong>jecución (entré y salí según las reglas), <strong>D</strong>isciplina (no improvisé), <strong>E</strong>moción (no dejé que el miedo o la euforia decidieran), <strong>M</strong>ejora (aprendí algo nuevo hoy). Califica cada pilar del 1 al 5.
      </div>

      <div class="form-group">
        <label class="form-label">1. 📋 PLAN — ¿Seguiste tu plan de operación previamente definido? <span style="color:#ef4444;">*</span></label>
        <select id="field-day6-plan" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
          <option value="5 — Seguí el plan al 100%, sin modificaciones">5 — Seguí el plan al 100%, sin modificaciones</option>
          <option value="4 — Seguí el plan con ajustes mínimos justificados">4 — Seguí el plan con ajustes mínimos justificados</option>
          <option value="3 — Tuve dudas y modifiqué algo sobre la marcha">3 — Tuve dudas y modifiqué algo sobre la marcha</option>
          <option value="2 — Improvisé la mayor parte de mis decisiones">2 — Improvisé la mayor parte de mis decisiones</option>
          <option value="1 — No tenía un plan definido antes de empezar">1 — No tenía un plan definido antes de empezar</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">2. ⚡ EJECUCIÓN — ¿Entraste y saliste según tus reglas predefinidas? <span style="color:#ef4444;">*</span></label>
        <select id="field-day6-execution" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
          <option value="5 — Entradas y salidas exactas según mis reglas">5 — Entradas y salidas exactas según mis reglas</option>
          <option value="4 — Casi perfecto, un error menor de timing">4 — Casi perfecto, un error menor de timing</option>
          <option value="3 — Respeté la entrada pero moví el Stop Loss o Take Profit">3 — Respeté la entrada pero moví el Stop Loss o Take Profit</option>
          <option value="2 — Entré fuera de mis condiciones por ansiedad">2 — Entré fuera de mis condiciones por ansiedad</option>
          <option value="1 — No usé reglas, operé por intuición">1 — No usé reglas, operé por intuición</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">3. 🛡️ DISCIPLINA — ¿Respetaste tu Stop Loss y la regla de invalidación? <span style="color:#ef4444;">*</span></label>
        <select id="field-day6-discipline" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
          <option value="5 — Mi Stop Loss se ejecutó o no lo necesité, 0 improvisación">5 — Mi Stop Loss se ejecutó o no lo necesité, 0 improvisación</option>
          <option value="4 — Mantuve el Stop pero sentí la tentación de moverlo">4 — Mantuve el Stop pero sentí la tentación de moverlo</option>
          <option value="3 — Lo moví una vez para 'darle más espacio'">3 — Lo moví una vez para "darle más espacio"</option>
          <option value="2 — Lo eliminé y confié en que el precio iba a regresar">2 — Lo eliminé y confié en que el precio iba a regresar</option>
          <option value="1 — Nunca puse Stop Loss">1 — Nunca puse Stop Loss</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">4. 🧠 EMOCIÓN — ¿Tu Saboteador tomó alguna decisión hoy? <span style="color:#ef4444;">*</span></label>
        <select id="field-day6-emotion" class="form-input" required style="background:#0f172a; color:#fff; border-color:rgba(255,255,255,0.2); font-size:0.9rem;">
          <option value="5 — Operé con calma total, cero reacción emocional">5 — Operé con calma total, cero reacción emocional</option>
          <option value="4 — Sentí algo de ansiedad pero no afectó mis decisiones">4 — Sentí algo de ansiedad pero no afectó mis decisiones</option>
          <option value="3 — La emoción me hizo dudar pero finalmente seguí el plan">3 — La emoción me hizo dudar pero finalmente seguí el plan</option>
          <option value="2 — Tomé una decisión impulsiva por miedo o euforia">2 — Tomé una decisión impulsiva por miedo o euforia</option>
          <option value="1 — El Saboteador dominó toda la sesión">1 — El Saboteador dominó toda la sesión</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">5. 📈 MEJORA — ¿Qué aprendiste hoy que puedes mejorar mañana? <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day6-improvement" class="form-textarea" rows="2" placeholder="Ej: Aprendí que debo esperar confirmación antes de entrar, mañana lo aplicaré sin excepción." required></textarea>
      </div>

      <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:14px; margin-top:8px; font-size:0.82rem; color:#94a3b8; line-height:1.5;">
        🏆 <strong>Tu Rango PEDEM de hoy se calcula automáticamente:</strong> 20-25 pts = Trader Inquebrantable 🏆 | 15-19 pts = Operador PEDEM 🟢 | 10-14 pts = Operador Consciente 🟡 | 5-9 pts = Operador Reactivo 🔴
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
    title: "Día 8: Panel de Casos Reales — Historias Sin Saboteador",
    desc: "Escribe la pregunta o inquietud que te está frenando para que Juan la responda en vivo mañana.",
    renderForm: () => `
      <div class="form-group">
        <label class="form-label">Tu Duda u Objeción Personal <span style="color:#ef4444;">*</span></label>
        <textarea id="field-day8-question" class="form-input form-textarea" rows="4" placeholder="Escribe tu pregunta o duda personal..." required></textarea>
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

function getAvailableDayNumber() {
  if (localStorage.getItem('preview_all_days') === 'true') return 10;
  const now = Date.now();
  const day6UnlockTime = Date.UTC(2026, 7, 8, 23, 0, 0); // Aug 8, 18:00 COT
  const day7UnlockTime = Date.UTC(2026, 7, 9, 23, 0, 0);
  const day8UnlockTime = Date.UTC(2026, 7, 10, 23, 0, 0);
  const day9UnlockTime = Date.UTC(2026, 7, 11, 23, 0, 0);
  const day10UnlockTime = Date.UTC(2026, 7, 12, 23, 0, 0);

  if (now < day6UnlockTime) return 5;
  if (now < day7UnlockTime) return 6;
  if (now < day8UnlockTime) return 7;
  if (now < day9UnlockTime) return 8;
  if (now < day10UnlockTime) return 9;
  return 10;
}

async function initActivity() {
  currentDay = determineDay();
  
  const availableDay = getAvailableDayNumber();
  if (currentDay > availableDay) {
    const actCard = document.getElementById('activity-card');
    if (actCard) {
      actCard.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
          <div style="font-size:3.5rem; margin-bottom:16px;">🔒</div>
          <h2 style="font-size:1.4rem; color:#fff; margin-bottom:8px;">Actividad del Día ${currentDay} Bloqueada</h2>
          <p style="color:#94a3b8; font-size:0.95rem; max-width:440px; margin:0 auto 24px auto;">
            Esta actividad se desbloqueará hoy a las <strong>6:00 PM (Hora Colombia)</strong>.
          </p>
          <a href="/app" class="btn-submit" style="text-decoration:none; background:#25d366; color:#000; font-weight:800; display:inline-block; padding:12px 24px; border-radius:10px;">
            VOLVER A LA APP
          </a>
        </div>
      `;
    }
    return;
  }
  
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

function selectDay4Path(pathType) {
  const btnCero = document.getElementById('btn-ruta-cero-4');
  const btnExp = document.getElementById('btn-ruta-exp-4');
  const formCero = document.getElementById('day4-form-cero');
  const formExp = document.getElementById('day4-form-exp');
  const pathTypeInput = document.getElementById('field-day4-path-type');

  if (pathType === 'cero') {
    if (btnCero) {
      btnCero.style.borderColor = '#22c55e';
      btnCero.style.background = 'rgba(34,197,94,0.15)';
      btnCero.style.color = '#fff';
    }
    if (btnExp) {
      btnExp.style.borderColor = 'rgba(255,255,255,0.15)';
      btnExp.style.background = 'rgba(255,255,255,0.05)';
      btnExp.style.color = '#94a3b8';
    }
    if (formCero) formCero.style.display = 'block';
    if (formExp) formExp.style.display = 'none';
    if (pathTypeInput) pathTypeInput.value = 'Ruta Cero (Principiante)';
  } else {
    if (btnExp) {
      btnExp.style.borderColor = '#38bdf8';
      btnExp.style.background = 'rgba(56,189,248,0.15)';
      btnExp.style.color = '#fff';
    }
    if (btnCero) {
      btnCero.style.borderColor = 'rgba(255,255,255,0.15)';
      btnCero.style.background = 'rgba(255,255,255,0.05)';
      btnCero.style.color = '#94a3b8';
    }
    if (formCero) formCero.style.display = 'none';
    if (formExp) formExp.style.display = 'block';
    if (pathTypeInput) pathTypeInput.value = 'Ruta Experiencia (Avanzado)';
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

  if (currentDay === 4) {
    const pathTypeInput = document.getElementById('field-day4-path-type');
    const isCero = !pathTypeInput || pathTypeInput.value.includes('Cero');
    if (isCero) {
      formData.asset = document.getElementById('field-day4-asset-cero')?.value || 'Bitcoin (BTC/USD)';
      formData.signal = document.getElementById('field-day4-signal-cero')?.value || 'Geny Trend Alcista 15M';
      formData.stop_loss = document.getElementById('field-day4-stop-cero')?.value || '1% del capital';
      formData.path = 'Ruta Cero (Principiante)';
    } else {
      formData.asset = document.getElementById('field-day4-asset-exp')?.value || 'BTC/USD';
      formData.signal = document.getElementById('field-day4-signal-exp')?.value || 'Geny Trend Alcista 15M';
      formData.stop_loss = document.getElementById('field-day4-stop-exp')?.value || 'Stop Loss del Plan';
      formData.path = 'Ruta Experiencia (Avanzado)';
    }
  }

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

  // Update insignia badge dynamically based on currentDay
  const insigniaMap = {
    1: { icon: '🏛️', name: 'Insignia Día 1: El Saboteador' },
    2: { icon: '🎯', name: 'Insignia Día 2: Cuenta Espejo' },
    3: { icon: '🐜', name: 'Insignia Día 3: Gastos Hormiga' },
    4: { icon: '🤖', name: 'Insignia Día 4: Trading con IA (GENY)' },
    5: { icon: '📖', name: 'Insignia Día 5: Bitácora PEDEM' },
    6: { icon: '📊', name: 'Insignia Día 6: Rúbrica de Disciplina' },
    7: { icon: '⚡', name: 'Insignia Día 7: Masterclass de Dominio' },
    8: { icon: '💬', name: 'Insignia Día 8: Duda u Objeción' },
    9: { icon: '🚀', name: 'Insignia Día 9: Evolución Mental' },
    10: { icon: '🏆', name: 'Insignia Día 10: Rango de Dominio Total' }
  };
  const currentInsignia = insigniaMap[currentDay] || { icon: '🎖️', name: `Insignia Día ${currentDay}` };

  const iconEl = document.getElementById('success-insignia-icon');
  const titleEl = document.getElementById('success-insignia-title');
  const descEl = document.getElementById('success-insignia-desc');

  if (iconEl) iconEl.textContent = currentInsignia.icon;
  if (titleEl) titleEl.textContent = `${currentInsignia.name} Acreditada`;
  if (descEl) descEl.innerHTML = `Tu <strong>${currentInsignia.name}</strong> se ha desbloqueado exitosamente en tu plataforma.`;

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
  const dayNum = currentDay || 3;
  window.location.href = '/app' + (token ? `?token=${encodeURIComponent(token)}&unlocked=${dayNum}` : `?unlocked=${dayNum}`);
}

// ========================================
// GASTOS HORMIGA ENGINE (DÍA 3)
// ========================================
window.selectGastosRoute = function(routeVal, cardEl) {
  var hiddenInp = document.getElementById('field-day3-route');
  if (hiddenInp) hiddenInp.value = routeVal;

  var cards = document.querySelectorAll('.route-card-opt');
  cards.forEach(function(c) {
    c.style.border = '1px solid rgba(255,255,255,0.1)';
    c.style.background = 'rgba(255,255,255,0.03)';
    c.classList.remove('active');
  });

  if (cardEl) {
    cardEl.style.border = '1px solid #3b82f6';
    cardEl.style.background = 'rgba(59,130,246,0.15)';
    cardEl.classList.add('active');
  }
};

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

