import { createRouter, createWebHistory } from "vue-router";

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

export default router;
