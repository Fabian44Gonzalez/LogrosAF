// js/tema.js
export const initTemaYNavegacion = () => {
  const btnCambiarTema = document.getElementById("btn-cambiar-tema");
  btnCambiarTema.addEventListener("click", () => {
    document.body.classList.toggle("op1");
    document.body.classList.toggle("op2");
  });

  const pantallaInicial = document.getElementById("pantalla-inicial");
  const menuLogros = document.getElementById("menu-logros");
  const btnVolverInicio = document.getElementById("btn-volver-inicio");

  const mostrarMenu = () => {
    pantallaInicial.style.display = "none";
    menuLogros.style.display = "block";
  };
  const volverInicio = () => {
    menuLogros.style.display = "none";
    pantallaInicial.style.display = "block";
  };

  btnVolverInicio.addEventListener("click", volverInicio);

  return { mostrarMenu, volverInicio };
};
