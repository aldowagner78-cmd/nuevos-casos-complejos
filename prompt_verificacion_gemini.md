# Prompt de Verificación para Gemini 3.0

## 🎯 OBJETIVO

Verifica que los cambios implementados en la carpeta `google-apps-script/` cumplan con el plan de optimización que diseñaste previamente. Analiza **SOLO los archivos** dentro de `google-apps-script/` y confirma que:

1. ✅ Todas las optimizaciones de FASE 0 estén correctamente implementadas
2. ✅ Las funcionalidades críticas de FASE 1 funcionen según lo especificado
3. ✅ Las mejoras de FASE 2 estén completas
4. ⚠️ Identifiques cualquier error, inconsistencia o mejora necesaria

---

## 📂 ARCHIVOS A ANALIZAR

Analiza **ÚNICAMENTE** estos archivos del repositorio:

```
/google-apps-script/
  ├── Código.gs          (Backend - 1070 líneas aprox.)
  ├── index.html         (Frontend - 1180 líneas aprox.)
  ├── style.html         (CSS - 3010 líneas aprox.)
  ├── login.html         (Sin cambios)
  └── README.md          (Sin cambios)
```

**NO analices**: `/frontend/`, `/backend/`, `/data/` ni otros archivos del repositorio.

---

## ✅ CHECKLIST DE VERIFICACIÓN

### **FASE 0: OPTIMIZACIONES DE VELOCIDAD**

Verifica que existan y funcionen correctamente:

#### ✅ 1. CacheService para Pacientes
- [ ] Función `getPacientesDataOptimized()` existe en `Código.gs`
- [ ] Usa `CacheService.getScriptCache()`
- [ ] Key de caché: `"pacientes_data_full"`
- [ ] TTL: 21,600 segundos (6 horas)
- [ ] Retorna array si caché vacío (lee de Sheet)
- [ ] Guarda en caché después de leer Sheet
- [ ] Maneja errores si caché es muy grande

**Pregunta crítica**: ¿El código hace `JSON.parse()` y `JSON.stringify()` correctamente?

#### ✅ 2. TextFinder para Prestaciones
- [ ] Función `getPrestacionesPorDNI(dni)` existe en `Código.gs`
- [ ] Usa `createTextFinder()` en columna B (DNI paciente)
- [ ] Usa `.matchEntireCell(true)` para búsqueda exacta
- [ ] Retorna array vacío si no hay resultados
- [ ] Lee filas con `getRange(row, 1, 1, 7).getValues()[0]`
- [ ] Ordena por fecha descendente (más recientes primero)

**Pregunta crítica**: ¿Usa `findAll()` para obtener todas las ocurrencias?

#### ✅ 3. Invalidación de Caché
- [ ] Función `invalidarCachePacientes()` existe
- [ ] Usa `cache.remove("pacientes_data_full")`
- [ ] Se llama después de `guardarNuevoPaciente_web()`
- [ ] Se llama después de `eliminarPaciente()`
- [ ] Se llama después de `editarPaciente_web()`

**Pregunta crítica**: ¿Se llama en TODOS los lugares necesarios?

#### ✅ 4. Funciones de Búsqueda Actualizadas
- [ ] `buscarPacientePorDNI(query)` llama a `getPacientesDataOptimized()`
- [ ] `buscarPacientePorDNI(query)` llama a `getPrestacionesPorDNI()` para prestaciones
- [ ] `buscarPacientesPorFragmento(queryFragmento)` usa datos en caché
- [ ] Ambas funciones tienen logs con emojis (🔍, ✅, ❌)

**Pregunta crítica**: ¿Se eliminó el código viejo que leía la hoja completa en cada búsqueda?

---

### **FASE 1: FUNCIONALIDADES CRÍTICAS**

#### ✅ 5. Editar Paciente (Backend)
- [ ] Función `editarPaciente_web(formData)` existe en `Código.gs`
- [ ] Usa `TextFinder` en columna A (DNI) con `.matchEntireCell(true)`
- [ ] Obtiene fila con `result.getRow()`
- [ ] Actualiza SOLO columnas A-M (13 columnas)
- [ ] **NO sobrescribe** columna N (Carpeta_Drive_ID) ni O (Timestamp)
- [ ] Llama a `invalidarCachePacientes()` al final
- [ ] Usa `formatearFecha()` para fecha de nacimiento
- [ ] Retorna `{ message: "...", dni: dni }`

**Pregunta crítica**: ¿El DNI en formData se trata como clave (no cambia)?

