# Prompt para Gemini 3.0: Análisis y Migración Perfecta de Sistema de Gestión de Pacientes

## 🎯 OBJETIVO PRINCIPAL

Necesito migrar mi aplicación de gestión de pacientes de casos complejos desde una arquitectura con costos (VM + Node.js + SQLite + Cloudinary) hacia una arquitectura **100% gratuita** usando Google Apps Script + Google Sheets + Google Drive.

**REQUISITO CRÍTICO**: La migración debe ser **PERFECTA** - quiero **EXACTAMENTE** las mismas funcionalidades, mismo comportamiento, misma experiencia de usuario. No acepto perder ninguna característica.

---

## 📋 CONTEXTO DEL PROYECTO

### **Aplicación Original (Funcionando)**
- **Backend**: Node.js con Express.js (`backend/server.js`)
- **Base de datos**: SQLite con 3 tablas (usuarios, pacientes, prestaciones)
- **Almacenamiento de archivos**: File system local + opcional Cloudinary
- **Frontend**: HTML/CSS/JS vanilla (`frontend/index.html`, `frontend/app.js`, `frontend/style.css`)
- **Autenticación**: Sistema propio con sesiones
- **Usuarios**: 2 roles (administrativo, auditor) con permisos diferentes

### **Nueva Implementación (En Desarrollo)**
- **Backend**: Google Apps Script (`google-apps-script/Código.gs`)
- **Base de datos**: Google Sheets con 3 pestañas (Usuarios, Base_de_Datos, Prestaciones)
- **Almacenamiento de archivos**: Google Drive con estructura de carpetas
- **Frontend**: HTML con scriptlet GAS (`google-apps-script/index.html`, `google-apps-script/style.html`)
- **Autenticación**: PropertiesService.getUserProperties()
- **Usuarios**: Mismos 2 roles

---

## ✅ AVANCES LOGRADOS

1. **Estructura base creada**:
   - `Código.gs`: Backend con funciones principales (login, búsqueda, CRUD)
   - `index.html`: Interfaz principal con formularios
   - `login.html`: Página de autenticación
   - `style.html`: CSS completo (2873 líneas)

2. **Funcionalidades implementadas**:
   ✅ Login/logout con roles
   ✅ Búsqueda de pacientes por DNI o nombre (con autocomplete)
   ✅ Visualización de ficha del paciente con datos y prestaciones
   ✅ Crear nuevo paciente (con validaciones)
   ✅ Crear nueva prestación
   ✅ Eliminar paciente
   ✅ Eliminar prestación individual
   ✅ Manejo de carpetas de Drive por paciente

3. **Optimizaciones realizadas**:
   ✅ Debounce en búsquedas (500ms)
   ✅ Null-safety en todas las búsquedas
   ✅ Formateo robusto de fechas
   ✅ Cálculo dinámico de edad
   ✅ Validación de DNI duplicado

---

## ❌ PROBLEMAS ACTUALES

### **1. Funcionalidades Faltantes**
- ❌ **Editar paciente**: El formulario existe pero no está conectado
- ❌ **Búsqueda avanzada**: Panel presente pero sin implementar
- ❌ **Calendario de fechas**: Widget visual no funcional
- ❌ **Combo de prestadores**: Dropdown con EFECTORES_DICT no implementado
- ❌ **Administración de usuarios**: Panel de admin sin funcionalidad
- ❌ **Cambio de contraseña**: Modal presente pero no funciona
- ❌ **Adjuntar archivos**: Reemplazado por mensaje informativo (debe implementarse con Google Picker API o alternativa)

### **2. Inconsistencias de Comportamiento**
- Logo de IAPOS no carga consistentemente
- Algunos pacientes no abren la ficha (error en formateo de datos)
- Lentitud general (respuestas de 2-5 segundos)
- A veces la búsqueda falla silenciosamente

