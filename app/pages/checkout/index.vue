<script setup lang="ts">
import { useCart } from '~/stores/cart'
import { productImages, type Product } from '~/data/catalog'
import { tagDesign } from '~/data/tagDesigns'
import type { Courier, CourierOffice } from '~/composables/useCourier'

useHead({ title: 'Поръчка' })
const cart = useCart()
const api = useApi()
const { estimate } = useCourier()
const serverProducts = useServerProducts()

type Delivery = 'office' | 'address'
type Payment = 'cod' | 'card'
const form = reactive({
  name: '', email: '', phone: '',
  courier: 'econt' as Courier, delivery: 'office' as Delivery, office: null as CourierOffice | null,
  city: '', postcode: '', address: '',
  payment: 'cod' as Payment,
  note: '', terms: false,
})

const errors = computed<Record<string, string>>(() => {
  const e: Record<string, string> = {}
  const t = (s: string) => s.trim()
  if (t(form.name).length < 3 || !/\s/.test(t(form.name))) e.name = 'Напиши име и фамилия.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t(form.email))) e.email = 'Напиши имейл, напр. ime@primer.bg. Там идва потвърждението.'
  if (!/^(\+359|0)\d{8,9}$/.test(form.phone.replace(/[\s\-()]/g, ''))) e.phone = 'Телефонът трябва да е български, напр. 0888 123 456.'
  if (form.delivery === 'office') {
    if (!form.office) e.office = 'Избери офис или автомат от списъка.'
  } else {
    if (t(form.city).length < 2) e.city = 'Напиши населено място.'
    if (!/^\d{4}$/.test(t(form.postcode))) e.postcode = 'Пощенският код е от 4 цифри.'
    if (t(form.address).length < 5) e.address = 'Напиши улица и номер, и при нужда блок, вход, етаж.'
  }
  if (!form.terms) e.terms = 'Потвърди, че си съгласен с условията.'
  return e
})

// Courier fee: estimated by Econt/Speedy, paid to the courier on delivery; free to an office over the threshold
const freeShipping = computed(() => form.delivery === 'office' && cart.subtotal >= FREE_SHIPPING_FROM)
const shipping = reactive({ eur: null as number | null, loading: false })
const estimateKey = computed(() => JSON.stringify([form.courier, form.delivery, form.office?.id, form.city, form.postcode, form.address, form.payment, cart.subtotal]))
let timer: ReturnType<typeof setTimeout> | undefined
watch(estimateKey, () => {
  clearTimeout(timer)
  shipping.eur = null
  if (!import.meta.client || freeShipping.value) return
  const ready = form.delivery === 'office' ? !!form.office : form.city.trim().length > 1 && form.address.trim().length > 4
  if (!ready) return
  timer = setTimeout(async () => {
    shipping.loading = true
    shipping.eur = await estimate({
      courier: form.courier,
      office: form.delivery === 'office' ? form.office : null,
      city: form.city.trim(), postCode: form.postcode.trim(), street: form.address.trim(),
      receiverName: form.name.trim(), receiverPhone: form.phone.trim(),
      codEur: form.payment === 'cod' ? cart.subtotal : 0,
      weightKg: Math.max(0.5, cart.items.reduce((n, i) => n + (i.product.category === 'medalyoni-s-ime' ? 0.05 : 0.6) * i.qty, 0)),
    })
    shipping.loading = false
  }, 500)
})
watch(() => form.courier, () => (form.office = null))

const submitted = ref(false)
const sending = ref(false)
const serverError = ref('')
const show = (k: string) => submitted.value && !!errors.value[k]
const errorList = computed(() => Object.entries(errors.value))
const summaryEl = ref<HTMLElement | null>(null)

const lineDetails = (i: { size?: number; design?: string; colour?: string; note?: string; product: Product }) =>
  [i.size && `${i.size} см`, i.design && tagDesign(i.design).name, i.colour ?? i.product.colour.name, i.note && `„${i.note}“`].filter(Boolean).join(', ')

