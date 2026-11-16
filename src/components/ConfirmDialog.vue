<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('cancel')">
    <p>{{ message }}</p>
    <div class="formulario__acciones">
      <button type="button" class="btn" @click="emit('cancel')">Cancelar</button>
      <button type="button" class="btn btn--principal" :disabled="busy" @click="emit('confirm')">
        {{ confirmLabel }}
      </button>
    </div>
  </BaseModal>
</template>
