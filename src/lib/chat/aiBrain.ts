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
  stage: "recolectando_info" | "listo_para_cotizar" | "escalar_urgente";
  pause_ai: boolean;
  summary_for_owner: string;
}

const SYSTEM_PROMPT = `
Eres el recepcionista humano de "Kanan Limpieza" en Guadalajara y ZMG (Zapopan, Guadalajara, Tlajomulco, Tlaquepaque). Tu único objetivo es atender al cliente con calidez, pre-calificarlo y dejar el chat listo para que el dueño le dé su cotización exacta.

REGLAS ESTRICTAS DE ESTILO (WHATSAPP HUMANO):
- Responde como una persona real en WhatsApp: máximo 1 a 2 líneas cortas.
- PROHIBIDO usar viñetas, listas, asteriscos/negritas o menús robóticos.
- Usa máximo 1 emoji natural por mensaje (o ninguno).
- Lee el historial y NUNCA repitas saludos ("¡Hola!", "¿En qué te puedo ayudar?") si la conversación ya empezó.
- PROHIBIDO dar precios, rangos o estimados. Si preguntan cuánto cuesta, explica amablemente que el precio depende del tamaño, tela y estado del mueble, y pídele los 3 datos indispensables: qué mueble o área quiere lavar, una foto del mueble, y su colonia o zona en Guadalajara/ZMG.

CUÁNDO PASAR A "listo_para_cotizar" (pause_ai: true):
- En cuanto el cliente envíe una foto (o ya haya explicado qué mueble/área necesita lavar junto con su colonia/zona), responde con un mensaje cálido y breve confirmando que ya recibiste su información y que en unos minutos le envían su cotización exacta.
- En ese mismo turno devuelve stage: "listo_para_cotizar", pause_ai: true y un summary_for_owner corto (ej. "Sala 3 piezas con mancha de mascota en Zapopan").
- Si es una queja urgente o garantía, usa stage: "escalar_urgente" y pause_ai: true.
- Si aún faltan datos, usa stage: "recolectando_info", pause_ai: false y summary_for_owner: "".

FORMATO DE SALIDA OBLIGATORIO (JSON):
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "reply": "tu respuesta corta de 1-2 líneas",
  "stage": "recolectando_info" | "listo_para_cotizar" | "escalar_urgente",
  "pause_ai": boolean,
  "summary_for_owner": "resumen corto para el dueño o cadena vacía"
}
`;
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
async function procesarConGemini(promptCompleto: string, input: KananBrainInput, apiKey: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    
    // Convertir el historial de la conversación al formato de Gemini
    const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];
    
    if (Array.isArray(input.historialReciente) && input.historialReciente.length > 0) {
      for (const h of input.historialReciente.slice(-6)) {
        if (!h.content) continue;
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content.replace(/^\[Cliente\]:\s*/i, "") }],
        });
      }
    }

    // Agregar el mensaje nuevo al final
    contents.push({
      role: "user",
      parts: [{ text: input.mensajeNuevo }],
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: promptCompleto }],
        },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 350,
          responseMimeType: "application/json",
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

  const parseStructured = (raw: string, proveedor: "gemini" | "openai"): KananBrainOutput => {
    const cpMatch = input.mensajeNuevo.match(/\b\d{5}\b/);
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      const stage =
        parsed.stage === "listo_para_cotizar" || parsed.stage === "escalar_urgente"
          ? parsed.stage
          : "recolectando_info";
      return {
        respuestaTexto: String(parsed.reply || raw).trim(),
        intencionDetectada: "cotizacion",
        codigoPostalDetectado: cpMatch ? cpMatch[0] : undefined,
        proveedorUtilizado: proveedor,
        stage,
        pause_ai: Boolean(parsed.pause_ai),
        summary_for_owner: String(parsed.summary_for_owner || "").trim(),
      };
    } catch {
      return {
        respuestaTexto: raw,
        intencionDetectada: "cotizacion",
        codigoPostalDetectado: cpMatch ? cpMatch[0] : undefined,
        proveedorUtilizado: proveedor,
        stage: "recolectando_info",
        pause_ai: false,
        summary_for_owner: "",
      };
    }
  };

  // 1. Intentar con Gemini
  if (geminiKey) {
    const respuestaGemini = await procesarConGemini(promptCompleto, input, geminiKey);
    if (respuestaGemini) {
      return parseStructured(respuestaGemini, "gemini");
    }
  }

  // 2. Fallback a OpenAI
  if (openAiKey) {
    const respuestaOpenAI = await procesarConOpenAI(promptCompleto, input, openAiKey);
    if (respuestaOpenAI) {
      return parseStructured(respuestaOpenAI, "openai");
    }
  }

  return null;
}
