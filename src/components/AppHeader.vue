<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { ROLE_LABELS } from '../utils/format'
import HotdogArt from './HotdogArt.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

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

async function logout() {
  await auth.logout()
  cart.clear()
  router.replace({ name: 'login' })
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

      <nav class="navegacion" aria-label="Secciones">
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
          <strong>{{ auth.user.full_name }}</strong>
          <span>{{ ROLE_LABELS[auth.user.role] }}</span>
        </p>
        <button type="button" class="btn btn--chico" @click="logout">Salir</button>
      </div>
    </div>
    <div class="toldo"></div>
    <div class="toldo-ondas"></div>
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
  gap: 0.75rem 1.5rem;
  padding: 0.7rem 1.25rem;
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
  overflow-x: auto;
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

@media (max-width: 760px) {
  .cabecera {
    position: static;
  }

  .marca__nombre {
    font-size: 1.1rem;
  }

  .usuario {
    margin-left: auto;
  }

  .navegacion {
    order: 3;
    flex-basis: 100%;
  }
}
</style>
