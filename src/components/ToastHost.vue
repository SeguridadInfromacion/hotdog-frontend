<script setup>
import { useToastStore } from '../stores/toasts'

const store = useToastStore()
</script>

<template>
  <div class="avisos" role="status" aria-live="polite">
    <TransitionGroup name="aviso">
      <button
        v-for="toast in store.toasts"
        :key="toast.id"
        type="button"
        class="aviso"
        :class="`aviso--${toast.kind}`"
        @click="store.dismiss(toast.id)"
      >
        {{ toast.message }}
        <span class="solo-lectores">(toca para cerrar)</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.avisos {
  position: fixed;
  inset: auto 0 1.25rem;
  z-index: 100;
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding-inline: 1rem;
  pointer-events: none;
}

.aviso {
  max-width: 46ch;
  padding: 0.75rem 1.1rem;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-s);
  box-shadow: var(--sombra-dura);
  font-weight: 700;
  text-align: left;
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

.aviso-enter-active,
.aviso-leave-active {
  transition:
    opacity 0.25s var(--suave),
    transform 0.3s var(--rebote);
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
</style>
