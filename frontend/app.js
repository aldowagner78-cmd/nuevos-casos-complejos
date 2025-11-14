// --- MODAL EDITAR PACIENTE: NUEVA LÓGICA FECHA Y CIERRE ---
async function abrirModalEditar(dni) {
    const container = document.getElementById('form-editar-paciente-container');
    // --- Inyección de Formulario ---
    let form = document.getElementById('form-editar-paciente');
    if (!form || form.dataset.dni !== dni) {
        container.innerHTML = `
            <form id="form-editar-paciente" data-dni="${dni}">
                <input type="hidden" id="edit-dni" name="dni">
                <div class="form-group">
                    <label>DNI (No editable)</label>
                    <input type="text" value="${dni}" readonly tabindex="-1" class="input-dni-no-select tema-bg" style="user-select:none; pointer-events:none;">
                </div>
                <div class="form-group">
                    <label for="edit-nombre">Apellido y Nombre</label>
                    <input type="text" id="edit-nombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="edit-sexo">Sexo</label>
                    <select id="edit-sexo" name="sexo" required>
                        <option value="" selected disabled hidden>Seleccione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro / No declarar</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <div class="date-dropdowns" id="edit-fecha-nacimiento-dropdowns">
                        <select id="edit_fecha_nac_dia" name="fecha_dia" class="date-select-day"></select>
                        <select id="edit_fecha_nac_mes" name="fecha_mes" class="date-select-month"></select>
                        <select id="edit_fecha_nac_anio" name="fecha_anio" class="date-select-year"></select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="edit-condicion">Condición</label>
                    <select id="edit-condicion" name="condicion">
                        <option value="RESIDENTE">RESIDENTE</option>
                        <option value="DERIVADO">DERIVADO</option>
                        <option value="TRANSITO">TRANSITO</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-telefono">Teléfono</label>
                    <input type="text" id="edit-telefono" name="telefono">
                </div>
                <div class="form-group">
                    <label for="edit-direccion">Dirección</label>
                    <input type="text" id="edit-direccion" name="direccion">
                </div>
                <div class="form-group">
                    <label for="edit-localidad">Localidad</label>
                    <input type="text" id="edit-localidad" name="localidad">
                </div>
                <div class="form-group">
                    <label for="edit-tipo-afiliado">Tipo de Afiliado</label>
                    <select id="edit-tipo-afiliado" name="tipo_afiliado">
                        <option value="Titular">Titular</option>
                        <option value="Adherente">Adherente</option>
                    </select>
                </div>
                <div class="form-group" id="grupo-parentesco-editar">
                    <label for="edit-vinculo-titular">Parentesco</label>
                    <select id="edit-vinculo-titular" name="vinculo_titular"></select>
                    <input type="text" id="edit-vinculo-otro" name="vinculo_titular_otro" placeholder="Especificar parentesco" style="display:none; margin-top:8px;" />
                </div>
                <div class="form-group" id="grupo-titular-nombre-editar">
                    <label for="edit-titular-nombre">Nombre y Apellido Titular</label>
                    <input type="text" id="edit-titular-nombre" name="titular_nombre">
                </div>
                <div class="form-group" id="grupo-titular-dni-editar">
                    <label for="edit-titular-dni">DNI Titular</label>
                    <input type="text" id="edit-titular-dni" name="titular_dni">
                </div>
                <div class="form-group">
                    <label for="edit-observaciones">Observaciones</label>
                    <textarea id="edit-observaciones" name="observaciones" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Archivos adjuntos</label>
                    <div id="campos-archivos-adjuntos-editar"></div>
                </div>
                <button type="submit" id="btn-guardar-cambios-paciente">Guardar Cambios</button>
                <div id="alerta-paciente-editar" class="alerta" style="display: none;"></div>
            </form>
        `;
        form = document.getElementById('form-editar-paciente');
        form.addEventListener('submit', submitEditarPacienteForm);
    }
    // --- FIN: Inyección de Formulario ---
    try {
        const response = await fetch(`/api/buscar-paciente?query=${encodeURIComponent(dni)}`);
        if (!response.ok) throw new Error('No se pudo cargar el paciente');
        const paciente = await response.json();
        // Rellenar el formulario
        form.querySelector('#edit-dni').value = paciente.dni;
        form.querySelector('#edit-nombre').value = paciente.nombre;
        form.querySelector('#edit-condicion').value = paciente.condicion;
        form.querySelector('#edit-telefono').value = paciente.telefono;
        form.querySelector('#edit-direccion').value = paciente.direccion;
        form.querySelector('#edit-localidad').value = paciente.localidad;
        form.querySelector('#edit-tipo-afiliado').value = paciente.tipo_afiliado;
        form.querySelector('#edit-sexo').value = paciente.sexo || '';
        poblarParentescos('edit-vinculo-titular', 'edit-vinculo-otro', paciente.vinculo_titular);
        form.querySelector('#edit-titular-dni').value = paciente.titular_dni;
        form.querySelector('#edit-titular-nombre').value = paciente.titular_nombre;
        form.querySelector('#edit-observaciones').value = paciente.observaciones;
        toggleCamposTitular(paciente.tipo_afiliado, 'editar');
        // --- Poblar Fecha (Desplegables) ---
        populateDateSelects('edit_fecha_nac_dia', 'edit_fecha_nac_mes', 'edit_fecha_nac_anio');
        if (paciente.fecha_nacimiento && paciente.fecha_nacimiento.includes('-')) {
            const [anio, mes, dia] = paciente.fecha_nacimiento.split('-');
            form.querySelector('#edit_fecha_nac_dia').value = dia;
            form.querySelector('#edit_fecha_nac_mes').value = mes;
            form.querySelector('#edit_fecha_nac_anio').value = anio;
            form.querySelector('#edit_fecha_nac_mes').dispatchEvent(new Event('change'));
        }
        // Inicializar el contenedor de archivos (llamando a la función de archivosPaciente.js)
        if (window._inicializarArchivosEdicion) {
            window._inicializarArchivosEdicion(dni);
        }
    } catch (error) {
        mostrarModalAviso({
            titulo: 'Error',
            mensaje: `Error al cargar datos: ${error.message}`
        });
    }
}

async function submitEditarPacienteForm(event) {
    event.preventDefault();
    // --- INICIO: Spinner en Botón ---
    const btn = event.submitter;
    if (!btn) return;
    const originalBtnHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = spinnerHTML;
    // --- FIN: Spinner en Botón ---
    const form = event.target;
    const dni = form.querySelector('#edit-dni').value;
    const formData = new FormData(form);
    // --- Validación completa y ordenada de todos los campos del formulario de edición ---
    const faltantes = [];
    // 1. DNI (no editable, pero debe estar)
    const dniEdit = form.querySelector('#edit-dni');
    if (!dniEdit || !dniEdit.value.trim()) faltantes.push('DNI');
    // 2. Apellido y Nombre
    const nombre = form.querySelector('#edit-nombre');
    if (!nombre || !nombre.value.trim()) faltantes.push('Apellido y Nombre');
    // 3. Sexo
    const sexo = form.querySelector('#edit-sexo');
    if (!sexo || !sexo.value) faltantes.push('Sexo');
    // 4. Fecha de Nacimiento (agrupada)
    const diaEl = form.querySelector('#edit_fecha_nac_dia');
    const mesEl = form.querySelector('#edit_fecha_nac_mes');
    const anioEl = form.querySelector('#edit_fecha_nac_anio');
    const dia = diaEl ? diaEl.value.trim() : '';
    const mes = mesEl ? mesEl.value.trim() : '';
    const anio = anioEl ? anioEl.value.trim() : '';
    if (!dia || !mes || !anio) faltantes.push('Fecha de Nacimiento');
    // 5. Condición
    const condicion = form.querySelector('#edit-condicion');
    if (!condicion || !condicion.value) faltantes.push('Condición');
    // 6. Teléfono
    const telefono = form.querySelector('#edit-telefono');
    if (!telefono || !telefono.value.trim()) faltantes.push('Teléfono');
    // 7. Dirección
    const direccion = form.querySelector('#edit-direccion');
    if (!direccion || !direccion.value.trim()) faltantes.push('Dirección');
    // 8. Localidad
    const localidad = form.querySelector('#edit-localidad');
    // No validar ni mostrar modal para este campo
    // 9. Tipo de Afiliado
    const tipoAfiliado = form.querySelector('#edit-tipo-afiliado');
    if (!tipoAfiliado || !tipoAfiliado.value) faltantes.push('Tipo de Afiliado');
    // Si es Adherente, validar campos de titular y parentesco
    if (tipoAfiliado && tipoAfiliado.value === 'Adherente') {
        // Parentesco
        const vinculo = form.querySelector('#edit-vinculo-titular');
        if (!vinculo || !vinculo.value) faltantes.push('Parentesco');
        if (vinculo && vinculo.value === 'Otro') {
            const vinculoOtro = form.querySelector('#edit-vinculo-otro');
            if (!vinculoOtro || !vinculoOtro.value.trim()) faltantes.push('Parentesco (especificar)');
        }
        // Nombre y Apellido Titular
        const titularNombre = form.querySelector('#edit-titular-nombre');
        if (!titularNombre || !titularNombre.value.trim()) faltantes.push('Nombre y Apellido Titular');
        // DNI Titular
        const titularDni = form.querySelector('#edit-titular-dni');
        if (!titularDni || !titularDni.value.trim()) faltantes.push('DNI Titular');
    }
    // Observaciones y archivos adjuntos NO obligatorios

    // --- Lógica de Fecha (Desplegables) ---
    const fechaFormateada = getFormattedDate('edit_fecha_nac_dia', 'edit_fecha_nac_mes', 'edit_fecha_nac_anio');
    if (fechaFormateada) {
        formData.set('fecha_nacimiento', fechaFormateada);
    }
    formData.delete('fecha_dia');
    formData.delete('fecha_mes');
    formData.delete('fecha_anio');
    // --- FIN: Lógica de Fecha ---
    // Añadir archivos nuevos
    const archivos = window.obtenerArchivosAdjuntos('campos-archivos-adjuntos-editar');
    archivos.forEach(archivo => {
        formData.append('archivos', archivo);
    });

    // No mostrar ningún modal ni advertencia por campos incompletos, guardar siempre
    await enviarEdicionPaciente(formData, dni, btn, originalBtnHTML);
}

