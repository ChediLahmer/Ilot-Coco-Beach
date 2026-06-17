import { ref } from "vue";

const toasts = ref([]);
let nextId = 0;

export function useToast() {
  function show(message, type = "success", duration = 3000) {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    dismiss,
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error", 5000),
    info: (msg) => show(msg, "info"),
  };
}
