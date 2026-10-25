"use client";

import React, { useEffect, useState } from "react";

interface Bat {
  id: number;
  top: number; // Porcentaje vertical
  left: number; // Porcentaje horizontal
  size: number; // Pixeles
  duration: number; // Segundos de vuelo
  delay: number; // Segundos de retraso
  scale: number;
  direction: 1 | -1;
  opacity: number;
}

export function HalloweenBats() {
  const [bats, setBats] = useState<Bat[]>([]);

  useEffect(() => {
    // Generar murciélagos distribuidos suavemente en pantalla
    const batList: Bat[] = [
      { id: 1, top: 8, left: -5, size: 28, duration: 18, delay: 0, scale: 0.85, direction: 1, opacity: 0.45 },
      { id: 2, top: 16, left: 105, size: 36, duration: 22, delay: 3, scale: 1.1, direction: -1, opacity: 0.55 },
      { id: 3, top: 28, left: -8, size: 22, duration: 16, delay: 7, scale: 0.7, direction: 1, opacity: 0.35 },
      { id: 4, top: 42, left: 105, size: 32, duration: 24, delay: 2, scale: 0.95, direction: -1, opacity: 0.4 },
      { id: 5, top: 58, left: -6, size: 26, duration: 20, delay: 5, scale: 0.8, direction: 1, opacity: 0.35 },
      { id: 6, top: 72, left: 106, size: 38, duration: 26, delay: 9, scale: 1.15, direction: -1, opacity: 0.45 },
      { id: 7, top: 86, left: -7, size: 24, duration: 19, delay: 4, scale: 0.75, direction: 1, opacity: 0.35 },
      { id: 8, top: 22, left: -10, size: 42, duration: 28, delay: 11, scale: 1.25, direction: 1, opacity: 0.5 },
    ];
    setBats(batList);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-20"
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes flapWingLeft {
          0%, 100% {
            transform: scaleY(1) rotate(0deg);
          }
          50% {
            transform: scaleY(-0.35) rotate(-18deg);
          }
        }
        @keyframes flapWingRight {
          0%, 100% {
            transform: scaleY(1) rotate(0deg);
          }
          50% {
            transform: scaleY(-0.35) rotate(18deg);
          }
        }
        @keyframes flyRight {
          0% {
            transform: translateX(-10vw) translateY(0px);
          }
          25% {
            transform: translateX(25vw) translateY(-25px);
          }
          50% {
            transform: translateX(55vw) translateY(20px);
          }
          75% {
            transform: translateX(85vw) translateY(-15px);
          }
          100% {
            transform: translateX(115vw) translateY(10px);
          }
        }
        @keyframes flyLeft {
          0% {
            transform: translateX(10vw) translateY(0px) scaleX(-1);
          }
          25% {
            transform: translateX(-25vw) translateY(25px) scaleX(-1);
          }
          50% {
            transform: translateX(-55vw) translateY(-20px) scaleX(-1);
          }
          75% {
            transform: translateX(-85vw) translateY(15px) scaleX(-1);
          }
          100% {
            transform: translateX(-115vw) translateY(-10px) scaleX(-1);
          }
        }
      `}</style>

      {bats.map((bat) => {
        const animName = bat.direction === 1 ? "flyRight" : "flyLeft";
        return (
          <div
            key={bat.id}
            className="absolute will-change-transform"
            style={{
              top: `${bat.top}%`,
              left: `${bat.left}%`,
              opacity: bat.opacity,
              animation: `${animName} ${bat.duration}s linear infinite`,
              animationDelay: `${bat.delay}s`,
            }}
          >
            <svg
              width={bat.size}
              height={bat.size * 0.55}
              viewBox="0 0 100 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_4px_rgba(15,36,56,0.3)]"
            >
              {/* Cuerpo del murciélago */}
              <ellipse cx="50" cy="30" rx="6" ry="12" fill="#0F2438" />
              {/* Cabeza y orejas */}
              <circle cx="50" cy="20" r="5.5" fill="#0F2438" />
              <polygon points="46,18 44,12 48,16" fill="#0F2438" />
              <polygon points="54,18 56,12 52,16" fill="#0F2438" />
              {/* Ojos brillantes cian/amarillo sutil */}
              <circle cx="48" cy="19.5" r="0.9" fill="#00B4D8" />
              <circle cx="52" cy="19.5" r="0.9" fill="#00B4D8" />

              {/* Ala izquierda con aleteo animado */}
              <g
                style={{
                  transformOrigin: "47px 28px",
                  animation: "flapWingLeft 0.32s ease-in-out infinite alternate",
                }}
              >
                <path
                  d="M47 28 C38 12, 22 10, 5 18 C12 28, 20 32, 22 42 C28 36, 36 38, 47 34 Z"
                  fill="#1E3A5F"
                />
                <path
                  d="M47 28 C36 18, 24 16, 8 20 C14 26, 22 30, 24 38 C30 33, 38 34, 47 32 Z"
                  fill="#0F2438"
                />
              </g>

              {/* Ala derecha con aleteo animado */}
              <g
                style={{
                  transformOrigin: "53px 28px",
                  animation: "flapWingRight 0.32s ease-in-out infinite alternate",
                }}
              >
                <path
                  d="M53 28 C62 12, 78 10, 95 18 C88 28, 80 32, 78 42 C72 36, 64 38, 53 34 Z"
                  fill="#1E3A5F"
                />
                <path
                  d="M53 28 C64 18, 76 16, 92 20 C86 26, 78 30, 76 38 C70 33, 62 34, 53 32 Z"
                  fill="#0F2438"
                />
              </g>
            </svg>
          </div>
        );
      })}
    </div>
  );
}
