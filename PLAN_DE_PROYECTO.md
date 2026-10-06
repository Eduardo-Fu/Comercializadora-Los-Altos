# 📋 PLAN DE PROYECTO: SISTEMA WEB DE CONTROL DE INVENTARIOS Y COLOCACIÓN
**Cliente / Empresa:** Comercializadora Los Altos  
**Tipo de Aplicación:** Aplicación Web Integral 100% Responsive (Desktop, Tablet y Smartphone)  
**Repositorio GitHub:** `https://github.com/Eduardo-Fu/Losaltosproto.git` (Rama principal: `main`)  
**Objetivo:** Digitalizar y optimizar el control de inventarios, colocación de productos, gestión de mermas/mal estado, fechas de vencimiento y reportería analítica en supermercados independientes a través de una plataforma web moderna, rápida y accesible desde cualquier navegador.

---

## 🛠️ Stack Tecnológico Implementado

| Capa | Tecnología Seleccionada | Detalle / Justificación |
| :--- | :--- | :--- |
| **Control de Versiones** | **Git + GitHub Repository** (`origin/main`) | Flujo continuo con commits descriptivos en cada hito y sincronización automática. |
| **Frontend & UI (Web)** | **Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Lucide Icons** | Arquitectura web moderna, diseño **100% Web Responsive** adaptable a desktop, laptops, tablets y celulares. |
| **Backend & API** | **Next.js Route Handlers + Prisma ORM 5** | Tipado seguro de extremo a extremo, endpoints REST con validación mediante Zod y JWT. |
| **Base de Datos** | **PostgreSQL 16** | Modelo relacional robusto con relaciones para multiusuarios, tiendas, inventarios y mermas. |
| **Seguridad & RBAC** | **JWT con jose + bcryptjs + Middleware Web** | Protección de rutas por roles (`ADMIN`, `COLOCADORA`, `EMPRESA`) y aislamiento de datos por cliente. |
| **Almacenamiento de Imágenes** | **Storage Adapter (Local / Servidor + Cloudinary Ready)** | Carga optimizada de fotos de catálogo y evidencias de productos en mal estado vía `/api/upload`. |
| **Contenedores & Despliegue** | **Docker & Docker Compose + Nginx + Multi-stage Dockerfile** | Configuración lista para despliegue productivo en Ubuntu Server con `.env`. |

---

## 📊 Estado Actual del Proyecto y Control de Fases

> **Instrucciones para otros chats / sesiones:**  
> Al iniciar una nueva conversación, comparte este archivo `.md`. El asistente debe leer la sección **"Estado de Fases"** y continuar exactamente en la fase activa marcada como `[EN PROGRESO]`.

### Matriz de Progreso
- [x] **Fase 0: Conexión Git, Arquitectura Base Web, Modelo de Datos y Docker** `[COMPLETADA]`
- [x] **Fase 1: Módulo Web Administrativo (Gestión de Entidades y Accesos)** `[COMPLETADA]`
- [x] **Fase 2: Módulo Web de Colocadoras (Operaciones en Tienda - Responsive)** `[COMPLETADA]`
- [x] **Fase 3: Módulo Web de Inventarios y Sugeridos (Admin)** `[COMPLETADA]`
- [x] **Fase 4: Módulo Web de Reportería Analítica y Portal para Empresas** `[COMPLETADA]`
- [x] **Fase 5: Dockerización para Producción, Seguridad y Despliegue Ubuntu** `[COMPLETADA]`

---

## 🧪 Pruebas de Verificación para Declarar Fases Finalizadas

Cada fase incluye una suite de pruebas obligatorias ejecutadas con `npm test`:

### ✅ Pruebas de Fase 0 (10/10 superadas):
1. **Compilación de Producción:** Next.js build sin errores de tipos TypeScript.
2. **Validación de Esquema Prisma:** Validación de integridad referencial.
3. **Autenticación & Seguridad:** Bcrypt hashing y generación/verificación JWT RBAC.

### ✅ Pruebas de Fase 1 (12/12 superadas):
1. **Validación Numérica de DPI:** Acepta solo dígitos (mínimo 10), rechaza letras y guiones.
2. **Contratación de Colocadoras:** Valida DPI, tiendas asignadas requeridas, email y password.
3. **Proceso de Baja con Motivo:** Exige motivo descriptivo obligatorio (mín. 5 caracteres) y desactiva login.
4. **Catálogo de Productos:** Valida Código U, código de barras, empresa y foto.
5. **Empresas y Supermercados:** Creación y listado de entidades con relaciones.
6. **Subida de Archivos:** Endpoint `/api/upload` con validación de tipos MIME (JPG, PNG, WebP).

