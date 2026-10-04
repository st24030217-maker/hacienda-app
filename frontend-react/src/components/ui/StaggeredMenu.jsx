'use client';

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Clock, LogOut } from 'lucide-react';
import { PlugConnectedIcon } from '../icons';
import { HaciendaLogo } from './HaciendaLogo';
import './StaggeredMenu.css';

/**
 * @react-bits/StaggeredMenu-JS-CSS
 * Menú Principal con animación escalonada GSAP (pre-capas + rotación de icono + ciclo de texto + numeración)
 * adaptado en Blanco y Negro (#000000 / #FFFFFF) para La Hacienda Buffet.
 */
export const StaggeredMenu = ({
  position = 'right',
  colors = ['#000000', '#262626', '#525252'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = '#000000',
  openMenuButtonColor = '#ffffff',
  accentColor = '#000000',
  changeMenuColorOnOpen = true,
  isFixed = true,
  closeOnClickAway = true,
  activeItemValue,
  user,
  corte,
  onLogout,
  onLogoClick,
  onMenuOpen,
  onMenuClose,
}) => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menú', 'Cerrar']);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
    );
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.48, ease: 'power4.out' },
        i * 0.07
      );
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.62;
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.85,
          ease: 'power4.out',
          stagger: { each: 0.08, from: 'start' },
        },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.55,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.07, from: 'start' },
          },
          itemsStart + 0.08
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.38;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.45,
            ease: 'power2.out',
          },
          socialsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            stagger: { each: 0.06, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(
          panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
        );
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busyRef.current = false;
      },
    });
  }, [position]);

  const animateIcon = useCallback((opening) => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, {
        rotate: 225,
        duration: 0.8,
        ease: 'power4.out',
        overwrite: 'auto',
      });
    } else {
      spinTweenRef.current = gsap.to(icon, {
        rotate: 0,
        duration: 0.35,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    }
  }, []);

  const animateColor = useCallback(
    (opening) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menú' : 'Cerrar';
    const targetLabel = opening ? 'Cerrar' : 'Menú';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menú' ? 'Cerrar' : 'Menú';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out',
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  const mesasActivasCount = (corte?.mesasOcupadas || 0) + (corte?.mesasPorPagar || 0);

  return (
    <div
      className={
        (className ? className + ' ' : '') +
        'staggered-menu-wrapper' +
        (isFixed ? ' fixed-wrapper' : '')
      }
      style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
      data-position={position}
      data-open={open ? 'true' : undefined}
    >
      {/* Backdrop oscuro al abrir el StaggeredMenu */}
      <div
        className="staggered-menu-backdrop"
        aria-hidden="true"
        onClick={closeMenu}
      />

      {/* Pre-capas escalonadas GSAP en Negro y Gris */}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors && colors.length ? colors.slice(0, 4) : ['#000000', '#262626'];
          let arr = [...raw];
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2);
            arr.splice(mid, 1);
          }
          return arr.map((c, i) => (
            <div key={i} className="sm-prelayer" style={{ background: c }} />
          ));
        })()}
      </div>

      {/* Header Principal Fijo con StaggeredMenu Toggle */}
      <header
        className={`staggered-menu-header ${isScrolled ? 'is-scrolled' : ''}`}
        aria-label="Menú principal de navegación La Hacienda Buffet"
      >
        <div
          className="sm-logo"
          role="button"
          tabIndex={0}
          aria-label="Ir al inicio de La Hacienda Buffet"
          onClick={() => {
            closeMenu();
            if (onLogoClick) onLogoClick();
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <HaciendaLogo
            variant="emblem"
            theme={isScrolled ? 'light' : 'dark'}
            className="w-11 h-12 sm:w-12 sm:h-14"
          />
          <span
            className={`font-anton text-2xl sm:text-3xl tracking-wider uppercase ${
              isScrolled ? 'text-black' : 'text-white'
            }`}
          >
            La Hacienda
          </span>
        </div>

        {/* Telemetría rápida + Botón Oficial StaggeredMenu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono ${
              isScrolled
                ? 'bg-neutral-100 text-black border border-neutral-200'
                : 'bg-white/10 text-white border border-white/15'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {currentTime.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold ${
              isScrolled
                ? 'bg-neutral-100 text-black border border-neutral-200'
                : 'bg-white/10 text-white border border-white/15'
            }`}
          >
            <PlugConnectedIcon
              size={14}
              className={isScrolled ? 'text-black shrink-0' : 'text-white shrink-0'}
            />
            <span>
              {mesasActivasCount} Activas · ${(corte?.granTotalCobrado || 0).toFixed(0)}
            </span>
          </div>

          {user && (
            <button
              type="button"
              onClick={onLogout}
              title={`Cerrar sesión de ${user.nombre}`}
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-sans font-bold transition cursor-pointer ${
                isScrolled
                  ? 'bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-200'
                  : 'bg-white/10 hover:bg-white hover:text-black text-white'
              }`}
            >
              <span>{user.username}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Botón Oficial @react-bits/StaggeredMenu */}
          <button
            ref={toggleBtnRef}
            className="sm-toggle"
            aria-label={open ? 'Cerrar menú principal' : 'Abrir menú principal'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
              <span ref={textInnerRef} className="sm-toggle-textInner">
                {textLines.map((l, i) => (
                  <span className="sm-toggle-line" key={i}>
                    {l}
                  </span>
                ))}
              </span>
            </span>
            <span ref={iconRef} className="sm-icon" aria-hidden="true">
              <span ref={plusHRef} className="sm-icon-line" />
              <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
            </span>
          </button>
        </div>
      </header>

      {/* Panel Deslizante StaggeredMenu */}
      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          <div className="pb-3 border-b border-neutral-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <HaciendaLogo
                variant="emblem"
                theme="light"
                className="w-9 h-10"
              />
              <span className="text-base font-anton uppercase tracking-wider text-black">
                La Hacienda
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white shrink-0">
              23 MESAS
            </span>
          </div>

          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items && items.length ? (
              items.map((it, idx) => {
                const isActive = activeItemValue && it.value === activeItemValue;
                return (
                  <li className="sm-panel-itemWrap" key={it.label + idx}>
                    <a
                      className="sm-panel-item"
                      href={it.link || `#${it.value || idx}`}
                      aria-label={it.ariaLabel || it.label}
                      data-index={idx + 1}
                      data-active={isActive ? 'true' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        closeMenu();
                        if (it.onClick) it.onClick(it);
                      }}
                    >
                      <span className="sm-panel-itemLabel">
                        {it.label}
                        {it.subtitle && (
                          <span className="sm-panel-itemSub">{it.subtitle}</span>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">Sin opciones</span>
                </span>
              </li>
            )}
          </ul>

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Filtros rápidos de mesas y acciones">
              <h3 className="sm-socials-title">
                Capacidad
              </h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a
                      href={s.link || '#'}
                      className="sm-socials-link"
                      onClick={(e) => {
                        e.preventDefault();
                        closeMenu();
                        if (s.onClick) s.onClick(s);
                      }}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
