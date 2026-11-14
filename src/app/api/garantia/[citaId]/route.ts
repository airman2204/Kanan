import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAsync } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ citaId: string }> }
) {
  try {
    const { citaId } = await params;
    const db = await getDatabaseAsync();
    const cita = db.servicios_citas.find((c) => c.id === citaId) || db.servicios_citas[0];
    const cliente = cita ? db.clientes.find((cl) => cl.id === cita.cliente_id) : null;

    const nombreCliente = cliente?.nombre || "Cliente Distinguido";
    const folio = cita?.id || "KAN-1001";
    const fechaServicio = cita?.fecha || new Date().toISOString().split("T")[0];
    const tieneMascotas = cliente?.mascotas || false;

    // Calcular próxima fecha (+3 meses con mascotas, +6 meses sin mascotas)
    const parts = fechaServicio.split("-");
    let d = new Date();
    if (parts.length === 3) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    const mesesExtra = tieneMascotas ? 3 : 6;
    d.setMonth(d.getMonth() + mesesExtra);

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const proxFechaTexto = `${meses[d.getMonth()]} ${d.getFullYear()}`;

    const piezasTexto = (cita?.items_contratados || [])
      .map((it) => `${it.cantidad}x ${it.piezaNombre}`)
      .join(", ") || "Limpieza y Desinfección Profunda";

    // Generar SVG de alta resolución listo para tarjeta digital y descarga
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480" style="width: 100%; height: auto; display: block;">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0E2841" />
          <stop offset="60%" stop-color="#1D71B5" />
          <stop offset="100%" stop-color="#36A6DE" />
        </linearGradient>
        <linearGradient id="cardBadge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#FBBF24" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.35"/>
        </filter>
      </defs>

      <!-- Fondo Premium con Bordes Curvos -->
      <rect width="800" height="480" rx="36" fill="url(#bgGrad)" />

      <!-- Patrón de ondas Kanan sutil -->
      <path d="M 0,340 C 240,280 480,440 800,320 L 800,480 L 0,480 Z" fill="#ffffff" fill-opacity="0.06" />
      <path d="M 0,260 C 260,380 520,220 800,310 L 800,480 L 0,480 Z" fill="#ffffff" fill-opacity="0.04" />

      <!-- Cabecera -->
      <g transform="translate(50, 48)">
        <text font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="1.5">KANAN</text>
        <text x="125" y="-1" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="14" fill="#67E8F9" letter-spacing="0.5">SERVICIOS DE LIMPIEZA</text>
        <text y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="12" fill="#BAE6FD">Certificado Digital de Garantía y Lealtad</text>
      </g>

      <!-- Badge de Garantía Activa -->
      <g transform="translate(560, 42)">
        <rect width="190" height="36" rx="18" fill="url(#cardBadge)" filter="url(#shadow)" />
        <text x="95" y="23" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="12" fill="#78350F" text-anchor="middle" letter-spacing="0.5">✓ GARANTÍA ACTIVA</text>
      </g>

      <!-- Titular del Servicio -->
      <g transform="translate(50, 150)">
        <text font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="#BAE6FD" letter-spacing="1">TITULAR DEL SERVICIO</text>
        <text y="32" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" fill="#FFFFFF">${nombreCliente.slice(0, 36)}</text>
      </g>

      <!-- Datos Clave: Folio, Servicio, Fechas -->
      <g transform="translate(50, 240)">
        <!-- Folio -->
        <g>
          <text font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="#BAE6FD" letter-spacing="0.5">FOLIO DE ATENCIÓN</text>
          <text y="28" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" fill="#FDE047">${folio}</text>
        </g>

        <!-- Servicio -->
        <g transform="translate(230, 0)">
          <text font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="#BAE6FD" letter-spacing="0.5">TRATAMIENTO APLICADO</text>
          <text y="28" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" fill="#FFFFFF">${piezasTexto.slice(0, 34)}</text>
        </g>
      </g>

      <g transform="translate(50, 330)">
        <!-- Fecha de Atención -->
        <g>
          <text font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="#BAE6FD" letter-spacing="0.5">FECHA DE SERVICIO</text>
          <text y="26" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">${fechaServicio}</text>
        </g>

        <!-- Próximo Mantenimiento Recomendado -->
        <g transform="translate(230, 0)">
          <text font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="#67E8F9" letter-spacing="0.5">PRÓXIMO SERVICIO SUGERIDO</text>
          <text y="26" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#38BDF8">${proxFechaTexto} ${tieneMascotas ? "(Ciclo 3m Mascotas 🐾)" : "(Semestral 6m ✨)"}</text>
        </g>
      </g>

      <!-- Pie de Tarjeta con Sello -->
      <line x1="50" y1="410" x2="750" y2="410" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1" />
      <g transform="translate(50, 442)">
        <text font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="11" fill="#E0F2FE">15% de Descuento Especial en tu siguiente servicio programado presentando este folio</text>
        <text x="700" y="0" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" fill="#67E8F9" text-anchor="end">kananlimpieza.mx</text>
      </g>
    </svg>
    `;

    // Si piden imagen directa SVG
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("image/svg") || req.nextUrl.searchParams.get("format") === "svg") {
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Página interactiva para el cliente con botón de Añadir a Wallet y Guardar Imagen
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Tarjeta de Garantía y Beneficios Kanan - ${folio}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-cyan-500/20">
      <div class="w-full max-w-lg space-y-5 text-center">
        <div class="space-y-1">
          <span class="text-xs uppercase font-bold text-cyan-400 tracking-wider">Membresía & Garantía Oficial</span>
          <h1 class="text-2xl font-black text-white">Tu Tarjeta Digital Kanan</h1>
          <p class="text-xs text-slate-400">Válida para tu garantía de satisfacción y beneficios exclusivos.</p>
        </div>

        <!-- Render de Tarjeta -->
        <div class="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
          ${svg}
        </div>

        <!-- Botones de Acción -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <a
            href="/api/garantia/${folio}?format=svg"
            download="Kanan-Garantia-${folio}.svg"
            class="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition active:scale-95"
          >
            <span>📥</span>
            <span>Guardar Imagen</span>
          </a>

          <button
            onclick="alert('📱 Para agregar a tu Wallet: Guarda la tarjeta en tus fotos o mantén presionada la imagen para añadirla a tus pases.')"
            class="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <span>📲</span>
            <span>Añadir a Wallet</span>
          </button>
        </div>

        <p class="text-[11px] text-slate-500">
          Kanan Servicios de Limpieza · Guadalajara, Jalisco · WhatsApp: 33 4335 9207
        </p>
      </div>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
