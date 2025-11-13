require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  try {
    console.log('🔄 Iniciando creación de tablas...');

    // Crear tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
        contrasena_hash TEXT NOT NULL,
        rol VARCHAR(50) NOT NULL,
        debe_cambiar_pass INTEGER DEFAULT 0
      )
    `);
    console.log('✅ Tabla usuarios creada');

    // Crear tabla pacientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        dni VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        condicion VARCHAR(50),
        telefono VARCHAR(50),
        direccion TEXT,
        localidad VARCHAR(100),
        fecha_nacimiento VARCHAR(20),
        tipo_afiliado VARCHAR(50),
        sexo VARCHAR(20),
        vinculo_titular VARCHAR(100),
        observaciones TEXT,
        titular_dni VARCHAR(20),
        titular_nombre VARCHAR(255)
      )
    `);
    console.log('✅ Tabla pacientes creada');

    // Crear tabla archivos_paciente
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archivos_paciente (
        id SERIAL PRIMARY KEY,
        paciente_dni VARCHAR(20) REFERENCES pacientes(dni) ON DELETE CASCADE,
        nombre_archivo VARCHAR(255),
        ruta_archivo TEXT
      )
    `);
    console.log('✅ Tabla archivos_paciente creada');

    // Crear tabla prestaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prestaciones (
        id SERIAL PRIMARY KEY,
        paciente_dni VARCHAR(20) REFERENCES pacientes(dni) ON DELETE CASCADE,
        fecha VARCHAR(20),
        prestador VARCHAR(255),
        prestaciones TEXT
      )
    `);
    console.log('✅ Tabla prestaciones creada');

    // Crear usuario admin por defecto
    const adminCheck = await pool.query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, debe_cambiar_pass) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'administrativo', 0]
      );
      console.log('✅ Usuario admin creado (usuario: admin, contraseña: admin123)');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }

    console.log('\n🎉 Base de datos inicializada correctamente\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initDatabase();
