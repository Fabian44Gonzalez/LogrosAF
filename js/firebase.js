// js/firebase.js

/**
 * Inicializa Firebase con la configuración del proyecto.
 * 
 * ⚠️ ADVERTENCIA DE SEGURIDAD:
 * Las credenciales de Firebase (como apiKey) están diseñadas para ser públicas en aplicaciones web,
 * PERO la base de datos y el almacenamiento deben estar protegidos mediante reglas de seguridad estrictas.
 * Nunca confíes en la seguridad por oscuridad: asume que cualquiera puede ver esta configuración.
 */
export function initFirebase() {
    // Configuración del proyecto de Firebase (valores públicos para apps web)
    const firebaseConfig = {
        apiKey: "AIzaSyDk9SmqTIy_02mG7H5byhXqMz0xYJ6t7OA",
        authDomain: "logrosaf-1632f.firebaseapp.com",
        databaseURL: "https://logrosaf-1632f-default-rtdb.firebaseio.com", // ✅ Corregido: sin espacios al final
        projectId: "logrosaf-1632f",
        storageBucket: "logrosaf-1632f.appspot.com",
        messagingSenderId: "753688049020",
        appId: "1:753688049020:web:98f91e31e35e077eab20f9"
    };

    // Inicializa la app de Firebase usando los scripts cargados globalmente en el HTML
    firebase.initializeApp(firebaseConfig);

    // Devuelve una referencia a la base de datos en tiempo real (Realtime Database)
    return firebase.database();
}