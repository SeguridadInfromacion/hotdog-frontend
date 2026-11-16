<script setup>
// Ilustración del perro caliente. El color de la salsa sale del "seed" (el id del
// producto): cada producto conserva siempre el mismo dibujo, en cualquier pantalla.
import { computed } from 'vue'

const props = defineProps({
  seed: { type: String, default: '' },
  // Dibuja la salsa con una animación (se usa una sola vez, en la entrada).
  drawSauce: { type: Boolean, default: false },
})

const SAUCES = ['mostaza', 'mayonesa', 'guacamole', 'rosada']

const sauce = computed(() => {
  const sum = [...props.seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return SAUCES[sum % SAUCES.length]
})
</script>

<template>
  <svg
    class="perro"
    :class="[`perro--${sauce}`, { 'perro--dibujar': drawSauce }]"
    viewBox="0 0 220 120"
    aria-hidden="true"
    focusable="false"
  >
    <rect class="perro__pan" x="22" y="30" width="176" height="62" rx="31" />
    <rect class="perro__salchicha" x="6" y="40" width="208" height="34" rx="17" />
    <path class="perro__pan-frente" d="M22 66h176v2a30 30 0 0 1-30 30H52a30 30 0 0 1-30-30z" />
    <path
      class="perro__salsa"
      pathLength="1"
      d="M26 56q11-16 22 0t22 0t22 0t22 0t22 0t22 0t22 0t14 0"
    />
  </svg>
</template>

<style scoped>
.perro {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.perro__pan,
.perro__pan-frente,
.perro__salchicha {
  stroke: var(--tinta);
  stroke-width: 4;
  stroke-linejoin: round;
}

.perro__pan {
  fill: #d98f3d;
}

.perro__pan-frente {
  fill: var(--pan);
}

.perro__salchicha {
  fill: #c0452b;
}

.perro__salsa {
  fill: none;
  stroke-width: 7;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: #ffd84d;
}

.perro--mayonesa .perro__salsa {
  stroke: #fff6dc;
}

.perro--guacamole .perro__salsa {
  stroke: #8cc152;
}

.perro--rosada .perro__salsa {
  stroke: #ffab9e;
}

.perro--dibujar .perro__salsa {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: servir-salsa 1.1s 0.35s var(--suave) forwards;
}

@keyframes servir-salsa {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
