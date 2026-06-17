import { ref } from "vue";

const token = ref(localStorage.getItem("admin_token") || "");

export function useAuth() {
  function setToken(t) {
    token.value = t;
    localStorage.setItem("admin_token", t);
  }

  function logout() {
    token.value = "";
    localStorage.removeItem("admin_token");
  }

  return { token, setToken, logout };
}
