"use client";

import React, { useState, useEffect, useRef } from "react";
import { ServicioCita, Cliente, MetodoPago, FotoAntesDespues } from "@/types/crm";
import { KananLogo } from "@/components/brand/KananLogo";

interface CitaConCliente extends ServicioCita {
  cliente: Cliente | null;
}

export default function TecnicoPage() {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [pinAutenticado, setPinAutenticado] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datos de ruta de hoy
  const [citasHoy, setCitasHoy] = useState<CitaConCliente[]>([]);
  const [turnoActivo, setTurnoActivo] = useState<"matutino" | "vespertino">("matutino");

  // Estado del servicio seleccionado
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago>("Efectivo");
  const [fotoAntes, setFotoAntes] = useState<string | null>(null);
  const [fotoDespues, setFotoDespues] = useState<string | null>(null);

  // Canvas de firma táctil
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignatureDrawn, setHasSignatureDrawn] = useState(false);

  // Cargar datos
  const cargarRuta = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tecnico");
      if (res.status === 401) {
        setPinAutenticado(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setPinAutenticado(true);
        setCitasHoy(data.citas || []);
        // Si hay citas vespertinas y no matutinas, preseleccionar vespertino
        const mat = (data.citas || []).find((c: CitaConCliente) => c.turno.includes("Matutino"));
        if (!mat && (data.citas || []).some((c: CitaConCliente) => c.turno.includes("Vespertino"))) {
          setTurnoActivo("vespertino");
        }
      } else {
        setPinAutenticado(false);
      }
    } catch {
      setPinAutenticado(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detección estricta de dispositivo móvil (pantalla táctil o ancho móvil)
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobileDevice(isMobileUA || (isSmallScreen && isTouch));
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    cargarRuta();

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Cita actual según el turno seleccionado
  const citaActual = citasHoy.find((c) =>
    turnoActivo === "matutino"
      ? c.turno.includes("Matutino")
      : c.turno.includes("Vespertino")
  ) || citasHoy[0] || null;

  // Sincronizar método de pago y fotos cuando cambia la cita actual
  useEffect(() => {
    if (citaActual) {
      setMetodoPagoSeleccionado(citaActual.metodo_pago || "Efectivo");
      if (citaActual.fotos_antes_despues && citaActual.fotos_antes_despues.length > 0) {
        setFotoAntes(citaActual.fotos_antes_despues[0].antesUrl);
        setFotoDespues(citaActual.fotos_antes_despues[0].despuesUrl);
      } else {
        setFotoAntes(null);
        setFotoDespues(null);
      }
      limpiarFirma();
    }
  }, [citaActual?.id]);

  // Validar PIN de acceso técnico
  const handleVerificarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    try {
      const res = await fetch("/api/tecnico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_PIN", pin: pinInput }),
      });
      const data = await res.json();
      if (data.ok) {
        setPinAutenticado(true);
        cargarRuta();
      } else {
        setPinError(data.error || "PIN incorrecto");
      }
    } catch {
      setPinError("Error de conexión al validar PIN");
    }
  };

  // Acciones de Navegación y Contacto
  const abrirGoogleMaps = () => {
    if (!citaActual || !citaActual.cliente) return;
    const query = encodeURIComponent(
      `${citaActual.cliente.direccion}, ${citaActual.cliente.municipio}, Jalisco`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const contactarWhatsApp = () => {
    if (!citaActual || !citaActual.cliente) return;
    const telefono = citaActual.cliente.whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hola ${citaActual.cliente.nombre}, te saludo de Kanan Limpieza Especializada. Voy en camino a tu domicilio.`
    );
    window.open(`https://wa.me/52${telefono}?text=${msg}`, "_blank");
  };

  // Manejo de Fotos desde la Cámara
  const handleCapturaFoto = (tipo: "antes" | "despues", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (tipo === "antes") setFotoAntes(base64);
      else setFotoDespues(base64);
    };
    reader.readAsDataURL(file);
  };

  // Canvas Táctil de Firma
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1D71B5";
    setIsDrawing(true);
    setHasSignatureDrawn(true);
  };

  const moveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureDrawn(false);
  };

  // Finalizar y Enviar Servicio
  const handleFinalizarServicio = async () => {
    if (!citaActual) return;
    setSaving(true);
    try {
      let firmaDataUrl: string | undefined = citaActual.firma_conformidad;
      if (canvasRef.current && hasSignatureDrawn) {
        firmaDataUrl = canvasRef.current.toDataURL("image/png");
      }

      const fotosActualizadas: FotoAntesDespues[] = [];
      if (fotoAntes || fotoDespues) {
        fotosActualizadas.push({
          antesUrl: fotoAntes || "/assets/services/hero-fresh.jpg",
          despuesUrl: fotoDespues || "/assets/services/hero-fresh.jpg",
          descripcion: `Evidencia técnica móvil - ${new Date().toLocaleDateString("es-MX")}`,
        });
      }

      const res = await fetch("/api/tecnico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citaId: citaActual.id,
          estatus: "Completada",
          metodo_pago: metodoPagoSeleccionado,
          firma_conformidad: firmaDataUrl,
          fotos_antes_despues: fotosActualizadas.length > 0 ? fotosActualizadas : undefined,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("✅ ¡Servicio finalizado con éxito! Datos registrados en el sistema.");
        cargarRuta();
      } else {
        alert("Error al finalizar servicio: " + (data.error || "Intenta nuevamente"));
      }
    } catch {
      alert("Error de conexión al enviar servicio.");
    } finally {
      setSaving(false);
    }
  };

  // PANTALLA 1: LOADING
  if (loading || isMobileDevice === null) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#355581] to-[#1D71B5] text-white flex items-center justify-center font-bold text-xl animate-pulse">
          🚐
        </div>
        <p className="mt-4 text-xs font-heading font-extrabold text-[#355581]">
          Cargando ruta de campo Kanan...
        </p>
      </div>
    );
  }

  // PANTALLA BLOQUEADA: SOLO DISPOSITIVOS MÓVILES (NO PC/WEB DE ESCRITORIO)
  if (!isMobileDevice) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center p-4 selection:bg-[#36A6DE]/20">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-[2.5rem] p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1D71B5] flex items-center justify-center text-3xl mx-auto border border-blue-200">
            📱
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-black text-xl text-[#355581] tracking-tight">
              Vista Exclusiva para Celular
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Esta herramienta está diseñada únicamente para uso táctil del técnico en ruta desde su smartphone.
            </p>
          </div>

          <div className="p-4 bg-[#F4F7F9] rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 text-left">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>💡</span> Para ingresar:
            </p>
            <p className="text-[11px] text-slate-500">
              Abre este enlace directamente desde el navegador de tu celular:
            </p>
            <p className="font-mono font-bold text-[#1D71B5] bg-white p-2 rounded-xl border border-slate-200 text-center break-all">
              admin.kananlimpieza.mx/tecnico
            </p>
          </div>

          <p className="text-[11px] text-slate-400">
            Si eres administrador, ingresa desde el panel de control en tu computadora.
          </p>
        </div>
      </div>
    );
  }

  // PANTALLA 2: INGRESO DE PIN RÁPIDO CON LOGO DE KANAN
  if (pinAutenticado === false) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center p-4 selection:bg-[#36A6DE]/20">
        <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-center space-y-6">
          {/* Logo Oficial de Kanan */}
          <div className="flex justify-center pt-2">
            <KananLogo variant="color" layout="stacked" size="sm" />
          </div>

          <div className="space-y-1">
            <h1 className="font-heading font-black text-base text-[#355581] tracking-tight uppercase">
              Ruta Operativa de Campo
            </h1>
            <p className="text-xs text-slate-500 font-medium">Ingresa el PIN de tu unidad móvil</p>
          </div>

          <form onSubmit={handleVerificarPin} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • •"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center text-3xl tracking-[0.5em] font-heading font-extrabold py-3 bg-[#F4F7F9] border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D71B5]"
                required
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-600 font-bold">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] active:scale-[0.98] text-white rounded-2xl font-heading font-bold text-xs tracking-wider uppercase transition shadow-md"
            >
              Iniciar Turno
            </button>
          </form>

          <p className="text-[11px] text-slate-400">Acceso exclusivo para el personal operativo Kanan</p>
        </div>
      </div>
    );
  }

  // PANTALLA 3: VISTA OPERATIVA COMPLETA DEL TÉCNICO
  const fechaTexto = new Date().toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex justify-center p-2 sm:p-4 selection:bg-[#36A6DE]/20">
      <div className="w-full max-w-md bg-[#F4F7F9] border border-slate-200/90 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative my-auto">

        {/* BARRA SUPERIOR DE ESTADO OPERATIVO */}
        <div className="bg-gradient-to-r from-[#355581] to-[#1D71B5] text-white p-5 pt-6 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
                🚐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-sm tracking-wide">KANAN MÓVIL</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#36A6DE]/30 text-cyan-100 border border-white/20">
                    1 UNIDAD
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium">Ruta de Hoy ({fechaTexto}) · ZMG</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white">
              <span className={`w-2 h-2 rounded-full ${citaActual?.estatus === "Completada" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}></span>
              <span>{citaActual?.estatus || "En Ruta"}</span>
            </div>
          </div>
        </div>

        {/* SELECTOR DE PARADAS DEL DÍA */}
        <div className="px-4 py-3 bg-white border-b border-slate-200/80">
          <div className="bg-[#F4F7F9] p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-slate-200">
            <button
              onClick={() => setTurnoActivo("matutino")}
              className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs transition-all flex flex-col items-center ${
                turnoActivo === "matutino"
                  ? "bg-[#1D71B5] text-white shadow-sm"
                  : "bg-white text-slate-500 hover:text-[#355581]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>☀️</span>
                <span>Parada 1 (Mañana)</span>
              </span>
              <span className={`text-[11px] font-normal font-sans mt-0.5 ${turnoActivo === "matutino" ? "opacity-90" : "text-slate-400"}`}>
                09:00 - 13:00
              </span>
            </button>

            <button
              onClick={() => setTurnoActivo("vespertino")}
              className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs transition-all flex flex-col items-center ${
                turnoActivo === "vespertino"
                  ? "bg-[#1D71B5] text-white shadow-sm"
                  : "bg-white text-slate-500 hover:text-[#355581]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>🌤️</span>
                <span>Parada 2 (Tarde)</span>
              </span>
              <span className={`text-[11px] font-normal font-sans mt-0.5 ${turnoActivo === "vespertino" ? "opacity-90" : "text-slate-400"}`}>
                14:00 - 18:00
              </span>
            </button>
          </div>
        </div>

        {/* CUERPO DEL SERVICIO SELECCIONADO */}
        {citaActual ? (
          <div className="p-4 space-y-4 overflow-y-auto max-h-[640px]">

            {/* TARJETA 1: CLIENTE Y UBICACIÓN */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                    Cliente Asignado
                  </span>
                  <h2 className="font-heading font-extrabold text-base text-slate-900 leading-snug">
                    {citaActual.cliente?.nombre || "Cliente sin nombre"}
                  </h2>
                </div>
                {citaActual.cliente?.mascotas && (
                  <span className="text-[11px] font-heading font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    🐾 Con Mascotas
                  </span>
                )}
              </div>

              <div className="bg-[#F4F7F9] rounded-2xl p-3.5 border border-slate-200/80 space-y-1 text-xs">
                <p className="font-bold text-[#1D71B5] flex items-center gap-1.5">
                  <span>📍</span>
                  <span>Dirección exacta:</span>
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {citaActual.cliente?.direccion || "Sin dirección registrada"}
                </p>
                <p className="text-slate-500">
                  {citaActual.cliente?.municipio} {citaActual.cliente?.codigo_postal ? `· CP ${citaActual.cliente.codigo_postal}` : ""}
                </p>
              </div>

              {/* Botones de acción directa para usar con el pulgar */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={abrirGoogleMaps}
                  className="w-full py-3 px-3 bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] text-white rounded-2xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#1D71B5]/20 active:scale-[0.98] transition"
                >
                  <span className="text-base">🗺️</span>
                  <span>Abrir Maps / Waze</span>
                </button>

                <button
                  type="button"
                  onClick={contactarWhatsApp}
                  className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition"
                >
                  <span className="text-base">📞</span>
                  <span>Llamar / WhatsApp</span>
                </button>
              </div>
            </div>

            {/* TARJETA 2: ALERTA DE CASETA Y COTO */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-4 space-y-2.5 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-heading font-extrabold text-amber-950">
                <span className="text-base">🛡️</span>
                <span>Instrucciones de Caseta / Acceso al Coto</span>
              </div>

              <p className="text-amber-900 leading-relaxed font-medium">
                {citaActual.instrucciones_acceso || "Sin notas específicas de acceso al coto. Registrar nombre en caseta si aplica."}
              </p>

              <div className="flex items-center gap-4 pt-2 border-t border-amber-200/70 font-heading font-bold text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span>💧</span> Agua: <span className="text-emerald-700">{citaActual.cuenta_con_agua_y_luz !== false ? "Garantizada" : "Verificar"}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span>⚡</span> Luz: <span className="text-emerald-700">{citaActual.cuenta_con_agua_y_luz !== false ? "Garantizada" : "Verificar"}</span>
                </span>
              </div>
            </div>

            {/* TARJETA 3: SERVICIOS Y ESPECIFICACIONES DE TELA */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                  🛋️ Detalle del Trabajo
                </span>
                <span className="text-xs font-bold text-[#1D71B5] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Lavado In Situ
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-[#F4F7F9] border border-slate-200/80">
                  <p className="font-heading font-extrabold text-slate-800 text-xs sm:text-sm">
                    {citaActual.items_contratados.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ") || "Limpieza y desinfección general"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">🧵 Tipo de Tela</span>
                    <strong className="font-bold text-slate-800 mt-0.5 block">
                      {citaActual.tipo_tela || "No especificada"}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">⚠️ Manchas Críticas</span>
                    <strong className="font-bold text-amber-700 mt-0.5 block truncate">
                      {citaActual.manchas_dificiles?.join(", ") || "Ninguna reportada"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* TARJETA 4: CIERRE EN SITIO (COBRO, CÁMARA Y FIRMA) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                  💰 Cobro y Liquidación
                </span>
                <span className="font-heading font-black text-lg text-emerald-600">
                  {citaActual.monto_total ? `$${citaActual.monto_total.toLocaleString("es-MX")} MXN` : "Por cotizar"}
                </span>
              </div>

              {/* Selector de Método de Pago */}
              <div className="grid grid-cols-3 gap-2 text-xs font-heading font-bold">
                {(["Efectivo", "Transferencia SPEI", "Tarjeta / Terminal"] as MetodoPago[]).map((metodo) => {
                  const selected = metodoPagoSeleccionado === metodo;
                  const label = metodo === "Transferencia SPEI" ? "📱 SPEI" : metodo === "Tarjeta / Terminal" ? "💳 Terminal" : "💵 Efectivo";
                  return (
                    <button
                      key={metodo}
                      type="button"
                      onClick={() => setMetodoPagoSeleccionado(metodo)}
                      className={`py-2.5 rounded-xl transition font-heading font-bold text-xs ${
                        selected
                          ? "border border-[#1D71B5] bg-[#1D71B5]/10 text-[#1D71B5]"
                          : "border border-slate-200 bg-[#F4F7F9] text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Evidencia Fotográfica con la Cámara del Celular */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-slate-800 flex items-center gap-1.5">
                    <span>📸</span> Evidencia Fotográfica
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Cámara del celular</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#1D71B5] rounded-2xl p-3 text-center cursor-pointer bg-[#F4F7F9] transition flex flex-col items-center justify-center gap-1 relative overflow-hidden">
                    {fotoAntes ? (
                      <img src={fotoAntes} alt="Antes" className="w-full h-16 object-cover rounded-xl" />
                    ) : (
                      <>
                        <span className="text-2xl">📷</span>
                        <span className="text-xs font-heading font-bold text-slate-700">Foto ANTES</span>
                        <span className="text-[10px] text-slate-400">Tomar foto</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleCapturaFoto("antes", e)}
                    />
                  </label>

                  <label className="border-2 border-dashed border-slate-200 hover:border-[#1D71B5] rounded-2xl p-3 text-center cursor-pointer bg-[#F4F7F9] transition flex flex-col items-center justify-center gap-1 relative overflow-hidden">
                    {fotoDespues ? (
                      <img src={fotoDespues} alt="Después" className="w-full h-16 object-cover rounded-xl" />
                    ) : (
                      <>
                        <span className="text-2xl">✨</span>
                        <span className="text-xs font-heading font-bold text-slate-700">Foto DESPUÉS</span>
                        <span className="text-[10px] text-slate-400">Tomar foto</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleCapturaFoto("despues", e)}
                    />
                  </label>
                </div>
              </div>

              {/* Pad Táctil de Firma de Conformidad con ✍️ */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-slate-800 flex items-center gap-1.5">
                    <span>✍️</span> Firma de Conformidad del Cliente:
                  </span>
                  {!citaActual.firma_conformidad && (
                    <button
                      type="button"
                      onClick={limpiarFirma}
                      className="text-xs font-bold text-slate-400 hover:text-rose-500 transition"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {citaActual.firma_conformidad ? (
                  <div className="bg-[#F4F7F9] p-3 rounded-2xl border border-slate-200 text-center space-y-1">
                    <img
                      src={citaActual.firma_conformidad}
                      alt="Firma del cliente"
                      className="max-h-20 mx-auto object-contain"
                    />
                    <p className="text-[10px] text-emerald-700 font-bold">
                      ✓ Firma registrada con éxito
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#F4F7F9] border-2 border-dashed border-slate-300 rounded-2xl relative overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={120}
                      className="w-full cursor-crosshair rounded-2xl touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={moveDraw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw}
                      onTouchMove={moveDraw}
                      onTouchEnd={stopDraw}
                    />
                    {!hasSignatureDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 font-medium">
                        El cliente firma aquí con el dedo
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Gigante de Finalizar con ✅ */}
              {citaActual.estatus !== "Completada" ? (
                <button
                  type="button"
                  onClick={handleFinalizarServicio}
                  disabled={saving}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-heading font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{saving ? "⏳" : "✅"}</span>
                  <span>{saving ? "Guardando en el sistema..." : "Finalizar Servicio y Enviar"}</span>
                </button>
              ) : (
                <div className="w-full py-3 bg-emerald-50 text-emerald-800 rounded-2xl font-heading font-extrabold text-xs text-center border border-emerald-200">
                  ✓ Este servicio ya fue completado y liquidado
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-8 text-center space-y-3 my-auto">
            <span className="text-4xl block">☀️</span>
            <h3 className="font-heading font-extrabold text-slate-800 text-sm">
              Sin citas asignadas en este turno
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              No hay citas programadas para el turno {turnoActivo === "matutino" ? "de la mañana" : "de la tarde"} de hoy.
            </p>
          </div>
        )}

        {/* PIE DISCRETO */}
        <div className="p-3 bg-white border-t border-slate-200 text-center">
          <p className="text-[11px] font-heading font-bold text-[#355581]/60">
            Kanan Limpieza Especializada · Guadalajara, Jalisco
          </p>
        </div>

      </div>
    </div>
  );
}
