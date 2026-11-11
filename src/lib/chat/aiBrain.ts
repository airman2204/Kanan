import OpenAI from "openai";

// Instancia perezosa (lazy) de OpenAI
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiInstance) {
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export interface MensajeContexto {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface KananBrainInput {
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion?: string;
  clienteMunicipio?: string;
  mensajeNuevo: string;
  historialReciente: MensajeContexto[];
  citaActiva?: {
    id: string;
    estatus: string;
    fecha: string;
    turno: string;
    items?: string;
  } | null;
}

export interface KananBrainOutput {
  respuestaTexto: string;
  intencionDetectada: "cotizacion" | "pregunta_tecnica" | "confirmacion_cita" | "cancelacion" | "otro";
  codigoPostalDetectado?: string;
  accionSugerida?: string;
}

const SYSTEM_PROMPT = `
Eres Kanan Asistente Virtual, el asesor técnico y de atención al cliente de "Kanan Servicios de Limpieza y Desinfección Profunda a Domicilio", operando en la Zona Metropolitana de Guadalajara (Zapopan, Guadalajara, Tlajomulco, Tlaquepaque).

🐾 PERSONALIDAD Y TONO:
- Eres cálido, empático, profesional y natural (español de México).
- JAMÁS suenas como un robot ni usas plantillas predeterminadas ni menús tipo "Marca 1 o 2".
- Respondes directamente a la duda del cliente primero, y luego guías hacia el siguiente paso con amabilidad.
- Usas emojis con buen gusto (🐾, ✨, 🛋️, 🧼, 📍, 🚐).
- Siempre mantienes mensajes claros y concisos (ideales para WhatsApp, párrafos cortos de 2 a 4 líneas).

🧼 CONOCIMIENTO TÉCNICO DE KANAN:
1. SERVICIOS:
   - Lavado y desinfección profunda de Salas, Sillones, Colchones, Cunas, Sillas de Comedor, Tapetes y Vestiduras de Autos.
2. TECNOLOGÍA:
   - Sistema de Inyección-Succión profunda alemana Kärcher.
   - Sanitización antiácaros y eliminación de alérgenos / bacterias.
   - Productos 100% biodegradables y seguros para niños y mascotas (Pet-Friendly).
3. TIEMPO DE SECADO:
   - Toma aproximadamente de 3 a 4 horas gracias a la turbina de alto vacío (dependiendo del clima y ventilación). ¡Los muebles se usan el mismo día!
4. MANCHAS DIFÍCILES:
   - Orina de mascotas: se aplica tratamiento enzimático para desintegrar el ácido úrico y neutralizar olores de raíz.
   - Grasa, comida, sudor y maquillaje: emulsión biodegradable de alta extracción.
5. COBERTURA:
   - Todo Zapopan, Guadalajara, Tlajomulco y Tlaquepaque.
6. COTIZACIÓN:
   - Para dar un presupuesto formal y certero, necesitamos saber qué muebles son y pedir 1 o 2 fotos claras por este medio para evaluar el tipo de tela y manchas.

🛡️ POLÍTICAS OPERATIVAS:
- Cancelaciones o cambios de horario: se pueden realizar sin costo con hasta 2 horas de anticipación a la cita.
- Si el técnico ya va en camino o faltan menos de 2 horas, no se puede cancelar el servicio.

OBJETIVO PRINCIPAL EN CADA RESPUESTA:
1. Responde a lo que te pregunten con empatía (ej. si su perro se orinó, tranquilízalo diciéndole que con el tratamiento enzimático queda perfecto).
2. Si no sabemos la zona, pregúntale amablemente su Código Postal o Colonia/Municipio para validar cobertura.
3. Si requiere cotización, anímalo a mandar 1 o 2 fotos claras de sus muebles para cotizarle exacto.
4. NUNCA inventes precios exactos cerrados si no están en el contexto; pide fotos para cotizar con precisión.
`;

/**
 * Procesa el mensaje del cliente con OpenAI GPT-4o-mini
 */
export async function procesarConCerebroIA(input: KananBrainInput): Promise<KananBrainOutput | null> {
  const openai = getOpenAIClient();
  if (!openai) {
    console.log("ℹ️ [Kanan IA] OPENAI_API_KEY no configurada. Usando fallback tradicional.");
    return null;
  }

  try {
    const contextoCliente = `
DATOS DEL CLIENTE ACTUAL:
- Nombre: ${input.clienteNombre || "Cliente"}
- Teléfono: ${input.clienteTelefono}
- Dirección registrada: ${input.clienteDireccion || "Sin registrar"} (${input.clienteMunicipio || "Jalisco"})
- Cita activa en sistema: ${
      input.citaActiva
        ? `Folio ${input.citaActiva.id}, Estatus: ${input.citaActiva.estatus}, Fecha: ${input.citaActiva.fecha} (${input.citaActiva.turno})`
        : "Ninguna cita activa por ahora"
    }
`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextoCliente },
      ...input.historialReciente.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: input.mensajeNuevo },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 350,
    });

    const respuestaTexto = response.choices[0]?.message?.content?.trim() || "";

    if (!respuestaTexto) return null;

    // Detectar si el usuario envió un código postal de 5 dígitos
    const cpMatch = input.mensajeNuevo.match(/\b\d{5}\b/);

    return {
      respuestaTexto,
      intencionDetectada: "cotizacion",
      codigoPostalDetectado: cpMatch ? cpMatch[0] : undefined,
    };
  } catch (err: any) {
    console.warn("⚠️ [Kanan IA] Error consultando OpenAI:", err?.message || err);
    return null;
  }
}
