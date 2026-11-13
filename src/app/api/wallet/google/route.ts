import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para generar el enlace JWT firmado de Google Wallet (https://pay.google.com/gp/v/save/<jwt>).
 * Requiere configurar las variables de entorno:
 * - GOOGLE_WALLET_ISSUER_ID
 * - GOOGLE_WALLET_CLASS_ID (ej. kanan_garantia_v1)
 * - GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_WALLET_PRIVATE_KEY
 */
export async function GET(req: NextRequest) {
  const folio = req.nextUrl.searchParams.get("folio") || "KAN-9821";

  const hasConfig =
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_PRIVATE_KEY;

  if (!hasConfig) {
    return NextResponse.json(
      {
        ok: false,
        folio,
        message:
          "Google Wallet aún no está configurado en el servidor. Agrega GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_CLASS_ID, GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL y GOOGLE_WALLET_PRIVATE_KEY en .env.local.",
      },
      { status: 501 }
    );
  }

  // Aquí se firma el JWT RS256 con la cuenta de servicio de Google Cloud
  // y se redirige a `https://pay.google.com/gp/v/save/${signedJwt}`
  return NextResponse.json(
    {
      ok: true,
      folio,
      message: "Listo para firmar JWT de Google Wallet.",
    },
    { status: 200 }
  );
}
