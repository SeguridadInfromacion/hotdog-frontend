<script setup>
import { computed, ref } from 'vue'

import { fetchAuditTrail } from '../api'
import LoadState from '../components/LoadState.vue'
import { useAsyncData } from '../composables/useAsyncData'
import { describeAction, formatDateTime, isAlertAction } from '../utils/format'

const ALL = 'Todo'

const { data, isLoading, error, reload } = useAsyncData(fetchAuditTrail, {
  entries: [],
  unavailable: [],
})

const filter = ref(ALL)
const filters = [ALL, 'Usuarios', 'Menú', 'Ventas']

const visibleEntries = computed(() =>
  filter.value === ALL
    ? data.value.entries
    : data.value.entries.filter((entry) => entry.service === filter.value),
)
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
      <button type="button" class="btn" :disabled="isLoading" @click="reload">Actualizar</button>
    </header>

    <LoadState :is-loading="isLoading" :error="error" @retry="reload">
      <p v-if="data.unavailable.length" class="aviso-error" role="alert">
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

      <p v-if="visibleEntries.length === 0" class="hoja sin-registros">
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
            <tr v-for="(entry, index) in visibleEntries" :key="index">
              <td class="cifra tabla__fecha">{{ formatDateTime(entry.occurred_at) }}</td>
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
              <td class="cifra">{{ entry.ip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LoadState>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 0 1.25rem;
}

.aviso-error + .filtros {
  margin-top: 1rem;
}

.filtro {
  min-height: 42px;
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

.sin-registros {
  padding: 1.5rem;
  font-weight: 600;
}

.tabla-marco {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  min-width: 760px;
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

.tabla__fecha {
  white-space: nowrap;
}

.tabla__detalle {
  max-width: 34ch;
  overflow-wrap: anywhere;
  color: var(--tinta-suave);
}
</style>
