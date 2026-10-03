'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { sileo } from 'sileo';
import { OptionWheel } from './OptionWheel';
import { triggerHaptic } from '../../utils/haptics';
import {
  LayoutGrid,
  Calculator,
  Receipt,
  TrendingUp,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { isAudioEnabled, setAudioEnabled, playMovementNote } from '../../utils/wheelAudio';

export const MENU_ITEMS = [
  {
    id: 'mesas',
    label: 'Plano Interactivo (4, 6 y 10)',
    shortLabel: 'Plano 23 Mesas',
    category: 'PLANO ARQUITECTÓNICO',
    icon: LayoutGrid,
    actionTarget: 'mesas',
    badge: '23 MESAS',
    description: 'Mapa interactivo en blanco y negro con Pasillo Superior, Pasillos Laterales, Patio Central, Buffeteras y Cuarto Trasero.',
  },
  {
    id: 'calculadora',
    label: 'Calculadora Buffet ($280 / $180)',
    shortLabel: 'Cuenta Buffet',
    category: 'TARIFAS OFICIALES',
    icon: Calculator,
    actionTarget: 'mesas',
    badge: 'EN VIVO',
    description: 'Cálculo automático de Buffet Adulto ($280.00 MXN), Buffet Niño ($180.00 MXN), bebidas y propinas.',
  },
  {
    id: 'history',
    label: 'Reflejo de Pagos & Tickets',
    shortLabel: 'Reflejo de Pagos',
    category: 'BITÁCORA DE CAJA',
    icon: Receipt,
    actionTarget: 'history',
    badge: 'AUDITABLE',
    description: 'Historial inmutable de pagos cobrados en Efectivo, Tarjeta y SPEI con emisión de ticket 80mm.',
  },
  {
    id: 'corte',
    label: 'Corte de Caja del Turno',
    shortLabel: 'Corte de Caja',
    category: 'ARQUEO FINANCIERO',
    icon: TrendingUp,
    actionTarget: 'corte',
    badge: 'REPORTE',
    description: 'Concentrado del día dividido en ingresos por Adultos, Niños, Consumo Extra y métodos de pago.',
  },
  {
    id: 'cotizador',
    label: 'Cotizador de Grupos',
    shortLabel: 'Cotizador Buffet',
    category: 'SIMULADOR DE CUENTA',
    icon: Users,
    actionTarget: 'cotizador',
    badge: 'EXPRESS',
    description: 'Estima al instante el total a pagar para grupos y sugiere mesa de 4, 6 o 10 comensales.',
  },
  {
    id: 'quick-actions',
    label: 'Funciones Rápidas Crafts',
    shortLabel: 'Accesos Rápidos',
    category: 'ACETERNITY UI',
    icon: Zap,
    actionTarget: 'quick-actions',
    badge: 'CRAFTS',
    description: 'Filtros instantáneos por capacidad de mesa y accesos directos de operación en 1 toque.',
  },
];

export const OrbitalWheelMenu = ({
  activeTab,
  onSelectTab,
  onFilterCapacity,
  className = '',
}) => {
  const { corte, selectedMesa } = useRestaurant();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [soundActive, setSoundActive] = useState(() => isAudioEnabled());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!activeTab) return;
    const foundIdx = MENU_ITEMS.findIndex((item) => item.actionTarget === activeTab);
    if (foundIdx !== -1 && foundIdx !== selectedIndex) {
      setSelectedIndex(foundIdx);
    }
  }, [activeTab]);

  const currentItem = MENU_ITEMS[selectedIndex] || MENU_ITEMS[0];
  const CurrentIcon = currentItem?.icon || Sparkles;

  const handleNavigateAndScroll = useCallback(
    (targetTab) => {
      triggerHaptic();
      onSelectTab?.(targetTab);
      setTimeout(() => {
        const targetEl =
          document.getElementById('system-tabs-container') ||
          document.getElementById('interactive-system');
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    },
    [onSelectTab]
  );

  const handleWheelChange = useCallback((idx) => {
    setSelectedIndex(idx);
  }, []);

  const handleToggleSound = useCallback(() => {
    const next = !soundActive;
    setSoundActive(next);
    setAudioEnabled(next);
    if (next) {
      playMovementNote(selectedIndex, 1.0);
      sileo.success({
        title: 'Sonido Interactivo Activado',
        description: 'Respuesta acústica activa al girar el selector 3D.',
      });
    } else {
      sileo.info({
        title: 'Modo Silencioso',
        description: 'Sonidos de movimiento desactivados.',
      });
    }
  }, [soundActive, selectedIndex]);

  return (
    <section
      aria-label="Menú 3D de acciones del restaurante"
      className={`w-full bg-transparent border-0 shadow-none relative py-3 sm:py-6 font-sans ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-2 sm:mb-4">
        <button
          type="button"
          onClick={handleToggleSound}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-300 transition-all text-[11px] font-sans font-semibold cursor-pointer shadow-sm active:scale-95"
        >
          {soundActive ? (
            <>
              <Volume2 size={13} />
              <span>Audio Interactivo</span>
            </>
          ) : (
            <>
              <VolumeX size={13} />
              <span>Silenciado</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
          <span className="font-bold text-black">0{selectedIndex + 1}</span>
          <span>/</span>
          <span>0{MENU_ITEMS.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center">
        {/* Columna Izquierda: Detalle de la Acción Seleccionada */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold tracking-widest uppercase shadow-sm">
              {currentItem.category}
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-500">
              • {currentItem.badge}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
                {CurrentIcon && <CurrentIcon className="w-5 h-5 text-white" />}
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-black font-sans tracking-tight">
                {currentItem.label}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans max-w-md">
              {currentItem.description}
            </p>
          </div>

          {/* Telemetría Contextual en Blanco y Negro */}
          <div className="py-3 font-sans text-xs border-y border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-400 font-mono uppercase">
                  Mesa Seleccionada
                </div>
                <div className="font-bold text-black">
                  {selectedMesa
                    ? `${selectedMesa.nombre} (Capacidad ${selectedMesa.capacidad} pers.)`
                    : 'Mesa 1 (4 pers.)'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-400 font-mono uppercase">
                  Reflejo Acumulado Hoy
                </div>
                <div className="font-mono font-black text-black text-base">
                  ${(corte?.granTotalCobrado || 0).toFixed(2)} MXN
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción y Filtro Rápido por Capacidad (4, 6 y 10) */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleNavigateAndScroll(currentItem.actionTarget)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Abrir Módulo Seleccionado</span>
              <ArrowDown className="w-3.5 h-3.5 text-white animate-bounce" />
            </button>

            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {[4, 6, 10].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => {
                    if (onFilterCapacity) onFilterCapacity(cap);
                    handleNavigateAndScroll('mesas');
                  }}
                  className="py-1 px-3 rounded-full bg-white hover:bg-black hover:text-white text-black border border-neutral-300 font-mono text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Mesas de {cap}p
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: OptionWheel 3D */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="w-full h-[290px] sm:h-[340px] md:h-[380px] relative bg-transparent overflow-hidden">
            <OptionWheel
              items={MENU_ITEMS}
              selectedIndex={selectedIndex}
              onChange={handleWheelChange}
              onSelect={(idx, item) => handleNavigateAndScroll(item.actionTarget)}
              textColor="#737373"
              activeColor="#000000"
              side="left"
              fontSize={isMobile ? 1.3 : 1.85}
              spacing={isMobile ? 1.45 : 1.6}
              curve={isMobile ? 0.75 : 0.88}
              tilt={isMobile ? 4.5 : 5.6}
              blur={2.8}
              fade={0.38}
              minOpacity={0.06}
              smoothing={45}
              inset={isMobile ? 16 : 32}
              loop={true}
              draggable={true}
              renderItem={(item, isSelected) => {
                const ItemIcon = item?.icon || Sparkles;
                return (
                  <span className="inline-flex items-center gap-3 sm:gap-4 transition-all duration-200">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-black text-white shadow-sm scale-110'
                          : 'bg-transparent text-neutral-400'
                      }`}
                    >
                      {ItemIcon && <ItemIcon size={isMobile ? 14 : 16} />}
                    </span>
                    <span
                      className={`tracking-tight ${
                        isSelected ? 'font-black text-black' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  </span>
                );
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full px-2 pt-2 text-[11px] font-sans">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const newIdx = (selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
                  handleWheelChange(newIdx);
                }}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const newIdx = (selectedIndex + 1) % MENU_ITEMS.length;
                  handleWheelChange(newIdx);
                }}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleNavigateAndScroll(currentItem.actionTarget)}
              className="text-neutral-600 hover:text-black font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Descender al módulo</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrbitalWheelMenu;
