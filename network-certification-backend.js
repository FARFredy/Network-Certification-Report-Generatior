// server.js - Servidor principal Express.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'network_certification',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP'
});
app.use('/api/', limiter);

// Configuración de multer para subida de archivos
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB límite
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_super_secreto_cambialo_en_produccion';

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Funciones de inicialización de la base de datos
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'engineer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de proyectos
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        engineer_id INTEGER REFERENCES users(id),
        engineer_name VARCHAR(100) NOT NULL,
        project_date DATE NOT NULL,
        equipment_reference VARCHAR(200) DEFAULT 'www.wirescope.com',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de cables
    await client.query(`
      CREATE TABLE IF NOT EXISTS cables (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        label VARCHAR(50) NOT NULL,
        result BOOLEAN NOT NULL,
        destination VARCHAR(50) NOT NULL,
        network_type VARCHAR(30) NOT NULL,
        length DECIMAL(10,2) NOT NULL,
        test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Índices para optimizar consultas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cables_project_id ON cables(project_id);
      CREATE INDEX IF NOT EXISTS idx_projects_engineer_id ON projects(engineer_id);
      CREATE INDEX IF NOT EXISTS idx_cables_result ON cables(result);
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
  } finally {
    client.release();
  }
};

// === RUTAS DE AUTENTICACIÓN ===

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'engineer' } = req.body;

    // Validaciones
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role',
      [username, email, passwordHash, fullName, role]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === '23505') { // Violation de unique constraint
      return res.status(409).json({ error: 'El usuario o email ya existe' });
    }
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name, role FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS DE PROYECTOS ===

// Obtener todos los proyectos del usuario
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, COUNT(c.id) as cable_count,
             COUNT(CASE WHEN c.result = true THEN 1 END) as passed_count,
             COUNT(CASE WHEN c.result = false THEN 1 END) as failed_count,
             SUM(c.length) as total_length
      FROM projects p
      LEFT JOIN cables c ON p.id = c.project_id
      WHERE p.engineer_id = $1
    `;

    const params = [req.user.userId];

    if (status && status !== 'all') {
      query += ' AND p.status = $2';
      params.push(status);
    }

    query += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total de proyectos
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE engineer_id = $1' + 
      (status && status !== 'all' ? ' AND status = $2' : ''),
      status && status !== 'all' ? [req.user.userId, status] : [req.user.userId]
    );

    res.json({
      projects: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        engineerName: row.engineer_name,
        projectDate: row.project_date,
        equipmentReference: row.equipment_reference,
        status: row.status,
        createdAt: row.created_at,
        stats: {
          totalCables: parseInt(row.cable_count),
          passed: parseInt(row.passed_count),
          failed: parseInt(row.failed_count),
          totalLength: parseFloat(row.total_length) || 0
        }
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
        totalItems: parseInt(countResult.rows[0].count),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo proyecto
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, engineerName, projectDate, equipmentReference } = req.body;

    if (!name || !engineerName || !projectDate) {
      return res.status(400).json({ error: 'Nombre, ingeniero y fecha son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, engineer_id, engineer_name, project_date, equipment_reference)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, req.user.userId, engineerName, projectDate, equipmentReference || 'www.wirescope.com']
    );

    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener proyecto específico con cables
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener proyecto
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND engineer_id = $2',
      [id, req.user.userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Obtener cables del proyecto
    const cablesResult = await pool.query(
      'SELECT * FROM cables WHERE project_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const project = projectResult.rows[0];
    const cables = cablesResult.rows;

    // Calcular estadísticas
    const stats = {
      totalCables: cables.length,
      passed: cables.filter(c => c.result).length,
      failed: cables.filter(c => !c.result).length,
      totalLength: cables.reduce((sum, c) => sum + parseFloat(c.length), 0)
    };

    res.json({
      project: {
        ...project,
        stats
      },
      cables
    });

  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS DE CABLES ===

// Agregar cable a proyecto
app.post('/api/projects/:projectId/cables', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { label, result, destination, networkType, length, notes } = req.body;

    // Verificar que el proyecto pertenece al usuario
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND engineer_id = $2',
      [projectId, req.user.userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    if (!label || !destination || !networkType || length === undefined) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes' });
    }

    const cableResult = await pool.query(
      `INSERT INTO cables (project_id, label, result, destination, network_type, length, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [projectId, label, result, destination, networkType, parseFloat(length), notes]
    );

    res.status(201).json({
      message: 'Cable agregado exitosamente',
      cable: cableResult.rows[0]
    });

  } catch (error) {
    console.error('Error agregando cable:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Importar cables desde CSV
app.post('/api/projects/:projectId/cables/import', authenticateToken, upload.single('csvFile'), async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verificar proyecto
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND engineer_id = $2',
      [projectId, req.user.userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo CSV requerido' });
    }

    const cables = [];
    const errors = [];

    // Procesar CSV
    return new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const cable = {
              label: row.label || row.etiqueta || '',
              result: row.result === 'true' || row.resultado === '✓' || row.resultado === 'true',
              destination: row.destination || row.destino || '',
              networkType: row.networkType || row.tipo_red || row.network_type || 'Cat. 6A',
              length: parseFloat(row.length || row.longitud || 0),
              notes: row.notes || row.notas || ''
            };

            if (cable.label && cable.destination && cable.length > 0) {
              cables.push(cable);
            } else {
              errors.push(`Fila inválida: ${JSON.stringify(row)}`);
            }
          } catch (error) {
            errors.push(`Error procesando fila: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            // Insertar cables en lote
            const client = await pool.connect();
            await client.query('BEGIN');

            for (const cable of cables) {
              await client.query(
                `INSERT INTO cables (project_id, label, result, destination, network_type, length, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [projectId, cable.label, cable.result, cable.destination, cable.networkType, cable.length, cable.notes]
              );
            }

            await client.query('COMMIT');
            client.release();

            // Eliminar archivo temporal
            fs.unlinkSync(req.file.path);

            res.json({
              message: 'Importación completada',
              imported: cables.length,
              errors: errors.length,
              errorDetails: errors.slice(0, 10) // Solo mostrar primeros 10 errores
            });

          } catch (error) {
            console.error('Error insertando cables:', error);
            res.status(500).json({ error: 'Error procesando importación' });
          }
        })
        .on('error', (error) => {
          console.error('Error leyendo CSV:', error);
          res.status(400).json({ error: 'Error procesando archivo CSV' });
        });
    });

  } catch (error) {
    console.error('Error en importación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS DE REPORTES ===

// Generar reporte PDF
app.get('/api/projects/:id/report/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos del proyecto y cables
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND engineer_id = $2',
      [id, req.user.userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const cablesResult = await pool.query(
      'SELECT * FROM cables WHERE project_id = $1 ORDER BY label, destination',
      [id]
    );

    const project = projectResult.rows[0];
    const cables = cablesResult.rows;

    // Crear PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${project.name.replace(/\s+/g, '_')}.pdf"`);

    doc.pipe(res);

    // Header del reporte
    doc.fontSize(20).text('REPORTE DE CERTIFICACIÓN DE REDES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(project.name, { align: 'center' });
    doc.moveDown();

    // Información del proyecto
    doc.fontSize(12);
    doc.text(`Ingeniero: ${project.engineer_name}`);
    doc.text(`Fecha: ${new Date(project.project_date).toLocaleDateString('es-ES')}`);
    doc.text(`Equipo: ${project.equipment_reference}`);
    doc.moveDown();

    // Tabla de cables
    const tableTop = doc.y;
    const headers = ['Etiqueta', 'Resultado', 'Destino', 'Tipo', 'Longitud'];
    const colWidths = [100, 60, 80, 80, 60];
    let x = 50;

    // Headers de tabla
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i] });
      x += colWidths[i];
    });

    // Línea separadora
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Datos de cables
    let y = tableTop + 20;
    cables.forEach((cable) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      x = 50;
      const rowData = [
        cable.label,
        cable.result ? '✓' : '✗',
        cable.destination,
        cable.network_type,
        `${cable.length} m`
      ];

      rowData.forEach((data, i) => {
        doc.text(data, x, y, { width: colWidths[i] });
        x += colWidths[i];
      });

      y += 20;
    });

    // Estadísticas finales
    const stats = {
      total: cables.length,
      passed: cables.filter(c => c.result).length,
      failed: cables.filter(c => !c.result).length,
      totalLength: cables.reduce((sum, c) => sum + parseFloat(c.length), 0)
    };

    doc.moveDown(2);
    doc.fontSize(14).text('TOTALES GLOBALES', { underline: true });
    doc.fontSize(12);
    doc.text(`Cobre: Pasar ${stats.passed} | Fallar ${stats.failed} | Longitud Total: ${stats.totalLength.toFixed(1)} m`);
    
    doc.moveDown();
    doc.text(`Firma: ${project.engineer_name}`);
    doc.text(`Impreso: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`);

    doc.end();

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error generando reporte' });
  }
});

