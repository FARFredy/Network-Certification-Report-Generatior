// scripts/migrate.js - Script de migración de base de datos
const config = require('../config');
const { Pool } = require('pg');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: config.database.maxConnections,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
});

// Definición de migraciones
const migrations = [
  {
    id: 1,
    name: 'create_initial_tables',
    up: `
      -- Tabla de migraciones para tracking
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'engineer' CHECK (role IN ('admin', 'engineer', 'viewer')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Función para actualizar updated_at automáticamente
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Trigger para users
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
    down: `
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP FUNCTION IF EXISTS update_updated_at_column();
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS migrations;
    `
  },
  {
    id: 2,
    name: 'create_projects_table',
    up: `
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        engineer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        engineer_name VARCHAR(100) NOT NULL,
        project_date DATE NOT NULL,
        equipment_reference VARCHAR(200) DEFAULT 'www.wirescope.com',
        client_name VARCHAR(200),
        client_contact VARCHAR(100),
        location TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'archived')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Trigger para projects
      CREATE TRIGGER update_projects_updated_at 
        BEFORE UPDATE ON projects 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Índices para optimización
      CREATE INDEX idx_projects_engineer_id ON projects(engineer_id);
      CREATE INDEX idx_projects_status ON projects(status);
      CREATE INDEX idx_projects_date ON projects(project_date);
    `,
    down: `
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      DROP INDEX IF EXISTS idx_projects_engineer_id;
      DROP INDEX IF EXISTS idx_projects_status;
      DROP INDEX IF EXISTS idx_projects_date;
      DROP TABLE IF EXISTS projects;
    `
  },
  {
    id: 3,
    name: 'create_cables_table',
    up: `
      CREATE TABLE IF NOT EXISTS cables (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        label VARCHAR(50) NOT NULL,
        result BOOLEAN NOT NULL,
        destination VARCHAR(50) NOT NULL,
        network_type VARCHAR(30) NOT NULL,
        length DECIMAL(10,2) NOT NULL CHECK (length >= 0),
        test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        test_parameters JSONB, -- Para almacenar parámetros técnicos del test
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Constraint para evitar duplicados en el mismo proyecto
        UNIQUE(project_id, label, destination)
      );

      -- Trigger para cables
      CREATE TRIGGER update_cables_updated_at 
        BEFORE UPDATE ON cables 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Índices para optimización
      CREATE INDEX idx_cables_project_id ON cables(project_id);
      CREATE INDEX idx_cables_result ON cables(result);
      CREATE INDEX idx_cables_network_type ON cables(network_type);
      CREATE INDEX idx_cables_label ON cables(label);
      CREATE INDEX idx_cables_test_date ON cables(test_date);
    `,
    down: `
      DROP TRIGGER IF EXISTS update_cables_updated_at ON cables;
      DROP INDEX IF EXISTS idx_cables_project_id;
      DROP INDEX IF EXISTS idx_cables_result;
      DROP INDEX IF EXISTS idx_cables_network_type;
      DROP INDEX IF EXISTS idx_cables_label;
      DROP INDEX IF EXISTS idx_cables_test_date;
      DROP TABLE IF EXISTS cables;
    `
  },
  {
    id: 4,
    name: 'create_audit_logs',
    up: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
        table_name VARCHAR(50),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para audit_logs
      CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
      CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
    `,
    down: `
      DROP INDEX IF EXISTS idx_audit_logs_user_id;
      DROP INDEX IF EXISTS idx_audit_logs_action;
      DROP INDEX IF EXISTS idx_audit_logs_table;
      DROP INDEX IF EXISTS idx_audit_logs_created_at;
      DROP TABLE IF EXISTS audit_logs;
    `
  },
  {
    id: 5,
    name: 'create_reports_cache',
    up: `
      CREATE TABLE IF NOT EXISTS report_cache (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL, -- PDF, CSV, EXCEL
        file_path VARCHAR(500),
        file_size INTEGER,
        generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_expired BOOLEAN DEFAULT false
      );

      -- Índices para report_cache
      CREATE INDEX idx_report_cache_project_id ON report_cache(project_id);
      CREATE INDEX idx_report_cache_expires_at ON report_cache(expires_at);
    `,
    down: `
      DROP INDEX IF EXISTS idx_report_cache_project_id;
      DROP INDEX IF EXISTS idx_report_cache_expires_at;
      DROP TABLE IF EXISTS report_cache;
    `
  }
];