### **3. Diferencias con la App Original**
- **App original**: Archivos se suben con input file y se guardan localmente o en Cloudinary
- **App GAS**: Solo muestra link a carpeta Drive (usuario debe subir manualmente)
- **App original**: Búsqueda avanzada con múltiples filtros combinados
- **App GAS**: Búsqueda avanzada no implementada
- **App original**: Edición completa de pacientes con modal de confirmación
- **App GAS**: Formulario de edición sin backend
- **App original**: Print con CSS específico para impresión
- **App GAS**: Print básico con window.print()

### **4. PROBLEMA CRÍTICO: VELOCIDAD Y PERFORMANCE**

⚠️ **LA APP ES LENTA** - Esto es INACEPTABLE para los usuarios:

**Tiempos actuales:**
- Búsqueda: 2-5 segundos (debería ser < 1 segundo)
- Cargar ficha de paciente: 3-7 segundos (debería ser < 2 segundos)
- Guardar nuevo paciente: 4-8 segundos (debería ser < 3 segundos)

**Causas probables:**
- ❌ Lectura completa de sheets en cada consulta (getRange con todas las filas)
- ❌ Sin caché de datos frecuentes
- ❌ Múltiples llamadas síncronas a google.script.run
- ❌ Operaciones row-by-row en vez de batch
- ❌ Sin índices o lookups optimizados

**Lo que NECESITO:**
- ✅ Caché en CacheService para datos que no cambian frecuentemente
- ✅ Lectura incremental o parcial de sheets
- ✅ Batch operations donde sea posible
- ✅ Promesas paralelas en frontend (Promise.all)
- ✅ Lazy loading de datos pesados (prestaciones)
- ✅ Índices en memoria para búsquedas rápidas

---

## 🔍 LO QUE NECESITO DE TI (GEMINI 3.0)

### **TAREA 1: Análisis Comparativo Exhaustivo**

Analiza **TODO** el repositorio y genera un **informe detallado** comparando:

#### **A) Capa de Datos**
- Compara esquema SQLite vs Google Sheets
- Identifica diferencias en tipos de datos, constraints, índices
- Detecta consultas SQL que no tienen equivalente en GAS
- Lista operaciones de base de datos faltantes

#### **B) Capa de Lógica de Negocio**
- Compara cada endpoint de Express (`backend/server.js`) con funciones de GAS (`Código.gs`)
- Identifica rutas faltantes: GET/POST que no están en GAS
- Compara validaciones del lado del servidor
- Detecta lógica de negocio no migrada

#### **C) Capa de Presentación**
- Compara `frontend/app.js` (3336 líneas) con `index.html` de GAS (928 líneas)
- Identifica event listeners faltantes
- Detecta funciones JavaScript no migradas
- Compara formularios y validaciones del lado del cliente

#### **D) Funcionalidades Específicas**
Para CADA funcionalidad, verifica:
1. **Búsqueda simple**: ¿Funciona igual? ¿Misma velocidad?
2. **Búsqueda avanzada**: ¿Implementada? ¿Filtros combinados?
3. **CRUD de pacientes**: ¿Crear/Leer/Actualizar/Eliminar completo?
4. **CRUD de prestaciones**: ¿Todas las operaciones?
5. **Archivos adjuntos**: ¿Sistema equivalente?
6. **Autenticación**: ¿Misma seguridad?
7. **Roles y permisos**: ¿Comportamiento idéntico?
8. **Impresión**: ¿Misma presentación?
9. **Temas visuales**: ¿Los 3 temas funcionan?
10. **Calendario**: ¿Widget funcional?

#### **E) Arquitectura y Performance** ⚡ **[CRÍTICO - PRIORIDAD MÁXIMA]**

**ANALIZA CON ESPECIAL ATENCIÓN LAS TÉCNICAS DE OPTIMIZACIÓN:**

1. **En `frontend/app.js` identifica:**
   - ¿Usa caché (localStorage, variables globales, sessionStorage)?
   - ¿Implementa debounce/throttle en búsquedas? ¿Cuántos milisegundos?
   - ¿Carga datos bajo demanda (lazy loading) o todo de una vez?
   - ¿Usa Promises paralelas (Promise.all) o secuenciales?
   - ¿Tiene índices o estructuras de lookup para búsqueda rápida?
   - ¿Implementa paginación o scroll infinito?
   - ¿Precarga datos frecuentes en el inicio?

