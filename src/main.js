import '@fontsource/bagel-fat-one/latin-400.css'
import '@fontsource-variable/albert-sans/index.css'
import './styles/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { setSessionExpiredHandler } from './api/http'
import App from './App.vue'
import { router } from './router'
import { handleExpiredSession } from './session'

const app = createApp(App)
app.use(createPinia())
app.use(router)

setSessionExpiredHandler(handleExpiredSession)

app.mount('#app')
