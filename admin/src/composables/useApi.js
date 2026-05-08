import { useAuth } from "./useAuth.js";

const BASE = import.meta.env.VITE_API_URL || "/api";
const UPLOAD_BASE =
  import.meta.env.VITE_UPLOAD_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

async function request(path, options = {}) {
  const { token } = useAuth();
  const headers = { ...options.headers };
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const base = options._directUpload ? UPLOAD_BASE : BASE;
  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (res.status === 401) {
    useAuth().logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  if (res.status === 204) return null;
  return res.json();
}

export function useApi() {
  return {
    get: (path) => request(path),
    post: (path, body) =>
      request(path, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    put: (path, body) =>
      request(path, { method: "PUT", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE" }),
    upload: (path, file, extraFields = {}) => {
      const form = new FormData();
      form.append("file", file);
      for (const [k, v] of Object.entries(extraFields)) {
        form.append(k, v);
      }
      return request(path, { method: "POST", body: form, _directUpload: true });
    },
  };
}
