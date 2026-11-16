<script setup>
import { ref } from 'vue'

import { productsApi } from '../api'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import HotdogArt from '../components/HotdogArt.vue'
import LoadState from '../components/LoadState.vue'
import ProductForm from '../components/ProductForm.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { useConfirmAction } from '../composables/useConfirmAction'
import { useToastStore } from '../stores/toasts'
import { formatPrice } from '../utils/format'

const toasts = useToastStore()
const { data: products, isLoading, error, reload } = useAsyncData(() => productsApi.list(), [])

const isFormOpen = ref(false)
const editing = ref(null)

const removal = useConfirmAction(async (product) => {
  await productsApi.remove(product.id)
  toasts.success(`${product.name} eliminado.`)
  reload()
})

function openForm(product = null) {
  editing.value = product
  isFormOpen.value = true
}

function onSaved(saved) {
  isFormOpen.value = false
  toasts.success(`${saved.name} guardado.`)
  reload()
}
</script>

<template>
  <div class="pagina">
    <header class="pagina__encabezado">
      <div>
        <h1 class="pagina__titulo">Menú</h1>
        <p class="pagina__bajada">
          Lo que se vende y a cuánto. Cada caja toma los cambios la próxima vez que abre Vender.
        </p>
      </div>
      <button type="button" class="btn btn--principal" @click="openForm()">Agregar producto</button>
    </header>

    <LoadState :is-loading="isLoading" :error="error" @retry="reload">
      <p v-if="products.length === 0" class="hoja hoja--mensaje">
        El menú está vacío. Agrega el primer producto para empezar a vender.
      </p>

      <TransitionGroup v-else tag="ul" name="lista" class="menu lista-plana">
        <li
          v-for="product in products"
          :key="product.id"
          class="plato hoja"
          :class="{ 'plato--agotado': !product.is_available }"
        >
          <HotdogArt class="plato__dibujo" :seed="product.id" />
          <div class="plato__texto">
            <h2 class="plato__nombre">{{ product.name }}</h2>
            <p class="plato__descripcion">{{ product.description || 'Sin descripción.' }}</p>
          </div>
          <span
            class="etiqueta"
            :class="product.is_available ? 'etiqueta--ok' : 'etiqueta--apagada'"
          >
            {{ product.is_available ? 'Disponible' : 'Agotado' }}
          </span>
          <p class="plato__precio cifra">{{ formatPrice(product.price) }}</p>
          <div class="plato__acciones">
            <button
              type="button"
              class="btn btn--chico"
              :aria-label="`Editar ${product.name}`"
              @click="openForm(product)"
            >
              Editar
            </button>
            <button
              type="button"
              class="btn btn--chico btn--peligro"
              :aria-label="`Eliminar ${product.name}`"
              @click="removal.ask(product)"
            >
              Eliminar
            </button>
          </div>
        </li>
      </TransitionGroup>
    </LoadState>

    <ProductForm
      :open="isFormOpen"
      :product="editing"
      @close="isFormOpen = false"
      @saved="onSaved"
    />
    <ConfirmDialog
      :open="removal.target.value !== null"
      title="Eliminar producto"
      :message="`Vas a eliminar «${removal.target.value?.name ?? ''}» del menú. Las ventas ya registradas no cambian.`"
      confirm-label="Eliminar producto"
      :busy="removal.isBusy.value"
      :error="removal.error.value"
      @confirm="removal.confirm"
      @cancel="removal.cancel"
    />
  </div>
</template>

<style scoped>
.menu {
  position: relative;
  display: grid;
  gap: 1.1rem;
}

.plato {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 0.6rem 1.25rem;
  width: 100%;
  padding: 0.85rem 1.2rem;
}

.plato__texto {
  min-width: 0;
  overflow-wrap: anywhere;
}

.plato__nombre {
  font-size: 1.3rem;
}

.plato__descripcion {
  color: var(--tinta-suave);
  font-size: 0.95rem;
}

/* Un agotado se reconoce de un vistazo, no solo por la etiqueta. */
.plato--agotado .plato__dibujo {
  filter: grayscale(1);
  opacity: 0.55;
}

.plato--agotado .plato__nombre,
.plato--agotado .plato__precio {
  color: var(--tinta-suave);
}

.plato__precio {
  min-width: 8ch;
  font-size: 1.15rem;
  font-weight: 800;
  text-align: right;
}

.plato__acciones {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 820px) {
  .plato {
    grid-template-columns: 64px minmax(0, 1fr) auto;
  }

  .plato__texto {
    grid-column: 2 / -1;
  }

  .plato .etiqueta {
    grid-column: 1 / 3;
    justify-self: start;
  }

  .plato__acciones {
    grid-column: 1 / -1;
  }

  .plato__acciones .btn {
    flex: 1;
  }
}
</style>
