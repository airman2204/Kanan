import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { KananPassCard } from "@/components/brand/KananPassCard";
import { PaseActionsClient } from "@/components/brand/PaseActionsClient";

export const dynamic = "force-dynamic";

interface PasePageProps {
  params: Promise<{ folio: string }>;
}

async function getPassByFolio(folio: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const cleanFolio = decodeURIComponent(folio).replace(/^#/, "");

  const { data } = await supabase
    .from("citas")
    .select("id, nombre_cliente, servicio, fecha, created_at")
    .or(`id.eq.${cleanFolio},folio.eq.${cleanFolio}`)
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const serviceDateObj = data.fecha
    ? new Date(data.fecha)
    : data.created_at
    ? new Date(data.created_at)
    : new Date();

  const nextDateObj = new Date(serviceDateObj);
  nextDateObj.setMonth(nextDateObj.getMonth() + 6);

  const formatMonthYear = (d: Date) =>
    d.toLocaleDateString("es-MX", { month: "short", year: "numeric" });

  const formatFullDate = (d: Date) =>
    d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return {
    clientName: data.nombre_cliente || "Cliente Kanan",
    folio: `#${cleanFolio}`,
    serviceType: data.servicio || "Lavado Profundo por Inyección-Succión",
    serviceDate: formatFullDate(serviceDateObj),
    nextMaintenanceDate: formatMonthYear(nextDateObj),
    isActive: true,
  };
}

export default async function PaseDigitalPage({ params }: PasePageProps) {
  const { folio } = await params;
  const passData = await getPassByFolio(folio);

  const displayData = passData ?? {
    clientName: "Cliente Kanan",
    folio: `#${decodeURIComponent(folio).replace(/^#/, "")}`,
    serviceType: "Lavado de Sala y Desinfección",
    serviceDate: "Servicio concluido",
    nextMaintenanceDate: "En 6 meses",
    isActive: true,
  };

  const encodedFolio = encodeURIComponent(displayData.folio.replace(/^#/, ""));

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0F7FB] via-white to-[#E8F4FA] py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-6 text-center">
        <div className="space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white border border-cyan-200 text-xs font-heading font-bold text-[#1D71B5] shadow-xs">
            Pase Digital Oficial Kanan
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0B2239]">
            Tu Garantía y Beneficios
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Guarda este certificado en la Wallet de tu teléfono para tener tu folio siempre a la mano.
          </p>
        </div>

        <KananPassCard
          clientName={displayData.clientName}
          folio={displayData.folio}
          serviceType={displayData.serviceType}
          serviceDate={displayData.serviceDate}
          nextMaintenanceDate={displayData.nextMaintenanceDate}
          isActive={displayData.isActive}
        />

        <PaseActionsClient
          clientName={displayData.clientName}
          folio={displayData.folio}
          serviceType={displayData.serviceType}
          serviceDate={displayData.serviceDate}
          nextMaintenanceDate={displayData.nextMaintenanceDate}
          isActive={displayData.isActive}
        />

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1D71B5]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Kanan Limpieza</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
