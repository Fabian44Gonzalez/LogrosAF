// js/tema.js
export const initTemaYNavegacion = () => {
  const btnTema = document.getElementById("btn-cambiar-tema");
  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("op1");
    document.body.classList.toggle("op2");
  });

  const pantallaInicial = document.getElementById("pantalla-inicial");
  const menuLogros = document.getElementById("menu-logros");
  const btnVolverInicio = document.getElementById("btn-volver-inicio");

  btnVolverInicio.addEventListener("click", () => {
    menuLogros.style.display = "none";
    pantallaInicial.style.display = "block";
  });

  const mostrarMenu = () => {
    pantallaInicial.style.display = "none";
    menuLogros.style.display = "block";
  };

  return { mostrarMenu };
};
