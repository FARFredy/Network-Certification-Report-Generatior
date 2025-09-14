# Guía de Despliegue

## Configuración Docker

### Base de Datos
El proyecto incluye un `docker-compose.yml` para ejecutar MongoDB localmente:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - ./data:/data/db
```

Para ejecutar:
```bash
docker-compose up -d
```

### Contenedor para la Aplicación
Para producción, crea un Dockerfile para el backend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Build y run:
```bash
docker build -t chatbot-backend .
docker run -p 3001:3001 --env-file .env chatbot-backend
```

## Variables de Entorno

Copia `.env.example` a `.env` y configura:

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/chatbot
JWT_SECRET=tu_secreto_jwt_seguro_aqui
PORT=3001
NODE_ENV=production
```

### Frontend
El frontend no requiere variables de entorno específicas, pero configura la URL de la API en producción.

## Despliegue en Producción

### 1. Preparar el Backend
```bash
cd backend
npm run build
npm ci --only=production
```

### 2. Preparar el Frontend
```bash
cd frontend
npm run build
```

### 3. Servir el Frontend
Usa un servidor web como Nginx para servir los archivos estáticos:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Ejecutar el Backend
```bash
cd backend
NODE_ENV=production npm start
```

O usando PM2:
```bash
npm install -g pm2
pm2 start dist/server.js --name chatbot-backend
```

## Configuración SSL

Para HTTPS, usa Let's Encrypt con Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Notas de Escalabilidad

### Base de Datos
- Configura un replica set de MongoDB para alta disponibilidad
- Usa MongoDB Atlas para cloud hosting
- Implementa sharding para grandes volúmenes de datos

### Backend
- Usa un load balancer (nginx, HAProxy) para múltiples instancias
- Implementa horizontal scaling con Kubernetes o Docker Swarm
- Configura sesiones sticky para WebSocket

### Frontend
- Sirve estáticos desde CDN (Cloudflare, AWS CloudFront)
- Implementa caching agresivo
- Usa service workers para offline

### Monitoreo
- Logs: Winston o similar
- Métricas: Prometheus + Grafana
- Alertas: Configura thresholds para CPU, memoria, response times
- Health checks: Endpoint `/health` para load balancer

### Optimizaciones
- Compresión gzip/brotli
- Minificación de assets
- Lazy loading de componentes
- Database indexing en campos frecuentemente consultados
- Connection pooling para MongoDB

## CI/CD
Configura un pipeline con GitHub Actions:

```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          # Comandos de despliegue
```

## Backup
- Base de datos: `mongodump` regular
- Archivos: Backup de uploads si aplica
- Configuración: Versiona .env en secreto

## Seguridad
- Cambia JWT_SECRET en producción
- Usa HTTPS siempre
- Configura CORS apropiadamente
- Rate limiting en endpoints públicos
- Actualiza dependencias regularmente