### ✅ Pruebas de Fase 2 (14/14 superadas):
1. **Reglas Numéricas Estrictas de Inventario (PDF):** Bloqueo de letras, prohibición estricta de `"00"` y ceros redundantes, enteros $\ge 0$.
2. **Reporte de Mermas / Mal Estado:** Evidencia fotográfica obligatoria y descripción manual de lo sucedido.
3. **Control de Vencimientos:** Fecha de vencimiento obligatoria y cantidad positiva ($\ge 1$).

### ✅ Pruebas de Fase 3 (9/9 superadas):
1. **Pedidos Sugeridos (Reabastecimiento):** Valida datos completos y cantidad sugerida $> 0$.
2. **Inventario Administrativo Global:** Valida registro con asignación flexible de colocadora y lista de productos.
3. **Semáforo de Vencimientos:** Categorización precisa de lotes en `vencido`, `por_vencer` y `vigente`.

### ✅ Pruebas de Fase 4 (11/11 superadas):
1. **Aislamiento Estricto de Datos (Multi-Tenant):** Filtro por `empresaId` que garantiza que una empresa jamás visualice datos o productos de otra.
2. **Exportador a CSV / Excel:** Formato de encabezados, columnas y escape de comas verificado.
3. **Clasificación de Rotación de Productos:** Clasificación exacta en ALTA ($\ge 30$), MEDIA y BAJA ($\le 10$).
4. **Semáforo de Caducidad:** Validación de cálculo de días restantes y estados `VENCIDO`, `POR_VENCER` y `VIGENTE`.

### ✅ Pruebas de Fase 5 (11/11 superadas):
1. **Docker Compose de Producción:** Configuración y persistencia de datos validada (`docker-compose.prod.yml`).
2. **Nginx Reverse Proxy:** Reglas de ruteo, compresión y cabeceras de seguridad verificadas (`nginx/default.conf`).
3. **Script de Respaldos:** Generación de copias comprimidas con `pg_dump` y rotación (`scripts/backup.sh`).
4. **Manual de Despliegue:** Documentación integral para instalación en Ubuntu Server (`DEPLOYMENT.md`).

**Resultado Global Acumulado:** **67 pruebas ejecutadas, 67 superadas (0 fallos).**

---

## 🚀 Desglose Detallado de Fases

---

### 🔹 FASE 0: Conexión Git, Arquitectura Base Web, Modelo de Datos y Docker `[COMPLETADA]`
- [x] Conexión al repositorio remoto `https://github.com/Eduardo-Fu/Losaltosproto.git` (rama `main`).
- [x] Creación de configuración base, `.gitignore`, `docker-compose.yml` y `Dockerfile`.
- [x] Esquema relacional en Prisma (`prisma/schema.prisma`) y seed (`prisma/seed.ts`).
- [x] Autenticación JWT y middleware RBAC (`src/middleware.ts`).
- [x] Pruebas automatizadas Fase 0 (10/10 pasadas).

---

### 🔹 FASE 1: Módulo Web Administrativo (Gestión de Entidades y Catálogos) `[COMPLETADA]`
- [x] Sidebar administrativo responsive con soporte móvil (`src/components/AdminSidebar.tsx`).
- [x] Dashboard administrativo interactivo con estadísticas en tiempo real (`/admin`, `/api/admin/stats`).
- [x] CRUD de Empresas con habilitación de cuentas de portal de clientes (`/admin/empresas`, `/api/admin/empresas`).
- [x] CRUD de Tiendas / Supermercados independientes (`/admin/tiendas`, `/api/admin/tiendas`).
- [x] Catálogo de Productos con subida de fotos, Código U, Código de barras y filtro por empresa (`/admin/productos`, `/api/admin/productos`, `/api/upload`).
- [x] Módulo de Colocadoras con nueva contratación con DPI, asignación de tiendas y bajas con motivo (`/admin/colocadoras`).
- [x] Pruebas automatizadas Fase 1 (12/12 pasadas).

---

### 🔹 FASE 2: Módulo Web de Colocadoras (Operaciones en Tienda - Responsive) `[COMPLETADA]`
- [x] Menú Principal de Colocadoras con indicador de tiendas asignadas (`/colocadora`).
- [x] Formulario de toma de inventario físico con reglas de validación estrictas (enteros $\ge 0$, sin letras, bloqueo de `"00"`) y confirmación previa (`/colocadora/inventario`, `/api/colocadora/inventario`).
- [x] Consulta de historial de inventarios enviados con desglose de productos (`/colocadora/historial`, `/api/colocadora/historial`).
- [x] Reporte de productos en mal estado con captura de cámara y descripción (`/colocadora/mal-estado`, `/api/colocadora/mal-estado`).
- [x] Registro de fechas de vencimiento de productos (`/colocadora/vencimientos`, `/api/colocadora/vencimientos`).
- [x] Pruebas automatizadas Fase 2 (14/14 pasadas).