async function enviarEdicionPaciente(formData, dni, btn, originalBtnHTML) {
    try {
        const response = await fetch(`/api/editar-paciente/${dni}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar paciente');
        }
        mostrarModalAviso({
            titulo: 'Paciente Actualizado',
            mensaje: data.message
        });
        // Limpiar el formulario del contenedor
        const container = document.getElementById('form-editar-paciente-container');
        if (container) container.innerHTML = '';
        // Refrescar la búsqueda del paciente
        const searchQuery = document.getElementById('search-query');
        if (searchQuery) {
            searchQuery.value = dni;
            await buscarPaciente();
        }
    } catch (error) {
        mostrarModalAviso({
            titulo: 'Error',
            mensaje: error.message
        });
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
    }
}

/**
 * Llena los desplegables de Día, Mes y Año.
 */
function enableManualNumericSelect(select, { min, max, padLength, resetDelay = 800 }) {
    if (!select || select.dataset.manualNumeric === 'true') return;

    select.addEventListener('input', (event) => {
        const value = event.target.value;
        // Permitir solo números
        if (!/^[0-9]+$/.test(value)) return;
        let numeric = parseInt(value, 10);
        if (!Number.isNaN(numeric) && numeric >= min && numeric <= max) {
            // Buscar la opción y seleccionarla si existe
            const formatted = String(numeric).padStart(padLength, '0');
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === formatted) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }
    });
    select.dataset.manualNumeric = 'true';
}

function populateDateSelects(dayId, monthId, yearId) {
    const dayEl = document.getElementById(dayId);
    const monthEl = document.getElementById(monthId);
    const yearEl = document.getElementById(yearId);

    if (!dayEl || !monthEl || !yearEl) {
        console.warn("Faltan elementos de fecha:", dayId, monthId, yearId);
        return;
    }

    // Si son selects, poblar opciones. Si son inputs, no hacer nada.
    if (dayEl.tagName === 'SELECT') {
        dayEl.innerHTML = '';
        const placeholderDay = document.createElement('option');
        placeholderDay.value = '';
        placeholderDay.disabled = true;
        placeholderDay.selected = true;
        placeholderDay.textContent = 'Día';
        dayEl.appendChild(placeholderDay);
        for (let i = 1; i <= 31; i++) {
            const val = String(i).padStart(2, '0');
            dayEl.add(new Option(val, val));
        }
    }
    if (monthEl.tagName === 'SELECT') {
        monthEl.innerHTML = '';
        const placeholderMonth = document.createElement('option');
        placeholderMonth.value = '';
        placeholderMonth.disabled = true;
        placeholderMonth.selected = true;
        placeholderMonth.textContent = 'Mes';
        monthEl.appendChild(placeholderMonth);
        for (let i = 1; i <= 12; i++) {
            const val = String(i).padStart(2, '0');
            monthEl.add(new Option(val, val));
        }
    }
    if (yearEl.tagName === 'SELECT') {
        yearEl.innerHTML = '';
        const placeholderYear = document.createElement('option');
        placeholderYear.value = '';
        placeholderYear.disabled = true;
        placeholderYear.selected = true;
        placeholderYear.textContent = 'Año';
        yearEl.appendChild(placeholderYear);
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1920; i--) {
            yearEl.add(new Option(i, i));
        }
    }

    // Si son selects, habilitar lógica de selects. Si son inputs, no hacer nada.
    if (dayEl.tagName === 'SELECT' && monthEl.tagName === 'SELECT' && yearEl.tagName === 'SELECT') {
        enableManualNumericSelect(dayEl, { min: 1, max: 31, padLength: 2 });
        enableManualNumericSelect(monthEl, { min: 1, max: 12, padLength: 2 });
        const currentYear = new Date().getFullYear();
        enableManualNumericSelect(yearEl, { min: 1920, max: currentYear, padLength: 4, resetDelay: 1200 });

        // Función para actualizar los días según mes/año seleccionado (maneja años bisiestos)
        const updateDays = () => {
            const month = parseInt(monthEl.value, 10);
            const year = parseInt(yearEl.value, 10);
            const currentDayVal = dayEl.value;
            dayEl.innerHTML = '';
            const ph = document.createElement('option');
            ph.value = '';
            ph.disabled = true;
            ph.textContent = 'Día';
            dayEl.appendChild(ph);
            let daysInMonth = 31;
            if (month && year) {
                daysInMonth = new Date(year, month, 0).getDate();
            } else if (month) {
                daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
            }
            for (let i = 1; i <= daysInMonth; i++) {
                const val = String(i).padStart(2, '0');
                dayEl.add(new Option(val, val));
            }
            if (currentDayVal && parseInt(currentDayVal, 10) <= daysInMonth) {
                dayEl.value = currentDayVal;
            }
        };
        monthEl.addEventListener('change', updateDays);
        yearEl.addEventListener('change', updateDays);
    }
}

/**
 * Lee 3 desplegables y formatea la fecha como AAAA-MM-DD
 */
function getFormattedDate(dayId, monthId, yearId) {
    const dia = document.getElementById(dayId).value;
    const mes = document.getElementById(monthId).value;
    const anio = document.getElementById(yearId).value;
    
    console.log('DEBUG getFormattedDate:', { dayId, monthId, yearId, dia, mes, anio });
    
    if (dia && mes && anio) {
        return `${anio}-${mes}-${dia}`;
    }
    return null;
}

// (NUEVA UBICACIÓN GLOBAL)
/**
 * Modal de advertencia/confirmación de campos incompletos
 * - En formularios de crear/editar pacientes: dos botones ("Guardar igual" y "Cancelar")
 * - En formulario de cargar prestación: solo botón "Volver"
 * - Adaptado al tema activo
 */
function mostrarModalConfirmacionCampos({titulo, mensaje, onGuardar, onCancelar, soloVolver = false}) {
    const modal = document.getElementById('modal-aviso');
    const tituloModal = document.getElementById('titulo-modal-aviso');
    const textoModal = document.getElementById('texto-modal-aviso');
    const botonesContainer = modal.querySelector('.modal-botones-container');
    
    botonesContainer.innerHTML = '';
    botonesContainer.style.display = 'flex';
    
    tituloModal.textContent = titulo || 'Campos incompletos';
    textoModal.innerHTML = mensaje || '';
    
    if (soloVolver) {
        const btnVolver = document.createElement('button');
        btnVolver.type = 'button';
        btnVolver.className = 'boton-cancelar';
        btnVolver.textContent = 'Volver';
        btnVolver.onclick = () => { modal.style.display = 'none'; if (typeof onCancelar === 'function') onCancelar(); };
        botonesContainer.appendChild(btnVolver);
    } else {
        const btnGuardar = document.createElement('button');
        btnGuardar.type = 'button';
        btnGuardar.className = 'boton-aceptar';
        btnGuardar.textContent = 'Guardar igual';
        btnGuardar.onclick = () => { modal.style.display = 'none'; if (typeof onGuardar === 'function') onGuardar(); };
        const btnCancelar = document.createElement('button');
        btnCancelar.type = 'button';
        btnCancelar.className = 'boton-cancelar';
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.onclick = () => { modal.style.display = 'none'; if (typeof onCancelar === 'function') onCancelar(); };
        botonesContainer.appendChild(btnGuardar);
        botonesContainer.appendChild(btnCancelar);
    }
    modal.style.display = 'flex';
}
// --- Funciones del Loader de Sesión ---
function mostrarApp() {
    const app = document.getElementById('app-container');
    if (app) {
        app.classList.add('loaded');
    }
}
// --- Combo custom para prestador ---

const spinnerHTML = '<span class="btn-spinner"></span>';

// Variable global para datos externos
let LISTA_EFECTORES = [];
let EFECTORES_DICT = {};
let LISTA_LOCALIDADES = [];

/**
 * Carga datos JSON auxiliares (Efectores, Localidades, etc.) al iniciar la app.
 */
async function cargarDatosAuxiliares() {
    try {
        // Efectores (nuevo formato)
        const responseEfectores = await fetch('data/efectores_dict_normalizado_compacto.json?v=' + Date.now());
        if (!responseEfectores.ok) throw new Error('No se pudo cargar efectores_dict_normalizado_compacto.json');
        EFECTORES_DICT = await responseEfectores.json();
        // Solo los nombres estándar para el combo
        LISTA_EFECTORES = Object.keys(EFECTORES_DICT);
        console.log('Efectores cargados:', LISTA_EFECTORES.length);
    } catch (error) {
        console.error(error);
        LISTA_EFECTORES = ["HIBA", "GÜEMES", "FAVALORO", "AUSTRAL", "FLENI", "GARRAHAN", "ZAMBRANO", "SUIZO ARGENTINO"];
        EFECTORES_DICT = {};
    }
    try {
        // Localidades
        const responseLocalidades = await fetch('data/localidades_santa_fe.json?v=' + Date.now());
        if (!responseLocalidades.ok) throw new Error('No se pudo cargar localidades_santa_fe.json');
        LISTA_LOCALIDADES = await responseLocalidades.json();
        console.log('Localidades cargadas:', LISTA_LOCALIDADES.length);
        poblarDatalistLocalidades();
    } catch (error) {
        console.error(error);
        LISTA_LOCALIDADES = [];
    }
}

/**
 * Pobla el datalist de localidades para autocompletar
 */
function poblarDatalistLocalidades(filtro = "") {
    const datalist = document.getElementById('localidades-list');
    if (!datalist) return;
    let opciones = LISTA_LOCALIDADES;
    if (filtro) {
        const normalizado = filtro.trim().toUpperCase();
        opciones = opciones.filter(loc => loc.toUpperCase().startsWith(normalizado));
    }
    datalist.innerHTML = opciones.map(loc => `<option value="${loc}"></option>`).join('');
}

// Vincular el input de localidad (nuevo y edición) para filtrar el datalist
document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos de Búsqueda Avanzada ---
    const panelBusquedaAvanzada = document.getElementById('panel-busqueda-avanzada');
    const formBusquedaAvanzada = document.getElementById('form-busqueda-avanzada');
    const panelBusquedaPrincipal = document.getElementById('panel-busqueda');
    // Modal de campos incompletos: muestra ambos botones para paciente, solo 'Volver' para prestación
    function mostrarModalConfirmacionCampos({titulo, mensaje, onGuardar, onCancelar, soloVolver = false}) {
        const modal = document.getElementById('modal-aviso');
        const tituloModal = document.getElementById('titulo-modal-aviso');
        const textoModal = document.getElementById('texto-modal-aviso');
        const botonesContainer = modal.querySelector('.modal-botones-container');
        botonesContainer.innerHTML = '';
        tituloModal.textContent = titulo || 'Campos incompletos';
        textoModal.innerHTML = mensaje || '';
        if (soloVolver) {
            const btnVolver = document.createElement('button');
            btnVolver.type = 'button';
            btnVolver.className = 'boton-cancelar';
            btnVolver.textContent = 'Volver';
            btnVolver.onclick = () => { modal.style.display = 'none'; if (typeof onCancelar === 'function') onCancelar(); };
            botonesContainer.appendChild(btnVolver);
        } else {
            const btnGuardar = document.createElement('button');
            btnGuardar.type = 'button';
            btnGuardar.className = 'boton-aceptar';
            btnGuardar.textContent = 'Guardar igual';
            btnGuardar.onclick = () => { modal.style.display = 'none'; if (typeof onGuardar === 'function') onGuardar(); };
            const btnCancelar = document.createElement('button');
            btnCancelar.type = 'button';
            btnCancelar.className = 'boton-cancelar';
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.onclick = () => { modal.style.display = 'none'; if (typeof onCancelar === 'function') onCancelar(); };
            botonesContainer.appendChild(btnGuardar);
            botonesContainer.appendChild(btnCancelar);
        }
        modal.style.display = 'flex';
    }
    // Saltar al siguiente campo con Enter y solo permitir guardar con clic
    const formNuevoPaciente = document.getElementById('form-nuevo-paciente');
    if (formNuevoPaciente) {
        const campos = Array.from(formNuevoPaciente.querySelectorAll('input, select, textarea'));
        formNuevoPaciente.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const active = document.activeElement;
                const btnGuardar = document.getElementById('btn-guardar-paciente');
                if (active === btnGuardar) return;
                e.preventDefault();
                // Buscar el siguiente campo visible y habilitado
                let idx = campos.indexOf(active);
                for (let i = idx + 1; i < campos.length; i++) {
                    if (!campos[i].disabled && campos[i].offsetParent !== null) {
                        campos[i].focus();
                        return;
                    }
                }
            }
        });
    }
    const inputNuevo = document.getElementById('new-localidad');
    if (inputNuevo) {
        inputNuevo.setAttribute('autocomplete', 'off');
        inputNuevo.addEventListener('input', function() {
            const val = this.value.trim().toUpperCase();
            if (LISTA_LOCALIDADES.some(loc => loc.toUpperCase() === val)) {
                // Si el valor es una localidad exacta, limpiar datalist
                const datalist = document.getElementById('localidades-list');
                if (datalist) datalist.innerHTML = '';
                return;
            }
            poblarDatalistLocalidades(this.value);
        });
        inputNuevo.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const filtro = this.value.trim().toUpperCase();
                const opciones = LISTA_LOCALIDADES.filter(loc => loc.toUpperCase().startsWith(filtro));
                if (opciones.length === 1 && this.value.toUpperCase() !== opciones[0].toUpperCase()) {
                    e.preventDefault();
                    this.value = opciones[0];
                    this.dispatchEvent(new Event('input'));
                    // Ocultar sugerencias
                    const datalist = document.getElementById('localidades-list');
                    if (datalist) datalist.innerHTML = '';
                } else if (opciones.length > 1) {
                    e.preventDefault();
                }
            }
        });
        // Ocultar sugerencias al seleccionar con clic o al cambiar el valor
        inputNuevo.addEventListener('change', function(e) {
            const datalist = document.getElementById('localidades-list');
            if (datalist) datalist.innerHTML = '';
        });
        // Ocultar sugerencias al salir del campo
        inputNuevo.addEventListener('blur', function(e) {
            const datalist = document.getElementById('localidades-list');
            if (datalist) datalist.innerHTML = '';
        });
    }
    // Para edición, el input se genera dinámicamente, así que usar delegación
    document.body.addEventListener('input', function(e) {
        if (e.target && e.target.id === 'edit-localidad') {
            e.target.setAttribute('autocomplete', 'off');
            const val = e.target.value.trim().toUpperCase();
            if (LISTA_LOCALIDADES.some(loc => loc.toUpperCase() === val)) {
                const datalist = document.getElementById('localidades-list');
                if (datalist) datalist.innerHTML = '';
                return;
            }
            poblarDatalistLocalidades(e.target.value);
        }
    });
    document.body.addEventListener('keydown', function(e) {
        if (e.target && e.target.id === 'edit-localidad' && e.key === 'Enter') {
            const filtro = e.target.value.trim().toUpperCase();
            const opciones = LISTA_LOCALIDADES.filter(loc => loc.toUpperCase().startsWith(filtro));
            if (opciones.length === 1) {
                e.target.value = opciones[0];
                // Ocultar sugerencias
                const datalist = document.getElementById('localidades-list');
                if (datalist) datalist.innerHTML = '';
            }
        }
    });
    document.body.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'edit-localidad') {
            const datalist = document.getElementById('localidades-list');
            if (datalist) datalist.innerHTML = '';
        }
    });
    document.body.addEventListener('blur', function(e) {
        if (e.target && e.target.id === 'edit-localidad') {
            const datalist = document.getElementById('localidades-list');
            if (datalist) datalist.innerHTML = '';
        }
    }, true);
});

function crearComboPrestador(input, listContainer, btn) {
    if (!input || !listContainer || !btn) return;
    let abierto = false;
    // Buscar el nombre estándar a partir de cualquier variante
    function buscarEfectorPorVariante(valor) {
        if (!valor || !EFECTORES_DICT) return null;
        const valNorm = valor.trim().toUpperCase();
        for (const [nombre, obj] of Object.entries(EFECTORES_DICT)) {
            if (obj.variantes.some(v => v.toUpperCase() === valNorm)) return nombre;
        }
        return null;
    }
    function mostrarLista(filtrar = true) {
        // Mostrar solo los nombres estándar, pero permitir buscar por cualquier variante
        let opciones = LISTA_EFECTORES.slice();
        const val = input.value.trim().toUpperCase();
        // Si el valor coincide con alguna variante, sugerir el estándar primero
        let sugerido = buscarEfectorPorVariante(val);
        let filtradas = filtrar && val ? opciones.filter(e => e.includes(val)) : opciones;
        if (sugerido && !filtradas.includes(sugerido)) filtradas.unshift(sugerido);
        if (!filtradas.includes(val) && val && !sugerido) filtradas.unshift(val);
        listContainer.innerHTML = filtradas.map(e => `<li${e === val ? ' class="active"' : ''}>${e}</li>`).join('');
        listContainer.style.display = 'block';
        abierto = true;
    }
    // Tooltip solo al seleccionar y posar el mouse
    input.addEventListener('change', function() {
        const val = input.value.trim().toUpperCase();
        let nombre = buscarEfectorPorVariante(val) || val;
        if (EFECTORES_DICT[nombre]) {
            input.title = EFECTORES_DICT[nombre].tooltip || '';
        } else {
            input.title = '';
        }
    });
    // También al perder foco, por si se edita manualmente
    input.addEventListener('blur', function() {
        const val = input.value.trim().toUpperCase();
        let nombre = buscarEfectorPorVariante(val) || val;
        if (EFECTORES_DICT[nombre]) {
            input.title = EFECTORES_DICT[nombre].tooltip || '';
        } else {
            input.title = '';
        }
    });

/**
 * Imprime únicamente la tabla de historial de prestaciones en A4 vertical, márgenes 2cm, B/N,
 * sin otros elementos y con pie "Santa Fe, [fecha actual]" alineado a la derecha.
 * Usa el diálogo nativo del navegador (vista previa incluida).
 */
function printPrestacionesTable() {
    try {
        const tabla = document.getElementById('tabla-historial-prestaciones');
        if (!tabla) return;

        // Obtener nombre y DNI del paciente desde la tarjeta
        let nombre = '-';
        let dni = '-';
        const nombreEl = document.querySelector('#info-paciente .patient-name');
        const dniEl = document.querySelector('#info-paciente .patient-dni');
        if (nombreEl) nombre = nombreEl.textContent.trim();
        if (dniEl) dni = dniEl.textContent.trim();

        // Clonar la tabla a un contenedor dedicado de impresión
        const PRINT_AREA_ID = 'print-area-historial';
        let printArea = document.getElementById(PRINT_AREA_ID);
        if (!printArea) {
            printArea = document.createElement('div');
            printArea.id = PRINT_AREA_ID;
            printArea.style.display = 'none';
            document.body.appendChild(printArea);
        } else {
            printArea.innerHTML = '';
        }

        // Crear encabezado personalizado
        const header = document.createElement('div');
        header.className = 'print-historial-header';
        header.innerHTML = `
            <div style="font-size:1.25em;font-weight:bold;margin-bottom:2px;">${nombre}</div>
            <div style="font-size:1.1em;">DNI: ${dni}</div>
            <hr style="margin:8px 0 16px 0;">
        `;
        printArea.appendChild(header);

        // Clonar la tabla sin referencias
        const tablaClon = tabla.cloneNode(true);
        printArea.appendChild(tablaClon);

        // Crear/actualizar pie de impresión con nombre, DNI y paginación
        const FOOTER_ID = 'print-footer';
        let footer = document.getElementById(FOOTER_ID);
        const fechaLarga = (() => {
            const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
            const d = new Date();
            return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
        })();
        if (!footer) {
            footer = document.createElement('div');
            footer.id = FOOTER_ID;
            footer.className = 'print-footer';
            document.body.appendChild(footer);
        }
    footer.innerHTML = `Santa Fe, ${fechaLarga} — <span class='footer-nombre'>${nombre}</span> — <span class='footer-dni'>DNI: ${dni}</span>`;

        // Marcar modo de impresión de historial
        document.body.classList.add('print-historial');

        const cleanup = () => {
            document.body.classList.remove('print-historial');
            // Remover área de impresión y pie
            const area = document.getElementById(PRINT_AREA_ID);
            if (area) area.remove();
            const f = document.getElementById(FOOTER_ID);
            if (f) f.remove();
            window.removeEventListener('afterprint', cleanup);
            if (window.matchMedia) {
                const mq = window.matchMedia('print');
                if (mq && mq.removeEventListener) {
                    try { mq.removeEventListener('change', onMediaChange); } catch(_) {}
                }
            }
        };
        const onMediaChange = (mql) => { if (!mql.matches) cleanup(); };

        window.addEventListener('afterprint', cleanup);
        if (window.matchMedia) {
            const mq = window.matchMedia('print');
            if (mq && mq.addEventListener) mq.addEventListener('change', onMediaChange);
        }

        // Abrir diálogo de impresión
        window.print();

        // Fallback por si afterprint no dispara (Safari)
        setTimeout(() => {
            if (!document.body.classList.contains('print-historial')) return;
            cleanup();
        }, 1500);
    } catch (err) {
        console.error('Error al imprimir historial:', err);
    }
}
window.printPrestacionesTable = printPrestacionesTable;
    function ocultarLista() {
        listContainer.style.display = 'none';
        abierto = false;
    }
    input.addEventListener('focus', () => mostrarLista(false));
    input.addEventListener('input', () => mostrarLista(true));
    input.addEventListener('blur', () => setTimeout(ocultarLista, 150));
    btn.addEventListener('mousedown', e => { e.preventDefault(); if (abierto) ocultarLista(); else mostrarLista(false); input.focus(); });
    listContainer.addEventListener('mousedown', e => {
        if (e.target.tagName === 'LI') {
            input.value = e.target.textContent;
            ocultarLista();
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}
// --- Helper para poblar selects de fecha de nacimiento (GLOBAL) ---
function poblarDropdownFecha(idPrefijo, fechaISO) {
    const diaSel = document.getElementById(idPrefijo + '-dia');
    const mesSel = document.getElementById(idPrefijo + '-mes');
    const anioSel = document.getElementById(idPrefijo + '-anio');
    if (!diaSel || !mesSel || !anioSel) return;

    // Poblar días (01-31) - PLACEHOLDER VISIBLE
    const opcionesDia = Array.from({ length: 31 }, (_, i) => {
        const valor = String(i + 1).padStart(2, '0');
        return `<option value="${valor}">${valor}</option>`;
    }).join('');
    diaSel.innerHTML = '<option value="" selected disabled hidden>Día</option>' + opcionesDia;

    // Poblar meses (01-12) - PLACEHOLDER VISIBLE
    const opcionesMes = Array.from({ length: 12 }, (_, i) => {
        const valor = String(i + 1).padStart(2, '0');
        return `<option value="${valor}">${valor}</option>`;
    }).join('');
    mesSel.innerHTML = '<option value="" selected disabled hidden>Mes</option>' + opcionesMes;

    // Poblar años (1900 hasta el año actual) - PLACEHOLDER VISIBLE
    const anioActual = new Date().getFullYear();
    const opcionesAnio = [];
    for (let anio = 1900; anio <= anioActual; anio++) {
        opcionesAnio.push(`<option value="${anio}">${anio}</option>`);
    }
    anioSel.innerHTML = '<option value="" selected disabled hidden>Año</option>' + opcionesAnio.join('');

    // Seleccionar valores si se pasa una fecha válida
    if (fechaISO && fechaISO.includes('-')) {
        const soloFecha = fechaISO.split('T')[0];
        const [yyyy, mm, dd] = soloFecha.split('-');
        if (dd) diaSel.value = dd.padStart(2, '0');
        if (mm) mesSel.value = mm.padStart(2, '0');
        if (yyyy) anioSel.value = yyyy;
    }

    enableManualNumericSelect(diaSel, { min: 1, max: 31, padLength: 2 });
    enableManualNumericSelect(mesSel, { min: 1, max: 12, padLength: 2 });
    enableManualNumericSelect(anioSel, { min: 1900, max: anioActual, padLength: 4, resetDelay: 1200 });
}


document.addEventListener('DOMContentLoaded', () => {
    // Poblar selects de fecha de prestación al inicio (están visibles)
    populateDateSelects('prest-fecha-dia', 'prest-fecha-mes', 'prest-fecha-anio');

    // --- Lógica ENTER y validación personalizada en CARGAR NUEVA PRESTACION ---
    const formNuevaPrestacion = document.getElementById('form-nueva-prestacion');
    if (formNuevaPrestacion) {
        // Quitar required nativo
        Array.from(formNuevaPrestacion.querySelectorAll('[required]')).forEach(el => el.removeAttribute('required'));
        // Navegación por Enter
        const campos = Array.from(formNuevaPrestacion.querySelectorAll('input, select, textarea'));
        formNuevaPrestacion.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const active = document.activeElement;
                const btnGuardar = document.getElementById('btn-guardar-prestacion');
                if (active === btnGuardar) return;
                e.preventDefault();
                let idx = campos.indexOf(active);
                for (let i = idx + 1; i < campos.length; i++) {
                    if (!campos[i].disabled && campos[i].offsetParent !== null) {
                        campos[i].focus();
                        return;
                    }
                }
            }
        });
        // Validación personalizada al guardar
        formNuevaPrestacion.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = e.submitter || document.getElementById('btn-guardar-prestacion');
            const faltantes = [];
            // DNI
            const dni = document.getElementById('prest-dni');
            if (!dni || !dni.value.trim()) faltantes.push('DNI');
            // Fecha
            const dia = document.getElementById('prest-fecha-dia').value;
            const mes = document.getElementById('prest-fecha-mes').value;
            const anio = document.getElementById('prest-fecha-anio').value;
            if (!dia || !mes || !anio) faltantes.push('Fecha');
            // Prestador
            const prestador = document.getElementById('prest-prestador');
            if (!prestador || !prestador.value.trim()) faltantes.push('Prestador');
            // Prestaciones (al menos una, todas completas)
            const inputsPrestacion = Array.from(document.querySelectorAll('.prestacion-input'));
            if (inputsPrestacion.length === 0 || inputsPrestacion.some(inp => !inp.value.trim())) faltantes.push('Descripción de Prestación');
            if (faltantes.length > 0) {
                let mensaje = '';
                if (faltantes.length > 0) {
                    mensaje += 'Faltan completar los siguientes campos:<br><ul>';
                    faltantes.forEach(f => { mensaje += `<li>${f}</li>`; });
                    mensaje += '</ul>';
                }
                mensaje += '<br>No se puede guardar hasta completar todos los campos.';
                mostrarModalConfirmacionCampos({
                    titulo: 'Campos incompletos',
                    mensaje,
                    soloVolver: true
                });
                return;
            }
            // Si todo OK, continuar con lógica original
            guardarNuevaPrestacion(e);
        });
    }
    const panelCarga = document.getElementById('panel-carga');
    if (panelCarga) {
        const details = panelCarga.querySelectorAll('details.sub-details');
        details.forEach(det => {
            det.addEventListener('toggle', function() {
                if (det.open) {
                    details.forEach(other => { if (other !== det) other.open = false; });
                    
                    // Poblar selects de fecha de Nuevo Paciente cuando se abre el details
                    const formNuevoPaciente = document.getElementById('form-nuevo-paciente');
                    if (formNuevoPaciente && det.contains(formNuevoPaciente)) {
                        populateDateSelects('new-fecha-dia', 'new-fecha-mes', 'new-fecha-anio');
                    }
                }
            });
        });
    }
    
    // Combo en formulario de nueva prestación
    const combo = document.querySelector('.combo-prestador');
    if (combo) {
        const input = combo.querySelector('input');
        const list = combo.querySelector('ul');
        const btn = combo.querySelector('button');
        crearComboPrestador(input, list, btn);
    }
});
/**
 * Modal informativo (éxito, error, mensajes simples)
 * - Sin botones
 * - Cierre automático a los 3 segundos
 * - Cierre al hacer clic fuera
 * - Adaptado al tema activo
 */
function mostrarModalAviso({titulo, mensaje, onClose}) {
    const modal = document.getElementById('modal-aviso');
    const tituloModal = document.getElementById('titulo-modal-aviso');
    const textoModal = document.getElementById('texto-modal-aviso');
    const btnAceptar = document.getElementById('btn-modal-aviso-aceptar');
    const botonesContainer = modal?.querySelector('.modal-botones-container');
    
    if (tituloModal) tituloModal.textContent = titulo || 'Aviso';
    if (textoModal) textoModal.textContent = mensaje || '';
    
    // Ocultar todos los botones
    if (botonesContainer) botonesContainer.style.display = 'none';
    
    if (modal) {
        modal.style.display = 'flex';
        
        // Cierre automático a los 1.5 segundos
        const timeoutId = setTimeout(() => {
            modal.style.display = 'none';
            if (typeof onClose === 'function') onClose();
        }, 1500);
        
        // Permitir cerrar al hacer clic fuera del modal
        function cerrarModalClickFuera(e) {
            if (e.target === modal) {
                clearTimeout(timeoutId);
                modal.style.display = 'none';
                if (typeof onClose === 'function') onClose();
                document.removeEventListener('mousedown', cerrarModalClickFuera);
            }
        }
        document.addEventListener('mousedown', cerrarModalClickFuera);
    }
}
/**
 * Modal de acción crítica (eliminar, sobrescribir, etc.)
 * - Dos botones: Aceptar/Eliminar y Cancelar
 * - Adaptado al tema activo
 */
function mostrarModalAccion({titulo, mensaje, textoAccion, onConfirm}) {
    const modal = document.getElementById('modal-confirmar-eliminar');
    const tituloModal = document.getElementById('titulo-modal-eliminar');
    const textoModal = document.getElementById('texto-modal-eliminar');
    const btnAceptar = document.getElementById('btn-confirmar-eliminar-aceptar');
    const btnCancelar = document.getElementById('btn-confirmar-eliminar-cancelar');
    
    if (tituloModal) tituloModal.textContent = titulo || 'Confirmar Acción';
    if (textoModal) textoModal.textContent = mensaje || '¿Está seguro de que desea realizar esta acción?';
    if (btnAceptar) btnAceptar.textContent = textoAccion || 'Aceptar';
    
    modal.style.display = 'flex';
    
    btnAceptar.onclick = null;
    btnCancelar.onclick = null;
    
    btnCancelar.onclick = () => { 
        modal.style.display = 'none'; 
    };
    
    btnAceptar.onclick = () => {
        modal.style.display = 'none';
        if (typeof onConfirm === 'function') onConfirm();
    };
}

/**
 * Modal de confirmación de eliminación de archivo
 * - Reemplaza el confirm() nativo del navegador
 * - Dos botones: Eliminar y Cancelar
 * - Adaptado al tema activo
 */
window.mostrarModalEliminarArchivo = function({titulo, mensaje, onConfirm}) {
    mostrarModalAccion({
        titulo: titulo || 'Eliminar Archivo',
        mensaje: mensaje || '¿Está seguro de eliminar este archivo?',
        textoAccion: 'Eliminar',
        onConfirm: onConfirm
    });
};
// --- LÓGICA DE TEMA (APLICAR ANTES DE DOMCONTENTLOADED) ---
(function() {
    const savedTheme = localStorage.getItem('appTheme') || 'theme-corporate';
    // Mantener la clase de rol si ya existe
    const rolClass = Array.from(document.body.classList).find(c => c.startsWith('rol-'));
    if (rolClass) {
        document.body.className = savedTheme + ' ' + rolClass;
    } else {
        document.body.className = savedTheme;
    }
})();


// Variable global para guardar el estado del usuario
let currentUser = {
    usuario: null,
    rol: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Mapeo de parentescos para formas masculinas/femeninas/neutras
    const PARENTESCO_MAP = {
        'Hijo/a': { male: 'hijo', female: 'hija', neutral: 'hijo' },
        'Nieto/a': { male: 'nieto', female: 'nieta', neutral: 'nieto' },
        'Cónyuge': { male: 'conyuge', female: 'conyuge', neutral: 'conyuge' },
        'Esposo/a': { male: 'esposo', female: 'esposa', neutral: 'esposo' }
    };

    function computeStoredParentesco(optionValue, sexo, otherText) {
        if (!optionValue) return '';
        if (optionValue === 'Otro') return (otherText || '').trim() || '';
        const map = PARENTESCO_MAP[optionValue];
        if (!map) return optionValue;
        if (sexo === 'Femenino') return map.female;
        // Masculino por defecto en caso de Otro o valores distintos
        return map.male;
    }

    function reverseParentesco(storedValue) {
        if (!storedValue) return { option: '', other: '' };
        const val = storedValue.toLowerCase();
        for (const key of Object.keys(PARENTESCO_MAP)) {
            const m = PARENTESCO_MAP[key];
            if (m.male === val || m.female === val || m.neutral === val) {
                return { option: key, other: '' };
            }
        }
        return { option: 'Otro', other: storedValue };
    }

    // Normalizar a modo oración: primera letra mayúscula, el resto minúsculas (para la primera palabra se capitaliza)
    function sentenceCase(value) {
        if (value === null || value === undefined) return '';
        let s = String(value).trim();
        if (!s) return '';

        // Dividir en oraciones (mantiene los delimitadores como ., !, ?)
        const sentences = s.match(/[^.!?]+[.!?]*|[^.!?]+$/g) || [];

        let finalResult = sentences.map(sentence => {
            sentence = sentence.trim();
            if (!sentence) return '';

            // Procesar palabras de esta oración
            const words = sentence.split(' ');
            let processedWords = [];
            
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (!word) continue;

                // Quitar puntuación final para la evaluación
                let punctuation = '';
                const puncMatch = word.match(/[.,!?;:)]*$/);
                let coreWord = word;
                if (puncMatch) {
                    punctuation = puncMatch[0];
                    coreWord = word.substring(0, word.length - punctuation.length);
                }
                
                // Quitar prefijos (paréntesis, etc.)
                let prefix = '';
                const prefixMatch = coreWord.match(/^[(¿¡]*/);
                 if (prefixMatch) {
                    prefix = prefixMatch[0];
                    coreWord = coreWord.substring(prefix.length);
                }
                
                if (!coreWord) {
                     processedWords.push(word); // Era solo puntuación/prefijo
                     continue;
                }

                // --- REGLAS DE EXCEPCIÓN ---
                // 1. Es TODO MAYÚSCULAS (y > 1 char)
                const isAllUpper = coreWord === coreWord.toUpperCase() && coreWord.length > 1;
                // 2. Es Nombre Propio (Empieza con Mayús, pero no es TODO MAYÚS)
                const isProper = coreWord.length > 0 && coreWord[0] === coreWord[0].toUpperCase() && !isAllUpper;
                // --- FIN REGLAS ---

                if (i === 0) {
                    // Es la PRIMERA palabra de la oración
                    if (isAllUpper) {
                        processedWords.push(word); // Dejarla (ej: HIBA)
                    } else {
                        // Capitalizar primera letra, minúscula el resto
                        processedWords.push(prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + punctuation);
                    }
                } else {
                    // Palabras SIGUIENTES
                    if (isAllUpper) {
                        processedWords.push(word); // Dejarla (ej: ... al HIBA)
                    } else if (isProper) {
                        // Respetar mayúscula inicial, minúscula el resto (ej: ... de Güemes)
                        processedWords.push(prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + punctuation);
                    } else {
                        processedWords.push(prefix + coreWord.toLowerCase() + punctuation); // Normalizar
                    }
                }
            }
            return processedWords.join(' ');
        });

        // Unir las oraciones. 
        return finalResult.join(' ').replace(/(\s+)/g, ' '); // Limpieza final de espacios
    }

    // Capitalizar cada palabra (Título) para nombres propios
    function titleCase(value) {
        if (value === null || value === undefined) return '';
        return String(value).trim().split(/\s+/).map(w => {
            if (!w) return '';
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).filter(Boolean).join(' ');
    }

    // --- (NUEVO) Helper para formatear fecha ---
    function formatDisplayDate(isoDate) {
        if (!isoDate || !isoDate.includes('-')) return '';
        try {
            // Asegurarse de que solo tomamos la parte de la fecha (YYYY-MM-DD)
            const datePart = isoDate.split('T')[0];
            const parts = datePart.split('-');
            if (parts.length === 3) {
                // Formato DD/MM/AAAA
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return isoDate; // Fallback si el formato no es esperado
        } catch (e) {
            return isoDate; // Fallback en caso de error
        }
    }

    // --- Elementos Modal Confirmar Edición (NUEVO) ---
    const modalConfirmarEdicion = document.getElementById('modal-confirmar-edicion');
    const btnConfirmarAceptar = document.getElementById('btn-confirmar-edicion-aceptar');
    const btnConfirmarCancelar = document.getElementById('btn-confirmar-edicion-cancelar');

    // --- Elementos Comunes ---
// --- BÚSQUEDA EN PANEL EDITAR PACIENTE ---
const inputBuscarEditar = document.getElementById('input-buscar-editar');
const btnLimpiarBusquedaEditar = document.getElementById('btn-limpiar-busqueda-editar');
const listadoPacientesEditar = document.getElementById('listado-pacientes-editar');

if (inputBuscarEditar && listadoPacientesEditar) {
    inputBuscarEditar.addEventListener('input', (e) => {
        const valor = inputBuscarEditar.value.trim();
        // Solo buscar fragmentos si NO parece un DNI completo (solo texto o menos de 7 dígitos)
        if (!/^\d{7,}$/.test(valor) && valor.length >= 3) {
            buscarFragmentosEditar(valor);
        } else {
            listadoPacientesEditar.innerHTML = '';
            document.getElementById('form-editar-paciente-container').innerHTML = '';
        }
    });
    inputBuscarEditar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputBuscarEditar.value.trim()) buscarPacienteEditar();
        }
    });
    btnLimpiarBusquedaEditar.addEventListener('click', () => {
        inputBuscarEditar.value = '';
        listadoPacientesEditar.innerHTML = '';
        document.getElementById('form-editar-paciente-container').innerHTML = '';
        inputBuscarEditar.focus();
    });
}

async function buscarPacienteEditar() {
    const query = inputBuscarEditar.value.trim();
    if (!query) {
        listadoPacientesEditar.innerHTML = '';
        return;
    }
    let url = `/api/buscar-paciente?query=${encodeURIComponent(query)}`;
    try {
        const response = await fetchAPI(url);
        mostrarResultadosEditar(response);
    } catch (error) {
        listadoPacientesEditar.innerHTML = `<li style="color:red;">Error: ${error.message}</li>`;
    }
}

async function buscarFragmentosEditar(valor) {
    if (!valor || valor.length < 3) {
        listadoPacientesEditar.innerHTML = '';
        return;
    }
    // Si parece un DNI completo, no buscar fragmentos (esperar Enter)
    if (/^\d{7,}$/.test(valor)) {
        listadoPacientesEditar.innerHTML = '';
        return;
    }
    try {
        const url = `/api/buscar-pacientes-fragmento?query=${encodeURIComponent(valor)}`;
        const resultados = await fetchAPI(url);
        if (Array.isArray(resultados) && resultados.length > 0) {
            let html = '<ul class="listado-pacientes">';
            resultados.forEach(p => {
                html += `<li><button class="btn-seleccionar-paciente-editar" data-dni="${p.dni}">${p.dni} - ${p.nombre}</button></li>`;
            });
            html += '</ul>';
            listadoPacientesEditar.innerHTML = html;
            document.querySelectorAll('.btn-seleccionar-paciente-editar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    inputBuscarEditar.value = btn.dataset.dni;
                    listadoPacientesEditar.innerHTML = '';
                    await buscarPacienteEditar();
                });
            });
        } else {
            listadoPacientesEditar.innerHTML = '';
        }
    } catch (error) {
        listadoPacientesEditar.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function mostrarResultadosEditar(data) {
    // Clonar el formulario de agregar paciente, pero con los valores cargados
    listadoPacientesEditar.innerHTML = '';
    const formContainer = document.getElementById('form-editar-paciente-container');
    if (!data || !data.dni) {
        formContainer.innerHTML = '<p style="color:red;">No se pudo cargar la ficha del paciente.</p>';
        return;
    }
    
    // MODIFICADO: Campos reordenados para coincidir con la vista principal
    formContainer.innerHTML = `
        <form id="form-editar-paciente">
            <div class="form-group">
                <label for="edit-dni">DNI (No editable)</label>
                <input type="text" id="edit-dni" name="dni" 
                       value="${data.dni || ''}" 
                       readonly 
                       tabindex="-1" 
                       class="input-dni-no-select tema-bg" 
                       style="user-select:none; pointer-events:none; background-color:var(--color-dni-bg); color:var(--color-dni-fg);">
            </div>
            <div class="form-group"><label for="edit-nombre">Apellido y Nombre</label><input type="text" id="edit-nombre" name="nombre" value="${data.nombre || ''}"></div>
            <div class="form-group"><label for="edit-sexo">Sexo</label>
                <select id="edit-sexo" name="sexo">
                    <option value="" ${!data.sexo ? 'selected' : ''} disabled hidden>Seleccione...</option>
                    <option value="Masculino" ${data.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="Femenino" ${data.sexo === 'Femenino' ? 'selected' : ''}>Femenino</option>
                    <option value="Otro" ${data.sexo && data.sexo !== 'Masculino' && data.sexo !== 'Femenino' ? 'selected' : ''}>Otro / No declarar</option>
                </select>
            </div>
            <div class="form-group"><label for="edit-fecha-nacimiento">Fecha de Nacimiento</label>
                <span id="edit-fecha-nacimiento-placeholder"></span>
            </div>
            <div class="form-group"><label for="edit-condicion">Condición</label>
                <select id="edit-condicion" name="condicion">
                    <option value="" ${!data.condicion ? 'selected' : ''} disabled hidden>Seleccione...</option>
                    <option value="RESIDENTE" ${data.condicion === 'RESIDENTE' ? 'selected' : ''}>RESIDENTE</option>
                    <option value="DERIVADO" ${data.condicion === 'DERIVADO' ? 'selected' : ''}>DERIVADO</option>
                    <option value="TRANSITO" ${data.condicion === 'TRANSITO' ? 'selected' : ''}>TRANSITO</option>
                </select>
            </div>
            <div class="form-group"><label for="edit-telefono">Teléfono</label><input type="text" id="edit-telefono" name="telefono" value="${data.telefono || ''}"></div>
            <div class="form-group"><label for="edit-direccion">Dirección</label><input type="text" id="edit-direccion" name="direccion" value="${data.direccion || ''}"></div>
            <div class="form-group"><label for="edit-localidad">Localidad</label><input type="text" id="edit-localidad" name="localidad" value="${data.localidad || ''}" list="localidades-list"></div>
            <div class="form-group"><label for="edit-tipo-afiliado">Tipo de Afiliado</label>
                <select id="edit-tipo-afiliado" name="tipo_afiliado">
                    <option value="" ${!data.tipo_afiliado ? 'selected' : ''} disabled hidden>Seleccione...</option>
                    <option value="TITULAR" ${data.tipo_afiliado === 'TITULAR' ? 'selected' : ''}>TITULAR</option>
                    <option value="ADHERENTE" ${data.tipo_afiliado === 'ADHERENTE' ? 'selected' : ''}>ADHERENTE</option>
                </select>
            </div>
            <div class="form-group" id="edit-grupo-parentesco"><label for="edit-vinculo-titular">Parentesco</label>
                <select id="edit-vinculo-titular" name="vinculo_titular">
                    <option value="" selected disabled hidden>Seleccione...</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Nieto/a">Nieto/a</option>
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Esposo/a">Esposo/a</option>
                    <option value="Otro">Otro (especificar)</option>
                </select>
                <input type="text" id="edit-vinculo-otro" name="vinculo_titular_otro" placeholder="Especificar parentesco" style="display:none; margin-top:8px;" />
            </div>
            <div class="form-group" id="edit-grupo-titular-nombre"><label for="edit-titular-nombre">Nombre y Apellido Titular</label><input type="text" id="edit-titular-nombre" name="titular_nombre" value="${data.titular_nombre || ''}"></div>
            <div class="form-group" id="edit-grupo-titular-dni"><label for="edit-titular-dni">DNI Titular</label><input type="text" id="edit-titular-dni" name="titular_dni" value="${data.titular_dni || ''}"></div>
            <div class="form-group"><label for="edit-observaciones">Observaciones</label><textarea id="edit-observaciones" name="observaciones" rows="3">${data.observaciones || ''}</textarea></div>
            <div class="form-group">
                <label>Adjuntar archivos (máximo 5)</label>
                <div id="campos-archivos-adjuntos-editar">
                    </div>
            </div>
            <button type="submit" id="btn-guardar-edicion">Guardar Cambios</button>
            <div id="alerta-editar-paciente" class="alerta"></div>
        </form>
    `;

    const formEditar = document.getElementById('form-editar-paciente');

    // Inserta los selects de fecha desde el template y establece valores
    const tplFecha = document.getElementById('tpl-edit-fecha-nacimiento-dropdowns');
    const placeholderFecha = document.getElementById('edit-fecha-nacimiento-placeholder');
    if (tplFecha && placeholderFecha) {
        const clone = tplFecha.content.cloneNode(true);
        placeholderFecha.replaceWith(clone);
        // Usar setTimeout para asegurar que el DOM esté listo
        setTimeout(() => {
            poblarDropdownFecha('edit-fecha', data.fecha_nacimiento || '');
        }, 0);
    }

    // Inicializar visibility y valores de parentesco/otro según data
    const editVinculoSelect = document.getElementById('edit-vinculo-titular');
    const editVinculoOtro = document.getElementById('edit-vinculo-otro');
    const editSexoSelect = document.getElementById('edit-sexo');
    const editTipoAfiliadoSelect = document.getElementById('edit-tipo-afiliado');
    const editGrupoParentesco = document.getElementById('edit-grupo-parentesco');
    const editGrupoTitularNombre = document.getElementById('edit-grupo-titular-nombre');
    const editGrupoTitularDni = document.getElementById('edit-grupo-titular-dni');
    
    // Función para mostrar/ocultar campos según tipo de afiliado
    function toggleCamposTitularEdit() {
        const esTitular = editTipoAfiliadoSelect.value === 'TITULAR';
        editGrupoParentesco.style.display = esTitular ? 'none' : 'block';
        editGrupoTitularNombre.style.display = esTitular ? 'none' : 'block';
        editGrupoTitularDni.style.display = esTitular ? 'none' : 'block';
    }
    
    // Ejecutar al cargar
    toggleCamposTitularEdit();
    
    // Agregar listener para cuando cambie el tipo de afiliado
    editTipoAfiliadoSelect.addEventListener('change', toggleCamposTitularEdit);
    
    // Reverse map stored value to select option
    const rev = reverseParentesco((data.vinculo_titular || '').toString());
    if (rev.option === 'Otro') {
        editVinculoSelect.value = 'Otro';
        editVinculoOtro.style.display = 'block';
        editVinculoOtro.value = rev.other;
    } else {
        editVinculoSelect.value = rev.option; // Aquí se asignará "" si rev.option es ""
        editVinculoOtro.style.display = 'none';
    }

    editVinculoSelect.addEventListener('change', () => {
        if (editVinculoSelect.value === 'Otro') editVinculoOtro.style.display = 'block';
        else editVinculoOtro.style.display = 'none';
    });

    // Inicializar archivos adjuntos para el formulario de edición
    if (window._inicializarArchivosEdicion) {
        setTimeout(() => {
            window._inicializarArchivosEdicion(data.dni);
        }, 100);
    }

    // Lógica de confirmación y guardado
    if (formEditar) {
        const camposEdicion = Array.from(formEditar.querySelectorAll('input, select, textarea'));
        formEditar.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const active = document.activeElement;
                const btnGuardar = document.getElementById('btn-guardar-edicion');
                if (active === btnGuardar) return;
                e.preventDefault();
                let idx = camposEdicion.indexOf(active);
                for (let i = idx + 1; i < camposEdicion.length; i++) {
                    if (!camposEdicion[i].disabled && camposEdicion[i].offsetParent !== null) {
                        camposEdicion[i].focus();
                        return;
                    }
                }
            }
        });

        formEditar.addEventListener('submit', function(e) {
            e.preventDefault();
            modalConfirmarEdicion.style.display = 'flex';

            btnConfirmarCancelar.onclick = () => {
                modalConfirmarEdicion.style.display = 'none';
            };

            btnConfirmarAceptar.onclick = async () => {
                modalConfirmarEdicion.style.display = 'none';
                // --- INICIO: Spinner en Botón ---
                const btn = e.submitter; // Captura el botón presionado
                if (!btn) return; // Salir si no se detectó el botón
                const originalBtnHTML = btn.innerHTML; // Guardar texto/icono original
                btn.disabled = true;
                btn.innerHTML = spinnerHTML;
                // --- FIN: Spinner en Botón ---
                const dni = document.getElementById('edit-dni').value;
                
                // Siempre usar FormData para enviar datos (con o sin archivos)
                const formData = new FormData();
                formData.append('nombre', document.getElementById('edit-nombre').value);
                formData.append('condicion', document.getElementById('edit-condicion').value);
                
                // calcular parentesco a guardar
                const editVinculoVal = document.getElementById('edit-vinculo-titular').value;
                const editVinculoOtroVal = document.getElementById('edit-vinculo-otro').value;
                const editSexoVal = document.getElementById('edit-sexo').value;
                const storedEditParentesco = computeStoredParentesco(editVinculoVal, editSexoVal, editVinculoOtroVal);
                formData.append('vinculo_titular', storedEditParentesco);
                formData.append('sexo', editSexoVal);
                formData.append('titular_dni', document.getElementById('edit-titular-dni').value);
                formData.append('titular_nombre', document.getElementById('edit-titular-nombre').value);
                formData.append('observaciones', document.getElementById('edit-observaciones').value);
                formData.append('telefono', document.getElementById('edit-telefono').value);
                formData.append('direccion', document.getElementById('edit-direccion').value);
                formData.append('localidad', document.getElementById('edit-localidad').value);
                // Leer fecha de nacimiento de los selects
                const dia = document.getElementById('edit-fecha-dia').value;
                const mes = document.getElementById('edit-fecha-mes').value;
                const anio = document.getElementById('edit-fecha-anio').value;
                let fechaNacimiento = '';
                if (dia && mes && anio) {
                    fechaNacimiento = `${anio}-${mes}-${dia}`;
                }
                formData.append('fecha_nacimiento', fechaNacimiento);
                formData.append('tipo_afiliado', document.getElementById('edit-tipo-afiliado').value);
                
                // Recolectar archivos nuevos usando la función global
                if (window.obtenerArchivosAdjuntos) {
                    const archivos = window.obtenerArchivosAdjuntos('campos-archivos-adjuntos-editar');
                    archivos.forEach(archivo => {
                        formData.append('archivos', archivo);
                    });
                }
                
                try {
                    const response = await fetchAPI(`/api/editar-paciente/${dni}`, {
                        method: 'POST',
                        body: formData
                    });
                    mostrarAlerta('alerta-editar-paciente', 'exito', `Éxito: ${response.message}`);
                    // Cerrar el modal (colapsar el details)
                    const detailsEditarPaciente = document.querySelector('#panel-editar-paciente');
                    if (detailsEditarPaciente) detailsEditarPaciente.open = false;
                    // Refrescar la ficha del paciente editado para que se vea inmediatamente
                    const dniEdit = dni;
                    setTimeout(async () => {
                        formContainer.innerHTML = '';
                        if (listadoPacientesEditar) listadoPacientesEditar.innerHTML = '';
                        if (inputBuscarEditar) inputBuscarEditar.value = '';
                        // Actualizar vista principal y panel de búsqueda editar si existen
                        try {
                            if (typeof buscarPaciente === 'function') {
                                searchQuery.value = dniEdit;
                                await buscarPaciente();
                            }
                            if (typeof buscarPacienteEditar === 'function') {
                                inputBuscarEditar.value = dniEdit;
                                await buscarPacienteEditar();
                            }
                        } catch (e) {
                            console.error('No se pudo refrescar la ficha tras editar:', e);
                        }
                    }, 1500);
                } catch (error) {
                    mostrarAlerta('alerta-editar-paciente', 'error', `Error al guardar: ${error.message}`);
                } finally {
                    // --- INICIO: Restaurar Botón ---
                    btn.disabled = false;
                    btn.innerHTML = originalBtnHTML;
                    // --- FIN: Restaurar Botón ---
                }
            };
        });
    }
}
    const btnLogout = document.getElementById('btn-logout-icon');
    const navbarUser = document.getElementById('navbar-user');
    const modalCambiarPass = document.getElementById('modal-cambiar-pass');
    
    // --- Elementos de Admin ---
    const panelCarga = document.getElementById('panel-carga'); // MODIFICADO (antes detailsCarga)
    const detailsAdmin = document.getElementById('details-admin');
    
    // --- Paneles Principales ---
    const btnBuscar = document.getElementById('btn-buscar');
    const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');
    const searchQuery = document.getElementById('search-query'); 
    const listadoResultadosDiv = document.getElementById('listado-resultados');
    const listadoResultadosAvanzadaDiv = document.getElementById('listado-resultados-avanzada');
    const infoPacienteDiv = document.getElementById('info-paciente');
    const listaPrestacionesDiv = document.getElementById('lista-prestaciones');
    // --- Búsqueda Avanzada ---
    const panelBusquedaAvanzada = document.getElementById('panel-busqueda-avanzada');
    const formBusquedaAvanzada = document.getElementById('form-busqueda-avanzada');
    const panelBusquedaPrincipal = document.getElementById('panel-busqueda');
    const selectPrestador = document.getElementById('adv-prestador');
    const selectAnio = document.getElementById('adv-anio');
    
    // --- Formularios de Carga (Admin) ---
    const formNuevoPaciente = document.getElementById('form-nuevo-paciente');
    const alertaPaciente = document.getElementById('alerta-paciente');
    const formNuevaPrestacion = document.getElementById('form-nueva-prestacion');
    const alertaPrestacion = document.getElementById('alerta-prestacion');
    // Para prestaciones dinámicas
    const prestacionesContainer = document.getElementById('prestaciones-container');
    const btnAnadirPrestacion = document.getElementById('btn-anadir-prestacion');
    if (btnAnadirPrestacion && prestacionesContainer) {
        btnAnadirPrestacion.addEventListener('click', () => {
            const grupo = document.createElement('div');
            grupo.className = 'prestacion-input-group';
            // --- CAMBIO REQUERIDO AQUÍ ---
            grupo.innerHTML = `<input type="text" name="prestacion[]" class="prestacion-input" placeholder="Ingrese prestación">
                <button type="button" class="btn-remove-prestacion" title="Quitar">&times;</button>`;
            // --- FIN DEL CAMBIO ---
            grupo.querySelector('.btn-remove-prestacion').onclick = function() {
                grupo.remove();
            };
            prestacionesContainer.appendChild(grupo);
        });
        // Delegación para quitar
        prestacionesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-remove-prestacion')) {
                e.target.parentElement.remove();
            }
        });
    }

    // --- Formulario Modal Cambio de Pass ---
    const formCambiarPass = document.getElementById('form-cambiar-pass');
    
    // --- Panel Admin Usuarios ---
    const listaUsuariosAdminDiv = document.getElementById('lista-usuarios-admin');
    
    // --- Selector de Tema ---
    const themeSwitcher = document.getElementById('theme-switcher');


    // --- 1. VERIFICACIÓN DE SESIÓN AL CARGAR ---
    

    (async function checkSession() {
        try {
            const response = await fetch('/api/session');
            if (!response.ok) throw new Error('No autorizado');
            const data = await response.json();
            currentUser = data; // Guardar estado
            // Añadir clase de ROL al body para CSS condicional
            // Eliminar cualquier clase de rol previa
            document.body.classList.forEach(c => { if (c.startsWith('rol-')) document.body.classList.remove(c); });
            document.body.classList.add('rol-' + data.rol);
            // Mantener la clase de tema
            const savedTheme = localStorage.getItem('appTheme') || 'theme-corporate';
            document.body.classList.add(savedTheme);
            navbarUser.textContent = data.usuario;

            // Cargar datos auxiliares (Efectores) ANTES de inicializar
            await cargarDatosAuxiliares();

            if (data.debe_cambiar_pass === 1) {
                modalCambiarPass.style.display = 'flex';
            } else {
                inicializarApp(data.rol);
            }
            mostrarApp();
        } catch (error) {
            console.error('Error de sesión:', error.message);
            window.location.href = '/login.html'; // Redirigir al login
        }
    })();

    
    // --- 2. INICIALIZACIÓN DE LA APP (si la sesión es válida) ---

    function inicializarApp(rol) {
        // --- Lógica Búsqueda Avanzada ---
        if (panelBusquedaAvanzada && panelBusquedaPrincipal) {
            panelBusquedaAvanzada.addEventListener('toggle', () => {
                if (panelBusquedaAvanzada.open) {
                    cargarFiltrosDinamicos(); // Recargar listas al desplegar
                }
            });
        }
        if (formBusquedaAvanzada) {
            formBusquedaAvanzada.addEventListener('submit', (e) => {
                e.preventDefault();
                ejecutarBusquedaAvanzada();
            });
            formBusquedaAvanzada.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const focusables = Array.from(formBusquedaAvanzada.querySelectorAll('input, select, button'));
                    const idx = focusables.indexOf(document.activeElement);
                    if (idx > -1 && idx < focusables.length - 1) {
                        focusables[idx + 1].focus();
                    }
                }
            });
            const btnLimpiarAdv = document.getElementById('btn-limpiar-busqueda-avanzada');
            if (btnLimpiarAdv) {
                btnLimpiarAdv.addEventListener('click', () => {
                    // Solo limpiar resultados de búsqueda avanzada, NO la búsqueda simple
                    if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '';
                });
            }
        }
        
        if (rol === 'administrativo') {
            panelCarga.style.display = 'block'; // MODIFICADO (antes detailsCarga)
            detailsAdmin.style.display = 'block'; 
            cargarListaUsuariosAdmin();
        }
        if (btnBuscar) {
            btnBuscar.disabled = true;
            btnBuscar.addEventListener('click', () => {
                if (searchQuery.value.trim()) {
                    buscarPaciente();
                }
            });
        }
        btnLimpiarBusqueda.addEventListener('click', limpiarBusqueda);
        searchQuery.addEventListener('input', (e) => {
            const valor = searchQuery.value.trim();
            if (btnBuscar) btnBuscar.disabled = valor.length === 0;
            // Solo buscar fragmentos si NO parece un DNI completo (solo texto o menos de 7 dígitos)
            if (!/^\d{7,}$/.test(valor) && valor.length >= 3) {
                buscarFragmentos(valor);
            } else {
                limpiarResultados();
                listadoResultadosDiv.innerHTML = '';
            }
        });
        searchQuery.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const valor = searchQuery.value.trim();
                if (/^\d{7,}$/.test(valor)) {
                    e.preventDefault();
                    if (btnBuscar && !btnBuscar.disabled) {
                        btnBuscar.click();
                    }
                } else {
                    e.preventDefault();
                }
            }
        });
        if (formNuevoPaciente) {
            formNuevoPaciente.addEventListener('submit', guardarNuevoPaciente);
        }
        if (formNuevaPrestacion) {
            formNuevaPrestacion.addEventListener('submit', guardarNuevaPrestacion);
        }
    }

    // --- 3. FUNCIONES DE BÚSQUEDA Y VISUALIZACIÓN ---
    // Cargar listas dinámicas de prestadores y años
    async function cargarFiltrosDinamicos() {
        try {
            // Cargar localidades desde JSON local
            const localidadesResponse = await fetch('/data/localidades_santa_fe.json');
            const localidades = await localidadesResponse.json();
            const datalistLocalidades = document.getElementById('localidades-list');
            if (datalistLocalidades && Array.isArray(localidades)) {
                datalistLocalidades.innerHTML = '';
                localidades.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc;
                    datalistLocalidades.appendChild(option);
                });
            }

            // Cargar prestadores desde JSON local (solo claves principales - sin tooltips)
            const prestadoresResponse = await fetch('/data/efectores_dict_normalizado_compacto.json');
            const prestadoresObj = await prestadoresResponse.json();
            const prestadoresKeys = Object.keys(prestadoresObj);
            const datalistPrestadores = document.getElementById('prestadores-list');
            if (datalistPrestadores && prestadoresKeys.length > 0) {
                datalistPrestadores.innerHTML = '';
                prestadoresKeys.forEach(prest => {
                    const option = document.createElement('option');
                    option.value = prest;
                    // NO usar label, solo value (evita mostrar tooltips)
                    datalistPrestadores.appendChild(option);
                });
            }

            // Generar años correlativo desde 2000 hasta 2030
            const datalistAnios = document.getElementById('anios-list');
            if (datalistAnios) {
                datalistAnios.innerHTML = '';
                const currentYear = new Date().getFullYear();
                // Generar desde 2000 hasta 2030
                for (let year = 2000; year <= 2030; year++) {
                    const option = document.createElement('option');
                    option.value = year.toString();
                    datalistAnios.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error cargando filtros dinámicos:', error);
        }
    }

    // Crear y mostrar modal de confirmación
    function mostrarModalConfirmacion(filtros, callback) {
        const modalAnterior = document.getElementById('modal-confirmacion-busqueda');
        if (modalAnterior) modalAnterior.remove();
        const modal = document.createElement('div');
        modal.id = 'modal-confirmacion-busqueda';
        modal.className = 'show';
        let resumen = 'Está por buscar pacientes con los siguientes criterios:<br><ul>';
        let contadorFiltros = 0;
        if (filtros.afiliado) { resumen += `<li><strong>Afiliado:</strong> ${filtros.afiliado}</li>`; contadorFiltros++; }
        if (filtros.localidad) { resumen += `<li><strong>Localidad:</strong> ${filtros.localidad}</li>`; contadorFiltros++; }
        if (filtros.condicion) { resumen += `<li><strong>Condición:</strong> ${filtros.condicion}</li>`; contadorFiltros++; }
        if (filtros.tipo_afiliado) { resumen += `<li><strong>Tipo:</strong> ${filtros.tipo_afiliado}</li>`; contadorFiltros++; }
        if (filtros.prestador) { resumen += `<li><strong>Prestador:</strong> ${filtros.prestador}</li>`; contadorFiltros++; }
        if (filtros.anio) { resumen += `<li><strong>Año:</strong> ${filtros.anio}</li>`; contadorFiltros++; }
        resumen += '</ul>';
        let advertencia = '';
        if (contadorFiltros <= 2) {
            advertencia = '<p class="advertencia">⚠️ Esta búsqueda puede devolver muchos resultados.</p>';
        }
        modal.innerHTML = `
            <div class="modal-confirmacion-content">
                <h3>Confirmar Búsqueda Avanzada</h3>
                <div class="resumen-filtros">${resumen}</div>
                ${advertencia}
                <div class="modal-confirmacion-actions">
                    <button id="btn-modal-volver" class="btn-secondary">Volver</button>
                    <button id="btn-modal-aceptar" class="btn-primary">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btn-modal-volver').addEventListener('click', () => { modal.remove(); });
        document.getElementById('btn-modal-aceptar').addEventListener('click', () => { modal.remove(); callback(); });
        const cerrarConEsc = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', cerrarConEsc); } };
        document.addEventListener('keydown', cerrarConEsc);
    }

    // Mostrar modal con alternativas de búsqueda
    function mostrarModalAlternativas(alternativas, filtrosOriginales) {
        const modalAnterior = document.getElementById('modal-alternativas-busqueda');
        if (modalAnterior) modalAnterior.remove();
        const modal = document.createElement('div');
        modal.id = 'modal-alternativas-busqueda';
        modal.className = 'show';
        
        let html = `
            <div class="modal-confirmacion-content">
                <h3>⚠️ Sin Resultados Exactos</h3>
                <p>No se encontraron pacientes que cumplan <strong>todos</strong> los criterios de búsqueda.</p>
                <p>Sin embargo, se encontraron resultados parciales:</p>
                <div class="alternativas-list">
        `;
        
        alternativas.forEach((alt, index) => {
            html += `
                <div class="alternativa-item">
                    <p><strong>${alt.cantidad} paciente(s)</strong> ${alt.descripcion}</p>
                    <button class="btn-ver-alternativa btn-primary" data-index="${index}">Ver estos resultados</button>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="modal-confirmacion-actions">
                    <button id="btn-modal-cancelar-alt" class="btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
        
        modal.innerHTML = html;
        document.body.appendChild(modal);
        
        document.getElementById('btn-modal-cancelar-alt').addEventListener('click', () => { 
            modal.remove();
            if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '<p>Búsqueda cancelada.</p>';
        });
        
        document.querySelectorAll('.btn-ver-alternativa').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const alt = alternativas[index];
                modal.remove();
                
                // Mostrar resultados de la alternativa
                let html = `<p><strong>${alt.cantidad} paciente(s) encontrado(s)</strong> <span style="color: #ff9800;">(búsqueda parcial: ${alt.descripcion})</span></p>`;
                html += '<ul class="listado-pacientes">';
                alt.primeros.forEach(p => {
                    html += `<li><button class="btn-seleccionar-paciente" data-dni="${p.dni}">${p.dni} - ${p.nombre}</button></li>`;
                });
                html += '</ul>';
                
                if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = html;
                
                document.querySelectorAll('.btn-seleccionar-paciente').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        searchQuery.value = btn.dataset.dni;
                        if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '';
                        if (panelBusquedaAvanzada) panelBusquedaAvanzada.open = false;
                        if (btnBuscar) btnBuscar.disabled = searchQuery.value.trim().length === 0;
                        await buscarPaciente();
                    });
                });
            });
        });
        
        const cerrarConEsc = (e) => { 
            if (e.key === 'Escape') { 
                modal.remove(); 
                document.removeEventListener('keydown', cerrarConEsc);
                if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '<p>Búsqueda cancelada.</p>';
            } 
        };
        document.addEventListener('keydown', cerrarConEsc);
    }

    // Ejecutar búsqueda avanzada
    async function ejecutarBusquedaAvanzada() {
        const form = formBusquedaAvanzada;
        const filtros = {
            afiliado: form.querySelector('#adv-afiliado').value.trim(),
            localidad: form.querySelector('#adv-localidad').value.trim(),
            condicion: form.querySelector('#adv-condicion').value,
            tipo_afiliado: form.querySelector('#adv-tipo-afiliado').value,
            prestador: form.querySelector('#adv-prestador').value.trim(),
            anio: form.querySelector('#adv-anio').value.trim()
        };
        const hayFiltros = Object.values(filtros).some(v => v !== '' && v !== null);
        if (!hayFiltros) {
            mostrarModalAviso({ titulo: 'Filtros vacíos', mensaje: 'Debe ingresar al menos un criterio de búsqueda.' });
            return;
        }
        // Validación permisiva: permite letras, números, espacios, apóstrofes, guiones, puntos
        if (filtros.afiliado && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s'\-\.]+$/.test(filtros.afiliado)) {
            mostrarModalAviso({ titulo: 'Error de validación', mensaje: 'El campo Afiliado contiene caracteres no permitidos.' });
            return;
        }
        if (filtros.anio && !/^\d{4}$/.test(filtros.anio)) {
            mostrarModalAviso({ titulo: 'Error de validación', mensaje: 'El año debe tener 4 dígitos.' });
            return;
        }
        // Validación de rango de año: desde 2000 hasta 2030
        if (filtros.anio) {
            const anioNum = parseInt(filtros.anio);
            if (anioNum < 2000 || anioNum > 2030) {
                mostrarModalAviso({ titulo: 'Error de validación', mensaje: 'El año debe estar entre 2000 y 2030.' });
                return;
            }
        }
        mostrarModalConfirmacion(filtros, async () => {
            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => { if (value) params.append(key, value); });
            limpiarResultados();
            if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '<p>Buscando...</p>';
            try {
                const url = `/api/busqueda-avanzada?${params.toString()}`;
                const response = await fetchAPI(url);
                
                // Manejar nueva estructura de respuesta con metadata
                let resultados = [];
                let limitado = false;
                if (response.resultados) {
                    // Nueva estructura con metadata
                    resultados = response.resultados;
                    limitado = response.limitado;
                } else if (Array.isArray(response)) {
                    // Retrocompatibilidad con respuesta anterior
                    resultados = response;
                }
                
                if (resultados.length > 0) {
                    let html = `<p><strong>${resultados.length} paciente(s) encontrado(s)</strong>`;
                    if (limitado) {
                        html += ` <span style="color: #ff9800;">(Mostrando primeros 200 resultados, puede haber más. Refine la búsqueda.)</span>`;
                    }
                    html += '</p>';
                    html += '<ul class="listado-pacientes">';
                    resultados.forEach(p => {
                        html += `<li><button class="btn-seleccionar-paciente" data-dni="${p.dni}">${p.dni} - ${p.nombre}</button></li>`;
                    });
                    html += '</ul>';
                    if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = html;
                    document.querySelectorAll('.btn-seleccionar-paciente').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            searchQuery.value = btn.dataset.dni;
                            if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '';
                            if (panelBusquedaAvanzada) panelBusquedaAvanzada.open = false;
                            if (btnBuscar) btnBuscar.disabled = searchQuery.value.trim().length === 0;
                            await buscarPaciente();
                        });
                    });
                } else {
                    // Sin resultados: verificar si hay alternativas
                    if (response.alternativas && response.alternativas.length > 0) {
                        mostrarModalAlternativas(response.alternativas, filtros);
                    } else {
                        if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = '<p>No se encontraron pacientes con esos criterios.</p>';
                    }
                }
            } catch (error) {
                if (listadoResultadosAvanzadaDiv) listadoResultadosAvanzadaDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        });
    }

    // Inicializar comportamiento del select de parentesco en nuevo paciente
    const newVinculoSelectEl = document.getElementById('new-vinculo-titular');
    const newVinculoOtroEl = document.getElementById('new-vinculo-otro');
    if (newVinculoSelectEl && newVinculoOtroEl) {
        newVinculoSelectEl.addEventListener('change', () => {
            if (newVinculoSelectEl.value === 'Otro') newVinculoOtroEl.style.display = 'block';
            else newVinculoOtroEl.style.display = 'none';
        });
    }

    async function buscarPaciente() {
        const query = searchQuery.value.trim();
        if (!query) {
            limpiarResultados();
            listadoResultadosDiv.innerHTML = '';
            infoPacienteDiv.innerHTML = '<p style="color: red;">Debe ingresar un DNI o un Nombre.</p>';
            return;
        }
        // Buscar paciente exacto (DNI o nombre completo)
        let url = `/api/buscar-paciente?query=${encodeURIComponent(query)}`;
        try {
            const response = await fetchAPI(url); 
            mostrarResultados(response);
        } catch (error) {
            limpiarResultados();
            infoPacienteDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }

    // Nueva función: buscar por fragmentos y mostrar listado
    async function buscarFragmentos(valor) {
        const termino = valor ? valor.trim() : '';
        if (!termino || termino.length < 3) {
            listadoResultadosDiv.innerHTML = '';
            return;
        }
        // Si parece un DNI completo, esperar la búsqueda manual
        if (/^\d{7,}$/.test(termino)) {
            listadoResultadosDiv.innerHTML = '';
            return;
        }
        try {
            const url = `/api/buscar-pacientes-fragmento?query=${encodeURIComponent(termino)}`;
            const resultados = await fetchAPI(url);
            if (Array.isArray(resultados) && resultados.length > 0) {
                let html = '<ul class="listado-pacientes">';
                resultados.forEach(p => {
                    html += `<li><button class="btn-seleccionar-paciente" data-dni="${p.dni}">${p.dni} - ${p.nombre}</button></li>`;
                });
                html += '</ul>';
                listadoResultadosDiv.innerHTML = html;
                document.querySelectorAll('.btn-seleccionar-paciente').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        searchQuery.value = btn.dataset.dni;
                        listadoResultadosDiv.innerHTML = '';
                        if (btnBuscar) btnBuscar.disabled = searchQuery.value.trim().length === 0;
                        await buscarPaciente();
                    });
                });
            } else {
                listadoResultadosDiv.innerHTML = '';
            }
        } catch (error) {
            listadoResultadosDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }

    function limpiarBusqueda() {
        searchQuery.value = '';
        limpiarResultados();
        listadoResultadosDiv.innerHTML = '';
        if (btnBuscar) btnBuscar.disabled = true;
    }

    // =================================================================
    // === FUNCIÓN MODIFICADA PARA OPCIÓN 2 (GRID 2 COLUMNAS) ===
    // =================================================================
    function mostrarResultados(data) {

        // --- Formateo de DNI (solo valor, mayúsculas, sin puntos ni espacios, con prefijo si existe) ---
        function formatDNI(dni) {
            if (!dni) return '-';
            let val = String(dni).replace(/\./g, '').replace(/\s+/g, '');
            if (/^[a-zA-Z]/.test(val)) {
                val = val.charAt(0).toUpperCase() + val.slice(1);
            }
            return val.toUpperCase();
        }

        // --- Ficha/documentación ---
        let fichaHtml = '<span style="color:#888">Cargando...</span>';

        // --- Lógica de cálculo movida ---
        let edadText = '';
        if (data.fecha_nacimiento) {
            const hoy = new Date();
            const fnac = new Date(data.fecha_nacimiento);
            let edad = hoy.getFullYear() - fnac.getFullYear();
            const m = hoy.getMonth() - fnac.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fnac.getDate())) {
                edad--;
            }
            edadText = `${edad} años`;
        }

        let botonEliminarPaciente = '';
        if (currentUser.rol === 'administrativo') {
            botonEliminarPaciente = `
                <button id="btn-eliminar-paciente" data-dni="${formatDNI(data.dni)}" class="icon-btn-eliminar" title="Eliminar paciente" aria-label="Eliminar paciente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            `;
        }

        // Renderizar como tarjeta tipo "carnet" con columnas y campos normalizados en forma oración
        const sexoText = data.sexo ? sentenceCase(data.sexo) : '';
        const condicionText = data.condicion ? sentenceCase(data.condicion) : '';
        const telefonoText = data.telefono || '';
        const direccionText = data.direccion ? sentenceCase(data.direccion) : '';
        const localidadText = data.localidad ? sentenceCase(data.localidad) : '';
        const tipoAfiliadoText = data.tipo_afiliado ? sentenceCase(data.tipo_afiliado) : '';
        const vinculoText = data.vinculo_titular ? sentenceCase(data.vinculo_titular) : '';
        const observacionesText = data.observaciones ? sentenceCase(data.observaciones) : '';

        // Use titleCase for names
        const nombreTitle = titleCase(data.nombre) || '';
        const titularNombreTitle = data.titular_nombre ? titleCase(data.titular_nombre) : '';

        // --- Variables de formato (NUEVO) ---
        const fechaNacText = formatDisplayDate(data.fecha_nacimiento);
        const titularText = titularNombreTitle ? `${titularNombreTitle} (${formatDNI(data.titular_dni) || ''})` : '';
        
        // Determinar si mostrar el campo Titular (solo para ADHERENTE)
        const esTitular = data.tipo_afiliado && data.tipo_afiliado.toUpperCase() === 'TITULAR';
        const mostrarTitular = !esTitular && titularText;

        // --- HTML MODIFICADO (cumple requisitos de layout y visual) ---
        infoPacienteDiv.innerHTML = `
            <div class="patient-card">
                <div class="patient-card-header">
                    <div class="patient-card-title">
                        <div class="patient-name">${nombreTitle}</div>
                        <div class="patient-dni">${formatDNI(data.dni)}</div>
                    </div>
                    <div class="patient-card-logo-container">
                        <img src="Logo.png" alt="Logo institucional" class="patient-card-logo" draggable="false" />
                    </div>
                </div>
                <hr class="patient-card-header-separator" />
                <div class="patient-card-grid-body">
                    <div class="grid-item"><span class="label">Sexo:</span><span class="value">${sexoText}</span></div>
                    <div class="grid-item"><span class="label">Fecha de Nacimiento:</span><span class="value">${fechaNacText}</span></div>
                    <div class="grid-item"><span class="label">Edad:</span><span class="value">${edadText}</span></div>
                    <div class="grid-item"><span class="label">Condición:</span><span class="value">${condicionText}</span></div>
                    <div class="grid-item"><span class="label">Teléfono:</span><span class="value">${telefonoText}</span></div>
                    <div class="grid-item"><span class="label">Dirección:</span><span class="value">${direccionText}</span></div>
                    <div class="grid-item"><span class="label">Localidad:</span><span class="value">${localidadText}</span></div>
                    <div class="grid-item"><span class="label">Tipo de Afiliado:</span><span class="value">${tipoAfiliadoText}</span></div>
                    ${!esTitular ? `<div class="grid-item"><span class="label">Parentesco:</span><span class="value">${vinculoText}</span></div>` : ''}
                    ${mostrarTitular ? `<div class="grid-item"><span class="label">Titular:</span><span class="value">${titularText}</span></div>` : ''}
                </div>
                <div class="patient-card-footer patient-card-footer-actions">
                    <div class="grid-item-fullwidth divider-top">
                        <span class="label">Observaciones:</span>
                        <span class="value">${observacionesText}</span>
                    </div>
                    <div class="footer-actions-row">
                        <div class="footer-link" id="ficha-documentos-container">${fichaHtml}</div>
                        <div class="footer-print-delete">
                            <button class="icon-btn-print-ficha" id="btn-imprimir-ficha" title="Imprimir ficha" aria-label="Imprimir ficha">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                            </button>
                            ${botonEliminarPaciente}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Vincular botón de imprimir (abre diálogo nativo con vista previa)
        const btnImprimir = document.getElementById('btn-imprimir-ficha');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', function (e) {
                e.preventDefault();
                printPatientCard();
            });
        }

        if (currentUser.rol === 'administrativo') {
            const btnEliminar = document.getElementById('btn-eliminar-paciente');
            if(btnEliminar) {
                btnEliminar.addEventListener('click', () => {
                    mostrarModalAccion({
                        titulo: 'Eliminar Paciente',
                        mensaje: `¿Seguro que desea eliminar al paciente ${data.nombre}? Esta acción borrará todo su historial y ficha y no se puede deshacer.`,
                        textoAccion: 'Eliminar',
                        onConfirm: () => eliminarPaciente(data.dni)
                    });
                });
            }
        }

        // Cargar archivos adjuntos del paciente para el botón "Ver ficha/documentos"
        // El botón siempre se muestra, incluso sin archivos
        const fichaElement = document.getElementById('ficha-documentos-container');
        if (fichaElement) {
            // Mostrar botón inicial
            const btnAbrir = document.createElement('button');
            btnAbrir.type = 'button';
            btnAbrir.className = 'ver-ficha-link';
            btnAbrir.textContent = 'Ver ficha/documentos';
            btnAbrir.style.cssText = 'background: none; border: none; color: #1976D2; text-decoration: underline; cursor: pointer; font-size: inherit; padding: 0;';
            btnAbrir.disabled = true;
            btnAbrir.style.opacity = '0.5';
            fichaElement.innerHTML = '';
            fichaElement.appendChild(btnAbrir);
            
            // Cargar archivos asíncronamente
            fetch(`/api/paciente/${data.dni}/archivos`)
                .then(response => response.ok ? response.json() : [])
                .then(archivos => {
                    if (archivos.length === 0) {
                        btnAbrir.textContent = 'Ver ficha/documentos (sin archivos)';
                        btnAbrir.disabled = true;
                        btnAbrir.style.opacity = '0.5';
                        btnAbrir.style.cursor = 'not-allowed';
                    } else if (archivos.length === 1) {
                        // Si hay solo 1 archivo, abrir directamente
                        btnAbrir.textContent = `Ver ficha/documentos (1)`;
                        btnAbrir.disabled = false;
                        btnAbrir.style.opacity = '1';
                        btnAbrir.style.cursor = 'pointer';
                        btnAbrir.onclick = function() {
                            const archivo = archivos[0];
                            const esURLExterna = archivo.ruta_archivo.startsWith('http://') || archivo.ruta_archivo.startsWith('https://');
                            const url = esURLExterna ? archivo.ruta_archivo : `/uploads/${archivo.ruta_archivo.split(/[/\\]/).pop()}`;
                            window.open(url, '_blank');
                        };
                    } else {
                        // Si hay 2 o más archivos, mostrar lista desplegable
                        btnAbrir.textContent = `Ver ficha/documentos (${archivos.length})`;
                        btnAbrir.disabled = false;
                        btnAbrir.style.opacity = '1';
                        btnAbrir.style.cursor = 'pointer';
                        
                        // Crear contenedor para la lista desplegable con estilo moderno
                        const listaContainer = document.createElement('div');
                        listaContainer.style.cssText = 'display: none; margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border: 1px solid #b8c6db; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
                        
                        // Crear lista de archivos
                        const lista = document.createElement('ul');
                        lista.style.cssText = 'list-style: none; padding: 0; margin: 0;';
                        
                        archivos.forEach((archivo, idx) => {
                            const li = document.createElement('li');
                            li.style.cssText = 'margin-bottom: 8px; padding: 8px 12px; background: white; border-radius: 6px; transition: all 0.2s ease;';
                            li.onmouseover = function() { this.style.background = '#e3f2fd'; this.style.transform = 'translateX(4px)'; };
                            li.onmouseout = function() { this.style.background = 'white'; this.style.transform = 'translateX(0)'; };
                            
                            const link = document.createElement('a');
                            
                            // Detectar si es URL externa (Google Drive) o archivo local
                            const esURLExterna = archivo.ruta_archivo.startsWith('http://') || archivo.ruta_archivo.startsWith('https://');
                            
                            if (esURLExterna) {
                                link.href = archivo.ruta_archivo;
                            } else {
                                const nombreArchivo = archivo.ruta_archivo.split(/[/\\]/).pop();
                                link.href = `/uploads/${nombreArchivo}`;
                            }
                            
                            link.target = '_blank';
                            link.textContent = `📄 ${archivo.nombre_archivo}`;
                            link.style.cssText = 'color: #1976D2; text-decoration: none; display: flex; align-items: center; gap: 8px; font-weight: 500;';
                            link.onmouseover = function() { this.style.textDecoration = 'underline'; };
                            link.onmouseout = function() { this.style.textDecoration = 'none'; };
                            
                            li.appendChild(link);
                            lista.appendChild(li);
                        });
                        
                        listaContainer.appendChild(lista);
                        fichaElement.appendChild(listaContainer);
                        
                        // Toggle al hacer clic en el botón
                        let desplegado = false;
                        btnAbrir.onclick = function() {
                            desplegado = !desplegado;
                            listaContainer.style.display = desplegado ? 'block' : 'none';
                            btnAbrir.textContent = desplegado 
                                ? `▼ Ocultar documentos (${archivos.length})`
                                : `Ver ficha/documentos (${archivos.length})`;
                        };
                    }
                })
                .catch(error => {
                    console.error('Error al cargar archivos:', error);
                    btnAbrir.textContent = 'Ver ficha/documentos (error)';
                    btnAbrir.disabled = true;
                    btnAbrir.style.opacity = '0.5';
                });
        }

        if (data.prestaciones && data.prestaciones.length > 0) {
            let tablaHtml = `
                <div class="prestaciones-header">
                    <h4>Historial de Prestaciones</h4>
                    <button class="icon-btn-print-ficha" id="btn-imprimir-historial" title="Imprimir historial" aria-label="Imprimir historial">
                        <!-- Mismo SVG que el botón de imprimir ficha -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>
                </div>
                <table class="tabla-prestaciones" id="tabla-historial-prestaciones">
                    <thead>
                        <tr>
                            <th class="col-fecha">Fecha</th>
                            <th class="col-prestador">Prestador</th>
                            <th class="col-prestacion">Prestación</th>
                            ${currentUser.rol === 'administrativo' ? '<th class="col-acciones">Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
            `;
            // Ordenar por fecha descendente (más nueva primero)
            data.prestaciones.sort((a, b) => {
                // Convertir fechas a formato comparable (YYYY-MM-DD preferido, si no, DD/MM/YYYY)
                const parseFecha = f => {
                    if (!f) return 0;
                    if (/^\d{4}-\d{2}-\d{2}/.test(f)) return new Date(f).getTime();
                    if (/^\d{2}\/\d{2}\/\d{4}/.test(f)) {
                        const [d, m, y] = f.split('/');
                        return new Date(`${y}-${m}-${d}`).getTime();
                    }
                    return new Date(f).getTime();
                };
                return parseFecha(b.fecha) - parseFecha(a.fecha);
            });
            data.prestaciones.forEach(p => {
                const columnaAccion = currentUser.rol === 'administrativo'
                    ? `<td class="col-acciones">
                        <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 5px;">
                            <button class="icon-btn-prestacion icon-btn-editar-prestacion" title="Editar prestación" data-id="${p.id}">
                                <!-- SVG lápiz realista proporcionado por el usuario -->
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="rotate(45 24 24)" stroke-linejoin="round" stroke-linecap="round">
                                        <path d="M 19 8 A 3 3 0 0 1 25 8 L 25 14 L 19 14 Z" fill="#f8b4c8" stroke="#e57373" stroke-width="1.5"/>
                                        <rect x="19" y="14" width="6" height="4" fill="#bdbdbd" stroke="#757575" stroke-width="1.2"/>
                                        <rect x="19" y="18" width="6" height="20" fill="#ffe082" stroke="#fbc02d" stroke-width="1.7"/>
                                        <polygon points="19,38 25,38 22,44" fill="#e0b97d" stroke="#b8860b" stroke-width="1.2"/>
                                        <polygon points="21,43 23,43 22,46" fill="#616161" stroke="#424242" stroke-width="0.9"/>
                                    </g>
                                </svg>
                            </button>
                            <button class="icon-btn-prestacion icon-btn-eliminar-prestacion" title="Eliminar prestación" data-id="${p.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </button>
                        </div>
                    </td>`
                    : '';

                // Tooltip para prestador
                let prestadorTooltip = '';
                if (typeof EFECTORES_DICT === 'object' && EFECTORES_DICT) {
                    // Buscar por variante
                    let prestadorVal = (p.prestador || '').trim().toUpperCase();
                    let match = null;
                    for (const [nombre, obj] of Object.entries(EFECTORES_DICT)) {
                        if (obj.variantes.some(v => v.toUpperCase() === prestadorVal)) {
                            match = nombre;
                            break;
                        }
                    }
                    if (match && EFECTORES_DICT[match].tooltip) {
                        prestadorTooltip = EFECTORES_DICT[match].tooltip;
                    }
                }
                tablaHtml += `
                    <tr data-prestacion-id="${p.id}">
                        <td class="col-fecha">${p.fecha || ''}</td>
                        <td class="col-prestador"${prestadorTooltip ? ` title="${prestadorTooltip.replace(/"/g, '&quot;')}"` : ''}>${p.prestador || ''}</td>
                        <td class="col-prestacion">${(Array.isArray(p.prestacion) ? p.prestacion : String(p.prestacion).split(/\n|\r|<br\s*\/?/)).filter(x=>x).map(item => `<div class='prestacion-item'>${item}</div>`).join('')}</td>
                        ${columnaAccion}
                    </tr>
                `;
            });
            tablaHtml += '</tbody></table>';
            listaPrestacionesDiv.innerHTML = tablaHtml;

            // Vincular botón de imprimir historial (idéntico comportamiento al de ficha, pero solo la tabla)
            const btnImprimirHist = document.getElementById('btn-imprimir-historial');
            if (btnImprimirHist) {
                btnImprimirHist.addEventListener('click', function(e) {
                    e.preventDefault();
                    printPrestacionesTable();
                });
            }

            // Asignar evento a los botones eliminar prestación
            document.querySelectorAll('.icon-btn-eliminar-prestacion').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const fila = btn.closest('tr');
                    const id = btn.dataset.id;
                    mostrarModalAccion({
                        titulo: 'Eliminar Prestación',
                        mensaje: '¿Seguro que desea eliminar esta prestación? Esta acción no se puede deshacer.',
                        textoAccion: 'Eliminar',
                        onConfirm: async () => {
                            // --- INICIO: Desactivar Botón (Estilo de CSS) ---
                            const btnEliminar = btn;
                            const btnGuardar = btn.previousElementSibling;
                            btnEliminar.disabled = true;
                            if (btnGuardar) btnGuardar.disabled = true; // Desactivar también el de guardar
                            // --- FIN: Desactivar Botón ---
                            try {
                                await fetchAPI(`/api/prestacion/${id}`, { method: 'DELETE' });
                                mostrarModalAviso({
                                    titulo: 'Prestación Eliminada',
                                    mensaje: 'La prestación fue eliminada correctamente.'
                                });
                                if (typeof buscarPaciente === 'function') {
                                    await buscarPaciente();
                                }
                            } catch (error) {
                                // --- INICIO: Restaurar Botón (en caso de error) ---
                                btnEliminar.disabled = false;
                                if (btnGuardar) btnGuardar.disabled = false;
                                // --- FIN: Restaurar Botón ---
                                mostrarModalAviso({
                                    titulo: 'Error',
                                    mensaje: `Error al eliminar: ${error.message}`
                                });
                            }
                        }
                    });
                });
            });

            // Asignar evento a los botones editar prestación
            document.querySelectorAll('.icon-btn-editar-prestacion').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const fila = btn.closest('tr');
                    if (!fila) return;
                    // Evitar múltiples ediciones simultáneas, pero permitir si la fila actual no está editando
                    const editando = document.querySelector('.prestacion-editando');
                    if (editando && editando !== fila) return;
                    fila.classList.add('editando');
                    // Guardar valores originales
                    const tds = fila.querySelectorAll('td');
                    const original = Array.from(tds).map(td => td.innerHTML);
                    const id = btn.dataset.id;
                    // Obtener valores actuales
                    const valFecha = tds[0].textContent.trim();
                    const valPrestador = tds[1].textContent.trim();
                    const valPrestacion = tds[2].textContent.trim();
                    // Reemplazar por inputs
                    tds[0].innerHTML = '';
                    const inputFecha = document.createElement('input');
                    inputFecha.type = 'date';
                    inputFecha.value = formatearFechaInput(valFecha);
                    inputFecha.className = 'combo-prestador-input';
                    tds[0].appendChild(inputFecha);

                    tds[1].innerHTML = `
                        <div class="combo-prestador" style="position:relative;">
                            <input type="text" value="${valPrestador}" autocomplete="off" class="combo-prestador-input">
                            <button type="button" tabindex="-1" class="combo-prestador-btn" aria-label="Mostrar opciones" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; padding:0;">
                                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill="#666"/></svg>
                            </button>
                            <ul class="combo-prestador-list" style="display:none; position:absolute; left:0; right:0; top:110%; z-index:10; background:#fff; border:1px solid #ccc; border-radius:0 0 8px 8px; max-height:160px; overflow-y:auto; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin:0; padding:0; list-style:none;"></ul>
                        </div>
                    `;

                    // El input de prestación ya se crea correctamente con la clase combo-prestador-input más arriba, no sobrescribirlo aquí
                    // Activar combo custom prestador
                    const combo = tds[1].querySelector('.combo-prestador');
                    if (combo) {
                        const input = combo.querySelector('input');
                        const list = combo.querySelector('ul');
                        const btn = combo.querySelector('button');
                        crearComboPrestador(input, list, btn);
                    }
                    tds[2].innerHTML = `<input type="text" value="${valPrestacion}" style="width: 98%;">`;
                    // Si no existe el datalist en el DOM, agregarlo (por si la tabla está fuera del form)
                    if (!document.getElementById('efectores-list')) {
                        const datalist = document.createElement('datalist');
                        datalist.id = 'efectores-list';
                        datalist.innerHTML = `
                            <option value="HIBA">
                            <option value="GÜEMES">
                            <option value="FAVALORO">
                            <option value="AUSTRAL">
                            <option value="FLENI">
                            <option value="GARRAHAN">
                            <option value="ZAMBRANO">
                            <option value="SUIZO ARGENTINO">
                        `;
                        document.body.appendChild(datalist);
                    }
                    // Acciones: guardar/cancelar
                    if (tds[3]) {
                        tds[3].innerHTML = `
                            <button class="icon-btn-prestacion btn-guardar-prestacion" title="Guardar" style="color: #28a745; font-size: 1.2em; margin-right: 4px;">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                            <button class="icon-btn-prestacion btn-cancelar-prestacion" title="Cancelar" style="color: #dc3545; font-size: 1.2em;">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        `;
                        // Guardar
                        tds[3].querySelector('.btn-guardar-prestacion').addEventListener('click', async (clickEvent) => {
                            // --- INICIO: Spinner en Botón ---
                            const button = clickEvent.currentTarget;
                            const originalIcon = button.innerHTML;
                            button.disabled = true;
                            button.innerHTML = '...'; // Spinner simple para botón de tabla
                            // --- FIN: Spinner en Botón ---
                            const nuevaFecha = tds[0].querySelector('input').value;
                            const nuevoPrestador = tds[1].querySelector('input').value.trim();
                            // Normalizar prestación a modo oración antes de guardar
                            const nuevaPrestacion = sentenceCase(tds[2].querySelector('input').value.trim());
                            try {
                                await fetchAPI(`/api/prestacion/${id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        fecha: nuevaFecha,
                                        prestador: nuevoPrestador,
                                        prestacion: nuevaPrestacion
                                    })
                                });
                                mostrarModalAviso({
                                    titulo: 'Prestación Editada',
                                    mensaje: 'La prestación fue actualizada correctamente.'
                                });
                                if (typeof buscarPaciente === 'function') {
                                    await buscarPaciente();
                                }
                            } catch (error) {
                                mostrarModalAviso({
                                    titulo: 'Error',
                                    mensaje: `Error al editar: ${error.message}`
                                });
                            } finally {
                                // --- INICIO: Restaurar Botón ---
                                button.disabled = false;
                                button.innerHTML = originalIcon;
                                // --- FIN: Restaurar Botón ---
                            }
                        });
                        // Cancelar
                        tds[3].querySelector('.btn-cancelar-prestacion').addEventListener('click', () => {
                            tds.forEach((td, i) => td.innerHTML = original[i]);
                            fila.classList.remove('prestacion-editando');
                            if (typeof buscarPaciente === 'function') {
                                buscarPaciente();
                            }
                        });
                    }
                });
            });

            // Helpers para fechas
            function formatearFechaInput(fecha) {
                // De DD/MM/AAAA a AAAA-MM-DD
                if (!fecha || fecha.length < 8) return '';
                const partes = fecha.split('/');
                if (partes.length === 3) return `${partes[2]}-${partes[1].padStart(2,'0')}-${partes[0].padStart(2,'0')}`;
                return fecha;
            }
            function formatearFechaVisual(fecha) {
                // De AAAA-MM-DD a DD/MM/AAAA
                if (!fecha || fecha.length < 8) return '';
                const partes = fecha.split('-');
                if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
                return fecha;
            }
        } else {
            listaPrestacionesDiv.innerHTML = '<p>No se encontraron prestaciones.</p>';
        }
    }
    // =================================================================
    // === FIN DE LA FUNCIÓN MODIFICADA ===
    // =================================================================
    
    function limpiarResultados() {
    infoPacienteDiv.innerHTML = '';
    listaPrestacionesDiv.innerHTML = '';
    }

    // --- 4. FUNCIONES DE CARGA (Admin) ---

    async function guardarNuevoPaciente(e) {
        e.preventDefault();
        const btn = e.submitter;
        if (!btn) return;
        const originalBtnHTML = btn.innerHTML;
        const form = e.target;
        // Validación completa y ordenada de todos los campos del formulario
        const faltantes = [];
        // 1. DNI
        const dni = document.getElementById('new-dni');
        if (!dni || !dni.value.trim()) faltantes.push('DNI');
        // 2. Apellido y Nombre
        const nombre = document.getElementById('new-nombre');
        if (!nombre || !nombre.value.trim()) faltantes.push('Apellido y Nombre');
        // 3. Sexo
        const sexo = document.getElementById('new-sexo');
        if (!sexo || !sexo.value) faltantes.push('Sexo');
        // 4. Fecha de Nacimiento (agrupada)
        const diaEl = document.getElementById('new-fecha-dia');
        const mesEl = document.getElementById('new-fecha-mes');
        const anioEl = document.getElementById('new-fecha-anio');
        const dia = diaEl ? diaEl.value.trim() : '';
        const mes = mesEl ? mesEl.value.trim() : '';
        const anio = anioEl ? anioEl.value.trim() : '';
        if (!dia || !mes || !anio) faltantes.push('Fecha de Nacimiento');
        // 5. Condición
        const condicion = document.getElementById('new-condicion');
        if (!condicion || !condicion.value) faltantes.push('Condición');
        // 6. Teléfono
        const telefono = document.getElementById('new-telefono');
        if (!telefono || !telefono.value.trim()) faltantes.push('Teléfono');
        // 7. Dirección
        const direccion = document.getElementById('new-direccion');
        if (!direccion || !direccion.value.trim()) faltantes.push('Dirección');
        // 8. Localidad
        const localidad = document.getElementById('new-localidad');
        if (!localidad || !localidad.value.trim()) faltantes.push('Localidad');
        // 9. Tipo de Afiliado
        const tipoAfiliado = document.getElementById('new-tipo-afiliado');
        if (!tipoAfiliado || !tipoAfiliado.value) faltantes.push('Tipo de Afiliado');
        // Si es Adherente, validar campos de titular y parentesco
        if (tipoAfiliado && tipoAfiliado.value === 'Adherente') {
            // Parentesco
            const vinculo = document.getElementById('new-vinculo-titular');
            if (!vinculo || !vinculo.value) faltantes.push('Parentesco');
            if (vinculo && vinculo.value === 'Otro') {
                const vinculoOtro = document.getElementById('new-vinculo-otro');
                if (!vinculoOtro || !vinculoOtro.value.trim()) faltantes.push('Parentesco (especificar)');
            }
            // Nombre y Apellido Titular
            const titularNombre = document.getElementById('new-titular-nombre');
            if (!titularNombre || !titularNombre.value.trim()) faltantes.push('Nombre y Apellido Titular');
            // DNI Titular
            const titularDni = document.getElementById('new-titular-dni');
            if (!titularDni || !titularDni.value.trim()) faltantes.push('DNI Titular');
        }
        // 13. Observaciones (NO obligatorio)
        // 14. Archivos adjuntos (NO obligatorio)

        if (faltantes.length > 0) {
            // LLAMADA CORREGIDA: Usa la función local definida en DOMContentLoaded
            mostrarModalConfirmacionCampos({
                titulo: 'Campos incompletos',
                mensaje: 'Faltan completar campos. ¿Desea guardar igual?',
                soloVolver: false, // Asegura que muestre ambos botones
                onGuardar: async () => {
                    btn.disabled = true;
                    btn.innerHTML = spinnerHTML;
                    await guardarPacienteNuevoFinal(form, btn, originalBtnHTML);
                },
                onCancelar: () => {
                    // No hacer nada, solo cerrar el modal
                }
            });
            return;
        }
        btn.disabled = true;
        btn.innerHTML = spinnerHTML;
        await guardarPacienteNuevoFinal(form, btn, originalBtnHTML);
    }

    async function guardarPacienteNuevoFinal(form, btn, originalBtnHTML) {
        const formData = new FormData(form);
        // Lógica de fecha
        const fechaFormateada = getFormattedDate('new-fecha-dia', 'new-fecha-mes', 'new-fecha-anio');
        if (fechaFormateada) {
            formData.set('fecha_nacimiento', fechaFormateada);
        }
        formData.delete('fecha_dia');
        formData.delete('fecha_mes');
        formData.delete('fecha_anio');
        // Archivos
        const archivos = window.obtenerArchivosAdjuntos('campos-archivos-adjuntos');
        archivos.forEach(archivo => {
            formData.append('archivos', archivo);
        });
        try {
            const response = await fetch('/api/nuevo-paciente', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al crear paciente');
            }
            mostrarModalAviso({
                titulo: 'Paciente Agregado',
                mensaje: data.message
            });
            form.reset();
            const detailsNuevoPaciente = form.closest('details.sub-details');
            if (detailsNuevoPaciente) detailsNuevoPaciente.open = false;
            const searchQuery = document.getElementById('search-query');
            if (searchQuery) {
                searchQuery.value = formData.get('dni');
                await buscarPaciente();
            }
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: error.message
            });
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnHTML;
        }
    }


    async function guardarNuevaPrestacion(e) {
    e.preventDefault();
    const btn = e.submitter;
    if (!btn) return;
    const originalBtnHTML = btn.innerHTML;
    // --- SPINNER ELIMINADO DE AQUÍ ---
    const form = e.target;
        const formData = new FormData(form);
        const dni = formData.get('prest-dni');
        const prestadorUnico = formData.get('prest-prestador');
        const descripciones = formData.getAll('prestacion[]');

        // Validación estricta de todos los campos
        const faltantes = [];
        if (!dni || dni.trim() === "") faltantes.push("DNI del Paciente");
        if (!prestadorUnico || prestadorUnico.trim() === "") faltantes.push("Prestador");
        // Fecha agrupada
        const dia = form.querySelector('#prest-fecha-dia')?.value.trim();
        const mes = form.querySelector('#prest-fecha-mes')?.value.trim();
        const anio = form.querySelector('#prest-fecha-anio')?.value.trim();
        if (!dia || !mes || !anio) faltantes.push("Fecha de la Prestación");
        // Al menos una descripción
        if (!descripciones || descripciones.length === 0 || descripciones[0].trim() === "") faltantes.push("Descripción de Prestación");

        if (faltantes.length > 0) {
            mostrarModalConfirmacionCampos({
                titulo: 'Campos incompletos',
                mensaje: 'Faltan completar los siguientes campos:<br><ul>' + faltantes.map(f => `<li>${f}</li>`).join('') + '</ul>No se puede guardar hasta completar todos los campos.',
                soloVolver: true,
                onGuardar: () => {},
                onCancelar: () => {}
            });
            return;
        }
        // --- SPINNER MOVIDO AQUÍ ---
        btn.disabled = true;
        btn.innerHTML = spinnerHTML;
        // --- FIN SPINNER ---
        // --- FIN validación estricta ---
        const fechaFormateada = getFormattedDate('prest-fecha-dia', 'prest-fecha-mes', 'prest-fecha-anio');

        // Re-mapear para el backend
        const prestaciones = descripciones.map(desc => {
            return {
                fecha: fechaFormateada,
                descripcion: desc
            };
        });

        try {
            const response = await fetch('/api/nueva-prestacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paciente_dni: dni,
                    fecha: fechaFormateada,
                    prestador: prestadorUnico,
                    prestaciones: prestaciones
                })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al guardar prestación');
            }
            
            mostrarModalAviso({
                titulo: 'Prestaciones Guardadas',
                mensaje: 'Prestaciones guardadas correctamente.'
            });
            form.reset();
            // Refrescar la búsqueda del paciente para actualizar la tabla
            const searchQuery = document.getElementById('search-query');
            if (searchQuery) {
                searchQuery.value = dni;
                await buscarPaciente();
            }
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: error.message
            });
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnHTML;
        }
    }
    
    // --- 5. FUNCIONES DE ELIMINACIÓN (Admin) ---

    listaPrestacionesDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar-prestacion')) {
            const id = e.target.dataset.id;
            const fila = e.target.closest('tr');
            mostrarModalAccion({
                titulo: 'Eliminar Prestación',
                mensaje: '¿Seguro que desea eliminar esta prestación? Esta acción no se puede deshacer.',
                textoAccion: 'Eliminar',
                onConfirm: () => eliminarPrestacion(id, fila)
            });
        }
    });

    async function eliminarPaciente(dni) {
        try {
            const response = await fetchAPI(`/api/paciente/${dni}`, { method: 'DELETE' });
            limpiarResultados();
            searchQuery.value = '';
            mostrarModalAviso({
                titulo: 'Paciente Eliminado',
                mensaje: response.message
            });
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: `Error: ${error.message}`
            });
        }
    }

    async function eliminarPrestacion(id, filaElement) {
        try {
            await fetchAPI(`/api/prestacion/${id}`, { method: 'DELETE' });
            filaElement.remove();
            mostrarModalAviso({
                titulo: 'Prestación Eliminada',
                mensaje: 'La prestación fue eliminada correctamente.'
            });
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: `Error: ${error.message}`
            });
        }
    }
    
    // --- 6. FUNCIONES DE AUTENTICACIÓN Y TEMA ---

    btnLogout.addEventListener('click', async () => {
        try {
            await fetch('/api/logout');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });

    formCambiarPass.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass1 = document.getElementById('nueva-contrasena').value;
        const pass2 = document.getElementById('nueva-contrasena2').value;

        if (pass1 !== pass2) {
            mostrarAlerta('alerta-cambiar-pass', 'error', 'Las contraseñas no coinciden.');
            return;
        }
        try {
            await fetchAPI('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nueva_contrasena: pass1 })
            });
            mostrarModalAviso({
                titulo: 'Contraseña Actualizada',
                mensaje: 'Contraseña actualizada. La aplicación se recargará.',
                onClose: () => window.location.reload()
            });
        } catch (error) {
           
            mostrarAlerta('alerta-cambiar-pass', 'error', `Error: ${error.message}`);
        }
    });
    
    themeSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const theme = e.target.dataset.theme;
            // Mantener la clase de rol si existe
            const rolClass = Array.from(document.body.classList).find(c => c.startsWith('rol-'));
            if (rolClass) {
                document.body.className = theme + ' ' + rolClass;
            } else {
                document.body.className = theme;
            }
            localStorage.setItem('appTheme', theme);
            
            // Actualizar visualización de modales abiertos si los hay
            actualizarModalesAbiertos();
        }
    });
    
    /**
     * Actualiza la visualización de modales abiertos al cambiar el tema
     * Los modales heredan automáticamente los estilos del tema activo
     */
    function actualizarModalesAbiertos() {
        // Los modales ya heredan los estilos del tema a través de CSS
        // Esta función se puede extender si se necesita lógica adicional
        const modalesAbiertos = document.querySelectorAll('.modal-backdrop[style*="flex"]');
        modalesAbiertos.forEach(modal => {
            // Forzar re-render si es necesario
            modal.style.display = 'flex';
        });
    }

    // --- 7. FUNCIONES DE PANEL DE ADMIN ---

    async function cargarListaUsuariosAdmin() {
        try {
            const usuarios = await fetchAPI('/api/admin/users');
            
            if (usuarios.length === 0) {
                listaUsuariosAdminDiv.innerHTML = '<p>No hay otros usuarios registrados.</p>';
                return;
            }

            let tablaHtml = `
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            usuarios.forEach(u => {
                const rolHtml = (u.usuario === currentUser.usuario) ? u.rol : `
                    <select class="select-rol" data-usuario="${u.usuario}">
                        <option value="administrativo" ${u.rol === 'administrativo' ? 'selected' : ''}>Administrativo</option>
                        <option value="auditor" ${u.rol === 'auditor' ? 'selected' : ''}>Auditor</option>
                    </select>
                `;

                tablaHtml += `
                    <tr data-usuario-fila="${u.usuario}">
                        <td>${u.usuario}</td>
                        <td>${rolHtml}</td>
                        <td class="admin-actions">
                            <button class="btn-eliminar btn-reset-pass" data-usuario="${u.usuario}">Resetear Pass</button>
                            <button class="btn-eliminar btn-eliminar-usuario" data-usuario="${u.usuario}">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
            tablaHtml += '</tbody></table>';
            listaUsuariosAdminDiv.innerHTML = tablaHtml;
            
        } catch (error) {
            listaUsuariosAdminDiv.innerHTML = `<p style="color: red;">Error al cargar usuarios: ${error.message}</p>`;
        }
    }
    
    listaUsuariosAdminDiv.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.classList.contains('btn-reset-pass')) {
            const usuario = target.dataset.usuario;
            mostrarModalAccion({
                titulo: 'Resetear Contraseña',
                mensaje: `¿Seguro que desea resetear la contraseña de ${usuario}? La nueva contraseña será '111111'.`,
                textoAccion: 'Resetear',
                onConfirm: () => resetearPasswordAdmin(usuario)
            });
        }
        
        if (target.classList.contains('btn-eliminar-usuario')) {
            const usuario = target.dataset.usuario;
            mostrarModalAccion({
                titulo: 'Eliminar Usuario',
                mensaje: `¡ATENCIÓN! ¿Seguro que desea ELIMINAR PERMANENTEMENTE al usuario ${usuario}?`,
                textoAccion: 'Eliminar',
                onConfirm: () => eliminarUsuarioAdmin(usuario, target.closest('tr'))
            });
        }
    });

    listaUsuariosAdminDiv.addEventListener('change', (e) => {
        if (e.target.classList.contains('select-rol')) {
            const usuario = e.target.dataset.usuario;
            const nuevoRol = e.target.value;
            mostrarModalAccion({
                titulo: 'Cambiar Rol',
                mensaje: `¿Seguro que desea cambiar el rol de ${usuario} a ${nuevoRol}?`,
                textoAccion: 'Cambiar',
                onConfirm: () => cambiarRolAdmin(usuario, nuevoRol)
            });
        }
    });

    async function resetearPasswordAdmin(usuario) {
        try {
            const response = await fetchAPI('/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_a_resetear: usuario })
            });
            mostrarModalAviso({
                titulo: 'Contraseña Reseteada',
                mensaje: response.message
            });
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: error.message
            });
        }
    }

    async function eliminarUsuarioAdmin(usuario, filaElement) {
        try {
            const response = await fetchAPI(`/api/admin/user/${usuario}`, {
                method: 'DELETE'
            });
            filaElement.remove();
            mostrarModalAviso({
                titulo: 'Usuario Eliminado',
                mensaje: response.message
            });
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: `Error: ${error.message}`
            });
        }
    }

    async function cambiarRolAdmin(usuario, nuevoRol) {
        try {
            const response = await fetchAPI('/api/admin/change-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_a_cambiar: usuario, nuevo_rol: nuevoRol })
            });
            mostrarModalAviso({
                titulo: 'Rol Actualizado',
                mensaje: response.message,
                onClose: cargarListaUsuariosAdmin
            });
        } catch (error) {
            mostrarModalAviso({
                titulo: 'Error',
                mensaje: `Error: ${error.message}`,
                onClose: cargarListaUsuariosAdmin
            });
        }
    }


    // --- 8. FUNCIONES UTILITARIAS ---

    /**
     * Imprime la ficha del paciente en A4 (márgenes 2cm), B/N, con pie "Santa Fe, [fecha actual]".
     * Usa el diálogo estándar del navegador (vista previa incluida).
     */
    function printPatientCard() {
        try {
            const card = document.querySelector('#info-paciente .patient-card');
            if (!card) return;

            // Crear/actualizar el pie de impresión con la fecha actual (formato largo en español)
            const footerId = 'print-footer';
            let footer = document.getElementById(footerId);
            const fechaLarga = (() => {
                const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
                const d = new Date();
                return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
            })();
            if (!footer) {
                footer = document.createElement('div');
                footer.id = footerId;
                footer.className = 'print-footer';
                document.body.appendChild(footer);
            }
            footer.textContent = `Santa Fe, ${fechaLarga}`;

            // Limpiar el pie tras imprimir (compatibilidad: afterprint puede no disparar en algunos navegadores)
            const cleanup = () => {
                const f = document.getElementById(footerId);
                if (f) f.remove();
                window.removeEventListener('afterprint', cleanup);
            };
            window.addEventListener('afterprint', cleanup);

            // Abrir diálogo de impresión (incluye vista previa según navegador)
            window.print();

            // Fallback por si afterprint no se dispara (p.ej., Safari)
            setTimeout(() => {
                const f = document.getElementById(footerId);
                if (f && typeof window.matchMedia === 'function' && !window.matchMedia('print').matches) {
                    f.remove();
                }
            }, 1000);
        } catch (err) {
            console.error('Error al preparar la impresión:', err);
        }
    }

    function mostrarAlerta(idElemento, tipo, mensaje) {
        const alertaDiv = document.getElementById(idElemento);
        alertaDiv.className = `alerta ${tipo}`;
        alertaDiv.textContent = mensaje;
        alertaDiv.style.display = 'block';
        setTimeout(() => { alertaDiv.style.display = 'none'; }, 5000);
    }
    
    async function fetchAPI(url, options) {
        try {
            if (!options) options = {};
            options.credentials = 'same-origin';
            const response = await fetch(url, options);
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/login.html';
                throw new Error('Acceso denegado o sesión expirada.');
            }
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonErr) {
                throw new Error('Respuesta inesperada del servidor: ' + text);
            }
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Error desconocido');
            }
            return data;
        } catch (error) {
            console.error(`Error en fetchAPI (${url}):`, error);
            throw error;
        }
    }

