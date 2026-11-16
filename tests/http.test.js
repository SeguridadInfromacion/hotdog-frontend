import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ApiError,
  http,
  MESSAGES,
  messageFrom,
  setSessionExpiredHandler,
  userMessage,
} from '../src/api/http'

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

describe('userMessage', () => {
  it('muestra el mensaje de un error de la API', () => {
    expect(userMessage(new ApiError(409, 'Ya existe.'))).toBe('Ya existe.')
  })

  it('nunca muestra el texto técnico de un error inesperado', () => {
    const bug = new TypeError("Cannot read properties of null (reading 'map')")
    expect(userMessage(bug)).toBe(MESSAGES.generic)
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

  it('pone un tiempo máximo de espera a cada petición', async () => {
    respondWith(200, [])

    await http.get('/api/products')

    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('convierte un error de la API en ApiError con su estado', async () => {
    respondWith(409, { detail: 'Ya hay un producto con ese nombre.' })

    const failure = await http.post('/api/products', {}).catch((error) => error)

    expect(failure).toBeInstanceOf(ApiError)
    expect(failure.status).toBe(409)
    expect(failure.message).toBe('Ya hay un producto con ese nombre.')
  })

  it('devuelve null en una respuesta sin contenido', async () => {
    respondWith(204)
    expect(await http.delete('/api/products/1')).toBeNull()
  })

  it('no acepta un 200 que no trae JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })))

    const failure = await http.get('/api/products').catch((error) => error)

    expect(failure).toBeInstanceOf(ApiError)
    expect(failure.message).toBe(MESSAGES.generic)
  })

  it('avisa que la sesión venció cuando llega un 401', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    respondWith(401, { detail: 'Debes iniciar sesión.' })

    const failure = await http.get('/api/orders').catch((error) => error)

    expect(onExpired).toHaveBeenCalledOnce()
    expect(failure.isSessionExpired).toBe(true)
  })

  it('no trata un login fallido como sesión vencida', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    respondWith(401, { detail: 'Usuario o contraseña incorrectos.' })

    await http.post('/api/auth/login', {}, { expectSession: false }).catch(() => {})

    expect(onExpired).not.toHaveBeenCalled()
  })

  it('explica cuando no hay conexión o se agota el tiempo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const failure = await http.get('/api/orders').catch((error) => error)

    expect(failure.message).toBe(MESSAGES.offline)
    expect(failure.isNetworkFailure).toBe(true)
  })
})
