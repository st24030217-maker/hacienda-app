/**
 * Lógica Interactiva del Frontend PHP conectada a la API REST en .NET
 * Sistema de Gestión Restaurante Buffet "La Hacienda"
 * Precios: Adulto $280.00 | Niño $180.00 | Mesas de 4, 6 y 10 personas
 */

const CONFIG = window.APP_CONFIG || {
    apiUrl: "http://localhost:5080/api",
    proxyUrl: "api_client.php?proxy=1&endpoint=",
    precioAdulto: 280.00,
    precioNino: 180.00,
    cajeroActual: "Caja Principal"
};

let estadoGlobal = {
    mesas: [],
    pagos: [],
    corte: null,
    productosExtra: [],
    filtroCapacidad: 0,
    filtroMetodoPago: "Todos",
    mesaSeleccionadaId: null
};

// =============================================================================
// COMUNICACIÓN CON EL BACKEND .NET (Directo o vía Proxy PHP)
// =============================================================================
async function apiCall(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json", "Accept": "application/json" }
    };
    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    // Intentar directo contra API .NET (CORS habilitado) y si está en PHP usar proxy de respaldo
    try {
        const res = await fetch(`${CONFIG.apiUrl}/${endpoint}`, options);
        const data = await res.json();
        actualizarBadgeConexion(true);
        return { ok: res.ok, data };
    } catch (err) {
        if (CONFIG.proxyUrl) {
            try {
                const resProxy = await fetch(`${CONFIG.proxyUrl}${encodeURIComponent(endpoint)}`, options);
                const dataProxy = await resProxy.json();
                actualizarBadgeConexion(true);
                return { ok: resProxy.ok, data: dataProxy };
            } catch (e2) {
                actualizarBadgeConexion(false);
                return { ok: false, data: { mensaje: "No se pudo conectar con la API .NET en el puerto 5080." } };
            }
        }
        actualizarBadgeConexion(false);
        return { ok: false, data: { mensaje: "Servidor .NET desconectado." } };
    }
}

function actualizarBadgeConexion(conectado) {
    const badge = document.getElementById("apiStatusBadge");
    const text = document.getElementById("apiStatusText");
    if (!badge || !text) return;
    const dot = badge.querySelector(".dot");
    if (conectado) {
        if (dot) dot.className = "dot dot-online";
        text.textContent = "API .NET Conectada";
    } else {
        if (dot) dot.className = "dot dot-offline";
        text.textContent = "API .NET Sin Conexión";
    }
}

