<script setup>
// Muestra "cargando" o el error con botón de reintento; si todo va bien, el contenido.
defineProps({
  isLoading: { type: Boolean, required: true },
  error: { type: String, default: '' },
})
defineEmits(['retry'])
</script>

<template>
  <div v-if="error" class="estado hoja" role="alert">
    <p class="estado__titulo">No se pudo cargar</p>
    <p>{{ error }}</p>
    <button type="button" class="btn" @click="$emit('retry')">Reintentar</button>
  </div>
  <p v-else-if="isLoading" class="estado estado--cargando">Cargando…</p>
  <slot v-else />
</template>

<style scoped>
.estado {
  display: grid;
  justify-items: start;
  gap: 0.7rem;
  padding: 1.5rem;
}

.estado__titulo {
  font-family: var(--font-display);
  font-size: 1.4rem;
}

.estado--cargando {
  font-weight: 700;
  animation: latir 1.1s ease-in-out infinite alternate;
}

@keyframes latir {
  to {
    opacity: 0.7;
  }
}
</style>
