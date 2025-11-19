/*
=================================================================
VARIABLES GLOBALES Y DICCIONARIOS
=================================================================
*/

// ¡¡¡CRÍTICO!!! REEMPLAZA ESTA LÍNEA CON LA URL DE TU HOJA DE CÁLCULO
const SS_URL = "https://docs.google.com/spreadsheets/d/10Xkkbn6juIIffalcB8tIqooZjKLv8KiMUUvIyY2Eq8M/edit";

// Nombres de las hojas (pestañas)
const SHEET_USUARIOS = "Usuarios";
const SHEET_PACIENTES = "Base_de_Datos";
const SHEET_PRESTACIONES = "Prestaciones";

// Nombres de las carpetas de Drive
const APP_FOLDER_NAME = "Casos_Complejos_App";
const ADJUNTOS_FOLDER_NAME = "Archivos_Adjuntos_Casos";

// Diccionario de Efectores (para normalización)
const EFECTORES_DICT = {
  "HIBA": {"variantes": ["HIBA","HIBA SA","HIBA HOSPITAL","HIBA CABA","HIBA HOSP","HIBA CENTRAL","HIBA HIBA","HEBA","HBU","htal italiano","htal. italiano","h. italiano","h.i","italiano","hospital italiano","h italiano","hosp. italiano","italiano sa","italiano hospital"], "tooltip": "Hospital Italiano de Buenos Aires"},
  "ALPI": {"variantes": ["ALPI","ALPI - A.C.","ALPI A.C.","ALPÍ - A.C."], "tooltip": "ALPI Asociación Civil, Clínica de Rehabilitación Neuromotriz y Respiratoria"},
  "ARAUZ": {"variantes": ["ARAUZ","F ARAUZ"], "tooltip": "Instituto Otorrinolaringológico Arauz S.A. (IORL Arauz)"},
  "ARGERICH": {"variantes": ["ARGERICH","H ARGERICH"], "tooltip": "Hospital General de Agudos Dr. Cosme Argerich"},
  "BAZTERRICA": {"variantes": ["BAZTERRICA"], "tooltip": "Clínica Bazterrica S.A."},
  "BITGENIA": {"variantes": ["BITGENIA"], "tooltip": "Bitgenia (23Peers S.A.)"},
  "BRITANICO": {"variantes": ["BRITANICO CONS"], "tooltip": "Hospital Británico de Buenos Aires"},
  "C. OFTALMOLÓGICO": {"variantes": ["C OFTAL","C OFTAL NEGRI","C OFTAL.","C OFTALMOLOGICO","C. OFTAL.","C. OFTAL. S.A.","C. OFTALM.","C.OF. 'DEVOTO'","CENTRO OFTALM."], "tooltip": "Hospital Oftalmológico Santa Lucía / Clínica de Ojos Dr. Nano / Instituto Oftalmológico Argentino"},
  "CHAMOLES": {"variantes": ["CHAMOLES","LAB. CHAMOLES"], "tooltip": "Laboratorio Chamoles"},
  "CEVALLOS": {"variantes": ["CEVALLOS"], "tooltip": "Laboratorio Cevallos Salud S.R.L."},
  "DR DOGLIOTTI": {"variantes": ["DR DOGLIOTTI"], "tooltip": "Consultorio / Laboratorio Dr. Dogliotti"},
  "DR LAFALCE": {"variantes": ["DR LAFALCE"], "tooltip": "Consultorio / Laboratorio Dr. Lafalce"},
  "DR SINJOVICH": {"variantes": ["DR SINJOVICH"], "tooltip": "Consultorio / Laboratorio Dr. Sinjovich"},
  "DR TONIOLO": {"variantes": ["DR TONIOLO","DRA. TONIOLO"], "tooltip": "Consultorio / Laboratorio Dr. Toniolo"},
  "DR NEGRI": {"variantes": ["DR. NEGRI"], "tooltip": "Consultorio Dr. Negri / Instituto Dr. Negri"},
  "DRA. CUGNO": {"variantes": ["DRA. VALERIA CUGNO"], "tooltip": "Consultorio Dra. Valeria Cugno"},
  "DURAND": {"variantes": ["DURAND"], "tooltip": "Hospital General de Agudos Dr. Carlos G. Durand"},
  "ENERI": {"variantes": ["ENERI"], "tooltip": "Laboratorio Eneri"},
  "EN CASA": {"variantes": ["EN CASA","ENCASA"], "tooltip": "Atención médica en domicilio (servicio genérico)"},
  "FRESENIUS": {"variantes": ["FRESENIUS","FRESENIUS MED."], "tooltip": "Fresenius Medical Care Argentina"},
  "GENDA": {"variantes": ["GENDA","GENDA LAB","LAB GENDA","LAB. GENDA"], "tooltip": "GENDA S.A., Laboratorio de Genética y Biología Molecular"},
  "GENOS": {"variantes": ["GENOS","LAB GENOS","LAB. GENOS","LABOR. GENOS"], "tooltip": "Laboratorio GENOS"},
  "GUTTIERREZ": {"variantes": ["GUTTIERREZ","H GUTIERREZ"], "tooltip": "Hospital de Niños Dr. Ricardo Gutiérrez"},
  "HOSPITAL CLINICAS": {"variantes": ["H CLINICAS","HOSP CLINICAS","HOSP DE CLINICAS","H. CLINICAS"], "tooltip": "Hospital de Clínicas José de San Martín UBA"},
  "LANARI": {"variantes": ["LANARI","INST. LANARI"], "tooltip": "Instituto de Investigaciones Médicas Alfredo Lanari (UBA)"},
  "LASER VASCULAR": {"variantes": ["LASER V.","LASER VASCULAR"], "tooltip": "Instituto Argentino de Flebología / Centro Médico Láser SF"},
  "LASERMEDICA": {"variantes": ["LASERMEDICA","LASERMEDICA S.A."], "tooltip": "Lasermedica S.A., Clínica Dermatológica"},
  "LIC. BARRETO": {"variantes": ["LIC BARRETO","LIC. BARRETO"], "tooltip": "Consultorio Licenciado Barreto"},
  "LIC. MARIA POY": {"variantes": ["LIC. MARIA POY"], "tooltip": "Consultorio Licenciada María Poy"},
  "MANLAB": {"variantes": ["MANLAB"], "tooltip": "Laboratorio MANLAB"},
  "MEDICAL CARE": {"variantes": ["MEDICAL CARE"], "tooltip": "Medical Care Argentina S.A."},
  "MEDITAR": {"variantes": ["MEDITAR S.A."], "tooltip": "Meditar S.A."},
  "MTG GROUP SRL": {"variantes": ["MTG GROUP SRL"], "tooltip": "MTG Group S.R.L."},
  "NACER": {"variantes": ["NACER"], "tooltip": "Plan Nacer / Sumar+"},
  "NEGRI": {"variantes": ["NEGRI"], "tooltip": "Consultorio Dr. Negri / Instituto Dr. Negri"},
  "ORT. ALEMANA": {"variantes": ["O. ALEMANA","ORT ALEMANA","ORT. ALEMANA"], "tooltip": "Ortopedia Alemana S.A.C.I. / Grupo Alemana"},
  "OMICS": {"variantes": ["OMICS","OMICS SRL","OMICS SRL."], "tooltip": "Omics S.R.L."},
  "INSTITUTO DE ORL": {"variantes": ["ORL","INST SUP ORL","INST. SUP ORL","INST. SUP. ORL"], "tooltip": "Instituto Superior de Otorrinolaringología (ISO) / IORL"},
  "ORT. IMATIONTY": {"variantes": ["ORT IMATIONTY"], "tooltip": "ORT IMATIONTY"},
  "ORT. SAI": {"variantes": ["ORT SAI","ORT. S.A.I","ORTOPEDIA S.A.I"], "tooltip": "Ortopedia SAI"},
  "ORT. ADDITIVE": {"variantes": ["ORT. ADDITIVE"], "tooltip": "ORT. ADDITIVE"},
  "ORT. CDA": {"variantes": ["ORT. CDA"], "tooltip": "ORT. CDA"},
  "ORT. ALEM.": {"variantes": ["ORTOPEDIA ALEM."], "tooltip": "Ortopedia Alemana S.A.C.I."},
  "ORT. L'AMIC": {"variantes": ["ORTOPEDIA L'AMIC"], "tooltip": "Ortopedia L'Amic"},
  "ORT. MSM": {"variantes": ["ORTOPEDIA MSM"], "tooltip": "Ortopedia MSM"},
  "ORT. S.": {"variantes": ["ORTOPEDIA S."], "tooltip": "Ortopedia S."},
  "REVERIE": {"variantes": ["REVERIE"], "tooltip": "Laboratorio / Instituto Reverie"},
  "ROFFO": {"variantes": ["ROFFO","INST. ROFFO"], "tooltip": "Instituto de Oncología Ángel H. Roffo (UBA)"},
  "SANTA ISABEL": {"variantes": ["SANTA ISABEL"], "tooltip": "Clínica Santa Isabel"},
  "SANTA LUCIA": {"variantes": ["SANTA LUCIA","H SANTA LUCIA"], "tooltip": "Hospital Oftalmológico Santa Lucía"},
  "SAVI": {"variantes": ["SAVI"], "tooltip": "Instituto SAVI"},
  "SERV COMPL": {"variantes": ["SERV COMPL"], "tooltip": "Servicio de Complementarios"},
  "SUIZO ARGENTINO": {"variantes": ["SUIZA ARG.","SUIZO ARGENTINO","SUIZO ARG","SUIZO ARG SA","SUIZO ARG S.A.","SUIZO-ARGENT","SUIZO-ARGENTINA","SUIZO ARGENTINO HOSPITAL"], "tooltip": "Clínica y Maternidad Suizo Argentina / Swiss Medical"},
  "UDAONDO": {"variantes": ["UDAONDO","H UDAONDO"], "tooltip": "Hospital de Gastroenterología Dr. Carlos Bonorino Udaondo"},
  "VIDT": {"variantes": ["VIDT","VIDT CENTRO MED"], "tooltip": "VIDT Oncología Radiante"},
  "AUSTRAL": {"variantes": ["H.AUSTRAL","AUSTRAL","H AUSTRAL","HOSPITAL AUSTRAL","AUSTRAL SA","AUSTRAL HOSPITAL","AUSTRAL CENTRAL","AUSTRAL HOSP","AUSTRAL PILAR"], "tooltip": "Hospital Universitario Austral (Pilar)"},
  "GÜEMES": {"variantes": ["GÜEMES","GUEMES","SANATORIO GUEMES","SANATORIO GÜEMES","S GUEMES","S.GÜEMES","S GUEMES SA","GÜEMES SA","GUEMES SA"], "tooltip": "Sanatorio Güemes S.A."},
  "FAVALORO": {"variantes": ["FAVALORO","FUNDACION FAVALORO","FUNDACIÓN FAVALORO","FAVALORO SA","HOSPITAL FAVALORO","FAVALORO HOSPITAL","FAVALORO CABA","FAVALORO FUNDACION","FAVALORO CENTRAL","FAVALORO HOSP"], "tooltip": "Fundación Favaloro, Hospital Universitario"},
  "FLENI": {"variantes": ["FLENI","FLENI BELGRANO","FLENI SA","FLENI HOSPITAL","FLENI CENTRAL","FLENI HOSP","FLENI CABA","FLENI ESCOBAR","FLENI BELGRANO SA"], "tooltip": "Instituto Fleni"},
  "GARRAHAN": {"variantes": ["GARRAHAN","GARRAHAN SA","GARRAHAN HOSPITAL","GARRAHAN CENTRAL","GARRAHAN HOSP","GARRAHAN CABA","GARRAHAN NIÑOS","GARRAHAN INFANTIL","GARRAHAN PEDIATRICO"], "tooltip": "Hospital de Pediatría S.A.M.I.C. Prof. Dr. Juan P. Garrahan"},
  "ZAMBRANO": {"variantes": ["ZAMBRANO","F ZAMBRANO","F. ZAMBRANO","ZAMBRANO SA","ZAMBRANO HOSPITAL","ZAMBRANO CENTRAL","ZAMBRANO HOSP","ZAMBRANO CABA","ZAMBRANO CLINICA","FUNDACION ZAMBRANO","FUNDACIÓN ZAMBRANO","FUND. ZAMBRANO","FUND ZAMBRANO","ZAMBRANO FUNDACION","ZAMBRANO FUNDACIÓN","ZAMBRANO F","ZAMBRANO (CABA)","ZAMBRANO (FUNDACION)","ZAMBRANO (FUNDACIÓN)"], "tooltip": "Fundación / Instituto Zambrano (Oftalmología)"}
};


