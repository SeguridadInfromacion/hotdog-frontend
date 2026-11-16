import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../src/stores/auth'

const ADMIN = { id: '1', username: 'admin', full_name: 'Ana Admin', role: 'admin' }

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status })
}

describe('sesión', () => {
  let auth

  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    auth = useAuthStore()
  })

  afterEach(() => {
    auth.clear()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('recupera la sesión preguntándole al servidor, una sola vez', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(200, ADMIN)))

    await Promise.all([auth.restore(), auth.restore()])
    await auth.restore()

    expect(auth.user).toEqual(ADMIN)
    expect(auth.isAdmin).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('sin sesión en el servidor, queda sin usuario y no insiste', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json(401, { detail: 'Debes iniciar sesión.' })),
    )

    await auth.restore()
    await auth.restore()

    expect(auth.user).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('si falló la red, vuelve a preguntar en vez de dar por cerrada la sesión', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(json(200, ADMIN)),
    )

    await auth.restore()
    expect(auth.user).toBeNull()

    await auth.restore()
    expect(auth.user).toEqual(ADMIN)
  })

  it('renueva el token periódicamente mientras hay sesión, y deja de hacerlo al salir', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(json(200, { user: ADMIN, expires_at: '' }))),
    )
    await auth.login('admin', 'clave')
    const refreshes = () => fetch.mock.calls.filter(([path]) => path === '/api/auth/refresh')

    await vi.advanceTimersByTimeAsync(9 * 60 * 1000)
    expect(refreshes()).toHaveLength(2)

    auth.clear()
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
    expect(refreshes()).toHaveLength(2)
  })

  it('cerrar sesión nunca lanza error: informa si el servidor no se enteró', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    expect(await auth.logout()).toBe(false)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(204)))
    expect(await auth.logout()).toBe(true)
  })
})
