// js/tema.js
export function initTema() {
    const btnCambiarTema = document.getElementById("btn-cambiar-tema");

    btnCambiarTema.addEventListener("click", () => {
        document.body.classList.toggle("op1");
        document.body.classList.toggle("op2");
    });
}