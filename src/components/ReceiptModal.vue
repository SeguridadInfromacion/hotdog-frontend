<script setup>
// Confirmación de la venta con los valores que calculó y guardó el servidor.
import { formatPrice, formatTime, shortOrderNumber } from '../utils/format'
import BaseModal from './BaseModal.vue'
import OrderLines from './OrderLines.vue'

defineProps({
  order: { type: Object, default: null },
})
defineEmits(['close'])
</script>

<template>
  <BaseModal :open="order !== null" title="Venta registrada" @close="$emit('close')">
    <div v-if="order" class="recibo">
      <div class="recibo__papel">
        <p class="recibo__numero">
          Venta {{ shortOrderNumber(order.id) }}, {{ formatTime(order.created_at) }}
        </p>
        <p v-if="order.customer_name" class="recibo__cliente">Para {{ order.customer_name }}</p>
        <OrderLines :items="order.items" />
        <p class="recibo__total">
          <span>Total</span>
          <strong class="cifra">{{ formatPrice(order.total) }}</strong>
        </p>
      </div>
      <button type="button" class="btn btn--principal btn--ancho" autofocus @click="$emit('close')">
        Nueva venta
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.recibo {
  display: grid;
  gap: 1.2rem;
}

.recibo__papel {
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.1rem;
  border: 2px dashed var(--tinta);
  border-radius: var(--radio-s);
  background: #fff;
  /* El recibo "sale de la impresora" de arriba hacia abajo. */
  animation: imprimir 0.6s 0.15s var(--suave) both;
}

.recibo__numero {
  color: var(--tinta-suave);
  font-weight: 700;
}

.recibo__cliente {
  font-weight: 700;
}

.recibo__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.6rem;
  border-top: 2px dashed var(--tinta);
  font-weight: 700;
}

.recibo__total strong {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 400;
}

@keyframes imprimir {
  from {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-10px);
  }

  to {
    clip-path: inset(0 0 0 0);
    transform: none;
  }
}
</style>
