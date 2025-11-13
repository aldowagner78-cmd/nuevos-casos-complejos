
// --- Ruta para callback de Google OAuth ---
// (Debe ir después de const app = express();)
// ...
// (Colocar esto después de inicializar app y antes de https.createServer)
// --- Middlewares ---
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer'); 
const fs = require('fs');
require('dotenv').config(); 


const app = express();

// --- Ruta para callback de Google OAuth ---
app.get('/callback', async (req, res) => {
    res.send('Autorización de Google completada. Ya puedes cerrar esta ventana.');
});

// --- Middlewares personalizados ---
const checkSession = (req, res, next) => {
    if (req.session && req.session.usuario) next();
    else res.status(401).json({ error: 'No autorizado. Por favor, inicie sesión.' });
};

const checkAdmin = (req, res, next) => {
    if (req.session && req.session.rol === 'administrativo') next();
    else res.status(403).json({ error: 'Acción prohibida. Requiere rol de Administrador.' });
};


const session = require('express-session');
const bcrypt = require('bcryptjs');

// --- Diccionario de tildes ---
const DICCIONARIO_TILDES = require(path.join(__dirname, 'diccionario_tildes.json'));

// --- Función de normalización de nombres con tildes ---
function normalizarNombre(nombre) {
    if (!nombre) return '';
    
    // Limpiar espacios múltiples
    nombre = nombre.trim().replace(/\s+/g, ' ');
    
    // Capitalizar cada palabra y aplicar corrección de tildes
    const palabras = nombre.split(' ');
    const palabrasNormalizadas = palabras.map(palabra => {
        if (!palabra) return palabra;
        
        // Quitar tildes para comparar con el diccionario
        const sinTilde = palabra.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
        
        // Buscar en diccionario si hay corrección de tilde
        if (DICCIONARIO_TILDES[sinTilde]) {
            return DICCIONARIO_TILDES[sinTilde];
        }
        
        // Si no está en el diccionario, simplemente capitalizar
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    });
    
    return palabrasNormalizadas.join(' ');
}

// ...existing code...
const port = process.env.PORT || 3000;

// --- Importar módulo de archivos de pacientes (Ruta 1) ---
const archivosPacienteRouter = require('./archivosPacienteApi');

// --- Importar el nuevo Uploader de Google Drive (Para Rutas 2 y 3) ---
const { processAndUpload } = require('./cloudinaryUploader');

// --- Claves Secretas ---
const SECRET_SESSION = 'un_secreto_muy_fuerte_para_las_sesiones';
const CODIGO_ADMIN = 'ADMIN123';
const CODIGO_AUDITOR = 'AUDITOR123';
const PASS_RESET_GENERICA = '111111';

// --- Middlewares ---
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '..', 'frontend'))); 
// Servir archivos locales antiguos (si existen)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); 

// Configuración de Sesión
app.use(session({
    secret: SECRET_SESSION,
    resave: false,
    saveUninitialized: false, 
    cookie: { 
        secure: false, // Solo true en producción HTTPS
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas por defecto
    }
}));

// --- Conexión a Base de Datos ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error de conexión:', err));


