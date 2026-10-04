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
    setFiltroCapacidad,
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

  const count4 = mesas.filter((m) => m.capacidad === 4).length || 11;
  const count6 = mesas.filter((m) => m.capacidad === 6).length || 8;
  const count10 = mesas.filter((m) => m.capacidad === 10).length || 4;

  // Menú Principal @react-bits/StaggeredMenu-JS-CSS (Textos breves y directos)
  const staggeredMenuItems = [
    {
      label: 'Mesas',
      subtitle: '23 mesas en el plano',
      ariaLabel: 'Ir al plano de mesas',
      link: '#mesas',
      value: 'mesas',
      onClick: () => handleFilterAndGoMesas(0),
    },
    {
      label: 'Pagos',
      subtitle: `${corte?.totalPagosRegistrados || 0} tickets cobrados`,
      ariaLabel: 'Ir al historial de pagos',
      link: '#history',
      value: 'history',
      onClick: () => handleSelectFeature('history'),
    },
    {
      label: 'Corte de Caja',
      subtitle: 'Efectivo, Tarjeta y SPEI',
      ariaLabel: 'Ir al corte de caja',
      link: '#corte',
      value: 'corte',
      onClick: () => handleSelectFeature('corte'),
    },
    {
      label: 'Cotizador',
      subtitle: 'Presupuesto rápido',
      ariaLabel: 'Ir al cotizador',
      link: '#cotizador',
      value: 'cotizador',
      onClick: () => handleSelectFeature('cotizador'),
    },
    {
      label: 'Accesos',
      subtitle: 'Filtros rápidos',
      ariaLabel: 'Ir a accesos rápidos',
      link: '#quick-actions',
      value: 'quick-actions',
      onClick: () => handleSelectFeature('quick-actions'),
    },
  ];

  // Botones inferiores rápidos dentro del StaggeredMenu
  const staggeredSocialItems = [
    {
      label: 'Todas (23)',
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
        <AnimeStaggerGroup triggerKey={activeTab}>
          <div className="anime-stagger-card">
            <BuffetPosWorkspace />
          </div>
        </AnimeStaggerGroup>
      ),
    },
    {
      title: 'Pagos',
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

      <section className="w-full relative z-10 pt-28 pb-14 overflow-hidden">
        <main
          ref={systemRef}
          id="interactive-system"
          className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24"
        >
          {/* Logo Oficial en Blanco Protagonista */}
          <div className="flex flex-col items-center justify-center text-center py-2">
            <HaciendaLogo
              theme="dark"
              className="w-36 h-40 sm:w-44 sm:h-48"
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

      {/* Footer Minimalista */}
      <footer className="relative z-10 border-t border-white/15 bg-black/90 backdrop-blur-xl py-6 text-center text-xs text-neutral-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <HaciendaLogo
              theme="dark"
              className="w-16 h-18"
            />
            <span className="font-anton text-xl text-white tracking-wider uppercase">
              La Hacienda
            </span>
          </div>

          <div className="flex items-center gap-3 py-1.5 px-4 rounded-full bg-white border border-white/20">
            <span className="text-[11px] uppercase tracking-widest font-mono text-neutral-700 font-bold">
              Powered by
            </span>
            <img
              src="./sss-solutions-logo.png"
              alt="SSS Solutions"
              style={{ maxHeight: '22px' }}
              className="h-5 w-auto object-contain"
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
