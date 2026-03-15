#!/bin/bash
set -e

echo "=========================================="
echo "🏀 FIBA Stats System - Windows Build Script"
echo "=========================================="

# 1. Build Frontend
echo "[1/3] Construyendo Frontend (Vite)..."
cd frontend
npm install
npm run build
cd ..

# 2. Build Backend (.exe)
echo "[2/3] Construyendo Backend para Windows (.exe) a través de Docker..."
cd backend
# Limpiar builds anteriores
rm -rf build/ dist/
# Usar imagen con Python 3.11 y Wine
sudo docker run --rm -v "$(pwd):/src/" cdrx/pyinstaller-windows:python3 bash -c "python -m pip install --upgrade pip && pip install setuptools wheel && pip install -r requirements.txt && pyinstaller backend.spec"
cd ..

# 3. Build Electron (.exe portable)
echo "[3/3] Empaquetando la aplicación final (.exe portátil)..."
# Ejecutamos electron-builder usando una imagen oficial con Wine
sudo docker run --rm -v "$(pwd):/project" -w /project/electron electronuserland/builder:wine /bin/bash -c "\
    npm install && \
    npx electron-builder --win portable \
"

echo "=========================================="
echo "✅ ¡Construcción Finalizada!"
echo "Tu archivo ejecutable está en la carpeta: electron/dist/"
echo "Busca el archivo que termina en .exe y cópialo a tu USB."
echo "=========================================="
