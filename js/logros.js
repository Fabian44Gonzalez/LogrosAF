export const logros = [];
export let logroActual = null;

// Renderizar logros en el menú
export function renderizarLogros(logrosDesbloqueados, logrosBloqueados) {
    logrosDesbloqueados.innerHTML = "";
    logrosBloqueados.innerHTML = "";

    logros.forEach(logro => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = logro.desbloqueado
            ? `${logro.id}. ${logro.nombre} ✅`
            : `${logro.id}. ${logro.nombre} 🔒`;
        btn.addEventListener("click", () => mostrarDetalle(logro.id));
        li.appendChild(btn);
        if (logro.desbloqueado) logrosDesbloqueados.appendChild(li);
        else logrosBloqueados.appendChild(li);
    });
}

// Mostrar detalle del logro
export function mostrarDetalle(id) {
    const logro = logros.find(l => String(l.id) === String(id));
    if (!logro) return;
    logroActual = logro;

    const menuLogros = document.getElementById("menu-logros");
    const detalleLogro = document.getElementById("detalle-logro");

    menuLogros.style.display = "none";
    detalleLogro.style.display = "block";

    document.getElementById("detalle-titulo").textContent = `Logro #${logro.id}: ${logro.nombre}`;
    const contenedorImagen = document.getElementById("detalle-imagen");
    contenedorImagen.innerHTML = "";
    if (logro.imagen) {
        const img = document.createElement("img");
        img.src = logro.imagen;
        img.alt = `Imagen del logro "${logro.nombre}"`; // ✅ alt agregado
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        contenedorImagen.appendChild(img);
    } else {
        contenedorImagen.textContent = "(espacio para foto)";
    }

    document.getElementById("label-cambiar-imagen").style.display = "none";
    document.getElementById("detalle-fecha").textContent = logro.fecha;
    document.getElementById("detalle-notas").textContent = logro.notas;

    const btnEditarLogro = document.getElementById("btn-editar-logro");
    const btnGuardar = document.getElementById("btn-guardar-logro");
    btnEditarLogro.style.display = "inline-block";
    btnGuardar.style.display = "none";
}

// Convertir imagen a Base64 usando Promesas
export function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Editar un logro existente
export function editarLogro() {
    if (!logroActual) return;

    const titulo = document.getElementById("detalle-titulo");
    const fecha = document.getElementById("detalle-fecha");
    const notas = document.getElementById("detalle-notas");

    // ✅ Mantener el "Logro #X:" fijo y solo volver editable el nombre
    titulo.innerHTML = `Logro #${logroActual.id}: <input type="text" id="edit-nombre" class="form-input" value="${logroActual.nombre}" maxlength="50">`;

    fecha.innerHTML = `<input type="date" id="edit-fecha" class="form-input" value="${logroActual.fecha !== '--/--/----' ? logroActual.fecha : ''}">`;
    notas.innerHTML = `
        <textarea id="edit-notas" class="form-input" maxlength="200">${logroActual.notas}</textarea>
        <label>Desbloqueado: 
            <input type="checkbox" id="edit-desbloqueado" ${logroActual.desbloqueado ? "checked" : ""}>
        </label>
    `;

    document.getElementById("label-cambiar-imagen").style.display = "block";

    document.getElementById("btn-editar-logro").style.display = "none";
    document.getElementById("btn-guardar-logro").style.display = "inline-block";
}
