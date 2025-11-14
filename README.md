# Sistema de Gestión de Pacientes - Casos Complejos

Sistema modular para la gestión integral de pacientes con casos complejos, desarrollado con Node.js, Express, SQLite y frontend HTML/CSS/JavaScript.

## 📁 Estructura del Proyecto

```
Casos Complejos/
├── backend/                    # Código del servidor
│   ├── server.js              # Servidor principal Express
│   ├── setupDatabase.js       # Inicialización de base de datos
│   └── archivosPacienteApi.js # API modular de archivos
├── frontend/                   # Archivos estáticos del cliente
│   ├── index.html             # Aplicación principal
│   ├── login.html             # Página de login
│   ├── register.html          # Página de registro
│   ├── app.js                 # Lógica del cliente
│   ├── archivosPaciente.js    # Gestión de archivos adjuntos
│   ├── style.css              # Estilos globales
│   └── Logo.png               # Logo institucional
├── data/                       # Datos y base de datos
│   ├── pacientes.db           # Base de datos SQLite (generada)
│   ├── CASOS COMPLEJOS - PACIENTES.csv
│   └── CASOS COMPLEJOS - CARGA.csv
├── uploads/                    # Archivos subidos por usuarios
├── scripts/                    # Scripts utilitarios
│   ├── actualizar_ficha_nombre.js
│   ├── corregir_pacientes_csv.js
│   ├── evaluar_tipo_afiliado.js
│   └── pacientes_normalizar.py
├── prompts/                    # Prompts de IA personalizados
├── tests/                      # Tests automatizados
├── .github/
│   └── copilot-instructions.md # Instrucciones para agentes IA
├── package.json                # Dependencias y scripts
└── README.md                   # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 14 o superior
- npm (incluido con Node.js)

### Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Inicializar la base de datos**
   ```bash
   npm run setup
   ```
   Esto creará la base de datos SQLite e importará los datos de los archivos CSV (si existen).

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de producción |
| `npm run setup` | Inicializa/resetea la base de datos |
| `npm run dev` | Inicia el servidor en modo desarrollo |

## 🔐 Acceso al Sistema

### Registro de Usuarios

Para registrarse, necesitas uno de los siguientes códigos:

- **Administrativo**: `ADMIN123`
- **Auditor**: `AUDITOR123`

### Primera Vez

1. Ve a `/register.html`
2. Crea tu usuario con el código correspondiente
3. Inicia sesión en `/login.html`

### Contraseña por Defecto (Reseteo)

Si un administrador resetea tu contraseña, será: `111111`

## 🏗️ Arquitectura

### Backend (`backend/`)

- **server.js**: Servidor Express con todas las rutas API y lógica de negocio
  - Autenticación con bcrypt y express-session
  - Endpoints RESTful para pacientes, prestaciones y usuarios
  - Middleware de autorización por roles
  - Manejo de uploads con Multer

- **setupDatabase.js**: Script de inicialización de base de datos
  - Crea tablas: `usuarios`, `pacientes`, `prestaciones`, `archivos_paciente`
  - Importa datos desde archivos CSV
  - Gestión de migraciones suaves

- **archivosPacienteApi.js**: API modular para archivos vinculados (opcional)

### Frontend (`frontend/`)

- **HTML**: Vistas separadas para login, registro y aplicación principal
- **CSS**: Estilos globales con temas corporativo, minimalista y oscuro
- **JavaScript**: Lógica del cliente, manejo de formularios, búsquedas y visualización

### Base de Datos (`data/`)

**SQLite** con las siguientes tablas:

- `usuarios`: Autenticación y roles
- `pacientes`: Datos completos de pacientes
- `prestaciones`: Historial de prestaciones médicas
- `archivos_paciente`: Archivos vinculados a pacientes

### Archivos Subidos (`uploads/`)

Almacena archivos adjuntos (fichas médicas, documentación) subidos por usuarios.

## 🔧 Configuración Avanzada

### Cambiar Puerto

Edita `backend/server.js`:

```javascript
const port = 3000; // Cambia por el puerto deseado
```

### Códigos de Registro

Edita `backend/server.js`:

```javascript
const CODIGO_ADMIN = 'ADMIN123';
const CODIGO_AUDITOR = 'AUDITOR123';
```

### Contraseña de Reseteo

Edita `backend/server.js`:

```javascript
const PASS_RESET_GENERICA = '111111';
```

## 📊 Funcionalidades

### Para Administradores

- ✅ Crear, editar y eliminar pacientes
- ✅ Registrar y gestionar prestaciones
- ✅ Subir archivos adjuntos
- ✅ Gestionar usuarios (resetear contraseñas, cambiar roles, eliminar)
- ✅ Acceso completo a toda la información

### Para Auditores

- ✅ Buscar y visualizar pacientes
- ✅ Ver historial de prestaciones
- ✅ Consultar archivos adjuntos
- ❌ No puede crear, editar ni eliminar

## 🔍 Búsquedas

El sistema permite búsquedas por:

- **DNI completo**: Búsqueda exacta
- **Nombre/Apellido**: Búsqueda fragmentada (mínimo 3 caracteres)

## 🎨 Temas Visuales

Tres temas disponibles:

1. **Corporativo** (Azul) - Por defecto
2. **Minimalista** (Verde)
3. **Oscuro** (Gris)

El tema se guarda en `localStorage` del navegador.

## 🛠️ Desarrollo

### Agregar Nuevos Endpoints

1. Edita `backend/server.js`
2. Agrega tu ruta:
   ```javascript
   app.get('/api/mi-nueva-ruta', checkSession, (req, res) => {
       // Tu lógica aquí
   });
   ```

### Agregar Nuevas Vistas

1. Crea tu archivo HTML en `frontend/`
2. Referencia los estilos y scripts existentes
3. Agrega la ruta en `server.js` si es necesario

### Modificar Base de Datos

1. Edita `backend/setupDatabase.js`
2. Ejecuta `npm run setup` para recrear la base de datos

⚠️ **ADVERTENCIA**: Esto borrará todos los datos existentes.

## 🧪 Tests

Estructura preparada en `tests/` para futuros tests automatizados.

## 📦 Dependencias Principales

- **express**: Framework web
- **sqlite3**: Base de datos
- **bcryptjs**: Encriptación de contraseñas
- **express-session**: Manejo de sesiones
- **multer**: Upload de archivos
- **csv-parser**: Importación de CSV

## 🐛 Solución de Problemas

### El servidor no inicia

- Verifica que el puerto 3000 esté libre
- Revisa que las dependencias estén instaladas: `npm install`

### No puedo ver pacientes

- Asegúrate de haber ejecutado `npm run setup`
- Verifica que los archivos CSV estén en `data/`

### Errores de permisos

- Verifica que tienes permisos de escritura en las carpetas `data/` y `uploads/`

### La base de datos está corrupta

```bash
# Elimina la base de datos
rm data/pacientes.db

# Reinicializa
npm run setup
```

## 📄 Licencia

ISC

## 👥 Contribuciones

Este es un proyecto interno. Para cambios, consulta con el equipo de desarrollo.

## 📞 Soporte

Para dudas o problemas, contacta al equipo de desarrollo.

---

**Última actualización**: Noviembre 2025
**Versión**: 2.0.0 (Arquitectura Modular)
