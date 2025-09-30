// js/logros.js

// === Estado global ===
// Lista de logros cargados desde Firebase
export const logros = [];
// Referencia al logro actualmente en vista (detalle)
export let logroActual = null;

/**
 * Convierte un archivo de imagen a una cadena Base64.
 * 
 * @param {File} file - Archivo de imagen seleccionado por el usuario.
 * @returns {Promise<string>} Cadena Base64 de la imagen.
 */
export function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Renderiza las listas de logros desbloqueados y bloqueados en el menú.
 * 
 * @param {HTMLElement} logrosDesbloqueados - Contenedor <ul> para logros desbloqueados.
 * @param {HTMLElement} logrosBloqueados - Contenedor <ul> para logros bloqueados.
 */
export function renderizarLogros(logrosDesbloqueados, logrosBloqueados) {
    // Limpiar listas actuales
    logrosDesbloqueados.innerHTML = "";
    logrosBloqueados.innerHTML = "";

    // 🔑 Verificar si el usuario está autenticado
    const autenticado = firebase.auth().currentUser;

    // Crear un elemento <li> con botón para cada logro
    logros.forEach(logro => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = logro.desbloqueado
            ? `${logro.nombre} ✅`
            : `${logro.nombre} 🔒`;
        // Al hacer clic, muestra el detalle del logro (siempre permitido)
        btn.addEventListener("click", () => mostrarDetalle(logro.id));
        li.appendChild(btn);
        // Añadir a la lista correspondiente
        if (logro.desbloqueado) logrosDesbloqueados.appendChild(li);
        else logrosBloqueados.appendChild(li);
    });
}

/**
 * Muestra la pantalla de detalle de un logro específico.
 * 
 * @param {string|number} id - ID del logro a mostrar.
 */
export function mostrarDetalle(id) {
    // Buscar logro por ID (comparación flexible de tipo)
    const logro = logros.find(l => String(l.id) === String(id));
    if (!logro) return;
    logroActual = logro;

    // Cambiar visibilidad de pantallas
    document.getElementById("menu-logros").style.display = "none";
    document.getElementById("detalle-logro").style.display = "block";

    // Actualizar título
    document.getElementById("detalle-titulo").textContent = `Logro: ${logro.nombre}`;

    // Renderizar imagen
    const contenedorImagen = document.getElementById("detalle-imagen");
    contenedorImagen.innerHTML = "";
    if (logro.imagen) {
        const img = document.createElement("img");
        img.src = logro.imagen;
        img.alt = `Imagen del logro "${logro.nombre}"`;
        contenedorImagen.appendChild(img);
    } else {
        contenedorImagen.textContent = "(espacio para foto)";
    }

    // Ocultar control de cambio de imagen (solo visible en edición)
    document.getElementById("label-cambiar-imagen").style.display = "none";

    // Mostrar fecha
    document.getElementById("detalle-fecha").textContent = logro.fecha;

    // Renderizar dificultad como estrellas no editables
    renderEstrellasDetalle(logro.dificultad || 0);

    // Mostrar notas
    document.getElementById("detalle-notas").textContent = logro.notas;

    // 🔑 NUEVO: Ocultar botón "Editar" por defecto y mostrarlo solo si autenticado
    document.getElementById("btn-editar-logro").style.display = "none";
    document.getElementById("btn-guardar-logro").style.display = "none";

    // Verificar autenticación de forma segura
    if (typeof firebase !== 'undefined') {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            document.getElementById("btn-editar-logro").style.display = user ? "inline-block" : "none";
            // Cancelar el listener después de usarlo (evita fugas de memoria)
            unsubscribe();
        });
    }
}

/**
 * Renderiza las estrellas de dificultad en modo visualización (no editable).
 * 
 * @param {number} valor - Número de estrellas activas (0 a 5).
 */
function renderEstrellasDetalle(valor) {
    const cont = document.getElementById("detalle-dificultad");
    cont.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.className = `estrella ${i <= valor ? 'activa' : ''}`;
        span.textContent = "★";
        cont.appendChild(span);
    }
}

