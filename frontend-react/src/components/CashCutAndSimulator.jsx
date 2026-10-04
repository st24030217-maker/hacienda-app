import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Wine,
  CreditCard,
  Printer,
  Calculator,
  LayoutGrid,
  Plus,
  Minus,
} from 'lucide-react';
import { CurrencyDollarIcon } from './icons/currency-dollar-icon';
import {
  useRestaurant,
  PRECIO_ADULTO,
  PRECIO_NINO,
} from '../context/RestaurantContext';
import { AnimeCounter } from './ui/anime-counter';

export const CashCutPanel = () => {
  const { corte } = useRestaurant();

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-xl border border-neutral-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <h3 className="text-2xl sm:text-3xl font-anton uppercase tracking-wider text-black flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-black" />
          <span>Corte de Caja</span>
        </h3>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer self-start"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Corte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Buffet */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-200">
            <Users className="w-4 h-4 text-black" />
            <span>Buffet</span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-600">
              Adultos ({corte?.totalAdultosAtendidos || 0}):
            </span>
            <span className="font-mono font-bold text-black">
              ${Number(corte?.ingresoBuffetAdultos || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-600">
              Niños ({corte?.totalNinosAtendidos || 0}):
            </span>
            <span className="font-mono font-bold text-black">
              ${Number(corte?.ingresoBuffetNinos || 0).toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-black uppercase">Subtotal:</span>
            <span className="text-2xl font-anton tracking-wide text-black">
              ${Number(corte?.ingresoTotalBuffet || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* 2. Extras y Propinas */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-200">
            <Wine className="w-4 h-4 text-black" />
            <span>Extras y Propinas</span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-600">Extras:</span>
            <span className="font-mono font-bold text-black">
              ${Number(corte?.ingresoTotalExtras || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-600">Propinas:</span>
            <span className="font-mono font-bold text-black">
              +${Number(corte?.totalPropinas || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-600">Descuentos:</span>
            <span className="font-mono font-bold text-black">
              -${Number(corte?.totalDescuentos || 0).toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-black uppercase">Total Neto:</span>
            <span className="text-2xl font-anton tracking-wide text-black flex items-center gap-0.5">
              <CurrencyDollarIcon size={18} className="text-black" />
              <AnimeCounter value={corte?.granTotalCobrado || 0} decimals={2} />
            </span>
          </div>
        </div>

        {/* 3. Formas de Pago */}
        <div className="p-5 rounded-2xl bg-black text-white space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white pb-2 border-b border-white/15">
            <CreditCard className="w-4 h-4 text-white" />
            <span>Formas de Pago</span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-300">Efectivo:</span>
            <span className="font-mono font-bold text-white">
              ${Number(corte?.totalEfectivo || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-300">Tarjeta:</span>
            <span className="font-mono font-bold text-white">
              ${Number(corte?.totalTarjeta || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-sans">
            <span className="text-neutral-300">SPEI:</span>
            <span className="font-mono font-bold text-white">
              ${Number(corte?.totalTransferencia || 0).toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-white/15 flex justify-between items-baseline">
            <span className="text-xs uppercase text-neutral-300">Tickets:</span>
            <span className="text-xl font-anton tracking-wide text-white">
              {corte?.totalPagosRegistrados || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BuffetGroupSimulator = () => {
  const [adultos, setAdultos] = useState(4);
  const [ninos, setNinos] = useState(2);
  const [extras, setExtras] = useState(0);

  const totalPersonas = adultos + ninos;
  const subAdultos = adultos * PRECIO_ADULTO;
  const subNinos = ninos * PRECIO_NINO;
  const granTotal = subAdultos + subNinos + Number(extras || 0);

  let mesaSugerida = 'Mesa de 4';
  if (totalPersonas > 4 && totalPersonas <= 6) {
    mesaSugerida = 'Mesa de 6';
  } else if (totalPersonas > 6 && totalPersonas <= 10) {
    mesaSugerida = 'Mesa de 10';
  } else if (totalPersonas > 10) {
    mesaSugerida = `${Math.ceil(totalPersonas / 10)} Mesas de 10`;
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-xl border border-neutral-200">
      <div className="pb-5 border-b border-neutral-200 mb-6">
        <h3 className="text-2xl sm:text-3xl font-anton uppercase tracking-wider text-black flex items-center gap-2.5">
          <Calculator className="w-6 h-6 text-black" />
          <span>Cotizador</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-base font-black text-black block">Adultos</span>
              <span className="text-xs font-mono text-neutral-500">$280.00 c/u</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdultos(Math.max(0, adultos - 1))}
                className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-anton text-xl">{adultos}</span>
              <button
                type="button"
                onClick={() => setAdultos(adultos + 1)}
                className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-base font-black text-black block">Niños</span>
              <span className="text-xs font-mono text-neutral-500">$180.00 c/u</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNinos(Math.max(0, ninos - 1))}
                className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-anton text-xl">{ninos}</span>
              <button
                type="button"
                onClick={() => setNinos(ninos + 1)}
                className="w-10 h-10 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-neutral-600 font-bold mb-1.5">
              Extras ($)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={extras}
              onChange={(e) => setExtras(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-base font-mono font-bold"
            />
          </div>
        </div>

        <div className="lg:col-span-6 p-6 rounded-3xl bg-black text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <span className="text-sm text-neutral-300">{totalPersonas} Personas</span>
            <span className="px-3.5 py-1 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{mesaSugerida}</span>
            </span>
          </div>

          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between text-neutral-300">
              <span>{adultos} Adultos:</span>
              <span className="text-white font-bold">${subAdultos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>{ninos} Niños:</span>
              <span className="text-white font-bold">${subNinos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Extras:</span>
              <span className="text-white font-bold">${Number(extras || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Total
            </span>
            <span className="text-3xl font-anton tracking-wide text-white flex items-center gap-1">
              <CurrencyDollarIcon size={22} className="text-white" />
              <AnimeCounter value={granTotal} decimals={2} duration={400} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
