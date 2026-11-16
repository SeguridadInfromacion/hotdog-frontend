import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { MAX_QUANTITY, useCartStore } from '../src/stores/cart'

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

  it('no deja pasar del máximo por producto', () => {
    for (let i = 0; i < MAX_QUANTITY; i++) expect(cart.add(especial)).toBe(true)

    expect(cart.add(especial)).toBe(false)
    expect(cart.quantityOf('a')).toBe(MAX_QUANTITY)
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
})
