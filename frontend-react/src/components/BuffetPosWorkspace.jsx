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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* COLUMNA IZQUIERDA (7 COLS): PLANO / TARJETAS */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-2 rounded-2xl bg-white border border-neutral-300 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setVistaMapa('plano');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-sans font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                vistaMapa === 'plano'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black hover:bg-neutral-100'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Plano (23)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setVistaMapa('grid');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-sans font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                vistaMapa === 'grid'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black hover:bg-neutral-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tarjetas</span>
            </button>
          </div>

          <span className="hidden xl:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono font-bold text-black">
            <span>4p: {total4}</span>
            <span>·</span>
            <span>6p: {total6}</span>
            <span>·</span>
            <span>10p: {total10}</span>
          </span>
        </div>

        {vistaMapa === 'plano' ? (
          <HaciendaFloorPlanMap />
        ) : (
          <div className="p-6 rounded-3xl bg-white shadow-xl border border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 mb-5">
              <h3 className="text-2xl font-anton uppercase tracking-wider text-black">
                Mesas ({mesasFiltradas.length})
              </h3>

              {/* Filtros de Capacidad */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { cap: 0, label: `Todas (${mesas.length})` },
                  { cap: 4, label: `4p (${total4})` },
                  { cap: 6, label: `6p (${total6})` },
                  { cap: 10, label: `10p (${total10})` },
                ].map((f) => (
                  <button
                    key={f.cap}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setFiltroCapacidad(f.cap);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
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

            {/* Grid de Mesas */}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-lg font-anton tracking-wide uppercase ${
                            isSelected || !isFree ? 'text-white' : 'text-black'
                          }`}
                        >
                          {m.nombre}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected || !isFree
                              ? 'bg-white text-black'
                              : 'bg-black text-white'
                          }`}
                        >
                          {m.capacidad}p
                        </span>
                      </div>

                      <div
                        className={`flex items-center justify-between text-xs mb-3 ${
                          isSelected || !isFree ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        <span>{m.zona}</span>
                        <span className="font-bold uppercase">{m.estado}</span>
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
                        <span>Libre</span>
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-xs text-neutral-300">
                          {ord.cantAdultos} Ad. · {ord.cantNinos} Niños
                        </span>
                        <span className="text-base font-anton tracking-wide text-white">
                          ${Number(ord.total || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA (5 COLS): TARJETA + CUENTA */}
      <div className="lg:col-span-5 space-y-4">
        <MesaDigitalCard />

        {/* Selector de Capacidad Compacto */}
        {selectedMesa && (
          <div className="px-4 py-3 rounded-2xl bg-white border border-neutral-300 shadow-sm flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-black">
              Capacidad ({selectedMesa.nombre}):
            </span>
            <div className="flex items-center gap-1.5">
              {[4, 6, 10].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    cambiarCapacidadMesa(selectedMesa.id, cap);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
                    selectedMesa.capacidad === cap
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-300'
                  }`}
                >
                  {cap}p
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Panel de Apertura o Cobro */}
        {selectedMesa && (selectedMesa.estado === 'Libre' || !ordenActiva) ? (
          <form
            onSubmit={handleAbrirMesa}
            className="p-6 rounded-3xl bg-white shadow-xl border border-neutral-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-anton uppercase tracking-wider text-black">
                Abrir {selectedMesa.nombre}
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-black">
                {totalPersonasAbierto} / {selectedMesa.capacidad} pers.
              </span>
            </div>

            {/* Contador Adultos ($280) */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-black block">Adultos</span>
                <span className="text-xs font-mono text-neutral-500">$280.00 c/u</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpenAdultos(Math.max(0, openAdultos - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-anton text-xl text-black">
                  {openAdultos}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenAdultos(openAdultos + 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contador Niños ($180) */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-black block">Niños</span>
                <span className="text-xs font-mono text-neutral-500">$180.00 c/u</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpenNinos(Math.max(0, openNinos - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-anton text-xl text-black">
                  {openNinos}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenNinos(openNinos + 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase text-neutral-500 font-bold mb-1">
                  Mesero
                </label>
                <input
                  type="text"
                  value={openMesero}
                  onChange={(e) => setOpenMesero(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-500 font-bold mb-1">
                  Notas
                </label>
                <input
                  type="text"
                  value={openNotas}
                  onChange={(e) => setOpenNotas(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black text-white flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                Total Buffet
              </span>
              <span className="text-2xl font-anton tracking-wide text-white flex items-center gap-0.5">
                <CurrencyDollarIcon size={20} className="text-white" />
                <AnimeCounter value={subtotalAbierto} decimals={2} duration={350} />
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-sans font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Abrir Mesa</span>
            </button>
          </form>
        ) : (
          ordenActiva && (
            <div className="p-6 rounded-3xl bg-white shadow-xl border border-neutral-200 space-y-5">
              {/* 1. Buffet */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-black" />
                    <span>Buffet</span>
                  </span>
                  <span className="text-base font-anton tracking-wide text-black">
                    ${Number(ordenActiva.subtotalBuffet || 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-black block">Adultos</span>
                      <span className="text-xs font-mono text-neutral-500">$280 c/u</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('adultos', -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-anton text-lg">
                        {ordenActiva.cantAdultos}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('adultos', 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-black block">Niños</span>
                      <span className="text-xs font-mono text-neutral-500">$180 c/u</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('ninos', -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-anton text-lg">
                        {ordenActiva.cantNinos}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustBuffetActivo('ninos', 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Extras */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                    <Wine className="w-4 h-4 text-black" />
                    <span>Extras</span>
                  </span>
                  <span className="text-base font-anton tracking-wide text-black">
                    ${Number(ordenActiva.subtotalExtras || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(Number(e.target.value))}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-black"
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
                    className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
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
                        <span className="font-bold text-black">
                          {ex.cantidad}x {ex.nombreProducto}
                        </span>
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

              {/* 3. Cobro */}
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <span className="text-sm uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Cobro</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 font-bold mb-1">
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
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAplicarPropinaPct(10)}
                        className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-black hover:text-white text-xs font-mono font-bold cursor-pointer border border-neutral-200"
                      >
                        10%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAplicarPropinaPct(15)}
                        className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-black hover:text-white text-xs font-mono font-bold cursor-pointer border border-neutral-200"
                      >
                        15%
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-500 font-bold mb-1">
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
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Método de Pago */}
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
                        <Icon className="w-4 h-4" />
                        <span>{m.id}</span>
                      </button>
                    );
                  })}
                </div>

                {metodoPago === 'Efectivo' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase text-neutral-500 font-bold">
                        Recibido
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setMontoRecibido(granTotalCobro)}
                          className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-black hover:text-white text-xs font-mono font-bold cursor-pointer border border-neutral-200"
                        >
                          Exacto
                        </button>
                        {[500, 1000, 2000].map((billete) => (
                          <button
                            key={billete}
                            type="button"
                            onClick={() => setMontoRecibido(billete)}
                            className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-black hover:text-white text-xs font-mono font-bold cursor-pointer border border-neutral-200"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-base font-mono font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 font-bold mb-1">
                      Referencia
                    </label>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono"
                    />
                  </div>
                )}

                {/* Total y Cambio */}
                <div className="p-4 rounded-2xl bg-black text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold uppercase text-neutral-300">
                      Total
                    </span>
                    <span className="text-3xl font-anton tracking-wide text-white">
                      ${granTotalCobro.toFixed(2)}
                    </span>
                  </div>
                  {metodoPago === 'Efectivo' && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/15 text-sm font-mono">
                      <span className="text-neutral-400">Cambio:</span>
                      <span className="font-bold text-white">
                        {cambioCalculado >= 0
                          ? `$${cambioCalculado.toFixed(2)}`
                          : `Faltan $${Math.abs(cambioCalculado).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCobrar}
                  className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-sans font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cobrar y Emitir Ticket</span>
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
                    <span>Por Pagar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => liberarMesa(selectedMesa.id)}
                    className="py-2.5 rounded-xl bg-white hover:bg-black hover:text-white text-black border border-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Liberar</span>
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