function mostrarToast(mensaje, esError = false) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${esError ? "error" : ""}`;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3800);
}

function formatoMoneda(valor) {
    const num = Number(valor) || 0;
    return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =============================================================================
// CARGA INICIAL Y REFRESCO DEL DASHBOARD
// =============================================================================
async function cargarDashboard() {
    const res = await apiCall("dashboard", "GET");
    if (!res.ok || !res.data) return;

    estadoGlobal.corte = res.data.corte;
    estadoGlobal.mesas = res.data.mesas || [];
    estadoGlobal.productosExtra = res.data.productosExtra || [];

    const resPagos = await apiCall(`pagos?metodo=${encodeURIComponent(estadoGlobal.filtroMetodoPago)}`, "GET");
    if (resPagos.ok && resPagos.data) {
        estadoGlobal.pagos = resPagos.data.pagos || [];
        estadoGlobal.corte = resPagos.data.resumen || estadoGlobal.corte;
    }

    renderizarKPIs();
    renderizarSelectorExtras();
    renderizarMapaMesas();
    renderizarDetalleMesa();
    renderizarTablaPagos();
    renderizarCorteCaja();
    calcularCotizador();
}

function renderizarKPIs() {
    const c = estadoGlobal.corte;
    if (!c) return;

    const elTotal = document.getElementById("kpiTotalCobrado");
    if (elTotal) elTotal.textContent = formatoMoneda(c.granTotalCobrado);

    const elPagosCount = document.getElementById("kpiPagosCount");
    if (elPagosCount) elPagosCount.textContent = `${c.totalPagosRegistrados} pagos reflejados hoy`;

    const elComensales = document.getElementById("kpiComensales");
    if (elComensales) elComensales.textContent = `${c.totalAdultosAtendidos} Adultos · ${c.totalNinosAtendidos} Niños`;

    const elIngresoBuffet = document.getElementById("kpiIngresoBuffet");
    if (elIngresoBuffet) {
        elIngresoBuffet.textContent = `Buffet: ${formatoMoneda(c.ingresoTotalBuffet)} | Extras: ${formatoMoneda(c.ingresoTotalExtras)}`;
    }

    const elEstadoMesas = document.getElementById("kpiEstadoMesas");
    if (elEstadoMesas) {
        const ocupadasTotal = (c.mesasOcupadas || 0) + (c.mesasPorPagar || 0);
        elEstadoMesas.textContent = `${c.mesasLibres} Libres · ${ocupadasTotal} Ocupadas`;
    }

    const elCuentasAbiertas = document.getElementById("kpiCuentasAbiertas");
    if (elCuentasAbiertas) {
        elCuentasAbiertas.textContent = `En consumo por cobrar: ${formatoMoneda(c.cuentasAbiertasPorCobrar)}`;
    }

    const elMetodos = document.getElementById("kpiMetodosResumen");
    if (elMetodos) {
        elMetodos.textContent = `Efec: ${formatoMoneda(c.totalEfectivo)} · Tarj: ${formatoMoneda(c.totalTarjeta)}`;
    }

    const elTransf = document.getElementById("kpiTransferencia");
    if (elTransf) {
        elTransf.textContent = `Transferencia: ${formatoMoneda(c.totalTransferencia)} · Propinas: ${formatoMoneda(c.totalPropinas)}`;
    }
}

function renderizarSelectorExtras() {
    const sel = document.getElementById("selectProductoExtra");
    if (!sel) return;
    sel.innerHTML = estadoGlobal.productosExtra.map(p =>
        `<option value="${p.id}">${p.nombre} — ${formatoMoneda(p.precio)}</option>`
    ).join("");
}

// =============================================================================
// MAPA DE MESAS (CAPACIDADES DE 4, 6 Y 10 PERSONAS)
// =============================================================================
function filtrarMesas(capacidad, btnEl) {
    estadoGlobal.filtroCapacidad = capacidad;
    document.querySelectorAll("#tab-mesas .filter-btn").forEach(b => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    renderizarMapaMesas();
}

function renderizarMapaMesas() {
    const grid = document.getElementById("mesasGrid");
    if (!grid) return;

    const mesasFiltradas = estadoGlobal.filtroCapacidad > 0
        ? estadoGlobal.mesas.filter(m => m.capacidad === estadoGlobal.filtroCapacidad)
        : estadoGlobal.mesas;

    grid.innerHTML = mesasFiltradas.map(m => {
        const estadoClase = (m.estado || "Libre").replace(/\s+/g, "");
        const seleccionada = m.id === estadoGlobal.mesaSeleccionadaId ? "selected" : "";
        const orden = m.ordenActiva;

        let resumenHtml = `<div class="mesa-summary"><span style="color:#15803d;font-weight:700;">✓ Disponible para asignar</span></div>`;
        if (orden) {
            resumenHtml = `
                <div class="mesa-summary">
                    <div>🧑 ${orden.cantAdultos} Adulto(s) · 🧒 ${orden.cantNinos} Niño(s)</div>
                    <div class="mesa-total">${formatoMoneda(orden.total)}</div>
                </div>
            `;
        }

        return `
            <div class="mesa-card estado-${estadoClase} ${seleccionada}" onclick="seleccionarMesa(${m.id})">
                <div class="mesa-card-top">
                    <span class="mesa-numero">${m.nombre}</span>
                    <span class="cap-badge cap-${m.capacidad}">🪑 ${m.capacidad} pers.</span>
                </div>
                <div class="mesa-zona">${m.zona} · <strong>${m.estado}</strong></div>
                ${resumenHtml}
            </div>
        `;
    }).join("");
}

function seleccionarMesa(mesaId) {
    estadoGlobal.mesaSeleccionadaId = mesaId;
    renderizarMapaMesas();
    renderizarDetalleMesa();
}

// =============================================================================
// DETALLE DE MESA, CONTADORES DE BUFFET ($280 / $180) Y COBRO
// =============================================================================
function renderizarDetalleMesa() {
    const emptyState = document.getElementById("mesaEmptyState");
    const container = document.getElementById("mesaActivaContainer");
    const vistaAbrir = document.getElementById("vistaAbrirMesa");
    const vistaActiva = document.getElementById("vistaCuentaActiva");

    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa) {
        emptyState?.classList.remove("hidden");
        container?.classList.add("hidden");
        return;
    }

    emptyState?.classList.add("hidden");
    container?.classList.remove("hidden");

    document.getElementById("detalleMesaCapacidad").textContent = `Mesa de ${mesa.capacidad} personas`;
    document.getElementById("detalleMesaTitulo").textContent = `${mesa.nombre}`;
    document.getElementById("detalleMesaZona").textContent = mesa.zona;

    const pill = document.getElementById("detalleMesaEstado");
    pill.textContent = mesa.estado;
    pill.style.background = mesa.estado === "Libre" ? "#dcfce7" : (mesa.estado === "Por Pagar" ? "#fef3c7" : "#fee2e2");
    pill.style.color = mesa.estado === "Libre" ? "#15803d" : (mesa.estado === "Por Pagar" ? "#b45309" : "#b91c1c");

    if (mesa.estado === "Libre" || !mesa.ordenActiva) {
        vistaAbrir?.classList.remove("hidden");
        vistaActiva?.classList.add("hidden");
        // Sugerir cantidad inicial acorde a la mesa
        const sugAdultos = mesa.capacidad === 10 ? 6 : (mesa.capacidad === 6 ? 4 : 2);
        document.getElementById("openAdultos").value = sugAdultos;
        document.getElementById("openNinos").value = 0;
        document.getElementById("openNotas").value = "";
        actualizarPreviewApertura(mesa.capacidad);
    } else {
        vistaAbrir?.classList.add("hidden");
        vistaActiva?.classList.remove("hidden");
        const o = mesa.ordenActiva;

        document.getElementById("ordenFolio").textContent = o.folio;
        document.getElementById("ordenMesero").textContent = o.mesero;
        document.getElementById("ordenHora").textContent = (o.fechaApertura || "").replace("T", " ").substring(11, 16);

        document.getElementById("actAdultos").value = o.cantAdultos;
        document.getElementById("actNinos").value = o.cantNinos;

        document.getElementById("calcLineaAdulto").textContent =
            `${o.cantAdultos} × $280.00 = ${formatoMoneda(o.cantAdultos * CONFIG.precioAdulto)}`;
        document.getElementById("calcLineaNino").textContent =
            `${o.cantNinos} × $180.00 = ${formatoMoneda(o.cantNinos * CONFIG.precioNino)}`;

        document.getElementById("cuentaSubtotalBuffet").textContent = formatoMoneda(o.subtotalBuffet);
        document.getElementById("cuentaSubtotalExtras").textContent = formatoMoneda(o.subtotalExtras);

        const totalComensales = o.cantAdultos + o.cantNinos;
        const capAviso = document.getElementById("actCapacidadAviso");
        capAviso.textContent = `Ocupación actual: ${totalComensales} de ${mesa.capacidad} lugares (${o.cantAdultos} Adultos, ${o.cantNinos} Niños)`;
        capAviso.className = `capacity-feedback ${totalComensales > mesa.capacidad ? "warn" : ""}`;

        // Renderizar extras
        const listaExtras = document.getElementById("listaExtrasOrden");
        if (!o.extras || o.extras.length === 0) {
            listaExtras.innerHTML = `<div class="text-muted" style="font-size:12px;">Sin bebidas o postres extra registrados.</div>`;
        } else {
            listaExtras.innerHTML = o.extras.map(ex => `
                <div class="extra-item">
                    <div>
                        <strong>${ex.cantidad}x ${ex.nombreProducto}</strong>
                        <div class="text-muted">${formatoMoneda(ex.precioUnitario)} c/u</div>
                    </div>
                    <div class="extra-item-actions">
                        <strong>${formatoMoneda(ex.subtotal)}</strong>
                        <button type="button" class="btn-mini" onclick="modificarExtraOrden(${ex.productoId}, -1)">−</button>
                        <button type="button" class="btn-mini" onclick="modificarExtraOrden(${ex.productoId}, 1)">+</button>
                    </div>
                </div>
            `).join("");
        }

        document.getElementById("pagoPropina").value = o.propina || 0;
        document.getElementById("pagoDescuento").value = o.descuento || 0;
        recalcularPreviewCobro(true);
    }
}

function ajustarContadorApertura(tipo, delta) {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    const inputId = tipo === "adultos" ? "openAdultos" : "openNinos";
    const input = document.getElementById(inputId);
    let val = (parseInt(input.value, 10) || 0) + delta;
    if (val < 0) val = 0;
    input.value = val;
    actualizarPreviewApertura(mesa ? mesa.capacidad : 4);
}

function actualizarPreviewApertura(capacidad) {
    const adultos = parseInt(document.getElementById("openAdultos").value, 10) || 0;
    const ninos = parseInt(document.getElementById("openNinos").value, 10) || 0;
    const totalPersonas = adultos + ninos;
    const subtotal = (adultos * CONFIG.precioAdulto) + (ninos * CONFIG.precioNino);

    const aviso = document.getElementById("openCapacidadAviso");
    aviso.textContent = `Comensales a ingresar: ${totalPersonas} / ${capacidad} personas (${adultos} Adultos × $280 + ${ninos} Niños × $180)`;
    aviso.className = `capacity-feedback ${totalPersonas > capacidad ? "warn" : ""}`;

    document.getElementById("openSubtotalPreview").textContent = formatoMoneda(subtotal);
}

async function abrirMesaSeleccionada() {
    const mesaId = estadoGlobal.mesaSeleccionadaId;
    if (!mesaId) return;

    const cantAdultos = parseInt(document.getElementById("openAdultos").value, 10) || 0;
    const cantNinos = parseInt(document.getElementById("openNinos").value, 10) || 0;
    const mesero = document.getElementById("openMesero").value || "Carlos Rivera";
    const notas = document.getElementById("openNotas").value || "";

    if (cantAdultos + cantNinos <= 0) {
        mostrarToast("Indica al menos 1 comensal (Adulto o Niño) para abrir la mesa.", true);
        return;
    }

    const res = await apiCall(`mesas/${mesaId}/abrir`, "POST", {
        cantAdultos,
        cantNinos,
        mesero,
        notas
    });

    if (res.ok && res.data?.exito) {
        mostrarToast(res.data.mensaje || "Mesa abierta correctamente");
        await cargarDashboard();
    } else {
        mostrarToast(res.data?.mensaje || "No se pudo abrir la mesa", true);
    }
}

async function cambiarBuffetActivo(tipo, delta) {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa || !mesa.ordenActiva) return;

    let cantAdultos = mesa.ordenActiva.cantAdultos;
    let cantNinos = mesa.ordenActiva.cantNinos;

    if (tipo === "adultos") cantAdultos = Math.max(0, cantAdultos + delta);
    if (tipo === "ninos") cantNinos = Math.max(0, cantNinos + delta);

    if (cantAdultos + cantNinos <= 0) {
        mostrarToast("La cuenta debe tener al menos 1 comensal o puedes liberar la mesa.", true);
        return;
    }

    const propina = parseFloat(document.getElementById("pagoPropina").value) || 0;
    const descuento = parseFloat(document.getElementById("pagoDescuento").value) || 0;

    const res = await apiCall(`mesas/${mesa.id}/actualizar`, "PUT", {
        cantAdultos,
        cantNinos,
        mesero: mesa.ordenActiva.mesero,
        propina,
        descuento,
        notas: mesa.ordenActiva.notas
    });

    if (res.ok) {
        await cargarDashboard();
    }
}

async function agregarExtraOrden(cantidad = 1) {
    const sel = document.getElementById("selectProductoExtra");
    if (!sel || !sel.value) return;
    await modificarExtraOrden(parseInt(sel.value, 10), cantidad);
}

async function modificarExtraOrden(productoId, cantidad) {
    const mesaId = estadoGlobal.mesaSeleccionadaId;
    if (!mesaId) return;

    const res = await apiCall(`mesas/${mesaId}/extras`, "POST", {
        productoId,
        cantidad
    });

    if (res.ok) {
        mostrarToast(res.data?.mensaje || "Consumo extra actualizado");
        await cargarDashboard();
    }
}

function aplicarPropinaPorcentaje(pct) {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa || !mesa.ordenActiva) return;
    const base = mesa.ordenActiva.subtotalBuffet + mesa.ordenActiva.subtotalExtras;
    const propinaSugerida = Math.round(base * (pct / 100));
    document.getElementById("pagoPropina").value = propinaSugerida;
    recalcularPreviewCobro(true);
}

function recalcularPreviewCobro(autoAjustarRecibido = false) {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa || !mesa.ordenActiva) return;

    const propina = Math.max(0, parseFloat(document.getElementById("pagoPropina").value) || 0);
    const descuento = Math.max(0, parseFloat(document.getElementById("pagoDescuento").value) || 0);
    const total = Math.max(0, mesa.ordenActiva.subtotalBuffet + mesa.ordenActiva.subtotalExtras - descuento + propina);

    document.getElementById("pagoGranTotal").textContent = formatoMoneda(total);

    if (autoAjustarRecibido) {
        document.getElementById("pagoMontoRecibido").value = total;
    }
    calcularCambio();
}

function cambiarMetodoPago() {
    const metodo = document.getElementById("pagoMetodo").value;
    const grupoRef = document.getElementById("grupoReferencia");
    const quickCash = document.getElementById("quickCashRow");

    if (metodo === "Efectivo") {
        grupoRef?.classList.add("hidden");
        quickCash?.classList.remove("hidden");
    } else {
        grupoRef?.classList.remove("hidden");
        quickCash?.classList.add("hidden");
        setEfectivoExacto();
    }
    calcularCambio();
}

function obtenerTotalActualFormulario() {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa || !mesa.ordenActiva) return 0;
    const propina = Math.max(0, parseFloat(document.getElementById("pagoPropina").value) || 0);
    const descuento = Math.max(0, parseFloat(document.getElementById("pagoDescuento").value) || 0);
    return Math.max(0, mesa.ordenActiva.subtotalBuffet + mesa.ordenActiva.subtotalExtras - descuento + propina);
}

function setEfectivoExacto() {
    document.getElementById("pagoMontoRecibido").value = obtenerTotalActualFormulario();
    calcularCambio();
}

function setBillete(monto) {
    document.getElementById("pagoMontoRecibido").value = monto;
    calcularCambio();
}

function calcularCambio() {
    const total = obtenerTotalActualFormulario();
    const recibido = parseFloat(document.getElementById("pagoMontoRecibido").value) || 0;
    const cambio = recibido - total;
    const texto = document.getElementById("pagoCambioTexto");
    const box = document.getElementById("cambioBox");

    if (cambio >= 0) {
        texto.textContent = formatoMoneda(cambio);
        box.style.background = "#dcfce7";
        box.style.color = "#15803d";
    } else {
        texto.textContent = `Faltan ${formatoMoneda(Math.abs(cambio))}`;
        box.style.background = "#fee2e2";
        box.style.color = "#b91c1c";
    }
}

async function marcarPorPagar() {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa || !mesa.ordenActiva) return;

    const propina = parseFloat(document.getElementById("pagoPropina").value) || 0;
    const descuento = parseFloat(document.getElementById("pagoDescuento").value) || 0;

    const res = await apiCall(`mesas/${mesa.id}/actualizar`, "PUT", {
        cantAdultos: mesa.ordenActiva.cantAdultos,
        cantNinos: mesa.ordenActiva.cantNinos,
        mesero: mesa.ordenActiva.mesero,
        propina,
        descuento,
        estadoMesa: "Por Pagar"
    });

    if (res.ok) {
        mostrarToast(`${mesa.nombre} marcada como 'Por Pagar'`);
        await cargarDashboard();
    }
}

async function liberarMesaActual() {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa) return;

    const res = await apiCall(`mesas/${mesa.id}/liberar`, "POST");
    if (res.ok) {
        mostrarToast(res.data?.mensaje || "Mesa liberada");
        await cargarDashboard();
    }
}

async function procesarPagoMesa() {
    const mesa = estadoGlobal.mesas.find(m => m.id === estadoGlobal.mesaSeleccionadaId);
    if (!mesa || !mesa.ordenActiva) return;

    const metodoPago = document.getElementById("pagoMetodo").value;
    const montoRecibido = parseFloat(document.getElementById("pagoMontoRecibido").value) || 0;
    const propina = parseFloat(document.getElementById("pagoPropina").value) || 0;
    const descuento = parseFloat(document.getElementById("pagoDescuento").value) || 0;
    const referencia = document.getElementById("pagoReferencia").value || "";

    const res = await apiCall(`mesas/${mesa.id}/pagar`, "POST", {
        metodoPago,
        montoRecibido,
        propina,
        descuento,
        referencia,
        cajero: CONFIG.cajeroActual || "Caja Principal"
    });

    if (res.ok && res.data?.exito) {
        mostrarToast(res.data.mensaje || "¡Pago reflejado correctamente!");
        const pagoGenerado = res.data.pago;
        await cargarDashboard();
        if (pagoGenerado && pagoGenerado.id) {
            abrirTicket(pagoGenerado.id);
        }
    } else {
        mostrarToast(res.data?.mensaje || "Error al procesar el pago", true);
    }
}

function abrirTicket(pagoId) {
    const esPhp = window.location.pathname.endsWith(".php");
    const url = esPhp ? `ticket.php?id=${pagoId}` : `ticket.html?id=${pagoId}`;
    window.open(url, "_blank", "width=440,height=680");
}

// =============================================================================
// REFLEJO DE PAGOS (HISTORIAL Y FILTROS)
// =============================================================================
async function filtrarPagos(metodo, btnEl) {
    estadoGlobal.filtroMetodoPago = metodo;
    document.querySelectorAll("#tab-pagos .filter-btn").forEach(b => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    await cargarDashboard();
}

function renderizarTablaPagos() {
    const tbody = document.getElementById("tablaPagosBody");
    if (!tbody) return;

    if (!estadoGlobal.pagos || estadoGlobal.pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="text-align:center;padding:24px;">No hay pagos reflejados con este filtro.</td></tr>`;
        return;
    }

    tbody.innerHTML = estadoGlobal.pagos.map(p => {
        const fechaStr = (p.fechaPago || "").replace("T", " ").substring(0, 16);
        const importeAdultos = p.cantAdultos * CONFIG.precioAdulto;
        const importeNinos = p.cantNinos * CONFIG.precioNino;

        return `
            <tr>
                <td><strong>${p.folioTicket}</strong></td>
                <td>${fechaStr}</td>
                <td><span class="cap-badge cap-${p.mesaCapacidad}">Mesa ${p.mesaNumero} (${p.mesaCapacidad}p)</span></td>
                <td>${p.cantAdultos} × $280 = <strong>${formatoMoneda(importeAdultos)}</strong></td>
                <td>${p.cantNinos} × $180 = <strong>${formatoMoneda(importeNinos)}</strong></td>
                <td>${formatoMoneda(p.subtotalBuffet)}</td>
                <td>${formatoMoneda(p.subtotalExtras)}</td>
                <td>${formatoMoneda(p.propina)}</td>
                <td><strong style="color:var(--primary);font-size:14px;">${formatoMoneda(p.montoTotal)}</strong></td>
                <td><strong>${p.metodoPago}</strong>${p.referencia ? `<br><small class="text-muted">${p.referencia}</small>` : ""}</td>
                <td>Rec: ${formatoMoneda(p.montoRecibido)}<br><small style="color:#15803d;font-weight:700;">Cambio: ${formatoMoneda(p.cambio)}</small></td>
                <td>${p.cajero}</td>
                <td>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="abrirTicket(${p.id})">
                        🖨️ Ticket
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// =============================================================================
// CORTE DE CAJA DEL DÍA
// =============================================================================
function renderizarCorteCaja() {
    const grid = document.getElementById("corteCajaGrid");
    const c = estadoGlobal.corte;
    if (!grid || !c) return;

    grid.innerHTML = `
        <div class="corte-box">
            <h3>🍽️ Ingresos por Buffet (Adulto vs Niño)</h3>
            <div class="corte-line">
                <span>Buffets Adulto ($280.00 × ${c.totalAdultosAtendidos}):</span>
                <strong>${formatoMoneda(c.ingresoBuffetAdultos)}</strong>
            </div>
            <div class="corte-line">
                <span>Buffets Niño ($180.00 × ${c.totalNinosAtendidos}):</span>
                <strong>${formatoMoneda(c.ingresoBuffetNinos)}</strong>
            </div>
            <div class="corte-line">
                <span>Total Comensales Atendidos:</span>
                <strong>${c.totalAdultosAtendidos + c.totalNinosAtendidos} personas</strong>
            </div>
            <div class="corte-line highlight">
                <span>Subtotal Buffet Cobrado:</span>
                <span>${formatoMoneda(c.ingresoTotalBuffet)}</span>
            </div>
        </div>

        <div class="corte-box">
            <h3>🥤 Extras, Propinas y Descuentos</h3>
            <div class="corte-line">
                <span>Consumo Extra (Bebidas y Postres):</span>
                <strong>${formatoMoneda(c.ingresoTotalExtras)}</strong>
            </div>
            <div class="corte-line">
                <span>Propinas Recaudadas:</span>
                <strong>${formatoMoneda(c.totalPropinas)}</strong>
            </div>
            <div class="corte-line">
                <span>Descuentos Aplicados:</span>
                <strong>-${formatoMoneda(c.totalDescuentos)}</strong>
            </div>
            <div class="corte-line highlight">
                <span>GRAN TOTAL COBRADO:</span>
                <span>${formatoMoneda(c.granTotalCobrado)}</span>
            </div>
        </div>

        <div class="corte-box">
            <h3>💳 Arqueo por Método de Pago</h3>
            <div class="corte-line">
                <span>💵 Efectivo en Caja:</span>
                <strong>${formatoMoneda(c.totalEfectivo)}</strong>
            </div>
            <div class="corte-line">
                <span>💳 Terminal Tarjeta (Vouchers):</span>
                <strong>${formatoMoneda(c.totalTarjeta)}</strong>
            </div>
            <div class="corte-line">
                <span>📲 Transferencias SPEI:</span>
                <strong>${formatoMoneda(c.totalTransferencia)}</strong>
            </div>
            <div class="corte-line highlight">
                <span>Total Pagos Reflejados:</span>
                <span>${c.totalPagosRegistrados} tickets</span>
            </div>
        </div>
    `;
}

// =============================================================================
// COTIZADOR RÁPIDO DE BUFFET Y SUGERENCIA DE MESA (4, 6 o 10)
// =============================================================================
function calcularCotizador() {
    const elRes = document.getElementById("simResultados");
    if (!elRes) return;

    const adultos = Math.max(0, parseInt(document.getElementById("simAdultos")?.value, 10) || 0);
    const ninos = Math.max(0, parseInt(document.getElementById("simNinos")?.value, 10) || 0);
    const extras = Math.max(0, parseFloat(document.getElementById("simExtras")?.value) || 0);

    const totalPersonas = adultos + ninos;
    const subAdultos = adultos * CONFIG.precioAdulto;
    const subNinos = ninos * CONFIG.precioNino;
    const granTotal = subAdultos + subNinos + extras;

    let mesaSugerida = "Mesa de 4 personas";
    if (totalPersonas > 4 && totalPersonas <= 6) mesaSugerida = "Mesa de 6 personas";
    else if (totalPersonas > 6 && totalPersonas <= 10) mesaSugerida = "Mesa de 10 personas (Salón VIP / Grupos)";
    else if (totalPersonas > 10) mesaSugerida = `Combinación de mesas (${Math.ceil(totalPersonas / 10)} de 10 personas o equivalentes)`;

    elRes.innerHTML = `
        <h3 style="color:var(--primary);margin-bottom:10px;">Resultado de la Cotización</h3>
        <div class="corte-line">
            <span>🪑 Tipo de Mesa Recomendada:</span>
            <strong>${mesaSugerida} (${totalPersonas} comensales)</strong>
        </div>
        <div class="corte-line">
            <span>🧑 ${adultos} Adulto(s) × $280.00:</span>
            <strong>${formatoMoneda(subAdultos)}</strong>
        </div>
        <div class="corte-line">
            <span>🧒 ${ninos} Niño(s) × $180.00:</span>
            <strong>${formatoMoneda(subNinos)}</strong>
        </div>
        <div class="corte-line">
            <span>🥤 Consumo Extra Estimado:</span>
            <strong>${formatoMoneda(extras)}</strong>
        </div>
        <div class="corte-line highlight">
            <span>TOTAL ESTIMADO A PAGAR:</span>
            <span>${formatoMoneda(granTotal)}</span>
        </div>
    `;
}

// =============================================================================
// CAMBIO DE PESTAÑAS
// =============================================================================
function cambiarTab(tabId) {
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(tabId)?.classList.add("active");
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
});
