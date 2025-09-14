# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Autenticación
Todos los endpoints requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

## Endpoints REST

### Autenticación

#### POST /auth/login
Inicia sesión de usuario.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

#### POST /auth/register
Registra un nuevo usuario.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### Chat

#### GET /chat/history
Obtiene el historial de conversaciones del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "conv_id",
    "userId": "user_id",
    "messages": [
      {
        "id": "msg_id",
        "content": "Hello",
        "sender": "user",
        "timestamp": "2023-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### POST /chat/messages
Envía un mensaje de chat.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Hello bot",
  "conversationId": "optional_conv_id"
}
```

**Response (201):**
```json
{
  "id": "msg_id",
  "conversationId": "conv_id",
  "userId": "user_id",
  "content": "Hello bot",
  "sender": "user",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Administración

#### GET /admin/metrics
Obtiene métricas del sistema (solo admin).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "userCount": 150,
  "avgResponseTime": 2500,
  "interactionsByIntent": [
    { "_id": "greeting", "count": 45 },
    { "_id": "help", "count": 30 }
  ]
}
```

#### GET /admin/conversations
Obtiene todas las conversaciones (solo admin).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "id": "conv_id",
    "userId": "user_id",
    "messages": [...],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### PUT /admin/predefined/:id
Actualiza una respuesta predefinida (solo admin).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "response": "Nueva respuesta predefinida"
}
```

**Response (200):**
```json
{
  "id": "predef_id",
  "intent": "greeting",
  "response": "Nueva respuesta predefinida",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## WebSocket Events

### Conexión
El cliente debe conectarse a `ws://localhost:3001` usando Socket.io.

### Eventos del Cliente al Servidor

#### join
Une al usuario a una room específica.

```javascript
socket.emit('join', userId);
```

#### message
Envía un mensaje de chat.

```javascript
socket.emit('message', {
  userId: 'user_id',
  content: 'Hello bot'
});
```

### Eventos del Servidor al Cliente

#### botResponse
Respuesta del bot a un mensaje.

```javascript
socket.on('botResponse', (data) => {
  console.log(data.content); // Respuesta del bot
  console.log(data.conversationId); // ID de conversación
});
```

#### error
Error en el procesamiento del mensaje.

```javascript
socket.on('error', (data) => {
  console.log(data.message); // Mensaje de error
});
```

## Códigos de Error
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error