async function orderItems() {
  const byName = await serverProducts.load()
  return cart.items.map((i) => {
    const server = byName.get(i.product.name)
    if (!server) throw new Error(`„${i.product.name}“ в момента не може да се поръча онлайн. Махни го от количката или ни пиши.`)
    const colours = (i.product.colours ?? [i.product.colour]).map((c) => c.name)
    const wanted = i.colour ?? i.product.colour.name
    const colour = colours.includes(wanted) ? wanted : colours[0]!
    const custom = [
      i.note && (i.product.personalise ? `Име: ${i.note}` : i.note),
      colour !== wanted && `Цвят: ${wanted}`,
      i.design && `Форма: ${tagDesign(i.design).name}`,
    ].filter(Boolean).join(' · ')
    return { product: server._id, quantity: i.qty, size: serverSize(i.size), color: colour, customization: custom || null }
  })
}

function deliveryMethod() {
  if (form.delivery === 'address') return 'courier_address'
  if (form.courier === 'econt') return form.office?.locker ? 'econt_automat' : 'econt_office'
  return form.office?.locker ? 'speedy_apt' : 'speedy_office'
}

async function payload() {
  const [firstName, ...rest] = form.name.trim().split(/\s+/)
  const contact = { firstName: firstName!, lastName: rest.join(' '), email: form.email.trim(), phone: form.phone.trim() }
  const office = form.delivery === 'office' ? form.office : null
  return {
    items: await orderItems(),
    isGuest: true,
    guestInfo: contact,
    shippingAddress: {
      ...contact,
      street: office ? `${form.courier === 'econt' ? 'Еконт' : 'Спиди'}: ${office.name}, ${office.address}`.slice(0, 200) : form.address.trim(),
      city: office ? office.city : form.city.trim(),
      postalCode: office ? office.postCode || '0000' : form.postcode.trim(),
      country: 'България',
    },
    deliveryProvider: form.courier,
    deliveryMethod: deliveryMethod(),
    econtOfficeCode: office && form.courier === 'econt' ? office.id : null,
    econtOfficeName: office && form.courier === 'econt' ? office.name : null,
    speedyOfficeId: office && form.courier === 'speedy' ? office.id : null,
    speedyOfficeName: office && form.courier === 'speedy' ? office.name : null,
    paymentMethod: form.payment === 'card' ? 'stripe_card' : 'cash_on_delivery',
    shippingCost: freeShipping.value ? 0 : (shipping.eur ?? undefined),
    notes: form.note.trim() || null,
  }
}

const apiMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && !('data' in err) ? err.message : '') || fallback

async function submit() {
  submitted.value = true
  serverError.value = ''
  await nextTick()
  if (errorList.value.length) { summaryEl.value?.focus(); return }
  sending.value = true
  try {
    const body = await payload()
    if (form.payment === 'card') {
      const res = await api<{ data: { sessionUrl: string } }>('/api/payments/create-checkout-session', { method: 'POST', body })
      // The cart is cleared on the success page, so a cancelled payment keeps it
      window.location.href = res.data.sessionUrl
      return
    }
    const res = await api<{ data: { successToken: string } }>('/api/orders', { method: 'POST', body })
    cart.clear()
    await navigateTo({ path: '/checkout/success', query: { token: res.data.successToken } })
  } catch (err) {
    serverError.value = apiMessage(err, 'Поръчката не се изпрати. Опитай пак или ни пиши на info@boop.bg.')
    await nextTick()
    summaryEl.value?.focus()
  } finally {
    sending.value = false
  }
}

const labels: Record<string, string> = { name: 'Име', email: 'Имейл', phone: 'Телефон', office: 'Офис', city: 'Град', postcode: 'Пощенски код', address: 'Адрес', terms: 'Условия' }
function focusField(k: string) { document.getElementById(`f-${k}`)?.focus() }
</script>

