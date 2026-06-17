#!/usr/bin/env python3
import requests
import json
import sys
import os
import random
from datetime import datetime

# Configuración de Infraestructura Local
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT_SEGUNDOS = 180
MODELO_INFERENCIA = "gemma2:2b" 

PATH_NVI_JSON = "./NVI.json"
PATH_OUTPUT_HTML = "./index.html"

def obtener_versiculo_dinamico(path_json):
    fallback_cita = "Hechos 10:34"
    fallback_texto = "Entonces Pedro, abriendo la boca, dijo: En verdad comprendo que Dios no hace acepción de personas;"

    if not os.path.exists(path_json):
        print(f"[WARN] Archivo {path_json} no encontrado. Usando fallback.", file=sys.stderr)
        return fallback_cita, fallback_texto

    try:
        with open(path_json, 'r', encoding='utf-8') as f:
            base_datos = json.load(f)
        books = base_datos.get("books", [])
        if not books: return fallback_cita, fallback_texto
        
        libro_elegido = random.choice(books)
        nombre_libro = libro_elegido.get("name", "Libro")
        chapters = libro_elegido.get("chapters", [])
        if not chapters: return fallback_cita, fallback_texto
        
        capitulo_elegido = random.choice(chapters)
        cita_humana_base = capitulo_elegido.get("current", {}).get("human", nombre_libro)
        items = capitulo_elegido.get("items", [])
        versiculos_validos = [i for i in items if i.get("type") == "verse" and i.get("verse_numbers")]
        
        if not versiculos_validos: return fallback_cita, fallback_texto
        
        versiculo_elegido = random.choice(versiculos_validos)
        num_versiculo = versiculo_elegido.get("verse_numbers")[0]
        lineas_texto = versiculo_elegido.get("lines", [])
        
        return f"{cita_humana_base}:{num_versiculo}", " ".join(lineas_texto).strip()
    except Exception as e:
        print(f"[ERROR DATA] Fallo al leer NVI.json: {e}", file=sys.stderr)
        return fallback_cita, fallback_texto

def invocar_inferencia(prompt_target):
    payload = {
        "model": MODELO_INFERENCIA,
        "prompt": prompt_target,
        "stream": False,
        "options": {
            "temperature": 0.5,
            "top_p": 0.85,
            "num_predict": 512
        }
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, headers=HEADERS, timeout=TIMEOUT_SEGUNDOS)
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except Exception as e:
        print(f"[ERROR MODELO] Error en Ollama: {e}", file=sys.stderr)
        return ""

def generar_devocional_completo(cita, texto_biblico):
    prompt_reflexion = (
        f"Actúa como un pastor evangélico de gran elocuencia, con el estilo apasionado, "
        f"emotivo y dinámico de predicadores como Dante Gebel, Jimmy Swaggart o Marcos Witt. "
        f"partiendo del principio general de: [{cita} - {texto_biblico}]. "
        f"Estructura: escribe una reflexion extensa de minimo de 3 párrafos amplios. Comienza directo con el mensaje para ella."
        f"Enfoque: Resalta la sabiduría de sus años, el valor de su vida y la paz que solo Dios da. "
        f"Usa un tono inspirador, cercano y directo al corazón; incorpora modismos y conectores de este "
        f"tipo de oratoria como 'Querido amigo', '¡Mire esto!', 'El Señor te dice hoy', o 'Aleluya'. "
        f"Usa frases como 'Querida Anita', 'El Señor te abraza hoy', o 'Anita, recuerda que...'. "
        f"Tono: Dulce, pausado, lleno de esperanza y ternura. "
        f"Aplica este principio hacia la responsabilidad de honrar, valorar y acompañar a los "
        f"adultos mayores en la comunidad actual. Haz una transición pastoral coherente, "
        f"evitando declarar que el versículo habla explícitamente de ancianos si el contexto no lo amerita. "
        f"Comienza directo con la meditación, sin preámbulos ni saludos."
        f"Usa un lenguaje claro, cálido y fácil de seguir, adecuado para una persona de 80 años. "
        f"El mensaje es exclusivamente para Anita, una mujer de más de 80 años. "
    )
    reflexion = invocar_inferencia(prompt_reflexion)
    
    prompt_oracion = (
        f"Actúa como un pastor evangélico guando a su congregación en un momento de oración ferviente y adoración. "
        f"Escribe una oración de fe emotiva, solemne y extensa en primera persona del singular (yo), "
        f"derivada de la siguiente reflexión: [{reflexion[:400]}]. "
        f"Emplea un lenguaje de profunda reverencia, pasión y entrega (usa términos como 'Padre celestial', "
        f"'Señor Jesús', 'Declaramos tu gracia', 'Ministramos a tu pueblo'). Pide sabiduría y discernimiento para "
        f"servir de manera práctica, orar por los enfermos, sin asumir que el orante es una persona mayor. "
        f"Comienza directo con la oración, omitiendo textos aclaratorios o introducciones."
    )
    oracion = invocar_inferencia(prompt_oracion) if reflexion else ""
    
    if not reflexion:
        reflexion = "Que la gracia y la paz del Señor estén con ustedes en este día."
        oracion = "Amén."
        
    return reflexion, oracion

