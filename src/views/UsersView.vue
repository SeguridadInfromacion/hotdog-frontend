<script setup>
import { computed, ref } from 'vue'

import { usersApi } from '../api'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import LoadState from '../components/LoadState.vue'
import UserForm from '../components/UserForm.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { useConfirmAction } from '../composables/useConfirmAction'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toasts'
import { ROLE_LABELS } from '../utils/format'

const auth = useAuthStore()
const toasts = useToastStore()
const { data: users, isLoading, error, reload } = useAsyncData(() => usersApi.list(), [])

const isFormOpen = ref(false)
const editing = ref(null)

const isSelf = (user) => user.id === auth.user?.id

const toggle = useConfirmAction(async (user) => {
  await usersApi.update(user.id, { is_active: !user.is_active })
  toasts.success(`Usuario ${user.username} ${user.is_active ? 'desactivado' : 'activado'}.`)
  reload()
})

// Los textos del diálogo dependen de si se va a desactivar o a activar.
const toggleCopy = computed(() => {
  const user = toggle.target.value
  if (!user) return { title: '', message: '', confirm: '' }
  return user.is_active
    ? {
        title: 'Desactivar usuario',
        message: `${user.full_name} no podrá entrar a la caja hasta que lo actives de nuevo.`,
        confirm: 'Desactivar usuario',
      }
    : {
        title: 'Activar usuario',
        message: `${user.full_name} podrá volver a entrar a la caja.`,
        confirm: 'Activar usuario',
      }
})

function openForm(user = null) {
  editing.value = user
  isFormOpen.value = true
}

function onSaved(saved) {
  isFormOpen.value = false
  auth.updateCurrentUser(saved)
  toasts.success(`Usuario ${saved.username} guardado.`)
  reload()
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__encabezado">
      <div>
        <h1 class="pagina__titulo">Usuarios</h1>
        <p class="pagina__bajada">
          Quién puede entrar a la caja y con qué permisos. Un usuario desactivado ya no puede
          iniciar sesión, y la que tenga abierta se cierra en pocos minutos.
        </p>
      </div>
      <button type="button" class="btn btn--principal" @click="openForm()">Agregar usuario</button>
    </header>

    <LoadState :is-loading="isLoading" :error="error" @retry="reload">
      <ul class="usuarios lista-plana">
        <li v-for="user in users" :key="user.id" class="persona hoja">
          <div class="persona__texto">
            <h2 class="persona__nombre">{{ user.full_name }}</h2>
            <p class="persona__usuario">
              {{ user.username }}<template v-if="isSelf(user)"> (tú)</template>
            </p>
          </div>
          <span class="etiqueta">{{ ROLE_LABELS[user.role] }}</span>
          <span class="etiqueta" :class="user.is_active ? 'etiqueta--ok' : 'etiqueta--apagada'">
            {{ user.is_active ? 'Activo' : 'Desactivado' }}
          </span>
          <div class="persona__acciones">
            <button
              type="button"
              class="btn btn--chico"
              :aria-label="`Editar a ${user.full_name}`"
              @click="openForm(user)"
            >
              Editar
            </button>
            <button
              v-if="!isSelf(user)"
              type="button"
              class="btn btn--chico"
              :class="{ 'btn--peligro': user.is_active }"
              :aria-label="`${user.is_active ? 'Desactivar' : 'Activar'} a ${user.full_name}`"
              @click="toggle.ask(user)"
            >
              {{ user.is_active ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </li>
      </ul>
    </LoadState>

    <UserForm
      :open="isFormOpen"
      :user="editing"
      :is-self="editing !== null && isSelf(editing)"
      @close="isFormOpen = false"
      @saved="onSaved"
    />
    <ConfirmDialog
      :open="toggle.target.value !== null"
      :title="toggleCopy.title"
      :message="toggleCopy.message"
      :confirm-label="toggleCopy.confirm"
      :busy="toggle.isBusy.value"
      :error="toggle.error.value"
      @confirm="toggle.confirm"
      @cancel="toggle.cancel"
    />
  </div>
</template>

<style scoped>
.usuarios {
  display: grid;
  gap: 1.1rem;
}

.persona {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 0.6rem 1.1rem;
  padding: 0.9rem 1.2rem;
}

.persona__texto {
  min-width: 0;
  overflow-wrap: anywhere;
}

.persona__nombre {
  font-size: 1.3rem;
}

.persona__usuario {
  color: var(--tinta-suave);
}

.persona__acciones {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 760px) {
  .persona {
    grid-template-columns: auto auto 1fr;
  }

  .persona__texto,
  .persona__acciones {
    grid-column: 1 / -1;
  }

  .persona__acciones .btn {
    flex: 1;
  }
}
</style>
