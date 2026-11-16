<script setup>
// La comanda: el pedido que se está armando, con forma de tirilla de caja.
import { MAX_QUANTITY, useCartStore } from '../stores/cart'
import { formatPrice } from '../utils/format'

defineProps({
  busy: { type: Boolean, default: false },
})
const customerName = defineModel('customerName', { type: String, default: '' })
defineEmits(['charge'])

const cart = useCartStore()
</script>

<template>
  <section id="pedido" class="comanda" aria-labelledby="comanda-titulo">
    <h2 id="comanda-titulo" class="comanda__titulo">Pedido</h2>

    <p v-if="cart.isEmpty" class="comanda__vacia">
      Toca un perro del menú para agregarlo al pedido.
    </p>

    <TransitionGroup v-else tag="ul" name="lista" class="comanda__renglones">
      <li v-for="line in cart.lines" :key="line.product.id" class="renglon">
        <div class="renglon__texto">
          <span class="renglon__nombre">{{ line.product.name }}</span>
          <span class="renglon__subtotal cifra">
            {{ formatPrice(line.product.price * line.quantity) }}
          </span>
        </div>
        <div class="renglon__cantidad">
          <button
            type="button"
            class="paso"
            :aria-label="`Quitar un ${line.product.name}`"
            @click="cart.decrement(line.product.id)"
          >
            −
          </button>
          <span class="renglon__numero cifra" aria-live="polite">{{ line.quantity }}</span>
          <button
            type="button"
            class="paso"
            :aria-label="`Agregar otro ${line.product.name}`"
            :disabled="line.quantity >= MAX_QUANTITY"
            @click="cart.add(line.product)"
          >
            +
          </button>
        </div>
      </li>
    </TransitionGroup>

    <label class="campo comanda__cliente">
      <span class="campo__etiqueta">Nombre del cliente (opcional)</span>
      <input
        v-model.trim="customerName"
        class="campo__control"
        type="text"
        maxlength="60"
        autocomplete="off"
        placeholder="Para llamarlo cuando esté listo"
      />
    </label>

    <div class="comanda__total">
      <span>Total</span>
      <strong :key="cart.total" class="comanda__valor cifra">{{ formatPrice(cart.total) }}</strong>
    </div>

    <button
      type="button"
      class="btn btn--principal btn--ancho comanda__cobrar"
      :disabled="cart.isEmpty || busy"
      @click="$emit('charge')"
    >
      {{ busy ? 'Registrando…' : 'Registrar venta' }}
    </button>
    <button
      v-if="!cart.isEmpty"
      type="button"
      class="comanda__vaciar"
      :disabled="busy"
      @click="cart.clear()"
    >
      Vaciar pedido
    </button>
  </section>
</template>

<style scoped>
.comanda {
  --diente: 12px;
  position: relative;
  display: grid;
  gap: 1rem;
  padding: 1.3rem 1.25rem calc(1.4rem + var(--diente));
  background: #fff;
  /* Borde inferior en zigzag, como una tirilla recién arrancada. */
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - var(--diente)),
    95% 100%,
    90% calc(100% - var(--diente)),
    85% 100%,
    80% calc(100% - var(--diente)),
    75% 100%,
    70% calc(100% - var(--diente)),
    65% 100%,
    60% calc(100% - var(--diente)),
    55% 100%,
    50% calc(100% - var(--diente)),
    45% 100%,
    40% calc(100% - var(--diente)),
    35% 100%,
    30% calc(100% - var(--diente)),
    25% 100%,
    20% calc(100% - var(--diente)),
    15% 100%,
    10% calc(100% - var(--diente)),
    5% 100%,
    0 calc(100% - var(--diente))
  );
  filter: drop-shadow(0 4px 0 var(--tinta));
}

.comanda__titulo {
  padding-bottom: 0.7rem;
  border-bottom: 2px dashed var(--tinta);
  font-size: 1.8rem;
}

.comanda__vacia {
  padding: 1.2rem 0;
  color: var(--tinta-suave);
  font-weight: 600;
}

.comanda__renglones {
  position: relative;
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.renglon {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.renglon__texto {
  display: grid;
  line-height: 1.25;
}

.renglon__nombre {
  font-weight: 700;
}

.renglon__subtotal {
  color: var(--tinta-suave);
}

.renglon__cantidad {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.renglon__numero {
  min-width: 2ch;
  font-weight: 800;
  text-align: center;
}

.paso {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--tinta);
  border-radius: 50%;
  background: var(--mostaza);
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  transition: transform 0.1s var(--suave);
}

.paso:active:not(:disabled) {
  transform: scale(0.88);
}

.paso:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comanda__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 0.9rem;
  border-top: 2px dashed var(--tinta);
  font-weight: 700;
}

.comanda__valor {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 400;
  animation: brincar 0.3s var(--rebote);
}

.comanda__cobrar {
  min-height: 56px;
  font-size: 1.1rem;
}

.comanda__vaciar {
  justify-self: center;
  min-height: 40px;
  padding: 0.2rem 0.8rem;
  border: 0;
  background: none;
  color: var(--tinta-suave);
  font-weight: 700;
  text-decoration: underline;
}

@keyframes brincar {
  from {
    transform: scale(1.18);
  }
}
</style>