// === RUTAS DE ESTADÍSTICAS ===

// Dashboard del usuario
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(c.id) as total_cables,
        COUNT(CASE WHEN c.result = true THEN 1 END) as total_passed,
        COUNT(CASE WHEN c.result = false THEN 1 END) as total_failed,
        SUM(c.length) as total_length,
        COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as projects_last_month
      FROM projects p
      LEFT JOIN cables c ON p.id = c.project_id
      WHERE p.engineer_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Proyectos recientes
    const recentProjectsResult = await pool.query(`
      SELECT p.*, COUNT(c.id) as cable_count
      FROM projects p
      LEFT JOIN cables c ON p.id = c.project_id
      WHERE p.engineer_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `, [userId]);

    // Estadísticas por mes (últimos 6 meses)
    const monthlyStatsResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', p.project_date) as month,
        COUNT(DISTINCT p.id) as projects,
        COUNT(c.id) as cables,
        COUNT(CASE WHEN c.result = true THEN 1 END) as passed
      FROM projects p
      LEFT JOIN cables c ON p.id = c.project_id
      WHERE p.engineer_id = $1 
        AND p.project_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', p.project_date)
      ORDER BY month DESC
    `, [userId]);

    res.json({
      stats: {
        totalProjects: parseInt(stats.total_projects),
        totalCables: parseInt(stats.total_cables),
        totalPassed: parseInt(stats.total_passed),
        totalFailed: parseInt(stats.total_failed),
        totalLength: parseFloat(stats.total_length) || 0,
        successRate: stats.total_cables > 0 ? 
          ((parseInt(stats.total_passed) / parseInt(stats.total_cables)) * 100).toFixed(1) : 0,
        projectsLastMonth: parseInt(stats.projects_last_month)
      },
      recentProjects: recentProjectsResult.rows,
      monthlyStats: monthlyStatsResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para manejo de errores
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`🔐 Endpoints protegidos requieren Bearer token`);
    });
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;