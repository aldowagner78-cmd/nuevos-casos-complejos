// Sistema de adjuntos de archivos - Opción 1: Botón Simple
// Interfaz clara similar a Gmail/Google Drive

(function() {
    const MAX_ARCHIVOS = 5;
    
    // Inicializar al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        inicializarContenedor('campos-archivos-adjuntos');
    });

    // Observer para formularios dinámicos (edición)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    const contenedor = document.getElementById('campos-archivos-adjuntos-editar');
                    if (contenedor && !contenedor.dataset.inicializado) {
                        // No inicializar aquí, esperar la llamada explícita desde app.js
                    }
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function inicializarContenedor(idContenedor) {
        const contenedor = document.getElementById(idContenedor);
        if (!contenedor) return;
        
        // Evitar doble inicialización
        if (contenedor.dataset.inicializado === 'true') return;
        contenedor.dataset.inicializado = 'true';

        // Limpiar contenedor
        contenedor.innerHTML = '';
        
        // Si es el formulario de edición, esperar llamada explícita
        if (idContenedor === 'campos-archivos-adjuntos-editar') {
        // No cargar archivos aquí, esperar a _inicializarArchivosEdicion
        }
        
        // Crear botón inicial
        agregarBotonAdjuntar(contenedor);
    }

    function agregarBotonAdjuntar(contenedor) {
        const archivosActuales = contenedor.querySelectorAll('.archivo-adjunto-item').length;
        if (archivosActuales >= MAX_ARCHIVOS) return;
        
        // Evitar duplicar botones
        if (contenedor.querySelector('.boton-adjuntar-wrapper')) return;

        const botonWrapper = document.createElement('div');
        botonWrapper.className = 'boton-adjuntar-wrapper';
        botonWrapper.style.marginTop = archivosActuales > 0 ? '8px' : '0';
        
        const inputFile = document.createElement('input');
        inputFile.type = 'file';
        inputFile.className = 'input-archivo-real';
        inputFile.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.txt'; // Añadido .txt
        inputFile.style.display = 'none';
        
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-add-linea';
        boton.textContent = '+ Adjuntar archivo';
        
        boton.onclick = function() {
            inputFile.click();
        };
        
        inputFile.onchange = function() {
            if (this.files.length > 0) {
                const archivo = this.files[0];
                mostrarArchivoAdjunto(contenedor, archivo, botonWrapper);
            }
        };
        
        botonWrapper.appendChild(inputFile);
        botonWrapper.appendChild(boton);
        contenedor.appendChild(botonWrapper);
    }

    function mostrarArchivoAdjunto(contenedor, archivo, botonWrapper) {
        // Crear elemento para mostrar el archivo
        const item = document.createElement('div');
        item.className = 'archivo-adjunto-item';
        item.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;';
        
        const icono = document.createElement('span');
        icono.textContent = '📎';
        icono.style.fontSize = '1.2em';
        
        const nombre = document.createElement('span');
        nombre.textContent = archivo.name;
        nombre.style.flex = '1';
        nombre.style.overflow = 'hidden';
        nombre.style.textOverflow = 'ellipsis';
        nombre.style.whiteSpace = 'nowrap';
        
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.innerHTML = '&times;';
        btnEliminar.className = 'btn-remove-prestacion';
        btnEliminar.title = 'Quitar archivo';
        btnEliminar.onclick = function() {
            item.remove();
            // Si no hay archivos, agregar botón nuevamente
            if (contenedor.querySelectorAll('.archivo-adjunto-item').length === 0) {
                agregarBotonAdjuntar(contenedor);
            } else if (contenedor.querySelectorAll('.archivo-adjunto-item').length < MAX_ARCHIVOS) {
                // Si hay menos de 5, asegurar que hay botón
                if (!contenedor.querySelector('.boton-adjuntar-wrapper')) {
                    agregarBotonAdjuntar(contenedor);
                }
            }
        };
        
        // Guardar referencia al archivo en el elemento
        item._archivoFile = archivo;
        
        item.appendChild(icono);
        item.appendChild(nombre);
        item.appendChild(btnEliminar);
        
        // Insertar antes del botón
        contenedor.insertBefore(item, botonWrapper);
        
        // Eliminar el botón que se usó
        botonWrapper.remove();
        
        // Agregar nuevo botón si no se alcanzó el límite
        agregarBotonAdjuntar(contenedor);
    }

    async function cargarArchivosExistentes(contenedor, dni) {
        try {
            const response = await fetch(`/api/paciente/${dni}/archivos`);
            if (!response.ok) {
                agregarBotonAdjuntar(contenedor);
                return;
            }
            
            const archivos = await response.json();
            
            if (archivos.length === 0) {
                agregarBotonAdjuntar(contenedor);
                return;
            }
            
            // Mostrar cada archivo existente
            archivos.forEach(archivo => {
                mostrarArchivoExistente(contenedor, archivo);
            });
            
            // Agregar botón para adjuntar más (si hay espacio)
            if (archivos.length < MAX_ARCHIVOS) {
                agregarBotonAdjuntar(contenedor);
            }
        } catch (error) {
            console.error('Error al cargar archivos:', error);
            agregarBotonAdjuntar(contenedor);
        }
    }    function mostrarArchivoExistente(contenedor, archivo) {
        const item = document.createElement('div');
        item.className = 'archivo-adjunto-item archivo-existente';
        item.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; border: 1px solid #4CAF50; border-radius: 4px; background: #e8f5e9;';
        item.dataset.archivoId = archivo.id;
        
        const icono = document.createElement('span');
        icono.textContent = '📄';
        icono.style.fontSize = '1.2em';
        
        const nombre = document.createElement('a');
        
        // Detectar si es URL externa (Google Drive) o archivo local
        const esURLExterna = (archivo.ruta_archivo && (archivo.ruta_archivo.startsWith('http://') || archivo.ruta_archivo.startsWith('https://')));
        
        if (esURLExterna) {
            // Es un enlace externo (Google Drive)
            nombre.href = archivo.ruta_archivo;
        } else if (archivo.ruta_archivo) {
            // Es un archivo local
            const nombreArchivo = archivo.ruta_archivo.split(/[/\\]/).pop();
            nombre.href = `/uploads/${nombreArchivo}`;
        } else {
            nombre.href = '#'; // Fallback si la ruta es nula
        }
        
        nombre.target = '_blank';
        nombre.textContent = archivo.nombre_archivo;
        nombre.style.flex = '1';
        nombre.style.overflow = 'hidden';
        nombre.style.textOverflow = 'ellipsis';
        nombre.style.whiteSpace = 'nowrap';
        nombre.style.color = '#1976D2';
        nombre.style.textDecoration = 'none';
        nombre.onmouseover = function() { this.style.textDecoration = 'underline'; };
        nombre.onmouseout = function() { this.style.textDecoration = 'none'; };
        
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.innerHTML = '&times;';
        btnEliminar.className = 'btn-remove-prestacion';
        btnEliminar.title = 'Eliminar archivo';
        btnEliminar.onclick = function() {
            // Usar modal personalizado en lugar de confirm nativo
            window.mostrarModalEliminarArchivo({
                titulo: 'Eliminar Archivo',
                mensaje: '¿Está seguro de eliminar este archivo?',
                onConfirm: () => {
                    const dniInput = document.getElementById('edit-dni');
                    if (dniInput && dniInput.value) { // Asegurarse que DNI es el correcto
                        eliminarArchivoServidor(dniInput.value, archivo.id, item, contenedor, this);
                    } else {
                        // Fallback si edit-dni no está (aunque debería)
                        const dniURL = new URLSearchParams(window.location.search).get('dni');
                        if(dniURL) {
                            eliminarArchivoServidor(dniURL, archivo.id, item, contenedor, this);
                        } else {
                            alert('No se pudo determinar el DNI del paciente.');
                        }
                    }
                }
            });
        };        item.appendChild(icono);
        item.appendChild(nombre);
        item.appendChild(btnEliminar);
        
        contenedor.appendChild(item);
    }

    async function eliminarArchivoServidor(dni, archivoId, item, contenedor, button) {
        button.disabled = true;

        try {
            const response = await fetch(`/api/paciente/${dni}/archivos/${archivoId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                item.remove();
                
                // Agregar botón si hay espacio y no existe
                const archivosActuales = contenedor.querySelectorAll('.archivo-adjunto-item').length;
                if (archivosActuales < MAX_ARCHIVOS && !contenedor.querySelector('.boton-adjuntar-wrapper')) {
                     agregarBotonAdjuntar(contenedor);
                }
            } else {
                alert('Error al eliminar el archivo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el archivo');
        } finally {
            button.disabled = false;
        }
    }    // Función para obtener archivos al enviar formulario
    function obtenerArchivosParaEnviar(idContenedor) {
        const contenedor = document.getElementById(idContenedor);
        // console.log('🔍 DEBUG obtenerArchivosParaEnviar:');
        // console.log('  - Contenedor:', idContenedor, contenedor ? 'encontrado' : 'NO ENCONTRADO');
        
        if (!contenedor) return [];
        
        const items = contenedor.querySelectorAll('.archivo-adjunto-item:not(.archivo-existente)');
        // console.log('  - Items encontrados:', items.length);
        
        const archivos = [];
        items.forEach((item, idx) => {
            // console.log(`  - Item ${idx + 1}:`, item._archivoFile ? item._archivoFile.name : 'SIN ARCHIVO');
            if (item._archivoFile) {
                archivos.push(item._archivoFile);
            }
        });
        // console.log('  - Total archivos a enviar:', archivos.length);
        return archivos;
    }

    // Exponer función globalmente
    window.obtenerArchivosAdjuntos = obtenerArchivosParaEnviar;
    window._inicializarArchivosEdicion = function(dni) {
        const contenedor = document.getElementById('campos-archivos-adjuntos-editar');
        if (contenedor && dni) {
            // Limpiar antes de cargar
            contenedor.innerHTML = ''; 
            contenedor.dataset.inicializado = 'true';
            cargarArchivosExistentes(contenedor, dni);
        }
    };
})();