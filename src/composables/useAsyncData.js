import { onMounted, ref } from 'vue'

/**
 * Carga datos al montar el componente y expone los tres estados que toda
 * pantalla debe mostrar: cargando, error y datos.
 */
export function useAsyncData(loader, initialValue) {
  const data = ref(initialValue)
  const isLoading = ref(true)
  const error = ref('')

  async function reload() {
    isLoading.value = true
    error.value = ''
    try {
      data.value = await loader()
    } catch (failure) {
      error.value = failure.message
    } finally {
      isLoading.value = false
    }
  }

  onMounted(reload)

  return { data, isLoading, error, reload }
}
