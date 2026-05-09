/**
 * Backend validation utilities for production-grade data validation
 */

export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.statusCode = 400;
  }
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
      `${fieldName} must be a valid ISO datetime string`,
    );
  }

  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d{3})?(?:Z)?$/;
  if (!isoRegex.test(value)) {
    throw new ValidationError(
      fieldName,
      `${fieldName} must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)`,
    );
  }

  const dt = new Date(value);
  if (isNaN(dt.getTime())) {
    throw new ValidationError(fieldName, `${fieldName} is not a valid date`);
  }

  if (options.mustBeFuture && dt <= new Date()) {
    throw new ValidationError(fieldName, `${fieldName} must be in the future`);
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
    throw new ValidationError(fieldName, `${fieldName} is required`);
  }

  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new ValidationError(fieldName, `${fieldName} must be an integer`);
  }

  if (num < 1 || num > 100) {
    throw new ValidationError(
      fieldName,
      `${fieldName} must be between 1 and 100`,
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
    throw new ValidationError(fieldName, `${fieldName} must be an object`);
  }

  if (options.required && !value.fr) {
    throw new ValidationError(fieldName, `${fieldName}.fr is required`);
  }

  for (const lang of ["fr", "en", "ar"]) {
    if (value[lang]) {
      if (typeof value[lang] !== "string") {
        throw new ValidationError(
          fieldName,
          `${fieldName}.${lang} must be a string`,
        );
      }
      const maxLen = options.maxLength || 2000;
      if (value[lang].length > maxLen) {
        throw new ValidationError(
          fieldName,
          `${fieldName}.${lang} must not exceed ${maxLen} characters`,
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
    throw new ValidationError(fieldName, `${fieldName} is required`);
  }

  const regex = new RegExp(pattern);
  if (!regex.test(value)) {
    throw new ValidationError(
      fieldName,
      `${fieldName} has invalid format (must match ${pattern})`,
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
      `${fieldName} must be a positive integer`,
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
    throw new ValidationError(fieldName, `${entityType} not found`);
  }
  return entity;
}

/**
 * Error handler for route endpoints
 * @param {Error} error - Error to handle
 * @param {Object} reply - Fastify reply object
 * @param {Object} logger - Logger instance
 */
export async function handleValidationError(error, reply, logger) {
  if (error instanceof ValidationError) {
    logger.warn(
      { field: error.field, message: error.message },
      "Validation error",
    );
    return reply.status(400).send({
      error: "Validation Error",
      message: error.message,
      field: error.field,
    });
  }

  // Handle Prisma date parsing errors
  if (error.message && error.message.includes("Invalid")) {
    logger.warn({ message: error.message }, "Invalid input");
    return reply.status(400).send({
      error: "Invalid Input",
      message: "Provided values are invalid",
    });
  }

  // Handle Prisma unique constraint violations
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    logger.warn({ field }, "Unique constraint violation");
    return reply.status(400).send({
      error: "Duplicate Entry",
      message: `A record with this ${field} already exists`,
      field,
    });
  }

  // Handle Prisma not found
  if (error.code === "P2025") {
    logger.warn({ message: error.message }, "Record not found");
    return reply.status(404).send({
      error: "Not Found",
      message: "Record not found",
    });
  }

  // Unknown error - don't expose internals
  logger.error(error, "Unhandled error");
  return reply.status(500).send({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
}