// Función para verificar si una migración ya fue ejecutada
async function isMigrationExecuted(client, migrationId) {
  try {
    const result = await client.query(
      'SELECT id FROM migrations WHERE id = $1',
      [migrationId]
    );
    return result.rows.length > 0;
  } catch (error) {
    // Si la tabla migrations no existe aún, asumir que no se ejecutó
    return false;
  }
}

// Función para marcar una migración como ejecutada
async function markMigrationAsExecuted(client, migration) {
  await client.query(
    'INSERT INTO migrations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
    [migration.id, migration.name]
  );
}

// Función principal de migración
async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migraciones...');

    for (const migration of migrations) {
      const isExecuted = await isMigrationExecuted(client, migration.id);
      
      if (isExecuted) {
        console.log(`⏭️  Migración ${migration.id} (${migration.name}) ya ejecutada, saltando...`);
        continue;
      }

      console.log(`▶️  Ejecutando migración ${migration.id}: ${migration.name}`);

      await client.query('BEGIN');
      
      try {
        // Ejecutar la migración
        await client.query(migration.up);
        
        // Marcar como ejecutada
        await markMigrationAsExecuted(client, migration);
        
        await client.query('COMMIT');
        
        console.log(`✅ Migración ${migration.id} completada exitosamente`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error en migración ${migration.id}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 Todas las migraciones completadas exitosamente');

  } catch (error) {
    console.error('💥 Error durante las migraciones:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para revertir migraciones (rollback)
async function rollbackMigration(migrationId) {
  const client = await pool.connect();
  
  try {
    const migration = migrations.find(m => m.id === migrationId);
    
    if (!migration) {
      throw new Error(`Migración ${migrationId} no encontrada`);
    }

    const isExecuted = await isMigrationExecuted(client, migrationId);
    
    if (!isExecuted) {
      console.log(`⏭️  Migración ${migrationId} no está ejecutada, nada que revertir`);
      return;
    }

    console.log(`🔄 Revirtiendo migración ${migrationId}: ${migration.name}`);

    await client.query('BEGIN');
    
    try {
      // Ejecutar rollback
      await client.query(migration.down);
      
      // Quitar de tabla de migraciones
      await client.query('DELETE FROM migrations WHERE id = $1', [migrationId]);
      
      await client.query('COMMIT');
      
      console.log(`✅ Migración ${migrationId} revertida exitosamente`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error revirtiendo migración ${migrationId}:`, error.message);
      throw error;
    }

  } catch (error) {
    console.error('💥 Error durante el rollback:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para mostrar estado de migraciones
async function showMigrationStatus() {
  const client = await pool.connect();
  
  try {
    console.log('\n📊 Estado de Migraciones:');
    console.log('========================');
    
    for (const migration of migrations) {
      const isExecuted = await isMigrationExecuted(client, migration.id);
      const status = isExecuted ? '✅ Ejecutada' : '⏳ Pendiente';
      console.log(`${migration.id}. ${migration.name}: ${status}`);
    }
    
    console.log('========================\n');
    
  } catch (error) {
    console.error('Error mostrando estado:', error);
  } finally {
    client.release();
  }
}

// CLI para ejecutar desde línea de comandos
if (require.main === module) {
  const command = process.argv[2];
  const migrationId = process.argv[3];

  (async () => {
    try {
      switch (command) {
        case 'up':
        case 'migrate':
          await runMigrations();
          break;
          
        case 'down':
        case 'rollback':
          if (!migrationId) {
            console.error('❌ ID de migración requerido para rollback');
            process.exit(1);
          }
          await rollbackMigration(parseInt(migrationId));
          break;
          
        case 'status':
          await showMigrationStatus();
          break;
          
        default:
          console.log(`
Uso: node migrate.js <comando> [opciones]

Comandos:
  up, migrate     - Ejecutar todas las migraciones pendientes
  down, rollback  - Revertir una migración específica (requiere ID)
  status          - Mostrar estado de todas las migraciones

Ejemplos:
  node migrate.js up
  node migrate.js rollback 3
  node migrate.js status
          `);
          break;
      }
      
      await pool.end();
      
    } catch (error) {
      console.error('💥 Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  runMigrations,
  rollbackMigration,
  showMigrationStatus,
  migrations
};