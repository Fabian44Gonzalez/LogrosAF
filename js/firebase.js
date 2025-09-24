// js/firebase.js

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

// Ahora la función devuelve una promesa y se maneja con async/await
export function cargarLogrosFirebase(database) {
    return new Promise((resolve, reject) => {
        database.ref("logros").once("value", snapshot => {
            const datos = [];
            snapshot.forEach(child => {
                datos.push({ id: Number(child.key), ...child.val() });
            });
            resolve(datos);
        }, reject);
    });
}

// Ahora la función devuelve una promesa y se maneja con async/await
export function guardarLogroEnFirebase(database, logro) {
    return new Promise((resolve, reject) => {
        database.ref("logros/" + logro.id).set(logro, error => {
            if (error) {
                alert("Error al guardar logro.");
                reject(error);
            } else {
                resolve();
            }
        });
    });
}