<template>
  <div class="wrap page">
    <h1 class="display">Поръчка</h1>

    <ClientOnly>
      <div v-if="!cart.items.length" class="done">
        <p class="lead">Количката е празна. Избери нещо и се върни тук.</p>
        <NuxtLink to="/products" class="btn btn-solid">Разгледай продуктите</NuxtLink>
      </div>

      <div v-else class="co">
        <form novalidate @submit.prevent="submit">
          <div v-if="(submitted && errorList.length) || serverError" ref="summaryEl" class="errsum" tabindex="-1" role="alert">
            <template v-if="errorList.length">
              <b>Провери {{ errorList.length === 1 ? 'едно поле' : `${errorList.length} полета` }}</b>
              <ul><li v-for="[k, msg] in errorList" :key="k"><a :href="`#f-${k}`" @click.prevent="focusField(k)">{{ labels[k] }}: {{ msg }}</a></li></ul>
            </template>
            <template v-else><b>Поръчката не е изпратена</b><p>{{ serverError }}</p></template>
          </div>

          <fieldset>
            <legend class="h3">Твоите данни</legend>
            <label>Име и фамилия<input id="f-name" v-model="form.name" autocomplete="name" :aria-invalid="show('name')"></label>
            <p v-if="show('name')" class="err">{{ errors.name }}</p>
            <div class="two">
              <div>
                <label>Телефон<input id="f-phone" v-model="form.phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="0888 123 456" :aria-invalid="show('phone')"></label>
                <p v-if="show('phone')" class="err">{{ errors.phone }}</p>
              </div>
              <div>
                <label>Имейл<input id="f-email" v-model="form.email" type="email" autocomplete="email" inputmode="email" :aria-invalid="show('email')"></label>
                <p v-if="show('email')" class="err">{{ errors.email }}</p>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="h3">Доставка</legend>
            <div class="seg" role="radiogroup" aria-label="Куриер">
              <button type="button" role="radio" :aria-checked="form.courier === 'econt'" :class="{ on: form.courier === 'econt' }" @click="form.courier = 'econt'">Еконт</button>
              <button type="button" role="radio" :aria-checked="form.courier === 'speedy'" :class="{ on: form.courier === 'speedy' }" @click="form.courier = 'speedy'">Спиди</button>
            </div>
            <div class="seg" role="radiogroup" aria-label="Къде да доставим">
              <button type="button" role="radio" :aria-checked="form.delivery === 'office'" :class="{ on: form.delivery === 'office' }" @click="form.delivery = 'office'">До офис или автомат</button>
              <button type="button" role="radio" :aria-checked="form.delivery === 'address'" :class="{ on: form.delivery === 'address' }" @click="form.delivery = 'address'">До адрес</button>
            </div>
            <template v-if="form.delivery === 'office'">
              <OfficePicker v-model="form.office" :courier="form.courier" :invalid="show('office')" />
              <p v-if="show('office')" class="err">{{ errors.office }}</p>
            </template>
            <template v-else>
              <div class="two">
                <div>
                  <label>Град или село<input id="f-city" v-model="form.city" autocomplete="address-level2" :aria-invalid="show('city')"></label>
                  <p v-if="show('city')" class="err">{{ errors.city }}</p>
                </div>
                <div>
                  <label>Пощенски код<input id="f-postcode" v-model="form.postcode" autocomplete="postal-code" inputmode="numeric" maxlength="4" :aria-invalid="show('postcode')"></label>
                  <p v-if="show('postcode')" class="err">{{ errors.postcode }}</p>
                </div>
              </div>
              <label>Адрес<input id="f-address" v-model="form.address" autocomplete="street-address" placeholder="ул. Цар Симеон 12, бл. 3, вх. А, ет. 2" :aria-invalid="show('address')"></label>
              <p v-if="show('address')" class="err">{{ errors.address }}</p>
            </template>
          </fieldset>

          <fieldset>
            <legend class="h3">Плащане</legend>
            <div class="seg" role="radiogroup" aria-label="Плащане">
              <button type="button" role="radio" :aria-checked="form.payment === 'cod'" :class="{ on: form.payment === 'cod' }" @click="form.payment = 'cod'">При получаване</button>
              <button type="button" role="radio" :aria-checked="form.payment === 'card'" :class="{ on: form.payment === 'card' }" @click="form.payment = 'card'">С карта</button>
            </div>
            <p class="muted small">{{ form.payment === 'card' ? 'Плащаш сигурно през Stripe с Visa, Mastercard, Apple Pay или Google Pay.' : 'Плащаш на куриера, когато вземеш пратката.' }}</p>
            <label>Бележка към поръчката <span class="muted">(по желание)</span><textarea v-model="form.note" rows="3" maxlength="500" /></label>
          </fieldset>

          <label class="check">
            <input id="f-terms" v-model="form.terms" type="checkbox" :aria-invalid="show('terms')">
            <span>Съгласен съм с <NuxtLink to="/terms" target="_blank">общите условия</NuxtLink> и <NuxtLink to="/privacy" target="_blank">политиката за поверителност</NuxtLink>. Персонализираните продукти се правят специално за теб и не подлежат на връщане.</span>
          </label>
          <p v-if="show('terms')" class="err">{{ errors.terms }}</p>

          <button class="btn btn-solid submit" type="submit" :disabled="sending">
            {{ sending ? 'Изпращаме…' : form.payment === 'card' ? `Плати ${euro(cart.subtotal)}` : `Поръчай за ${euro(cart.subtotal)}` }}
          </button>
        </form>

        <aside class="summary">
          <ul>
            <li v-for="i in cart.items" :key="i.id">
              <img :src="productImages(i.product)[0]!.sm" alt="" width="64" height="85">
              <div><b>{{ i.product.name }}</b><small class="muted">{{ lineDetails(i) }} × {{ i.qty }}</small></div>
              <span>{{ euro(i.total) }}</span>
            </li>
          </ul>
          <div class="row"><span>Продукти</span><span>{{ euro(cart.subtotal) }}</span></div>
          <div class="row">
            <span>Доставка</span>
            <span v-if="freeShipping">Безплатна</span>
            <span v-else-if="shipping.loading" class="muted">изчисляваме…</span>
            <span v-else-if="shipping.eur !== null">≈ {{ euro(shipping.eur) }}</span>
            <span v-else class="muted">според куриера</span>
          </div>
          <div class="row total"><span>Общо</span><span>{{ euro(cart.subtotal) }}</span></div>
          <p class="muted note">
            <template v-if="freeShipping">Доставката до офис е безплатна при поръчка над {{ euro(FREE_SHIPPING_FROM) }}.</template>
            <template v-else>Доставката се плаща на куриера при получаване. До офис е безплатна при поръчка над {{ euro(FREE_SHIPPING_FROM) }}.</template>
          </p>
        </aside>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.page { padding-top: clamp(24px, 4vw, 56px); }
