/**
 * Backend validation utilities for production-grade data validation
 */

export class ValidationError extends Error {
  constructor(field, message, code = "VALIDATION_ERROR") {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = code;
    this.statusCode = 400;
  }
}

// Prisma error code mappings to user-friendly messages
const PRISMA_ERROR_CODES = {
  P2002: {
    error: "DUPLICATE_ERROR",
    status: 409,
    getMessage: (field) => `Un enregistrement avec ce ${field} existe déjà`,
  },
  P2003: {
    error: "FOREIGN_KEY_ERROR",
    status: 400,
    getMessage: (field) => `La référence ${field} n'existe pas`,
  },
  P2011: {
    error: "NOT_NULL_ERROR",
    status: 400,
    getMessage: (field) => `${field} est requis`,
  },
  P2025: {
    error: "NOT_FOUND_ERROR",
    status: 404,
    getMessage: () => `Enregistrement non trouvé`,
  },
};

/**
 * Validate array input
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error reporting
 * @param {Object} options - { required: boolean, minItems: number, maxItems: number, itemType: string }
 * @returns {Array} Validated array
 * @throws {ValidationError}
 */
export function validateArray(value, fieldName, options = {}) {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new ValidationError(fieldName, `${fieldName} est requis`);
    }
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(fieldName, `${fieldName} doit être un tableau`);
  }

  if (options.minItems !== undefined && value.length < options.minItems) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit avoir au moins ${options.minItems} éléments`,
    );
  }

  if (options.maxItems !== undefined && value.length > options.maxItems) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit avoir au maximum ${options.maxItems} éléments`,
    );
  }

  return value;
}

/**
 * Validate object structure against schema
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error reporting
 * @param {Object} schema - Schema with required keys and types
 * @returns {Object} Validated object
 * @throws {ValidationError}
 */
export function validateObject(value, fieldName, schema = {}) {
  if (value === undefined || value === null) {
    if (schema.required) {
      throw new ValidationError(fieldName, `${fieldName} est requis`);
    }
    return {};
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(fieldName, `${fieldName} doit être un objet`);
  }

  // Validate required keys
  for (const key of schema.requiredKeys || []) {
    if (!(key in value)) {
      throw new ValidationError(fieldName, `${fieldName}.${key} est requis`);
    }
  }

  return value;
}

/**
 * Validate email format
 * @param {string} value - Email to validate
 * @param {string} fieldName - Field name for error reporting
 * @returns {string} Normalized email (lowercased, trimmed)
 * @throws {ValidationError}
 */
export function validateEmail(value, fieldName = "email") {
  if (!value || typeof value !== "string") {
    throw new ValidationError(fieldName, `${fieldName} est requis`);
  }

  const normalized = value.trim().toLowerCase();
  // RFC 5322 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit être une adresse email valide`,
    );
  }

  return normalized;
}

/**
 * Validate phone number format
 * @param {string} value - Phone number to validate
 * @param {string} fieldName - Field name for error reporting
 * @returns {string} Normalized phone number (trimmed, digits only)
 * @throws {ValidationError}
 */
export function validatePhoneNumber(value, fieldName = "phone") {
  if (!value || typeof value !== "string") {
    throw new ValidationError(fieldName, `${fieldName} est requis`);
  }

  const normalized = value.trim().replace(/\D/g, "");

  // Accept 8-15 digits (international standard)
  if (normalized.length < 8 || normalized.length > 15) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit contenir entre 8 et 15 chiffres`,
    );
  }

  return normalized;
}

/**
 * Validate rating value
 * @param {number} value - Rating value
 * @param {string} fieldName - Field name for error reporting
 * @returns {number} Validated rating
 * @throws {ValidationError}
 */
export function validateRating(value, fieldName = "rating") {
  if (value === undefined || value === null) {
    throw new ValidationError(fieldName, `${fieldName} est requis`);
  }

  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new ValidationError(fieldName, `${fieldName} doit être un entier`);
  }

  if (num < 1 || num > 5) {
    throw new ValidationError(fieldName, `${fieldName} doit être entre 1 et 5`);
  }

  return num;
}

/**
 * Validate and parse ISO datetime string
 * @param {string} value - ISO datetime string
 * @param {string} fieldName - Field name for error reporting
 * @param {Object} options - { mustBeFuture: boolean }
 * @returns {Date} Parsed date
 * @throws {ValidationError}
 */
export function validateDateTime(value, fieldName, options = {}) {
  if (!value || typeof value !== "string") {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit être une date/heure ISO valide`,
    );
  }

  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d{3})?(?:Z)?$/;
  if (!isoRegex.test(value)) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit être au format ISO (YYYY-MM-DDTHH:mm:ss.sssZ)`,
    );
  }

  const dt = new Date(value);
  if (isNaN(dt.getTime())) {
    throw new ValidationError(
      fieldName,
      `${fieldName} n'est pas une date valide`,
    );
  }

  if (options.mustBeFuture && dt <= new Date()) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit être dans le futur`,
    );
  }

  return dt;
}

/**
 * Validate discount percentage
 * @param {number} value - Discount percent
 * @param {string} fieldName - Field name for error reporting
 * @throws {ValidationError}
 */
export function validateDiscount(value, fieldName = "discountPercent") {
  if (value === undefined || value === null) {
    throw new ValidationError(fieldName, `${fieldName} est requis`);
  }

  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new ValidationError(fieldName, `${fieldName} doit être un entier`);
  }

  if (num < 1 || num > 100) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit être entre 1 et 100`,
    );
  }

  return num;
}

