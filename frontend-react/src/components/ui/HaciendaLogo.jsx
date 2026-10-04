import React from 'react';

/**
 * Logo Oficial de "La Hacienda Restaurante" en color Blanco con fondo 100% transparente
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
              ? 'contrast(1.2) drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
              : 'brightness(1.25) contrast(1.3) drop-shadow(0 0 18px rgba(255,255,255,0.45))',
        }}
        className={`w-full h-full object-contain bg-transparent transition-all duration-300 ${imgClassName}`}
      />
    </div>
  );
};

export default HaciendaLogo;
