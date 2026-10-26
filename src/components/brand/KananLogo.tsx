import React from "react";

interface KananLogoProps {
  variant?: "color" | "white";
  layout?: "horizontal" | "stacked";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Imagotipo Oficial Integrado de Kanan Servicios de Limpieza
 * Tamaño grande para máxima visibilidad en Header y Login
 */
export function KananLogo({
  variant = "color",
  layout = "horizontal",
  className = "",
  size = "md",
}: KananLogoProps) {
  const isWhite = variant === "white";

  // Tamaños ampliados y visibles
  const heightClasses = {
    sm: "h-12 sm:h-14",
    md: "h-16 sm:h-20",
    lg: "h-20 sm:h-28",
  }[size];

  if (layout === "stacked") {
    return (
      <div
        className={`inline-flex flex-col items-center select-none ${className}`}
        style={{ minWidth: "180px" }}
      >
        <img
          src={
            isWhite
              ? "/assets/brand/kanan-logo-white.png"
              : "/assets/brand/kanan-logo-oficial.png"
          }
          alt="Kanan Servicios de Limpieza — Imagotipo Oficial"
          className={`${heightClasses} w-auto object-contain transition-transform`}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none py-1 ${className}`}
      style={{ minWidth: "180px" }}
      aria-label="Kanan Servicios de Limpieza"
    >
      <img
        src={
          isWhite
            ? "/assets/brand/kanan-logo-white.png"
            : "/assets/brand/kanan-logo-oficial.png"
        }
        alt="Kanan Servicios de Limpieza"
        className={`${heightClasses} w-auto object-contain shrink-0`}
      />
    </div>
  );
}
