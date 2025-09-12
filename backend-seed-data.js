// scripts/seed.js - Script para poblar la base de datos con datos de prueba
const config = require('../config');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

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

// Datos de usuarios de prueba
const seedUsers = [
  {
    username: 'admin',
    email: 'admin@empresa.com',
    password: 'admin123',
    fullName: 'Administrador Sistema',
    role: 'admin'
  },
  {
    username: 'fernando.forero',
    email: 'fernando.forero@empresa.com',
    password: 'ingeniero123',
    fullName: 'Ing. Fernando Forero',
    role: 'engineer'
  },
  {
    username: 'carlos.martinez',
    email: 'carlos.martinez@empresa.com',
    password: 'ingeniero123',
    fullName: 'Ing. Carlos Martínez',
    role: 'engineer'
  },
  {
    username: 'ana.rodriguez',
    email: 'ana.rodriguez@empresa.com',
    password: 'viewer123',
    fullName: 'Ana Rodríguez',
    role: 'viewer'
  }
];

// Datos de proyectos de prueba
const seedProjects = [
  {
    name: 'Edificio Corporativo Torres del Norte',
    description: 'Certificación de red estructurada para nuevo edificio corporativo de 12 pisos',
    engineerName: 'Ing. Fernando Forero',
    projectDate: '2024-11-15',
    equipmentReference: 'www.wirescope.com',
    clientName: 'Constructora del Norte S.A.',
    clientContact: 'Ing. Pedro Sánchez',
    location: 'Bogotá, Colombia - Zona Rosa',
    status: 'completed'
  },
  {
    name: 'Centro Comercial Plaza Central',
    description: 'Instalación y certificación de puntos de red para locales comerciales',
    engineerName: 'Ing. Carlos Martínez',
    projectDate: '2024-12-01',
    equipmentReference: 'www.wirescope.com',
    clientName: 'Inmobiliaria Plaza S.A.S',
    clientContact: 'Arq. María González',
    location: 'Medellín, Colombia - El Poblado',
    status: 'active'
  },
  {
    name: 'Universidad Tecnológica - Campus Norte',
    description: 'Modernización de infraestructura de red en laboratorios y aulas',
    engineerName: 'Ing. Fernando Forero',
    projectDate: '2024-10-20',
    equipmentReference: 'www.wirescope.com',
    clientName: 'Universidad Tecnológica Nacional',
    clientContact: 'Ing. Roberto Vargas',
    location: 'Cali, Colombia - Ciudad Universitaria',
    status: 'completed'
  }
];

