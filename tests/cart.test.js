import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  ADDED,
  LINES_LIMIT,
  MAX_LINES,
  MAX_QUANTITY,
  QUANTITY_LIMIT,
  useCartStore,
} from '../src/stores/cart'

const especial = { id: 'a', name: 'Perro Especial', price: 12000 }
const sencillo = { id: 'b', name: 'Perro Sencillo', price: 8000 }

describe('pedido en curso', () => {
  let cart

  beforeEach(() => {
    setActivePinia(createPinia())
    cart = useCartStore()
  })

  it('empieza vacío', () => {
    expect(cart.isEmpty).toBe(true)
    expect(cart.total).toBe(0)
  })

  it('agrupa el mismo producto en un solo renglón y suma el total', () => {
    cart.add(especial)
    cart.add(especial)
    cart.add(sencillo)

    expect(cart.lines).toHaveLength(2)
    expect(cart.itemCount).toBe(3)
    expect(cart.total).toBe(32000)
  })

  it('no deja pasar del máximo de unidades por producto', () => {
    for (let i = 0; i < MAX_QUANTITY; i++) expect(cart.add(especial)).toBe(ADDED)

    expect(cart.add(especial)).toBe(QUANTITY_LIMIT)
    expect(cart.quantityOf('a')).toBe(MAX_QUANTITY)
  })

  it('no deja pasar del máximo de productos distintos', () => {
    for (let i = 0; i < MAX_LINES; i++) cart.add({ id: `p${i}`, name: `Perro ${i}`, price: 1000 })

    expect(cart.add(especial)).toBe(LINES_LIMIT)
    expect(cart.lines).toHaveLength(MAX_LINES)
  })

  it('quita el renglón cuando la cantidad llega a cero', () => {
    cart.add(especial)
    cart.decrement('a')

    expect(cart.isEmpty).toBe(true)
  })

  it('envía al servidor solo ids y cantidades, nunca precios', () => {
    cart.add(especial)
    cart.add(especial)

    expect(cart.payload).toEqual([{ product_id: 'a', quantity: 2 }])
  })

  describe('al recargar el menú', () => {
    it('actualiza el precio y el nombre de lo que sigue en venta', () => {
      cart.add(especial)
      cart.add(especial)

      const removed = cart.reconcile([{ id: 'a', name: 'Perro Especial XL', price: 15000 }])

      expect(removed).toEqual([])
      expect(cart.lines[0].product.name).toBe('Perro Especial XL')
      expect(cart.total).toBe(30000)
    })

    it('quita lo que ya no se vende y dice qué quitó', () => {
      cart.add(especial)
      cart.add(sencillo)

      const removed = cart.reconcile([sencillo])

      expect(removed).toEqual(['Perro Especial'])
      expect(cart.payload).toEqual([{ product_id: 'b', quantity: 1 }])
    })
  })
})
