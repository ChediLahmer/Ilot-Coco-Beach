<template>
  <div class="space-y-6 px-6 py-16">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 space-y-3">
        <div class="h-3 w-20 animate-pulse rounded bg-ocean/20" />
        <div class="h-8 w-64 animate-pulse rounded bg-sand-dark/20" />
      </div>
      <div class="grid gap-6" :class="gridClass">
        <div
          v-for="i in count"
          :key="i"
          class="aspect-[4/3] animate-pulse rounded-2xl bg-gradient-to-br from-sand/40 to-sand-dark/20"
          :style="{ animationDelay: `${i * 100}ms` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 },
  gridClass: {
    type: String,
    default: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  },
});
</script>
