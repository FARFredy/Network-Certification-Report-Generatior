#!/usr/bin/env node

// scripts/verify-deployment.js - Script de verificación de despliegue
const config = require('../config');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para despliegue...\n');

let allChecksPass = true;
const checks = [];

// Función para registrar resultado de verificación
function check(name, condition, message) {
  const status = condition ? '✅' : '❌';
  const fullMessage = `${status} ${name}: ${message}`;
  checks.push({ name, status: condition, message: fullMessage });

  if (!condition) {
    allChecksPass = false;
  }

  console.log(fullMessage);
}

// 1. Verificar configuración crítica
console.log('📋 Verificando configuración...');
check(
  'JWT Secret',
  config.jwt.secret && config.jwt.secret.length >= 32,
  config.jwt.secret && config.jwt.secret.length >= 32
    ? 'JWT secret configurado correctamente'
    : 'JWT secret debe tener al menos 32 caracteres'
);

check(
  'Database Password',
  config.database.password && !config.database.password.includes('change_in_production'),
  config.database.password && !config.database.password.includes('change_in_production')
    ? 'Contraseña de BD configurada'
    : 'Contraseña de BD no configurada para producción'
);

check(
  'Node Environment',
  config.server.nodeEnv === 'production' || config.server.nodeEnv === 'development',
  `Entorno: ${config.server.nodeEnv}`
);

// 2. Verificar archivos necesarios
console.log('\n📁 Verificando archivos...');
const requiredFiles = [
  'package.json',
  '.env',
  'config.js',
  'network-certification-backend.js',
  'Dockerfile',
  'docker-compose.yml'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  check(`Archivo ${file}`, exists, exists ? 'Presente' : 'Faltante');
});

// 3. Verificar directorios
console.log('\n📂 Verificando directorios...');
const requiredDirs = ['uploads', 'logs', 'scripts'];
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, '..', dir));
  check(`Directorio ${dir}`, exists, exists ? 'Presente' : 'Faltante');
});

// 4. Verificar dependencias críticas
console.log('\n📦 Verificando dependencias críticas...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const criticalDeps = [
  'express',
  'pg',
  'jsonwebtoken',
  'bcrypt',
  'cors',
  'helmet',
  'dotenv'
];

criticalDeps.forEach(dep => {
  const exists = packageJson.dependencies && packageJson.dependencies[dep];
  check(`Dependencia ${dep}`, exists, exists ? 'Presente' : 'Faltante');
});

// 5. Verificar configuración de Docker
console.log('\n🐳 Verificando configuración Docker...');
const dockerfileExists = fs.existsSync(path.join(__dirname, '..', 'Dockerfile'));
const dockerComposeExists = fs.existsSync(path.join(__dirname, '..', 'docker-compose.yml'));
const dockerignoreExists = fs.existsSync(path.join(__dirname, '..', '.dockerignore'));

check('Dockerfile', dockerfileExists, dockerfileExists ? 'Presente' : 'Faltante');
check('docker-compose.yml', dockerComposeExists, dockerComposeExists ? 'Presente' : 'Faltante');
check('.dockerignore', dockerignoreExists, dockerignoreExists ? 'Presente' : 'Faltante');

// 6. Verificar conectividad a base de datos (opcional)
console.log('\n🗄️ Verificando conectividad a base de datos...');
if (config.database.password && !config.database.password.includes('change_in_production')) {
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });

  try {
    await pool.query('SELECT 1');
    check('Conexión BD', true, 'Conexión exitosa');
    await pool.end();
  } catch (error) {
    check('Conexión BD', false, `Error de conexión: ${error.message}`);
  }
} else {
  check('Conexión BD', false, 'No se puede verificar sin configuración de BD');
}

// 7. Verificar configuración de seguridad
console.log('\n🔒 Verificando configuración de seguridad...');
check(
  'Rate Limiting',
  config.rateLimit.max > 0,
  `Rate limit configurado: ${config.rateLimit.max} requests/${config.rateLimit.windowMs / 60000}min`
);

check(
  'CORS',
  config.cors.origin && config.cors.origin.length > 0,
  `CORS configurado para ${config.cors.origin.length} orígenes`
);

check(
  'Bcrypt Rounds',
  config.security.bcryptRounds >= 12,
  `Bcrypt rounds: ${config.security.bcryptRounds} (recomendado: 12+)`
);

// Resultado final
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('🎉 ¡Todas las verificaciones pasaron exitosamente!');
  console.log('🚀 El proyecto está listo para despliegue.');
} else {
  console.log('❌ Algunas verificaciones fallaron.');
  console.log('🔧 Revisa los errores arriba antes del despliegue.');
  process.exit(1);
}

console.log('='.repeat(50));

// Mostrar resumen de checks fallidos
const failedChecks = checks.filter(check => !check.status);
if (failedChecks.length > 0) {
  console.log('\n📋 Resumen de problemas encontrados:');
  failedChecks.forEach(check => {
    console.log(`   - ${check.name}`);
  });
}

console.log('\n💡 Para más información, revisa el README.md');