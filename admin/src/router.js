import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/ForgotPasswordView.vue"),
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("@/views/ResetPasswordView.vue"),
  },
  {
    path: "/",
    component: () => import("@/components/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
      },
      {
        path: "menu",
        name: "menu",
        component: () => import("@/views/MenuView.vue"),
      },
      {
        path: "spaces",
        name: "spaces",
        component: () => import("@/views/SpacesView.vue"),
      },
      {
        path: "gallery",
        name: "gallery",
        component: () => import("@/views/GalleryView.vue"),
      },
      {
        path: "flash-sales",
        name: "flash-sales",
        component: () => import("@/views/FlashSalesView.vue"),
      },
      {
        path: "vouchers",
        name: "vouchers",
        component: () => import("@/views/VouchersView.vue"),
      },
      {
        path: "reviews",
        name: "reviews",
        component: () => import("@/views/ReviewsView.vue"),
      },
      {
        path: "config",
        name: "config",
        component: () => import("@/views/ConfigView.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { token } = useAuth();
  if (to.meta.requiresAuth) {
    if (!token.value) return { name: "login" };
    try {
      const payload = JSON.parse(atob(token.value.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        useAuth().logout();
        return { name: "login" };
      }
    } catch {
      useAuth().logout();
      return { name: "login" };
    }
  }
});
