<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { userMessage } from '../api/http'
import HotdogArt from '../components/HotdogArt.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const passwordInput = ref(null)
const usernameInput = ref(null)

// El atributo autofocus solo sirve al cargar la página; al volver aquí tras
// cerrar sesión hay que poner el foco a mano.
onMounted(() => usernameInput.value?.focus())
const isSubmitting = ref(false)

async function submit() {
  error.value = ''
  isSubmitting.value = true
  try {
    await auth.login(username.value, password.value)
    router.replace({ name: 'sell' })
  } catch (failure) {
    error.value = userMessage(failure)
    passwordInput.value?.focus()
  } finally {
    // El campo de la contraseña se vacía apenas termina el intento.
    password.value = ''
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="entrada">
    <section class="entrada__letrero" aria-hidden="true">
      <p class="entrada__nombre">
        <span>Perro</span>
        <span>Caliente</span>
        <span class="entrada__express">Express</span>
      </p>
      <HotdogArt class="entrada__dibujo" draw-sauce />
    </section>

    <section class="entrada__caja hoja">
      <div class="toldo"></div>
      <form class="formulario entrada__formulario" @submit.prevent="submit">
        <h1 class="entrada__titulo">Entrar a la caja</h1>
        <label class="campo">
          <span class="campo__etiqueta">Usuario</span>
          <input
            ref="usernameInput"
            v-model.trim="username"
            class="campo__control"
            type="text"
            required
            maxlength="32"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
          />
        </label>
        <label class="campo">
          <span class="campo__etiqueta">Contraseña</span>
          <input
            ref="passwordInput"
            v-model="password"
            class="campo__control"
            type="password"
            required
            maxlength="128"
            autocomplete="current-password"
          />
        </label>

        <p v-if="error" class="aviso-error" role="alert">{{ error }}</p>

        <button type="submit" class="btn btn--principal btn--ancho" :disabled="isSubmitting">
          {{ isSubmitting ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.entrada {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 420px);
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
  width: min(1080px, 100%);
  min-height: 100dvh;
  margin-inline: auto;
  padding: 2rem 1.5rem;
}

.entrada__nombre {
  display: grid;
  font-family: var(--font-display);
  font-size: clamp(3.4rem, 10vw, 7.2rem);
  line-height: 0.88;
  letter-spacing: -0.01em;
}

.entrada__nombre span {
  animation: asentar 0.5s var(--rebote) both;
}

.entrada__nombre span:nth-child(2) {
  animation-delay: 0.08s;
}

.entrada__express {
  color: var(--ketchup);
  -webkit-text-stroke: 2px var(--tinta);
  paint-order: stroke fill;
  animation-delay: 0.16s !important;
}

.entrada__dibujo {
  width: min(380px, 80%);
  margin-top: 1.5rem;
  transform: rotate(-6deg);
}

.entrada__caja {
  overflow: hidden;
  border-radius: var(--radio-l);
}

.entrada__caja .toldo {
  border-top: 0;
}

.entrada__formulario {
  padding: 1.6rem 1.6rem 1.8rem;
}

.entrada__titulo {
  font-size: 2rem;
}

@keyframes asentar {
  from {
    opacity: 0;
    transform: translateY(24px) rotate(-3deg);
  }
}

@media (max-width: 760px) {
  .entrada {
    grid-template-columns: 1fr;
    align-content: center;
    gap: 1.5rem;
  }

  .entrada__letrero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .entrada__nombre {
    font-size: clamp(2.4rem, 11vw, 3.4rem);
  }

  .entrada__dibujo {
    width: 38%;
    margin: 0;
  }
}
</style>
