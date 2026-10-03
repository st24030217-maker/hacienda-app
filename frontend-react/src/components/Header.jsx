import React, { useState, useEffect } from 'react';
import { Clock, Compass, LogOut, ShieldCheck } from 'lucide-react';
import { PlugConnectedIcon } from './icons';
import { HaciendaLogo } from './ui/HaciendaLogo';
import { useRestaurant } from '../context/RestaurantContext';

export const Header = ({ onNavigateToPanel, onNavigateToOrbital }) => {
  const { user, logout, corte } = useRestaurant();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mesasActivasCount = (corte?.mesasOcupadas || 0) + (corte?.mesasPorPagar || 0);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-2xl border-b border-neutral-200 shadow-sm'
          : 'bg-black/95 backdrop-blur-2xl border-b border-neutral-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Identidad La Hacienda Buffet (Logo Transparente Blanco y Negro) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <HaciendaLogo
            variant="emblem"
            theme={isScrolled ? 'light' : 'dark'}
            className="w-11 h-12 sm:w-12 sm:h-14"
          />

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-black text-lg sm:text-xl tracking-tight transition-colors duration-300 ${
                  isScrolled ? 'text-black' : 'text-white'
                }`}
              >
                La Hacienda
              </span>
              <span
                className={`hidden sm:inline-flex text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full font-bold ${
                  isScrolled
                    ? 'bg-neutral-100 text-black border border-neutral-300'
                    : 'bg-white/15 text-white border border-white/20'
                }`}
              >
                .NET + PHP POS
              </span>
            </div>
            <p
              className={`text-[11px] font-sans hidden md:block transition-colors duration-300 ${
                isScrolled ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Buffet Adulto $280 · Niño $180 • 23 Mesas (4, 6 y 10 Personas)
            </p>
          </div>
        </div>

        {/* Estado en Vivo, Reloj y Acciones */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors duration-300 ${
              isScrolled
                ? 'bg-neutral-100 text-black border border-neutral-200'
                : 'bg-white/10 text-white border border-white/15'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isScrolled ? 'text-black' : 'text-white'}`} />
            <span>
              {currentTime.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          {/* Indicador de Conexión .NET API y Mesas */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-300 ${
              isScrolled
                ? 'bg-neutral-100 text-black border border-neutral-200'
                : 'bg-white/10 text-white border border-white/15'
            }`}
          >
            <PlugConnectedIcon
              size={14}
              className={isScrolled ? 'text-black shrink-0' : 'text-white shrink-0'}
            />
            <span className="font-mono text-[11px]">
              <span className="hidden md:inline">API .NET · </span>
              {mesasActivasCount} Activas
            </span>
          </div>

          {/* Acceso al Selector Orbital 3D */}
          <button
            type="button"
            onClick={onNavigateToOrbital}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-sans font-bold transition-all duration-300 active:scale-95 cursor-pointer ${
              isScrolled
                ? 'bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-200'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Selector 3D</span>
          </button>

          {/* Acceso al Panel de Métricas */}
          <button
            type="button"
            onClick={onNavigateToPanel}
            className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-bold transition-all duration-300 active:scale-95 cursor-pointer shadow-sm ${
              isScrolled
                ? 'bg-black hover:bg-neutral-800 text-white'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel de Control</span>
          </button>

          {/* Usuario Activo y Cerrar Sesión */}
          {user && (
            <button
              type="button"
              onClick={logout}
              title={`Cerrar sesión de ${user.nombre}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-sans font-bold transition-all cursor-pointer ${
                isScrolled
                  ? 'bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-200'
                  : 'bg-white/10 hover:bg-white hover:text-black text-white'
              }`}
            >
              <span className="hidden md:inline font-mono text-[11px]">{user.username}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