/*
=================================================================
FUNCIÓN PRINCIPAL - doGet (El "Router" de la App Web)
=================================================================
*/
function doGet(e) {
  // Revisamos si el usuario tiene una "sesión" activa
  const userSession = PropertiesService.getUserProperties().getProperty('userSession');
  
  if (userSession) {
    // Si hay sesión, mostramos la app principal (index.html)
    const sessionData = JSON.parse(userSession);
    let tpl = HtmlService.createTemplateFromFile('index');
    
    // ⭐ CORRECCIÓN CRÍTICA: Agregamos el prefijo "rol-"
    tpl.userRol = 'rol-' + sessionData.rol;
    tpl.userName = sessionData.usuario;
    
    return tpl.evaluate()
      .setTitle('Gestión de Pacientes - Casos Complejos')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
  } else {
    // Si NO hay sesión, mostramos la página de login
    return HtmlService.createTemplateFromFile('login')
        .evaluate()
        .setTitle('Iniciar Sesión - Casos Complejos')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}


/*
=================================================================
FUNCIÓN DE AYUDA - include(filename)
=================================================================
*/
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


/*
=================================================================
FUNCIONES DE AUTENTICACIÓN
=================================================================
*/

/**
 * Inicia sesión del usuario
 */
function iniciarSesion(formData) {
  const ss = SpreadsheetApp.openByUrl(SS_URL);
  const ws = ss.getSheetByName(SHEET_USUARIOS);
  
  const data = ws.getRange(2, 1, ws.getLastRow() - 1, 3).getValues();
  
  const usuario = formData.usuario.trim().toLowerCase();
  const contrasena = formData.contrasena;
  
  let usuarioEncontrado = null;
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0].toLowerCase() === usuario) {
      if (data[i][1] == contrasena) {
        usuarioEncontrado = {
          usuario: data[i][0],
          rol: data[i][2].toString().toLowerCase().trim() // ⭐ IMPORTANTE: normalizar el rol
        };
        break;
      } else {
        throw new Error('Contraseña incorrecta.');
      }
    }
  }
  
  if (usuarioEncontrado) {
    // ⭐ Guardamos SOLO el rol sin el prefijo "rol-"
    // El prefijo se agrega en doGet()
    const sessionData = JSON.stringify(usuarioEncontrado);
    PropertiesService.getUserProperties().setProperty('userSession', sessionData);
    
    return ScriptApp.getService().getUrl();
  } else {
    throw new Error('Usuario no encontrado.');
  }
}

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
  PropertiesService.getUserProperties().deleteProperty('userSession');
  return ScriptApp.getService().getUrl();
}

