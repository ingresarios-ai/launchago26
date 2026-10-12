# 📋 Log de Estado del Proyecto — Método Ingresarios

**Fecha de última actualización**: 10 de octubre de 2026 — 14:15 COT  
**Entorno local activo**: `http://localhost:8889`  
**Página activa principal**: [`unirme.html`](unirme.html) / [`SALES PAGE/index.html`](SALES%20PAGE/index.html)

---

## 📌 Resumen Ejecutivo de la Sesión

En esta sesión se realizaron ajustes clave en la página de ventas principal (`unirme.html`, `index.html`) y en la versión clon standalone empaquetada (`SALES PAGE/index.html` y `SALES PAGE.zip`). Todos los cambios fueron validados en el navegador en tiempo real.

---

## ⚙️ Estado de las Configuraciones Implementadas

### 1. Contador de Urgencia (Countdown Timer)
- **Fecha y Hora de Cierre**: **Viernes 16 de octubre de 2026 a las 9:00 PM hora Colombia (UTC-5)**.
- **Configuración técnica**: `new Date("2026-10-16T21:00:00-05:00")`.
- **Archivos configurados**:
  - [`unirme.js`](unirme.js): se eliminó la lógica previa de evergreen en `localStorage` para asegurar que ningún usuario mantenga contadores desfasados en caché.
  - [`SALES PAGE/index.html`](SALES%20PAGE/index.html): script inline actualizado con la fecha exacta.
- **Estado de verificación**: Verificado en navegador (indica ~6 días restantes hasta el cierre).

---

### 2. Estructura de Precios y Lote
- **Lote Activo**: **Lote 1**
  - Badge del Hero: `"LOTE 1 LIBERADO"`.
  - Cinta de oferta en checkout: `"🔥 Lote 1 Activo"`.
  - Texto de urgencia: `"Descuento por Lote 1 vence pronto"`.
- **Precios fijados**:
  - **1 Pago**: **$1,397 USD** (con descuento de $500 USD aplicado sobre precio base de $1,897 USD).
  - **3 Pagos**: **$549 USD**.
  - **6 Pagos**: **$300 USD**.
- **Botón Sticky**: Actualizado con el texto `"Ir al Carrito — $1,397 USD"`.

---

### 3. Enlaces de Pago (Hotmart Checkout)
Se cambiaron todos los enlaces hacia el producto oficial `E107968243G`:
- **1 Pago ($1,397 USD)**:  
  `https://pay.hotmart.com/E107968243G?off=56xwg5sq&checkoutMode=10`
- **3 Pagos ($549 USD)**:  
  `https://pay.hotmart.com/E107968243G?off=iydgqe4p&checkoutMode=10`
- **6 Pagos ($300 USD)**:  
  `https://pay.hotmart.com/E107968243G?off=co83tj8h&checkoutMode=10`

---

### 4. Rutas de Recursos Multimedia (Vercel CDN)
Para evitar errores de rutas relativas o imágenes rotas en clon / local:
- Se reemplazaron todas las rutas locales por la URL absoluta de producción:  
  `https://taller.ingresarios.net/...`
- Activos incluidos:
  - Logotipo: `ingresarios-logo.webp`
  - Juan Fernando Villegas: `juan-villegas.png`
  - Doble Garantía: `doble-garantia.png`
  - Favicon: `favicon.svg`
  - Testimonios: `testimonials/testimonial-1.webp` a `testimonial-4.webp`

---

### 5. Sección de Preguntas Frecuentes (FAQ)
Se integró la nueva objeción referente al capital y riesgo de pérdida:
- **Pregunta**: *¿Qué pasa si tengo capital para invertir, pero me preocupa perderlo?*
- **Respuesta**:
  > *"Es una preocupación completamente válida. Precisamente por eso, en el Método Ingresarios conocerás la importancia de organizar tu capital, evaluar los riesgos y definir las condiciones de una operación antes de tomar decisiones.*  
  > *No necesitas comenzar invirtiendo dinero real. El objetivo es que primero comprendas el proceso, identifiques los riesgos y desarrolles criterios para decidir cuándo operar y cuándo es mejor no hacerlo."*

---

### 6. Paquete de Distribución Standalone
- Carpeta: [`SALES PAGE/`](SALES%20PAGE/)
- Archivo comprimido generado: [`SALES PAGE.zip`](SALES%20PAGE.zip)
  - Incluye: `index.html`, `styles.css` y `favicon.svg`.
  - Completamente sincronizado con la versión `unirme.html`.

---

## 🔒 Preservación de Reglas del Proyecto (AGENTS.md)
1. **Regla 3 (Inmunidad de Encuesta)**: `encuesta.js` no sufrió ninguna modificación. Sus flujos `try/catch` hacia Supabase y GoHighLevel permanecen íntegros y a prueba de fallos.
2. **Regla 4 (Horarios LATAM para copys)**:
   - 🇲🇽 México (CDMX): 7:00 PM
   - 🇨🇴 Colombia / Perú / Ecuador: 8:00 PM
   - 🇺🇸 Miami / 🇻🇪 Venezuela / 🇩🇴 Rep. Dominicana: 9:00 PM
   - 🇦🇷 Argentina / Chile / Uruguay: 10:00 PM

---

## 🚀 Estado Actual y Siguiente Paso
- **Todo listo y probado**: Las páginas están listas para captar tráfico y conversión para el Lote 1.
- **Servidor activo**: Puede visualizarse en cualquier momento en el puerto `8889`.