// Datos de cables de prueba basados en el archivo original
const seedCables = [
  // Cables para Proyecto 1 (Torres del Norte)
  {
    projectIndex: 0,
    cables: [
      { label: 'P11 PPA D4', result: true, destination: 'D4', networkType: 'Cat. 6A', length: 42.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D6', result: false, destination: 'D6', networkType: 'Cat. 6A', length: 64.0, notes: 'Falla en continuidad' },
      { label: 'P11 PPA D7', result: false, destination: 'D7', networkType: 'Cat. 6A', length: 62.0, notes: 'Interferencia detectada' },
      { label: 'P11 PPA D8', result: false, destination: 'D8', networkType: 'Cat. 6A', length: 62.0, notes: 'Parámetros fuera de rango' },
      { label: 'P11 PPA D9', result: false, destination: 'D9', networkType: 'Cat. 6A', length: 52.0, notes: 'Recableado requerido' },
      { label: 'P11 PPA D10', result: true, destination: 'D10', networkType: 'Cat. 6A', length: 58.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D11', result: false, destination: 'D11', networkType: 'Cat. 6A', length: 66.0, notes: 'Conectores defectuosos' },
      { label: 'P11 PPA D12', result: false, destination: 'D12', networkType: 'Cat. 6A', length: 54.0, notes: 'Longitud excesiva' },
      { label: 'P11 PPA D13', result: false, destination: 'D13', networkType: 'Cat. 6A', length: 56.0, notes: 'Diafonía alta' },
      { label: 'P11 PPA D19', result: false, destination: 'D19', networkType: 'Cat. 6A', length: 20.0, notes: 'Cable dañado' },
      { label: 'P11 PPA D21', result: true, destination: 'D21', networkType: 'Cat. 6A', length: 32.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D23', result: false, destination: 'D23', networkType: 'Cat. 6A', length: 23.0, notes: 'Pines mal conectados' },
      { label: 'P11 PPA D26', result: true, destination: 'D26', networkType: 'Cat. 6A', length: 49.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D30', result: true, destination: 'D30', networkType: 'Cat. 6A', length: 52.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D31', result: false, destination: 'D31', networkType: 'Cat. 6A', length: 51.0, notes: 'Atenuación alta' },
      { label: 'P11 PPA D32', result: true, destination: 'D32', networkType: 'Cat. 6A', length: 61.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D33', result: true, destination: 'D33', networkType: 'Cat. 6A', length: 60.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D36', result: true, destination: 'D36', networkType: 'Cat. 6A', length: 55.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D41', result: true, destination: 'D41', networkType: 'Cat. 6A', length: 48.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D44', result: false, destination: 'D44', networkType: 'Cat. 6A', length: 33.0, notes: 'NEXT excedido' },
      { label: 'P11 PPA D46', result: true, destination: 'D46', networkType: 'Cat. 6A', length: 40.0, notes: 'Certificación exitosa' },
      { label: 'P11 PPA D47', result: true, destination: 'D47', networkType: 'Cat. 6A', length: 49.0, notes: 'Certificación exitosa' }
    ]
  },
  // Cables para Proyecto 2 (Centro Comercial)
  {
    projectIndex: 1,
    cables: [
      { label: 'CC01 LC1 P01', result: true, destination: 'P01', networkType: 'Cat. 6A', length: 25.0, notes: 'Local comercial 1' },
      { label: 'CC01 LC1 P02', result: true, destination: 'P02', networkType: 'Cat. 6A', length: 28.0, notes: 'Local comercial 1' },
      { label: 'CC01 LC2 P01', result: false, destination: 'P01', networkType: 'Cat. 6A', length: 35.0, notes: 'Requiere recableado' },
      { label: 'CC01 LC2 P02', result: true, destination: 'P02', networkType: 'Cat. 6A', length: 32.0, notes: 'Local comercial 2' },
      { label: 'CC01 LC3 P01', result: true, destination: 'P01', networkType: 'Cat. 6A', length: 45.0, notes: 'Local comercial 3' },
      { label: 'CC01 LC3 P02', result: true, destination: 'P02', networkType: 'Cat. 6A', length: 47.0, notes: 'Local comercial 3' },
      { label: 'CC01 LC4 P01', result: false, destination: 'P01', networkType: 'Cat. 6A', length: 38.0, notes: 'Interferencia electromagnética' },
      { label: 'CC01 LC4 P02', result: true, destination: 'P02', networkType: 'Cat. 6A', length: 40.0, notes: 'Local comercial 4' },
      { label: 'CC01 LC5 P01', result: true, destination: 'P01', networkType: 'Cat. 6A', length: 22.0, notes: 'Local comercial 5' },
      { label: 'CC01 LC5 P02', result: true, destination: 'P02', networkType: 'Cat. 6A', length: 24.0, notes: 'Local comercial 5' }
    ]
  },
  // Cables para Proyecto 3 (Universidad)
  {
    projectIndex: 2,
    cables: [
      { label: 'LAB01 P01', result: true, destination: 'P01', networkType: 'Cat. 6A', length: 15.0, notes: 'Laboratorio de Sistemas' },
      { label: 'LAB01 P02', result: true, destination: 'P02', networkType: 'Cat. 6A', length: 18.0, notes: 'Laboratorio de Sistemas' },
      { label: 'LAB01 P03', result: true, destination: 'P03', networkType: 'Cat. 6A', length: 21.0, notes: 'Laboratorio de Sistemas' },
      { label: 'LAB02 P01', result: true, destination: 'P01', networkType: 'Cat. 6A', length: 16.0, notes: 'Laboratorio de Redes' },
      { label: 'LAB02 P02', result: false, destination: 'P02', networkType: 'Cat. 6A', length: 19.0, notes: 'Cable con corte' },
      { label: 'LAB02 P03', result: true, destination: 'P03', networkType: 'Cat. 6A', length: 22.0, notes: 'Laboratorio de Redes' },
      { label: 'AULA301 P01', result: true, destination: 'P01', networkType: 'Cat. 6', length: 12.0, notes: 'Aula multimedia' },
      { label: 'AULA301 P02', result: true, destination: 'P02', networkType: 'Cat. 6', length: 14.0, notes: 'Aula multimedia' },
      { label: 'AULA302 P01', result: true, destination: 'P01', networkType: 'Cat. 6', length: 13.0, notes: 'Aula de conferencias' },
      { label: 'AULA302 P02', result: true, destination: 'P02', networkType: 'Cat. 6', length: 15.0, notes: 'Aula de conferencias' },
      { label: 'FIBRA01', result: true, destination: 'MDF', networkType: 'Fibra Óptica', length: 150.0, notes: 'Backbone principal' },
      { label: 'FIBRA02', result: true, destination: 'IDF1', networkType: 'Fibra Óptica', length: 85.0, notes: 'Distribución piso 2' }
    ]
  }
];

// Función para crear usuarios
async function seedUsersData(client) {
  console.log('👥 Creando usuarios de prueba...');
  
  for (const userData of seedUsers) {
    try {
      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(userData.password, config.security.bcryptRounds);
      
      const result = await client.query(`
        INSERT INTO users (username, email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role
        RETURNING id, username, role
      `, [userData.username, userData.email, passwordHash, userData.fullName, userData.role]);
      
      console.log(`   ✅ Usuario creado: ${result.rows[0].username} (${result.rows[0].role})`);
      
    } catch (error) {
      console.error(`   ❌ Error creando usuario ${userData.username}:`, error.message);
    }
  }
}

// Función para crear proyectos
async function seedProjectsData(client) {
  console.log('📂 Creando proyectos de prueba...');
  
  // Obtener IDs de ingenieros
  const engineersResult = await client.query(`
    SELECT id, full_name FROM users WHERE role = 'engineer'
  `);
  
  const engineers = {};
  engineersResult.rows.forEach(eng => {
    engineers[eng.full_name] = eng.id;
  });
  
  const projectIds = [];
  
  for (const projectData of seedProjects) {
    try {
      const engineerId = engineers[projectData.engineerName];
      
      const result = await client.query(`
        INSERT INTO projects (name, description, engineer_id, engineer_name, project_date, 
                             equipment_reference, client_name, client_contact, location, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT ON CONSTRAINT projects_pkey DO UPDATE SET
          description = EXCLUDED.description,
          client_name = EXCLUDED.client_name,
          client_contact = EXCLUDED.client_contact,
          location = EXCLUDED.location,
          status = EXCLUDED.status
        RETURNING id, name
      `, [
        projectData.name,
        projectData.description,
        engineerId,
        projectData.engineerName,
        projectData.projectDate,
        projectData.equipmentReference,
        projectData.clientName,
        projectData.clientContact,
        projectData.location,
        projectData.status
      ]);
      
      projectIds.push(result.rows[0].id);
      console.log(`   ✅ Proyecto creado: ${result.rows[0].name}`);
      
    } catch (error) {
      console.error(`   ❌ Error creando proyecto ${projectData.name}:`, error.message);
    }
  }
  
  return projectIds;
}

// Función para crear cables
async function seedCablesData(client, projectIds) {
  console.log('🔌 Creando cables de prueba...');
  
  for (let i = 0; i < seedCables.length; i++) {
    const cableGroup = seedCables[i];
    const projectId = projectIds[cableGroup.projectIndex];
    
    if (!projectId) {
      console.log(`   ⚠️  Proyecto ${cableGroup.projectIndex} no encontrado, saltando cables...`);
      continue;
    }
    
    // Limpiar cables existentes del proyecto
    await client.query('DELETE FROM cables WHERE project_id = $1', [projectId]);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const cableData of cableGroup.cables) {
      try {
        // Agregar variación en las fechas de test
        const testDate = new Date();
        testDate.setHours(testDate.getHours() - Math.floor(Math.random() * 48));
        
        // Generar parámetros técnicos simulados
        const testParameters = {
          frequency: '250MHz',
          temperature: `${20 + Math.floor(Math.random() * 10)}°C`,
          humidity: `${45 + Math.floor(Math.random() * 20)}%`,
          wiremap: cableData.result ? 'OK' : 'FAIL',
          length_test: cableData.result ? 'PASS' : 'FAIL',
          attenuation: cableData.result ? `${(Math.random() * 5 + 10).toFixed(1)} dB` : `${(Math.random() * 10 + 20).toFixed(1)} dB`,
          next: cableData.result ? `${(Math.random() * 10 + 40).toFixed(1)} dB` : `${(Math.random() * 5 + 25).toFixed(1)} dB`,
          return_loss: cableData.result ? `${(Math.random() * 5 + 15).toFixed(1)} dB` : `${(Math.random() * 5 + 8).toFixed(1)} dB`
        };
        
        await client.query(`
          INSERT INTO cables (project_id, label, result, destination, network_type, 
                             length, test_date, test_parameters, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          projectId,
          cableData.label,
          cableData.result,
          cableData.destination,
          cableData.networkType,
          cableData.length,
          testDate,
          JSON.stringify(testParameters),
          cableData.notes
        ]);
        
        successCount++;
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error creando cable ${cableData.label}:`, error.message);
      }
    }
    
    console.log(`   ✅ Proyecto ${i + 1}: ${successCount} cables creados, ${errorCount} errores`);
  }
}

// Función para crear logs de auditoría de ejemplo
async function seedAuditLogs(client, projectIds) {
  console.log('📋 Creando logs de auditoría...');
  
  const actions = ['LOGIN', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'ADD_CABLE', 'GENERATE_REPORT'];
  const userIds = await client.query('SELECT id FROM users');
  
  for (let i = 0; i < 50; i++) {
    try {
      const randomUserId = userIds.rows[Math.floor(Math.random() * userIds.rows.length)].id;
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomProjectId = projectIds[Math.floor(Math.random() * projectIds.length)];
      
      const logDate = new Date();
      logDate.setHours(logDate.getHours() - Math.floor(Math.random() * 168)); // Últimas 7 días
      
      const newValues = {
        timestamp: logDate,
        details: `Acción ${randomAction} ejecutada`,
        project_id: randomAction.includes('PROJECT') || randomAction.includes('CABLE') ? randomProjectId : null
      };
      
      await client.query(`
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, 
                               ip_address, user_agent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        randomUserId,
        randomAction,
        randomAction.includes('PROJECT') ? 'projects' : randomAction.includes('CABLE') ? 'cables' : 'users',
        randomAction.includes('PROJECT') ? randomProjectId : null,
        JSON.stringify(newValues),
        `192.168.1.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        logDate
      ]);
      
    } catch (error) {
      console.error(`   ❌ Error creando log de auditoría:`, error.message);
    }
  }
  
  console.log('   ✅ 50 logs de auditoría creados');
}

// Función principal de seeding
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Iniciando seeding de la base de datos...\n');

    await client.query('BEGIN');

    // 1. Crear usuarios
    await seedUsersData(client);
    console.log('');

    // 2. Crear proyectos
    const projectIds = await seedProjectsData(client);
    console.log('');

    // 3. Crear cables
    await seedCablesData(client, projectIds);
    console.log('');

    // 4. Crear logs de auditoría
    await seedAuditLogs(client, projectIds);
    console.log('');

    await client.query('COMMIT');

    console.log('🎉 Seeding completado exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`   👥 ${seedUsers.length} usuarios`);
    console.log(`   📂 ${seedProjects.length} proyectos`);
    
    // Contar cables totales
    const totalCables = seedCables.reduce((sum, group) => sum + group.cables.length, 0);
    console.log(`   🔌 ${totalCables} cables`);
    console.log(`   📋 50 logs de auditoría`);

    console.log('\n🔑 Credenciales de prueba:');
    console.log('   👨‍💼 Admin: admin / admin123');
    console.log('   👨‍🔧 Ingeniero 1: fernando.forero / ingeniero123');
    console.log('   👨‍🔧 Ingeniero 2: carlos.martinez / ingeniero123');
    console.log('   👀 Viewer: ana.rodriguez / viewer123');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Error durante el seeding:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para limpiar datos
async function cleanDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Limpiando datos de prueba...');

    await client.query('BEGIN');

    // Eliminar en orden inverso debido a las foreign keys
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM report_cache');
    await client.query('DELETE FROM cables');
    await client.query('DELETE FROM projects');
    await client.query('DELETE FROM users WHERE username IN ($1, $2, $3, $4)', 
      ['admin', 'fernando.forero', 'carlos.martinez', 'ana.rodriguez']);

    await client.query('COMMIT');

    console.log('✅ Datos de prueba eliminados exitosamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    client.release();
  }
}

// CLI para ejecutar desde línea de comandos
if (require.main === module) {
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'seed':
        case 'up':
          await seedDatabase();
          break;
          
        case 'clean':
        case 'down':
          await cleanDatabase();
          break;
          
        case 'reset':
          await cleanDatabase();
          await seedDatabase();
          break;
          
        default:
          console.log(`
Uso: node seed.js <comando>

Comandos:
  seed, up    - Poblar la base de datos con datos de prueba
  clean, down - Eliminar todos los datos de prueba
  reset       - Limpiar y volver a poblar con datos frescos

Ejemplos:
  node seed.js seed
  node seed.js clean
  node seed.js reset
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
  seedDatabase,
  cleanDatabase,
  seedUsers,
  seedProjects,
  seedCables
};
      