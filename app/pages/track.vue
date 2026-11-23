<script setup lang="ts">
import type { CustomerOrder } from '~/components/OrderSummary.vue'

/** Guest order tracking: order number + the email used at checkout. Prefilled from ?n=&e= */
useSeoMeta({ title: 'Проследи поръчка', description: 'Провери статуса на поръчката си в boop с номера на поръчката и имейла си.' })

const route = useRoute()
const api = useApi()
const number = ref(String(route.query.n ?? '').toUpperCase())
const email = ref(String(route.query.e ?? ''))
const order = ref<CustomerOrder | null>(null)
const error = ref('')
const loading = ref(false)

async function find() {
  error.value = ''
  const n = number.value.trim().replace(/\s+/g, '').toUpperCase()
  const e = email.value.trim()
  if (!n || !e) { error.value = 'Попълни номера на поръчката и имейла.'; return }
  loading.value = true
  try {
    const res = await api<{ data: CustomerOrder }>('/api/orders/track', { query: { orderNumber: n, email: e } })
    order.value = res.data
  } catch (err) {
    order.value = null
    const status = (err as { statusCode?: number }).statusCode
    error.value = status === 404
      ? 'Не намираме поръчка с този номер и имейл. Провери ги в имейла за потвърждение.'
      : 'Нещо не се получи. Опитай пак след малко или ни пиши на info@boop.bg.'
  } finally { loading.value = false }
}

onMounted(() => { if (number.value && email.value) find() })
</script>

<template>
  <div class="wrap page">
    <header class="top">
      <h1 class="display">Проследи поръчка</h1>
      <p class="lead">Номерът е в имейла за потвърждение и започва с BOP.</p>
    </header>

    <form class="form" novalidate @submit.prevent="find">
      <label>Номер на поръчката
        <input v-model="number" name="order" autocomplete="off" placeholder="напр. BOP26110001" required>
      </label>
      <label>Имейл
        <input v-model="email" type="email" name="email" autocomplete="email" placeholder="имейлът от поръчката" required>
      </label>
      <button class="btn btn-solid" :disabled="loading">{{ loading ? 'Търсим…' : 'Провери поръчката' }}</button>
    </form>
    <p v-if="error" class="err" role="alert">{{ error }}</p>

    <OrderSummary v-if="order" :order="order" class="result" />
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); max-width: 760px; }
.top .lead { margin-top: 16px; }
.form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; margin-top: 32px; }
label { display: grid; gap: 6px; font-size: 14px; font-weight: 500; }
input { height: 52px; border: 1px solid var(--line); border-radius: 14px; background: var(--paper); padding: 0 16px; font-size: 16px; font-weight: 400; }
input:focus { outline: 2px solid var(--moss); outline-offset: 1px; }
.form .btn { height: 52px; }
.err { margin-top: 14px; color: var(--cherry); }
.result { margin-top: 32px; }
@media (max-width: 700px) { .form { grid-template-columns: 1fr; } }
</style>