/**
 * Obtiene los datos de la sesión actual
 */
function obtenerDatosSesion() {
   const userSession = PropertiesService.getUserProperties().getProperty('userSession');
   if (userSession) {
     return JSON.parse(userSession);
   } else {
     return null;
   }
}

/*
=================================================================
FUNCIONES DEL BACKEND
=================================================================
*/

/**
 * FUNCIÓN DE AYUDA: Normalizar Prestador
 */
function normalizarPrestador(prestadorInput, dict) {
  if (!prestadorInput) return "";
  const inputUpper = prestadorInput.trim().toUpperCase();
  for (const clave in dict) {
    const variantes = dict[clave].variantes;
    for (const variante of variantes) {
      if (variante.toUpperCase() === inputUpper) {
        return clave;
      }
    }
  }
  return prestadorInput.trim();
}

/**
 * FUNCIÓN DE AYUDA: Calcular Edad
 */
function calcularEdad(fechaNacimientoStr) {
  try {
    if (!fechaNacimientoStr) return '';
    
    let fechaNac;
    const fechaString = fechaNacimientoStr.toString();
    
    // Si es un objeto Date
    if (fechaNacimientoStr instanceof Date) {
      fechaNac = fechaNacimientoStr;
    }
    // Si es string con formato DD/MM/YYYY
    else if (fechaString.includes('/')) {
      const partes = fechaString.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const anio = parseInt(partes[2], 10);
        fechaNac = new Date(anio, mes, dia);
      }
    }
    // Si es string con formato YYYY-MM-DD
    else if (fechaString.includes('-')) {
      fechaNac = new Date(fechaString);
    }
    
    if (!fechaNac || isNaN(fechaNac.getTime())) {
      return '';
    }
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 0 ? edad : '';
  } catch (e) {
    Logger.log('Error al calcular edad: ' + e + ' | Fecha recibida: ' + fechaNacimientoStr);
    return '';
  }
}

