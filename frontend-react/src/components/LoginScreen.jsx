import React, { useState, useCallback } from 'react';
import {
  Utensils,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  CreditCard,
  Users,
  AlertCircle,
} from 'lucide-react';
import { BackgroundBeams } from './ui/background-beams';
import { HaciendaLogo } from './ui/HaciendaLogo';
import { PlugConnectedIcon, CurrencyDollarIcon } from './icons';
import { useRestaurant } from '../context/RestaurantContext';
import { triggerHaptic } from '../utils/haptics';

export const LoginScreen = ({ onLoginSuccess }) => {
  const { login, apiConnected } = useRestaurant();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleQuickFill = useCallback((userVal, passVal) => {
    triggerHaptic();
    setUsername(userVal);
    setPassword(passVal);
    setErrorMsg('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isExiting) return;
    setErrorMsg('');
    setIsSubmitting(true);
    triggerHaptic();

    const res = await login(username, password);
    setIsSubmitting(false);

    if (res.ok) {
      setIsExiting(true);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(res.user);
      }, 620);
    } else {
      setErrorMsg(res.mensaje);
    }
  };

  return (
    <div
      style={{
        transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
        opacity: isExiting ? 0 : 1,
        transition: 'transform 0.65s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.45s ease',
        willChange: 'transform, opacity',
      }}
      className="fixed inset-0 z-50 overflow-y-auto select-none bg-neutral-950 font-sans flex flex-col items-center justify-center p-4 sm:p-6"
    >
      {/* Fondo Oficial @aceternity/background-beams-demo */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <BackgroundBeams variant="dark" />
      </div>

      {/* Contenedor Monocromo Blanco y Negro */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white">
        {/* Cabecera de Marca con Logo Transparente La Hacienda */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-28 h-32 sm:w-32 sm:h-36 flex items-center justify-center mb-3">
            <HaciendaLogo
              theme="dark"
              className="w-full h-full"
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-mono text-[10px] font-bold uppercase tracking-widest">
              .NET API + PHP + MYSQL
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-black font-mono text-[10px] font-bold">
              <PlugConnectedIcon size={12} className="text-black" />
              <span>{apiConnected ? 'ONLINE' : 'LOCAL'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-anton tracking-wider uppercase text-white mt-1">
            La Hacienda Buffet
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Sistema Centralizado de Control de Mesas, Buffet y Reflejo de Pagos
          </p>
        </div>

        {/* Barra de Tarifas Oficiales en Azeret Mono */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/15 mb-6 text-center">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
              Buffet Adulto
            </span>
            <span className="text-sm font-black font-mono text-white inline-flex items-center justify-center gap-0.5 mt-0.5">
              <CurrencyDollarIcon size={14} className="text-white" />
              <span>280.00</span>
            </span>
          </div>
          <div className="border-x border-white/15">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
              Buffet Niño
            </span>
            <span className="text-sm font-black font-mono text-white inline-flex items-center justify-center gap-0.5 mt-0.5">
              <CurrencyDollarIcon size={14} className="text-white" />
              <span>180.00</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
              23 Mesas
            </span>
            <span className="text-xs font-black font-mono text-white block mt-1">
              4 · 6 · 10 Pers.
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-white/10 border border-white/30 text-white text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5 font-bold">
              Usuario Operativo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, cajero o mesero"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5 font-bold">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 active:scale-95 transition-all duration-300 text-black font-sans font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{isSubmitting ? 'Verificando Credenciales...' : 'Ingresar al Centro de Operaciones'}</span>
            <ArrowRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </form>

        {/* Perfiles Rápidos de Prueba en Blanco y Negro */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              Perfiles de Acceso Rápido
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                username === 'admin'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/15 text-white hover:bg-white/15'
              }`}
            >
              <KeyRound className={`w-3.5 h-3.5 mb-1 ${username === 'admin' ? 'text-black' : 'text-white'}`} />
              <span className="block text-xs font-bold">Admin</span>
              <span className={`block text-[10px] font-mono ${username === 'admin' ? 'text-neutral-700' : 'text-neutral-400'}`}>
                admin123
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('cajero', 'cajero123')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                username === 'cajero'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/15 text-white hover:bg-white/15'
              }`}
            >
              <CreditCard className={`w-3.5 h-3.5 mb-1 ${username === 'cajero' ? 'text-black' : 'text-white'}`} />
              <span className="block text-xs font-bold">Caja</span>
              <span className={`block text-[10px] font-mono ${username === 'cajero' ? 'text-neutral-700' : 'text-neutral-400'}`}>
                cajero123
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('mesero', 'mesero123')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                username === 'mesero'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/15 text-white hover:bg-white/15'
              }`}
            >
              <Users className={`w-3.5 h-3.5 mb-1 ${username === 'mesero' ? 'text-black' : 'text-white'}`} />
              <span className="block text-xs font-bold">Mesero</span>
              <span className={`block text-[10px] font-mono ${username === 'mesero' ? 'text-neutral-700' : 'text-neutral-400'}`}>
                mesero123
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
