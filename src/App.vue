<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import QuienesSomos from './components/QuienesSomos.vue'
import CatalogoSection from './components/CatalogoSection.vue'
import ContactoSection from './components/ContactoSection.vue'
import FooterSection from './components/FooterSection.vue'
import ShopDialog from './components/ShopDialog.vue'
import ShopIcon from './components/ShopIcon.vue'
import { products, money, findVariant } from './catalog'

const storageKey = 'outlet-blancos-cart-v1'
const pendingKey = 'outlet-blancos-pending-order'
function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
    if (!Array.isArray(saved)) return []
    const result = []
    for (const line of saved) {
      const product = products.find(p => p.id === line?.id)
      if (!product || typeof line.variant !== 'string' || !findVariant(product, line.variant) || !Number.isInteger(line.quantity) || line.quantity < 1) continue
      const duplicate = result.find(item => item.id === line.id && item.variant === line.variant)
      if (duplicate) duplicate.quantity = Math.min(99, duplicate.quantity + line.quantity)
      else result.push({ id: line.id, variant: line.variant, quantity: Math.min(99, line.quantity) })
    }
    return result
  } catch { return [] }
}
const cart = ref(readCart())
watch(cart, value => { try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* Shopping still works when storage is unavailable. */ } }, { deep: true })
const lines = computed(() => cart.value.map(item => {
  const product = products.find(p => p.id === item.id)
  return { ...item, product, option: findVariant(product, item.variant), key: `${item.id}-${item.variant}` }
}))
const count = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const total = computed(() => lines.value.reduce((sum, item) => sum + item.quantity * item.option.price, 0))
const cartOpen = ref(false)
const stage = ref('cart')
const delivery = ref('pickup')
const buyer = ref({ name: '', email: '', phone: '' })
const paying = ref(false)
const payError = ref('')
const result = ref(null)
const confirmation = ref({ count: 0, total: 0, orderId: '', paymentId: '' })
const status = ref('')
const title = computed(() => stage.value === 'checkout' ? 'Revisa tu pedido' : stage.value === 'complete' ? '¡Pedido confirmado!' : 'Mi carrito')
const formValid = computed(() => buyer.value.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.value.email.trim()) && buyer.value.phone.replace(/\D/g, '').length >= 10)
const gaItems = items => items.map(l => ({ item_id: `${l.id}:${l.variant}`, item_name: l.product?.name ?? l.name, item_variant: l.option?.name ?? l.option, price: l.option?.price ?? l.unit_price, quantity: l.quantity }))
function track(event, params) { try { window.gtag?.('event', event, params) } catch { /* Analytics must never break checkout. */ } }
function openCart() { stage.value = 'cart'; result.value = null; cartOpen.value = true }
function add(item) {
  const existing = cart.value.find(line => line.id === item.id && line.variant === item.variant)
  if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity)
  else cart.value.push(item)
  status.value = 'Producto agregado al carrito'
  openCart()
}
function changeQuantity(item, delta) {
  const line = cart.value.find(line => line.id === item.id && line.variant === item.variant)
  if (line) line.quantity = Math.max(1, Math.min(99, line.quantity + delta))
}
function remove(item) {
  cart.value = cart.value.filter(line => !(line.id === item.id && line.variant === item.variant))
  status.value = 'Producto eliminado del carrito'
}
async function pay() {
  if (!count.value || paying.value || !formValid.value) return
  paying.value = true
  payError.value = ''
  try {
    const response = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cart.value, buyer: buyer.value, delivery: delivery.value }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.init_point) throw new Error(data.error || 'request_failed')
    const snapshot = { orderId: data.orderId, count: count.value, total: total.value, lines: lines.value.map(l => ({ id: l.id, variant: l.variant, name: l.product.name, option: l.option.name, unit_price: l.option.price, quantity: l.quantity })) }
    try { localStorage.setItem(pendingKey, JSON.stringify(snapshot)) } catch { /* Confirmation falls back to the live cart. */ }
    track('begin_checkout', { currency: 'MXN', value: total.value, items: gaItems(lines.value) })
    window.location.assign(data.init_point)
  } catch (error) {
    payError.value = error.message === 'bad_buyer'
      ? 'Revisa tu nombre, correo y WhatsApp.'
      : 'No pudimos iniciar el pago. Intenta de nuevo o escríbenos por WhatsApp.'
    paying.value = false
  }
}
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const mp = params.get('mp')
  if (!mp) return
  const paymentId = params.get('payment_id') || params.get('collection_id') || ''
  const orderId = params.get('external_reference') || ''
  let pending = null
  try { pending = JSON.parse(localStorage.getItem(pendingKey) || 'null') } catch { pending = null }
  if (mp === 'success') {
    confirmation.value = { count: pending?.count ?? count.value, total: pending?.total ?? total.value, orderId: orderId || pending?.orderId || '', paymentId }
    track('purchase', { transaction_id: paymentId || orderId || pending?.orderId, currency: 'MXN', value: confirmation.value.total, items: gaItems(pending?.lines ?? lines.value) })
    cart.value = []
    try { localStorage.removeItem(pendingKey) } catch { /* Nothing to clean. */ }
    stage.value = 'complete'
  } else {
    result.value = { kind: mp === 'pending' ? 'pending' : 'failure', paymentId, orderId }
    stage.value = count.value ? 'checkout' : 'cart'
  }
  cartOpen.value = true
  window.history.replaceState(null, '', window.location.pathname)
})
</script>

