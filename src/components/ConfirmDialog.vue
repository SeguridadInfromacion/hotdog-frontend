<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  busy: { type: Boolean, default: false },
  // El error se muestra DENTRO del diálogo: un aviso flotante quedaría tapado por él.
  error: { type: String, default: '' },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :open="open" :title="title" :closable="!busy" @close="emit('cancel')">
    <div class="confirmacion">
      <p>{{ message }}</p>
      <p v-if="error" class="aviso-error" role="alert">{{ error }}</p>
      <div class="formulario__acciones">
        <!-- El foco inicial va a la opción que no destruye nada. -->
        <button type="button" class="btn" autofocus :disabled="busy" @click="emit('cancel')">
          Cancelar
        </button>
        <button type="button" class="btn btn--principal" :disabled="busy" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.confirmacion {
  display: grid;
  gap: 1.1rem;
}
</style>
