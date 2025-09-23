// js/firebase.js
export const initFirebase = () => {
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
};

export const guardarLogroEnFirebase = (database, nuevoLogro, callback) => {
  database.ref("logros/" + nuevoLogro.id).set(nuevoLogro, (error) => {
    if (error) alert("Error al guardar logro.");
    else if (callback) callback();
  });
};

export const cargarLogrosFirebase = (database, callback) => {
  database.ref("logros").once("value", (snapshot) => {
    const logros = [];
    snapshot.forEach((child) => {
      logros.push({ id: Number(child.key), ...child.val() });
    });
    callback(logros);
  });
};
