import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { triggerHaptic } from '../utils/haptics';
import { sileo } from 'sileo';

/**
 * Coordenadas exactas de las 23 mesas según el plano arquitectónico de La Hacienda:
 * - Pasillo superior: 7 mesas (M1 a M7)
 * - Pasillo lateral izquierdo: 4 mesas (M8 a M11)
 * - Pasillo lateral derecho: 4 mesas (M12 a M15)
 * - Acceso / Cuarto trasero: 8 mesas en cuadrícula 4x2 (M16 a M23)
 */
export const FLOOR_PLAN_TABLES = [
  // Pasillo superior (7 mesas)
  { id: 1, x: 176, y: 92, zoneKey: 'superior' },
  { id: 2, x: 278, y: 92, zoneKey: 'superior' },
  { id: 3, x: 382, y: 92, zoneKey: 'superior' },
  { id: 4, x: 486, y: 92, zoneKey: 'superior' },
  { id: 5, x: 590, y: 92, zoneKey: 'superior' },
  { id: 6, x: 694, y: 92, zoneKey: 'superior' },
  { id: 7, x: 796, y: 92, zoneKey: 'superior' },

  // Pasillo lateral izquierdo (4 mesas)
  { id: 8,  x: 124, y: 196, zoneKey: 'lateral' },
  { id: 9,  x: 124, y: 266, zoneKey: 'lateral' },
  { id: 10, x: 124, y: 378, zoneKey: 'lateral' },
  { id: 11, x: 124, y: 446, zoneKey: 'lateral' },

  // Pasillo lateral derecho (4 mesas)
  { id: 12, x: 876, y: 196, zoneKey: 'lateral' },
  { id: 13, x: 876, y: 266, zoneKey: 'lateral' },
  { id: 14, x: 876, y: 378, zoneKey: 'lateral' },
  { id: 15, x: 876, y: 446, zoneKey: 'lateral' },

  // Acceso / Cuarto trasero (8 mesas en 2 filas x 4 columnas)
  { id: 16, x: 90,  y: 676, zoneKey: 'acceso' },
  { id: 17, x: 176, y: 676, zoneKey: 'acceso' },
  { id: 18, x: 264, y: 676, zoneKey: 'acceso' },
  { id: 19, x: 352, y: 676, zoneKey: 'acceso' },
  { id: 20, x: 90,  y: 756, zoneKey: 'acceso' },
  { id: 21, x: 176, y: 756, zoneKey: 'acceso' },
  { id: 22, x: 264, y: 756, zoneKey: 'acceso' },
  { id: 23, x: 352, y: 756, zoneKey: 'acceso' },
];

// Elementos arquitectónicos de vegetación en monocromo (Blanco y Negro)
const PLANTERS = [
  // Pasillo superior (esquinas)
  { x: 62, y: 60 },
  { x: 938, y: 60 },
  // Patio central (6 plantas perimetrales)
  { x: 265, y: 178 },
  { x: 735, y: 178 },
  { x: 354, y: 312 },
  { x: 646, y: 312 },
  { x: 265, y: 444 },
  { x: 735, y: 444 },
  // Sección de buffeteras (extremos)
  { x: 66, y: 498 },
  { x: 66, y: 586 },
  { x: 934, y: 498 },
  { x: 934, y: 586 },
  // Cuarto trasero (derecha)
  { x: 940, y: 638 },
  { x: 940, y: 774 },
];

