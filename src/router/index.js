import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import AuditView from '../views/AuditView.vue'
import LoginView from '../views/LoginView.vue'
import MenuView from '../views/MenuView.vue'
import OrdersView from '../views/OrdersView.vue'
import SellView from '../views/SellView.vue'
import UsersView from '../views/UsersView.vue'

const routes = [
  { path: '/entrar', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/vender', name: 'sell', component: SellView },
  { path: '/ventas', name: 'orders', component: OrdersView },
  { path: '/menu', name: 'menu', component: MenuView, meta: { adminOnly: true } },
  { path: '/usuarios', name: 'users', component: UsersView, meta: { adminOnly: true } },
  { path: '/auditoria', name: 'audit', component: AuditView, meta: { adminOnly: true } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'sell' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Esta guarda es solo comodidad para el usuario: quien de verdad decide
// qué puede hacer cada rol es el servidor, en cada petición.
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()

  if (to.meta.public) return auth.user ? { name: 'sell' } : true
  if (!auth.user) return { name: 'login' }
  if (to.meta.adminOnly && !auth.isAdmin) return { name: 'sell' }
  return true
})
