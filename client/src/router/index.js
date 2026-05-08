import { createRouter, createWebHistory } from "vue-router";
import { trackPageView } from "@/composables/useAnalytics";

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

router.afterEach((to) => {
  trackPageView(to.fullPath);
});

export default router;
