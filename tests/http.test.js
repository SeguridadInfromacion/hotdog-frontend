import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, http, MESSAGES, messageFrom, setSessionExpiredHandler } from '../src/api/http'

function respondWith(status, body) {
  const response = new Response(body === undefined ? null : JSON.stringify(body), { status })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionExpiredHandler(() => {})
})

describe('messageFrom', () => {
  it('usa el mensaje del servidor cuando es texto', () => {
    expect(messageFrom({ detail: 'Ese producto no existe.' })).toBe('Ese producto no existe.')
  })

  it('extrae los mensajes de validación escritos por nosotros', () => {
    const payload = {
      detail: [{ msg: 'Value error, La contraseña debe incluir letras y números.' }],
    }
    expect(messageFrom(payload)).toBe('La contraseña debe incluir letras y números.')
  })

  it('no muestra mensajes técnicos de validación', () => {
    const payload = { detail: [{ msg: 'String should have at least 2 characters' }] }
    expect(messageFrom(payload)).toBe(MESSAGES.invalidForm)
  })

  it('tiene un mensaje genérico para respuestas inesperadas', () => {
    expect(messageFrom(null)).toBe(MESSAGES.generic)
  })
})

describe('http', () => {
  it('envía la cabecera anti-CSRF y las cookies solo al mismo origen', async () => {
    respondWith(200, [])

    await http.post('/api/products', { name: 'Perro' })

    const [, options] = fetch.mock.calls[0]
    expect(options.headers['X-Requested-With']).toBe('XMLHttpRequest')
    expect(options.credentials).toBe('same-origin')
    expect(options.body).toBe('{"name":"Perro"}')
  })

  it('convierte un error de la API en ApiError con su estado', async () => {
    respondWith(409, { detail: 'Ya hay un producto con ese nombre.' })

    const failure = await http.post('/api/products', {}).catch((error) => error)

    expect(failure).toBeInstanceOf(ApiError)
    expect(failure.status).toBe(409)
    expect(failure.message).toBe('Ya hay un producto con ese nombre.')
  })

  it('avisa que la sesión venció cuando llega un 401', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    respondWith(401, { detail: 'Debes iniciar sesión.' })

    await http.get('/api/orders').catch(() => {})

    expect(onExpired).toHaveBeenCalledOnce()
  })

  it('no trata un login fallido como sesión vencida', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    respondWith(401, { detail: 'Usuario o contraseña incorrectos.' })

    await http.post('/api/auth/login', {}, { expectSession: false }).catch(() => {})

    expect(onExpired).not.toHaveBeenCalled()
  })

  it('explica cuando no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const failure = await http.get('/api/orders').catch((error) => error)

    expect(failure.message).toBe(MESSAGES.offline)
  })
})
