import fs from "fs";
import os from "os";
import path from "path";
import { AdminUser, hashPassword, generateMfaSecret } from "./security";

const LOCAL_USER_FILE = path.join(process.cwd(), "src", "data", "admin-user.json");
const TMP_USER_FILE = path.join(os.tmpdir(), "admin-user.json");

let inMemoryUser: AdminUser | null = null;

export async function getAdminUser(): Promise<AdminUser> {
  // 1. Revisar si ya existe en /tmp (Vercel)
  if (fs.existsSync(TMP_USER_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_USER_FILE, "utf-8");
      inMemoryUser = JSON.parse(raw);
      return inMemoryUser!;
    } catch {
      // continuar
    }
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

  if (inMemoryUser) {
    return inMemoryUser;
  }

  // Inicializar usuario predeterminado con credenciales seguras
  const { hash, salt } = await hashPassword("Kanan2026!Admin");
  const defaultUser: AdminUser = {
    email: "magc2204@gmail.com",
    passwordHash: hash,
    salt,
    mfaSecret: generateMfaSecret(),
    mfaConfigured: false,
    mustChangePassword: true,
  };

  await saveAdminUser(defaultUser);
  return defaultUser;
}

export async function saveAdminUser(user: AdminUser): Promise<void> {
  inMemoryUser = user;
  const payload = JSON.stringify(user, null, 2);

  try {
    const dir = path.dirname(LOCAL_USER_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_USER_FILE, payload, "utf-8");
  } catch {
    // Entorno read-only
  }

  try {
    fs.writeFileSync(TMP_USER_FILE, payload, "utf-8");
  } catch {
    // Continuar en memoria
  }
}