/**
 * FUNCIÓN DE AYUDA: Formatear fecha para la hoja
 */
function formatearFecha(fechaStr) {
  try {
    if (!fechaStr) return '';
    
    // Si es un objeto Date de Google Sheets
    if (fechaStr instanceof Date) {
      const dia = fechaStr.getDate().toString().padStart(2, '0');
      const mes = (fechaStr.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaStr.getFullYear();
      return `${dia}/${mes}/${anio}`;
    }
    
    // Si es string con formato YYYY-MM-DD
    const fechaString = fechaStr.toString();
    if (fechaString.includes('-')) {
      const partes = fechaString.split('-');
      if (partes.length === 3) {
        const y = partes[0];
        const m = partes[1];
        const d = partes[2];
        return `${d}/${m}/${y}`;
      }
    }
    
    // Si ya está en formato DD/MM/YYYY
    if (fechaString.includes('/')) {
      return fechaString;
    }
    
    return fechaString;
  } catch (e) {
    Logger.log('Error al formatear fecha: ' + e + ' | Fecha recibida: ' + fechaStr);
    return fechaStr ? fechaStr.toString() : '';
  }
}


/**
 * BUSCAR PACIENTE: Busca un DNI o Nombre exacto y devuelve el objeto del paciente
 */
function buscarPacientePorDNI(query) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_URL);
    const wsPacientes = ss.getSheetByName(SHEET_PACIENTES);
    const wsPrestaciones = ss.getSheetByName(SHEET_PRESTACIONES);
    
    // Verificar que query no esté vacío
    if (!query || query.toString().trim() === '') {
      throw new Error("Consulta de búsqueda vacía.");
    }
    
    const pacientesData = wsPacientes.getRange(2, 1, Math.max(1, wsPacientes.getLastRow() - 1), wsPacientes.getLastColumn()).getValues();
    const prestacionesData = wsPrestaciones.getRange(2, 1, Math.max(1, wsPrestaciones.getLastRow() - 1), wsPrestaciones.getLastColumn()).getValues();

    let pacienteEncontrado = null;
    let filaPaciente = -1;
    
    for (let i = 0; i < pacientesData.length; i++) {
      const dniPaciente = pacientesData[i][0] ? pacientesData[i][0].toString().trim() : '';
      const nombrePaciente = pacientesData[i][1] ? pacientesData[i][1].toString().trim() : '';
      
      // Búsqueda flexible - comparar como strings y considerar espacios
      if (dniPaciente == query.toString().trim() || 
          (nombrePaciente && nombrePaciente.toLowerCase() === query.toString().trim().toLowerCase())) {
        filaPaciente = i;
        
        // Estructura NUEVA de columnas (sin edad, con Carpeta_Drive_ID)
        pacienteEncontrado = {
          dni: pacientesData[i][0] || '',
          nombre: pacientesData[i][1] || '',
          sexo: pacientesData[i][2] || '',
          fecha_nacimiento: pacientesData[i][3] ? formatearFecha(pacientesData[i][3].toString()) : '',
          edad: pacientesData[i][3] ? calcularEdad(formatearFecha(pacientesData[i][3].toString())) : '',
          condicion: pacientesData[i][4] || '',
          telefono: pacientesData[i][5] || '',
          direccion: pacientesData[i][6] || '',
          localidad: pacientesData[i][7] || '',
          tipo_afiliado: pacientesData[i][8] || '',
          vinculo_titular: pacientesData[i][9] || '',
          titular_nombre: pacientesData[i][10] || '',
          titular_dni: pacientesData[i][11] || '',
          observaciones: pacientesData[i][12] || '',
          carpeta_drive_id: pacientesData[i][13] || ''
        };
        break;
      }
    }

    if (pacienteEncontrado) {
      const prestacionesDelPaciente = [];
      
      // Estructura NUEVA de Prestaciones: [0]=id, [1]=dni, [2]=nombre, [3]=fecha, [4]=prestador, [5]=prestacion, [6]=timestamp
      for (let i = 0; i < prestacionesData.length; i++) {
        const prestDni = prestacionesData[i][1] ? prestacionesData[i][1].toString().trim() : '';
        if (prestDni == pacienteEncontrado.dni.toString().trim()) {
          prestacionesDelPaciente.push({
            id: prestacionesData[i][0] || '',
            fecha: prestacionesData[i][3] || '',
            prestador: prestacionesData[i][4] || '',
            prestacion: prestacionesData[i][5] || ''
          });
        }
      }
      pacienteEncontrado.prestaciones = prestacionesDelPaciente;
      return pacienteEncontrado;
      
    } else {
      throw new Error("Paciente no encontrado.");
    }

  } catch (error) {
    Logger.log("Error en buscarPacientePorDNI: " + error.message + " | Query: " + query);
    throw new Error("Error al buscar paciente: " + error.message);
  }
}


