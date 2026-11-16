<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { signOut } from '../session'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { ROLE_LABELS } from '../utils/format'
import ConfirmDialog from './ConfirmDialog.vue'
import HotdogArt from './HotdogArt.vue'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()

const nav = ref(null)
const isConfirmingExit = ref(false)
const isLeaving = ref(false)

const links = computed(() => [
  { to: { name: 'sell' }, label: 'Vender' },
  { to: { name: 'orders' }, label: 'Ventas' },
  ...(auth.isAdmin
    ? [
        { to: { name: 'menu' }, label: 'Menú' },
        { to: { name: 'users' }, label: 'Usuarios' },
        { to: { name: 'audit' }, label: 'Auditoría' },
      ]
    : []),
])

// En pantallas angostas la navegación se desliza: la sección actual siempre queda a la vista.
watch(
  () => route.name,
  async () => {
    await nextTick()
    nav.value
      ?.querySelector('.router-link-active')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })
  },
)

function requestExit() {
  // Salir borra el pedido en curso: si hay uno, se pregunta primero.
  if (cart.isEmpty) leave()
  else isConfirmingExit.value = true
}

async function leave() {
  isLeaving.value = true
  await signOut()
}
</script>

<template>
  <header class="cabecera">
    <div class="cabecera__barra">
      <RouterLink
        :to="{ name: 'sell' }"
        class="marca"
        aria-label="PerroCaliente Express, ir a vender"
      >
        <HotdogArt class="marca__dibujo" />
        <span class="marca__nombre">PerroCaliente Express</span>
      </RouterLink>

      <nav ref="nav" class="navegacion" aria-label="Secciones">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="navegacion__enlace"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="usuario">
        <p class="usuario__datos">
          <strong>{{ auth.user?.full_name }}</strong>
          <span>{{ ROLE_LABELS[auth.user?.role] }}</span>
        </p>
        <button type="button" class="btn btn--chico" :disabled="isLeaving" @click="requestExit">
          Salir
        </button>
      </div>
    </div>
    <div class="toldo"></div>
    <div class="toldo-ondas"></div>

    <ConfirmDialog
      :open="isConfirmingExit"
      title="Hay un pedido sin registrar"
      message="Si sales ahora, el pedido que estás armando se pierde."
      confirm-label="Salir sin registrar"
      :busy="isLeaving"
      @confirm="leave"
      @cancel="isConfirmingExit = false"
    />
  </header>
</template>

<style scoped>
.cabecera {
  position: sticky;
  top: 0;
  z-index: 10;
}

.cabecera__barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  padding: 0.6rem 1.25rem;
  background: var(--papel);
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--tinta);
  text-decoration: none;
}

.marca__dibujo {
  width: 54px;
}

.marca__nombre {
  font-family: var(--font-display);
  font-size: 1.35rem;
  line-height: 1;
}

.navegacion {
  display: flex;
  flex: 1;
  gap: 0.35rem;
  padding: 4px;
}

.navegacion__enlace {
  padding: 0.5rem 0.95rem;
  border: 2px solid transparent;
  border-radius: 999px;
  color: var(--tinta);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.navegacion__enlace:hover {
  background: var(--mostaza-clara);
}

.navegacion__enlace.router-link-active {
  background: var(--tinta);
  color: var(--mostaza);
}

.usuario {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-left: auto;
}

.usuario__datos {
  display: grid;
  line-height: 1.2;
  text-align: right;
}

.usuario__datos span {
  color: var(--tinta-suave);
  font-size: 0.88rem;
}

/* Cuando no cabe todo en una fila, la navegación baja a su propia fila
   y se desliza con el dedo, sin barra de desplazamiento a la vista. */
@media (max-width: 1100px) {
  .navegacion {
    order: 3;
    flex-basis: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .navegacion::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 760px) {
  .cabecera {
    position: static;
  }

  .cabecera__barra {
    padding: 0.5rem 1rem;
  }

  .marca__dibujo {
    width: 44px;
  }

  .marca__nombre {
    font-size: 1.05rem;
  }

  .usuario__datos span {
    display: none;
  }
}
</style>
