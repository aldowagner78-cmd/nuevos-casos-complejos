const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const DBSOURCE = path.join(__dirname, '..', 'data', 'pacientes.db');

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        db.serialize(() => {
            console.log('Creando tablas...');

            // Tabla de Usuarios
            db.run(`CREATE TABLE IF NOT EXISTS usuarios (
                usuario TEXT PRIMARY KEY,
                contrasena_hash TEXT NOT NULL,
                rol TEXT NOT NULL,
                debe_cambiar_pass INTEGER DEFAULT 0
            )`, (err) => {
                if (err) {
                    console.error("Error al crear tabla 'usuarios'", err.message);
                } else {
                    console.log("Tabla 'usuarios' creada o ya existente.");
                }
            });

            // Tabla de Pacientes
            db.run(`CREATE TABLE IF NOT EXISTS pacientes (
                dni TEXT PRIMARY KEY,
                nombre TEXT,
                condicion TEXT,
                ficha_url TEXT,
                telefono TEXT,
                direccion TEXT,
                localidad TEXT,
                fecha_nacimiento TEXT,
                tipo_afiliado TEXT,
                sexo TEXT,
                vinculo_titular TEXT,
                observaciones TEXT,
                titular_dni TEXT,
                titular_nombre TEXT
            )`, (err) => {
                if (err) {
                    console.error("Error al crear tabla 'pacientes'", err.message);
                } else {
                    console.log("Tabla 'pacientes' creada o ya existente.");
                    importPacientes();
                }
            });

            // Tabla de Archivos vinculados a Paciente
            db.run(`CREATE TABLE IF NOT EXISTS archivos_paciente (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paciente_dni TEXT NOT NULL,
                nombre_archivo TEXT NOT NULL,
                ruta_archivo TEXT NOT NULL,
                FOREIGN KEY (paciente_dni) REFERENCES pacientes (dni)
            )`, (err) => {
                if (err) {
                    console.error("Error al crear tabla 'archivos_paciente'", err.message);
                } else {
                    console.log("Tabla 'archivos_paciente' creada o ya existente.");
                }
            });

            // Tabla de Prestaciones
            db.run(`CREATE TABLE IF NOT EXISTS prestaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paciente_dni TEXT,
                fecha TEXT,
                prestador TEXT,
                prestacion TEXT,
                FOREIGN KEY (paciente_dni) REFERENCES pacientes (dni)
            )`, (err) => {
                if (err) {
                    console.error("Error al crear tabla 'prestaciones'", err.message);
                } else {
                    console.log("Tabla 'prestaciones' creada o ya existente.");
                    importPrestaciones();
                }
            });
        });
    }
});

function importPacientes() {
    const filePath = path.join(__dirname, '..', 'data', 'CASOS COMPLEJOS - PACIENTES.csv');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
        console.log('Archivo de pacientes no encontrado. Saltando importación.');
        return;
    }
    
    const stmtPaciente = db.prepare("INSERT OR IGNORE INTO pacientes (dni, nombre, fecha_nacimiento, sexo, condicion, direccion, localidad, telefono, tipo_afiliado, vinculo_titular, titular_dni, titular_nombre, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const stmtArchivo = db.prepare("INSERT INTO archivos_paciente (paciente_dni, nombre_archivo, ruta_archivo) VALUES (?, ?, ?)");
    
    fs.createReadStream(filePath)
      .pipe(csv({ 
          headers: ['dni', 'nombre', 'fecha_nacimiento', 'edad_calculada', 'sexo', 'condicion', 'direccion', 'localidad', 'telefono', 'tipo_afiliado', 'vinculo_titular', 'titular_dni', 'titular_nombre', 'ficha_url_1', 'ficha_url_2', 'ficha_url_3', 'ficha_url_4', 'ficha_url_5', 'observaciones'],
          skipLines: 1
      }))
      .on('data', (row) => {
          if (row.dni && row.nombre) {
              // Insertar paciente
              stmtPaciente.run(
                  row.dni.trim(), 
                  row.nombre.trim(), 
                  row.fecha_nacimiento ? row.fecha_nacimiento.trim() : null,
                  row.sexo ? row.sexo.trim() : null,
                  row.condicion ? row.condicion.trim() : null,
                  row.direccion ? row.direccion.trim() : null,
                  row.localidad ? row.localidad.trim() : null,
                  row.telefono ? row.telefono.trim() : null,
                  row.tipo_afiliado ? row.tipo_afiliado.trim() : null,
                  row.vinculo_titular ? row.vinculo_titular.trim() : null,
                  row.titular_dni ? row.titular_dni.trim() : null,
                  row.titular_nombre ? row.titular_nombre.trim() : null,
                  row.observaciones ? row.observaciones.trim() : null
              );
              
              // Insertar URLs de fichas como archivos adjuntos
              const urls = [
                  { url: row.ficha_url_1, nombre: 'Ficha 1' },
                  { url: row.ficha_url_2, nombre: 'Ficha 2' },
                  { url: row.ficha_url_3, nombre: 'Ficha 3' },
                  { url: row.ficha_url_4, nombre: 'Ficha 4' },
                  { url: row.ficha_url_5, nombre: 'Ficha 5' }
              ];
              
              urls.forEach((item, idx) => {
                  if (item.url && item.url.trim() !== '') {
                      stmtArchivo.run(row.dni.trim(), `${item.nombre} (Google Drive)`, item.url.trim());
                  }
              });
          }
      })
      .on('end', () => {
          console.log('Importación de PACIENTES.csv completada.');
          stmtPaciente.finalize();
          stmtArchivo.finalize();
      });
}

function importPrestaciones() {
    const filePath = path.join(__dirname, '..', 'data', 'CASOS COMPLEJOS - CARGA.csv');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
        console.log('Archivo de prestaciones no encontrado. Saltando importación.');
        return;
    }
    
    const stmt = db.prepare("INSERT INTO prestaciones (paciente_dni, fecha, prestador, prestacion) VALUES (?, ?, ?, ?)");
    
    fs.createReadStream(filePath)
      .pipe(csv({ 
          headers: ['dni', 'nombre', 'fecha', 'prestador', 'prestacion'], 
          skipLines: 1,  // Saltar la primera línea (encabezados)
          escape: '"',   // Carácter de escape
          quote: '"'     // Carácter de comillas para campos con saltos de línea
      }))
      .on('data', (row) => {
          if (row.dni && row.fecha && row.prestador && row.prestacion) {
              let fecha = row.fecha.trim();
              if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                  const [y, m, d] = fecha.split('-');
                  fecha = `${d}/${m}/${y}`;
              }
              // Normalizar prestacion: reemplazar saltos de línea por espacios y limpiar espacios múltiples
              let prestacion = row.prestacion.trim().replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
              // Insertar: paciente_dni, fecha, prestador, prestacion (ignoramos 'nombre' del CSV)
              stmt.run(row.dni.trim(), fecha, row.prestador.trim(), prestacion);
          }
      })
      .on('end', () => {
          console.log('Importación de CARGA.csv completada.');
          stmt.finalize();
          db.close(() => {
              console.log('Base de datos cerrada.');
          });
      });
}
