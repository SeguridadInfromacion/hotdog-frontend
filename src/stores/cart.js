import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// El servidor valida los mismos topes; aquí solo se evita pedir algo que rechazará.
export const MAX_QUANTITY = 20
export const MAX_LINES = 20

export const ADDED = 'added'
export const QUANTITY_LIMIT = 'quantity-limit'
export const LINES_LIMIT = 'lines-limit'

/** El pedido que se está armando en la pantalla de venta. */
export const useCartStore = defineStore('cart', () => {
  const lines = ref([])

  const isEmpty = computed(() => lines.value.length === 0)
  const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  // Total de referencia para mostrar: el definitivo lo calcula el servidor.
  const total = computed(() =>
    lines.value.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  )
  const payload = computed(() =>
    lines.value.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
  )

  function findLine(productId) {
    return lines.value.find((line) => line.product.id === productId)
  }

  function quantityOf(productId) {
    return findLine(productId)?.quantity ?? 0
  }

  /** Suma una unidad. Devuelve ADDED, o cuál tope lo impidió. */
  function add(product) {
    const line = findLine(product.id)
    if (!line) {
      if (lines.value.length >= MAX_LINES) return LINES_LIMIT
      lines.value.push({ product, quantity: 1 })
      return ADDED
    }
    if (line.quantity >= MAX_QUANTITY) return QUANTITY_LIMIT
    line.quantity += 1
    return ADDED
  }

  function decrement(productId) {
    const line = findLine(productId)
    if (!line) return
    if (line.quantity <= 1) lines.value = lines.value.filter((other) => other !== line)
    else line.quantity -= 1
  }

  /**
   * Pone el pedido al día con el menú recién cargado: actualiza nombres y precios
   * y quita lo que ya no se vende. Devuelve los nombres de lo que se quitó.
   */
  function reconcile(availableProducts) {
    const current = new Map(availableProducts.map((product) => [product.id, product]))
    const removed = lines.value
      .filter((line) => !current.has(line.product.id))
      .map((line) => line.product.name)
    lines.value = lines.value
      .filter((line) => current.has(line.product.id))
      .map((line) => ({ ...line, product: current.get(line.product.id) }))
    return removed
  }

  function clear() {
    lines.value = []
  }

  return { lines, isEmpty, itemCount, total, payload, quantityOf, add, decrement, reconcile, clear }
})
