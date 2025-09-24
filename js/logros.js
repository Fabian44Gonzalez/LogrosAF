// js/logros.js
export const logros = [];
export let logroActual = null;

export function setLogroActual(logro) {
    logroActual = logro;
}

// Renderizar logros en el menú
export function renderizarLogros(logrosDesbloqueados, logrosBloqueados) {
    logrosDesbloqueados.innerHTML = "";
    logrosBloqueados.innerHTML = "";

    logros.forEach(logro => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = logro.desbloqueado
            ? `${logro.nombre} ✅`
            : `${logro.nombre} 🔒`;
        btn.addEventListener("click", () => mostrarDetalle(logro.firebaseId));
        li.appendChild(btn);
        if (logro.desbloqueado) logrosDesbloqueados.appendChild(li);
        else logrosBloqueados.appendChild(li);
    });
}

// Mostrar detalle del logro
export function mostrarDetalle(firebaseId) {
    const logro = logros.find(l => l.firebaseId === firebaseId);
    if (!logro) return;
    setLogroActual(logro);

    document.getElementById("menu-logros").style.display = "none";
    document.getElementById("detalle-logro").style.display = "block";

    document.getElementById("detalle-titulo").textContent = `Logro: ${logro.nombre}`;
    const contenedorImagen = document.getElementById("detalle-imagen");
    contenedorImagen.innerHTML = "";
    if (logro.imagen) {
        const img = document.createElement("img");
        img.src = logro.imagen;
        img.alt = `Imagen del logro "${logro.nombre}"`;
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        contenedorImagen.appendChild(img);
    } else {
        contenedorImagen.textContent = "(espacio para foto)";
    }

    document.getElementById("label-cambiar-imagen").style.display = "none";
    document.getElementById("detalle-fecha").textContent = logro.fecha;
    document.getElementById("detalle-notas").textContent = logro.notas;

    document.getElementById("btn-editar-logro").style.display = "inline-block";
    document.getElementById("btn-guardar-logro").style.display = "none";
}

// Volver a mostrar detalle después de guardar
export function volverAMostrarDetalle(firebaseId) {
    const logro = logros.find(l => l.firebaseId === firebaseId);
    if (!logro) return;
    setLogroActual(logro);

    document.getElementById("detalle-titulo").textContent = `Logro: ${logro.nombre}`;
    document.getElementById("detalle-fecha").textContent = logro.fecha;
    document.getElementById("detalle-notas").textContent = logro.notas;
    
    // Ocultar los campos de edición
    const detalleContenedor = document.getElementById('detalle-logro');
    detalleContenedor.querySelector('#edit-nombre')?.remove();
    detalleContenedor.querySelector('#edit-fecha')?.remove();
    detalleContenedor.querySelector('#edit-notas')?.remove();
    detalleContenedor.querySelector('#edit-desbloqueado')?.remove();

    document.getElementById("label-cambiar-imagen").style.display = "none";
    document.getElementById("btn-editar-logro").style.display = "inline-block";
    document.getElementById("btn-guardar-logro").style.display = "none";
}

// Convertir imagen a Base64
export function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Editar un logro existente (dinámicamente)
export function editarLogro(logro) {
    if (!logro) return;

    const titulo = document.getElementById("detalle-titulo");
    const fecha = document.getElementById("detalle-fecha");
    const notas = document.getElementById("detalle-notas");

    // Reemplaza el contenido de los elementos con inputs
    titulo.innerHTML = `Logro: <input type="text" id="edit-nombre" class="form-input" value="${logro.nombre}" maxlength="50">`;
    fecha.innerHTML = `Fecha: <input type="date" id="edit-fecha" class="form-input" value="${logro.fecha !== '--/--/----' ? logro.fecha : ''}">`;
    notas.innerHTML = `
        <textarea id="edit-notas" class="form-input" maxlength="200">${logro.notas}</textarea>
        <label>Desbloqueado: <input type="checkbox" id="edit-desbloqueado" ${logro.desbloqueado ? "checked" : ""}></label>
    `;

    document.getElementById("label-cambiar-imagen").style.display = "block";
    document.getElementById("btn-editar-logro").style.display = "none";
    document.getElementById("btn-guardar-logro").style.display = "inline-block";
}