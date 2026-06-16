/* ============================================
   MI BIBLIA DIARIA — js/biblia.js
   Lector bíblico con bible-api.com
   ============================================ */

// ---- LISTA DE LIBROS ----
const LIBROS = [
  // Antiguo Testamento
  { nombre: "Génesis",        api: "genesis",        caps: 50 },
  { nombre: "Éxodo",          api: "exodus",         caps: 40 },
  { nombre: "Levítico",       api: "leviticus",      caps: 27 },
  { nombre: "Números",        api: "numbers",        caps: 36 },
  { nombre: "Deuteronomio",   api: "deuteronomy",    caps: 34 },
  { nombre: "Josué",          api: "joshua",         caps: 24 },
  { nombre: "Jueces",         api: "judges",         caps: 21 },
  { nombre: "Rut",            api: "ruth",           caps: 4  },
  { nombre: "1 Samuel",       api: "1+samuel",       caps: 31 },
  { nombre: "2 Samuel",       api: "2+samuel",       caps: 24 },
  { nombre: "1 Reyes",        api: "1+kings",        caps: 22 },
  { nombre: "2 Reyes",        api: "2+kings",        caps: 25 },
  { nombre: "1 Crónicas",     api: "1+chronicles",   caps: 29 },
  { nombre: "2 Crónicas",     api: "2+chronicles",   caps: 36 },
  { nombre: "Esdras",         api: "ezra",           caps: 10 },
  { nombre: "Nehemías",       api: "nehemiah",       caps: 13 },
  { nombre: "Ester",          api: "esther",         caps: 10 },
  { nombre: "Job",            api: "job",            caps: 42 },
  { nombre: "Salmos",         api: "psalms",         caps: 150 },
  { nombre: "Proverbios",     api: "proverbs",       caps: 31 },
  { nombre: "Eclesiastés",    api: "ecclesiastes",   caps: 12 },
  { nombre: "Cantares",       api: "song+of+solomon",caps: 8  },
  { nombre: "Isaías",         api: "isaiah",         caps: 66 },
  { nombre: "Jeremías",       api: "jeremiah",       caps: 52 },
  { nombre: "Lamentaciones",  api: "lamentations",   caps: 5  },
  { nombre: "Ezequiel",       api: "ezekiel",        caps: 48 },
  { nombre: "Daniel",         api: "daniel",         caps: 12 },
  { nombre: "Oseas",          api: "hosea",          caps: 14 },
  { nombre: "Joel",           api: "joel",           caps: 3  },
  { nombre: "Amós",           api: "amos",           caps: 9  },
  { nombre: "Abdías",         api: "obadiah",        caps: 1  },
  { nombre: "Jonás",          api: "jonah",          caps: 4  },
  { nombre: "Miqueas",        api: "micah",          caps: 7  },
  { nombre: "Nahúm",          api: "nahum",          caps: 3  },
  { nombre: "Habacuc",        api: "habakkuk",       caps: 3  },
  { nombre: "Sofonías",       api: "zephaniah",      caps: 3  },
  { nombre: "Hageo",          api: "haggai",         caps: 2  },
  { nombre: "Zacarías",       api: "zechariah",      caps: 14 },
  { nombre: "Malaquías",      api: "malachi",        caps: 4  },
  // Nuevo Testamento
  { nombre: "Mateo",          api: "matthew",        caps: 28 },
  { nombre: "Marcos",         api: "mark",           caps: 16 },
  { nombre: "Lucas",          api: "luke",           caps: 24 },
  { nombre: "Juan",           api: "john",           caps: 21 },
  { nombre: "Hechos",         api: "acts",           caps: 28 },
  { nombre: "Romanos",        api: "romans",         caps: 16 },
  { nombre: "1 Corintios",    api: "1+corinthians",  caps: 16 },
  { nombre: "2 Corintios",    api: "2+corinthians",  caps: 13 },
  { nombre: "Gálatas",        api: "galatians",      caps: 6  },
  { nombre: "Efesios",        api: "ephesians",      caps: 6  },
  { nombre: "Filipenses",     api: "philippians",    caps: 4  },
  { nombre: "Colosenses",     api: "colossians",     caps: 4  },
  { nombre: "1 Tesalonicenses", api: "1+thessalonians", caps: 5 },
  { nombre: "2 Tesalonicenses", api: "2+thessalonians", caps: 3 },
  { nombre: "1 Timoteo",      api: "1+timothy",      caps: 6  },
  { nombre: "2 Timoteo",      api: "2+timothy",      caps: 4  },
  { nombre: "Tito",           api: "titus",          caps: 3  },
  { nombre: "Filemón",        api: "philemon",       caps: 1  },
  { nombre: "Hebreos",        api: "hebrews",        caps: 13 },
  { nombre: "Santiago",       api: "james",          caps: 5  },
  { nombre: "1 Pedro",        api: "1+peter",        caps: 5  },
  { nombre: "2 Pedro",        api: "2+peter",        caps: 3  },
  { nombre: "1 Juan",         api: "1+john",         caps: 5  },
  { nombre: "2 Juan",         api: "2+john",         caps: 1  },
  { nombre: "3 Juan",         api: "3+john",         caps: 1  },
  { nombre: "Judas",          api: "jude",           caps: 1  },
  { nombre: "Apocalipsis",    api: "revelation",     caps: 22 },
];