2. **En `backend/server.js` identifica:**
   - ¿Usa caché en memoria o Redis?
   - ¿Implementa connection pooling?
   - ¿Hace consultas batch o row-by-row?
   - ¿Usa índices en SQLite?
   - ¿Tiene queries optimizadas (LIMIT, WHERE con índices)?
   - ¿Implementa rate limiting o throttling?

3. **Para CADA técnica encontrada, especifica:**
   - **Líneas exactas** en el código original donde se implementa
   - **Cómo adaptarla a GAS** usando CacheService, PropertiesService, getRange vs getValues
   - **Impacto estimado**: "Reducirá búsqueda de 3s a 0.5s" o similar
   - **Prioridad**: Crítica / Alta / Media

4. **Cuellos de botella actuales en GAS a resolver:**
   - ❌ getRange() lee toda la hoja en cada búsqueda → SOLUCIÓN:
   - ❌ Sin caché de EFECTORES_DICT (67 registros) → SOLUCIÓN:
   - ❌ Búsqueda lineal O(n) en 1693 pacientes → SOLUCIÓN:
   - ❌ Llamadas síncronas bloquean UI → SOLUCIÓN:
   - ❌ Prestaciones (22,582 registros) cargan todas → SOLUCIÓN:

**OBJETIVO: Búsquedas < 1 segundo, carga de ficha < 2 segundos, guardado < 3 segundos**

---

### **TAREA 2: Plan de Acción Detallado**

Genera un **documento estructurado** con instrucciones **PRECISAS** para implementar cada funcionalidad faltante.

**⚡ INCLUYE SECCIÓN OBLIGATORIA DE OPTIMIZACIÓN PRIMERO:**

#### **PRIORIDAD 0: OPTIMIZACIONES DE VELOCIDAD (IMPLEMENTAR ANTES QUE CUALQUIER FUNCIONALIDAD)**

Para cada optimización:

```markdown
## OPTIMIZACIÓN: [Nombre técnico - ej: "Caché de EFECTORES_DICT"]

### PROBLEMA ACTUAL:
[Descripción del cuello de botella con tiempos medidos]

### SOLUCIÓN:
[Técnica específica de GAS a usar: CacheService, PropertiesService, índices, batch, etc.]

### CÓDIGO BACKEND (Código.gs):
```javascript
// Código completo con comentarios
```

### CÓDIGO FRONTEND (index.html):
```javascript
// Código completo con comentarios
```

### GANANCIA ESTIMADA:
- Tiempo actual: [X] segundos
- Tiempo esperado: [Y] segundos
- Mejora: [Z]%

### TESTING:
- [Cómo medir la mejora]
```

#### **PRIORIDAD 1-N: FUNCIONALIDADES FALTANTES (DESPUÉS DE OPTIMIZAR)**

#### **Formato requerido para cada instrucción:**

```markdown
## FUNCIONALIDAD: [Nombre exacto]

### ARCHIVO: [Ruta completa del archivo a modificar]

### UBICACIÓN: 
- Línea inicio: [número]
- Línea fin: [número]
- O descripción: "Después de la función X" / "Dentro del formulario Y"

### ACCIÓN: [AGREGAR / MODIFICAR / ELIMINAR]

### CÓDIGO EXACTO:
```javascript
// Código completo y funcional aquí
// Con comentarios explicativos
// INCLUYE optimizaciones (caché, debounce, etc.)
```

### EXPLICACIÓN:
[Por qué es necesario, cómo funciona, qué problema resuelve]

### OPTIMIZACIONES INCLUIDAS:
- [Lista de técnicas de performance aplicadas en esta función]

### DEPENDENCIAS:
- [Lista de otras funciones o archivos que deben existir]

### TESTING:
- [Cómo verificar que funciona correctamente]
- [Cómo medir el performance (tiempo de respuesta)]
```