/**
 * BUSCAR FRAGMENTO: Busca por DNI parcial o Apellido parcial
 */
function buscarPacientesPorFragmento(queryFragmento) {
   try {
    if (!queryFragmento || queryFragmento.trim().length < 3) {
      return [];
    }
    
    const ss = SpreadsheetApp.openByUrl(SS_URL);
    const wsPacientes = ss.getSheetByName(SHEET_PACIENTES);
    const lastRow = wsPacientes.getLastRow();
    
    if (lastRow < 2) {
      return [];
    }
    
    const pacientesData = wsPacientes.getRange(2, 1, lastRow - 1, 2).getValues();

    const resultados = [];
    const queryLower = queryFragmento.trim().toLowerCase();

    for (let i = 0; i < pacientesData.length; i++) {
      // Verificar que la fila tenga datos
      if (!pacientesData[i][0] && !pacientesData[i][1]) continue;
      
      const dni = pacientesData[i][0] ? pacientesData[i][0].toString().trim() : '';
      const nombreOriginal = pacientesData[i][1] ? pacientesData[i][1].toString().trim() : '';
      const nombre = nombreOriginal.toLowerCase();

      // Buscar en DNI o nombre
      if ((dni && dni.includes(queryFragmento.trim())) || (nombre && nombre.includes(queryLower))) {
        resultados.push({
          dni: dni,
          nombre: nombreOriginal || '(Sin nombre)'
        });
      }
      
      if (resultados.length >= 10) {
        break;
      }
    }
    return resultados;

  } catch (error) {
    Logger.log("Error en buscarPacientesPorFragmento: " + error.message + " | Query: " + queryFragmento);
    // No lanzar error, devolver array vacío
    return [];
  }
}


