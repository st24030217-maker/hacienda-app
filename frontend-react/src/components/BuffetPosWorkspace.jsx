import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Minus,
  Wine,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Bell,
  Trash2,
  Utensils,
  Sparkles,
  LayoutGrid,
  Map,
} from 'lucide-react';
import { CurrencyDollarIcon } from './icons/currency-dollar-icon';
import {
  useRestaurant,
  PRECIO_ADULTO,
  PRECIO_NINO,
} from '../context/RestaurantContext';
import { MesaDigitalCard } from './MesaDigitalCard';
import { HaciendaFloorPlanMap } from './HaciendaFloorPlanMap';
import { AnimeCounter } from './ui/anime-counter';
import { triggerHaptic } from '../utils/haptics';

export const BuffetPosWorkspace = () => {
  const {
    mesas,
    productosExtra,
    selectedMesa,
    setSelectedMesaId,
    filtroCapacidad,
    setFiltroCapacidad,
    abrirMesa,
    actualizarCuentaMesa,
    modificarExtraMesa,
    procesarPagoMesa,
    liberarMesa,
    cambiarCapacidadMesa,
  } = useRestaurant();

  // Vista activa: 'plano' (Mapa Arquitectónico Interactivo) o 'grid' (Cuadrícula de Tarjetas)
  const [vistaMapa, setVistaMapa] = useState('plano');

  // Estado para abrir mesa libre
  const [openAdultos, setOpenAdultos] = useState(2);
  const [openNinos, setOpenNinos] = useState(0);
  const [openMesero, setOpenMesero] = useState('Carlos Rivera');
  const [openNotas, setOpenNotas] = useState('');

  // Estado para cobro de mesa activa
  const [selectedProdId, setSelectedProdId] = useState(1);
  const [propina, setPropina] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState(0);
  const [referencia, setReferencia] = useState('');

  useEffect(() => {
    if (productosExtra.length > 0 && !selectedProdId) {
      setSelectedProdId(productosExtra[0].id);
    }
  }, [productosExtra, selectedProdId]);

  useEffect(() => {
    if (!selectedMesa) return;
    if (selectedMesa.estado === 'Libre' || !selectedMesa.ordenActiva) {
      const sug = selectedMesa.capacidad === 10 ? 6 : selectedMesa.capacidad === 6 ? 4 : 2;
      setOpenAdultos(sug);
      setOpenNinos(0);
      setOpenNotas('');
    } else {
      const o = selectedMesa.ordenActiva;
      setPropina(o.propina || 0);
      setDescuento(o.descuento || 0);
      const calcTotal = Math.max(
        0,
        (o.subtotalBuffet || 0) + (o.subtotalExtras || 0) - (o.descuento || 0) + (o.propina || 0)
      );
      setMontoRecibido(calcTotal);
      setReferencia('');
    }
  }, [selectedMesa?.id, selectedMesa?.estado, selectedMesa?.ordenActiva?.total]);

  const mesasFiltradas =
    filtroCapacidad > 0
      ? mesas.filter((m) => m.capacidad === filtroCapacidad)
      : mesas;

  const ordenActiva = selectedMesa?.ordenActiva;
  const subtotalAbierto = openAdultos * PRECIO_ADULTO + openNinos * PRECIO_NINO;
  const totalPersonasAbierto = openAdultos + openNinos;

  const granTotalCobro = ordenActiva
    ? Math.max(
        0,
        (ordenActiva.subtotalBuffet || 0) +
          (ordenActiva.subtotalExtras || 0) -
          Number(descuento || 0) +
          Number(propina || 0)
      )
    : 0;

  const cambioCalculado = Number(montoRecibido || 0) - granTotalCobro;

  const handleAbrirMesa = async (e) => {
    e.preventDefault();
    if (!selectedMesa) return;
    triggerHaptic();
    await abrirMesa(selectedMesa.id, {
      cantAdultos: openAdultos,
      cantNinos: openNinos,
      mesero: openMesero,
      notas: openNotas,
    });
  };

  const handleAdjustBuffetActivo = async (tipo, delta) => {
    if (!selectedMesa || !ordenActiva) return;
    triggerHaptic();
    const nextAdultos =
      tipo === 'adultos' ? Math.max(0, ordenActiva.cantAdultos + delta) : ordenActiva.cantAdultos;
    const nextNinos =
      tipo === 'ninos' ? Math.max(0, ordenActiva.cantNinos + delta) : ordenActiva.cantNinos;

    if (nextAdultos + nextNinos <= 0) return;

    await actualizarCuentaMesa(
      selectedMesa.id,
      {
        cantAdultos: nextAdultos,
        cantNinos: nextNinos,
        mesero: ordenActiva.mesero,
        propina: Number(propina || 0),
        descuento: Number(descuento || 0),
        notas: ordenActiva.notas,
      },
      true
    );
  };

  const handleAplicarPropinaPct = (pct) => {
    if (!ordenActiva) return;
    triggerHaptic();
    const base = (ordenActiva.subtotalBuffet || 0) + (ordenActiva.subtotalExtras || 0);
    const prop = Math.round(base * (pct / 100));
    setPropina(prop);
    const nuevoTotal = Math.max(0, base - Number(descuento || 0) + prop);
    setMontoRecibido(nuevoTotal);
  };

  const handleCobrar = async () => {
    if (!selectedMesa || !ordenActiva) return;
    triggerHaptic();
    await procesarPagoMesa(selectedMesa.id, {
      metodoPago,
      montoRecibido: metodoPago === 'Efectivo' ? Number(montoRecibido || 0) : granTotalCobro,
      propina: Number(propina || 0),
      descuento: Number(descuento || 0),
      referencia,
    });
  };

  const total4 = mesas.filter((m) => m.capacidad === 4).length;
  const total6 = mesas.filter((m) => m.capacidad === 6).length;
  const total10 = mesas.filter((m) => m.capacidad === 10).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* COLUMNA IZQUIERDA (7 COLS): PLANO ARQUITECTÓNICO INTERACTIVO + VISTA DE CUADRÍCULA */}
      <div className="lg:col-span-7 space-y-5">
        {/* Selector de Modo de Visualización en Blanco y Negro */}
        <div className="p-2 rounded-2xl bg-white border border-neutral-300 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setVistaMapa('plano');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                vistaMapa === 'plano'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black hover:bg-neutral-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Plano Arquitectónico Interactivo (23 Mesas)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setVistaMapa('grid');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                vistaMapa === 'grid'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black hover:bg-neutral-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vista de Tarjetas ({mesas.length})</span>
            </button>
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-mono font-bold text-black uppercase">
            <span>{total4} de 4p</span>
            <span>·</span>
            <span>{total6} de 6p</span>
            <span>·</span>
            <span>{total10} de 10p</span>
          </span>
        </div>

        {vistaMapa === 'plano' ? (
          <HaciendaFloorPlanMap />
        ) : (
          <div className="p-6 sm:p-7 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                  <LayoutGrid className="w-3.5 h-3.5 text-black" />
                  <span>CUADRÍCULA DE PISO EN TIEMPO REAL</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-0.5">
                  Tarjetas de Mesas (4, 6 y 10 Personas)
                </h3>
              </div>

              {/* Filtros de Capacidad */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { cap: 0, label: `Todas (${mesas.length})` },
                  { cap: 4, label: `4 Pers. (${total4})` },
                  { cap: 6, label: `6 Pers. (${total6})` },
                  { cap: 10, label: `10 Pers. (${total10})` },
                ].map((f) => (
                  <button
                    key={f.cap}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setFiltroCapacidad(f.cap);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      filtroCapacidad === f.cap
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leyenda de Estados en Blanco y Negro */}
            <div className="flex items-center gap-5 py-3 text-xs font-sans text-black border-b border-neutral-200 mb-5">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-black" />
                <span>Libre (Blanco)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-black" />
                <span>Ocupada / En Consumo (Negro)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 animate-pulse" />
                <span>Por Pagar</span>
              </span>
            </div>

            {/* Grid de Mesas en Blanco y Negro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {mesasFiltradas.map((m) => {
                const isSelected = selectedMesa?.id === m.id;
                const ord = m.ordenActiva;
                const isFree = m.estado === 'Libre' || !ord;

                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedMesaId(m.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-black border-black bg-black text-white shadow-lg'
                        : isFree
                        ? 'border-neutral-200 bg-white text-black hover:border-black hover:shadow-sm'
                        : 'border-neutral-800 bg-neutral-900 text-white hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-base font-black font-sans ${
                            isSelected || !isFree ? 'text-white' : 'text-black'
                          }`}
                        >
                          {m.nombre}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected || !isFree
                              ? 'bg-white text-black'
                              : 'bg-black text-white'
                          }`}
                        >
                          {m.capacidad} PERS.
                        </span>
                      </div>

                      <div
                        className={`flex items-center justify-between text-[11px] mb-3 ${
                          isSelected || !isFree ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        <span>{m.zona}</span>
                        <span className="font-mono font-bold uppercase">
                          {m.estado}
                        </span>
                      </div>
                    </div>

                    {isFree ? (
                      <div
                        className={`pt-2.5 border-t flex items-center justify-between text-xs font-semibold ${
                          isSelected
                            ? 'border-neutral-800 text-neutral-200'
                            : 'border-neutral-100 text-black'
                        }`}
                      >
                        <span>Disponible para abrir</span>
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="pt-2.5 border-t border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
                          <span>{ord.cantAdultos} Adultos · {ord.cantNinos} Niños</span>
                          <span>{ord.folio}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400">Total actual</span>
                          <span className="text-sm font-black font-mono text-white">
                            ${Number(ord.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA (5 COLS): TARJETA 3D + CONFIGURADOR DE CAPACIDAD + CALCULADORA BUFFET + COBRO */}
      <div className="lg:col-span-5 space-y-5">
        {/* Tarjeta 3D Monocromática de la Mesa Seleccionada */}
        <MesaDigitalCard />

        {/* Configurador Rápido de Capacidad de la Mesa Seleccionada (4, 6 o 10 Personas) */}
        {selectedMesa && (
          <div className="p-4 rounded-2xl bg-white border border-neutral-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block">
                CAPACIDAD DE {selectedMesa.nombre.toUpperCase()} ({selectedMesa.zona})
              </span>
              <span className="text-xs font-bold text-black">
                Configurar lugares disponibles en el plano:
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[4, 6, 10].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    cambiarCapacidadMesa(selectedMesa.id, cap);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    selectedMesa.capacidad === cap
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-300'
                  }`}
                >
                  {cap} Pers.
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Panel de Apertura o Calculadora y Cobro */}
        {selectedMesa && (selectedMesa.estado === 'Libre' || !ordenActiva) ? (
          <form
            onSubmit={handleAbrirMesa}
            className="p-6 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-200 space-y-5"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-black font-bold">
                APERTURA DE MESA · CAPACIDAD {selectedMesa.capacidad} PERSONAS · {selectedMesa.zona.toUpperCase()}
              </span>
              <h3 className="text-xl font-black text-black mt-0.5">
                Asignar Comensales de Buffet
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Selecciona la cantidad de adultos ($280.00) y niños ($180.00) que ocuparán la {selectedMesa.nombre}.
              </p>
            </div>

            {/* Contador Adultos ($280) */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-black block">Buffet Adulto</span>
                <span className="text-xs font-mono text-neutral-500">
                  $280.00 MXN por persona
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpenAdultos(Math.max(0, openAdultos - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono font-black text-base text-black">
                  {openAdultos}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenAdultos(openAdultos + 1)}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contador Niños ($180) */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-black block">Buffet Niño</span>
                <span className="text-xs font-mono text-neutral-500">
                  $180.00 MXN por niño
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpenNinos(Math.max(0, openNinos - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono font-black text-base text-black">
                  {openNinos}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenNinos(openNinos + 1)}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Indicador de Capacidad */}
            <div
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-between ${
                totalPersonasAbierto > selectedMesa.capacidad
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-black border border-neutral-200'
              }`}
            >
              <span>Ocupación proyectada:</span>
              <span>
                {totalPersonasAbierto} / {selectedMesa.capacidad} personas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-500 font-bold mb-1">
                  Mesero Asignado
                </label>
                <input
                  type="text"
                  value={openMesero}
                  onChange={(e) => setOpenMesero(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-500 font-bold mb-1">
                  Notas de Mesa
                </label>
                <input
                  type="text"
                  value={openNotas}
                  onChange={(e) => setOpenNotas(e.target.value)}
                  placeholder="Ej. Área familiar, cumpleaños"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black text-white flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Subtotal Buffet Inicial
              </span>
              <span className="text-xl font-black font-mono text-white flex items-center gap-0.5">
                <CurrencyDollarIcon size={18} className="text-white" />
                <AnimeCounter value={subtotalAbierto} decimals={2} duration={350} />
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Abrir {selectedMesa.nombre} y Registrar Buffet</span>
            </button>
          </form>
        ) : (
          ordenActiva && (
            <div className="p-6 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-200 space-y-6">
              {/* 1. Contadores de Buffet en Vivo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-black" />
                    <span>1. Desglose de Buffet ($280 / $180)</span>
                  </span>
                  <span className="text-sm font-mono font-black text-black">
                    ${Number(ordenActiva.subtotalBuffet || 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-black block">Adultos ($280)</span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        ${(ordenActiva.cantAdultos * PRECIO_ADULTO).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('adultos', -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-black text-sm">
                        {ordenActiva.cantAdultos}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('adultos', 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-black block">Niños ($180)</span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        ${(ordenActiva.cantNinos * PRECIO_NINO).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('ninos', -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-black text-sm">
                        {ordenActiva.cantNinos}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('ninos', 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Consumo Extra (Bebidas y Postres) */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-black" />
                    <span>2. Consumo Extra (Bebidas / Postres)</span>
                  </span>
                  <span className="text-sm font-mono font-black text-black">
                    ${Number(ordenActiva.subtotalExtras || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs font-sans bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {productosExtra.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${Number(p.precio).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => modificarExtraMesa(selectedMesa.id, selectedProdId, 1)}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                {ordenActiva.extras && ordenActiva.extras.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {ordenActiva.extras.map((ex) => (
                      <div
                        key={ex.id}
                        className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-black">
                            {ex.cantidad}x {ex.nombreProducto}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-500 ml-2">
                            (${Number(ex.precioUnitario).toFixed(2)} c/u)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-black mr-1">
                            ${Number(ex.subtotal).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => modificarExtraMesa(selectedMesa.id, ex.productoId, -1)}
                            className="w-6 h-6 rounded-md bg-white border border-neutral-300 flex items-center justify-center hover:bg-black hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => modificarExtraMesa(selectedMesa.id, ex.productoId, 1)}
                            className="w-6 h-6 rounded-md bg-white border border-neutral-300 flex items-center justify-center hover:bg-black hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Liquidación y Reflejo de Pago */}
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>3. Cobro y Reflejo de Pago</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-500 font-bold mb-1">
                      Propina ($)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="0"
                        value={propina}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setPropina(val);
                          const nuevoTotal = Math.max(
                            0,
                            (ordenActiva.subtotalBuffet || 0) +
                              (ordenActiva.subtotalExtras || 0) -
                              Number(descuento || 0) +
                              val
                          );
                          setMontoRecibido(nuevoTotal);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAplicarPropinaPct(10)}
                        className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-black hover:text-white text-[10px] font-mono font-bold cursor-pointer border border-neutral-200"
                      >
                        10%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAplicarPropinaPct(15)}
                        className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-black hover:text-white text-[10px] font-mono font-bold cursor-pointer border border-neutral-200"
                      >
                        15%
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-500 font-bold mb-1">
                      Descuento ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={descuento}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setDescuento(val);
                        const nuevoTotal = Math.max(
                          0,
                          (ordenActiva.subtotalBuffet || 0) +
                            (ordenActiva.subtotalExtras || 0) -
                            val +
                            Number(propina || 0)
                        );
                        setMontoRecibido(nuevoTotal);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Selector de Método de Pago */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Efectivo', icon: Banknote },
                    { id: 'Tarjeta', icon: CreditCard },
                    { id: 'Transferencia', icon: Smartphone },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMetodoPago(m.id);
                          setMontoRecibido(granTotalCobro);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          metodoPago === m.id
                            ? 'bg-black text-white shadow-md'
                            : 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.id}</span>
                      </button>
                    );
                  })}
                </div>

                {metodoPago === 'Efectivo' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase text-neutral-500 font-bold">
                        Monto Recibido en Efectivo
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setMontoRecibido(granTotalCobro)}
                          className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-black hover:text-white text-[10px] font-mono font-bold cursor-pointer border border-neutral-200"
                        >
                          Exacto
                        </button>
                        {[500, 1000, 2000].map((billete) => (
                          <button
                            key={billete}
                            type="button"
                            onClick={() => setMontoRecibido(billete)}
                            className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-black hover:text-white text-[10px] font-mono font-bold cursor-pointer border border-neutral-200"
                          >
                            ${billete}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-mono font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-neutral-500 font-bold mb-1">
                      Referencia de Terminal / SPEI
                    </label>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ej. AUT-90421"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                    />
                  </div>
                )}

                {/* Barra de Total y Cambio en Negro y Blanco */}
                <div className="p-4 rounded-2xl bg-black text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-neutral-300">
                      TOTAL A COBRAR
                    </span>
                    <span className="text-2xl font-black font-mono text-white">
                      ${granTotalCobro.toFixed(2)} MXN
                    </span>
                  </div>
                  {metodoPago === 'Efectivo' && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs font-mono">
                      <span className="text-neutral-400">Cambio a entregar:</span>
                      <span className="font-bold text-white">
                        {cambioCalculado >= 0
                          ? `$${cambioCalculado.toFixed(2)} MXN`
                          : `Faltan $${Math.abs(cambioCalculado).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón Principal de Cobro */}
                <button
                  type="button"
                  onClick={handleCobrar}
                  className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cobrar Cuenta, Reflejar Pago y Emitir Ticket</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      actualizarCuentaMesa(selectedMesa.id, {
                        cantAdultos: ordenActiva.cantAdultos,
                        cantNinos: ordenActiva.cantNinos,
                        mesero: ordenActiva.mesero,
                        propina: Number(propina || 0),
                        descuento: Number(descuento || 0),
                        estadoMesa: 'Por Pagar',
                      })
                    }
                    className="py-2.5 rounded-xl bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Marcar Por Pagar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => liberarMesa(selectedMesa.id)}
                    className="py-2.5 rounded-xl bg-white hover:bg-black hover:text-white text-black border border-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Liberar Mesa</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BuffetPosWorkspace;
