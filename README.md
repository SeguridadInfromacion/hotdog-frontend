# hotdog-frontend

Interfaz de **PerroCaliente Express**: la caja para vender, el menú, el
historial de ventas, los usuarios y la auditoría.

Vue 3, Vite, Pinia, Vue Router.
Documentación general: [hotdog-docs](https://github.com/SeguridadInfromacion/hotdog-docs).

## Pantallas

| Ruta | Quién | Para qué |
|---|---|---|
| `/entrar` | cualquiera | Iniciar sesión |
| `/vender` | cajero y admin | Armar un pedido y registrar la venta |
| `/ventas` | cajero y admin | Historial y resumen de las últimas 24 horas |
| `/menu` | admin | Agregar, editar y eliminar productos |
| `/usuarios` | admin | Agregar, editar, activar y desactivar usuarios |
| `/auditoria` | admin | Bitácora unificada de los tres servicios |

## Decisiones de seguridad

- **El navegador no guarda el token.** La sesión es una cookie `HttpOnly` que el
  JavaScript no puede leer. No hay nada en `localStorage`.
- **Defensa contra XSS.** Todo el texto pasa por las plantillas de Vue, que lo
  escapan. El linter prohíbe `v-html` y `eval`, y la CSP del gateway es la segunda barrera.
- **Compatible con una CSP estricta.** Sin scripts ni estilos en línea, sin CDN:
  las fuentes van empaquetadas.
- **Cabecera anti-CSRF** en todas las peticiones (`src/api/http.js`).
- **Las guardas de ruta son comodidad, no seguridad.** Ocultar un botón no
  protege nada: cada permiso lo decide el servidor en cada petición.
- **Solo ids y cantidades.** Al vender nunca se envían precios.
- **El campo de la contraseña se vacía** apenas termina el intento de inicio de sesión.
- **Salir limpia todo.** Al cerrar sesión o vencer el token se borran de memoria
  el usuario, el pedido en curso y los avisos: en una caja compartida, quien
  entra después no encuentra nada de la persona anterior (`src/session.js`).
- **Renovación automática.** El token dura 10 minutos y se renueva solo mientras
  la caja está abierta; si desactivan al usuario, la renovación falla y la
  sesión se cierra.

## Estructura

```
src/
  api/          llamadas al backend (http.js es la única salida)
  session.js    cierre de sesión: limpia todo el estado local
  stores/       estado: sesión, pedido en curso, avisos
  router/       rutas y guardas
  views/        una por pantalla
  components/   piezas reutilizables
  composables/  carga de datos, guardado de formularios y acciones con confirmación
  utils/        formato de precios, fechas y etiquetas
  styles/       sistema visual
tests/          pruebas unitarias
```

## Desarrollo

Con el sistema corriendo (ver
[hotdog-infra](https://github.com/SeguridadInfromacion/hotdog-infra)):

```bash
npm ci
npm run dev        # http://localhost:5173, usa la API del gateway local
```

```bash
npm test           # pruebas
npm run lint       # eslint
npm run build      # compilar para producción
npm audit          # dependencias vulnerables
```

## Accesibilidad

Navegable con teclado, foco siempre visible, ventanas modales nativas
(`<dialog>`), avisos anunciados a lectores de pantalla y animaciones que se
apagan si el sistema pide movimiento reducido.
