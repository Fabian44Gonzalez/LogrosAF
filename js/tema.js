// js/tema.js

export function initTemaYNavegacion() {
  const btnTemaInicio = document.getElementById("btn-cambiar-tema");
  const btnTemaMenu = document.getElementById("btn-cambiar-tema-menu");
  const btnTemaDetalle = document.getElementById("btn-cambiar-tema-detalle");
  const btnTemaNuevo = document.getElementById("btn-cambiar-tema-nuevo");
  const pantallaInicial = document.getElementById("pantalla-inicial");
  const menuLogros = document.getElementById("menu-logros");
  const detalleLogro = document.getElementById("detalle-logro");
  const nuevoLogro = document.getElementById("nuevo-logro");

  const toggleTema = () => {
    document.body.classList.toggle("op1");
    document.body.classList.toggle("op2");
  };

  if (btnTemaInicio) btnTemaInicio.addEventListener("click", toggleTema);
  if (btnTemaMenu) btnTemaMenu.addEventListener("click", toggleTema);
  if (btnTemaDetalle) btnTemaDetalle.addEventListener("click", toggleTema);
  if (btnTemaNuevo) btnTemaNuevo.addEventListener("click", toggleTema);

  function mostrarMenu() {
    // Mostrar solo el menú y ocultar las demás pantallas
    pantallaInicial.style.display = "none";
    if (detalleLogro) detalleLogro.style.display = "none";
    if (nuevoLogro) nuevoLogro.style.display = "none";
    menuLogros.style.display = "block";
  }

  return { mostrarMenu };
}   