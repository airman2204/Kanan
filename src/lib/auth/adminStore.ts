import fs from "fs";
import os from "os";
import path from "path";
import { AdminUser, hashPassword, generateMfaSecret } from "./security";
import { supabase } from "@/lib/supabase";

const LOCAL_USER_FILE = path.join(process.cwd(), "src", "data", "admin-user.json");
const TMP_USER_FILE = path.join(os.tmpdir(), "admin-user.json");

let inMemoryUser: AdminUser | null = null;

export async function getAdminUser(): Promise<AdminUser> {
  // 1. Intentar consultar Supabase
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "magc2204@gmail.com")
      .single();

    if (!error && data) {
      const user: AdminUser = {
        email: data.email,
        passwordHash: data.password_hash,
        salt: data.salt,
        mfaSecret: data.mfa_secret,
        mfaConfigured: Boolean(data.mfa_configured),
        mustChangePassword: Boolean(data.must_change_password),
      };
      inMemoryUser = user;
      return user;
    }
  } catch {
    // Si la tabla no está creada aún, caer a archivo local / tmp
  }

  // 2. Revisar si existe en local
  if (fs.existsSync(LOCAL_USER_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_USER_FILE, "utf-8");
      inMemoryUser = JSON.parse(raw);
      return inMemoryUser!;
    } catch {
      // continuar
    }
  }

  // 3. Revisar si ya existe en /tmp
  if (fs.existsSync(TMP_USER_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_USER_FILE, "utf-8");
      inMemoryUser = JSON.parse(raw);
      return inMemoryUser!;
    } catch {
      // continuar
    }
  }

  if (inMemoryUser) {
    return inMemoryUser;
  }

  // Inicializar usuario predeterminado con credenciales seguras
  const { hash, salt } = await hashPassword("Magc140689@");
  const defaultUser: AdminUser = {
    email: "magc2204@gmail.com",
    passwordHash: hash,
    salt,
    mfaSecret: generateMfaSecret(),
    mfaConfigured: false,
    mustChangePassword: false,
  };

  await saveAdminUser(defaultUser);
  return defaultUser;
}

export async function saveAdminUser(user: AdminUser): Promise<void> {
  inMemoryUser = user;
  const payload = JSON.stringify(user, null, 2);

  // 1. Guardar en Supabase si está disponible
  try {
    await supabase.from("admin_users").upsert(
      {
        email: user.email,
        password_hash: user.passwordHash,
        salt: user.salt,
        mfa_secret: user.mfaSecret,
        mfa_configured: user.mfaConfigured,
        must_change_password: user.mustChangePassword,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
  } catch {
    // Fallback a archivos
  }

  // 2. Guardar en local
  try {
    const dir = path.dirname(LOCAL_USER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_USER_FILE, payload, "utf-8");
  } catch {
    // Entorno read-only
  }

  // 3. Guardar en /tmp
  try {
    fs.writeFileSync(TMP_USER_FILE, payload, "utf-8");
  } catch {
    // Continuar en memoria
  }
}
