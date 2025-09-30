// js/logros.js

// Array global que almacena todos los logros cargados desde Firebase
export const logros = [];

// Variable global que guarda la referencia al logro actualmente en vista (detalle)
export let logroActual = null;

// Convertir imagen a Base64
export function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Renderizar logros en el menú
// Recibe referencias a los contenedores <ul> para logros desbloqueados y bloqueados
export function renderizarLogros(logrosDesbloqueados, logrosBloqueados) {
    // Limpiar el contenido actual de ambas listas
    logrosDesbloqueados.innerHTML = "";
    logrosBloqueados.innerHTML = "";

    // Iterar sobre todos los logros y crear un botón por cada uno
    logros.forEach(logro => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        // Mostrar emoji según si está desbloqueado o no
        btn.textContent = logro.desbloqueado
            ? `${logro.nombre} ✅`
            : `${logro.nombre} 🔒`;
        // Al hacer clic, mostrar el detalle del logro
        btn.addEventListener("click", () => mostrarDetalle(logro.id));
        li.appendChild(btn);
        // Añadir el elemento a la lista correspondiente
        if (logro.desbloqueado) logrosDesbloqueados.appendChild(li);
        else logrosBloqueados.appendChild(li);
    });
}

// Mostrar detalle del logro
// Recibe el ID del logro a mostrar
export function mostrarDetalle(id) {
    // Buscar el logro en el array global (comparación flexible de tipo)
    const logro = logros.find(l => String(l.id) === String(id));
    if (!logro) return;
    logroActual = logro;

    // Cambiar visibilidad de las pantallas: ocultar menú, mostrar detalle
    document.getElementById("menu-logros").style.display = "none";
    document.getElementById("detalle-logro").style.display = "block";

    // Actualizar el título del detalle
    document.getElementById("detalle-titulo").textContent = `Logro: ${logro.nombre}`;

    // Renderizar la imagen del logro (si existe)
    const contenedorImagen = document.getElementById("detalle-imagen");
    contenedorImagen.innerHTML = "";
    if (logro.imagen) {
        const img = document.createElement("img");
        img.src = logro.imagen;
        img.alt = `Imagen del logro "${logro.nombre}"`;
        // El tamaño lo controla el contenedor por CSS (object-fit: contain)
        contenedorImagen.appendChild(img);
    } else {
        contenedorImagen.textContent = "(espacio para foto)";
    }

    // Ocultar el control para cambiar imagen (solo visible en modo edición)
    document.getElementById("label-cambiar-imagen").style.display = "none";

    // Mostrar la fecha del logro
    document.getElementById("detalle-fecha").textContent = logro.fecha;

    // Renderizar la dificultad como estrellas (modo visualización)
    renderEstrellasDetalle(logro.dificultad || 0);

    // Mostrar las notas del logro
    document.getElementById("detalle-notas").textContent = logro.notas;

    // Mostrar botón de edición y ocultar botón de guardar
    document.getElementById("btn-editar-logro").style.display = "inline-block";
    document.getElementById("btn-guardar-logro").style.display = "none";
}

// Función auxiliar: renderiza estrellas en modo visualización (no editable)
function renderEstrellasDetalle(valor) {
    const cont = document.getElementById("detalle-dificultad");
    cont.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.className = `estrella ${i <= valor ? 'activa' : ''}`;
        span.textContent = "★"; // mostramos estrellas llenas/ vacías por color
        cont.appendChild(span);
    }
}

// Función auxiliar: renderiza estrellas en modo edición (interactivo)
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
            // Guardar el valor seleccionado en un atributo de datos
            cont.dataset.valor = String(i);
        });
        cont.appendChild(btn);
    }
    // Guardar valor inicial en el dataset
    cont.dataset.valor = String(valorInicial || 0);
}

// Editar un logro existente
// Convierte la vista de detalle en un formulario editable
export function editarLogro(logro) {
    if (!logro) return;

    // Obtener referencias a los elementos a modificar
    const titulo = document.getElementById("detalle-titulo");
    const fecha = document.getElementById("detalle-fecha");
    const notas = document.getElementById("detalle-notas");

    // Reemplazar el contenido de los elementos con inputs editables
    titulo.innerHTML = `Logro: <input type="text" id="edit-nombre" class="form-input" value="${logro.nombre}" maxlength="50">`;
    fecha.innerHTML = `Fecha: <input type="date" id="edit-fecha" class="form-input" value="${logro.fecha}">`;
    notas.innerHTML = `
        <textarea id="edit-notas" class="form-input" maxlength="200">${logro.notas}</textarea>
        <label>Desbloqueado: <input type="checkbox" id="edit-desbloqueado" ${logro.desbloqueado ? "checked" : ""}></label>
    `;

    // Renderizar estrellas en modo edición
    renderEstrellasEditable(Number(logro.dificultad) || 0);

    // Mostrar control para cambiar imagen y botón de guardar
    document.getElementById("label-cambiar-imagen").style.display = "block";
    document.getElementById("btn-editar-logro").style.display = "none";
    document.getElementById("btn-guardar-logro").style.display = "inline-block";
}

// Volver a mostrar el detalle del logro en modo visualización (después de guardar o cancelar)
export function volverAMostrarDetalle(id) {
    // Buscar el logro por ID
    const logro = logros.find(l => String(l.id) === String(id));
    if (!logro) return;
    logroActual = logro;

    // Restaurar el contenido de texto en los elementos
    document.getElementById("detalle-titulo").textContent = `Logro: ${logro.nombre}`;
    document.getElementById("detalle-fecha").textContent = logro.fecha;
    document.getElementById("detalle-notas").textContent = logro.notas;

    // Renderizar dificultad en modo visualización
    renderEstrellasDetalle(Number(logro.dificultad) || 0);
    
    // Eliminar los elementos de edición del DOM (si existen)
    const detalleContenedor = document.getElementById('detalle-logro');
    detalleContenedor.querySelector('#edit-nombre')?.remove();
    detalleContenedor.querySelector('#edit-fecha')?.remove();
    detalleContenedor.querySelector('#edit-notas')?.remove();
    detalleContenedor.querySelector('#edit-desbloqueado')?.remove();

    // Ocultar controles de edición
    document.getElementById("label-cambiar-imagen").style.display = "none";
    document.getElementById("btn-editar-logro").style.display = "inline-block";
    document.getElementById("btn-guardar-logro").style.display = "none";
}

// Establecer el logro actual
export function setLogroActual(logro) {
    logroActual = logro;
}