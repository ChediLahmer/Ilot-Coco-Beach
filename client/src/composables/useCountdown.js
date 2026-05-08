import { ref, onMounted, onUnmounted } from "vue";

const now = ref(Date.now());
let subscribers = 0;
let timer = null;

function tick() {
  now.value = Date.now();
  timer = requestAnimationFrame(() => {
    setTimeout(tick, 1000);
  });
}

export function useCountdown() {
  onMounted(() => {
    if (subscribers === 0) {
      now.value = Date.now();
      tick();
    }
    subscribers++;
  });

  onUnmounted(() => {
    subscribers--;
    if (subscribers === 0 && timer != null) {
      cancelAnimationFrame(timer);
      timer = null;
    }
  });

  return now;
}
