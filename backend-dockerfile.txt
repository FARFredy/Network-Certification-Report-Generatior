# Dockerfile para Backend de Certificación de Redes
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    postgresql-client \
    curl \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# === Etapa de desarrollo ===
FROM base AS development
ENV NODE_ENV=development

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Cambiar propietario de la carpeta
RUN chown -R nodejs:nodejs /app
USER nodejs

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorio para uploads
RUN mkdir -p uploads logs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando por defecto para desarrollo
CMD ["npm", "run", "dev"]

# === Etapa de producción ===
FROM base AS production
ENV NODE_ENV=production

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Cambiar propietario de la carpeta
RUN chown -R nodejs:nodejs /app
USER nodejs

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorio para uploads y logs
RUN mkdir -p uploads logs

# Exponer puerto
EXPOSE 3000

# Health check para producción
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando para producción
CMD ["npm", "start"]

# === Multi-stage final ===
FROM ${NODE_ENV:-production} AS final