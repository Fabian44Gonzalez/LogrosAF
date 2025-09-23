// js/tema.js

export function initTemaYNavegacion() {
  const btnCambiarTema = document.getElementById("btn-cambiar-tema");
  const pantallaInicial = document.getElementById("pantalla-inicial");
  const menuLogros = document.getElementById("menu-logros");

  // Cambio de tema
  btnCambiarTema.addEventListener("click", () => {
    document.body.classList.toggle("op1");
    document.body.classList.toggle("op2");
  });

  function mostrarMenu() {
    pantallaInicial.style.display = "none";
    menuLogros.style.display = "block";
  }

  return { mostrarMenu };
}
