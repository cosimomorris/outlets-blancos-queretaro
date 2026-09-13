# Outlet Blancos Querétaro

Tienda de blancos en Vue 3 + Vite con Mercado Pago Checkout Pro. Sitio: https://outletblancosqro.com.

## Desarrollo

```bash
npm install
npm run dev          # sitio sin API de pagos
npx netlify dev      # sitio, funciones y almacenamiento local
```

Vincula el proyecto existente con `npx netlify link` antes de usar sus variables de entorno. `netlify.toml` configura el build (`npm run build`), la carpeta pública (`dist`), las funciones (`api`) y Node 22.

## Flujo de pago

1. El cliente agrega productos y llena nombre, correo y WhatsApp.
2. `/api/create-preference` valida el carrito, toma los precios de `src/catalog.js` y crea el checkout en Mercado Pago.
3. El cliente paga en Mercado Pago y regresa a `/?mp=success|pending|failure`.
4. `/api/mp-webhook` verifica la firma, consulta el pago en Mercado Pago y guarda el pedido aprobado en Netlify Blobs.

El parámetro de retorno solo controla la interfaz. La confirmación del pago proviene del webhook firmado y de la consulta a Mercado Pago.

## Pedidos

No se usa Resend ni se envían correos personalizados de pedidos. Consulta los pagos y reembolsos en Mercado Pago. Los datos completos del pedido se guardan en **Netlify → outletqro → Blobs**:

- `orders`: pedidos con pagos reales.
- `orders-test`: pedidos con pagos de prueba.
- Clave: `payment-<id de Mercado Pago>`.

Cada registro incluye productos, cantidades, precios, total, moneda, datos del cliente, opción de entrega e identificador del pago. Los reintentos del webhook no duplican el registro. Los pedidos sobreviven a nuevos despliegues y no tienen una ruta pública de lectura. El registro conserva la aprobación inicial; el estado posterior de reembolsos se consulta en Mercado Pago.

## Variables de entorno

Configura estas variables en **Netlify → Project configuration → Environment variables**, con alcance **Functions**. Usa valores separados por contexto de despliegue. No guardes secretos en Git ni en `netlify.toml`.

| Variable | Producción | Pruebas / desarrollo |
| --- | --- | --- |
| `MP_ACCESS_TOKEN` | Token real de Mercado Pago | Token del vendedor de prueba |
| `MP_WEBHOOK_SECRET` | Secreto del webhook real | Secreto del webhook de prueba |
| `SITE_URL` | `https://outletblancosqro.com` | Sin definir: usa el origen de la solicitud |

Netlify Blobs recibe acceso desde el entorno de la función; no necesita una cuenta ni una API key adicionales. Para desarrollo local puedes copiar `.env.example` a `.env` (ignorado por Git).

## Cuentas y despliegue

- Netlify: proyecto `outletqro`, de `cosimomorris’s team`, cuenta `morriscosimo@gmail.com`.
- Netlify Project ID: `8b531e7d-4a84-41b5-a93d-ed5c9459ddbe`.
- Repositorio: `cosimomorris/outlets-blancos-queretaro`.
- Mercado Pago: aplicación `Outlet Blancos Tienda`, ID `3680872779809361`, Checkout Pro / API de Preferences.
- Webhook real: `https://outletblancosqro.com/api/mp-webhook`, evento **Pagos**.

La API de Preferences corresponde al código existente. Mercado Pago la etiqueta como legacy; su documentación indica que sigue soportada para integraciones existentes. Una migración a Orders debe tratarse como un cambio de integración completo.

La versión pública previa se subió con Netlify Drop. Durante la configuración de pagos se bloqueó la publicación automática de ese despliegue para probar la nueva versión con su permalink. Antes de publicar, completa las comprobaciones de `PAYMENTS-TODO.md`; después publica la versión validada y reactiva la publicación automática.

## Verificación

Prueba con las cuentas y tarjetas de prueba de Mercado Pago desde el sitio desplegado. Verifica pagos aprobados, rechazados y pendientes, el retorno al sitio, los registros en `orders-test` y los logs de ambas funciones. El build local no verifica el procesamiento de pagos ni la persistencia en Netlify.
