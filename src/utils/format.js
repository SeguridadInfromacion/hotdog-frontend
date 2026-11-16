const LOCALE = 'es-CO'

const priceFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })
const timeFormat = new Intl.DateTimeFormat(LOCALE, { timeStyle: 'medium' })

/** 12000 -> "$ 12.000" */
export function formatPrice(pesos) {
  return priceFormat.format(pesos)
}

export function formatDateTime(isoString) {
  return dateTimeFormat.format(new Date(isoString))
}

export function formatTime(isoString) {
  return timeFormat.format(new Date(isoString))
}

/** Número corto y legible para una venta, a partir de su identificador. */
export function shortOrderNumber(orderId) {
  return orderId.slice(0, 6).toUpperCase()
}

export const ROLE_LABELS = { admin: 'Administrador', cashier: 'Cajero' }

const ACTION_LABELS = {
  'login.ok': 'Inició sesión',
  'login.fallido': 'Intento de ingreso fallido',
  'login.bloqueo': 'Cuenta bloqueada por intentos fallidos',
  'usuario.crear': 'Creó un usuario',
  'usuario.editar': 'Editó un usuario',
  'producto.crear': 'Agregó un producto al menú',
  'producto.editar': 'Editó un producto del menú',
  'producto.eliminar': 'Eliminó un producto del menú',
  'venta.registrar': 'Registró una venta',
}

export function describeAction(action) {
  return ACTION_LABELS[action] ?? action
}

export function isAlertAction(action) {
  return action === 'login.fallido' || action === 'login.bloqueo'
}
