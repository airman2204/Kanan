import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para generar un archivo .pkpass de Apple Wallet.
 * Requiere instalar `passkit-generator` y configurar las variables de entorno:
 * - APPLE_PASS_TYPE_ID (ej. pass.mx.kananlimpieza.garantia)
 * - APPLE_TEAM_ID
 * - APPLE_WWDR_CERT_PEM
 * - APPLE_SIGNER_CERT_PEM
 * - APPLE_SIGNER_KEY_PEM
 * - APPLE_SIGNER_KEY_PASSPHRASE (opcional)
 */
export async function GET(req: NextRequest) {
  const folio = req.nextUrl.searchParams.get("folio") || "KAN-9821";

  const hasCerts =
    process.env.APPLE_PASS_TYPE_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_SIGNER_CERT_PEM &&
    process.env.APPLE_SIGNER_KEY_PEM;

  if (!hasCerts) {
    return NextResponse.json(
      {
        ok: false,
        folio,
        message:
          "Apple Wallet aún no está configurado en el servidor. Agrega APPLE_PASS_TYPE_ID, APPLE_TEAM_ID, APPLE_WWDR_CERT_PEM, APPLE_SIGNER_CERT_PEM y APPLE_SIGNER_KEY_PEM en .env.local.",
      },
      { status: 501 }
    );
  }

  // Aquí se instancia PKPass de `passkit-generator` con los datos del folio
  // y se devuelve el buffer con Content-Type: application/vnd.apple.pkpass
  return NextResponse.json(
    {
      ok: true,
      folio,
      message: "Listo para generar .pkpass con passkit-generator.",
    },
    { status: 200 }
  );
}
