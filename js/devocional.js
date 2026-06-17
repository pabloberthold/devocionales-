/* ============================================
   MI BIBLIA DIARIA — js/devocional.js
   Generador de devocionales con Gemini API
   ============================================ */

const CLAVE_API    = 'bib_gemini_key';
const CLAVE_HOY    = 'bib_devocional_hoy';
const CLAVE_FECHA  = 'bib_devocional_fecha';

// Fecha de hoy como string YYYY-MM-DD
function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

// Fecha legible en español para mostrar
function fechaLegible() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ---- MODAL PARA PEDIR LA API KEY ----
function mostrarModalApiKey() {
  const overlay = document.createElement('div');
  overlay.id = 'modalApiKey';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-caja" role="dialog" aria-modal="true" aria-labelledby="modalTitulo">
      <button id="btnCerrarKey" class="modal-cerrar" aria-label="Cerrar">✕</button>
      <div class="modal-icono">🔑</div>
      <h2 class="modal-titulo" id="modalTitulo">Configurar clave de Google AI</h2>
      <p class="modal-texto">
        Para generar el devocional necesitamos una clave gratuita de Google AI Studio.
        Es fácil de obtener y no tiene costo.
      </p>
      <ol class="modal-pasos">
        <li>Ingresá a <strong>aistudio.google.com</strong></li>
        <li>Hacé clic en <strong>"Get API Key"</strong></li>
        <li>Copiá la clave y pegala aquí abajo</li>
      </ol>
      <label class="modal-label" for="inputApiKey">Tu clave de API:</label>
      <input
        type="password"
        id="inputApiKey"
        class="modal-input"
        placeholder="AIza..."
        autocomplete="off"
        spellcheck="false"
      />
      <p class="modal-nota">✓ La clave se guarda solo en este dispositivo, nunca se envía a ningún otro servidor.</p>
      <button id="btnGuardarKey" class="btn-modal-principal">Guardar y generar devocional</button>
      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="modal-link">
        Ir a Google AI Studio →
      </a>
    </div>
  `;
  document.body.appendChild(overlay);

  const input      = document.getElementById('inputApiKey');
  const btnGuardar = document.getElementById('btnGuardarKey');
  const btnCerrar  = document.getElementById('btnCerrarKey');

  // Cerrar con la X
  btnCerrar.addEventListener('click', () => overlay.remove());

  // Cerrar haciendo clic fuera del cuadro
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', function cerrarEsc(e) {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', cerrarEsc); }
  });

  input.focus();

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnGuardar.click();
  });

  btnGuardar.addEventListener('click', () => {
    const key = input.value.trim();
    if (!key || key.length < 20) {
      input.style.borderColor = '#c0392b';
      input.focus();
      return;
    }
    localStorage.setItem(CLAVE_API, key);
    overlay.remove();
    generarDevocional();
  });
}

// ---- PROMPT PARA GEMINI ----
function construirPrompt() {
  const fecha = fechaLegible();
  return `Eres un pastor cristiano evangélico con el corazón y la sabiduría de predicadores como Jimmy Swaggart, Dante Gebel y Marcos Witt. Escribe un devocional cristiano evangélico para una persona adulta mayor, para el día ${fecha}.

REGLAS DE ESCRITURA:
- Escribe con amor profundo, como si le hablaras a tu propia madre o abuela.
- Usa palabras sencillas y cotidianas. Nada complicado ni académico.
- Oraciones claras, no demasiado largas.
- Tono cálido, esperanzador y lleno de fe.
- Mensaje puramente cristiano evangélico: gracia, amor de Dios, salvación, esperanza, fidelidad de Dios.
- La reflexión debe ser extensa y profunda: mínimo 10 oraciones. Debe llenar media página impresa.
- Podés incluir una ilustración o ejemplo de la vida diaria que conecte con la experiencia de una persona mayor.
- Recordale al lector que Dios lo ama profundamente sin importar su edad ni sus errores pasados.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin bloques de código. Exactamente este formato:

{
  "versiculo": "Texto completo del versículo (Libro Capítulo:Versículo - RVR1960)",
  "reflexion": "Párrafo extenso de reflexión aquí. Mínimo 10 oraciones. Con amor, profundidad y mensaje evangélico claro.",
  "oracion": "Oración 1. Oración 2. Oración 3. Oración 4. Oración 5. Amén."
}

versiculo: un versículo poderoso de la Reina Valera 1960, con su referencia completa.
reflexion: mínimo 10 oraciones llenas de amor, esperanza y verdad evangélica. Incluí una ilustración de la vida cotidiana. Hablale directamente al lector con "usted" o "tú".
oracion: 5 oraciones en primera persona hablando con Dios, desde el corazón de una persona mayor.
Solo JSON. Nada más.`;
}

// ---- LLAMAR A GEMINI ----
async function llamarGemini(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: construirPrompt() }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    }
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    const msg = err?.error?.message || `Error ${resp.status}`;
    throw new Error(msg);
  }

  const data = await resp.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error('La respuesta de Gemini llegó vacía.');
  return texto;
}

// ---- PARSEAR RESPUESTA JSON ----
function parsearDevocional(texto) {
  const secciones = { versiculo: '', reflexion: '', oracion: '' };

  // Log siempre para diagnóstico
  console.log('=== TEXTO CRUDO DE GEMINI ===');
  console.log(texto);
  console.log('============================');

  try {
    // Limpiar bloques de código que Gemini agrega a veces aunque se le pida JSON
    const limpio = texto
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const json = JSON.parse(limpio);

    // Aceptar variantes con o sin tilde
    secciones.versiculo = (json.versiculo || json['versículo'] || json.versiculo_del_dia || json.versiculoDelDia || '').trim();
    secciones.reflexion = (json.reflexion || json['reflexión'] || '').trim();
    secciones.oracion   = (json.oracion   || json['oración']   || json.oracion_final || '').trim();

    console.log('Secciones parseadas:', secciones);
  } catch (e) {
    console.error('Error al parsear JSON:', e.message);
    console.error('Texto que falló:', texto);
  }

  return secciones;
}

// Convierte texto en párrafos HTML, dividiendo por punto final o salto de línea
function aParrafos(texto) {
  if (!texto) return '';
  // Si tiene saltos de línea, usarlos como separadores de párrafo
  if (texto.includes('\n')) {
    return texto.split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p class="dev-parrafo">${p}</p>`)
      .join('');
  }
  // Si es un bloque continuo, dividir cada 2-3 oraciones en párrafos
  const oraciones = texto.match(/[^.!?]+[.!?]+/g) || [texto];
  const parrafos = [];
  for (let i = 0; i < oraciones.length; i += 3) {
    const grupo = oraciones.slice(i, i + 3).join(' ').trim();
    if (grupo) parrafos.push(`<p class="dev-parrafo">${grupo}</p>`);
  }
  return parrafos.join('') || `<p class="dev-parrafo">${texto}</p>`;
}