<template>
  <a class="skip-link" href="#catalogo">Ir al catálogo</a>
  <NavBar :count="count" @cart="openCart" />
  <main><HeroSection /><CatalogoSection @add="add" /><QuienesSomos /><ContactoSection /></main>
  <FooterSection />
  <p class="sr-only" role="status">{{ status }}</p>
  <ShopDialog :open="cartOpen" :title="title" drawer @close="cartOpen = false">
    <template v-if="stage === 'complete'">
      <div class="cart-empty success-state"><div class="success-icon"><ShopIcon name="check" /></div><p class="eyebrow">PAGO RECIBIDO</p><h3>¡Gracias por tu compra!</h3><p>Recibimos tu pago de {{ money(confirmation.total) }} MXN por {{ confirmation.count }} {{ confirmation.count === 1 ? 'artículo' : 'artículos' }}.</p><p v-if="confirmation.orderId || confirmation.paymentId" class="confirmation-total">Pedido {{ confirmation.orderId }}<template v-if="confirmation.paymentId"> · Pago {{ confirmation.paymentId }}</template></p><p>Te contactaremos por WhatsApp para coordinar la entrega.</p><button class="btn btn-primary" @click="cartOpen = false">Seguir explorando <ShopIcon name="arrow" /></button></div>
    </template>
    <template v-else-if="!count">
      <div class="cart-empty"><ShopIcon name="bag" /><p v-if="result" class="pay-notice" :class="result.kind" role="alert">{{ result.kind === 'pending' ? 'Tu pago está en proceso. Te avisaremos cuando se acredite.' : 'El pago no se completó. Puedes intentar de nuevo cuando quieras.' }}</p><p class="eyebrow">TU PRÓXIMO DESCANSO EMPIEZA AQUÍ</p><h3>Tu carrito está vacío</h3><p>Explora nuestros blancos y encuentra lo que necesitas para tu alojamiento.</p><a href="#catalogo" class="btn btn-primary" @click="cartOpen = false">Explorar Catálogo <ShopIcon name="arrow" /></a></div>
    </template>
    <template v-else>
      <div class="cart-body">
        <div class="checkout-steps"><span :class="{ current: stage === 'cart' }">01 Carrito</span><span class="step-line"></span><span :class="{ current: stage === 'checkout' }">02 Revisión y pago</span></div>
        <button v-if="stage === 'checkout'" class="text-link back-link" @click="stage = 'cart'">← Volver al carrito</button>
        <p v-if="result" class="pay-notice" :class="result.kind" role="alert">{{ result.kind === 'pending' ? 'Tu pago está en proceso (por ejemplo, OXXO o SPEI). Te avisaremos cuando se acredite; tu carrito sigue aquí por si necesitas volver a intentarlo.' : 'El pago no se completó. Puedes intentar de nuevo o pagar con otro medio.' }}</p>
        <p class="cart-intro">{{ count }} {{ count === 1 ? 'artículo en tu selección' : 'artículos en tu selección' }}</p>
        <div class="cart-lines"><article v-for="item in lines" :key="item.key" class="cart-line"><img :src="item.product.images[0]" :alt="item.product.name" /><div class="cart-line-info"><h3>{{ item.product.name }}</h3><p>{{ item.option.name }} · {{ money(item.option.price) }} c/u</p><div v-if="stage === 'cart'" class="line-controls"><div class="quantity-picker"><button :aria-label="'Reducir cantidad de ' + item.product.name + ' ' + item.option.name" :disabled="item.quantity <= 1" @click="changeQuantity(item, -1)">−</button><span>{{ item.quantity }}</span><button :aria-label="'Aumentar cantidad de ' + item.product.name + ' ' + item.option.name" :disabled="item.quantity >= 99" @click="changeQuantity(item, 1)">+</button></div><button class="remove-button" :aria-label="'Eliminar ' + item.product.name + ' ' + item.option.name" @click="remove(item)">Eliminar</button></div><p v-else>Cantidad: {{ item.quantity }}</p></div><strong>{{ money(item.option.price * item.quantity) }}</strong></article></div>
        <template v-if="stage === 'checkout'">
          <fieldset class="buyer-fields"><legend>Tus datos</legend><label><span>Nombre</span><input v-model.trim="buyer.name" type="text" name="name" autocomplete="name" required maxlength="80" placeholder="Nombre y apellido"></label><label><span>Correo electrónico</span><input v-model.trim="buyer.email" type="email" name="email" autocomplete="email" required maxlength="120" placeholder="tu@correo.com"></label><label><span>WhatsApp</span><input v-model.trim="buyer.phone" type="tel" name="phone" inputmode="tel" autocomplete="tel" required maxlength="20" placeholder="442 000 0000"></label></fieldset>
          <fieldset class="delivery-options"><legend>Entrega</legend><label :class="{ selected: delivery === 'pickup' }"><input v-model="delivery" type="radio" value="pickup" name="delivery"><span><strong>Recoger en Querétaro</strong><small>Con cita en nuestro punto de entrega.</small></span><ShopIcon name="pin" /></label><label :class="{ selected: delivery === 'arrange' }"><input v-model="delivery" type="radio" value="arrange" name="delivery"><span><strong>Coordinar entrega</strong><small>Costo y disponibilidad por confirmar.</small></span></label></fieldset>
          <div class="payment-preview"><div><span class="payment-brand">mercado pago</span><span class="secure-badge">Pago seguro</span></div><p>Al continuar te llevaremos a Mercado Pago para pagar con tarjeta, SPEI, OXXO o tu saldo. Regresarás aquí al terminar.</p></div>
        </template>
      </div>
      <div class="cart-summary"><div><span>Subtotal</span><strong>{{ money(total) }} MXN</strong></div><div class="delivery-summary"><span>Entrega</span><span>Por confirmar</span></div><p v-if="payError" class="form-error" role="alert">{{ payError }}</p><button v-if="stage === 'cart'" class="btn btn-primary full-width" @click="stage = 'checkout'">Continuar con mi pedido <ShopIcon name="arrow" /></button><button v-else class="btn btn-primary full-width" :disabled="paying || !formValid" @click="pay">{{ paying ? 'Redirigiendo a Mercado Pago…' : 'Pagar con Mercado Pago' }} <ShopIcon name="arrow" /></button><p v-if="stage === 'checkout' && !formValid" class="demo-explanation">Completa tu nombre, correo y WhatsApp para continuar al pago.</p><button v-if="stage === 'cart'" class="continue-shopping" @click="cartOpen = false">Seguir comprando</button></div>
    </template>
  </ShopDialog>
</template>
