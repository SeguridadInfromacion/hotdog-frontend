<script setup>
// Ventana modal sobre el elemento nativo <dialog>: el navegador se encarga de
// atrapar el foco, cerrar con Escape y bloquear el resto de la página.
// El foco inicial va al elemento del contenido marcado con "autofocus".
import { onMounted, ref, useId, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  // false mientras se guarda: ni Escape ni la X cierran a mitad de una operación.
  closable: { type: Boolean, default: true },
  // Los formularios lo apagan para no perder lo escrito por un clic afuera.
  closeOnBackdrop: { type: Boolean, default: true },
})
const emit = defineEmits(['close'])

const dialog = ref(null)
const titleId = useId()
let pressStartedOnBackdrop = false

function sync() {
  const element = dialog.value
  if (!element) return
  if (props.open && !element.open) element.showModal()
  if (!props.open && element.open) element.close()
}

onMounted(sync)
watch(() => props.open, sync, { flush: 'post' })

// Todas las formas de cerrar terminan en el evento nativo "close",
// que es el único que avisa al componente padre.
function requestClose() {
  if (props.closable) dialog.value?.close()
}

function onEscape(event) {
  if (!props.closable) event.preventDefault()
}

function onBackdropClick(event) {
  // Solo cuenta un clic que empezó Y terminó en el fondo (no un arrastre
  // que comenzó seleccionando texto dentro de un campo).
  const endedOnBackdrop = event.target === dialog.value
  if (props.closeOnBackdrop && pressStartedOnBackdrop && endedOnBackdrop) requestClose()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :aria-labelledby="titleId"
    @close="emit('close')"
    @cancel="onEscape"
    @pointerdown="pressStartedOnBackdrop = $event.target === dialog"
    @click="onBackdropClick"
  >
    <div class="modal__hoja">
      <header class="modal__cabecera">
        <h2 :id="titleId" class="modal__titulo">{{ title }}</h2>
        <button
          type="button"
          class="modal__cerrar"
          aria-label="Cerrar"
          :disabled="!closable"
          @click="requestClose"
        >
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
  overflow-wrap: anywhere;
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

.modal__cerrar:hover:not(:disabled) {
  background: var(--mostaza-clara);
}

.modal__cerrar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
