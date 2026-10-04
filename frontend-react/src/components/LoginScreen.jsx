import React, { useState, useCallback } from 'react';
import {
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
import { useRestaurant } from '../context/RestaurantContext';
import { triggerHaptic } from '../utils/haptics';

export const LoginScreen = ({ onLoginSuccess }) => {
  const { login } = useRestaurant();
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
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <BackgroundBeams variant="dark" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-neutral-950/90 backdrop-blur-2xl border border-white/20 p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white">
        {/* Logo Blanco Protagonista */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-44 h-48 sm:w-52 sm:h-56 flex items-center justify-center mb-3">
            <HaciendaLogo theme="dark" className="w-full h-full" />
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-medium text-neutral-300">
            <span>Adulto $280</span>
            <span className="text-neutral-600">•</span>
            <span>Niño $180</span>
            <span className="text-neutral-600">•</span>
            <span>23 Mesas</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-white/10 border border-white/30 text-white text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-bold">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-bold">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 active:scale-95 transition-all duration-300 text-black font-sans font-black text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
            <ArrowRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </form>

        {/* Perfiles Rápidos */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <span className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2.5 text-center">
            Acceso Rápido
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'admin', label: 'Admin', pass: 'admin123', icon: KeyRound },
              { id: 'cajero', label: 'Caja', pass: 'cajero123', icon: CreditCard },
              { id: 'mesero', label: 'Mesero', pass: 'mesero123', icon: Users },
            ].map((role) => {
              const Icon = role.icon;
              const active = username === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleQuickFill(role.id, role.pass)}
                  className={`py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    active
                      ? 'bg-white text-black border-white font-black'
                      : 'bg-white/5 border-white/15 text-white hover:bg-white/15 font-semibold'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-white'}`} />
                  <span className="text-sm">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Firma Powered by SSS.Solutions en Blanco */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-center gap-3">
          <span className="text-[11px] uppercase tracking-widest font-mono text-neutral-400 font-bold">
            Powered by
          </span>
          <img
            src="./sss-solutions-logo.png"
            alt="SSS.Solutions"
            style={{
              filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
            }}
            className="h-11 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
