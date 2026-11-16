<script setup>
import { ref } from 'vue'

import { ordersApi, productsApi } from '../api'
import LoadState from '../components/LoadState.vue'
import OrderTicket from '../components/OrderTicket.vue'
import ProductCard from '../components/ProductCard.vue'
import ReceiptModal from '../components/ReceiptModal.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { MAX_QUANTITY, useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toasts'
import { formatPrice } from '../utils/format'

const cart = useCartStore()
const toasts = useToastStore()

const {
  data: products,
  isLoading,
  error,
  reload,
} = useAsyncData(() => productsApi.list({ onlyAvailable: true }), [])

const customerName = ref('')
const isCharging = ref(false)
const receipt = ref(null)

function addToOrder(product) {
  if (!cart.add(product)) {
    toasts.error(`Máximo ${MAX_QUANTITY} unidades de un mismo producto por venta.`)
  }
}

async function charge() {
  if (cart.isEmpty || isCharging.value) return
  isCharging.value = true
  try {
    receipt.value = await ordersApi.create({
      customer_name: customerName.value,
      items: cart.payload,
    })
    cart.clear()
    customerName.value = ''
  } catch (failure) {
    toasts.error(failure.message)
    // Si el menú cambió mientras se armaba el pedido, se vuelve a traer.
    if (failure.status === 422) reload()
  } finally {
    isCharging.value = false
  }
}

function goToTicket() {
  document.getElementById('pedido')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__encabezado">
      <div>
        <h1 class="pagina__titulo">¿Qué va a llevar?</h1>
        <p class="pagina__bajada">Toca cada perro para sumarlo al pedido.</p>
      </div>
    </header>

    <div class="venta">
      <LoadState :is-loading="isLoading" :error="error" @retry="reload">
        <p v-if="products.length === 0" class="hoja venta__sin-menu">
          No hay productos disponibles. Un administrador puede agregarlos en Menú.
        </p>
        <div v-else class="venta__menu">
          <ProductCard
            v-for="(product, index) in products"
            :key="product.id"
            :product="product"
            :variant="index"
            :quantity="cart.quantityOf(product.id)"
            @add="addToOrder"
          />
        </div>
      </LoadState>

      <aside class="venta__pedido">
        <OrderTicket v-model:customer-name="customerName" :busy="isCharging" @charge="charge" />
      </aside>
    </div>

    <Transition name="barra">
      <button v-if="!cart.isEmpty" type="button" class="barra-pedido" @click="goToTicket">
        <span>Ver pedido ({{ cart.itemCount }})</span>
        <strong class="cifra">{{ formatPrice(cart.total) }}</strong>
      </button>
    </Transition>

    <ReceiptModal :order="receipt" @close="receipt = null" />
  </div>
</template>

<style scoped>
.venta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;
  gap: 2rem;
}

.venta__menu {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem 1.25rem;
}

.venta__sin-menu {
  padding: 1.5rem;
  font-weight: 600;
}

.venta__pedido {
  position: sticky;
  top: 7.5rem;
}

.barra-pedido {
  display: none;
}

@media (max-width: 900px) {
  .venta {
    grid-template-columns: 1fr;
  }

  .venta__pedido {
    position: static;
    scroll-margin-top: 1rem;
  }

  .venta__menu {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.25rem 0.9rem;
  }

  .barra-pedido {
    position: fixed;
    inset: auto 1rem 1rem;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    padding: 0.6rem 1.2rem;
    border: 2px solid var(--tinta);
    border-radius: 999px;
    background: var(--tinta);
    color: var(--mostaza);
    font-weight: 700;
    box-shadow: 0 6px 18px rgb(43 20 7 / 0.35);
  }

  .barra-enter-active,
  .barra-leave-active {
    transition:
      transform 0.3s var(--rebote),
      opacity 0.2s;
  }

  .barra-enter-from,
  .barra-leave-to {
    opacity: 0;
    transform: translateY(120%);
  }
}
</style>
