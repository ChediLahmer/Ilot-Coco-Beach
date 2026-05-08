const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
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
  postReview: (data) =>
    request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
