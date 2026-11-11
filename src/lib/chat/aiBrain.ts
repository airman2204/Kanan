import OpenAI from "openai";

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
  proveedorUtilizado: "gemini" | "openai";
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
 * Consulta a Google Gemini (gemini-flash-lite-latest)
 */
async function procesarConGemini(promptCompleto: string, mensajeNuevo: string, apiKey: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: promptCompleto }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: mensajeNuevo }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn("⚠️ [Kanan Gemini] Error HTTP:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    return texto;
  } catch (err: any) {
    console.warn("⚠️ [Kanan Gemini] Error de conexión:", err?.message || err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Consulta a OpenAI (gpt-4o-mini)
 */
async function procesarConOpenAI(promptCompleto: string, input: KananBrainInput, apiKey: string): Promise<string | null> {
  try {
    const openai = new OpenAI({ apiKey });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: promptCompleto },
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

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (err: any) {
    console.warn("⚠️ [Kanan OpenAI] Error:", err?.message || err);
    return null;
  }
}

/**
 * Cerebro Inteligente Híbrido:
 * 1. Prioriza Google Gemini (Gratis y activo con tu clave)
 * 2. Si falla, intenta OpenAI (GPT-4o-mini)
 * 3. Si ambos fallan, retorna null para activar el fallback seguro de Kanan
 */
export async function procesarConCerebroIA(input: KananBrainInput): Promise<KananBrainOutput | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

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

  const promptCompleto = SYSTEM_PROMPT + "\n\n" + contextoCliente;

  // 1. Intentar con Gemini
  if (geminiKey) {
    const respuestaGemini = await procesarConGemini(promptCompleto, input.mensajeNuevo, geminiKey);
    if (respuestaGemini) {
      const cpMatch = input.mensajeNuevo.match(/\b\d{5}\b/);
      return {
        respuestaTexto: respuestaGemini,
        intencionDetectada: "cotizacion",
        codigoPostalDetectado: cpMatch ? cpMatch[0] : undefined,
        proveedorUtilizado: "gemini",
      };
    }
  }

  // 2. Fallback a OpenAI
  if (openAiKey) {
    const respuestaOpenAI = await procesarConOpenAI(promptCompleto, input, openAiKey);
    if (respuestaOpenAI) {
      const cpMatch = input.mensajeNuevo.match(/\b\d{5}\b/);
      return {
        respuestaTexto: respuestaOpenAI,
        intencionDetectada: "cotizacion",
        codigoPostalDetectado: cpMatch ? cpMatch[0] : undefined,
        proveedorUtilizado: "openai",
      };
    }
  }

  return null;
}
