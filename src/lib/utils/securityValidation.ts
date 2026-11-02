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
 * Validador estricto para direcciones reales en México (calle y número).
 * Requiere texto de calle con letras y al menos un número (exterior o manzana).
 * Mínimo 8 caracteres, máximo 120. Bloquea repetición de letras sin sentido tipo "aaaaa" o "11111".
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

  // Debe contener letras (nombre de la calle)
  const tieneLetras = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}/.test(clean);
  if (!tieneLetras) {
    return {
      valida: false,
      error: "Ingresa el nombre real de tu calle o avenida.",
    };
  }

  // Debe contener al menos un número (número exterior, manzana, lote o depto)
  const tieneNumero = /\d+/.test(clean);
  if (!tieneNumero) {
    return {
      valida: false,
      error: "Por favor incluye el número exterior o manzana de tu domicilio.",
    };
  }

  // Bloquear texto repetitivo sin sentido (ej. 'aaaaaaa', '111111', 'asdfghjkl')
  if (/(.)\1{4,}/.test(clean)) {
    return {
      valida: false,
      error: "Por favor ingresa una dirección válida y verificable.",
    };
  }

  return { valida: true };
}

/**
 * Validador de detalle de manchas / tela (Requerido: mín 6 caracteres)
 */
export function validarDetalleManchas(detalle: string): { valida: boolean; error?: string } {
  const clean = sanitizeInput(detalle);
  if (!clean || clean.length < 6) {
    return {
      valida: false,
      error: "Describe brevemente las manchas o tipo de tela (mínimo 6 letras, ej: 'mancha de café en cojines').",
    };
  }
  if (clean.length > 250) {
    return {
      valida: false,
      error: "La descripción no puede exceder 250 caracteres.",
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
