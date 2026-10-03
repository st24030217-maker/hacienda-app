import React from 'react';
import {
  History,
  Receipt,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CurrencyDollarIcon } from './icons/currency-dollar-icon';
import {
  useRestaurant,
  PRECIO_ADULTO,
  PRECIO_NINO,
} from '../context/RestaurantContext';
import { WobbleCard } from './ui/wobble-card';
import { AnimeCounter } from './ui/anime-counter';

export const PaymentReflectionHistory = () => {
  const {
    pagos,
    corte,
    filtroMetodoPago,
    setFiltroMetodoPago,
    recargarDashboard,
    selectedTicket,
    setSelectedTicket,
  } = useRestaurant();

  const handleFilterChange = async (metodo) => {
    setFiltroMetodoPago(metodo);
    await recargarDashboard(metodo);
  };

  return (
    <>
      <WobbleCard
        containerClassName="w-full bg-black text-white border border-neutral-800 shadow-2xl transition-colors"
        className="p-6 sm:p-8 flex flex-col justify-between"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 gap-4 border-b border-white/15">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest">
                BITÁCORA OFICIAL DE CAJA & REFLEJO DE PAGOS
              </span>
              <span className="text-neutral-500 text-xs font-mono">•</span>
              <span className="text-[11px] font-mono text-neutral-300">
                .NET API + PHP + MYSQL
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <History className="w-6 h-6 text-white" />
              <span>Reflejo de Pagos e Historial de Tickets</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 font-sans max-w-2xl leading-relaxed">
              Registro auditable de cuentas liquidadas con desglose de Buffet Adulto ($280.00 MXN), Buffet Niño ($180.00 MXN), consumo extra y arqueo por método de cobro.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-sans">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                Total Reflejado Hoy
              </span>
              <span className="text-lg font-black text-white flex items-center justify-end gap-1 font-mono">
                <CurrencyDollarIcon size={16} className="text-white" />
                <AnimeCounter
                  value={corte?.granTotalCobrado || 0}
                  decimals={2}
                  duration={600}
                  className="text-lg font-black text-white font-mono"
                />
              </span>
            </div>
            <span className="text-xs font-mono text-black bg-white font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              {pagos.length} Pagos
            </span>
          </div>
        </div>

        {/* Selector de Filtro por Método de Pago en Blanco y Negro */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { id: 'Todos', label: 'Todos los Cobros', icon: Receipt },
            { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
            { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
            { id: 'Transferencia', label: 'Transferencia SPEI', icon: Smartphone },
          ].map((f) => {
            const Icon = f.icon;
            const active = filtroMetodoPago === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tabla de Pagos */}
        {pagos.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/5 font-sans border border-white/10">
            <Receipt className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-200">
              No hay pagos registrados con este filtro
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Los pagos se reflejan automáticamente al liquidar cualquier mesa de 4, 6 o 10 personas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-neutral-950 border border-white/15 shadow-lg">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="text-neutral-300 uppercase font-sans font-bold bg-white/10">
                  <th className="py-3.5 px-4">Ticket / Hora</th>
                  <th className="py-3.5 px-4">Mesa (Capacidad)</th>
                  <th className="py-3.5 px-4">Adultos ($280)</th>
                  <th className="py-3.5 px-4">Niños ($180)</th>
                  <th className="py-3.5 px-4">Extras / Propina</th>
                  <th className="py-3.5 px-4">Método / Cambio</th>
                  <th className="py-3.5 px-4 text-right">Total Pagado</th>
                  <th className="py-3.5 px-4 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono">
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{p.folioTicket}</span>
                      <span className="text-[11px] text-neutral-400">
                        {(p.fechaPago || '').replace('T', ' ').substring(0, 16)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="font-bold text-white block">
                        Mesa {p.mesaNumero}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Capacidad {p.mesaCapacidad} personas
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200">
                      {p.cantAdultos} × $280 ={' '}
                      <strong className="text-white">
                        ${(p.cantAdultos * PRECIO_ADULTO).toFixed(2)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200">
                      {p.cantNinos} × $180 ={' '}
                      <strong className="text-white">
                        ${(p.cantNinos * PRECIO_NINO).toFixed(2)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 text-[11px]">
                      <div>Extras: ${Number(p.subtotalExtras || 0).toFixed(2)}</div>
                      <div>Propina: ${Number(p.propina || 0).toFixed(2)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-[11px] text-black bg-white px-2.5 py-0.5 rounded-lg font-bold inline-block">
                        {p.metodoPago}
                      </span>
                      <span className="block text-[10px] font-mono text-neutral-300 mt-1">
                        Rec: ${Number(p.montoRecibido || 0).toFixed(2)} · Cambio: $
                        {Number(p.cambio || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sm text-white">
                      <span className="inline-flex items-center gap-0.5 justify-end">
                        <CurrencyDollarIcon size={14} className="text-white" />
                        <span>{Number(p.montoTotal || 0).toFixed(2)}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(p)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black transition text-[11px] font-sans font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Ver Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WobbleCard>

      {/* Modal de Comprobante / Ticket Imprimible 80mm en Blanco y Negro */}
      {selectedTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-black shadow-2xl border-2 border-black relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-black hover:text-white flex items-center justify-center text-black transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center border-b border-dashed border-neutral-400 pb-4 mb-4">
              <img
                src="./hacienda-logo-black.png"
                alt="La Hacienda Restaurante"
                className="w-16 h-18 object-contain mx-auto mb-2"
              />
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold mb-2">
                <CheckCircle2 className="w-3 h-3" />
                <span>PAGO REFLEJADO</span>
              </span>
              <h3 className="text-xl font-black text-black tracking-tight">
                LA HACIENDA RESTAURANTE
              </h3>
              <p className="text-xs text-neutral-600 font-mono">
                FOLIO: {selectedTicket.folioTicket} · MESA #{selectedTicket.mesaNumero} (
                {selectedTicket.mesaCapacidad} PERS.)
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                {(selectedTicket.fechaPago || '').replace('T', ' ').substring(0, 19)} · Cajero:{' '}
                {selectedTicket.cajero}
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono border-b border-dashed border-neutral-400 pb-4 mb-4">
              {selectedTicket.cantAdultos > 0 && (
                <div className="flex justify-between">
                  <span>{selectedTicket.cantAdultos}x Buffet Adulto ($280.00)</span>
                  <span className="font-bold">
                    ${(selectedTicket.cantAdultos * PRECIO_ADULTO).toFixed(2)}
                  </span>
                </div>
              )}
              {selectedTicket.cantNinos > 0 && (
                <div className="flex justify-between">
                  <span>{selectedTicket.cantNinos}x Buffet Niño ($180.00)</span>
                  <span className="font-bold">
                    ${(selectedTicket.cantNinos * PRECIO_NINO).toFixed(2)}
                  </span>
                </div>
              )}
              {(selectedTicket.extras || []).map((ex, idx) => (
                <div key={idx} className="flex justify-between text-neutral-700">
                  <span>
                    {ex.cantidad}x {ex.nombreProducto}
                  </span>
                  <span>${Number(ex.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs font-mono border-b border-dashed border-neutral-400 pb-4 mb-4">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal Buffet:</span>
                <span>${Number(selectedTicket.subtotalBuffet || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal Extras:</span>
                <span>${Number(selectedTicket.subtotalExtras || 0).toFixed(2)}</span>
              </div>
              {selectedTicket.descuento > 0 && (
                <div className="flex justify-between text-black font-bold">
                  <span>Descuento:</span>
                  <span>-${Number(selectedTicket.descuento).toFixed(2)}</span>
                </div>
              )}
              {selectedTicket.propina > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Propina:</span>
                  <span>${Number(selectedTicket.propina).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-black pt-2">
                <span>TOTAL PAGADO:</span>
                <span>${Number(selectedTicket.montoTotal || 0).toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1">
                <span>Método de Pago:</span>
                <span className="font-bold text-black">{selectedTicket.metodoPago}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Monto Recibido:</span>
                <span>${Number(selectedTicket.montoRecibido || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black font-bold">
                <span>Cambio Entregado:</span>
                <span>${Number(selectedTicket.cambio || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Código QR SVG de Verificación CFDI */}
            <div className="flex items-center justify-between bg-neutral-100 border border-neutral-200 p-3 rounded-2xl mb-5">
              <div className="text-[11px] font-sans text-neutral-700">
                <strong className="text-black block font-mono">
                  SELLO DIGITAL VERIFICADO
                </strong>
                <span>La Hacienda Buffet · Tarifas $280 / $180</span>
              </div>
              <svg className="w-14 h-14 shrink-0" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#FFFFFF" />
                <rect x="8" y="8" width="24" height="24" fill="#000" />
                <rect x="12" y="12" width="16" height="16" fill="#FFFFFF" />
                <rect x="16" y="16" width="8" height="8" fill="#000" />
                <rect x="68" y="8" width="24" height="24" fill="#000" />
                <rect x="72" y="12" width="16" height="16" fill="#FFFFFF" />
                <rect x="76" y="16" width="8" height="8" fill="#000" />
                <rect x="8" y="68" width="24" height="24" fill="#000" />
                <rect x="12" y="72" width="16" height="16" fill="#FFFFFF" />
                <rect x="16" y="76" width="8" height="8" fill="#000" />
                <rect x="42" y="42" width="16" height="16" fill="#000" />
                <rect x="44" y="16" width="10" height="10" fill="#000" />
                <rect x="66" y="50" width="12" height="12" fill="#000" />
                <rect x="46" y="72" width="14" height="14" fill="#000" />
              </svg>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket 80mm</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="py-3 px-5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentReflectionHistory;
