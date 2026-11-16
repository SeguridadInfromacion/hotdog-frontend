<script setup>
import { reactive, ref, watch } from 'vue'

import { productsApi } from '../api'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  // Producto a editar; null para crear uno nuevo.
  product: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const EMPTY = { name: '', description: '', price: null, is_available: true }

const form = reactive({ ...EMPTY })
const error = ref('')
const isSaving = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const { name, description, price, is_available } = props.product ?? EMPTY
    Object.assign(form, { name, description, price, is_available })
    error.value = ''
  },
)

async function save() {
  error.value = ''
  isSaving.value = true
  const data = { ...form, price: Math.round(Number(form.price)) }
  try {
    const saved = props.product
      ? await productsApi.update(props.product.id, data)
      : await productsApi.create(data)
    emit('saved', saved)
  } catch (failure) {
    error.value = failure.message
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="product ? 'Editar producto' : 'Agregar producto'"
    @close="emit('close')"
  >
    <form class="formulario" @submit.prevent="save">
      <label class="campo">
        <span class="campo__etiqueta">Nombre</span>
        <input
          v-model.trim="form.name"
          class="campo__control"
          type="text"
          required
          minlength="2"
          maxlength="60"
          autocomplete="off"
        />
      </label>
      <label class="campo">
        <span class="campo__etiqueta">Descripción</span>
        <input
          v-model.trim="form.description"
          class="campo__control"
          type="text"
          maxlength="200"
          autocomplete="off"
        />
        <span class="campo__ayuda">Qué trae. Se muestra en la pantalla de venta.</span>
      </label>
      <label class="campo">
        <span class="campo__etiqueta">Precio en pesos</span>
        <input
          v-model.number="form.price"
          class="campo__control"
          type="number"
          inputmode="numeric"
          required
          min="100"
          max="1000000"
          step="100"
        />
      </label>
      <label class="campo campo--casilla">
        <input v-model="form.is_available" type="checkbox" />
        <span class="campo__etiqueta">Disponible para la venta</span>
      </label>

      <p v-if="error" class="aviso-error" role="alert">{{ error }}</p>

      <div class="formulario__acciones">
        <button type="button" class="btn" @click="emit('close')">Cancelar</button>
        <button type="submit" class="btn btn--principal" :disabled="isSaving">
          {{ isSaving ? 'Guardando…' : 'Guardar producto' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
