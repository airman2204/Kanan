import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kanan: {
          // Paleta Oficial Kanan 60 - 30 - 10
          principal: "#355581",   // 60% Principal (RGB 53, 85, 129)
          secundario: "#1D71B5",  // 30% Secundario (RGB 28, 113, 181)
          acento: "#36A6DE",      // 10% Acento (RGB 54, 166, 222)

          // Mapeo semántico para coherencia en componentes existentes
          deep: "#355581",        // Azul Principal Oficial
          navy: "#355581",        // Azul Principal Oficial
          cerulean: "#1D71B5",    // Azul Secundario Oficial
          cyan: "#36A6DE",        // Azul Acento Oficial
          ice: "#F4F7F9",         // Gris Hielo (Fondos UI / Tarjetas)
          white: "#FFFFFF",       // Blanco Puro
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        kanan: "0 12px 32px -8px rgba(53, 85, 129, 0.12)",
        "kanan-lg": "0 20px 48px -12px rgba(53, 85, 129, 0.18)",
        "cyan-glow": "0 8px 24px -4px rgba(54, 166, 222, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
