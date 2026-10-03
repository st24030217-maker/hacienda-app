import React from 'react';
import { Wifi, Utensils, Users, Sparkles } from 'lucide-react';
import { CurrencyDollarIcon } from './icons/currency-dollar-icon';
import { useRestaurant, PRECIO_ADULTO, PRECIO_NINO } from '../context/RestaurantContext';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import { AnimeCounter } from './ui/anime-counter';
import { AnimeCardSheen } from './ui/anime-card-sheen';

export const MesaDigitalCard = () => {
  const { selectedMesa } = useRestaurant();

  if (!selectedMesa) return null;

  const orden = selectedMesa.ordenActiva;
  const isOccupied = selectedMesa.estado !== 'Libre' && orden != null;
  const totalAmount = isOccupied ? orden.total : 0;

  return (
    <div className="w-full">
      <AnimeCardSheen>
        <CardContainer className="w-full">
          <div className="relative w-full group">
            <div className="absolute -inset-1 rounded-3xl blur-xl opacity-35 transition duration-1000 group-hover:opacity-65 bg-gradient-to-r from-black via-neutral-700 to-black" />

            <CardBody className="relative card-hologram w-full rounded-3xl border border-neutral-800 bg-gradient-to-br from-black via-neutral-950 to-neutral-900 p-6 text-white shadow-2xl flex flex-col justify-between min-h-[215px]">
              {/* Fila Superior */}
              <CardItem translateZ="40" className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-sm">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-anton text-base tracking-wider uppercase text-white block">
                      {selectedMesa.nombre} · {selectedMesa.zona}
                    </span>
                    <span className="block text-[10px] text-neutral-400 tracking-widest font-sans uppercase">
                      CAPACIDAD OFICIAL: {selectedMesa.capacidad} PERSONAS
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Wifi className="w-4 h-4 text-neutral-400 rotate-90" />
                  <div
                    className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                      selectedMesa.estado === 'Libre'
                        ? 'bg-white text-black'
                        : 'bg-neutral-800 text-white border border-white/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedMesa.estado === 'Libre'
                          ? 'bg-black'
                          : 'bg-white animate-ping'
                      }`}
                    />
                    {selectedMesa.estado}
                  </div>
                </div>
              </CardItem>

              {/* Fila Central: Chip EMV y Cuenta de la Mesa */}
              <CardItem translateZ="65" className="w-full my-4 z-10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-white via-neutral-200 to-neutral-400 shadow-inner flex items-center justify-center p-1">
                    <div className="w-full h-full rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                      <div className="border-r border-b border-neutral-700/50" />
                      <div className="border-b border-neutral-700/50" />
                      <div className="border-r border-neutral-700/50" />
                      <div />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-neutral-400 block">
                      {isOccupied ? `FOLIO ACTIVO · ${orden.folio}` : 'DISPONIBLE PARA APERTURA'}
                    </span>
                    <div className="text-sm sm:text-base font-bold text-white font-sans flex items-center gap-2 mt-0.5">
                      <Users className="w-4 h-4 text-white" />
                      {isOccupied ? (
                        <span>
                          {orden.cantAdultos} Adulto(s) ($280) · {orden.cantNinos} Niño(s) ($180)
                        </span>
                      ) : (
                        <span>Adulto ${PRECIO_ADULTO} · Niño ${PRECIO_NINO}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-neutral-400 block">
                    Total de la Mesa
                  </span>
                  <div className="text-2xl text-white font-anton tracking-wider flex items-center justify-end gap-0.5">
                    <CurrencyDollarIcon size={18} className="text-white" />
                    <AnimeCounter
                      value={totalAmount}
                      decimals={2}
                      duration={450}
                      className="text-2xl text-white font-anton tracking-wider"
                    />
                  </div>
                </div>
              </CardItem>

              {/* Fila Inferior */}
              <CardItem translateZ="35" className="w-full flex items-center justify-between z-10 pt-2 border-t border-white/15 text-[11px] font-mono text-neutral-300">
                <span>
                  {isOccupied
                    ? `Mesero: ${orden.mesero} · Extras: $${orden.subtotalExtras.toFixed(2)}`
                    : `Mesa configurada para grupos de hasta ${selectedMesa.capacidad} personas`}
                </span>
                <span className="inline-flex items-center gap-1 text-white font-bold">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>COMANDA 3D</span>
                </span>
              </CardItem>
            </CardBody>
          </div>
        </CardContainer>
      </AnimeCardSheen>
    </div>
  );
};

export default MesaDigitalCard;