**Código esperado**:
```javascript
ws.getRange(row, 1, 1, rowData.length).setValues([rowData]);
invalidarCachePacientes();
```

#### ✅ 6. Búsqueda Avanzada (Backend)
- [ ] Función `busquedaAvanzada_web(filtros)` existe
- [ ] Llama a `getPacientesDataOptimized()` para datos
- [ ] Usa `Array.filter()` en memoria (NO lee hoja)
- [ ] Soporta filtros:
  - `filtros.afiliado` (busca en DNI o Nombre)
  - `filtros.localidad` (búsqueda parcial)
  - `filtros.condicion` (búsqueda exacta)
  - `filtros.tipo_afiliado` (Titular/Adherente)
- [ ] Limita resultados a 50 con `.slice(0, 50)`
- [ ] Retorna array de objetos `{dni, nombre}`

**Pregunta crítica**: ¿El filtrado es en memoria (no vuelve a leer Sheet)?

#### ✅ 7. Formulario de Edición (Frontend)
- [ ] Existe `input-buscar-editar` en `index.html`
- [ ] Event listener con debounce de 500ms
- [ ] Llama a `buscarPacientesPorFragmento()`
- [ ] Función global `cargarFormularioEdicion(dni)` existe
- [ ] Llama a `buscarPacientePorDNI()` para obtener datos
- [ ] Construye formulario dinámicamente con datos del paciente
- [ ] DNI es readonly (`<input readonly>`)
- [ ] Campos de titular se ocultan si tipo_afiliado === 'Titular'
- [ ] Event listener en `edit-tipo-afiliado` para cambiar visibilidad
- [ ] Botón cancelar con `confirm()` 
- [ ] Submit llama a `editarPaciente_web(formData)`

**Pregunta crítica**: ¿El formulario maneja correctamente la conversión de fecha DD/MM/YYYY → YYYY-MM-DD para input date?

**Código esperado en submit**:
```javascript
google.script.run
    .withSuccessHandler(...)
    .withFailureHandler(...)
    .editarPaciente_web(formData);
```

---

### **FASE 2: SUBIDA DE ARCHIVOS Y MEJORAS UX**

#### ✅ 8. Subida de Archivos Base64 (Backend)
- [ ] Función `guardarPacienteConArchivos(formData, filesData)` existe
- [ ] Llama a `guardarNuevoPaciente_web()` primero
- [ ] Usa `TextFinder` para obtener Carpeta_Drive_ID
- [ ] Itera sobre `filesData` array
- [ ] Usa `Utilities.base64Decode(fileObj.data)`
- [ ] Usa `Utilities.newBlob()` para crear blob
- [ ] Crea archivo con `carpeta.createFile(blob)`
- [ ] Retorna array de archivos subidos

**Pregunta crítica**: ¿Maneja correctamente si `carpetaDriveId` es vacío?

- [ ] Función `subirArchivosAPaciente(dni, filesData)` existe
- [ ] Busca paciente con `TextFinder`
- [ ] Crea carpeta Drive si no existe
- [ ] Actualiza columna N (Carpeta_Drive_ID) si se crea
- [ ] Retorna URLs de archivos subidos

**Pregunta crítica**: ¿Retorna objetos con `{name, url}` para cada archivo?

#### ✅ 9. Estilos de Impresión (Frontend)
- [ ] Existe bloque `@media print` en `style.html`
- [ ] Oculta: header, nav, buttons, inputs, controls
- [ ] Configura `@page` con márgenes y tamaño A4
- [ ] Establece `body { background: white !important; color: black !important; }`
- [ ] Estilos para `.patient-card` con bordes
- [ ] Estilos para `.tabla-prestaciones` con bordes
- [ ] Regla `a[href]:after` muestra URLs
- [ ] Usa `print-color-adjust: exact` para colores
- [ ] Incluye `.page-break-before` y `.page-break-after`

**Pregunta crítica**: ¿Se ocultan los botones de eliminar y los spinners?

---

## 🔍 ANÁLISIS DE CALIDAD DE CÓDIGO

### Performance:
1. ¿Se evita leer la hoja completa en bucles?
2. ¿Se usa `getRange().getValues()` en batch (una sola llamada)?
3. ¿Se evita `getRange(row, col).getValue()` dentro de loops?
4. ¿El caché tiene un TTL razonable (no muy corto ni muy largo)?

### Robustez:
1. ¿Todas las funciones tienen `try-catch`?
2. ¿Se validan parámetros vacíos (`!dni || dni.trim() === ''`)?
3. ¿Los logs incluyen información útil para debugging?
4. ¿Se manejan errores de caché (si es muy grande)?

