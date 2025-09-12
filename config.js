// config.js - Configuración centralizada de la aplicación
require('dotenv').config();

const config = {
  // Servidor
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  },

  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'network_certification',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'secure_password_change_in_production',
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_256_bits_minimum',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: '20m',
    maxFiles: '14d',
  },

  // Email (para futuras funcionalidades)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
  },

  // Redis (opcional)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL) || 3600, // 1 hora
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your_secure_session_secret',
  },

  // Docker
  docker: {
    composeProjectName: process.env.COMPOSE_PROJECT_NAME || 'network_cert',
    backendPort: process.env.BACKEND_PORT || '3000',
    frontendPort: process.env.FRONTEND_PORT || '3001',
    dbPort: process.env.DB_PORT || '5432',
    redisPort: process.env.REDIS_PORT || '6379',
    pgadminPort: process.env.PGADMIN_PORT || '5050',
  },
};

// Validar configuración crítica
const validateConfig = () => {
  const errors = [];

  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }

  if (!config.database.password || config.database.password.includes('change_in_production')) {
    errors.push('DB_PASSWORD no está configurado correctamente para producción');
  }

  if (config.server.nodeEnv === 'production' && config.database.password === 'secure_password_change_in_production') {
    errors.push('DB_PASSWORD debe cambiarse en producción');
  }

  if (errors.length > 0) {
    console.error('❌ Errores de configuración:');
    errors.forEach(error => console.error(`   - ${error}`));
    if (config.server.nodeEnv === 'production') {
      console.error('💥 No se puede iniciar en modo producción con configuración inválida');
      process.exit(1);
    }
  }
};

// Ejecutar validación
validateConfig();

module.exports = config;