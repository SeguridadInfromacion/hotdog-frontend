import { defineStore } from 'pinia'
import { ref } from 'vue'

const SUCCESS_VISIBLE_MS = 4500

export const TOAST_OK = 'ok'
export const TOAST_ERROR = 'error'

/** Avisos breves en la parte alta de la pantalla. */
export const useToastStore = defineStore('toasts', () => {
  const toasts = ref([])
  let nextId = 1

  function show(message, kind) {
    // El mismo aviso no se apila: el nuevo reemplaza al anterior.
    toasts.value = toasts.value.filter((toast) => toast.message !== message)
    const id = nextId++
    toasts.value.push({ id, message, kind })
    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  /** Confirmación: desaparece sola. */
  function success(message) {
    const id = show(message, TOAST_OK)
    setTimeout(() => dismiss(id), SUCCESS_VISIBLE_MS)
  }

  /** Error: se queda hasta que la persona lo cierre, para que alcance a leerlo. */
  function error(message) {
    show(message, TOAST_ERROR)
  }

  function clear() {
    toasts.value = []
  }

  return { toasts, dismiss, success, error, clear }
})
