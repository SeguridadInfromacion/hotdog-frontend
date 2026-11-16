import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchAuditTrail } from '../src/api'
import { ApiError } from '../src/api/http'

const entry = (occurred_at, action) => ({ occurred_at, actor: 'admin', action, target: '', ip: '' })

/** Simula el gateway: cada ruta de bitácora responde lo que se le indique. */
function stubServices(responses) {
  vi.stubGlobal(
    'fetch',
    vi.fn((path) => {
      const { status = 200, body } = responses[path]
      return Promise.resolve(new Response(JSON.stringify(body), { status }))
    }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('bitácora unificada de los tres servicios', () => {
  it('mezcla las tres fuentes, de lo más reciente a lo más antiguo', async () => {
    stubServices({
      '/api/auth/audit': { body: [entry('2026-11-16T10:00:00Z', 'login.ok')] },
      // Con y sin fracción de segundo: el orden debe ser por fecha, no por texto.
      '/api/products/audit': { body: [entry('2026-11-16T10:00:00.500000Z', 'producto.crear')] },
      '/api/orders/audit': { body: [entry('2026-11-16T09:00:00Z', 'venta.registrar')] },
    })

    const { entries, unavailable } = await fetchAuditTrail()

    expect(unavailable).toEqual([])
    expect(entries.map((e) => [e.service, e.action])).toEqual([
      ['Menú', 'producto.crear'],
      ['Usuarios', 'login.ok'],
      ['Ventas', 'venta.registrar'],
    ])
  })

  it('si un servicio cae, muestra los demás y dice cuál faltó', async () => {
    stubServices({
      '/api/auth/audit': { body: [entry('2026-11-16T10:00:00Z', 'login.ok')] },
      '/api/products/audit': { body: [] },
      '/api/orders/audit': { status: 503, body: { detail: 'No disponible' } },
    })

    const { entries, unavailable } = await fetchAuditTrail()

    expect(entries).toHaveLength(1)
    expect(unavailable).toEqual(['Ventas'])
  })

  it('si no responde ninguno, es un error y no una bitácora vacía', async () => {
    const down = { status: 503, body: { detail: 'El servicio no está disponible.' } }
    stubServices({
      '/api/auth/audit': down,
      '/api/products/audit': down,
      '/api/orders/audit': down,
    })

    const failure = await fetchAuditTrail().catch((error) => error)

    expect(failure).toBeInstanceOf(ApiError)
    expect(failure.message).toBe('El servicio no está disponible.')
  })
})
