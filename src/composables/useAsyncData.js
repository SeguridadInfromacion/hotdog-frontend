import { onMounted, ref } from 'vue'

import { userMessage } from '../api/http'

/**
 * Carga datos al montar el componente y expone los estados que toda pantalla
 * debe mostrar.
 *
 * - isLoading: todavía no hay datos (primera carga). La pantalla muestra "Cargando…".
 * - isRefreshing: se están volviendo a pedir. La pantalla sigue mostrando lo que
 *   ya tenía, sin parpadeos ni pérdida del foco.
 */
export function useAsyncData(loader, initialValue) {
  const data = ref(initialValue)
  const isLoading = ref(true)
  const isRefreshing = ref(false)
  const error = ref('')

  let latestRequest = 0

  async function reload() {
    // Si hay dos cargas en curso, solo cuenta la última que se pidió.
    const thisRequest = ++latestRequest
    isRefreshing.value = true
    try {
      const loaded = await loader()
      if (thisRequest !== latestRequest) return
      data.value = loaded
      error.value = ''
      isLoading.value = false
    } catch (failure) {
      if (thisRequest !== latestRequest) return
      error.value = userMessage(failure)
    } finally {
      if (thisRequest === latestRequest) isRefreshing.value = false
    }
  }

  onMounted(reload)

  return { data, isLoading, isRefreshing, error, reload }
}
