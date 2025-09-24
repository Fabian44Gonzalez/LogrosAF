// js/firebase.js
// AVISO: Las credenciales de la API están expuestas en el cliente.
// Asegúrate de configurar reglas de seguridad estrictas en tu consola de Firebase
// para evitar que usuarios no autorizados manipulen tus datos.

export function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyDk9SmqTIy_02mG7H5byhXqMz0xYJ6t7OA",
        authDomain: "logrosaf-1632f.firebaseapp.com",
        databaseURL: "https://logrosaf-1632f-default-rtdb.firebaseio.com",
        projectId: "logrosaf-1632f",
        storageBucket: "logrosaf-1632f.appspot.com",
        messagingSenderId: "753688049020",
        appId: "1:753688049020:web:98f91e31e35e077eab20f9"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return firebase.database();
}

// Cargar logros desde Firebase
export async function cargarLogrosFirebase(database) {
    const snapshot = await database.ref("logros").once("value");
    const datos = [];
    snapshot.forEach(child => {
        const logro = child.val();
        logro.firebaseId = child.key; // Añadimos la clave de Firebase al objeto
        datos.push(logro);
    });
    return datos;
}

// Guardar o actualizar un logro en Firebase
export async function guardarLogroEnFirebase(database, logro) {
    if (logro.firebaseId) {
        // Si el logro ya tiene un ID de Firebase, lo actualizamos
        await database.ref("logros/" + logro.firebaseId).set(logro);
    } else {
        // Si no tiene, es un logro nuevo, lo creamos con un ID único
        const newRef = database.ref("logros").push();
        logro.firebaseId = newRef.key;
        await newRef.set(logro);
    }
}