---

### **TAREA 3: Identificación de Limitaciones de GAS**

Lista **TODAS** las limitaciones de Google Apps Script que afectan este proyecto:
- Cuotas diarias (ejecuciones, tiempo de ejecución, etc.)
- Restricciones de APIs (qué no se puede hacer)
- Diferencias de sintaxis JavaScript
- Problemas conocidos de performance
- Workarounds recomendados

**⚡ INCLUYE SECCIÓN ESPECÍFICA:**
#### **Límites que Afectan Velocidad:**
- Tiempo máximo de ejecución por función
- Límites de lectura/escritura de Sheets (calls por minuto)
- Tamaño máximo de CacheService (cuánto puedo cachear)
- Restricciones de memoria en runtime
- **IMPORTANTE:** Para cada límite, da el workaround exacto con código

---

### **TAREA 4: Roadmap de Implementación**

Ordena las tareas en **fases priorizadas**:

**FASE 0 - OPTIMIZACIÓN (ANTES DE TODO)** ⚡:
- Implementar CacheService para EFECTORES_DICT
- Implementar caché de búsquedas frecuentes
- Optimizar lectura de Sheets (getValues en vez de getRange row-by-row)
- Implementar índices en memoria para búsqueda rápida
- Lazy loading de prestaciones
- Promesas paralelas en frontend
- **Objetivo: Tiempos < 1s búsqueda, < 2s carga ficha, < 3s guardado**

**FASE 1 - CRÍTICO (debe funcionar YA)**:
- [Lista de funcionalidades core]

**FASE 2 - IMPORTANTE (próxima semana)**:
- [Funcionalidades secundarias]

**FASE 3 - MEJORAS (cuando todo lo demás funcione)**:
- [Nice to have]

---

## 📊 DATOS TÉCNICOS DEL PROYECTO

### **Volumetría**
- Pacientes: ~1,693 registros
- Prestaciones: ~22,582 registros
- Usuarios: 3-5 usuarios activos
- Archivos adjuntos: Variable (PDFs, imágenes)

### **Diccionario de Efectores**
67 prestadores médicos con variantes (ver `EFECTORES_DICT` en Código.gs)

### **Estructura de Datos**

**Tabla/Pestaña: Usuarios**
- usuario (string)
- contrasena (string)
- rol (string: "administrativo" | "auditor")

**Tabla/Pestaña: Base_de_Datos**
- dni (string, PK)
- nombre (string)
- sexo (string)
- fecha_nacimiento (date)
- condicion (string)
- telefono (string)
- direccion (string)
- localidad (string)
- tipo_afiliado (string: "Titular" | "Adherente")
- vinculo_titular (string)
- titular_nombre (string)
- titular_dni (string)
- observaciones (text)
- Carpeta_Drive_ID (string)
- Timestamp_Creacion (datetime)

**Tabla/Pestaña: Prestaciones**
- prestacion_id (string, PK)
- paciente_dni (string, FK)
- paciente_nombre (string)
- fecha_prestacion (date)
- prestador (string)
- prestacion (text)
- Timestamp_Carga (datetime)

---

## 🎯 RESULTADO ESPERADO

Quiero que tu respuesta incluya:

1. **Resumen Ejecutivo** (1 página)
   - Estado actual: X% completado
   - **Análisis de velocidad**: tiempos actuales vs esperados
   - Funcionalidades faltantes: lista numerada
   - **Optimizaciones críticas**: top 5 mejoras de performance
   - Tiempo estimado de implementación
   - Riesgos identificados

2. **Análisis Técnico Detallado** (5-10 páginas)
   - **⚡ SECCIÓN 1: Performance y Optimización** (PRIMERO)
     - Técnicas usadas en app original (con líneas de código)
     - Adaptación a GAS (CacheService, batch operations, etc.)
     - Impacto medible de cada optimización
   - SECCIÓN 2: Comparativa tabla por tabla
   - SECCIÓN 3: Función por función
   - SECCIÓN 4: Con ejemplos de código

