// v-play-visible: plays a <video> only while it is on screen and pauses it when
// it scrolls out. A gallery with many autoplaying videos otherwise decodes them
// all at once, which severely degrades performance. This keeps the lively look
// but bounds active playback to what the visitor is actually looking at.
const observers = new WeakMap();

function safePlay(el) {
  const result = el.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {});
  }
}

export const playVisible = {
  mounted(el) {
    el.muted = true; // muted is required for programmatic autoplay
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            safePlay(el);
          } else if (!el.paused) {
            el.pause();
          }
        }
      },
      { threshold: 0.2, rootMargin: "150px" },
    );
    observer.observe(el);
    observers.set(el, observer);
  },
  unmounted(el) {
    const observer = observers.get(el);
    if (observer) {
      observer.disconnect();
      observers.delete(el);
    }
    try {
      el.pause();
    } catch {
      // element already detached
    }
  },
};
