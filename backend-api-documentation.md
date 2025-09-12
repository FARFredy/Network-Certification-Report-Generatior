# 📡 API Backend - Sistema de Certificación de Redes

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js >= 16.0.0
- PostgreSQL >= 12.0
- npm >= 8.0.0

### Instalación
```bash
# Clonar el repositorio
git clone <tu-repo-url>
cd network-certification-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migrate

# Poblar con datos de prueba (opcional)
npm run seed

# Iniciar servidor
npm run dev
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia el servidor en desarrollo con nodemon |
| `npm run migrate` | Ejecuta las migraciones de base de datos |
| `npm run seed` | Pobla la base de datos con datos de prueba |
| `npm test` | Ejecuta las pruebas unitarias |
| `npm run lint` | Analiza el código con ESLint |

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `users`
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(50) UNIQUE)
- `email` (VARCHAR(100) UNIQUE)
- `password_hash` (VARCHAR(255))
- `full_name` (VARCHAR(100))
- `role` (VARCHAR(20)) - 'admin', 'engineer', 'viewer'
- `is_active` (BOOLEAN)
- `last_login` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

#### `projects`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(200))
- `description` (TEXT)
- `engineer_id` (INTEGER REFERENCES users(id))
- `engineer_name` (VARCHAR(100))
- `project_date` (DATE)
- `equipment_reference` (VARCHAR(200))
- `client_name`, `client_contact` (VARCHAR)
- `location` (TEXT)
- `status` (VARCHAR(20)) - 'active', 'completed', 'cancelled', 'archived'
- `created_at`, `updated_at` (TIMESTAMP)

#### `cables`
- `id` (SERIAL PRIMARY KEY)
- `project_id` (INTEGER REFERENCES projects(id))
- `label`, `destination` (VARCHAR(50))
- `result` (BOOLEAN)
- `network_type` (VARCHAR(30))
- `length` (DECIMAL(10,2))
- `test_date` (TIMESTAMP)
- `test_parameters` (JSONB)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

## 🔐 Autenticación

### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "ingeniero1",
  "email": "ingeniero@empresa.com",
  "password": "contraseña123",
  "fullName": "Ing. Juan Pérez",
  "role": "engineer"
}
```

**Respuesta:**
```json
{
  "message": "Usuario creado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "ingeniero1",
    "email": "ingeniero@empresa.com",
    "fullName": "Ing. Juan Pérez",
    "role": "engineer"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "ingeniero1",
  "password": "contraseña123"
}
```

### Uso del Token
Incluir en el header `Authorization` de todas las requests autenticadas:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📂 Endpoints de Proyectos

### Listar Proyectos
```http
GET /api/projects?page=1&limit=10&status=active
Authorization: Bearer <token>
```

**Parámetros Query:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10)
- `status` (opcional): Filtrar por estado ('active', 'completed', 'all')

**Respuesta:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Edificio Corporativo",
      "description": "Certificación de red estructurada...",
      "engineerName": "Ing. Fernando Forero",
      "projectDate": "2024-11-15",
      "status": "completed",
      "stats": {
        "totalCables": 45,
        "passed": 28,
        "failed": 17,
        "totalLength": 1850.5
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### Crear Proyecto
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nuevo Proyecto",
  "description": "Descripción del proyecto",
  "engineerName": "Ing. Juan Pérez",
  "projectDate": "2024-12-15",
  "equipmentReference": "www.wirescope.com",
  "clientName": "Cliente S.A.",
  "clientContact": "Contacto Cliente",
  "location": "Bogotá, Colombia"
}
```

### Obtener Proyecto Específico
```http
GET /api/projects/{id}
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "project": {
    "id": 1,
    "name": "Edificio Corporativo",
    "description": "...",
    "engineerName": "Ing. Fernando Forero",
    "stats": {
      "totalCables": 45,
      "passed": 28,
      "failed": 17,
      "totalLength": 1850.5
    }
  },
  "cables": [
    {
      "id": 1,
      "label": "P11 PPA D4",
      "result": true,
      "destination": "D4",
      "networkType": "Cat. 6A",
      "length": 42.0,
      "testDate": "2024-11-15T10:30:00Z",
      "notes": "Certificación exitosa"
    }
  ]
}
```

## 🔌 Endpoints de Cables

### Agregar Cable
```http
POST /api/projects/{projectId}/cables
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "P11 PPA D5",
  "result": true,
  "destination": "D5",
  "networkType": "Cat. 6A",
  "length": 45.5,
  "notes": "Cable certificado correctamente"
}
```

### Importar Cables desde CSV
```http
POST /api/projects/{projectId}/cables/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

