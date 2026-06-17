import { createRouter, createWebHistory } from "vue-router";
import { trackPageView } from "@/composables/useAnalytics";
import { useConfig, configReady } from "@/composables/useConfig";
import { applyRouteSeo } from "@/composables/useSeo";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/gallery",
    name: "gallery",
    component: () => import("@/views/GalleryView.vue"),
  },
  {
    path: "/menu",
    name: "menu",
    component: () => import("@/views/MenuPage.vue"),
  },
  {
    path: "/spaces",
    name: "spaces",
    component: () => import("@/views/EmplacementsPage.vue"),
  },
  {
    path: "/offers",
    name: "offers",
    component: () => import("@/views/OffersPage.vue"),
  },
  {
    path: "/reviews",
    name: "reviews",
    component: () => import("@/views/ReviewsPage.vue"),
    meta: { requiresReviews: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach(async (to) => {
  if (to.meta.requiresReviews) {
    await configReady;
    const config = useConfig();
    if (!config.showReviews) return { name: "home" };
  }
});

router.afterEach((to) => {
  applyRouteSeo(to.name, to.fullPath);
  trackPageView(to.fullPath);
});

export default router;
