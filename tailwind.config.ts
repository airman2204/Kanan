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
          deep: "#0F2438",      // Azul Marino Profundo (Brief)
          navy: "#1E3A5F",      // Azul Marino Corporativo (Manual de Marca)
          cerulean: "#2B7BB9",  // Azul Cerúleo (Isotipo)
          cyan: "#00B4D8",      // Cian Fresco (CTA / Acentos)
          ice: "#F4F7F9",       // Gris Hielo (Fondos UI / Tarjetas)
          white: "#FFFFFF",     // Blanco Puro
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        kanan: "0 12px 32px -8px rgba(15, 36, 56, 0.12)",
        "kanan-lg": "0 20px 48px -12px rgba(15, 36, 56, 0.18)",
        "cyan-glow": "0 8px 24px -4px rgba(0, 180, 216, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
