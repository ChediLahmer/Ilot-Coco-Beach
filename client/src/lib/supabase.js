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
  getSpaces: () => request("/spaces"),
  getGallery: (cursor, limit = 20) =>
    request(`/gallery?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`),
  getFlashSales: () => request("/flash-sales"),
  getVouchers: () => request("/vouchers"),
  getConfig: () => request("/config"),
};
