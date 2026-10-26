import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/security";
import { getAdminUser } from "@/lib/auth/adminStore";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("kanan_admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const session = verifySessionToken(sessionCookie);
    if (!session || !session.mfaVerified) {
      return NextResponse.json({ authenticated: false });
    }

    const admin = await getAdminUser();

    return NextResponse.json({
      authenticated: true,
      email: admin.email,
      mustChangePassword: admin.mustChangePassword,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(req: NextRequest) {
  // Logout
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("kanan_admin_session");
  return response;
}
