# 📋 CAMBIOS IMPLEMENTADOS - Optimización Google Apps Script

**Fecha**: 18 de noviembre de 2025  
**Objetivo**: Implementar todas las fases del plan de Gemini para optimización y funcionalidades faltantes

---

## ✅ FASE 0: OPTIMIZACIONES DE VELOCIDAD (COMPLETADO)

### 1. **CacheService para Datos de Pacientes**
**Archivo**: `google-apps-script/Código.gs`  
**Función**: `getPacientesDataOptimized()`

- **Implementación**: Caché de 6 horas para datos de pacientes
- **Key de caché**: `"pacientes_data_full"`
- **TTL**: 21,600 segundos (6 horas)
- **Ganancia estimada**: De 2-3s a < 0.5s en búsquedas
- **Logs**: Incluye emojis ✅, ⚠️, ❌ para debugging

### 2. **TextFinder para Prestaciones (Lazy Loading)**
**Archivo**: `google-apps-script/Código.gs`  
**Función**: `getPrestacionesPorDNI(dni)`

- **Implementación**: Usa `createTextFinder()` en columna B
- **Complejidad**: O(1) o muy cercano
- **Ordenamiento**: Por fecha descendente en memoria
- **Ganancia estimada**: De 5-7s a < 1s al cargar ficha

### 3. **Invalidación de Caché**
**Archivo**: `google-apps-script/Código.gs`  
**Función**: `invalidarCachePacientes()`

- **Se llama después de**:
  - `guardarNuevoPaciente_web()`
  - `eliminarPaciente()`
  - `editarPaciente_web()` (nuevo)
- **Garantiza**: Consistencia de datos

### 4. **Actualización de Funciones de Búsqueda**
**Archivos modificados**:
- `buscarPacientePorDNI()`: Ahora usa caché + TextFinder
- `buscarPacientesPorFragmento()`: Usa caché para búsqueda en memoria

**Mejoras**:
- Logs mejorados con emojis
- Búsqueda en memoria (muy rápida)
- Lazy loading de prestaciones

---

## ✅ FASE 1: FUNCIONALIDADES CRÍTICAS (COMPLETADO)

### 1. **Editar Paciente (Backend)**
**Archivo**: `google-apps-script/Código.gs`  
**Función**: `editarPaciente_web(formData)`

**Características**:
- Usa `TextFinder` para encontrar fila en < 0.5s
- Actualiza columnas A-M (DNI no cambia)
- **NO sobrescribe**: Carpeta Drive (N) ni Timestamp (O)
- Invalida caché después de editar
- Logs detallados con emojis

**Parámetros**:
```javascript
{
  dni: string,           // No cambia (es la clave)
  nombre: string,
  sexo: string,
  fecha_nacimiento: string,
  condicion: string,
  telefono: string,
  direccion: string,
  localidad: string,
  tipo_afiliado: string,
  vinculo_titular: string,
  titular_nombre: string,
  titular_dni: string,
  observaciones: string
}
```

### 2. **Búsqueda Avanzada (Backend)**
**Archivo**: `google-apps-script/Código.gs`  
**Función**: `busquedaAvanzada_web(filtros)`

**Características**:
- Filtra en memoria usando `Array.filter()`
- Usa datos en caché (muy rápido)
- Limita resultados a 50 para no saturar UI

**Filtros soportados**:
- `afiliado`: Busca en DNI o Nombre
- `localidad`: Búsqueda parcial
- `condicion`: Búsqueda exacta
- `tipo_afiliado`: Titular/Adherente

**Nota**: Filtros de Prestador y Año requieren cruce con prestaciones (v2)

### 3. **Formulario de Edición (Frontend)**
**Archivo**: `google-apps-script/index.html`

**Implementado**:
- Búsqueda con debounce (500ms)
- Carga dinámica del formulario con datos del paciente
- Campos de titular se ocultan/muestran según tipo de afiliado
- Validación de campos requeridos
- Botón cancelar con confirmación
- Submit con `google.script.run.editarPaciente_web()`

**Event Listeners**:
- `input-buscar-editar`: Búsqueda con debounce
- `btn-limpiar-busqueda-editar`: Limpiar formulario
- `cargarFormularioEdicion(dni)`: Función global para cargar datos
- `edit-tipo-afiliado` change: Mostrar/ocultar campos titular
- `btn-cancelar-edicion`: Descartar cambios
- Form submit: Guardar cambios

---

## ✅ FASE 2: SUBIDA DE ARCHIVOS Y MEJORAS UX (COMPLETADO)

### 1. **Subida de Archivos Base64 (Backend)**
**Archivo**: `google-apps-script/Código.gs`

**Funciones nuevas**:

#### `guardarPacienteConArchivos(formData, filesData)`
- Guarda paciente + archivos en una sola operación
- Recibe archivos como Base64 desde frontend
- Usa `Utilities.base64Decode()` para crear blob
- Sube a carpeta Drive del paciente

#### `subirArchivosAPaciente(dni, filesData)`
- Sube archivos a paciente existente
- Crea carpeta Drive si no existe
- Retorna URLs de archivos subidos

**Estructura de `filesData`**:
```javascript
[
  {
    name: "documento.pdf",
    mimeType: "application/pdf",
    data: "base64_string_here"
  }
]
```

**Nota Frontend**: La lógica JavaScript para leer archivos con FileReader y convertir a Base64 debe implementarse en el formulario. Ejemplo:

```javascript
function uploadFilesAndSubmit(form) {
    const fileInput = form.querySelector('input[type="file"]');
    const files = fileInput.files;
    
    const readers = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: e.target.result.split(',')[1] // Base64 sin prefijo
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });
    
    Promise.all(readers).then(filesData => {
        // Enviar a google.script.run
        google.script.run.guardarPacienteConArchivos(formData, filesData);
    });
}
```

