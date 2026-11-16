import { ref } from 'vue'

import { userMessage } from '../api/http'

/**
 * Lo que comparten los formularios que guardan en el servidor: evitar el doble
 * envío, saber si está guardando y mostrar el error dentro del formulario.
 */
export function useSaveForm() {
  const isSaving = ref(false)
  const error = ref('')

  /** Ejecuta la operación. Devuelve su resultado, o undefined si falló. */
  async function save(operation) {
    if (isSaving.value) return undefined
    isSaving.value = true
    error.value = ''
    try {
      return await operation()
    } catch (failure) {
      error.value = userMessage(failure)
      return undefined
    } finally {
      isSaving.value = false
    }
  }

  function reset() {
    error.value = ''
  }

  return { isSaving, error, save, reset }
}
