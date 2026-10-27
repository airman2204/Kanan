"use client";

import Script from "next/script";

// Identificadores de medición (pueden ser definidos por variables de entorno o props)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function TrackingScripts() {
  return (
    <>
      {/* GOOGLE TAG (Analytics 4 + Google Ads) */}
      {(GA_MEASUREMENT_ID || GOOGLE_ADS_ID) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID || GOOGLE_ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-tags" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });` : ""}
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
            `}
          </Script>
        </>
      )}

      {/* META PIXEL (Facebook & Instagram) */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

// Función auxiliar para registrar conversiones de WhatsApp / Cotizador
export function trackConversion(evento: "cotizacion_iniciada" | "whatsapp_click" | "cita_agendada", data?: Record<string, any>) {
  if (typeof window === "undefined") return;

  // Track en Google Analytics / Ads
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", evento, {
      event_category: "Conversion",
      event_label: data?.label || "Interaccion Cliente",
      value: data?.value || 0,
      currency: "MXN",
    });
  }

  // Track en Meta Pixel
  if (typeof (window as any).fbq === "function") {
    if (evento === "whatsapp_click" || evento === "cotizacion_iniciada") {
      (window as any).fbq("track", "Lead", {
        content_name: data?.label || "Contacto WhatsApp",
        value: data?.value || 0,
        currency: "MXN",
      });
    } else if (evento === "cita_agendada") {
      (window as any).fbq("track", "Schedule", {
        value: data?.value || 0,
        currency: "MXN",
      });
    }
  }
}
