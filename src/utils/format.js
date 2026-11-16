const LOCALE = 'es-CO'

const priceFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })
const preciseFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'medium' })
const timeFormat = new Intl.DateTimeFormat(LOCALE, { timeStyle: 'medium' })

/** 12000 -> "$ 12.000" */
export function formatPrice(pesos) {
  return priceFormat.format(pesos)
}

export function formatDateTime(isoString) {
  return dateTimeFormat.format(new Date(isoString))
}

/** Con segundos: en una bitácora varios hechos caen en el mismo minuto. */
export function formatPreciseDateTime(isoString) {
  return preciseFormat.format(new Date(isoString))
}

export function formatTime(isoString) {
  return timeFormat.format(new Date(isoString))
}

const ORDER_NUMBER_LENGTH = 6

/** Número corto y legible para una venta, a partir de su identificador. */
export function shortOrderNumber(orderId) {
  return orderId.slice(0, ORDER_NUMBER_LENGTH).toUpperCase()
}

export const ROLE_LABELS = { admin: 'Administrador', cashier: 'Cajero' }

const ACTION_LABELS = {
  'login.ok': 'Inició sesión',
  'login.fallido': 'Intento de ingreso fallido',
  'login.bloqueo': 'Ingreso bloqueado por intentos fallidos',
  logout: 'Cerró sesión',
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