/**
 * Validate multilingual object
 * @param {Object} value - Object with fr/en/ar keys
 * @param {string} fieldName - Field name for error reporting
 * @param {Object} options - { required: boolean, maxLength: number }
 * @throws {ValidationError}
 */
export function validateMultilingual(value, fieldName, options = {}) {
  if (!value || typeof value !== "object") {
    throw new ValidationError(fieldName, `${fieldName} doit être un objet`);
  }

  if (options.required && !value.fr) {
    throw new ValidationError(fieldName, `${fieldName}.fr est requis`);
  }

  for (const lang of ["fr", "en", "ar"]) {
    if (value[lang]) {
      if (typeof value[lang] !== "string") {
        throw new ValidationError(
          fieldName,
          `${fieldName}.${lang} doit être une chaîne`,
        );
      }
      const maxLen = options.maxLength || 2000;
      if (value[lang].length > maxLen) {
        throw new ValidationError(
          fieldName,
          `${fieldName}.${lang} ne doit pas dépasser ${maxLen} caractères`,
        );
      }
    }
  }

  return value;
}

/**
 * Validate string with pattern
 * @param {string} value - String value
 * @param {string} fieldName - Field name for error reporting
 * @param {string} pattern - Regex pattern
 * @throws {ValidationError}
 */
export function validatePattern(value, fieldName, pattern) {
  if (!value || typeof value !== "string") {
    throw new ValidationError(fieldName, `${fieldName} est requis`);
  }

  const regex = new RegExp(pattern);
  if (!regex.test(value)) {
    throw new ValidationError(
      fieldName,
      `${fieldName} a un format invalide (doit respecter ${pattern})`,
    );
  }

  return value;
}

/**
 * Validate integer ID reference
 * @param {number} value - ID value
 * @param {string} fieldName - Field name for error reporting
 * @throws {ValidationError}
 */
export function validateIntegerId(value, fieldName) {
  if (value === undefined || value === null) return null; // Optional reference

  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new ValidationError(
      fieldName,
      `${fieldName} doit être un entier positif`,
    );
  }

  return num;
}

/**
 * Check if entity exists and user has access
 * @param {Object} entity - Entity from database
 * @param {string} fieldName - Field name for error reporting
 * @param {string} entityType - "MenuItem", "Space", "FlashSale", etc.
 * @throws {ValidationError}
 */
export function validateEntityExists(entity, fieldName, entityType) {
  if (!entity) {
    throw new ValidationError(fieldName, `${entityType} non trouvé(e)`);
  }
  return entity;
}

/**
 * Error handler for route endpoints with Prisma error code mapping
 * @param {Error} error - Error to handle
 * @param {Object} reply - Fastify reply object
 * @param {Object} logger - Logger instance
 */
export async function handleValidationError(error, reply, logger) {
  if (error instanceof ValidationError) {
    logger.warn(
      { field: error.field, code: error.code, message: error.message },
      "Validation error",
    );
    return reply.status(400).send({
      error: error.code,
      message: error.message,
      field: error.field,
    });
  }

  // Handle Prisma CHECK constraint violations (P2011 or custom constraint message)
  if (
    error.code === "P2011" ||
    (error.message && error.message.includes("check"))
  ) {
    const mapping = PRISMA_ERROR_CODES.P2011;
    logger.warn({ error: error.message }, "CHECK constraint violation");
    return reply.status(mapping.status).send({
      error: mapping.error,
      message: extractConstraintFieldFromError(error),
    });
  }

  // Handle Prisma unique constraint violations
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    const mapping = PRISMA_ERROR_CODES.P2002;
    logger.warn({ field, code: "P2002" }, "Unique constraint violation");
    return reply.status(mapping.status).send({
      error: mapping.error,
      message: mapping.getMessage(field),
      field,
    });
  }

  // Handle Prisma foreign key constraint violations
  if (error.code === "P2003") {
    const mapping = PRISMA_ERROR_CODES.P2003;
    logger.warn(
      { error: error.message, code: "P2003" },
      "Foreign key constraint violation",
    );
    return reply.status(mapping.status).send({
      error: mapping.error,
      message: "Une référence requise n'existe pas",
    });
  }

  // Handle Prisma not found
  if (error.code === "P2025") {
    const mapping = PRISMA_ERROR_CODES.P2025;
    logger.warn({ code: "P2025" }, "Record not found");
    return reply.status(mapping.status).send({
      error: mapping.error,
      message: mapping.getMessage(),
    });
  }

  // Handle Prisma date parsing errors
  if (error.message && error.message.includes("Invalid")) {
    logger.warn({ message: error.message }, "Invalid input");
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Les valeurs fournies sont invalides",
    });
  }

  // Unknown error - don't expose internals
  logger.error(error, "Unhandled error");
  return reply.status(500).send({
    error: "INTERNAL_ERROR",
    message: "Une erreur inattendue s'est produite",
  });
}

/**
 * Extract constraint field from Prisma error message
 * @param {Error} error - Prisma error
 * @returns {string} User-friendly error message
 */
function extractConstraintFieldFromError(error) {
  if (error.message.includes("discount")) {
    return "Le pourcentage de remise doit être entre 1 et 100";
  }
  if (error.message.includes("rating")) {
    return "La note doit être entre 1 et 5";
  }
  if (error.message.includes("capacity")) {
    return "La capacité doit être supérieure à 0";
  }
  if (error.message.includes("price")) {
    return "Le prix doit être supérieur à 0";
  }
  return "Les données ne respectent pas les contraintes requises";
}
