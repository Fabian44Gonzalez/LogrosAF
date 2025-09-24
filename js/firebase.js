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

    firebase.initializeApp(firebaseConfig);
    return firebase.database();
}

// Cargar logros desde Firebase usando async/await
export async function cargarLogrosFirebase(database) {
    const snapshot = await database.ref("logros").once("value");
    const datos = [];
    snapshot.forEach(child => {
        datos.push({ id: Number(child.key), ...child.val() });
    });
    return datos;
}

// Guardar logro en Firebase usando async/await
export async function guardarLogroEnFirebase(database, logro) {
    await database.ref("logros/" + logro.id).set(logro);
}