// --- Lógica para mostrar/ocultar campos de titular según tipo de afiliado ---
function toggleCamposTitular(tipoAfiliado, scope) {
    // scope: 'nuevo' o 'editar'
    let grupoParentesco, grupoTitularNombre, grupoTitularDni;
    if (scope === 'nuevo') {
        grupoParentesco = document.getElementById('grupo-parentesco-nuevo');
        grupoTitularNombre = document.getElementById('grupo-titular-nombre-nuevo');
        grupoTitularDni = document.getElementById('grupo-titular-dni-nuevo');
    } else if (scope === 'editar') {
        grupoParentesco = document.getElementById('grupo-parentesco-editar');
        grupoTitularNombre = document.getElementById('grupo-titular-nombre-editar');
        grupoTitularDni = document.getElementById('grupo-titular-dni-editar');
    }
    if (!grupoParentesco || !grupoTitularNombre || !grupoTitularDni) return;
    if (tipoAfiliado === 'ADHERENTE') {
        grupoParentesco.style.display = '';
        grupoTitularNombre.style.display = '';
        grupoTitularDni.style.display = '';
    } else {
        grupoParentesco.style.display = 'none';
        grupoTitularNombre.style.display = 'none';
        grupoTitularDni.style.display = 'none';
    }
}

// --- Mostrar/ocultar campos de titular en ALTA de paciente ---
const newTipoAfiliadoEl = document.getElementById('new-tipo-afiliado');
if (newTipoAfiliadoEl) {
    newTipoAfiliadoEl.addEventListener('change', function() {
        toggleCamposTitular(this.value.trim().toUpperCase(), 'nuevo');
    });
    // Inicializar estado al cargar
    toggleCamposTitular(newTipoAfiliadoEl.value.trim().toUpperCase(), 'nuevo');
}

