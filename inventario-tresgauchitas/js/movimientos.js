document.addEventListener("DOMContentLoaded", function () {
    const tipo = document.getElementById("tipo");
    const lista = document.getElementById("listaProductos");
    const botonAgregar = document.getElementById("agregarProducto");
    const botonGuardar = document.getElementById("guardarMovimiento");
    const tablaHistorial = document.getElementById("tablaHistorial");

    if (!tipo || !lista || !botonAgregar || !botonGuardar) return;

    let productos = obtenerDatos("productos");
    let movimientos = obtenerDatos("movimientos");

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, function (caracter) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[caracter];
        });
    }

    const estilos = document.createElement("style");

    estilos.textContent = `
        .historial-movimientos {
            margin-top: 35px;
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        }

        .historial-encabezado {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }

        .historial-encabezado h2 {
            color: #172B25;
            font-size: 19px;
        }

        .historial-encabezado p {
            color: #777F78;
            font-size: 12px;
            margin-top: 5px;
        }

        #cantidadHistorial {
            background: #F4F1E9;
            color: #29483B;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 11px;
            white-space: nowrap;
        }

        .historial-tabla-contenedor {
            width: 100%;
            overflow-x: auto;
        }

        .tabla-historial {
            min-width: 650px;
        }

        .tipo-entrada {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 20px;
            background: #e5f3e9;
            color: #27633b;
            font-size: 11px;
            font-weight: 600;
        }

        .tipo-salida {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 20px;
            background: #f9e6e6;
            color: #a83232;
            font-size: 11px;
            font-weight: 600;
        }

        .btn-comprobante {
            background: #172B25;
            color: white;
            padding: 8px 12px;
            border-radius: 7px;
            font-size: 11px;
        }

        .btn-comprobante:hover {
            background: #29483B;
        }

        .historial-vacio {
            text-align: center;
            color: #777F78;
            padding: 30px;
            font-size: 13px;
        }

        .comprobante-fondo {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 9999;
        }

        .comprobante {
            background: white;
            width: 100%;
            max-width: 480px;
            border-radius: 15px;
            padding: 30px;
            max-height: 90vh;
            overflow-y: auto;
        }

        .comprobante-cabecera {
            text-align: center;
            border-bottom: 2px dashed #ddd;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }

        .comprobante-cabecera i {
            font-size: 40px;
            color: #B88A50;
            margin-bottom: 10px;
        }

        .comprobante-cabecera h2 {
            color: #172B25;
            font-size: 21px;
        }

        .comprobante-cabecera p {
            color: #777F78;
            font-size: 12px;
        }

        .comprobante-datos {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 10px 0;
            font-size: 12px;
        }

        .comprobante-datos strong {
            color: #172B25;
            text-align: right;
        }

        .comprobante-producto {
            padding: 13px 0;
            border-bottom: 1px solid #eee;
        }

        .comprobante-producto h4 {
            color: #172B25;
            font-size: 14px;
            margin-bottom: 7px;
        }

        .comprobante-producto p {
            color: #777F78;
            font-size: 12px;
            margin: 4px 0;
        }

        .comprobante-estado {
            text-align: center;
            padding: 15px;
            margin-top: 20px;
            background: #e8f3eb;
            color: #27633b;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
        }

        .comprobante-botones {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .comprobante-botones button {
            flex: 1;
        }

        .comprobante-cerrar {
            background: #eee;
            color: #303832;
        }

        @media print {
            body * {
                visibility: hidden;
            }

            .comprobante-fondo,
            .comprobante-fondo * {
                visibility: visible;
            }

            .comprobante-fondo {
                position: absolute;
                inset: 0;
                background: white;
                padding: 0;
            }

            .comprobante {
                box-shadow: none;
                max-width: 100%;
                max-height: none;
                overflow: visible;
            }

            .comprobante-botones {
                display: none;
            }
        }

        @media (max-width: 600px) {
            .historial-movimientos {
                padding: 15px;
            }

            .historial-encabezado {
                align-items: flex-start;
                flex-direction: column;
            }
        }
    `;

    document.head.appendChild(estilos);

    function actualizarEstadisticas() {
        const entradas = movimientos.filter(m => m.tipo === "entrada").length;
        const salidas = movimientos.filter(m => m.tipo === "salida").length;

        document.getElementById("totalEntradas").textContent = entradas;
        document.getElementById("totalSalidas").textContent = salidas;
        document.getElementById("totalMovimientos").textContent = movimientos.length;
    }

    function agregarFila() {
        productos = obtenerDatos("productos");

        if (productos.length === 0) {
            alert("Primero debes registrar productos en el inventario.");
            return;
        }

        const fila = document.createElement("div");
        fila.className = "producto-movimiento";

        const opciones = productos.map(function (producto) {
            return `<option value="${producto.id}">${escaparHTML(producto.nombre)} (Stock: ${producto.cantidad})</option>`;
        }).join("");

        fila.innerHTML = `
            <select class="producto">
                ${opciones}
            </select>
            <input type="number" class="cantidad" min="1" step="1" placeholder="Cantidad">
            <button type="button" class="btn-quitar-producto">Quitar</button>
        `;

        fila.querySelector(".btn-quitar-producto").addEventListener("click", function () {
            fila.remove();
        });

        lista.appendChild(fila);
    }

    function mostrarComprobante(movimiento) {
        const fondo = document.createElement("div");
        fondo.className = "comprobante-fondo";

        const fecha = new Date(movimiento.fecha);
        const fechaTexto = fecha.toLocaleDateString("es-BO");
        const horaTexto = fecha.toLocaleTimeString("es-BO");

        const productosHTML = movimiento.productos.map(function (item) {
            const stockAntes = item.stockAntes ?? "No disponible";
            const stockDespues = item.stockDespues ?? "No disponible";

            return `
                <div class="comprobante-producto">
                    <h4>${escaparHTML(item.nombre)}</h4>
                    <p>Cantidad: <strong>${item.cantidad}</strong></p>
                    <p>Stock anterior: ${stockAntes}</p>
                    <p>Stock actual: <strong>${stockDespues}</strong></p>
                </div>
            `;
        }).join("");

        fondo.innerHTML = `
            <div class="comprobante">
                <div class="comprobante-cabecera">
                    <i class="fa-solid fa-circle-check"></i>
                    <h2>Las Tres Gauchitas</h2>
                    <p>Comprobante de movimiento</p>
                </div>

                <div class="comprobante-datos">
                    <span>N.º de movimiento</span>
                    <strong>${movimiento.id}</strong>
                </div>

                <div class="comprobante-datos">
                    <span>Tipo de operación</span>
                    <strong>${movimiento.tipo.toUpperCase()}</strong>
                </div>

                <div class="comprobante-datos">
                    <span>Fecha</span>
                    <strong>${fechaTexto}</strong>
                </div>

                <div class="comprobante-datos">
                    <span>Hora</span>
                    <strong>${horaTexto}</strong>
                </div>

                <hr style="margin:18px 0; border:0; border-top:1px solid #eee;">

                <h3 style="color:#172B25; font-size:15px;">Productos registrados</h3>

                ${productosHTML}

                <div class="comprobante-estado">
                    <i class="fa-solid fa-check"></i>
                    Movimiento guardado correctamente
                </div>

                <div class="comprobante-botones">
                    <button type="button" class="comprobante-imprimir">
                        <i class="fa-solid fa-print"></i> Imprimir
                    </button>

                    <button type="button" class="comprobante-cerrar">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(fondo);

        fondo.querySelector(".comprobante-cerrar").addEventListener("click", function () {
            fondo.remove();
        });

        fondo.querySelector(".comprobante-imprimir").addEventListener("click", function () {
            window.print();
        });

        fondo.addEventListener("click", function (e) {
            if (e.target === fondo) fondo.remove();
        });
    }

    function actualizarHistorial() {
        if (!tablaHistorial) return;

        movimientos = obtenerDatos("movimientos");

        const cantidadHistorial = document.getElementById("cantidadHistorial");

        if (cantidadHistorial) {
            cantidadHistorial.textContent = movimientos.length + (movimientos.length === 1 ? " registro" : " registros");
        }

        if (movimientos.length === 0) {
            tablaHistorial.innerHTML = `
                <tr>
                    <td colspan="6" class="historial-vacio">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>No hay movimientos registrados todavía.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const ordenados = [...movimientos].sort((a, b) => b.id - a.id);

        tablaHistorial.innerHTML = ordenados.map(function (movimiento) {
            const fecha = new Date(movimiento.fecha);
            const productosTexto = movimiento.productos.map(p => escaparHTML(p.nombre) + " (x" + p.cantidad + ")").join(", ");
            const esEntrada = movimiento.tipo === "entrada";

            return `
                <tr>
                    <td>${movimiento.id}</td>
                    <td>
                        <span class="${esEntrada ? "tipo-entrada" : "tipo-salida"}">
                            ${esEntrada ? "ENTRADA" : "SALIDA"}
                        </span>
                    </td>
                    <td>${productosTexto}</td>
                    <td>${fecha.toLocaleDateString("es-BO")}</td>
                    <td>${fecha.toLocaleTimeString("es-BO")}</td>
                    <td>
                        <button type="button" class="btn-comprobante" data-id="${movimiento.id}">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    if (tablaHistorial) {
        tablaHistorial.addEventListener("click", function (e) {
            const boton = e.target.closest(".btn-comprobante");

            if (!boton) return;

            const movimiento = movimientos.find(m => String(m.id) === boton.dataset.id);

            if (movimiento) {
                mostrarComprobante(movimiento);
            }
        });
    }

    botonAgregar.addEventListener("click", agregarFila);

    botonGuardar.addEventListener("click", function () {
        const filas = lista.querySelectorAll(".producto-movimiento");

        if (filas.length === 0) {
            alert("Agrega al menos un producto.");
            return;
        }

        productos = obtenerDatos("productos");

        const cantidadesPorProducto = {};

        for (const fila of filas) {
            const id = Number(fila.querySelector(".producto").value);
            const cantidad = Number(fila.querySelector(".cantidad").value);
            const producto = productos.find(p => p.id === id);

            if (!producto || !Number.isInteger(cantidad) || cantidad <= 0) {
                alert("Revisa los productos y las cantidades.");
                return;
            }

            cantidadesPorProducto[id] = (cantidadesPorProducto[id] || 0) + cantidad;
        }

        if (tipo.value === "salida") {
            for (const id in cantidadesPorProducto) {
                const producto = productos.find(p => p.id === Number(id));

                if (cantidadesPorProducto[id] > Number(producto.cantidad)) {
                    alert("No hay suficiente stock de " + producto.nombre);
                    return;
                }
            }
        }

        const detalle = [];

        for (const id in cantidadesPorProducto) {
            const producto = productos.find(p => p.id === Number(id));
            const cantidad = cantidadesPorProducto[id];
            const stockAntes = Number(producto.cantidad);

            if (tipo.value === "entrada") {
                producto.cantidad = stockAntes + cantidad;
            } else {
                producto.cantidad = stockAntes - cantidad;
            }

            detalle.push({
                id: producto.id,
                nombre: producto.nombre,
                cantidad: cantidad,
                stockAntes: stockAntes,
                stockDespues: producto.cantidad
            });
        }

        const movimiento = {
            id: Date.now(),
            tipo: tipo.value,
            fecha: new Date().toISOString(),
            productos: detalle
        };

        movimientos.push(movimiento);

        guardarDatos("productos", productos);
        guardarDatos("movimientos", movimientos);

        lista.innerHTML = "";
        agregarFila();
        actualizarEstadisticas();
        actualizarHistorial();
        mostrarComprobante(movimiento);
    });

    agregarFila();
    actualizarEstadisticas();
    actualizarHistorial();
});