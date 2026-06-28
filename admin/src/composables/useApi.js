import { useAuth } from "./useAuth.js";
import { router } from "../router.js";

const BASE = import.meta.env.VITE_API_URL || "/api";
const UPLOAD_BASE =
  import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL || "/api";
const REQUEST_TIMEOUT_MS = Number(
  import.meta.env.VITE_REQUEST_TIMEOUT_MS || 180000,
);
const UPLOAD_TIMEOUT_MS = Number(
  import.meta.env.VITE_UPLOAD_TIMEOUT_MS || 600000,
);
const IMAGE_MAX_DIMENSION = Number(
  import.meta.env.VITE_IMAGE_UPLOAD_MAX_DIMENSION || 2200,
);
const IMAGE_QUALITY = Number(import.meta.env.VITE_IMAGE_UPLOAD_QUALITY || 0.82);
// Proxy images always; also proxy incoming/ videos (not yet deduplicated — CORS range may fail)
const VIDEO_EXT_RE = /\.(?:mp4|webm|ogg|mov|m4v|avi|mkv)(?:$|[?#])/i;
const VIDEO_EXTENSIONS = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/mp4",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
};

function getTimeoutMs(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getFileExtension(name = "") {
  const match = /\.([^.]+)$/.exec(name);
  return match ? match[1].toLowerCase() : "";
}

function inferVideoContentType(file) {
  if (file?.type?.startsWith("video/")) {
    return file.type;
  }
  return VIDEO_EXTENSIONS[getFileExtension(file?.name)];
}

function withExtension(name, extension) {
  const baseName = (name || "upload").replace(/\.[^.]+$/, "");
  return `${baseName}.${extension}`;
}

function toProxyMediaUrl(value) {
  if (typeof value !== "string") return value;
  if (!/^https?:\/\//i.test(value)) return value;
  if (value.includes("/api/media/proxy?url=")) return value;
  if (VIDEO_EXT_RE.test(value) && value.includes("/incoming/"))
    return `${BASE}/media/proxy?url=${encodeURIComponent(value)}`;
  return value;
}

function normalizeMediaUrls(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeMediaUrls);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, normalizeMediaUrls(v)]),
    );
  }
  return toProxyMediaUrl(value);
}

async function optimizeImageForUpload(file) {
  if (
    !file?.type?.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    typeof document === "undefined" ||
    typeof createImageBitmap !== "function"
  ) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    const largestSide = Math.max(bitmap.width, bitmap.height);
    const scale =
      largestSide > IMAGE_MAX_DIMENSION ? IMAGE_MAX_DIMENSION / largestSide : 1;

    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY);
    });

    if (!blob || blob.size >= file.size * 0.98) {
      return file;
    }

    return new File([blob], withExtension(file.name, "webp"), {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

function xhrUpload(
  url,
  body,
  {
    method = "POST",
    headers = {},
    onProgress,
    timeoutMs = UPLOAD_TIMEOUT_MS,
  } = {},
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = getTimeoutMs(timeoutMs, UPLOAD_TIMEOUT_MS);
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
          resolve(normalizeMediaUrls(JSON.parse(xhr.responseText)));
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
        msg = "Fichier trop volumineux (max 100 Mo)";
      }
      reject(new Error(msg || "Erreur de téléchargement"));
    });
    xhr.addEventListener("error", () => reject(new Error("Erreur réseau")));
    xhr.addEventListener("timeout", () =>
      reject(new Error("La requête a expiré. Réessayez.")),
    );
    xhr.send(body);
  });
}

function getUploadHeaders(token) {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {};
}

function uploadMultipart(path, body, token, onProgress) {
  return xhrUpload(`${UPLOAD_BASE}${path}`, body, {
    method: "POST",
    headers: getUploadHeaders(token),
    onProgress,
  });
}

async function request(path, options = {}) {
  const { token } = useAuth();
  const headers = { ...options.headers };
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const base = options._directUpload ? UPLOAD_BASE : BASE;
  let res;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    getTimeoutMs(options.timeoutMs, REQUEST_TIMEOUT_MS),
  );
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
    else if (res.status === 413) msg = "Fichier trop volumineux (max 100 Mo)";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return normalizeMediaUrls(await res.json());
}

export function useApi() {
  return {
    get: (path, options) => request(path, options),
    post: (path, body, options = {}) =>
      request(path, {
        ...options,
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    put: (path, body, options = {}) =>
      request(path, {
        ...options,
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
      }),
    del: (path, options = {}) =>
      request(path, { ...options, method: "DELETE" }),
    upload: async (path, file, extraFields = {}, { onProgress } = {}) => {
      const { token } = useAuth();
      const MAX_SIZE = 100 * 1024 * 1024;
      const inferredVideoType = inferVideoContentType(file);
      if (file.size > MAX_SIZE) {
        throw new Error("Fichier trop volumineux (max 100 Mo)");
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
      if (!file.type && !inferredVideoType) {
        throw new Error(
          "Type de fichier non supporte. Formats acceptes : images et videos.",
        );
      }
      const normalizedFile = inferredVideoType
        ? file
        : await optimizeImageForUpload(file);
      const form = new FormData();
      form.append("file", normalizedFile);
      for (const [k, v] of Object.entries(extraFields)) {
        form.append(k, v);
      }
      return uploadMultipart(path, form, token, onProgress);
    },
  };
}
