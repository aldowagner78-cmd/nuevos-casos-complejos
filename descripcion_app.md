# Descripción detallada de la aplicación de gestión de casos complejos

## 1. Propósito general
La aplicación permite gestionar pacientes y casos clínicos complejos, centralizando información, adjuntos y procesos de normalización de datos. Está orientada a equipos médicos o administrativos que requieren un registro ordenado, búsqueda eficiente y almacenamiento seguro de documentos.

---

## 2. Funcionalidades principales

### 2.1. Registro y gestión de pacientes
- Alta, edición y baja de pacientes.
- Cada paciente tiene datos personales (nombre, DNI, fecha de nacimiento, tipo de afiliado, etc.).
- Validación y normalización de datos (por ejemplo, corrección de mayúsculas/minúsculas, eliminación de caracteres especiales, unificación de formatos de nombres y fechas).

### 2.2. Gestión de casos clínicos
- Asociación de múltiples casos a un paciente.
- Registro de diagnósticos, tratamientos, fechas y observaciones.
- Relación de casos con profesionales y áreas médicas.

### 2.3. Búsqueda avanzada
- Búsqueda por nombre, DNI, número de caso, fecha, profesional, diagnóstico, etc.
- Búsqueda tolerante a errores (normalización de texto, búsqueda insensible a mayúsculas/minúsculas y tildes).
- Filtros combinados (por ejemplo, buscar todos los casos de un profesional en un rango de fechas).

### 2.4. Normalización de datos
- Procesos automáticos para limpiar y estandarizar nombres, apellidos y otros campos.
- Conversión de archivos CSV de pacientes/casos a formatos internos normalizados.
- Scripts para corregir errores comunes en los datos importados (por ejemplo, espacios extra, caracteres no válidos, formatos de fecha inconsistentes).

### 2.5. Adjuntos y gestión de archivos
- Subida de archivos adjuntos a cada caso o paciente (imágenes, PDFs, Word, texto).
- Conversión automática de imágenes, Word y texto a PDF para unificación y seguridad.
- Compresión y optimización de archivos antes de subirlos.
- Almacenamiento seguro de los adjuntos en Google Drive (o alternativa gratuita), con generación de enlaces de acceso.
- Nomenclatura automática de archivos: incluye nombre/DNI del paciente, fecha y tipo de documento.

### 2.6. Seguridad y autenticación
- Login de usuarios con validación de credenciales.
- Control de acceso a funcionalidades según el rol del usuario.
- Validación de datos en frontend y backend.

### 2.7. Interfaz de usuario
- Frontend web moderno, responsivo y fácil de usar.
- Formularios claros para carga y edición de datos.
- Listados y tablas con paginación, ordenamiento y filtros.
- Visualización y descarga de adjuntos directamente desde la app.

### 2.8. Exportación e importación de datos
- Exportación de listados de pacientes y casos a CSV o Excel.
- Importación masiva de pacientes/casos desde archivos CSV, con validación y normalización automática.

---

## 3. Procesos automáticos y scripts
- Scripts para normalizar y corregir archivos CSV de pacientes/casos.
- Scripts para evaluar y corregir el tipo de afiliado.
- Scripts para actualizar nombres de fichas y otros datos masivos.

---

## 4. Integraciones
- Google Drive (o alternativa gratuita) para almacenamiento de adjuntos.
- DuckDNS y Let's Encrypt para dominio y SSL gratuitos.

---

## 5. Estructura de carpetas típica
```
backend/
  archivosPacienteApi.js
  corregir_pacientes_csv.js
  evaluar_tipo_afiliado.js
  pacientes_normalizar.py
  driveUploader.js
  ...
frontend/
  app.js
  archivosPaciente.js
  index.html
  ...
data/
  CASOS COMPLEJOS - CARGA.csv
  CASOS COMPLEJOS - PACIENTES.csv
scripts/
  actualizar_ficha_nombre.js
  ...
```

---

## 6. Resumen de flujo de trabajo
1. El usuario se autentica.
2. Puede buscar pacientes/casos usando filtros avanzados.
3. Puede cargar, editar y eliminar pacientes y casos.
4. Puede importar/exportar datos masivos.
5. Puede adjuntar archivos a cada caso/paciente, que se convierten a PDF y se almacenan en la nube.
6. Todos los datos se normalizan automáticamente para evitar duplicados y errores.

---

