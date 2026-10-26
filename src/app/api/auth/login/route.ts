import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  registerFailedAttempt,
  resetRateLimit,
  verifyPassword,
  generateMfaQrCode,
  createSessionToken,
} from "@/lib/auth/security";
import { getAdminUser, saveAdminUser } from "@/lib/auth/adminStore";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Credenciales incompletas." }, { status: 400 });
    }

    const rateKey = `${ip}_${email.trim().toLowerCase()}`;
    const rateCheck = checkRateLimit(rateKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Demasiados intentos fallidos. Acceso bloqueado temporalmente por ${rateCheck.retryAfterSec} segundos.`,
          retryAfterSec: rateCheck.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const admin = await getAdminUser();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== admin.email.toLowerCase()) {
      const { remainingAttempts, retryAfterSec } = registerFailedAttempt(rateKey);
      return NextResponse.json(
        {
          ok: false,
          error: "Credenciales incorrectas.",
          remainingAttempts,
          retryAfterSec,
        },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, admin.passwordHash, admin.salt);
    if (!isValidPassword) {
      const { remainingAttempts, retryAfterSec } = registerFailedAttempt(rateKey);
      return NextResponse.json(
        {
          ok: false,
          error: "Credenciales incorrectas.",
          remainingAttempts,
          retryAfterSec,
        },
        { status: 401 }
      );
    }

    // Credenciales correctas: Reiniciar contador de intentos fallidos
    resetRateLimit(rateKey);

    // Si aún no ha configurado 2FA, generar QR para la app autenticadora
    let qrDataUrl = "";
    let otpauthUrl = "";
    if (!admin.mfaConfigured) {
      const qrRes = await generateMfaQrCode(admin.email, admin.mfaSecret);
      qrDataUrl = qrRes.qrDataUrl;
      otpauthUrl = qrRes.otpauthUrl;
    }

    // Token provisional para el paso 2FA (expira en 5 minutos)
    const mfaPendingToken = createSessionToken(
      {
        email: admin.email,
        mfaVerified: false,
        mustChangePassword: admin.mustChangePassword,
        rememberMe: Boolean(rememberMe),
      },
      false
    );

    return NextResponse.json({
      ok: true,
      requiresMfa: true,
      mfaConfigured: admin.mfaConfigured,
      mfaSecret: !admin.mfaConfigured ? admin.mfaSecret : undefined,
      qrDataUrl: qrDataUrl || undefined,
      mfaPendingToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
