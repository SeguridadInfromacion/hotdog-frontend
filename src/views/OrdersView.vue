<script setup>
import { ordersApi } from '../api'
import LoadState from '../components/LoadState.vue'
import OrderLines from '../components/OrderLines.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { useAuthStore } from '../stores/auth'
import { formatDateTime, formatPrice, shortOrderNumber } from '../utils/format'

const auth = useAuthStore()

const { data, isLoading, isRefreshing, error, reload } = useAsyncData(
  async () => {
    const [orders, summary] = await Promise.all([ordersApi.list(), ordersApi.summary()])
    return { orders, summary }
  },
  { orders: [], summary: { orders_count: 0, revenue: 0 } },
)

/** "16 nov 2026, 12:29 p. m., para Marta, atendió cajero" */
function describe(order) {
  return [
    formatDateTime(order.created_at),
    order.customer_name && `para ${order.customer_name}`,
    auth.isAdmin && `atendió ${order.cashier_username}`,
  ]
    .filter(Boolean)
    .join(', ')
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__encabezado">
      <div>
        <h1 class="pagina__titulo">Ventas</h1>
        <p class="pagina__bajada">
          {{
            auth.isAdmin
              ? 'Las ventas de todos los cajeros, de la más reciente a la más antigua.'
              : 'Tus ventas, de la más reciente a la más antigua.'
          }}
        </p>
      </div>
      <button type="button" class="btn" :disabled="isRefreshing" @click="reload">
        {{ isRefreshing ? 'Actualizando…' : 'Actualizar' }}
      </button>
    </header>

    <LoadState :is-loading="isLoading" :error="error" @retry="reload">
      <dl class="resumen">
        <div class="resumen__dato hoja">
          <dt>Ventas en las últimas 24 horas</dt>
          <dd class="cifra">{{ data.summary.orders_count }}</dd>
        </div>
        <div class="resumen__dato hoja">
          <dt>Vendido en las últimas 24 horas</dt>
          <dd class="cifra">{{ formatPrice(data.summary.revenue) }}</dd>
        </div>
      </dl>

      <div v-if="data.orders.length === 0" class="hoja hoja--mensaje">
        <p>Todavía no hay ventas registradas.</p>
        <RouterLink :to="{ name: 'sell' }" class="btn btn--principal">
          Registrar una venta
        </RouterLink>
      </div>

      <ul v-else class="ventas lista-plana">
        <li v-for="order in data.orders" :key="order.id" class="tirilla hoja">
          <div class="tirilla__cabecera">
            <h2 class="tirilla__numero">Venta {{ shortOrderNumber(order.id) }}</h2>
            <p class="tirilla__total cifra">{{ formatPrice(order.total) }}</p>
          </div>
          <p class="tirilla__datos">{{ describe(order) }}</p>
          <OrderLines class="tirilla__productos" :items="order.items" />
        </li>
      </ul>
    </LoadState>
  </div>
</template>

<style scoped>
.resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin: 0 0 1.75rem;
}

.resumen__dato {
  padding: 1rem 1.25rem 1.1rem;
}

.resumen__dato dt {
  color: var(--tinta-suave);
  font-weight: 700;
}

.resumen__dato dd {
  margin: 0.15rem 0 0;
  font-family: var(--font-display);
  font-size: 2.4rem;
  line-height: 1.1;
}

.ventas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem 1.25rem;
}

.tirilla {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  min-width: 0;
  padding: 1rem 1.2rem 1.15rem;
  overflow-wrap: anywhere;
}

.tirilla__cabecera {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.tirilla__numero {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: 0;
}

.tirilla__total {
  flex: none;
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.tirilla__datos {
  color: var(--tinta-suave);
  font-size: 0.93rem;
}

.tirilla__productos {
  margin-top: 0.3rem;
  padding-top: 0.6rem;
  border-top: 2px dashed var(--linea);
}
</style>
