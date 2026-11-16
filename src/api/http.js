// Única puerta de salida hacia la API.
//
// - La sesión viaja en una cookie HttpOnly que este código NO puede leer:
//   aquí no se guarda ningún token (ni en localStorage ni en memoria).
// - Toda petición lleva la cabecera anti-CSRF que exigen los servicios.

const CSRF_HEADER = { 'X-Requested-With': 'XMLHttpRequest' }
const VALIDATION_PREFIX = 'Value error, '
const TIMEOUT_MS = 15_000
const NO_CONTENT = 204

export const MESSAGES = {
  offline: 'No hay conexión con el servidor. Revisa tu red e intenta de nuevo.',
  invalidForm: 'Revisa los datos del formulario e intenta de nuevo.',
  generic: 'Algo salió mal. Intenta de nuevo.',
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  /** La petición no llegó o no se supo si llegó (sin red, tiempo agotado). */
  get isNetworkFailure() {
    return this.status === 0
  }

  get isSessionExpired() {
    return this.status === 401
  }
}

/** Mensaje apto para mostrar: nunca el texto técnico de un error inesperado. */
export function userMessage(failure) {
  return failure instanceof ApiError ? failure.message : MESSAGES.generic
}

let onSessionExpired = () => {}

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

/** Convierte el cuerpo de un error de la API en un mensaje para mostrar. */
export function messageFrom(payload) {
  const detail = payload?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const custom = detail
      .map((issue) => issue?.msg)
      .find((msg) => typeof msg === 'string' && msg.startsWith(VALIDATION_PREFIX))
    return custom ? custom.slice(VALIDATION_PREFIX.length) : MESSAGES.invalidForm
  }
  return MESSAGES.generic
}

async function request(method, path, { body, expectSession = true } = {}) {
  const hasBody = body !== undefined
  let response
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: { ...CSRF_HEADER, ...(hasBody && { 'Content-Type': 'application/json' }) },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(0, MESSAGES.offline)
  }

  if (response.status === NO_CONTENT) return null
  const payload = await response.json().catch(() => undefined)

  if (!response.ok) {
    if (response.status === 401 && expectSession) onSessionExpired()
    throw new ApiError(response.status, messageFrom(payload))
  }
  // Un 200 que no trae JSON no es una respuesta de nuestra API: no se usa.
  if (payload === undefined) throw new ApiError(response.status, MESSAGES.generic)
  return payload
}

export const http = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
}