### Consistencia:
1. ¿Se usa el mismo formato de logs en todas las funciones?
2. ¿Los nombres de variables son consistentes (camelCase)?
3. ¿Los mensajes de retorno son informativos?
4. ¿Se mantiene la estructura de datos del proyecto original?

---

## ❌ ERRORES COMUNES A BUSCAR

### Backend:
1. ❌ Olvidar `invalidarCachePacientes()` después de operaciones de escritura
2. ❌ Usar `getRange(row, col).getValue()` en loop (lento)
3. ❌ No usar `matchEntireCell(true)` en TextFinder (búsquedas inexactas)
4. ❌ No parsear JSON antes de retornar del caché
5. ❌ Sobrescribir Carpeta_Drive_ID o Timestamp en edición

### Frontend:
1. ❌ No hacer debounce en búsqueda (demasiadas llamadas)
2. ❌ No validar campos requeridos antes de submit
3. ❌ No limpiar formulario después de éxito
4. ❌ No mostrar spinners mientras se procesa
5. ❌ DNI editable en formulario de edición (debe ser readonly)

---

## 📊 MÉTRICAS ESPERADAS

Verifica que el código **pueda** lograr estos tiempos:

| Operación | Tiempo Objetivo | Código Responsable |
|-----------|----------------|---------------------|
| Búsqueda de paciente (con caché) | < 1s | `buscarPacientePorDNI` con `getPacientesDataOptimized` |
| Búsqueda de paciente (sin caché) | < 3s | Primera llamada a `getPacientesDataOptimized` |
| Carga de ficha (con prestaciones) | < 2s | `getPrestacionesPorDNI` con TextFinder |
| Guardar nuevo paciente | < 3s | `guardarNuevoPaciente_web` + invalidar caché |
| Editar paciente | < 1.5s | `editarPaciente_web` con TextFinder |
| Búsqueda avanzada | < 1s | `busquedaAvanzada_web` con caché |

**¿El código está optimizado para lograr estos tiempos?**

---

## 📝 FORMATO DE RESPUESTA ESPERADO

Genera tu respuesta en este formato:

```markdown
# ✅ VERIFICACIÓN DE IMPLEMENTACIÓN - Google Apps Script

## RESUMEN EJECUTIVO
- Estado general: [✅ APROBADO / ⚠️ APROBADO CON OBSERVACIONES / ❌ REQUIERE CORRECCIONES]
- Funcionalidades implementadas: X de Y (Z%)
- Optimizaciones correctas: X de Y (Z%)
- Errores críticos encontrados: X
- Advertencias menores: X

## FASE 0: OPTIMIZACIONES ✅ / ⚠️ / ❌
### 1. CacheService: [✅ / ❌]
- Implementación: [Descripción breve]
- Observaciones: [Si hay problemas]

### 2. TextFinder: [✅ / ❌]
- Implementación: [Descripción breve]
- Observaciones: [Si hay problemas]

[... continuar con todas las fases ...]

## ERRORES CRÍTICOS ENCONTRADOS
1. [Descripción del error]
   - **Archivo**: [ruta]
   - **Línea aproximada**: [si puedes identificarla]
   - **Solución**: [código correcto]

## MEJORAS SUGERIDAS
1. [Descripción de mejora]
   - **Beneficio**: [qué se gana]
   - **Código sugerido**: [si aplica]

## ANÁLISIS DE PERFORMANCE
- ¿Se evitan lecturas repetidas de Sheet? [SÍ / NO]
- ¿Se usa caché correctamente? [SÍ / NO]
- ¿TextFinder está bien implementado? [SÍ / NO]
- ¿Tiempos esperados alcanzables? [SÍ / PROBABLEMENTE / NO]

## CONCLUSIÓN
[Resumen final y recomendaciones]

## CÓDIGO LISTO PARA PRODUCCIÓN?
[SÍ / NO / CON CORRECCIONES MENORES]
```

---

## 🚨 IMPORTANTE

- **Analiza TODO el código**, no asumas que está bien porque lo diseñaste
- **Busca errores reales** (typos, lógica incorrecta, falta de validación)
- **Sé específico** en las correcciones (línea, función, problema exacto)
- **Prioriza** errores críticos vs mejoras opcionales
- **Valida** que se sigan las mejores prácticas de GAS

---

**Link del repositorio**: https://github.com/aldowagner78-cmd/nuevos-casos-complejos

**Carpeta a analizar**: `/google-apps-script/`

¡Gracias por tu análisis exhaustivo! 🚀
