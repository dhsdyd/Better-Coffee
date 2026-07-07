import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/beans', name: 'beans', component: () => import('@/views/BeansView.vue') },
  { path: '/brewing', name: 'brewing', component: () => import('@/views/BrewingView.vue') },
  { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
