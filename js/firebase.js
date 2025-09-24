// js/firebase.js

export function initFirebase() {
    // AVISO DE SEGURIDAD: Estas credenciales están expuestas.
    // Asegúrate de configurar reglas de seguridad estrictas en Firebase para proteger tu base de datos.
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