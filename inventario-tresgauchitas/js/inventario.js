document.addEventListener("DOMContentLoaded", function () {
    const tabla = document.getElementById("tablaProductos");
    const buscar = document.getElementById("buscar");
    const botonAgregar = document.getElementById("agregar");
    const modal = document.getElementById("modal");
    const formulario = document.getElementById("formulario");
    const botonCancelar = document.getElementById("cancelar");

    if (!tabla || !formulario) return;

    let productos = obtenerDatos("productos");
    let editando = null;

    function guardar() {
        guardarDatos("productos", productos);
        mostrarProductos(buscar ? buscar.value : "");
    }

    function mostrarProductos(filtro = "") {
        tabla.innerHTML = "";

        productos
            .filter(function (producto) {
                const texto = (
                    producto.nombre + " " +
                    (producto.categoria || "") + " " +
                    (producto.descripcion || "")
                ).toLowerCase();

                return texto.includes(filtro.toLowerCase());
            })
            .forEach(function (producto) {
                const fila = document.createElement("tr");

                const fecha = producto.vencimiento
                    ? producto.vencimiento.split("-").reverse().join("/")
                    : "-";

                fila.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria || "-"}</td>
                    <td>${producto.descripcion || "-"}</td>
                    <td>${producto.cantidad}</td>
                    <td>${Number(producto.precio).toFixed(2)}</td>
                    <td>${fecha}</td>
                    <td>
                        <button class="editar" data-id="${producto.id}">Editar</button>
                        <button class="eliminar" data-id="${producto.id}">Eliminar</button>
                    </td>
                `;

                tabla.appendChild(fila);
            });
    }

    function abrirModal() {
        if (modal) modal.style.display = "flex";
    }

    function cerrarModal() {
        if (modal) modal.style.display = "none";
        formulario.reset();
        editando = null;
    }

    if (botonAgregar) {
        botonAgregar.addEventListener("click", function () {
            editando = null;
            formulario.reset();
            abrirModal();
        });
    }

    if (botonCancelar) {
        botonCancelar.addEventListener("click", cerrarModal);
    }

    formulario.addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = formulario.elements.namedItem("nombre").value.trim();
        const categoria = formulario.elements.namedItem("categoria").value.trim();
        const descripcion = formulario.elements.namedItem("descripcion").value.trim();
        const cantidad = Number(formulario.elements.namedItem("cantidad").value);
        const precio = Number(formulario.elements.namedItem("precio").value);
        const vencimiento = formulario.elements.namedItem("vencimiento")?.value || "";

        if (!nombre || cantidad < 0 || precio < 0) {
            alert("Completa correctamente los datos del producto.");
            return;
        }

        if (editando !== null) {
            const producto = productos.find(p => p.id === editando);

            if (producto) {
                producto.nombre = nombre;
                producto.categoria = categoria;
                producto.descripcion = descripcion;
                producto.cantidad = cantidad;
                producto.precio = precio;
                producto.vencimiento = vencimiento;
            }
        } else {
            productos.push({
                id: Date.now(),
                nombre,
                categoria,
                descripcion,
                cantidad,
                precio,
                vencimiento
            });
        }

        guardar();
        cerrarModal();
    });

    tabla.addEventListener("click", function (e) {
        const boton = e.target.closest("button");

        if (!boton) return;

        const id = Number(boton.dataset.id);

        if (!id) return;

        if (boton.classList.contains("eliminar")) {
            if (confirm("¿Deseas eliminar este producto?")) {
                productos = productos.filter(p => p.id !== id);
                guardar();
            }
        }

        if (boton.classList.contains("editar")) {
            const producto = productos.find(p => p.id === id);

            if (!producto) return;

            editando = id;

            formulario.elements.namedItem("nombre").value = producto.nombre;
            formulario.elements.namedItem("categoria").value = producto.categoria || "";
            formulario.elements.namedItem("descripcion").value = producto.descripcion || "";
            formulario.elements.namedItem("cantidad").value = producto.cantidad;
            formulario.elements.namedItem("precio").value = producto.precio;

            formulario.elements.namedItem("vencimiento").value = producto.vencimiento || "";

            abrirModal();
        }
    });

    if (buscar) {
        buscar.addEventListener("input", function () {
            mostrarProductos(buscar.value);
        });
    }

    mostrarProductos();
});