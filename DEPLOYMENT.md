# 🚀 GUÍA DE DESPLIEGUE EN PRODUCCIÓN (UBUNTU SERVER)
**Sistema Web de Control de Inventarios y Colocación — Comercializadora Los Altos**  
**Repositorio GitHub:** `https://github.com/Eduardo-Fu/Losaltosproto.git`

Esta guía detalla el procedimiento paso a paso para desplegar y poner en marcha la aplicación web en un servidor limpio con **Ubuntu Server (22.04 LTS o 24.04 LTS)** utilizando Docker, Docker Compose, Nginx con SSL y PostgreSQL.

---

## 📋 1. Requisitos Previos del Servidor

* **Servidor:** Ubuntu 22.04 LTS o superior (AWS EC2, DigitalOcean Droplet, Linode, VPS o Servidor Local).
* **Especificaciones mínimas recomendadas:** 1 vCPU, 2 GB de Memoria RAM, 20 GB de disco SSD.
* **Puertos de Red Abiertos:** `80` (HTTP), `443` (HTTPS) y `22` (SSH).

---

## 🛠️ 2. Instalación de Docker y Git en Ubuntu

Conéctate a tu servidor mediante SSH y ejecuta:

```bash
# 1. Actualizar paquetes del sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias necesarias y Git
sudo apt install -y curl git ufw ca-certificates

# 3. Instalar Docker oficial
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Permitir ejecutar Docker sin sudo
sudo usermod -aG docker $USER
newgrp docker

# 5. Verificar instalación
docker --version
docker compose version
```

---

## 🐙 3. Clonar el Repositorio y Configurar Variables de Entorno

```bash
# 1. Clonar el repositorio en /var/www o tu directorio de preferencia
cd /var/www || cd ~
git clone https://github.com/Eduardo-Fu/Losaltosproto.git
cd Losaltosproto

# 2. Crear archivo de entorno de producción
cp .env.example .env

# 3. Editar las variables con tus credenciales seguras
nano .env
```

### Configuración requerida en el archivo `.env`:
```env
# Variables de Base de Datos PostgreSQL
POSTGRES_USER=losaltos_admin
POSTGRES_PASSWORD=TU_PASSWORD_SUPER_SEGURO_AQUI
POSTGRES_DB=losaltos_prod_db
POSTGRES_PORT=5432

# URL de Conexión (Para entorno local o runner)
DATABASE_URL="postgresql://losaltos_admin:TU_PASSWORD_SUPER_SEGURO_AQUI@postgres:5432/losaltos_prod_db?schema=public"

# Clave Secreta para JWT (Generar una cadena aleatoria larga)
JWT_SECRET=clave_secreta_de_al_menos_32_caracteres_aleatorios_1234567890

# URL Pública de la Aplicación
NEXT_PUBLIC_APP_URL="https://tudominio.com"

# Servicio de Imágenes (Opcional - Cloudinary)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

---

## 🐳 4. Construcción y Despliegue con Docker Compose

El sistema cuenta con un **mecanismo de auto-migración y seed automático**: al iniciar el contenedor por primera vez, creará automáticamente todas las tablas en PostgreSQL y los usuarios iniciales sin requerir comandos manuales.

```bash
# 1. Construir las imágenes de producción y levantar los servicios en segundo plano
docker compose -f docker-compose.prod.yml up -d --build

# 2. Verificar que los 3 contenedores (postgres, app, nginx) estén saludables y corriendo
docker compose -f docker-compose.prod.yml ps
```

---

## 🔒 5. Configurar Dominio y Certificado SSL Gratuito (Certbot / HTTPS)

Si tienes un dominio apuntando a la IP pública de tu servidor (ej. `app.comercializadoralosaltos.com`):

1. **Instalar Certbot en Ubuntu:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtener el certificado SSL:**
   ```bash
   sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com
   ```

3. **Renovación automática:**
   Certbot configura automáticamente un temporizador `systemd` para renovar el certificado antes de su expiración.

---

## 💾 6. Configuración de Copias de Seguridad Automáticas (Backups)

El sistema incluye el script [`scripts/backup.sh`](file:///c:/Users/Pc/Documents/LosAltos/scripts/backup.sh) que genera volcados comprimidos de PostgreSQL y elimina copias con más de 14 días de antigüedad.

```bash
# 1. Dar permisos de ejecución al script
chmod +x scripts/backup.sh

# 2. Programar una copia de seguridad diaria a las 02:00 AM mediante Crontab
crontab -e
```

Agrega la siguiente línea al final del archivo crontab:
```bash
0 2 * * * /bin/bash /var/www/Losaltosproto/scripts/backup.sh >> /var/log/losaltos_backup.log 2>&1
```

---

## 🔄 7. Comandos de Operación y Mantenimiento

* **Ver los registros en tiempo real:**
  ```bash
  docker compose -f docker-compose.prod.yml logs -f app
  ```
* **Reiniciar todos los servicios:**
  ```bash
  docker compose -f docker-compose.prod.yml restart
  ```
* **Detener la aplicación:**
  ```bash
  docker compose -f docker-compose.prod.yml down
  ```
* **Actualizar a la última versión de GitHub:**
  ```bash
  git pull origin main
  docker compose -f docker-compose.prod.yml up -d --build
  ```

---

## 👤 8. Credenciales de Acceso por Defecto

Una vez desplegado el sistema, ingresa a la URL de tu servidor:

| Rol | Correo Inicial | Contraseña | Portal |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@losaltos.com` | `admin123` | `/admin` |
| **Colocadora** | `colocadora@losaltos.com` | `colocadora123` | `/colocadora` |
| **Empresa (Irex)** | `irex@comercializadoralosaltos.com` | `empresa123` | `/empresa` |
