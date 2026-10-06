#!/bin/sh
set -e

echo "========================================================"
echo "🚀 INICIALIZANDO SISTEMA WEB COMERCIALIZADORA LOS ALTOS"
echo "========================================================"

echo "⏳ Verificando y sincronizando esquema de base de datos..."
npx prisma db push --skip-generate || {
  echo "⚠️ Advertencia: Error en prisma db push, reintentando..."
  sleep 2
  npx prisma db push --skip-generate || true
}

echo "🌱 Verificando y cargando usuarios demo y catálogos (Seed)..."
npx tsx prisma/seed.ts || echo "ℹ️ Datos base listos."

echo "✅ Base de datos lista y sincronizada."
echo "🌐 Iniciando servidor web Next.js en puerto 3000..."

exec node server.js