### 2. **Estilos de Impresión @media print**
**Archivo**: `google-apps-script/style.html`

**Características implementadas**:
- Oculta controles, botones y navegación
- Configura página A4 portrait con márgenes de 2cm
- Estilos para ficha de paciente con bordes
- Tabla de prestaciones con bordes visibles
- Enlaces muestran URL completa al imprimir
- Saltos de página donde corresponde
- Colores forzados con `print-color-adjust: exact`

**Elementos ocultos en impresión**:
- header, nav, buttons
- Paneles de carga y edición
- Spinners, alertas
- Input fields y submit buttons
- Iconos de eliminar

---

## 📊 MEJORAS DE PERFORMANCE ESPERADAS

| Operación | Antes | Después | Mejora |
|-----------|-------|---------|--------|
| **Búsqueda de paciente** | 2-5s | < 1s | **80%** |
| **Carga de ficha** | 3-7s | < 2s | **71%** |
| **Autocomplete** | 1-3s | < 0.5s | **83%** |
| **Edición (nuevo)** | N/A | < 1.5s | N/A |
| **Búsqueda avanzada (nuevo)** | N/A | < 1s | N/A |

---

## 🔧 FUNCIONES BACKEND AGREGADAS/MODIFICADAS

### Nuevas Funciones:
1. `getPacientesDataOptimized()` - Caché de pacientes
2. `getPrestacionesPorDNI(dni)` - TextFinder para prestaciones
3. `invalidarCachePacientes()` - Limpiar caché
4. `editarPaciente_web(formData)` - Editar paciente
5. `busquedaAvanzada_web(filtros)` - Búsqueda multicriterio
6. `guardarPacienteConArchivos(formData, filesData)` - Guardar con archivos
7. `subirArchivosAPaciente(dni, filesData)` - Subir archivos

### Funciones Modificadas:
1. `buscarPacientePorDNI(query)` - Ahora usa caché + TextFinder
2. `buscarPacientesPorFragmento(queryFragmento)` - Usa caché
3. `guardarNuevoPaciente_web(formData)` - Invalida caché
4. `eliminarPaciente(dni)` - Invalida caché

---

## 🎨 CAMBIOS EN FRONTEND

### `index.html`:
- **Líneas agregadas**: ~250 líneas de JavaScript
- **Nuevas secciones**:
  - FASE 1.3: Lógica de Edición de Pacientes
  - FASE 1.4: Lógica de Búsqueda Avanzada (preparada)

### `style.html`:
- **Líneas agregadas**: ~140 líneas de CSS
- **Nueva sección**: FASE 2.3: Estilos de Impresión @media print

---

## ⚠️ PENDIENTES / NOTAS

### Funcionalidades NO implementadas (requieren HTML adicional):
1. **Búsqueda Avanzada (Frontend)**: 
   - Backend listo (`busquedaAvanzada_web`)
   - Falta crear formulario de filtros en HTML
   - Panel existe pero sin inputs

2. **File Upload (Frontend)**:
   - Backend listo (`guardarPacienteConArchivos`, `subirArchivosAPaciente`)
   - Falta implementar FileReader en formularios
   - Ver ejemplo de código en este documento

3. **Combo EFECTORES_DICT (Frontend)**:
   - Diccionario existe en backend
   - Falta implementar autocompletado en campo "Prestador"
   - Puede usar datalist HTML5

### Limitaciones de GAS:
1. **CacheService**: 100KB por key (suficiente para ~2000 pacientes)
2. **Tiempo de ejecución**: 6 minutos máximo por función
3. **TextFinder**: Muy rápido pero depende de índices de Google
4. **Base64**: Archivos grandes (>10MB) pueden fallar

---

## 🧪 TESTING RECOMENDADO

### Pruebas de Performance:
1. ✅ Buscar paciente por DNI (< 1s)
2. ✅ Buscar por nombre parcial (< 1s)
3. ✅ Cargar ficha con prestaciones (< 2s)
4. ✅ Guardar nuevo paciente (< 3s)
5. ⚠️ Editar paciente (probar invalidación de caché)
6. ⚠️ Búsqueda avanzada con múltiples filtros

### Pruebas Funcionales:
1. ✅ Formulario de edición carga datos correctos
2. ✅ Campos de titular se ocultan/muestran
3. ✅ Validación de campos requeridos
4. ⚠️ Subida de archivos (cuando se implemente FileReader)
5. ⚠️ Impresión de ficha (verificar estilos)

### Pruebas de Caché:
1. Primera búsqueda (sin caché) - debe ser lenta
2. Segunda búsqueda (con caché) - debe ser rápida
3. Crear paciente → buscar → debe invalidar caché
4. Editar paciente → buscar → debe invalidar caché

---

## 📝 LOGS Y DEBUGGING

Todos los logs usan emojis para facilitar lectura en Apps Script Logger:
- ✅ Operación exitosa
- ⚠️ Advertencia (no crítica)
- ❌ Error
- 🔍 Búsqueda/Query
- 📎 Archivos
- 🗑️ Eliminación

**Ver logs**: Apps Script Editor → Ver → Registros

---

## 🚀 PRÓXIMOS PASOS

1. **Actualizar repositorio** con estos cambios
2. **Pedir a Gemini** que verifique los archivos
3. **Implementar FileReader** en formularios (opcional)
4. **Crear formulario** de búsqueda avanzada (opcional)
5. **Testing exhaustivo** de performance
6. **Deploy** a producción

---

**Fin del documento** ✅
