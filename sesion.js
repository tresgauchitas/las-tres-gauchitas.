
function usuarioActual() {
    return localStorage.getItem("usuarioActivo");
}

function guardarDatos(nombre, datos) {
    const usuario = usuarioActual();

    if (!usuario) return;

    localStorage.setItem(
        usuario + "_" + nombre,
        JSON.stringify(datos)
    );
}

function obtenerDatos(nombre) {
    const usuario = usuarioActual();

    if (!usuario) return [];

    return JSON.parse(
        localStorage.getItem(usuario + "_" + nombre)
    ) || [];
}

function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    window.location.replace("login.html");
}

function verificarSesion() {
    if (!usuarioActual()) {
        window.location.replace("login.html");
    }
}

verificarSesion();

window.addEventListener("pageshow", function () {
    verificarSesion();
});

document.addEventListener("DOMContentLoaded", function () {
    const enlaces = document.querySelectorAll('a[href="login.html"]');

    enlaces.forEach(function (enlace) {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();
            cerrarSesion();
        });
    });
});
