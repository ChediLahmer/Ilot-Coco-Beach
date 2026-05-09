import { useAuth } from "./useAuth.js";
import { router } from "../router.js";

const BASE = import.meta.env.VITE_API_URL || "/api";
const UPLOAD_BASE =
  import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL || "/api";
const REQUEST_TIMEOUT_MS = 60000;
const UPLOAD_TIMEOUT_MS = 300000;

function xhrUpload(
  url,
  file,
  { method = "POST", headers = {}, onProgress } = {},
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(null);
        }
        return;
      }
      let msg;
      try {
        msg = JSON.parse(xhr.responseText)?.error || xhr.statusText;
      } catch {
        msg = xhr.responseText || xhr.statusText;
      }
      if (xhr.status === 401) {
        useAuth().logout();
        router.push("/login");
        const err = new Error("Unauthorized");
        err.status = 401;
        reject(err);
        return;
      }
      if (xhr.status === 413) {
        msg = "Fichier trop volumineux (max 50 Mo)";
      }
      reject(new Error(msg || "Erreur de téléchargement"));
    });
    xhr.addEventListener("error", () => reject(new Error("Erreur réseau")));
    xhr.addEventListener("timeout", () =>
      reject(new Error("La requête a expiré. Réessayez.")),
    );
    xhr.send(file);
  });
}

async function uploadVideoViaPresign(path, file, extraFields = {}, onProgress) {
  const presign = await request("/upload/presign", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });

  await xhrUpload(presign.url, file, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    onProgress,
  });

  if (path === "/gallery") {
    return request(path, {
      method: "POST",
      body: JSON.stringify({
        url: presign.publicUrl,
        alt: extraFields.alt || file.name,
        category: extraFields.category ?? null,
        categoryId: extraFields.categoryId ?? null,
        order: extraFields.order ?? 0,
      }),
    });
  }

  return { url: presign.publicUrl };
}

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    res = await fetch(`${base}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("La requête a expiré. Réessayez.");
    }
    throw new Error("Erreur réseau — vérifiez votre connexion internet.");
  } finally {
    clearTimeout(timeoutId);
  }
  if (res.status === 401) {
    useAuth().logout();
    router.push("/login");
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
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
    upload: (path, file, extraFields = {}, { onProgress } = {}) => {
      const { token } = useAuth();
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
      const isVideo = file.type?.startsWith("video/");
      if (isVideo) {
        return uploadVideoViaPresign(path, file, extraFields, onProgress).catch(
          () =>
            request(path, {
              method: "POST",
              body: form,
              _directUpload: true,
            }),
        );
      }
      if (onProgress) {
        return xhrUpload(`${UPLOAD_BASE}${path}`, form, {
          method: "POST",
          headers: token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {},
          onProgress,
        });
      }
      return request(path, { method: "POST", body: form, _directUpload: true });
    },
  };
}
