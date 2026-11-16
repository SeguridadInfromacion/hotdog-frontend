import { ref } from 'vue'

import { userMessage } from '../api/http'

/**
 * Una acción que pide confirmación antes de ejecutarse (eliminar, desactivar...).
 * Guarda sobre qué elemento se está preguntando y muestra el error en el diálogo.
 */
export function useConfirmAction(action) {
  const target = ref(null)
  const isBusy = ref(false)
  const error = ref('')

  function ask(item) {
    error.value = ''
    target.value = item
  }

  function cancel() {
    target.value = null
  }

  async function confirm() {
    if (isBusy.value || target.value === null) return
    isBusy.value = true
    error.value = ''
    try {
      await action(target.value)
      target.value = null
    } catch (failure) {
      error.value = userMessage(failure)
    } finally {
      isBusy.value = false
    }
  }

  return { target, isBusy, error, ask, cancel, confirm }
}
