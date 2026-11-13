"use client";

import React, { useEffect, useState } from "react";
import { Download, MessageCircle, CheckCircle2 } from "lucide-react";

interface PaseActionsClientProps {
  clientName: string;
  folio: string;
  serviceType: string;
  serviceDate: string;
  nextMaintenanceDate: string;
  isActive: boolean;
}

export function PaseActionsClient({
  clientName,
  folio,
  serviceType,
  serviceDate,
  nextMaintenanceDate,
  isActive,
}: PaseActionsClientProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setPlatform("ios");
    } else if (/Android/i.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }
  }, []);

  const handleDownloadPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 780;
    canvas.height = 1020;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo azul marino oscuro
    ctx.fillStyle = "#0B2239";
    ctx.fillRect(0, 0, 780, 1020);

    // Doble marco dorado
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 756, 996);

    ctx.strokeStyle = "rgba(255, 223, 115, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 732, 972);

    // Cabecera KANAN
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 48px sans-serif";
    ctx.fillText("KANAN", 56, 98);

    ctx.fillStyle = "#FFDF73";
    ctx.font = "700 18px sans-serif";
    ctx.fillText("SERVICIOS DE LIMPIEZA", 56, 128);

    // Franja turquesa
    ctx.fillStyle = "#00A8B5";
    ctx.fillRect(26, 165, 728, 56);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICADO DE SERVICIO Y GARANTÍA", 390, 200);
    ctx.textAlign = "left";

    // Datos
    const drawField = (label: string, value: string, x: number, y: number, color = "#FFFFFF") => {
      ctx.fillStyle = "#94A3B8";
      ctx.font = "700 16px sans-serif";
      ctx.fillText(label.toUpperCase(), x, y);
      ctx.fillStyle = color;
      ctx.font = "700 24px sans-serif";
      ctx.fillText(value, x, y + 32);
    };

    drawField("Cliente", clientName, 56, 275);
    drawField("Folio", folio, 430, 275, "#FFDF73");
    drawField("Servicio", serviceType, 56, 365, "#A5F3FC");
    drawField("Próximo mantenimiento", nextMaintenanceDate, 430, 365, "#6EE7B7");
    drawField("Fecha de servicio", serviceDate, 56, 455, "#E2E8F0");

    // Caja de recomendaciones
    ctx.fillStyle = "#071728";
    ctx.fillRect(56, 530, 668, 220);
    ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 530, 668, 220);

    ctx.fillStyle = "#FFDF73";
    ctx.font = "800 18px sans-serif";
    ctx.fillText("RECOMENDACIONES POST-SERVICIO", 84, 575);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "500 20px sans-serif";
    ctx.fillText("• Dejar ventilar 3-4 horas hasta secado completo", 84, 622);
    ctx.fillText("• No aplicar químicos caseros sobre manchas", 84, 662);
    ctx.fillText("• Agenda cada 6 meses para tu descuento frecuente", 84, 702);

    // Pie de tarjeta
    ctx.fillStyle = "#FFDF73";
    ctx.font = "800 22px sans-serif";
    ctx.fillText(isActive ? "✓ GARANTÍA ACTIVA" : "GARANTÍA VENCIDA", 56, 915);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 22px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("WhatsApp: 33 4335 9207", 724, 915);

    const link = document.createElement("a");
    const cleanFolio = folio.replace(/^#/, "");
    link.download = `certificado-${cleanFolio}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloaded(true);
  };

  const cleanFolio = folio.startsWith("#") ? folio : `#${folio}`;
  const whatsappText = encodeURIComponent(
    `Hola Kanan, tengo mi certificado ${cleanFolio} y quiero agendar mi mantenimiento de cliente frecuente.`
  );
  const whatsappUrl = `https://wa.me/523343359207?text=${whatsappText}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownloadPng}
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#165a91] hover:to-[#1D71B5] text-white px-6 py-3.5 rounded-xl font-heading font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>¡Certificado descargado!</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 shrink-0" />
              <span>
                {platform === "ios"
                  ? "Guardar Certificado en Fotos (PNG)"
                  : "Descargar Certificado (PNG)"}
              </span>
            </>
          )}
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-3.5 rounded-xl font-heading font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>Agendar Mantenimiento por WhatsApp</span>
        </a>
      </div>

      {platform === "ios" && (
        <p className="text-[11px] text-slate-500">
          Tip iPhone: También puedes tocar <strong>Compartir → Agregar a pantalla de inicio</strong> en Safari.
        </p>
      )}
    </div>
  );
}
