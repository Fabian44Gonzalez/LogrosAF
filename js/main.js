// js/main.js
import { initFirebase } from "./firebase.js";
import { initTemaYNavegacion } from "./tema.js";
import { logros, renderizarLogros, mostrarDetalle, editarLogro, volverAMostrarDetalle, logroActual, setLogroActual, convertirImagenABase64 } from "./logros.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar Firebase y obtener una referencia a la base de datos
    const database = initFirebase();

    // Referencias a elementos del DOM
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
    const btnVolverMenuDetalle = document.getElementById("btn-volver-menu");
    const btnVolverInicio = document.getElementById("btn-volver-inicio");

    // Nueva pantalla de creación de logro
    const nuevoLogro = document.getElementById("nuevo-logro");
    const btnVolverNuevo = document.getElementById("btn-volver-nuevo");
    const btnGuardarNuevo = document.getElementById("btn-guardar-nuevo");

    const inputNuevoNombre = document.getElementById("nuevo-nombre");
    const inputNuevaFecha = document.getElementById("nueva-fecha");
    const inputNuevaNota = document.getElementById("nueva-nota");
    const inputNuevoDesbloqueado = document.getElementById("nuevo-desbloqueado");
    const inputNuevoImagen = document.getElementById("nuevo-imagen");

    // Llama a la función de inicialización del tema y navegación
    const { mostrarMenu } = initTemaYNavegacion();

    // Event Listeners
    btnIniciar.addEventListener("click", () => {
        if (!inputJugador1.value) inputJugador1.value = "Atenea";
        if (!inputJugador2.value) inputJugador2.value = "Fabian";
        mostrarMenu();
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
    });

    btnVolverMenuDetalle.addEventListener("click", () => {
        mostrarMenu();
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
    });
    btnVolverInicio.addEventListener("click", () => {
        menuLogros.style.display = "none";
        pantallaInicial.style.display = "block";
    });

    // Abrir pantalla para crear un nuevo logro
    btnAgregarLogro.addEventListener("click", () => {
        menuLogros.style.display = "none";
        nuevoLogro.style.display = "block";
    });

    // Guardar nuevo logro
    btnGuardarNuevo.addEventListener("click", async () => {
        const nombre = inputNuevoNombre.value.trim();
        const fecha = inputNuevaFecha.value.trim();
        const notas = inputNuevaNota.value.trim();
        const desbloqueado = inputNuevoDesbloqueado.checked;

        if (!nombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (notas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }

        // Estado de carga en botón
        const prevText = btnGuardarNuevo.textContent;
        btnGuardarNuevo.textContent = "Guardando...";
        btnGuardarNuevo.disabled = true;
        btnGuardarNuevo.setAttribute("aria-busy", "true");

        try {
            // Calcular el siguiente ID disponible de forma segura
            const maxId = logros.length > 0 ? Math.max(...logros.map(l => Number(l.id) || 0)) : 0;
            const nuevoId = maxId + 1;

            // Dificultad por defecto 0 (sin estrellas) en creación
            let nuevoLogroObj = { id: nuevoId, nombre, fecha: fecha || "--/--/----", notas: notas || "Sin notas", desbloqueado: !!desbloqueado, dificultad: 0 };

            const archivo = inputNuevoImagen.files[0];
            if (archivo) {
                const base64 = await convertirImagenABase64(archivo);
                nuevoLogroObj.imagen = base64;
            }

            // Guardar en la base de datos
            await database.ref("logros/" + nuevoId).set(nuevoLogroObj);

            // Agregar al array local
            logros.push(nuevoLogroObj);

            // Volver al menú y mostrar el detalle del nuevo logro
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            nuevoLogro.style.display = "none";
            mostrarDetalle(nuevoId);
            limpiarCampos();
        } catch (error) {
            console.error("Error al guardar el nuevo logro:", error);
            alert("Ocurrió un error al guardar el logro. Inténtalo de nuevo.");
        } finally {
            btnGuardarNuevo.textContent = prevText;
            btnGuardarNuevo.disabled = false;
            btnGuardarNuevo.removeAttribute("aria-busy");
        }
    });

    // Volver desde la pantalla de nuevo logro al menú
    btnVolverNuevo.addEventListener("click", () => {
        nuevoLogro.style.display = "none";
        menuLogros.style.display = "block";
    });

    btnEditarLogro.addEventListener("click", () => {
        if (!logroActual) return;
        editarLogro(logroActual);
    });

    btnGuardar.addEventListener("click", async () => {
        if (!logroActual) return;

        const nuevoNombre = document.getElementById("edit-nombre").value.trim();
        const nuevaFecha = document.getElementById("edit-fecha").value.trim();
        const nuevasNotas = document.getElementById("edit-notas").value.trim();
        const desbloqueado = document.getElementById("edit-desbloqueado").checked;

        // Leer dificultad elegida en estrellas (dataset.valor)
        const contDificultad = document.getElementById("detalle-dificultad");
        const nuevaDificultad = Number(contDificultad?.dataset?.valor || 0);

        if (!nuevoNombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nuevoNombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (nuevasNotas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }

        // Estado de carga en botón Guardar
        const prevText = btnGuardar.textContent;
        btnGuardar.textContent = "Guardando...";
        btnGuardar.disabled = true;
        btnGuardar.setAttribute("aria-busy", "true");

        try {
            // Actualizar el objeto local
            logroActual.nombre = nuevoNombre;
            logroActual.fecha = nuevaFecha || "--/--/----";
            logroActual.notas = nuevasNotas || "Sin notas";
            logroActual.desbloqueado = desbloqueado;
            logroActual.dificultad = nuevaDificultad; // persistir dificultad

            const inputEditImagen = document.getElementById("edit-imagen");
            const archivo = inputEditImagen.files[0];

            if (archivo) {
                const base64 = await convertirImagenABase64(archivo);
                logroActual.imagen = base64;
            }

            // Guardar los cambios en la base de datos
            await database.ref("logros/" + logroActual.id).set(logroActual);

            // Volver a renderizar para reflejar los cambios
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            volverAMostrarDetalle(logroActual.id);
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            alert("Ocurrió un error al guardar los cambios. Inténtalo de nuevo.");
        } finally {
            btnGuardar.textContent = prevText;
            btnGuardar.disabled = false;
            btnGuardar.removeAttribute("aria-busy");
        }
    });

    const limpiarCampos = () => {
        inputNuevoNombre.value = "";
        inputNuevaFecha.value = "";
        inputNuevaNota.value = "";
        inputNuevoDesbloqueado.checked = false;
        inputNuevoImagen.value = "";
    };

    // Cargar logros desde Firebase
    try {
        const snapshot = await database.ref("logros").once("value");
        snapshot.forEach(child => {
            const logro = child.val();
            logros.push(logro);
        });
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
    } catch (error) {
        console.error("Error al cargar los logros:", error);
    }
});