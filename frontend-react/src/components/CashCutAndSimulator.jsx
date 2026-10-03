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
    <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-black font-bold">
            AUDITORÍA FINANCIERA DEL DÍA · {corte?.modoAlmacenamiento || 'MySQL + .NET'}
          </span>
          <h3 className="text-2xl font-black text-black tracking-tight mt-0.5 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-black" />
            <span>Corte de Caja y Arqueo de Buffet</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Concentrado de ingresos divididos por Buffet Adulto ($280.00), Buffet Niño ($180.00), consumo extra y formas de pago.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer self-start"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Corte de Caja</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bloque 1: Desglose Buffet Adulto vs Niño */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-200">
            <Users className="w-4 h-4 text-black" />
            <span>1. Ingresos por Buffet</span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-600">
              Adultos ({corte?.totalAdultosAtendidos || 0} × $280.00):
            </span>
            <span className="font-mono font-bold text-black">
              ${Number(corte?.ingresoBuffetAdultos || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-600">
              Niños ({corte?.totalNinosAtendidos || 0} × $180.00):
            </span>
            <span className="font-mono font-bold text-black">
              ${Number(corte?.ingresoBuffetNinos || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-600">Total Comensales Cobrados:</span>
            <span className="font-mono font-bold text-black">
              {(corte?.totalAdultosAtendidos || 0) + (corte?.totalNinosAtendidos || 0)} pers.
            </span>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-black uppercase">Subtotal Buffet:</span>
            <span className="text-lg font-black font-mono text-black">
              ${Number(corte?.ingresoTotalBuffet || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bloque 2: Consumo Extra, Propinas y Descuentos */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-200">
            <Wine className="w-4 h-4 text-black" />
            <span>2. Extras y Propinas</span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-600">Bebidas y Postres Extra:</span>
            <span className="font-mono font-bold text-black">
              ${Number(corte?.ingresoTotalExtras || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-600">Propinas Recaudadas:</span>
            <span className="font-mono font-bold text-black">
              +${Number(corte?.totalPropinas || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-600">Descuentos Otorgados:</span>
            <span className="font-mono font-bold text-black">
              -${Number(corte?.totalDescuentos || 0).toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-black uppercase">Gran Total Neto:</span>
            <span className="text-lg font-black font-mono text-black flex items-center gap-0.5">
              <CurrencyDollarIcon size={16} className="text-black" />
              <AnimeCounter value={corte?.granTotalCobrado || 0} decimals={2} />
            </span>
          </div>
        </div>

        {/* Bloque 3: Arqueo por Método de Pago */}
        <div className="p-5 rounded-2xl bg-black text-white space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white pb-2 border-b border-white/15">
            <CreditCard className="w-4 h-4 text-white" />
            <span>3. Arqueo por Forma de Pago</span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-300">Efectivo en Caja:</span>
            <span className="font-mono font-bold text-white">
              ${Number(corte?.totalEfectivo || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-300">Terminal Bancaria (Tarjeta):</span>
            <span className="font-mono font-bold text-white">
              ${Number(corte?.totalTarjeta || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-sans">
            <span className="text-neutral-300">Transferencias SPEI:</span>
            <span className="font-mono font-bold text-white">
              ${Number(corte?.totalTransferencia || 0).toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-white/15 flex justify-between items-baseline">
            <span className="text-xs font-mono uppercase text-neutral-300">
              Tickets Liquidados:
            </span>
            <span className="text-base font-black font-mono text-white">
              {corte?.totalPagosRegistrados || 0} Folios
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

  let mesaSugerida = 'Mesa de 4 Personas';
  if (totalPersonas > 4 && totalPersonas <= 6) {
    mesaSugerida = 'Mesa de 6 Personas (Pasillos Laterales)';
  } else if (totalPersonas > 6 && totalPersonas <= 10) {
    mesaSugerida = 'Mesa de 10 Personas (Pasillo Superior / Trasero)';
  } else if (totalPersonas > 10) {
    mesaSugerida = `Combinación de ${Math.ceil(totalPersonas / 10)} Mesas de 10 Personas`;
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-200">
      <div className="pb-5 border-b border-neutral-200 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-black font-bold">
          SIMULADOR INSTANTÁNEO DE TARIFAS Y CAPACIDAD
        </span>
        <h3 className="text-2xl font-black text-black tracking-tight mt-0.5 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-black" />
          <span>Cotizador Rápido de Buffet y Asignación de Mesa</span>
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Calcula al instante el presupuesto para cualquier grupo de comensales y conoce qué mesa (4, 6 o 10 personas) asignarles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-black text-black block">
                Cantidad de Adultos
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Tarifa oficial: $280.00 MXN
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setAdultos(Math.max(0, adultos - 1))}
                className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono font-black text-lg">
                {adultos}
              </span>
              <button
                type="button"
                onClick={() => setAdultos(adultos + 1)}
                className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-black text-black block">
                Cantidad de Niños
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Tarifa oficial: $180.00 MXN
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setNinos(Math.max(0, ninos - 1))}
                className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono font-black text-lg">
                {ninos}
              </span>
              <button
                type="button"
                onClick={() => setNinos(ninos + 1)}
                className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 font-bold mb-1.5">
              Consumo Extra Estimado en Bebidas / Postres ($)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={extras}
              onChange={(e) => setExtras(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono font-bold"
            />
          </div>
        </div>

        <div className="lg:col-span-6 p-6 rounded-3xl bg-black text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <span className="text-xs font-mono uppercase text-neutral-300">
              Mesa Recomendada ({totalPersonas} Comensales)
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-mono font-bold flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{mesaSugerida}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-300">
              <span>{adultos} Adulto(s) × $280.00 MXN:</span>
              <span className="text-white font-bold">${subAdultos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>{ninos} Niño(s) × $180.00 MXN:</span>
              <span className="text-white font-bold">${subNinos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Consumo Extra Estimado:</span>
              <span className="text-white font-bold">${Number(extras || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              TOTAL ESTIMADO A PAGAR
            </span>
            <span className="text-2xl font-black font-mono text-white flex items-center gap-1">
              <CurrencyDollarIcon size={20} className="text-white" />
              <AnimeCounter value={granTotal} decimals={2} duration={400} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
