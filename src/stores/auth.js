import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authApi } from '../api'

// El token dura 10 minutos; se renueva antes de que venza mientras la caja esté
// abierta. Si desactivan al usuario, la renovación falla y la sesión se cierra.
const KEEP_ALIVE_MS = 4 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  let hasAskedServer = false
  let pendingRestore = null
  let keepAliveTimer = null

  function startKeepAlive() {
    stopKeepAlive()
    // Un fallo de red se ignora (se reintenta en el próximo ciclo); un 401 lo
    // atiende el manejador global de sesión vencida.
    keepAliveTimer = setInterval(() => authApi.refresh().catch(() => {}), KEEP_ALIVE_MS)
  }

  function stopKeepAlive() {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
  }

  function begin(current) {
    user.value = current
    hasAskedServer = true
    startKeepAlive()
  }

  /**
   * Pregunta al servidor quién es el usuario (la cookie de sesión no se puede leer).
   * Solo se da por respondida con un sí o un "no hay sesión": si falló la red,
   * se vuelve a preguntar en la siguiente navegación.
   */
  function restore() {
    if (hasAskedServer) return Promise.resolve()
    pendingRestore ??= authApi
      .me()
      .then(begin, (failure) => {
        user.value = null
        hasAskedServer = failure.isSessionExpired === true
      })
      .finally(() => {
        pendingRestore = null
      })
    return pendingRestore
  }

  async function login(username, password) {
    const session = await authApi.login(username, password)
    begin(session.user)
  }

  /**
   * Cierra la sesión en el servidor (invalida el token). Nunca lanza error:
   * devuelve false si no se pudo avisar al servidor.
   */
  async function logout() {
    try {
      await authApi.logout()
      return true
    } catch {
      return false
    }
  }

  function clear() {
    stopKeepAlive()
    user.value = null
  }

  function updateCurrentUser(updated) {
    if (user.value?.id === updated.id) user.value = updated
  }

  return { user, isAdmin, restore, login, logout, clear, updateCurrentUser }
})
