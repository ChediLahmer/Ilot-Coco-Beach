import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export function useHorizontalRail(itemCount, options = {}) {
  const {
    autoInterval = 4200,
    minStep = 280,
    stepFactor = 0.78,
    wrap = true,
    itemSelector = "[data-rail-item]",
  } = options;

  const scrollerEl = ref(null);
  const canScrollLeft = ref(false);
  const canScrollRight = ref(false);
  const hasOverflow = ref(false);
  const paused = ref(false);
  let timer = null;

  function handleResize() {
    updateScrollState();
  }

  function getStepWidth() {
    const el = scrollerEl.value;
    if (!el) return minStep;

    const firstItem = el.querySelector(itemSelector);
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

    if (firstItem) {
      return Math.max(firstItem.getBoundingClientRect().width + gap, minStep);
    }

    return Math.max(el.clientWidth * stepFactor, minStep);
  }

  function updateScrollState() {
    const el = scrollerEl.value;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

    hasOverflow.value = maxScroll > 4;
    canScrollLeft.value = el.scrollLeft > 4;
    canScrollRight.value = el.scrollLeft < maxScroll - 4;
  }

  function reset(behavior = "auto") {
    const el = scrollerEl.value;
    if (!el) return;

    el.scrollTo({ left: 0, behavior });
    updateScrollState();
  }

  function scrollByStep(direction, behavior = "smooth") {
    const el = scrollerEl.value;
    if (!el) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (maxScroll <= 4) {
      reset("auto");
      return;
    }

    const step = getStepWidth();
    const current = el.scrollLeft;
    let target = current;

    if (direction > 0) {
      if (current >= maxScroll - 4) {
        target = wrap ? 0 : maxScroll;
      } else {
        target = Math.round((current + step) / step) * step;
        if (target > maxScroll) target = maxScroll;
      }
    } else if (direction < 0) {
      if (current <= 4) {
        target = wrap ? maxScroll : 0;
      } else {
        target = Math.round((current - step) / step) * step;
        if (target < 0) target = 0;
      }
    }

    target = Math.max(0, Math.min(maxScroll, target));
    el.scrollTo({ left: target, behavior });
    window.setTimeout(updateScrollState, behavior === "smooth" ? 280 : 0);
  }

  function pause() {
    paused.value = true;
  }

  function resume() {
    paused.value = false;
  }

  function stopAuto() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startAuto() {
    stopAuto();

    if (autoInterval <= 0) return;

    timer = window.setInterval(() => {
      if (!paused.value && hasOverflow.value && itemCount.value > 1) {
        scrollByStep(1);
      }
    }, autoInterval);
  }

  watch(itemCount, async () => {
    await nextTick();
    updateScrollState();
    reset("auto");
    startAuto();
  });

  onMounted(async () => {
    await nextTick();
    updateScrollState();
    startAuto();
    window.addEventListener("resize", handleResize);

    window.setTimeout(updateScrollState, 180);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateScrollState();
      });
    }
  });

  onUnmounted(() => {
    stopAuto();
    window.removeEventListener("resize", handleResize);
  });

  return {
    scrollerEl,
    canScrollLeft,
    canScrollRight,
    hasOverflow,
    scrollByStep,
    updateScrollState,
    reset,
    pause,
    resume,
    paused,
  };
}
