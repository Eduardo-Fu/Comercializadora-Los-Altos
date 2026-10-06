#!/bin/bash

# ==============================================================================
# Script de Respaldo Automatizado de Base de Datos PostgreSQL
# Comercializadora Los Altos
# ==============================================================================

set -e

# Directorio de respaldos
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/losaltos_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Cargar variables del .env si existe
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

CONTAINER_NAME=${CONTAINER_NAME:-"losaltos_postgres"}
DB_USER=${POSTGRES_USER:-"postgres"}
DB_NAME=${POSTGRES_DB:-"losaltos_db"}

echo "📦 Iniciando respaldo de la base de datos ${DB_NAME} desde ${CONTAINER_NAME}..."

# Ejecutar pg_dump dentro del contenedor de PostgreSQL y comprimir con gzip
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "✅ Respaldo generado con éxito: ${BACKUP_FILE} ($(du -sh "${BACKUP_FILE}" | cut -f1))"

# Limpieza de respaldos antiguos (más de 14 días)
echo "🧹 Eliminando copias de seguridad de más de ${RETENTION_DAYS} días..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "🎉 Proceso de respaldo finalizado correctamente."
