import { defineStore } from 'pinia'
import { ref } from 'vue'

const VISIBLE_MS = 4500

/** Avisos breves en la parte baja de la pantalla. */
export const useToastStore = defineStore('toasts', () => {
  const toasts = ref([])
  let nextId = 1

  function show(message, kind) {
    const id = nextId++
    toasts.value.push({ id, message, kind })
    setTimeout(() => dismiss(id), VISIBLE_MS)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (message) => show(message, 'ok'),
    error: (message) => show(message, 'error'),
  }
})
