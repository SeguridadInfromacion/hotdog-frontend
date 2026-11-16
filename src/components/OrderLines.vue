<script setup>
// Los renglones de una venta ya registrada (recibo e historial).
import { formatPrice } from '../utils/format'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <ul class="renglones">
    <li v-for="(item, index) in items" :key="index">
      <span>{{ item.quantity }} × {{ item.product_name }}</span>
      <span class="cifra">{{ formatPrice(item.line_total) }}</span>
    </li>
  </ul>
</template>

<style scoped>
.renglones {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-wrap: anywhere;
}

.renglones li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.renglones .cifra {
  flex: none;
}
</style>
