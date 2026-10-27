import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TrackingScripts } from "@/components/seo/TrackingScripts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#355581",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kananlimpieza.mx"),
  title: {
    default: "Kanan Servicios de Limpieza | Limpieza y Desinfección Profunda en Guadalajara",
    template: "%s | Kanan Servicios de Limpieza",
  },
  description:
    "Protegemos lo que más tocas. Limpieza y desinfección profunda de salas, colchones, vestiduras y tapetes a domicilio en Guadalajara, Zapopan, Tlajomulco y Tlaquepaque. 100% Pet-Friendly y secado en 3-4 horas.",
  keywords: [
    "limpieza de salas guadalajara",
    "lavado de salas zapopan",
    "lavado de colchones zapopan",
    "limpieza de vestiduras a domicilio guadalajara",
    "lavado de tapetes guadalajara",
    "desinfeccion profunda pet friendly",
    "limpieza de tapiceria zmg",
    "kanan servicios de limpieza",
  ],
  authors: [{ name: "Kanan Limpieza Especializada" }],
  creator: "Kanan Limpieza",
  publisher: "Kanan Limpieza",
  alternates: {
    canonical: "https://kananlimpieza.mx",
  },
  openGraph: {
    title: "Kanan Servicios de Limpieza | Protegemos lo que más tocas",
    description:
      "Limpieza y desinfección profunda a domicilio en Guadalajara, Zapopan y ZMG. Secado rápido en 3-4 horas, 100% Pet-Friendly y garantía por escrito.",
    url: "https://kananlimpieza.mx",
    siteName: "Kanan Servicios de Limpieza",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/assets/brand/kanan-logo-fullcolor.jpg",
        width: 1200,
        height: 630,
        alt: "Kanan Servicios de Limpieza Profesional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanan Servicios de Limpieza",
    description: "Limpieza y desinfección profunda a domicilio en Guadalajara y Zapopan.",
    images: ["/assets/brand/kanan-logo-fullcolor.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Datos Estructurados (Schema.org) para Negocio Local de Limpieza en ZMG
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Kanan Servicios de Limpieza",
  image: "https://kananlimpieza.mx/assets/brand/kanan-logo-fullcolor.jpg",
  "@id": "https://kananlimpieza.mx/#organization",
  url: "https://kananlimpieza.mx",
  telephone: "+523312345678",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Guadalajara",
    addressRegion: "Jalisco",
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 20.676667,
    longitude: -103.347222,
  },
  areaServed: [
    { "@type": "City", name: "Guadalajara" },
    { "@type": "City", name: "Zapopan" },
    { "@type": "City", name: "Tlajomulco de Zúñiga" },
    { "@type": "City", name: "San Pedro Tlaquepaque" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Limpieza Especializada",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Limpieza y Desinfección de Salas",
          description: "Limpieza profunda de salas seccionales y sillones con inyección-succión.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Lavado y Desinfección de Colchones",
          description: "Eliminación de ácaros, fluidos y bacterias con secado rápido.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Limpieza de Tapetes y Alfombras",
          description: "Lavado especializado en fibras sintéticas y lana.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Limpieza de Vestiduras Automotrices",
          description: "Detallado interior y desinfección de asientos de autos.",
        },
      },
    ],
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
        {/* Schema.org JSON-LD para Google Search & Maps */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-kanan-deep antialiased selection:bg-kanan-cyan/20 selection:text-kanan-deep">
        <TrackingScripts />
        {children}
      </body>
    </html>
  );
}
