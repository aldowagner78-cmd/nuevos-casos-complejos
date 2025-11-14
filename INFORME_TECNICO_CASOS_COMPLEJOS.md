# Informe Técnico – App Casos Complejos

## Descripción General

La aplicación “Casos Complejos” es una plataforma web para la gestión avanzada de pacientes, con funcionalidades de búsqueda avanzada, normalización de datos, carga de archivos a Google Drive y administración segura de la información médica.

---

## Estructura del Proyecto

- **backend/**  
  Lógica del servidor (Node.js, Express), API REST, integración con Google Drive, acceso a base de datos SQLite.
- **frontend/**  
  Interfaz de usuario (HTML, CSS, JS)
- **data/**  
  Archivos de datos y base de pacientes
- **scripts/**  
  Scripts de migración, normalización y utilidades
- **tests/**  
  Pruebas automáticas (Jest)
- **package.json**  
  Dependencias y scripts de npm

---

## Resumen de Archivos Clave

### backend/
- **server.js**: Servidor principal en producción (HTTPS, Express, rutas API, middlewares, conexión a base de datos, arranque seguro).
- **server_local.js**: Igual a server.js pero para desarrollo local (HTTP).
- **archivosPacienteApi.js**: API para subir archivos de pacientes, maneja uploads y llama a la lógica de Google Drive.
- **driveUploader.js**: Lógica de integración con Google Drive (autenticación, subida, permisos, generación de links).
- **setupDatabase.js**: Inicialización y migración de la base de datos SQLite.
- **credentials.json, service-account-drive.json, token.json**: Credenciales y tokens para Google Drive API.
- **diccionario_tildes.json**: Diccionario para normalización de tildes y variantes de nombres.

### frontend/
- **index.html**: Página principal, búsqueda avanzada de pacientes.
- **login.html, register.html**: Autenticación de usuarios.
- **response_root.html**: Vista de respuesta tras acciones administrativas.
- **app.js**: Lógica principal del frontend, manejo de formularios, peticiones a la API, renderizado de resultados.
- **archivosPaciente.js**: Lógica para la carga y visualización de archivos de pacientes.
- **style.css**: Estilos visuales de la aplicación.

### data/
- **CASOS COMPLEJOS - CARGA.csv, CASOS COMPLEJOS - PACIENTES.csv**: Datos de pacientes y casos para carga y consulta.

### scripts/
- **pacientes_normalizar.py**: Script para normalización de datos de pacientes.
- **corregir_pacientes_csv.js, evaluar_tipo_afiliado.js, actualizar_ficha_nombre.js**: Scripts de migración y limpieza de datos.

### tests/
- **example.test.js**: Pruebas automáticas de funcionalidades principales.

### Otros
- **package.json**: Lista de dependencias, scripts de arranque y test, configuración general del proyecto.
- **README.md**: Guía de uso, instalación y despliegue (si está actualizado).

---

## Funcionalidades Clave

- **Búsqueda avanzada**: Normalización de tildes y mayúsculas/minúsculas, sin límite de resultados, sugerencias alternativas.
- **Carga de archivos a Google Drive**: Subida de documentos asociados a pacientes, uso de credenciales de servicio y OAuth.
- **Seguridad**: Servidor HTTPS en producción, autenticación de usuarios.
- **Administración y despliegue**: Uso de PM2 para gestión de procesos, base de datos SQLite.

---

## Recomendación para análisis por IA

Para comprensión total, analizar los archivos:
- backend/server.js
- backend/archivosPacienteApi.js
- backend/driveUploader.js
- backend/diccionario_tildes.json
- frontend/app.js
- frontend/index.html
- package.json
- README.md

Y complementar con este informe.

---

**Fecha del informe:** 7 de noviembre de 2025