/**
 * CARGAR NUEVO PACIENTE (desde la App Web)
 */
function guardarNuevoPaciente_web(formData) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_URL);
    const wsPacientes = ss.getSheetByName(SHEET_PACIENTES);

    // Validar DNI
    if (!formData.dni || formData.dni.toString().trim() === '') {
      throw new Error('El DNI es obligatorio');
    }

    const dniNormalizado = formData.dni.toString().trim();
    
    // Verificar si el DNI ya existe
    const lastRow = wsPacientes.getLastRow();
    if (lastRow > 1) {
      const dnis = wsPacientes.getRange(2, 1, lastRow - 1, 1).getValues();
      const dniExiste = dnis.some(fila => fila[0] && fila[0].toString().trim() == dniNormalizado);
      if (dniExiste) {
        throw new Error(`El DNI ${dniNormalizado} ya existe en la base de datos.`);
      }
    }

    // Crear carpeta de Drive para archivos del paciente
    let carpetaDriveId = '';
    try {
      const appFolder = DriveApp.getFoldersByName(APP_FOLDER_NAME).hasNext() 
        ? DriveApp.getFoldersByName(APP_FOLDER_NAME).next() 
        : DriveApp.createFolder(APP_FOLDER_NAME);
      
      const adjuntosRootFolder = appFolder.getFoldersByName(ADJUNTOS_FOLDER_NAME).hasNext()
        ? appFolder.getFoldersByName(ADJUNTOS_FOLDER_NAME).next()
        : appFolder.createFolder(ADJUNTOS_FOLDER_NAME);
      
      let dniFolder;
      const existingFolders = adjuntosRootFolder.getFoldersByName(dniNormalizado);
      if (existingFolders.hasNext()) {
        dniFolder = existingFolders.next();
      } else {
        dniFolder = adjuntosRootFolder.createFolder(dniNormalizado);
      }
      carpetaDriveId = dniFolder.getId();
    } catch (driveError) {
      Logger.log('Error creando carpeta Drive: ' + driveError.message);
      // Continuar sin carpeta si hay error
    }

    const timestamp = new Date();
    
    // ESTRUCTURA NUEVA: [0]dni, [1]nombre, [2]sexo, [3]fecha_nac, [4]condicion, [5]telefono, 
    // [6]direccion, [7]localidad, [8]tipo_afiliado, [9]vinculo_titular, [10]titular_nombre, 
    // [11]titular_dni, [12]observaciones, [13]Carpeta_Drive_ID, [14]Timestamp_Creacion
    const nuevaFila = [
      dniNormalizado,
      formData.nombre || '',
      formData.sexo || '',
      formatearFecha(formData.fecha_nacimiento) || '',
      formData.condicion || '',
      formData.telefono || '',
      formData.direccion || '',
      formData.localidad || '',
      formData.tipo_afiliado || '',
      formData.vinculo_titular || '',
      formData.titular_nombre || '',
      formData.titular_dni || '',
      formData.observaciones || '',
      carpetaDriveId,
      timestamp
    ];

    wsPacientes.appendRow(nuevaFila);

    return { message: "Paciente guardado con éxito. DNI: " + dniNormalizado, dni: dniNormalizado };

  } catch (error) {
    Logger.log("Error en guardarNuevoPaciente_web: " + error.message);
    throw new Error("Error al guardar el paciente: " + error.message);
  }
}


