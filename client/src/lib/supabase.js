const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const REQUEST_TIMEOUT_MS = Number(
  import.meta.env.VITE_REQUEST_TIMEOUT_MS || 180000,
);

// Serve media directly from object storage (MinIO/CDN) for fast, cached,
// range-friendly delivery. Only proxy not-yet-deduplicated videos still in the
// /incoming/ path, where direct range/CORS requests may fail.
const VIDEO_EXT_RE = /\.(?:mp4|webm|ogg|mov|m4v|avi|mkv)(?:$|[?#])/i;

function toProxyMediaUrl(value) {
  if (typeof value !== "string") return value;
  if (!/^https?:\/\//i.test(value)) return value;
  if (value.includes("/api/media/proxy?url=")) return value;
  if (VIDEO_EXT_RE.test(value) && value.includes("/incoming/"))
    return `${API}/media/proxy?url=${encodeURIComponent(value)}`;
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

function getTimeoutMs(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    getTimeoutMs(options.timeoutMs, REQUEST_TIMEOUT_MS),
  );
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      ...options,
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
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
      else if (body.message) msg = body.message;
    } catch {
      /* use status code */
    }
    if (res.status === 429) msg = "429";
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return normalizeMediaUrls(await res.json());
}

export const api = {
  getMenuCategories: () => request("/menu/categories"),
  getSpaces: (page = 1, limit = 10) =>
    request(`/spaces?page=${page}&limit=${limit}`),
  getGallery: (cursor, limit = 20) =>
    request(`/gallery?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`),
  getFlashSales: (page = 1, limit = 10) =>
    request(`/flash-sales?page=${page}&limit=${limit}`),
  getVouchers: (page = 1, limit = 10) =>
    request(`/vouchers?page=${page}&limit=${limit}`),
  getConfig: () => request("/config"),
  getReviews: (cursor) =>
    request(`/reviews?limit=20${cursor ? `&cursor=${cursor}` : ""}`),
  getReviewStats: () => request("/reviews/stats"),
  postReview: (data) =>
    request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
