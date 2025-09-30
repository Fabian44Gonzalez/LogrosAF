// js/main.js
import { initFirebase } from "./firebase.js";
import { initTemaYNavegacion } from "./tema.js";
import { logros, renderizarLogros, mostrarDetalle, editarLogro, volverAMostrarDetalle, logroActual, setLogroActual, convertirImagenABase64 } from "./logros.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar Firebase
    const database = initFirebase();

    // 🔑 Referencias para login secreto
    const loginSecreto = document.getElementById("login-secreto");
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    // 🔑 Mostrar login al presionar 'L' (solo escritorio)
    document.addEventListener("keydown", (e) => {
        if (e.key === "l" || e.key === "L") {
            loginSecreto.style.display = "block";
        }
    });

    // 🔑 Login secreto por toque (móvil): 5 toques en el título
    let toques = 0;
    let ultimoToque = 0;
    const titulo = document.querySelector("header h1");
    if (titulo) {
        titulo.addEventListener("click", () => {
            const ahora = Date.now();
            if (ahora - ultimoToque < 500) {
                toques++;
            } else {
                toques = 1;
            }
            ultimoToque = ahora;

            if (toques >= 5) {
                loginSecreto.style.display = "block";
                toques = 0;
            }
        });
    }

    // 🔑 Manejar login
    btnLogin.addEventListener("click", async () => {
        try {
            await firebase.auth().signInWithEmailAndPassword(
                emailInput.value.trim(),
                passwordInput.value
            );
            alert("¡Autenticado! Ahora puedes editar.");
            loginSecreto.style.display = "none";
            passwordInput.value = "";
            actualizarVisibilidadBotones(true);
        } catch (error) {
            console.error("Error de login:", error);
            alert("Error: " + (error.message || "credenciales inválidas"));
        }
    });

    // 🔑 Manejar logout
    btnLogout.addEventListener("click", async () => {
        await firebase.auth().signOut();
        alert("Sesión cerrada.");
        actualizarVisibilidadBotones(false);
    });

    // 🔑 Verificar estado de autenticación al cargar
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            btnLogout.style.display = "inline-block";
            actualizarVisibilidadBotones(true);
        } else {
            btnLogout.style.display = "none";
            actualizarVisibilidadBotones(false);
        }
    });

    // 🔑 Función para mostrar/ocultar botones de edición
    function actualizarVisibilidadBotones(autenticado) {
        const btnAgregar = document.getElementById("btn-agregar-logro");
        const btnEditar = document.getElementById("btn-editar-logro");
        if (btnAgregar) btnAgregar.style.display = autenticado ? "inline-flex" : "none";
        if (btnEditar) btnEditar.style.display = autenticado ? "inline-block" : "none";
    }

    // === 🔑 NUEVO: Lógica del filtro de logros ===
    const selectFiltro = document.getElementById("filtro-logros");
    const seccionDesbloqueados = document.getElementById("seccion-desbloqueados");
    const seccionBloqueados = document.getElementById("seccion-bloqueados");

    // Aplicar filtro al cambiar la selección
    selectFiltro.addEventListener("change", () => {
        const valor = selectFiltro.value;
        if (valor === "todos") {
            seccionDesbloqueados.style.display = "block";
            seccionBloqueados.style.display = "block";
        } else if (valor === "desbloqueados") {
            seccionDesbloqueados.style.display = "block";
            seccionBloqueados.style.display = "none";
        } else if (valor === "bloqueados") {
            seccionDesbloqueados.style.display = "none";
            seccionBloqueados.style.display = "block";
        }
    });

    // === Resto de tu código existente ===
    const pantallaInicial = document.getElementById("pantalla-inicial");
    const menuLogros = document.getElementById("menu-logros");
    const detalleLogro = document.getElementById("detalle-logro");
    const logrosDesbloqueados = document.getElementById("logros-desbloqueados");
    const logrosBloqueados = document.getElementById("logros-bloqueados");
    const inputJugador1 = document.getElementById("jugador1");
    const inputJugador2 = document.getElementById("jugador2");
    const btnIniciar = document.getElementById("btn-iniciar");
    const btnVolverMenuDetalle = document.getElementById("btn-volver-menu");
    const btnVolverInicio = document.getElementById("btn-volver-inicio");
    const nuevoLogro = document.getElementById("nuevo-logro");
    const btnVolverNuevo = document.getElementById("btn-volver-nuevo");
    const btnGuardarNuevo = document.getElementById("btn-guardar-nuevo");
    const inputNuevoNombre = document.getElementById("nuevo-nombre");
    const inputNuevaFecha = document.getElementById("nueva-fecha");
    const inputNuevaNota = document.getElementById("nueva-nota");
    const inputNuevoDesbloqueado = document.getElementById("nuevo-desbloqueado");
    const inputNuevoImagen = document.getElementById("nuevo-imagen");

    const { mostrarMenu } = initTemaYNavegacion();

    // Función para renderizar logros Y aplicar el filtro actual
    const renderizarConFiltro = () => {
        renderizarLogros(logrosDesbloqueados, logrosBloqueados);
        // Aplicar el filtro actual (por si se cambió antes de renderizar)
        const valor = selectFiltro.value;
        if (valor === "todos") {
            seccionDesbloqueados.style.display = "block";
            seccionBloqueados.style.display = "block";
        } else if (valor === "desbloqueados") {
            seccionDesbloqueados.style.display = "block";
            seccionBloqueados.style.display = "none";
        } else if (valor === "bloqueados") {
            seccionDesbloqueados.style.display = "none";
            seccionBloqueados.style.display = "block";
        }
    };

    // 🔑 Proteger botón de guardar nuevo logro
    btnGuardarNuevo.addEventListener("click", async () => {
        if (!firebase.auth().currentUser) {
            alert("Debes iniciar sesión para crear logros.");
            return;
        }
        const nombre = inputNuevoNombre.value.trim();
        const fecha = inputNuevaFecha.value.trim();
        const notas = inputNuevaNota.value.trim();
        const desbloqueado = inputNuevoDesbloqueado.checked;

        if (!nombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (notas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }

        const prevText = btnGuardarNuevo.textContent;
        btnGuardarNuevo.textContent = "Guardando...";
        btnGuardarNuevo.disabled = true;
        btnGuardarNuevo.setAttribute("aria-busy", "true");

        try {
            const maxId = logros.length > 0 ? Math.max(...logros.map(l => Number(l.id) || 0)) : 0;
            const nuevoId = maxId + 1;
            let nuevoLogroObj = { id: nuevoId, nombre, fecha: fecha || "--/--/----", notas: notas || "Sin notas", desbloqueado: !!desbloqueado, dificultad: 0 };

            const archivo = inputNuevoImagen.files[0];
            if (archivo) {
                const base64 = await convertirImagenABase64(archivo);
                nuevoLogroObj.imagen = base64;
            }

            await database.ref("logros/" + nuevoId).set(nuevoLogroObj);
            logros.push(nuevoLogroObj);

            nuevoLogro.style.display = "none";
            mostrarDetalle(nuevoId);
            limpiarCampos();
            // 🔑 Renderizar con filtro aplicado
            renderizarConFiltro();
        } catch (error) {
            console.error("Error al guardar el nuevo logro:", error);
            alert("Ocurrió un error al guardar el logro. Inténtalo de nuevo.");
        } finally {
            btnGuardarNuevo.textContent = prevText;
            btnGuardarNuevo.disabled = false;
            btnGuardarNuevo.removeAttribute("aria-busy");
        }
    });

    // 🔑 Proteger botón de guardar edición
    const btnGuardar = document.getElementById("btn-guardar-logro");
    btnGuardar.addEventListener("click", async () => {
        if (!firebase.auth().currentUser) {
            alert("Debes iniciar sesión para editar logros.");
            return;
        }
        if (!logroActual) return;

        const nuevoNombre = document.getElementById("edit-nombre").value.trim();
        const nuevaFecha = document.getElementById("edit-fecha").value.trim();
        const nuevasNotas = document.getElementById("edit-notas").value.trim();
        const desbloqueado = document.getElementById("edit-desbloqueado").checked;
        const contDificultad = document.getElementById("detalle-dificultad");
        const nuevaDificultad = Number(contDificultad?.dataset?.valor || 0);

        if (!nuevoNombre) { alert("El nombre del logro es obligatorio."); return; }
        if (nuevoNombre.length > 50) { alert("El nombre no puede superar 50 caracteres."); return; }
        if (nuevasNotas.length > 200) { alert("Las notas no pueden superar 200 caracteres."); return; }

        const prevText = btnGuardar.textContent;
        btnGuardar.textContent = "Guardando...";
        btnGuardar.disabled = true;
        btnGuardar.setAttribute("aria-busy", "true");

        try {
            logroActual.nombre = nuevoNombre;
            logroActual.fecha = nuevaFecha || "--/--/----";
            logroActual.notas = nuevasNotas || "Sin notas";
            logroActual.desbloqueado = desbloqueado;
            logroActual.dificultad = nuevaDificultad;

            const inputEditImagen = document.getElementById("edit-imagen");
            const archivo = inputEditImagen.files[0];
            if (archivo) {
                const base64 = await convertirImagenABase64(archivo);
                logroActual.imagen = base64;
            }

            await database.ref("logros/" + logroActual.id).set(logroActual);
            volverAMostrarDetalle(logroActual.id);
            // 🔑 Renderizar con filtro aplicado
            renderizarConFiltro();
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            alert("Ocurrió un error al guardar los cambios. Inténtalo de nuevo.");
        } finally {
            btnGuardar.textContent = prevText;
            btnGuardar.disabled = false;
            btnGuardar.removeAttribute("aria-busy");
        }
    });

    // Resto de event listeners (sin cambios)
    btnIniciar.addEventListener("click", () => {
        if (!inputJugador1.value) inputJugador1.value = "Atenea";
        if (!inputJugador2.value) inputJugador2.value = "Fabian";
        mostrarMenu();
        renderizarConFiltro(); // 🔑 Usar función con filtro
    });

    btnVolverMenuDetalle.addEventListener("click", () => {
        mostrarMenu();
        renderizarConFiltro(); // 🔑 Usar función con filtro
    });
    btnVolverInicio.addEventListener("click", () => {
        menuLogros.style.display = "none";
        pantallaInicial.style.display = "block";
    });

    const btnAgregarLogro = document.getElementById("btn-agregar-logro");
    btnAgregarLogro.addEventListener("click", () => {
        // 🔑 Verificar autenticación antes de abrir
        if (!firebase.auth().currentUser) {
            alert("Debes iniciar sesión para crear logros.");
            return;
        }
        menuLogros.style.display = "none";
        nuevoLogro.style.display = "block";
    });

    const btnEditarLogro = document.getElementById("btn-editar-logro");
    btnEditarLogro.addEventListener("click", () => {
        if (!logroActual) return;
        // 🔑 Verificar autenticación
        if (!firebase.auth().currentUser) {
            alert("Debes iniciar sesión para editar logros.");
            return;
        }
        editarLogro(logroActual);
    });

    btnVolverNuevo.addEventListener("click", () => {
        nuevoLogro.style.display = "none";
        menuLogros.style.display = "block";
    });

    const limpiarCampos = () => {
        inputNuevoNombre.value = "";
        inputNuevaFecha.value = "";
        inputNuevaNota.value = "";
        inputNuevoDesbloqueado.checked = false;
        inputNuevoImagen.value = "";
    };

    // Cargar logros
    try {
        const snapshot = await database.ref("logros").once("value");
        snapshot.forEach(child => {
            const logro = child.val();
            logros.push(logro);
        });
        renderizarConFiltro(); // 🔑 Usar función con filtro al cargar
    } catch (error) {
        console.error("Error al cargar los logros:", error);
    }
});