3. **Instrucciones de Implementación** (formato especificado arriba)
   - **FASE 0: Optimizaciones (implementar PRIMERO)**
     - Caché de datos estáticos
     - Índices y lookups
     - Batch operations
     - Lazy loading
     - Promesas paralelas
   - FASE 1-N: Funcionalidades
     - Una sección por cada funcionalidad
     - Código copy-paste ready
     - Sin ambigüedades
     - **Cada función DEBE incluir optimizaciones**

4. **Checklist de Validación**
   - **Performance benchmarks**: tiempos objetivo por operación
   - Lista de pruebas para verificar migración completa
   - Criterios de aceptación
   - Casos de prueba específicos
   - **Pruebas de carga**: con 100+ búsquedas simultáneas

---

## ⚠️ RESTRICCIONES Y CLARIFICACIONES

- **COSTO CERO**: No puedo usar servicios pagos (ni VM, ni Cloud SQL, ni Cloud Storage)
- **GOOGLE WORKSPACE GRATUITO**: Solo puedo usar Google Sheets, Drive, Apps Script (tier gratuito)
- **⚡ VELOCIDAD ES CRÍTICA**: Los usuarios están acostumbrados a la app rápida. GAS DEBE ser igual de rápido
- **MANTENIBILIDAD**: El código debe ser claro y documentado
- **ESCALABILIDAD**: Debe soportar hasta 5,000 pacientes y 50,000 prestaciones SIN degradación de performance
- **SEGURIDAD**: Los datos de salud son sensibles, debe haber control de acceso

---

## 🔧 INSTRUCCIONES FINALES PARA TI

1. Lee **TODO** el repositorio: backend/, frontend/, google-apps-script/
2. **⚡ PRIORIDAD #1**: Analiza técnicas de optimización en el código original
   - Busca palabras clave: "cache", "debounce", "throttle", "lazy", "async", "Promise.all", "index", "batch"
   - Identifica cómo manejan volúmenes grandes de datos
   - Detecta estrategias de precarga y caché
3. Enfócate en `frontend/app.js` (3336 líneas) - ahí está TODA la lógica que debe replicarse
4. Compara línea por línea con `google-apps-script/index.html` y `Código.gs`
5. No asumas nada: si una función existe en el original, DEBE existir en GAS
6. **⚡ CADA solución que propongas DEBE incluir optimización de velocidad**
7. Da tiempos estimados de respuesta para cada función implementada
8. Dame instrucciones TAN PRECISAS que otro desarrollador (GitHub Copilot) pueda implementarlas sin dudas

---

## 📌 PREGUNTAS CLAVE PARA VERIFICAR

Antes de darme tu respuesta, pregúntate:

> **1. "Si sigo estas instrucciones al pie de la letra, ¿obtendré una aplicación 100% funcional, idéntica a la original, sin perder ninguna característica?"**

> **2. "¿Incluí optimizaciones específicas de GAS (CacheService, batch getValues, índices) en TODAS las funciones?"**

> **3. "¿Los tiempos de respuesta estimados son < 1s búsqueda, < 2s carga ficha, < 3s guardado?"**

> **4. "¿Especifiqué las líneas EXACTAS del código original donde se usan las técnicas de optimización?"**

Si la respuesta a CUALQUIERA es NO, revisa y completa tu análisis.

---

**¡GRACIAS POR TU AYUDA! Este proyecto es crítico para gestionar pacientes de casos complejos de IAPOS (obra social de Santa Fe, Argentina). La migración exitosa permitirá mantener el servicio sin costos operativos, pero LA VELOCIDAD ES NO NEGOCIABLE - los usuarios no aceptarán una app lenta.**


---

**¡GRACIAS POR TU AYUDA! Este proyecto es crítico para gestionar pacientes de casos complejos de IAPOS (obra social de Santa Fe, Argentina). La migración exitosa permitirá mantener el servicio sin costos operativos.**
