import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export function useCarousel(itemCount, options = {}) {
  const {
    visibleCount = 1,
    autoInterval = 4000,
    loop = true,
  } = options

  const current = ref(0)
  const paused = ref(false)
  let timer = null

  const maxIndex = computed(() => Math.max(0, itemCount.value - visibleCount))
  const translateX = computed(() => -(current.value * (100 / visibleCount)))

  function next() {
    if (current.value >= maxIndex.value) {
      current.value = loop ? 0 : maxIndex.value
    } else {
      current.value++
    }
  }

  function prev() {
    if (current.value <= 0) {
      current.value = loop ? maxIndex.value : 0
    } else {
      current.value--
    }
  }

  function goTo(idx) {
    current.value = Math.max(0, Math.min(idx, maxIndex.value))
  }

  function pause() { paused.value = true }
  function resume() { paused.value = false }

  function startTimer() {
    stopTimer()
    if (autoInterval > 0) {
      timer = setInterval(() => {
        if (!paused.value) next()
      }, autoInterval)
    }
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null }
  }

  // Dot count for pagination indicators
  const dotCount = computed(() => maxIndex.value + 1)

  onMounted(startTimer)
  onUnmounted(stopTimer)

  return {
    current,
    maxIndex,
    translateX,
    dotCount,
    next,
    prev,
    goTo,
    pause,
    resume,
    paused,
  }
}
