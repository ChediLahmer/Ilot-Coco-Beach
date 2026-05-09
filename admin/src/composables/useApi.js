import { useAuth } from "./useAuth.js";
import { router } from "../router.js";

const BASE = import.meta.env.VITE_API_URL || "/api";
const UPLOAD_BASE =
  import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL || "/api";

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
  let res;
  try {
    res = await fetch(`${base}${path}`, { ...options, headers });
  } catch {
    throw new Error("Erreur réseau — vérifiez votre connexion internet.");
  }
  if (res.status === 401) {
    useAuth().logout();
    router.push("/login");
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let msg;
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      msg = json.error || json.message || text;
    } catch {
      msg = text;
    }
    if (res.status === 404) msg = msg || "Ressource introuvable";
    else if (res.status === 409) msg = msg || "Cette entrée existe déjà";
    else if (res.status === 413) msg = "Fichier trop volumineux (max 50 Mo)";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
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
      request(path, {
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    del: (path) => request(path, { method: "DELETE" }),
    upload: (path, file, extraFields = {}) => {
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error("Fichier trop volumineux (max 50 Mo)");
      }
      const validPrefixes = ["image/", "video/"];
      if (
        file.type &&
        file.type !== "application/octet-stream" &&
        !validPrefixes.some((p) => file.type.startsWith(p))
      ) {
        throw new Error(
          "Type de fichier non supporté. Formats acceptés : images et vidéos.",
        );
      }
      const form = new FormData();
      form.append("file", file);
      for (const [k, v] of Object.entries(extraFields)) {
        form.append(k, v);
      }
      return request(path, { method: "POST", body: form, _directUpload: true });
    },
  };
}