/**
 * ELIMINAR PACIENTE
 */
function eliminarPaciente(dni) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_URL);
    const wsPacientes = ss.getSheetByName(SHEET_PACIENTES);
    const wsPrestaciones = ss.getSheetByName(SHEET_PRESTACIONES);
    
    // Buscar y eliminar paciente
    const pacientesData = wsPacientes.getRange(2, 1, wsPacientes.getLastRow() - 1, 1).getValues();
    let filaAEliminar = -1;
    
    for (let i = 0; i < pacientesData.length; i++) {
      if (pacientesData[i][0] == dni) {
        filaAEliminar = i + 2; // +2 porque empezamos en fila 2 y el índice es 0-based
        break;
      }
    }
    
    if (filaAEliminar === -1) {
      throw new Error('Paciente no encontrado');
    }
    
    // Eliminar todas las prestaciones del paciente
    const prestacionesData = wsPrestaciones.getRange(2, 1, wsPrestaciones.getLastRow() - 1, 2).getValues();
    const filasAEliminarPrestaciones = [];
    
    for (let i = prestacionesData.length - 1; i >= 0; i--) {
      if (prestacionesData[i][1] == dni) {
        filasAEliminarPrestaciones.push(i + 2);
      }
    }
    
    // Eliminar prestaciones (de atrás hacia adelante para no alterar índices)
    filasAEliminarPrestaciones.forEach(fila => {
      wsPrestaciones.deleteRow(fila);
    });
    
    // Eliminar paciente
    wsPacientes.deleteRow(filaAEliminar);
    
    return { message: 'Paciente eliminado correctamente junto con ' + filasAEliminarPrestaciones.length + ' prestaciones.' };
    
  } catch (error) {
    Logger.log('Error en eliminarPaciente: ' + error.message);
    throw new Error('Error al eliminar paciente: ' + error.message);
  }
}