// --- Mostrar/ocultar campos de titular en EDICIÓN de paciente ---
// (esto debe ir dentro de la función mostrarResultadosEditar, después de renderizar el formulario)
const editTipoAfiliadoEl = document.getElementById('edit-tipo-afiliado');
if (editTipoAfiliadoEl) {
    editTipoAfiliadoEl.addEventListener('change', function() {
        toggleCamposTitular(this.value.trim().toUpperCase(), 'editar');
    });
    // Inicializar estado al cargar
    toggleCamposTitular(editTipoAfiliadoEl.value.trim().toUpperCase(), 'editar');

    }
});

// --- CALENDARIO DESPLEGABLE PARA PRESTACIONES ---
(function initCalendar() {
    const btnCalendar = document.getElementById('btn-calendar-picker');
    const calendarDropdown = document.getElementById('calendar-dropdown');
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const btnPrevMonth = document.getElementById('calendar-prev-month');
    const btnNextMonth = document.getElementById('calendar-next-month');
    const btnToday = document.getElementById('btn-today');
    const btnCloseCalendar = document.getElementById('btn-close-calendar');
    
    const selectDia = document.getElementById('prest-fecha-dia');
    const selectMes = document.getElementById('prest-fecha-mes');
    const selectAnio = document.getElementById('prest-fecha-anio');
    
    let currentDate = new Date();
    let selectedDate = null;
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    function renderCalendar(year, month) {
        calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Días del mes anterior
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month';
            dayEl.textContent = day;
            calendarDays.appendChild(dayEl);
        }
        
        // Días del mes actual
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            
            // Marcar el día de hoy
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            // Marcar el día seleccionado
            if (selectedDate && year === selectedDate.getFullYear() && 
                month === selectedDate.getMonth() && day === selectedDate.getDate()) {
                dayEl.classList.add('selected');
            }
            
            dayEl.addEventListener('click', function() {
                selectDate(year, month, day);
            });
            
            calendarDays.appendChild(dayEl);
        }
        
        // Días del mes siguiente para completar la cuadrícula
        const totalCells = calendarDays.children.length;
        const remainingCells = 35 - totalCells; // 5 semanas * 7 días
        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month';
            dayEl.textContent = day;
            calendarDays.appendChild(dayEl);
        }
    }
    
    function selectDate(year, month, day) {
        selectedDate = new Date(year, month, day);
        
        // Actualizar los selects
        selectDia.value = String(day).padStart(2, '0');
        selectMes.value = String(month + 1).padStart(2, '0');
        selectAnio.value = String(year);
        
        // Cerrar el calendario
        calendarDropdown.style.display = 'none';
        
        // Re-renderizar para mostrar la selección
        renderCalendar(year, month);
    }
    
    function setToday() {
        const today = new Date();
        selectDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
    
    // Event listeners
    btnCalendar.addEventListener('click', function(e) {
        e.preventDefault();
        const isVisible = calendarDropdown.style.display === 'block';
        calendarDropdown.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // Si hay fecha seleccionada en los selects, mostrar ese mes
            const yearVal = selectAnio.value;
            const monthVal = selectMes.value;
            if (yearVal && monthVal) {
                currentDate = new Date(parseInt(yearVal), parseInt(monthVal) - 1, 1);
            } else {
                currentDate = new Date();
            }
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        }
    });
    
    btnPrevMonth.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    
    btnNextMonth.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    
    btnToday.addEventListener('click', function() {
        setToday();
    });
    
    btnCloseCalendar.addEventListener('click', function() {
        calendarDropdown.style.display = 'none';
    });
    
    // Cerrar calendario al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!btnCalendar.contains(e.target) && !calendarDropdown.contains(e.target)) {
            calendarDropdown.style.display = 'none';
        }
    });
    
    // Renderizar calendario inicial
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
})();

