# Chatbot App

## Descripción
Aplicación web de chatbot con IA integrada, autenticación de usuarios y panel de administración. Este monorepo contiene el backend en Node.js/Express y el frontend en React.

## Características
- Chat en tiempo real con IA usando WebSocket
- Autenticación JWT para usuarios
- Historial de conversaciones persistente
- Panel de administración con métricas y gestión de respuestas predefinidas
- Interfaz responsiva con React y Tailwind CSS
- Procesamiento de intents con Transformers.js

## Tecnologías
### Backend
- Node.js con Express
- TypeScript
- MongoDB con Mongoose
- Socket.io para WebSocket
- JWT para autenticación
- bcrypt para hashing de contraseñas
- Transformers.js para IA

### Frontend
- React con TypeScript
- Tailwind CSS para estilos
- Socket.io-client para WebSocket
- React Router para navegación
- Axios para HTTP requests

### Base de Datos
- MongoDB

## Instalación
1. Clona el repositorio
2. Ejecuta `npm install` en la raíz del proyecto
3. Copia `.env.example` a `.env` y configura las variables de entorno

## Ejecución
### Desarrollo
- Backend: `npm run dev:backend` (puerto 3001)
- Frontend: `npm run dev:frontend` (puerto 3000)
- Base de datos: `docker-compose up` para MongoDB

### Producción
- Backend: `cd backend && npm run build && npm start`
- Frontend: `cd frontend && npm run build`

## Estructura del Proyecto
```
chatbot-app/
├── backend/                 # Servidor Express
│   ├── src/
│   │   ├── controllers/     # Controladores de API
│   │   ├── middleware/      # Middleware de auth y roles
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de API
│   │   ├── services/        # Servicios de IA y lógica
│   │   ├── socket/          # Manejador de WebSocket
│   │   └── server.ts        # Punto de entrada
│   └── package.json
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes UI
│   │   ├── pages/           # Páginas de la app
│   │   ├── hooks/           # Hooks personalizados
│   │   └── utils/           # Utilidades
│   └── package.json
├── shared/                  # Tipos compartidos
├── docs/                    # Documentación
└── docker-compose.yml       # Configuración Docker
```

## Contribución
1. Crea una rama para tu feature
2. Realiza commits descriptivos
3. Abre un pull request

## Licencia
ISC