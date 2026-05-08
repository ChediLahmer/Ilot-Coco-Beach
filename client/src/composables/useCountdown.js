import { ref, onMounted, onUnmounted } from "vue";

const now = ref(Date.now());
let subscribers = 0;
let intervalId = null;

export function useCountdown() {
  onMounted(() => {
    if (subscribers === 0) {
      now.value = Date.now();
      intervalId = setInterval(() => {
        now.value = Date.now();
      }, 1000);
    }
    subscribers++;
  });

  onUnmounted(() => {
    subscribers--;
    if (subscribers === 0 && intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  return now;
}