def formatear_html_parrafos(texto):
    if not texto: return ""
    parrafos = [p.strip() for p in texto.split("\n") if p.strip()]
    return "".join(f'<p style="margin-bottom: 0.8rem;">{p}</p>' for p in parrafos)

def construir_html_estatico(cita, texto, reflexion, oracion):
    anio_actual = datetime.now().year
    
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Devocional del día</title>
  <link rel="stylesheet" href="styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    /* Estilos de la sección del Lector en Pantalla */
    .lector-section {{
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 1.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }}
    .controles-biblia {{
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-end;
        border-bottom: 1px solid #edf2f7;
        padding-bottom: 1.25rem;
        margin-bottom: 1.25rem;
    }}
    .control-grupo {{
        flex: 1;
        min-width: 150px;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }}
    .control-label {{
        font-family: 'Open Sans', sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        color: #4a5568;
    }}
    .control-select {{
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #cbd5e0;
        border-radius: 4px;
        background-color: #fff;
        font-family: 'Open Sans', sans-serif;
        color: #2d3748;
    }}
    .btn-leer {{
        padding: 0.55rem 1.5rem;
        background-color: #2b6cb0;
        color: white;
        border: none;
        border-radius: 4px;
        font-family: 'Open Sans', sans-serif;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
        height: 38px;
    }}
    .btn-leer:hover {{ background-color: #2c5282; }}

    /* Botón de Impresión Estilizado */
    .btn-print {{
        background-color: #27ae60;
        color: #ffffff;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Open Sans', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 4px rgba(39, 174, 96, 0.2);
        transition: background-color 0.2s, transform 0.1s;
    }}
    .btn-print:hover {{
        background-color: #219653;
        transform: translateY(-1px);
    }}
    .btn-print:active {{
        transform: translateY(0);
    }}
    
    /* CONTROL AGRESIVO DE CONFIGURACIÓN PARA UNA SOLA HOJA A4 (IMPRESIÓN) */
    @media print {{
        @page {{
            size: A4;
            margin: 10mm 12mm 10mm 12mm; /* Reducción de márgenes físicos de página */
        }}
        .no-print, .site-header, .site-footer, .divisor, .controles-biblia, .accesibilidad, .btn-print {{
            display: none !important;
        }}
        body {{
            background: white !important;
            color: #000000 !important;
            font-size: 10pt !important; /* Tipografía base compacta */
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0 !important;
        }}
        .devocional-wrapper {{
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }}
        .devocional-header {{
            margin-bottom: 0.8rem !important;
            padding-bottom: 0.5rem !important;
            border-bottom: 1px solid #ddd !important;
        }}
        .versiculo-titulo {{
            font-size: 14pt !important;
            margin-bottom: 0.2rem !important;
        }}
        .versiculo-texto {{
            font-size: 10.5pt !important;
            line-height: 1.3 !important;
        }}
        .devocional-body {{
            margin-bottom: 1rem !important;
        }}
        .devocional-body h3, .devocional-footer h3 {{
            font-size: 11pt !important;
            margin-top: 0.4rem !important;
            margin-bottom: 0.3rem !important;
        }}
        .texto-reflexion p {{
            font-size: 10pt !important;
            line-height: 1.4 !important;
            margin-bottom: 0.6rem !important;
        }}
        .devocional-footer {{
            background-color: #fafafa !important;
            border-left: 3px solid #3498db !important;
            padding: 0.8rem !important;
            border-radius: 4px !important;
            page-break-inside: avoid; /* Evita que la oración se rompa a la mitad */
        }}
        .texto-oracion p {{
            font-size: 10pt !important;
            line-height: 1.4 !important;
            margin-bottom: 0.4rem !important;
        }}
    }}
  </style>
</head>
<body>

  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <div class="logo-area">
        <span class="logo-cross">✝</span>
        <div>
          <h1 class="site-title">Devocional del día</h1>
          <p class="site-subtitle">Palabra de Dios para cada día</p>
        </div>
      </div>
      <div class="accesibilidad">
        <button class="btn-acc" id="btnMayor" title="Aumentar letra">A+</button>
        <button class="btn-acc" id="btnMenor" title="Reducir letra">A−</button>
        <button class="btn-acc" id="btnContraste" title="Alto contraste">◐</button>
      </div>
    </div>
  </header>

  <main class="site-main">

    <section class="devocional-wrapper" aria-label="Devocional del día">
      <div id="devocional" class="devocional-contenido">
        
        <div class="devocional-header" style="margin-bottom: 1.5rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div style="flex: 1; min-width: 280px;">
                <h2 class="versiculo-titulo" style="font-family: 'Lora', Georgia, serif; color: #2c3e50; font-size: 1.8rem; margin: 0 0 0.5rem 0;">
                    {cita}
                </h2>
                <p class="versiculo-texto" style="font-family: 'Lora', Georgia, serif; font-style: italic; color: #7f8c8d; font-size: 1.2rem; line-height: 1.6; margin: 0;">
                    "{texto}"
                </p>
            </div>
            <button class="btn-print no-print" onclick="window.print();">
                🖨️ Imprimir Devocional
            </button>
        </div>
        
        <div class="devocional-body" style="margin-bottom: 2rem;">
            <h3 style="font-family: 'Open Sans', sans-serif; color: #34495e; font-size: 1.3rem; margin-top: 0;">Reflexión Pastoral</h3>
            <div class="texto-reflexion" id="textoReflexion" style="font-family: 'Open Sans', sans-serif; font-size: 1.05rem; line-height: 1.8; color: #2c3e50;">
                {formatear_html_parrafos(reflexion)}
            </div>
        </div>
        
        <div class="devocional-footer" style="background-color: #fcfcfc; border-left: 4px solid #3498db; padding: 1.5rem; border-radius: 4px;">
            <h3 style="font-family: 'Open Sans', sans-serif; color: #2980b9; font-size: 1.3rem; margin-top: 0;">Oración de Fe</h3>
            <div class="texto-oracion" id="textoOracion" style="font-family: 'Lora', Georgia, serif; font-size: 1.1rem; line-height: 1.8; color: #2c3e50; font-style: italic;">
                {formatear_html_parrafos(oracion)}
            </div>
        </div>

      </div>
    </section>

    <div class="divisor no-print">
      <span>📖 Leer la Biblia</span>
    </div>

    <section class="lector-section no-print" aria-label="Lector de la Biblia">
      <div class="controles-biblia">
        <div class="control-grupo">
          <label class="control-label" for="selVersion">Versión</label>
          <select id="selVersion" class="control-select">
            <option value="nvi">Nueva Versión Internacional (NVI)</option>
          </select>
        </div>
        <div class="control-grupo">
          <label class="control-label" for="selLibro">Libro</label>
          <select id="selLibro" class="control-select">
             <option value="">Cargando libros...</option>
          </select>
        </div>
        <div class="control-grupo">
          <label class="control-label" for="selCapitulo">Capítulo</label>
          <select id="selCapitulo" class="control-select">
             <option value="">--</option>
          </select>
        </div>
        <button id="btnLeer" class="btn-leer">Leer capítulo</button>
      </div>
      
      <div id="areaTexto" class="area-texto">
        <p class="texto-inicio" style="margin: 0; padding: 0.5rem 0;">Seleccione un libro y capítulo para comenzar a leer.</p>
      </div>
    </section>

  </main>

  <footer class="site-footer" id="siteFooter">
    <div class="footer-inner">
      <p class="footer-frase">Sitio creado para la familia · {anio_actual}</p>
    </div>
  </footer>

  <script src="js/biblia.js"></script>
</body>
</html>"""
    
    with open(PATH_OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html_content.strip())
    print(f"[OK] index.html estático generado con éxito.")

if __name__ == "__main__":
    cita_input, texto_input = obtener_versiculo_dinamico(PATH_NVI_JSON)
    ref_raw, ora_raw = generar_devocional_completo(cita_input, texto_input)
    construir_html_estatico(cita_input, texto_input, ref_raw, ora_raw)