/**
 * Renderiza las estrellas de dificultad en modo edición (interactivo).
 * 
 * @param {number} valorInicial - Número inicial de estrellas activas.
 */
function renderEstrellasEditable(valorInicial = 0) {
    const cont = document.getElementById("detalle-dificultad");
    cont.innerHTML = "";
    cont.classList.add('editable');
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `estrella ${i <= valorInicial ? 'activa' : ''}`;
        btn.textContent = "★";
        btn.style.cursor = 'pointer';
        btn.setAttribute('aria-label', `${i} de 5`);
        // Al hacer clic, activa todas las estrellas hasta la seleccionada
        btn.addEventListener('click', () => {
            const estrellas = cont.querySelectorAll('.estrella');
            estrellas.forEach((el, idx) => {
                if (idx < i) el.classList.add('activa');
                else el.classList.remove('activa');
            });
            // Guardar valor seleccionado en dataset
            cont.dataset.valor = String(i);
        });
        cont.appendChild(btn);
    }
    // Inicializar dataset con valor por defecto
    cont.dataset.valor = String(valorInicial || 0);
}

/**
 * Convierte la vista de detalle en un formulario editable.
 * 
 * @param {Object} logro - Objeto del logro a editar.
 */
export function editarLogro(logro) {
    if (!logro) return;

    // Reemplazar contenido de título, fecha y notas con inputs
    const titulo = document.getElementById("detalle-titulo");
    const fecha = document.getElementById("detalle-fecha");
    const notas = document.getElementById("detalle-notas");

    titulo.innerHTML = `Logro: <input type="text" id="edit-nombre" class="form-input" value="${logro.nombre}" maxlength="50">`;
    fecha.innerHTML = `Fecha: <input type="date" id="edit-fecha" class="form-input" value="${logro.fecha}">`;
    notas.innerHTML = `
        <textarea id="edit-notas" class="form-input" maxlength="200">${logro.notas}</textarea>
        <label>Desbloqueado: <input type="checkbox" id="edit-desbloqueado" ${logro.desbloqueado ? "checked" : ""}></label>
    `;

    // Renderizar estrellas editables
    renderEstrellasEditable(Number(logro.dificultad) || 0);

    // Mostrar control de imagen y botón de guardar
    document.getElementById("label-cambiar-imagen").style.display = "block";
    document.getElementById("btn-editar-logro").style.display = "none";
    document.getElementById("btn-guardar-logro").style.display = "inline-block";
}

/**
 * Vuelve a mostrar el detalle del logro en modo visualización (después de guardar o cancelar).
 * 
 * @param {string|number} id - ID del logro a mostrar.
 */
export function volverAMostrarDetalle(id) {
    const logro = logros.find(l => String(l.id) === String(id));
    if (!logro) return;
    logroActual = logro;

    // Restaurar contenido de texto
    document.getElementById("detalle-titulo").textContent = `Logro: ${logro.nombre}`;
    document.getElementById("detalle-fecha").textContent = logro.fecha;
    document.getElementById("detalle-notas").textContent = logro.notas;

    // Renderizar estrellas no editables
    renderEstrellasDetalle(Number(logro.dificultad) || 0);
    
    // Eliminar elementos de edición del DOM
    const detalleContenedor = document.getElementById('detalle-logro');
    detalleContenedor.querySelector('#edit-nombre')?.remove();
    detalleContenedor.querySelector('#edit-fecha')?.remove();
    detalleContenedor.querySelector('#edit-notas')?.remove();
    detalleContenedor.querySelector('#edit-desbloqueado')?.remove();

    // 🔑 NUEVO: Ocultar botón "Editar" por defecto y mostrarlo solo si autenticado
    document.getElementById("btn-editar-logro").style.display = "none";
    document.getElementById("btn-guardar-logro").style.display = "none";

    if (typeof firebase !== 'undefined') {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            document.getElementById("btn-editar-logro").style.display = user ? "inline-block" : "none";
            unsubscribe();
        });
    }
}

/**
 * Establece el logro actual (útil para pruebas o inicialización externa).
 * 
 * @param {Object} logro - Objeto del logro.
 */
export function setLogroActual(logro) {
    logroActual = logro;
}