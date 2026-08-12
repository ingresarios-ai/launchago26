import re

with open('app_v3.js', 'r') as f:
    content = f.read()

replacement = """    renderMission: () => `
      <!-- ROUTE SELECTOR -->
      <div class="form-group" id="day8-route-selector-container">
        <label class="form-label" style="text-align: center; font-size: 1.1rem; margin-bottom: 16px;">¿Con cuál ruta te identificas más? <span style="color:#ef4444;">*</span></label>
        
        <input type="hidden" id="field-day8-route" class="form-input" value="" required>

        <style>
          .route-btn {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px 16px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }
          .route-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.3);
          }
          .route-btn.selected-cero {
            background: rgba(37, 211, 102, 0.15);
            border-color: #25d366;
          }
          .route-btn.selected-exp {
            background: rgba(56, 189, 248, 0.15);
            border-color: #38bdf8;
          }
          .route-btn-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.2rem;
            font-weight: 800;
            color: #f8fafc;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .route-btn-desc {
            font-size: 0.9rem;
            color: #94a3b8;
            line-height: 1.4;
          }
        </style>
        
        <div id="btn-route-cero" class="route-btn" onclick="selectDay8Route('Ruta Cero')">
          <div class="route-btn-title"><span>🟢</span> Ruta Cero</div>
          <div class="route-btn-desc">Estoy empezando. Todavía no opero o tengo muy poca experiencia.</div>
        </div>

        <div id="btn-route-exp" class="route-btn" onclick="selectDay8Route('Ruta Experiencia')">
          <div class="route-btn-title"><span>🔵</span> Ruta Experiencia</div>
          <div class="route-btn-desc">Ya tengo conocimientos o he operado, pero no logro ser consistente.</div>
        </div>
      </div>

      <!-- RUTA CERO QUESTIONS -->
      <div id="day8-route-cero" style="display:none;">
        <div style="background: rgba(37, 211, 102, 0.08); border: 1px solid rgba(37, 211, 102, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <strong style="color: #25d366; font-size: 0.85rem;">🟢 MAPA DE BRECHA — RUTA CERO</strong>
        </div>
        <div class="form-group">
          <label class="form-label">1. ¿Qué concepto todavía no puedes explicar con tus propias palabras? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-rc-q1" class="form-textarea" rows="2" placeholder="Ej: No entiendo bien qué es un ETF, o cómo funciona un bróker..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">2. ¿Qué riesgo debes evitar mientras aprendes? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-rc-q2" class="form-textarea" rows="2" placeholder="Ej: Abrir una cuenta real antes de practicar en demo..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">3. ¿Qué práctica puedes hacer sin dinero real? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-rc-q3" class="form-textarea" rows="2" placeholder="Ej: Observar gráficas, practicar en simulador, documentar lo que aprendo..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">4. ¿Qué pregunta debes poder responder antes de avanzar? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-rc-q4" class="form-textarea" rows="2" placeholder="Ej: ¿Cuánto puedo perder sin que afecte mi vida?"></textarea>
        </div>
      </div>

      <!-- RUTA EXPERIENCIA QUESTIONS -->
      <div id="day8-route-exp" style="display:none;">
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <strong style="color: #38bdf8; font-size: 0.85rem;">🔵 MAPA DE BRECHA — RUTA EXPERIENCIA</strong>
        </div>
        <div class="form-group">
          <label class="form-label">1. ¿Qué pieza de tu proceso falla más? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-re-q1" class="form-textarea" rows="2" placeholder="Ej: Planeación, ejecución, documentación, evaluación..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">2. ¿Qué evidencia tienes de que realmente falla? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-re-q2" class="form-textarea" rows="2" placeholder="Ej: Mis últimas 10 operaciones no siguieron el plan original..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">3. ¿Qué regla falta o se negocia? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-re-q3" class="form-textarea" rows="2" placeholder="Ej: Mi regla de stop loss... la muevo cuando estoy perdiendo..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">4. ¿Qué variable medirás durante tu próxima muestra? <span style="color:#ef4444;">*</span></label>
          <textarea id="field-day8-re-q4" class="form-textarea" rows="2" placeholder="Ej: % de trades donde seguí el plan vs. donde improvisé..."></textarea>
        </div>
      </div>

      <!-- BRECHA PRINCIPAL (both routes) -->
      <div id="day8-brecha-principal" style="display:none;">
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <strong style="color: #f59e0b; font-size: 0.85rem;">⚡ IDENTIFICA TU BRECHA PRINCIPAL</strong>
          <p style="color: #94a3b8; font-size: 0.8rem; margin: 4px 0 0 0;">No elijas todas. ¿Cuál, si la fortalecieras, mejoraría más tu proceso?</p>
        </div>
        
        <input type="hidden" id="field-day8-capa" class="form-input" value="" required>
        
        <style>
          .gap-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            color: #e2e8f0;
          }
          .gap-card:hover {
            background: rgba(255, 255, 255, 0.08);
          }
          .gap-card.selected {
            background: rgba(245, 158, 11, 0.15);
            border-color: #f59e0b;
            color: #f8fafc;
            font-weight: bold;
          }
          .gap-icon {
            font-size: 1.2rem;
            margin-right: 12px;
          }
        </style>
        
        <div class="gap-cards-container" style="margin-bottom: 16px;">
          <div class="gap-card" onclick="selectGapCard('Fundamentos', this)">
            <span class="gap-icon">📚</span> Fundamentos
          </div>
          <div class="gap-card" onclick="selectGapCard('Mente', this)">
            <span class="gap-icon">🧠</span> Mente
          </div>
          <div class="gap-card" onclick="selectGapCard('Método', this)">
            <span class="gap-icon">📐</span> Método
          </div>
          <div class="gap-card" onclick="selectGapCard('Riesgo', this)">
            <span class="gap-icon">🛡️</span> Riesgo
          </div>
          <div class="gap-card" onclick="selectGapCard('Oficio', this)">
            <span class="gap-icon">⚒️</span> Oficio
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 16px;">
          <button type="button" id="btn-geny-generate" class="btn-primary" style="width: 100%; padding: 12px;" onclick="generateGenyMap()">
            ✨ Generar mi Mapa con Geny
          </button>
        </div>

        <div id="geny-loading" style="display:none; text-align: center; padding: 20px; color: #10b981;">
          <div class="spinner" style="margin: 0 auto; border-top-color: #10b981;"></div>
          <p style="margin-top: 10px; font-size: 0.85rem;">Geny está analizando tus respuestas...</p>
        </div>

        <div id="geny-result-container" style="display:none; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 0.9rem;">MI MAPA DE BRECHA</h4>
          <textarea id="field-day8-brecha" class="form-textarea" rows="5" style="border: none; background: transparent; padding: 0; box-shadow: none; font-size: 0.95rem; line-height: 1.5; color: #f8fafc;" readonly required></textarea>
        </div>
      </div>
    `"""

pattern = r"    renderMission: \(\) => `\n      <div style=\"text-align: center; margin: 16px 0;\">.*?</span>\n      </label>\n    `"

content_new = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('app_v3.js', 'w') as f:
    f.write(content_new)

print("HTML Replaced!")

