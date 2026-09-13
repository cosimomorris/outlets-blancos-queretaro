// Netlify function: creates a Mercado Pago Checkout Pro preference for the current cart.
// The client sends product/variant ids and quantities only; every price is re-derived from src/catalog.js.
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { products, findVariant } from '../src/catalog.js'

const MAX_LINES = 20
const MAX_QUANTITY = 99
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function siteOrigin(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '')
  return new URL(req.url).origin
}

function parseBuyer(input) {
  const buyer = input && typeof input === 'object' ? input : {}
  const name = String(buyer.name || '').trim().slice(0, 80)
  const email = String(buyer.email || '').trim().slice(0, 120)
  const phone = String(buyer.phone || '').replace(/\D/g, '').slice(0, 15)
  if (name.length < 2 || !EMAIL_RE.test(email) || phone.length < 10) return null
  return { name, email, phone }
}

function parseCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > MAX_LINES) return null
  const lines = []
  for (const line of cart) {
    const product = products.find(p => p.id === line?.id)
    const option = findVariant(product, line?.variant)
    const quantity = Number(line?.quantity)
    if (!product || !option || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null
    lines.push({ product, option, quantity })
  }
  return lines
}

function newOrderId() {
  const time = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `OBQ-${time}-${random}`
}

export const config = { path: '/api/create-preference' }

export default async function handler(req) {
  if (req.method !== 'POST') return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } })
  if (!process.env.MP_ACCESS_TOKEN) return Response.json({ error: 'not_configured' }, { status: 500 })

  let body
  try { body = await req.json() } catch { return Response.json({ error: 'bad_json' }, { status: 400 }) }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return Response.json({ error: 'bad_json' }, { status: 400 })

  const buyer = parseBuyer(body.buyer)
  if (!buyer) return Response.json({ error: 'bad_buyer' }, { status: 400 })
  const lines = parseCart(body.cart)
  if (!lines) return Response.json({ error: 'bad_cart' }, { status: 400 })
  const delivery = body.delivery === 'arrange' ? 'arrange' : 'pickup'

  const orderId = newOrderId()
  const origin = siteOrigin(req)
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN, options: { timeout: 8000 } })

  try {
    const preference = await new Preference(client).create({
      body: {
        items: lines.map(({ product, option, quantity }) => ({
          id: `${product.id}:${option.id}`,
          title: `${product.name} · ${option.name}`,
          description: product.detail,
          picture_url: `${origin}${product.images[0]}`,
          category_id: 'home',
          quantity,
          currency_id: 'MXN',
          unit_price: option.price,
        })),
        payer: { name: buyer.name, email: buyer.email, phone: { area_code: '52', number: buyer.phone } },
        back_urls: {
          success: `${origin}/?mp=success`,
          pending: `${origin}/?mp=pending`,
          failure: `${origin}/?mp=failure`,
        },
        auto_return: 'approved',
        notification_url: `${origin}/api/mp-webhook`,
        external_reference: orderId,
        statement_descriptor: 'OUTLET BLANCOS',
        metadata: {
          order_id: orderId,
          delivery,
          buyer_name: buyer.name,
          buyer_email: buyer.email,
          buyer_phone: buyer.phone,
          lines: lines.map(({ product, option, quantity }) => ({
            id: product.id, variant: option.id, name: product.name, option: option.name, quantity, unit_price: option.price,
          })),
        },
        expires: true,
        expiration_date_to: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
    })
    return Response.json({ id: preference.id, init_point: preference.init_point, orderId })
  } catch (error) {
    console.error('create-preference failed', error)
    return Response.json({ error: 'mp_error' }, { status: 502 })
  }
}
