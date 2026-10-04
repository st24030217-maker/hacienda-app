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
          <h2 className="text-2xl sm:text-3xl font-anton uppercase tracking-wider text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-white" />
            <span>Historial de Pagos</span>
          </h2>

          <div className="flex items-center gap-3">
            <div className="text-right font-sans">
              <span className="text-xs uppercase tracking-wider text-neutral-400 block">
                Total Hoy
              </span>
              <span className="text-2xl font-anton tracking-wide text-white flex items-center justify-end gap-0.5">
                <CurrencyDollarIcon size={18} className="text-white" />
                <AnimeCounter
                  value={corte?.granTotalCobrado || 0}
                  decimals={2}
                  duration={600}
                  className="text-2xl font-anton tracking-wide text-white"
                />
              </span>
            </div>
            <span className="text-xs font-mono text-black bg-white font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              {pagos.length} Tickets
            </span>
          </div>
        </div>

        {/* Filtros por Método de Pago */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { id: 'Todos', label: 'Todos', icon: Receipt },
            { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
            { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
            { id: 'Transferencia', label: 'SPEI', icon: Smartphone },
          ].map((f) => {
            const Icon = f.icon;
            const active = filtroMetodoPago === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-sans font-bold transition flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tabla de Pagos */}
        {pagos.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/5 font-sans border border-white/10">
            <Receipt className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-neutral-200">
              Sin pagos registrados
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-neutral-950 border border-white/15 shadow-lg">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="text-neutral-300 uppercase font-sans font-bold bg-white/10 text-xs">
                  <th className="py-3.5 px-4">Folio</th>
                  <th className="py-3.5 px-4">Mesa</th>
                  <th className="py-3.5 px-4">Buffet</th>
                  <th className="py-3.5 px-4">Extras</th>
                  <th className="py-3.5 px-4">Método</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white block">{p.folioTicket}</span>
                      <span className="text-xs text-neutral-400">
                        {(p.fechaPago || '').replace('T', ' ').substring(11, 16)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">
                        Mesa {p.mesaNumero}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {p.mesaCapacidad} pers.
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200">
                      {p.cantAdultos} Ad. · {p.cantNinos} Niños
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      ${Number(p.subtotalExtras || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-black bg-white px-2.5 py-1 rounded-lg font-bold inline-block">
                        {p.metodoPago}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-anton text-lg tracking-wide text-white">
                      ${Number(p.montoTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(p)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black transition text-xs font-sans font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WobbleCard>

      {/* Modal de Ticket 80mm */}
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
                <span>PAGADO</span>
              </span>
              <h3 className="text-2xl font-anton uppercase tracking-wider text-black">
                La Hacienda
              </h3>
              <p className="text-xs text-neutral-600 font-mono">
                {selectedTicket.folioTicket} · MESA {selectedTicket.mesaNumero}
              </p>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {(selectedTicket.fechaPago || '').replace('T', ' ').substring(0, 16)}
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono border-b border-dashed border-neutral-400 pb-4 mb-4">
              {selectedTicket.cantAdultos > 0 && (
                <div className="flex justify-between">
                  <span>{selectedTicket.cantAdultos}x Buffet Adulto ($280)</span>
                  <span className="font-bold">
                    ${(selectedTicket.cantAdultos * PRECIO_ADULTO).toFixed(2)}
                  </span>
                </div>
              )}
              {selectedTicket.cantNinos > 0 && (
                <div className="flex justify-between">
                  <span>{selectedTicket.cantNinos}x Buffet Niño ($180)</span>
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
              <div className="flex justify-between text-lg font-black text-black pt-1">
                <span>TOTAL:</span>
                <span>${Number(selectedTicket.montoTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1">
                <span>Método:</span>
                <span className="font-bold text-black">{selectedTicket.metodoPago}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Recibido:</span>
                <span>${Number(selectedTicket.montoRecibido || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black font-bold">
                <span>Cambio:</span>
                <span>${Number(selectedTicket.cambio || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
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
