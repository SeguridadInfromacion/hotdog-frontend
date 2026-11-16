<script setup>
import { computed } from 'vue'

import { TOAST_ERROR, TOAST_OK, useToastStore } from '../stores/toasts'

const store = useToastStore()

// Dos regiones fijas: las confirmaciones se anuncian con calma (status)
// y los errores de inmediato (alert).
const regions = computed(() => [
  { kind: TOAST_OK, role: 'status', toasts: store.toasts.filter((t) => t.kind === TOAST_OK) },
  { kind: TOAST_ERROR, role: 'alert', toasts: store.toasts.filter((t) => t.kind === TOAST_ERROR) },
])
</script>

<template>
  <div class="avisos">
    <div v-for="region in regions" :key="region.kind" :role="region.role" class="avisos__region">
      <TransitionGroup name="aviso">
        <div
          v-for="toast in region.toasts"
          :key="toast.id"
          class="aviso"
          :class="`aviso--${toast.kind}`"
        >
          <span>{{ toast.message }}</span>
          <button type="button" class="aviso__cerrar" @click="store.dismiss(toast.id)">
            Cerrar
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
/* Arriba y al centro: no tapan el pedido ni el botón de registrar la venta. */
.avisos {
  position: fixed;
  inset: 0.9rem 0 auto;
  z-index: 100;
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding-inline: 1rem;
  pointer-events: none;
}

.avisos__region {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
}

.aviso {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  max-width: 52ch;
  padding: 0.55rem 0.6rem 0.55rem 1.1rem;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-s);
  box-shadow: var(--sombra-dura);
  font-weight: 700;
  overflow-wrap: anywhere;
  pointer-events: auto;
}

.aviso--ok {
  background: var(--pepinillo-claro);
  color: #173f1a;
}

.aviso--error {
  background: var(--ketchup);
  color: #fff;
}

.aviso__cerrar {
  flex: none;
  min-height: 40px;
  padding: 0.2rem 0.75rem;
  border: 2px solid currentcolor;
  border-radius: var(--radio-s);
  background: transparent;
  color: inherit;
  font-weight: 700;
}

.aviso-enter-active,
.aviso-leave-active {
  transition:
    opacity 0.25s var(--suave),
    transform 0.3s var(--rebote);
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}
</style>
