<script setup>
// La comanda: el pedido que se está armando, con forma de tirilla de caja.
// La lista de renglones se desplaza por dentro; el total y el botón de
// registrar siempre quedan a la vista, por largo que sea el pedido.
import { MAX_QUANTITY, useCartStore } from '../stores/cart'
import { formatPrice } from '../utils/format'

defineProps({
  busy: { type: Boolean, default: false },
})
const customerName = defineModel('customerName', { type: String, default: '' })
defineEmits(['charge', 'clear'])

const cart = useCartStore()
</script>

<template>
  <section id="pedido" class="comanda" aria-labelledby="comanda-titulo">
    <h2 id="comanda-titulo" class="comanda__titulo">Pedido</h2>

    <div class="comanda__cuerpo">
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
              :disabled="busy"
              @click="cart.decrement(line.product.id)"
            >
              −
            </button>
            <span class="renglon__numero cifra">
              <span class="solo-lectores">Cantidad: </span>{{ line.quantity }}
            </span>
            <button
              type="button"
              class="paso"
              :aria-label="`Agregar otro ${line.product.name}`"
              :title="line.quantity >= MAX_QUANTITY ? `Máximo ${MAX_QUANTITY} por producto` : null"
              :disabled="busy || line.quantity >= MAX_QUANTITY"
              @click="cart.add(line.product)"
            >
              +
            </button>
          </div>
        </li>
      </TransitionGroup>
    </div>

    <div class="comanda__pie">
      <label class="campo">
        <span class="campo__etiqueta">Nombre del cliente (opcional)</span>
        <input
          v-model.trim="customerName"
          class="campo__control"
          type="text"
          maxlength="60"
          autocomplete="off"
          placeholder="Para llamarlo cuando esté listo"
          :disabled="busy"
        />
      </label>

      <div class="comanda__total">
        <span>Total</span>
        <strong :key="cart.total" class="comanda__valor cifra">
          {{ formatPrice(cart.total) }}
        </strong>
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
        @click="$emit('clear')"
      >
        Vaciar pedido
      </button>
    </div>
  </section>
</template>

<style scoped>
.comanda {
  --diente: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.2rem 1.25rem calc(1.2rem + var(--diente));
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
}

.comanda__titulo {
  padding-bottom: 0.6rem;
  border-bottom: 2px dashed var(--tinta);
  font-size: 1.8rem;
}

/* Lo único que crece y se desplaza cuando el pedido es largo. */
.comanda__cuerpo {
  flex: 1;
  min-height: 3.5rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  margin-inline: -0.5rem;
  padding-inline: 0.5rem;
}

.comanda__vacia {
  padding: 0.6rem 0;
  color: var(--tinta-suave);
  font-weight: 600;
}

.comanda__renglones {
  position: relative;
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0.15rem 0;
  list-style: none;
}

.renglon {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.renglon__texto {
  display: grid;
  line-height: 1.25;
  overflow-wrap: anywhere;
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
  gap: 0.4rem;
}

.renglon__numero {
  min-width: 2ch;
  font-weight: 800;
  text-align: center;
}

.paso {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
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

.comanda__pie {
  display: grid;
  gap: 0.8rem;
}

.comanda__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 0.7rem;
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
  min-height: 44px;
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
