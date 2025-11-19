/**
 * Script temporal para reordenar columnas de Base_de_Datos
 * Ejecutar UNA VEZ desde el editor de Apps Script
 * Luego BORRAR este archivo
 */

function reordenarColumnasBaseDatos() {
  const ss = SpreadsheetApp.openByUrl("TU_URL_DE_SHEET_AQUI");
  const sheet = ss.getSheetByName("Base_de_Datos");
  
  // Orden correcto de columnas
  const ordenCorrecto = [
    "dni",
    "nombre", 
    "sexo",
    "fecha_nacimiento",
    "condicion",
    "telefono",
    "direccion",
    "localidad",
    "tipo_afiliado",
    "vinculo_titular",
    "titular_nombre",
    "titular_dni",
    "observaciones",
    "Carpeta_Drive_ID"
  ];
  
  // Leer encabezados actuales
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Leer todos los datos
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  // Crear mapeo de índices
  const mapeoIndices = {};
  headers.forEach((header, idx) => {
    mapeoIndices[header.toLowerCase().trim()] = idx;
  });
  
  // Reordenar datos
  const datosReordenados = data.map(fila => {
    const nuevaFila = [];
    ordenCorrecto.forEach(nombreCol => {
      const idx = mapeoIndices[nombreCol.toLowerCase()];
      nuevaFila.push(idx !== undefined ? fila[idx] : "");
    });
    return nuevaFila;
  });
  
  // Limpiar hoja y escribir datos reordenados
  sheet.clear();
  
  // Escribir encabezados
  sheet.getRange(1, 1, 1, ordenCorrecto.length).setValues([ordenCorrecto]);
  
  // Escribir datos
  if (datosReordenados.length > 0) {
    sheet.getRange(2, 1, datosReordenados.length, ordenCorrecto.length).setValues(datosReordenados);
  }
  
  // Formatear encabezados
  sheet.getRange(1, 1, 1, ordenCorrecto.length)
    .setFontWeight("bold")
    .setBackground("#4285f4")
    .setFontColor("#ffffff");
  
  Logger.log("✅ Reordenamiento completado");
  Logger.log(`Total de filas procesadas: ${datosReordenados.length}`);
}
