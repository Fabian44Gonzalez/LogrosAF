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

    btnAgregarLogro.addEventListener("click", async () => {
        const nombre = inputNuevoNombre.value.trim();
        const fecha = inputNuevaFecha.value.trim();
        const notas = inputNuevaNota.value.trim();
        const desbloqueado = inputNuevoDesbloqueado.checked;

        if (!nombre) {
            alert("El nombre del logro es obligatorio.");
            return;
        }

        if (nombre.length > 50) {
            alert("El nombre no puede superar 50 caracteres.");
            return;
        }

        if (notas.length > 200) {
            alert("Las notas no pueden superar 200 caracteres.");
            return;
        }

        // Obtener el ID del último logro y generar el siguiente
        const ultimoLogro = logros.length > 0 ? logros[logros.length - 1] : { id: 0 };
        const nuevoId = ultimoLogro.id + 1;

        let nuevoLogro = { id: nuevoId, nombre, fecha: fecha || "--/--/----", notas: notas || "Sin notas", desbloqueado: !!desbloqueado };
        
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

        // Guardar en la base de datos
        await database.ref("logros/" + nuevoId).set(nuevoLogro);
        
        // Agregar al array local
        logros.push(nuevoLogro);

        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
        mostrarDetalle(nuevoId);
        limpiarCampos();
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

        if (!nuevoNombre) {
            alert("El nombre del logro es obligatorio.");
            return;
        }

        if (nuevoNombre.length > 50) {
            alert("El nombre no puede superar 50 caracteres.");
            return;
        }

        if (nuevasNotas.length > 200) {
            alert("Las notas no pueden superar 200 caracteres.");
            return;
        }

        // Actualizar el objeto local
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

        // Guardar los cambios en la base de datos
        await database.ref("logros/" + logroActual.id).set(logroActual);

        // Volver a renderizar para reflejar los cambios
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
        volverAMostrarDetalle(logroActual.id);
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