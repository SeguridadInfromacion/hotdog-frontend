<script setup>
import { computed, reactive, watch } from 'vue'

import { usersApi } from '../api'
import { useSaveForm } from '../composables/useSaveForm'
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

// Los mismos límites que valida el servidor (auth-service).
const LIMITS = { fullNameMax: 80, passwordMin: 10, passwordMax: 128 }
const EMPTY = { username: '', full_name: '', role: 'cashier' }

const form = reactive({ ...EMPTY, password: '' })
const { isSaving, error, save, reset } = useSaveForm()
const isEditing = computed(() => props.user !== null)

watch(
  () => props.open,
  (isOpen) => {
    // Al abrir se cargan los datos; al cerrar se borra la contraseña escrita.
    form.password = ''
    if (!isOpen) return
    const { username, full_name, role } = props.user ?? EMPTY
    Object.assign(form, { username, full_name, role })
    reset()
  },
)

function changesForUpdate() {
  const changes = {}
  if (form.full_name !== props.user.full_name) changes.full_name = form.full_name
  if (!props.isSelf && form.role !== props.user.role) changes.role = form.role
  if (form.password) changes.password = form.password
  return changes
}

async function submit() {
  if (isEditing.value && Object.keys(changesForUpdate()).length === 0) {
    emit('close')
    return
  }
  const saved = await save(() =>
    isEditing.value
      ? usersApi.update(props.user.id, changesForUpdate())
      : usersApi.create({ ...form }),
  )
  if (saved) emit('saved', saved)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditing ? 'Editar usuario' : 'Agregar usuario'"
    :closable="!isSaving"
    :close-on-backdrop="false"
    @close="emit('close')"
  >
    <form class="formulario" @submit.prevent="submit">
      <div class="campo">
        <label class="campo__etiqueta" for="usuario-usuario">Usuario</label>
        <input
          id="usuario-usuario"
          v-model.trim="form.username"
          class="campo__control"
          type="text"
          required
          pattern="[a-z0-9_.\-]{3,32}"
          title="De 3 a 32 caracteres: minúsculas, números, punto, guion o guion bajo."
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          :disabled="isEditing"
          :autofocus="!isEditing"
          aria-describedby="usuario-usuario-ayuda"
        />
        <span id="usuario-usuario-ayuda" class="campo__ayuda">
          {{
            isEditing
              ? 'El nombre de usuario no se puede cambiar.'
              : 'De 3 a 32 caracteres: minúsculas, números, punto, guion o guion bajo.'
          }}
        </span>
      </div>
      <div class="campo">
        <label class="campo__etiqueta" for="usuario-nombre">Nombre completo</label>
        <input
          id="usuario-nombre"
          v-model.trim="form.full_name"
          class="campo__control"
          type="text"
          required
          pattern=".*\S.*\S.*"
          title="Escribe al menos 2 letras."
          :maxlength="LIMITS.fullNameMax"
          autocomplete="off"
          :autofocus="isEditing"
        />
      </div>
      <div class="campo">
        <label class="campo__etiqueta" for="usuario-rol">Rol</label>
        <select
          id="usuario-rol"
          v-model="form.role"
          class="campo__control"
          :disabled="isSelf"
          aria-describedby="usuario-rol-ayuda"
        >
          <option v-for="(label, role) in ROLE_LABELS" :key="role" :value="role">
            {{ label }}
          </option>
        </select>
        <span id="usuario-rol-ayuda" class="campo__ayuda">
          {{
            isSelf
              ? 'No puedes cambiar tu propio rol.'
              : 'El cajero vende y ve sus ventas. El administrador además gestiona menú y usuarios.'
          }}
        </span>
      </div>
      <div class="campo">
        <label class="campo__etiqueta" for="usuario-clave">
          {{ isEditing ? 'Contraseña nueva (opcional)' : 'Contraseña' }}
        </label>
        <input
          id="usuario-clave"
          v-model="form.password"
          class="campo__control"
          type="password"
          :required="!isEditing"
          :minlength="LIMITS.passwordMin"
          :maxlength="LIMITS.passwordMax"
          autocomplete="new-password"
          aria-describedby="usuario-clave-ayuda"
        />
        <span id="usuario-clave-ayuda" class="campo__ayuda">
          Mínimo 10 caracteres, con letras y números.
          <template v-if="isEditing"
            >Al cambiarla se cierran las sesiones de este usuario.</template
          >
        </span>
      </div>

      <p v-if="error" class="aviso-error" role="alert">{{ error }}</p>

      <div class="formulario__acciones">
        <button type="button" class="btn" :disabled="isSaving" @click="emit('close')">
          Cancelar
        </button>
        <button type="submit" class="btn btn--principal" :disabled="isSaving">
          {{ isSaving ? 'Guardando…' : 'Guardar usuario' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
