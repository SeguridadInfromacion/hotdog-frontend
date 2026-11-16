<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/AppHeader.vue'
import ToastHost from './components/ToastHost.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const auth = useAuthStore()
const showHeader = computed(() => auth.user !== null && !route.meta.public)

/** Al cambiar de pantalla, el foco pasa al título: quien usa teclado o lector
 *  de pantalla se entera del cambio y sigue desde arriba. */
function focusPageTitle() {
  if (route.meta.public) return
  const title = document.querySelector('main h1')
  if (!title) return
  title.setAttribute('tabindex', '-1')
  title.focus({ preventScroll: true })
}
</script>

<template>
  <a v-if="showHeader" class="saltar" href="#contenido">Saltar al contenido</a>
  <AppHeader v-if="showHeader" />
  <main id="contenido">
    <RouterView v-slot="{ Component }">
      <Transition name="vista" mode="out-in" @after-enter="focusPageTitle">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <ToastHost />
</template>
