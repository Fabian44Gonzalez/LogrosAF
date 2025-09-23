// js/main.js
import { initFirebase, guardarLogroEnFirebase, cargarLogrosFirebase } from "./firebase.js";
import { logros, logroActual, renderizarLogros, mostrarDetalle, convertirImagenABase64, editarLogro } from "./logros.js";
import { initTemaYNavegacion } from "./tema.js";

document.addEventListener("DOMContentLoaded", () => {

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

  // Volver al menú
  btnVolverMenu.addEventListener("click", () => {
    detalleLogro.style.display = "none";
    menuLogros.style.display = "block";
  });

  // Cargar logros y luego registrar iniciar
  cargarLogrosFirebase(database, (datos) => {
    logros.length = 0;
    datos.forEach(l => logros.push(l));

    // Iniciar partida
    btnIniciar.addEventListener("click", () => {
      if (!inputJugador1.value) inputJugador1.value = "Atenea";
      if (!inputJugador2.value) inputJugador2.value = "Fabian";
      renderizarLogros(logrosDesbloqueados, logrosBloqueados);
      mostrarMenu();
    });
  });

  // Agregar nuevo logro
  btnAgregarLogro.addEventListener("click", () => {
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
      if (archivo.size > 2 * 1024 * 1024) { alert("La imagen no puede superar 2MB."); return; }
      convertirImagenABase64(archivo, (base64) => {
        nuevoLogro.imagen = base64;
        guardarLogroEnFirebase(database, nuevoLogro, () => mostrarDetalle(nuevoLogro.id));
      });
    } else {
      guardarLogroEnFirebase(database, nuevoLogro, () => mostrarDetalle(nuevoLogro.id));
    }

    inputNuevoNombre.value = "";
    inputNuevaFecha.value = "";
    inputNuevaNota.value = "";
    inputNuevoDesbloqueado.checked = false;
    inputNuevoImagen.value = "";
  });

  // Editar logro
  btnEditarLogro.addEventListener("click", () => {
    editarLogro();
  });

  // Guardar cambios
  btnGuardar.addEventListener("click", () => {
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
      convertirImagenABase64(archivo, (base64) => {
        logroActual.imagen = base64;
        guardarLogroEnFirebase(database, logroActual, () => mostrarDetalle(logroActual.id));
      });
    } else {
      guardarLogroEnFirebase(database, logroActual, () => mostrarDetalle(logroActual.id));
    }
  });

});
