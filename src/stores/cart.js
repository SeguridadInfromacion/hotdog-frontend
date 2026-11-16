import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// El servidor valida el mismo tope; aquí solo se evita pedir algo que rechazará.
export const MAX_QUANTITY = 20

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

  /** Suma una unidad. Devuelve false si ya se alcanzó el máximo. */
  function add(product) {
    const line = findLine(product.id)
    if (!line) {
      lines.value.push({ product, quantity: 1 })
      return true
    }
    if (line.quantity >= MAX_QUANTITY) return false
    line.quantity += 1
    return true
  }

  function decrement(productId) {
    const line = findLine(productId)
    if (!line) return
    if (line.quantity <= 1) remove(productId)
    else line.quantity -= 1
  }

  function remove(productId) {
    lines.value = lines.value.filter((line) => line.product.id !== productId)
  }

  function clear() {
    lines.value = []
  }

  return { lines, isEmpty, itemCount, total, payload, quantityOf, add, decrement, remove, clear }
})
