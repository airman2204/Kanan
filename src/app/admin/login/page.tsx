"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, KeyRound, Check } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  // Paso actual: "credentials" | "mfa" | "changePassword"
  const [step, setStep] = useState<"credentials" | "mfa" | "changePassword">("credentials");

  // Credenciales
  const [email, setEmail] = useState("magc2204@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 2FA
  const [mfaToken, setMfaToken] = useState("");
  const [mfaPendingToken, setMfaPendingToken] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaConfigured, setMfaConfigured] = useState(false);

  // Cambio de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Enviar credenciales
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al iniciar sesión.");
      }

      setMfaPendingToken(data.mfaPendingToken);
      setMfaConfigured(Boolean(data.mfaConfigured));
      if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
      if (data.mfaSecret) setMfaSecret(data.mfaSecret);

      setStep("mfa");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verificar 2FA (TOTP)
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaToken, mfaPendingToken }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Código de verificación inválido.");
      }

      if (data.mustChangePassword) {
        setStep("changePassword");
      } else {
        router.push("/admin");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Cambio forzoso de contraseña
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña.");
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1624] via-[#1a2d48] to-[#0d2238] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Elementos ambientales de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1D71B5]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#36A6DE]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#36A6DE_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Tarjeta Glassmorphic de Alta Fidelidad */}
      <div className="w-full max-w-[460px] relative z-10 bg-white/95 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_40px_rgba(54,166,222,0.15)] p-7 sm:p-10 space-y-7 transition-all">
        
        {/* Logotipo en tamaño prominente con insignia y relieve */}
        <div className="flex flex-col items-center">
          <div className="relative group p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50/80 border border-slate-100 shadow-[0_8px_24px_rgba(53,85,129,0.08)] flex items-center justify-center">
            <img
              src="/assets/brand/kanan-logo-oficial.png"
              alt="Kanan"
              className="h-28 sm:h-32 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Único Título Solicitado: Administrador de negocio */}
        <h1 className="font-heading text-2xl sm:text-[26px] font-extrabold text-[#355581] text-center tracking-tight">
          Administrador de negocio
        </h1>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* PASO 1: CREDENCIALES */}
        {step === "credentials" && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-heading font-bold text-[#355581]">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium text-[#1e293b] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1D71B5] focus:ring-4 focus:ring-[#36A6DE]/15 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-heading font-bold text-[#355581]">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-medium text-[#1e293b] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1D71B5] focus:ring-4 focus:ring-[#36A6DE]/15 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#355581] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1D71B5] focus:ring-[#36A6DE] border-slate-300"
                />
                <span className="text-xs font-medium text-slate-600">
                  Mantener sesión iniciada
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] text-white font-heading font-bold text-sm rounded-2xl transition-all shadow-[0_10px_20px_rgba(29,113,181,0.25)] hover:shadow-[0_12px_24px_rgba(29,113,181,0.35)] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        )}

        {/* PASO 2: AUTENTICACIÓN EN 2 PASOS (2FA / TOTP) */}
        {step === "mfa" && (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            {!mfaConfigured && qrDataUrl && (
              <div className="flex flex-col items-center space-y-3 p-4 bg-[#F4F7F9] rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-heading font-bold text-[#355581]">
                  Escanear en App Autenticadora
                </span>
                <img src={qrDataUrl} alt="QR 2FA" className="w-44 h-44 rounded-xl border border-white shadow-sm" />
                {mfaSecret && (
                  <code className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg text-slate-600 border border-slate-200 select-all">
                    {mfaSecret}
                  </code>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="mfa-token" className="block text-xs font-heading font-bold text-[#355581]">
                Código de verificación (6 dígitos)
              </label>
              <div className="relative">
                <input
                  id="mfa-token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="000000"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.3em] font-mono text-xl py-3 bg-[#F4F7F9] border border-slate-200 rounded-xl font-bold text-[#355581] focus:outline-none focus:ring-2 focus:ring-[#36A6DE]"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mfaToken.length < 6}
              className="w-full py-3.5 px-4 bg-[#355581] hover:bg-[#1D71B5] text-white font-heading font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Comprobando..." : "Verificar"}
            </button>
          </form>
        )}

        {/* PASO 3: CAMBIO FORZOSO DE CONTRASEÑA */}
        {step === "changePassword" && (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-xs font-heading font-bold text-[#355581]">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-[#F4F7F9] border border-slate-200 rounded-xl text-sm font-medium text-[#355581] focus:outline-none focus:ring-2 focus:ring-[#36A6DE]"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#355581] p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-xs font-heading font-bold text-[#355581]">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#F4F7F9] border border-slate-200 rounded-xl text-sm font-medium text-[#355581] focus:outline-none focus:ring-2 focus:ring-[#36A6DE]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full py-3.5 px-4 bg-[#1D71B5] hover:bg-[#355581] text-white font-heading font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Guardando..." : "Actualizar contraseña y entrar"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