// Estaciones interactivas dentro de la barra de buffeteras en escala monocromática (Negro y Blanco)
const BUFFET_STATIONS = [
  { id: 'ensaladas', x: 230, w: 54, color: '#e5e5e5', textColor: '#000000', name: 'Barra de Ensaladas & Frutas', detail: 'Incluido en Buffet ($280 / $180)' },
  { id: 'guisos',    x: 288, w: 52, color: '#a3a3a3', textColor: '#000000', name: 'Guisos Tradicionales de Hacienda', detail: 'Incluido en Buffet ($280 / $180)' },
  { id: 'cortes',    x: 344, w: 52, color: '#525252', textColor: '#ffffff', name: 'Carnes & Cortes al Carbón', detail: 'Incluido en Buffet ($280 / $180)' },
  { id: 'parrilla',  x: 472, w: 56, color: '#171717', textColor: '#ffffff', name: 'Comal & Parrilla en Vivo', detail: 'Antojitos hechos al momento' },
  { id: 'arroces',   x: 604, w: 52, color: '#d4d4d4', textColor: '#000000', name: 'Guarniciones, Pastas y Arroces', detail: 'Incluido en Buffet ($280 / $180)' },
  { id: 'mole',      x: 660, w: 52, color: '#404040', textColor: '#ffffff', name: 'Especialidades de Mole & Frijoles', detail: 'Receta original de la casa' },
  { id: 'postres',   x: 716, w: 54, color: '#f5f5f5', textColor: '#000000', name: 'Estación de Postres Tradicionales', detail: 'Incluido en Buffet ($280 / $180)' },
];

