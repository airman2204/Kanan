import { MunicipioZMG } from "@/types/crm";

/**
 * Sanitizador estricto contra inyecciones XSS / HTML / scripts y caracteres de escape maliciosos.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>'"`;${}\\]/g, "") // Bloquear etiquetas HTML, backticks, llaves y caracteres de inyección
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .trim();
}

/**
 * Calcula el ratio de consonantes consecutivas o patrones típicos de "teclado / basura" (gibberish).
 */
function esTextoBasura(texto: string): boolean {
  const t = texto.toLowerCase().replace(/[^a-záéíóúñ]/g, "");
  if (t.length < 5) return false;

  // 1. Detección de patrones comunes de tecleo al azar (ej: asdf, fghj, dsfs, qwer, zxcv)
  const keyboardSmashPatterns = [
    /asdf/i,
    /sdfg/i,
    /dfgh/i,
    /fghj/i,
    /ghjk/i,
    /hjkl/i,
    /qwer/i,
    /wert/i,
    /erty/i,
    /rtyu/i,
    /zxcv/i,
    /xcvb/i,
    /cvbn/i,
    /vbnm/i,
    /dsfs/i,
    /fsdf/i,
    /dasd/i,
    /sdas/i,
    /fdsa/i,
    /lkjh/i,
    /mnbv/i,
    /poiu/i,
  ];

  for (const pattern of keyboardSmashPatterns) {
    if (pattern.test(t)) return true;
  }

  // 2. 5 o más consonantes seguidas sin vocales (imposible en español: ej. "dsfds", "fgtrb")
  if (/[bcdfghjklmnñpqrstvwxyz]{5,}/i.test(t)) {
    return true;
  }

  // 3. Patrones repetitivos de sílabas sin sentido (ej. "dasdasdas", "lalala")
  if (/([a-z]{2,4})\1{2,}/i.test(t)) {
    return true;
  }

  // 4. Falta total de vocales en palabras de más de 4 letras
  const palabras = texto.split(/\s+/);
  for (const p of palabras) {
    const soloLetras = p.toLowerCase().replace(/[^a-záéíóúñ]/g, "");
    if (soloLetras.length >= 4 && !/[aeiouáéíóú]/.test(soloLetras)) {
      return true;
    }
  }

  return false;
}

/**
 * Validador estricto para direcciones reales en México (calle y número).
 * Requiere:
 * - Al menos 2 palabras o un tipo de vialidad/calle + número claramente separado.
 * - Al menos un número separado o identificable como número exterior.
 * - No ser texto basura (keyboard smash como dsfsdf56699).
 */
export function validarDireccion(direccion: string): { valida: boolean; error?: string } {
  const clean = sanitizeInput(direccion);

  if (!clean || clean.length < 8) {
    return {
      valida: false,
      error: "La dirección debe contener al menos 8 caracteres (calle y número exterior).",
    };
  }

  if (clean.length > 120) {
    return {
      valida: false,
      error: "La dirección no puede exceder 120 caracteres.",
    };
  }

  // Detección de texto basura / keyboard smash
  if (esTextoBasura(clean)) {
    return {
      valida: false,
      error: "La dirección parece no ser válida. Escribe tu calle y número real (ej. Av. Providencia 2340).",
    };
  }

  // Debe contener al menos un espacio separando calle y número o tipo de vía
  // (Evita cosas pegadas como "dsfsdf56699" o "calle1234")
  if (!/\s/.test(clean)) {
    return {
      valida: false,
      error: "Por favor separa la calle del número exterior con un espacio (ej. Hidalgo 142).",
    };
  }

  // Debe contener letras (nombre de la calle) con al menos 3 letras seguidas
  const tieneLetras = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}/.test(clean);
  if (!tieneLetras) {
    return {
      valida: false,
      error: "Ingresa el nombre real de tu calle o avenida.",
    };
  }

  // Debe contener un número independiente (ej: ' 123', '#45', 'No. 12', 'Int 4B')
  const tieneNumeroIndependiente = /(?:^|\s|#|no\.?|num\.?|int\.?|ext\.?)\d{1,5}(?:[a-zA-Z]|\b)/i.test(clean);
  if (!tieneNumeroIndependiente) {
    return {
      valida: false,
      error: "Indica el número exterior de tu domicilio claramente separado (ej. López Mateos 450).",
    };
  }

  // Bloquear texto repetitivo sin sentido (ej. 'aaaaaaa', '111111')
  if (/(.)\1{3,}/.test(clean)) {
    return {
      valida: false,
      error: "Por favor ingresa una dirección válida y verificable.",
    };
  }

  return { valida: true };
}

/**
 * Validador de detalle de manchas / tela (Requerido: mín 6 caracteres reales, con palabras reales)
 */
export function validarDetalleManchas(detalle: string): { valida: boolean; error?: string } {
  const clean = sanitizeInput(detalle);
  if (!clean || clean.length < 6) {
    return {
      valida: false,
      error: "Describe las manchas o tela (mínimo 6 letras, ej: 'manchas de café en cojines').",
    };
  }

  if (clean.length > 250) {
    return {
      valida: false,
      error: "La descripción no puede exceder 250 caracteres.",
    };
  }

  // Detección de texto basura / keyboard smash (ej. "dasdasdsadasdasdasd")
  if (esTextoBasura(clean)) {
    return {
      valida: false,
      error: "Ingresa una descripción real (ej. 'Manchas de comida en sala de lino').",
    };
  }

  // Debe tener al menos una vocal
  if (!/[aeiouáéíóú]/i.test(clean)) {
    return {
      valida: false,
      error: "Por favor describe las manchas con palabras comprensibles.",
    };
  }

  return { valida: true };
}

/**
 * Validador de nombre del cliente
 */
export function validarNombre(nombre: string): { valida: boolean; error?: string } {
  const clean = sanitizeInput(nombre);
  if (!clean || clean.length < 3) {
    return {
      valida: false,
      error: "Por favor ingresa tu nombre completo (mínimo 3 letras).",
    };
  }

  if (esTextoBasura(clean)) {
    return {
      valida: false,
      error: "Ingresa un nombre y apellido válido.",
    };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/.test(clean)) {
    return {
      valida: false,
      error: "El nombre solo puede contener letras y espacios.",
    };
  }

  return { valida: true };
}

/**
 * Validador de WhatsApp mexicano (10 dígitos exactos)
 */
export function validarWhatsApp(tel: string): { valida: boolean; error?: string } {
  const digits = tel.replace(/\D/g, "");
  if (digits.length !== 10) {
    return {
      valida: false,
      error: "El WhatsApp debe tener 10 dígitos (ej. 33 1234 5678).",
    };
  }
  return { valida: true };
}
