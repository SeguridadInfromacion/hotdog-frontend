import '@fontsource/bagel-fat-one/latin-400.css'
import '@fontsource-variable/albert-sans/index.css'
import './styles/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { setSessionExpiredHandler } from './api/http'
import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useToastStore } from './stores/toasts'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Si el servidor responde 401 a mitad de trabajo, la sesión venció:
// se limpia el estado local y se vuelve a la pantalla de entrada.
setSessionExpiredHandler(() => {
  const auth = useAuthStore()
  if (!auth.user) return
  auth.clear()
  useCartStore().clear()
  useToastStore().error('Tu sesión venció. Entra de nuevo para continuar.')
  router.replace({ name: 'login' })
})

app.mount('#app')
