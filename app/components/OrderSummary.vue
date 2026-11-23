<script setup lang="ts">
/** One order as the customer sees it: status timeline, tracking, items and totals. */
export interface CustomerOrder {
  orderNumber: string
  createdAt?: string
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: { _id: string; name: string; price: number; quantity: number; size?: string | null; color?: string | null; customization?: string | null }[]
  total: number
  paymentMethod: string
  paymentStatus: string
  deliveryProvider: 'econt' | 'speedy'
  deliveryMethod: string
  econtOfficeName?: string | null
  speedyOfficeName?: string | null
  econtShipmentNumber?: string | null
  speedyShipmentNumber?: string | null
  shippingAddress: { firstName: string; email: string; street: string; city: string }
}

const props = defineProps<{ order: CustomerOrder }>()
const o = computed(() => props.order)

const STEPS = [
  { key: 'received', label: 'Приета' },
  { key: 'making', label: 'Изработва се' },
  { key: 'shipped', label: 'Изпратена' },
  { key: 'delivered', label: 'Доставена' },
]
const stepIndex = computed(() => ({ pending: 0, confirmed: 0, processing: 1, shipped: 2, delivered: 3 } as Record<string, number>)[o.value.orderStatus ?? 'pending'] ?? 0)
const cancelled = computed(() => o.value.orderStatus === 'cancelled')

const courier = computed(() => (o.value.deliveryProvider === 'speedy' ? 'Спиди' : 'Еконт'))
const delivery = computed(() => o.value.deliveryMethod === 'courier_address'
  ? `${courier.value}, до адрес: ${o.value.shippingAddress.street}, ${o.value.shippingAddress.city}`
  : `${courier.value}, ${o.value.econtOfficeName || o.value.speedyOfficeName || o.value.shippingAddress.street}`)

const shipment = computed(() => o.value.econtShipmentNumber || o.value.speedyShipmentNumber || null)
const trackingUrl = computed(() => shipment.value && (o.value.deliveryProvider === 'speedy'
  ? `https://www.speedy.bg/bg/track-shipment?shipmentNumber=${encodeURIComponent(shipment.value)}`
  : `https://www.econt.com/track?shipmentNumber=${encodeURIComponent(shipment.value)}`))

const awaitingPayment = computed(() => o.value.paymentMethod === 'stripe_card' && o.value.paymentStatus !== 'paid')
const payment = computed(() => o.value.paymentMethod === 'stripe_card' ? (awaitingPayment.value ? 'С карта, обработва се' : 'С карта, платено') : 'При получаване')
const date = computed(() => o.value.createdAt ? new Date(o.value.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' }) : '')
</script>

<template>
  <div class="card">
    <div class="head">
      <div><b>Поръчка {{ o.orderNumber }}</b><small v-if="date" class="muted">от {{ date }}</small></div>
    </div>

    <p v-if="cancelled" class="cancelled" role="status">Поръчката е отказана. Ако е грешка, пиши ни на <a href="mailto:info@boop.bg">info@boop.bg</a>.</p>
    <ol v-else class="steps" aria-label="Статус на поръчката">
      <li v-for="(s, i) in STEPS" :key="s.key" :class="{ done: i <= stepIndex, now: i === stepIndex }" :aria-current="i === stepIndex ? 'step' : undefined">
        <span class="dot" aria-hidden="true" />{{ s.label }}
      </li>
    </ol>

    <p v-if="shipment" class="track">
      Номер на пратката при {{ courier }}: <b>{{ shipment }}</b>
      <a :href="trackingUrl!" target="_blank" rel="noopener">Проследи пратката</a>
    </p>

    <ul class="items">
      <li v-for="i in o.items" :key="i._id">
        <div>
          <b>{{ i.name }}</b>
          <small class="muted">{{ [i.size !== 'Стандартен' && i.size, i.color, i.customization].filter(Boolean).join(', ') }} × {{ i.quantity }}</small>
        </div>
        <span>{{ euro(i.price * i.quantity) }}</span>
      </li>
    </ul>
    <div class="row"><span>Доставка</span><span>{{ delivery }}</span></div>
    <div class="row"><span>Плащане</span><span>{{ payment }}</span></div>
    <div class="row total"><span>Общо</span><span>{{ euro(o.total) }}</span></div>
  </div>
</template>

<style scoped>
.card { width: 100%; background: var(--paper); border-radius: 24px; padding: 24px; display: grid; gap: 18px; }
.head b { display: block; font-size: 18px; font-weight: 500; }
.head small { font-size: 14px; }
.steps { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; counter-reset: s; }
.steps li { position: relative; display: grid; justify-items: center; gap: 8px; text-align: center; font-size: 13px; color: var(--moss-3); }
.steps li::before { content: ''; position: absolute; top: 7px; left: -50%; width: 100%; height: 2px; background: var(--line); z-index: 0; }
.steps li:first-child::before { display: none; }
.steps li.done::before { background: var(--moss); }
.dot { position: relative; z-index: 1; width: 16px; height: 16px; border-radius: 50%; background: var(--paper); border: 2px solid var(--line); }
.steps li.done .dot { background: var(--moss); border-color: var(--moss); }
.steps li.now { color: var(--moss); font-weight: 500; }
.steps li.now .dot { box-shadow: 0 0 0 4px var(--mist-2); }
.cancelled { color: var(--cherry); }
.track { padding: 14px 16px; border-radius: 14px; background: var(--mist-2); display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: baseline; }
.track a, .cancelled a { text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
.items { list-style: none; }
.items li { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--line); }
.items li small { display: block; }
.row { display: flex; justify-content: space-between; gap: 16px; }
.row span:last-child { text-align: right; }
.total { font-size: 19px; font-weight: 500; border-top: 1px solid var(--line); padding-top: 14px; }
</style>
