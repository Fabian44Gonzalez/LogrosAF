import { initFirebase, guardarLogroEnFirebase, cargarLogrosFirebase } from "./firebase.js";
import { logros, logroActual, renderizarLogros, mostrarDetalle, convertirImagenABase64, editarLogro } from "./logros.js";
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
    const inputNuevaNota = document.getElementById("nuevo-nota");
    const inputNuevoDesbloqueado = document.getElementById("nuevo-desbloqueado");
    const inputNuevoImagen = document.getElementById("nuevo-imagen");

    // Volver al menú desde el detalle
    btnVolverMenu.addEventListener("click", () => {
        detalleLogro.style.display = "none";
        menuLogros.style.display = "block";
    });

    // Cargar logros desde Firebase de forma asíncrona
    try {
        const datos = await cargarLogrosFirebase(database);
        logros.length = 0;
        datos.forEach(l => logros.push(l));

        // Iniciar partida
        btnIniciar.addEventListener("click", () => {
            if (!inputJugador1.value) inputJugador1.value = "Atenea";
            if (!inputJugador2.value) inputJugador2.value = "Fabian";
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            mostrarMenu();
        });

    } catch (error) {
        console.error("Error al cargar los logros:", error);
    }
    

    // Función reutilizable para agregar o editar un logro
    const validarYGuardarLogro = async (esNuevo = true) => {
        const nombre = esNuevo ? inputNuevoNombre.value.trim() : document.getElementById("edit-nombre").value.trim();
        const fecha = esNuevo ? inputNuevaFecha.value.trim() : document.getElementById("edit-fecha").value.trim();
        const notas = esNuevo ? inputNuevaNota.value.trim() : document.getElementById("edit-notas").value.trim();
        const desbloqueado = esNuevo ? inputNuevoDesbloqueado.checked : document.getElementById("edit-desbloqueado").checked;
        const inputImagen = esNuevo ? inputNuevoImagen : document.getElementById("edit-imagen");
        const archivo = inputImagen.files[0];

        if (!nombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (notas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }
        if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { alert("Formato de fecha inválido."); return; }

        let logro;
        if (esNuevo) {
            let nuevoId = logros.length > 0 ? Math.max(...logros.map(l => l.id)) + 1 : 1;
            logro = { id: nuevoId, nombre, fecha: fecha || "--/--/----", notas: notas || "Sin notas", desbloqueado: !!desbloqueado };
        } else {
            logro = logroActual;
            logro.nombre = nombre;
            logro.fecha = fecha || "--/--/----";
            logro.notas = notas || "Sin notas";
            logro.desbloqueado = desbloqueado;
        }

        if (archivo) {
            try {
                const base64 = await convertirImagenABase64(archivo);
                logro.imagen = base64;
            } catch (error) {
                console.error("Error al convertir imagen a Base64:", error);
                alert("Ocurrió un error con la imagen.");
                return;
            }
        }
        
        try {
            await guardarLogroEnFirebase(database, logro);
            if (esNuevo) {
                logros.push(logro);
                // Limpiar campos del formulario solo al agregar un nuevo logro
                inputNuevoNombre.value = "";
                inputNuevaFecha.value = "";
                inputNuevaNota.value = "";
                inputNuevoDesbloqueado.checked = false;
                inputNuevoImagen.value = "";
            }
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            mostrarDetalle(logro.id);
        } catch (error) {
            console.error("Error al guardar el logro:", error);
            alert("Ocurrió un error al guardar el logro.");
        }
    };

    // Agregar un nuevo logro
    btnAgregarLogro.addEventListener("click", () => validarYGuardarLogro(true));

    // Editar logro
    btnEditarLogro.addEventListener("click", () => {
        editarLogro();
    });

    // Guardar cambios de un logro
    btnGuardar.addEventListener("click", () => validarYGuardarLogro(false));
});