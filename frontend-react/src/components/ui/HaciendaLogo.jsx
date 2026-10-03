import React from 'react';

/**
 * Logo Oficial de "La Hacienda Restaurante" (Imagen PNG con fondo 100% transparente)
 * - theme="dark": versión en blanco puro (#FFFFFF) con canal alfa transparente para fondos negros
 * - theme="light": versión en negro puro (#000000) con canal alfa transparente para fondos claros/tickets
 */
export const HaciendaLogo = ({
  theme = 'dark',
  className = '',
  imgClassName = '',
}) => {
  const logoSrc = theme === 'light' ? './hacienda-logo-black.png' : './hacienda-logo.png';

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-transparent select-none shrink-0 ${className}`}
    >
      <img
        src={logoSrc}
        alt="La Hacienda Restaurante Logo"
        draggable={false}
        style={{
          filter:
            theme === 'light'
              ? 'contrast(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
              : 'contrast(1.15) drop-shadow(0 0 14px rgba(255,255,255,0.28))',
        }}
        className={`w-full h-full object-contain bg-transparent transition-all duration-300 ${imgClassName}`}
      />
    </div>
  );
};

export default HaciendaLogo;