// --- API: Obtener lista única de prestadores ---
app.get('/api/prestadores', checkSession, async (req, res) => {
    const sql = `
        SELECT DISTINCT prestador 
        FROM prestaciones 
        WHERE prestador IS NOT NULL AND prestador != ''
        ORDER BY prestador ASC
    `;
    try { const result = await pool.query(sql, []); const rows = result.rows;
        if (err) {
            console.error("Error obteniendo prestadores:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows.map(row => row.prestador));
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

// --- API: Obtener lista única de años ---
app.get('/api/anios-prestaciones', checkSession, async (req, res) => {
    const sql = `
        SELECT DISTINCT 
            CASE 
                WHEN fecha LIKE '__/__/____' THEN SUBSTRING(fecha, -4)
                WHEN fecha LIKE '_/__/____' THEN SUBSTRING(fecha, -4)
                ELSE NULL
            END AS anio
        FROM prestaciones 
        WHERE fecha IS NOT NULL
    `;
    try { const result = await pool.query(sql, []); const rows = result.rows;
        if (err) {
            console.error("Error obteniendo años:", err.message);
            return res.status(500).json({ error: err.message });
        }
        const anios = rows
            .map(row => row.anio)
            .filter(anio => anio && /^\d{4}$/.test(anio))
            .sort((a, b) => b - a); // Ordenar descendente
        
        // Eliminar duplicados
        const aniosUnicos = [...new Set(anios)];
        res.json(aniosUnicos);
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

// --- API: Búsqueda Avanzada ---
app.get('/api/busqueda-avanzada', checkSession, async (req, res) => {
    const { afiliado, localidad, condicion, tipo_afiliado, prestador, anio } = req.query;

    console.log('=== BÚSQUEDA AVANZADA ===');
    console.log('Filtros recibidos:', { afiliado, localidad, condicion, tipo_afiliado, prestador, anio });

    let sql = `SELECT DISTINCT p.dni, p.nombre FROM pacientes p`;
    const joins = [];
    const wheres = [];
    const params = [];

    // Filtro: Afiliado (nombre, apellido o DNI exacto)
    if (afiliado && afiliado.trim()) {
        const valor = afiliado.trim();
        if (/^\d+$/.test(valor)) {
            // Es número: buscar DNI exacto
            wheres.push("p.dni = $1");
            params.push(valor);
        } else {
            // Es texto: buscar en nombre SOLO AL INICIO (normalizado Unicode, maneja Ñ, Ü, todos los acentos)
            const normalizado = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            // Normalizar también el nombre de la BD - IMPORTANTE: incluir minúsculas Y mayúsculas
            wheres.push("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(p.nombre), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') LIKE $2 || '%'");
            params.push(normalizado);
        }
    }

    // Filtro: Localidad (normalizado, maneja tildes y ñ - minúsculas Y mayúsculas)
    if (localidad && localidad.trim()) {
        const localidadNorm = localidad.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        wheres.push("p.localidad IS NOT NULL AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(p.localidad), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') LIKE '%' || $3 || '%'");
        params.push(localidadNorm);
    }

    // Filtro: Condición
    if (condicion && condicion !== '') {
        wheres.push("p.condicion = $4");
        params.push(condicion);
    }

    // Filtro: Tipo Afiliado
    if (tipo_afiliado && tipo_afiliado !== '') {
        wheres.push("UPPER(p.tipo_afiliado) = UPPER($5)");
        params.push(tipo_afiliado);
    }

    // Filtros de Prestaciones (INNER JOIN para solo incluir pacientes CON prestaciones que cumplan criterios)
    if (prestador || anio) {
        joins.push("INNER JOIN prestaciones pr ON p.dni = pr.paciente_dni");
        if (prestador && prestador.trim()) {
            // Normalizar prestador (tildes y mayúsculas/minúsculas)
            const prestadorNorm = prestador.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            wheres.push("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(pr.prestador), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') = $6");
            params.push(prestadorNorm);
        }
        if (anio && /^\d{4}$/.test(anio)) {
            // Validar rango razonable: desde 2000 hasta 2030
            const anioNum = parseInt(anio);
            if (anioNum < 2000 || anioNum > 2030) {
                console.log('Año fuera de rango válido (2000-2030)');
                return res.status(400).json({ error: 'El año debe estar entre 2000 y 2030.' });
            }
            // Buscar fecha en formato DD/MM/YYYY extrayendo último componente
            wheres.push("pr.fecha LIKE '%/' || $7");
            params.push(anio);
        }
    }

    // Validar que al menos un filtro esté activo
    if (wheres.length === 0) {
        console.log('No se especificaron filtros válidos');
        return res.json([]);
    }

    // Construir query SIN límite - mostrar TODOS los resultados
    if (joins.length > 0) sql += " " + joins.join(" ");
    sql += " WHERE " + wheres.join(" AND ");
    sql += " ORDER BY p.nombre ASC";

    console.log('SQL generado:', sql);
    console.log('Parámetros:', params);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("Error en búsqueda avanzada:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Resultados encontrados: ${rows.length}`);
        
        // Si no hay resultados, buscar alternativas relajando filtros progresivamente
        if (rows.length === 0) {
            const filtrosActivos = [];
            if (afiliado) filtrosActivos.push('afiliado');
            if (localidad) filtrosActivos.push('localidad');
            if (condicion) filtrosActivos.push('condicion');
            if (tipo_afiliado) filtrosActivos.push('tipo_afiliado');
            if (prestador) filtrosActivos.push('prestador');
            if (anio) filtrosActivos.push('anio');

            // Intentar búsquedas alternativas quitando filtros de menor prioridad
            const alternativas = [];
            
            // Prioridad: afiliado > condicion > tipo_afiliado > localidad > prestador > anio
            const prioridades = [
                { quitar: ['anio'], descripcion: 'sin filtro de año' },
                { quitar: ['prestador'], descripcion: 'sin filtro de prestador' },
                { quitar: ['prestador', 'anio'], descripcion: 'sin filtros de prestaciones' },
                { quitar: ['localidad'], descripcion: 'sin filtro de localidad' },
                { quitar: ['localidad', 'prestador'], descripcion: 'sin localidad ni prestador' },
                { quitar: ['tipo_afiliado'], descripcion: 'sin filtro de tipo afiliado' }
            ];

            let busquedasRealizadas = 0;
            const maxBusquedas = 3; // Limitar a 3 búsquedas alternativas

            function buscarAlternativa(index) {
                if (index >= prioridades.length || busquedasRealizadas >= maxBusquedas) {
                    // Enviar respuesta con alternativas encontradas
                    return res.json({
                        resultados: [],
                        total: 0,
                        limitado: false,
                        alternativas: alternativas
                    });
                }

                const alt = prioridades[index];
                // Verificar que los filtros a quitar existan
                const sePuedeQuitar = alt.quitar.every(f => filtrosActivos.includes(f));
                
                if (!sePuedeQuitar) {
                    return buscarAlternativa(index + 1);
                }

                // Construir query alternativa
                const filtrosAlt = { afiliado, localidad, condicion, tipo_afiliado, prestador, anio };
                alt.quitar.forEach(f => delete filtrosAlt[f]);

                // Reconstruir SQL para alternativa
                let sqlAlt = `SELECT DISTINCT p.dni, p.nombre FROM pacientes p`;
                const joinsAlt = [];
                const wheresAlt = [];
                const paramsAlt = [];

                if (filtrosAlt.afiliado && filtrosAlt.afiliado.trim()) {
                    const valor = filtrosAlt.afiliado.trim();
                    if (/^\d+$/.test(valor)) {
                        wheresAlt.push("p.dni = $1");
                        paramsAlt.push(valor);
                    } else {
                        const normalizado = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                        wheresAlt.push("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(p.nombre), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') LIKE $2 || '%'");
                        paramsAlt.push(normalizado);
                    }
                }

                if (filtrosAlt.localidad && filtrosAlt.localidad.trim()) {
                    const localidadNorm = filtrosAlt.localidad.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                    wheresAlt.push("p.localidad IS NOT NULL AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(p.localidad), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') LIKE '%' || $3 || '%'");
                    paramsAlt.push(localidadNorm);
                }

                if (filtrosAlt.condicion && filtrosAlt.condicion !== '') {
                    wheresAlt.push("p.condicion = $4");
                    paramsAlt.push(filtrosAlt.condicion);
                }

                if (filtrosAlt.tipo_afiliado && filtrosAlt.tipo_afiliado !== '') {
                    wheresAlt.push("UPPER(p.tipo_afiliado) = UPPER($5)");
                    paramsAlt.push(filtrosAlt.tipo_afiliado);
                }

                if (filtrosAlt.prestador || filtrosAlt.anio) {
                    joinsAlt.push("INNER JOIN prestaciones pr ON p.dni = pr.paciente_dni");
                    if (filtrosAlt.prestador && filtrosAlt.prestador.trim()) {
                        const prestadorNorm = filtrosAlt.prestador.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                        wheresAlt.push("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(pr.prestador), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') = $6");
                        paramsAlt.push(prestadorNorm);
                    }
                    if (filtrosAlt.anio && /^\d{4}$/.test(filtrosAlt.anio)) {
                        wheresAlt.push("pr.fecha LIKE '%/' || $7");
                        paramsAlt.push(filtrosAlt.anio);
                    }
                }

                if (wheresAlt.length === 0) {
                    return buscarAlternativa(index + 1);
                }

                if (joinsAlt.length > 0) sqlAlt += " " + joinsAlt.join(" ");
                sqlAlt += " WHERE " + wheresAlt.join(" AND ");
                sqlAlt += " ORDER BY p.nombre ASC"; // Sin límite, mostrar TODOS

                busquedasRealizadas++;

                db.all(sqlAlt, paramsAlt, (err, rowsAlt) => {
                    if (!err && rowsAlt.length > 0) {
                        alternativas.push({
                            descripcion: alt.descripcion,
                            filtrosQuitados: alt.quitar,
                            cantidad: rowsAlt.length,
                            primeros: rowsAlt // Enviar TODOS los resultados
                        });
                    }
                    buscarAlternativa(index + 1);
                });
            }

            return buscarAlternativa(0);
        }
        
        // Enviar TODOS los resultados sin límite
        const response = {
            resultados: rows,
            total: rows.length,
            limitado: false // Sin límite, siempre devuelve TODOS
        };
        res.json(response);
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

// --- Configuración de Multer (Manejo de archivos) ---
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const mimetypes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    if (mimetypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});




// --- Rutas de NAVEGACIÓN ---
app.get('/', async (req, res) => {
    if (req.session && req.session.usuario) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
    }
});
app.get('/login.html', async (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html')));
app.get('/register.html', async (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html')));


// --- API de AUTENTICACIÓN ---
app.post('/api/register', async (req, res) => {
    const { usuario, contrasena, codigo_registro } = req.body;
    let rol;
    if (codigo_registro === CODIGO_ADMIN) rol = 'administrativo';
    else if (codigo_registro === CODIGO_AUDITOR) rol = 'auditor';
    else return res.status(400).json({ error: 'Código de Registro incorrecto.' });

    try {
        const contrasena_hash = await bcrypt.hash(contrasena, 10);
        const sql = 'INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol) VALUES ($8, $9, $10)';
        try { await pool.query(sql, [usuario, contrasena_hash, rol]);
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            // --- INICIO: Auto-Login después de Registro ---
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 horas (default)
            req.session.usuario = usuario;
            req.session.rol = rol;
            req.session.debe_cambiar_pass = 0; // Es un usuario nuevo
            // --- FIN: Auto-Login ---
            res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        } catch (err) { return res.status(500).json({ error: err.message }); }});
    } catch (error) {
        res.status(500).json({ error: 'Error al encriptar la contraseña.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { usuario, contrasena, rememberMe } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE nombre_usuario = $11';
    db.get(sql, [usuario], async (err, row) => {if (!row) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

        const match = await bcrypt.compare(contrasena, row.contrasena_hash);
        if (match) {
            req.session.usuario = row.nombre_usuario;
            req.session.rol = row.rol;
            req.session.debe_cambiar_pass = row.debe_cambiar_pass;

            // Ajustar duración de la cookie de sesión según rememberMe
            if (rememberMe) {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 días
            } else {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // 24 horas
            }

            res.json({ 
                message: 'Login exitoso.',
                usuario: row.nombre_usuario,
                rol: row.rol,
                debe_cambiar_pass: row.debe_cambiar_pass
            });
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        }
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

app.get('/api/logout', async (req, res) => {
    req.session.destroy((err) => {res.clearCookie('connect.sid'); 
        res.json({ message: 'Sesión cerrada.' });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});

app.get('/api/session', checkSession, async (req, res) => {
    res.json({
        usuario: req.session.usuario,
        rol: req.session.rol,
        debe_cambiar_pass: req.session.debe_cambiar_pass
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

app.post('/api/change-password', checkSession, async (req, res) => {
    const { nueva_contrasena } = req.body;
    const usuario = req.session.usuario;
    try {
        const contrasena_hash = await bcrypt.hash(nueva_contrasena, 10);
        const sql = 'UPDATE usuarios SET contrasena_hash = $12, debe_cambiar_pass = 0 WHERE nombre_usuario = $13';
        try { await pool.query(sql, [contrasena_hash, usuario]);req.session.debe_cambiar_pass = 0;
            res.json({ message: 'Contraseña actualizada exitosamente.' });
        } catch (err) { return res.status(500).json({ error: err.message }); }});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la contraseña.' });
    }
});


// --- API de ADMINISTRACIÓN ---
app.get('/api/admin/users', checkSession, checkAdmin, (req, res) => {
    const sql = 'SELECT usuario, rol FROM usuarios WHERE usuario != $14';
    try { const result = await pool.query(sql, [req.session.usuario]); const rows = result.rows;res.json(rows);
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

app.post('/api/admin/reset-password', checkSession, checkAdmin, async (req, res) => {
    const { usuario_a_resetear } = req.body;
    try {
        const contrasena_hash = await bcrypt.hash(PASS_RESET_GENERICA, 10);
        const sql = 'UPDATE usuarios SET contrasena_hash = $15, debe_cambiar_pass = 1 WHERE nombre_usuario = $16';
        try { await pool.query(sql, [contrasena_hash, usuario_a_resetear]);res.json({ message: `Contraseña de ${usuario_a_resetear} reseteada a '${PASS_RESET_GENERICA}'.` });
        } catch (err) { return res.status(500).json({ error: err.message }); }});
    } catch (error) {
        res.status(500).json({ error: 'Error al resetear la contraseña.' });
    }
});

app.delete('/api/admin/user/:usuario', checkSession, checkAdmin, (req, res) => {
    const usuario_a_eliminar = req.params.usuario;
    if (usuario_a_eliminar === req.session.usuario) {
        return res.status(403).json({ error: 'No puede eliminarse a sí mismo.' });
    }
    const sql = 'DELETE FROM usuarios WHERE nombre_usuario = $1';
    try { await pool.query(sql, [usuario_a_eliminar]);if (this.changes === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.json({ message: `Usuario ${usuario_a_eliminar} eliminado exitosamente.` });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});

app.post('/api/admin/change-role', checkSession, checkAdmin, (req, res) => {
    const { usuario_a_cambiar, nuevo_rol } = req.body;

    if (usuario_a_cambiar === req.session.usuario) {
        return res.status(403).json({ error: 'No puede cambiar su propio rol.' });
    }

    if (nuevo_rol !== 'administrativo' && nuevo_rol !== 'auditor') {
        return res.status(400).json({ error: 'Rol no válido.' });
    }

    const sql = 'UPDATE usuarios SET rol = $1 WHERE nombre_usuario = $2';
    try { await pool.query(sql, [nuevo_rol, usuario_a_cambiar]);
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Rol de ${usuario_a_cambiar} actualizado a ${nuevo_rol}.` });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});


// --- API de ARCHIVOS DE PACIENTES (Ruta 1 - Modal) ---
app.use(archivosPacienteRouter);


// --- API de PACIENTES ---
app.get('/api/buscar-pacientes-fragmento', checkSession, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 3) {
            return res.status(400).json({ error: 'Debe ingresar al menos 3 caracteres.' });
        }

        const normalizar = (txt) => txt $1 txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim() : '';
        const q = normalizar(query);

        // Buscar con normalización completa en ambos lados
        const sql = `SELECT dni, nombre FROM pacientes WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(nombre), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N'), 'Ü', 'U'), 'À', 'A'), 'È', 'E'), 'Ò', 'O'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ñ', 'n'), 'ü', 'u'), 'à', 'a'), 'è', 'e'), 'ò', 'o') LIKE $1`;
        const params = [q + '%'];

        db.all(sql, params, (err, rows) => {res.json(rows);
        });

    } catch (e) {
        res.status(500).json({ error: 'Error inesperado en el servidor.' });
    }
});


// *** INICIO DE CORRECCIÓN: Error de duplicación de prestaciones ***
app.get('/api/buscar-paciente', checkSession, async (req, res) => {
    const { query } = req.query; 
    let sqlQuery = `
        SELECT p.*, 
               json_agg(
                   CASE WHEN pr.id IS NOT NULL THEN 
                       json_object(
                           'id', pr.id, 
                           'fecha', pr.fecha, 
                           'prestador', pr.prestador, 
                           'prestacion', pr.prestacion
                       ) 
                   ELSE NULL END
               ) FILTER (WHERE pr.id IS NOT NULL) as prestaciones
        FROM pacientes p
        LEFT JOIN prestaciones pr ON p.dni = pr.paciente_dni
    `;
    let params = [];

    if (!query) {
        return res.status(400).json({ error: 'Debe proveer un término de búsqueda' });
    }

    // Si el input es numérico, buscar por número aunque tenga letras/símbolos antes
    const soloNumeros = query.replace(/\D/g, '');
    if (soloNumeros.length > 0 && /^\d+$/.test(query)) {
        sqlQuery += ` WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(p.dni), 'F', ''), 'M', ''), '-', ''), '_', ''), ' ', '') LIKE $1`;
        params.push(`%${soloNumeros}`);
    } else {
        // Búsqueda por nombre con normalización de tildes - SOLO AL INICIO DEL CAMPO
        const queryNormalizado = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        sqlQuery += ' WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(p.nombre), \'Á\', \'A\'), \'É\', \'E\'), \'Í\', \'I\'), \'Ó\', \'O\'), \'Ú\', \'U\'), \'Ñ\', \'N\'), \'Ü\', \'U\'), \'À\', \'A\'), \'È\', \'E\'), \'Ò\', \'O\'), \'á\', \'a\'), \'é\', \'e\'), \'í\', \'i\'), \'ó\', \'o\'), \'ú\', \'u\'), \'ñ\', \'n\'), \'ü\', \'u\'), \'à\', \'a\'), \'è\', \'e\'), \'ò\', \'o\') LIKE $1';
        params.push(queryNormalizado + '%');
    }

    sqlQuery += ' GROUP BY p.dni';

    db.get(sqlQuery, params, (err, row) => {
        if (err) {
            console.error("Error en consulta buscar-paciente:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            try {
                if (row.prestaciones) row.prestaciones = JSON.parse(row.prestaciones).filter(p => p !== null);
                else row.prestaciones = [];
            } catch(e) { row.prestaciones = []; }
            row.archivos = [];
            res.json(row);
        } else {
            res.status(404).json({ message: 'Paciente no encontrado' });
        }
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});
// *** FIN DE CORRECCIÓN ***

// --- API "NUEVO PACIENTE" (Ruta 2 - Modificada para Nombre) ---
app.post('/api/nuevo-paciente', checkSession, checkAdmin, upload.array('archivos', 5), async (req, res) => {
    const { dni, nombre, condicion, telefono, direccion, localidad, fecha_nacimiento, tipo_afiliado, sexo, vinculo_titular, observaciones, titular_dni, titular_nombre } = req.body;
    const files = req.files || [];

    if (!dni || !nombre) return res.status(400).json({ error: 'DNI y Nombre obligatorios' });

    // Normalización modo oración
    function sentenceCase(txt) {
        if (!txt) return '';
        txt = String(txt).trim();
        const sentences = txt.match(/[^.!$2]+[.!$3]*|[^.!$4]+$/g) || [];
        let finalResult = sentences.map(sentence => {
            sentence = sentence.trim();
            if (!sentence) return '';
            const words = sentence.split(' ');
            let processedWords = [];
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (!word) continue;
                let punctuation = '';
                const puncMatch = word.match(/[.,!$5;:)]*$/);
                let coreWord = word;
                if (puncMatch) {
                    punctuation = puncMatch[0];
                    coreWord = word.substring(0, word.length - punctuation.length);
                }
                let prefix = '';
                const prefixMatch = coreWord.match(/^[(¿¡]*/);
                if (prefixMatch) {
                    prefix = prefixMatch[0];
                    coreWord = coreWord.substring(prefix.length);
                }
                if (!coreWord) {
                    processedWords.push(word);
                    continue;
                }
                const isAllUpper = coreWord === coreWord.toUpperCase() && coreWord.length > 1;
                const isProper = coreWord.length > 0 && coreWord[0] === coreWord[0].toUpperCase() && !isAllUpper;
                if (i === 0) {
                    if (isAllUpper) {
                        processedWords.push(word);
                    } else {
                        processedWords.push(prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + punctuation);
                    }
                } else {
                    if (isAllUpper) {
                        processedWords.push(word);
                    } else if (isProper) {
                        processedWords.push(prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + punctuation);
                    } else {
                        processedWords.push(prefix + coreWord.toLowerCase() + punctuation);
                    }
                }
            }
            return processedWords.join(' ');
        });
        return finalResult.join(' ').replace(/(\s+)/g, ' ');
    }

    const nombreNorm = normalizarNombre(nombre);
    const condicionNorm = sentenceCase(condicion);
    const telefonoNorm = telefono $6 telefono.trim() : '';
    const direccionNorm = sentenceCase(direccion);
    const localidadNorm = sentenceCase(localidad);
    const tipoAfiliadoNorm = sentenceCase(tipo_afiliado);
    const sexoNorm = sentenceCase(sexo);
    const vinculoNorm = sentenceCase(vinculo_titular);
    const observacionesNorm = sentenceCase(observaciones);
    const titularDniNorm = titular_dni $7 titular_dni.trim() : '';
    const titularNombreNorm = normalizarNombre(titular_nombre);

    const sql = `INSERT INTO pacientes (dni, nombre, condicion, telefono, direccion, localidad, fecha_nacimiento, tipo_afiliado, sexo, vinculo_titular, observaciones, titular_dni, titular_nombre) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;

    db.run(sql, [dni, nombreNorm, condicionNorm, telefonoNorm, direccionNorm, localidadNorm, fecha_nacimiento, tipoAfiliadoNorm, sexoNorm || null, vinculoNorm || null, observacionesNorm || null, titularDniNorm || null, titularNombreNorm || null], async function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'El DNI ya existe' });
            return res.status(500).json({ error: err.message });
        }

        const pacienteId = this.lastID;

        // Subir archivos a Google Drive con Nombre o DNI
        if (files.length > 0) {
            try {
                // Usamos el 'nombre' del formulario, o el 'dni' como fallback
                const identifier = nombre || dni; 

                const uploadPromises = files.map(file => 
                    processAndUpload(file, identifier) // Procesa y sube a Drive
                        .then(driveLink => ({
                            originalName: file.originalname,
                            link: driveLink
                        }))
                );
                const uploadedFiles = await Promise.all(uploadPromises);

                // Guardar referencias en la base de datos
                const dbInserts = uploadedFiles.map(file => {
                    return new Promise((resolve, reject) => {
                        db.run('INSERT INTO archivos_paciente (paciente_dni, nombre_archivo, ruta_archivo) VALUES ($1, $2, $3)',
                            [dni, file.originalName, file.link],
                            (err) => err $4 reject(err) : resolve()
                        );
                    });
                } catch (err) { return res.status(500).json({ error: err.message }); }});
                await Promise.all(dbInserts);

                res.status(201).json({ message: 'Paciente creado y archivos subidos a Drive', id: pacienteId, dni: dni });

            } catch (driveError) {
                console.error("Error al subir archivos a Drive:", driveError.message);
                res.status(201).json({ message: 'Paciente creado, pero hubo un error al subir archivos a Drive.', id: pacienteId, dni: dni });
            }
        } else {
            res.status(201).json({ message: 'Paciente creado', id: pacienteId, dni: dni });
        }
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

// --- API "EDITAR PACIENTE" (Ruta 3 - Modificada para Nombre) ---
app.post('/api/editar-paciente/:dni', checkSession, checkAdmin, upload.array('archivos', 5), async (req, res) => {
    const dni = req.params.dni;
    const { nombre, condicion, telefono, direccion, localidad, fecha_nacimiento, tipo_afiliado, sexo, vinculo_titular, observaciones, titular_dni, titular_nombre } = req.body;
    const files = req.files || [];

    if (!nombre || !condicion) {
        return res.status(400).json({ error: 'Nombre y Condición son requeridos.' });
    }

    // Normalización modo oración
    function sentenceCase(txt) {
        if (!txt) return '';
        txt = String(txt).trim();
        const sentences = txt.match(/[^.!$5]+[.!$6]*|[^.!$7]+$/g) || [];
        let finalResult = sentences.map(sentence => {
            sentence = sentence.trim();
            if (!sentence) return '';
            const words = sentence.split(' ');
            let processedWords = [];
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (!word) continue;
                let punctuation = '';
                const puncMatch = word.match(/[.,!$8;:)]*$/);
                let coreWord = word;
                if (puncMatch) {
                    punctuation = puncMatch[0];
                    coreWord = word.substring(0, word.length - punctuation.length);
                }
                let prefix = '';
                const prefixMatch = coreWord.match(/^[(¿¡]*/);
                if (prefixMatch) {
                    prefix = prefixMatch[0];
                    coreWord = coreWord.substring(prefix.length);
                }
                if (!coreWord) {
                    processedWords.push(word);
                    continue;
                }
                const isAllUpper = coreWord === coreWord.toUpperCase() && coreWord.length > 1;
                const isProper = coreWord.length > 0 && coreWord[0] === coreWord[0].toUpperCase() && !isAllUpper;
                if (i === 0) {
                    if (isAllUpper) {
                        processedWords.push(word);
                    } else {
                        processedWords.push(prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + punctuation);
                    }
                } else {
                    if (isAllUpper) {
                        processedWords.push(word);
                    } else if (isProper) {
                        processedWords.push(prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + punctuation);
                    } else {
                        processedWords.push(prefix + coreWord.toLowerCase() + punctuation);
                    }
                }
            }
            return processedWords.join(' ');
        });
        return finalResult.join(' ').replace(/(\s+)/g, ' ');
    }

    const nombreNorm = normalizarNombre(nombre);
    const condicionNorm = sentenceCase(condicion);
    const telefonoNorm = telefono $9 telefono.trim() : '';
    const direccionNorm = sentenceCase(direccion);
    const localidadNorm = sentenceCase(localidad);
    const tipoAfiliadoNorm = sentenceCase(tipo_afiliado);
    const sexoNorm = sentenceCase(sexo);
    const vinculoNorm = sentenceCase(vinculo_titular);
    const observacionesNorm = sentenceCase(observaciones);
    const titularDniNorm = titular_dni $10 titular_dni.trim() : '';
    const titularNombreNorm = normalizarNombre(titular_nombre);

    const sql = `UPDATE pacientes 
         SET nombre = $1, condicion = $2, telefono = $3, direccion = $4, localidad = $5, fecha_nacimiento = $6, tipo_afiliado = $7, sexo = $8, vinculo_titular = $9, observaciones = $10, titular_dni = $11, titular_nombre = $12
         WHERE dni = $13`;

    db.run(sql, [nombreNorm, condicionNorm, telefonoNorm, direccionNorm, localidadNorm, fecha_nacimiento, tipoAfiliadoNorm, sexoNorm || null, vinculoNorm || null, observacionesNorm || null, titularDniNorm || null, titularNombreNorm || null, dni], async function(err) {
        if (err) {
            console.error("Error al actualizar paciente:", err.message);
            return res.status(500).json({ error: 'Error interno al actualizar el paciente.', details: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado para actualizar.' });
        }

        // Subir archivos a Google Drive con Nombre o DNI
        if (files.length > 0) {
            try {
                // Usamos el 'nombre' del formulario, o el 'dni' como fallback
                const identifier = nombre || dni;

                const uploadPromises = files.map(file => 
                    processAndUpload(file, identifier) // Procesa y sube a Drive
                        .then(driveLink => ({
                            originalName: file.originalname,
                            link: driveLink
                        }))
                );
                const uploadedFiles = await Promise.all(uploadPromises);

                // Guardar referencias en la base de datos
                const dbInserts = uploadedFiles.map(file => {
                    return new Promise((resolve, reject) => {
                        db.run('INSERT INTO archivos_paciente (paciente_dni, nombre_archivo, ruta_archivo) VALUES ($1, $2, $3)',
                            [dni, file.originalName, file.link],
                            (err) => err $4 reject(err) : resolve()
                        );
                    });
                } catch (err) { return res.status(500).json({ error: err.message }); }});
                await Promise.all(dbInserts);

                res.json({ message: 'Paciente actualizado y archivos subidos a Drive.' });

            } catch (driveError) {
                console.error("Error al subir archivos a Drive:", driveError.message);
                res.json({ message: 'Paciente actualizado, pero hubo un error al guardar archivos en Drive.' });
            }
        } else {
            res.json({ message: 'Paciente actualizado exitosamente.' });
        }
    });
} catch (err) { return res.status(500).json({ error: err.message }); }});

// --- API PRESTACIONES ---
app.post('/api/nueva-prestacion', checkSession, checkAdmin, (req, res) => {
    const { paciente_dni, fecha, prestador, prestaciones } = req.body;
    if (!paciente_dni || !fecha) return res.status(400).json({ error: 'DNI y Fecha obligatorios' });
    if (!prestaciones || !Array.isArray(prestaciones) || prestaciones.length === 0) {
        return res.status(400).json({ error: 'Debe enviar al menos una prestación.' });
    }
    let fechaFinal = fecha;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [y, m, d] = fecha.split('-');
        fechaFinal = `${d}/${m}/${y}`;
    }
    // Normalizar el DNI para buscar el paciente correcto
    const soloNumeros = paciente_dni.replace(/\D/g, '');
    try { const result = await pool.query(`SELECT dni FROM pacientes WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(dni), 'F', ''), 'M', ''), '-', ''), '_', ''), ' ', '') LIKE $1`, [`%${soloNumeros}`]); const row = result.rows[0];if (!row) return res.status(404).json({ error: 'Paciente no encontrado' });
        // Usar el DNI real de la base para asociar la prestación
        const dniReal = row.dni;
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            const sql = `INSERT INTO prestaciones (paciente_dni, fecha, prestador, prestacion) VALUES ($1, $2, $3, $4)`;
            let errorOcurrido = null;
            let lastID = null;
            prestaciones.forEach((p, idx) => {
                let fechaPrestacion, descripcionPrestacion;
                if (typeof p === 'object' && p !== null && p.fecha && p.descripcion) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(p.fecha)) {
                        const [y, m, d] = p.fecha.split('-');
                        fechaPrestacion = `${d}/${m}/${y}`;
                    } else {
                        fechaPrestacion = p.fecha;
                    }
                    descripcionPrestacion = p.descripcion;
                } else {
                    fechaPrestacion = fechaFinal;
                    descripcionPrestacion = p;
                }
                try { await pool.query(sql, [dniReal, fechaPrestacion, prestador, descripcionPrestacion]);
                    if (err && !errorOcurrido) errorOcurrido = err;
                    if (idx === prestaciones.length - 1) {
                        lastID = this.lastID;
                        if (errorOcurrido) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: errorOcurrido.message });
                        } else {
                            db.run('COMMIT');
                            return res.status(201).json({ message: 'Prestaciones guardadas', lastID });
                        }
                    }
                });
            } catch (err) { return res.status(500).json({ error: err.message }); }});
        });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});

app.put('/api/prestacion/:id', checkSession, checkAdmin, (req, res) => {
    const id = req.params.id;
    const { fecha, prestador, prestacion } = req.body;

    if (!fecha || !prestador || !prestacion) {
        return res.status(400).json({ error: 'Faltan datos requeridos (fecha, prestador, prestacion).' });
    }

    let fechaFinal = fecha;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [y, m, d] = fecha.split('-');
        fechaFinal = `${d}/${m}/${y}`;
    }

    const sql = 'UPDATE prestaciones SET fecha = $1, prestador = $2, prestacion = $3 WHERE id = $4';
    try { await pool.query(sql, [fechaFinal, prestador, prestacion, id]);if (this.changes === 0) return res.status(404).json({ message: 'Prestación no encontrada.' });
        res.json({ message: 'Prestación actualizada correctamente.' });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});

app.delete('/api/prestacion/:id', checkSession, checkAdmin, (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM prestaciones WHERE id = $5';
    db.run(sql, id, function(err) {if (this.changes === 0) return res.status(404).json({ message: 'Prestación no encontrada' });
        res.json({ message: 'Prestación eliminada' });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});

// --- API ELIMINAR PACIENTE ---
app.delete('/api/paciente/:dni', checkSession, checkAdmin, (req, res) => {
    const dni = req.params.dni;

    try { const result = await pool.query('SELECT ruta_archivo FROM archivos_paciente WHERE paciente_dni = $6', [dni]); const rows = result.rows;rows.forEach(row => {
            const ruta = row.ruta_archivo;
            if (ruta && (ruta.startsWith('uploads/') || ruta.startsWith('..\\uploads\\'))) {
                const localPath = path.join(__dirname, '..', ruta);
                fs.unlink(localPath, (unlinkErr) => {
                    if (unlinkErr) console.warn("No se pudo borrar archivo local antiguo:", localPath, unlinkErr.message);
                });
            }
        });

        db.serialize(() => {
            db.run('DELETE FROM archivos_paciente WHERE paciente_dni = $7', dni);
            db.run('DELETE FROM prestaciones WHERE paciente_dni = $8', dni);
            db.run('DELETE FROM pacientes WHERE dni = $9', dni, function(err) {if (this.changes === 0) return res.status(404).json({ message: 'Paciente no encontrado' });
                res.json({ message: 'Paciente, prestaciones y referencias de archivos eliminados' });
            } catch (err) { return res.status(500).json({ error: err.message }); }});
        });
    } catch (err) { return res.status(500).json({ error: err.message }); }});
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});
