# 📋 INSTRUCCIONES PARA SUBIR A GOOGLE APPS SCRIPT

## 🎯 Estos son los archivos CORRECTOS para tu Web App de Google Sheets

Esta carpeta contiene los archivos que debes subir a Google Apps Script (NO son para el servidor Node.js local).

---

## 📁 Archivos a subir:

1. **Código.gs** → El archivo principal con toda la lógica del backend
2. **index.html** → La aplicación principal (se muestra cuando hay sesión)
3. **login.html** → La página de inicio de sesión
4. **style.html** → Los estilos CSS (incluidos por los otros HTML)

---

## 🚀 Pasos para implementar:

### 1. Abre el editor de Apps Script

1. Ve a tu Google Sheet
2. Menú: **Extensiones > Apps Script**

### 2. Borra los archivos antiguos (si existen)

- Elimina cualquier archivo `.gs` o `.html` antiguo que tengas

### 3. Crea los nuevos archivos

#### Archivo: Código.gs
- Haz clic en el ➕ junto a "Archivos"
- Selecciona "Secuencia de comandos"
- Nombra el archivo: `Código` (se agregará automáticamente .gs)
- Copia y pega TODO el contenido de `Código.gs` de esta carpeta

#### Archivo: index.html
- Haz clic en el ➕ junto a "Archivos"
- Selecciona "HTML"
- Nombra el archivo: `index`
- Copia y pega TODO el contenido de `index.html` de esta carpeta

#### Archivo: login.html
- Haz clic en el ➕ junto a "Archivos"
- Selecciona "HTML"
- Nombra el archivo: `login`
- Copia y pega TODO el contenido de `login.html` de esta carpeta

#### Archivo: style.html
- Haz clic en el ➕ junto a "Archivos"
- Selecciona "HTML"
- Nombra el archivo: `style`
- Copia y pega TODO el contenido de `style.html` de esta carpeta

### 4. Implementa la aplicación web

1. Haz clic en **Implementar > Nueva implementación**
2. Tipo: **Aplicación web**
3. Configuración:
   - Descripción: "Gestión Casos Complejos v1"
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario de [tu organización]** o **Cualquier persona**
4. Haz clic en **Implementar**
5. Copia la URL que te da (termina en `/exec`)

### 5. Prueba la aplicación

1. Abre la URL en una pestaña de incógnito (para no tener sesión previa)
2. Debes ver la página de LOGIN
3. Inicia sesión con un usuario administrativo (ej: "Aldo", "26716975")
4. Debes ver la interfaz completa con los paneles de carga y administración

---

## 🔍 Verificación de que funcionó correctamente:

### ✅ Abrir la consola del navegador (F12) y verificar:

```
Clase del body: rol-administrativo
userRol recibido: rol-administrativo
¿Es administrativo? true
¿Es auditor? false
DOMContentLoaded - ¿Es admin? true
Usuario es ADMIN - Paneles VISIBLES
```

### ❌ Si ves esto, algo está mal:

```
Clase del body: (vacío) o "auditor" (sin prefijo)
¿Es administrativo? false
Paneles de admin OCULTADOS
```

---

## 🐛 Solución de problemas:

### Problema 1: No muestra el login, va directo a la app
**Causa**: Hay una sesión previa guardada
**Solución**: 
- Abre la URL en modo incógnito
- O llama a la función `cerrarSesion()` desde el editor de Apps Script

### Problema 2: Muestra interfaz de auditor para admin
**Causa**: El `<body>` no tiene la clase `rol-administrativo`
**Solución**: 
- Verifica que en `Código.gs` la línea sea: `tpl.userRol = 'rol-' + sessionData.rol;`
- Verifica que en `index.html` la línea sea: `<body class="<?!= userRol; ?>">`
- Verifica que en la hoja "Usuarios", columna C, el rol sea exactamente "administrativo" (sin espacios)

### Problema 3: No carga nada, página en blanco
**Causa**: Error en el código de Apps Script
**Solución**:
- Abre el editor de Apps Script
- Menú: **Ejecución > Ver ejecuciones**
- Busca errores en el log

---

## 📝 Nota importante sobre la hoja "Usuarios":

La columna C (rol) debe tener exactamente estos valores:
- `administrativo` (minúsculas, sin espacios)
- `auditor` (minúsculas, sin espacios)

El sistema automáticamente agregará el prefijo "rol-" cuando sirva la página.

---

## ⚠️ NO mezcles estos archivos con los de la carpeta `frontend/`

Los archivos de la carpeta `frontend/` son para el servidor Node.js LOCAL.
Los archivos de esta carpeta son para GOOGLE APPS SCRIPT.
Son dos sistemas completamente diferentes.
