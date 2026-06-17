#!/bin/bash
# -------------------------------------------------------------------------
# Orquestador diario del Generador Estático de Devocionales
# -------------------------------------------------------------------------
set -e
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

BASE_DIR="/home/pablo/GIT/devocionales-"
cd "$BASE_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando pipeline estático..."

# 1. Ejecutar la inferencia y actualización del esqueleto HTML
python3 generate_static_site.py

# 2. Control de cambios estricto en Git
# Incluimos explícitamente el index, el directorio JS y la base de datos NVI.json
git add index.html js/biblia.js NVI.json

# Validar si efectivamente existen modificaciones antes de hacer commit (evita salidas con error 1)
if ! git diff --cached --quiet; then
    git commit -m "Automated update: $(date '+%Y-%m-%d')"
    git push origin main
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Despliegue empujado a GitHub Pages con éxito."
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sin cambios detectados en el entorno estático."
fi
