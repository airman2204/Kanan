import React from "react";

interface KananLogoProps {
  variant?: "color" | "white";
  layout?: "horizontal" | "stacked";
  className?: string;
}

/**
 * Imagotipo Oficial Integrado de Kanan Servicios de Limpieza
 * Cumple con el Manual Corporativo (Pág. 2):
 * - Ancho mínimo en barra superior web: 160px
 * - Área de protección respetada
 * - Versión Full Color (Azul Marino #1E3A5F y Cerúleo #2B7BB9) para fondo Blanco / Hielo
 * - Versión Monocromático Blanco Puro (#FFFFFF) para fondo Azul Marino Kanan
 */
export function KananLogo({
  variant = "color",
  layout = "horizontal",
  className = "",
}: KananLogoProps) {
  const isWhite = variant === "white";

  const primaryColor = isWhite ? "#FFFFFF" : "#1E3A5F";
  const secondaryColor = isWhite ? "#FFFFFF" : "#2B7BB9";
  const accentColor = isWhite ? "#FFFFFF" : "#00B4D8";

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
              : "/assets/brand/kanan-logo-fullcolor.jpg"
          }
          alt="Kanan Servicios de Limpieza — Imagotipo Oficial"
          className="h-20 w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 select-none py-1 ${className}`}
      style={{ minWidth: "165px" }}
      aria-label="Kanan Servicios de Limpieza"
    >
      {/* Glifo Prehispánico K Vectorial de Alta Precisión */}
      <svg
        viewBox="0 0 64 64"
        className="h-11 w-11 shrink-0"
        role="img"
        aria-hidden="true"
      >
        {/* 3 Aros superiores izquierdos (Agua / Bioseguridad) */}
        <circle
          cx="11.5"
          cy="9.5"
          r="4.2"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.8"
        />
        <circle
          cx="14.5"
          cy="18.5"
          r="3.6"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.6"
        />
        <circle
          cx="17"
          cy="26.2"
          r="2.8"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.4"
        />

        {/* Columna escalonada izquierda (Grecas Mayas) */}
        <path
          d="M14 31 H20 V58 H14 M14 35 H19 M14 40 H19 M14 45 H19 M14 50 H19 M14 55 H19"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Trapecio superior (Armadura de orden y equilibrio) */}
        <polygon points="16,5 40,5 37.5,11.5 18.5,11.5" fill={primaryColor} />
        <polygon points="19,13.5 25,13.5 25,21.5 21.5,21.5" fill={primaryColor} />
        <rect
          x="26.8"
          y="13.5"
          width="6.5"
          height="8"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
        />
        <polygon points="35,13.5 39,13.5 36.5,21.5 35,21.5" fill={primaryColor} />
        <rect x="21.5" y="23.2" width="14.5" height="2.6" fill={secondaryColor} />

        {/* Núcleo central y grecas inferiores */}
        <rect
          x="22"
          y="27.5"
          width="2.5"
          height="11"
          fill={secondaryColor}
        />
        <rect
          x="26.8"
          y="27.5"
          width="8"
          height="11"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.8"
        />
        <polygon
          points="26.8,41 34.8,41 38.5,51.5 26.8,51.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.8"
        />
        <rect
          x="22"
          y="53.5"
          width="17"
          height="4.5"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2.4"
        />

        {/* Brazo K Derecho (Cerúleo y Cian) */}
        <path
          d="M43 5 H52 L40.5 32.5 L52 58 H43 L33.5 32.5 Z"
          fill={secondaryColor}
        />
        <polygon points="45,14 50,14 44.5,27.5 39.5,27.5" fill={accentColor} />
      </svg>

      {/* Tipografía Oficial KANAN + Subtítulo */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-heading text-[22px] sm:text-[25px] font-extrabold tracking-[0.06em]"
          style={{ color: primaryColor }}
        >
          KANAN
        </span>
        <span
          className="font-body text-[9.5px] sm:text-[10.5px] font-semibold tracking-[0.14em] uppercase mt-0.5"
          style={{ color: isWhite ? "#00B4D8" : "#2B7BB9" }}
        >
          SERVICIOS DE LIMPIEZA
        </span>
      </div>
    </div>
  );
}
