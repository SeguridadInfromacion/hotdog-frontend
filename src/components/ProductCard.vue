<script setup>
import { formatPrice } from '../utils/format'
import HotdogArt from './HotdogArt.vue'

defineProps({
  product: { type: Object, required: true },
  variant: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
})
defineEmits(['add'])
</script>

<template>
  <button
    type="button"
    class="producto"
    :aria-label="`Agregar ${product.name}, ${formatPrice(product.price)}`"
    @click="$emit('add', product)"
  >
    <Transition name="contador">
      <span v-if="quantity" :key="quantity" class="producto__contador" aria-hidden="true">
        {{ quantity }}
      </span>
    </Transition>
    <HotdogArt class="producto__dibujo" :variant="variant" />
    <span class="producto__nombre">{{ product.name }}</span>
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
  padding: 1rem 1rem 1.1rem;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-m);
  background: var(--papel);
  box-shadow: var(--sombra-dura);
  text-align: left;
  transition:
    transform 0.14s var(--suave),
    box-shadow 0.14s var(--suave);
}

.producto:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 0 var(--tinta);
}

.producto:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--tinta);
}

.producto__dibujo {
  width: min(170px, 80%);
  margin: 0.2rem auto 0.6rem;
  transition: transform 0.3s var(--rebote);
}

.producto:hover .producto__dibujo {
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
</style>
