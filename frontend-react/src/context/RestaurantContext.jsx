import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sileo } from 'sileo';

const RestaurantContext = createContext(null);

export const PRECIO_ADULTO = 280.00;
export const PRECIO_NINO = 180.00;
const MAX_DESCUENTO_PORCENTAJE = 0.50;

const API_BASE = window.APP_CONFIG?.apiUrl || 'http://localhost:5080/api';
const PHP_PROXY = window.APP_CONFIG?.proxyUrl || '';
const CLOUD_STORE_KEY = 'hacienda_cloud_store_v2';

function crearSemillaCloud() {
  const ahora = new Date().toISOString();
  const hace1h = new Date(Date.now() - 3600 * 1000).toISOString();
  const hace30m = new Date(Date.now() - 1800 * 1000).toISOString();

  const productosExtra = [
    { id: 1, nombre: 'Refresco lata 355ml', categoria: 'Bebida', precio: 35.0, activo: true },
    { id: 2, nombre: 'Jarra de Agua Fresca (2L)', categoria: 'Bebida', precio: 95.0, activo: true },
    { id: 3, nombre: 'Vaso de Agua del Día', categoria: 'Bebida', precio: 30.0, activo: true },
    { id: 4, nombre: 'Cerveza Nacional', categoria: 'Bebida', precio: 55.0, activo: true },
    { id: 5, nombre: 'Cerveza Artesanal', categoria: 'Bebida', precio: 80.0, activo: true },
    { id: 6, nombre: 'Café de Olla Refill', categoria: 'Bebida', precio: 40.0, activo: true },
    { id: 7, nombre: 'Limonada / Naranjada Mineral', categoria: 'Bebida', precio: 45.0, activo: true },
    { id: 8, nombre: 'Postre Especial (Pastel de Elote)', categoria: 'Postre', precio: 65.0, activo: true },
    { id: 9, nombre: 'Flan Napolitano de la Casa', categoria: 'Postre', precio: 55.0, activo: true },
    { id: 10, nombre: 'Paquete Cumpleaños (Pastelito + Vela)', categoria: 'Especial', precio: 120.0, activo: true },
  ];

  const ordenActiva1 = {
    id: 102,
    folio: 'ORD-0102',
    mesaId: 1,
    mesaNumero: 1,
    mesaCapacidad: 6,
    mesero: 'Carlos Rivera',
    cantAdultos: 3,
    precioAdulto: PRECIO_ADULTO,
    cantNinos: 2,
    precioNino: PRECIO_NINO,
    subtotalBuffet: 3 * PRECIO_ADULTO + 2 * PRECIO_NINO,
    subtotalExtras: 70.0,
    descuento: 0,
    propina: 0,
    total: 1270.0,
    notas: 'Pasillo superior vista patio',
    estado: 'Abierta',
    fechaApertura: hace30m,
    extras: [
      { id: 3, ordenId: 102, productoId: 1, nombreProducto: 'Refresco lata 355ml', precioUnitario: 35.0, cantidad: 2, subtotal: 70.0 },
    ],
  };

  const ordenActiva4 = {
    id: 103,
    folio: 'ORD-0103',
    mesaId: 4,
    mesaNumero: 4,
    mesaCapacidad: 10,
    mesero: 'Carlos Rivera',
    cantAdultos: 6,
    precioAdulto: PRECIO_ADULTO,
    cantNinos: 2,
    precioNino: PRECIO_NINO,
    subtotalBuffet: 6 * PRECIO_ADULTO + 2 * PRECIO_NINO,
    subtotalExtras: 155.0,
    descuento: 0,
    propina: 0,
    total: 2195.0,
    notas: 'Grupo familiar - Solicitaron la cuenta',
    estado: 'Abierta',
    fechaApertura: hace1h,
    extras: [
      { id: 4, ordenId: 103, productoId: 2, nombreProducto: 'Jarra de Agua Fresca (2L)', precioUnitario: 95.0, cantidad: 1, subtotal: 95.0 },
      { id: 5, ordenId: 103, productoId: 3, nombreProducto: 'Vaso de Agua del Día', precioUnitario: 30.0, cantidad: 2, subtotal: 60.0 },
    ],
  };

  const ordenActiva9 = {
    id: 104,
    folio: 'ORD-0104',
    mesaId: 9,
    mesaNumero: 9,
    mesaCapacidad: 4,
    mesero: 'Carlos Rivera',
    cantAdultos: 2,
    precioAdulto: PRECIO_ADULTO,
    cantNinos: 1,
    precioNino: PRECIO_NINO,
    subtotalBuffet: 2 * PRECIO_ADULTO + 1 * PRECIO_NINO,
    subtotalExtras: 0,
    descuento: 0,
    propina: 0,
    total: 740.0,
    notas: 'Pasillo lateral izquierdo',
    estado: 'Abierta',
    fechaApertura: ahora,
    extras: [],
  };

  const mesas = [
    { id: 1, numero: 1, nombre: 'Mesa 1', capacidad: 6, zona: 'Pasillo superior', estado: 'Ocupada', ordenActualId: 102, ordenActiva: ordenActiva1 },
    { id: 2, numero: 2, nombre: 'Mesa 2', capacidad: 6, zona: 'Pasillo superior', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 3, numero: 3, nombre: 'Mesa 3', capacidad: 10, zona: 'Pasillo superior', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 4, numero: 4, nombre: 'Mesa 4', capacidad: 10, zona: 'Pasillo superior', estado: 'Por Pagar', ordenActualId: 103, ordenActiva: ordenActiva4 },
    { id: 5, numero: 5, nombre: 'Mesa 5', capacidad: 10, zona: 'Pasillo superior', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 6, numero: 6, nombre: 'Mesa 6', capacidad: 6, zona: 'Pasillo superior', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 7, numero: 7, nombre: 'Mesa 7', capacidad: 6, zona: 'Pasillo superior', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 8, numero: 8, nombre: 'Mesa 8', capacidad: 4, zona: 'Pasillo lateral izquierdo', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 9, numero: 9, nombre: 'Mesa 9', capacidad: 4, zona: 'Pasillo lateral izquierdo', estado: 'Ocupada', ordenActualId: 104, ordenActiva: ordenActiva9 },
    { id: 10, numero: 10, nombre: 'Mesa 10', capacidad: 6, zona: 'Pasillo lateral izquierdo', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 11, numero: 11, nombre: 'Mesa 11', capacidad: 6, zona: 'Pasillo lateral izquierdo', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 12, numero: 12, nombre: 'Mesa 12', capacidad: 4, zona: 'Pasillo lateral derecho', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 13, numero: 13, nombre: 'Mesa 13', capacidad: 4, zona: 'Pasillo lateral derecho', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 14, numero: 14, nombre: 'Mesa 14', capacidad: 6, zona: 'Pasillo lateral derecho', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 15, numero: 15, nombre: 'Mesa 15', capacidad: 6, zona: 'Pasillo lateral derecho', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 16, numero: 16, nombre: 'Mesa 16', capacidad: 4, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 17, numero: 17, nombre: 'Mesa 17', capacidad: 4, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 18, numero: 18, nombre: 'Mesa 18', capacidad: 4, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 19, numero: 19, nombre: 'Mesa 19', capacidad: 4, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 20, numero: 20, nombre: 'Mesa 20', capacidad: 4, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 21, numero: 21, nombre: 'Mesa 21', capacidad: 4, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 22, numero: 22, nombre: 'Mesa 22', capacidad: 10, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
    { id: 23, numero: 23, nombre: 'Mesa 23', capacidad: 10, zona: 'Acceso / Cuarto trasero', estado: 'Libre', ordenActualId: null, ordenActiva: null },
  ];

  const pagos = [
    {
      id: 2,
      folioTicket: 'TCK-0002',
      ordenId: 101,
      mesaNumero: 3,
      mesaCapacidad: 10,
      cantAdultos: 6,
      cantNinos: 3,
      subtotalBuffet: 2220.0,
      subtotalExtras: 190.0,
      descuento: 0,
      propina: 240.0,
      montoTotal: 2650.0,
      metodoPago: 'Tarjeta',
      montoRecibido: 2650.0,
      cambio: 0,
      referencia: 'AUT-88412',
      cajero: 'Laura Méndez (Caja)',
      fechaPago: hace30m,
      extras: [
        { id: 2, ordenId: 101, productoId: 2, nombreProducto: 'Jarra de Agua Fresca (2L)', precioUnitario: 95.0, cantidad: 2, subtotal: 190.0 },
      ],
    },
    {
      id: 1,
      folioTicket: 'TCK-0001',
      ordenId: 100,
      mesaNumero: 8,
      mesaCapacidad: 4,
      cantAdultos: 2,
      cantNinos: 1,
      subtotalBuffet: 740.0,
      subtotalExtras: 95.0,
      descuento: 0,
      propina: 80.0,
      montoTotal: 915.0,
      metodoPago: 'Efectivo',
      montoRecibido: 1000.0,
      cambio: 85.0,
      referencia: '',
      cajero: 'Laura Méndez (Caja)',
      fechaPago: hace1h,
      extras: [
        { id: 1, ordenId: 100, productoId: 2, nombreProducto: 'Jarra de Agua Fresca (2L)', precioUnitario: 95.0, cantidad: 1, subtotal: 95.0 },
      ],
    },
  ];

  return { mesas, pagos, productosExtra };
}

function leerCloudStore() {
  try {
    const raw = localStorage.getItem(CLOUD_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.mesas) && parsed.mesas.length === 23) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const inicial = crearSemillaCloud();
  localStorage.setItem(CLOUD_STORE_KEY, JSON.stringify(inicial));
  return inicial;
}

function guardarCloudStore(store) {
  try {
    localStorage.setItem(CLOUD_STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function recalcularOrdenLocal(orden) {
  orden.precioAdulto = PRECIO_ADULTO;
  orden.precioNino = PRECIO_NINO;
  orden.subtotalBuffet = orden.cantAdultos * PRECIO_ADULTO + orden.cantNinos * PRECIO_NINO;
  orden.subtotalExtras = (orden.extras || []).reduce((acc, e) => acc + Number(e.subtotal || 0), 0);
  const subGeneral = orden.subtotalBuffet + orden.subtotalExtras;
  const maxDesc = Math.round(subGeneral * MAX_DESCUENTO_PORCENTAJE * 100) / 100;
  if (orden.descuento > maxDesc) {
    orden.descuento = maxDesc;
  }
  const bruto = subGeneral - (orden.descuento || 0) + (orden.propina || 0);
  orden.total = bruto < 0 ? 0 : bruto;
}

function calcularCorteCloud(store) {
  const pagos = store.pagos || [];
  const mesas = store.mesas || [];
  const adultos = pagos.reduce((s, p) => s + Number(p.cantAdultos || 0), 0);
  const ninos = pagos.reduce((s, p) => s + Number(p.cantNinos || 0), 0);

  return {
    fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
    modoAlmacenamiento: 'Cloud Sync (Vercel / GitHub Pages / .NET)',
    precioAdulto: PRECIO_ADULTO,
    precioNino: PRECIO_NINO,
    totalPagosRegistrados: pagos.length,
    totalAdultosAtendidos: adultos,
    totalNinosAtendidos: ninos,
    ingresoBuffetAdultos: adultos * PRECIO_ADULTO,
    ingresoBuffetNinos: ninos * PRECIO_NINO,
    ingresoTotalBuffet: pagos.reduce((s, p) => s + Number(p.subtotalBuffet || 0), 0),
    ingresoTotalExtras: pagos.reduce((s, p) => s + Number(p.subtotalExtras || 0), 0),
    totalDescuentos: pagos.reduce((s, p) => s + Number(p.descuento || 0), 0),
    totalPropinas: pagos.reduce((s, p) => s + Number(p.propina || 0), 0),
    granTotalCobrado: pagos.reduce((s, p) => s + Number(p.montoTotal || 0), 0),
    totalEfectivo: pagos
      .filter((p) => (p.metodoPago || '').toLowerCase() === 'efectivo')
      .reduce((s, p) => s + Number(p.montoTotal || 0), 0),
    totalTarjeta: pagos
      .filter((p) => (p.metodoPago || '').toLowerCase() === 'tarjeta')
      .reduce((s, p) => s + Number(p.montoTotal || 0), 0),
    totalTransferencia: pagos
      .filter((p) => (p.metodoPago || '').toLowerCase() === 'transferencia')
      .reduce((s, p) => s + Number(p.montoTotal || 0), 0),
    mesasLibres: mesas.filter((m) => m.estado === 'Libre').length,
    mesasOcupadas: mesas.filter((m) => m.estado === 'Ocupada').length,
    mesasPorPagar: mesas.filter((m) => m.estado === 'Por Pagar').length,
    cuentasAbiertasPorCobrar: mesas
      .filter((m) => m.ordenActiva != null)
      .reduce((s, m) => s + Number(m.ordenActiva.total || 0), 0),
  };
}

export const RestaurantProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hacienda_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [apiConnected, setApiConnected] = useState(true);
  const [mesas, setMesas] = useState(() => leerCloudStore().mesas);
  const [pagos, setPagos] = useState(() => leerCloudStore().pagos);
  const [productosExtra, setProductosExtra] = useState(() => leerCloudStore().productosExtra);
  const [corte, setCorte] = useState(() => calcularCorteCloud(leerCloudStore()));

  const [selectedMesaId, setSelectedMesaId] = useState(1);
  const [filtroCapacidad, setFiltroCapacidad] = useState(0);
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('Todos');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const apiCall = useCallback(async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('hacienda_token') || '';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };
    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, options);
      const data = await res.json();
      setApiConnected(true);
      if (res.status === 401 && endpoint !== 'auth/login') {
        setUser(null);
        localStorage.removeItem('hacienda_user');
        localStorage.removeItem('hacienda_token');
      }
      return { ok: res.ok, status: res.status, data };
    } catch {
      if (PHP_PROXY) {
        try {
          const resProxy = await fetch(`${PHP_PROXY}${encodeURIComponent(endpoint)}`, options);
          const dataProxy = await resProxy.json();
          setApiConnected(true);
          return { ok: resProxy.ok, status: resProxy.status, data: dataProxy };
        } catch {
          // fall through to cloud engine
        }
      }
      setApiConnected(false);
      return { ok: false, status: 503, offline: true, data: null };
    }
  }, []);

  const sincronizarDesdeCloudStore = useCallback((metodoOverride) => {
    const metodo = metodoOverride ?? filtroMetodoPago;
    const store = leerCloudStore();
    setMesas([...store.mesas]);
    setProductosExtra([...store.productosExtra]);
    const listaPagos =
      !metodo || metodo === 'Todos'
        ? store.pagos
        : store.pagos.filter((p) => (p.metodoPago || '').toLowerCase() === metodo.toLowerCase());
    setPagos([...listaPagos]);
    setCorte(calcularCorteCloud(store));
  }, [filtroMetodoPago]);

  const recargarDashboard = useCallback(async (metodoOverride) => {
    const metodo = metodoOverride ?? filtroMetodoPago;
    const res = await apiCall('dashboard', 'GET');
    if (res.ok && res.data) {
      if (res.data.mesas) setMesas(res.data.mesas);
      if (res.data.productosExtra) setProductosExtra(res.data.productosExtra);
      if (res.data.corte) setCorte(res.data.corte);

      const resPagos = await apiCall(`pagos?metodo=${encodeURIComponent(metodo)}`, 'GET');
      if (resPagos.ok && resPagos.data) {
        setPagos(resPagos.data.pagos || []);
        if (resPagos.data.resumen) setCorte(resPagos.data.resumen);
      }
      return;
    }

    // Modo autónomo (Vercel / GitHub Pages / Sin servidor local)
    sincronizarDesdeCloudStore(metodo);
  }, [apiCall, filtroMetodoPago, sincronizarDesdeCloudStore]);

  useEffect(() => {
    const verificarSesionInicial = async () => {
      const token = localStorage.getItem('hacienda_token');
      if (token && !token.startsWith('CLOUD.')) {
        const verifyRes = await apiCall('auth/verify', 'GET');
        if (verifyRes.ok && verifyRes.data?.exito && verifyRes.data?.usuario) {
          setUser(verifyRes.data.usuario);
          localStorage.setItem('hacienda_user', JSON.stringify(verifyRes.data.usuario));
        } else if (verifyRes.status === 401) {
          setUser(null);
          localStorage.removeItem('hacienda_user');
          localStorage.removeItem('hacienda_token');
        }
      }
      await recargarDashboard();
    };
    verificarSesionInicial();
  }, [apiCall, recargarDashboard]);

  const login = async (username, password) => {
    const res = await apiCall('auth/login', 'POST', { username, password });
    if (res.ok && res.data?.exito) {
      const loggedUser = res.data.usuario;
      localStorage.setItem('hacienda_token', res.data.token || '');
      localStorage.setItem('hacienda_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      await recargarDashboard();
      return { ok: true, user: loggedUser };
    }

    // Si estamos en Vercel / GitHub Pages (offline del servidor local .NET), autenticar en motor Cloud
    if (res.offline) {
      const cuentas = {
        admin: { pass: 'admin123', id: 1, username: 'admin', nombre: 'Administrador General', rol: 'Administrador' },
        cajero: { pass: 'cajero123', id: 2, username: 'cajero', nombre: 'Laura Méndez (Caja)', rol: 'Cajero' },
        mesero: { pass: 'mesero123', id: 3, username: 'mesero', nombre: 'Carlos Rivera (Piso)', rol: 'Mesero' },
      };
      const key = (username || '').trim().toLowerCase();
      const cuenta = cuentas[key];
      if (cuenta && cuenta.pass === (password || '').trim()) {
        const loggedUser = {
          id: cuenta.id,
          username: cuenta.username,
          nombre: cuenta.nombre,
          rol: cuenta.rol,
        };
        const cloudToken = `CLOUD.${btoa(JSON.stringify(loggedUser))}`;
        localStorage.setItem('hacienda_token', cloudToken);
        localStorage.setItem('hacienda_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        sincronizarDesdeCloudStore();
        return { ok: true, user: loggedUser };
      }
      return { ok: false, mensaje: 'Usuario o contraseña inválidos.' };
    }

    return {
      ok: false,
      mensaje: res.data?.mensaje || 'Credenciales inválidas.',
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hacienda_user');
    localStorage.removeItem('hacienda_token');
    sileo.info({
      title: 'Sesión Finalizada',
      description: 'Has cerrado sesión en el sistema de gestión La Hacienda.',
    });
  };

  const abrirMesa = async (mesaId, { cantAdultos, cantNinos, mesero, notas }) => {
    const res = await apiCall(`mesas/${mesaId}/abrir`, 'POST', {
      cantAdultos,
      cantNinos,
      mesero,
      notas,
    });
    if (res.ok && res.data?.exito) {
      await recargarDashboard();
      sileo.success({
        title: 'Mesa Abierta en Sistema',
        description: res.data.mensaje,
      });
      return true;
    }

    if (res.offline) {
      const store = leerCloudStore();
      const mesa = store.mesas.find((m) => m.id === mesaId);
      const ad = Math.max(0, Number(cantAdultos || 0));
      const ni = Math.max(0, Number(cantNinos || 0));
      if (!mesa || ad + ni <= 0) {
        sileo.error({ title: 'No se pudo abrir la mesa', description: 'Registra al menos 1 comensal.' });
        return false;
      }
      const nuevoId = Date.now() % 10000;
      const nuevaOrden = {
        id: nuevoId,
        folio: `ORD-${String(nuevoId).padStart(4, '0')}`,
        mesaId: mesa.id,
        mesaNumero: mesa.numero,
        mesaCapacidad: mesa.capacidad,
        mesero: mesero || user?.nombre || 'Carlos Rivera',
        cantAdultos: ad,
        precioAdulto: PRECIO_ADULTO,
        cantNinos: ni,
        precioNino: PRECIO_NINO,
        subtotalBuffet: 0,
        subtotalExtras: 0,
        descuento: 0,
        propina: 0,
        total: 0,
        notas: notas || '',
        estado: 'Abierta',
        fechaApertura: new Date().toISOString(),
        extras: [],
      };
      recalcularOrdenLocal(nuevaOrden);
      mesa.estado = 'Ocupada';
      mesa.ordenActualId = nuevaOrden.id;
      mesa.ordenActiva = nuevaOrden;
      guardarCloudStore(store);
      sincronizarDesdeCloudStore();
      sileo.success({
        title: 'Mesa Abierta en Sistema',
        description: `${mesa.nombre} abierta con ${ad} adulto(s) y ${ni} niño(s).`,
      });
      return true;
    }

    sileo.error({
      title: 'No se pudo abrir la mesa',
      description: res.data?.mensaje || 'Verifica los datos ingresados.',
    });
    return false;
  };

  const actualizarCuentaMesa = async (mesaId, payload, silencioso = false) => {
    const res = await apiCall(`mesas/${mesaId}/actualizar`, 'PUT', payload);
    if (res.ok && res.data?.exito) {
      await recargarDashboard();
      if (!silencioso) {
        sileo.success({
          title: 'Cuenta Actualizada',
          description: res.data.mensaje,
        });
      }
      return true;
    }

    if (res.offline) {
      const store = leerCloudStore();
      const mesa = store.mesas.find((m) => m.id === mesaId);
      if (!mesa || !mesa.ordenActiva) return false;
      if (Number(payload.descuento || 0) > 0 && user?.rol === 'Mesero') {
        sileo.error({ title: 'Acción No Permitida', description: 'Solo Caja o Administración pueden aplicar descuentos.' });
        return false;
      }
      const orden = mesa.ordenActiva;
      orden.cantAdultos = Math.max(0, Number(payload.cantAdultos ?? orden.cantAdultos));
      orden.cantNinos = Math.max(0, Number(payload.cantNinos ?? orden.cantNinos));
      if (orden.cantAdultos + orden.cantNinos <= 0) return false;
      if (payload.mesero) orden.mesero = payload.mesero;
      orden.descuento = Math.max(0, Number(payload.descuento ?? orden.descuento ?? 0));
      orden.propina = Math.max(0, Number(payload.propina ?? orden.propina ?? 0));
      if (payload.estadoMesa) mesa.estado = payload.estadoMesa;
      recalcularOrdenLocal(orden);
      guardarCloudStore(store);
      sincronizarDesdeCloudStore();
      if (!silencioso) {
        sileo.success({
          title: 'Cuenta Actualizada',
          description: `Cuenta de ${mesa.nombre} actualizada. Total: $${orden.total.toFixed(2)}`,
        });
      }
      return true;
    }

    if (res.data?.mensaje) {
      sileo.error({
        title: 'Acción No Permitida',
        description: res.data.mensaje,
      });
    }
    return false;
  };

  const modificarExtraMesa = async (mesaId, productoId, cantidad) => {
    const res = await apiCall(`mesas/${mesaId}/extras`, 'POST', {
      productoId,
      cantidad,
    });
    if (res.ok && res.data?.exito) {
      await recargarDashboard();
      sileo.success({
        title: 'Consumo Extra Actualizado',
        description: res.data.mensaje,
      });
      return true;
    }

    if (res.offline) {
      const store = leerCloudStore();
      const mesa = store.mesas.find((m) => m.id === mesaId);
      const prod = store.productosExtra.find((p) => p.id === productoId);
      if (!mesa || !mesa.ordenActiva || !prod) return false;
      const orden = mesa.ordenActiva;
      orden.extras = orden.extras || [];
      const existente = orden.extras.find((e) => e.productoId === prod.id);
      if (existente) {
        existente.cantidad += cantidad;
        if (existente.cantidad <= 0) {
          orden.extras = orden.extras.filter((e) => e.productoId !== prod.id);
        } else {
          existente.subtotal = existente.cantidad * existente.precioUnitario;
        }
      } else if (cantidad > 0) {
        orden.extras.push({
          id: Date.now() % 10000,
          ordenId: orden.id,
          productoId: prod.id,
          nombreProducto: prod.nombre,
          precioUnitario: prod.precio,
          cantidad,
          subtotal: prod.precio * cantidad,
        });
      }
      recalcularOrdenLocal(orden);
      guardarCloudStore(store);
      sincronizarDesdeCloudStore();
      sileo.success({
        title: 'Consumo Extra Actualizado',
        description: `Consumo extra actualizado en ${mesa.nombre}.`,
      });
      return true;
    }

    return false;
  };

  const procesarPagoMesa = async (mesaId, { metodoPago, montoRecibido, propina, descuento, referencia }) => {
    const res = await apiCall(`mesas/${mesaId}/pagar`, 'POST', {
      metodoPago,
      montoRecibido,
      propina,
      descuento,
      referencia,
      cajero: user?.nombre || 'Caja Principal',
    });

    if (res.ok && res.data?.exito) {
      const pagoGenerado = res.data.pago;
      await recargarDashboard();
      sileo.success({
        title: 'Pago Reflejado con Éxito',
        description: res.data.mensaje,
      });
      if (pagoGenerado) {
        setSelectedTicket(pagoGenerado);
      }
      return { ok: true, pago: pagoGenerado };
    }

    if (res.offline) {
      if (user?.rol === 'Mesero') {
        sileo.error({
          title: 'Permiso Denegado',
          description: 'El perfil Mesero no está autorizado para cobrar cuentas en caja.',
        });
        return { ok: false };
      }
      const store = leerCloudStore();
      const mesa = store.mesas.find((m) => m.id === mesaId);
      if (!mesa || !mesa.ordenActiva) return { ok: false };
      const orden = mesa.ordenActiva;
      orden.descuento = Math.max(0, Number(descuento || 0));
      orden.propina = Math.max(0, Number(propina || 0));
      recalcularOrdenLocal(orden);

      const metodo = metodoPago || 'Efectivo';
      let recibido = Number(montoRecibido || 0);
      if (metodo !== 'Efectivo' && recibido < orden.total) {
        recibido = orden.total;
      }
      if (metodo === 'Efectivo' && recibido < orden.total) {
        sileo.error({
          title: 'Monto Insuficiente',
          description: `El monto recibido ($${recibido.toFixed(2)}) es menor al total ($${orden.total.toFixed(2)}).`,
        });
        return { ok: false };
      }

      const nextId = (store.pagos.reduce((max, p) => Math.max(max, p.id || 0), 0) || 0) + 1;
      const nuevoPago = {
        id: nextId,
        folioTicket: `TCK-${String(nextId).padStart(4, '0')}`,
        ordenId: orden.id,
        mesaNumero: mesa.numero,
        mesaCapacidad: mesa.capacidad,
        cantAdultos: orden.cantAdultos,
        cantNinos: orden.cantNinos,
        subtotalBuffet: orden.subtotalBuffet,
        subtotalExtras: orden.subtotalExtras,
        descuento: orden.descuento,
        propina: orden.propina,
        montoTotal: orden.total,
        metodoPago: metodo,
        montoRecibido: recibido,
        cambio: recibido - orden.total,
        referencia: referencia || '',
        cajero: user?.nombre || 'Caja General',
        fechaPago: new Date().toISOString(),
        extras: [...(orden.extras || [])],
      };

      store.pagos.unshift(nuevoPago);
      mesa.estado = 'Libre';
      mesa.ordenActualId = null;
      mesa.ordenActiva = null;
      guardarCloudStore(store);
      sincronizarDesdeCloudStore();
      setSelectedTicket(nuevoPago);
      sileo.success({
        title: 'Pago Reflejado con Éxito',
        description: `Folio ${nuevoPago.folioTicket} registrado. Cambio: $${nuevoPago.cambio.toFixed(2)}`,
      });
      return { ok: true, pago: nuevoPago };
    }

    sileo.error({
      title: 'Error al Procesar Cobro',
      description: res.data?.mensaje || 'Verifica el monto recibido.',
    });
    return { ok: false };
  };

  const liberarMesa = async (mesaId) => {
    const res = await apiCall(`mesas/${mesaId}/liberar`, 'POST');
    if (res.ok && res.data?.exito) {
      await recargarDashboard();
      sileo.info({
        title: 'Mesa Liberada',
        description: res.data.mensaje,
      });
      return true;
    }

    if (res.offline) {
      if (user?.rol === 'Mesero') {
        sileo.error({
          title: 'No se pudo liberar la mesa',
          description: 'Solo Caja o Administración pueden cancelar una mesa con cuenta abierta.',
        });
        return false;
      }
      const store = leerCloudStore();
      const mesa = store.mesas.find((m) => m.id === mesaId);
      if (!mesa) return false;
      mesa.estado = 'Libre';
      mesa.ordenActualId = null;
      mesa.ordenActiva = null;
      guardarCloudStore(store);
      sincronizarDesdeCloudStore();
      sileo.info({
        title: 'Mesa Liberada',
        description: `${mesa.nombre} ha sido liberada.`,
      });
      return true;
    }

    if (res.data?.mensaje) {
      sileo.error({
        title: 'No se pudo liberar la mesa',
        description: res.data.mensaje,
      });
    }
    return false;
  };

  const cambiarCapacidadMesa = async (mesaId, nuevaCapacidad) => {
    const res = await apiCall(`mesas/${mesaId}/capacidad?capacidad=${nuevaCapacidad}`, 'PUT');
    if (res.ok && res.data?.exito) {
      await recargarDashboard();
      sileo.success({
        title: 'Capacidad Actualizada',
        description: res.data.mensaje,
      });
      return true;
    }

    if (res.offline) {
      const store = leerCloudStore();
      const mesa = store.mesas.find((m) => m.id === mesaId);
      if (!mesa) return false;
      mesa.capacidad = nuevaCapacidad;
      if (mesa.ordenActiva) mesa.ordenActiva.mesaCapacidad = nuevaCapacidad;
      guardarCloudStore(store);
      sincronizarDesdeCloudStore();
      sileo.success({
        title: 'Capacidad Actualizada',
        description: `Capacidad de ${mesa.nombre} actualizada a ${nuevaCapacidad} personas.`,
      });
      return true;
    }

    return false;
  };

  const selectedMesa = mesas.find((m) => m.id === selectedMesaId) || mesas[0] || null;

  return (
    <RestaurantContext.Provider
      value={{
        user,
        login,
        logout,
        apiConnected,
        mesas,
        pagos,
        productosExtra,
        corte,
        selectedMesaId,
        setSelectedMesaId,
        selectedMesa,
        filtroCapacidad,
        setFiltroCapacidad,
        filtroMetodoPago,
        setFiltroMetodoPago,
        selectedTicket,
        setSelectedTicket,
        recargarDashboard,
        abrirMesa,
        actualizarCuentaMesa,
        modificarExtraMesa,
        procesarPagoMesa,
        liberarMesa,
        cambiarCapacidadMesa,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error('useRestaurant debe usarse dentro de RestaurantProvider');
  }
  return ctx;
};
