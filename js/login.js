
const formulario = document.getElementById("formLogin");
const usuario = document.getElementById("usuario");
const contrasena = document.getElementById("contrasena");
const repetirContrasena = document.getElementById("repetirContrasena");

const campoRepetir = document.getElementById("campoRepetir");
const titulo = document.getElementById("tituloFormulario");
const descripcion = document.getElementById("descripcionFormulario");
const botonAcceso = document.getElementById("botonAcceso");
const botonCambiar = document.getElementById("botonCambiar");
const textoCambiar = document.getElementById("textoCambiar");
const mensaje = document.getElementById("mensajeLogin");
const botonMostrar = document.getElementById("mostrarPassword");

let modoRegistro = false;

if (localStorage.getItem("usuarioActivo")) {
    window.location.replace("index.html");
}

window.addEventListener("pageshow", function () {
    if (localStorage.getItem("usuarioActivo")) {
        window.location.replace("index.html");
    }
});

function obtenerCuentas() {
    return JSON.parse(localStorage.getItem("cuentas")) || {};
}

function mostrarMensaje(texto, color = "#C94C4C") {
    mensaje.textContent = texto;
    mensaje.style.color = color;
}

botonCambiar.addEventListener("click", function () {
    modoRegistro = !modoRegistro;
    formulario.reset();
    mostrarMensaje("");

    if (modoRegistro) {
        titulo.textContent = "Crear cuenta";
        descripcion.textContent = "Regístrate para acceder al sistema";
        botonAcceso.textContent = "Registrarme";
        campoRepetir.style.display = "block";
        repetirContrasena.required = true;
        textoCambiar.textContent = "¿Ya tienes una cuenta?";
        botonCambiar.textContent = "Iniciar sesión";
    } else {
        titulo.textContent = "Iniciar sesión";
        descripcion.textContent = "Ingresa tus datos para continuar";
        botonAcceso.textContent = "Ingresar";
        campoRepetir.style.display = "none";
        repetirContrasena.required = false;
        textoCambiar.textContent = "¿No tienes una cuenta?";
        botonCambiar.textContent = "Crear cuenta";
    }
});

if (botonMostrar) {
    botonMostrar.addEventListener("click", function () {
        const visible = contrasena.type === "text";

        contrasena.type = visible ? "password" : "text";

        if (repetirContrasena) {
            repetirContrasena.type = visible ? "password" : "text";
        }

        botonMostrar.innerHTML = visible
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';
    });
}

formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = usuario.value.trim();
    const clave = contrasena.value;
    const cuentas = obtenerCuentas();

    if (nombre.length < 3) {
        mostrarMensaje("El usuario debe tener al menos 3 caracteres.");
        return;
    }

    if (clave.length < 5) {
        mostrarMensaje("La contraseña debe tener al menos 5 caracteres.");
        return;
    }

    if (modoRegistro) {
        if (cuentas[nombre]) {
            mostrarMensaje("Este usuario ya está registrado.");
            return;
        }

        if (clave !== repetirContrasena.value) {
            mostrarMensaje("Las contraseñas no coinciden.");
            return;
        }

        cuentas[nombre] = clave;
        localStorage.setItem("cuentas", JSON.stringify(cuentas));

        localStorage.setItem("usuarioActivo", nombre);
        window.location.replace("index.html");
    } else {
        if (cuentas[nombre] && cuentas[nombre] === clave) {
            localStorage.setItem("usuarioActivo", nombre);
            window.location.replace("index.html");
        } else {
            mostrarMensaje("Usuario o contraseña incorrectos.");
        }
    }
});
