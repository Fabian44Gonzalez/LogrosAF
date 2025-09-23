// js/logros.js
import { guardarLogroEnFirebase, cargarLogrosFirebase } from "./firebase.js";

export let logros = [];
export let logroActual = null;

export const renderizarLogros = (logrosDesbloqueados, logrosBloqueados) => {
  logrosDesbloqueados.innerHTML = "";
  logrosBloqueados.innerHTML = "";
  logros.forEach((logro) => {
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
};

export const mostrarDetalle = (id) => {
  const logro = logros.find((l) => String(l.id) === String(id));
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
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    contenedorImagen.appendChild(img);
  } else {
    contenedorImagen.textContent = "(espacio para foto)";
  }

  const labelCambiarImagen = document.getElementById("label-cambiar-imagen");
  labelCambiarImagen.style.display = "none";

  document.getElementById("detalle-fecha").textContent = logro.fecha;
  document.getElementById("detalle-notas").textContent = logro.notas;

  document.getElementById("btn-editar-logro").style.display = "inline-block";
  document.getElementById("btn-guardar-logro").style.display = "none";

  document.getElementById("btn-volver-menu").onclick = () => {
    detalleLogro.style.display = "none";
    menuLogros.style.display = "block";
  };
};

export const convertirImagenABase64 = (file, callback) => {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
};
