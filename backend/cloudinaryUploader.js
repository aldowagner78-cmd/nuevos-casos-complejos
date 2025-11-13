const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Procesa y sube un archivo a Cloudinary
 * @param {Object} file - Archivo de multer
 * @param {String} identifier - Nombre o DNI del paciente
 * @returns {Promise<String>} - URL del archivo en Cloudinary
 */
async function processAndUpload(file, identifier) {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const folder = `casos_complejos/${identifier}`;
    
    let uploadResult;

    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
      // Procesar imágenes con Sharp (comprimir y convertir a JPEG)
      const processedBuffer = await sharp(file.path)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Subir imagen procesada
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            public_id: path.parse(file.originalname).name,
            resource_type: 'image',
            format: 'jpg'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(processedBuffer);
      });

    } else if (ext === '.pdf') {
      // Subir PDF directamente
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        public_id: path.parse(file.originalname).name,
        resource_type: 'raw',
        format: 'pdf'
      });

    } else {
      // Otros archivos (Word, Excel, etc.) como raw
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        public_id: file.originalname,
        resource_type: 'raw'
      });
    }

    // Eliminar archivo temporal local
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Retornar URL segura
    return uploadResult.secure_url;

  } catch (error) {
    console.error('Error en processAndUpload:', error);
    // Eliminar archivo temporal en caso de error
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
}

/**
 * Elimina un archivo de Cloudinary usando su URL
 * @param {String} fileUrl - URL del archivo en Cloudinary
 * @returns {Promise<void>}
 */
async function deleteFromCloudinary(fileUrl) {
  try {
    // Extraer public_id de la URL
    const urlParts = fileUrl.split('/');
    const fileWithExt = urlParts[urlParts.length - 1];
    const fileName = path.parse(fileWithExt).name;
    const folder = urlParts.slice(urlParts.indexOf('casos_complejos'), -1).join('/');
    const publicId = `${folder}/${fileName}`;

    // Determinar resource_type según extensión
    const ext = path.extname(fileWithExt).toLowerCase();
    let resourceType = 'raw';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      resourceType = 'image';
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error eliminando de Cloudinary:', error.message);
  }
}

module.exports = { processAndUpload, deleteFromCloudinary };
