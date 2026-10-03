import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { AnimatePresence, motion } from 'motion/react';
import {
  Users,
  LayoutGrid,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { CurrencyDollarIcon } from '../icons/currency-dollar-icon';
import { useRestaurant } from '../../context/RestaurantContext';
import { AnimeCounter } from './anime-counter';
import { CanvasRevealEffect, AceternityCornerIcon } from './canvas-reveal-effect';

export const AnimeMetricsHub = ({ onNavigateTab }) => {
  const { corte } = useRestaurant();
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);
  const barsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.metric-hub-card');

    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.98, 1],
      delay: stagger(75, { start: 100 }),
      duration: 600,
      ease: 'outExpo',
    });
  }, []);

  useEffect(() => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll('.telemetry-mini-bar');

    const anim = animate(bars, {
      scaleY: () => [0.2 + Math.random() * 0.3, 0.6 + Math.random() * 0.4],
      duration: 500,
      alternate: true,
      loop: true,
      ease: 'inOutQuad',
      delay: stagger(60),
    });

    return () => {
      if (anim && typeof anim.pause === 'function') anim.pause();
    };
  }, []);

  const ocupadasTotal = (corte?.mesasOcupadas || 0) + (corte?.mesasPorPagar || 0);

  return (
    <div id="panel-control-metropolitano" className="w-full space-y-3 font-sans scroll-mt-28">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          <span className="font-bold text-white uppercase tracking-wider text-[10px] sm:text-[11px] font-sans">
            PANEL DE CONTROL DE OPERACIONES · LA HACIENDA RESTAURANTE
          </span>
          <span className="text-neutral-500 hidden sm:inline">•</span>
          <span className="text-neutral-300 text-[10px] hidden sm:inline font-mono">
            ADULTO $280 · NIÑO $180 · 23 MESAS (4, 6 Y 10)
          </span>
        </div>

        <div ref={barsRef} className="flex items-end gap-1 h-3.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 shadow-sm">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="telemetry-mini-bar w-1 rounded-full bg-white origin-bottom"
              style={{ height: '100%' }}
            />
          ))}
          <span className="text-[9px] font-mono text-white font-bold ml-1">SYNC</span>
        </div>
      </div>

      {/* Grid de 4 Bloques Monocromáticos (Negro y Blanco) con Canvas Reveal Effect */}
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. REFLEJO TOTAL COBRADO HOY */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('history')}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl shadow-neutral-200/50 flex flex-col justify-between overflow-hidden border border-neutral-200"
        >
          <AceternityCornerIcon className="absolute -top-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -top-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />

          <AnimatePresence>
            {hoveredCard === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 pointer-events-none z-0"
              >
                <CanvasRevealEffect
                  animationSpeed={3.0}
                  containerClassName="bg-neutral-100/80"
                  colors={[
                    [0, 0, 0],
                    [82, 82, 82],
                  ]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 font-sans">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-black text-white shadow-sm">
                <CurrencyDollarIcon size={16} strokeWidth={2.2} className="text-white" />
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                REFLEJO EN VIVO
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider font-sans">
              Reflejo Total Cobrado
            </div>

            <div className="mt-1 text-2xl text-black flex items-baseline gap-1 font-anton tracking-wide">
              <AnimeCounter
                value={corte?.granTotalCobrado || 0}
                prefix="$"
                decimals={2}
                duration={500}
                className="text-2xl text-black font-anton tracking-wide"
              />
              <span className="text-[10px] text-neutral-500 font-sans font-bold">MXN</span>
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 group-hover:text-black transition">
            <span className="font-sans font-semibold">{corte?.totalPagosRegistrados || 0} Pagos Registrados</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* 2. BUFFETS COBRADOS (ADULTO $280 / NIÑO $180) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('corte')}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl shadow-neutral-200/50 flex flex-col justify-between overflow-hidden border border-neutral-200"
        >
          <AceternityCornerIcon className="absolute -top-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -top-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />

          <AnimatePresence>
            {hoveredCard === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 pointer-events-none z-0"
              >
                <CanvasRevealEffect
                  animationSpeed={3.5}
                  containerClassName="bg-neutral-100/80"
                  colors={[
                    [0, 0, 0],
                    [82, 82, 82],
                  ]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 font-sans">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-black text-white shadow-sm">
                <Users className="w-4 h-4 text-white" />
              </span>
              <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-black">
                $280 / $180
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider font-sans">
              Buffets Adulto & Niño
            </div>

            <div className="mt-1 text-2xl text-black font-anton tracking-wide">
              {corte?.totalAdultosAtendidos || 0} Ad. · {corte?.totalNinosAtendidos || 0} Niños
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 group-hover:text-black transition font-sans">
            <span className="font-sans font-semibold">
              Ingreso Buffet: ${(corte?.ingresoTotalBuffet || 0).toFixed(2)}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* 3. ESTADO DE MESAS (23 MESAS EN EL PLANO) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('mesas')}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl shadow-neutral-200/50 flex flex-col justify-between overflow-hidden border border-neutral-200"
        >
          <AceternityCornerIcon className="absolute -top-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -top-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />

          <AnimatePresence>
            {hoveredCard === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 pointer-events-none z-0"
              >
                <CanvasRevealEffect
                  animationSpeed={3.0}
                  containerClassName="bg-neutral-100/80"
                  colors={[
                    [0, 0, 0],
                    [82, 82, 82],
                  ]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 font-sans">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-black text-white shadow-sm">
                <LayoutGrid className="w-4 h-4 text-white" />
              </span>
              <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                4 · 6 · 10 PERS.
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider font-sans">
              Ocupación del Plano (23)
            </div>

            <div className="mt-1 text-2xl text-black tracking-wide font-anton">
              {corte?.mesasLibres || 0} Libres · {ocupadasTotal} Activas
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 group-hover:text-black transition font-sans">
            <span className="font-sans font-semibold">
              Por cobrar: ${(corte?.cuentasAbiertasPorCobrar || 0).toFixed(2)}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* 4. DESGLOSE POR MÉTODO DE PAGO */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('corte')}
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl shadow-neutral-200/50 flex flex-col justify-between overflow-hidden border border-neutral-200"
        >
          <AceternityCornerIcon className="absolute -top-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -left-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -top-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />
          <AceternityCornerIcon className="absolute -bottom-1.5 -right-1.5 text-neutral-300 group-hover:text-black transition-colors z-20" />

          <AnimatePresence>
            {hoveredCard === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 pointer-events-none z-0"
              >
                <CanvasRevealEffect
                  animationSpeed={3.0}
                  containerClassName="bg-neutral-100/80"
                  colors={[
                    [0, 0, 0],
                    [82, 82, 82],
                  ]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 font-sans">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-black text-white shadow-sm">
                <CreditCard className="w-4 h-4 text-white" />
              </span>
              <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-black">
                ARQUEO CAJA
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider font-sans">
              Efectivo & Terminal
            </div>

            <div className="mt-1 text-lg text-black font-anton tracking-wide">
              Efec: ${(corte?.totalEfectivo || 0).toFixed(0)} · Tarj: ${(corte?.totalTarjeta || 0).toFixed(0)}
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 group-hover:text-black transition font-sans">
            <span className="font-mono">
              SPEI: ${(corte?.totalTransferencia || 0).toFixed(2)}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeMetricsHub;
