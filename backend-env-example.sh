# Configuración del Servidor
NODE_ENV=development
PORT=3000

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=network_certification
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_secreto_cambiar_en_produccion_256_bits_minimo
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email Configuration (para futuras notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGIN=http://localhost:3001,https://tu-frontend-dominio.com