csvFile: archivo.csv
```

**Formato CSV esperado:**
```csv
label,result,destination,networkType,length,notes
P11 PPA D1,true,D1,Cat. 6A,42.0,Certificación exitosa
P11 PPA D2,false,D2,Cat. 6A,45.0,Falla en continuidad
```

**Respuesta:**
```json
{
  "message": "Importación completada",
  "imported": 25,
  "errors": 2,
  "errorDetails": [
    "Fila inválida: longitud faltante",
    "Error procesando fila: formato incorrecto"
  ]
}
```

## 📊 Endpoints de Reportes

### Generar Reporte PDF
```http
GET /api/projects/{id}/report/pdf
Authorization: Bearer <token>
```

**Respuesta:** Archivo PDF con el reporte de certificación completo.

### Dashboard del Usuario
```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "stats": {
    "totalProjects": 15,
    "totalCables": 450,
    "totalPassed": 380,
    "totalFailed": 70,
    "totalLength": 12500.5,
    "successRate": "84.4",
    "projectsLastMonth": 5
  },
  "recentProjects": [
    {
      "id": 1,
      "name": "Proyecto Reciente",
      "cable_count": 25
    }
  ],
  "monthlyStats": [
    {
      "month": "2024-11-01T00:00:00.000Z",
      "projects": 3,
      "cables": 120,
      "passed": 95
    }
  ]
}
```

## 🔍 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token faltante o inválido |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Recurso ya existe |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Límite de rate excedido |
| 500 | Internal Server Error - Error del servidor |

## 🛡️ Seguridad

### Rate Limiting
- 100 requests por 15 minutos por IP
- Aplicado a todas las rutas `/api/*`

### Validación de Datos
- Validación de entrada con Joi
- Sanitización de datos SQL injection
- Hash seguro de contraseñas con bcrypt (12 rounds)

### Headers de Seguridad
- Helmet.js configurado
- CORS configurable por dominio
- CSP (Content Security Policy)

## 📝 Logging y Auditoría

### Logs de Aplicación
- Morgan para logs HTTP
- Winston para logs de aplicación
- Rotación automática de logs

### Auditoría de Base de Datos
La tabla `audit_logs` registra automáticamente:
- Logins de usuarios
- Creación/modificación de proyectos
- Adición/eliminación de cables
- Generación de reportes

## 🧪 Testing

### Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Pruebas con coverage
npm run test:coverage

# Pruebas en modo watch
npm run test:watch
```

### Estructura de Pruebas
```
tests/
├── unit/
│   ├── auth.test.js
│   ├── projects.test.js
│   └── cables.test.js
├── integration/
│   └── api.test.js
└── fixtures/
    └── testData.js
```

## 🚀 Deployment

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=3000
DB_HOST=tu-db-host
DB_NAME=network_certification_prod
JWT_SECRET=tu_super_secreto_de_256_bits_minimo
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Check
```http
GET /api/health
```
**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-06T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": "45.2 MB",
    "total": "512 MB"
  }
}
```

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- Email: soporte@empresa.com
- GitHub Issues: [Repositorio del Proyecto]
- Documentación adicional: [Wiki del Proyecto]

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024