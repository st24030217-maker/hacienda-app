import React from 'react';
import { Utensils, Users } from 'lucide-react';
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

            <CardBody className="relative card-hologram w-full rounded-3xl border border-neutral-800 bg-gradient-to-br from-black via-neutral-950 to-neutral-900 p-6 text-white shadow-2xl flex flex-col justify-between min-h-[190px]">
              {/* Fila Superior */}
              <CardItem translateZ="40" className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-sm">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-anton text-2xl tracking-wider uppercase text-white block leading-none">
                      {selectedMesa.nombre}
                    </span>
                    <span className="block text-xs text-neutral-400 font-sans mt-1">
                      {selectedMesa.zona} · {selectedMesa.capacidad} Personas
                    </span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-sans font-bold uppercase flex items-center gap-1.5 ${
                    selectedMesa.estado === 'Libre'
                      ? 'bg-white text-black'
                      : 'bg-neutral-800 text-white border border-white/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedMesa.estado === 'Libre'
                        ? 'bg-black'
                        : 'bg-white animate-ping'
                    }`}
                  />
                  {selectedMesa.estado}
                </div>
              </CardItem>

              {/* Fila Central */}
              <CardItem translateZ="65" className="w-full my-3 z-10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2.5 text-base font-bold text-white font-sans">
                  <Users className="w-4 h-4 text-neutral-300" />
                  {isOccupied ? (
                    <span>
                      {orden.cantAdultos} Adultos · {orden.cantNinos} Niños
                    </span>
                  ) : (
                    <span>Adulto ${PRECIO_ADULTO} · Niño ${PRECIO_NINO}</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs font-sans uppercase tracking-wider text-neutral-400 block">
                    Total
                  </span>
                  <div className="text-3xl text-white font-anton tracking-wider flex items-center justify-end gap-0.5">
                    <CurrencyDollarIcon size={20} className="text-white" />
                    <AnimeCounter
                      value={totalAmount}
                      decimals={2}
                      duration={450}
                      className="text-3xl text-white font-anton tracking-wider"
                    />
                  </div>
                </div>
              </CardItem>

              {/* Fila Inferior */}
              <CardItem translateZ="35" className="w-full flex items-center justify-between z-10 pt-2 border-t border-white/15 text-xs font-sans text-neutral-300">
                <span>
                  {isOccupied
                    ? `Mesero: ${orden.mesero}`
                    : `Capacidad: ${selectedMesa.capacidad} lugares`}
                </span>
                <span className="font-mono font-bold text-white">
                  {isOccupied ? orden.folio : 'DISPONIBLE'}
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
