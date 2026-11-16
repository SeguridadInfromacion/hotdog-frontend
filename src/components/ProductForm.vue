<script setup>
import { reactive, watch } from 'vue'

import { productsApi } from '../api'
import { useSaveForm } from '../composables/useSaveForm'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  // Producto a editar; null para crear uno nuevo.
  product: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

// Los mismos límites que valida el servidor (products-service).
const LIMITS = { nameMax: 60, descriptionMax: 200, priceMin: 100, priceMax: 1_000_000 }
const EMPTY = { name: '', description: '', price: null, is_available: true }

const form = reactive({ ...EMPTY })
const { isSaving, error, save, reset } = useSaveForm()

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const { name, description, price, is_available } = props.product ?? EMPTY
    Object.assign(form, { name, description, price, is_available })
    reset()
  },
)

async function submit() {
  const saved = await save(() =>
    props.product
      ? productsApi.update(props.product.id, { ...form })
      : productsApi.create({ ...form }),
  )
  if (saved) emit('saved', saved)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="product ? 'Editar producto' : 'Agregar producto'"
    :closable="!isSaving"
    :close-on-backdrop="false"
    @close="emit('close')"
  >
    <form class="formulario" @submit.prevent="submit">
      <div class="campo">
        <label class="campo__etiqueta" for="producto-nombre">Nombre</label>
        <input
          id="producto-nombre"
          v-model.trim="form.name"
          class="campo__control"
          type="text"
          required
          pattern=".*\S.*\S.*"
          title="Escribe al menos 2 letras."
          :maxlength="LIMITS.nameMax"
          autocomplete="off"
          autofocus
        />
      </div>
      <div class="campo">
        <label class="campo__etiqueta" for="producto-descripcion">Descripción</label>
        <input
          id="producto-descripcion"
          v-model.trim="form.description"
          class="campo__control"
          type="text"
          :maxlength="LIMITS.descriptionMax"
          autocomplete="off"
          aria-describedby="producto-descripcion-ayuda"
        />
        <span id="producto-descripcion-ayuda" class="campo__ayuda">
          Qué trae. Se muestra en la pantalla de venta.
        </span>
      </div>
      <div class="campo">
        <label class="campo__etiqueta" for="producto-precio">Precio en pesos</label>
        <input
          id="producto-precio"
          v-model.number="form.price"
          class="campo__control"
          type="number"
          inputmode="numeric"
          required
          :min="LIMITS.priceMin"
          :max="LIMITS.priceMax"
          step="1"
          aria-describedby="producto-precio-ayuda"
        />
        <span id="producto-precio-ayuda" class="campo__ayuda">
          Sin puntos ni centavos, desde $ 100. Por ejemplo: 12000
        </span>
      </div>
      <label class="campo campo--casilla">
        <input v-model="form.is_available" type="checkbox" />
        <span class="campo__etiqueta">Disponible para la venta</span>
      </label>

      <p v-if="error" class="aviso-error" role="alert">{{ error }}</p>

      <div class="formulario__acciones">
        <button type="button" class="btn" :disabled="isSaving" @click="emit('close')">
          Cancelar
        </button>
        <button type="submit" class="btn btn--principal" :disabled="isSaving">
          {{ isSaving ? 'Guardando…' : 'Guardar producto' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
