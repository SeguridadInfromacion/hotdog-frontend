<script setup>
import { ref } from 'vue'

import { usersApi } from '../api'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import LoadState from '../components/LoadState.vue'
import UserForm from '../components/UserForm.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toasts'
import { ROLE_LABELS } from '../utils/format'

const auth = useAuthStore()
const toasts = useToastStore()
const { data: users, isLoading, error, reload } = useAsyncData(() => usersApi.list(), [])

const isFormOpen = ref(false)
const editing = ref(null)
const toToggle = ref(null)
const isToggling = ref(false)

const isSelf = (user) => user.id === auth.user.id

function openForm(user = null) {
  editing.value = user
  isFormOpen.value = true
}

function onSaved(saved) {
  isFormOpen.value = false
  if (isSelf(saved)) auth.user = saved
  toasts.success(`Usuario ${saved.username} guardado.`)
  reload()
}

async function confirmToggle() {
  const user = toToggle.value
  isToggling.value = true
  try {
    await usersApi.update(user.id, { is_active: !user.is_active })
    toasts.success(`Usuario ${user.username} ${user.is_active ? 'desactivado' : 'activado'}.`)
    toToggle.value = null
    reload()
  } catch (failure) {
    toasts.error(failure.message)
  } finally {
    isToggling.value = false
  }
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__encabezado">
      <div>
        <h1 class="pagina__titulo">Usuarios</h1>
        <p class="pagina__bajada">
          Quién puede entrar a la caja y con qué permisos. Un usuario desactivado pierde el acceso
          de inmediato.
        </p>
      </div>
      <button type="button" class="btn btn--principal" @click="openForm()">Agregar usuario</button>
    </header>

    <LoadState :is-loading="isLoading" :error="error" @retry="reload">
      <ul class="usuarios">
        <li v-for="user in users" :key="user.id" class="persona hoja">
          <div>
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
              @click="toToggle = user"
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
      :open="toToggle !== null"
      :title="toToggle?.is_active ? 'Desactivar usuario' : 'Activar usuario'"
      :message="
        toToggle?.is_active
          ? `${toToggle?.full_name} no podrá entrar a la caja hasta que lo actives de nuevo.`
          : `${toToggle?.full_name ?? ''} podrá volver a entrar a la caja.`
      "
      :confirm-label="toToggle?.is_active ? 'Desactivar usuario' : 'Activar usuario'"
      :busy="isToggling"
      @confirm="confirmToggle"
      @cancel="toToggle = null"
    />
  </div>
</template>

<style scoped>
.usuarios {
  display: grid;
  gap: 1.1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.persona {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 0.6rem 1.1rem;
  padding: 0.9rem 1.2rem;
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

  .persona > div:first-child,
  .persona__acciones {
    grid-column: 1 / -1;
  }

  .persona__acciones .btn {
    flex: 1;
  }
}
</style>
