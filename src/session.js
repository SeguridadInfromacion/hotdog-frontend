// Un solo lugar para "se acabó la sesión en este navegador", pase lo que pase:
// la persona salió, el token venció o desactivaron su usuario.

import { router } from './router'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useToastStore } from './stores/toasts'

const SERVER_NOT_REACHED =
  'No se pudo avisar al servidor que saliste. Por seguridad, cierra el navegador.'
const SESSION_EXPIRED = 'Tu sesión venció. Entra de nuevo para continuar.'

/**
 * Borra todo lo que quedó en memoria (usuario, pedido en curso, avisos) y vuelve
 * a la pantalla de entrada. En una caja compartida, quien entre después no debe
 * encontrar nada de la persona anterior.
 */
async function leave(notice = '') {
  const toasts = useToastStore()
  useAuthStore().clear()
  useCartStore().clear()
  toasts.clear()
  await router.replace({ name: 'login' })
  if (notice) toasts.error(notice)
}

/** La persona eligió salir. */
export async function signOut() {
  const closedOnServer = await useAuthStore().logout()
  await leave(closedOnServer ? '' : SERVER_NOT_REACHED)
}

/** El servidor respondió 401 a mitad de trabajo. Varias respuestas a la vez cuentan una. */
export function handleExpiredSession() {
  if (!useAuthStore().user) return
  leave(SESSION_EXPIRED)
}
