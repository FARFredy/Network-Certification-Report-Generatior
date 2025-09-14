# AI Chat App

## Overview
Esta es una aplicación web fullstack con chatbot impulsado por IA. Utiliza React en el frontend, Node.js/Express con TypeScript en el backend, MongoDB para la base de datos, y @xenova/transformers para funcionalidades de IA local. Incluye autenticación, chat en tiempo real con Socket.io, panel de admin, y visualizaciones con Chart.js.

## Estructura del Proyecto
- **frontend/**: Aplicación React con Tailwind CSS y React Router.
- **backend/**: Servidor Node.js/Express con Mongoose, Socket.io, y servicios de IA.
- **shared/**: Tipos TypeScript compartidos.
- **docs/**: Documentación adicional (API.md, DEPLOYMENT.md).
- **data/**: Archivos de datos (diagnósticos, journal).

## Requisitos
- Node.js >= 18
- MongoDB (local o cloud)
- Docker (para MongoDB local)

## Instalación
1. Clona el repositorio:
   ```
   git clone https://github.com/FARFredy/ai-chat-app.git
   cd ai-chat-app
   ```
2. Instala dependencias:
   ```
   npm install  # Root (opcional, para scripts)
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configura variables de entorno:
   - Copia `.env.example` a `.env` en root y backend/frontend si aplica.
   - Actualiza `MONGODB_URI`, `JWT_SECRET`, etc.
4. Levanta MongoDB con Docker:
   ```
   docker-compose up -d mongodb
   ```

## Desarrollo
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm start`
- Root scripts: `npm run dev:backend`, `npm run dev:frontend`, `npm run setup`

## Funcionalidades Implementadas
- Autenticación (login/registro) con JWT y bcrypt.
- Chat en tiempo real con Socket.io.
- Modelos Mongoose para User, Message, Conversation, Log, PredefinedResponse.
- Servicios de IA (intentService, aiService) con transformers.
- Componentes React: AuthLogin/Register, ChatWindow, AdminPanel, HistoryPanel.
- Hooks: useAuth, useWebSocket.
- Rutas Express: auth, chat, admin.
- Middleware: auth, role.

## Despliegue
Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Licencia
MIT