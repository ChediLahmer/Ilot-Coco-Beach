const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function trackEvent(event, path) {
  try {
    // Use navigator.sendBeacon for guaranteed delivery on mobile navigation
    const payload = JSON.stringify({ event, path });

    // Try sendBeacon first (best for unload/mobile)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_BASE}/analytics/event`, payload);
    } else {
      // Fallback to fetch with keepalive
      fetch(`${API_BASE}/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // silently fail — analytics should never break the app
  }
}

export function trackPageView(path) {
  trackEvent("page_view", path);
}

export function trackReserveClick() {
  // Ensure tracking completes before navigation on mobile
  trackEvent("click_reserve", window.location.pathname);

  // Add small delay on mobile to let sendBeacon queue the request
  if (navigator.sendBeacon) {
    return new Promise((resolve) => setTimeout(resolve, 50));
  }
}
