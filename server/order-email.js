import nodemailer from 'nodemailer'
import { getStore } from '@netlify/blobs'

const shopEmail = 'outletblancosqro@gmail.com'
const leaseMs = 2 * 60 * 1000

function orderText(order, audience) {
  const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: order.currency || 'MXN' }).format(value)
  const shipping = order.shipping
  return [
    audience === 'owner' ? 'Nuevo pedido con pago aprobado.' : `Hola ${order.buyer.name}, gracias por tu compra. Tu pago fue aprobado.`,
    '',
    `Pedido: ${order.orderId}`,
    `Pago Mercado Pago: ${order.paymentId}`,
    `Fecha de aprobación: ${order.approvedAt}`,
    '',
    ...order.lines.map(line => `${line.quantity} × ${line.name} · ${line.option} — ${money(line.unit_price)} c/u — ${money(line.quantity * line.unit_price)}`),
    '',
    `Total pagado: ${money(order.total)} ${order.currency}`,
    '',
    `Cliente: ${order.buyer.name}`,
    `Correo: ${order.buyer.email}`,
    `WhatsApp: ${order.buyer.phone}`,
    '',
    ...(order.delivery === 'arrange' ? [
      'Entrega a domicilio. El envío no está incluido en el total pagado; costo y cobertura por confirmar.',
      ...(shipping ? [
        `Recibe: ${shipping.recipient}`,
        shipping.street,
        shipping.apartment ? `Interior / departamento: ${shipping.apartment}` : '',
        `Colonia: ${shipping.neighborhood}`,
        `${shipping.city}, ${shipping.state}, C.P. ${shipping.postal_code}, México`,
        shipping.notes ? `Referencias: ${shipping.notes}` : '',
      ] : ['Dirección pendiente de confirmar.']),
    ] : ['Recoger en Querétaro, con cita en nuestro punto de entrega.']),
    '',
    'Para coordinar la entrega o la cita, responde a este correo o escríbenos por WhatsApp: https://wa.me/524426098771',
    'Outlet Blancos Querétaro',
  ].join('\n')
}

async function sendOnce(store, transport, order, audience, recipient) {
  const key = `payment-${order.paymentId}-${audience}`
  const previous = await store.getWithMetadata(key, { type: 'json' })
  if (previous?.data.status === 'sent') return
  if (previous?.data.status === 'sending' && previous.data.leaseUntil > Date.now()) throw new Error('email_in_progress')

  const claim = await store.setJSON(key, { status: 'sending', leaseUntil: Date.now() + leaseMs }, previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true })
  if (!claim.modified) throw new Error('email_in_progress')

  try {
    const info = await transport.sendMail({
      from: { name: 'Outlet Blancos Querétaro', address: shopEmail },
      to: { address: recipient },
      replyTo: { address: shopEmail },
      subject: `${order.liveMode ? '' : '[PRUEBA] '}${audience === 'owner' ? 'Nuevo pedido' : 'Confirmación de pedido'} ${order.orderId}`,
      text: orderText(order, audience),
      messageId: `<order-${order.paymentId}-${audience}@outletblancosqro.com>`,
      disableFileAccess: true,
      disableUrlAccess: true,
    })
    if (!info.accepted?.length) throw new Error('email_not_accepted')
    const saved = await store.setJSON(key, { status: 'sent', sentAt: new Date().toISOString(), messageId: info.messageId }, { onlyIfMatch: claim.etag })
    if (!saved.modified) throw new Error('email_status_not_saved')
  } catch (error) {
    // Return a failure to Mercado Pago so it retries; a successful recipient stays sent.
    await store.setJSON(key, { status: 'failed', failedAt: new Date().toISOString() }, { onlyIfMatch: claim.etag })
    throw error
  }
}

export async function sendOrderEmails(order) {
  // Sandbox payments never email customers. Route both copies to an explicit test inbox.
  const testRecipient = process.env.ORDER_EMAIL_TEST_TO
  if (!order.liveMode && !testRecipient) return
  const password = process.env.ORDER_EMAIL_APP_PASSWORD
  if (!password) throw new Error('order_email_not_configured')
  const store = getStore({ name: order.liveMode ? 'order-emails' : 'order-emails-test', consistency: 'strong' })
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: shopEmail, pass: password.replace(/\s/g, '') },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  })
  const results = await Promise.allSettled([
    sendOnce(store, transport, order, 'owner', order.liveMode ? shopEmail : testRecipient),
    sendOnce(store, transport, order, 'customer', order.liveMode ? order.buyer.email : testRecipient),
  ])
  if (results.some(result => result.status === 'rejected')) throw new Error('order_email_failed')
}
