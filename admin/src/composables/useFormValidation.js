import { ref } from "vue";

export function useFormValidation() {
  const fieldErrors = ref({});

  function clearErrors() {
    fieldErrors.value = {};
  }

  function setError(field, message) {
    fieldErrors.value[field] = message;
  }

  function validateRequired(value, field, label) {
    if (!value || (typeof value === "string" && !value.trim())) {
      setError(field, `${label} est requis`);
      return false;
    }
    return true;
  }

  function validateMin(value, field, label, min) {
    if (value !== undefined && value !== null && Number(value) < min) {
      setError(field, `${label} doit être au moins ${min}`);
      return false;
    }
    return true;
  }

  function validateMax(value, field, label, max) {
    if (value !== undefined && value !== null && Number(value) > max) {
      setError(field, `${label} ne doit pas dépasser ${max}`);
      return false;
    }
    return true;
  }

  function validateMaxLength(value, field, label, max) {
    if (typeof value === "string" && value.length > max) {
      setError(field, `${label} ne doit pas dépasser ${max} caractères`);
      return false;
    }
    return true;
  }

  function validateDateTime(
    value,
    field,
    label,
    { mustBeFuture = false } = {},
  ) {
    if (!value || typeof value !== "string") {
      setError(field, `${label} doit être une date valide`);
      return false;
    }

    const isoRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d{3})?(?:Z)?$/;
    if (!isoRegex.test(value)) {
      setError(field, `${label} doit être au format YYYY-MM-DDTHH:mm`);
      return false;
    }

    const dt = new Date(value);
    if (isNaN(dt.getTime())) {
      setError(field, `${label} n'est pas une date valide`);
      return false;
    }

    if (mustBeFuture && dt <= new Date()) {
      setError(field, `${label} doit être dans le futur`);
      return false;
    }

    return true;
  }

  function validateEmail(value, field, label) {
    if (!value || typeof value !== "string") {
      setError(field, `${label} est requis`);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError(field, `${label} doit être un email valide`);
      return false;
    }
    return true;
  }

  function validatePattern(value, field, label, pattern) {
    if (!value || typeof value !== "string") {
      setError(field, `${label} est requis`);
      return false;
    }
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      setError(field, `${label} a un format invalide`);
      return false;
    }
    return true;
  }

  function hasErrors() {
    return Object.keys(fieldErrors.value).length > 0;
  }

  return {
    fieldErrors,
    clearErrors,
    setError,
    validateRequired,
    validateMin,
    validateMax,
    validateMaxLength,
    validateDateTime,
    validateEmail,
    validatePattern,
    hasErrors,
  };
}
