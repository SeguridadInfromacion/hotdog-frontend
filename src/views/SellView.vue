<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { ordersApi, productsApi } from '../api'
import { userMessage } from '../api/http'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import LoadState from '../components/LoadState.vue'
import OrderTicket from '../components/OrderTicket.vue'
import ProductCard from '../components/ProductCard.vue'
import ReceiptModal from '../components/ReceiptModal.vue'
import { useAsyncData } from '../composables/useAsyncData'
import {
  ADDED,
  LINES_LIMIT,
  MAX_LINES,
  MAX_QUANTITY,
  QUANTITY_LIMIT,
  useCartStore,
} from '../stores/cart'
import { useToastStore } from '../stores/toasts'
import { formatPrice } from '../utils/format'

const LIMIT_MESSAGES = {
  [QUANTITY_LIMIT]: `Máximo ${MAX_QUANTITY} unidades de un mismo producto por venta.`,
  [LINES_LIMIT]: `Máximo ${MAX_LINES} productos distintos por venta.`,
}
const UNCONFIRMED_SALE =
  'No se pudo confirmar la venta. Antes de intentar de nuevo, revisa en Ventas si quedó registrada.'

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
const isConfirmingClear = ref(false)
const receipt = ref(null)
const announcement = ref('')
const ticket = ref(null)
const isTicketInView = ref(true)

// Cada vez que llega el menú, el pedido se pone al día: precios actuales
// y fuera lo que ya no se vende.
watch(products, (current) => {
  if (isLoading.value) return
  const removed = cart.reconcile(current)
  if (removed.length)
    toasts.error(`Ya no está en el menú y se quitó del pedido: ${removed.join(', ')}.`)
})

function addToOrder(product) {
  if (isCharging.value) return
  const result = cart.add(product)
  if (result === ADDED) {
    announcement.value = `${product.name}: ${cart.quantityOf(product.id)} en el pedido.`
  } else {
    toasts.error(LIMIT_MESSAGES[result])
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
    reportChargeFailure(failure)
  } finally {
    isCharging.value = false
  }
}

function reportChargeFailure(failure) {
  // Una sesión vencida ya la anuncia el manejador global.
  if (failure.isSessionExpired) return
  toasts.error(failure.isNetworkFailure ? UNCONFIRMED_SALE : userMessage(failure))
  // Si el menú cambió mientras se armaba el pedido, se vuelve a traer.
  if (failure.status === 422) reload()
}

function clearOrder() {
  cart.clear()
  isConfirmingClear.value = false
}

async function startNextSale() {
  receipt.value = null
  await nextTick()
  window.scrollTo({ top: 0 })
  document.querySelector('.producto')?.focus({ preventScroll: true })
}

function goToTicket() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ticket.value?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  document.getElementById('comanda-titulo')?.focus({ preventScroll: true })
}

// En celular, la barra "Ver pedido" sobra cuando el pedido ya está en pantalla.
let observer = null
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    isTicketInView.value = entry.isIntersecting
  })
  observer.observe(ticket.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="pagina" :class="{ 'pagina--con-barra': !cart.isEmpty }">
    <p class="solo-lectores" role="status">{{ announcement }}</p>

    <div class="venta">
      <div class="venta__carta">
        <header class="pagina__encabezado">
          <div>
            <h1 class="pagina__titulo">¿Qué va a llevar?</h1>
            <p class="pagina__bajada">Toca cada perro para sumarlo al pedido.</p>
          </div>
        </header>
        <LoadState :is-loading="isLoading" :error="error" @retry="reload">
          <p v-if="products.length === 0" class="hoja hoja--mensaje">
            No hay productos disponibles. Un administrador puede agregarlos en Menú.
          </p>
          <div v-else class="venta__menu">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              :quantity="cart.quantityOf(product.id)"
              :disabled="isCharging"
              @add="addToOrder"
            />
          </div>
        </LoadState>
      </div>

      <aside ref="ticket" class="venta__pedido">
        <OrderTicket
          v-model:customer-name="customerName"
          :busy="isCharging"
          @charge="charge"
          @clear="isConfirmingClear = true"
        />
      </aside>
    </div>

    <Transition name="barra">
      <button
        v-if="!cart.isEmpty && !isTicketInView"
        type="button"
        class="barra-pedido"
        @click="goToTicket"
      >
        <span>Ver pedido ({{ cart.itemCount }})</span>
        <strong class="cifra">{{ formatPrice(cart.total) }}</strong>
      </button>
    </Transition>

    <ConfirmDialog
      :open="isConfirmingClear"
      title="Vaciar el pedido"
      message="Se quitan todos los productos del pedido que estás armando."
      confirm-label="Vaciar pedido"
      @confirm="clearOrder"
      @cancel="isConfirmingClear = false"
    />
    <ReceiptModal :order="receipt" @close="startNextSale" />
  </div>
</template>

<style scoped>
.venta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;
  gap: 2rem;
}

.venta__carta {
  min-width: 0;
}

.venta__menu {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem 1.25rem;
}

/* El pedido acompaña al desplazarse y nunca es más alto que la pantalla:
   el botón de registrar la venta siempre está a la vista. */
.venta__pedido {
  position: sticky;
  top: calc(var(--alto-cabecera) + 1rem);
  display: flex;
  /* Alto libre bajo la cabecera, menos el margen de la página arriba y abajo. */
  max-height: calc(100dvh - var(--alto-cabecera) - 3.25rem);
  filter: drop-shadow(0 4px 0 var(--tinta));
}

.venta__pedido > * {
  flex: 1;
  min-height: 0;
}

.barra-pedido {
  display: none;
}

@media (max-width: 900px) {
  .venta {
    grid-template-columns: minmax(0, 1fr);
  }

  .venta__pedido {
    position: static;
    max-height: none;
    scroll-margin-top: 1rem;
  }

  .venta__menu {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.25rem 0.9rem;
  }

  .pagina--con-barra {
    padding-bottom: 6.5rem;
  }

  .barra-pedido {
    position: fixed;
    inset: auto 1rem calc(1rem + env(safe-area-inset-bottom));
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
