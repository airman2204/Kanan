import React from "react";

interface KananLogoProps {
  variant?: "color" | "white";
  layout?: "horizontal" | "stacked";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Imagotipo Oficial Integrado de Kanan Servicios de Limpieza
 * Actualizado con el logotipo oficial original y la nueva paleta 60-30-10:
 * - Principal (60%): #355581
 * - Secundario (30%): #1D71B5
 * - Acento (10%): #36A6DE
 */
export function KananLogo({
  variant = "color",
  layout = "horizontal",
  className = "",
  size = "md",
}: KananLogoProps) {
  const isWhite = variant === "white";

  // Tamaños para el renderizado
  const heightClasses = {
    sm: "h-9 sm:h-10",
    md: "h-12 sm:h-14",
    lg: "h-16 sm:h-20",
  }[size];

  if (layout === "stacked") {
    return (
      <div
        className={`inline-flex flex-col items-center select-none ${className}`}
        style={{ minWidth: "160px" }}
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
      className={`inline-flex items-center gap-2.5 select-none py-0.5 ${className}`}
      style={{ minWidth: "160px" }}
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