export const HaciendaFloorPlanMap = () => {
  const {
    mesas,
    selectedMesa,
    setSelectedMesaId,
    filtroCapacidad,
  } = useRestaurant();

  const [zoom, setZoom] = useState(1);
  const [hoveredMesaId, setHoveredMesaId] = useState(null);
  const [hoveredStation, setHoveredStation] = useState(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState('all'); // 'all', 'superior', 'lateral', 'acceso'

  const hoveredMesa = mesas.find((m) => m.id === hoveredMesaId) || selectedMesa;

  return (
    <div className="space-y-4">
      {/* Barra de Controles del Plano Arquitectónico (Blanco y Negro) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-100 p-3 rounded-2xl border border-neutral-300">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Plano Completo (23)' },
            { id: 'superior', label: 'Pasillo Superior (7)' },
            { id: 'lateral', label: 'Pasillos Laterales (8)' },
            { id: 'acceso', label: 'Acceso / Trasero (8)' },
          ].map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveZoneFilter(z.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition cursor-pointer ${
                activeZoneFilter === z.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-black hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Controles de Zoom */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.12).toFixed(2)))}
            title="Alejar plano"
            className="w-8 h-8 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center text-black transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-[11px] font-mono font-bold text-black">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.45, +(z + 0.12).toFixed(2)))}
            title="Acercar plano"
            className="w-8 h-8 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center text-black transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setActiveZoneFilter('all');
            }}
            title="Restablecer vista"
            className="w-8 h-8 rounded-xl bg-white border border-neutral-300 hover:bg-black hover:text-white flex items-center justify-center text-black transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leyenda Monocromática del Plano */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-mono text-black">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-white border-2 border-black inline-block" />
            <span>Mesa Libre (Blanco)</span>
          </span>
          <span className="inline-flex items-center gap-2 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-neutral-800 border-2 border-black inline-block" />
            <span>Ocupada / En Consumo (Negro)</span>
          </span>
          <span className="inline-flex items-center gap-2 font-bold">
            <span className="w-3.5 h-3.5 rounded bg-black ring-2 ring-black ring-offset-2 inline-block" />
            <span>Seleccionada</span>
          </span>
        </div>
        <span className="text-[11px] text-neutral-500">
          Haz clic en cualquier mesa (M1–M23) para abrir cuenta o cobrar
        </span>
      </div>

      {/* Contenedor del Mapa Arquitectónico Interactivo en Blanco y Negro */}
      <div className="relative w-full overflow-auto rounded-2xl border-2 border-black bg-neutral-100 shadow-inner">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
          className="w-full min-w-[640px]"
        >
          <svg
            viewBox="0 0 1000 840"
            className="w-full h-auto select-none block"
            role="img"
            aria-label="Plano arquitectónico interactivo en blanco y negro de La Hacienda Buffet"
          >
            <defs>
              <filter id="tableShadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.18" />
              </filter>
              <filter id="selectedGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#000000" floodOpacity="0.65" />
              </filter>
            </defs>

            {/* =========================================================== */}
            {/* 1. PISO GENERAL Y MUROS ARQUITECTÓNICOS (BLANCO Y NEGRO)    */}
            {/* =========================================================== */}
            <rect
              x="30"
              y="30"
              width="940"
              height="780"
              fill="#fafafa"
              stroke="#000000"
              strokeWidth="8"
            />

            {/* Sombreado monocromático cuando se filtra por zona */}
            {activeZoneFilter !== 'all' && (
              <>
                {activeZoneFilter === 'superior' && (
                  <rect x="34" y="34" width="932" height="101" fill="#000000" fillOpacity="0.06" />
                )}
                {activeZoneFilter === 'lateral' && (
                  <>
                    <rect x="34" y="135" width="191" height="345" fill="#000000" fillOpacity="0.06" />
                    <rect x="775" y="135" width="191" height="345" fill="#000000" fillOpacity="0.06" />
                  </>
                )}
                {activeZoneFilter === 'acceso' && (
                  <rect x="34" y="605" width="932" height="201" fill="#000000" fillOpacity="0.06" />
                )}
              </>
            )}

            {/* Muros divisorios entre Pasillo superior y Pasillos laterales / Patio central */}
            <line x1="30" y1="135" x2="175" y2="135" stroke="#000000" strokeWidth="6" />
            <line x1="225" y1="135" x2="775" y2="135" stroke="#000000" strokeWidth="6" />
            <line x1="825" y1="135" x2="970" y2="135" stroke="#000000" strokeWidth="6" />

            {/* Muro izquierdo del Patio Central con sus 2 accesos */}
            <line x1="225" y1="135" x2="225" y2="235" stroke="#000000" strokeWidth="6" />
            <line x1="225" y1="268" x2="225" y2="355" stroke="#000000" strokeWidth="6" />
            <line x1="225" y1="388" x2="225" y2="480" stroke="#000000" strokeWidth="6" />

            {/* Muro derecho del Patio Central con sus 2 accesos */}
            <line x1="775" y1="135" x2="775" y2="235" stroke="#000000" strokeWidth="6" />
            <line x1="775" y1="268" x2="775" y2="355" stroke="#000000" strokeWidth="6" />
            <line x1="775" y1="388" x2="775" y2="480" stroke="#000000" strokeWidth="6" />

            {/* Muros inferiores de Pasillos laterales y Patio central hacia Sección de buffeteras */}
            <line x1="30" y1="480" x2="175" y2="480" stroke="#000000" strokeWidth="6" />
            <line x1="225" y1="480" x2="775" y2="480" stroke="#000000" strokeWidth="6" />
            <line x1="825" y1="480" x2="970" y2="480" stroke="#000000" strokeWidth="6" />

            {/* Muro inferior de Sección de buffeteras con puerta punteada de "Acceso" */}
            <line x1="30" y1="605" x2="102" y2="605" stroke="#000000" strokeWidth="6" />
            <line
              x1="102"
              y1="605"
              x2="250"
              y2="605"
              stroke="#525252"
              strokeWidth="3"
              strokeDasharray="7 6"
            />
            <line x1="250" y1="605" x2="970" y2="605" stroke="#000000" strokeWidth="6" />

            {/* =========================================================== */}
            {/* 2. FUENTE DEL PATIO CENTRAL Y VEGETACIÓN (MONOCROMO)        */}
            {/* =========================================================== */}
            <g
              className="cursor-pointer"
              onClick={() =>
                sileo.info({
                  title: 'Patio Central · Fuente Arquitectónica',
                  description: 'Centro arquitectónico rodeado de los pasillos de comensales.',
                })
              }
            >
              <rect
                x="448"
                y="260"
                width="104"
                height="104"
                rx="4"
                fill="#f0f0f0"
                stroke="#000000"
                strokeWidth="2.5"
              />
              {/* 4 plantas en las esquinas de la fuente */}
              {[
                { x: 463, y: 275 },
                { x: 537, y: 275 },
                { x: 463, y: 349 },
                { x: 537, y: 349 },
              ].map((fp, idx) => (
                <g key={`fp-${idx}`}>
                  <circle cx={fp.x} cy={fp.y} r="13" fill="#171717" />
                  <circle cx={fp.x} cy={fp.y} r="7.5" fill="#737373" />
                </g>
              ))}
              {/* Espejo de agua concéntrico en blanco y negro */}
              <circle cx="500" cy="312" r="38" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
              <circle cx="500" cy="312" r="31" fill="#e5e5e5" stroke="#404040" strokeWidth="1.5" />
              <circle cx="500" cy="312" r="18" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
              <circle cx="500" cy="312" r="6" fill="#000000" />
            </g>

            {/* Plantas arquitectónicas distribuidas por el plano */}
            {PLANTERS.map((pl, idx) => (
              <g key={`planter-${idx}`}>
                <circle cx={pl.x} cy={pl.y} r="13.5" fill="#171717" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={pl.x} cy={pl.y} r="7.5" fill="#737373" />
                <circle cx={pl.x} cy={pl.y} r="3" fill="#ffffff" />
              </g>
            ))}

            {/* Platos / Estaciones blancas laterales en Sección de buffeteras */}
            {[
              { x: 66, y: 528 },
              { x: 66, y: 556 },
              { x: 934, y: 528 },
              { x: 934, y: 556 },
            ].map((sp, idx) => (
              <circle
                key={`side-plate-${idx}`}
                cx={sp.x}
                cy={sp.y}
                r="12.5"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2"
              />
            ))}

            {/* =========================================================== */}
            {/* 3. SECCIÓN DE BUFFETERAS (BLANCO Y NEGRO INTERACTIVO)       */}
            {/* =========================================================== */}
            <g>
              {/* Mueble principal de las buffeteras */}
              <rect
                x="222"
                y="504"
                width="556"
                height="50"
                rx="3"
                fill="#000000"
                stroke="#000000"
                strokeWidth="3"
              />

              {/* Estaciones de comida en escala monocromática */}
              {BUFFET_STATIONS.map((st) => (
                <rect
                  key={st.id}
                  x={st.x}
                  y="510"
                  width={st.w}
                  height="38"
                  rx="2"
                  fill={st.color}
                  stroke="#000000"
                  strokeWidth="1"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={() => setHoveredStation(st)}
                  onMouseLeave={() => setHoveredStation(null)}
                  onClick={() => {
                    triggerHaptic();
                    sileo.info({
                      title: st.name,
                      description: `${st.detail} — Disponible en la barra central.`,
                    });
                  }}
                />
              ))}

              {/* 4 Ollas / Soperas circulares blancas dentro de la barra de buffeteras */}
              {[418, 444, 556, 582].map((cx, i) => (
                <circle
                  key={`bowl-${i}`}
                  cx={cx}
                  cy="529"
                  r="11.5"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() =>
                    sileo.info({
                      title: 'Estación de Sopas, Cremas y Salsas',
                      description: 'Incluido en el Buffet Adulto ($280) y Niño ($180).',
                    })
                  }
                />
              ))}
            </g>

            {/* =========================================================== */}
            {/* 4. ETIQUETAS OFICIALES DEL PLANO EN ANTON Y SATOSHI         */}
            {/* =========================================================== */}
            <text
              x="500"
              y="58"
              textAnchor="middle"
              fill="#000000"
              fontSize="21"
              fontWeight="400"
              letterSpacing="0.8"
              fontFamily="Anton, Satoshi, sans-serif"
            >
              Pasillo superior
            </text>

            <text
              x="500"
              y="186"
              textAnchor="middle"
              fill="#000000"
              fontSize="21"
              fontWeight="400"
              letterSpacing="0.8"
              fontFamily="Anton, Satoshi, sans-serif"
            >
              Patio central
            </text>

            <text
              x="125"
              y="324"
              textAnchor="middle"
              fill="#000000"
              fontSize="20"
              fontWeight="400"
              letterSpacing="0.8"
              fontFamily="Anton, Satoshi, sans-serif"
            >
              Pasillo lateral
            </text>

            <text
              x="875"
              y="324"
              textAnchor="middle"
              fill="#000000"
              fontSize="20"
              fontWeight="400"
              letterSpacing="0.8"
              fontFamily="Anton, Satoshi, sans-serif"
            >
              Pasillo lateral
            </text>

            <text
              x="500"
              y="586"
              textAnchor="middle"
              fill="#000000"
              fontSize="21"
              fontWeight="400"
              letterSpacing="0.8"
              fontFamily="Anton, Satoshi, sans-serif"
            >
              Sección de buffeteras
            </text>

            <text
              x="176"
              y="632"
              textAnchor="middle"
              fill="#000000"
              fontSize="16"
              fontWeight="700"
              fontFamily="Satoshi, sans-serif"
            >
              Acceso
            </text>

            <text
              x="735"
              y="706"
              textAnchor="middle"
              fill="#000000"
              fontSize="22"
              fontWeight="400"
              letterSpacing="0.8"
              fontFamily="Anton, Satoshi, sans-serif"
            >
              Cuarto trasero
            </text>

            {/* =========================================================== */}
            {/* 5. LAS 23 MESAS INTERACTIVAS (BLANCO Y NEGRO PURO)          */}
            {/* =========================================================== */}
            {FLOOR_PLAN_TABLES.map((pos) => {
              const mesaData = mesas.find((m) => m.id === pos.id) || {
                id: pos.id,
                numero: pos.id,
                nombre: `Mesa ${pos.id}`,
                capacidad: 4,
                zona: 'Salón',
                estado: 'Libre',
                ordenActiva: null,
              };

              const isSelected = selectedMesa?.id === pos.id;
              const isHovered = hoveredMesaId === pos.id;
              const ord = mesaData.ordenActiva;
              const isOccupied = mesaData.estado === 'Ocupada' && ord;
              const isPorPagar = mesaData.estado === 'Por Pagar' && ord;
              const hasActiveOrder = isOccupied || isPorPagar;

              // Atenuar si hay un filtro de capacidad o de zona activo y la mesa no coincide
              const matchesCap =
                filtroCapacidad === 0 || mesaData.capacidad === filtroCapacidad;
              const matchesZone =
                activeZoneFilter === 'all' || pos.zoneKey === activeZoneFilter;
              const isDimmed = !matchesCap || !matchesZone;

              // Paleta estrictamente Blanco y Negro:
              // - Libre: Tablero blanco (#ffffff) con borde negro (#000000) y texto negro
              // - Ocupada / Seleccionada: Tablero negro (#000000) con texto blanco (#ffffff)
              const useDarkFill = isSelected || hasActiveOrder;
              const tableFill = useDarkFill ? '#000000' : '#ffffff';
              const tableStroke = '#000000';
              const textPrimary = useDarkFill ? '#ffffff' : '#000000';
              const textSecondary = useDarkFill ? '#d4d4d4' : '#525252';
              const chairFill = isSelected ? '#000000' : hasActiveOrder ? '#262626' : '#404040';

              return (
                <g
                  key={pos.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{
                    opacity: isDimmed ? 0.25 : 1,
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                  }}
                  filter={isSelected ? 'url(#selectedGlow)' : 'url(#tableShadow)'}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredMesaId(pos.id)}
                  onMouseLeave={() => setHoveredMesaId(null)}
                  onClick={() => {
                    triggerHaptic();
                    setSelectedMesaId(pos.id);
                  }}
                >
                  {/* Halo negro para mesa seleccionada o bajo el cursor */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx="0"
                      cy="0"
                      r="33"
                      fill="none"
                      stroke="#000000"
                      strokeWidth={isSelected ? '3' : '2'}
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                    />
                  )}

                  {/* Sillas alrededor de la mesa */}
                  {/* Silla Superior */}
                  <rect x="-7" y="-26" width="14" height="6" rx="2" fill={chairFill} />
                  {/* Silla Inferior */}
                  <rect x="-7" y="20" width="14" height="6" rx="2" fill={chairFill} />
                  {/* Silla Izquierda */}
                  <rect x="-26" y="-7" width="6" height="14" rx="2" fill={chairFill} />
                  {/* Silla Derecha */}
                  <rect x="20" y="-7" width="6" height="14" rx="2" fill={chairFill} />

                  {/* Sillas extra en las esquinas cuando la mesa es de 6 o 10 personas */}
                  {mesaData.capacidad >= 6 && (
                    <>
                      <circle cx="-19" cy="-19" r="3.2" fill={chairFill} />
                      <circle cx="19" cy="-19" r="3.2" fill={chairFill} />
                    </>
                  )}
                  {mesaData.capacidad === 10 && (
                    <>
                      <circle cx="-19" cy="19" r="3.2" fill={chairFill} />
                      <circle cx="19" cy="19" r="3.2" fill={chairFill} />
                    </>
                  )}

                  {/* Tablero central de la mesa */}
                  <rect
                    x="-18"
                    y="-18"
                    width="36"
                    height="36"
                    rx="5"
                    fill={tableFill}
                    stroke={tableStroke}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Número de Mesa (M1..M23) en Anton */}
                  <text
                    x="0"
                    y="-1"
                    textAnchor="middle"
                    fill={textPrimary}
                    fontSize="12"
                    fontWeight="400"
                    letterSpacing="0.5"
                    fontFamily="Anton, Satoshi, sans-serif"
                  >
                    M{mesaData.numero}
                  </text>

                  {/* Capacidad (4p, 6p, 10p) en Satoshi */}
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill={textSecondary}
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="Satoshi, sans-serif"
                  >
                    {mesaData.capacidad}p
                  </text>

                  {/* Indicador monocromo en la esquina superior derecha */}
                  <circle
                    cx="15"
                    cy="-15"
                    r="5.5"
                    fill={hasActiveOrder ? '#000000' : '#ffffff'}
                    stroke={hasActiveOrder ? '#ffffff' : '#000000'}
                    strokeWidth="2"
                  />

                  {/* Etiqueta flotante de monto cuando la mesa tiene cuenta abierta */}
                  {ord && (
                    <g transform="translate(0, 33)">
                      <rect
                        x="-27"
                        y="-8"
                        width="54"
                        height="14"
                        rx="4"
                        fill="#000000"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="Satoshi, sans-serif"
                      >
                        ${Number(ord.total || 0).toFixed(0)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Barra Inferior de Telemetría del Mapa en Negro y Blanco */}
      <div className="p-4 rounded-2xl bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-neutral-800">
        {hoveredStation ? (
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-md shrink-0 border border-white/40"
              style={{ backgroundColor: hoveredStation.color }}
            />
            <div>
              <strong className="font-sans text-white block">{hoveredStation.name}</strong>
              <span className="font-mono text-[11px] text-neutral-300">
                {hoveredStation.detail}
              </span>
            </div>
          </div>
        ) : hoveredMesa ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-black font-mono font-black flex items-center justify-center shrink-0">
                M{hoveredMesa.numero}
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>{hoveredMesa.nombre}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                    {hoveredMesa.zona}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white text-black font-bold">
                    Capacidad {hoveredMesa.capacidad} pers.
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-300 mt-0.5">
                  {hoveredMesa.ordenActiva
                    ? `Cuenta Abierta (${hoveredMesa.ordenActiva.folio}): ${hoveredMesa.ordenActiva.cantAdultos} Adulto(s) ($280) · ${hoveredMesa.ordenActiva.cantNinos} Niño(s) ($180)`
                    : 'Mesa libre — Haz clic sobre la mesa en el mapa para abrir su cuenta de buffet'}
                </div>
              </div>
            </div>

            <div className="text-right font-mono shrink-0">
              <span className="text-[10px] uppercase text-neutral-400 block">
                {hoveredMesa.ordenActiva ? 'Total en Mesa' : 'Estado'}
              </span>
              <span className="text-sm font-black text-white">
                {hoveredMesa.ordenActiva
                  ? `$${Number(hoveredMesa.ordenActiva.total).toFixed(2)} MXN`
                  : 'DISPONIBLE'}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default HaciendaFloorPlanMap;
