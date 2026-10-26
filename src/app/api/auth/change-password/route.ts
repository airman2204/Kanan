import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  hashPassword,
  createSessionToken,
} from "@/lib/auth/security";
import { getAdminUser, saveAdminUser } from "@/lib/auth/adminStore";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("kanan_admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
    }

    const session = verifySessionToken(sessionCookie);
    if (!session || !session.mfaVerified) {
      return NextResponse.json({ ok: false, error: "Sesión inválida o no verificada con 2FA." }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }

    const admin = await getAdminUser();
    const { hash, salt } = await hashPassword(newPassword);

    admin.passwordHash = hash;
    admin.salt = salt;
    admin.mustChangePassword = false;
    await saveAdminUser(admin);

    // Actualizar token de sesión sin bandera de cambio forzoso
    const refreshedToken = createSessionToken(
      {
        email: admin.email,
        mfaVerified: true,
        mustChangePassword: false,
        rememberMe: session.rememberMe,
      },
      session.rememberMe
    );

    const maxAgeSec = session.rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: "kanan_admin_session",
      value: refreshedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: maxAgeSec,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
