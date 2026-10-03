import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Toaster, sileo } from 'sileo';
import 'sileo/styles.css';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { LoginScreen } from './components/LoginScreen';
import { BuffetPosWorkspace } from './components/BuffetPosWorkspace';
import { PaymentReflectionHistory } from './components/PaymentReflectionHistory';
import { CashCutPanel, BuffetGroupSimulator } from './components/CashCutAndSimulator';
import { InterfaceCraftsCards } from './components/ui/interface-crafts-cards';
import { Tabs } from './components/ui/tabs';
import { AnimeMetricsHub } from './components/ui/anime-metrics-hub';
import { AnimeStaggerGroup } from './components/ui/anime-stagger-group';
import { BackgroundBeams } from './components/ui/background-beams';
import { StaggeredMenu } from './components/ui/StaggeredMenu';
import { HaciendaLogo } from './components/ui/HaciendaLogo';
import { CurrencyDollarIcon, PlugConnectedIcon } from './components/icons';
import {
  LayoutGrid,
  Zap,
  Receipt,
  TrendingUp,
  Calculator,
  Users,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from './utils/haptics';

const MainContent = () => {
  const {
    user,
    logout,
    mesas,
    corte,
    setFiltroCapacidad,
    recargarDashboard,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState('mesas');
  const systemRef = useRef(null);

  const handleSelectFeature = (tabId) => {
    triggerHaptic();
    setActiveTab(tabId);
    const targetEl = document.getElementById('system-tabs-container') || systemRef.current;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterAndGoMesas = (cap) => {
    triggerHaptic();
    setFiltroCapacidad(cap);
    setActiveTab('mesas');
    const targetEl = document.getElementById('system-tabs-container');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
    sileo.info({
      title: cap === 0 ? 'Mostrando Plano Completo (23 Mesas)' : `Filtro: Mesas de ${cap} Personas`,
      description: 'Selecciona cualquier mesa en el plano arquitectónico para abrir cuenta o cobrar.',
    });
  };

  const count4 = mesas.filter((m) => m.capacidad === 4).length || 11;
  const count6 = mesas.filter((m) => m.capacidad === 6).length || 8;
  const count10 = mesas.filter((m) => m.capacidad === 10).length || 4;

  // Opciones del Menú Principal @react-bits/StaggeredMenu-JS-CSS
  const staggeredMenuItems = [
    {
      label: 'Plano 23 Mesas',
      subtitle: 'Pasillo Superior, Laterales, Patio Central y Cuarto Trasero',
      ariaLabel: 'Ir al Plano Arquitectónico Interactivo de 23 Mesas',
      link: '#mesas',
      value: 'mesas',
      onClick: () => handleFilterAndGoMesas(0),
    },
    {
      label: 'Cuenta Buffet',
      subtitle: 'Adulto $280.00 MXN · Niño $180.00 MXN · Extras y Propina',
      ariaLabel: 'Ir a la Calculadora de Buffet',
      link: '#calculadora',
      value: 'calculadora',
      onClick: () => handleSelectFeature('mesas'),
    },
    {
      label: 'Reflejo Pagos',
      subtitle: `${corte?.totalPagosRegistrados || 0} tickets liquidados · Reimpresión 80mm`,
      ariaLabel: 'Ir al Reflejo de Pagos e Historial de Tickets',
      link: '#history',
      value: 'history',
      onClick: () => handleSelectFeature('history'),
    },
    {
      label: 'Corte de Caja',
      subtitle: 'Arqueo de Efectivo, Terminal Bancaria y Transferencia SPEI',
      ariaLabel: 'Ir al Corte de Caja del Turno',
      link: '#corte',
      value: 'corte',
      onClick: () => handleSelectFeature('corte'),
    },
    {
      label: 'Cotizador',
      subtitle: 'Simulador instantáneo de presupuesto para grupos',
      ariaLabel: 'Ir al Cotizador de Grupos',
      link: '#cotizador',
      value: 'cotizador',
      onClick: () => handleSelectFeature('cotizador'),
    },
    {
      label: 'Accesos Crafts',
      subtitle: 'Tarjetas rápidas Aceternity UI por capacidad y módulo',
      ariaLabel: 'Ir al apartado de Funciones Rápidas',
      link: '#quick-actions',
      value: 'quick-actions',
      onClick: () => handleSelectFeature('quick-actions'),
    },
  ];

  // Botones inferiores rápidos dentro del StaggeredMenu
  const staggeredSocialItems = [
    {
      label: `Todas (23)`,
      link: '#todas',
      onClick: () => handleFilterAndGoMesas(0),
    },
    {
      label: `4 Pers. (${count4})`,
      link: '#mesas-4',
      onClick: () => handleFilterAndGoMesas(4),
    },
    {
      label: `6 Pers. (${count6})`,
      link: '#mesas-6',
      onClick: () => handleFilterAndGoMesas(6),
    },
    {
      label: `10 Pers. (${count10})`,
      link: '#mesas-10',
      onClick: () => handleFilterAndGoMesas(10),
    },
    ...(user
      ? [
          {
            label: `Salir (${user.username})`,
            link: '#logout',
            onClick: () => logout(),
          },
        ]
      : []),
  ];

  // Tarjetas de Acceso Rápido (@aceternity/interface-crafts-cards) en Blanco y Negro
  const quickActionsItems = [
    {
      id: 'mesas-4',
      icon: Users,
      title: 'Mesas de 4 Pers.',
      subtitle: `${count4} mesas en el plano`,
      badge: '4 LUGARES',
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white backdrop-blur-xl shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Pasillo Superior, Lateral & Cuarto Trasero',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(4),
    },
    {
      id: 'mesas-6',
      icon: Users,
      title: 'Mesas de 6 Pers.',
      subtitle: `${count6} mesas familiares`,
      badge: '6 LUGARES',
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white backdrop-blur-xl shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Pasillos Laterales & Acceso',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(6),
    },
    {
      id: 'mesas-10',
      icon: LayoutGrid,
      title: 'Mesas de 10 Pers.',
      subtitle: `${count10} mesas para grupos grandes`,
      badge: '10 LUGARES',
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white backdrop-blur-xl shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Pasillo Superior Central & Cuarto Trasero',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(10),
    },
    {
      id: 'tarifas-buffet',
      icon: CurrencyDollarIcon,
      title: 'Tarifas Buffet',
      subtitle: 'Adulto $280 · Niño $180',
      badge: 'OFICIAL',
      badgeClassName: 'bg-neutral-100 text-black border border-neutral-300 font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white backdrop-blur-xl shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Cálculo automático por mesa',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(0),
    },
    {
      id: 'reflejo-pagos',
      icon: Receipt,
      title: 'Reflejo de Pagos',
      subtitle: 'Historial y reimpresión 80mm',
      badge: `${corte?.totalPagosRegistrados || 0} TICKETS`,
      badgeClassName: 'bg-neutral-100 text-black border border-neutral-300 font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white backdrop-blur-xl shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Bitácora de cobros en vivo',
      activeStatus: true,
      onClick: () => handleSelectFeature('history'),
    },
    {
      id: 'corte-caja',
      icon: TrendingUp,
      title: 'Corte de Caja',
      subtitle: 'Efectivo, Tarjeta y SPEI',
      badge: `$${Number(corte?.granTotalCobrado || 0).toFixed(0)}`,
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white backdrop-blur-xl shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Arqueo financiero del turno',
      activeStatus: true,
      onClick: () => handleSelectFeature('corte'),
    },
  ];

  // Pestañas con Aceternity UI Tabs
  const systemTabs = [
    {
      title: 'Plano Interactivo & Mesas (4, 6 y 10)',
      value: 'mesas',
      icon: LayoutGrid,
      badge: '23 MESAS',
      content: (
        <AnimeStaggerGroup triggerKey={activeTab} className="space-y-8">
          <div className="anime-stagger-card">
            <BuffetPosWorkspace />
          </div>
          <div className="anime-stagger-card">
            <PaymentReflectionHistory />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Funciones Rápidas',
      value: 'quick-actions',
      icon: Zap,
      badge: 'CRAFTS',
      content: (
        <AnimeStaggerGroup triggerKey={activeTab} className="space-y-6">
          <div className="anime-stagger-card p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-xl shadow-neutral-200/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs font-mono text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  <span className="tracking-widest uppercase font-bold text-black text-[11px]">
                    ACETERNITY INTERFACE CRAFTS
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-500 text-[11px]">ACCESOS DIRECTOS DEL RESTAURANTE</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2.5 font-sans">
                  <Zap className="w-5 h-5 text-black" />
                  <span>Apartado de Funciones Rápidas</span>
                </h3>
                <p className="text-xs text-neutral-600 mt-1 font-sans">
                  Filtra mesas de 4, 6 o 10 personas, abre la calculadora de buffet ($280 Adulto / $180 Niño) o consulta el reflejo de pagos en 1 clic.
                </p>
              </div>

              <span className="text-[11px] font-bold text-white bg-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-sans w-fit">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="font-mono font-black">6</span> Módulos Activos
              </span>
            </div>

            <InterfaceCraftsCards items={quickActionsItems} />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Reflejo de Pagos & Tickets',
      value: 'history',
      icon: Receipt,
      badge: `${corte?.totalPagosRegistrados || 0}`,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab} className="space-y-6">
          <div className="anime-stagger-card">
            <PaymentReflectionHistory />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Corte de Caja del Turno',
      value: 'corte',
      icon: TrendingUp,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab} className="space-y-6">
          <div className="anime-stagger-card">
            <CashCutPanel />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Cotizador de Grupos',
      value: 'cotizador',
      icon: Calculator,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab} className="space-y-6">
          <div className="anime-stagger-card">
            <BuffetGroupSimulator />
          </div>
        </AnimeStaggerGroup>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 relative flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Fondo Global Oficial @aceternity/background-beams-demo en Negro y Blanco */}
      <BackgroundBeams variant="dark" className="fixed inset-0 z-0" />

      {/* MENÚ PRINCIPAL OFICIAL: @react-bits/StaggeredMenu-JS-CSS */}
      <StaggeredMenu
        position="right"
        isFixed={true}
        colors={['#000000', '#262626', '#525252']}
        items={staggeredMenuItems}
        socialItems={staggeredSocialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#000000"
        openMenuButtonColor="#ffffff"
        accentColor="#000000"
        changeMenuColorOnOpen={true}
        activeItemValue={activeTab}
        user={user}
        corte={corte}
        onLogout={logout}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <section className="w-full relative z-10 pt-24 pb-16 overflow-hidden">
        <main
          ref={systemRef}
          id="interactive-system"
          className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24"
        >
          {/* 1. PANEL DE CONTROL DE MÉTRICAS CON CANVAS REVEAL EFFECT */}
          <AnimeMetricsHub onNavigateTab={handleSelectFeature} />

          {/* 2. ENCABEZADO DEL CENTRO DE OPERACIONES CON BACKGROUND BEAMS DEMO Y LOGO TRANSPARENTE LA HACIENDA */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-neutral-950/90 backdrop-blur-xl text-white shadow-2xl border border-white/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <BackgroundBeams variant="dark" className="opacity-85" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 flex items-center justify-center">
                <HaciendaLogo
                  theme="dark"
                  className="w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="tracking-widest uppercase font-bold text-white">
                    ARQUITECTURA .NET API + PHP + MYSQL
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-300">Operador: {user?.nombre || 'Administrador'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-anton text-white tracking-wider uppercase flex items-center gap-3">
                  <span>Centro de Operaciones · La Hacienda Restaurante</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 font-sans">
                  Control centralizado del plano de 23 mesas (4, 6 y 10 personas), calculadora de buffet (Adulto $280 / Niño $180) y reflejo de pagos en tiempo real.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 font-sans">
              <button
                type="button"
                onClick={async () => {
                  await recargarDashboard();
                  sileo.success({
                    title: 'Sincronización Completada',
                    description: 'Estado de mesas y reflejo de pagos actualizados con la API .NET.',
                  });
                }}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Sincronizar Caja</span>
              </button>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 shadow-sm shrink-0">
                <PlugConnectedIcon size={18} className="text-white" />
                <div className="text-left font-sans">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold font-mono">
                    Backend .NET
                  </div>
                  <div className="text-xs font-bold text-white">Puerto 5080 Activo</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. PESTAÑAS ACETERNITY UI TABS */}
          <div id="system-tabs-container" className="scroll-mt-24">
            <Tabs
              tabs={systemTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </main>
      </section>

      {/* Footer Oficial con Logo Transparente La Hacienda y Powered by SSS.Solutions */}
      <footer className="relative z-10 border-t border-white/15 bg-black/90 backdrop-blur-xl py-8 text-center text-xs text-neutral-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <HaciendaLogo
              variant="emblem"
              theme="dark"
              className="w-11 h-12"
            />
            <div className="text-left font-sans">
              <span className="font-anton text-base text-white tracking-wider uppercase block">
                La Hacienda Restaurante · POS
              </span>
              <span className="text-[11px] text-neutral-400">
                Buffet Adulto $280 · Niño $180 • 23 Mesas (4, 6 y 10 Personas)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 px-5 rounded-full bg-white border border-white/20 font-sans">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-neutral-700 font-bold">
              Powered by
            </span>
            <img
              src="./sss-solutions-logo.png"
              alt="SSS Solutions"
              style={{ maxHeight: '26px' }}
              className="h-6 w-auto object-contain"
            />
          </div>

          <div className="text-center md:text-right font-sans text-[11px] text-neutral-400">
            <span className="text-white font-semibold">© {new Date().getFullYear()} La Hacienda Restaurante.</span>
            <span className="block text-neutral-400">
              Tecnología SSS.Solutions • .NET REST API + PHP + MySQL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AppShell = () => {
  const { user } = useRestaurant();

  return (
    <>
      <MainContent />
      <AnimatePresence>
        {!user && (
          <LoginScreen
            key="login-screen"
            onLoginSuccess={(loggedUser) => {
              sileo.success({
                title: `Bienvenido(a), ${loggedUser?.nombre || 'Operador'}`,
                description: 'Sistema de mesas, buffet y reflejo de pagos sincronizado.',
              });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <Toaster position="top-right" theme="light" options={{ fill: '#000000' }} />
      <AppShell />
    </RestaurantProvider>
  );
}
