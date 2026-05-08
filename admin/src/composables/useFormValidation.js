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
    hasErrors,
  };
}
