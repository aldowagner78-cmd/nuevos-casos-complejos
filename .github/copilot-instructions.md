# Copilot Instructions for AI Agents

## Arquitectura General
- **Backend** (`backend/`): Node.js + Express, maneja API REST, autenticación, sesiones, lógica de negocio y archivos. Base de datos SQLite inicializada/importada desde CSV.
- **Frontend** (`frontend/`): HTML, CSS y JS puro. Vistas separadas para login, registro y app principal. Temas visuales configurables vía `localStorage`.
- **Datos** (`data/`): CSV de carga inicial y base SQLite generada. No versionar `pacientes.db`.
- **Uploads** (`uploads/`): Archivos adjuntos de pacientes, gestionados por Multer.

## Flujos y Comandos Clave
- Instala dependencias: `npm install`
- Inicializa base de datos: `npm run setup` (importa CSV, crea tablas)
- Inicia servidor: `npm start` (producción) o `npm run dev` (desarrollo)
- Acceso web: [http://localhost:3000](http://localhost:3000)

## Convenciones y Patrones
- **Roles**: `ADMIN123` (admin), `AUDITOR123` (auditor). Contraseña de reseteo: `111111`.
- **Endpoints**: Agrega rutas en `backend/server.js` usando middlewares de sesión y roles.
- **Base de datos**: Modifica solo en `setupDatabase.js`, luego ejecuta `npm run setup` (esto borra datos previos).
- **Frontend**: Usa los estilos y scripts existentes. Los temas se gestionan en JS y se guardan en `localStorage`.
- **Uploads**: Los archivos van a `uploads/` y se vinculan a pacientes vía API.

## Integraciones y Dependencias
- **Principales**: `express`, `sqlite3`, `bcryptjs`, `express-session`, `multer`, `csv-parser`.
- **Google Drive**: Scripts y credenciales en `backend/` para integración opcional.

## Ejemplos de Patrones
- Nuevo endpoint:
  ```js
  app.get('/api/mi-nueva-ruta', checkSession, (req, res) => { /* ... */ });
  ```
- Nueva vista:
  1. Crea HTML en `frontend/`
  2. Referencia `style.css` y `app.js`

## Advertencias
- Ejecutar `npm run setup` borra la base de datos.
- No versionar archivos sensibles (`pacientes.db`, credenciales, uploads).
- Para problemas de permisos, revisa carpetas `data/` y `uploads/`.

## Archivos Clave
- `backend/server.js`: API, rutas, lógica principal
- `backend/setupDatabase.js`: Esquema e importación de datos
- `frontend/app.js`: Lógica cliente
- `README.md`: Documentación y flujos

---
Actualizado: Noviembre 2025
