const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const REQUEST_TIMEOUT_MS = 60000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
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
  return res.json();
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
