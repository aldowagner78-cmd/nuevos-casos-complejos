const { google } = require('googleapis');
const sharp = require('sharp');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const stream = require('stream');

// ID de la carpeta de Google Drive
const FOLDER_ID = '1Tjg8G8hRmAgwPjHUqEu6d23EWSokgB9S';

// --- Usar Autenticación OAuth 2.0 (token.json) ---
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

function authorize() {
    try {
        const credentialsContent = fs.readFileSync(CREDENTIALS_PATH);
        const credentials = JSON.parse(credentialsContent).web;
        const tokenContent = fs.readFileSync(TOKEN_PATH);
        const tokens = JSON.parse(tokenContent);
        
        const oAuth2Client = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            'http://localhost:3000/callback'
        );
        oAuth2Client.setCredentials(tokens);
        return oAuth2Client;
    } catch (err) {
        console.error('Error al autorizar con OAuth:', err.message);
        throw new Error('Error de Autenticación de Google: Faltan credentials.json o token.json');
    }
}
// --- Fin Autenticación ---

// Ruta a la carpeta de subidas temporales (para conversión de Word)
const TEMP_UPLOAD_PATH = path.join(__dirname, '..', 'uploads');

/**
 * Sube un buffer de archivo a Google Drive
 * @param {object} authClient - El cliente de Google Auth
 * @param {Buffer} buffer - El contenido del archivo
 * @param {string} originalName - El nombre original (para la extensión)
 * @param {string} mimeType - El tipo MIME
 * @param {string} newName - El nuevo nombre base (sin extensión)
 */
async function uploadToDrive(authClient, buffer, originalName, mimeType, newName) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    try {
        // Determina la extensión basada en el MimeType (o el original si falla la conversión)
        let fileExtension;
        if (mimeType === 'application/pdf') {
            fileExtension = '.pdf';
        } else if (mimeType.startsWith('image/')) {
            // Si la conversión a PDF falló, usamos la extensión original (ej: .jpg)
            fileExtension = path.extname(originalName) || '.jpg';
        } else {
            fileExtension = path.extname(originalName);
        }

        // Construye el nombre final
        const driveFileName = `${newName}${fileExtension}`;

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const fileMetadata = {
            name: driveFileName,
            parents: [FOLDER_ID],
        };

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        return file.data.webViewLink || null;

    } catch (error) {
        console.error('Error al subir a Google Drive:', error.message);
        throw new Error('Error de Google Drive: ' + error.message);
    }
}

/**
 * Genera el nuevo nombre de archivo
 * @param {string} patientIdentifier - El DNI o Nombre del paciente
 */
