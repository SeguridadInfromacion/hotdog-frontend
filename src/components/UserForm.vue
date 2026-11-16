<script setup>
import { computed, reactive, ref, watch } from 'vue'

import { usersApi } from '../api'
import { ROLE_LABELS } from '../utils/format'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  // Usuario a editar; null para crear uno nuevo.
  user: { type: Object, default: null },
  // Un administrador no puede quitarse su propio rol.
  isSelf: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'saved'])

const EMPTY = { username: '', full_name: '', role: 'cashier' }

const form = reactive({ ...EMPTY, password: '' })
const error = ref('')
const isSaving = ref(false)
const isEditing = computed(() => props.user !== null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const { username, full_name, role } = props.user ?? EMPTY
    Object.assign(form, { username, full_name, role, password: '' })
    error.value = ''
  },
)

function changesForUpdate() {
  const changes = { full_name: form.full_name }
  if (!props.isSelf) changes.role = form.role
  if (form.password) changes.password = form.password
  return changes
}

async function save() {
  error.value = ''
  isSaving.value = true
  try {
    const saved = isEditing.value
      ? await usersApi.update(props.user.id, changesForUpdate())
      : await usersApi.create({ ...form })
    emit('saved', saved)
  } catch (failure) {
    error.value = failure.message
  } finally {
    isSaving.value = false
    form.password = ''
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditing ? 'Editar usuario' : 'Agregar usuario'"
    @close="emit('close')"
  >
    <form class="formulario" @submit.prevent="save">
      <label class="campo">
        <span class="campo__etiqueta">Usuario</span>
        <input
          v-model.trim="form.username"
          class="campo__control"
          type="text"
          required
          pattern="[a-z0-9_.\-]{3,32}"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          :disabled="isEditing"
        />
        <span v-if="!isEditing" class="campo__ayuda">
          De 3 a 32 caracteres: minúsculas, números, punto, guion o guion bajo.
        </span>
      </label>
      <label class="campo">
        <span class="campo__etiqueta">Nombre completo</span>
        <input
          v-model.trim="form.full_name"
          class="campo__control"
          type="text"
          required
          minlength="2"
          maxlength="80"
          autocomplete="off"
        />
      </label>
      <label class="campo">
        <span class="campo__etiqueta">Rol</span>
        <select v-model="form.role" class="campo__control" :disabled="isSelf">
          <option v-for="(label, role) in ROLE_LABELS" :key="role" :value="role">
            {{ label }}
          </option>
        </select>
        <span class="campo__ayuda">
          El cajero vende y ve sus ventas. El administrador además gestiona menú y usuarios.
        </span>
      </label>
      <label class="campo">
        <span class="campo__etiqueta">
          {{ isEditing ? 'Contraseña nueva (opcional)' : 'Contraseña' }}
        </span>
        <input
          v-model="form.password"
          class="campo__control"
          type="password"
          :required="!isEditing"
          minlength="10"
          maxlength="128"
          autocomplete="new-password"
        />
        <span class="campo__ayuda">Mínimo 10 caracteres, con letras y números.</span>
      </label>

      <p v-if="error" class="aviso-error" role="alert">{{ error }}</p>

      <div class="formulario__acciones">
        <button type="button" class="btn" @click="emit('close')">Cancelar</button>
        <button type="submit" class="btn btn--principal" :disabled="isSaving">
          {{ isSaving ? 'Guardando…' : 'Guardar usuario' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