.done { margin-top: 32px; display: grid; gap: 24px; justify-items: start; max-width: 640px; }
.co { display: grid; grid-template-columns: 7fr 5fr; gap: clamp(32px, 5vw, 72px); margin-top: 40px; align-items: start; }
.co > * { min-width: 0; }
fieldset { border: 0; display: grid; gap: 14px; margin-bottom: 36px; }
legend { margin-bottom: 8px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.two > * { display: grid; gap: 6px; min-width: 0; }
label { display: grid; gap: 6px; font-size: 14px; font-weight: 500; }
input:not([type="checkbox"]), textarea { height: 52px; border: 1px solid var(--line); border-radius: 14px; background: var(--paper); padding: 0 16px; font: inherit; font-weight: 400; font-size: 16px; width: 100%; }
textarea { height: auto; padding: 14px 16px; resize: vertical; }
input:focus, textarea:focus { outline: 2px solid var(--moss); outline-offset: 1px; }
input[aria-invalid="true"] { border-color: var(--cherry); }
.err { color: var(--cherry); font-size: 14px; margin-top: -6px; }
.small { font-size: 14px; }
.seg { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.seg button { min-height: 50px; padding: 8px 10px; border-radius: 14px; border: 1px solid var(--line); background: var(--paper); }
.seg button.on { border: 1.5px solid var(--moss); background: var(--mist-2); font-weight: 500; }
.check { grid-template-columns: 22px 1fr; align-items: start; gap: 12px; font-weight: 400; font-size: 15px; margin-bottom: 8px; }
.check input { width: 20px; height: 20px; margin-top: 2px; accent-color: var(--moss); }
.check a { text-decoration: underline; text-underline-offset: 3px; }
.errsum { border: 1.5px solid var(--cherry); border-radius: 16px; padding: 16px 18px; margin-bottom: 28px; background: #fbf1ef; }
.errsum ul { margin: 8px 0 0 18px; }
.errsum a { text-decoration: underline; }
.submit { width: 100%; height: 58px; font-size: 17px; margin-top: 18px; }
.submit:disabled { opacity: .6; cursor: progress; }
.summary { background: var(--paper); border-radius: 24px; padding: 24px; position: sticky; top: 16px; }
.summary ul { list-style: none; }
.summary li { display: grid; grid-template-columns: 64px 1fr auto; gap: 14px; align-items: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--line); }
.summary img { border-radius: 10px; aspect-ratio: 3/4; object-fit: cover; }
.summary li small { display: block; }
.row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; }
.total { font-size: 19px; font-weight: 500; border-top: 1px solid var(--line); margin-top: 8px; padding-top: 14px; }
.note { font-size: 13px; margin-top: 10px; }
@media (max-width: 860px) { .co { grid-template-columns: 1fr; } .summary { position: static; order: -1; } }
@media (max-width: 520px) { .two { grid-template-columns: 1fr; } }
</style>
