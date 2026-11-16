// Un módulo por servicio del backend. Cada grupo de rutas lo atiende
// un contenedor distinto detrás del gateway.

import { http } from './http'

/** auth-service */
export const authApi = {
  login: (username, password) =>
    http.post('/api/auth/login', { username, password }, { expectSession: false }),
  logout: () => http.post('/api/auth/logout', undefined, { expectSession: false }),
  me: () => http.get('/api/auth/me', { expectSession: false }),
}

/** auth-service */
export const usersApi = {
  list: () => http.get('/api/users'),
  create: (user) => http.post('/api/users', user),
  update: (id, changes) => http.patch(`/api/users/${encodeURIComponent(id)}`, changes),
}

/** products-service */
export const productsApi = {
  list: ({ onlyAvailable = false } = {}) =>
    http.get(`/api/products${onlyAvailable ? '?only_available=true' : ''}`),
  create: (product) => http.post('/api/products', product),
  update: (id, product) => http.put(`/api/products/${encodeURIComponent(id)}`, product),
  remove: (id) => http.delete(`/api/products/${encodeURIComponent(id)}`),
}

/** orders-service */
export const ordersApi = {
  list: () => http.get('/api/orders'),
  summary: () => http.get('/api/orders/summary'),
  create: (order) => http.post('/api/orders', order),
}

const AUDIT_SOURCES = [
  { service: 'Usuarios', path: '/api/auth/audit' },
  { service: 'Menú', path: '/api/products/audit' },
  { service: 'Ventas', path: '/api/orders/audit' },
]

/**
 * Junta la bitácora de los tres servicios. Si uno no responde, se muestran
 * los demás y se avisa cuál faltó: el sistema sigue funcionando por partes.
 */
export async function fetchAuditTrail() {
  const results = await Promise.allSettled(AUDIT_SOURCES.map(({ path }) => http.get(path)))
  const entries = []
  const unavailable = []
  results.forEach((result, index) => {
    const { service } = AUDIT_SOURCES[index]
    if (result.status === 'fulfilled') {
      entries.push(...result.value.map((entry) => ({ ...entry, service })))
    } else {
      unavailable.push(service)
    }
  })
  entries.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
  return { entries, unavailable }
}