// ---- RENDERIZAR DEVOCIONAL ----
function renderizarDevocional(texto) {
  const contenedor = document.getElementById('devocional');
  const secciones = parsearDevocional(texto);
  const fecha = fechaLegible();

  const fechaDisplay = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  contenedor.className = 'devocional-card';
  contenedor.innerHTML = `
    <div class="dev-header">
      <span class="dev-fecha">${fechaDisplay}</span>
      <h2 class="dev-titulo">Devocional del día</h2>
    </div>

    <div class="dev-versiculo">
      <span class="dev-etiqueta">✝ Versículo del día</span>
      <blockquote class="dev-cita">${secciones.versiculo || '...'}</blockquote>
    </div>

    <div class="dev-seccion">
      <span class="dev-etiqueta">📖 Reflexión</span>
      <div class="dev-reflexion-body">${aParrafos(secciones.reflexion)}</div>
    </div>

    <div class="dev-seccion dev-oracion-box">
      <span class="dev-etiqueta">🙏 Oración</span>
      <div class="dev-oracion-body">${aParrafos(secciones.oracion)}</div>
    </div>

    <div class="dev-acciones">
      <button id="btnImprimir" class="btn-imprimir" onclick="imprimirDevocional()">
        🖨️ Imprimir devocional
      </button>
      <button id="btnNuevo" class="btn-nuevo" onclick="regenerarDevocional()">
        🔄 Generar otro
      </button>
    </div>
  `;
}

