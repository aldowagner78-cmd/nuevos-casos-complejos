const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { processAndUpload } = require('./driveUploader'); // Importamos el módulo de Drive

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'data', 'pacientes.db');
const db = new sqlite3.Database(dbPath);

// --- Configuración de Multer ---
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const mimetypes = [
        'image/jpeg', 
        'image/png', 
        'image/webp',
        'application/pdf', 
        'text/plain',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (mimetypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log("Rechazando archivo por mimetype:", file.mimetype);
        cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes, PDF, Word o Texto.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // Límite de 15MB por archivo
});


// Obtener archivos vinculados a un paciente
router.get('/api/paciente/:dni/archivos', (req, res) => {
    const dni = req.params.dni;
    db.all('SELECT id, nombre_archivo, ruta_archivo FROM archivos_paciente WHERE paciente_dni = ?', [dni], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar archivos' });
        res.json(rows);
    });
});


// Subir uno o varios archivos y vincularlos
router.post('/api/paciente/:dni/archivos', upload.array('archivos', 5), async (req, res) => {
    const dni = req.params.dni;
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No se subieron archivos' });
    }

    try {
        // *** CAMBIO: Pasamos el DNI como identificador ***
        // (En esta ruta no tenemos el nombre, así que el DNI es el identificador)
        const identifier = dni; 

        const uploadPromises = req.files.map(file => 
            processAndUpload(file, identifier) // Procesa y sube a Drive
                .then(driveLink => {
                    return {
                        originalName: file.originalname,
                        link: driveLink
                    };
                })
        );

        const uploadedFiles = await Promise.all(uploadPromises);

        // Ahora, guardamos las referencias en la base de datos
        const dbInserts = uploadedFiles.map(file => {
            return new Promise((resolve, reject) => {
                db.run('INSERT INTO archivos_paciente (paciente_dni, nombre_archivo, ruta_archivo) VALUES (?, ?, ?)',
                    [dni, file.originalName, file.link],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ 
                            id: this.lastID, 
                            nombre_archivo: file.originalName, 
                            ruta_archivo: file.link 
                        });
                    }
                );
            });
        });

        const dbResults = await Promise.all(dbInserts);
        
        res.json(dbResults);

    } catch (err) {
        console.error("Error en el proceso de subida:", err.message);
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        }
        if (err.message.startsWith('Tipo de archivo no soportado')) {
            return res.status(400).json({ error: err.message });
        }
        if (err.message.startsWith('Error de Google Drive:')) {
            return res.status(503).json({ error: 'Servicio de Google Drive no disponible. ' + err.message });
        }
        if (err.message.startsWith('Error de Autenticación de Google:')) {
             return res.status(503).json({ error: 'Error de Autenticación con Google. ' + err.message });
        }
        res.status(500).json({ error: 'Error interno al procesar archivos: ' + err.message });
    }
});


// Eliminar un archivo vinculado
router.delete('/api/paciente/:dni/archivos/:id', (req, res) => {
    const dni = req.params.dni;
    const id = req.params.id;

    db.get('SELECT ruta_archivo FROM archivos_paciente WHERE id = ? AND paciente_dni = ?', [id, dni], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Archivo no encontrado' });
        
        const ruta = row.ruta_archivo;
        
        db.run('DELETE FROM archivos_paciente WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: 'Error al eliminar de la base de datos' });
            
            // Si la ruta era un archivo local antiguo (de /uploads/), lo borramos.
            // Si es un enlace de Google Drive, no lo borramos de Drive.
            if (ruta && (ruta.startsWith('uploads/') || ruta.startsWith('..\\uploads\\'))) {
                const localPath = path.join(__dirname, '..', ruta); 
                fs.unlink(localPath, (unlinkErr) => {
                    if (unlinkErr) console.warn("No se pudo borrar archivo local antiguo:", localPath, unlinkErr.message);
                });
            }
            
            res.json({ ok: true });
        });
    });
});

module.exports = router;