/**
 * ELIMINAR PRESTACIÓN
 */
function eliminarPrestacion(prestacionId) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_URL);
    const wsPrestaciones = ss.getSheetByName(SHEET_PRESTACIONES);
    
    const prestacionesData = wsPrestaciones.getRange(2, 1, wsPrestaciones.getLastRow() - 1, 1).getValues();
    let filaAEliminar = -1;
    
    for (let i = 0; i < prestacionesData.length; i++) {
      if (prestacionesData[i][0] == prestacionId) {
        filaAEliminar = i + 2;
        break;
      }
    }
    
    if (filaAEliminar === -1) {
      throw new Error('Prestación no encontrada');
    }
    
    wsPrestaciones.deleteRow(filaAEliminar);
    
    return { message: 'Prestación eliminada correctamente.' };
    
  } catch (error) {
    Logger.log('Error en eliminarPrestacion: ' + error.message);
    throw new Error('Error al eliminar prestación: ' + error.message);
  }
}

/**
 * CARGAR NUEVA PRESTACIÓN (desde la App Web)
 */
function guardarNuevaPrestacion_web(formData) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_URL);
    const wsPrestaciones = ss.getSheetByName(SHEET_PRESTACIONES);
    const wsPacientes = ss.getSheetByName(SHEET_PACIENTES);

    // Verificar que el paciente existe
    const pacientesData = wsPacientes.getRange(2, 1, wsPacientes.getLastRow() - 1, 2).getValues();
    let pacienteNombre = '';
    let dniExiste = false;
    
    for (let i = 0; i < pacientesData.length; i++) {
      if (pacientesData[i][0] == formData.paciente_dni) {
        dniExiste = true;
        pacienteNombre = pacientesData[i][1];
        break;
      }
    }
    
    if (!dniExiste) {
      throw new Error(`El DNI ${formData.paciente_dni} no existe. No se puede cargar la prestación.`);
    }

    const prestadorNormalizado = normalizarPrestador(formData.prestador, EFECTORES_DICT);
    const timestamp = new Date();
    const fechaPrestacion = formatearFecha(formData.fecha);
    
    // ESTRUCTURA NUEVA: [0]prestacion_id, [1]paciente_dni, [2]paciente_nombre, 
    // [3]fecha_prestacion, [4]prestador, [5]prestacion, [6]Timestamp_Carga
    if (Array.isArray(formData.prestaciones)) {
      formData.prestaciones.forEach((prestacion, index) => {
        if (prestacion.trim() !== "") {
          const prestacionID = timestamp.getTime() + '-' + formData.paciente_dni + '-' + index;
          const nuevaFila = [
            prestacionID,
            formData.paciente_dni,
            pacienteNombre,
            fechaPrestacion,
            prestadorNormalizado,
            prestacion.trim(),
            timestamp
          ];
          wsPrestaciones.appendRow(nuevaFila);
        }
      });
    }

    return { message: "Prestaciones guardadas correctamente." };

  } catch (error) {
    Logger.log("Error en guardarNuevaPrestacion_web: " + error.message);
    throw new Error("Error al guardar las prestaciones: " + error.message);
  }
}
