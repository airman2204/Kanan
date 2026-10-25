"use client";

import React from "react";

interface PapelItem {
  color: string;
  pattern: "calavera" | "glifo" | "murcielago" | "perrito";
  animDelay: string;
}

export function PapelPicado() {
  const flags: PapelItem[] = [
    { color: "#FF7518", pattern: "calavera", animDelay: "0s" },       // Naranja cempasúchil tradicional
    { color: "#00B4D8", pattern: "glifo", animDelay: "0.2s" },         // Cian Fresco Kanan
    { color: "#9B51E0", pattern: "murcielago", animDelay: "0.4s" },    // Morado Halloween
    { color: "#2B7BB9", pattern: "perrito", animDelay: "0.1s" },       // Azul Cerúleo Kanan (Kanan Dog)
    { color: "#FF8C00", pattern: "calavera", animDelay: "0.5s" },
    { color: "#00B4D8", pattern: "glifo", animDelay: "0.3s" },
    { color: "#E056FD", pattern: "murcielago", animDelay: "0.6s" },
    { color: "#1E3A5F", pattern: "perrito", animDelay: "0.15s" },      // Azul Marino Kanan
    { color: "#FF7518", pattern: "calavera", animDelay: "0.45s" },
    { color: "#00B4D8", pattern: "glifo", animDelay: "0.25s" },
    { color: "#9B51E0", pattern: "murcielago", animDelay: "0.35s" },
    { color: "#2B7BB9", pattern: "perrito", animDelay: "0.05s" },
  ];

  return (
    <div
      className="w-full overflow-hidden pointer-events-none select-none relative z-30"
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes swayFlag {
          0%, 100% {
            transform: rotate(-1.8deg) translateY(0px);
          }
          50% {
            transform: rotate(2.2deg) translateY(-2px);
          }
        }
        .papel-flag {
          transform-origin: top center;
          animation: swayFlag 3.2s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Cuerda / Hilo superior que sostiene el papel picado */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-400 via-kanan-cyan to-purple-500 opacity-70 shadow-sm" />

      {/* Tira de banderines de Papel Picado */}
      <div className="flex justify-between items-start w-full -mt-0.5 px-1 sm:px-2">
        {flags.map((flag, idx) => (
          <div
            key={idx}
            className="papel-flag flex-1 max-w-[90px] mx-[1.5px] sm:mx-1 drop-shadow-md transition-transform"
            style={{ animationDelay: flag.animDelay }}
          >
            <svg
              viewBox="0 0 100 135"
              className="w-full h-auto"
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}
            >
              {/* Cuerpo del papel picado con flecos inferiores triangulares */}
              <path
                d="M 5 0 
                   L 95 0 
                   L 95 110 
                   L 85 125 L 75 110 L 65 125 L 50 110 L 35 125 L 25 110 L 15 125 L 5 110 
                   Z"
                fill={flag.color}
              />

              {/* Perforaciones decorativas en los bordes (Típico del papel picado mexicano) */}
              {/* Filas de círculos perforados superiores */}
              <circle cx="20" cy="15" r="3.5" fill="#FFFFFF" opacity="0.95" />
              <circle cx="35" cy="15" r="3.5" fill="#FFFFFF" opacity="0.95" />
              <circle cx="50" cy="15" r="4" fill="#FFFFFF" opacity="0.95" />
              <circle cx="65" cy="15" r="3.5" fill="#FFFFFF" opacity="0.95" />
              <circle cx="80" cy="15" r="3.5" fill="#FFFFFF" opacity="0.95" />

              {/* Grecas y rombos laterales calados */}
              <polygon points="12,30 16,36 12,42 8,36" fill="#FFFFFF" opacity="0.95" />
              <polygon points="88,30 92,36 88,42 84,36" fill="#FFFFFF" opacity="0.95" />
              <polygon points="12,55 16,61 12,67 8,61" fill="#FFFFFF" opacity="0.95" />
              <polygon points="88,55 92,61 88,67 84,61" fill="#FFFFFF" opacity="0.95" />
              <polygon points="12,80 16,86 12,92 8,86" fill="#FFFFFF" opacity="0.95" />
              <polygon points="88,80 92,86 88,92 84,86" fill="#FFFFFF" opacity="0.95" />

              {/* Patrones calados centrales según temática */}
              {flag.pattern === "calavera" && (
                <g fill="#FFFFFF" opacity="0.95">
                  {/* Calaverita de azúcar calada */}
                  <circle cx="50" cy="50" r="15" />
                  <rect x="42" y="60" width="16" height="10" rx="3" />
                  {/* Ojos y nariz huecos (del color de la bandera) */}
                  <circle cx="44" cy="48" r="4" fill={flag.color} />
                  <circle cx="56" cy="48" r="4" fill={flag.color} />
                  <polygon points="50,54 48,59 52,59" fill={flag.color} />
                  {/* Dientes */}
                  <line x1="46" y1="65" x2="46" y2="70" stroke={flag.color} strokeWidth="1.5" />
                  <line x1="50" y1="65" x2="50" y2="70" stroke={flag.color} strokeWidth="1.5" />
                  <line x1="54" y1="65" x2="54" y2="70" stroke={flag.color} strokeWidth="1.5" />
                  {/* Flor de cempasúchil en la frente */}
                  <circle cx="50" cy="39" r="2.5" fill={flag.color} />
                </g>
              )}

              {flag.pattern === "glifo" && (
                <g fill="#FFFFFF" opacity="0.95">
                  {/* Glifo K Maya Kanan calado */}
                  <rect x="36" y="38" width="8" height="34" rx="2" />
                  <polygon points="46,38 64,38 52,54 46,54" />
                  <polygon points="51,54 65,72 55,72 46,59" />
                  <circle cx="50" cy="84" r="3.5" />
                  <circle cx="38" cy="84" r="3.5" />
                  <circle cx="62" cy="84" r="3.5" />
                </g>
              )}

              {flag.pattern === "murcielago" && (
                <g fill="#FFFFFF" opacity="0.95">
                  {/* Murciélago calado */}
                  <ellipse cx="50" cy="56" rx="5" ry="9" />
                  <circle cx="50" cy="47" r="4" />
                  <polygon points="47,45 45,40 48,43" />
                  <polygon points="53,45 55,40 52,43" />
                  <path d="M48 54 C40 42, 28 40, 20 46 C24 53, 30 56, 32 63 C36 59, 42 60, 48 58 Z" />
                  <path d="M52 54 C60 42, 72 40, 80 46 C76 53, 70 56, 68 63 C64 59, 58 60, 52 58 Z" />
                  <circle cx="40" cy="76" r="3" />
                  <circle cx="50" cy="82" r="3.5" />
                  <circle cx="60" cy="76" r="3" />
                </g>
              )}

              {flag.pattern === "perrito" && (
                <g fill="#FFFFFF" opacity="0.95">
                  {/* Huellita Pet-Friendly Kanan Dog calada */}
                  <ellipse cx="50" cy="62" rx="9" ry="7.5" />
                  <circle cx="37" cy="50" r="3.5" />
                  <circle cx="45" cy="44" r="3.5" />
                  <circle cx="55" cy="44" r="3.5" />
                  <circle cx="63" cy="50" r="3.5" />
                  <polygon points="36,78 40,84 36,90 32,84" />
                  <polygon points="64,78 68,84 64,90 60,84" />
                  <circle cx="50" cy="84" r="3" />
                </g>
              )}

              {/* Cenefa calada inferior */}
              <circle cx="30" cy="100" r="2.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="40" cy="100" r="2.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="50" cy="100" r="3" fill="#FFFFFF" opacity="0.9" />
              <circle cx="60" cy="100" r="2.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="70" cy="100" r="2.5" fill="#FFFFFF" opacity="0.9" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
