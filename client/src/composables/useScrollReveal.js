import { onMounted, onUnmounted, nextTick } from "vue";

export function useScrollReveal(containerRef, options = {}) {
  const {
    selector = "[data-reveal]",
    threshold = 0.15,
    rootMargin = "0px 0px -40px 0px",
  } = options;

  let observer = null;

  function init() {
    const root = containerRef?.value;
    if (!root) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin },
    );

    root.querySelectorAll(selector).forEach((el) => observer.observe(el));
  }

  onMounted(() => nextTick(() => setTimeout(init, 100)));
  onUnmounted(() => observer?.disconnect());
}
