
document.addEventListener("DOMContentLoaded", function () {

    // ELEMENTOS DEL PANEL
    const totalProductos = document.getElementById("totalProductos");
    const stockBajo = document.getElementById("stockBajo");
    const porVencer = document.getElementById("porVencer");
    const ventasHoy = document.getElementById("ventasHoy");

    // OBTENER DATOS
    function obtenerLista(clave) {
        if (typeof obtenerDatos === "function") {
            const datos = obtenerDatos(clave);
            return Array.isArray(datos) ? datos : [];
        }

        return [];
    }

    // ACTUALIZAR ESTADÍSTICAS
    function actualizarPanel() {

        const productos = obtenerLista("productos");
        const movimientos = obtenerLista("movimientos");

        // TOTAL DE PRODUCTOS REGISTRADOS
        if (totalProductos) {
            totalProductos.textContent = productos.length;
        }

        // PRODUCTOS CON STOCK BAJO
        if (stockBajo) {
            const cantidad = productos.filter(producto => {
                return Number(producto.cantidad) <= 5;
            }).length;

            stockBajo.textContent = cantidad;
        }

        // PRODUCTOS PRÓXIMOS A VENCER
        if (porVencer) {

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const limite = new Date();
            limite.setDate(limite.getDate() + 30);
            limite.setHours(23, 59, 59, 999);

            const cantidad = productos.filter(producto => {

                if (!producto.vencimiento) return false;

                const fecha = new Date(
                    producto.vencimiento + "T00:00:00"
                );

                return !isNaN(fecha.getTime()) &&
                       fecha >= hoy &&
                       fecha <= limite;

            }).length;

            porVencer.textContent = cantidad;
        }

        // MOVIMIENTOS DEL DÍA
        if (ventasHoy) {

            const hoy = new Date().toLocaleDateString("en-CA");

            const cantidad = movimientos.filter(movimiento => {

                if (!movimiento.fecha) return false;

                return String(movimiento.fecha).substring(0, 10) === hoy;

            }).length;

            ventasHoy.textContent = cantidad;
        }
    }

    // ACTUALIZAR AL ENTRAR
    actualizarPanel();

    // ACTUALIZAR AL REGRESAR A LA PÁGINA
    window.addEventListener("pageshow", actualizarPanel);

    // ACTUALIZAR SI CAMBIAN LOS DATOS EN OTRA PESTAÑA
    window.addEventListener("storage", actualizarPanel);

});
