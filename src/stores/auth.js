import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  let restoring = null

  /** Pregunta al servidor quién es el usuario (la cookie de sesión no se puede leer). */
  function restore() {
    restoring ??= authApi
      .me()
      .then((current) => {
        user.value = current
      })
      .catch(() => {
        user.value = null
      })
    return restoring
  }

  async function login(username, password) {
    const session = await authApi.login(username, password)
    user.value = session.user
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clear()
    }
  }

  function clear() {
    user.value = null
  }

  return { user, isAdmin, restore, login, logout, clear }
})
