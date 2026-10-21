import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F2438",
};

export const metadata: Metadata = {
  title: "Kanan Servicios de Limpieza | Limpieza y Desinfección Profunda a Domicilio en GDL",
  description:
    "Protegemos lo que más tocas. Limpieza y desinfección profunda de salas, colchones, vestiduras y tapetes a domicilio en Guadalajara, Zapopan, Tlajomulco y Tlaquepaque. 100% Pet-Friendly y secado en 3-4 horas.",
  keywords: [
    "limpieza de salas guadalajara",
    "lavado de colchones zapopan",
    "limpieza de vestiduras a domicilio",
    "lavado de tapetes guadalajara",
    "desinfeccion profunda pet friendly",
    "kanan servicios de limpieza",
  ],
  openGraph: {
    title: "Kanan Servicios de Limpieza | Protegemos lo que más tocas",
    description:
      "Limpieza y desinfección profunda a domicilio en Guadalajara, Zapopan y ZMG. Secado rápido en 3-4 horas, 100% Pet-Friendly y garantía por escrito.",
    url: "https://servicioskanan.com",
    siteName: "Kanan Servicios de Limpieza",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-kanan-deep antialiased selection:bg-kanan-cyan/20 selection:text-kanan-deep">
        {children}
      </body>
    </html>
  );
}
