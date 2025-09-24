import { guardarLogroEnFirebase, cargarLogrosFirebase } from "./firebase.js";
import { logros, renderizarLogros, mostrarDetalle, convertirImagenABase64, editarLogro, volverAMostrarDetalle, logroActual, setLogroActual } from "./logros.js";
import { initTema } from "./tema.js";

document.addEventListener("DOMContentLoaded", async () => {
    const database = firebase.database();
    initTema();

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

    const mostrarMenu = () => {
        pantallaInicial.style.display = "none";
        menuLogros.style.display = "block";
        detalleLogro.style.display = "none";
    };

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

        if (!nombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (notas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }

        let nuevoLogro = { nombre, fecha: fecha || "--/--/----", notas: notas || "Sin notas", desbloqueado: !!desbloqueado };
        
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
            const datos = await cargarLogrosFirebase(database);
            logros.length = 0;
            datos.forEach(l => logros.push(l));
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            mostrarDetalle(nuevoLogro.firebaseId);
            limpiarCampos();
        } catch (error) {
            console.error("Error al guardar el logro:", error);
            alert("Ocurrió un error al guardar el logro.");
        }
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

        if (!nuevoNombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nuevoNombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (nuevasNotas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }

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
            const datos = await cargarLogrosFirebase(database);
            logros.length = 0;
            datos.forEach(l => logros.push(l));
            renderizarLogros(logrosDesbloqueados, logrosBloqueados);
            volverAMostrarDetalle(logroActual.firebaseId);
        } catch (error) {
            console.error("Error al guardar el logro:", error);
            alert("Ocurrió un error al guardar los cambios.");
        }
    });

    const limpiarCampos = () => {
        inputNuevoNombre.value = "";
        inputNuevaFecha.value = "";
        inputNuevaNota.value = "";
        inputNuevoDesbloqueado.checked = false;
        inputNuevoImagen.value = "";
    };

    try {
        const datos = await cargarLogrosFirebase(database);
        logros.length = 0;
        datos.forEach(l => logros.push(l));
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
    } catch (error) {
        console.error("Error al cargar los logros:", error);
        alert("Ocurrió un error al cargar los logros.");
    }
});