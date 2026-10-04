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

  const ocupadasTotal = (corte?.mesasOcupadas || 0) + (corte?.mesasPorPagar || 0);

  return (
    <div id="panel-control-metropolitano" className="w-full font-sans scroll-mt-28">
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. COBRADO HOY */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('history')}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden border border-neutral-200"
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
                  colors={[[0, 0, 0], [82, 82, 82]]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Cobrado Hoy
              </span>
              <span className="p-2 rounded-xl bg-black text-white">
                <CurrencyDollarIcon size={16} strokeWidth={2.2} className="text-white" />
              </span>
            </div>

            <div className="text-3xl text-black font-anton tracking-wide">
              <AnimeCounter
                value={corte?.granTotalCobrado || 0}
                prefix="$"
                decimals={2}
                duration={500}
                className="text-3xl text-black font-anton tracking-wide"
              />
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-semibold">
            <span>{corte?.totalPagosRegistrados || 0} tickets</span>
            <ArrowUpRight className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* 2. COMENSALES */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('corte')}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden border border-neutral-200"
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
                  colors={[[0, 0, 0], [82, 82, 82]]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Buffets
              </span>
              <span className="p-2 rounded-xl bg-black text-white">
                <Users className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="text-3xl text-black font-anton tracking-wide">
              {corte?.totalAdultosAtendidos || 0} Ad. · {corte?.totalNinosAtendidos || 0} Niños
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-semibold">
            <span>Adulto $280 · Niño $180</span>
            <ArrowUpRight className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* 3. MESAS */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('mesas')}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden border border-neutral-200"
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
                  colors={[[0, 0, 0], [82, 82, 82]]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                23 Mesas
              </span>
              <span className="p-2 rounded-xl bg-black text-white">
                <LayoutGrid className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="text-3xl text-black font-anton tracking-wide">
              {corte?.mesasLibres || 0} Libres · {ocupadasTotal} Activas
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-semibold">
            <span>Por cobrar: ${(corte?.cuentasAbiertasPorCobrar || 0).toFixed(0)}</span>
            <ArrowUpRight className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* 4. CAJA */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('corte')}
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
          className="metric-hub-card group relative p-5 rounded-2xl bg-white hover:bg-neutral-50 transition-all cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden border border-neutral-200"
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
                  colors={[[0, 0, 0], [82, 82, 82]]}
                  dotSize={2}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(160px_at_center,white,transparent)] bg-white/40" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Arqueo
              </span>
              <span className="p-2 rounded-xl bg-black text-white">
                <CreditCard className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="text-2xl text-black font-anton tracking-wide">
              Efec. ${(corte?.totalEfectivo || 0).toFixed(0)} · Tarj. ${(corte?.totalTarjeta || 0).toFixed(0)}
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-semibold">
            <span>SPEI: ${(corte?.totalTransferencia || 0).toFixed(0)}</span>
            <ArrowUpRight className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeMetricsHub;
