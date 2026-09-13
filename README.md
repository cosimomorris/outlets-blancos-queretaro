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

1. El cliente agrega productos y llena nombre, correo y WhatsApp. Si elige coordinar entrega, también debe completar destinatario, calle y número, colonia, ciudad, estado y código postal de 5 dígitos. Interior y referencias son opcionales. El envío se cotiza aparte y no se cobra en este checkout.
2. `/api/create-preference` valida el carrito, toma los precios de `src/catalog.js` y crea el checkout en Mercado Pago.
3. El cliente paga en Mercado Pago y regresa a `/?mp=success|pending|failure`.
4. `/api/mp-webhook` verifica la firma, consulta el pago en Mercado Pago y guarda el pedido aprobado en Netlify Blobs. Después intenta enviar un correo a la tienda y otro al cliente.

El parámetro de retorno solo controla la interfaz. La confirmación del pago proviene del webhook firmado y de la consulta a Mercado Pago.

## Pedidos

No se usa Resend. Los correos de pedidos usan Gmail SMTP desde `outletblancosqro@gmail.com`, con copia separada para esa misma cuenta y para el correo del cliente. Requieren la configuración indicada abajo. No se envían mensajes automáticos de WhatsApp. Consulta los pagos y reembolsos en Mercado Pago. Los datos completos del pedido se guardan en **Netlify → outletqro → Blobs**:

- `orders`: pedidos con pagos reales.
- `orders-test`: pedidos con pagos de prueba.
- Clave: `payment-<id de Mercado Pago>`.

Cada registro incluye productos, cantidades, precios, total, moneda, datos del cliente, opción de entrega, dirección cuando corresponde e identificador del pago. Los reintentos del webhook no duplican el registro. Los pedidos sobreviven a nuevos despliegues y no tienen una ruta pública de lectura. El registro conserva la aprobación inicial; el estado posterior de reembolsos se consulta en Mercado Pago.

## Activar correos de pedidos

Cambio preparado el 2026-09-13. La contraseña de aplicación se guardó como secreto de Production en Netlify y la autenticación SMTP con Gmail se verificó sin enviar correo. Pendientes: despliegue y prueba real de recepción. El propietario pidió correos tanto para la tienda como para el cliente y confirmó `outletblancosqro@gmail.com` como remitente y destinatario de la tienda.

1. En esa cuenta de Google, activa la verificación en dos pasos y crea una contraseña de aplicación para la tienda. Usa la [guía de Gmail SMTP](https://nodemailer.com/guides/using-gmail); la contraseña normal de Gmail no sirve para esta configuración.
2. En Netlify → `outletqro` → Project configuration → Environment variables, guarda la contraseña de aplicación como `ORDER_EMAIL_APP_PASSWORD`, marcada como secreta y con alcance que incluya Functions en el contexto que vas a probar. El plan actual permite Builds, Functions y Runtime juntos para secretos. No la pegues en Git ni en el chat.
3. Para pagos sandbox, configura también `ORDER_EMAIL_TEST_TO` con una bandeja controlada. Ambas copias van a esa bandeja; sin esta variable los pagos sandbox no envían correos. Los pagos reales siempre usan los destinatarios reales.
4. Despliega el cambio. Completa una compra autorizada desde el checkout desplegado y comprueba la dirección en Blobs y la recepción de ambos correos. Un build local no verifica Gmail, el webhook ni Netlify Blobs.

Los correos incluyen productos, variantes, cantidades, precios, total pagado, referencia de pedido y pago, contacto y dirección o recogida con cita. El envío aparece como un costo aparte pendiente de confirmar. Solo se envían cuando Mercado Pago devuelve un pago aprobado.

El estado de cada copia se guarda en `order-emails` o `order-emails-test`, con clave `payment-<id>-owner|customer`. Un bloqueo temporal y escrituras condicionales evitan envíos simultáneos. Si falla una copia, el webhook responde con error para permitir un reintento; la copia ya marcada `sent` se omite. El pedido se guarda antes del envío de correo. Una contraseña ausente o inválida no borra el pedido.

SMTP no garantiza entrega exactamente una vez: si Gmail acepta un correo y la función termina antes de guardar `sent`, un reintento puede duplicarlo. `sent` significa aceptado por Gmail; confirma la llegada a la bandeja y revisa spam. Si se agotan los reintentos de Mercado Pago, corrige la configuración y reenvía la notificación desde su panel. No hay una cola de reintentos independiente.

## Variables de entorno

Configura estas variables en **Netlify → Project configuration → Environment variables**, con alcance **Functions**. Usa valores separados por contexto de despliegue. No guardes secretos en Git ni en `netlify.toml`.

| Variable | Producción | Pruebas / desarrollo |
| --- | --- | --- |
| `MP_ACCESS_TOKEN` | Token real de Mercado Pago | Token del vendedor de prueba |
| `MP_WEBHOOK_SECRET` | Secreto del webhook real | Secreto del webhook de prueba |
| `ORDER_EMAIL_APP_PASSWORD` | Contraseña de aplicación de Gmail | Contraseña de aplicación, solo si se prueban correos |
| `ORDER_EMAIL_TEST_TO` | Dejar sin configurar | Bandeja controlada para ambas copias sandbox |
| `SITE_URL` | `https://outletblancosqro.com` | Sin definir: usa el origen de la solicitud |

Netlify Blobs recibe acceso desde el entorno de la función; no necesita una cuenta ni una API key adicionales. Para desarrollo local puedes copiar `.env.example` a `.env` (ignorado por Git).

## Cuentas y despliegue

- Netlify: proyecto `outletqro`, de `cosimomorris’s team`, cuenta `morriscosimo@gmail.com`.
- Netlify Project ID: `8b531e7d-4a84-41b5-a93d-ed5c9459ddbe`.
- Repositorio: `cosimomorris/outlets-blancos-queretaro`.
- Mercado Pago: aplicación `Outlet Blancos Tienda`, ID `3680872779809361`, Checkout Pro / API de Preferences.
- Webhook real: `https://outletblancosqro.com/api/mp-webhook`, evento **Pagos**.

La API de Preferences corresponde al código existente. Mercado Pago la etiqueta como legacy; su documentación indica que sigue soportada para integraciones existentes. Una migración a Orders debe tratarse como un cambio de integración completo.

La tienda se publicó con credenciales reales el 13 de septiembre de 2026 por solicitud del propietario. Netlify publica automáticamente los cambios de `main`. La creación del checkout y la redirección a Mercado Pago se verificaron en producción. Un pago completado, el guardado del pedido y el reembolso siguen pendientes de verificación; consulta `PAYMENTS-TODO.md`.

## Verificación

Prueba con las cuentas y tarjetas de prueba de Mercado Pago desde el sitio desplegado. Verifica pagos aprobados, rechazados y pendientes, el retorno al sitio, los registros en `orders-test` y los logs de ambas funciones. El build local no verifica el procesamiento de pagos ni la persistencia en Netlify.
