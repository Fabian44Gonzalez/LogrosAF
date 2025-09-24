import { initFirebase, guardarLogroEnFirebase, cargarLogrosFirebase } from "./firebase.js";
import { logros, renderizarLogros, mostrarDetalle, convertirImagenABase64, editarLogro, logroActual } from "./logros.js";
import { initTemaYNavegacion } from "./tema.js";

document.addEventListener("DOMContentLoaded", async () => {
    const database = initFirebase();
    const { mostrarMenu } = initTemaYNavegacion();

    const pantallaInicial = document.getElementById("pantalla-inicial");
    const menuLogros = document.getElementById("menu-logros");
    const detalleLogro = document.getElementById("detalle-logro");

    const logrosDesbloqueados = document.getElementById("logros-desbloqueados");
    const logrosBloqueados = document.getElementById("logros-bloqueados");

    const inputJugador1 = document.getElementById("jugador1");
    const inputJugador2 = document.getElementById("jugador2");

    const btnIniciar = document.getElementById("btn-iniciar");
    const btnAgregarLogro = document.getElementById("btn-agregar-logro");
    const btnEditarLogro = document.getElementById("btn-editar-logro");
    const btnGuardar = document.getElementById("btn-guardar-logro");
    const btnVolverMenu = document.getElementById("btn-volver-menu");

    const inputNuevoNombre = document.getElementById("nuevo-nombre");
    const inputNuevaFecha = document.getElementById("nueva-fecha");
    const inputNuevaNota = document.getElementById("nueva-nota");
    const inputNuevoDesbloqueado = document.getElementById("nuevo-desbloqueado");
    const inputNuevoImagen = document.getElementById("nuevo-imagen");

    // Función para volver al menú de logros
    const volverAlMenu = () => {
        detalleLogro.style.display = "none";
        menuLogros.style.display = "block";
    };

    // Función para limpiar los campos de "Agregar nuevo logro"
    const limpiarCampos = () => {
        inputNuevoNombre.value = "";
        inputNuevaFecha.value = "";
        inputNuevaNota.value = "";
        inputNuevoDesbloqueado.checked = false;
        inputNuevoImagen.value = "";
    };

    // Event listeners principales
    btnIniciar.addEventListener("click", () => {
        if (!inputJugador1.value) inputJugador1.value = "Atenea";
        if (!inputJugador2.value) inputJugador2.value = "Fabian";
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
        mostrarMenu();
    });

    btnVolverMenu.addEventListener("click", volverAlMenu);

    btnAgregarLogro.addEventListener("click", async () => {
        const nombre = inputNuevoNombre.value.trim();
        const fecha = inputNuevaFecha.value.trim();
        const notas = inputNuevaNota.value.trim();
        const desbloqueado = inputNuevoDesbloqueado.checked;

        if (!nombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (notas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }
        if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { alert("Formato de fecha inválido."); return; }

        let nuevoId = logros.length > 0 ? Math.max(...logros.map(l => l.id)) + 1 : 1;
        const nuevoLogro = { id: nuevoId, nombre, fecha: fecha || "--/--/----", notas: notas || "Sin notas", desbloqueado: !!desbloqueado };

        const archivo = inputNuevoImagen.files[0];
        if (archivo) {
            try {
                const base64 = await convertirImagenABase64(archivo);
                nuevoLogro.imagen = base64;
            } catch (error) {
                alert("Ocurrió un error al convertir la imagen.");
                return;
            }
        }

        try {
            await guardarLogroEnFirebase(database, nuevoLogro);
            logros.push(nuevoLogro);
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            mostrarDetalle(nuevoLogro.id);
            limpiarCampos();
        } catch (error) {
            console.error("Error al guardar el logro:", error);
            alert("Ocurrió un error al guardar el logro.");
        }
    });

    btnEditarLogro.addEventListener("click", () => {
        editarLogro();
    });

    btnGuardar.addEventListener("click", async () => {
        if (!logroActual) return;

        const nuevoNombre = document.getElementById("edit-nombre").value.trim();
        const nuevaFecha = document.getElementById("edit-fecha").value.trim();
        const nuevasNotas = document.getElementById("edit-notas").value.trim();
        const desbloqueado = document.getElementById("edit-desbloqueado").checked;

        if (!nuevoNombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nuevoNombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (nuevasNotas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }
        if (nuevaFecha && !/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) { alert("Formato de fecha inválido."); return; }

        logroActual.nombre = nuevoNombre;
        logroActual.fecha = nuevaFecha || "--/--/----";
        logroActual.notas = nuevasNotas || "Sin notas";
        logroActual.desbloqueado = desbloqueado;

        const inputEditImagen = document.getElementById("edit-imagen");
        const archivo = inputEditImagen.files[0];

        if (archivo) {
            try {
                const base64 = await convertirImagenABase64(archivo);
                logroActual.imagen = base64;
            } catch (error) {
                alert("Ocurrió un error con la imagen.");
                return;
            }
        }

        try {
            await guardarLogroEnFirebase(database, logroActual);
            const index = logros.findIndex(l => l.id === logroActual.id);
            if (index !== -1) logros[index] = logroActual;
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            mostrarDetalle(logroActual.id);
        } catch (error) {
            console.error("Error al guardar el logro:", error);
            alert("Ocurrió un error al guardar los cambios.");
        }
    });

    // Cargar logros desde Firebase
    try {
        const datos = await cargarLogrosFirebase(database);
        logros.length = 0;
        datos.forEach(l => logros.push(l));
    } catch (error) {
        console.error("Error al cargar los logros:", error);
        alert("Ocurrió un error al cargar los logros.");
    }
});