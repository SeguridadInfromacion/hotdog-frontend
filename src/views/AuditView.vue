<script setup>
import { computed, ref } from 'vue'

import { AUDIT_SOURCES, fetchAuditTrail } from '../api'
import LoadState from '../components/LoadState.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { describeAction, formatPreciseDateTime, isAlertAction } from '../utils/format'

const ALL = 'Todo'

const { data, isLoading, isRefreshing, error, reload } = useAsyncData(fetchAuditTrail, {
  entries: [],
  unavailable: [],
})

const filter = ref(ALL)
const filters = [ALL, ...AUDIT_SOURCES.map((source) => source.service)]

const visibleEntries = computed(() =>
  filter.value === ALL
    ? data.value.entries
    : data.value.entries.filter((entry) => entry.service === filter.value),
)

// La bitácora no expone ids: la combinación de sus datos identifica cada fila.
const rowKey = (entry, index) =>
  `${entry.service}|${entry.occurred_at}|${entry.actor}|${entry.action}|${index}`
</script>

<template>
  <div class="pagina">
    <header class="pagina__encabezado">
      <div>
        <h1 class="pagina__titulo">Auditoría</h1>
        <p class="pagina__bajada">
          Quién hizo qué y cuándo. Cada servicio lleva su propia bitácora, que no se puede editar ni
          borrar desde la aplicación.
        </p>
      </div>
      <button type="button" class="btn" :disabled="isRefreshing" @click="reload">
        {{ isRefreshing ? 'Actualizando…' : 'Actualizar' }}
      </button>
    </header>

    <LoadState :is-loading="isLoading" :error="error" @retry="reload">
      <p v-if="data.unavailable.length" class="aviso-error aviso-parcial" role="alert">
        No respondió la bitácora de: {{ data.unavailable.join(', ') }}. Se muestra lo demás.
      </p>

      <div class="filtros" role="group" aria-label="Filtrar por servicio">
        <button
          v-for="option in filters"
          :key="option"
          type="button"
          class="filtro"
          :aria-pressed="filter === option"
          @click="filter = option"
        >
          {{ option }}
        </button>
      </div>

      <p v-if="visibleEntries.length === 0" class="hoja hoja--mensaje">
        No hay registros para mostrar.
      </p>

      <div v-else class="hoja tabla-marco" tabindex="0" role="region" aria-label="Bitácora">
        <table class="tabla">
          <thead>
            <tr>
              <th scope="col">Cuándo</th>
              <th scope="col">Servicio</th>
              <th scope="col">Usuario</th>
              <th scope="col">Qué pasó</th>
              <th scope="col">Detalle</th>
              <th scope="col">Dirección IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in visibleEntries" :key="rowKey(entry, index)">
              <td class="cifra tabla__fija">{{ formatPreciseDateTime(entry.occurred_at) }}</td>
              <td>
                <span class="etiqueta">{{ entry.service }}</span>
              </td>
              <td>{{ entry.actor }}</td>
              <td>
                <span v-if="isAlertAction(entry.action)" class="etiqueta etiqueta--alerta">
                  {{ describeAction(entry.action) }}
                </span>
                <template v-else>{{ describeAction(entry.action) }}</template>
              </td>
              <td class="tabla__detalle">{{ entry.target }}</td>
              <td class="cifra tabla__fija">{{ entry.ip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LoadState>
  </div>
</template>

<style scoped>
.aviso-parcial {
  margin-bottom: 1rem;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.filtro {
  min-height: 44px;
  padding: 0.35rem 1rem;
  border: 2px solid var(--tinta);
  border-radius: 999px;
  background: var(--papel);
  font-weight: 700;
}

.filtro[aria-pressed='true'] {
  background: var(--tinta);
  color: var(--mostaza);
}

/* En pantallas angostas la tabla se desliza de lado dentro de su marco. */
.tabla-marco {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.tabla th,
.tabla td {
  padding: 0.65rem 0.9rem;
  text-align: left;
  vertical-align: top;
}

.tabla th {
  border-bottom: 2px solid var(--tinta);
  background: var(--mostaza-clara);
  font-weight: 800;
  white-space: nowrap;
}

.tabla tbody tr + tr td {
  border-top: 1px solid var(--linea);
}

.tabla__fija {
  white-space: nowrap;
}

.tabla__detalle {
  min-width: 16rem;
  overflow-wrap: anywhere;
  color: var(--tinta-suave);
}
</style>
