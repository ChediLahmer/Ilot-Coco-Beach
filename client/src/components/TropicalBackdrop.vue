<template>
  <div class="tropical-backdrop" aria-hidden="true">
    <!-- warm sun-washed canvas: sky → seafoam → sand -->
    <div class="tb-canvas" />

    <!-- soft golden sun resting in the top corner -->
    <div class="tb-sun" />

    <!-- gentle haze keeps the centre luminous so text stays readable -->
    <div class="tb-haze" />

    <!-- elegant palm fronds framing the top corners -->
    <svg class="tb-palm tb-palm--left" viewBox="0 0 200 200" fill="none">
      <g class="tb-sway">
        <path
          v-for="(d, i) in frond"
          :key="`l${i}`"
          :d="d"
          fill="currentColor"
        />
      </g>
    </svg>
    <svg class="tb-palm tb-palm--right" viewBox="0 0 200 200" fill="none">
      <g class="tb-sway tb-sway--slow">
        <path
          v-for="(d, i) in frond"
          :key="`r${i}`"
          :d="d"
          fill="currentColor"
        />
      </g>
    </svg>

    <!-- faint paper grain for a warm, printed-menu texture -->
    <div class="tb-grain" />
  </div>
</template>

<script setup>
// One stylised palm frond (rachis + leaflets), reused and mirrored. Static
// geometry — cheap to render with no per-frame JS.
const frond = [
  "M20 20 C70 40 120 80 175 165 C118 95 70 55 20 20 Z",
  "M20 20 C74 30 120 70 168 150 C112 86 68 50 20 20 Z",
  "M20 20 C50 60 70 110 92 180 C78 112 48 58 20 20 Z",
  "M20 20 C40 70 52 120 60 185 C58 118 38 60 20 20 Z",
  "M20 20 C95 36 140 60 182 110 C126 78 78 46 20 20 Z",
];
</script>

<style scoped>
.tropical-backdrop {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  pointer-events: none;
}

/* Sun-washed beach gradient: pale sky → seafoam → warm sand. */
.tb-canvas {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    175deg,
    #fef6ec 0%,
    #fdeede 20%,
    #eef9f3 54%,
    #e2f5ef 76%,
    #fcefe0 100%
  );
}

/* Warm low sun glowing from the upper-right corner. */
.tb-sun {
  position: absolute;
  top: -14rem;
  right: -10rem;
  width: 46rem;
  height: 46rem;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    rgba(255, 209, 122, 0.55) 0%,
    rgba(255, 184, 107, 0.26) 38%,
    rgba(255, 184, 107, 0) 70%
  );
  animation: tb-breathe 14s ease-in-out infinite;
}

/* Keeps the middle of the page bright so dark text stays legible. */
.tb-haze {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    72% 56% at 50% 42%,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0) 72%
  );
}

/* ===== Palm fronds ===== */
.tb-palm {
  position: absolute;
  width: 24rem;
  height: 24rem;
  opacity: 0.09;
}

.tb-palm--left {
  top: -3.5rem;
  left: -4.5rem;
  color: #1f8f6f;
  transform: rotate(-8deg);
}

.tb-palm--right {
  top: -4.5rem;
  right: -4.5rem;
  color: #2aa17c;
  transform: scaleX(-1) rotate(-4deg);
}

.tb-sway {
  transform-origin: 20px 20px;
  animation: tb-sway 9s ease-in-out infinite;
}

.tb-sway--slow {
  animation-duration: 12s;
}

/* ===== Grain ===== */
.tb-grain {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes tb-sway {
  0%,
  100% {
    transform: rotate(-2.5deg);
  }
  50% {
    transform: rotate(2.5deg);
  }
}

@keyframes tb-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tb-sun,
  .tb-sway {
    animation: none !important;
  }
}
</style>
