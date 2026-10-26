import crypto from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

export interface AdminUser {
  email: string;
  passwordHash: string;
  salt: string;
  mfaSecret: string;
  mfaConfigured: boolean;
  mustChangePassword: boolean;
  lastLogin?: string;
}

// Clave secreta para firmar tokens de sesión
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "kanan_enterprise_secure_session_secret_2026_xyz";

// Estructura de Rate Limiting
interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

/**
 * Hashing seguro con sal usando scrypt
 */
export async function hashPassword(password: string, customSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = customSalt || crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({ hash: derivedKey.toString("hex"), salt });
    });
  });
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
      const hashBuffer = Buffer.from(hash, "hex");
      if (keyBuffer.length !== hashBuffer.length) {
        return resolve(false);
      }
      resolve(crypto.timingSafeEqual(keyBuffer, hashBuffer));
    });
  });
}

/**
 * Control de Intentos Fallidos (Rate Limiting)
 */
export function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    return { allowed: true, remainingAttempts: 5 };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  if (record.blockedUntil && record.blockedUntil <= now) {
    loginAttempts.delete(key);
    return { allowed: true, remainingAttempts: 5 };
  }

  const remaining = Math.max(0, 5 - record.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

export function registerFailedAttempt(key: string): { remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.blockedUntil = now + 15 * 60 * 1000; // 15 minutos de bloqueo
    loginAttempts.set(key, record);
    return { remainingAttempts: 0, retryAfterSec: 15 * 60 };
  }

  loginAttempts.set(key, record);
  return { remainingAttempts: 5 - record.attempts };
}

export function resetRateLimit(key: string): void {
  loginAttempts.delete(key);
}

/**
 * 2FA con TOTP (Google Authenticator / Apps compatibles)
 */
export function generateMfaSecret(): string {
  return generateSecret();
}

export async function generateMfaQrCode(email: string, secret: string): Promise<{ qrDataUrl: string; otpauthUrl: string }> {
  const otpauth = generateURI({ issuer: "Kanan Servicios", label: email, secret });
  const qrDataUrl = await QRCode.toDataURL(otpauth);
  return { qrDataUrl, otpauthUrl: otpauth };
}

export function verifyMfaToken(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token, secret });
    return Boolean(result && (result as any).valid === true);
  } catch {
    return false;
  }
}

/**
 * Tokens de Sesión Firmados HMAC-SHA256
 */
export interface SessionPayload {
  email: string;
  mfaVerified: boolean;
  mustChangePassword: boolean;
  rememberMe: boolean;
  exp: number;
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">, rememberMe: boolean): string {
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 30 días o 8 horas
  const fullPayload: SessionPayload = {
    ...payload,
    rememberMe,
    exp: Date.now() + durationMs,
  };
  const jsonStr = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(jsonStr).digest("base64url");
  return `${jsonStr}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [jsonStr, signature] = token.split(".");
    if (!jsonStr || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(jsonStr).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(jsonStr, "base64url").toString("utf-8")) as SessionPayload;
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
