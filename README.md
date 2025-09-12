# 🏗️ Sistema de Certificación de Redes

Un sistema completo para la gestión y certificación de redes estructuradas, desarrollado con React (frontend) y Node.js/Express (backend) con PostgreSQL.

## 📋 Características

- ✅ **Gestión de Proyectos**: Crear y administrar proyectos de certificación
- ✅ **Certificación de Cables**: Registrar y certificar cables con parámetros técnicos
- ✅ **Reportes PDF**: Generar reportes profesionales de certificación
- ✅ **Importación CSV**: Cargar datos masivamente desde archivos CSV
- ✅ **Autenticación JWT**: Sistema seguro de login y roles
- ✅ **Dashboard**: Estadísticas y métricas en tiempo real
- ✅ **API REST**: Backend completo con documentación
- ✅ **Docker**: Configuración completa para desarrollo y producción

## 🚀 Inicio Rápido

### Prerrequisitos

- **Docker y Docker Compose** (recomendado)
- **Node.js 18+** y **npm** (para desarrollo local)
- **PostgreSQL 12+** (si no usas Docker)

### Opción 1: Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo-url>
   cd network-certification-system
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Iniciar servicios con Docker**
   ```bash
   # Desarrollo (con hot reload)
   docker-compose up

   # Producción
   docker-compose -f docker-compose.yml up -d
   ```

4. **Ejecutar migraciones y seed**
   ```bash
   # Ejecutar dentro del contenedor de backend
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

5. **Acceder a la aplicación**
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:3000
   - **pgAdmin**: http://localhost:5050 (admin@empresa.com / admin123)

### Opción 2: Desarrollo Local

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar PostgreSQL**
   ```sql
   CREATE DATABASE network_certification;
   CREATE USER postgres WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE network_certification TO postgres;
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones locales
   ```

4. **Ejecutar migraciones**
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo con hot reload
   npm run dev

   # Producción
   npm start
   ```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia el servidor en desarrollo con nodemon |
| `npm run migrate` | Ejecuta las migraciones de base de datos |
| `npm run migrate:rollback` | Revierte la última migración |
| `npm run seed` | Pobla la base de datos con datos de prueba |
| `npm run seed:clean` | Elimina todos los datos de prueba |
| `npm run lint` | Ejecuta ESLint para análisis de código |
| `npm run lint:fix` | Corrige automáticamente problemas de linting |
| `npm run test` | Ejecuta las pruebas unitarias |
| `docker-compose up` | Inicia todos los servicios con Docker |
| `docker-compose down` | Detiene todos los servicios |

## 🔐 Credenciales de Prueba

Después de ejecutar `npm run seed`, puedes usar estas credenciales:

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| admin | admin@empresa.com | admin123 | Administrador |
| fernando.forero | fernando.forero@empresa.com | ingeniero123 | Ingeniero |
| carlos.martinez | carlos.martinez@empresa.com | ingeniero123 | Ingeniero |
| ana.rodriguez | ana.rodriguez@empresa.com | viewer123 | Viewer |

## 📁 Estructura del Proyecto

```
network-certification-system/
├── backend-database-migration.js    # Migraciones de BD
├── backend-seed-data.js            # Datos de prueba
├── network-certification-backend.js # Servidor principal
├── network-certification-app.tsx    # Frontend React
├── package.json                     # Dependencias y scripts
├── Dockerfile                       # Configuración Docker
├── docker-compose.yml              # Servicios Docker
├── .env.example                    # Variables de entorno ejemplo
├── scripts/
│   └── init-db.sql                 # Inicialización BD Docker
├── uploads/                        # Archivos subidos
└── logs/                          # Logs de aplicación
```

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Base de datos
DB_HOST=localhost
DB_NAME=network_certification
DB_USER=postgres
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_256_bits_minimo

# Servidor
PORT=3000
NODE_ENV=development
```

### Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:

- **users**: Usuarios del sistema
- **projects**: Proyectos de certificación
- **cables**: Cables certificados
- **audit_logs**: Logs de auditoría

## 🐳 Docker

### Servicios Incluidos

- **postgres**: Base de datos PostgreSQL
- **backend**: API REST Node.js
- **pgadmin**: Interfaz web para PostgreSQL (desarrollo)

### Comandos Útiles

```bash
# Ver logs
docker-compose logs backend
docker-compose logs postgres

# Ejecutar comandos en contenedores
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d network_certification

# Reiniciar servicios
docker-compose restart backend

# Limpiar todo
docker-compose down -v
```

## 📊 API Documentation

La documentación completa de la API está disponible en:
- **Archivo**: `backend-api-documentation.md`
- **Swagger UI**: http://localhost:3000/api/docs (cuando esté implementado)

### Endpoints Principales

- `POST /api/auth/login` - Autenticación
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `POST /api/projects/:id/cables` - Agregar cable
- `GET /api/projects/:id/report/pdf` - Generar reporte PDF
- `GET /api/dashboard` - Dashboard con estadísticas

## 🧪 Testing

```bash
# Ejecutar pruebas
npm test

# Con coverage
npm run test:coverage

# Pruebas en modo watch
npm run test:watch
```

## 🚀 Deployment

### Producción con Docker

1. **Configurar variables de producción**
   ```bash
   export NODE_ENV=production
   export DB_PASSWORD=tu_password_produccion
   export JWT_SECRET=tu_jwt_secret_produccion
   ```

2. **Construir y desplegar**
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

3. **Configurar nginx (opcional)**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Variables de Producción

```env
NODE_ENV=production
DB_HOST=tu-host-produccion
DB_SSL=true
JWT_SECRET=tu_jwt_secret_muy_seguro
CORS_ORIGIN=https://tu-dominio.com
```

## 🔍 Monitoreo

### Health Checks

- **API Health**: `GET /api/health`
- **Database**: Verificado automáticamente por Docker
- **Logs**: Disponibles en `./logs/app.log`

### Métricas

- Número total de proyectos
- Cables certificados vs fallidos
- Tasa de éxito de certificación
- Actividad de usuarios

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Estándares de Código

- Usa ESLint y Prettier
- Escribe pruebas para nuevas funcionalidades
- Actualiza la documentación
- Sigue las convenciones de commits

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/network-certification-system/issues)
- **Email**: soporte@empresa.com
- **Documentación**: `backend-api-documentation.md`

---

**Versión**: 1.0.0
**Última actualización**: Diciembre 2024