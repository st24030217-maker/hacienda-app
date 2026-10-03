import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sileo } from 'sileo';

const RestaurantContext = createContext(null);

export const PRECIO_ADULTO = 280.00;
export const PRECIO_NINO = 180.00;

const API_BASE = window.APP_CONFIG?.apiUrl || 'http://localhost:5080/api';
const PHP_PROXY = window.APP_CONFIG?.proxyUrl || '';

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
  const [mesas, setMesas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [productosExtra, setProductosExtra] = useState([]);
  const [corte, setCorte] = useState({
    granTotalCobrado: 0,
    totalPagosRegistrados: 0,
    totalAdultosAtendidos: 0,
    totalNinosAtendidos: 0,
    ingresoBuffetAdultos: 0,
    ingresoBuffetNinos: 0,
    ingresoTotalBuffet: 0,
    ingresoTotalExtras: 0,
    totalDescuentos: 0,
    totalPropinas: 0,
    totalEfectivo: 0,
    totalTarjeta: 0,
    totalTransferencia: 0,
    mesasLibres: 10,
    mesasOcupadas: 1,
    mesasPorPagar: 1,
    cuentasAbiertasPorCobrar: 0,
    modoAlmacenamiento: 'MySQL + .NET API',
  });

  const [selectedMesaId, setSelectedMesaId] = useState(1);
  const [filtroCapacidad, setFiltroCapacidad] = useState(0); // 0 = Todas, 4, 6, 10
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
          // fall through
        }
      }
      setApiConnected(false);
      return { ok: false, status: 503, data: { mensaje: 'Sin conexión con API .NET en puerto 5080' } };
    }
  }, []);

  const recargarDashboard = useCallback(async (metodoOverride) => {
    const metodo = metodoOverride ?? filtroMetodoPago;
    const res = await apiCall('dashboard', 'GET');
    if (res.ok && res.data) {
      if (res.data.mesas) setMesas(res.data.mesas);
      if (res.data.productosExtra) setProductosExtra(res.data.productosExtra);
      if (res.data.corte) setCorte(res.data.corte);
    }

    const resPagos = await apiCall(`pagos?metodo=${encodeURIComponent(metodo)}`, 'GET');
    if (resPagos.ok && resPagos.data) {
      setPagos(resPagos.data.pagos || []);
      if (resPagos.data.resumen) setCorte(resPagos.data.resumen);
    }
  }, [apiCall, filtroMetodoPago]);

  useEffect(() => {
    const verificarSesionInicial = async () => {
      const token = localStorage.getItem('hacienda_token');
      if (token) {
        const verifyRes = await apiCall('auth/verify', 'GET');
        if (verifyRes.ok && verifyRes.data?.exito && verifyRes.data?.usuario) {
          setUser(verifyRes.data.usuario);
          localStorage.setItem('hacienda_user', JSON.stringify(verifyRes.data.usuario));
        } else if (verifyRes.status === 401) {
          setUser(null);
          localStorage.removeItem('hacienda_user');
          localStorage.removeItem('hacienda_token');
        }
      } else if (localStorage.getItem('hacienda_user')) {
        // Limpiar sesión sin token criptográfico válido
        setUser(null);
        localStorage.removeItem('hacienda_user');
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
