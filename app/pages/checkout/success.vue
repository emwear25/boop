<script setup lang="ts">
import { useCart } from '~/stores/cart'
import type { CustomerOrder as Order } from '~/components/OrderSummary.vue'

/**
 * Order confirmation. Reached with ?token= (cash on delivery, also the link in the
 * confirmation email) or ?orderId=<Stripe session>&stripe=true (card payment).
 */
useHead({ title: 'Поръчката е приета', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

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

      <OrderSummary :order="order" />
      <p class="muted">Можеш да провериш поръчката и по-късно на <NuxtLink :to="{ path: '/track', query: { n: order.orderNumber } }">boop.bg/track</NuxtLink> с номера и имейла си.</p>
      <NuxtLink to="/" class="btn btn-solid">Към началото</NuxtLink>
    </div>

    <div v-else-if="error || (!token && !sessionId)" class="ok">
      <h1 class="display">Не намираме тази поръчка.</h1>
      <p class="lead">Провери поръчката с номера и имейла си на <NuxtLink to="/track">страницата за проследяване</NuxtLink> или ни пиши на <a href="mailto:info@boop.bg">info@boop.bg</a>.</p>
      <NuxtLink to="/" class="btn btn-solid">Към началото</NuxtLink>
    </div>

    <p v-else class="lead" role="status">Зареждаме поръчката…</p>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.ok { display: grid; gap: 24px; justify-items: start; max-width: 760px; }
.ok a:not(.btn) { text-decoration: underline; }
</style>
