"use client";
import React from "react";
import { BackgroundBeams } from "./background-beams";

/**
 * @aceternity/background-beams-demo
 * Contenedor de fondo animado con haces vectoriales en Blanco y Negro para el sistema La Hacienda Buffet.
 */
export function BackgroundBeamsDemo({ children, variant = "light", className = "" }) {
  return (
    <div className={`relative w-full overflow-hidden antialiased ${className}`}>
      <BackgroundBeams variant={variant} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BackgroundBeamsDemo;
