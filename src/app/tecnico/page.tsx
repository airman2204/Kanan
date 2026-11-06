"use client";

import React, { useState, useEffect, useRef } from "react";
import { ServicioCita, Cliente, MetodoPago, FotoAntesDespues } from "@/types/crm";
import { KananLogo } from "@/components/brand/KananLogo";
import { soundEngine } from "@/lib/audio/soundEffects";

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

  // Datos de ruta de hoy con persistencia ante refrescos
  const [citasHoy, setCitasHoy] = useState<CitaConCliente[]>([]);
  const [citaSeleccionadaId, setCitaSeleccionadaId] = useState<string | null>(null);
  const [turnoActivo, setTurnoActivoState] = useState<"matutino" | "vespertino">("matutino");
  const prevCitasCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanan_tecnico_turno");
      if (saved === "matutino" || saved === "vespertino") {
        setTurnoActivoState(saved);
      }
    }
  }, []);

  const setTurnoActivo = (t: "matutino" | "vespertino") => {
    setTurnoActivoState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("kanan_tecnico_turno", t);
    }
  };

  // Estado del servicio seleccionado
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago>("Efectivo");
  const [fotoAntes, setFotoAntes] = useState<string | null>(null);
  const [fotoDespues, setFotoDespues] = useState<string | null>(null);

  // Estados de cronómetro y estimación de ruta
  const [tiempoEstimadoLlegada, setTiempoEstimadoLlegada] = useState("20 a 25 minutos");
  const [segundosCronometro, setSegundosCronometro] = useState(0);

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
        const fetchedCitas = data.citas || [];
        // Si hay una nueva cita asignada en tiempo real mientras el técnico tiene la app abierta
        if (prevCitasCountRef.current !== null && fetchedCitas.length > prevCitasCountRef.current) {
          soundEngine.playNewBookingSound();
        }
        prevCitasCountRef.current = fetchedCitas.length;
        setCitasHoy(fetchedCitas);

        // Si hay citas vespertinas y no matutinas, preseleccionar vespertino
        const mat = fetchedCitas.find((c: CitaConCliente) => c.turno.includes("Matutino"));
        if (!mat && fetchedCitas.some((c: CitaConCliente) => c.turno.includes("Vespertino"))) {
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

  // Cita actual según la selección del técnico o el turno activo
  const citaActual = (citaSeleccionadaId ? citasHoy.find((c) => c.id === citaSeleccionadaId) : null) || citasHoy.find((c) =>
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
    const coords = citaActual.coordenadas || citaActual.cliente.coordenadas;
    if (coords && coords.lat && coords.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
        "_blank"
      );
    } else {
      const query = encodeURIComponent(
        `${citaActual.cliente.direccion}, ${citaActual.cliente.municipio}, Jalisco`
      );
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank");
    }
  };

  const abrirWaze = () => {
    if (!citaActual || !citaActual.cliente) return;
    const coords = citaActual.coordenadas || citaActual.cliente.coordenadas;
    if (coords && coords.lat && coords.lng) {
      window.open(`https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`, "_blank");
    } else {
      const query = encodeURIComponent(
        `${citaActual.cliente.direccion}, ${citaActual.cliente.municipio}, Jalisco`
      );
      window.open(`https://waze.com/ul?q=${query}&navigate=yes`, "_blank");
    }
  };

  const contactarWhatsApp = () => {
    if (!citaActual || !citaActual.cliente) return;
    const telefono = citaActual.cliente.whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hola ${citaActual.cliente.nombre}, te saludo de Kanan Limpieza. ¿Podrías compartirme tu ubicación actual en tiempo real por aquí para llegar directo a tu domicilio? ¡Gracias!`
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

  // Cronómetro en tiempo real para servicio en proceso
  useEffect(() => {
    if (!citaActual || citaActual.estatus !== "En Proceso" || !citaActual.hora_inicio) {
      setSegundosCronometro(0);
      return;
    }

    const startMs = new Date(citaActual.hora_inicio).getTime();
    const updateTimer = () => {
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setSegundosCronometro(diffSec);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [citaActual?.estatus, citaActual?.hora_inicio]);

  const formatoTiempoCronometro = () => {
    const hrs = Math.floor(segundosCronometro / 3600);
    const mins = Math.floor((segundosCronometro % 3600) / 60);
    const secs = segundosCronometro % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${hrs > 0 ? `${pad(hrs)}:` : ""}${pad(mins)}:${pad(secs)}`;
  };

  // 1. Iniciar Ruta ("Voy en camino")
  const handleIniciarRuta = async () => {
    if (!citaActual) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tecnico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citaId: citaActual.id,
          accion: "INICIAR_RUTA",
          rango_tiempo: tiempoEstimadoLlegada,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        cargarRuta();
      } else {
        alert("Error al iniciar ruta: " + (data.error || "Intenta nuevamente"));
      }
    } catch {
      alert("Error de conexión al iniciar ruta.");
    } finally {
      setSaving(false);
    }
  };

  // 2. Iniciar Servicio ("Comenzar Servicio" + Arrancar Cronómetro)
  const handleIniciarServicio = async () => {
    if (!citaActual) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tecnico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citaId: citaActual.id,
          accion: "INICIAR_SERVICIO",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        cargarRuta();
      } else {
        alert("Error al iniciar servicio: " + (data.error || "Intenta nuevamente"));
      }
    } catch {
      alert("Error de conexión al iniciar servicio.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Finalizar y Enviar Servicio ("Concluir Servicio" + Detener Cronómetro)
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

      const duracionFinalMin = Math.max(1, Math.round(segundosCronometro / 60)) || 60;

      const res = await fetch("/api/tecnico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citaId: citaActual.id,
          accion: "CONCLUIR_SERVICIO",
          estatus: "Completada",
          metodo_pago: metodoPagoSeleccionado,
          firma_conformidad: firmaDataUrl,
          fotos_antes_despues: fotosActualizadas.length > 0 ? fotosActualizadas : undefined,
          duracion_minutos: duracionFinalMin,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("✅ ¡Servicio finalizado con éxito! Tiempo, firma y entrega registrados.");
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
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col selection:bg-[#36A6DE]/20">
      {/* CONTENEDOR 100% RESPONSIVO PARA MÓVIL */}
      <div className="w-full max-w-lg mx-auto bg-white min-h-screen shadow-md flex flex-col">

        {/* BARRA SUPERIOR DE ESTADO OPERATIVO (ESTILO APP NATIVA) */}
        <div className="bg-gradient-to-r from-[#355581] to-[#1D71B5] text-white p-4 pt-5 sm:p-5 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-base shadow-inner">
                🚐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-sm tracking-wide">KANAN MÓVIL</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#36A6DE]/30 text-cyan-100 border border-white/20">
                    {citasHoy.length} {citasHoy.length === 1 ? "SERVICIO" : "SERVICIOS"}
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 font-medium">Ruta de Hoy ({fechaTexto}) · ZMG</p>
              </div>
            </div>

            {citaSeleccionadaId && (
              <button
                type="button"
                onClick={() => setCitaSeleccionadaId(null)}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xs font-bold transition flex items-center gap-1"
              >
                <span>←</span>
                <span>Ver Lista</span>
              </button>
            )}
          </div>
        </div>

        {/* SI NO HAY CITA SELECCIONADA Y HAY MÚLTIPLES CITAS: VISTA LISTA COMPACTA (EVITA SCROLL INFINITO) */}
        {!citaSeleccionadaId && citasHoy.length > 0 && (
          <div className="p-4 space-y-3 bg-[#F4F7F9] flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-extrabold text-slate-700">
                Paradas Programadas para Hoy
              </span>
              <span className="text-[11px] text-slate-400">Toca para abrir detalles</span>
            </div>

            <div className="space-y-2.5">
              {citasHoy.map((c) => {
                const isCompl = c.estatus === "Completada";
                const isProc = c.estatus === "En Proceso";
                const isRuta = c.estatus === "En Ruta";

                return (
                  <div
                    key={c.id}
                    onClick={() => setCitaSeleccionadaId(c.id)}
                    className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition active:scale-[0.99] cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-xs text-[#1D71B5]">{c.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompl
                          ? "bg-emerald-100 text-emerald-800"
                          : isProc
                          ? "bg-cyan-100 text-cyan-800"
                          : isRuta
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {c.estatus}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-heading font-bold text-xs text-slate-900">{c.cliente?.nombre || "Cliente"}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.cliente?.direccion}, {c.cliente?.municipio}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="font-bold text-slate-600">
                        {c.turno.includes("Matutino") ? "☀️ 09:00 - 13:00" : "🌤️ 14:00 - 18:00"}
                      </span>
                      <span className="font-extrabold text-emerald-600">
                        {c.monto_total ? `$${c.monto_total} MXN` : "Por cotizar"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SELECTOR DE PARADAS DEL DÍA (SOLO VISIBLE SI SE ESTÁ VIENDO EL DETALLE DE UNA CITA) */}
        {citaSeleccionadaId && (
          <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-[68px] z-20 shadow-xs">
            <div className="bg-[#F4F7F9] p-1 rounded-2xl grid grid-cols-2 gap-1.5 border border-slate-200">
              <button
                onClick={() => setTurnoActivo("matutino")}
                className={`py-2 px-3 rounded-xl font-heading font-bold text-xs transition-all flex flex-col items-center ${
                  turnoActivo === "matutino"
                    ? "bg-[#1D71B5] text-white shadow-sm"
                    : "bg-white text-slate-500 hover:text-[#355581]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>☀️</span>
                  <span>Parada 1 (Mañana)</span>
                </span>
                <span className={`text-[10px] font-normal font-sans mt-0.5 ${turnoActivo === "matutino" ? "opacity-90" : "text-slate-400"}`}>
                  09:00 - 13:00
                </span>
              </button>

              <button
                onClick={() => setTurnoActivo("vespertino")}
                className={`py-2 px-3 rounded-xl font-heading font-bold text-xs transition-all flex flex-col items-center ${
                  turnoActivo === "vespertino"
                    ? "bg-[#1D71B5] text-white shadow-sm"
                    : "bg-white text-slate-500 hover:text-[#355581]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🌤️</span>
                  <span>Parada 2 (Tarde)</span>
                </span>
                <span className={`text-[10px] font-normal font-sans mt-0.5 ${turnoActivo === "vespertino" ? "opacity-90" : "text-slate-400"}`}>
                  14:00 - 18:00
                </span>
              </button>
            </div>
          </div>
        )}

        {/* CUERPO DEL SERVICIO SELECCIONADO (O SI SÓLO HAY 1 CITA) */}
        {(citaSeleccionadaId || citasHoy.length <= 1) && (
        <div className="flex-1 bg-[#F4F7F9] flex flex-col">
          {/* BANNER DE ALERTA SI LA CITA FUE CANCELADA POR EL CLIENTE */}
          {citaActual?.estatus === "Cancelada" && (
            <div className="m-4 mb-0 p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  ⚠️
                </span>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-rose-950">
                    SERVICIO CANCELADO POR EL CLIENTE
                  </h4>
                  <p className="text-[11px] text-rose-800 font-medium">
                    El cliente canceló con anticipación vía WhatsApp. Esta parada queda liberada.
                  </p>
                </div>
              </div>
              {citaActual.cancel_reason && (
                <div className="p-2.5 rounded-xl bg-white/80 border border-rose-200 text-[11px] text-rose-900 font-mono">
                  {citaActual.cancel_reason}
                </div>
              )}
            </div>
          )}

          {citaActual ? (
            <div className="p-4 space-y-4">

              {/* PANEL MAESTRO 1-CLIC: FLUJO DE ESTADO Y CRONÓMETRO */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-extrabold text-[#355581] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡</span> Control Operativo 1-Clic
                  </span>
                  <span className={`text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-full ${
                    citaActual.estatus === "Completada"
                      ? "bg-emerald-100 text-emerald-800"
                      : citaActual.estatus === "En Proceso"
                      ? "bg-cyan-100 text-cyan-800 animate-pulse"
                      : citaActual.estatus === "En Ruta"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {citaActual.estatus}
                  </span>
                </div>

                {/* Barra de progreso visual de 3 etapas */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-heading font-bold">
                  <div className={`py-1.5 rounded-xl border ${
                    citaActual.estatus === "En Ruta" || citaActual.estatus === "En Proceso" || citaActual.estatus === "Completada"
                      ? "bg-blue-50 border-blue-200 text-[#1D71B5]"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    1. En Ruta 🚗
                  </div>
                  <div className={`py-1.5 rounded-xl border ${
                    citaActual.estatus === "En Proceso" || citaActual.estatus === "Completada"
                      ? "bg-blue-50 border-blue-200 text-[#1D71B5]"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    2. En Proceso 🧼
                  </div>
                  <div className={`py-1.5 rounded-xl border ${
                    citaActual.estatus === "Completada"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    3. Concluido ✅
                  </div>
                </div>

                {/* ESTADO 1: PENDIENTE / CONFIRMADA -> INICIAR RUTA */}
                {citaActual.estatus !== "En Ruta" && citaActual.estatus !== "En Proceso" && citaActual.estatus !== "Completada" && (
                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/90 space-y-3">
                    <div>
                      <p className="text-xs font-heading font-extrabold text-slate-800">
                        ⏱️ Tiempo estimado de llegada al cliente:
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Calculado con ruta y tráfico de Guadalajara. Puedes ajustar con un toque:
                      </p>
                    </div>

                    {/* Selector de tráfico de 1 toque */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        "15 minutos",
                        "20 a 25 minutos",
                        "35 minutos",
                        "45+ minutos",
                      ].map((tiempo) => (
                        <button
                          key={tiempo}
                          type="button"
                          onClick={() => setTiempoEstimadoLlegada(tiempo)}
                          className={`py-2 px-1 text-[11px] font-heading font-bold rounded-xl border text-center transition ${
                            tiempoEstimadoLlegada === tiempo
                              ? "bg-[#1D71B5] text-white border-[#1D71B5] shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {tiempo.replace(" minutos", "m")}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleIniciarRuta}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-2xl font-heading font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>🚗</span>
                      <span>{saving ? "Notificando..." : `Voy en camino (Llegada en ${tiempoEstimadoLlegada})`}</span>
                    </button>
                  </div>
                )}

                {/* ESTADO 2: EN RUTA -> COMENZAR SERVICIO */}
                {citaActual.estatus === "En Ruta" && (
                  <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
                      <span>🚗</span>
                      <span>Cliente notificado en traslado. Presiona al llegar al domicilio:</span>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleIniciarServicio}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white rounded-2xl font-heading font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>▶️</span>
                      <span>{saving ? "Iniciando..." : "Llegué al Domicilio: Comenzar Servicio"}</span>
                    </button>
                  </div>
                )}

                {/* ESTADO 3: EN PROCESO -> CRONÓMETRO DIGITAL ACTIVO */}
                {citaActual.estatus === "En Proceso" && (
                  <div className="bg-gradient-to-br from-[#0E2841] to-[#1D71B5] text-white rounded-2xl p-4.5 text-center shadow-lg border border-cyan-400/30 space-y-1">
                    <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-heading font-extrabold uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>Cronómetro de Servicio Activo</span>
                    </div>
                    <p className="font-heading font-black text-4xl tracking-widest text-white py-1">
                      {formatoTiempoCronometro()}
                    </p>
                    <p className="text-[11px] text-blue-100 font-medium">
                      Inyección-succión profunda y desinfección en curso
                    </p>
                  </div>
                )}

                {/* ESTADO 4: COMPLETADA */}
                {citaActual.estatus === "Completada" && (
                  <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-center space-y-0.5">
                    <p className="font-heading font-extrabold text-xs text-emerald-800">
                      ✓ Servicio Finalizado Exitosamente
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Duración registrada: <strong>{citaActual.duracion_minutos || 60} minutos</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* TARJETA 1: CLIENTE Y UBICACIÓN */}

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
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={abrirWaze}
                  className="w-full py-3 px-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white rounded-2xl font-heading font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition"
                >
                  <span className="text-base">🚗</span>
                  <span>Waze</span>
                </button>

                <button
                  type="button"
                  onClick={abrirGoogleMaps}
                  className="w-full py-3 px-2 bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] text-white rounded-2xl font-heading font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition"
                >
                  <span className="text-base">🗺️</span>
                  <span>Google Maps</span>
                </button>

                <button
                  type="button"
                  onClick={contactarWhatsApp}
                  className="w-full py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-heading font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition"
                >
                  <span className="text-base">📍</span>
                  <span>Pedir Ubicación</span>
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
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo de Tela</span>
                    <strong className="font-bold text-slate-800 mt-0.5 block">
                      {citaActual.tipo_tela || "No especificada"}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Manchas Críticas</span>
                    <strong className="font-bold text-amber-700 mt-0.5 block break-words">
                      {citaActual.manchas_dificiles && citaActual.manchas_dificiles.length > 0
                        ? citaActual.manchas_dificiles.join(", ")
                        : citaActual.notas_servicio
                        ? citaActual.notas_servicio
                        : "Ninguna reportada"}
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

              {/* Selector de Método de Pago (Solo Efectivo o SPEI - Terminal Desactivada) */}
              <div className="grid grid-cols-2 gap-2 text-xs font-heading font-bold">
                {(["Efectivo", "Transferencia SPEI"] as MetodoPago[]).map((metodo) => {
                  const selected = metodoPagoSeleccionado === metodo;
                  const label = metodo === "Transferencia SPEI" ? "📱 Transferencia SPEI" : "💵 Efectivo";
                  return (
                    <button
                      key={metodo}
                      type="button"
                      disabled={citaActual.estatus === "Completada"}
                      onClick={async () => {
                        setMetodoPagoSeleccionado(metodo);
                        try {
                          await fetch("/api/tecnico", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              citaId: citaActual.id,
                              metodo_pago: metodo,
                            }),
                          });
                        } catch {}
                      }}
                      className={`py-3 rounded-xl transition font-heading font-bold text-xs ${
                        selected
                          ? "border-2 border-[#1D71B5] bg-[#1D71B5]/10 text-[#1D71B5] shadow-xs"
                          : "border border-slate-200 bg-[#F4F7F9] text-slate-600 hover:bg-slate-100"
                      } ${citaActual.estatus === "Completada" ? "opacity-75 cursor-not-allowed" : ""}`}
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
                  <span>
                    {saving
                      ? "Guardando en el sistema..."
                      : citaActual.estatus === "En Proceso"
                      ? `Concluir Servicio y Cobrar (Tiempo: ${formatoTiempoCronometro()})`
                      : "Concluir Servicio y Cobrar"}
                  </span>
                </button>
              ) : (
                <div className="w-full py-3 bg-emerald-50 text-emerald-800 rounded-2xl font-heading font-extrabold text-xs text-center border border-emerald-200">
                  ✓ Este servicio ya fue completado y liquidado
                </div>
              )}
            </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[360px]">
              <span className="text-4xl block">☀️</span>
              <h3 className="font-heading font-extrabold text-slate-800 text-sm">
                Sin citas asignadas en este turno
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No hay citas programadas para el turno {turnoActivo === "matutino" ? "de la mañana" : "de la tarde"} de hoy.
              </p>
            </div>
          )}
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