function getNewFileName(patientIdentifier) {
    // 1. Crear Timestamp
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses son 0-11
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${day}-${month}-${year}_${hours}h${minutes}m`; // Formato: 02-11-25_18h14m

    // 2. Limpiar identificador (Nombre o DNI)
    let baseName;
    if (patientIdentifier) {
        // Reemplaza caracteres inválidos en nombres de archivo
        baseName = patientIdentifier.replace(/[/\\?%*:|"<>]/g, '-'); 
    } else {
        baseName = 'Archivo'; // Fallback
    }

    // 3. Retornar nombre base
    return `${baseName} - ${timestamp}`;
}


/**
 * Procesa un archivo (convierte a PDF, comprime)
 * @param {Buffer} buffer - El buffer original
 * @param {string} mimeType - El tipo MIME
 * @param {string} originalName - El nombre original
 * @param {string} newName - El nuevo nombre base (para logs)
 * @returns {Promise<{buffer: Buffer, mimeType: string}>}
 */
async function processFile(buffer, mimeType, originalName, newName) {
    
    // ---- 1. Conversión de IMAGEN a PDF ----
    if (mimeType.startsWith('image/')) {
        try {
            const compressedImageBuffer = await sharp(buffer)
                .resize(1240)
                .jpeg({ quality: 80 }) 
                .toBuffer();
            // --- INICIO DE CORRECCIÓN ---
            // 1. Crear un nuevo documento PDF
            const pdfDoc = await PDFDocument.create();
            // 2. Incrustar el JPEG en el documento
            const image = await pdfDoc.embedJpg(compressedImageBuffer);
            // --- FIN DE CORRECCIÓN ---
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

            const pdfBytes = await pdfDoc.save();
            console.log(`Conversión exitosa: Imagen a PDF (${newName}.pdf)`);
            return { buffer: Buffer.from(pdfBytes), mimeType: 'application/pdf' };
        } catch (imgError) {
            console.warn(`Error al convertir ${newName} (Imagen) a PDF: ${imgError.message}. Subiendo original.`);
            // Si falla la conversión a PDF (como sabemos que pasa), devolvemos la imagen original
            return { buffer, mimeType }; 
        }
    }

    // ---- 2. Conversión de WORD a PDF (Usando LibreOffice) ----
    if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const tempInput = path.join(TEMP_UPLOAD_PATH, `in-${Date.now()}-${originalName}`);
        const tempOutput = TEMP_UPLOAD_PATH;
        
        try {
            fs.writeFileSync(tempInput, buffer);
            execSync(`soffice --headless --convert-to pdf --outdir "${tempOutput}" "${tempInput}"`);
            const tempPdfPath = path.join(tempOutput, path.basename(tempInput, path.extname(tempInput)) + '.pdf');
            const pdfBuffer = fs.readFileSync(tempPdfPath);
            
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempPdfPath);
            
            console.log(`Conversión exitosa: Word a PDF (${newName}.pdf)`);
            return { buffer: pdfBuffer, mimeType: 'application/pdf' };

        } catch (wordError) {
            console.warn(`Error al convertir ${newName} (Word) a PDF: ${wordError.message}. Subiendo original.`);
            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            const tempPdfPath = path.join(tempOutput, path.basename(tempInput, path.extname(tempInput)) + '.pdf');
            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
            return { buffer, mimeType }; // Devuelve original si falla
        }
    }

    // ---- 3. Conversión de TEXTO a PDF ----
    if (mimeType === 'text/plain') {
        try {
            const textContent = buffer.toString('utf-8');
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            page.drawText(textContent, {
                x: 50, y: page.getHeight() - 50,
                size: 11, font: font, lineHeight: 14, color: rgb(0, 0, 0),
            });

            const pdfBytes = await pdfDoc.save();
            console.log(`Conversión exitosa: Texto a PDF (${newName}.pdf)`);
            return { buffer: Buffer.from(pdfBytes), mimeType: 'application/pdf' };
        } catch (txtError) {
            console.warn(`Error al convertir ${newName} (Texto) a PDF: ${txtError.message}. Subiendo original.`);
            return { buffer, mimeType };
        }
    }

    // ---- 4. Optimización de PDF ----
    if (mimeType === 'application/pdf') {
        try {
            const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            const newPdfBytes = await pdfDoc.save();
            console.log(`Procesamiento exitoso: PDF (${newName}.pdf)`);
            return { buffer: Buffer.from(newPdfBytes), mimeType: 'application/pdf' };
        } catch (pdfError) {
            console.warn(`Error al procesar ${newName} (PDF): ${pdfError.message}. Subiendo original.`);
            return { buffer, mimeType };
        }
    }

    // ---- 5. Otros archivos ----
    return { buffer, mimeType };
}

/**
 * Función principal: Procesa un archivo de Multer y lo sube a Drive.
 * @param {object} file - El objeto 'file' de Multer (con file.buffer).
 * @param {string} patientIdentifier - El DNI o Nombre del paciente.
 * @returns {Promise<string|null>} - La URL de Google Drive.
 */
async function processAndUpload(file, patientIdentifier) {
    if (!file || !file.buffer) {
        throw new Error('Archivo no válido o buffer vacío.');
    }
    
    // 1. Autorizar con OAuth 2.0 (tus credenciales)
    const authClient = authorize();

    // 2. Generar el nuevo nombre base
    const newName = getNewFileName(patientIdentifier);

    // 3. Procesar el archivo (comprimir, convertir a PDF, etc.)
    const { buffer: processedBuffer, mimeType: processedMimeType } = await processFile(
        file.buffer,
        file.mimetype,
        file.originalname,
        newName // Pasamos el nuevo nombre solo para los logs de consola
    );

    // 4. Subir el archivo procesado a Drive
    const driveLink = await uploadToDrive(
        authClient,
        processedBuffer,
        file.originalname, // Pasamos el original para la extensión
        processedMimeType,
        newName // Pasamos el nuevo nombre para el archivo final
    );

    return driveLink;
}

module.exports = {
    processAndUpload,
};