// ---- ELEMENTOS DEL DOM ----
const selVersion  = document.getElementById('selVersion');
const selLibro    = document.getElementById('selLibro');
const selCapitulo = document.getElementById('selCapitulo');
const btnLeer     = document.getElementById('btnLeer');
const areaTexto   = document.getElementById('areaTexto');
const msgEstado   = document.getElementById('mensajeEstado');

// ---- INICIALIZAR SELECTORES ----
function inicializarLibros() {
  LIBROS.forEach((libro, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = libro.nombre;
    selLibro.appendChild(opt);
  });
  actualizarCapitulos();
}

function actualizarCapitulos() {
  const idx = parseInt(selLibro.value);
  const libro = LIBROS[idx];
  selCapitulo.innerHTML = '';
  for (let c = 1; c <= libro.caps; c++) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = `Capítulo ${c}`;
    selCapitulo.appendChild(opt);
  }
}

selLibro.addEventListener('change', actualizarCapitulos);

// ---- MOSTRAR / OCULTAR ESTADO ----
function mostrarEstado(texto, tipo) {
  msgEstado.textContent = texto;
  msgEstado.className = `mensaje-estado ${tipo}`;
  msgEstado.hidden = false;
}

function ocultarEstado() {
  msgEstado.hidden = true;
  msgEstado.className = 'mensaje-estado';
}

// ---- LLAMADA A LA API ----
async function leerCapitulo() {
  const idx      = parseInt(selLibro.value);
  const libro    = LIBROS[idx];
  const capitulo = selCapitulo.value;
  const version  = selVersion.value;

  // NVI no está disponible en bible-api.com — aviso amable
  if (version === 'nvi') {
    mostrarEstado(
      '⚠️ La versión NVI no está disponible en esta fuente gratuita. Se mostrará Reina Valera 1960. Para NVI se puede integrar otra fuente en una próxima actualización.',
      'error'
    );
    setTimeout(ocultarEstado, 5000);
  } else {
    ocultarEstado();
  }

  areaTexto.innerHTML = '';
  mostrarEstado('📖 Cargando el capítulo...', 'cargando');
  btnLeer.disabled = true;

  const url = `https://bible-api.com/${libro.api}+${capitulo}?translation=rvr1960`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error ${resp.status}`);
    const data = await resp.json();

    ocultarEstado();
    renderizarCapitulo(data, libro.nombre, capitulo);

  } catch (err) {
    mostrarEstado(
      '❌ No se pudo cargar el capítulo. Verifique su conexión a internet e intente de nuevo.',
      'error'
    );
    console.error('Error al cargar capítulo:', err);
  } finally {
    btnLeer.disabled = false;
  }
}

// ---- RENDERIZAR VERSÍCULOS ----
function renderizarCapitulo(data, nombreLibro, numCap) {
  const versiculos = data.verses || [];
  if (!versiculos.length) {
    areaTexto.innerHTML = '<p class="texto-inicio">No se encontraron versículos.</p>';
    return;
  }

  const titulo = document.createElement('p');
  titulo.className = 'titulo-capitulo';
  titulo.textContent = `${nombreLibro} — Capítulo ${numCap}`;
  areaTexto.appendChild(titulo);

  versiculos.forEach(v => {
    const div = document.createElement('div');
    div.className = 'versiculo';

    const num = document.createElement('span');
    num.className = 'num-versiculo';
    num.textContent = v.verse;

    const texto = document.createElement('span');
    texto.className = 'texto-versiculo';
    texto.textContent = v.text.trim();

    div.appendChild(num);
    div.appendChild(texto);
    areaTexto.appendChild(div);
  });

  // Scroll suave al texto
  areaTexto.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- BOTÓN LEER ----
btnLeer.addEventListener('click', leerCapitulo);

// También al presionar Enter en los selectores
[selLibro, selCapitulo, selVersion].forEach(sel => {
  sel.addEventListener('keydown', e => {
    if (e.key === 'Enter') leerCapitulo();
  });
});

// ---- ACCESIBILIDAD: TAMAÑO DE LETRA ----
const FS_MIN = 16, FS_MAX = 28, FS_STEP = 2;
let fsTamanio = parseInt(localStorage.getItem('bib_fs') || '19');

function aplicarTamanio() {
  document.documentElement.style.setProperty('--fs-base', fsTamanio + 'px');
  localStorage.setItem('bib_fs', fsTamanio);
}
aplicarTamanio();

document.getElementById('btnMayor').addEventListener('click', () => {
  if (fsTamanio < FS_MAX) { fsTamanio += FS_STEP; aplicarTamanio(); }
});
document.getElementById('btnMenor').addEventListener('click', () => {
  if (fsTamanio > FS_MIN) { fsTamanio -= FS_STEP; aplicarTamanio(); }
});

// ---- ACCESIBILIDAD: ALTO CONTRASTE ----
const contrastePref = localStorage.getItem('bib_contraste') === '1';
if (contrastePref) document.body.classList.add('alto-contraste');

document.getElementById('btnContraste').addEventListener('click', () => {
  document.body.classList.toggle('alto-contraste');
  const activo = document.body.classList.contains('alto-contraste');
  localStorage.setItem('bib_contraste', activo ? '1' : '0');
});

// ---- ARRANCAR ----
inicializarLibros();