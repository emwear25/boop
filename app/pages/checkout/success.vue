<script setup lang="ts">
import { useCart } from '~/stores/cart'

/**
 * Order confirmation. Reached with ?token= (cash on delivery, also the link in the
 * confirmation email) or ?orderId=<Stripe session>&stripe=true (card payment).
 */
useHead({ title: 'Поръчката е приета' })

interface Order {
  orderNumber: string
  items: { _id: string; name: string; price: number; quantity: number; size?: string | null; color?: string | null; customization?: string | null }[]
  total: number
  shippingCost?: number
  paymentMethod: string
  paymentStatus: string
  deliveryProvider: 'econt' | 'speedy'
  deliveryMethod: string
  econtOfficeName?: string | null
  speedyOfficeName?: string | null
  shippingAddress: { firstName: string; email: string; street: string; city: string }
}

const route = useRoute()
const api = useApi()
const cart = useCart()
const token = typeof route.query.token === 'string' ? route.query.token : ''
const sessionId = typeof route.query.orderId === 'string' ? route.query.orderId : ''

const { data: order, error, refresh } = await useAsyncData(`order-${token || sessionId}`, async () => {
  if (token) return (await api<{ data: Order }>(`/api/orders/success/${encodeURIComponent(token)}`)).data
  if (sessionId) return (await api<{ data: { order: Order } }>(`/api/payments/checkout-session/${encodeURIComponent(sessionId)}`)).data.order
  return null
}, { server: false })

// Card payments leave the cart filled until the payment went through
watch(order, (o) => { if (o) cart.clear() }, { immediate: true })

// Card payments are confirmed by the Stripe webhook: check a few times until it lands
const awaitingPayment = computed(() => order.value?.paymentMethod === 'stripe_card' && order.value.paymentStatus !== 'paid')
let polls = 0
let timer: ReturnType<typeof setInterval> | undefined
watch(awaitingPayment, (waiting) => {
  if (!waiting || timer) return
  timer = setInterval(async () => {
    polls++
    await refresh()
    if (!awaitingPayment.value || polls >= 10) clearInterval(timer)
  }, 3000)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(timer))

const delivery = computed(() => {
  const o = order.value
  if (!o) return ''
  const courier = o.deliveryProvider === 'speedy' ? 'Спиди' : 'Еконт'
  if (o.deliveryMethod === 'courier_address') return `${courier}, до адрес: ${o.shippingAddress.street}, ${o.shippingAddress.city}`
  return `${courier}, ${o.econtOfficeName || o.speedyOfficeName || o.shippingAddress.street}`
})
</script>

<template>
  <div class="wrap page">
    <div v-if="order" class="ok">
      <h1 class="display">Благодарим, {{ order.shippingAddress.firstName }}!</h1>
      <p class="lead">
        Поръчка <b>{{ order.orderNumber }}</b> е приета. Изпратихме потвърждение на {{ order.shippingAddress.email }}.
        Започваме изработката до един работен ден и ще ти пишем, когато я изпратим.
      </p>
      <p v-if="awaitingPayment" class="muted" role="status">Чакаме потвърждение на плащането от банката…</p>

      <div class="card">
        <ul>
          <li v-for="i in order.items" :key="i._id">
            <div>
              <b>{{ i.name }}</b>
              <small class="muted">{{ [i.size !== 'Стандартен' && i.size, i.color, i.customization].filter(Boolean).join(', ') }} × {{ i.quantity }}</small>
            </div>
            <span>{{ euro(i.price * i.quantity) }}</span>
          </li>
        </ul>
        <div class="row"><span>Доставка</span><span>{{ delivery }}</span></div>
        <div class="row"><span>Плащане</span><span>{{ order.paymentMethod === 'stripe_card' ? (awaitingPayment ? 'С карта, обработва се' : 'С карта, платено') : 'При получаване' }}</span></div>
        <div class="row total"><span>Общо</span><span>{{ euro(order.total) }}</span></div>
      </div>
      <NuxtLink to="/" class="btn btn-solid">Към началото</NuxtLink>
    </div>

    <div v-else-if="error || (!token && !sessionId)" class="ok">
      <h1 class="display">Не намираме тази поръчка.</h1>
      <p class="lead">Ако току-що поръча, провери имейла си за потвърждение или ни пиши на <a href="mailto:info@boop.bg">info@boop.bg</a>.</p>
      <NuxtLink to="/" class="btn btn-solid">Към началото</NuxtLink>
    </div>

    <p v-else class="lead" role="status">Зареждаме поръчката…</p>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.ok { display: grid; gap: 24px; justify-items: start; max-width: 760px; }
.ok a:not(.btn) { text-decoration: underline; }
.card { width: 100%; background: var(--paper); border-radius: 24px; padding: 24px; }
.card ul { list-style: none; }
.card li { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--line); }
.card li small { display: block; }
.row { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0; }
.row span:last-child { text-align: right; }
.total { font-size: 19px; font-weight: 500; border-top: 1px solid var(--line); margin-top: 8px; padding-top: 14px; }
</style>
