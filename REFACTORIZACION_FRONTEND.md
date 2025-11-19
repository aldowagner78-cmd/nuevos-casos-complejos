# REFACTORIZACIÓN FRONTEND - PLAN DE EJECUCIÓN

## CAMBIOS COMPLETADOS:

### Backend (Código.gs)
✅ 1. Renombrado de archivos ajustado a formato "APELLIDOS NOMBRES_archivo.ext"
✅ 2. Array archivos_adjuntos con {nombre, url, id} ya implementado

## CAMBIOS PENDIENTES FRONTEND (index.html):

### 1. MODALES PERSONALIZADOS (Líneas a modificar)
- Agregar funciones mostrarModalAviso() y mostrarModalAccion()
- Reemplazar 14 llamadas a alert() por mostrarModalAviso()
- Reemplazar 3 llamadas a confirm() por mostrarModalAccion()

### 2. FUNCIÓN DE IMPRESIÓN PROFESIONAL
- Reemplazar window.print() en línea 642 por printPatientCard()
- Agregar función printPatientCard() completa con:
  - Creación de área de impresión temporal
  - Pie de página con fecha en español
  - Cleanup después de imprimir
  - Soporte para afterprint event

### 3. FUNCIÓN DE IMPRESIÓN DE PRESTACIONES
- Agregar printPrestacionesTable() 
- Vincular botón de imprimir historial
- Generar tabla con encabezado y pie de página

### 4. ESTILOS @MEDIA PRINT
- Agregar estilos completos de impresión desde style.css
- Configurar @page A4 portrait con márgenes 2cm
- Ocultar elementos innecesarios en impresión
- Estilo para .print-footer fixed bottom right

### 5. RENDERIZADO DE ARCHIVOS ADJUNTOS
- Actualizar renderizado de archivos_adjuntos
- Mostrar lista <ul> con links individuales
- Agregar rel="noopener noreferrer" a todos los target="_blank"

## ORDEN DE EJECUCIÓN:
1. Agregar funciones helper (modales + impresión) al final del <script>
2. Reemplazar todos los alert()/confirm()
3. Reemplazar window.print()
4. Actualizar renderizado de archivos
5. Agregar estilos @media print en <style>