// ---- RENDERIZAR ESTADO DE CARGA ----
function renderizarCargando() {
  const contenedor = document.getElementById('devocional');
  contenedor.className = 'devocional-cargando';
  contenedor.innerHTML = `
    <div class="cargando-inner">
      <div class="cargando-cruz">✝</div>
      <p class="cargando-texto">Preparando el devocional de hoy...</p>
      <div class="cargando-puntos">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
}

// ---- RENDERIZAR ERROR ----
function renderizarError(mensaje, esApiKey) {
  const contenedor = document.getElementById('devocional');
  contenedor.className = 'devocional-error';
  contenedor.innerHTML = `
    <div class="error-inner">
      <span class="error-icono">⚠️</span>
      <p class="error-texto">${mensaje}</p>
      <div class="error-botones">
        <button class="btn-imprimir" onclick="generarDevocional()">Intentar de nuevo</button>
        ${esApiKey ? `<button class="btn-nuevo" onclick="cambiarApiKey()">Cambiar clave API</button>` : ''}
      </div>
    </div>
  `;
}

// ---- GENERAR DEVOCIONAL ----
async function generarDevocional() {
  const apiKey = localStorage.getItem(CLAVE_API);

  // Si no hay clave, pedir
  if (!apiKey) {
    mostrarModalApiKey();
    return;
  }

  // Si ya hay devocional de hoy en caché, mostrarlo
  const fechaGuardada = localStorage.getItem(CLAVE_FECHA);
  const devGuardado   = localStorage.getItem(CLAVE_HOY);

  if (fechaGuardada === fechaHoy() && devGuardado) {
    renderizarDevocional(devGuardado);
    return;
  }

  // Generar nuevo
  renderizarCargando();

  try {
    const texto = await llamarGemini(apiKey);

    // Guardar en caché
    localStorage.setItem(CLAVE_HOY, texto);
    localStorage.setItem(CLAVE_FECHA, fechaHoy());

    renderizarDevocional(texto);

  } catch (err) {
    console.error('Error Gemini:', err);

    const esApiKey = err.message.toLowerCase().includes('api key') ||
                     err.message.toLowerCase().includes('401') ||
                     err.message.toLowerCase().includes('invalid');

    const msg = esApiKey
      ? 'La clave de API no es válida o venció. Por favor ingresá una nueva.'
      : `No se pudo generar el devocional. ${err.message}`;

    renderizarError(msg, esApiKey);
  }
}

// ---- FORZAR REGENERAR (borra caché) ----
function regenerarDevocional() {
  localStorage.removeItem(CLAVE_HOY);
  localStorage.removeItem(CLAVE_FECHA);
  generarDevocional();
}

// ---- CAMBIAR API KEY ----
function cambiarApiKey() {
  localStorage.removeItem(CLAVE_API);
  mostrarModalApiKey();
}

// ---- IMPRIMIR ----
function imprimirDevocional() {
  // Poner la fecha legible en el wrapper para que el pie de impresión la muestre
  const wrapper = document.querySelector('.devocional-wrapper');
  if (wrapper) {
    wrapper.setAttribute('data-fecha-impresion', fechaLegible());
  }
  window.print();
}

// ---- EXPONER FUNCIONES GLOBALES (usadas en onclick) ----
window.imprimirDevocional  = imprimirDevocional;
window.regenerarDevocional = regenerarDevocional;
window.cambiarApiKey       = cambiarApiKey;

// ---- ARRANCAR AL CARGAR LA PÁGINA ----
document.addEventListener('DOMContentLoaded', () => {
  // Limpiar caché para forzar regeneración con el parser nuevo
  localStorage.removeItem('bib_devocional_hoy');
  localStorage.removeItem('bib_devocional_fecha');
  generarDevocional();
});
