<script setup>
import { formatPrice } from '../utils/format'
import HotdogArt from './HotdogArt.vue'

defineProps({
  product: { type: Object, required: true },
  quantity: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
})
defineEmits(['add'])
</script>

<template>
  <button type="button" class="producto" :disabled="disabled" @click="$emit('add', product)">
    <Transition name="contador">
      <span v-if="quantity" :key="quantity" class="producto__contador" aria-hidden="true">
        {{ quantity }}
      </span>
    </Transition>
    <HotdogArt class="producto__dibujo" :seed="product.id" />
    <span class="producto__nombre">
      <span class="solo-lectores">Agregar </span>{{ product.name }}
    </span>
    <span class="producto__descripcion">{{ product.description }}</span>
    <span class="producto__precio cifra">{{ formatPrice(product.price) }}</span>
  </button>
</template>

<style scoped>
.producto {
  position: relative;
  display: grid;
  align-content: start;
  gap: 0.3rem;
  /* min-width: 0 + overflow-wrap: una palabra larguísima se parte en vez de
     ensanchar la tarjeta (y con ella toda la página en un celular). */
  min-width: 0;
  padding: 1rem 1rem 1.1rem;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-m);
  background: var(--papel);
  box-shadow: var(--sombra-dura);
  text-align: left;
  overflow-wrap: anywhere;
  transition:
    transform 0.14s var(--suave),
    box-shadow 0.14s var(--suave);
}

.producto:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 7px 0 var(--tinta);
}

.producto:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--tinta);
}

.producto:disabled {
  cursor: progress;
  opacity: 0.7;
}

.producto__dibujo {
  width: min(170px, 80%);
  margin: 0.2rem auto 0.6rem;
  transition: transform 0.3s var(--rebote);
}

.producto:hover:not(:disabled) .producto__dibujo {
  transform: rotate(-4deg) scale(1.05);
}

.producto__nombre {
  font-family: var(--font-display);
  font-size: 1.3rem;
  line-height: 1.1;
}

.producto__descripcion {
  color: var(--tinta-suave);
  font-size: 0.93rem;
  line-height: 1.35;
}

.producto__precio {
  margin-top: 0.4rem;
  font-size: 1.15rem;
  font-weight: 800;
}

.producto__contador {
  position: absolute;
  top: -12px;
  right: -10px;
  display: grid;
  place-items: center;
  min-width: 36px;
  height: 36px;
  padding-inline: 0.4rem;
  border: 2px solid var(--tinta);
  border-radius: 999px;
  background: var(--ketchup);
  color: #fff;
  font-weight: 800;
}

.contador-enter-active {
  animation: saltar 0.3s var(--rebote);
}

.contador-leave-active {
  display: none;
}

@keyframes saltar {
  from {
    transform: scale(0.4);
  }
}

@media (max-width: 600px) {
  .producto {
    padding: 0.75rem 0.75rem 0.85rem;
  }

  .producto__dibujo {
    width: min(110px, 70%);
    margin-bottom: 0.3rem;
  }

  .producto__nombre {
    font-size: 1.12rem;
  }

  .producto__descripcion {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}
</style>
