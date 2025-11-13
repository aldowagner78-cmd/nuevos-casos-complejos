#  Despliegue en Koyeb + Supabase + Cloudinary

##  STACK 100% GRATIS (SIN TARJETA)

- **Backend**: Koyeb.com (gratis, 512MB RAM)
- **Base de datos**: Supabase (500MB PostgreSQL gratis)
- **Archivos**: Cloudinary (10GB gratis)  YA TIENES CUENTA
- **HTTPS**: Automático
- **Costo**: \/mes
- **Sleep**: Se duerme tras 30min sin uso (despierta en 2-3 seg)

---

##  PASOS PARA DESPLEGAR

### 1.  Cloudinary (YA HECHO)
Tu cuenta ya está lista. Necesitas estas 3 credenciales:
1. Ve a https://console.cloudinary.com/settings/c-d7f90e4af06815cb7a58c4fce3ab12/api-keys
2. Copia:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2.  Crear base de datos en Supabase
1. Ve a https://supabase.com
2. Regístrate (NO requiere tarjeta)
3. New Project  Nombre: "casos-complejos"
4. Espera 2-3 minutos que se cree
5. Ve a Settings  Database
6. Copia la **Connection String** (URI mode):
   \\\
   postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   \\\

### 3.  Crear cuenta en Koyeb
1. Ve a https://app.koyeb.com/auth/signup
2. Regístrate con GitHub (NO requiere tarjeta)
3. Conecta tu cuenta de GitHub

### 4.  Subir a GitHub
\\\powershell
cd "C:\Users\kengy\Desktop\Casos Complejos"
git init
git add .
git commit -m "Initial commit - Koyeb + Supabase + Cloudinary"
git branch -M main

# Crear repo en GitHub primero, luego:
git remote add origin https://github.com/TU_USUARIO/casos-complejos.git
git push -u origin main
\\\

### 5.  Desplegar en Koyeb
1. En Koyeb Dashboard  **Create Service**
2. Selecciona **GitHub**
3. Conecta tu repositorio "casos-complejos"
4. Koyeb detectará automáticamente Node.js
5. En **Environment Variables**, agrega:
   - \DATABASE_URL\ = (tu connection string de Supabase)
   - \CLOUDINARY_CLOUD_NAME\ = (de Cloudinary)
   - \CLOUDINARY_API_KEY\ = (de Cloudinary)
   - \CLOUDINARY_API_SECRET\ = (de Cloudinary)
   - \SESSION_SECRET\ = (genera uno: \openssl rand -base64 32\)
6. Click **Deploy**

### 6.  Inicializar Base de Datos
Después del primer deploy:
1. En Koyeb  Tu servicio  **Console** (terminal)
2. Ejecuta:
   \\\ash
   node backend/init-db.js
   \\\
3. Esto creará las tablas y el usuario admin

### 7.  Listo!
- **URL**: https://casos-complejos-XXXXX.koyeb.app
- **Usuario**: admin
- **Contraseña**: admin123

---

##  MIGRAR DATOS DESDE SQLite

Si quieres importar tus datos actuales:

\\\powershell
# 1. Exportar desde SQLite
cd "C:\Users\kengy\Desktop\Casos Complejos"
sqlite3 data/pacientes.db .dump > pacientes_export.sql

# 2. Importar a Supabase
# Opción A: Desde Supabase Dashboard  SQL Editor  pega el SQL
# Opción B: Usar psql (si lo tienes instalado)
\\\

---

##  IMPORTANTE: SLEEP MODE

Koyeb FREE se duerme después de 30 minutos sin tráfico.
-  Despierta automáticamente en 2-3 segundos al recibir una request
-  No pierdes datos (PostgreSQL en Supabase siempre activo)
-  Primera carga tras sleep será lenta

**Solución**: Usa un servicio de ping gratis como UptimeRobot para mantenerlo despierto.

---

##  LÍMITES GRATIS

- **Koyeb**: 512MB RAM, 1 servicio, sleep tras 30min
- **Supabase**: 500MB DB, 2 proyectos
- **Cloudinary**: 10GB almacenamiento, 25GB bandwidth/mes

Tu app (2.4MB DB + ~100MB código) cabe perfectamente.

---

##  TROUBLESHOOTING

**Error de conexión a DB:**
- Verifica que \DATABASE_URL\ en Koyeb tenga el formato correcto de Supabase
- Asegúrate que el password en la URL esté URL-encoded

**Archivos no suben:**
- Verifica las credenciales de Cloudinary en variables de entorno
- Revisa logs en Koyeb Console

**App se cae:**
- Revisa logs en Koyeb Dashboard
- Verifica que \init-db.js\ se ejecutó correctamente
