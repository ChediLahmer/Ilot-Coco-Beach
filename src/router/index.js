import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/GalleryView.vue'),
  },
  {
    path: '/offers',
    name: 'offers',
    component: () => import('@/views/OffersPage.vue'),
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/AdminLogin.vue'),
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/AdminDashboard.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'instant',
      }
    }
    return { top: 0, behavior: 'instant' }
  },
})

export default router
