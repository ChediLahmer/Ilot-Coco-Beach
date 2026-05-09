const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function trackEvent(event, path) {
  try {
    fetch(`${API_BASE}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, path }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silently fail — analytics should never break the app
  }
}

export function trackPageView(path) {
  trackEvent("page_view", path);
}

export function trackReserveClick() {
  trackEvent("click_reserve", window.location.pathname);
}
