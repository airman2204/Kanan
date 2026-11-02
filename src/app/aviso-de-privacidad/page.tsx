import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";
import { KANAN_PHONE_CALL, KANAN_WHATSAPP_NUMBER } from "@/lib/whatsapp/templates";

export const metadata = {
  title: "Aviso de Privacidad Integral | Kanan Servicios de Limpieza",
  description:
    "Aviso de privacidad integral de Kanan Servicios de Limpieza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).",
};

export default function AvisoPrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Cabecera */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-kanan-cerulean hover:text-kanan-deep transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
          <KananLogo variant="color" size="sm" />
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kanan-ice border border-kanan-cyan/30 text-xs font-heading font-bold text-kanan-cerulean">
            <Shield className="w-3.5 h-3.5 text-kanan-cyan" />
            <span>Conforme a la LFPDPPP</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-kanan-deep tracking-tight">
            Aviso de Privacidad Integral
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Última actualización: Noviembre de 2026 • Kanan Servicios de Limpieza
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
          
          {/* Identidad del Responsable */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              1. Identidad y Domicilio del Responsable
            </h2>
            <p>
              <strong>Kanan Servicios de Limpieza</strong> (en lo sucesivo, &ldquo;<strong>KANAN</strong>&rdquo;), con domicilio de operación en la zona metropolitana de Guadalajara, Jalisco, México, es el responsable del uso, tratamiento y protección de sus datos personales, en estricto cumplimiento de lo dispuesto por la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em> y su Reglamento.
            </p>
          </section>

          {/* Datos Personales que Recabamos */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              2. Datos Personales que Recabamos
            </h2>
            <p>
              Para llevar a cabo las finalidades descritas en el presente aviso, KANAN recaba las siguientes categorías de datos personales mediante nuestro sitio web, cotizador interactivo o mensajería de WhatsApp:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, número de teléfono móvil / WhatsApp y correo electrónico (opcional).</li>
              <li><strong>Datos de Ubicación para Servicio a Domicilio:</strong> Código postal, municipio, colonia, calle, número exterior e interior, así como referencias de acceso o coto privado.</li>
              <li><strong>Datos del Servicio Técnico:</strong> Fotografías del estado actual de sus muebles (opcionales), tipo de tejido, presencia de mascotas y notas sobre manchas específicas.</li>
            </ul>
            <p className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong>Nota sobre datos sensibles:</strong> KANAN no recaba ni solicita datos personales considerados como sensibles por la ley, tales como datos financieros bancarios o datos de salud personal en este portal.
            </p>
          </section>

          {/* Finalidades del Tratamiento */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              3. Finalidades del Tratamiento de Datos
            </h2>
            <p>Sus datos personales son utilizados para las siguientes finalidades primarias y necesarias:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-kanan-ice border border-slate-200 space-y-1">
                <strong className="text-kanan-deep block">Finalidades Primarias:</strong>
                <p>• Elaborar su cotización formal personalizada.</p>
                <p>• Coordinar y confirmar la visita técnica a su domicilio.</p>
                <p>• Validar cobertura operativa en Jalisco.</p>
                <p>• Proporcionar garantía de satisfacción y seguimiento pos-servicio.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-kanan-ice border border-slate-200 space-y-1">
                <strong className="text-kanan-deep block">Finalidades Secundarias (Opcionales):</strong>
                <p>• Envío de recordatorio preventivo de mantenimiento sugerido.</p>
                <p>• Encuestas de satisfacción y evaluación de calidad del técnico.</p>
                <p>• Emisión de su Tarjeta de Garantía y Pase Digital.</p>
              </div>
            </div>
          </section>

          {/* Transferencia de Datos */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              4. Transferencia de Datos a Terceros
            </h2>
            <p>
              KANAN <strong>no vende, no alquila y no transfiere</strong> sus datos personales a terceros con fines comerciales ni publicitarios ajenos. Sus datos son tratados exclusivamente por el personal técnico debidamente identificado y acreditado de KANAN para el estricto cumplimiento del servicio solicitado.
            </p>
          </section>

          {/* Derechos ARCO */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              5. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los usamos y las condiciones de su uso (Acceso). Asimismo, es su derecho solicitar la corrección de su información (Rectificación), que la eliminemos de nuestros registros (Cancelación), o bien oponerse al uso de sus datos para fines específicos (Oposición).
            </p>
            <p>
              Para ejercer cualquiera de sus derechos ARCO, puede enviar su solicitud directa a nuestro canal oficial:
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-1">
              <p>• <strong>Correo electrónico de privacidad:</strong> contacto@kananlimpieza.mx</p>
              <p>• <strong>WhatsApp de atención:</strong> 33 4335 9207</p>
              <p>• <strong>Teléfono directo:</strong> 33 4016 0684</p>
            </div>
          </section>

          {/* Medidas de Seguridad */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              6. Seguridad de la Información
            </h2>
            <p>
              Contamos con medidas de seguridad administrativas, técnicas y físicas con cifrado SSL/TLS de 256 bits para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
            </p>
          </section>

          {/* Modificaciones al Aviso */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-kanan-deep flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan" />
              7. Cambios al Presente Aviso de Privacidad
            </h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de requerimientos legales o de nuestras propias prácticas operativas. Dichos cambios estarán siempre disponibles para su consulta pública en esta misma dirección: <code>https://kananlimpieza.mx/aviso-de-privacidad</code>.
            </p>
          </section>

        </div>

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-cyan-glow transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aceptar y Continuar en Kanan Limpieza</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
