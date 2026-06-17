import { ref } from "vue";

const visible = ref(false);
const title = ref("");
const message = ref("");
let resolveFn = null;

export function useConfirm() {
  function confirm(opts) {
    if (typeof opts === "string") {
      opts = { message: opts };
    }
    title.value = opts.title || "Confirmation";
    message.value = opts.message;
    visible.value = true;
    return new Promise((resolve) => {
      resolveFn = resolve;
    });
  }

  function accept() {
    visible.value = false;
    resolveFn?.(true);
    resolveFn = null;
  }

  function cancel() {
    visible.value = false;
    resolveFn?.(false);
    resolveFn = null;
  }

  return { visible, title, message, confirm, accept, cancel };
}
