const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function trackEvent(event, path) {
  try {
    navigator.sendBeacon(
      `${API_BASE}/analytics/event`,
      new Blob([JSON.stringify({ event, path })], { type: "application/json" }),
    );
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
