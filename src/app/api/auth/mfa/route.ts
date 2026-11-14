import { NextRequest, NextResponse } from "next/server";
import {
  verifyMfaToken,
  verifySessionToken,
  createSessionToken,
} from "@/lib/auth/security";
import { getAdminUser, saveAdminUser } from "@/lib/auth/adminStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, mfaPendingToken } = body;

    if (!token || !mfaPendingToken) {
      return NextResponse.json({ ok: false, error: "Datos de autenticación incompletos." }, { status: 400 });
    }

    const pendingSession = verifySessionToken(mfaPendingToken);
    if (!pendingSession) {
      return NextResponse.json({ ok: false, error: "La sesión de verificación ha expirado. Inicia sesión nuevamente." }, { status: 401 });
    }

    const admin = await getAdminUser(pendingSession.email);
    const cleanToken = token.toString().replace(/\s+/g, "");

    const isValidToken = verifyMfaToken(cleanToken, admin.mfaSecret);
    if (!isValidToken) {
      return NextResponse.json({ ok: false, error: "Código de autenticación inválido o expirado." }, { status: 401 });
    }

    // Si era la primera vez, marcar 2FA como configurado
    if (!admin.mfaConfigured) {
      admin.mfaConfigured = true;
      admin.lastLogin = new Date().toISOString();
      await saveAdminUser(admin);
    }

    // Crear sesión autenticada completa persistente (por defecto 30 días para evitar cierres inesperados)
    const remember = pendingSession.rememberMe !== false;
    const finalSessionToken = createSessionToken(
      {
        email: admin.email,
        mfaVerified: true,
        mustChangePassword: admin.mustChangePassword,
        rememberMe: remember,
      },
      remember
    );

    const response = NextResponse.json({
      ok: true,
      mustChangePassword: admin.mustChangePassword,
    });

    const maxAgeSec = 30 * 24 * 60 * 60; // 30 días garantizados

    response.cookies.set({
      name: "kanan_admin_session",
      value: finalSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Lax previene pérdida de cookies al navegar o refrescar
      path: "/",
      maxAge: maxAgeSec,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
