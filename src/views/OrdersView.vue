<script setup>
import { ordersApi } from '../api'
import LoadState from '../components/LoadState.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { useAuthStore } from '../stores/auth'
import { formatDateTime, formatPrice, shortOrderNumber } from '../utils/format'

const auth = useAuthStore()

const { data, isLoading, error, reload } = useAsyncData(
  async () => {
    const [orders, summary] = await Promise.all([ordersApi.list(), ordersApi.summary()])
    return { orders, summary }
  },
  { orders: [], summary: { orders_count: 0, revenue: 0 } },
)
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
      <button type="button" class="btn" :disabled="isLoading" @click="reload">Actualizar</button>
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

      <div v-if="data.orders.length === 0" class="hoja sin-ventas">
        <p>Todavía no hay ventas registradas.</p>
        <RouterLink :to="{ name: 'sell' }" class="btn btn--principal"
          >Registrar una venta</RouterLink
        >
      </div>

      <ul v-else class="ventas">
        <li v-for="order in data.orders" :key="order.id" class="venta hoja">
          <div class="venta__cabecera">
            <p class="venta__numero">Venta {{ shortOrderNumber(order.id) }}</p>
            <p class="venta__total cifra">{{ formatPrice(order.total) }}</p>
          </div>
          <p class="venta__datos">
            {{ formatDateTime(order.created_at) }}
            <template v-if="order.customer_name">, para {{ order.customer_name }}</template>
            <template v-if="auth.isAdmin">, atendió {{ order.cashier_username }}</template>
          </p>
          <ul class="venta__productos">
            <li v-for="item in order.items" :key="item.product_name">
              <span>{{ item.quantity }} × {{ item.product_name }}</span>
              <span class="cifra">{{ formatPrice(item.line_total) }}</span>
            </li>
          </ul>
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

.sin-ventas {
  display: grid;
  justify-items: start;
  gap: 1rem;
  padding: 1.5rem;
  font-weight: 600;
}

.ventas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.venta {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  padding: 1rem 1.2rem 1.15rem;
}

.venta__cabecera {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.venta__numero {
  font-weight: 800;
}

.venta__total {
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.venta__datos {
  color: var(--tinta-suave);
  font-size: 0.93rem;
}

.venta__productos {
  display: grid;
  gap: 0.2rem;
  margin: 0.3rem 0 0;
  padding: 0.6rem 0 0;
  border-top: 2px dashed var(--linea);
  list-style: none;
}

.venta__productos li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
