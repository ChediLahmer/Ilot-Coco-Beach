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
        path: "config",
        name: "config",
        component: () => import("@/views/ConfigView.vue"),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { token } = useAuth();
  if (to.meta.requiresAuth && !token.value) {
    return { name: "login" };
  }
});
