// Netlify function: receives Mercado Pago payment webhooks, verifies the signature,
// confirms the payment with Mercado Pago and saves the approved order in Netlify Blobs.
import crypto from 'node:crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getStore } from '@netlify/blobs'
import { sendOrderEmails } from '../server/order-email.js'

// Manifest format from the official SDK: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
function verifySignature(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!secret || !xSignature) return false
  const parts = Object.fromEntries(String(xSignature).split(',').map(part => part.split('=').map(s => s.trim())))
  if (!parts.ts || !parts.v1) return false
  const manifest = []
  if (dataId) manifest.push(`id:${String(dataId).toLowerCase()}`)
  if (xRequestId) manifest.push(`request-id:${xRequestId}`)
  manifest.push(`ts:${parts.ts}`)
  const expected = crypto.createHmac('sha256', secret).update(manifest.join(';') + ';').digest('hex')
  const given = String(parts.v1)
  return /^[a-f\d]{64}$/i.test(given) && crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(given, 'hex'))
}

function orderRecord(payment) {
  const metadata = payment.metadata || {}
  return {
    orderId: payment.external_reference || metadata.order_id || '',
    paymentId: String(payment.id),
    status: payment.status,
    statusDetail: payment.status_detail,
    liveMode: payment.live_mode,
    currency: payment.currency_id,
    total: payment.transaction_amount,
    approvedAt: payment.date_approved,
    paymentMethod: payment.payment_method_id,
    delivery: metadata.delivery === 'arrange' ? 'arrange' : 'pickup',
    shipping: metadata.delivery === 'arrange' ? metadata.shipping || null : null,
    buyer: {
      name: metadata.buyer_name || '',
      email: metadata.buyer_email || payment.payer?.email || '',
      phone: metadata.buyer_phone || '',
    },
    lines: Array.isArray(metadata.lines) ? metadata.lines : [],
  }
}

export const config = { path: '/api/mp-webhook' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  let body
  try { body = await req.json() } catch { return Response.json({ error: 'bad_json' }, { status: 400 }) }
  const query = new URL(req.url).searchParams
  const dataId = query.get('data.id') || body?.data?.id
  const type = query.get('type') || body?.type
  if (!verifySignature(req, dataId)) return Response.json({ error: 'bad_signature' }, { status: 401 })
  if (type !== 'payment' || !dataId) return Response.json({ ignored: true })

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN, options: { timeout: 8000 } })
    const payment = await new Payment(client).get({ id: dataId })
    if (payment.status !== 'approved') return Response.json({ ignored: payment.status })

    // Separate test and real orders; the payment ID makes webhook retries idempotent.
    // Site-wide stores survive new deployments. Access stays within the Netlify dashboard.
    const orders = getStore(payment.live_mode ? 'orders' : 'orders-test')
    const order = orderRecord(payment)
    await orders.setJSON(`payment-${payment.id}`, order, { onlyIfNew: true })
    await sendOrderEmails(order)
    return Response.json({ ok: true })
  } catch (error) {
    console.error('mp-webhook failed', error)
    return Response.json({ error: 'webhook_failed' }, { status: 500 })
  }
}
