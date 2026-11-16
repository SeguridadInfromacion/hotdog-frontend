<script setup>
// Ventana modal sobre el elemento nativo <dialog>: el navegador se encarga de
// atrapar el foco, cerrar con Escape y bloquear el resto de la página.
import { onMounted, ref, useId, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
})
const emit = defineEmits(['close'])

const dialog = ref(null)
const titleId = useId()

function sync() {
  const element = dialog.value
  if (!element) return
  if (props.open && !element.open) element.showModal()
  if (!props.open && element.open) element.close()
}

onMounted(sync)
watch(() => props.open, sync, { flush: 'post' })
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :aria-labelledby="titleId"
    @close="emit('close')"
    @click.self="emit('close')"
  >
    <div class="modal__hoja">
      <header class="modal__cabecera">
        <h2 :id="titleId" class="modal__titulo">{{ title }}</h2>
        <button type="button" class="modal__cerrar" aria-label="Cerrar" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  width: min(480px, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-l);
  background: var(--papel);
  color: var(--tinta);
  box-shadow: 0 8px 0 var(--tinta);
}

.modal[open] {
  animation: modal-entra 0.28s var(--rebote);
}

.modal::backdrop {
  background: rgb(43 20 7 / 0.55);
  animation: fondo-entra 0.2s ease-out;
}

.modal__hoja {
  padding: 1.4rem 1.5rem 1.5rem;
}

.modal__cabecera {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

.modal__titulo {
  font-size: 1.7rem;
}

.modal__cerrar {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  margin: -0.4rem -0.5rem 0 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
}

.modal__cerrar:hover {
  background: var(--mostaza-clara);
}

@keyframes modal-entra {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }
}

@keyframes fondo-entra {
  from {
    opacity: 0;
  }
}
</style>
