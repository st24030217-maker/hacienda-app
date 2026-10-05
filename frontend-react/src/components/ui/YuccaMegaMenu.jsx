import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Users,
  Receipt,
  TrendingUp,
  Calculator,
  Zap,
  LogOut,
  RefreshCw,
  Menu,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Utensils,
  Wine,
} from 'lucide-react';
import { HaciendaLogo } from './HaciendaLogo';
import './YuccaMegaMenu.css';

// Flecha SVG oficial de Yucca Packaging (yucca.co.za)
const YuccaArrowSvg = ({ className = 'w-5 h-5' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M13.6923 17.6155L12.9845 16.8963L17.073 12.8078H5V11.8078H17.073L12.9845 7.71925L13.6923 7L19 12.3078L13.6923 17.6155Z"
      fill="currentColor"
    />
  </svg>
);

const YuccaChevronDownSvg = ({ className = 'w-4 h-4' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 15.0538L6.34625 9.4L7.4 8.34625L12 12.9463L16.6 8.34625L17.6538 9.4L12 15.0538Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Yucca Packaging Mega Menu (yucca.co.za) adaptado para La Hacienda Restaurante
 * - 3 paneles Mega Menu desplegables ("Mesas & Plano", "Buffet & Tarifas", "Pagos & Tickets")
 * - Enlaces directos ("Cotizador", "Accesos")
 * - Botón contador estilo .h-cart + Dropdown de cuenta con 2 pestañas estilo .h-account-dropdown
 */
export const YuccaMegaMenu = ({
  activeTab,
  onSelectTab,
  onFilterMesas,
  onFilterPagos,
  onSync,
  mesas = [],
  corte,
  pagos = [],
  user,
  onLogout,
  onLogoClick,
}) => {
  const [openPanel, setOpenPanel] = useState(null); // 'shop' | 'solutions' | 'resources' | 'mobile' | null
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState('operador'); // 'operador' | 'sistema'
  const [hoveredResourceIdx, setHoveredResourceIdx] = useState(0);

  const navRootRef = useRef(null);
  const closeTimerRef = useRef(null);

  const count4 = mesas.filter((m) => m.capacidad === 4).length || 11;
  const count6 = mesas.filter((m) => m.capacidad === 6).length || 8;
  const count10 = mesas.filter((m) => m.capacidad === 10).length || 4;
  const mesasActivasCount = (corte?.mesasOcupadas || 0) + (corte?.mesasPorPagar || 0);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnterPanel = (panelId) => {
    clearCloseTimer();
    setAccountOpen(false);
    setOpenPanel(panelId);
  };

  const handleMouseLeaveNav = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenPanel((prev) => (prev === 'mobile' ? prev : null));
    }, 180);
  };

  const closeAll = () => {
    clearCloseTimer();
    setOpenPanel(null);
    setAccountOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeAll();
    };
    const handleClickOutside = (e) => {
      if (navRootRef.current && !navRootRef.current.contains(e.target)) {
        closeAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Opciones del Panel 1: Estilo "Shop" de Yucca (Mesas por capacidad y zona)
  const shopLinks = [
    {
      label: `Plano Completo (23)`,
      onClick: () => {
        closeAll();
        onFilterMesas?.(0);
      },
    },
    {
      label: `Mesas de 4 Pers. (${count4})`,
      onClick: () => {
        closeAll();
        onFilterMesas?.(4);
      },
    },
    {
      label: `Mesas de 6 Pers. (${count6})`,
      onClick: () => {
        closeAll();
        onFilterMesas?.(6);
      },
    },
    {
      label: `Mesas de 10 Pers. (${count10})`,
      onClick: () => {
        closeAll();
        onFilterMesas?.(10);
      },
    },
    {
      label: 'Pasillo Superior (7)',
      onClick: () => {
        closeAll();
        onFilterMesas?.(0);
      },
    },
    {
      label: 'Pasillos Laterales (8)',
      onClick: () => {
        closeAll();
        onFilterMesas?.(0);
      },
    },
    {
      label: 'Acceso / Trasero (8)',
      onClick: () => {
        closeAll();
        onFilterMesas?.(0);
      },
    },
    {
      label: 'Tarjetas de Mesas',
      onClick: () => {
        closeAll();
        onSelectTab?.('mesas');
      },
    },
  ];

  // Opciones del Panel 3: Estilo "Resources" de Yucca (con vista previa dinámica al pasar el cursor)
  const resourcesItems = [
    {
      label: 'Todos los Tickets',
      metric: `${pagos.length} Pagos`,
      amount: `$${Number(corte?.granTotalCobrado || 0).toFixed(2)}`,
      subtitle: 'Bitácora general de cuentas cobradas hoy',
      icon: Receipt,
      onClick: () => {
        closeAll();
        onFilterPagos?.('Todos');
        onSelectTab?.('history');
      },
    },
    {
      label: 'Cobros en Efectivo',
      metric: 'Efectivo en Caja',
      amount: `$${Number(corte?.totalEfectivo || 0).toFixed(2)}`,
      subtitle: 'Billetes y cambio entregado en turno',
      icon: Banknote,
      onClick: () => {
        closeAll();
        onFilterPagos?.('Efectivo');
        onSelectTab?.('history');
      },
    },
    {
      label: 'Terminal Bancaria',
      metric: 'Tarjeta Débito / Crédito',
      amount: `$${Number(corte?.totalTarjeta || 0).toFixed(2)}`,
      subtitle: 'Vouchers autorizados en terminal',
      icon: CreditCard,
      onClick: () => {
        closeAll();
        onFilterPagos?.('Tarjeta');
        onSelectTab?.('history');
      },
    },
    {
      label: 'Transferencias SPEI',
      metric: 'Banca Móvil',
      amount: `$${Number(corte?.totalTransferencia || 0).toFixed(2)}`,
      subtitle: 'Pagos verificados por clave de rastreo',
      icon: Smartphone,
      onClick: () => {
        closeAll();
        onFilterPagos?.('Transferencia');
        onSelectTab?.('history');
      },
    },
    {
      label: 'Corte de Caja',
      metric: 'Arqueo Completo',
      amount: `$${Number(corte?.granTotalCobrado || 0).toFixed(2)}`,
      subtitle: 'Resumen de Buffet Adulto, Niño, Extras y Propinas',
      icon: TrendingUp,
      onClick: () => {
        closeAll();
        onSelectTab?.('corte');
      },
    },
  ];

  const activeResource = resourcesItems[hoveredResourceIdx] || resourcesItems[0];
  const ActiveResourceIcon = activeResource.icon;

  return (
    <>
      {/* Backdrop oscuro estilo Yucca Packaging */}
      <div
        className={`yucca-nav-backdrop ${openPanel || accountOpen ? 'is-active' : ''}`}
        onClick={closeAll}
        aria-hidden="true"
      />

      <div
        ref={navRootRef}
        className="yucca-nav-root"
        onMouseLeave={handleMouseLeaveNav}
      >
        {/* ================================================================ */}
        {/* HEADER PRINCIPAL YUCCA PACKAGING (.header)                       */}
        {/* ================================================================ */}
        <header className={`yucca-header ${openPanel ? 'has-open-panel' : ''}`}>
          {/* 1. Logo Izquierdo (.h-logo) */}
          <div
            role="button"
            tabIndex={0}
            className="yucca-h-logo"
            onClick={() => {
              closeAll();
              onLogoClick?.();
            }}
          >
            <HaciendaLogo theme="dark" className="w-14 h-16 sm:w-16 sm:h-18" />
            <span className="font-anton text-2xl sm:text-3xl tracking-wider uppercase text-white">
              La Hacienda
            </span>
          </div>

          {/* 2. Navegación Central Mega Menu (.nav > .n-menu) */}
          <nav className="hidden lg:block" aria-label="Mega Menú Principal">
            <ul className="yucca-n-menu">
              {/* Item 1: Mesas & Plano (Estilo "Shop" de Yucca) */}
              <li
                className="yucca-n-item"
                onMouseEnter={() => handleMouseEnterPanel('shop')}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel((prev) => (prev === 'shop' ? null : 'shop'))
                  }
                  className={`yucca-n-link has-dropdown ${
                    openPanel === 'shop' ? 'is-open' : activeTab === 'mesas' ? 'is-active' : ''
                  }`}
                >
                  <span>Mesas (23)</span>
                  <span className="yucca-arrow">
                    <YuccaArrowSvg className="w-4 h-4" />
                  </span>
                </button>
              </li>

              {/* Item 2: Buffet & Zonas (Estilo "Packaging Solutions" de Yucca) */}
              <li
                className="yucca-n-item"
                onMouseEnter={() => handleMouseEnterPanel('solutions')}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel((prev) => (prev === 'solutions' ? null : 'solutions'))
                  }
                  className={`yucca-n-link has-dropdown ${
                    openPanel === 'solutions' ? 'is-open' : ''
                  }`}
                >
                  <span>Buffet & Tarifas</span>
                  <span className="yucca-arrow">
                    <YuccaArrowSvg className="w-4 h-4" />
                  </span>
                </button>
              </li>

              {/* Item 3: Pagos & Tickets (Estilo "Resources" de Yucca) */}
              <li
                className="yucca-n-item"
                onMouseEnter={() => handleMouseEnterPanel('resources')}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel((prev) => (prev === 'resources' ? null : 'resources'))
                  }
                  className={`yucca-n-link has-dropdown ${
                    openPanel === 'resources'
                      ? 'is-open'
                      : activeTab === 'history'
                      ? 'is-active'
                      : ''
                  }`}
                >
                  <span>Pagos & Tickets</span>
                  <span className="yucca-arrow">
                    <YuccaArrowSvg className="w-4 h-4" />
                  </span>
                </button>
              </li>

              {/* Item 4: Cotizador (Enlace Directo) */}
              <li
                className="yucca-n-item"
                onMouseEnter={() => setOpenPanel(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    onSelectTab?.('cotizador');
                  }}
                  className={`yucca-n-link ${
                    activeTab === 'cotizador' && !openPanel ? 'is-active' : ''
                  }`}
                >
                  <span>Cotizador</span>
                </button>
              </li>

              {/* Item 5: Accesos (Enlace Directo) */}
              <li
                className="yucca-n-item"
                onMouseEnter={() => setOpenPanel(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    onSelectTab?.('quick-actions');
                  }}
                  className={`yucca-n-link ${
                    activeTab === 'quick-actions' && !openPanel ? 'is-active' : ''
                  }`}
                >
                  <span>Accesos</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* 3. Acciones Derechas estilo Yucca (.credit-application + .h-cart + .h-account) */}
          <div className="yucca-header-actions">
            {/* Acceso Rápido a Corte de Caja (.credit-application) */}
            <button
              type="button"
              onClick={() => {
                closeAll();
                onSelectTab?.('corte');
              }}
              className="yucca-credit-link hidden xl:inline-flex"
            >
              <TrendingUp className="w-4 h-4 text-white" />
              <span>Corte: ${Number(corte?.granTotalCobrado || 0).toFixed(0)}</span>
            </button>

            {/* Contador de Mesas Activas (.h-cart) */}
            <button
              type="button"
              onClick={() => {
                closeAll();
                onSelectTab?.('mesas');
              }}
              title="Mesas activas en el plano"
              className="yucca-h-cart"
            >
              <span className="yucca-h-cart-amount">{mesasActivasCount}</span>
              <span className="yucca-h-cart-btn">
                <LayoutGrid className="w-4 h-4" />
              </span>
            </button>

            {/* Botón de Cuenta con texto rodante (.h-account) */}
            <button
              type="button"
              onClick={() => {
                setOpenPanel(null);
                setAccountOpen((prev) => !prev);
              }}
              className="yucca-btn-roll hidden sm:inline-flex"
            >
              <span className="yucca-btn-roll-wrap">
                <span className="yucca-btn-roll-text">
                  {user?.username || 'Operador'}
                </span>
                <span className="yucca-btn-roll-hover">
                  {user?.username || 'Operador'}
                </span>
              </span>
              <YuccaChevronDownSvg className="w-4 h-4" />
            </button>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setOpenPanel((prev) => (prev === 'mobile' ? null : 'mobile'));
              }}
              className="lg:hidden p-2.5 rounded-full bg-white text-black cursor-pointer"
              aria-label="Abrir menú"
            >
              {openPanel === 'mobile' ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* ================================================================ */}
        {/* DROPDOWN DE CUENTA DE 2 PESTAÑAS (.h-account-dropdown)           */}
        {/* ================================================================ */}
        {accountOpen && (
          <div className="yucca-account-dropdown">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 border border-neutral-200 mb-4">
              <button
                type="button"
                onClick={() => setAccountTab('operador')}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
                  accountTab === 'operador'
                    ? 'bg-black text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Operador
              </button>
              <button
                type="button"
                onClick={() => setAccountTab('sistema')}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
                  accountTab === 'sistema'
                    ? 'bg-black text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Turno Actual
              </button>
            </div>

            {accountTab === 'operador' ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 block">Sesión Activa</span>
                    <strong className="text-base font-anton uppercase tracking-wide text-black">
                      {user?.nombre || 'Administrador'}
                    </strong>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-black text-white text-xs font-mono font-bold uppercase">
                    {user?.rol || 'Admin'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    onLogout?.();
                  }}
                  className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Mesas Libres:</span>
                    <strong className="font-mono text-black">{corte?.mesasLibres || 0} / 23</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tickets Hoy:</span>
                    <strong className="font-mono text-black">{pagos.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Cobrado:</span>
                    <strong className="font-mono text-black">
                      ${Number(corte?.granTotalCobrado || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    onSync?.();
                  }}
                  className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sincronizar</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* PANELES MEGA MENU DESPLEGABLES (.nav-submenus)                   */}
        {/* ================================================================ */}
        <div className="yucca-submenus-container">
          {/* PANEL 1: "MESAS (23)" — Estructura idéntica a data-id="shop" de Yucca */}
          {openPanel === 'shop' && (
            <div
              className="yucca-submenu-panel"
              onMouseEnter={clearCloseTimer}
            >
              <div className="yucca-submenu-inner yucca-shop-grid">
                {/* Izquierda: Lista de categorías con flecha + CTA inferior */}
                <div className="yucca-submenu-left">
                  <div className="yucca-submenu-links">
                    {shopLinks.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={item.onClick}
                        className="yucca-submenu-link"
                      >
                        <span>{item.label}</span>
                        <span className="yucca-link-arrow">
                          <YuccaArrowSvg />
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="yucca-divider" />
                    <button
                      type="button"
                      onClick={() => {
                        closeAll();
                        onFilterMesas?.(0);
                      }}
                      className="yucca-submenu-cta"
                    >
                      <span>Ver el plano completo de 23 mesas</span>
                      <YuccaArrowSvg />
                    </button>
                  </div>
                </div>

                {/* Derecha: 2 Tarjetas Destacadas (.n-card-enquire + .n-card-loyalty) */}
                <div className="yucca-submenu-right">
                  {/* Card 1: Cotizador de Grupos (.n-card-enquire) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      closeAll();
                      onSelectTab?.('cotizador');
                    }}
                    className="yucca-card yucca-card-dark"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-mono font-bold uppercase">
                          GRUPOS & EVENTOS
                        </span>
                        <HaciendaLogo theme="dark" className="w-11 h-12" />
                      </div>
                      <h4 className="text-2xl font-anton uppercase tracking-wide text-white">
                        ¿Grupo grande en puerta?
                      </h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Calcula al instante el presupuesto de adultos ($280) y niños ($180) y conoce qué mesa asignar.
                      </p>
                    </div>

                    <div className="yucca-card-footer">
                      <span>Abrir Cotizador</span>
                      <YuccaArrowSvg />
                    </div>
                  </div>

                  {/* Card 2: Estado en Vivo (.n-card-loyalty) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      closeAll();
                      onSelectTab?.('corte');
                    }}
                    className="yucca-card yucca-card-light"
                  >
                    <div className="space-y-3">
                      <span className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-mono font-bold uppercase inline-block">
                        EN VIVO
                      </span>
                      <h4 className="text-2xl font-anton uppercase tracking-wide text-black">
                        {corte?.mesasLibres || 0} Libres · {mesasActivasCount} Activas
                      </h4>
                      <p className="text-xs text-neutral-600">
                        4p ({count4}) · 6p ({count6}) · 10p ({count10})
                      </p>
                    </div>

                    <div className="yucca-card-footer">
                      <span>Ver Corte</span>
                      <YuccaArrowSvg />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: "BUFFET & TARIFAS" — Estructura idéntica a data-id="solutions" de Yucca (4 Cards) */}
          {openPanel === 'solutions' && (
            <div
              className="yucca-submenu-panel"
              onMouseEnter={clearCloseTimer}
            >
              <div className="yucca-submenu-inner yucca-solutions-grid">
                {/* Card 1: Buffet Adulto */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    closeAll();
                    onSelectTab?.('mesas');
                  }}
                  className="yucca-solution-card yucca-card-dark"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="p-2.5 rounded-xl bg-white text-black">
                        <Utensils className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white/15 text-white">
                        TARIFA OFICIAL
                      </span>
                    </div>
                    <h4 className="text-2xl font-anton uppercase tracking-wide text-white pt-2">
                      Buffet Adulto
                    </h4>
                    <div className="text-3xl font-anton text-white">$280.00</div>
                    <p className="text-xs text-neutral-300">
                      Barra libre de guisos, carnes al carbón, ensaladas y postres.
                    </p>
                  </div>

                  <div className="yucca-card-footer">
                    <span>Asignar en Mesa</span>
                    <YuccaArrowSvg />
                  </div>
                </div>

                {/* Card 2: Buffet Niño */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    closeAll();
                    onSelectTab?.('mesas');
                  }}
                  className="yucca-solution-card yucca-card-light"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="p-2.5 rounded-xl bg-black text-white">
                        <Users className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-black text-white">
                        INFANTIL
                      </span>
                    </div>
                    <h4 className="text-2xl font-anton uppercase tracking-wide text-black pt-2">
                      Buffet Niño
                    </h4>
                    <div className="text-3xl font-anton text-black">$180.00</div>
                    <p className="text-xs text-neutral-600">
                      Tarifa preferencial infantil con acceso completo a barra y postres.
                    </p>
                  </div>

                  <div className="yucca-card-footer">
                    <span>Asignar en Mesa</span>
                    <YuccaArrowSvg />
                  </div>
                </div>

                {/* Card 3: Bebidas y Extras */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    closeAll();
                    onSelectTab?.('mesas');
                  }}
                  className="yucca-solution-card yucca-card-light"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="p-2.5 rounded-xl bg-black text-white">
                        <Wine className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-black text-white">
                        EXTRAS
                      </span>
                    </div>
                    <h4 className="text-2xl font-anton uppercase tracking-wide text-black pt-2">
                      Bebidas & Extras
                    </h4>
                    <div className="text-3xl font-anton text-black">Carta</div>
                    <p className="text-xs text-neutral-600">
                      Jarras de agua fresca, refrescos, café de olla y postres especiales.
                    </p>
                  </div>

                  <div className="yucca-card-footer">
                    <span>Añadir a Cuenta</span>
                    <YuccaArrowSvg />
                  </div>
                </div>

                {/* Card 4: Accesos Rápidos */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    closeAll();
                    onSelectTab?.('quick-actions');
                  }}
                  className="yucca-solution-card yucca-card-dark"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <HaciendaLogo theme="dark" className="w-11 h-12" />
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-2xl font-anton uppercase tracking-wide text-white pt-2">
                      Accesos Rápidos
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Filtra mesas por capacidad o salta directo al módulo de arqueo.
                    </p>
                  </div>

                  <div className="yucca-card-footer">
                    <span>Explorar</span>
                    <YuccaArrowSvg />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 3: "PAGOS & TICKETS" — Estructura idéntica a data-id="resources" de Yucca */}
          {openPanel === 'resources' && (
            <div
              className="yucca-submenu-panel"
              onMouseEnter={clearCloseTimer}
            >
              <div className="yucca-submenu-inner yucca-resources-grid">
                {/* Lista Izquierda con Hover Dinámico */}
                <div className="yucca-resources-list">
                  {resourcesItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setHoveredResourceIdx(idx)}
                      onClick={item.onClick}
                      className={`yucca-submenu-link ${
                        hoveredResourceIdx === idx ? 'bg-black text-white pl-4' : ''
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="yucca-link-arrow">
                        <YuccaArrowSvg />
                      </span>
                    </button>
                  ))}
                </div>

                {/* Derecha: Vista Previa Dinámica (.n-submenu-images de Yucca) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={activeResource.onClick}
                  className="yucca-preview-box cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-3 rounded-2xl bg-white text-black">
                        <ActiveResourceIcon className="w-6 h-6" />
                      </span>
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
                          {activeResource.metric}
                        </span>
                        <h4 className="text-2xl font-anton uppercase tracking-wider text-white">
                          {activeResource.label}
                        </h4>
                      </div>
                    </div>
                    <HaciendaLogo theme="dark" className="w-14 h-16" />
                  </div>

                  <div className="my-4">
                    <div className="text-4xl sm:text-5xl font-anton tracking-wide text-white">
                      {activeResource.amount}
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      {activeResource.subtitle}
                    </p>
                  </div>

                  <div className="yucca-card-footer">
                    <span>Abrir Módulo</span>
                    <YuccaArrowSvg />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL MÓVIL RESPONSIVO */}
          {openPanel === 'mobile' && (
            <div className="yucca-submenu-panel lg:hidden">
              <div className="space-y-2">
                {[
                  { label: 'Mesas (23)', tab: 'mesas' },
                  { label: 'Pagos y Tickets', tab: 'history' },
                  { label: 'Corte de Caja', tab: 'corte' },
                  { label: 'Cotizador', tab: 'cotizador' },
                  { label: 'Accesos Rápidos', tab: 'quick-actions' },
                ].map((m) => (
                  <button
                    key={m.tab}
                    type="button"
                    onClick={() => {
                      closeAll();
                      onSelectTab?.(m.tab);
                    }}
                    className="yucca-submenu-link w-full"
                  >
                    <span>{m.label}</span>
                    <YuccaArrowSvg />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default YuccaMegaMenu;
