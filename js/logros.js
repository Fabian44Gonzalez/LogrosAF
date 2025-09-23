// js/logros.js
import { guardarLogroEnFirebase } from "./firebase.js";

export let logros = [];
export let logroActual = null;

export const renderizarLogros = (desbloqueados, bloqueados) => {
  desbloqueados.innerHTML = "";
  bloqueados.innerHTML = "";

  logros.forEach((logro) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = logro.desbloqueado ? `${logro.id}. ${logro.nombre} ✅` : `${logro.id}. ${logro.nombre} 🔒`;
    btn.addEventListener("click", () => mostrarDetalle(logro.id));
    li.appendChild(btn);
    if (logro.desbloqueado) desbloqueados.appendChild(li);
    else bloqueados.appendChild(li);
  });
};

export const mostrarDetalle = (id) => {
  const logro = logros.find(l => l.id === id);
  if (!logro) return;
  logroActual = logro;

  document.getElementById("menu-logros").style.display = "none";
  document.getElementById("detalle-logro").style.display = "block";

  document.getElementById("detalle-titulo").textContent = `Logro #${logro.id}: ${logro.nombre}`;
  const contenedorImagen = document.getElementById("detalle-imagen");
  contenedorImagen.innerHTML = "";

  if (logro.imagen) {
    const img = document.createElement("img");
    img.src = logro.imagen;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    contenedorImagen.appendChild(img);
  } else contenedorImagen.textContent = "(espacio para foto)";

  document.getElementById("label-cambiar-imagen").style.display = "none";
  document.getElementById("detalle-fecha").textContent = logro.fecha;
  document.getElementById("detalle-notas").textContent = logro.notas;

  document.getElementById("btn-editar-logro").style.display = "inline-block";
  document.getElementById("btn-guardar-logro").style.display = "none";
};

export const convertirImagenABase64 = (file, callback) => {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
};

export const editarLogro = () => {
  if (!logroActual) {
    alert("Debes seleccionar un logro primero.");
    return;
  }

  const titulo = document.getElementById("detalle-titulo");
  const fecha = document.getElementById("detalle-fecha");
  const notas = document.getElementById("detalle-notas");

  titulo.innerHTML = `<input type="text" id="edit-nombre" class="form-input" value="${logroActual.nombre}" maxlength="50">`;
  fecha.innerHTML = `<input type="date" id="edit-fecha" class="form-input" value="${logroActual.fecha !== '--/--/----' ? logroActual.fecha : ''}">`;
  notas.innerHTML = `<textarea id="edit-notas" class="form-input" maxlength="200">${logroActual.notas}</textarea>
  <label>Desbloqueado: <input type="checkbox" id="edit-desbloqueado" ${logroActual.desbloqueado ? "checked" : ""}></label>`;

  document.getElementById("label-cambiar-imagen").style.display = "block";
  document.getElementById("btn-editar-logro").style.display = "none";
  document.getElementById("btn-guardar-logro").style.display = "inline-block";
};
