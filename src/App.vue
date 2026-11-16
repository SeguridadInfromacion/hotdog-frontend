<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/AppHeader.vue'
import ToastHost from './components/ToastHost.vue'

const route = useRoute()
const showHeader = computed(() => route.name && !route.meta.public)
</script>

<template>
  <AppHeader v-if="showHeader" />
  <main>
    <RouterView v-slot="{ Component }">
      <Transition name="vista" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <ToastHost />
</template>