// --- AUTO-DESPLEGAR OPCIONES AL PRIMER CLIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Para inputs con datalist: mostrar sugerencias al hacer clic
    const inputsConDatalist = document.querySelectorAll('input[list]');
    inputsConDatalist.forEach(input => {
        input.addEventListener('click', function(e) {
            if (!this.value) {
                // Forzar mostrar datalist
                const event = new Event('input', { bubbles: true });
                this.dispatchEvent(event);
            }
        });
        input.addEventListener('focus', function() {
            if (!this.value) {
                // También al hacer foco
                const event = new Event('input', { bubbles: true });
                this.dispatchEvent(event);
            }
        });
    });
    
    // Para selects: abrir automáticamente al hacer clic
    const selects = document.querySelectorAll('select.select-sin-flecha');
    selects.forEach(select => {
        // Función para actualizar color según valor
        const actualizarColor = () => {
            if (select.value === '') {
                select.classList.add('vacio');
            } else {
                select.classList.remove('vacio');
            }
        };
        
        // Aplicar color inicial
        actualizarColor();
        
        // Actualizar al cambiar valor
        select.addEventListener('change', actualizarColor);
        
        // Abrir dropdown al hacer clic
        select.addEventListener('mousedown', function(e) {
            if (this !== document.activeElement) {
                e.preventDefault();
                this.focus();
                // Forzar apertura inmediata
                setTimeout(() => {
                    const event = new MouseEvent('mousedown', { bubbles: true });
                    this.dispatchEvent(event);
                }, 10);
            }
        });
    });
});
