const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
let lastReserveClick = 0;
const RESERVE_CLICK_DEBOUNCE = 500; // ms between clicks to track separately

export function trackEvent(event, path) {
  try {
    const payload = JSON.stringify({ event, path });

    // Use fetch with keepalive — works reliably cross-origin without credentials
    fetch(`${API_BASE}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {
    // silently fail — analytics should never break the app
  }
}

export function trackPageView(path) {
  // Always track page views, including initial load
  trackEvent("page_view", path);
}

export function trackReserveClick() {
  const now = Date.now();

  // Allow multiple clicks if they're separated by debounce time
  if (now - lastReserveClick > RESERVE_CLICK_DEBOUNCE) {
    lastReserveClick = now;
    trackEvent("click_reserve", window.location.pathname);

    // Return promise for await compatibility
    return Promise.resolve();
  }

  // Debounced - still return promise but don't track
  return Promise.resolve();
}
