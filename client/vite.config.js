import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/vue") ||
            id.includes("node_modules/vue-router") ||
            id.includes("node_modules/vue-i18n")
          ) {
            return "vendor-vue";
          }
          if (id.includes("node_modules/swiper")) {
            return "vendor-swiper";
          }
          if (id.includes("node_modules/gsap")) {
            return "vendor-gsap";
          }
        },
      },
    },
    cssCodeSplit: true,
    target: "es2020",
  },
});