---

### 🔹 FASE 3: Módulo Web de Inventarios y Sugeridos (Administrador) `[COMPLETADA]`
- [x] Registro y supervisión de inventarios globales con selector libre (`/admin/inventario`, `/api/admin/inventario`).
- [x] Registro y gestión de pedidos sugeridos por tienda, empresa y producto (`/admin/sugeridos`, `/api/admin/sugeridos`).
- [x] Panel web de auditoría de productos dañados / mermas con visor Lightbox de fotos (`/admin/mermas`, `/api/admin/mermas`).
- [x] Panel de control de lotes y fechas de vencimiento con semáforo inteligente (`/admin/vencimientos`, `/api/admin/vencimientos`).
- [x] Organización del menú lateral en Catálogos & Personal y Operaciones & Inventarios (`src/components/AdminSidebar.tsx`).
- [x] Pruebas automatizadas Fase 3 (9/9 pasadas).

---

### 🔹 FASE 4: Módulo Web de Reportería Analítica y Portal para Empresas `[COMPLETADA]`
- [x] **Portal Exclusivo para Empresas (`src/app/empresa/page.tsx`, `src/app/empresa/layout.tsx`):** Aislamiento total de datos mediante `user.empresaId`.
- [x] **Reporte 1: Existencia Actual en Góndola (`src/app/empresa/existencias/page.tsx`, `/api/empresa/reportes/existencias`):** Exportación a CSV / Excel y Vista Imprimible en PDF.
- [x] **Reporte 2: Comportamiento y Rotación de Productos (`src/app/empresa/comportamiento/page.tsx`, `/api/empresa/reportes/comportamiento`):** Alta, Media y Baja rotación con gráficas.
- [x] **Reporte 3: Mal Estado y Mermas (`src/app/empresa/mermas/page.tsx`, `/api/empresa/reportes/mermas`):** Galería fotográfica con visor Lightbox.
- [x] **Reporte 4: Historial de Pedidos Sugeridos (`src/app/empresa/sugeridos/page.tsx`, `/api/empresa/reportes/sugeridos`):** Historial de sugeridos de compra y reposición.
- [x] **Reporte 5: Semáforo de Fechas de Vencimiento (`src/app/empresa/vencimientos/page.tsx`, `/api/empresa/reportes/vencimientos`):** Alertas de caducidad por lote.
- [x] Pruebas automatizadas Fase 4 (11/11 pasadas).

---

### 🔹 FASE 5: Dockerización para Producción, Seguridad y Despliegue en Ubuntu `[COMPLETADA]`
- [x] **Dockerfile multi-stage** optimizado para Next.js con entrypoint de auto-migración y seed (`docker-entrypoint.sh`).
- [x] **Docker Compose de Producción (`docker-compose.prod.yml`):** Orquestación de PostgreSQL, Next.js y Nginx con volúmenes persistentes y redes aisladas.
- [x] **Nginx Reverse Proxy (`nginx/default.conf`):** Redirección de tráfico, compresión de estáticos, cabeceras de seguridad y límites de subida para fotos.
- [x] **Script de Respaldos Automáticos (`scripts/backup.sh`):** Copias de seguridad diarias comprimidas con `pg_dump` y política de retención de 14 días.
- [x] **Manual de Despliegue en Ubuntu ([`DEPLOYMENT.md`](file:///c:/Users/Pc/Documents/LosAltos/DEPLOYMENT.md)):** Guía completa desde la instalación de paquetes hasta SSL con Certbot y Crontab.
- [x] Pruebas automatizadas Fase 5 (11/11 pasadas).

---

## 🔄 Protocolo para Pasar de Fase y Uso en Otros Chats

Cuando concluyas una fase o cambies de chat:
1. Abre el archivo `PLAN_DE_PROYECTO.md`.
2. Marca las tareas completadas `[X]` de la fase terminada.
3. Cambia el estado de la fase a `[COMPLETADA]` y la siguiente a `[EN PROGRESO]`.
4. Realiza commit y push a GitHub (`git commit -m "docs: actualizar estado de fase"` y `git push origin main`).
5. Pega o comparte este archivo `PLAN_DE_PROYECTO.md` en el nuevo chat para que el asistente continúe sin perder contexto ni duplicar esfuerzos.
