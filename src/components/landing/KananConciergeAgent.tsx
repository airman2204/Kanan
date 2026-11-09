"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Camera,
  Image as ImageIcon,
  Check,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  X,
  UploadCloud,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { MunicipioZMG, TurnoServicio, ItemContratado } from "@/types/crm";
import { consultarCodigoPostal } from "@/lib/utils/postalCodes";
import {
  validarNombre,
  validarWhatsApp,
  validarDireccion,
  validarDetalleManchas,
  sanitizeInput,
} from "@/lib/utils/securityValidation";

interface CatalogPiece {
  id: string;
  nombre: string;
  categoriaId: string;
  categoriaNombre: string;
}

const PIEZAS_CATALOGO: CatalogPiece[] = [
  // Salas
  { id: "sala-l", nombre: "Sala en L / Seccional", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "sala-321", nombre: "Sala Tradicional (3-2-1)", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "loveseat-sofa", nombre: "Sofá 2 o 3 Plazas / Sofá Cama", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "sillon-individual", nombre: "Sillón Individual / Reclinable", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "silla-comedor", nombre: "Sillas de Comedor Tapizadas", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  // Tapetes
  { id: "tapete-chico", nombre: "Tapete Chico (hasta 1.5x1m)", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  { id: "tapete-mediano", nombre: "Tapete Mediano (hasta 2x1.5m)", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  { id: "tapete-grande", nombre: "Tapete Grande (hasta 3x2m)", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  // Colchones
  { id: "colchon-ind", nombre: "Colchón Individual", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-mat", nombre: "Colchón Matrimonial", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-queen", nombre: "Colchón Queen Size", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-king", nombre: "Colchón King Size", categoriaId: "colchones", categoriaNombre: "Colchones" },
  // Autos
  { id: "auto-sedan", nombre: "Auto Sedán / Hatchback", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
  { id: "auto-suv", nombre: "SUV / Camioneta (2 Filas)", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
  { id: "auto-3filas", nombre: "Camioneta Familiar (3 Filas)", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
];

const CATEGORIAS = [
  { id: "salas", label: "🛋️ Salas y Sofás" },
  { id: "tapetes", label: "✨ Tapetes" },
  { id: "colchones", label: "🛏️ Colchones" },
  { id: "autos", label: "🚗 Autos" },
];

const CHIPS_MANCHAS = [
  { id: "🐾 Mascotas / Orina", label: "🐾 Mascotas / Orina" },
  { id: "☕ Café / Bebidas / Comida", label: "☕ Café / Bebidas / Comida" },
  { id: "🍷 Grasa / Aceite / Maquillaje", label: "🍷 Grasa / Aceite" },
  { id: "💨 Polvo y Suciedad Profunda", label: "💨 Polvo / Suciedad Profunda" },
  { id: "✨ Mantenimiento Preventivo", label: "✨ Mantenimiento Preventivo" },
  { id: "⚠️ Olores / Humedad", label: "⚠️ Olores / Humedad" },
];

type StepId =
  | "ask_category"
  | "ask_piece"
  | "ask_cp"
  | "ask_colonia"
  | "ask_calle"
  | "ask_num_ext"
  | "ask_manchas"
  | "ask_fotos"
  | "ask_date"
  | "ask_name"
  | "ask_phone"
  | "finished";

interface MessageItem {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  mediaPreviews?: string[];
}

interface KananConciergeAgentProps {
  selectedMunicipio: MunicipioZMG;
  onSelectMunicipio: (m: MunicipioZMG) => void;
  preselectedCategory?: string | null;
  preselectedCategories?: string[];
}

export function KananConciergeAgent({
  selectedMunicipio,
  onSelectMunicipio,
  preselectedCategory,
  preselectedCategories = [],
}: KananConciergeAgentProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [step, setStep] = useState<StepId>("ask_category");

  // Multi-áreas seleccionadas de la casita / diorama
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);

  // Estado estructurado del cliente
  const [selectedCat, setSelectedCat] = useState<string>("salas");
  const [selectedPiece, setSelectedPiece] = useState<CatalogPiece | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);

  // Ubicación validada
  const [codigoPostal, setCodigoPostal] = useState<string>("");
  const [municipioDetectado, setMunicipioDetectado] = useState<MunicipioZMG>("Guadalajara");
  const [coloniasDisponibles, setColoniasDisponibles] = useState<string[]>([]);
  const [colonia, setColonia] = useState<string>("");
  const [calle, setCalle] = useState<string>("");
  const [numExt, setNumExt] = useState<string>("");
  const [cotoInterior, setCotoInterior] = useState<string>("");

  // Manchas y Fotos Requeridas
  const [selectedManchas, setSelectedManchas] = useState<string[]>([]);
  const [notasLibres, setNotasLibres] = useState<string>("");
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);

  // Agenda y contacto
  const [fecha, setFecha] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [horaEspecifica, setHoraEspecifica] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [slotsOcupados, setSlotsOcupados] = useState<{ fecha: string; turno: string; hora_especifica?: string; municipio?: string }[]>([]);

  // Input libre para el paso activo y errores en vivo
  const [inputText, setInputText] = useState<string>("");
  const [errorActivo, setErrorActivo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<{ folio: string; whatsappUrl: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // Cargar slots ocupados desde la API pública
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.slotsOcupados && Array.isArray(data.slotsOcupados)) {
          setSlotsOcupados(data.slotsOcupados);
        }
      })
      .catch(() => {});
  }, []);

  // Calcular días sugeridos interactivos (Mañana, Próximo Sábado/Domingo, etc.)
  const obtenerDiasSugeridos = () => {
    const dias = [];
    const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const diaNum = d.getDay();
      const esFin = diaNum === 0 || diaNum === 6;
      const label = i === 1 ? "Mañana" : `${nombresDias[diaNum]} ${d.getDate()} ${meses[d.getMonth()]}`;
      dias.push({
        iso,
        label,
        esFin,
        detalle: esFin ? "Fin de semana" : "Entre semana",
      });
    }
    return dias;
  };

  // Generador inteligente de horas con semáforo y regla de ruta
  const obtenerHorasDisponiblesPorDia = (fechaStr: string) => {
    if (!fechaStr) return [];
    const parts = fechaStr.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const diaNum = d.getDay();
    const esFin = diaNum === 0 || diaNum === 6;
    const muniLower = (municipioDetectado || selectedMunicipio).toLowerCase();

    let horaInicio = 9;
    let horaFin = 16;

    if (esFin && !muniLower.includes("tlajomulco")) {
      horaInicio = 8;
      horaFin = 13;
    }

    const slotsHora = [];
    const parseHour = (hStr?: string) => {
      if (!hStr) return null;
      const clean = hStr.toLowerCase().trim();
      const match = clean.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/);
      if (!match) return null;
      let hr = parseInt(match[1], 10);
      const isPm = match[3] === "pm";
      const isAm = match[3] === "am";
      if (isPm && hr < 12) hr += 12;
      if (isAm && hr === 12) hr = 0;
      return hr;
    };

    const citasDelDia = slotsOcupados.filter((s) => s.fecha === fechaStr);

    for (let h = horaInicio; h <= horaFin; h++) {
      const horaFormato24 = `${h.toString().padStart(2, "0")}:00`;
      const horaFormatoAmPm = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;

      let ocupado = false;
      let razonOcupado = "";

      for (const c of citasDelDia) {
        const cHour = parseHour(c.hora_especifica || c.turno);
        if (cHour !== null) {
          const diff = Math.abs(h - cHour);
          if (diff < 3) {
            ocupado = true;
            razonOcupado = "Horario reservado";
            break;
          }
        } else if (c.turno && c.turno.includes(`${h.toString().padStart(2, "0")}:00`)) {
          ocupado = true;
          razonOcupado = "Horario reservado";
          break;
        }
      }

      if (citasDelDia.length >= 3) {
        ocupado = true;
        razonOcupado = "Agenda llena";
      }

      slotsHora.push({
        hora: horaFormato24,
        label: horaFormatoAmPm,
        ocupado,
        razonOcupado,
        secado: h <= 12 ? "Secado listo esa misma tarde" : "Secado listo en la noche",
      });
    }

    return slotsHora;
  };

  // Mapeo amigable de IDs de torre a nombres legibles
  const spotNameMap: Record<string, string> = {
    colchones: "Colchones & Cunas",
    salas: "Salas & Sillones",
    comedor: "Sillas de Comedor",
    autos: "Vestiduras de Auto",
  };

  // Inicializar conversación natural reconociendo si el cliente seleccionó áreas en la casita
  useEffect(() => {
    setIsTyping(true);

    const areas = preselectedCategories && preselectedCategories.length > 0
      ? preselectedCategories
      : preselectedCategory
      ? [preselectedCategory]
      : [];

    setSelectedSpots(areas);

    const timer = setTimeout(() => {
      if (areas.length > 0) {
        const nombresAreas = areas.map((id) => spotNameMap[id] || id).join(" + ");
        setMessages([
          {
            id: "m-1",
            sender: "agent",
            text: "¡Hola! 👋 Soy Kanan asistente.",
            time: getCurrentTime(),
          },
          {
            id: "m-2",
            sender: "agent",
            text: `¡Excelente elección! Veo que seleccionaste: 🐾\n📍 **${nombresAreas}**\n\nVamos a preparar tu cotización personalizada con inspección de manchas. Para validar cobertura en Jalisco, ¿cuál es tu Código Postal (5 dígitos)?`,
            time: getCurrentTime(),
          },
        ]);
        setStep("ask_cp");
      } else {
        setMessages([
          {
            id: "m-1",
            sender: "agent",
            text: "¡Hola! 👋 Soy Kanan asistente.",
            time: getCurrentTime(),
          },
          {
            id: "m-2",
            sender: "agent",
            text: "¿Qué muebles o piezas te gustaría que consintamos hoy?",
            time: getCurrentTime(),
          },
        ]);
        setStep("ask_category");
      }
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [preselectedCategory, preselectedCategories]);

  useEffect(() => {
    // Desplazar suavemente SOLO dentro del contenedor interno del chat sin mover la ventana del navegador
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const appendAgentMessage = (text: string, nextStep: StepId, delayMs = 500) => {
    setIsTyping(true);
    setErrorActivo(null);
    setInputText("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text,
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);
      setStep(nextStep);
    }, delayMs);
  };

  // 1. Categoría
  const handleSelectCategory = (catId: string, label: string) => {
    setSelectedCat(catId);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: label,
        time: getCurrentTime(),
      },
    ]);

    const catName = catId === "salas" ? "salas" : catId === "colchones" ? "colchones" : catId === "tapetes" ? "tapetes" : "autos";
    appendAgentMessage(`¡Excelente! Para ${catName}, ¿cuál de estas opciones se adapta mejor a tu necesidad?`, "ask_piece");
  };

  // 2. Pieza
  const handleSelectPiece = (piece: CatalogPiece) => {
    setSelectedPiece(piece);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: piece.nombre,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `¡Anotado! 🐶 ${piece.nombre}.\n\nPara validar cobertura oficial en Jalisco y calcular tu ruta, ¿cuál es tu Código Postal (5 dígitos)?`,
      "ask_cp"
    );
  };

  // 3. Código Postal (Validación Estricta de Cobertura Jalisco + SEPOMEX completo)
  const [isValidatingCp, setIsValidatingCp] = useState(false);

  const handleSubmitCp = async (cpVal: string) => {
    const cleanCp = cpVal.replace(/\D/g, "").slice(0, 5);
    if (cleanCp.length !== 5) {
      setErrorActivo("El Código Postal debe tener exactamente 5 números.");
      return;
    }

    setIsValidatingCp(true);
    setErrorActivo(null);

    try {
      // 1. Primero intentar catálogo local
      let info = consultarCodigoPostal(cleanCp);
      let colonias = info.colonias || [];
      let municipio = info.municipio;

      // 2. Si el catálogo local no tiene colonias o queremos la lista completa oficial, consultar API SEPOMEX
      if (!colonias || colonias.length === 0) {
        try {
          const res = await fetch(`/api/postal?cp=${cleanCp}`);
          if (res.ok) {
            const apiData = await res.json();
            if (apiData.valido) {
              municipio = apiData.municipio;
              colonias = apiData.colonias || [];
              info = {
                valido: true,
                municipio: apiData.municipio,
                colonias,
              };
            } else if (apiData.mensajeError) {
              setErrorActivo(apiData.mensajeError);
              setIsValidatingCp(false);
              return;
            }
          }
        } catch (fetchErr) {
          console.error("Error al consultar API postal:", fetchErr);
        }
      }

      if (!info.valido || !municipio) {
        setErrorActivo(info.mensajeError || "Código postal fuera de nuestra zona de cobertura en Jalisco (Guadalajara, Zapopan, Tlajomulco, Tlaquepaque).");
        setIsValidatingCp(false);
        return;
      }

      setCodigoPostal(cleanCp);
      setMunicipioDetectado(municipio);
      onSelectMunicipio(municipio);
      setColoniasDisponibles(colonias);
      setErrorActivo(null);

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text: `CP ${cleanCp}`,
          time: getCurrentTime(),
        },
      ]);

      if (colonias.length > 0) {
        appendAgentMessage(
          `📍 Cobertura confirmada en ${municipio} (CP ${cleanCp}).\n\nPor favor selecciona tu colonia o fraccionamiento:`,
          "ask_colonia"
        );
      } else {
        setColonia("");
        appendAgentMessage(
          `📍 Cobertura confirmada en ${municipio} (CP ${cleanCp}).\n\n¿En qué colonia o fraccionamiento te ubicas?`,
          "ask_colonia"
        );
      }
    } finally {
      setIsValidatingCp(false);
    }
  };

  // Regresar al paso de Código Postal si el usuario se equivocó
  const handleRegresarACP = () => {
    setCodigoPostal("");
    setColonia("");
    setColoniasDisponibles([]);
    setErrorActivo(null);
    setInputText("");

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: "Deseo corregir mi Código Postal ↩️",
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      "¡Sin problema! 🐾 ¿Cuál es tu Código Postal correcto de 5 dígitos en Jalisco?",
      "ask_cp"
    );
  };

  // 4. Colonia
  const handleSelectColonia = (colSelected: string) => {
    const cleanCol = sanitizeInput(colSelected, true);
    if (!cleanCol) {
      setErrorActivo("Por favor indica el nombre de tu colonia.");
      return;
    }
    setColonia(cleanCol);
    setErrorActivo(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `Colonia: ${cleanCol}`,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `Entendido, Col. ${cleanCol}.\n\nAhora, ¿cuál es el nombre de tu Calle o Avenida?`,
      "ask_calle"
    );
  };

  // 5. Calle
  const handleSubmitCalle = (calleVal: string) => {
    const cleanCalle = sanitizeInput(calleVal, true);
    if (!cleanCalle || cleanCalle.length < 3) {
      setErrorActivo("Ingresa el nombre real de tu calle o avenida (mínimo 3 letras).");
      return;
    }

    setCalle(cleanCalle);
    setErrorActivo(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: cleanCalle,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `Perfecto. ¿Cuál es tu Número Exterior y (opcional) número interior o coto? (ej. 2340 Int 4B)`,
      "ask_num_ext"
    );
  };

  // 6. Número Exterior y Validación Integral de Dirección
  const handleSubmitNumExt = (numVal: string) => {
    const cleanNum = sanitizeInput(numVal, true);
    if (!cleanNum || !/\d/.test(cleanNum)) {
      setErrorActivo("Indica el número exterior de tu domicilio claramente con dígitos (ej. 450 o 1234 Casa 5).");
      return;
    }

    setNumExt(cleanNum);
    const calleCompleta = `${calle} ${cleanNum}`;
    const valid = validarDireccion(calleCompleta);
    if (!valid.valida) {
      setErrorActivo(valid.error || "Dirección inválida. Por favor verifica tu calle y número.");
      return;
    }

    setErrorActivo(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `No. ${cleanNum}`,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `¡Ubicación registrada con éxito! 📍\n\nPara preparar los químicos y desmanchadores adecuados: ¿qué tipo de manchas o suciedad tienen tus piezas? Selecciona o escribe:`,
      "ask_manchas"
    );
  };

  // 7. Manchas y tela
  const handleToggleManchaChip = (chipId: string) => {
    const exists = selectedManchas.includes(chipId);
    const updated = exists ? selectedManchas.filter((c) => c !== chipId) : [...selectedManchas, chipId];
    setSelectedManchas(updated);
    setErrorActivo(null);
  };

  const handleConfirmManchas = (textoLibre?: string) => {
    const combinado = [
      ...selectedManchas,
      sanitizeInput(textoLibre || notasLibres, true)
    ].filter(Boolean).join(", ");

    const validacion = validarDetalleManchas(combinado);
    if (!validacion.valida) {
      setErrorActivo(validacion.error || "Por favor selecciona al menos una opción o describe las manchas (mínimo 6 letras).");
      return;
    }

    setNotasLibres(combinado);
    setErrorActivo(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `Detalle de manchas: ${combinado}`,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `Anotado: "${combinado}".\n\n📷 Es requerido adjuntar de 1 a 3 fotos del estado actual de tus muebles para que el especialista verifique el tejido antes de acudir.\n\nSube tus fotos abajo:`,
      "ask_fotos"
    );
  };

  // 8. Carga de Fotos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorActivo(null);

    const fileList = Array.from(files).slice(0, 3);
    for (const file of fileList) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorActivo("Cada foto debe pesar menos de 5MB.");
        return;
      }
    }

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFotosPreview((prev) => {
            const next = [...prev, reader.result as string].slice(0, 3);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setFotosPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmFotos = () => {
    if (fotosPreview.length === 0) {
      setErrorActivo("Es requerido adjuntar al menos 1 foto del estado de tus muebles.");
      return;
    }

    setErrorActivo(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `📷 Adjunté ${fotosPreview.length} foto(s) de mis piezas`,
        time: getCurrentTime(),
        mediaPreviews: fotosPreview,
      },
    ]);

    // Iniciar con fecha vacía para que el usuario siempre vea y elija su día primero
    setFecha("");
    setTurno("");

    appendAgentMessage(
      `¡Fotos recibidas y cargadas! 📸 Ya tenemos todo para tu desmanchado profesional.\n\n¿Qué día prefieres para tu servicio? Elige un día de la lista o en el calendario:`,
      "ask_date"
    );
  };

  // 9. Selección de Día y Hora
  const handleSelectDay = (fechaIso: string, labelDia: string) => {
    setErrorActivo(null);

    const horas = obtenerHorasDisponiblesPorDia(fechaIso);
    const disponibles = horas.filter((h) => !h.ocupado);

    if (disponibles.length === 0) {
      setErrorActivo(`El día ${labelDia} ya cuenta con su ruta 100% llena sin horas libres. Por favor selecciona otro día.`);
      return;
    }

    setFecha(fechaIso);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `Día: ${labelDia}`,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `¡Excelente fecha! (${labelDia}). 📅\n\n¿A qué hora te gustaría que llegue el especialista a tu domicilio? Elige tu horario preferido:`,
      "ask_date"
    );
  };

  const handleSelectHora = (hora24: string, horaLabel: string) => {
    setHoraEspecifica(horaLabel);
    // Asignar turno correspondiente según la hora seleccionada
    const hrNum = parseInt(hora24.split(":")[0], 10);
    const muniLower = (municipioDetectado || selectedMunicipio).toLowerCase();

    let turnoCalculado = "Lunes a Domingo (09:00 - 16:00)";
    if (muniLower.includes("tlajomulco")) {
      turnoCalculado = "Lunes a Domingo (09:00 - 16:00)";
    } else if (hrNum < 14) {
      turnoCalculado = "Matutino (09:00 - 13:00)";
    } else {
      turnoCalculado = "Vespertino (14:00 - 18:00)";
    }

    setTurno(turnoCalculado);
    setErrorActivo(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `Horario: ${horaLabel}`,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `¡Apartado a las ${horaLabel} en agenda! ⏰📅\n\nPor favor compárteme tu Nombre Completo para preparar tu ficha formal de servicio.`,
      "ask_name"
    );
  };

  // 10. Nombre Completo
  const handleSubmitName = (nombreVal: string) => {
    const cleanNom = sanitizeInput(nombreVal, true);
    const valid = validarNombre(cleanNom);
    if (!valid.valida) {
      setErrorActivo(valid.error || "Por favor ingresa tu nombre completo válido.");
      return;
    }

    setNombre(cleanNom);
    setErrorActivo(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: cleanNom,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `Mucho gusto, ${cleanNom.split(" ")[0]}! 🐾\n\nPor último, ingresa tu número de WhatsApp a 10 dígitos para generar tu Folio oficial Kanan y notificarte en cuanto tu cotización esté lista:`,
      "ask_phone"
    );
  };

  // 11. Teléfono y Envío al CRM con TODAS las validaciones cumplidas
  const handleSubmitPhone = async (telVal: string) => {
    const cleanTel = telVal.replace(/\D/g, "");
    const validTel = validarWhatsApp(cleanTel);
    if (!validTel.valida) {
      setErrorActivo(validTel.error || "El WhatsApp debe tener 10 dígitos.");
      return;
    }

    setWhatsapp(cleanTel);
    setErrorActivo(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: cleanTel,
        time: getCurrentTime(),
      },
    ]);

    setIsTyping(true);
    setSubmitting(true);

    const items: ItemContratado[] = selectedSpots.length > 0
      ? selectedSpots.map((spotId) => ({
          categoriaId: spotId,
          categoriaNombre: spotNameMap[spotId] || spotId,
          piezaId: spotId,
          piezaNombre: spotNameMap[spotId] || spotId,
          cantidad: 1,
        }))
      : [
          {
            categoriaId: selectedPiece?.categoriaId || "salas",
            categoriaNombre: selectedPiece?.categoriaNombre || "Salas y Sillas",
            piezaId: selectedPiece?.id || "pieza_manual",
            piezaNombre: selectedPiece?.nombre || "Servicio Kanan",
            cantidad: cantidad || 1,
          },
        ];

    const direccionCompleta = `${calle} ${numExt}${colonia ? `, Col. ${colonia}` : ""}, CP ${codigoPostal}, ${municipioDetectado}`;

    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: sanitizeInput(nombre),
          whatsapp: cleanTel,
          direccion: direccionCompleta,
          calleNumero: `${calle} ${numExt}`,
          calle: sanitizeInput(calle),
          numero_exterior: sanitizeInput(numExt),
          coto_interior: sanitizeInput(cotoInterior),
          codigo_postal: codigoPostal,
          colonia: sanitizeInput(colonia),
          municipio: municipioDetectado,
          mascotas: true,
          fecha: fecha || getTomorrowDate(),
          turno: turno || "Matutino (09:00 - 13:00)",
          hora_especifica: horaEspecifica || undefined,
          items_contratados: items,
          notas_servicio: sanitizeInput(notasLibres || "Solicitud vía Kanan asistente"),
          fotos_estado_actual: fotosPreview,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo registrar la solicitud");
      }

      const folio = data.cita?.id || `KAN-${Date.now().toString().slice(-4)}`;
      const waUrl = data.whatsappUrl || `https://wa.me/523343359207?text=${encodeURIComponent(`Hola Kanan Limpieza, registré mi solicitud con folio ${folio}.`)}`;

      setBookingResult({ folio, whatsappUrl: waUrl });
      setIsTyping(false);
      setStep("finished");

      const piezasResumen = items.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ");

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-done-${Date.now()}`,
          sender: "agent",
          text: `🎉 ¡Excelente, ${nombre.split(" ")[0]}! Tu solicitud ha sido registrada con éxito.\n\n📋 *Folio de Servicio:* **${folio}**\n🛋️ *Áreas/Piezas:* ${piezasResumen}\n📍 *Ubicación:* ${municipioDetectado} (CP ${codigoPostal})\n📸 *Fotos recibidas:* ${fotosPreview.length} foto(s)\n📅 *Fecha y Horario:* ${fecha} a las ${horaEspecifica || turno}\n\nEn breve recibirás la cotización y confirmación de tu cita vía WhatsApp. ✨`,
          time: getCurrentTime(),
        },
      ]);
    } catch (err: any) {
      setIsTyping(false);
      setErrorActivo(err.message || "Error al procesar la solicitud");
      appendAgentMessage(
        `Ocurrió un inconveniente: ${err.message || "Detalle de conexión"}. Por favor haz clic abajo para comunicarte directo por WhatsApp.`,
        "finished"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setStep("ask_category");
    setSelectedPiece(null);
    setCodigoPostal("");
    setColonia("");
    setColoniasDisponibles([]);
    setCalle("");
    setNumExt("");
    setCotoInterior("");
    setSelectedManchas([]);
    setNotasLibres("");
    setFotosPreview([]);
    setNombre("");
    setWhatsapp("");
    setErrorActivo(null);
    setBookingResult(null);

    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          id: "m-reset-1",
          sender: "agent",
          text: "¡Hola de nuevo! 👋 Soy Kanan asistente.",
          time: getCurrentTime(),
        },
        {
          id: "m-reset-2",
          sender: "agent",
          text: "¿Qué muebles o piezas te gustaría que consintamos hoy?",
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);
    }, 350);
  };

  return (
    <section id="agendar" className="py-12 sm:py-20 bg-gradient-to-b from-[#F4F7F9] via-white to-[#F4F7F9] border-t border-slate-200/70 relative overflow-hidden">
      {/* Orbes de luz sutiles que armonizan con el Hero */}
      <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-kanan-cyan/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-kanan-cerulean/10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">

        {/* Encabezado elegante de sección con identidad Kanan */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kanan-ice border border-kanan-cyan/30 text-kanan-cerulean text-xs font-heading font-bold shadow-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Asistente Oficial Kanan</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-kanan-deep">
            Cotiza y Agenda en Conversación Directa
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Sin formularios fríos: plática guiada con nuestro asistente para coordinar tu servicio.
          </p>
        </div>

        {/* Ventana de Conversación estilo Mensajería Premium Integrada */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_-12px_rgba(53,85,129,0.14)] overflow-hidden flex flex-col">
          
          {/* Header de la Conversación con degradado suave Kanan */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/assets/brand/kanan-dog.png"
                  alt="Kanan asistente"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-kanan-cyan/40 shadow-xs bg-cyan-50"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/30" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 leading-tight">
                  Kanan asistente
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  en línea
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetConversation}
              className="p-2 rounded-xl text-slate-400 hover:text-kanan-cerulean hover:bg-slate-100 transition"
              title="Reiniciar conversación"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Globos de Conversación */}
          <div
            ref={chatContainerRef}
            className="p-4 sm:p-6 space-y-4 min-h-[340px] max-h-[460px] overflow-y-auto bg-gradient-to-b from-slate-50/80 via-[#F7F9FB] to-white"
          >
            {messages.map((m) => {
              const isAgent = m.sender === "agent";

              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2.5 ${isAgent ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                >
                  {isAgent && (
                    <img
                      src="/assets/brand/kanan-dog.png"
                      alt="Kanan"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-cyan-200 bg-cyan-50"
                    />
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAgent
                        ? "bg-white text-slate-800 rounded-bl-xs border border-slate-200/80"
                        : "bg-gradient-to-r from-kanan-cyan to-kanan-cerulean text-white rounded-br-xs font-medium shadow-cyan-glow/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Previews de imágenes enviadas por el usuario */}
                    {m.mediaPreviews && m.mediaPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/20">
                        {m.mediaPreviews.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt="Foto subida"
                            className="w-14 h-14 rounded-lg object-cover border border-white/40 shadow-xs"
                          />
                        ))}
                      </div>
                    )}

                    <span
                      className={`block text-[10px] text-right mt-1 font-sans ${
                        isAgent ? "text-slate-400" : "text-white/80"
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Indicador de "Escribiendo..." */}
            {isTyping && (
              <div className="flex items-center gap-2.5 justify-start animate-in fade-in">
                <img
                  src="/assets/brand/kanan-dog.png"
                  alt="Kanan"
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-cyan-200 bg-cyan-50"
                />
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Alerta de Error en Vivo */}
          {errorActivo && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="flex-1">{errorActivo}</span>
              <button
                type="button"
                onClick={() => setErrorActivo(null)}
                className="text-rose-500 hover:text-rose-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Área Interactiva de Respuestas según el paso */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100 space-y-3">
            
            {/* 1. Chips de Categorías */}
            {step === "ask_category" && !isTyping && (
              <div className="flex flex-wrap gap-2 animate-in fade-in">
                {CATEGORIAS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c.id, c.label)}
                    className="px-3.5 py-2 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-xs"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* 2. Chips de Piezas Específicas */}
            {step === "ask_piece" && !isTyping && (
              <div className="flex flex-wrap gap-2 animate-in fade-in">
                {PIEZAS_CATALOGO.filter((p) => p.categoriaId === selectedCat).map((piece) => (
                  <button
                    key={piece.id}
                    type="button"
                    onClick={() => handleSelectPiece(piece)}
                    className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-cyan-50 text-slate-800 hover:text-cyan-900 border border-slate-200 hover:border-cyan-300 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs"
                  >
                    + {piece.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* 3. Input de Código Postal */}
            {step === "ask_cp" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isValidatingCp) handleSubmitCp(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={5}
                    value={inputText}
                    disabled={isValidatingCp}
                    onChange={(e) => {
                      setErrorActivo(null);
                      setInputText(e.target.value);
                    }}
                    placeholder={isValidatingCp ? "Consultando SEPOMEX..." : "Código Postal (ej. 45646 o 44600)"}
                    className="w-full px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono font-bold disabled:opacity-60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inputText.replace(/\D/g, "").length < 5 || isValidatingCp}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs flex items-center justify-center min-w-9 min-h-9"
                  title="Verificar CP"
                >
                  {isValidatingCp ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            )}

            {/* 4. Selector Desplegable de Colonia */}
            {step === "ask_colonia" && !isTyping && (
              <div className="space-y-3 animate-in fade-in">
                {/* Cabecera con CP detectado y botón Cambiar CP */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-xs text-slate-600 font-medium">
                    CP <strong className="text-slate-900 font-bold">{codigoPostal}</strong> detectado en{" "}
                    <strong className="text-kanan-cerulean font-bold">{municipioDetectado}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleRegresarACP}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-kanan-cerulean hover:text-kanan-deep bg-cyan-50 hover:bg-cyan-100/80 px-2.5 py-1 rounded-full transition"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Cambiar CP</span>
                  </button>
                </div>

                {coloniasDisponibles.length > 0 ? (
                  <div>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value === "__OTRA__") {
                          setInputText("");
                        } else if (e.target.value) {
                          handleSelectColonia(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-3 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Selecciona tu colonia o fraccionamiento --
                      </option>
                      {coloniasDisponibles.map((col) => (
                        <option key={col} value={col}>
                          📍 {col}
                        </option>
                      ))}
                      <option value="__OTRA__">➕ Mi colonia o coto privado no aparece en la lista...</option>
                    </select>
                  </div>
                ) : null}

                {/* Input libre para escribir colonia o coto */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputText.trim()) handleSelectColonia(inputText);
                  }}
                  className="flex items-center gap-2 pt-0.5"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setErrorActivo(null);
                      setInputText(e.target.value);
                    }}
                    placeholder={
                      coloniasDisponibles.length > 0
                        ? "O escribe aquí tu colonia si no aparece arriba..."
                        : "Escribe el nombre de tu colonia o fraccionamiento..."
                    }
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                    title="Confirmar colonia"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 5. Input de Calle */}
            {step === "ask_calle" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitCalle(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setErrorActivo(null);
                    setInputText(e.target.value);
                  }}
                  placeholder="Calle o Avenida (ej. Av. Providencia)..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 6. Input de Número Exterior / Interior */}
            {step === "ask_num_ext" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitNumExt(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setErrorActivo(null);
                    setInputText(e.target.value);
                  }}
                  placeholder="Número exterior y coto (ej. 2340 Int 4B)..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 7. Selector de Chips de Manchas + Input de texto complementario */}
            {step === "ask_manchas" && !isTyping && (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex flex-wrap gap-1.5">
                  {CHIPS_MANCHAS.map((chip) => {
                    const active = selectedManchas.includes(chip.id);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleToggleManchaChip(chip.id)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                          active
                            ? "bg-kanan-navy text-white border-kanan-navy shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setErrorActivo(null);
                      setInputText(e.target.value);
                    }}
                    placeholder="O escribe más detalles (ej. tela lino, café en brazo)..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleConfirmManchas(inputText)}
                    className="px-4 py-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* 8. Subida de Fotos Requeridas (1 a 3 fotos) */}
            {step === "ask_fotos" && !isTyping && (
              <div className="space-y-3 animate-in fade-in">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs sm:text-sm font-bold transition shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-cyan-600" />
                    <span>{fotosPreview.length > 0 ? "Agregar más fotos" : "Subir o Tomar Fotos *"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={fotosPreview.length === 0}
                    onClick={handleConfirmFotos}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
                  >
                    Listo ({fotosPreview.length} foto{fotosPreview.length === 1 ? "" : "s"}) →
                  </button>
                </div>

                {/* Miniaturas de fotos */}
                {fotosPreview.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {fotosPreview.map((src, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                        <img src={src} alt="Foto mueble" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
                          title="Eliminar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 9. Selector Inteligente de Día y Turno (con semáforo de disponibilidad y fines de semana) */}
            {step === "ask_date" && !isTyping && (
              <div className="space-y-3 animate-in fade-in">
                {/* 9.1: Si aún no elige fecha o quiere cambiarla */}
                {!fecha ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500">
                      Selecciona un día disponible (próximos 7 días):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {obtenerDiasSugeridos().map((d) => (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => handleSelectDay(d.iso, d.label)}
                          className="p-2.5 rounded-2xl border text-left transition-all active:scale-95 bg-white hover:bg-cyan-50/80 border-slate-200 hover:border-cyan-400 text-slate-800 shadow-2xs"
                        >
                          <span className="font-heading font-extrabold text-xs block text-slate-800">
                            {d.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            {d.iso}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Selector de fecha libre */}
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">O elige otra fecha:</span>
                      <input
                        type="date"
                        min={getTomorrowDate()}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSelectDay(e.target.value, e.target.value);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* 9.2: Horas disponibles para la fecha seleccionada con semáforo inteligente */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600 font-medium">
                        Horarios para <strong className="text-slate-900">{fecha}</strong>:
                      </p>
                      <button
                        type="button"
                        onClick={() => setFecha("")}
                        className="text-[11px] text-cyan-700 hover:underline font-semibold"
                      >
                        Cambiar fecha
                      </button>
                    </div>

                    {/* Grilla visual de horas de llegada */}
                    {obtenerHorasDisponiblesPorDia(fecha).some((h) => !h.ocupado) ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {obtenerHorasDisponiblesPorDia(fecha).map((h) => {
                          return (
                            <button
                              key={h.hora}
                              type="button"
                              disabled={h.ocupado}
                              onClick={() => handleSelectHora(h.hora, h.label)}
                              className={`p-3 rounded-2xl border text-left transition-all ${
                                h.ocupado
                                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                                  : "bg-white hover:bg-cyan-50/80 border-slate-200 hover:border-cyan-400 text-slate-800 shadow-xs active:scale-95"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-extrabold text-xs sm:text-sm">
                                  {h.label}
                                </span>
                                {h.ocupado ? (
                                  <span className="w-2 h-2 rounded-full bg-rose-400" title="No disponible" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Disponible" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-1">
                                {h.ocupado ? h.razonOcupado || "No disponible" : h.secado}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                        <p className="text-xs text-rose-800 font-medium">
                          No tenemos horarios disponibles para este día. Por favor elige otra fecha en el calendario.
                        </p>
                        <button
                          type="button"
                          onClick={() => setFecha("")}
                          className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                        >
                          Ver otros días
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 10. Input de Nombre */}
            {step === "ask_name" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitName(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setErrorActivo(null);
                    setInputText(e.target.value);
                  }}
                  placeholder="Nombre y apellido completo..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 11. Input de WhatsApp */}
            {step === "ask_phone" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitPhone(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="tel"
                  maxLength={10}
                  value={inputText}
                  onChange={(e) => {
                    setErrorActivo(null);
                    setInputText(e.target.value);
                  }}
                  placeholder="WhatsApp a 10 dígitos (ej. 3312345678)"
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submitting || inputText.replace(/\D/g, "").length < 10}
                  className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 12. Estado final completado */}
            {step === "finished" && (
              <div className="pt-2 text-center animate-in fade-in">
                <button
                  type="button"
                  onClick={handleResetConversation}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-kanan-cerulean transition py-1 px-3 rounded-full hover:bg-slate-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Realizar otra consulta</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
