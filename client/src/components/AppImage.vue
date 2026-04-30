<template>
  <div class="app-image relative overflow-hidden" :class="wrapClass">
    <div
      v-if="!loaded"
      class="absolute inset-0 animate-pulse bg-gradient-to-br from-sand/60 to-sand-dark/30"
    />
    <img
      ref="imgEl"
      :src="isVisible ? src : undefined"
      :alt="alt"
      :class="[
        'transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        imgClass,
      ]"
      :loading="eager ? 'eager' : 'lazy'"
      :decoding="eager ? 'sync' : 'async'"
      @load="loaded = true"
      @error="loaded = true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
  imgClass: { type: String, default: "h-full w-full object-cover" },
  wrapClass: { type: String, default: "" },
  eager: { type: Boolean, default: false },
});

const loaded = ref(false);
const isVisible = ref(props.eager);
const imgEl = ref(null);

let observer = null;

onMounted(() => {
  if (props.eager || !imgEl.value) {
    isVisible.value = true;
    return;
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(imgEl.value);
});

onUnmounted(() => observer?.disconnect());
</script>
