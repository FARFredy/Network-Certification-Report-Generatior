-- Script de inicialización de base de datos para Docker
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor PostgreSQL

-- Configurar timezone
SET timezone = 'UTC';

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurar parámetros de PostgreSQL para mejor rendimiento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.max = 10000;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Notificar que la base de datos está lista
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente para Network Certification System';
END
$$;