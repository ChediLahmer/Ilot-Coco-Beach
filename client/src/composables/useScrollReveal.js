import { onMounted, onUnmounted, nextTick } from "vue";

export function useScrollReveal(containerRef, options = {}) {
  const {
    selector = "[data-reveal]",
    threshold = 0.15,
    rootMargin = "0px 0px -40px 0px",
  } = options;

  let observer = null;
  let mutationObserver = null;
  const observed = new WeakSet();

  function observeElement(el) {
    if (!el || observed.has(el)) return;
    observed.add(el);
    observer?.observe(el);
  }

  function observeTargets(root) {
    root.querySelectorAll(selector).forEach((el) => observeElement(el));
  }

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

    observeTargets(root);

    mutationObserver = new MutationObserver(() => {
      observeTargets(root);
    });
    mutationObserver.observe(root, { childList: true, subtree: true });
  }

  onMounted(() => nextTick(() => setTimeout(init, 100)));
  onUnmounted(() => {
    observer?.disconnect();
    mutationObserver?.disconnect();
  });
}
