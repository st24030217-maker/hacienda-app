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
import { YuccaMegaMenu } from './components/ui/YuccaMegaMenu';
import { HaciendaLogo } from './components/ui/HaciendaLogo';
import { CurrencyDollarIcon } from './components/icons';
import {
  LayoutGrid,
  Zap,
  Receipt,
  TrendingUp,
  Calculator,
  Users,
} from 'lucide-react';
import { triggerHaptic } from './utils/haptics';

const MainContent = () => {
  const {
    user,
    logout,
    mesas,
    corte,
    pagos,
    setFiltroCapacidad,
    setFiltroMetodoPago,
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
      title: cap === 0 ? '23 Mesas' : `Mesas de ${cap} Personas`,
      description: 'Selecciona una mesa para abrir cuenta o cobrar.',
    });
  };

  const handleFilterPagos = async (metodo) => {
    triggerHaptic();
    setFiltroMetodoPago(metodo);
    await recargarDashboard(metodo);
  };

  const count4 = mesas.filter((m) => m.capacidad === 4).length || 11;
  const count6 = mesas.filter((m) => m.capacidad === 6).length || 8;
  const count10 = mesas.filter((m) => m.capacidad === 10).length || 4;

  // Tarjetas de Acceso Rápido en Blanco y Negro
  const quickActionsItems = [
    {
      id: 'mesas-4',
      icon: Users,
      title: 'Mesas de 4',
      subtitle: `${count4} mesas disponibles`,
      badge: '4 PERS.',
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Ver en el plano',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(4),
    },
    {
      id: 'mesas-6',
      icon: Users,
      title: 'Mesas de 6',
      subtitle: `${count6} mesas familiares`,
      badge: '6 PERS.',
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Ver en el plano',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(6),
    },
    {
      id: 'mesas-10',
      icon: LayoutGrid,
      title: 'Mesas de 10',
      subtitle: `${count10} mesas para grupos`,
      badge: '10 PERS.',
      badgeClassName: 'bg-black text-white font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Ver en el plano',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(10),
    },
    {
      id: 'tarifas-buffet',
      icon: CurrencyDollarIcon,
      title: 'Buffet',
      subtitle: 'Adulto $280 · Niño $180',
      badge: 'TARIFAS',
      badgeClassName: 'bg-neutral-100 text-black border border-neutral-300 font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Abrir cuenta',
      activeStatus: true,
      onClick: () => handleFilterAndGoMesas(0),
    },
    {
      id: 'reflejo-pagos',
      icon: Receipt,
      title: 'Pagos',
      subtitle: 'Tickets e impresión',
      badge: `${corte?.totalPagosRegistrados || 0} TICKETS`,
      badgeClassName: 'bg-neutral-100 text-black border border-neutral-300 font-mono font-bold',
      iconBg: 'bg-black text-white',
      borderClassName: 'border-neutral-200 hover:border-black bg-white shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Ver historial',
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
      borderClassName: 'border-neutral-200 hover:border-black bg-white shadow-sm',
      glowGradient: 'from-neutral-100/80 via-transparent to-transparent',
      footerText: 'Ver resumen',
      activeStatus: true,
      onClick: () => handleSelectFeature('corte'),
    },
  ];

  // Pestañas con nombres cortos y fáciles de leer
  const systemTabs = [
    {
      title: 'Mesas',
      value: 'mesas',
      icon: LayoutGrid,
      badge: '23',
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
      title: 'Pagos y Tickets',
      value: 'history',
      icon: Receipt,
      badge: `${corte?.totalPagosRegistrados || 0}`,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab}>
          <div className="anime-stagger-card">
            <PaymentReflectionHistory />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Corte de Caja',
      value: 'corte',
      icon: TrendingUp,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab}>
          <div className="anime-stagger-card">
            <CashCutPanel />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Cotizador',
      value: 'cotizador',
      icon: Calculator,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab}>
          <div className="anime-stagger-card">
            <BuffetGroupSimulator />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Accesos',
      value: 'quick-actions',
      icon: Zap,
      content: (
        <AnimeStaggerGroup triggerKey={activeTab}>
          <div className="anime-stagger-card p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200 shadow-xl space-y-5">
            <h3 className="text-2xl font-anton uppercase tracking-wider text-black flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-black" />
              <span>Accesos Rápidos</span>
            </h3>
            <InterfaceCraftsCards items={quickActionsItems} />
          </div>
        </AnimeStaggerGroup>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 relative flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <BackgroundBeams variant="dark" className="fixed inset-0 z-0" />

      {/* MEGA MENÚ OFICIAL: YUCCA PACKAGING (yucca.co.za) */}
      <YuccaMegaMenu
        activeTab={activeTab}
        onSelectTab={handleSelectFeature}
        onFilterMesas={handleFilterAndGoMesas}
        onFilterPagos={handleFilterPagos}
        onSync={async () => {
          await recargarDashboard();
          sileo.success({
            title: 'Sincronizado',
            description: 'Estado de mesas y pagos actualizado.',
          });
        }}
        mesas={mesas}
        corte={corte}
        pagos={pagos}
        user={user}
        onLogout={logout}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <section className="w-full relative z-10 pt-28 pb-14 overflow-hidden">
        <main
          ref={systemRef}
          id="interactive-system"
          className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24"
        >
          {/* Logo Oficial en Blanco */}
          <div className="flex flex-col items-center justify-center text-center py-1">
            <HaciendaLogo
              theme="dark"
              className="w-28 h-32 sm:w-32 sm:h-36"
            />
          </div>

          {/* Resumen Superior en 4 Tarjetas */}
          <AnimeMetricsHub onNavigateTab={handleSelectFeature} />

          {/* Pestañas Principales */}
          <div id="system-tabs-container" className="scroll-mt-24">
            <Tabs
              tabs={systemTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </main>
      </section>

      {/* Footer con Logos en Blanco sin contorno */}
      <footer className="relative z-10 border-t border-white/15 bg-black/95 backdrop-blur-xl py-6 text-center text-xs text-neutral-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HaciendaLogo
              theme="dark"
              className="w-12 h-14"
            />
            <span className="font-anton text-lg text-white tracking-wider uppercase">
              La Hacienda
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-widest font-mono text-neutral-400 font-bold">
              Powered by
            </span>
            <img
              src="./sss-solutions-logo.png"
              alt="SSS.Solutions"
              className="h-9 sm:h-10 w-auto object-contain"
            />
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
                title: `Hola, ${loggedUser?.nombre || 'Operador'}`,
                description: 'Sesión iniciada.',
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
