import React from 'react';

/**
 * Logo Oficial de "La Hacienda Restaurante" en color Blanco con fondo 100% transparente (sin contorno)
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
        className={`w-full h-full object-contain bg-transparent transition-all duration-300 ${imgClassName}`}
      />
    </div>
  );
};

export default HaciendaLogo;
